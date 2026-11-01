import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi di .env");
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const $ = (id) => document.getElementById(id);
let mode = "login"; // "login" | "signup"

function say(text, ok = false) {
  const m = $("msg");
  m.textContent = text;
  m.className = ok ? "msg ok" : "msg";
}

function render(session) {
  const u = session && session.user;
  $("login-view").hidden = !!u;
  $("profile-view").hidden = !u;
  if (!u) return;
  const meta = u.user_metadata || {};
  $("name").textContent = meta.full_name || meta.name || "Pengguna";
  $("mail").textContent = u.email || "";
  $("avatar").src = meta.avatar_url || meta.picture || "data:image/gif;base64,R0lGODlhAQABAAAAACw=";
}

function authError(err) {
  const t = (err && err.message) || "";
  if (/invalid login/i.test(t)) return "Email atau kata sandi salah.";
  if (/already registered/i.test(t)) return "Email sudah terdaftar. Silakan masuk.";
  if (/email not confirmed/i.test(t)) return "Email belum dikonfirmasi. Cek inbox kamu.";
  if (/rate limit/i.test(t)) return "Terlalu banyak percobaan. Coba lagi nanti.";
  return t || "Terjadi kesalahan. Coba lagi.";
}

$("email-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = $("email").value.trim();
  const password = $("password").value;
  if (!/^\S+@\S+\.\S+$/.test(email)) return say("Format email belum benar.");
  if (password.length < 6) return say("Kata sandi minimal 6 karakter.");

  const btn = $("submit");
  btn.disabled = true;
  say("");
  try {
    if (mode === "signup") {
      const { data, error } = await sb.auth.signUp({
        email, password,
        options: { emailRedirectTo: location.origin + location.pathname },
      });
      if (error) throw error;
      if (!data.session) say("Akun dibuat. Cek email untuk konfirmasi.", true);
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
    }
  } catch (err) {
    say(authError(err));
  } finally {
    btn.disabled = false;
  }
});

$("toggle").addEventListener("click", () => {
  mode = mode === "login" ? "signup" : "login";
  const s = mode === "signup";
  $("title").textContent = s ? "Buat akun" : "Masuk ke akun";
  $("submit").textContent = s ? "Daftar" : "Masuk";
  $("toggle").textContent = s ? "Sudah punya akun? Masuk" : "Belum punya akun? Daftar";
  $("password").autocomplete = s ? "new-password" : "current-password";
  say("");
});

$("logout").addEventListener("click", async () => {
  window.google?.accounts?.id.disableAutoSelect();
  await sb.auth.signOut();
});

// Satu sumber kebenaran: state sesi dari Supabase
sb.auth.onAuthStateChange((_event, session) => render(session));
sb.auth.getSession().then(({ data }) => render(data.session));


// Login Google tanpa redirect ke *.supabase.co
async function onGoogleCredential(res) {
  say("");
  const { error } = await sb.auth.signInWithIdToken({
    provider: "google",
    token: res.credential,
  });
  if (error) say(authError(error));
}

let tries = 0;
function initGoogle() {
  if (!GOOGLE_CLIENT_ID) {
    return say("VITE_GOOGLE_CLIENT_ID belum diisi di .env (lalu restart npm run dev).");
  }
  if (!window.google?.accounts) {
    if (++tries > 40) return say("Script Google gagal dimuat. Cek koneksi/adblock.");
    return setTimeout(initGoogle, 150);
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: onGoogleCredential,
    auto_select: false,
  });
  const box = $("g-btn");
  const dark = matchMedia("(prefers-color-scheme: dark)").matches;
  box.innerHTML = "";
  google.accounts.id.renderButton(box, {
    theme: dark ? "filled_black" : "outline",
    size: "large",
    text: "continue_with",
    width: Math.min(400, Math.max(200, Math.floor(box.clientWidth))),
    locale: "id",
  });
}
initGoogle();

// Render ulang saat ukuran/tema berubah
let rt;
let lastW = innerWidth;
addEventListener("resize", () => {
  if (innerWidth === lastW) return; // abaikan resize vertikal (address bar HP)
  lastW = innerWidth;
  clearTimeout(rt);
  rt = setTimeout(initGoogle, 250);
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", initGoogle);
