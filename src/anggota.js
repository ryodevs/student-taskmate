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
}

let activeClassId = null;

async function init() {
  initSidebar();

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

  const { data: completions } = await sb
    .from("task_completions")
    .select("task_id")
    .eq("user_id", user.id);

  const doneSet = new Set((completions || []).map((c) => c.task_id));

  const list = $("task-list");
  list.innerHTML = "";
  $("task-empty").hidden = tasks.length > 0;

  tasks.forEach((t) => {
    const done = doneSet.has(t.id);
    const div = document.createElement("div");
    div.className = "task-item" + (done ? " done" : "");
    const dl = t.deadline ? new Date(t.deadline).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "";
    div.innerHTML = `
      <label class="task-check">
        <input type="checkbox" ${done ? "checked" : ""} data-id="${t.id}">
        <div class="task-info">
          <strong>${esc(t.title)}</strong>
          ${t.description ? `<p>${esc(t.description)}</p>` : ""}
          ${dl ? `<small class="deadline">Deadline: ${dl}</small>` : ""}
        </div>
      </label>`;
    div.querySelector("input").addEventListener("change", (e) => toggleTask(t.id, e.target.checked));
    list.appendChild(div);
  });
}

async function toggleTask(taskId, checked) {
  if (checked) {
    await sb.from("task_completions").insert({ task_id: taskId, user_id: user.id });
  } else {
    await sb.from("task_completions").delete().eq("task_id", taskId).eq("user_id", user.id);
  }
  loadTasks(activeClassId);
}

init();
