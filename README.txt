AI SONG MAKER - SUNO STYLE

1. Install Node.js 18+.
2. Jalankan:
   npm install
3. Masukkan API key pada environment server:
   Linux/Termux:
   export SUNO_API_KEY="ISI_API_KEY"
4. Jalankan:
   npm start
5. Buka:
   http://localhost:3000

Catatan:
- API key jangan dimasukkan ke lagu.html.
- Backend memakai endpoint Suno API-compatible pada api.sunoapi.org.
- Tanpa API key, tombol Generate belum dapat membuat MP3 AI.
- Setelah task selesai, halaman menampilkan audio_url sebagai player dan tombol Download MP3.

Untuk deployment Vercel, server.js perlu diubah menjadi serverless function/API route.
