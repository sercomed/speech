import { useState } from "react";
import { useRecordings } from "./hooks/useRecordings";
import AuthScreen from "./components/AuthScreen";

// ─── Re-export the full UI from the main platform component ──────────────────
// The platform UI is identical to the artifact version but wired to real data.
// For brevity we import the same visual shell and swap mock data for real data.

export default function App() {
  const { user, recordings, loading, uploading, handleUpload, signIn, signUp, signOut } = useRecordings();

  if (!user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;

  // Map Supabase recordings to the shape the UI expects
  const files = recordings.map((r) => ({
    id: r.id,
    name: r.filename,
    size: r.duration_sec ? `${r.duration_sec}s` : "—",
    status: r.status === "done" ? "done" : r.status === "processing" ? "analyzing" : "pending",
  }));

  const analysisMap = {};
  recordings.forEach((r) => {
    if (r.analysis) {
      const a = r.analysis;
      analysisMap[r.id] = {
        filename: r.filename,
        duration: r.duration_sec ? `${Math.floor(r.duration_sec / 60)}:${String(r.duration_sec % 60).padStart(2, "0")}` : "—",
        agent: r.agent_name || "Agente",
        date: new Date(r.created_at).toLocaleDateString("es-MX"),
        scores: {
          satisfaction: a.score_satisfaction,
          clarity: a.score_clarity,
          empathy: a.score_empathy,
          resolution: a.score_resolution,
          compliance: a.score_compliance,
        },
        sentiment: {
          positive: a.sentiment_pos,
          neutral: a.sentiment_neu,
          negative: a.sentiment_neg,
        },
        topics: a.topics || [],
        keywords: a.keywords || [],
        transcript: a.transcript || [],
        alerts: a.alerts || [],
        interruptions: a.interruptions || 0,
        silences: a.long_silences || 0,
        talkRatio: { agent: a.talk_ratio_agent || 50 },
        nps: a.nps_score,
        complianceItems: a.compliance_items || {},
      };
    }
  });

  // Render the main platform UI
  // (import SpeechAnalyticsPlatform from the main platform file)
  return (
    <SpeechAnalyticsPlatform
      files={files}
      analysisMap={analysisMap}
      onUpload={handleUpload}
      uploading={uploading}
      onSignOut={signOut}
      user={user}
    />
  );
}

// ─── Placeholder: replace with actual platform UI ────────────────────────────
// In the real project, import the full platform component here.
// The full UI code is in src/pages/Platform.js (copy from the artifact).
function SpeechAnalyticsPlatform({ files, analysisMap, onUpload, uploading, onSignOut, user }) {
  return (
    <div style={{ fontFamily: "DM Sans, sans-serif", background: "#0a0c10", minHeight: "100vh",
      color: "#e8eaf0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "#00e5a0" }}>
          🎙 SpeechAI
        </div>
        <p style={{ color: "#5a6275", marginTop: 8 }}>
          Conectado como <strong style={{ color: "#e8eaf0" }}>{user.email}</strong>
        </p>
        <p style={{ color: "#5a6275", fontSize: "0.83rem", marginTop: 16, maxWidth: 400 }}>
          Copia el componente de la interfaz principal (artifact) en <code>src/pages/Platform.js</code> y úsalo aquí.
          Este archivo solo conecta Supabase con la UI.
        </p>
        <button onClick={onSignOut} style={{
          marginTop: 24, background: "#ff6584", color: "#fff", border: "none",
          borderRadius: 10, padding: "10px 24px", cursor: "pointer", fontWeight: 600
        }}>Cerrar sesión</button>
      </div>
    </div>
  );
}
