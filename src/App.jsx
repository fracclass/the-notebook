import { useState, useRef, useEffect, createContext, useContext } from "react";
import { LIGHT, DARK, DARK_TOPIC_COLORS, TRANSLATIONS, TOPIC_COLORS, REGION_COLORS } from "./theme";

const ThemeCtx = createContext(LIGHT);
const LangCtx  = createContext(k => k);

const TOPICS  = ["Energy","Technology","Markets","Consumer Trends","Environment","Deep Dive","Other"];
const REGIONS = ["Africa","Americas","Asia-Pacific","Europe","Middle East","Global"];

const now = () => new Date().toISOString();
const fmt = (iso, locale="en-US") => new Date(iso).toLocaleDateString(locale,{year:"numeric",month:"long",day:"numeric"});
const readingTime = (html) => {
  const text = (html||"").replace(/<[^>]+>/g,"").replace(/&\w+;/g," ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1,Math.round(words/238));
};

const SAMPLE = [
  {id:"1",title:"The Quiet Pivot in Battery Storage",topics:["Energy"],regions:["Global"],status:"public",author:"Franz-Frederick Acclassato",summary:"Utility-scale storage deployments are accelerating faster than most forecasters predicted.",body:`<p>For the better part of a decade, battery storage was treated as a footnote in energy transition models. That framing is now visibly wrong.</p><p>Across ERCOT, CAISO and the Australian NEM, four-hour lithium-iron-phosphate systems are increasingly setting the marginal price during evening ramp events.</p><h3>What to watch</h3><p>Capacity market reform in PJM will be the clearest signal of how incumbent generators and their lenders are positioned.</p>`,sources:[{label:"ERCOT Generation Mix Data",url:"https://www.ercot.com"},{label:"IRENA Battery Cost Trends 2024",url:"https://www.irena.org"}],createdAt:"2025-11-04T09:12:00Z",updatedAt:"2025-11-04T09:12:00Z"},
  {id:"2",title:"Why Nearshoring Hasn't Delivered — Yet",topics:["Markets","Deep Dive"],regions:["Americas"],status:"private",author:"Franz-Frederick Acclassato",summary:"The reshoring narrative captured boardrooms, but output data tells a more complicated story.",body:`<p>Since 2022, "friend-shoring" and "nearshoring" have become near-mandatory vocabulary in earnings calls.</p><p>The capex data supports the narrative in aggregate — greenfield FDI into Mexico hit a record in 2023. But the output numbers are lagging.</p><h3>The realistic timeline</h3><p>Expect the output inflection to appear in trade data around 2026–2027.</p>`,sources:[{label:"Banco de México FDI Statistics",url:"https://www.banxico.org.mx"}],createdAt:"2025-12-18T14:30:00Z",updatedAt:"2025-12-18T14:30:00Z"}
];

const GlobeIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const LockIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const PlusIcon    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const BackIcon    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const TrashIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const SaveIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const PenIcon     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const LinkIcon    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const LoginIcon   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const LogoutIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ImageIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const MailIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const InfoIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const XIcon       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const HamburgerIcon = ({color}) => <svg width="22" height="16" viewBox="0 0 22 16" fill="none"><line x1="0" y1="1" x2="22" y2="1" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="0" y1="8" x2="22" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="0" y1="15" x2="22" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round"/></svg>;
const LangIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const MoonIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const SunIcon     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;

// ── API ────────────────────────────────────────────────────────────────────────
async function apiGetPosts() {
  try {
    const r = await fetch("/api/posts-get");
    const d = await r.json();
    return d.posts || null;
  } catch { return null; }
}
async function apiSetPosts(posts) {
  try {
    await fetch("/api/posts-set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posts })
    });
  } catch {}
}
async function apiDeletePost(id) {
  try {
    await fetch("/api/posts-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
  } catch {}
}
async function apiGetMessages() {
  try {
    const r = await fetch("/api/messages-get");
    const d = await r.json();
    return d.messages || [];
  } catch { return []; }
}
async function apiPostMessage(msg) {
  try {
    await fetch("/api/messages-post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(msg)
    });
  } catch {}
}
async function apiSetMessages(messages) {
  try {
    await fetch("/api/messages-set", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages })
    });
  } catch {}
}

function initAuth() {
  try { return localStorage.getItem("nb_auth") === "true"; } catch { return false; }
}

