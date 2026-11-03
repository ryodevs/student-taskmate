import { sb, $, requireUser, displayName, greeting, esc, logout } from "./auth.js";

const user = await requireUser();
if (!user) throw new Error("not logged in");

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
  $("navbar-class").textContent = c.name;
  $("sidebar-class-info").hidden = false;
  $("sidebar-class-name").textContent = c.name;
  $("sidebar-class-code").textContent = "Kode: " + c.code;
  $("class-code-banner").hidden = false;
  $("class-code-value").textContent = c.code;
}

function deadlineClass(t) {
  if (!t.deadline) return "";
  const dl = new Date(t.deadline).getTime();
  const now = Date.now();
  const MS = 24 * 60 * 60 * 1000;
  if (dl < now) return "deadline-passed";
  if (dl < now + MS) return "deadline-soon";
  return "";
}

let activeClassId = null;

async function init() {
  initSidebar();
  $("greeting").textContent = greeting(user);

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
  loadStats(c.id);

  $("add-task").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!activeClassId) return;
    const title = $("task-title").value.trim();
    if (!title) return;
    $("task-msg").textContent = "";

    const row = {
      class_id: activeClassId,
      title,
      description: $("task-desc").value.trim() || "",
      priority: $("task-priority").value,
    };
    const dl = $("task-deadline").value;
    if (dl) row.deadline = new Date(dl).toISOString();

    const { error } = await sb.from("tasks").insert(row);
    if (error) { $("task-msg").textContent = "Gagal menambah tugas."; return; }
    $("task-title").value = "";
    $("task-desc").value = "";
    $("task-deadline").value = "";
    $("task-priority").value = "sedang";
    loadTasks(activeClassId);
    loadStats(activeClassId);
  });
}

async function loadStats(classId) {
  const { count: taskCount } = await sb
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("class_id", classId);

  const { count: memberCount } = await sb
    .from("class_members")
    .select("*", { count: "exact", head: true })
    .eq("class_id", classId);

  $("stat-tasks").textContent = taskCount ?? 0;
  $("stat-members").textContent = memberCount ?? 0;
}

async function loadTasks(classId) {
  const { data, error } = await sb
    .from("tasks")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (error) { $("task-msg").textContent = "Gagal memuat tugas."; return; }

  renderTasks(data, classId);
  renderOverdue(data);
}

function renderTasks(tasks, classId) {
  const list = $("task-list");
  list.innerHTML = "";
  $("task-empty").hidden = tasks.length > 0;

  tasks.forEach((t) => {
    const div = document.createElement("div");
    div.className = "task-item" + (deadlineClass(t) ? " " + deadlineClass(t) : "");
    const dl = t.deadline ? new Date(t.deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "";
    const dlLocal = t.deadline ? toLocalInput(t.deadline) : "";

    div.innerHTML = `
      <div class="task-info">
        <strong>${esc(t.title)}</strong>
        ${t.description ? `<p>${esc(t.description)}</p>` : ""}
        <span class="priority-badge ${esc(t.priority)}">${esc(t.priority)}</span>
        ${dl ? `<small class="deadline">Deadline: ${dl}</small>` : ""}
      </div>
      <button class="delete-btn" title="Hapus">✕</button>`
      + `<div class="inline-edit-form" hidden>
        <input type="text" class="edit-title" value="${esc(t.title)}" required>
        <input type="text" class="edit-desc" value="${esc(t.description || "")}">
        <input type="datetime-local" class="edit-deadline" value="${dlLocal}">
        <select class="edit-priority">
          <option value="tinggi">Prioritas Tinggi</option>
          <option value="sedang">Prioritas Sedang</option>
          <option value="rendah">Prioritas Rendah</option>
        </select>
        <div class="inline-edit-actions">
          <button type="button" class="btn-cancel">Batal</button>
          <button type="button" class="btn-save">Simpan</button>
        </div>
      </div>`;

    div.querySelector(".edit-priority").value = t.priority;
    div.querySelector(".delete-btn").addEventListener("click", () => deleteTask(t.id, classId));
    div.querySelector(".task-info").addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      toggleEdit(div, t);
    });
    div.querySelector(".btn-cancel").addEventListener("click", () => toggleEdit(div, t));
    div.querySelector(".btn-save").addEventListener("click", () => saveEdit(div, t, classId));
    list.appendChild(div);
  });
}

function toLocalInput(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toggleEdit(div, t) {
  const isEditing = div.classList.toggle("editing");
  const form = div.querySelector(".inline-edit-form");
  const info = div.querySelector(".task-info");
  const del = div.querySelector(".delete-btn");
  form.hidden = !isEditing;
  info.style.display = isEditing ? "none" : "";
  del.style.display = isEditing ? "none" : "";
}

async function saveEdit(div, t, classId) {
  const title = div.querySelector(".edit-title").value.trim();
  if (!title) return;
  const row = {
    title,
    description: div.querySelector(".edit-desc").value.trim() || "",
    priority: div.querySelector(".edit-priority").value,
  };
  const dl = div.querySelector(".edit-deadline").value;
  row.deadline = dl ? new Date(dl).toISOString() : null;

  const { error } = await sb.from("tasks").update(row).eq("id", t.id);
  if (error) { $("task-msg").textContent = "Gagal menyimpan perubahan."; return; }
  loadTasks(classId);
  loadStats(classId);
}

async function deleteTask(id, classId) {
  const { error } = await sb.from("tasks").delete().eq("id", id);
  if (error) { $("task-msg").textContent = "Gagal menghapus tugas."; return; }
  loadTasks(classId);
  loadStats(classId);
}

function renderOverdue(tasks) {
  const now = Date.now();
  const overdue = tasks.filter((t) => t.deadline && new Date(t.deadline).getTime() < now);
  const banner = $("overdue-banner");
  if (!overdue.length) {
    banner.hidden = true;
    return;
  }
  banner.hidden = false;
  banner.className = "overdue-badge";
  banner.textContent = `⚠ ${overdue.length} tugas melewati deadline`;
}

init();
