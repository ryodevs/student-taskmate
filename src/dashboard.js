import { $, PAGES, requireUser, roleOf, displayName, logout } from "./auth.js";

// Halaman placeholder: ganti dengan halaman utama aplikasimu
const user = await requireUser();

if (user) {
  const role = roleOf(user);
  if (!role) {
    location.replace(PAGES.role);
  } else {
    $("hello").textContent = `Halo, ${displayName(user)}`;
    $("role").textContent = role === "pengurus" ? "Peran: Pengurus" : "Peran: Anggota";
    $("app").hidden = false;
  }
}

$("logout").addEventListener("click", logout);