function setMeta(prop, content) {
  let el = document.querySelector(`meta[property="${prop}"]`) || document.querySelector(`meta[name="${prop}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(prop.startsWith("og:") ? "property" : "name", prop); document.head.appendChild(el); }
  el.setAttribute("content", content);
}
function updateOGTags({ title, description, image } = {}) {
  const t = title ? `${title} — The Notebook` : "The Notebook";
  const d = description || "Independent analysis on markets, energy, and the forces shaping the global economy.";
  document.title = t;
  setMeta("description", d); setMeta("og:title", t); setMeta("og:description", d);
  setMeta("og:url", window.location.href); setMeta("og:type", title ? "article" : "website");
  setMeta("og:site_name", "The Notebook");
  if (image) setMeta("og:image", image);
  setMeta("twitter:card", "summary_large_image"); setMeta("twitter:title", t); setMeta("twitter:description", d);
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ isOpen, onClose, isAdmin, onLogin, onLogout, onNewArticle, onContact, onMessages, unreadCount }) {
  const C = useContext(ThemeCtx);
  const t = useContext(LangCtx);
  const [panel, setPanel] = useState(null);

  const navBtn=(label,icon,onClick,active,badge)=>(
    <button onClick={onClick} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"11px 16px",background:active?C.accentLight:"transparent",border:"none",borderRadius:8,cursor:"pointer",fontSize:14,fontWeight:600,color:active?C.accent:C.textSecondary,textAlign:"left",transition:"all .15s"}}>
      <span style={{color:active?C.accent:C.textMuted}}>{icon}</span>
      <span style={{flex:1}}>{label}</span>
      {badge>0&&<span style={{background:C.accent,color:"#fff",borderRadius:10,fontSize:10,fontWeight:700,padding:"1px 6px",minWidth:16,textAlign:"center"}}>{badge}</span>}
    </button>
  );

  return (
    <>
      {isOpen&&<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",zIndex:200}}/>}
      <div className="notranslate" style={{position:"fixed",top:0,left:0,height:"100vh",width:300,background:C.white,zIndex:201,boxShadow:isOpen?"4px 0 24px rgba(0,0,0,.08)":"none",transform:isOpen?"translateX(0)":"translateX(-100%)",transition:"transform .25s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div style={{padding:"20px 20px 16px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:18,color:C.textPrimary,letterSpacing:"-0.3px"}}>{t('siteTitle')}</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,padding:4,display:"flex"}}><XIcon/></button>
        </div>
        <nav style={{padding:"12px 12px 0",flex:1,overflowY:"auto"}}>
          {isAdmin&&<>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:C.textFaint,padding:"8px 16px 4px"}}>{t('adminSection')}</div>
            {navBtn(t('newArticle'),<PlusIcon/>,()=>{onNewArticle();onClose();},false)}
            {navBtn("Messages",<MailIcon/>,()=>{onMessages();onClose();},false,unreadCount)}
            {navBtn(t('logout'),<LogoutIcon/>,()=>{onLogout();onClose();},false)}
          </>}
          {!isAdmin&&navBtn(t('login'),<LoginIcon/>,()=>{onLogin();onClose();},false)}
          <div style={{height:1,background:C.border,margin:"12px 0"}}/>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:C.textFaint,padding:"8px 16px 4px"}}>{t('publicationSection')}</div>
          {navBtn(t('about'),<InfoIcon/>,()=>setPanel(panel==="about"?null:"about"),panel==="about")}
          {navBtn(t('contact'),<MailIcon/>,()=>{onClose();onContact();},false)}
        </nav>
        {panel==="about"&&(
          <div style={{padding:"20px",borderTop:`1px solid ${C.border}`,background:C.offWhite,fontSize:13,lineHeight:1.8,color:C.textSecondary}}>
            <div style={{fontWeight:700,color:C.textPrimary,marginBottom:10,fontSize:14}}>{t('aboutHeading')}</div>
            <p style={{margin:"0 0 10px"}}>{t('aboutP1')}</p>
            <p style={{margin:0}}>{t('aboutP2')}</p>
          </div>
        )}
        <div style={{padding:"14px 20px",borderTop:`1px solid ${C.border}`,fontSize:11,color:C.textFaint}}>© {new Date().getFullYear()} The Notebook</div>
      </div>
    </>
  );
}

const MSG_CATEGORIES = ["Collaboration","Expertise on a subject","Feedback / Comment","Other"];

// ── Contact Modal ─────────────────────────────────────────────────────────────
function ContactModal({ onClose }) {
  const C = useContext(ThemeCtx);
  const t = useContext(LangCtx);
  const [cName,setCName]         = useState("");
  const [cEmail,setCEmail]       = useState("");
  const [cCategory,setCCategory] = useState(MSG_CATEGORIES[0]);
  const [cMessage,setCMessage]   = useState("");
  const [cSent,setCSent]         = useState(false);
  const [cError,setCError]       = useState("");
  const [sending,setSending]     = useState(false);

  const sendContact = async () => {
    if (!cName.trim()||!cEmail.trim()||!cMessage.trim()) return;
    setSending(true); setCError("");
    try {
      await apiPostMessage({ name:cName, email:cEmail, category:cCategory, message:cMessage });
      setCSent(true);
      setTimeout(()=>{ onClose(); }, 3000);
    } catch { setCError("Could not send. Please try again."); }
    setSending(false);
  };

  const fieldStyle = {width:"100%",boxSizing:"border-box",padding:"9px 12px",border:`1px solid ${C.border}`,borderRadius:7,fontSize:14,outline:"none",background:C.inputBg,color:C.textPrimary};
  const labelStyle = {fontSize:11,fontWeight:700,color:C.textMuted,marginBottom:4,textTransform:"uppercase",letterSpacing:0.5};

  return (
    <div className="notranslate" style={{position:"fixed",inset:0,zIndex:400,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,.45)"}}/>
      <div style={{position:"relative",background:C.white,borderRadius:14,boxShadow:"0 20px 60px rgba(0,0,0,.2)",width:"100%",maxWidth:480,margin:"0 16px",padding:"28px 28px 24px",boxSizing:"border-box"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
          <div style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:18,color:C.textPrimary}}>{t('contactHeading')}</div>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint,padding:4,display:"flex",borderRadius:6}}><XIcon/></button>
        </div>
        {cSent ? (
          <div style={{textAlign:"center",padding:"32px 0",color:C.accent,fontWeight:600,fontSize:15}}>✓ {t('contactSent')}</div>
        ) : (
          <>
            {/* Category pills */}
            <div style={{marginBottom:16}}>
              <div style={labelStyle}>Topic</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:7,marginTop:6}}>
                {MSG_CATEGORIES.map(cat=>(
                  <button key={cat} onClick={()=>setCCategory(cat)}
                    style={{padding:"5px 12px",borderRadius:20,border:`1.5px solid ${cCategory===cat?C.accent:C.border}`,background:cCategory===cat?C.accentLight:"transparent",color:cCategory===cat?C.accent:C.textSecondary,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all .12s"}}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            {/* Name + Email */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <div>
                <div style={labelStyle}>{t('fieldName')}</div>
                <input value={cName} onChange={e=>setCName(e.target.value)} placeholder={t('placeholderName')} style={fieldStyle}/>
              </div>
              <div>
                <div style={labelStyle}>{t('fieldEmail')}</div>
                <input type="email" value={cEmail} onChange={e=>setCEmail(e.target.value)} placeholder={t('placeholderEmail')} style={fieldStyle}/>
              </div>
            </div>
            {/* Message */}
            <div style={{marginBottom:16}}>
              <div style={labelStyle}>{t('fieldMessage')}</div>
              <textarea value={cMessage} onChange={e=>setCMessage(e.target.value)} placeholder={t('placeholderMessage')} rows={4}
                style={{...fieldStyle,resize:"vertical",lineHeight:1.5}}/>
            </div>
            {cError&&<div style={{color:"#c0392b",fontSize:12,marginBottom:10}}>{cError}</div>}
            <button onClick={sendContact} disabled={sending||!cName.trim()||!cEmail.trim()||!cMessage.trim()}
              style={{width:"100%",padding:"11px",background:C.accent,color:"#fff",border:"none",borderRadius:8,fontSize:14,fontWeight:700,cursor:"pointer",opacity:(sending||!cName.trim()||!cEmail.trim()||!cMessage.trim())?0.6:1,transition:"opacity .15s"}}>
              {sending?"Sending…":t('sendMessage')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Login Modal ───────────────────────────────────────────────────────────────
function LoginModal({ onLogin, onClose }) {
  const C = useContext(ThemeCtx);
  const t = useContext(LangCtx);
  const [pw,setPw]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const attempt=async()=>{
    if(!pw.trim())return; setLoading(true); setErr("");
    try {
      if(window.location.hostname==="localhost"){
        if(pw==="localtest")onLogin("local-token"); else{setErr(t('incorrectPassword'));setPw("");}
        setLoading(false); return;
      }
      const r=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pw})});
      const d=await r.json();
      if(d.success)onLogin(d.token); else{setErr(t('incorrectPassword'));setPw("");}
    } catch{setErr(t('connectionError'));}
    setLoading(false);
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
      <div style={{background:C.white,borderRadius:18,padding:"44px 48px",width:380,boxShadow:"0 24px 64px rgba(0,0,0,.2)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:52,height:52,background:C.textPrimary,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",color:C.offWhite}}><LoginIcon/></div>
          <h2 style={{fontSize:21,fontWeight:700,margin:"0 0 6px",color:C.textPrimary}}>{t('adminLogin')}</h2>
          <p style={{fontSize:14,color:C.textMuted,margin:0}}>{t('loginSubtext')}</p>
        </div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} placeholder={t('enterPassword')} autoFocus
          style={{width:"100%",boxSizing:"border-box",padding:"12px 14px",border:`1px solid ${err?"#e53e3e":C.inputBorder}`,borderRadius:9,fontSize:15,marginBottom:err?6:14,outline:"none",background:C.inputBg,color:C.textPrimary}}/>
        {err&&<p style={{color:"#e53e3e",fontSize:13,margin:"0 0 12px"}}>{err}</p>}
        <button onClick={attempt} disabled={loading} style={{width:"100%",padding:"12px",background:C.textPrimary,color:C.offWhite,border:"none",borderRadius:9,fontSize:15,fontWeight:600,cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,marginBottom:10}}>{loading?t('checking'):t('login')}</button>
        <button onClick={onClose} style={{width:"100%",padding:"11px",background:"none",color:C.textMuted,border:`1px solid ${C.border}`,borderRadius:9,fontSize:14,cursor:"pointer"}}>{t('cancel')}</button>
      </div>
    </div>
  );
}

// ── MultiPicker ───────────────────────────────────────────────────────────────
function MultiPicker({ label, options, colors, selected, onChange }) {
  const C = useContext(ThemeCtx);
  return (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:C.textFaint,marginBottom:8}}>{label}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {options.map(opt=>{const a=selected.includes(opt),c=colors[opt]||C.textSecondary;return(
          <button key={opt} onClick={()=>onChange(a?selected.filter(s=>s!==opt):[...selected,opt])} style={{padding:"5px 13px",borderRadius:20,border:`1px solid ${a?c:C.filterBorder}`,fontSize:12,cursor:"pointer",fontWeight:600,background:a?c:C.filterBg,color:a?"#fff":c,transition:"all .15s"}}>{opt}</button>
        );})}
      </div>
    </div>
  );
}

// ── Rich Editor ───────────────────────────────────────────────────────────────
function RichEditor({ value, onChange }) {
  const C = useContext(ThemeCtx);
  const ref=useRef(null); const imgInput=useRef(null);
  useEffect(()=>{ if(ref.current) ref.current.innerHTML=value||"<p><br></p>"; },[]);
  const exec=(cmd,val)=>{ ref.current?.focus(); document.execCommand(cmd,false,val); onChange(ref.current?.innerHTML||""); };
  const insertImage=(e)=>{
    const file=e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{ ref.current?.focus(); document.execCommand("insertHTML",false,`<img src="${ev.target.result}" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;display:block;"/>`); onChange(ref.current?.innerHTML||""); };
    reader.readAsDataURL(file); e.target.value="";
  };
  return (
    <div style={{border:`1px solid ${C.editorBorderStrong}`,borderRadius:10,overflow:"hidden",background:C.white}}>
      <div style={{display:"flex",gap:3,padding:"8px 12px",background:C.toolbarBg,borderBottom:`1px solid ${C.toolbarBorder}`,flexWrap:"wrap",alignItems:"center"}}>
        {[["bold","B"],["italic","I"],["underline","U"]].map(([cmd,lbl])=>(
          <button key={cmd} onMouseDown={e=>{e.preventDefault();exec(cmd);}} style={{fontWeight:cmd==="bold"?"bold":"normal",fontStyle:cmd==="italic"?"italic":"normal",textDecoration:cmd==="underline"?"underline":"none",background:C.toolbarBtn,border:`1px solid ${C.toolbarBtnBorder}`,borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:13,color:C.toolbarBtnText}}>{lbl}</button>
        ))}
        <div style={{width:1,background:C.toolbarBtnBorder,height:18,margin:"0 4px"}}/>
        {[["H2","formatBlock","h2"],["H3","formatBlock","h3"],["P","formatBlock","p"]].map(([lbl,cmd,val])=>(
          <button key={lbl} onMouseDown={e=>{e.preventDefault();exec(cmd,val);}} style={{background:C.toolbarBtn,border:`1px solid ${C.toolbarBtnBorder}`,borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:C.toolbarBtnText}}>{lbl}</button>
        ))}
        <div style={{width:1,background:C.toolbarBtnBorder,height:18,margin:"0 4px"}}/>
        {[
          ["justifyLeft",   <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><line x1="0" y1="1"  x2="14" y2="1"  stroke="currentColor" strokeWidth="1.5"/><line x1="0" y1="5"  x2="9"  y2="5"  stroke="currentColor" strokeWidth="1.5"/><line x1="0" y1="9"  x2="14" y2="9"  stroke="currentColor" strokeWidth="1.5"/><line x1="0" y1="13" x2="7"  y2="13" stroke="currentColor" strokeWidth="1.5"/></svg>,"Left"],
          ["justifyCenter", <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><line x1="0" y1="1"  x2="14" y2="1"  stroke="currentColor" strokeWidth="1.5"/><line x1="2.5" y1="5" x2="11.5" y2="5" stroke="currentColor" strokeWidth="1.5"/><line x1="0" y1="9"  x2="14" y2="9"  stroke="currentColor" strokeWidth="1.5"/><line x1="3.5" y1="13" x2="10.5" y2="13" stroke="currentColor" strokeWidth="1.5"/></svg>,"Center"],
          ["justifyRight",  <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><line x1="0" y1="1"  x2="14" y2="1"  stroke="currentColor" strokeWidth="1.5"/><line x1="5" y1="5"  x2="14" y2="5"  stroke="currentColor" strokeWidth="1.5"/><line x1="0" y1="9"  x2="14" y2="9"  stroke="currentColor" strokeWidth="1.5"/><line x1="7" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="1.5"/></svg>,"Right"],
          ["justifyFull",   <svg width="14" height="12" viewBox="0 0 14 12" fill="none"><line x1="0" y1="1"  x2="14" y2="1"  stroke="currentColor" strokeWidth="1.5"/><line x1="0" y1="5"  x2="14" y2="5"  stroke="currentColor" strokeWidth="1.5"/><line x1="0" y1="9"  x2="14" y2="9"  stroke="currentColor" strokeWidth="1.5"/><line x1="0" y1="13" x2="14" y2="13" stroke="currentColor" strokeWidth="1.5"/></svg>,"Justify"],
        ].map(([cmd,icon,title])=>(
          <button key={cmd} onMouseDown={e=>{e.preventDefault();exec(cmd);}} title={title} style={{display:"flex",alignItems:"center",background:C.toolbarBtn,border:`1px solid ${C.toolbarBtnBorder}`,borderRadius:5,padding:"3px 8px",cursor:"pointer",color:C.toolbarBtnText}}>{icon}</button>
        ))}
        <div style={{width:1,background:C.toolbarBtnBorder,height:18,margin:"0 4px"}}/>
        <button onMouseDown={e=>{e.preventDefault();exec("insertUnorderedList");}} style={{background:C.toolbarBtn,border:`1px solid ${C.toolbarBtnBorder}`,borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:C.toolbarBtnText}}>• List</button>
        <button onMouseDown={e=>{e.preventDefault();exec("formatBlock","blockquote");}} style={{background:C.toolbarBtn,border:`1px solid ${C.toolbarBtnBorder}`,borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:C.toolbarBtnText}}>" Quote</button>
        <button onMouseDown={e=>{e.preventDefault();const u=prompt("URL:");if(u)exec("createLink",u);}} style={{display:"flex",alignItems:"center",gap:4,background:C.toolbarBtn,border:`1px solid ${C.toolbarBtnBorder}`,borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:C.toolbarBtnText}}><LinkIcon/> Link</button>
        <div style={{width:1,background:C.toolbarBtnBorder,height:18,margin:"0 4px"}}/>
        <button onMouseDown={e=>{e.preventDefault();imgInput.current?.click();}} style={{display:"flex",alignItems:"center",gap:4,background:C.toolbarBtn,border:`1px solid ${C.toolbarBtnBorder}`,borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:C.toolbarBtnText}}><ImageIcon/> Image</button>
        <input ref={imgInput} type="file" accept="image/*" onChange={insertImage} style={{display:"none"}}/>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning onInput={e=>onChange(e.currentTarget.innerHTML)}
        onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();document.execCommand("insertParagraph");}}}
        style={{minHeight:"calc(100vh - 420px)",padding:"28px 32px",fontSize:17,lineHeight:1.8,color:C.bodyText,outline:"none",fontFamily:"Georgia,serif",direction:"ltr",textAlign:"left",unicodeBidi:"embed",writingMode:"horizontal-tb",WebkitWritingMode:"horizontal-tb",wordBreak:"break-word"}}/>
    </div>
  );
}

