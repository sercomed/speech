import { useState, useRef, useCallback, useEffect } from "react";

// ─── Palette & Globals ────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0c10;
    --surface: #111318;
    --card: #161a22;
    --border: #1f2530;
    --accent: #00e5a0;
    --accent2: #6c63ff;
    --accent3: #ff6584;
    --accent4: #ffb84d;
    --text: #e8eaf0;
    --muted: #5a6275;
    --label: #8892a4;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

  .app { display: flex; min-height: 100vh; }

  /* Sidebar */
  .sidebar {
    width: 220px; min-height: 100vh; background: var(--surface);
    border-right: 1px solid var(--border); display: flex; flex-direction: column;
    position: fixed; top: 0; left: 0; z-index: 50; padding: 0 0 24px 0;
  }
  .sidebar-logo {
    padding: 24px 20px 20px; border-bottom: 1px solid var(--border);
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.15rem;
    color: var(--accent); letter-spacing: -0.5px;
  }
  .sidebar-logo span { color: var(--text); }
  .sidebar-nav { padding: 16px 10px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
  .nav-section { font-size: 0.65rem; font-weight: 600; color: var(--muted); letter-spacing: 1.5px;
    text-transform: uppercase; padding: 12px 10px 6px; }
  .nav-item {
    display: flex; align-items: center; gap: 10px; padding: 9px 12px; border-radius: 8px;
    cursor: pointer; font-size: 0.845rem; color: var(--label); transition: all 0.15s;
    font-weight: 500;
  }
  .nav-item:hover { background: var(--card); color: var(--text); }
  .nav-item.active { background: rgba(0,229,160,0.12); color: var(--accent); }
  .nav-item svg { opacity: 0.75; }
  .nav-item.active svg { opacity: 1; }

  /* Main */
  .main { margin-left: 220px; flex: 1; padding: 0; }

  /* Topbar */
  .topbar {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 0 32px; height: 60px; display: flex; align-items: center;
    justify-content: space-between; position: sticky; top: 0; z-index: 40;
  }
  .topbar-title { font-family: 'Syne', sans-serif; font-weight: 700; font-size: 1.05rem; }
  .topbar-actions { display: flex; align-items: center; gap: 12px; }
  .badge {
    background: rgba(0,229,160,0.15); color: var(--accent); font-size: 0.72rem;
    padding: 3px 10px; border-radius: 20px; font-family: 'DM Mono', monospace;
    font-weight: 500; border: 1px solid rgba(0,229,160,0.25);
  }

  /* Content */
  .content { padding: 28px 32px; }

  /* Upload Zone */
  .upload-zone {
    border: 2px dashed var(--border); border-radius: 16px; padding: 48px 32px;
    text-align: center; cursor: pointer; transition: all 0.2s;
    background: linear-gradient(135deg, rgba(108,99,255,0.04), rgba(0,229,160,0.04));
    position: relative; overflow: hidden;
  }
  .upload-zone:hover, .upload-zone.drag { border-color: var(--accent); background: rgba(0,229,160,0.06); }
  .upload-zone h3 { font-family: 'Syne', sans-serif; font-size: 1.1rem; font-weight: 700; margin: 12px 0 6px; }
  .upload-zone p { color: var(--label); font-size: 0.85rem; }
  .upload-icon {
    width: 56px; height: 56px; background: rgba(0,229,160,0.1);
    border-radius: 16px; display: inline-flex; align-items: center; justify-content: center;
    color: var(--accent); font-size: 1.5rem; margin-bottom: 4px;
  }

  /* File List */
  .file-item {
    display: flex; align-items: center; gap: 12px; padding: 12px 16px;
    background: var(--card); border-radius: 10px; margin-bottom: 8px;
    border: 1px solid var(--border); transition: border-color 0.2s;
  }
  .file-item:hover { border-color: rgba(0,229,160,0.3); }
  .file-icon { color: var(--accent2); font-size: 1.2rem; }
  .file-info { flex: 1; }
  .file-name { font-size: 0.875rem; font-weight: 500; }
  .file-meta { font-size: 0.75rem; color: var(--label); font-family: 'DM Mono', monospace; }
  .file-status {
    font-size: 0.72rem; padding: 3px 10px; border-radius: 20px; font-weight: 600;
    font-family: 'DM Mono', monospace;
  }
  .status-pending { background: rgba(255,184,77,0.15); color: var(--accent4); }
  .status-analyzing { background: rgba(108,99,255,0.15); color: var(--accent2);
    animation: pulse 1.5s infinite; }
  .status-done { background: rgba(0,229,160,0.15); color: var(--accent); }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

  /* Btn */
  .btn {
    display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
    border-radius: 10px; font-size: 0.875rem; font-weight: 600; cursor: pointer;
    border: none; transition: all 0.15s; font-family: 'DM Sans', sans-serif;
  }
  .btn-primary { background: var(--accent); color: #0a0c10; }
  .btn-primary:hover { background: #00ffb3; transform: translateY(-1px); }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .btn-ghost { background: var(--card); color: var(--text); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
  .btn-sm { padding: 6px 14px; font-size: 0.8rem; }
  .btn-pdf { background: var(--accent3); color: #fff; }
  .btn-pdf:hover { background: #ff4d6d; transform: translateY(-1px); }

  /* Cards */
  .card {
    background: var(--card); border-radius: 14px; border: 1px solid var(--border);
    padding: 22px 24px;
  }
  .card-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 0.95rem;
    margin-bottom: 16px; display: flex; align-items: center; gap: 8px;
  }
  .card-title .dot {
    width: 8px; height: 8px; border-radius: 50%; background: var(--accent);
  }

  /* Grid */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
  .gap-16 { gap: 16px; }

  /* KPI */
  .kpi-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 20px; position: relative; overflow: hidden;
  }
  .kpi-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
    background: var(--accent-color, var(--accent));
  }
  .kpi-label { font-size: 0.75rem; color: var(--label); font-weight: 500; letter-spacing: 0.5px;
    text-transform: uppercase; margin-bottom: 8px; }
  .kpi-value {
    font-family: 'Syne', sans-serif; font-size: 1.9rem; font-weight: 800;
    line-height: 1; margin-bottom: 6px;
  }
  .kpi-trend { font-size: 0.78rem; color: var(--label); }
  .kpi-trend .up { color: var(--accent); }
  .kpi-trend .down { color: var(--accent3); }

  /* Charts */
  .bar-chart { display: flex; align-items: flex-end; gap: 6px; height: 120px; padding-top: 8px; }
  .bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
  .bar {
    width: 100%; border-radius: 4px 4px 0 0; transition: opacity 0.2s;
    min-height: 4px;
  }
  .bar:hover { opacity: 0.8; }
  .bar-label { font-size: 0.65rem; color: var(--label); font-family: 'DM Mono', monospace; }

  /* Donut */
  .donut-wrap { display: flex; align-items: center; gap: 20px; }
  .donut-legend { flex: 1; display: flex; flex-direction: column; gap: 8px; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .legend-val { margin-left: auto; font-family: 'DM Mono', monospace; font-weight: 500; color: var(--text); }

  /* Sentiment Bar */
  .sentiment-bar { height: 12px; border-radius: 6px; overflow: hidden;
    display: flex; gap: 2px; margin: 8px 0; }
  .sentiment-seg { height: 100%; transition: width 0.4s; }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.83rem; }
  th { text-align: left; padding: 8px 12px; font-size: 0.7rem; color: var(--label);
    font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;
    border-bottom: 1px solid var(--border); }
  td { padding: 10px 12px; border-bottom: 1px solid rgba(31,37,48,0.6); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }

  /* Transcript */
  .transcript-msg {
    display: flex; gap: 10px; margin-bottom: 14px;
  }
  .msg-avatar {
    width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center;
    justify-content: center; font-size: 0.7rem; font-weight: 700; flex-shrink: 0;
    margin-top: 2px;
  }
  .msg-agent { background: rgba(108,99,255,0.2); color: var(--accent2); }
  .msg-client { background: rgba(0,229,160,0.15); color: var(--accent); }
  .msg-bubble {
    flex: 1; background: var(--surface); padding: 10px 14px; border-radius: 0 12px 12px 12px;
    font-size: 0.83rem; line-height: 1.55; border: 1px solid var(--border);
  }
  .msg-meta { font-size: 0.7rem; color: var(--muted); margin-top: 4px;
    font-family: 'DM Mono', monospace; }

  /* Progress */
  .progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-top: 4px; }
  .progress-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }

  /* Keyword pill */
  .keyword-cloud { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .keyword {
    padding: 4px 12px; border-radius: 20px; font-size: 0.77rem; font-weight: 500;
    font-family: 'DM Mono', monospace; cursor: default;
  }

  /* Loading */
  .loading-bar {
    height: 3px; background: linear-gradient(90deg, var(--accent2), var(--accent), var(--accent2));
    background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 2px;
  }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

  /* Tabs */
  .tabs { display: flex; gap: 4px; background: var(--surface);
    padding: 4px; border-radius: 10px; border: 1px solid var(--border);
    margin-bottom: 20px; }
  .tab { padding: 7px 16px; border-radius: 7px; cursor: pointer; font-size: 0.83rem;
    font-weight: 500; color: var(--label); transition: all 0.15s; }
  .tab.active { background: var(--card); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,0.3); }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

  /* Alert */
  .alert {
    padding: 12px 16px; border-radius: 10px; font-size: 0.83rem; margin-bottom: 16px;
    display: flex; align-items: flex-start; gap: 10px;
  }
  .alert-info { background: rgba(108,99,255,0.1); border: 1px solid rgba(108,99,255,0.25); color: #a9a3ff; }
  .alert-success { background: rgba(0,229,160,0.08); border: 1px solid rgba(0,229,160,0.2); color: var(--accent); }

  /* Waveform */
  .waveform { display: flex; align-items: center; gap: 2px; height: 40px; }
  .wave-bar {
    width: 3px; border-radius: 2px; background: var(--accent);
    animation: wave 1.2s ease-in-out infinite;
    opacity: 0.7;
  }
  @keyframes wave {
    0%,100%{transform:scaleY(0.3)} 50%{transform:scaleY(1)}
  }

  /* Score ring */
  .score-ring { position: relative; width: 80px; height: 80px; }
  .score-ring svg { transform: rotate(-90deg); }
  .score-center {
    position: absolute; inset: 0; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
  }
  .score-num { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 1.2rem; line-height: 1; }
  .score-sub { font-size: 0.6rem; color: var(--label); }

  /* Empty */
  .empty-state { text-align: center; padding: 48px 24px; color: var(--muted); }
  .empty-state h3 { font-family: 'Syne', sans-serif; font-size: 1rem; color: var(--label); margin-bottom: 6px; }
  .empty-state p { font-size: 0.83rem; }

  /* Responsive */
  @media (max-width: 900px) {
    .grid-4 { grid-template-columns: 1fr 1fr; }
    .grid-3 { grid-template-columns: 1fr 1fr; }
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    mic: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    file: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
    pdf: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
    home: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0121 12a10 10 0 01-1.93 5.86M4.93 4.93A10 10 0 003 12a10 10 0 001.93 5.86"/></svg>,
    play: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    alert: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    trend: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    msg: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    tag: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  };
  return icons[name] || null;
};

