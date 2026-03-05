import { useState, useRef, useEffect } from "react";

const TOPICS = ["Markets","Technology","Geopolitics","Energy","Consumer Trends","Macro","Health","Climate","Other"];
const TOPIC_COLORS = {"Markets":"#1a6b3c","Technology":"#1a3a6b","Geopolitics":"#6b1a1a","Energy":"#6b4c1a","Consumer Trends":"#4c1a6b","Macro":"#1a5f6b","Health":"#6b1a4c","Climate":"#2d6b1a","Other":"#555"};
const now = () => new Date().toISOString();
const fmt = (iso) => new Date(iso).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"});

const SAMPLE = [
  {id:"1",title:"The Quiet Pivot in Battery Storage",topic:"Energy",status:"public",summary:"Utility-scale storage deployments are accelerating faster than most forecasters predicted.",body:`<p>For the better part of a decade, battery storage was treated as a footnote in energy transition models. That framing is now visibly wrong.</p><p>Across ERCOT, CAISO and the Australian NEM, four-hour lithium-iron-phosphate systems are increasingly setting the marginal price during evening ramp events.</p><h3>What to watch</h3><p>Capacity market reform in PJM will be the clearest signal of how incumbent generators and their lenders are positioned.</p>`,sources:[{label:"ERCOT Generation Mix Data",url:"https://www.ercot.com"},{label:"IRENA Battery Cost Trends 2024",url:"https://www.irena.org"}],createdAt:"2025-11-04T09:12:00Z",updatedAt:"2025-11-04T09:12:00Z"},
  {id:"2",title:"Why Nearshoring Hasn't Delivered — Yet",topic:"Macro",status:"private",summary:"The reshoring narrative captured boardrooms, but output data tells a more complicated story.",body:`<p>Since 2022, "friend-shoring" and "nearshoring" have become near-mandatory vocabulary in earnings calls.</p><p>The capex data supports the narrative in aggregate — greenfield FDI into Mexico hit a record in 2023. But the output numbers are lagging.</p><h3>The realistic timeline</h3><p>Expect the output inflection to appear in trade data around 2026–2027.</p>`,sources:[{label:"Banco de México FDI Statistics",url:"https://www.banxico.org.mx"}],createdAt:"2025-12-18T14:30:00Z",updatedAt:"2025-12-18T14:30:00Z"}
];

const GlobeIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
const LockIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const PlusIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const BackIcon = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>;
const TrashIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const SaveIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>;
const PenIcon = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const LinkIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>;
const LoginIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>;
const LogoutIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
const ImageIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>;

function initPosts() {
  try { const r = localStorage.getItem("nb_posts"); return r ? JSON.parse(r) : SAMPLE; } catch { return SAMPLE; }
}
function savePosts(p) { try { localStorage.setItem("nb_posts", JSON.stringify(p)); } catch {} }
function initAuth() {
  try { return localStorage.getItem("nb_auth") === "true"; } catch { return false; }
}

