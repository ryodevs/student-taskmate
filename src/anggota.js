import { sb, $, requireUser, displayName, greeting, esc, logout } from "./auth.js";

const user = await requireUser();
if (!user) throw new Error("not logged in");

function deadlineClass(t) {
  if (!t.deadline) return "";
  const dl = new Date(t.deadline).getTime();
  const now = Date.now();
  const MS = 24 * 60 * 60 * 1000;
  if (dl < now) return "deadline-passed";
  if (dl < now + MS) return "deadline-soon";
  return "";
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
  $("navbar-class").textContent = c.name;
  $("sidebar-class-info").hidden = false;
  $("sidebar-class-name").textContent = c.name;
}

let activeClassId = null;
let allTasks = [];
let doneSet = new Set();
let currentFilter = "all";

async function init() {
  initSidebar();
  $("greeting").textContent = greeting(user);

  $("filter-tabs").querySelectorAll(".filter-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      $("filter-tabs").querySelectorAll(".filter-tab").forEach((b) => b.classList.toggle("active", b === btn));
      renderTasks();
    });
  });

  const { data, error } = await sb
    .from("class_members")
    .select("class_id, classes(id, name, code)")
    .eq("user_id", user.id)
    .limit(1);

  if (error) return;

  if (!data.length) {
    $("setup").hidden = false;
    $("join-class").addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = $("class-code").value.trim().toLowerCase();
      if (!code) return;
      $("class-msg").textContent = "";

      const { data: cls, error: findErr } = await sb
        .from("classes")
        .select("id, name, code")
        .eq("code", code)
        .maybeSingle();

      if (findErr || !cls) {
        $("class-msg").textContent = "Kode kelas tidak ditemukan.";
        return;
      }

      const { error: joinErr } = await sb
        .from("class_members")
        .insert({ class_id: cls.id, user_id: user.id });

      if (joinErr) {
        $("class-msg").textContent = /duplicate/i.test(joinErr.message || "")
          ? "Kamu sudah tergabung di kelas ini."
          : "Gagal bergabung ke kelas.";
        return;
      }

      $("setup").hidden = true;
      openClass(cls);
    });
    return;
  }

  openClass(data[0].classes);
}

function openClass(c) {
  activeClassId = c.id;
  showClass(c);
  $("app").hidden = false;
  loadTasks(c.id);
}

async function loadTasks(classId) {
  const { data: tasks, error } = await sb
    .from("tasks")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (error) { $("task-msg").textContent = "Gagal memuat tugas."; return; }
  allTasks = tasks;

  const { data: completions } = await sb
    .from("task_completions")
    .select("task_id")
    .eq("user_id", user.id);

  doneSet = new Set((completions || []).map((c) => c.task_id));
  renderStats();
  renderOverdue();
  renderTasks();
}

function filteredTasks() {
  if (currentFilter === "undone") return allTasks.filter((t) => !doneSet.has(t.id));
  if (currentFilter === "done") return allTasks.filter((t) => doneSet.has(t.id));
  return allTasks;
}

function renderStats() {
  const total = allTasks.length;
  const done = allTasks.filter((t) => doneSet.has(t.id)).length;
  $("stat-total").textContent = total;
  $("stat-done").textContent = done;
  const pct = total ? Math.round((done / total) * 100) : 0;
  $("progress-label").textContent = `${done} dari ${total} tugas selesai (${pct}%)`;
  $("progress-fill").style.width = pct + "%";
}

function renderTasks() {
  const tasks = filteredTasks();
  const list = $("task-list");
  list.innerHTML = "";
  $("task-empty").hidden = allTasks.length > 0 || tasks.length > 0;

  tasks.forEach((t, i) => {
    const done = doneSet.has(t.id);
    const div = document.createElement("div");
    div.dataset.id = t.id;
    div.style.setProperty("--i", Math.min(i, 8));
    div.className = "task-item" + (done ? " done" : "") + (deadlineClass(t) ? " " + deadlineClass(t) : "");
    const dl = t.deadline ? new Date(t.deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "";
    div.innerHTML = `
      <label class="task-check">
        <input type="checkbox" ${done ? "checked" : ""} data-id="${t.id}">
        <div class="task-info">
          <strong>${esc(t.title)}</strong>
          ${t.description ? `<p>${esc(t.description)}</p>` : ""}
          <span class="priority-badge ${esc(t.priority)}">${esc(t.priority)}</span>
          ${dl ? `<small class="deadline">Deadline: ${dl}</small>` : ""}
        </div>
      </label>`;
    div.querySelector("input").addEventListener("change", (e) => toggleTask(t.id, e.target.checked));
    list.appendChild(div);
  });

  if (tasks.length === 0 && allTasks.length > 0) {
    const note = document.createElement("p");
    note.className = "empty";
    note.textContent = "Tidak ada tugas di filter ini.";
    list.appendChild(note);
  }
}

async function toggleTask(taskId, checked) {
  if (checked) {
    await sb.from("task_completions").insert({ task_id: taskId, user_id: user.id });
    doneSet.add(taskId);
  } else {
    await sb.from("task_completions").delete().eq("task_id", taskId).eq("user_id", user.id);
    doneSet.delete(taskId);
  }
  const item = $("task-list").querySelector(`.task-item[data-id="${taskId}"]`);
  if (item && currentFilter === "all") {
    item.classList.toggle("done", checked);
  } else {
    renderTasks();
  }
  renderStats();
  renderOverdue();
}

function renderOverdue() {
  const now = Date.now();
  const overdue = allTasks.filter((t) => t.deadline && new Date(t.deadline).getTime() < now && !doneSet.has(t.id));
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
