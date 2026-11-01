import { sb, $, PAGES, requireUser, displayName, logout } from "./auth.js";

const user = await requireUser();
if (!user) throw new Error("not logged in");

$("who").textContent = displayName(user);
$("app").hidden = false;

let activeClassId = null;

async function loadClasses() {
  const { data, error } = await sb
    .from("class_members")
    .select("class_id, classes(id, name, code)")
    .eq("user_id", user.id);

  if (error) { $("class-msg").textContent = "Gagal memuat kelas."; return; }

  const list = $("class-list");
  list.innerHTML = "";

  if (!data.length) {
    list.innerHTML = '<p class="empty">Belum gabung kelas. Masukkan kode kelas!</p>';
    return;
  }

  data.forEach((row) => {
    const c = row.classes;
    const card = document.createElement("button");
    card.type = "button";
    card.className = "card" + (c.id === activeClassId ? " active" : "");
    card.innerHTML = `<strong>${esc(c.name)}</strong>`;
    card.addEventListener("click", () => openClass(c));
    list.appendChild(card);
  });
}

async function openClass(c) {
  activeClassId = c.id;
  $("active-class-name").textContent = c.name;
  $("task-section").hidden = false;
  loadClasses();
  loadTasks(c.id);
}

async function loadTasks(classId) {
  const { data: tasks, error } = await sb
    .from("tasks")
    .select("*")
    .eq("class_id", classId)
    .order("created_at", { ascending: false });

  if (error) { $("task-list").innerHTML = '<p class="empty">Gagal memuat tugas.</p>'; return; }

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

$("join-class").addEventListener("submit", async (e) => {
  e.preventDefault();
  const code = $("class-code").value.trim().toLowerCase();
  if (!code) return;
  $("class-msg").textContent = "";

  const { data: cls, error: findErr } = await sb
    .from("classes")
    .select("id")
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
    if (/duplicate/i.test(joinErr.message || "")) {
      $("class-msg").textContent = "Kamu sudah tergabung di kelas ini.";
    } else {
      $("class-msg").textContent = "Gagal bergabung ke kelas.";
    }
    return;
  }

  $("class-code").value = "";
  loadClasses();
});

$("logout").addEventListener("click", logout);

function esc(s) {
  const d = document.createElement("div");
  d.textContent = s;
  return d.innerHTML;
}

loadClasses();
