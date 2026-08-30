import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export let currentUser = null;
export let currentProfile = null;

export function requireLogin(callback) {
  let delivered = false;
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      currentUser = null;
      currentProfile = null;
      window.location.replace("login.html");
      return;
    }
    currentUser = user;
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      currentProfile = snap.exists() ? snap.data() : {};
    } catch (e) {
      console.warn("Profil FIXZY tidak dapat dibaca:", e);
      currentProfile = {};
    }
    const role = String(currentProfile?.role || "").toLowerCase();
    const status = String(currentProfile?.status || "").toLowerCase();
    const allowed = ["owner","employee","karyawan","kasir","kurir","reseller","superadmin","admin","iprem"];
    if (role && !allowed.includes(role)) {
      console.warn("Role FIXZY tidak dikenali:", role);
    }
    if (status === "blocked" || status === "rejected") {
      window.location.replace("login.html");
      return;
    }
    const el = document.querySelector("[data-user]");
    if (el) el.textContent = currentProfile?.namaKonter || currentProfile?.namaToko || currentProfile?.nama || user.displayName || user.email || "Akun";
    if (!delivered) { delivered = true; callback(user, currentProfile); }
  });
}

export function roleFromUser(data) {
  return String(data?.role || "").toLowerCase();
}
export function canManageCommunity(data) {
  const r = roleFromUser(data);
  return r === "owner" || r === "admin" || r === "superadmin";
}
export function money(n) {
  return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
}
export const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
