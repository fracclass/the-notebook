import { useState, useRef, useEffect } from "react";
import { THEME, TOPIC_COLORS, REGION_COLORS } from "./theme";

const T = THEME.color;

const TOPICS  = ["Energy","Technology","Markets","Consumer Trends","Environment","Deep Dive","Other"];
const REGIONS = ["Africa","Americas","Asia-Pacific","Europe","Middle East","Global"];

const now = () => new Date().toISOString();
const fmt = (iso) => new Date(iso).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});

const readingTime = (html) => {
  const text = html?.replace(/<[^>]+>/g,"") || "";
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

const SAMPLE = [
  {id:"1",title:"The Quiet Pivot in Battery Storage",topics:["Energy"],regions:["Global"],status:"public",
   author:"Franz-Frederick Acclassato",
   summary:"Utility-scale storage deployments are accelerating faster than most forecasters predicted.",
   body:`<p>For the better part of a decade, battery storage was treated as a footnote in energy transition models. That framing is now visibly wrong.</p><p>Across ERCOT, CAISO and the Australian NEM, four-hour lithium-iron-phosphate systems are increasingly setting the marginal price during evening ramp events.</p><h3>What to watch</h3><p>Capacity market reform in PJM will be the clearest signal of how incumbent generators and their lenders are positioned.</p>`,
   sources:[{label:"ERCOT Generation Mix Data",url:"https://www.ercot.com"},{label:"IRENA Battery Cost Trends 2024",url:"https://www.irena.org"}],
   createdAt:"2025-11-04T09:12:00Z",updatedAt:"2025-11-04T09:12:00Z"},
  {id:"2",title:"Why Nearshoring Hasn't Delivered — Yet",topics:["Markets","Deep Dive"],regions:["Americas"],status:"private",
   author:"Franz-Frederick Acclassato",
   summary:"The reshoring narrative captured boardrooms, but output data tells a more complicated story.",
   body:`<p>Since 2022, "friend-shoring" and "nearshoring" have become near-mandatory vocabulary in earnings calls.</p><p>The capex data supports the narrative in aggregate — greenfield FDI into Mexico hit a record in 2023. But the output numbers are lagging.</p><h3>The realistic timeline</h3><p>Expect the output inflection to appear in trade data around 2026–2027.</p>`,
   sources:[{label:"Banco de México FDI Statistics",url:"https://www.banxico.org.mx"}],
   createdAt:"2025-12-18T14:30:00Z",updatedAt:"2025-12-18T14:30:00Z"}
];

// Icons
const GlobeIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const LockIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const PlusIcon   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const BackIcon   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const TrashIcon  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const SaveIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const PenIcon    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const LinkIcon   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const LoginIcon  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const LogoutIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ImageIcon  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;
const MailIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const InfoIcon   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const XIcon      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const HamburgerIcon = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
    <line x1="0" y1="1"  x2="22" y2="1"  stroke="#b5522b" strokeWidth="2" strokeLinecap="round"/>
    <line x1="0" y1="8"  x2="22" y2="8"  stroke="#b5522b" strokeWidth="2" strokeLinecap="round"/>
    <line x1="0" y1="15" x2="22" y2="15" stroke="#b5522b" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// API
async function apiGetPosts() {
  try { const r=await fetch("/api/posts-get"); const d=await r.json(); return d.posts||null; } catch { return null; }
}
async function apiSetPosts(posts) {
  try { await fetch("/api/posts-set",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({posts})}); } catch {}
}
async function apiDeletePost(id) {
  try { await fetch("/api/posts-delete",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id})}); } catch {}
}
function initAuth() {
  try { return localStorage.getItem("nb_auth")==="true"; } catch { return false; }
}

// OG tags
function setMeta(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(property.startsWith("og:") ? "property" : "name", property); document.head.appendChild(el); }
  el.setAttribute("content", content);
}
function updateOGTags({ title, description, image } = {}) {
  const siteTitle = title ? `${title} — The Notebook` : "The Notebook";
  const siteDesc  = description || "Independent analysis on markets, energy, and the forces shaping the global economy.";
  document.title = siteTitle;
  setMeta("description", siteDesc);
  setMeta("og:title", siteTitle); setMeta("og:description", siteDesc);
  setMeta("og:url", window.location.href); setMeta("og:type", title ? "article" : "website");
  setMeta("og:site_name", "The Notebook");
  if (image) setMeta("og:image", image);
  setMeta("twitter:card", "summary_large_image"); setMeta("twitter:title", siteTitle); setMeta("twitter:description", siteDesc);
}