// ─── Mock analysis data generator ─────────────────────────────────────────────
const generateAnalysis = (filename) => ({
  filename,
  duration: `${Math.floor(Math.random() * 8 + 2)}:${String(Math.floor(Math.random() * 60)).padStart(2, "0")}`,
  agent: ["María López", "Carlos Ruiz", "Ana García", "Javier Martínez"][Math.floor(Math.random() * 4)],
  date: new Date().toLocaleDateString("es-MX"),
  scores: {
    satisfaction: Math.floor(Math.random() * 25 + 70),
    clarity: Math.floor(Math.random() * 20 + 75),
    empathy: Math.floor(Math.random() * 30 + 65),
    resolution: Math.floor(Math.random() * 25 + 70),
    compliance: Math.floor(Math.random() * 15 + 82),
  },
  sentiment: {
    positive: Math.floor(Math.random() * 20 + 40),
    neutral: Math.floor(Math.random() * 15 + 25),
    negative: Math.floor(Math.random() * 20 + 10),
  },
  topics: ["Facturación", "Soporte técnico", "Cancelación", "Garantía", "Envío", "Descuento"].slice(0, Math.floor(Math.random() * 3 + 2)),
  keywords: ["resolución", "problema", "urgente", "satisfecho", "proceso", "cuenta", "servicio", "contrato"].slice(0, Math.floor(Math.random() * 5 + 4)),
  transcript: [
    { speaker: "Agente", text: "Buenos días, gracias por comunicarse con nosotros. Mi nombre es {agent}, ¿en qué puedo ayudarle?" },
    { speaker: "Cliente", text: "Hola, tengo un problema con mi factura del mes pasado, aparece un cobro que no reconozco." },
    { speaker: "Agente", text: "Entiendo, permítame verificar su cuenta. ¿Me podría proporcionar su número de cliente?" },
    { speaker: "Cliente", text: "Sí, es el 458-2019." },
    { speaker: "Agente", text: "Perfecto, estoy revisando su cuenta. Veo que hay un cargo adicional por el servicio premium activado el día 15. ¿Recuerda haber solicitado algún servicio extra?" },
    { speaker: "Cliente", text: "No, yo no solicité nada. Eso es un error, necesito que lo revertan." },
    { speaker: "Agente", text: "Completamente entendido. Voy a proceder con la reversión del cargo. En 3-5 días hábiles verá el reembolso reflejado." },
  ],
  alerts: Math.random() > 0.5 ? ["Posible escalada detectada en minuto 3:20", "Tono elevado del cliente identificado"] : [],
  interruptions: Math.floor(Math.random() * 8 + 1),
  silences: Math.floor(Math.random() * 5 + 1),
  talkRatio: { agent: Math.floor(Math.random() * 20 + 40), client: 0 },
});