function LoginModal({ onLogin, onClose }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const attempt = async () => {
    if (!pw.trim()) return;
    setLoading(true); setError("");
    try {
      if (window.location.hostname === "localhost") {
        if (pw === "localtest") { onLogin("local-token"); }
        else { setError("Incorrect password"); setPw(""); }
        setLoading(false); return;
      }
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const data = await res.json();
      if (data.success) { onLogin(data.token); }
      else { setError("Incorrect password"); setPw(""); }
    } catch { setError("Connection error, try again"); }
    setLoading(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"#fff",borderRadius:18,padding:"44px 48px",width:380,boxShadow:"0 24px 64px rgba(0,0,0,.2)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:52,height:52,background:"#111",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}>
            <LoginIcon/>
          </div>
          <h2 style={{fontSize:21,fontWeight:700,margin:"0 0 6px",color:"#111"}}>Admin Login</h2>
          <p style={{fontSize:14,color:"#999",margin:0}}>Private articles are password protected</p>
        </div>
        <input type="password" value={pw} onChange={e=>setPw(e.target.value)}
          onKeyDown={e=>e.key==="Enter"&&attempt()} placeholder="Enter password" autoFocus
          style={{width:"100%",boxSizing:"border-box",padding:"12px 14px",border:`1px solid ${error?"#e53e3e":"#e0e0e0"}`,borderRadius:9,fontSize:15,marginBottom:error?6:14,outline:"none"}}/>
        {error&&<p style={{color:"#e53e3e",fontSize:13,margin:"0 0 12px"}}>{error}</p>}
        <button onClick={attempt} disabled={loading}
          style={{width:"100%",padding:"12px",background:"#111",color:"#fff",border:"none",borderRadius:9,fontSize:15,fontWeight:600,cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,marginBottom:10}}>
          {loading?"Checking…":"Login"}
        </button>
        <button onClick={onClose}
          style={{width:"100%",padding:"11px",background:"none",color:"#999",border:"1px solid #eee",borderRadius:9,fontSize:14,cursor:"pointer"}}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function RichEditor({ value, onChange }) {
  const ref = useRef(null);
  const imgInput = useRef(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = value || "<p><br></p>";
    }
  }, []);

  const exec = (cmd, val) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    onChange(ref.current?.innerHTML || "");
  };

  const insertImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      ref.current?.focus();
      document.execCommand("insertHTML", false,
        `<img src="${ev.target.result}" style="max-width:100%;height:auto;border-radius:8px;margin:12px 0;display:block;" />`);
      onChange(ref.current?.innerHTML || "");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div style={{border:"1px solid #e0e0e0",borderRadius:10,overflow:"hidden",background:"#fff"}}>
      <div style={{display:"flex",gap:3,padding:"8px 12px",background:"#f7f7f5",borderBottom:"1px solid #eee",flexWrap:"wrap",alignItems:"center"}}>
        {[["bold","B"],["italic","I"],["underline","U"]].map(([cmd,lbl])=>(
          <button key={cmd} onMouseDown={e=>{e.preventDefault();exec(cmd);}}
            style={{fontWeight:cmd==="bold"?"bold":"normal",fontStyle:cmd==="italic"?"italic":"normal",
              textDecoration:cmd==="underline"?"underline":"none",background:"#fff",border:"1px solid #ddd",
              borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:13,color:"#333"}}>{lbl}</button>
        ))}
        <div style={{width:1,background:"#ddd",height:18,margin:"0 4px"}}/>
        {[["H2","formatBlock","h2"],["H3","formatBlock","h3"],["P","formatBlock","p"]].map(([lbl,cmd,val])=>(
          <button key={lbl} onMouseDown={e=>{e.preventDefault();exec(cmd,val);}}
            style={{background:"#fff",border:"1px solid #ddd",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:"#333"}}>{lbl}</button>
        ))}
        <div style={{width:1,background:"#ddd",height:18,margin:"0 4px"}}/>
        <button onMouseDown={e=>{e.preventDefault();exec("insertUnorderedList");}}
          style={{background:"#fff",border:"1px solid #ddd",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:"#333"}}>• List</button>
        <button onMouseDown={e=>{e.preventDefault();exec("formatBlock","blockquote");}}
          style={{background:"#fff",border:"1px solid #ddd",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:"#333"}}>" Quote</button>
        <button onMouseDown={e=>{e.preventDefault();const u=prompt("URL:");if(u)exec("createLink",u);}}
          style={{display:"flex",alignItems:"center",gap:4,background:"#fff",border:"1px solid #ddd",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:"#333"}}>
          <LinkIcon/> Link</button>
        <div style={{width:1,background:"#ddd",height:18,margin:"0 4px"}}/>
        <button onMouseDown={e=>{e.preventDefault();imgInput.current?.click();}}
          style={{display:"flex",alignItems:"center",gap:4,background:"#fff",border:"1px solid #ddd",borderRadius:5,padding:"2px 9px",cursor:"pointer",fontSize:12,color:"#333"}}>
          <ImageIcon/> Image</button>
        <input ref={imgInput} type="file" accept="image/*" onChange={insertImage} style={{display:"none"}}/>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={e => onChange(e.currentTarget.innerHTML)}
        onKeyDown={e => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            document.execCommand("insertParagraph");
          }
        }}
        style={{
          minHeight:"calc(100vh - 340px)",
          padding:"28px 32px",
          fontSize:17,
          lineHeight:1.8,
          color:"#1a1a1a",
          outline:"none",
          fontFamily:"Georgia,serif",
          direction:"ltr",
          textAlign:"left",
          unicodeBidi:"embed",
          writingMode:"horizontal-tb",
          WebkitWritingMode:"horizontal-tb",
          wordBreak:"break-word"
        }}
      />
    </div>
  );
}

