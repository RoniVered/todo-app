const listEl = document.getElementById("task-list");
const deletedListEl = document.getElementById("deleted-list");
const formEl = document.getElementById("add-form");
const inputEl = document.getElementById("title-input");
const openCountEl = document.getElementById("open-count");
const doneCountEl = document.getElementById("done-count");
const deletedCountEl = document.getElementById("deleted-count");

const TRASH_ICON =
  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-9 0v14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6"/></svg>';
const RESTORE_ICON =
  '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></svg>';

async function loadTasks() {
  const [tasksRes, deletedRes] = await Promise.all([
    fetch("/tasks"),
    fetch("/tasks/deleted"),
  ]);
  render(await tasksRes.json(), await deletedRes.json());
}

function render(tasks, deletedTasks) {
  openCountEl.textContent = tasks.filter((t) => !t.completed).length;
  doneCountEl.textContent = tasks.filter((t) => t.completed).length;
  deletedCountEl.textContent = deletedTasks.length;

  listEl.innerHTML = "";
  for (const task of tasks) {
    const row = document.createElement("div");
    row.className = "task" + (task.completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id, checkbox.checked));

    const span = document.createElement("span");
    span.textContent = task.title;
    span.classList.add("editable");
    span.addEventListener("click", () => startEditing(span, task));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "icon-btn";
    deleteBtn.setAttribute("aria-label", "מחק");
    deleteBtn.innerHTML = TRASH_ICON;
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    row.append(checkbox, span, deleteBtn);
    listEl.append(row);
  }

  deletedListEl.innerHTML = "";
  for (const task of deletedTasks) {
    const row = document.createElement("div");
    row.className = "deleted-task";

    const span = document.createElement("span");
    span.textContent = task.title;

    const restoreBtn = document.createElement("button");
    restoreBtn.className = "restore-btn";
    restoreBtn.innerHTML = `${RESTORE_ICON}<span>שחזר</span>`;
    restoreBtn.addEventListener("click", () => restoreTask(task.id));

    row.append(span, restoreBtn);
    deletedListEl.append(row);
  }
}

function startEditing(span, task) {
  const input = document.createElement("input");
  input.type = "text";
  input.value = task.title;
  input.className = "edit-input";
  span.replaceWith(input);
  input.focus();
  input.select();

  let settled = false;

  const save = async () => {
    if (settled) return;
    settled = true;
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== task.title) {
      await fetch(`/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
    }
    loadTasks();
  };

  const cancel = () => {
    if (settled) return;
    settled = true;
    loadTasks();
  };

  input.addEventListener("blur", save);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") input.blur();
    if (event.key === "Escape") cancel();
  });
}

async function toggleTask(id, completed) {
  await fetch(`/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`/tasks/${id}`, { method: "DELETE" });
  loadTasks();
}

async function restoreTask(id) {
  await fetch(`/tasks/${id}/restore`, { method: "POST" });
  loadTasks();
}

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = inputEl.value.trim();
  if (!title) return;

  await fetch("/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  inputEl.value = "";
  loadTasks();
});

document.getElementById("mark-all-done").addEventListener("click", async () => {
  await fetch("/tasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: true }),
  });
  loadTasks();
});

document.getElementById("mark-all-undone").addEventListener("click", async () => {
  await fetch("/tasks", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: false }),
  });
  loadTasks();
});

document.getElementById("delete-all").addEventListener("click", async () => {
  await fetch("/tasks", { method: "DELETE" });
  loadTasks();
});

loadTasks();
