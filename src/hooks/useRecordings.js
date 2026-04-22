import { useState, useEffect, useCallback } from "react";
import {
  supabase,
  uploadRecording,
  createRecording,
  getUserRecordings,
  subscribeToRecording,
} from "../lib/supabase";

export function useRecordings() {
  const [user, setUser] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // ── Auth ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Load recordings ─────────────────────────────────────────────────────────
  const loadRecordings = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserRecordings(user.id);
      setRecordings(data);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadRecordings(); }, [loadRecordings]);

  // ── Upload + trigger processing ─────────────────────────────────────────────
  const handleUpload = useCallback(async (file) => {
    if (!user) throw new Error("Debes iniciar sesión para subir archivos");
    setUploading(true);
    try {
      // 1. Subir a Storage
      const storagePath = await uploadRecording(file, user.id);

      // 2. Crear registro en BD
      const rec = await createRecording({
        userId: user.id,
        filename: file.name,
        storagePath,
      });

      // 3. Agregar a estado local como pending
      setRecordings((prev) => [{ ...rec, analysis: null }, ...prev]);

      // 4. Llamar Edge Function para procesar
      const { error } = await supabase.functions.invoke("process-audio", {
        body: { recording_id: rec.id },
      });
      if (error) throw error;

      // 5. Suscribirse a cambios en tiempo real
      const channel = subscribeToRecording(rec.id, (updated) => {
        setRecordings((prev) =>
          prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
        );
        // Recargar con análisis cuando esté listo
        if (updated.status === "done") {
          loadRecordings();
          supabase.removeChannel(channel);
        }
      });

      return rec;
    } finally {
      setUploading(false);
    }
  }, [user, loadRecordings]);

  // ── Auth helpers ────────────────────────────────────────────────────────────
  const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password });

  const signUp = (email, password) =>
    supabase.auth.signUp({ email, password });

  const signOut = () => supabase.auth.signOut();

  return { user, recordings, loading, uploading, handleUpload, signIn, signUp, signOut, reload: loadRecordings };
}