// Sidebar
function Sidebar({ isOpen, onClose, isAdmin, onLogin, onLogout, onNewArticle }) {
  const [panel, setPanel] = useState(null);
  const [cName,setCName]=useState(""); const [cEmail,setCEmail]=useState("");
  const [cSubject,setCSubject]=useState(""); const [cMessage,setCMessage]=useState("");
  const [cSent,setCSent]=useState(false);

  const sendContact = () => {
    if (!cName.trim() || !cEmail.trim() || !cMessage.trim()) return;
    const subject = encodeURIComponent(cSubject || "Message from thenotebook.press");
    const body    = encodeURIComponent(`Name: ${cName}\nEmail: ${cEmail}\n\n${cMessage}`);
    window.open(`mailto:contact@thenotebook.press?subject=${subject}&body=${body}`);
    setCSent(true);
    setTimeout(() => { setCSent(false); setCName(""); setCEmail(""); setCSubject(""); setCMessage(""); }, 4000);
  };

  const navBtn = (label, icon, onClick, active) => (
    <button onClick={onClick}
      style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"11px 16px",
        background:active?"#f5ede9":"transparent",border:"none",borderRadius:8,cursor:"pointer",
        fontSize:14,fontWeight:600,color:active?"#b5522b":"#555",textAlign:"left",transition:"all .15s"}}>
      <span style={{color:active?"#b5522b":"#999"}}>{icon}</span>{label}
    </button>
  );

  return (
    <>
      {isOpen&&<div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.35)",zIndex:200}}/>}
      <div style={{position:"fixed",top:0,left:0,height:"100vh",width:300,background:"#fff",zIndex:201,
        boxShadow:isOpen?"4px 0 24px rgba(0,0,0,.08)":"none",
        transform:isOpen?"translateX(0)":"translateX(-100%)",
        transition:"transform .25s cubic-bezier(.4,0,.2,1)",display:"flex",flexDirection:"column",overflow:"hidden"}}>

        <div style={{padding:"20px 20px 16px",borderBottom:"1px solid #ebebeb",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:18,color:"#111",letterSpacing:"-0.3px"}}>The Notebook</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb",padding:4,display:"flex",alignItems:"center"}}><XIcon/></button>
        </div>

        <nav style={{padding:"12px 12px 0",flex:1,overflowY:"auto"}}>
          {isAdmin&&<>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:"#bbb",padding:"8px 16px 4px"}}>Admin</div>
            {navBtn("New Article",<PlusIcon/>,()=>{onNewArticle();onClose();},false)}
            {navBtn("Logout",<LogoutIcon/>,()=>{onLogout();onClose();},false)}
          </>}
          {!isAdmin&&navBtn("Login",<LoginIcon/>,()=>{onLogin();onClose();},false)}
          <div style={{height:1,background:"#ebebeb",margin:"12px 0"}}/>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:"#bbb",padding:"8px 16px 4px"}}>Publication</div>
          {navBtn("About",<InfoIcon/>,()=>setPanel(panel==="about"?null:"about"),panel==="about")}
          {navBtn("Contact",<MailIcon/>,()=>setPanel(panel==="contact"?null:"contact"),panel==="contact")}
        </nav>

        {panel==="about"&&(
          <div style={{padding:"20px",borderTop:"1px solid #ebebeb",background:"#faf9f7",fontSize:13,lineHeight:1.8,color:"#555"}}>
            <div style={{fontWeight:700,color:"#111",marginBottom:10,fontSize:14}}>About The Notebook</div>
            <p style={{margin:"0 0 10px"}}>The Notebook is an independent analysis publication. We write about the forces shaping economies, industries, and markets : from the energy transition to the technology shifts transforming the world as we know it.</p>
            <p style={{margin:0}}>Our analysis is built on research, expert insight, data, and news — cross-referenced against the human reality behind the numbers. We write to understand, and to share what we find as clearly as possible.</p>
          </div>
        )}

        {panel==="contact"&&(
          <div style={{padding:"20px",borderTop:"1px solid #ebebeb",background:"#faf9f7"}}>
            <div style={{fontWeight:700,color:"#111",marginBottom:14,fontSize:14}}>Get in touch</div>
            {cSent?(
              <div style={{textAlign:"center",padding:"20px 0",color:"#b5522b",fontWeight:600,fontSize:14}}>✓ Message sent — thank you!</div>
            ):(
              <>
                {[["Name",cName,setCName,"Your name","text"],["Email",cEmail,setCEmail,"your@email.com","email"],["Subject",cSubject,setCSubject,"What's this about?","text"]].map(([label,val,setter,ph,type])=>(
                  <div key={label} style={{marginBottom:10}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#999",marginBottom:4}}>{label}</div>
                    <input type={type} value={val} onChange={e=>setter(e.target.value)} placeholder={ph}
                      style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",border:"1px solid #ebebeb",borderRadius:6,fontSize:13,outline:"none",background:"#fff",color:"#111"}}/>
                  </div>
                ))}
                <div style={{marginBottom:12}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#999",marginBottom:4}}>Message</div>
                  <textarea value={cMessage} onChange={e=>setCMessage(e.target.value)} placeholder="Your message…" rows={4}
                    style={{width:"100%",boxSizing:"border-box",padding:"8px 10px",border:"1px solid #ebebeb",borderRadius:6,fontSize:13,outline:"none",resize:"vertical",background:"#fff",color:"#111",lineHeight:1.5}}/>
                </div>
                <button onClick={sendContact}
                  style={{width:"100%",padding:"10px",background:"#b5522b",color:"#fff",border:"none",borderRadius:7,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  Send Message
                </button>
              </>
            )}
          </div>
        )}

        <div style={{padding:"14px 20px",borderTop:"1px solid #ebebeb",fontSize:11,color:"#bbb"}}>
          © {new Date().getFullYear()} The Notebook
        </div>
      </div>
    </>
  );
}

function LoginModal({ onLogin, onClose }) {
  const [pw,setPw]=useState(""); const [error,setError]=useState(""); const [loading,setLoading]=useState(false);
  const attempt = async () => {
    if(!pw.trim())return; setLoading(true); setError("");
    try {
      if(window.location.hostname==="localhost"){
        if(pw==="localtest"){onLogin("local-token");}else{setError("Incorrect password");setPw("");}
        setLoading(false); return;
      }
      const res=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pw})});
      const data=await res.json();
      if(data.success){onLogin(data.token);}else{setError("Incorrect password");setPw("");}
    } catch {setError("Connection error, try again");}
    setLoading(false);
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300}}>
      <div style={{background:"#fff",borderRadius:18,padding:"44px 48px",width:380,boxShadow:"0 24px 64px rgba(0,0,0,.2)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:52,height:52,background:"#111",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",color:"#fff"}}><LoginIcon/></div>
          <h2 style={{fontSize:21,fontWeight:700,margin:"0 0 6px",color:"#111"}}>Admin Login</h2>
          <p style={{fontSize:14,color:"#999",margin:0}}>Private articles are password protected</p>
        </div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} placeholder="Enter password" autoFocus
          style={{width:"100%",boxSizing:"border-box",padding:"12px 14px",border:`1px solid ${error?"#e53e3e":"#e0e0e0"}`,borderRadius:9,fontSize:15,marginBottom:error?6:14,outline:"none"}}/>
        {error&&<p style={{color:"#e53e3e",fontSize:13,margin:"0 0 12px"}}>{error}</p>}
        <button onClick={attempt} disabled={loading}
          style={{width:"100%",padding:"12px",background:"#111",color:"#fff",border:"none",borderRadius:9,fontSize:15,fontWeight:600,cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,marginBottom:10}}>
          {loading?"Checking…":"Login"}</button>
        <button onClick={onClose} style={{width:"100%",padding:"11px",background:"none",color:"#999",border:"1px solid #eee",borderRadius:9,fontSize:14,cursor:"pointer"}}>Cancel</button>
      </div>
    </div>
  );
}

