import { sb, $, PAGES, roleOf } from "./auth.js";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
let mode = "login"; // "login" | "signup"

function say(text, ok = false) {
  $("msg").textContent = text;
  $("msg").className = ok ? "msg ok" : "msg";
}

function authError(err) {
  const t = err?.message || "";
  if (/invalid login/i.test(t)) return "Email atau kata sandi salah.";
  if (/already registered/i.test(t)) return "Email sudah terdaftar. Silakan masuk.";
  if (/email not confirmed/i.test(t)) return "Email belum dikonfirmasi. Cek inbox kamu.";
  if (/rate limit/i.test(t)) return "Terlalu banyak percobaan. Coba lagi nanti.";
  return t || "Terjadi kesalahan. Coba lagi.";
}

// Sudah login (atau baru selesai login) -> pilih peran, atau langsung masuk jika peran sudah ada
sb.auth.onAuthStateChange((_event, session) => {
  const user = session?.user;
  if (user) location.replace(roleOf(user) ? PAGES.next : PAGES.role);
});

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
        options: { emailRedirectTo: location.origin + PAGES.login },
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

let rt, lastW = innerWidth;
addEventListener("resize", () => {
  if (innerWidth === lastW) return; // abaikan resize vertikal (address bar HP)
  lastW = innerWidth;
  clearTimeout(rt);
  rt = setTimeout(initGoogle, 250);
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", initGoogle);
