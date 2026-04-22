import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Faltan variables de entorno. Copia .env.example → .env.local y completa los valores."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Storage helpers ──────────────────────────────────────────────────────────

/** Sube un archivo .ogg al bucket "recordings" */
export async function uploadRecording(file, userId) {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from("recordings")
    .upload(path, file, { contentType: `audio/${ext}`, upsert: false });

  if (error) throw error;
  return data.path;
}

/** URL pública temporal (1 hora) para reproducir el audio */
export async function getAudioUrl(storagePath) {
  const { data } = await supabase.storage
    .from("recordings")
    .createSignedUrl(storagePath, 3600);
  return data?.signedUrl;
}

// ─── DB helpers ───────────────────────────────────────────────────────────────

/** Inserta un registro en la tabla recordings */
export async function createRecording({ userId, filename, storagePath }) {
  const { data, error } = await supabase
    .from("recordings")
    .insert({ user_id: userId, filename, storage_path: storagePath, status: "pending" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Escucha cambios en tiempo real de un recording por id */
export function subscribeToRecording(id, callback) {
  return supabase
    .channel(`recording-${id}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "recordings", filter: `id=eq.${id}` },
      (payload) => callback(payload.new)
    )
    .subscribe();
}

/** Lista todas las grabaciones del usuario */
export async function getUserRecordings(userId) {
  const { data, error } = await supabase
    .from("recordings")
    .select("*, analysis(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}
