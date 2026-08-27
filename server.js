// Backend AI Song Maker
// Node.js 18+
// API key TIDAK dimasukkan ke HTML.
// Set environment variable SUNO_API_KEY sebelum menjalankan server.

const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.SUNO_API_KEY;
const BASE = "https://api.sunoapi.org/api/v1";

app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname, "public")));

function authHeaders(){
  return {
    "Authorization": `Bearer ${API_KEY}`,
    "Content-Type": "application/json"
  };
}

app.post("/api/generate", async (req,res)=>{
  if(!API_KEY) return res.status(503).json({
    error:"SUNO_API_KEY belum dipasang di server."
  });

  const {judul,ide,genre,mood,vocal,jenis,lirik} = req.body || {};
  const instrumental = jenis === "instrumental";
  const prompt = instrumental
    ? `${ide}. Mood: ${mood}. Genre: ${genre}. Instrumental music only.`
    : (lirik
      ? lirik
      : `${ide}. Mood: ${mood}. Genre: ${genre}. Buat lagu lengkap dengan vokal ${vocal==="f"?"wanita":"pria"}.`);

  const payload = {
    customMode: true,
    instrumental,
    model: "V4_5ALL",
    prompt,
    style: `${genre}, ${mood}`,
    title: judul,
    vocalGender: vocal
  };

  try{
    const r = await fetch(`${BASE}/generate`, {
      method:"POST", headers:authHeaders(), body:JSON.stringify(payload)
    });
    const data = await r.json();
    if(!r.ok || data.code !== 200)
      return res.status(r.status || 502).json({error:data.msg || "API generate gagal"});
    res.json({taskId:data.data.taskId});
  }catch(e){
    res.status(502).json({error:e.message});
  }
});

app.get("/api/status/:taskId", async (req,res)=>{
  if(!API_KEY) return res.status(503).json({error:"SUNO_API_KEY belum dipasang di server."});
  try{
    const r=await fetch(`${BASE}/generate/record-info?taskId=${encodeURIComponent(req.params.taskId)}`,{
      headers:{"Authorization":`Bearer ${API_KEY}`}
    });
    const data=await r.json();
    if(!r.ok || data.code !== 200)
      return res.status(r.status || 502).json({error:data.msg || "Gagal membaca status"});
    const d=data.data || {};
    const tracks=((d.response||{}).data)||[];
    res.json({status:d.status,tracks});
  }catch(e){
    res.status(502).json({error:e.message});
  }
});

app.listen(PORT,()=>console.log(`AI Song Maker berjalan di http://localhost:${PORT}`));
