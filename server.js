const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ACE_URL = (process.env.ACESTEP_URL || "http://127.0.0.1:8001").replace(/\/+$/,"");
const ACE_KEY = process.env.ACESTEP_API_KEY || "";

app.use(express.json({limit:"2mb"}));
app.use(express.static(path.join(__dirname,"public")));

function headers(){
  const h={"Content-Type":"application/json"};
  if(ACE_KEY) h.Authorization=`Bearer ${ACE_KEY}`;
  return h;
}

function promptFor(p){
  const vocal = p.mode==="instrumental" ? "instrumental only" : `female vocals` === (p.voice==="female"?"female vocals":"male vocals") ? "female vocals" : "male vocals";
  return `${p.genre}, ${p.mood}, Indonesian song, ${vocal}, polished studio production. ${p.idea||""}`.trim();
}

app.post("/api/generate", async (req,res)=>{
  try{
    const p=req.body||{};
    if(!p.idea && !p.lyrics) return res.status(400).json({error:"Ide atau lirik wajib diisi."});
    const instrumental=p.mode==="instrumental";
    const body={
      prompt:promptFor(p),
      lyrics:instrumental ? "" : (p.lyrics||""),
      thinking:true,
      use_format:!p.lyrics && !instrumental,
      sample_query:!p.lyrics && !instrumental ? `${p.idea}. Genre ${p.genre}. Mood ${p.mood}.` : "",
      audio_format:"mp3",
      model:"acestep-v15-turbo",
      batch_size:2,
      inference_steps:8,
      task_type:"text2music"
    };
    if(instrumental) body.prompt=`${p.genre}, ${p.mood}, instrumental music, no vocals. ${p.idea||""}`;
    const r=await fetch(`${ACE_URL}/release_task`,{method:"POST",headers:headers(),body:JSON.stringify(body)});
    const d=await r.json();
    if(!r.ok || d.code!==200) return res.status(r.status||502).json({error:d.error||d.detail||"ACE-Step menolak tugas"});
    res.json({task_id:d.data.task_id});
  }catch(e){res.status(502).json({error:"ACE-Step tidak terhubung: "+e.message})}
});

app.get("/api/status/:id", async (req,res)=>{
  try{
    const r=await fetch(`${ACE_URL}/query_result`,{method:"POST",headers:headers(),body:JSON.stringify({task_id_list:[req.params.id]})});
    const d=await r.json();
    if(!r.ok || d.code!==200) return res.status(r.status||502).json({error:d.error||"Gagal membaca ACE-Step"});
    const row=(d.data||[])[0]||{};
    let tracks=[];
    if(row.result){
      try{
        const parsed=typeof row.result==="string"?JSON.parse(row.result):row.result;
        tracks=(Array.isArray(parsed)?parsed:[]).filter(x=>x.file).map(x=>({
          url: x.file.startsWith("http") ? x.file : "/api/audio?path="+encodeURIComponent(x.file),
          title: x.metas?.title || "AI Song",
          metas:x.metas||{}
        }));
      }catch{}
    }
    res.json({status:row.status||0,tracks,error:row.error||null});
  }catch(e){res.status(502).json({error:"ACE-Step tidak terhubung: "+e.message})}
});

app.get("/api/audio", async (req,res)=>{
  try{
    const raw=req.query.path;
    if(!raw) return res.status(400).send("path wajib");
    let target=raw;
    if(raw.startsWith("http")) target=raw;
    else target=ACE_URL+(raw.startsWith("/")?"":"/")+raw;
    const r=await fetch(target,{headers:ACE_KEY?{Authorization:`Bearer ${ACE_KEY}`}:{}}); 
    if(!r.ok) return res.status(r.status).send("Audio tidak tersedia");
    res.setHeader("Content-Type",r.headers.get("content-type")||"audio/mpeg");
    res.setHeader("Content-Disposition",'inline; filename="ai-song.mp3"');
    const buf=Buffer.from(await r.arrayBuffer());res.send(buf);
  }catch(e){res.status(502).send("Gagal mengambil audio")}
});

app.get("/api/health",async(req,res)=>{
 try{const r=await fetch(`${ACE_URL}/health`);const d=await r.text();res.status(r.status).send(d)}
 catch(e){res.status(503).json({ok:false,error:e.message})}
});

app.listen(PORT,()=>console.log(`AI Song Maker: http://localhost:${PORT}`));
