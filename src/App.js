import { useState, useEffect, useRef } from "react";
import { supabase, uploadRecording, createRecording, subscribeToRecording, getUserRecordings } from "./lib/supabase";
import AuthScreen from "./components/AuthScreen";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signUp = (email, password) => supabase.auth.signUp({ email, password });
  const signOut = () => supabase.auth.signOut();

  if (!user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
  return <Platform user={user} onSignOut={signOut} />;
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0c10; --surface: #111318; --card: #161a22; --border: #1f2530;
    --accent: #00e5a0; --accent2: #6c63ff; --accent3: #ff6584; --accent4: #ffb84d;
    --text: #e8eaf0; --muted: #5a6275; --label: #8892a4;
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 220px; min-height: 100vh; background: var(--surface); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: fixed; top: 0; left: 0; z-index: 50; padding: 0 0 24px 0; }
  .sidebar-logo { padding: 24px 20px 20px; border-bottom: 1px solid var(--border); font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.15rem; color: var(--accent); }
  .sidebar-logo span { color: var(--text); }
  .sidebar-nav { padding: 16px 10px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .nav-section { font-size: 0.65rem; font-weight: 600; color: var(--muted); letter-spacing: 1.5px; text-transform: uppercase; padding: 12px 10px 6px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px; cursor: pointer; font-size: 0.845rem; color: var(--label); transition: all 0.15s; font-weight: 500; }
  .nav-item:hover { background: var(--card); color: var(--text); }
  .nav-item.active { background: rgba(0,229,160,0.12); color: var(--accent); }
  .main { margin-left: 220px; flex: 1; }
  .topbar { background: var(--surface); border-bottom: 1px solid var(--border); padding: 0 32px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40; }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem; }
  .topbar-actions { display: flex; align-items: center; gap: 12px; }
  .content { padding: 28px 32px; }
  .badge { background: rgba(0,229,160,0.15); color: var(--accent); font-size: 0.72rem; padding: 3px 10px; border-radius: 20px; font-family: 'DM Mono', monospace; font-weight: 500; border: 1px solid rgba(0,229,160,0.25); }
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: 10px; font-size: 0.875rem; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; font-family: 'DM Sans', sans-serif; }
  .btn-primary { background: var(--accent); color: #0a0c10; }
  .btn-primary:hover { background: #00ffb3; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .btn-ghost { background: var(--card); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
  .btn-sm { padding: 6px 14px; font-size: 0.8rem; }
  .btn-pdf { background: var(--accent3); color: #fff; }
  .btn-danger { background: rgba(255,101,132,0.1); color: var(--accent3); border: 1px solid rgba(255,101,132,0.2); }
  .card { background: var(--card); border-radius: 14px; border: 1px solid var(--border); padding: 22px 24px; }
  .card-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.95rem; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
  .card-title .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .kpi-card { background: var(--card); border: 1px solid var(--border); border-radius: 14px; padding: 20px; position: relative; overflow: hidden; }
  .kpi-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--accent-color, var(--accent)); }
  .kpi-label { font-size: 0.75rem; color: var(--label); font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; }
  .kpi-value { font-family: 'Syne', sans-serif; font-size: 1.9rem; font-weight: 800; line-height: 1; }
  .upload-zone { border: 2px dashed var(--border); border-radius: 16px; padding: 48px 32px; text-align: center; cursor: pointer; transition: all 0.2s; background: linear-gradient(135deg, rgba(108,99,255,0.04), rgba(0,229,160,0.04)); }
  .upload-zone:hover, .upload-zone.drag { border-color: var(--accent); background: rgba(0,229,160,0.06); }
  .upload-zone h3 { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; margin: 12px 0 6px; }
  .upload-zone p { color: var(--label); font-size: 0.85rem; }
  .upload-icon { width: 56px; height: 56px; background: rgba(0,229,160,0.1); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; font-size: 1.5rem; margin-bottom: 4px; }
  .file-item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: var(--card); border-radius: 10px; margin-bottom: 8px; border: 1px solid var(--border); cursor: pointer; transition: border-color 0.2s; }
  .file-item:hover { border-color: rgba(0,229,160,0.3); }
  .file-name { font-size: 0.875rem; font-weight: 500; }
  .file-meta { font-size: 0.75rem; color: var(--label); font-family: 'DM Mono', monospace; }
  .file-status { font-size: 0.72rem; padding: 3px 10px; border-radius: 20px; font-weight: 600; font-family: 'DM Mono', monospace; white-space: nowrap; }
  .status-pending { background: rgba(255,184,77,0.15); color: var(--accent4); }
  .status-processing { background: rgba(108,99,255,0.15); color: var(--accent2); animation: pulse 1.5s infinite; }
  .status-done { background: rgba(0,229,160,0.15); color: var(--accent); }
  .status-error { background: rgba(255,101,132,0.15); color: var(--accent3); }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
  .loading-bar { height: 3px; background: linear-gradient(90deg, var(--accent2), var(--accent), var(--accent2)); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 2px; margin-top: 6px; }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .tabs { display: flex; gap: 4px; background: var(--surface); padding: 4px; border-radius: 10px; border: 1px solid var(--border); margin-bottom: 20px; flex-wrap: wrap; }
  .tab { padding: 7px 14px; border-radius: 7px; cursor: pointer; font-size: 0.8rem; font-weight: 500; color: var(--label); transition: all 0.15s; }
  .tab.active { background: var(--card); color: var(--text); }
  .progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-top: 4px; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
  .sentiment-bar { height: 12px; border-radius: 6px; overflow: hidden; display: flex; margin: 8px 0; }
  .transcript-msg { display: flex; gap: 10px; margin-bottom: 14px; }
  .msg-avatar { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0; margin-top: 2px; }
  .msg-agent { background: rgba(108,99,255,0.2); color: var(--accent2); }
  .msg-client { background: rgba(0,229,160,0.15); color: var(--accent); }
  .msg-bubble { flex: 1; background: var(--surface); padding: 10px 14px; border-radius: 0 12px 12px 12px; font-size: 0.83rem; line-height: 1.55; border: 1px solid var(--border); }
  .msg-time { font-size: 0.7rem; color: var(--muted); margin-top: 4px; font-family: 'DM Mono', monospace; }
  .keyword-cloud { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .keyword { padding: 4px 12px; border-radius: 20px; font-size: 0.77rem; font-weight: 500; font-family: 'DM Mono', monospace; }
  .alert-item { padding: 10px 14px; border-radius: 10px; font-size: 0.83rem; margin-bottom: 8px; background: rgba(255,184,77,0.08); border: 1px solid rgba(255,184,77,0.2); color: var(--accent4); }
  table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
  th { text-align: left; padding: 8px 12px; font-size: 0.7rem; color: var(--label); font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid var(--border); }
  td { padding: 10px 12px; border-bottom: 1px solid rgba(31,37,48,0.6); }
  tr:last-child td { border-bottom: none; }
  .empty-state { text-align: center; padding: 48px 24px; color: var(--muted); }
  .empty-state h3 { font-family: 'Syne', sans-serif; font-size: 1rem; color: var(--label); margin-bottom: 6px; }
  .donut-wrap { display: flex; align-items: center; gap: 20px; }
  .donut-legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .legend-val { margin-left: auto; font-family: 'DM Mono', monospace; font-weight: 500; }
  .score-ring { position: relative; }
  .score-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .score-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem; line-height: 1; }
  .score-sub { font-size: 0.6rem; color: var(--label); }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: var(--bg); } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
