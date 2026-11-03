import { sb, $, requireUser, displayName, logout } from "./auth.js";

const user = await requireUser();
if (!user) throw new Error("not logged in");

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

function initSidebar() {
  $("sidebar-name").textContent = displayName(user);
  $("sidebar-email").textContent = user.email || "";

  $("menu-btn").addEventListener("click", () => $("sidebar-backdrop").classList.add("open"));
  $("sidebar-close").addEventListener("click", closeSidebar);
  $("sidebar-backdrop").addEventListener("click", (e) => {
    if (e.target === $("sidebar-backdrop")) closeSidebar();
  });
  $("logout").addEventListener("click", logout);
}

function closeSidebar() {
  $("sidebar-backdrop").classList.remove("open");
}

function showClass(c) {
  $("active-class-name").textContent = c.name;
  $("navbar-class").textContent = c.name;
  $("sidebar-class-info").hidden = false;
  $("sidebar-class-name").textContent = c.name;
  $("sidebar-class-code").textContent = "Kode: " + c.code;
}

let activeClassId = null;

async function init() {
  initSidebar();

  const { data, error } = await sb
    .from("classes")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: true })
    .limit(1);

  if (error) return;

  if (!data.length) {
    $("setup").hidden = false;
    $("create-class").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = $("class-name").value.trim();
      if (!name) return;
      $("class-msg").textContent = "";

      const { data: created, error: err } = await sb
        .from("classes")
        .insert({ name, created_by: user.id })
        .select()
        .single();

      if (err) { $("class-msg").textContent = "Gagal membuat kelas."; return; }
      $("setup").hidden = true;
      openClass(created);
    });
    return;
  }

  openClass(data[0]);
}

function openClass(c) {
  activeClassId = c.id;
  showClass(c);
  $("app").hidden = false;
  loadTasks(c.id);

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
      <button class="delete-btn" title="Hapus">✕</button>`;
    div.querySelector(".delete-btn").addEventListener("click", () => deleteTask(t.id));
    list.appendChild(div);
  });
}

async function deleteTask(id) {
  const { error } = await sb.from("tasks").delete().eq("id", id);
  if (error) { $("task-msg").textContent = "Gagal menghapus tugas."; return; }
  loadTasks(activeClassId);
}

init();
