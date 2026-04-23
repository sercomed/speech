import { useState, useEffect, useRef } from "react";
import { supabase, uploadRecording, createRecording, getUserRecordings } from "./lib/supabase";
import AuthScreen from "./components/AuthScreen";

export default function App() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: l } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user ?? null));
    return () => l.subscription.unsubscribe();
  }, []);
  const signIn = (e, p) => supabase.auth.signInWithPassword({ email: e, password: p });
  const signUp = (e, p) => supabase.auth.signUp({ email: e, password: p });
  const signOut = () => supabase.auth.signOut();
  if (!user) return <AuthScreen onSignIn={signIn} onSignUp={signUp} />;
  return <Platform user={user} onSignOut={signOut} />;
}

const GROUP_COLORS = ["#00e5a0","#6c63ff","#ff6584","#ffb84d","#00bfff","#ff8c42","#c084fc","#34d399"];

const S = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--bg:#0a0c10;--surface:#111318;--card:#161a22;--border:#1f2530;--accent:#00e5a0;--accent2:#6c63ff;--accent3:#ff6584;--accent4:#ffb84d;--text:#e8eaf0;--muted:#5a6275;--label:#8892a4}
  body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif}
  .app{display:flex;min-height:100vh}
  .sidebar{width:230px;min-height:100vh;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:fixed;top:0;left:0;z-index:50;padding:0 0 24px 0}
  .logo{padding:22px 20px 18px;border-bottom:1px solid var(--border);font-family:'Syne',sans-serif;font-weight:800;font-size:1.15rem;color:var(--accent)}
  .logo span{color:var(--text)}
  .nav{padding:12px 10px;flex:1;display:flex;flex-direction:column;gap:2px;overflow-y:auto}
  .ns{font-size:0.62rem;font-weight:700;color:var(--muted);letter-spacing:1.5px;text-transform:uppercase;padding:10px 10px 5px}
  .ni{display:flex;align-items:center;gap:9px;padding:8px 12px;border-radius:8px;cursor:pointer;font-size:0.83rem;color:var(--label);transition:all 0.15s;font-weight:500}
  .ni:hover{background:var(--card);color:var(--text)}
  .ni.active{background:rgba(0,229,160,0.12);color:var(--accent)}
  .main{margin-left:230px;flex:1}
  .topbar{background:var(--surface);border-bottom:1px solid var(--border);padding:0 28px;height:58px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:40}
  .topbar-title{font-family:'Syne',sans-serif;font-weight:700;font-size:1rem}
  .ta{display:flex;align-items:center;gap:10px}
  .content{padding:24px 28px}
  .badge{background:rgba(0,229,160,0.15);color:var(--accent);font-size:0.7rem;padding:3px 10px;border-radius:20px;font-family:'DM Mono',monospace;font-weight:500;border:1px solid rgba(0,229,160,0.25)}
  .btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:9px;font-size:0.85rem;font-weight:600;cursor:pointer;border:none;transition:all 0.15s;font-family:'DM Sans',sans-serif}
  .btn-primary{background:var(--accent);color:#0a0c10}.btn-primary:hover{background:#00ffb3}.btn-primary:disabled{opacity:0.4;cursor:not-allowed}
  .btn-ghost{background:var(--card);color:var(--text);border:1px solid var(--border)}.btn-ghost:hover{border-color:var(--accent);color:var(--accent)}
  .btn-sm{padding:6px 13px;font-size:0.78rem}
  .btn-pdf{background:var(--accent3);color:#fff}.btn-pdf:hover{background:#ff4d6d}
  .btn-danger{background:rgba(255,101,132,0.1);color:var(--accent3);border:1px solid rgba(255,101,132,0.2)}
  .btn-icon{background:var(--card);color:var(--label);border:1px solid var(--border);padding:7px 10px;border-radius:8px;cursor:pointer;font-size:0.85rem;transition:all 0.15s}.btn-icon:hover{border-color:var(--accent);color:var(--accent)}
  .card{background:var(--card);border-radius:14px;border:1px solid var(--border);padding:20px 22px}
  .ct{font-family:'Syne',sans-serif;font-weight:700;font-size:0.92rem;margin-bottom:14px;display:flex;align-items:center;gap:8px}
  .dot{width:8px;height:8px;border-radius:50%;background:var(--accent);flex-shrink:0}
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px}
  .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
  .kpi{background:var(--card);border:1px solid var(--border);border-radius:13px;padding:18px;position:relative;overflow:hidden}
  .kpi::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--kc,var(--accent))}
  .kl{font-size:0.72rem;color:var(--label);font-weight:500;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:7px}
  .kv{font-family:'Syne',sans-serif;font-size:1.8rem;font-weight:800;line-height:1}
  .upload-zone{border:2px dashed var(--border);border-radius:14px;padding:40px 28px;text-align:center;cursor:pointer;transition:all 0.2s;background:linear-gradient(135deg,rgba(108,99,255,0.04),rgba(0,229,160,0.04))}
  .upload-zone:hover,.upload-zone.drag{border-color:var(--accent);background:rgba(0,229,160,0.05)}
  .upload-zone h3{font-family:'Syne',sans-serif;font-size:1.05rem;font-weight:700;margin:10px 0 5px}
  .upload-zone p{color:var(--label);font-size:0.82rem}
  .fi{display:flex;align-items:center;gap:11px;padding:11px 15px;background:var(--card);border-radius:9px;margin-bottom:7px;border:1px solid var(--border);cursor:pointer;transition:border-color 0.2s}
  .fi:hover{border-color:rgba(0,229,160,0.3)}
  .fn{font-size:0.85rem;font-weight:500}
  .fm{font-size:0.73rem;color:var(--label);font-family:'DM Mono',monospace}
  .fs{font-size:0.7rem;padding:3px 9px;border-radius:20px;font-weight:600;font-family:'DM Mono',monospace;white-space:nowrap}
  .sp{background:rgba(255,184,77,0.15);color:var(--accent4)}
  .sr{background:rgba(108,99,255,0.15);color:var(--accent2);animation:pulse 1.5s infinite}
  .sd{background:rgba(0,229,160,0.15);color:var(--accent)}
  .se{background:rgba(255,101,132,0.15);color:var(--accent3)}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
  .lb{height:3px;background:linear-gradient(90deg,var(--accent2),var(--accent),var(--accent2));background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:2px;margin-top:5px}
  @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  .tabs{display:flex;gap:3px;background:var(--surface);padding:4px;border-radius:9px;border:1px solid var(--border);margin-bottom:18px;flex-wrap:wrap}
  .tab{padding:6px 13px;border-radius:7px;cursor:pointer;font-size:0.78rem;font-weight:500;color:var(--label);transition:all 0.15s}
  .tab.active{background:var(--card);color:var(--text)}
  .pb{height:6px;background:var(--border);border-radius:3px;overflow:hidden;margin-top:4px}
  .pf{height:100%;border-radius:3px;transition:width 0.4s}
  .sb{height:12px;border-radius:6px;overflow:hidden;display:flex;margin:8px 0}
  .tm{display:flex;gap:9px;margin-bottom:12px}
  .ma{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.68rem;font-weight:700;flex-shrink:0;margin-top:2px}
  .ag{background:rgba(108,99,255,0.2);color:var(--accent2)}
  .cl{background:rgba(0,229,160,0.15);color:var(--accent)}
  .mb{flex:1;background:var(--surface);padding:9px 13px;border-radius:0 11px 11px 11px;font-size:0.81rem;line-height:1.55;border:1px solid var(--border)}
  .mt{font-size:0.68rem;color:var(--muted);margin-top:3px;font-family:'DM Mono',monospace}
  .kc{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
  .kw{padding:4px 11px;border-radius:20px;font-size:0.75rem;font-weight:500;font-family:'DM Mono',monospace}
  .ai{padding:10px 13px;border-radius:9px;font-size:0.81rem;margin-bottom:7px;background:rgba(255,184,77,0.08);border:1px solid rgba(255,184,77,0.2);color:var(--accent4)}
  table{width:100%;border-collapse:collapse;font-size:0.81rem}
  th{text-align:left;padding:8px 11px;font-size:0.68rem;color:var(--label);font-weight:600;text-transform:uppercase;letter-spacing:0.8px;border-bottom:1px solid var(--border)}
  td{padding:9px 11px;border-bottom:1px solid rgba(31,37,48,0.6)}
  tr:last-child td{border-bottom:none}
  tr:hover td{background:rgba(255,255,255,0.015)}
  .es{text-align:center;padding:44px 24px;color:var(--muted)}
  .es h3{font-family:'Syne',sans-serif;font-size:0.95rem;color:var(--label);margin-bottom:5px}
  .dw{display:flex;align-items:center;gap:18px}
  .dl{flex:1;display:flex;flex-direction:column;gap:7px}
  .li{display:flex;align-items:center;gap:7px;font-size:0.78rem}
  .ld{width:9px;height:9px;border-radius:50%;flex-shrink:0}
  .lv{margin-left:auto;font-family:'DM Mono',monospace;font-weight:500}
  .sr2{position:relative}
  .sc{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
  .sn{font-family:'Syne',sans-serif;font-weight:800;font-size:1.1rem;line-height:1}
  .ss{font-size:0.58rem;color:var(--label)}
  ::-webkit-scrollbar{width:4px;height:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:100;display:flex;align-items:center;justify-content:center;padding:24px}
  .modal{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:28px;width:100%;max-width:440px}
  .modal h3{font-family:'Syne',sans-serif;font-weight:700;font-size:1.1rem;margin-bottom:20px}
  .field{margin-bottom:14px}
  .field label{display:block;font-size:0.75rem;color:var(--label);font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px}
  .field input,.field textarea,.field select{width:100%;background:var(--surface);border:1px solid var(--border);border-radius:9px;padding:9px 13px;color:var(--text);font-size:0.875rem;outline:none;font-family:'DM Sans',sans-serif}
  .field input:focus,.field select:focus{border-color:var(--accent)}
  .group-card{background:var(--card);border:1px solid var(--border);border-radius:13px;padding:18px;cursor:pointer;transition:all 0.15s;position:relative;overflow:hidden}
  .group-card::before{content:'';position:absolute;top:0;left:0;bottom:0;width:3px;background:var(--gc,var(--accent))}
  .group-card:hover{border-color:rgba(0,229,160,0.3);transform:translateY(-1px)}
  .group-name{font-family:'Syne',sans-serif;font-weight:700;font-size:0.95rem;margin-bottom:4px}
  .group-meta{font-size:0.75rem;color:var(--label)}
  .face-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;flex:1}
  .face-label{font-size:0.68rem;color:var(--label);text-transform:uppercase;letter-spacing:0.5px;margin-top:5px}
  .face-pct{font-family:'Syne',sans-serif;font-weight:800;font-size:1.25rem;margin:2px 0}
  .face-count{font-size:0.7rem;color:var(--muted);font-family:'DM Mono',monospace}
  .reason-bar{display:flex;align-items:center;gap:10px;margin-bottom:10px}
  .reason-name{font-size:0.79rem;width:155px;flex-shrink:0;color:var(--label)}
  .color-dot{width:14px;height:14px;border-radius:50%;border:2px solid var(--border);cursor:pointer;transition:transform 0.15s}.color-dot:hover{transform:scale(1.2)}.color-dot.selected{border-color:white;transform:scale(1.15)}
`;

const DonutChart = ({ data, colors, size = 88 }) => {
  const total = data.reduce((a, b) => a + b, 0);
  if (!total) return <div style={{ width: size, height: size, background: "var(--border)", borderRadius: "50%" }} />;
  let acc = 0;
  const segs = data.map((v, i) => {
    const pct = v / total; const s = acc; acc += pct;
    const r = 32, cx = 45, cy = 45;
    const a1 = s * 2 * Math.PI - Math.PI / 2, a2 = acc * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const ri = 20;
    return <path key={i} d={`M${x1},${y1} A${r},${r} 0 ${pct>0.5?1:0},1 ${x2},${y2} L${cx+ri*Math.cos(a2)},${cy+ri*Math.sin(a2)} A${ri},${ri} 0 ${pct>0.5?1:0},0 ${cx+ri*Math.cos(a1)},${cy+ri*Math.sin(a1)} Z`} fill={colors[i]} opacity="0.9" />;
  });
  return <svg width={size} height={size} viewBox="0 0 90 90">{segs}</svg>;
};

const ScoreRing = ({ value, color = "#00e5a0" }) => {
  const r = 34, cx = 40, cy = 40, circ = 2 * Math.PI * r, fill = ((value||0)/100)*circ;
  return (
    <div className="sr2" style={{ width: 80, height: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7"/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${fill} ${circ-fill}`} strokeLinecap="round"
          style={{transform:"rotate(-90deg)",transformOrigin:"center"}}/>
      </svg>
      <div className="sc"><span className="sn" style={{color}}>{value||0}</span><span className="ss">/100</span></div>
    </div>
  );
};