// ── Source Manager ────────────────────────────────────────────────────────────
function SourceMgr({ sources, onChange }) {
  const C = useContext(ThemeCtx);
  const t = useContext(LangCtx);
  const [lbl,setLbl]=useState(""); const [url,setUrl]=useState("");
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
        <input value={lbl} onChange={e=>setLbl(e.target.value)} placeholder={t('placeholderSourceName')} style={{flex:"1 1 140px",padding:"7px 12px",border:`1px solid ${C.filterBorder}`,borderRadius:7,fontSize:13,background:C.inputBg,color:C.textPrimary,outline:"none"}}/>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder={t('placeholderSourceUrl')} style={{flex:"2 1 200px",padding:"7px 12px",border:`1px solid ${C.filterBorder}`,borderRadius:7,fontSize:13,background:C.inputBg,color:C.textPrimary,outline:"none"}}/>
        <button onClick={()=>{if(!lbl.trim())return;onChange([...sources,{label:lbl.trim(),url:url.trim()}]);setLbl("");setUrl("");}} style={{padding:"7px 16px",background:C.bodyText,color:C.offWhite,border:"none",borderRadius:7,cursor:"pointer",fontSize:13}}>{t('addSource')}</button>
      </div>
      {sources.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:C.sourceBg,borderRadius:7,marginBottom:5,fontSize:13}}>
          <LinkIcon/><span style={{flex:1,fontWeight:600,color:C.textPrimary}}>{s.label}</span>
          {s.url&&<span style={{color:C.textMuted,fontSize:12}}>{s.url.replace(/^https?:\/\//,"").slice(0,36)}</span>}
          <button onClick={()=>onChange(sources.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:C.textFaint}}><TrashIcon/></button>
        </div>
      ))}
    </div>
  );
}

