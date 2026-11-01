import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!URL || !KEY) {
  throw new Error("VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum diisi di .env");
}

export const sb = createClient(URL, KEY);

// Ganti NEXT ke halaman utama aplikasimu
export const PAGES = { login: "/index.html", role: "/role.html", next: "/dashboard.html" };

export const $ = (id) => document.getElementById(id);

export async function getUser() {
  const { data } = await sb.auth.getSession();
  return data.session?.user ?? null;
}

// Pakai di halaman yang wajib login
export async function requireUser() {
  const user = await getUser();
  if (!user) location.replace(PAGES.login);
  return user;
}

export const roleOf = (user) => user?.user_metadata?.role ?? null;

export function displayName(user) {
  const m = user?.user_metadata ?? {};
  return m.full_name || m.name || user?.email || "Pengguna";
}

export async function logout() {
  window.google?.accounts?.id.disableAutoSelect();
  await sb.auth.signOut();
  location.replace(PAGES.login);
}