function SourceMgr({ sources, onChange }) {
  const [lbl,setLbl]=useState(""); const [url,setUrl]=useState("");
  return (
    <div>
      <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
        <input value={lbl} onChange={e=>setLbl(e.target.value)} placeholder="Source name"
          style={{flex:"1 1 140px",padding:"7px 12px",border:"1px solid #ddd",borderRadius:7,fontSize:13}}/>
        <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..."
          style={{flex:"2 1 200px",padding:"7px 12px",border:"1px solid #ddd",borderRadius:7,fontSize:13}}/>
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

function Card({ post, onClick, onDelete, isAdmin }) {
  const color = TOPIC_COLORS[post.topic]||"#555";
  const imgMatch = post.body?.match(/<img[^>]+src="([^"]+)"/);
  const thumb = imgMatch?.[1];
  return (
    <div onClick={onClick}
      style={{cursor:"pointer",background:"#fff",borderRadius:14,border:"1px solid #ebebeb",overflow:"hidden",
        transition:"all .15s",boxShadow:"0 1px 4px rgba(0,0,0,.04)"}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.09)";e.currentTarget.style.transform="translateY(-2px)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,.04)";e.currentTarget.style.transform="none";}}>
      {thumb&&<div style={{height:160,overflow:"hidden",background:"#f0f0f0"}}>
        <img src={thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
      </div>}
      <div style={{padding:"22px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
          <span style={{fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color,borderLeft:`3px solid ${color}`,paddingLeft:9}}>{post.topic}</span>
          <div style={{display:"flex",gap:7,alignItems:"center"}}>
            {isAdmin&&<span style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,
              color:post.status==="public"?"#1a6b3c":"#888",background:post.status==="public"?"#e6f4ed":"#f2f2f2"}}>
              {post.status==="public"?<GlobeIcon/>:<LockIcon/>}{post.status==="public"?"Public":"Private"}</span>}
            {isAdmin&&<button onClick={e=>{e.stopPropagation();if(window.confirm("Delete this article?"))onDelete(post.id);}}
              style={{background:"none",border:"none",cursor:"pointer",color:"#ddd",padding:2}}><TrashIcon/></button>}
          </div>
        </div>
        <h2 style={{fontSize:19,fontWeight:700,lineHeight:1.3,margin:"0 0 9px",color:"#111",fontFamily:"Georgia,serif"}}>{post.title}</h2>
        <p style={{fontSize:14,color:"#777",lineHeight:1.6,margin:"0 0 18px"}}>{post.summary}</p>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#bbb"}}>
          <span>{fmt(post.updatedAt)}</span>
          {post.sources?.length>0&&<span>{post.sources.length} source{post.sources.length!==1?"s":""}</span>}
        </div>
      </div>
    </div>
  );
}

function Editor({ post, onSave, onBack }) {
  const [title,setTitle]=useState(post.title||"");
  const [topic,setTopic]=useState(post.topic||"Markets");
  const [status,setStatus]=useState(post.status||"private");
  const [summary,setSummary]=useState(post.summary||"");
  const [body,setBody]=useState(post.body||"<p><br></p>");
  const [sources,setSources]=useState(post.sources||[]);
  const [flash,setFlash]=useState(false);

  const save = () => {
    const p={...post,id:post.id||String(Date.now()),title,topic,status,summary,body,sources,
      createdAt:post.createdAt||now(),updatedAt:now()};
    onSave(p); setFlash(true); setTimeout(()=>setFlash(false),2000);
  };

  return (
    <div style={{width:"100%",boxSizing:"border-box",padding:"32px 48px 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:32}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #e0e0e0",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,color:"#555"}}>
          <BackIcon/> Back</button>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <span style={{fontSize:13,color:flash?"#1a6b3c":"transparent",transition:"color .3s",fontWeight:600}}>✓ Saved</span>
          <button onClick={save} style={{display:"flex",alignItems:"center",gap:6,background:"#111",color:"#fff",border:"none",borderRadius:8,padding:"9px 20px",cursor:"pointer",fontSize:14,fontWeight:600}}>
            <SaveIcon/> Save</button>
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:22,flexWrap:"wrap"}}>
        <select value={topic} onChange={e=>setTopic(e.target.value)}
          style={{padding:"8px 12px",border:"1px solid #ddd",borderRadius:8,fontSize:13,fontWeight:700,color:TOPIC_COLORS[topic],background:"#fff"}}>
          {TOPICS.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{display:"flex",border:"1px solid #ddd",borderRadius:8,overflow:"hidden"}}>
          {["public","private"].map(s=>(
            <button key={s} onClick={()=>setStatus(s)}
              style={{display:"flex",alignItems:"center",gap:5,padding:"8px 16px",border:"none",cursor:"pointer",fontSize:13,fontWeight:600,
                background:status===s?"#111":"#fff",color:status===s?"#fff":"#666"}}>
              {s==="public"?<GlobeIcon/>:<LockIcon/>}{s==="public"?"Public":"Private"}</button>
          ))}
        </div>
      </div>
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Article title…"
        style={{width:"100%",boxSizing:"border-box",fontSize:32,fontWeight:700,fontFamily:"Georgia,serif",border:"none",
          borderBottom:"2px solid #eee",padding:"6px 0",marginBottom:14,outline:"none",color:"#111",background:"transparent"}}/>
      <textarea value={summary} onChange={e=>setSummary(e.target.value)} placeholder="One-sentence summary / lede…"
        rows={2} style={{width:"100%",boxSizing:"border-box",fontSize:15,fontFamily:"Georgia,serif",fontStyle:"italic",color:"#666",
          border:"none",borderBottom:"1px solid #eee",padding:"6px 0",marginBottom:26,outline:"none",resize:"none",lineHeight:1.6,background:"transparent"}}/>
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
  const color = TOPIC_COLORS[post.topic]||"#555";
  return (
    <div style={{maxWidth:740,margin:"0 auto",padding:"32px 0 100px"}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:40}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #e0e0e0",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,color:"#555"}}>
          <BackIcon/> Back</button>
        {isAdmin&&<button onClick={onEdit} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #333",borderRadius:8,padding:"8px 16px",cursor:"pointer",fontSize:13,color:"#333",fontWeight:600}}>
          <PenIcon/> Edit</button>}
      </div>
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:14}}>
        <span style={{fontSize:10,fontWeight:700,letterSpacing:1.2,textTransform:"uppercase",color,borderLeft:`3px solid ${color}`,paddingLeft:9}}>{post.topic}</span>
        {isAdmin&&<span style={{display:"flex",alignItems:"center",gap:4,fontSize:11,fontWeight:600,padding:"3px 9px",borderRadius:20,
          color:post.status==="public"?"#1a6b3c":"#888",background:post.status==="public"?"#e6f4ed":"#f2f2f2"}}>
          {post.status==="public"?<GlobeIcon/>:<LockIcon/>}{post.status==="public"?"Public":"Private"}</span>}
      </div>
      <h1 style={{fontSize:40,fontWeight:700,lineHeight:1.2,margin:"0 0 16px",color:"#111",fontFamily:"Georgia,serif"}}>{post.title}</h1>
      <p style={{fontSize:18,color:"#666",fontStyle:"italic",lineHeight:1.65,marginBottom:14,fontFamily:"Georgia,serif"}}>{post.summary}</p>
      <div style={{fontSize:13,color:"#bbb",marginBottom:40,paddingBottom:22,borderBottom:"1px solid #eee"}}>
        {fmt(post.createdAt)}{post.updatedAt!==post.createdAt&&` · Updated ${fmt(post.updatedAt)}`}
      </div>
      <div style={{fontSize:17,lineHeight:1.85,color:"#1a1a1a",fontFamily:"Georgia,serif"}}
        dangerouslySetInnerHTML={{__html:post.body}}/>
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

