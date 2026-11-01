import { sb, $, PAGES, requireUser, roleOf, displayName, logout } from "./auth.js";

const user = await requireUser();

if (user) {
  if (roleOf(user)) {
    location.replace(PAGES.next); // peran sudah dipilih
  } else {
    $("who").textContent = user.email || displayName(user);
    $("app").hidden = false;
  }
}

const buttons = document.querySelectorAll(".role");

buttons.forEach((btn) =>
  btn.addEventListener("click", async () => {
    buttons.forEach((b) => (b.disabled = true));
    $("msg").textContent = "";
    const { error } = await sb.auth.updateUser({ data: { role: btn.dataset.role } });
    if (error) {
      $("msg").textContent = "Gagal menyimpan peran. Coba lagi.";
      buttons.forEach((b) => (b.disabled = false));
      return;
    }
    location.replace(PAGES.next);
  })
);

$("logout").addEventListener("click", logout);
