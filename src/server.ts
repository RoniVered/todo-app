import express, { type Express } from "express";
import path from "node:path";
import { createDb } from "./db";

type TaskRow = {
  id: number;
  title: string;
  completed: number;
  deleted: number;
};

function toTask(row: TaskRow) {
  return { id: row.id, title: row.title, completed: Boolean(row.completed) };
}

export function createApp(dbPath: string = "todo.db"): Express {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, "../public")));

  const db = createDb(dbPath);

  app.get("/tasks", (_req, res) => {
    const rows = db.prepare("SELECT * FROM tasks WHERE deleted = 0").all() as TaskRow[];
    res.json(rows.map(toTask));
  });

  app.get("/tasks/deleted", (_req, res) => {
    const rows = db.prepare("SELECT * FROM tasks WHERE deleted = 1").all() as TaskRow[];
    res.json(rows.map(toTask));
  });

  app.post("/tasks", (req, res) => {
    const { title } = req.body;
    if (typeof title !== "string" || title.trim() === "") {
      res.status(400).json({ error: "title is required" });
      return;
    }
    const result = db.prepare("INSERT INTO tasks (title) VALUES (?)").run(title);
    const row = db
      .prepare("SELECT * FROM tasks WHERE id = ?")
      .get(result.lastInsertRowid) as TaskRow;
    res.status(201).json(toTask(row));
  });

  app.post("/tasks/:id/restore", (req, res) => {
    const id = Number(req.params.id);
    const row = db
      .prepare("SELECT * FROM tasks WHERE id = ? AND deleted = 1")
      .get(id) as TaskRow | undefined;
    if (!row) {
      res.status(404).json({ error: "deleted task not found" });
      return;
    }
    db.prepare("UPDATE tasks SET deleted = 0 WHERE id = ?").run(id);
    res.json(toTask(row));
  });

  app.patch("/tasks", (req, res) => {
    const completed = req.body.completed ? 1 : 0;
    db.prepare("UPDATE tasks SET completed = ? WHERE deleted = 0").run(completed);
    const rows = db.prepare("SELECT * FROM tasks WHERE deleted = 0").all() as TaskRow[];
    res.json(rows.map(toTask));
  });

  app.patch("/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const row = db
      .prepare("SELECT * FROM tasks WHERE id = ? AND deleted = 0")
      .get(id) as TaskRow | undefined;
    if (!row) {
      res.status(404).json({ error: "task not found" });
      return;
    }

    const { title, completed } = req.body;
    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      res.status(400).json({ error: "title must be a non-empty string" });
      return;
    }

    const newTitle = title !== undefined ? title : row.title;
    const newCompleted = completed !== undefined ? (completed ? 1 : 0) : row.completed;

    db.prepare("UPDATE tasks SET title = ?, completed = ? WHERE id = ?").run(
      newTitle,
      newCompleted,
      id
    );
    res.json({ id: row.id, title: newTitle, completed: Boolean(newCompleted) });
  });

  app.delete("/tasks", (_req, res) => {
    db.prepare("UPDATE tasks SET deleted = 1 WHERE deleted = 0").run();
    res.status(204).send();
  });

  app.delete("/tasks/:id", (req, res) => {
    const id = Number(req.params.id);
    const row = db
      .prepare("SELECT * FROM tasks WHERE id = ? AND deleted = 0")
      .get(id) as TaskRow | undefined;
    if (!row) {
      res.status(404).json({ error: "task not found" });
      return;
    }
    db.prepare("UPDATE tasks SET deleted = 1 WHERE id = ?").run(id);
    res.status(204).send();
  });

  return app;
}
