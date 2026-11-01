import { sb, $, PAGES, requireUser, displayName, logout } from "./auth.js";

const user = await requireUser();
if (!user) throw new Error("not logged in");

$("who").textContent = displayName(user);
$("app").hidden = false;

let activeClassId = null;

async function loadClasses() {
  const { data, error } = await sb
    .from("classes")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (error) { $("class-msg").textContent = "Gagal memuat kelas."; return; }

  const list = $("class-list");
  list.innerHTML = "";

  if (!data.length) {
    list.innerHTML = '<p class="empty">Belum ada kelas. Buat kelas pertamamu!</p>';
    return;
  }

  data.forEach((c) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card" + (c.id === activeClassId ? " active" : "");
    card.innerHTML = `<strong>${esc(c.name)}</strong><span class="badge">Kode: ${esc(c.code)}</span>`;
    card.addEventListener("click", () => openClass(c));
    list.appendChild(card);
  });
}

async function openClass(c) {
  activeClassId = c.id;
  $("active-class-name").textContent = c.name;
  $("active-class-code").textContent = "Kode: " + c.code;
  $("task-section").hidden = false;
  loadClasses();
  loadTasks(c.id);
}

async function loadTasks(classId) {
  const { data, error } = await sb
    .from("tasks")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (error) { $("task-msg").textContent = "Gagal memuat tugas."; return; }

  const list = $("task-list");
  list.innerHTML = "";
  $("task-empty").hidden = data.length > 0;

  data.forEach((t) => {
    const div = document.createElement("div");
    div.className = "task-item";
    const dl = t.deadline ? new Date(t.deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "";
    div.innerHTML = `
      <div class="task-info">
        <strong>${esc(t.title)}</strong>
        ${t.description ? `<p>${esc(t.description)}</p>` : ""}
        ${dl ? `<small class="deadline">Deadline: ${dl}</small>` : ""}
      </div>
      <button class="delete-btn" data-id="${t.id}" title="Hapus">✕</button>`;
    div.querySelector(".delete-btn").addEventListener("click", () => deleteTask(t.id));
    list.appendChild(div);
  });
}

async function deleteTask(id) {
  const { error } = await sb.from("tasks").delete().eq("id", id);
  if (error) { $("task-msg").textContent = "Gagal menghapus tugas."; return; }
  loadTasks(activeClassId);
}

$("create-class").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("class-name").value.trim();
  if (!name) return;
  $("class-msg").textContent = "";

  const { error } = await sb.from("classes").insert({ name, created_by: user.id });
  if (error) { $("class-msg").textContent = "Gagal membuat kelas."; return; }
  $("class-name").value = "";
  loadClasses();
});

$("add-task").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!activeClassId) return;
  const title = $("task-title").value.trim();
  if (!title) return;
  $("task-msg").textContent = "";

  const row = { class_id: activeClassId, title, description: $("task-desc").value.trim() || "" };
  const dl = $("task-deadline").value;
  if (dl) row.deadline = new Date(dl).toISOString();

  const { error } = await sb.from("tasks").insert(row);
  if (error) { $("task-msg").textContent = "Gagal menambah tugas."; return; }
  $("task-title").value = "";
  $("task-desc").value = "";
  $("task-deadline").value = "";
  loadTasks(activeClassId);
});

$("logout").addEventListener("click", logout);

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

loadClasses();