export default function App() {
  const [posts,setPosts]=useState(initPosts);
  const [view,setView]=useState("home");
  const [activeId,setActiveId]=useState(null);
  const [filter,setFilter]=useState("All");
  const [filterStatus,setFilterStatus]=useState("All");
  const [search,setSearch]=useState("");
  const [isAdmin,setIsAdmin]=useState(initAuth);
  const [showLogin,setShowLogin]=useState(false);

  const saveAll=(updated)=>{setPosts(updated);savePosts(updated);};
  const handleSave=(p)=>saveAll(posts.find(x=>x.id===p.id)?posts.map(x=>x.id===p.id?p:x):[p,...posts]);
  const handleDelete=(id)=>saveAll(posts.filter(p=>p.id!==id));
  const activePost=posts.find(p=>p.id===activeId)||{};

  const handleLogin=(token)=>{
    setIsAdmin(true);
    try{localStorage.setItem("nb_auth","true");localStorage.setItem("nb_token",token);}catch{}
    setShowLogin(false);
  };
  const handleLogout=()=>{
    setIsAdmin(false);
    try{localStorage.removeItem("nb_auth");localStorage.removeItem("nb_token");}catch{}
  };

  const visiblePosts=posts.filter(p=>isAdmin?true:p.status==="public");
  const visible=visiblePosts.filter(p=>{
    if(filter!=="All"&&p.topic!==filter)return false;
    if(isAdmin&&filterStatus!=="All"&&p.status!==filterStatus)return false;
    if(search&&!p.title.toLowerCase().includes(search.toLowerCase())&&!p.summary?.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });

  const pub=posts.filter(p=>p.status==="public").length;

  const Header = () => (
    <header style={{background:"#fff",borderBottom:"1px solid #ebebeb",padding:"0 40px",position:"sticky",top:0,zIndex:100}}>
      <div style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",height:66}}>
        <div style={{display:"flex",alignItems:"baseline",gap:14}}>
          <span onClick={()=>setView("home")} style={{fontSize:22,fontWeight:800,fontFamily:"Georgia,serif",color:"#111",letterSpacing:"-0.5px",cursor:"pointer"}}>The Notebook</span>
          <span style={{fontSize:12,color:"#bbb"}}>{isAdmin?`${pub} public · ${posts.length-pub} private`:`${pub} articles`}</span>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {isAdmin&&<>
            <span style={{fontSize:12,color:"#aaa",background:"#f5f5f5",padding:"4px 10px",borderRadius:20,fontWeight:600}}>Admin</span>
            <button onClick={()=>{setActiveId(null);setView("new");}}
              style={{display:"flex",alignItems:"center",gap:7,background:"#111",color:"#fff",border:"none",borderRadius:9,padding:"9px 20px",cursor:"pointer",fontSize:14,fontWeight:600}}>
              <PlusIcon/> New Article</button>
          </>}
          <button onClick={isAdmin?handleLogout:()=>setShowLogin(true)}
            title={isAdmin?"Logout":"Admin Login"}
            style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #e0e0e0",borderRadius:8,padding:"8px 12px",cursor:"pointer",color:isAdmin?"#999":"#555",fontSize:13}}>
            {isAdmin?<><LogoutIcon/> Logout</>:<><LoginIcon/> Login</>}
          </button>
        </div>
      </div>
    </header>
  );

  if(view==="read") return (
    <div style={{minHeight:"100vh",width:"100%",background:"#faf9f7"}}>
      {showLogin&&<LoginModal onLogin={handleLogin} onClose={()=>setShowLogin(false)}/>}
      <Header/>
      <div style={{padding:"36px 48px"}}><Reader post={activePost} onBack={()=>setView("home")} onEdit={()=>setView("edit")} isAdmin={isAdmin}/></div>
    </div>
  );

  if(view==="edit"||view==="new") return (
    <div style={{minHeight:"100vh",width:"100%",background:"#faf9f7"}}>
      <Header/>
      <Editor post={view==="new"?{}:activePost} onSave={p=>{handleSave(p);setActiveId(p.id);setView("read");}} onBack={()=>setView(activeId?"read":"home")}/>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",width:"100%",background:"#faf9f7",fontFamily:"system-ui,sans-serif"}}>
      {showLogin&&<LoginModal onLogin={handleLogin} onClose={()=>setShowLogin(false)}/>}
      <Header/>
      <main style={{width:"100%",boxSizing:"border-box",padding:"34px 40px"}}>
        <div style={{display:"flex",gap:10,marginBottom:28,flexWrap:"wrap",alignItems:"center"}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search articles…"
            style={{padding:"8px 14px",border:"1px solid #ddd",borderRadius:8,fontSize:13,flex:"0 0 220px"}}/>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",flex:1}}>
            {["All",...TOPICS].map(t=>(
              <button key={t} onClick={()=>setFilter(t)}
                style={{padding:"6px 13px",borderRadius:20,border:"1px solid",fontSize:12,cursor:"pointer",fontWeight:600,
                  borderColor:filter===t?(TOPIC_COLORS[t]||"#333"):"#e0e0e0",
                  background:filter===t?(TOPIC_COLORS[t]||"#333"):"#fff",
                  color:filter===t?"#fff":(TOPIC_COLORS[t]||"#555")}}>{t}</button>
            ))}
          </div>
          {isAdmin&&<div style={{display:"flex",border:"1px solid #ddd",borderRadius:8,overflow:"hidden"}}>
            {["All","public","private"].map(s=>(
              <button key={s} onClick={()=>setFilterStatus(s)}
                style={{padding:"7px 13px",border:"none",cursor:"pointer",fontSize:12,fontWeight:600,
                  background:filterStatus===s?"#111":"#fff",color:filterStatus===s?"#fff":"#666"}}>
                {s==="All"?"All":s==="public"?"Public":"Private"}</button>
            ))}
          </div>}
        </div>
        {visible.length===0?(
          <div style={{textAlign:"center",padding:"90px 0"}}>
            <div style={{fontSize:44,marginBottom:14}}>✍️</div>
            <div style={{fontSize:17,fontWeight:600,color:"#aaa",marginBottom:6}}>No articles yet</div>
            <div style={{fontSize:14,color:"#ccc"}}>Hit "New Article" to start writing.</div>
          </div>
        ):(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:20}}>
            {visible.map(p=><Card key={p.id} post={p} onClick={()=>{setActiveId(p.id);setView("read");}} onDelete={handleDelete} isAdmin={isAdmin}/>)}
          </div>
        )}
      </main>
    </div>
  );
}