function MultiPicker({ label, options, colors, selected, onChange }) {
  return (
    <div style={{marginBottom:16}}>
      <div style={{fontSize:11,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:"#bbb",marginBottom:8}}>{label}</div>
      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
        {options.map(opt => {
          const active=selected.includes(opt); const color=colors[opt]||"#555";
          return <button key={opt} onClick={()=>onChange(active?selected.filter(s=>s!==opt):[...selected,opt])}
            style={{padding:"5px 13px",borderRadius:20,border:`1px solid ${active?color:"#ddd"}`,fontSize:12,cursor:"pointer",
              fontWeight:600,background:active?color:"#fff",color:active?"#fff":color,transition:"all .15s"}}>{opt}</button>;
        })}
      </div>
    </div>
  );
}

function RichEditor({ value, onChange }) {
  const ref=useRef(null); const imgInput=useRef(null);
  useEffect(()=>{ if(ref.current) ref.current.innerHTML=value||"<p><br></p>"; },[]);
  const exec=(cmd,val)=>{ ref.current?.focus(); document.execCommand(cmd,false,val); onChange(ref.current?.innerHTML||""); };
  const insertImage=(e)=>{
    const file=e.target.files[0]; if(!file)return;
    const reader=new FileReader();
    reader.onload=(ev)=>{ ref.current?.focus(); document.execCommand("insertHTML",false,`<img src="${ev.target.result}" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;display:block;" />`); onChange(ref.current?.innerHTML||""); };
    reader.readAsDataURL(file); e.target.value="";
  };
  return (
    <div style={{border:"1px solid #e0e0e0",borderRadius:10,overflow:"hidden",background:"#fff"}}>
      <div style={{display:"flex",gap:3,padding:"8px 12px",background:"#f7f7f5",borderBottom:"1px solid #eee",flexWrap:"wrap",alignItems:"center"}}>
        {[["bold","B"],["italic","I"],["underline","U"]].map(([cmd,lbl])=>(
          <button key={cmd} onMouseDown={e=>{e.preventDefault();exec(cmd);}}
            style={{fontWeight:cmd==="bold"?"bold":"normal",fontStyle:cmd==="italic"?"italic":"normal",textDecoration:cmd==="underline"?"underline":"none",
              background:"#fff",border:"1px solid #ddd",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:13,color:"#333"}}>{lbl}</button>
        ))}
        <div style={{width:1,background:"#ddd",height:18,margin:"0 4px"}}/>
        {[["H2","formatBlock","h2"],["H3","formatBlock","h3"],["P","formatBlock","p"]].map(([lbl,cmd,val])=>(
          <button key={lbl} onMouseDown={e=>{e.preventDefault();exec(cmd,val);}}
            style={{background:"#fff",border:"1px solid #ddd",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:"#333"}}>{lbl}</button>
        ))}
        <div style={{width:1,background:"#ddd",height:18,margin:"0 4px"}}/>
        <button onMouseDown={e=>{e.preventDefault();exec("insertUnorderedList");}} style={{background:"#fff",border:"1px solid #ddd",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:"#333"}}>• List</button>
        <button onMouseDown={e=>{e.preventDefault();exec("formatBlock","blockquote");}} style={{background:"#fff",border:"1px solid #ddd",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:"#333"}}>" Quote</button>
        <button onMouseDown={e=>{e.preventDefault();const u=prompt("URL:");if(u)exec("createLink",u);}}
          style={{display:"flex",alignItems:"center",gap:4,background:"#fff",border:"1px solid #ddd",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:"#333"}}><LinkIcon/> Link</button>
        <div style={{width:1,background:"#ddd",height:18,margin:"0 4px"}}/>
        <button onMouseDown={e=>{e.preventDefault();imgInput.current?.click();}}
          style={{display:"flex",alignItems:"center",gap:4,background:"#fff",border:"1px solid #ddd",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:"#333"}}><ImageIcon/> Image</button>
        <input ref={imgInput} type="file" accept="image/*" onChange={insertImage} style={{display:"none"}}/>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning
        onInput={e=>onChange(e.currentTarget.innerHTML)}
        onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();document.execCommand("insertParagraph");}}}
        style={{minHeight:"calc(100vh - 420px)",padding:"28px 32px",fontSize:17,lineHeight:1.8,color:"#1a1a1a",outline:"none",
          fontFamily:"Georgia,serif",direction:"ltr",textAlign:"left",unicodeBidi:"embed",
          writingMode:"horizontal-tb",WebkitWritingMode:"horizontal-tb",wordBreak:"break-word"}}/>
    </div>
  );
}