const SentimentFaces = ({ pos, neu, neg, total }) => {
  const sum = pos + neu + neg;
  const avg = sum > 0 ? ((pos*3 + neu*2 + neg*1)/sum).toFixed(1) : "—";
  return (
    <div>
      <div style={{ display: "flex", gap: 10 }}>
        {[["😔", neg, "#ff6584","Negativo"],["😐",neu,"#ffb84d","Neutral"],["😊",pos,"#00e5a0","Positivo"]].map(([face,val,color,label])=>(
          <div className="face-card" key={label} style={{borderColor:color+"33"}}>
            <div style={{fontSize:"1.8rem",lineHeight:1}}>{face}</div>
            <div className="face-pct" style={{color}}>{val}%</div>
            {total && <div className="face-count">{Math.round(total*val/100)} llamadas</div>}
            <div className="face-label">{label}</div>
          </div>
        ))}
        <div className="face-card" style={{background:"rgba(0,229,160,0.05)",borderColor:"rgba(0,229,160,0.15)"}}>
          <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.7rem",color:"var(--accent)",lineHeight:1,marginTop:6}}>{avg}</div>
          <div style={{fontSize:"0.68rem",color:"var(--muted)",marginTop:2}}>/3.0</div>
          <div className="face-label">Media</div>
        </div>
      </div>
      <div className="sb" style={{marginTop:12}}>
        <div style={{width:`${neg}%`,background:"#ff6584",height:"100%"}}/>
        <div style={{width:`${neu}%`,background:"#ffb84d",height:"100%"}}/>
        <div style={{width:`${pos}%`,background:"#00e5a0",height:"100%"}}/>
      </div>
    </div>
  );
};