// ─── Mini SVG Charts ──────────────────────────────────────────────────────────
const DonutChart = ({ data, colors, size = 90 }) => {
  const total = data.reduce((a, b) => a + b, 0);
  let acc = 0;
  const segs = data.map((v, i) => {
    const pct = v / total;
    const start = acc;
    acc += pct;
    const r = 32, cx = 45, cy = 45;
    const startAngle = start * 2 * Math.PI - Math.PI / 2;
    const endAngle = acc * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const large = pct > 0.5 ? 1 : 0;
    const ri = 20;
    const xi1 = cx + ri * Math.cos(startAngle), yi1 = cy + ri * Math.sin(startAngle);
    const xi2 = cx + ri * Math.cos(endAngle), yi2 = cy + ri * Math.sin(endAngle);
    return <path key={i} d={`M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${xi2},${yi2} A${ri},${ri} 0 ${large},0 ${xi1},${yi1} Z`} fill={colors[i]} opacity="0.9" />;
  });
  return <svg width={size} height={size} viewBox="0 0 90 90">{segs}</svg>;
};

const ScoreRing = ({ value, color = "#00e5a0" }) => {
  const r = 34, cx = 40, cy = 40, circ = 2 * Math.PI * r;
  const fill = (value / 100) * circ;
  return (
    <div className="score-ring" style={{ width: 80, height: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
      </svg>
      <div className="score-center">
        <span className="score-num" style={{ color }}>{value}</span>
        <span className="score-sub">/100</span>
      </div>
    </div>
  );
};

// ─── Dashboard Sections ───────────────────────────────────────────────────────
const BarChartSimple = ({ data, colors }) => (
  <div className="bar-chart">
    {data.map((d, i) => (
      <div className="bar-wrap" key={i}>
        <div className="bar" style={{ height: `${(d.v / Math.max(...data.map(x => x.v))) * 100}%`, background: colors[i % colors.length] }} title={d.v} />
        <span className="bar-label">{d.l}</span>
      </div>
    ))}
  </div>
);

// ─── PDF Generation ───────────────────────────────────────────────────────────
const generatePDF = async (analysis, reportType) => {
  const win = window.open("", "_blank");
  const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Reporte Speech Analytics - ${reportType}</title>
<style>
  body { font-family: Arial, sans-serif; color: #1a1a2e; margin: 0; padding: 0; }
  .cover { background: linear-gradient(135deg,#0d1117,#1a2035); color: #fff; padding: 60px 48px; min-height: 200px; }
  .cover h1 { font-size: 2rem; font-weight: 900; margin: 0 0 8px; letter-spacing: -1px; }
  .cover p { opacity: 0.65; margin: 0; }
  .cover .badge { display: inline-block; background: rgba(0,229,160,0.2); color: #00e5a0; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; margin-bottom: 16px; border: 1px solid rgba(0,229,160,0.4); }
  .body { padding: 32px 48px; }
  .section { margin-bottom: 32px; page-break-inside: avoid; }
  h2 { font-size: 1.1rem; font-weight: 700; border-left: 4px solid #00e5a0; padding-left: 10px; margin-bottom: 16px; color: #111; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; margin-bottom: 20px; }
  .kpi { background: #f8f9fc; border-radius: 10px; padding: 16px; border: 1px solid #e4e6ee; }
  .kpi-l { font-size: 0.7rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
  .kpi-v { font-size: 1.6rem; font-weight: 800; color: #1a1a2e; }
  table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  th { background: #f0f2f8; padding: 10px 12px; text-align: left; font-size: 0.72rem; text-transform: uppercase; color: #555; letter-spacing: 0.5px; }
  td { padding: 10px 12px; border-bottom: 1px solid #eee; }
  .score-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .score-name { width: 120px; font-size: 0.83rem; color: #444; }
  .score-bar { flex: 1; height: 8px; background: #eee; border-radius: 4px; overflow: hidden; }
  .score-fill { height: 100%; border-radius: 4px; background: #00e5a0; }
  .score-val { width: 36px; font-weight: 700; font-size: 0.83rem; text-align: right; }
  .pill { display: inline-block; background: #f0f2f8; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; margin: 3px; }
  .footer { margin-top: 40px; border-top: 1px solid #eee; padding-top: 16px; font-size: 0.72rem; color: #999; display: flex; justify-content: space-between; }
  @media print { .body { padding: 24px 32px; } }
</style>
</head><body>
<div class="cover">
  <div class="badge">SPEECH ANALYTICS</div>
  <h1>Reporte: ${reportType}</h1>
  <p style="color:#aaa;margin-top:4px;">Archivo: ${analysis.filename} &nbsp;•&nbsp; Fecha: ${analysis.date} &nbsp;•&nbsp; Agente: ${analysis.agent}</p>
</div>
<div class="body">
  <div class="section">
    <h2>Métricas Generales</h2>
    <div class="kpi-grid">
      <div class="kpi"><div class="kpi-l">Satisfacción</div><div class="kpi-v">${analysis.scores.satisfaction}%</div></div>
      <div class="kpi"><div class="kpi-l">Duración</div><div class="kpi-v">${analysis.duration}</div></div>
      <div class="kpi"><div class="kpi-l">Interrupciones</div><div class="kpi-v">${analysis.interruptions}</div></div>
      <div class="kpi"><div class="kpi-l">Silencios</div><div class="kpi-v">${analysis.silences}</div></div>
    </div>
  </div>
  <div class="section">
    <h2>Puntuaciones de Calidad</h2>
    ${Object.entries(analysis.scores).map(([k, v]) => `<div class="score-row"><div class="score-name">${k.charAt(0).toUpperCase()+k.slice(1)}</div><div class="score-bar"><div class="score-fill" style="width:${v}%"></div></div><div class="score-val">${v}</div></div>`).join("")}
  </div>
  <div class="section">
    <h2>Análisis de Sentimiento</h2>
    <table>
      <tr><th>Tipo</th><th>Porcentaje</th></tr>
      <tr><td>✅ Positivo</td><td>${analysis.sentiment.positive}%</td></tr>
      <tr><td>⚪ Neutral</td><td>${analysis.sentiment.neutral}%</td></tr>
      <tr><td>❌ Negativo</td><td>${analysis.sentiment.negative}%</td></tr>
    </table>
  </div>
  <div class="section">
    <h2>Temas Detectados</h2>
    ${analysis.topics.map(t => `<span class="pill">${t}</span>`).join("")}
  </div>
  <div class="section">
    <h2>Palabras Clave</h2>
    ${analysis.keywords.map(k => `<span class="pill">${k}</span>`).join("")}
  </div>
  ${analysis.alerts.length ? `<div class="section"><h2>⚠ Alertas</h2>${analysis.alerts.map(a => `<p style="color:#e53935;font-size:0.85rem;margin:6px 0;">• ${a}</p>`).join("")}</div>` : ""}
  <div class="section">
    <h2>Extracto de Transcripción</h2>
    <table>
      <tr><th>Interlocutor</th><th>Mensaje</th></tr>
      ${analysis.transcript.slice(0, 5).map(m => `<tr><td><strong>${m.speaker}</strong></td><td>${m.text.replace("{agent}", analysis.agent)}</td></tr>`).join("")}
    </table>
  </div>
  <div class="footer">
    <span>Generado por Speech Analytics Platform</span>
    <span>${new Date().toLocaleString("es-MX")}</span>
  </div>
</div>
<script>window.onload=()=>window.print()</script>
</body></html>`;
  win.document.write(html);
  win.document.close();
};

// ─── Report Components ────────────────────────────────────────────────────────
const ReportSentiment = ({ a }) => {
  const total = a.sentiment.positive + a.sentiment.neutral + a.sentiment.negative;
  return (
    <div>
      <div className="donut-wrap">
        <DonutChart data={[a.sentiment.positive, a.sentiment.neutral, a.sentiment.negative]}
          colors={["#00e5a0", "#6c63ff", "#ff6584"]} />
        <div className="donut-legend">
          {[["Positivo", a.sentiment.positive, "#00e5a0"], ["Neutral", a.sentiment.neutral, "#6c63ff"], ["Negativo", a.sentiment.negative, "#ff6584"]].map(([l, v, c]) => (
            <div className="legend-item" key={l}>
              <div className="legend-dot" style={{ background: c }} />
              <span style={{ fontSize: "0.8rem", color: "var(--label)" }}>{l}</span>
              <span className="legend-val">{v}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="sentiment-bar" style={{ marginTop: 16 }}>
        <div className="sentiment-seg" style={{ width: `${a.sentiment.positive}%`, background: "#00e5a0", borderRadius: "6px 0 0 6px" }} />
        <div className="sentiment-seg" style={{ width: `${a.sentiment.neutral}%`, background: "#6c63ff" }} />
        <div className="sentiment-seg" style={{ width: `${a.sentiment.negative}%`, background: "#ff6584", borderRadius: "0 6px 6px 0" }} />
      </div>
    </div>
  );
};

const ReportScores = ({ a }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {Object.entries(a.scores).map(([k, v]) => {
      const colors = { satisfaction: "#00e5a0", clarity: "#6c63ff", empathy: "#ffb84d", resolution: "#00e5a0", compliance: "#ff6584" };
      return (
        <div key={k}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "0.8rem", color: "var(--label)", textTransform: "capitalize" }}>{k === "satisfaction" ? "Satisfacción" : k === "clarity" ? "Claridad" : k === "empathy" ? "Empatía" : k === "resolution" ? "Resolución" : "Cumplimiento"}</span>
            <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.8rem", fontWeight: 600, color: colors[k] }}>{v}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${v}%`, background: colors[k] }} />
          </div>
        </div>
      );
    })}
  </div>
);

const ReportKeywords = ({ a }) => {
  const colors = ["rgba(0,229,160,0.15)", "rgba(108,99,255,0.15)", "rgba(255,184,77,0.15)", "rgba(255,101,132,0.15)"];
  const textColors = ["#00e5a0", "#9c99ff", "#ffb84d", "#ff6584"];
  return (
    <div className="keyword-cloud">
      {a.keywords.map((kw, i) => (
        <span key={kw} className="keyword" style={{ background: colors[i % 4], color: textColors[i % 4], border: `1px solid ${textColors[i % 4]}30` }}>{kw}</span>
      ))}
    </div>
  );
};

const ReportTranscript = ({ a }) => (
  <div style={{ maxHeight: 280, overflowY: "auto" }}>
    {a.transcript.map((m, i) => (
      <div className="transcript-msg" key={i}>
        <div className={`msg-avatar ${m.speaker === "Agente" ? "msg-agent" : "msg-client"}`}>
          {m.speaker === "Agente" ? "AG" : "CL"}
        </div>
        <div>
          <div className="msg-bubble">{m.text.replace("{agent}", a.agent)}</div>
          <div className="msg-meta">{m.speaker} · {i > 0 ? `${i * 23 + 5}s` : "0s"}</div>
        </div>
      </div>
    ))}
  </div>
);

const ReportTalkRatio = ({ a }) => {
  const ag = a.talkRatio.agent;
  const cl = 100 - ag;
  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        {[["Agente", ag, "#6c63ff"], ["Cliente", cl, "#00e5a0"]].map(([l, v, c]) => (
          <div key={l} style={{ flex: 1, textAlign: "center", background: "var(--surface)", borderRadius: 10, padding: "12px 8px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "1.6rem", fontFamily: "Syne,sans-serif", fontWeight: 800, color: c }}>{v}%</div>
            <div style={{ fontSize: "0.75rem", color: "var(--label)" }}>{l}</div>
          </div>
        ))}
      </div>
      <div className="sentiment-bar" style={{ height: 16 }}>
        <div className="sentiment-seg" style={{ width: `${ag}%`, background: "#6c63ff", borderRadius: "6px 0 0 6px" }} />
        <div className="sentiment-seg" style={{ width: `${cl}%`, background: "#00e5a0", borderRadius: "0 6px 6px 0" }} />
      </div>
    </div>
  );
};

const ReportTopics = ({ a }) => {
  const all = ["Facturación", "Soporte técnico", "Cancelación", "Garantía", "Envío", "Descuento", "Otro"];
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Tema</th><th>Detectado</th><th>Relevancia</th></tr></thead>
        <tbody>
          {all.slice(0, 5).map(t => {
            const detected = a.topics.includes(t);
            const rel = detected ? Math.floor(Math.random() * 30 + 60) : Math.floor(Math.random() * 20);
            return (
              <tr key={t}>
                <td>{t}</td>
                <td><span style={{ color: detected ? "#00e5a0" : "#5a6275", fontSize: "0.78rem" }}>{detected ? "✓ Sí" : "— No"}</span></td>
                <td>
                  <div className="progress-bar" style={{ marginTop: 0 }}>
                    <div className="progress-fill" style={{ width: `${rel}%`, background: detected ? "#00e5a0" : "#2a3040" }} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const ReportAlerts = ({ a }) => (
  <div>
    {a.alerts.length === 0 ? (
      <div style={{ textAlign: "center", color: "var(--accent)", padding: "16px 0", fontSize: "0.875rem" }}>
        ✓ Sin alertas detectadas en esta grabación
      </div>
    ) : (
      a.alerts.map((al, i) => (
        <div className="alert alert-info" key={i}>
          <Icon name="alert" size={15} /> {al}
        </div>
      ))
    )}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
      {[["Interrupciones", a.interruptions, "#ffb84d"], ["Silencios largos", a.silences, "#6c63ff"]].map(([l, v, c]) => (
        <div key={l} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--label)", textTransform: "uppercase", marginBottom: 4 }}>{l}</div>
          <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "1.4rem", color: c }}>{v}</div>
        </div>
      ))}
    </div>
  </div>
);

const ReportComparative = ({ a }) => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul"];
  const data = months.map(l => ({ l, v: Math.floor(Math.random() * 20 + 70) }));
  return (
    <div>
      <BarChartSimple data={data} colors={["#6c63ff", "#00e5a0", "#ffb84d", "#ff6584", "#6c63ff", "#00e5a0", "#ffb84d"]} />
      <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--label)", textAlign: "center" }}>Satisfacción promedio mensual</div>
    </div>
  );
};

const ReportCompliance = ({ a }) => {
  const items = [
    ["Saludo de apertura", true],
    ["Verificación de identidad", true],
    ["Lectura de script legal", Math.random() > 0.3],
    ["Ofrecimiento de productos", Math.random() > 0.4],
    ["Cierre correctivo", Math.random() > 0.2],
    ["Encuesta de satisfacción", Math.random() > 0.5],
  ];
  return (
    <div>
      {items.map(([l, v]) => (
        <div key={l} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontSize: "0.83rem" }}>{l}</span>
          <span style={{ color: v ? "#00e5a0" : "#ff6584", fontWeight: 600, fontSize: "0.8rem" }}>{v ? "✓ Cumplido" : "✗ Faltante"}</span>
        </div>
      ))}
    </div>
  );
};

const ReportNPS = ({ a }) => {
  const nps = Math.floor(Math.random() * 40 + 45);
  const color = nps >= 70 ? "#00e5a0" : nps >= 50 ? "#ffb84d" : "#ff6584";
  return (
    <div style={{ textAlign: "center" }}>
      <ScoreRing value={nps} color={color} />
      <div style={{ marginTop: 12, fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "1rem" }}>Score NPS Estimado</div>
      <div style={{ color: "var(--label)", fontSize: "0.8rem", marginTop: 4 }}>
        {nps >= 70 ? "Promotor potencial" : nps >= 50 ? "Pasivo" : "Detractor potencial"}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 16 }}>
        {[["Promotores", "62%", "#00e5a0"], ["Pasivos", "24%", "#ffb84d"], ["Detractores", "14%", "#ff6584"]].map(([l, v, c]) => (
          <div key={l} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 6px" }}>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: c, fontFamily: "Syne,sans-serif" }}>{v}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--label)" }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function SpeechAnalytics() {
  const [page, setPage] = useState("upload");
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analysisMap, setAnalysisMap] = useState({});
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const fileRef = useRef();

  const REPORTS = [
    { id: "sentiment", title: "Análisis de Sentimiento", icon: "trend", comp: ReportSentiment },
    { id: "scores", title: "Puntuaciones de Calidad", icon: "star", comp: ReportScores },
    { id: "keywords", title: "Palabras Clave", icon: "tag", comp: ReportKeywords },
    { id: "transcript", title: "Transcripción", icon: "msg", comp: ReportTranscript },
    { id: "talkratio", title: "Ratio de Conversación", icon: "users", comp: ReportTalkRatio },
    { id: "topics", title: "Temas Detectados", icon: "info", comp: ReportTopics },
    { id: "alerts", title: "Alertas & Riesgos", icon: "alert", comp: ReportAlerts },
    { id: "comparative", title: "Comparativa Histórica", icon: "chart", comp: ReportComparative },
    { id: "compliance", title: "Cumplimiento de Script", icon: "file", comp: ReportCompliance },
    { id: "nps", title: "NPS Estimado", icon: "star", comp: ReportNPS },
  ];

  const processFile = async (file) => {
    const id = Date.now() + Math.random();
    const entry = { id, name: file.name, size: (file.size / 1024).toFixed(1) + " KB", status: "analyzing" };
    setFiles(prev => [...prev, entry]);
    setPage("upload");

    // Simulate AI analysis
    await new Promise(r => setTimeout(r, 2200 + Math.random() * 1200));
    const analysis = generateAnalysis(file.name);
    setAnalysisMap(prev => ({ ...prev, [id]: analysis }));
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "done" } : f));
    setSelected(id);
    setPage("dashboard");
  };

  const handleFiles = (fileList) => {
    Array.from(fileList).forEach(f => {
      if (f.name.endsWith(".ogg") || f.type.includes("audio")) processFile(f);
    });
  };

  const selAnalysis = selected && analysisMap[selected];
  const selFile = files.find(f => f.id === selected);

  const navItems = [
    { id: "upload", label: "Cargar Audio", icon: "upload" },
    { id: "dashboard", label: "Dashboard", icon: "chart" },
    { id: "files", label: "Grabaciones", icon: "mic" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div className="app">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-logo">🎙 Speech<span>AI</span></div>
          <nav className="sidebar-nav">
            <div className="nav-section">Plataforma</div>
            {navItems.map(n => (
              <div key={n.id} className={`nav-item ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
                <Icon name={n.icon} size={15} /> {n.label}
              </div>
            ))}
            <div className="nav-section" style={{ marginTop: 12 }}>Reportes</div>
            {selAnalysis && REPORTS.map((r, i) => (
              <div key={r.id} className={`nav-item ${page === "dashboard" && activeTab === i ? "active" : ""}`}
                onClick={() => { setPage("dashboard"); setActiveTab(i); }} style={{ fontSize: "0.78rem" }}>
                <Icon name={r.icon} size={13} /> {r.title}
              </div>
            ))}
          </nav>
          <div style={{ padding: "0 16px" }}>
            <div style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: "0.72rem", color: "#9c99ff", fontWeight: 600, marginBottom: 4 }}>ARCHIVOS ANALIZADOS</div>
              <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 800, fontSize: "1.4rem", color: "#fff" }}>{files.filter(f => f.status === "done").length}</div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main">
          {/* Topbar */}
          <div className="topbar">
            <div className="topbar-title">
              {page === "upload" && "Cargar Grabaciones"}
              {page === "dashboard" && (selFile ? `📊 ${selFile.name}` : "Dashboard")}
              {page === "files" && "Grabaciones Analizadas"}
            </div>
            <div className="topbar-actions">
              {selAnalysis && <span className="badge">Agente: {selAnalysis.agent}</span>}
              {selAnalysis && <span className="badge" style={{ background: "rgba(255,184,77,0.1)", color: "#ffb84d", borderColor: "rgba(255,184,77,0.2)" }}>⏱ {selAnalysis.duration}</span>}
              {selAnalysis && page === "dashboard" && (
                <button className="btn btn-pdf btn-sm" onClick={() => generatePDF(selAnalysis, REPORTS[activeTab].title)}>
                  <Icon name="pdf" size={13} /> Exportar PDF
                </button>
              )}
            </div>
          </div>

          <div className="content">

            {/* ── Upload Page ── */}
            {page === "upload" && (
              <div>
                <div className="alert alert-info">
                  <Icon name="info" size={15} />
                  Sube archivos de audio en formato <strong>.ogg</strong>. La IA los transcribirá y generará 10 reportes automáticamente.
                </div>

                <div
                  className={`upload-zone ${dragging ? "drag" : ""}`}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
                  onClick={() => fileRef.current.click()}
                >
                  <input ref={fileRef} type="file" accept=".ogg,audio/*" multiple hidden onChange={e => handleFiles(e.target.files)} />
                  <div className="upload-icon"><Icon name="upload" size={24} /></div>
                  <h3>Arrastra tus archivos .ogg aquí</h3>
                  <p>o haz clic para seleccionar desde tu equipo</p>
                  <p style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--muted)" }}>Soporta .ogg · También acepta .mp3, .wav, .m4a</p>
                </div>

                {files.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div className="card-title" style={{ marginBottom: 12 }}><div className="dot" />Archivos ({files.length})</div>
                    {files.map(f => (
                      <div key={f.id} className="file-item" style={{ cursor: f.status === "done" ? "pointer" : "default" }}
                        onClick={() => { if (f.status === "done") { setSelected(f.id); setPage("dashboard"); } }}>
                        <div className="file-icon"><Icon name="mic" size={18} /></div>
                        <div className="file-info">
                          <div className="file-name">{f.name}</div>
                          <div className="file-meta">{f.size}</div>
                          {f.status === "analyzing" && <div className="loading-bar" style={{ marginTop: 6 }} />}
                        </div>
                        <span className={`file-status status-${f.status}`}>
                          {f.status === "pending" ? "En cola" : f.status === "analyzing" ? "Analizando…" : "✓ Listo"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {files.length === 0 && (
                  <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                    {[["🎙", "Transcripción Automática", "Convierte audio a texto con alta precisión"], ["💡", "10 Reportes IA", "Sentimiento, compliance, NPS, keywords y más"], ["📄", "Exporta a PDF", "Descarga reportes listos para enviar a clientes"]].map(([e, t, d]) => (
                      <div className="card" key={t}>
                        <div style={{ fontSize: "1.8rem", marginBottom: 10 }}>{e}</div>
                        <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "0.95rem", marginBottom: 6 }}>{t}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--label)" }}>{d}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Dashboard Page ── */}
            {page === "dashboard" && (
              <>
                {!selAnalysis ? (
                  <div className="empty-state">
                    <h3>No hay análisis disponible</h3>
                    <p>Carga y analiza un archivo de audio primero</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setPage("upload")}>
                      <Icon name="upload" size={14} /> Cargar audio
                    </button>
                  </div>
                ) : (
                  <>
                    {/* KPIs */}
                    <div className="grid-4" style={{ marginBottom: 20 }}>
                      {[
                        { l: "Satisfacción", v: `${selAnalysis.scores.satisfaction}%`, color: "#00e5a0" },
                        { l: "Duración", v: selAnalysis.duration, color: "#6c63ff" },
                        { l: "Interrupciones", v: selAnalysis.interruptions, color: "#ffb84d" },
                        { l: "Alertas", v: selAnalysis.alerts.length, color: selAnalysis.alerts.length > 0 ? "#ff6584" : "#00e5a0" },
                      ].map(k => (
                        <div className="kpi-card" key={k.l} style={{ "--accent-color": k.color }}>
                          <div className="kpi-label">{k.l}</div>
                          <div className="kpi-value" style={{ color: k.color }}>{k.v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tabs */}
                    <div className="tabs">
                      {REPORTS.map((r, i) => (
                        <div key={r.id} className={`tab ${activeTab === i ? "active" : ""}`} onClick={() => setActiveTab(i)}>
                          {r.title}
                        </div>
                      ))}
                    </div>

                    {/* Active Report */}
                    <div className="card">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                        <div className="card-title" style={{ marginBottom: 0 }}>
                          <div className="dot" /> {REPORTS[activeTab].title}
                        </div>
                        <button className="btn btn-pdf btn-sm" onClick={() => generatePDF(selAnalysis, REPORTS[activeTab].title)}>
                          <Icon name="download" size={13} /> PDF
                        </button>
                      </div>
                      {(() => {
                        const Comp = REPORTS[activeTab].comp;
                        return <Comp a={selAnalysis} />;
                      })()}
                    </div>

                    {/* Quick overview grid */}
                    <div className="grid-2" style={{ marginTop: 16 }}>
                      <div className="card">
                        <div className="card-title"><div className="dot" style={{ background: "#6c63ff" }} /> Resumen de Calidad</div>
                        <ReportScores a={selAnalysis} />
                      </div>
                      <div className="card">
                        <div className="card-title"><div className="dot" style={{ background: "#ffb84d" }} /> Sentimiento General</div>
                        <ReportSentiment a={selAnalysis} />
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* ── Files Page ── */}
            {page === "files" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontFamily: "Syne,sans-serif", fontWeight: 700, fontSize: "1rem" }}>Grabaciones ({files.length})</div>
                  <button className="btn btn-primary btn-sm" onClick={() => setPage("upload")}>
                    <Icon name="upload" size={13} /> Subir más
                  </button>
                </div>

                {files.length === 0 ? (
                  <div className="empty-state">
                    <h3>Sin grabaciones aún</h3>
                    <p>Sube archivos .ogg para comenzar el análisis</p>
                    <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setPage("upload")}>
                      <Icon name="upload" size={14} /> Cargar audio
                    </button>
                  </div>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Archivo</th><th>Agente</th><th>Duración</th><th>Satisfacción</th><th>Estado</th><th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map(f => {
                          const a = analysisMap[f.id];
                          return (
                            <tr key={f.id}>
                              <td style={{ fontWeight: 500 }}>{f.name}</td>
                              <td style={{ color: "var(--label)", fontSize: "0.8rem" }}>{a?.agent ?? "—"}</td>
                              <td style={{ fontFamily: "DM Mono,monospace", fontSize: "0.8rem" }}>{a?.duration ?? "—"}</td>
                              <td>
                                {a ? <span style={{ color: "#00e5a0", fontWeight: 600 }}>{a.scores.satisfaction}%</span> : "—"}
                              </td>
                              <td>
                                <span className={`file-status status-${f.status}`}>
                                  {f.status === "pending" ? "En cola" : f.status === "analyzing" ? "Analizando…" : "✓ Listo"}
                                </span>
                              </td>
                              <td>
                                {f.status === "done" && (
                                  <div style={{ display: "flex", gap: 6 }}>
                                    <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(f.id); setPage("dashboard"); }}>Ver</button>
                                    <button className="btn btn-pdf btn-sm" onClick={() => generatePDF(a, "Reporte Completo")}>PDF</button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