`;

const DonutChart = ({ data, colors, size = 90 }) => {
  const total = data.reduce((a, b) => a + b, 0);
  if (!total) return <div style={{ width: size, height: size, background: "var(--border)", borderRadius: "50%" }} />;
  let acc = 0;
  const segs = data.map((v, i) => {
    const pct = v / total; const start = acc; acc += pct;
    const r = 32, cx = 45, cy = 45;
    const a1 = start * 2 * Math.PI - Math.PI / 2, a2 = acc * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const ri = 20;
    const xi1 = cx + ri * Math.cos(a1), yi1 = cy + ri * Math.sin(a1);
    const xi2 = cx + ri * Math.cos(a2), yi2 = cy + ri * Math.sin(a2);
    return <path key={i} d={`M${x1},${y1} A${r},${r} 0 ${pct > 0.5 ? 1 : 0},1 ${x2},${y2} L${xi2},${yi2} A${ri},${ri} 0 ${pct > 0.5 ? 1 : 0},0 ${xi1},${yi1} Z`} fill={colors[i]} opacity="0.9" />;
  });
  return <svg width={size} height={size} viewBox="0 0 90 90">{segs}</svg>;
};

const ScoreRing = ({ value, color = "#00e5a0" }) => {
  const r = 34, cx = 40, cy = 40, circ = 2 * Math.PI * r, fill = ((value || 0) / 100) * circ;
  return (
    <div className="score-ring" style={{ width: 80, height: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
          style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
      </svg>
      <div className="score-center">
        <span className="score-num" style={{ color }}>{value || 0}</span>
        <span className="score-sub">/100</span>
      </div>
    </div>
  );
};

const generatePDF = (a, title) => {
  const win = window.open("", "_blank");
  const s = a.scores || {}, sent = a.sentiment || {}, tr = a.transcript || [];
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>body{font-family:Arial,sans-serif;color:#1a1a2e;margin:0}.cover{background:linear-gradient(135deg,#0d1117,#1a2035);color:#fff;padding:60px 48px}.cover h1{font-size:2rem;font-weight:900;margin:0 0 8px}.body{padding:32px 48px}h2{font-size:1.1rem;font-weight:700;border-left:4px solid #00e5a0;padding-left:10px;margin:24px 0 16px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}.kpi{background:#f8f9fc;border-radius:10px;padding:16px;border:1px solid #e4e6ee}.kpi-l{font-size:.7rem;color:#888;text-transform:uppercase;margin-bottom:6px}.kpi-v{font-size:1.6rem;font-weight:800}.bar-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}.bar-name{width:130px;font-size:.83rem;color:#444}.bar{flex:1;height:8px;background:#eee;border-radius:4px;overflow:hidden}.bar-fill{height:100%;border-radius:4px;background:#00e5a0}.bar-val{width:36px;font-weight:700;font-size:.83rem;text-align:right}table{width:100%;border-collapse:collapse;font-size:.85rem}th{background:#f0f2f8;padding:10px 12px;text-align:left;font-size:.72rem;text-transform:uppercase;color:#555}td{padding:10px 12px;border-bottom:1px solid #eee}.pill{display:inline-block;background:#f0f2f8;padding:4px 10px;border-radius:12px;font-size:.75rem;margin:3px}.footer{margin-top:40px;border-top:1px solid #eee;padding-top:16px;font-size:.72rem;color:#999;display:flex;justify-content:space-between}</style></head>
  <body><div class="cover"><h1>🎙 ${title}</h1><p>Archivo: ${a.filename} · Agente: ${a.agent} · ${a.date}</p></div>
  <div class="body">
  <h2>Métricas Generales</h2><div class="grid">
  <div class="kpi"><div class="kpi-l">Satisfacción</div><div class="kpi-v">${s.Satisfacción || 0}%</div></div>
  <div class="kpi"><div class="kpi-l">Duración</div><div class="kpi-v">${a.duration}</div></div>
  <div class="kpi"><div class="kpi-l">NPS</div><div class="kpi-v">${a.nps || 0}</div></div>
  <div class="kpi"><div class="kpi-l">Alertas</div><div class="kpi-v">${(a.alerts||[]).length}</div></div></div>
  <h2>Calidad</h2>${Object.entries(s).map(([k,v])=>`<div class="bar-row"><div class="bar-name">${k}</div><div class="bar"><div class="bar-fill" style="width:${v}%"></div></div><div class="bar-val">${v}</div></div>`).join("")}
  <h2>Sentimiento</h2><table><tr><th>Tipo</th><th>%</th></tr><tr><td>✅ Positivo</td><td>${sent.positive||0}%</td></tr><tr><td>⚪ Neutral</td><td>${sent.neutral||0}%</td></tr><tr><td>❌ Negativo</td><td>${sent.negative||0}%</td></tr></table>
  <h2>Temas</h2>${(a.topics||[]).map(t=>`<span class="pill">${t}</span>`).join("")}
  <h2>Keywords</h2>${(a.keywords||[]).map(k=>`<span class="pill">${k}</span>`).join("")}
  ${(a.alerts||[]).length?`<h2>⚠ Alertas</h2>${a.alerts.map(al=>`<p style="color:#e53935;margin:6px 0">• ${al}</p>`).join("")}`:""}
  <h2>Transcripción</h2><table><tr><th>Interlocutor</th><th>Texto</th></tr>${tr.slice(0,10).map(m=>`<tr><td><strong>${m.speaker}</strong></td><td>${m.text}</td></tr>`).join("")}</table>
  <div class="footer"><span>Speech Analytics — Sercomed</span><span>${new Date().toLocaleString("es-CL")}</span></div>
  </div><script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
};

function Platform({ user, onSignOut }) {
  const [page, setPage] = useState("upload");
  const [recordings, setRecordings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const REPORTS = ["Sentimiento","Puntuaciones","Keywords","Transcripción","Ratio Conversación","Temas","Alertas","Cumplimiento","NPS"];

  useEffect(() => { loadRecordings(); }, []);

  const loadRecordings = async () => {
    try {
      const data = await getUserRecordings(user.id);
      setRecordings(data || []);
    } catch(e) { console.error(e); }
  };

  const buildAnalysis = (rec) => {
    if (!rec.analysis) return null;
    const a = rec.analysis;
    return {
      filename: rec.filename,
      duration: rec.duration_sec ? `${Math.floor(rec.duration_sec/60)}:${String(rec.duration_sec%60).padStart(2,"0")}` : "—",
      agent: rec.agent_name || "Agente",
      date: new Date(rec.created_at).toLocaleDateString("es-CL"),
      scores: { Satisfacción: a.score_satisfaction||0, Claridad: a.score_clarity||0, Empatía: a.score_empathy||0, Resolución: a.score_resolution||0, Cumplimiento: a.score_compliance||0 },
      sentiment: { positive: Number(a.sentiment_pos)||0, neutral: Number(a.sentiment_neu)||0, negative: Number(a.sentiment_neg)||0 },
      topics: a.topics||[], keywords: a.keywords||[], transcript: a.transcript||[],
      alerts: a.alerts||[], interruptions: a.interruptions||0, silences: a.long_silences||0,
      talkRatio: { agent: Number(a.talk_ratio_agent)||50 },
      nps: a.nps_score||0, complianceItems: a.compliance_items||{},
    };
  };

  const selRec = recordings.find(r => r.id === selected);
  const selAnalysis = selRec ? buildAnalysis(selRec) : null;

  const handleUpload = async (file) => {
    if (uploading) return;
    setError(""); setUploading(true);
    try {
      console.log("Subiendo archivo:", file.name);
      const storagePath = await uploadRecording(file, user.id);
      console.log("Storage path:", storagePath);
      const rec = await createRecording({ userId: user.id, filename: file.name, storagePath });
      console.log("Recording creado:", rec.id);
      setRecordings(prev => [{ ...rec, analysis: null }, ...prev]);

      const { error: fnErr } = await supabase.functions.invoke("process-audio", { body: { recording_id: rec.id } });
      if (fnErr) { console.error("Edge function error:", fnErr); setError("Error al procesar: " + fnErr.message); }
      else console.log("Edge function invocada OK");

      const channel = subscribeToRecording(rec.id, (updated) => {
        console.log("Recording actualizado:", updated.status);
        setRecordings(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
        if (updated.status === "done") { loadRecordings(); supabase.removeChannel(channel); }
      });
    } catch(e) {
      console.error("Upload error:", e);
      setError("Error: " + e.message);
    } finally { setUploading(false); }
  };

  const handleFiles = (list) => Array.from(list).forEach(f => handleUpload(f));
  const statusLabel = s => ({ pending:"En cola", processing:"Analizando…", done:"✓ Listo", error:"Error" }[s]||s);
  const statusClass = s => ({ pending:"status-pending", processing:"status-processing", done:"status-done", error:"status-error" }[s]||"");

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-logo">🎙 Speech<span>AI</span></div>
          <nav className="sidebar-nav">
            <div className="nav-section">Plataforma</div>
            {[["upload","📤","Cargar Audio"],["files","🎙","Grabaciones"],
              ...(selAnalysis?[["dashboard","📊","Dashboard"]]:[])]
              .map(([id,icon,label]) => (
                <div key={id} className={`nav-item ${page===id?"active":""}`} onClick={()=>setPage(id)}>
                  {icon} {label}
                </div>
              ))}
            {selAnalysis && <>
              <div className="nav-section">Reportes</div>
              {REPORTS.map((r,i) => (
                <div key={r} className={`nav-item ${page==="dashboard"&&activeTab===i?"active":""}`}
                  style={{fontSize:"0.78rem"}}
                  onClick={()=>{setPage("dashboard");setActiveTab(i);}}>
                  {r}
                </div>
              ))}
            </>}
          </nav>
          <div style={{padding:"0 16px"}}>
            <button className="btn btn-danger btn-sm" style={{width:"100%"}} onClick={onSignOut}>Cerrar sesión</button>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div className="topbar-title">
              {page==="upload"&&"Cargar Grabaciones"}
              {page==="dashboard"&&(selRec?`📊 ${selRec.filename}`:"Dashboard")}
              {page==="files"&&"Grabaciones"}
            </div>
            <div className="topbar-actions">
              {selAnalysis&&<span className="badge">{selAnalysis.agent}</span>}
              {selAnalysis&&<span className="badge" style={{background:"rgba(255,184,77,0.1)",color:"#ffb84d",borderColor:"rgba(255,184,77,0.2)"}}>{selAnalysis.duration}</span>}
              {selAnalysis&&page==="dashboard"&&(
                <button className="btn btn-pdf btn-sm" onClick={()=>generatePDF(selAnalysis,REPORTS[activeTab])}>📄 PDF</button>
              )}
              <span style={{fontSize:"0.8rem",color:"var(--muted)"}}>{user.email}</span>
            </div>
          </div>

          <div className="content">
            {error && <div style={{background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.3)",color:"#ff6584",padding:"10px 16px",borderRadius:10,marginBottom:16,fontSize:"0.83rem"}}>{error}</div>}

            {page==="upload" && (
              <div>
                <div className={`upload-zone ${dragging?"drag":""}`}
                  onDragOver={e=>{e.preventDefault();setDragging(true);}}
                  onDragLeave={()=>setDragging(false)}
                  onDrop={e=>{e.preventDefault();setDragging(false);handleFiles(e.dataTransfer.files);}}
                  onClick={()=>fileRef.current.click()}>
                  <input ref={fileRef} type="file" accept=".ogg,audio/*" multiple hidden onChange={e=>handleFiles(e.target.files)} />
                  <div className="upload-icon">📤</div>
                  <h3>{uploading?"Subiendo y procesando…":"Arrastra tus archivos .ogg aquí"}</h3>
                  <p>{uploading?"Whisper está transcribiendo el audio":"o haz clic para seleccionar · acepta .ogg .mp3 .wav"}</p>
                  {uploading&&<div className="loading-bar" style={{marginTop:16,maxWidth:300,margin:"16px auto 0"}} />}
                </div>
                {recordings.length>0&&(
                  <div style={{marginTop:24}}>
                    <div className="card-title"><div className="dot"/>Grabaciones recientes</div>
                    {recordings.slice(0,5).map(r=>(
                      <div key={r.id} className="file-item"
                        onClick={()=>{if(r.status==="done"){setSelected(r.id);setPage("dashboard");}}}>
                        <span style={{fontSize:"1.2rem"}}>🎙</span>
                        <div style={{flex:1}}>
                          <div className="file-name">{r.filename}</div>
                          <div className="file-meta">{new Date(r.created_at).toLocaleString("es-CL")}</div>
                          {r.status==="processing"&&<div className="loading-bar"/>}
                        </div>
                        <span className={`file-status ${statusClass(r.status)}`}>{statusLabel(r.status)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {page==="files" && (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:700}}>Grabaciones ({recordings.length})</div>
                  <button className="btn btn-primary btn-sm" onClick={()=>setPage("upload")}>📤 Subir más</button>
                </div>
                {recordings.length===0
                  ? <div className="empty-state"><h3>Sin grabaciones</h3><p>Sube tu primer archivo .ogg</p></div>
                  : <table>
                      <thead><tr><th>Archivo</th><th>Agente</th><th>Duración</th><th>Satisfacción</th><th>Fecha</th><th>Estado</th><th></th></tr></thead>
                      <tbody>{recordings.map(r=>{
                        const a=r.analysis;
                        return <tr key={r.id}>
                          <td style={{fontWeight:500}}>{r.filename}</td>
                          <td style={{color:"var(--label)",fontSize:"0.8rem"}}>{r.agent_name||"—"}</td>
                          <td style={{fontFamily:"DM Mono,monospace",fontSize:"0.8rem"}}>{r.duration_sec?`${Math.floor(r.duration_sec/60)}:${String(r.duration_sec%60).padStart(2,"0")}`:"—"}</td>
                          <td>{a?<span style={{color:"#00e5a0",fontWeight:600}}>{a.score_satisfaction}%</span>:"—"}</td>
                          <td style={{fontSize:"0.8rem",color:"var(--label)"}}>{new Date(r.created_at).toLocaleDateString("es-CL")}</td>
                          <td><span className={`file-status ${statusClass(r.status)}`}>{statusLabel(r.status)}</span></td>
                          <td>{r.status==="done"&&<div style={{display:"flex",gap:6}}>
                            <button className="btn btn-ghost btn-sm" onClick={()=>{setSelected(r.id);setPage("dashboard");}}>Ver</button>
                            <button className="btn btn-pdf btn-sm" onClick={()=>generatePDF(buildAnalysis(r),"Reporte Completo")}>PDF</button>
                          </div>}</td>
                        </tr>;
                      })}</tbody>
                    </table>}
              </div>
            )}

            {page==="dashboard" && (
              !selAnalysis
                ? <div className="empty-state"><h3>Selecciona una grabación analizada</h3><button className="btn btn-primary" style={{marginTop:16}} onClick={()=>setPage("files")}>Ver grabaciones</button></div>
                : <>
                    <div className="grid-4" style={{marginBottom:20}}>
                      {[{l:"Satisfacción",v:`${selAnalysis.scores.Satisfacción}%`,c:"#00e5a0"},{l:"Duración",v:selAnalysis.duration,c:"#6c63ff"},{l:"NPS",v:selAnalysis.nps,c:"#ffb84d"},{l:"Alertas",v:selAnalysis.alerts.length,c:selAnalysis.alerts.length>0?"#ff6584":"#00e5a0"}]
                        .map(k=>(
                          <div className="kpi-card" key={k.l} style={{"--accent-color":k.c}}>
                            <div className="kpi-label">{k.l}</div>
                            <div className="kpi-value" style={{color:k.c}}>{k.v}</div>
                          </div>
                        ))}
                    </div>
                    <div className="tabs">{REPORTS.map((r,i)=><div key={r} className={`tab ${activeTab===i?"active":""}`} onClick={()=>setActiveTab(i)}>{r}</div>)}</div>
                    <div className="card">
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                        <div className="card-title" style={{marginBottom:0}}><div className="dot"/>{REPORTS[activeTab]}</div>
                        <button className="btn btn-pdf btn-sm" onClick={()=>generatePDF(selAnalysis,REPORTS[activeTab])}>📄 PDF</button>
                      </div>

                      {activeTab===0&&<div>
                        <div className="donut-wrap">
                          <DonutChart data={[selAnalysis.sentiment.positive,selAnalysis.sentiment.neutral,selAnalysis.sentiment.negative]} colors={["#00e5a0","#6c63ff","#ff6584"]}/>
                          <div className="donut-legend">
                            {[["Positivo",selAnalysis.sentiment.positive,"#00e5a0"],["Neutral",selAnalysis.sentiment.neutral,"#6c63ff"],["Negativo",selAnalysis.sentiment.negative,"#ff6584"]].map(([l,v,c])=>(
                              <div className="legend-item" key={l}><div className="legend-dot" style={{background:c}}/><span style={{color:"var(--label)"}}>{l}</span><span className="legend-val">{v}%</span></div>
                            ))}
                          </div>
                        </div>
                        <div className="sentiment-bar" style={{marginTop:16}}>
                          <div style={{width:`${selAnalysis.sentiment.positive}%`,background:"#00e5a0",height:"100%"}}/>
                          <div style={{width:`${selAnalysis.sentiment.neutral}%`,background:"#6c63ff",height:"100%"}}/>
                          <div style={{width:`${selAnalysis.sentiment.negative}%`,background:"#ff6584",height:"100%"}}/>
                        </div>
                      </div>}

                      {activeTab===1&&<div style={{display:"flex",flexDirection:"column",gap:12}}>
                        {Object.entries(selAnalysis.scores).map(([k,v])=>{
                          const c={Satisfacción:"#00e5a0",Claridad:"#6c63ff",Empatía:"#ffb84d",Resolución:"#00e5a0",Cumplimiento:"#ff6584"}[k];
                          return <div key={k}>
                            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                              <span style={{fontSize:"0.83rem",color:"var(--label)"}}>{k}</span>
                              <span style={{fontFamily:"DM Mono,monospace",fontWeight:600,color:c}}>{v}</span>
                            </div>
                            <div className="progress-bar"><div className="progress-fill" style={{width:`${v}%`,background:c}}/></div>
                          </div>;
                        })}
                      </div>}

                      {activeTab===2&&<div className="keyword-cloud">
                        {selAnalysis.keywords.length===0?<span style={{color:"var(--muted)"}}>Sin keywords detectadas</span>:
                          selAnalysis.keywords.map((kw,i)=>{
                            const cols=[["rgba(0,229,160,0.15)","#00e5a0"],["rgba(108,99,255,0.15)","#9c99ff"],["rgba(255,184,77,0.15)","#ffb84d"],["rgba(255,101,132,0.15)","#ff6584"]];
                            const [bg,c]=cols[i%4];
                            return <span key={kw} className="keyword" style={{background:bg,color:c,border:`1px solid ${c}30`}}>{kw}</span>;
                          })}
                      </div>}

                      {activeTab===3&&<div style={{maxHeight:400,overflowY:"auto"}}>
                        {selAnalysis.transcript.length===0?<span style={{color:"var(--muted)"}}>Sin transcripción disponible</span>:
                          selAnalysis.transcript.map((m,i)=>(
                            <div className="transcript-msg" key={i}>
                              <div className={`msg-avatar ${m.speaker==="Agente"?"msg-agent":"msg-client"}`}>{m.speaker==="Agente"?"AG":"CL"}</div>
                              <div>
                                <div className="msg-bubble">{m.text}</div>
                                <div className="msg-time">{m.speaker}{m.start_sec!==undefined?` · ${m.start_sec}s`:""}</div>
                              </div>
                            </div>
                          ))}
                      </div>}

                      {activeTab===4&&<div>
                        <div style={{display:"flex",gap:16,marginBottom:12}}>
                          {[["Agente",selAnalysis.talkRatio.agent,"#6c63ff"],["Cliente",100-selAnalysis.talkRatio.agent,"#00e5a0"]].map(([l,v,c])=>(
                            <div key={l} style={{flex:1,textAlign:"center",background:"var(--surface)",borderRadius:10,padding:"16px 8px",border:"1px solid var(--border)"}}>
                              <div style={{fontSize:"1.8rem",fontFamily:"Syne,sans-serif",fontWeight:800,color:c}}>{v}%</div>
                              <div style={{fontSize:"0.8rem",color:"var(--label)"}}>{l}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginTop:16}}>
                          {[["Interrupciones",selAnalysis.interruptions,"#ffb84d"],["Silencios largos",selAnalysis.silences,"#6c63ff"]].map(([l,v,c])=>(
                            <div key={l} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:14}}>
                              <div style={{fontSize:"0.72rem",color:"var(--label)",textTransform:"uppercase",marginBottom:4}}>{l}</div>
                              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.6rem",color:c}}>{v}</div>
                            </div>
                          ))}
                        </div>
                      </div>}

                      {activeTab===5&&<div>
                        {selAnalysis.topics.length===0?<span style={{color:"var(--muted)"}}>Sin temas detectados</span>:
                          selAnalysis.topics.map(t=>(
                            <div key={t} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                              <span>{t}</span><span style={{color:"#00e5a0",fontSize:"0.8rem",fontWeight:600}}>✓ Detectado</span>
                            </div>
                          ))}
                      </div>}

                      {activeTab===6&&<div>
                        {selAnalysis.alerts.length===0
                          ?<div style={{color:"#00e5a0",textAlign:"center",padding:"16px 0"}}>✓ Sin alertas detectadas</div>
                          :selAnalysis.alerts.map((al,i)=><div key={i} className="alert-item">⚠ {al}</div>)}
                      </div>}

                      {activeTab===7&&<div>
                        {Object.entries(selAnalysis.complianceItems).length===0?<span style={{color:"var(--muted)"}}>Sin datos de cumplimiento</span>:
                          Object.entries(selAnalysis.complianceItems).map(([k,v])=>(
                            <div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
                              <span style={{textTransform:"capitalize",fontSize:"0.875rem"}}>{k.replace(/_/g," ")}</span>
                              <span style={{color:v?"#00e5a0":"#ff6584",fontWeight:600,fontSize:"0.8rem"}}>{v?"✓ Cumplido":"✗ Faltante"}</span>
                            </div>
                          ))}
                      </div>}

                      {activeTab===8&&<div style={{textAlign:"center"}}>
                        <ScoreRing value={selAnalysis.nps} color={selAnalysis.nps>=70?"#00e5a0":selAnalysis.nps>=50?"#ffb84d":"#ff6584"}/>
                        <div style={{marginTop:12,fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"1rem"}}>NPS Estimado</div>
                        <div style={{color:"var(--label)",fontSize:"0.83rem",marginTop:4}}>
                          {selAnalysis.nps>=70?"Promotor potencial":selAnalysis.nps>=50?"Pasivo":"Detractor potencial"}
                        </div>
                      </div>}
                    </div>

                    <div className="grid-2" style={{marginTop:16}}>
                      <div className="card">
                        <div className="card-title"><div className="dot" style={{background:"#6c63ff"}}/>Calidad</div>
                        <div style={{display:"flex",flexDirection:"column",gap:10}}>
                          {Object.entries(selAnalysis.scores).map(([k,v])=>(
                            <div key={k}>
                              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                                <span style={{fontSize:"0.78rem",color:"var(--label)"}}>{k}</span>
                                <span style={{fontSize:"0.78rem",fontWeight:600}}>{v}</span>
                              </div>
                              <div className="progress-bar"><div className="progress-fill" style={{width:`${v}%`,background:"#6c63ff"}}/></div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="card">
                        <div className="card-title"><div className="dot" style={{background:"#ffb84d"}}/>Sentimiento</div>
                        <div className="donut-wrap">
                          <DonutChart data={[selAnalysis.sentiment.positive,selAnalysis.sentiment.neutral,selAnalysis.sentiment.negative]} colors={["#00e5a0","#6c63ff","#ff6584"]}/>
                          <div className="donut-legend">
                            {[["Positivo",selAnalysis.sentiment.positive,"#00e5a0"],["Neutral",selAnalysis.sentiment.neutral,"#6c63ff"],["Negativo",selAnalysis.sentiment.negative,"#ff6584"]].map(([l,v,c])=>(
                              <div className="legend-item" key={l}><div className="legend-dot" style={{background:c}}/><span style={{color:"var(--label)"}}>{l}</span><span className="legend-val">{v}%</span></div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