const generatePDF = (a, title) => {
  const win = window.open("","_blank");
  const s=a.scores||{},sent=a.sentiment||{},sa=a.sentimentAgent||{},sc2=a.sentimentClient||{},tr=a.transcript||[];
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>body{font-family:Arial,sans-serif;color:#1a1a2e;margin:0}.cover{background:linear-gradient(135deg,#0d1117,#1a2035);color:#fff;padding:50px 44px}.cover h1{font-size:1.8rem;font-weight:900;margin:0 0 8px}.body{padding:28px 44px}h2{font-size:1rem;font-weight:700;border-left:4px solid #00e5a0;padding-left:10px;margin:22px 0 14px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:18px}.kpi{background:#f8f9fc;border-radius:10px;padding:14px;border:1px solid #e4e6ee}.kl{font-size:.68rem;color:#888;text-transform:uppercase;margin-bottom:5px}.kv{font-size:1.5rem;font-weight:800}.br{display:flex;align-items:center;gap:10px;margin-bottom:9px}.bn{width:120px;font-size:.8rem;color:#444}.bb{flex:1;height:7px;background:#eee;border-radius:4px;overflow:hidden}.bf{height:100%;border-radius:4px;background:#00e5a0}.bv{width:32px;font-weight:700;font-size:.8rem;text-align:right}.frow{display:flex;gap:8px;margin:10px 0}.fbox{flex:1;background:#f8f9fc;border-radius:8px;padding:10px;text-align:center;border:1px solid #eee}.femoji{font-size:1.4rem}.fpct{font-size:1.1rem;font-weight:800;margin:3px 0}.flbl{font-size:.62rem;color:#888;text-transform:uppercase}table{width:100%;border-collapse:collapse;font-size:.82rem}th{background:#f0f2f8;padding:9px 11px;text-align:left;font-size:.68rem;text-transform:uppercase;color:#555}td{padding:9px 11px;border-bottom:1px solid #eee}.pill{display:inline-block;background:#f0f2f8;padding:3px 9px;border-radius:11px;font-size:.72rem;margin:2px}.footer{margin-top:36px;border-top:1px solid #eee;padding-top:14px;font-size:.7rem;color:#999;display:flex;justify-content:space-between}</style></head>
  <body><div class="cover"><h1>🎙 ${title}</h1><p style="opacity:.65">Archivo: ${a.filename} · Agente: ${a.agent} · ${a.date}</p></div>
  <div class="body">
  <h2>Métricas Generales</h2><div class="grid">
  <div class="kpi"><div class="kl">Satisfacción</div><div class="kv">${s.Satisfacción||0}%</div></div>
  <div class="kpi"><div class="kl">Duración</div><div class="kv">${a.duration}</div></div>
  <div class="kpi"><div class="kl">NPS</div><div class="kv">${a.nps||0}</div></div>
  <div class="kpi"><div class="kl">Alertas</div><div class="kv">${(a.alerts||[]).length}</div></div></div>
  <h2>Calidad</h2>${Object.entries(s).map(([k,v])=>`<div class="br"><div class="bn">${k}</div><div class="bb"><div class="bf" style="width:${v}%"></div></div><div class="bv">${v}</div></div>`).join("")}
  <h2>Sentimiento Agente</h2><div class="frow">
  <div class="fbox"><div class="femoji">😔</div><div class="fpct" style="color:#ff6584">${sa.negative||0}%</div><div class="flbl">Negativo</div></div>
  <div class="fbox"><div class="femoji">😐</div><div class="fpct" style="color:#ffb84d">${sa.neutral||0}%</div><div class="flbl">Neutral</div></div>
  <div class="fbox"><div class="femoji">😊</div><div class="fpct" style="color:#00e5a0">${sa.positive||0}%</div><div class="flbl">Positivo</div></div></div>
  <h2>Sentimiento Cliente</h2><div class="frow">
  <div class="fbox"><div class="femoji">😔</div><div class="fpct" style="color:#ff6584">${sc2.negative||0}%</div><div class="flbl">Negativo</div></div>
  <div class="fbox"><div class="femoji">😐</div><div class="fpct" style="color:#ffb84d">${sc2.neutral||0}%</div><div class="flbl">Neutral</div></div>
  <div class="fbox"><div class="femoji">😊</div><div class="fpct" style="color:#00e5a0">${sc2.positive||0}%</div><div class="flbl">Positivo</div></div></div>
  ${a.callReason?`<h2>Motivo</h2><p style="font-size:.85rem">${a.callReason} <span style="color:#888">(${a.callReasonCategory})</span></p>`:""}
  <h2>Keywords</h2>${(a.keywords||[]).map(k=>`<span class="pill">${k}</span>`).join("")}
  ${(a.alerts||[]).length?`<h2>Alertas</h2>${a.alerts.map(al=>`<p style="color:#e53935;margin:5px 0">• ${al}</p>`).join("")}`:""}
  <h2>Transcripción</h2><table><tr><th>Interlocutor</th><th>Texto</th></tr>${tr.slice(0,12).map(m=>`<tr><td><strong>${m.speaker}</strong></td><td>${m.text}</td></tr>`).join("")}</table>
  <div class="footer"><span>Speech Analytics — Sercomed</span><span>${new Date().toLocaleString("es-CL")}</span></div>
  </div><script>window.onload=()=>window.print()</script></body></html>`);
  win.document.close();
};

const getGroups = async (userId) => {
  const { data } = await supabase.from("groups").select("*").eq("user_id",userId).order("created_at",{ascending:false});
  return data||[];
};
const createGroup = async (userId,name,description,color) => {
  const {data,error} = await supabase.from("groups").insert({user_id:userId,name,description,color}).select().single();
  if(error) throw error; return data;
};
const assignGroup = async (recordingId,groupId) => {
  await supabase.from("recordings").update({group_id:groupId}).eq("id",recordingId);
};

function Platform({ user, onSignOut }) {
  const [page,setPage] = useState("upload");
  const [recordings,setRecordings] = useState([]);
  const [groups,setGroups] = useState([]);
  const [selected,setSelected] = useState(null);
  const [selectedGroup,setSelectedGroup] = useState(null);
  const [dragging,setDragging] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [activeTab,setActiveTab] = useState(0);
  const [error,setError] = useState("");
  const [showGroupModal,setShowGroupModal] = useState(false);
  const [showAssignModal,setShowAssignModal] = useState(null);
  const [uploadGroup,setUploadGroup] = useState("");
  const fileRef = useRef();
  const TABS = ["Sentimiento","Puntuaciones","Keywords","Transcripción","Ratio Conversación","Temas","Alertas","Cumplimiento","NPS"];

  useEffect(()=>{loadAll();},[]);
  const loadAll = async () => {
    const [recs,grps] = await Promise.all([getUserRecordings(user.id),getGroups(user.id)]);
    setRecordings(recs||[]); setGroups(grps||[]);
  };

  const buildAnalysis = (rec) => {
    if(!rec.analysis) return null;
    const a = rec.analysis;
    return {
      filename:rec.filename,
      duration:rec.duration_sec?`${Math.floor(rec.duration_sec/60)}:${String(rec.duration_sec%60).padStart(2,"0")}`:"—",
      agent:rec.agent_name||"Agente",
      date:new Date(rec.created_at).toLocaleDateString("es-CL"),
      scores:{Satisfacción:a.score_satisfaction||0,Claridad:a.score_clarity||0,Empatía:a.score_empathy||0,Resolución:a.score_resolution||0,Cumplimiento:a.score_compliance||0},
      sentiment:{positive:Number(a.sentiment_pos)||0,neutral:Number(a.sentiment_neu)||0,negative:Number(a.sentiment_neg)||0},
      sentimentAgent:{positive:Number(a.sentiment_agent_pos)||0,neutral:Number(a.sentiment_agent_neu)||0,negative:Number(a.sentiment_agent_neg)||0},
      sentimentClient:{positive:Number(a.sentiment_client_pos)||0,neutral:Number(a.sentiment_client_neu)||0,negative:Number(a.sentiment_client_neg)||0},
      topics:a.topics||[],keywords:a.keywords||[],transcript:a.transcript||[],
      alerts:a.alerts||[],interruptions:a.interruptions||0,silences:a.long_silences||0,
      talkRatio:{agent:Number(a.talk_ratio_agent)||50},
      nps:a.nps_score||0,complianceItems:a.compliance_items||{},
      callReason:a.call_reason||"",callReasonCategory:a.call_reason_category||"",
    };
  };

  const buildGroupStats = (groupId) => {
    const recs = recordings.filter(r=>r.group_id===groupId&&r.status==="done"&&r.analysis);
    if(!recs.length) return null;
    const avg = (fn) => Math.round(recs.reduce((s,r)=>s+(fn(r.analysis)||0),0)/recs.length);
    const reasons = {};
    recs.forEach(r=>{const cat=r.analysis.call_reason_category||"Otro";reasons[cat]=(reasons[cat]||0)+1;});
    const durations = recs.map(r=>r.duration_sec||0).sort((a,b)=>a-b);
    return {
      total:recs.length,
      avgSatisfaction:avg(a=>a.score_satisfaction),avgNps:avg(a=>a.nps_score),
      avgDuration:Math.round(recs.reduce((s,r)=>s+(r.duration_sec||0),0)/recs.length),
      avgInterruptions:avg(a=>a.interruptions),avgSilences:avg(a=>a.long_silences),
      agentSentiment:{positive:avg(a=>a.sentiment_agent_pos),neutral:avg(a=>a.sentiment_agent_neu),negative:avg(a=>a.sentiment_agent_neg)},
      clientSentiment:{positive:avg(a=>a.sentiment_client_pos),neutral:avg(a=>a.sentiment_client_neu),negative:avg(a=>a.sentiment_client_neg)},
      reasons:Object.entries(reasons).sort((a,b)=>b[1]-a[1]),durations,
      scores:{Satisfacción:avg(a=>a.score_satisfaction),Claridad:avg(a=>a.score_clarity),Empatía:avg(a=>a.score_empathy),Resolución:avg(a=>a.score_resolution),Cumplimiento:avg(a=>a.score_compliance)},
    };
  };

  const selRec = recordings.find(r=>r.id===selected);
  const selAnalysis = selRec ? buildAnalysis(selRec) : null;
  const selGroup = groups.find(g=>g.id===selectedGroup);
  const groupStats = selectedGroup ? buildGroupStats(selectedGroup) : null;

  const handleUpload = async (file) => {
    if(uploading) return;
    setError(""); setUploading(true);
    try {
      const storagePath = await uploadRecording(file,user.id);
      const rec = await createRecording({userId:user.id,filename:file.name,storagePath});
      if(uploadGroup) await assignGroup(rec.id,uploadGroup);
      setRecordings(prev=>[{...rec,analysis:null,group_id:uploadGroup||null},...prev]);
      const {error:fnErr} = await supabase.functions.invoke("process-audio",{body:{recording_id:rec.id}});
      if(fnErr) setError("Error al procesar: "+fnErr.message);
      const channel = supabase.channel(`rec-${rec.id}`)
        .on("postgres_changes",{event:"UPDATE",schema:"public",table:"recordings",filter:`id=eq.${rec.id}`},(payload)=>{
          setRecordings(prev=>prev.map(r=>r.id===rec.id?{...r,...payload.new}:r));
          if(payload.new.status==="done"){loadAll();supabase.removeChannel(channel);}
        }).subscribe();
    } catch(e){setError("Error: "+e.message);}
    finally{setUploading(false);}
  };

  const handleFiles = (list) => Array.from(list).forEach(f=>handleUpload(f));
  const sl = s=>({pending:"En cola",processing:"Analizando…",done:"✓ Listo",error:"Error"}[s]||s);
  const sc = s=>({pending:"sp",processing:"sr",done:"sd",error:"se"}[s]||"");

  return (
    <>
      <style dangerouslySetInnerHTML={{__html:S}}/>
      {showGroupModal&&<GroupModal onClose={()=>setShowGroupModal(false)} onCreate={async(n,d,c)=>{await createGroup(user.id,n,d,c);loadAll();setShowGroupModal(false);}}/>}
      {showAssignModal&&<AssignModal groups={groups} onClose={()=>setShowAssignModal(null)} onAssign={async(gid)=>{await assignGroup(showAssignModal,gid);loadAll();setShowAssignModal(null);}}/>}
      <div className="app">
        <aside className="sidebar">
          <div className="logo">🎙 Speech<span>AI</span></div>
          <nav className="nav">
            <div className="ns">Plataforma</div>
            {[["upload","📤","Cargar Audio"],["files","🎙","Grabaciones"],["groups","📁","Grupos"],...(selAnalysis?[["dashboard","📊","Dashboard"]]:[])]
              .map(([id,icon,label])=>(
                <div key={id} className={`ni ${page===id?"active":""}`} onClick={()=>setPage(id)}>{icon} {label}</div>
              ))}
            {groups.length>0&&<><div className="ns">Mis Grupos</div>
              {groups.map(g=>(
                <div key={g.id} className={`ni ${page==="group-detail"&&selectedGroup===g.id?"active":""}`}
                  onClick={()=>{setSelectedGroup(g.id);setPage("group-detail");}}>
                  <span style={{width:8,height:8,borderRadius:"50%",background:g.color,display:"inline-block",flexShrink:0}}/>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.name}</span>
                </div>
              ))}</>}
            {selAnalysis&&<><div className="ns">Reportes</div>
              {TABS.map((r,i)=>(
                <div key={r} className={`ni ${page==="dashboard"&&activeTab===i?"active":""}`} style={{fontSize:"0.76rem"}}
                  onClick={()=>{setPage("dashboard");setActiveTab(i);}}>{r}</div>
              ))}</>}
          </nav>
          <div style={{padding:"0 14px"}}>
            <button className="btn btn-danger btn-sm" style={{width:"100%"}} onClick={onSignOut}>Cerrar sesión</button>
          </div>
        </aside>

        <main className="main">
          <div className="topbar">
            <div className="topbar-title">
              {page==="upload"&&"Cargar Grabaciones"}
              {page==="dashboard"&&selRec&&`📊 ${selRec.filename}`}
              {page==="files"&&"Grabaciones"}
              {page==="groups"&&"Grupos de Llamadas"}
              {page==="group-detail"&&selGroup&&`📁 ${selGroup.name}`}
            </div>
            <div className="ta">
              {selAnalysis&&page==="dashboard"&&<><span className="badge">{selAnalysis.agent}</span><span className="badge" style={{background:"rgba(255,184,77,0.1)",color:"#ffb84d",borderColor:"rgba(255,184,77,0.2)"}}>{selAnalysis.duration}</span><button className="btn btn-pdf btn-sm" onClick={()=>generatePDF(selAnalysis,TABS[activeTab])}>📄 PDF</button></>}
              {page==="groups"&&<button className="btn btn-primary btn-sm" onClick={()=>setShowGroupModal(true)}>+ Nuevo grupo</button>}
              {page==="group-detail"&&groupStats&&<><span className="badge">{groupStats.total} llamadas</span></>}
              <span style={{fontSize:"0.78rem",color:"var(--muted)"}}>{user.email}</span>
            </div>
          </div>

          <div className="content">
            {error&&<div style={{background:"rgba(255,101,132,0.1)",border:"1px solid rgba(255,101,132,0.3)",color:"#ff6584",padding:"10px 15px",borderRadius:9,marginBottom:14,fontSize:"0.81rem"}}>{error}</div>}

            {page==="upload"&&(
              <div>
                {groups.length>0&&<div className="field" style={{marginBottom:16}}><label>Asignar a grupo (opcional)</label><select value={uploadGroup} onChange={e=>setUploadGroup(e.target.value)}><option value="">Sin grupo</option>{groups.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></div>}
                <div className={`upload-zone ${dragging?"drag":""}`} onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);handleFiles(e.dataTransfer.files);}} onClick={()=>fileRef.current.click()}>
                  <input ref={fileRef} type="file" accept=".ogg,audio/*" multiple hidden onChange={e=>handleFiles(e.target.files)}/>
                  <div style={{fontSize:"2rem",marginBottom:6}}>📤</div>
                  <h3>{uploading?"Procesando con Whisper + GPT-4o…":"Arrastra tus archivos de audio aquí"}</h3>
                  <p>{uploading?"Esto puede tomar 30-60 segundos":"Acepta .ogg · .mp3 · .wav · .m4a"}</p>
                  {uploading&&<div className="lb" style={{marginTop:14,maxWidth:280,margin:"14px auto 0"}}/>}
                </div>
                {recordings.length>0&&<div style={{marginTop:20}}><div className="ct"><div className="dot"/>Recientes</div>{recordings.slice(0,6).map(r=>(
                  <div key={r.id} className="fi" onClick={()=>{if(r.status==="done"){setSelected(r.id);setPage("dashboard");}}}>
                    <span>🎙</span><div style={{flex:1}}><div className="fn">{r.filename}</div><div className="fm">{new Date(r.created_at).toLocaleString("es-CL")}</div>{r.status==="processing"&&<div className="lb"/>}</div>
                    <span className={`fs ${sc(r.status)}`}>{sl(r.status)}</span>
                  </div>
                ))}</div>}
              </div>
            )}

            {page==="files"&&(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:700}}>Grabaciones ({recordings.length})</div>
                  <button className="btn btn-primary btn-sm" onClick={()=>setPage("upload")}>📤 Subir más</button>
                </div>
                {recordings.length===0?<div className="es"><h3>Sin grabaciones</h3></div>:
                  <table><thead><tr><th>Archivo</th><th>Grupo</th><th>Agente</th><th>Duración</th><th>Satisfacción</th><th>Motivo</th><th>Fecha</th><th>Estado</th><th></th></tr></thead>
                  <tbody>{recordings.map(r=>{
                    const a=r.analysis; const g=groups.find(x=>x.id===r.group_id);
                    return <tr key={r.id}>
                      <td style={{fontWeight:500,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.filename}</td>
                      <td>{g?<span style={{background:g.color+"25",color:g.color,padding:"2px 8px",borderRadius:12,fontSize:"0.7rem",fontWeight:600}}>{g.name}</span>:<span style={{color:"var(--muted)",fontSize:"0.75rem"}}>—</span>}</td>
                      <td style={{color:"var(--label)",fontSize:"0.78rem"}}>{r.agent_name||"—"}</td>
                      <td style={{fontFamily:"DM Mono,monospace",fontSize:"0.78rem"}}>{r.duration_sec?`${Math.floor(r.duration_sec/60)}:${String(r.duration_sec%60).padStart(2,"0")}`:"—"}</td>
                      <td>{a?<span style={{color:"#00e5a0",fontWeight:600}}>{a.score_satisfaction}%</span>:"—"}</td>
                      <td style={{fontSize:"0.75rem",color:"var(--label)"}}>{a?.call_reason_category||"—"}</td>
                      <td style={{fontSize:"0.75rem",color:"var(--label)"}}>{new Date(r.created_at).toLocaleDateString("es-CL")}</td>
                      <td><span className={`fs ${sc(r.status)}`}>{sl(r.status)}</span></td>
                      <td><div style={{display:"flex",gap:5}}>
                        {r.status==="done"&&<><button className="btn btn-ghost btn-sm" onClick={()=>{setSelected(r.id);setPage("dashboard");}}>Ver</button>
                        <button className="btn-icon" onClick={()=>setShowAssignModal(r.id)} title="Asignar grupo">📁</button>
                        <button className="btn btn-pdf btn-sm" onClick={()=>generatePDF(buildAnalysis(r),"Reporte")}>PDF</button></>}
                      </div></td>
                    </tr>;
                  })}</tbody></table>}
              </div>
            )}

            {page==="groups"&&(
              <div>
                <div style={{marginBottom:18,color:"var(--label)",fontSize:"0.83rem"}}>Organiza tus grabaciones por servicio, campaña o cliente.</div>
                {groups.length===0?<div className="es"><h3>Sin grupos</h3><p>Crea tu primer grupo</p><button className="btn btn-primary" style={{marginTop:16}} onClick={()=>setShowGroupModal(true)}>+ Crear grupo</button></div>:
                  <div className="g3">
                    {groups.map(g=>{
                      const count=recordings.filter(r=>r.group_id===g.id).length;
                      const stats=buildGroupStats(g.id);
                      return <div key={g.id} className="group-card" style={{"--gc":g.color}} onClick={()=>{setSelectedGroup(g.id);setPage("group-detail");}}>
                        <div className="group-name">{g.name}</div>
                        {g.description&&<div className="group-meta">{g.description}</div>}
                        <div style={{display:"flex",gap:10,marginTop:12}}>
                          <div style={{flex:1,background:"var(--surface)",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                            <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.3rem",color:g.color}}>{count}</div>
                            <div style={{fontSize:"0.68rem",color:"var(--muted)"}}>llamadas</div>
                          </div>
                          {stats&&<div style={{flex:1,background:"var(--surface)",borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
                            <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.3rem",color:"#00e5a0"}}>{stats.avgSatisfaction}%</div>
                            <div style={{fontSize:"0.68rem",color:"var(--muted)"}}>satisfacción</div>
                          </div>}
                        </div>
                      </div>;
                    })}
                    <div className="group-card" style={{"--gc":"var(--border)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",border:"2px dashed var(--border)",background:"transparent"}} onClick={()=>setShowGroupModal(true)}>
                      <div style={{textAlign:"center",color:"var(--muted)"}}><div style={{fontSize:"1.8rem",marginBottom:6}}>+</div><div style={{fontSize:"0.83rem"}}>Nuevo grupo</div></div>
                    </div>
                  </div>}
              </div>
            )}

            {page==="group-detail"&&selGroup&&(
              <div>
                {!groupStats?<div className="es"><h3>Sin grabaciones analizadas en este grupo</h3><button className="btn btn-primary" style={{marginTop:16}} onClick={()=>setPage("upload")}>📤 Subir audio</button></div>:
                  <>
                    <div className="g4" style={{marginBottom:18}}>
                      {[{l:"Total llamadas",v:groupStats.total,c:selGroup.color},{l:"Satisfacción prom.",v:`${groupStats.avgSatisfaction}%`,c:"#00e5a0"},{l:"NPS promedio",v:groupStats.avgNps,c:"#ffb84d"},{l:"Duración prom.",v:`${Math.floor(groupStats.avgDuration/60)}:${String(groupStats.avgDuration%60).padStart(2,"0")}`,c:"#6c63ff"}]
                        .map(k=><div className="kpi" key={k.l} style={{"--kc":k.c}}><div className="kl">{k.l}</div><div className="kv" style={{color:k.c}}>{k.v}</div></div>)}
                    </div>
                    <div className="g2" style={{marginBottom:16}}>
                      <div className="card"><div className="ct"><div className="dot" style={{background:"#6c63ff"}}/>Sentimiento Agente</div><SentimentFaces pos={groupStats.agentSentiment.positive} neu={groupStats.agentSentiment.neutral} neg={groupStats.agentSentiment.negative} total={groupStats.total}/></div>
                      <div className="card"><div className="ct"><div className="dot" style={{background:"#ffb84d"}}/>Sentimiento Cliente</div><SentimentFaces pos={groupStats.clientSentiment.positive} neu={groupStats.clientSentiment.neutral} neg={groupStats.clientSentiment.negative} total={groupStats.total}/></div>
                    </div>
                    <div className="g2" style={{marginBottom:16}}>
                      <div className="card"><div className="ct"><div className="dot" style={{background:"#ff6584"}}/>Motivos de Llamada</div>
                        {groupStats.reasons.map(([cat,count])=>(
                          <div className="reason-bar" key={cat}>
                            <div className="reason-name">{cat}</div>
                            <div style={{flex:1,background:"var(--border)",borderRadius:4,height:8,overflow:"hidden"}}><div style={{width:`${(count/groupStats.total)*100}%`,background:selGroup.color,height:"100%",borderRadius:4}}/></div>
                            <div style={{fontSize:"0.75rem",fontFamily:"DM Mono,monospace",minWidth:20,textAlign:"right"}}>{count}</div>
                          </div>
                        ))}
                      </div>
                      <div className="card"><div className="ct"><div className="dot"/>Calidad Promedio</div>
                        {Object.entries(groupStats.scores).map(([k,v])=>{
                          const c={Satisfacción:"#00e5a0",Claridad:"#6c63ff",Empatía:"#ffb84d",Resolución:"#00e5a0",Cumplimiento:"#ff6584"}[k];
                          return <div key={k} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:"0.8rem",color:"var(--label)"}}>{k}</span><span style={{fontFamily:"DM Mono,monospace",fontSize:"0.8rem",fontWeight:600,color:c}}>{v}</span></div><div className="pb"><div className="pf" style={{width:`${v}%`,background:c}}/></div></div>;
                        })}
                      </div>
                    </div>
                    <div className="g2" style={{marginBottom:16}}>
                      <div className="card"><div className="ct"><div className="dot" style={{background:"#6c63ff"}}/>Distribución Duración</div>
                        <div style={{display:"flex",alignItems:"flex-end",gap:4,height:80,marginTop:8}}>
                          {(()=>{const b=[0,0,0,0,0,0,0];groupStats.durations.forEach(d=>{b[Math.min(6,Math.floor(d/60))]++;});const mx=Math.max(...b,1);return b.map((v,i)=><div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}><div style={{width:"100%",background:"#6c63ff",borderRadius:"3px 3px 0 0",height:`${(v/mx)*68}px`,minHeight:v?4:0,opacity:0.8}}/><span style={{fontSize:"0.6rem",color:"var(--muted)"}}>{i}-{i+1}m</span></div>);})()}
                        </div>
                      </div>
                      <div className="card"><div className="ct"><div className="dot" style={{background:"#ffb84d"}}/>Conversación</div>
                        {[["Interrupciones prom.",groupStats.avgInterruptions,"#ffb84d"],["Silencios largos prom.",groupStats.avgSilences,"#6c63ff"]].map(([l,v,c])=>(
                          <div key={l} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid var(--border)"}}><span style={{fontSize:"0.83rem",color:"var(--label)"}}>{l}</span><span style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.3rem",color:c}}>{v}</span></div>
                        ))}
                      </div>
                    </div>
                    <div className="card"><div className="ct"><div className="dot"/>Grabaciones del grupo</div>
                      <table><thead><tr><th>Archivo</th><th>Agente</th><th>Duración</th><th>Satisfacción</th><th>Motivo</th><th>Estado</th><th></th></tr></thead>
                      <tbody>{recordings.filter(r=>r.group_id===selGroup.id).map(r=>{
                        const a=r.analysis;
                        return <tr key={r.id}><td style={{fontWeight:500,maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.filename}</td><td style={{fontSize:"0.78rem",color:"var(--label)"}}>{r.agent_name||"—"}</td><td style={{fontFamily:"DM Mono,monospace",fontSize:"0.78rem"}}>{r.duration_sec?`${Math.floor(r.duration_sec/60)}:${String(r.duration_sec%60).padStart(2,"0")}`:"—"}</td><td>{a?<span style={{color:"#00e5a0",fontWeight:600}}>{a.score_satisfaction}%</span>:"—"}</td><td style={{fontSize:"0.75rem",color:"var(--label)"}}>{a?.call_reason_category||"—"}</td><td><span className={`fs ${sc(r.status)}`}>{sl(r.status)}</span></td><td>{r.status==="done"&&<button className="btn btn-ghost btn-sm" onClick={()=>{setSelected(r.id);setPage("dashboard");}}>Ver</button>}</td></tr>;
                      })}</tbody></table>
                    </div>
                  </>}
              </div>
            )}

            {page==="dashboard"&&(
              !selAnalysis?<div className="es"><h3>Selecciona una grabación</h3><button className="btn btn-primary" style={{marginTop:16}} onClick={()=>setPage("files")}>Ver grabaciones</button></div>:
              <>
                <div className="g4" style={{marginBottom:18}}>
                  {[{l:"Satisfacción",v:`${selAnalysis.scores.Satisfacción}%`,c:"#00e5a0"},{l:"Duración",v:selAnalysis.duration,c:"#6c63ff"},{l:"NPS",v:selAnalysis.nps,c:"#ffb84d"},{l:"Alertas",v:selAnalysis.alerts.length,c:selAnalysis.alerts.length>0?"#ff6584":"#00e5a0"}]
                    .map(k=><div className="kpi" key={k.l} style={{"--kc":k.c}}><div className="kl">{k.l}</div><div className="kv" style={{color:k.c}}>{k.v}</div></div>)}
                </div>
                <div className="g2" style={{marginBottom:16}}>
                  <div className="card"><div className="ct"><div className="dot" style={{background:"#6c63ff"}}/>Sentimiento Agente</div><SentimentFaces pos={selAnalysis.sentimentAgent.positive} neu={selAnalysis.sentimentAgent.neutral} neg={selAnalysis.sentimentAgent.negative}/></div>
                  <div className="card"><div className="ct"><div className="dot" style={{background:"#ffb84d"}}/>Sentimiento Cliente</div><SentimentFaces pos={selAnalysis.sentimentClient.positive} neu={selAnalysis.sentimentClient.neutral} neg={selAnalysis.sentimentClient.negative}/></div>
                </div>
                {selAnalysis.callReason&&<div className="card" style={{marginBottom:16}}><div className="ct"><div className="dot" style={{background:"#ff6584"}}/>Motivo de Llamada</div><div style={{display:"flex",alignItems:"center",gap:14}}><div style={{fontSize:"2rem"}}>📞</div><div><div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"1rem"}}>{selAnalysis.callReason}</div><div style={{fontSize:"0.8rem",color:"var(--label)",marginTop:3}}>Categoría: <span style={{color:"var(--accent)",fontWeight:600}}>{selAnalysis.callReasonCategory}</span></div></div></div></div>}
                <div className="tabs">{TABS.map((r,i)=><div key={r} className={`tab ${activeTab===i?"active":""}`} onClick={()=>setActiveTab(i)}>{r}</div>)}</div>
                <div className="card">
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
                    <div className="ct" style={{marginBottom:0}}><div className="dot"/>{TABS[activeTab]}</div>
                    <button className="btn btn-pdf btn-sm" onClick={()=>generatePDF(selAnalysis,TABS[activeTab])}>📄 PDF</button>
                  </div>
                  {activeTab===0&&<div><div className="dw"><DonutChart data={[selAnalysis.sentiment.positive,selAnalysis.sentiment.neutral,selAnalysis.sentiment.negative]} colors={["#00e5a0","#6c63ff","#ff6584"]}/><div className="dl">{[["Positivo",selAnalysis.sentiment.positive,"#00e5a0"],["Neutral",selAnalysis.sentiment.neutral,"#6c63ff"],["Negativo",selAnalysis.sentiment.negative,"#ff6584"]].map(([l,v,c])=><div className="li" key={l}><div className="ld" style={{background:c}}/><span style={{color:"var(--label)"}}>{l}</span><span className="lv">{v}%</span></div>)}</div></div><div className="sb" style={{marginTop:14}}><div style={{width:`${selAnalysis.sentiment.positive}%`,background:"#00e5a0",height:"100%"}}/><div style={{width:`${selAnalysis.sentiment.neutral}%`,background:"#6c63ff",height:"100%"}}/><div style={{width:`${selAnalysis.sentiment.negative}%`,background:"#ff6584",height:"100%"}}/></div></div>}
                  {activeTab===1&&<div style={{display:"flex",flexDirection:"column",gap:11}}>{Object.entries(selAnalysis.scores).map(([k,v])=>{const c={Satisfacción:"#00e5a0",Claridad:"#6c63ff",Empatía:"#ffb84d",Resolución:"#00e5a0",Cumplimiento:"#ff6584"}[k];return<div key={k}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:"0.81rem",color:"var(--label)"}}>{k}</span><span style={{fontFamily:"DM Mono,monospace",fontWeight:600,color:c}}>{v}</span></div><div className="pb"><div className="pf" style={{width:`${v}%`,background:c}}/></div></div>;})}</div>}
                  {activeTab===2&&<div className="kc">{selAnalysis.keywords.length===0?<span style={{color:"var(--muted)"}}>Sin keywords</span>:selAnalysis.keywords.map((kw,i)=>{const cols=[["rgba(0,229,160,0.15)","#00e5a0"],["rgba(108,99,255,0.15)","#9c99ff"],["rgba(255,184,77,0.15)","#ffb84d"],["rgba(255,101,132,0.15)","#ff6584"]];const[bg,c]=cols[i%4];return<span key={kw} className="kw" style={{background:bg,color:c,border:`1px solid ${c}30`}}>{kw}</span>;})}</div>}
                  {activeTab===3&&<div style={{maxHeight:380,overflowY:"auto"}}>{selAnalysis.transcript.length===0?<span style={{color:"var(--muted)"}}>Sin transcripción</span>:selAnalysis.transcript.map((m,i)=><div className="tm" key={i}><div className={`ma ${m.speaker==="Agente"?"ag":"cl"}`}>{m.speaker==="Agente"?"AG":"CL"}</div><div><div className="mb">{m.text}</div><div className="mt">{m.speaker}{m.start_sec!==undefined?` · ${m.start_sec}s`:""}</div></div></div>)}</div>}
                  {activeTab===4&&<div><div style={{display:"flex",gap:14,marginBottom:12}}>{[["Agente",selAnalysis.talkRatio.agent,"#6c63ff"],["Cliente",100-selAnalysis.talkRatio.agent,"#00e5a0"]].map(([l,v,c])=><div key={l} style={{flex:1,textAlign:"center",background:"var(--surface)",borderRadius:9,padding:"14px 8px",border:"1px solid var(--border)"}}><div style={{fontSize:"1.7rem",fontFamily:"Syne,sans-serif",fontWeight:800,color:c}}>{v}%</div><div style={{fontSize:"0.78rem",color:"var(--label)"}}>{l}</div></div>)}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:11,marginTop:14}}>{[["Interrupciones",selAnalysis.interruptions,"#ffb84d"],["Silencios largos",selAnalysis.silences,"#6c63ff"]].map(([l,v,c])=><div key={l} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:9,padding:13}}><div style={{fontSize:"0.7rem",color:"var(--label)",textTransform:"uppercase",marginBottom:3}}>{l}</div><div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1.5rem",color:c}}>{v}</div></div>)}</div></div>}
                  {activeTab===5&&<div>{selAnalysis.topics.length===0?<span style={{color:"var(--muted)"}}>Sin temas</span>:selAnalysis.topics.map(t=><div key={t} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--border)"}}><span>{t}</span><span style={{color:"#00e5a0",fontSize:"0.78rem",fontWeight:600}}>✓</span></div>)}</div>}
                  {activeTab===6&&<div>{selAnalysis.alerts.length===0?<div style={{color:"#00e5a0",textAlign:"center",padding:"14px 0"}}>✓ Sin alertas</div>:selAnalysis.alerts.map((al,i)=><div key={i} className="ai">⚠ {al}</div>)}</div>}
                  {activeTab===7&&<div>{Object.entries(selAnalysis.complianceItems).length===0?<span style={{color:"var(--muted)"}}>Sin datos</span>:Object.entries(selAnalysis.complianceItems).map(([k,v])=><div key={k} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--border)"}}><span style={{textTransform:"capitalize",fontSize:"0.85rem"}}>{k.replace(/_/g," ")}</span><span style={{color:v?"#00e5a0":"#ff6584",fontWeight:600,fontSize:"0.78rem"}}>{v?"✓ Cumplido":"✗ Faltante"}</span></div>)}</div>}
                  {activeTab===8&&<div style={{textAlign:"center"}}><ScoreRing value={selAnalysis.nps} color={selAnalysis.nps>=70?"#00e5a0":selAnalysis.nps>=50?"#ffb84d":"#ff6584"}/><div style={{marginTop:10,fontFamily:"Syne,sans-serif",fontWeight:700}}>NPS Estimado</div><div style={{color:"var(--label)",fontSize:"0.81rem",marginTop:3}}>{selAnalysis.nps>=70?"Promotor potencial":selAnalysis.nps>=50?"Pasivo":"Detractor potencial"}</div></div>}
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

function GroupModal({ onClose, onCreate }) {
  const [name,setName] = useState("");
  const [desc,setDesc] = useState("");
  const [color,setColor] = useState("#00e5a0");
  const [loading,setLoading] = useState(false);
  const handle = async () => { if(!name.trim()) return; setLoading(true); await onCreate(name.trim(),desc.trim(),color); setLoading(false); };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Nuevo Grupo</h3>
        <div className="field"><label>Nombre *</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Ej: Clínica Pasteur - Agendamiento"/></div>
        <div className="field"><label>Descripción</label><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={2} placeholder="Servicio o campaña"/></div>
        <div className="field"><label>Color</label><div style={{display:"flex",gap:8,marginTop:4}}>{GROUP_COLORS.map(c=><div key={c} className={`color-dot ${color===c?"selected":""}`} style={{background:c}} onClick={()=>setColor(c)}/>)}</div></div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button className="btn btn-ghost" style={{flex:1}} onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" style={{flex:1}} onClick={handle} disabled={loading||!name.trim()}>{loading?"Creando…":"Crear grupo"}</button>
        </div>
      </div>
    </div>
  );
}

function AssignModal({ groups, onClose, onAssign }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <h3>Asignar a grupo</h3>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          <div className="fi" onClick={()=>onAssign(null)}><span>❌</span><span style={{fontSize:"0.85rem"}}>Sin grupo</span></div>
          {groups.map(g=><div key={g.id} className="fi" onClick={()=>onAssign(g.id)}><span style={{width:12,height:12,borderRadius:"50%",background:g.color,display:"inline-block"}}/><span style={{fontSize:"0.85rem",fontWeight:500}}>{g.name}</span></div>)}
        </div>
        <button className="btn btn-ghost" style={{width:"100%",marginTop:16}} onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
}