// ── Filter Bar ────────────────────────────────────────────────────────────────
function FilterBar({ filterTopic,setFilterTopic,filterRegion,setFilterRegion,isAdmin,filterStatus,setFilterStatus,search,setSearch }) {
  const C = useContext(ThemeCtx);
  const t = useContext(LangCtx);
  return (
    <div className="notranslate" style={{marginBottom:28}}>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('searchPlaceholder')} style={{padding:"8px 14px",border:`1px solid ${C.filterBorder}`,borderRadius:8,fontSize:13,width:200,outline:"none",background:C.filterBg,color:C.textPrimary}}/>
        {isAdmin&&<div style={{display:"flex",border:`1px solid ${C.filterBorder}`,borderRadius:8,overflow:"hidden"}}>
          {["All","public","private"].map(s=>(
            <button key={s} onClick={()=>setFilterStatus(s)} style={{padding:"7px 13px",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,background:filterStatus===s?C.textPrimary:C.filterBg,color:filterStatus===s?C.offWhite:C.textSecondary}}>
              {s==="All"?t('filterAll'):s==="public"?t('filterPublic'):t('filterPrivate')}</button>
          ))}
        </div>}
      </div>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:C.textFaint,marginBottom:6}}>{t('filterTopic')}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["All",...TOPICS].map(tp=>{const a=filterTopic===tp,c=C.topicColors[tp]||C.textPrimary;return(
            <button key={tp} onClick={()=>setFilterTopic(tp)} style={{padding:"5px 13px",borderRadius:20,border:`1px solid ${a?(tp==="All"?C.textPrimary:c):C.editorBorderStrong}`,fontSize:12,cursor:"pointer",fontWeight:600,transition:"all .15s",background:a?(tp==="All"?C.textPrimary:c):C.filterBg,color:a?C.offWhite:(tp==="All"?C.textSecondary:c)}}>{tp==="All"?t('filterAll'):t('topic:'+tp)}</button>
          );})}
        </div>
      </div>
      <div>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:C.textFaint,marginBottom:6}}>{t('filterRegion')}</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["All",...REGIONS].map(r=>{const a=filterRegion===r,c=REGION_COLORS[r]||C.textSecondary;return(
            <button key={r} onClick={()=>setFilterRegion(r)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${a?(r==="All"?C.textPrimary:c):C.filterBorderAlt}`,fontSize:11,cursor:"pointer",fontWeight:600,transition:"all .15s",background:a?(r==="All"?C.textPrimary:c):C.filterBgAlt,color:a?C.offWhite:(r==="All"?C.textSecondary:c)}}>{r==="All"?t('filterAll'):t('region:'+r)}</button>
          );})}
        </div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ post, onClick, onDelete, isAdmin }) {
  const C = useContext(ThemeCtx);
  const t = useContext(LangCtx);
  const imgMatch=post.body?.match(/<img[^>]+src="([^"]+)"/); const thumb=imgMatch?.[1];
  return (
    <div onClick={onClick} style={{cursor:"pointer",background:C.cardBg,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden",transition:"all .15s",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.09)";e.currentTarget.style.transform="translateY(-2px)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.04)";e.currentTarget.style.transform="none";}}>
      {thumb&&<div style={{height:160,overflow:"hidden",background:C.cardThumbBg}}><img src={thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}
      <div style={{padding:"22px 24px"}}>
        <div className="notranslate" style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,flex:1}}>
            {(post.topics||[]).map(tp=><span key={tp} style={{fontSize:10,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:C.topicColors[tp]||C.textSecondary,borderLeft:`3px solid ${C.topicColors[tp]||C.textSecondary}`,paddingLeft:7}}>{t('topic:'+tp)}</span>)}
            {(post.regions||[]).map(r=><span key={r} style={{fontSize:10,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase",color:REGION_COLORS[r]||C.privateGray,background:`${REGION_COLORS[r]}18`,padding:"2px 7px",borderRadius:10}}>{t('region:'+r)}</span>)}
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0,marginLeft:8}}>
            {isAdmin&&<span style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,color:post.status==="public"?C.publicGreen:C.privateGray,background:post.status==="public"?C.publicBg:C.privateBg}}>{post.status==="public"?<GlobeIcon/>:<LockIcon/>}{post.status==="public"?t('statusPublic'):t('statusPrivate')}</span>}
            {isAdmin&&<button onClick={e=>{e.stopPropagation();if(window.confirm(t('deleteConfirm')))onDelete(post.id);}} style={{background:"none",border:"none",cursor:"pointer",color:C.filterBorder,padding:2}}><TrashIcon/></button>}
          </div>
        </div>
        <h2 style={{fontSize:19,fontWeight:700,lineHeight:1.3,margin:"0 0 9px",color:C.textPrimary,fontFamily:"Georgia,serif"}}>{post.title}</h2>
        <p style={{fontSize:14,color:C.textSecondary,lineHeight:1.6,margin:"0 0 18px"}}>{post.summary}</p>
        <div className="notranslate" style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,color:C.textFaint}}>
          <span>{post.author&&<span style={{color:C.metaText,marginRight:6}}>{post.author} · </span>}{fmt(post.updatedAt,t('locale'))}</span>
          <span style={{background:C.readingTimeBg,padding:"2px 8px",borderRadius:8,fontSize:11,fontWeight:600,color:C.readingTimeText}}>{readingTime(post.body)} {t('minRead')}</span>
        </div>
      </div>
    </div>
  );
}

// ── Editor ────────────────────────────────────────────────────────────────────
function Editor({ post, onSave, onBack }) {
  const C = useContext(ThemeCtx);
  const t = useContext(LangCtx);
  const [title,setTitle]=useState(post.title||""); const [topics,setTopics]=useState(post.topics||[]);
  const [regions,setRegions]=useState(post.regions||[]); const [status,setStatus]=useState(post.status||"private");
  const [summary,setSummary]=useState(post.summary||""); const [author,setAuthor]=useState(post.author||"");
  const [body,setBody]=useState(post.body||"<p><br></p>"); const [sources,setSources]=useState(post.sources||[]);
  const [flash,setFlash]=useState(false);
  const save=()=>{
    const p={...post,id:post.id||String(Date.now()),title,topics,regions,status,summary,author,body,sources,createdAt:post.createdAt||now(),updatedAt:now()};
    onSave(p); setFlash(true); setTimeout(()=>setFlash(false),2000);
  };
  return (
    <div className="notranslate" style={{width:"100%",boxSizing:"border-box",padding:"32px 48px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:`1px solid ${C.editorBorderStrong}`,borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,color:C.textSecondary}}><BackIcon/> {t('back')}</button>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:13,color:flash?C.publicGreen:"transparent",transition:"color .3s",fontWeight:600}}>{t('saved')}</span>
          <button onClick={save} style={{display:"flex",alignItems:"center",gap:6,background:C.textPrimary,color:C.offWhite,border:"none",borderRadius:8,padding:"9px 20px",cursor:"pointer",fontSize:14,fontWeight:600}}><SaveIcon/> {t('save')}</button>
        </div>
      </div>
      <div style={{display:"flex",border:`1px solid ${C.filterBorder}`,borderRadius:8,overflow:"hidden",marginBottom:24,width:"fit-content"}}>
        {["public","private"].map(s=><button key={s} onClick={()=>setStatus(s)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 16px",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:status===s?C.textPrimary:C.filterBg,color:status===s?C.offWhite:C.textSecondary}}>{s==="public"?<GlobeIcon/>:<LockIcon/>}{s==="public"?t('statusPublic'):t('statusPrivate')}</button>)}
      </div>
      <MultiPicker label={t('labelTopics')} options={TOPICS} colors={C.topicColors} selected={topics} onChange={setTopics}/>
      <MultiPicker label={t('labelRegion')} options={REGIONS} colors={REGION_COLORS} selected={regions} onChange={setRegions}/>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder={t('placeholderTitle')} style={{width:"100%",boxSizing:"border-box",fontSize:32,fontWeight:700,fontFamily:"Georgia,serif",border:"none",borderBottom:`2px solid ${C.editorBorder}`,padding:"6px 0",marginBottom:14,outline:"none",color:C.textPrimary,background:"transparent",marginTop:10}}/>
      <textarea value={summary} onChange={e=>setSummary(e.target.value)} placeholder={t('placeholderSummary')} rows={2} style={{width:"100%",boxSizing:"border-box",fontSize:15,fontFamily:"Georgia,serif",fontStyle:"italic",color:C.summaryColor,border:"none",borderBottom:`1px solid ${C.editorBorder}`,padding:"6px 0",marginBottom:14,outline:"none",resize:"none",lineHeight:1.6,background:"transparent"}}/>
      <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder={t('placeholderAuthor')} style={{width:"100%",boxSizing:"border-box",fontSize:14,border:"none",borderBottom:`1px solid ${C.editorBorder}`,padding:"6px 0",marginBottom:26,outline:"none",color:C.authorColor,background:"transparent"}}/>
      <div style={{marginBottom:30}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:C.textFaint,marginBottom:10}}>{t('labelBody')}</div>
        <RichEditor value={body} onChange={setBody}/>
      </div>
      <div>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:C.textFaint,marginBottom:10}}>{t('labelSources')}</div>
        <SourceMgr sources={sources} onChange={setSources}/>
      </div>
    </div>
  );
}

const TRANSLATE_LANGS = [{code:"fr",label:"Français"},{code:"es",label:"Español"},{code:"de",label:"Deutsch"}];
const applyGoogleTranslate = (code) => {
  if (code === 'en') {
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + window.location.hostname;
  }
  setTimeout(() => {
    const select = document.querySelector('.goog-te-combo');
    if (!select) return;
    select.value = code === 'en' ? '' : code;
    select.dispatchEvent(new Event('change'));
  }, 200);
};

// ── Reader ────────────────────────────────────────────────────────────────────
function Reader({ post, onEdit, onBack, isAdmin }) {
  const C = useContext(ThemeCtx);
  const t = useContext(LangCtx);
  const [txOpen, setTxOpen] = useState(false);
  const [txLang, setTxLang] = useState(null);
  const txRef = useRef(null);
  const imgMatch=post.body?.match(/<img[^>]+src="([^"]+)"/); const thumb=imgMatch?.[1];
  useEffect(()=>{ updateOGTags({title:post.title,description:post.summary,image:thumb}); return()=>updateOGTags({}); },[post.title,post.summary,thumb]);
  useEffect(()=>{
    const handler = e => { if(txRef.current && !txRef.current.contains(e.target)) setTxOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  },[]);
  // Reset translation when unmounting (user navigates back)
  useEffect(()=>()=>applyGoogleTranslate('en'), []);

  const handleBack = () => { applyGoogleTranslate('en'); setTxLang(null); onBack(); };
  const selectLang = (code) => { setTxLang(code); setTxOpen(false); applyGoogleTranslate(code); };
  const resetLang  = () => { setTxLang(null); setTxOpen(false); applyGoogleTranslate('en'); };

  return (
    <div style={{maxWidth:740,margin:"0 auto",padding:"32px 0 100px"}}>
      <div className="notranslate" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:40}}>
        <button onClick={handleBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:`1px solid ${C.editorBorderStrong}`,borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,color:C.textSecondary}}><BackIcon/> {t('back')}</button>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* Translate button */}
          <div ref={txRef} style={{position:"relative"}}>
            <button onClick={()=>setTxOpen(o=>!o)}
              style={{display:"flex",alignItems:"center",gap:6,background:txLang?C.accentLight:"none",border:`1px solid ${txLang?C.accent:C.border}`,borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:12,fontWeight:600,color:txLang?C.accent:C.textMuted,transition:"all .15s"}}>
              <LangIcon/>{txLang?txLang.toUpperCase():"Translate"}
            </button>
            {txOpen&&(
              <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:C.white,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:"0 8px 28px rgba(0,0,0,.12)",minWidth:148,zIndex:200,overflow:"hidden"}}>
                {txLang&&<button onClick={resetLang} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 14px",background:"transparent",border:"none",borderBottom:`1px solid ${C.border}`,cursor:"pointer",fontSize:12,fontWeight:600,color:C.textMuted}}>✕ Reset to English</button>}
                {TRANSLATE_LANGS.map(l=>(
                  <button key={l.code} onClick={()=>selectLang(l.code)}
                    style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"9px 14px",background:txLang===l.code?C.accentLight:"transparent",border:"none",cursor:"pointer",fontSize:13,fontWeight:txLang===l.code?700:500,color:txLang===l.code?C.accent:C.textSecondary,textAlign:"left",transition:"background .1s"}}>
                    <span style={{fontSize:11,fontWeight:700,opacity:0.55,minWidth:22}}>{l.code.toUpperCase()}</span>{l.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {isAdmin&&<button onClick={onEdit} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,color:C.textPrimary,fontWeight:600}}><PenIcon/> {t('edit')}</button>}
        </div>
      </div>
      <div className="notranslate" style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",marginBottom:14}}>
        {(post.topics||[]).map(tp=><span key={tp} style={{fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:C.topicColors[tp]||C.textSecondary,borderLeft:`3px solid ${C.topicColors[tp]||C.textSecondary}`,paddingLeft:9}}>{t('topic:'+tp)}</span>)}
        {(post.regions||[]).map(r=><span key={r} style={{fontSize:10,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase",color:REGION_COLORS[r]||C.privateGray,background:`${REGION_COLORS[r]}22`,padding:"3px 9px",borderRadius:10}}>{t('region:'+r)}</span>)}
        {isAdmin&&<span style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,color:post.status==="public"?C.publicGreen:C.privateGray,background:post.status==="public"?C.publicBg:C.privateBg}}>{post.status==="public"?<GlobeIcon/>:<LockIcon/>}{post.status==="public"?t('statusPublic'):t('statusPrivate')}</span>}
      </div>
      <h1 style={{fontSize:40,fontWeight:700,lineHeight:1.2,margin:"0 0 16px",color:C.textPrimary,fontFamily:"Georgia,serif"}}>{post.title}</h1>
      <p style={{fontSize:18,color:C.summaryColor,fontStyle:"italic",lineHeight:1.65,marginBottom:14,fontFamily:"Georgia,serif"}}>{post.summary}</p>
      <div className="notranslate" style={{fontSize:13,color:C.textFaint,marginBottom:40,paddingBottom:22,borderBottom:`1px solid ${C.editorBorder}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>{post.author&&<span style={{fontWeight:600,color:C.textSecondary,marginRight:6}}>{t('by')} {post.author} · </span>}{fmt(post.createdAt,t('locale'))}{post.updatedAt!==post.createdAt&&<span> · {t('lastRevised')} {fmt(post.updatedAt,t('locale'))}</span>}</span>
        <span style={{background:C.readingTimeBg,padding:"3px 10px",borderRadius:8,fontSize:11,fontWeight:600,color:C.readingTimeText,flexShrink:0}}>{readingTime(post.body)} {t('minRead')}</span>
      </div>
      <div className="article-body" style={{fontSize:17,lineHeight:1.85,color:C.bodyText,fontFamily:"Georgia,serif"}} dangerouslySetInnerHTML={{__html:post.body}}/>
      {post.sources?.length>0&&(
        <div style={{marginTop:52,paddingTop:26,borderTop:`1px solid ${C.editorBorder}`}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:C.textFaint,marginBottom:16}}>{t('labelSources')}</div>
          {post.sources.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,fontSize:14}}>
              <span style={{color:C.filterBorder,minWidth:18}}>{i+1}.</span>
              {s.url?<a href={s.url} target="_blank" rel="noreferrer" style={{color:C.linkColor,textDecoration:"underline"}}>{s.label}</a>:<span style={{color:C.linkColor}}>{s.label}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const C = useContext(ThemeCtx);
  const t = useContext(LangCtx);
  return (
    <footer className="notranslate" style={{borderTop:`1px solid ${C.border}`,background:C.white,marginTop:80}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 40px",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <div>
          <span style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:15,color:C.textPrimary,letterSpacing:"-0.3px"}}>{t('siteTitle')}</span>
          <span style={{display:"block",fontSize:11,color:C.textFaint,marginTop:3}}>{t('footerTagline')}</span>
        </div>
        <div style={{fontSize:11,color:C.textFaint,textAlign:"center",lineHeight:1.8}}>
          <div>© {new Date().getFullYear()} The Notebook · {t('footerCopy')}</div>
          <div>{t('footerDisclaimer')}</div>
        </div>
        <a href="https://thenotebook.press" style={{fontSize:11,color:C.textFaint,textDecoration:"none"}}>thenotebook.press</a>
      </div>
    </footer>
  );
}

// ── App (root) ────────────────────────────────────────────────────────────────
const LANG_OPTIONS = [
  { code:"en", flag:"🇬🇧", label:"English" },
  { code:"fr", flag:"🇫🇷", label:"Français" },
  { code:"es", flag:"🇪🇸", label:"Español" },
  { code:"de", flag:"🇩🇪", label:"Deutsch" },
];

export default function App() {
  // ── Theme state ──
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('nb_theme');
    return stored === 'dark' || (stored === null && prefersDark);
  });
  useEffect(() => { localStorage.setItem('nb_theme', isDark ? 'dark' : 'light'); }, [isDark]);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = e => { if (!localStorage.getItem('nb_theme')) setIsDark(e.matches); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const C = { ...(isDark ? DARK : LIGHT), topicColors: isDark ? DARK_TOPIC_COLORS : TOPIC_COLORS };

  // ── Language state ──
  const t = key => {
    if (key.startsWith('topic:'))  { const tp = key.slice(6); return TRANSLATIONS.en.topicLabels[tp]  || tp; }
    if (key.startsWith('region:')) { const r  = key.slice(7); return TRANSLATIONS.en.regionLabels[r]  || r;  }
    return TRANSLATIONS.en[key] ?? key;
  };
  useEffect(() => { document.body.classList.toggle('dark-mode', isDark); }, [isDark]);

  // ── App state ──
  const [posts,setPosts]     = useState([]);
  const [loading,setLoading] = useState(true);
  const [view,setView]       = useState("home");
  const [activeId,setActiveId] = useState(null);
  const [filterTopic,setFilterTopic]   = useState("All");
  const [filterRegion,setFilterRegion] = useState("All");
  const [filterStatus,setFilterStatus] = useState("All");
  const [search,setSearch]   = useState("");
  const [isAdmin,setIsAdmin] = useState(initAuth);
  const [showLogin,setShowLogin] = useState(false);
  const [sidebarOpen,setSidebarOpen]   = useState(false);
  const [showContact,setShowContact]   = useState(false);

  useEffect(()=>{
    apiGetPosts().then(data=>{ setPosts(data||SAMPLE); setLoading(false); });
  },[]);

  useEffect(()=>{ if(view==="home") updateOGTags({}); },[view]);


  const handleSave = async (p) => {
    const updated = posts.find(x=>x.id===p.id)
      ? posts.map(x=>x.id===p.id ? p : x)
      : [p, ...posts];
    setPosts(updated);
    await apiSetPosts(updated);
  };

  const handleDelete = async (id) => {
    const updated = posts.filter(p=>p.id!==id);
    setPosts(updated);
    await apiDeletePost(id);
  };

  const activePost = posts.find(p=>p.id===activeId)||{};

  // ── Messages (admin inbox) ──
  const [messages, setMessages] = useState([]);
  const unreadCount = messages.filter(m=>!m.read).length;

  const handleLogin = (token) => {
    setIsAdmin(true);
    try{localStorage.setItem("nb_auth","true");localStorage.setItem("nb_token",token);}catch{}
    setShowLogin(false);
    apiGetMessages().then(msgs => setMessages(msgs));
  };
  const handleLogout = () => {
    setIsAdmin(false);
    setMessages([]);
    try{localStorage.removeItem("nb_auth");localStorage.removeItem("nb_token");}catch{}
  };
  const handleMarkRead = async (id) => {
    const updated = messages.map(m => m.id===id ? {...m, read:true} : m);
    setMessages(updated);
    await apiSetMessages(updated);
  };
  const handleMarkAllRead = async () => {
    const updated = messages.map(m => ({...m, read:true}));
    setMessages(updated);
    await apiSetMessages(updated);
  };

  const visiblePosts = posts.filter(p=>isAdmin?true:p.status==="public");
  const visible = visiblePosts.filter(p=>{
    if(filterTopic!=="All"&&!(p.topics||[]).includes(filterTopic))return false;
    if(filterRegion!=="All"&&!(p.regions||[]).includes(filterRegion))return false;
    if(isAdmin&&filterStatus!=="All"&&p.status!==filterStatus)return false;
    if(search&&!p.title.toLowerCase().includes(search.toLowerCase())&&!p.summary?.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });
  const pub = posts.filter(p=>p.status==="public").length;

  const sidebar = (
    <Sidebar isOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)} isAdmin={isAdmin}
      onLogin={()=>{setSidebarOpen(false);setShowLogin(true);}}
      onLogout={()=>{handleLogout();setSidebarOpen(false);}}
      onNewArticle={()=>{setActiveId(null);setView("new");}}
      onContact={()=>setShowContact(true)}
      onMessages={()=>setView("messages")}
      unreadCount={unreadCount}/>
  );

  const Header = () => (
    <header className="notranslate" style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:"0 24px",position:"sticky",top:0,zIndex:100}}>
      <div style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",height:62}}>
        {/* Left side */}
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:"none",cursor:"pointer",padding:"6px 4px",display:"flex",alignItems:"center",lineHeight:0}}><HamburgerIcon color={C.accent}/></button>
          <div style={{display:"flex",alignItems:"baseline",gap:12}}>
            <span onClick={()=>setView("home")} style={{fontSize:21,fontWeight:800,fontFamily:"Georgia,serif",color:C.textPrimary,letterSpacing:"-0.5px",cursor:"pointer"}}>{t('siteTitle')}</span>
            <span style={{fontSize:12,color:C.textFaint}}>{isAdmin?`${pub} public · ${posts.length-pub} private`:`${pub} article${pub!==1?"s":""}`}</span>
          </div>
        </div>
        {/* Right side */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={()=>setIsDark(d=>!d)} title={isDark?"Light mode":"Dark mode"}
            style={{display:"flex",alignItems:"center",justifyContent:"center",background:"none",border:`1px solid ${C.border}`,borderRadius:7,padding:"6px 8px",cursor:"pointer",color:C.textMuted,transition:"border-color .15s"}}>
            {isDark?<SunIcon/>:<MoonIcon/>}
          </button>
          {isAdmin&&<button onClick={()=>{setActiveId(null);setView("new");}} style={{display:"flex",alignItems:"center",gap:7,background:C.textPrimary,color:C.offWhite,border:"none",borderRadius:9,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:600}}><PlusIcon/> {t('newArticle')}</button>}
        </div>
      </div>
    </header>
  );

  if(loading) return (
    <ThemeCtx.Provider value={C}>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.offWhite}}>
        <div style={{fontSize:14,color:C.metaText,fontFamily:"Georgia,serif"}}>{t('loading')}</div>
      </div>
    </ThemeCtx.Provider>
  );

  return (
    <ThemeCtx.Provider value={C}>
      <LangCtx.Provider value={t}>
        {view==="read"&&(
          <div style={{minHeight:"100vh",width:"100%",background:C.offWhite,display:"flex",flexDirection:"column"}}>
            {sidebar}{showLogin&&<LoginModal onLogin={handleLogin} onClose={()=>setShowLogin(false)}/>}{showContact&&<ContactModal onClose={()=>setShowContact(false)}/>}
            <Header/>
            <div style={{flex:1,padding:"36px 48px"}}><Reader post={activePost} onBack={()=>setView("home")} onEdit={()=>setView("edit")} isAdmin={isAdmin}/></div>
            <Footer/>
          </div>
        )}
        {(view==="edit"||view==="new")&&(
          <div style={{minHeight:"100vh",width:"100%",background:C.offWhite}}>
            {sidebar}<Header/>
            <Editor post={view==="new"?{}:activePost} onSave={p=>{handleSave(p);setActiveId(p.id);setView("read");}} onBack={()=>setView(activeId?"read":"home")}/>
          </div>
        )}
        {view==="messages"&&isAdmin&&(
          <div style={{minHeight:"100vh",width:"100%",background:C.offWhite,display:"flex",flexDirection:"column"}}>
            {sidebar}{showContact&&<ContactModal onClose={()=>setShowContact(false)}/>}
            <Header/>
            <main style={{flex:1,maxWidth:720,width:"100%",margin:"0 auto",boxSizing:"border-box",padding:"36px 24px"}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
                <div>
                  <h1 style={{margin:0,fontSize:24,fontFamily:"Georgia,serif",fontWeight:800,color:C.textPrimary}}>Messages</h1>
                  {unreadCount>0&&<div style={{fontSize:13,color:C.metaText,marginTop:4}}>{unreadCount} unread</div>}
                </div>
                {unreadCount>0&&(
                  <button onClick={handleMarkAllRead} style={{padding:"7px 14px",background:"transparent",border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,fontWeight:600,color:C.textMuted,cursor:"pointer"}}>
                    Mark all read
                  </button>
                )}
              </div>
              {messages.length===0?(
                <div style={{textAlign:"center",padding:"80px 0",color:C.metaText,fontSize:15}}>No messages yet.</div>
              ):(
                MSG_CATEGORIES.map(cat=>{
                  const catMsgs = messages.filter(m=>m.category===cat);
                  if(catMsgs.length===0) return null;
                  return (
                    <div key={cat} style={{marginBottom:36}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:C.textFaint,marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${C.border}`}}>
                        {cat} <span style={{fontWeight:400,opacity:0.6}}>({catMsgs.length})</span>
                      </div>
                      {catMsgs.map(msg=>(
                        <div key={msg.id} onClick={()=>handleMarkRead(msg.id)}
                          style={{background:C.white,border:`1px solid ${msg.read?C.border:C.accent}`,borderRadius:10,padding:"16px 18px",marginBottom:10,cursor:"pointer",opacity:msg.read?0.7:1,transition:"opacity .15s"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                            <div>
                              <span style={{fontWeight:700,fontSize:14,color:C.textPrimary}}>{msg.name}</span>
                              <span style={{fontSize:12,color:C.metaText,marginLeft:8}}>{msg.email}</span>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              {!msg.read&&<span style={{width:7,height:7,borderRadius:"50%",background:C.accent,display:"inline-block"}}/>}
                              <span style={{fontSize:11,color:C.textFaint}}>{new Date(msg.createdAt).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</span>
                            </div>
                          </div>
                          <div style={{fontSize:14,color:C.textSecondary,lineHeight:1.6}}>{msg.message}</div>
                        </div>
                      ))}
                    </div>
                  );
                })
              )}
            </main>
          </div>
        )}
        {view==="home"&&(
          <div style={{minHeight:"100vh",width:"100%",background:C.offWhite,fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
            {sidebar}{showLogin&&<LoginModal onLogin={handleLogin} onClose={()=>setShowLogin(false)}/>}{showContact&&<ContactModal onClose={()=>setShowContact(false)}/>}
            <Header/>
            <main style={{flex:1,width:"100%",boxSizing:"border-box",padding:"34px 40px"}}>
              <FilterBar filterTopic={filterTopic} setFilterTopic={setFilterTopic} filterRegion={filterRegion} setFilterRegion={setFilterRegion} isAdmin={isAdmin} filterStatus={filterStatus} setFilterStatus={setFilterStatus} search={search} setSearch={setSearch}/>
              {visible.length===0
                ?<div style={{textAlign:"center",padding:"90px 0"}}><div style={{fontSize:17,fontWeight:600,color:C.metaText}}>{t('comingSoon')}</div></div>
                :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:20}}>
                  {visible.map(p=><Card key={p.id} post={p} onClick={()=>{setActiveId(p.id);setView("read");}} onDelete={handleDelete} isAdmin={isAdmin}/>)}
                </div>}
            </main>
            <Footer/>
          </div>
        )}
      </LangCtx.Provider>
    </ThemeCtx.Provider>
  );
}