function SourceMgr({ sources, onChange }) {
  const [lbl,setLbl]=useState(""); const [url,setUrl]=useState("");
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
        <input value={lbl} onChange={e=>setLbl(e.target.value)} placeholder="Source name" style={{flex:"1 1 140px",padding:"7px 12px",border:"1px solid #ddd",borderRadius:7,fontSize:13}}/>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." style={{flex:"2 1 200px",padding:"7px 12px",border:"1px solid #ddd",borderRadius:7,fontSize:13}}/>
        <button onClick={()=>{if(!lbl.trim())return;onChange([...sources,{label:lbl.trim(),url:url.trim()}]);setLbl("");setUrl("");}}
          style={{padding:"7px 16px",background:"#1a1a1a",color:"#fff",border:"none",borderRadius:7,cursor:"pointer",fontSize:13}}>Add</button>
      </div>
      {sources.map((s,i)=>(
        <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",background:"#f9f9f7",borderRadius:7,marginBottom:5,fontSize:13}}>
          <LinkIcon/><span style={{flex:1,fontWeight:600}}>{s.label}</span>
          {s.url&&<span style={{color:"#999",fontSize:12}}>{s.url.replace(/^https?:\/\//,"").slice(0,36)}</span>}
          <button onClick={()=>onChange(sources.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",color:"#bbb"}}><TrashIcon/></button>
        </div>
      ))}
    </div>
  );
}

function FilterBar({ filterTopic,setFilterTopic,filterRegion,setFilterRegion,isAdmin,filterStatus,setFilterStatus,search,setSearch }) {
  return (
    <div style={{marginBottom:28}}>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search articles…"
          style={{padding:"8px 14px",border:"1px solid #ddd",borderRadius:8,fontSize:13,width:200,outline:"none",background:"#fff"}}/>
        {isAdmin&&(
          <div style={{display:"flex",border:"1px solid #ddd",borderRadius:8,overflow:"hidden"}}>
            {["All","public","private"].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)}
                style={{padding:"7px 13px",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                  background:filterStatus===s?"#111":"#fff",color:filterStatus===s?"#fff":"#666"}}>
                {s==="All"?"All":s==="public"?"Public":"Private"}</button>
            ))}
          </div>
        )}
      </div>
      <div style={{marginBottom:10}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"#bbb",marginBottom:6}}>Topic</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["All",...TOPICS].map(t=>{
            const active=filterTopic===t; const color=TOPIC_COLORS[t]||"#111";
            return <button key={t} onClick={()=>setFilterTopic(t)}
              style={{padding:"5px 13px",borderRadius:20,border:`1px solid ${active?(t==="All"?"#111":color):"#e0e0e0"}`,
                fontSize:12,cursor:"pointer",fontWeight:600,transition:"all .15s",
                background:active?(t==="All"?"#111":color):"#fff",
                color:active?"#fff":(t==="All"?"#555":color)}}>{t}</button>;
          })}
        </div>
      </div>
      <div>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"#bbb",marginBottom:6}}>Region</div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {["All",...REGIONS].map(r=>{
            const active=filterRegion===r; const color=REGION_COLORS[r]||"#555";
            return <button key={r} onClick={()=>setFilterRegion(r)}
              style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${active?(r==="All"?"#111":color):"#e8e8e8"}`,
                fontSize:11,cursor:"pointer",fontWeight:600,transition:"all .15s",
                background:active?(r==="All"?"#111":color):"#fafafa",
                color:active?"#fff":(r==="All"?"#666":color)}}>{r}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

function Card({ post, onClick, onDelete, isAdmin }) {
  const imgMatch=post.body?.match(/<img[^>]+src="([^"]+)"/); const thumb=imgMatch?.[1];
  const rTime=readingTime(post.body);
  return (
    <div onClick={onClick}
      style={{cursor:"pointer",background:"#fff",borderRadius:14,border:"1px solid #ebebeb",overflow:"hidden",transition:"all .15s",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.09)";e.currentTarget.style.transform="translateY(-2px)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.04)";e.currentTarget.style.transform="none";}}>
      {thumb&&<div style={{height:160,overflow:"hidden",background:"#f0f0f0"}}><img src={thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/></div>}
      <div style={{padding:"22px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,flex:1}}>
            {(post.topics||[]).map(t=>(
              <span key={t} style={{fontSize:10,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:TOPIC_COLORS[t]||"#555",borderLeft:`3px solid ${TOPIC_COLORS[t]||"#555"}`,paddingLeft:7}}>{t}</span>
            ))}
            {(post.regions||[]).map(r=>(
              <span key={r} style={{fontSize:10,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase",color:REGION_COLORS[r]||"#888",background:`${REGION_COLORS[r]}18`,padding:"2px 7px",borderRadius:10}}>{r}</span>
            ))}
          </div>
          <div style={{display:"flex",gap:7,alignItems:"center",flexShrink:0,marginLeft:8}}>
            {isAdmin&&<span style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,
              color:post.status==="public"?"#1a6b3c":"#888",background:post.status==="public"?"#e6f4ed":"#f2f2f2"}}>
              {post.status==="public"?<GlobeIcon/>:<LockIcon/>}{post.status==="public"?"Public":"Private"}</span>}
            {isAdmin&&<button onClick={e=>{e.stopPropagation();if(window.confirm("Delete this article?"))onDelete(post.id);}}
              style={{background:"none",border:"none",cursor:"pointer",color:"#ddd",padding:2}}><TrashIcon/></button>}
          </div>
        </div>
        <h2 style={{fontSize:19,fontWeight:700,lineHeight:1.3,margin:"0 0 9px",color:"#111",fontFamily:"Georgia,serif"}}>{post.title}</h2>
        <p style={{fontSize:14,color:"#777",lineHeight:1.6,margin:"0 0 18px"}}>{post.summary}</p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,color:"#bbb"}}>
          <span>{post.author&&<span style={{color:"#aaa",marginRight:6}}>{post.author} · </span>}{fmt(post.updatedAt)}</span>
          <span style={{background:"#f5f5f3",padding:"2px 8px",borderRadius:8,fontSize:11,fontWeight:600,color:"#aaa"}}>{rTime}</span>
        </div>
      </div>
    </div>
  );
}

function Editor({ post, onSave, onBack }) {
  const [title,setTitle]=useState(post.title||""); const [topics,setTopics]=useState(post.topics||[]);
  const [regions,setRegions]=useState(post.regions||[]); const [status,setStatus]=useState(post.status||"private");
  const [summary,setSummary]=useState(post.summary||""); const [author,setAuthor]=useState(post.author||"");
  const [body,setBody]=useState(post.body||"<p><br></p>"); const [sources,setSources]=useState(post.sources||[]);
  const [flash,setFlash]=useState(false);
  const save=()=>{ const p={...post,id:post.id||String(Date.now()),title,topics,regions,status,summary,author,body,sources,createdAt:post.createdAt||now(),updatedAt:now()}; onSave(p); setFlash(true); setTimeout(()=>setFlash(false),2000); };
  return (
    <div style={{width:"100%",boxSizing:"border-box",padding:"32px 48px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #e0e0e0",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,color:"#555"}}><BackIcon/> Back</button>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:13,color:flash?"#1a6b3c":"transparent",transition:"color .3s",fontWeight:600}}>✓ Saved</span>
          <button onClick={save} style={{display:"flex",alignItems:"center",gap:6,background:"#111",color:"#fff",border:"none",borderRadius:8,padding:"9px 20px",cursor:"pointer",fontSize:14,fontWeight:600}}><SaveIcon/> Save</button>
        </div>
      </div>
      <div style={{display:"flex",border:"1px solid #ddd",borderRadius:8,overflow:"hidden",marginBottom:24,width:"fit-content"}}>
        {["public","private"].map(s=>(
          <button key={s} onClick={()=>setStatus(s)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 16px",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,background:status===s?"#111":"#fff",color:status===s?"#fff":"#666"}}>
            {s==="public"?<GlobeIcon/>:<LockIcon/>}{s==="public"?"Public":"Private"}</button>
        ))}
      </div>
      <MultiPicker label="Topics" options={TOPICS} colors={TOPIC_COLORS} selected={topics} onChange={setTopics}/>
      <MultiPicker label="Region" options={REGIONS} colors={REGION_COLORS} selected={regions} onChange={setRegions}/>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Article title…"
        style={{width:"100%",boxSizing:"border-box",fontSize:32,fontWeight:700,fontFamily:"Georgia,serif",border:"none",borderBottom:"2px solid #eee",padding:"6px 0",marginBottom:14,outline:"none",color:"#111",background:"transparent",marginTop:10}}/>
      <textarea value={summary} onChange={e=>setSummary(e.target.value)} placeholder="One-sentence summary / lede…" rows={2}
        style={{width:"100%",boxSizing:"border-box",fontSize:15,fontFamily:"Georgia,serif",fontStyle:"italic",color:"#666",border:"none",borderBottom:"1px solid #eee",padding:"6px 0",marginBottom:14,outline:"none",resize:"none",lineHeight:1.6,background:"transparent"}}/>
      <input value={author} onChange={e=>setAuthor(e.target.value)} placeholder="Author name…"
        style={{width:"100%",boxSizing:"border-box",fontSize:14,border:"none",borderBottom:"1px solid #eee",padding:"6px 0",marginBottom:26,outline:"none",color:"#555",background:"transparent"}}/>
      <div style={{marginBottom:30}}>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:"#bbb",marginBottom:10}}>Body</div>
        <RichEditor value={body} onChange={setBody}/>
      </div>
      <div>
        <div style={{fontSize:11,fontWeight:700,letterSpacing:1.1,textTransform:"uppercase",color:"#bbb",marginBottom:10}}>Sources & References</div>
        <SourceMgr sources={sources} onChange={setSources}/>
      </div>
    </div>
  );
}

function Reader({ post, onEdit, onBack, isAdmin }) {
  const rTime=readingTime(post.body);
  const imgMatch=post.body?.match(/<img[^>]+src="([^"]+)"/); const thumb=imgMatch?.[1];
  useEffect(()=>{ updateOGTags({title:post.title,description:post.summary,image:thumb}); return ()=>updateOGTags({}); },[post.title,post.summary,thumb]);
  return (
    <div style={{maxWidth:740,margin:"0 auto",padding:"32px 0 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:40}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #e0e0e0",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,color:"#555"}}><BackIcon/> Back</button>
        {isAdmin&&<button onClick={onEdit} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #333",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,color:"#333",fontWeight:600}}><PenIcon/> Edit</button>}
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",marginBottom:14}}>
        {(post.topics||[]).map(t=><span key={t} style={{fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:TOPIC_COLORS[t]||"#555",borderLeft:`3px solid ${TOPIC_COLORS[t]||"#555"}`,paddingLeft:9}}>{t}</span>)}
        {(post.regions||[]).map(r=><span key={r} style={{fontSize:10,fontWeight:600,letterSpacing:0.8,textTransform:"uppercase",color:REGION_COLORS[r]||"#888",background:`${REGION_COLORS[r]}22`,padding:"3px 9px",borderRadius:10}}>{r}</span>)}
        {isAdmin&&<span style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,color:post.status==="public"?"#1a6b3c":"#888",background:post.status==="public"?"#e6f4ed":"#f2f2f2"}}>
          {post.status==="public"?<GlobeIcon/>:<LockIcon/>}{post.status==="public"?"Public":"Private"}</span>}
      </div>
      <h1 style={{fontSize:40,fontWeight:700,lineHeight:1.2,margin:"0 0 16px",color:"#111",fontFamily:"Georgia,serif"}}>{post.title}</h1>
      <p style={{fontSize:18,color:"#666",fontStyle:"italic",lineHeight:1.65,marginBottom:14,fontFamily:"Georgia,serif"}}>{post.summary}</p>
      <div style={{fontSize:13,color:"#bbb",marginBottom:40,paddingBottom:22,borderBottom:"1px solid #eee",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>{post.author&&<span style={{fontWeight:600,color:"#555",marginRight:6}}>By {post.author} · </span>}{fmt(post.createdAt)}{post.updatedAt!==post.createdAt&&<span> · Last revised {fmt(post.updatedAt)}</span>}</span>
        <span style={{background:"#f5f5f3",padding:"3px 10px",borderRadius:8,fontSize:11,fontWeight:600,color:"#aaa",flexShrink:0}}>{rTime}</span>
      </div>
      <div style={{fontSize:17,lineHeight:1.85,color:"#1a1a1a",fontFamily:"Georgia,serif"}} dangerouslySetInnerHTML={{__html:post.body}}/>
      {post.sources?.length>0&&(
        <div style={{marginTop:52,paddingTop:26,borderTop:"1px solid #eee"}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color:"#bbb",marginBottom:16}}>Sources & References</div>
          {post.sources.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:10,marginBottom:9,fontSize:14}}>
              <span style={{color:"#ccc",minWidth:18}}>{i+1}.</span>
              {s.url?<a href={s.url} target="_blank" rel="noreferrer" style={{color:"#333",textDecoration:"underline"}}>{s.label}</a>:<span style={{color:"#333"}}>{s.label}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer style={{borderTop:"1px solid #ebebeb",background:"#fff",marginTop:80}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 40px",display:"flex",flexWrap:"wrap",justifyContent:"space-between",alignItems:"center",gap:12}}>
        <div>
          <span style={{fontFamily:"Georgia,serif",fontWeight:800,fontSize:15,color:"#111",letterSpacing:"-0.3px"}}>The Notebook</span>
          <span style={{display:"block",fontSize:11,color:"#bbb",marginTop:3}}>Independent analysis publication</span>
        </div>
        <div style={{fontSize:11,color:"#bbb",textAlign:"center",lineHeight:1.8}}>
          <div>© {new Date().getFullYear()} The Notebook · Franz-Frederick Acclassato · All rights reserved</div>
          <div>Published content is for informational and educational purposes, powered by the drive to discover and explain.</div>
        </div>
        <a href="https://thenotebook.press" style={{fontSize:11,color:"#bbb",textDecoration:"none"}}>thenotebook.press</a>
      </div>
    </footer>
  );
}

export default function App() {
  const [posts,setPosts]=useState([]); const [loading,setLoading]=useState(true);
  const [view,setView]=useState("home"); const [activeId,setActiveId]=useState(null);
  const [filterTopic,setFilterTopic]=useState("All"); const [filterRegion,setFilterRegion]=useState("All");
  const [filterStatus,setFilterStatus]=useState("All"); const [search,setSearch]=useState("");
  const [isAdmin,setIsAdmin]=useState(initAuth); const [showLogin,setShowLogin]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false);

  useEffect(()=>{ apiGetPosts().then(data=>{setPosts(data||SAMPLE);setLoading(false);}); },[]);
  useEffect(()=>{ if(view==="home") updateOGTags({}); },[view]);

  const saveAll=async(updated)=>{setPosts(updated);await apiSetPosts(updated);};
  const handleSave=(p)=>saveAll(posts.find(x=>x.id===p.id)?posts.map(x=>x.id===p.id?p:x):[p,...posts]);
  const handleDelete=async(id)=>{const updated=posts.filter(p=>p.id!==id);setPosts(updated);await apiDeletePost(id);};
  const activePost=posts.find(p=>p.id===activeId)||{};
  const handleLogin=(token)=>{setIsAdmin(true);try{localStorage.setItem("nb_auth","true");localStorage.setItem("nb_token",token);}catch{}setShowLogin(false);};
  const handleLogout=()=>{setIsAdmin(false);try{localStorage.removeItem("nb_auth");localStorage.removeItem("nb_token");}catch{};};

  const visiblePosts=posts.filter(p=>isAdmin?true:p.status==="public");
  const visible=visiblePosts.filter(p=>{
    if(filterTopic!=="All"&&!(p.topics||[]).includes(filterTopic))return false;
    if(filterRegion!=="All"&&!(p.regions||[]).includes(filterRegion))return false;
    if(isAdmin&&filterStatus!=="All"&&p.status!==filterStatus)return false;
    if(search&&!p.title.toLowerCase().includes(search.toLowerCase())&&!p.summary?.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });
  const pub=posts.filter(p=>p.status==="public").length;

  const sidebar=(
    <Sidebar isOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)} isAdmin={isAdmin}
      onLogin={()=>{setSidebarOpen(false);setShowLogin(true);}}
      onLogout={()=>{handleLogout();setSidebarOpen(false);}}
      onNewArticle={()=>{setActiveId(null);setView("new");}}/>
  );

  const Header=()=>(
    <header style={{background:"#fff",borderBottom:"1px solid #ebebeb",padding:"0 24px",position:"sticky",top:0,zIndex:100}}>
      <div style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",height:62}}>
        <div style={{display:"flex",alignItems:"center",gap:18}}>
          <button onClick={()=>setSidebarOpen(true)} style={{background:"none",border:"none",cursor:"pointer",padding:"6px 4px",display:"flex",alignItems:"center",lineHeight:0}}>
            <HamburgerIcon/>
          </button>
          <div style={{display:"flex",alignItems:"baseline",gap:12}}>
            <span onClick={()=>setView("home")} style={{fontSize:21,fontWeight:800,fontFamily:"Georgia,serif",color:"#111",letterSpacing:"-0.5px",cursor:"pointer"}}>The Notebook</span>
            <span style={{fontSize:12,color:"#bbb"}}>{isAdmin?`${pub} public · ${posts.length-pub} private`:`${pub} article${pub!==1?"s":""}`}</span>
          </div>
        </div>
        {isAdmin&&(
          <button onClick={()=>{setActiveId(null);setView("new");}} style={{display:"flex",alignItems:"center",gap:7,background:"#111",color:"#fff",border:"none",borderRadius:9,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:600}}>
            <PlusIcon/> New Article
          </button>
        )}
      </div>
    </header>
  );

  if(loading) return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#faf9f7"}}><div style={{fontSize:14,color:"#aaa",fontFamily:"Georgia,serif"}}>Loading…</div></div>;

  if(view==="read") return (
    <div style={{minHeight:"100vh",width:"100%",background:"#faf9f7",display:"flex",flexDirection:"column"}}>
      {sidebar}{showLogin&&<LoginModal onLogin={handleLogin} onClose={()=>setShowLogin(false)}/>}
      <Header/>
      <div style={{flex:1,padding:"36px 48px"}}><Reader post={activePost} onBack={()=>setView("home")} onEdit={()=>setView("edit")} isAdmin={isAdmin}/></div>
      <Footer/>
    </div>
  );

  if(view==="edit"||view==="new") return (
    <div style={{minHeight:"100vh",width:"100%",background:"#faf9f7"}}>
      {sidebar}<Header/>
      <Editor post={view==="new"?{}:activePost} onSave={p=>{handleSave(p);setActiveId(p.id);setView("read");}} onBack={()=>setView(activeId?"read":"home")}/>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",width:"100%",background:"#faf9f7",fontFamily:"system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
      {sidebar}{showLogin&&<LoginModal onLogin={handleLogin} onClose={()=>setShowLogin(false)}/>}
      <Header/>
      <main style={{flex:1,width:"100%",boxSizing:"border-box",padding:"34px 40px"}}>
        <FilterBar filterTopic={filterTopic} setFilterTopic={setFilterTopic} filterRegion={filterRegion} setFilterRegion={setFilterRegion}
          isAdmin={isAdmin} filterStatus={filterStatus} setFilterStatus={setFilterStatus} search={search} setSearch={setSearch}/>
        {visible.length===0?(
          <div style={{textAlign:"center",padding:"90px 0"}}><div style={{fontSize:17,fontWeight:600,color:"#aaa",marginBottom:6}}>New articles coming soon!</div></div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:20}}>
            {visible.map(p=><Card key={p.id} post={p} onClick={()=>{setActiveId(p.id);setView("read");}} onDelete={handleDelete} isAdmin={isAdmin}/>)}
          </div>
        )}
      </main>
      <Footer/>
    </div>
  );
}