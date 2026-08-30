import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export let currentUser = null;
export let currentProfile = null;

const ALLOWED_ROLES = ["owner","employee","karyawan","kasir","kurir","reseller","superadmin","admin","iprem"];

export function roleFromUser(data) {
  return String(data?.role || "").trim().toLowerCase();
}

export function isOwner(data) {
  return roleFromUser(data) === "owner";
}

export function isEmployee(data) {
  const r = roleFromUser(data);
  return r === "karyawan" || r === "employee";
}

export function canManageCommunity(data) {
  const r = roleFromUser(data);
  return r === "owner" || r === "admin" || r === "superadmin";
}

export function isCommunityMember(data) {
  const r = roleFromUser(data);
  return ["owner","karyawan","employee","admin","superadmin"].includes(r);
}

export function requireLogin(callback) {
  let delivered = false;
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      currentUser = null;
      currentProfile = null;
      window.location.replace("login.html");
      return;
    }

    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (!snap.exists()) {
        window.location.replace("login.html");
        return;
      }

      const profile = snap.data() || {};
      const role = roleFromUser(profile);
      const status = String(profile.status || "").trim().toLowerCase();

      if (!ALLOWED_ROLES.includes(role)) {
        window.location.replace("login.html");
        return;
      }
      if (status === "blocked" || status === "rejected") {
        window.location.replace("login.html");
        return;
      }
      if (status && status !== "aktif") {
        window.location.replace("login.html");
        return;
      }

      currentUser = user;
      currentProfile = profile;

      const el = document.querySelector("[data-user]");
      if (el) el.textContent = profile.namaKonter || profile.namaToko || profile.nama || profile.namaPemilik || user.displayName || user.email || "Akun";

      if (!delivered) {
        delivered = true;
        callback(user, profile);
      }
    } catch (e) {
      console.error("FIXZY auth/profile:", e);
      window.location.replace("login.html");
    }
  });
}

export function money(n) {
  return new Intl.NumberFormat("id-ID", {style:"currency",currency:"IDR",maximumFractionDigits:0}).format(Number(n)||0);
}

export const esc = s => String(s ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
