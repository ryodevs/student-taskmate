import { PAGES, requireUser, roleOf } from "./auth.js";

const user = await requireUser();

if (user) {
  const role = roleOf(user);
  if (!role) {
    location.replace(PAGES.role);
  } else if (role === "pengurus") {
    location.replace(PAGES.pengurus);
  } else {
    location.replace(PAGES.anggota);
  }
}
