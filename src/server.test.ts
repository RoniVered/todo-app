import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./server";

describe("GET /tasks", () => {
  it("returns an empty list initially", async () => {
    const app = createApp(":memory:");
    const res = await request(app).get("/tasks");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /tasks", () => {
  it("creates a new task and returns it", async () => {
    const app = createApp(":memory:");
    const res = await request(app).post("/tasks").send({ title: "Buy milk" });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Buy milk");
    expect(res.body.completed).toBe(false);
    expect(res.body.id).toBeTypeOf("number");
  });

  it("rejects a request with no title", async () => {
    const app = createApp(":memory:");
    const res = await request(app).post("/tasks").send({});

    expect(res.status).toBe(400);
  });

  it("makes the created task show up in GET /tasks", async () => {
    const app = createApp(":memory:");
    await request(app).post("/tasks").send({ title: "Buy milk" });
    const res = await request(app).get("/tasks");

    expect(res.body).toHaveLength(1);
    expect(res.body[0].title).toBe("Buy milk");
  });
});

describe("PATCH /tasks/:id", () => {
  it("updates the completed status of an existing task", async () => {
    const app = createApp(":memory:");
    const created = await request(app).post("/tasks").send({ title: "Buy milk" });
    const id = created.body.id;

    const res = await request(app).patch(`/tasks/${id}`).send({ completed: true });

    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it("returns 404 for a task id that doesn't exist", async () => {
    const app = createApp(":memory:");
    const res = await request(app).patch("/tasks/999").send({ completed: true });

    expect(res.status).toBe(404);
  });

  it("updates the title of an existing task", async () => {
    const app = createApp(":memory:");
    const created = await request(app).post("/tasks").send({ title: "Buy milk" });
    const id = created.body.id;

    const res = await request(app).patch(`/tasks/${id}`).send({ title: "Buy oat milk" });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Buy oat milk");
  });

  it("rejects an empty title on update", async () => {
    const app = createApp(":memory:");
    const created = await request(app).post("/tasks").send({ title: "Buy milk" });
    const id = created.body.id;

    const res = await request(app).patch(`/tasks/${id}`).send({ title: "   " });

    expect(res.status).toBe(400);
  });

  it("leaves the title unchanged when only completed is sent", async () => {
    const app = createApp(":memory:");
    const created = await request(app).post("/tasks").send({ title: "Buy milk" });
    const id = created.body.id;

    const res = await request(app).patch(`/tasks/${id}`).send({ completed: true });

    expect(res.body.title).toBe("Buy milk");
  });
});

describe("DELETE /tasks/:id", () => {
  it("removes an existing task from the active list", async () => {
    const app = createApp(":memory:");
    const created = await request(app).post("/tasks").send({ title: "Buy milk" });
    const id = created.body.id;

    const del = await request(app).delete(`/tasks/${id}`);
    expect(del.status).toBe(204);

    const list = await request(app).get("/tasks");
    expect(list.body).toEqual([]);
  });

  it("moves the deleted task into the deleted list instead of erasing it", async () => {
    const app = createApp(":memory:");
    const created = await request(app).post("/tasks").send({ title: "Buy milk" });
    const id = created.body.id;

    await request(app).delete(`/tasks/${id}`);
    const deleted = await request(app).get("/tasks/deleted");

    expect(deleted.body).toHaveLength(1);
    expect(deleted.body[0].id).toBe(id);
    expect(deleted.body[0].title).toBe("Buy milk");
  });

  it("returns 404 for a task id that doesn't exist", async () => {
    const app = createApp(":memory:");
    const res = await request(app).delete("/tasks/999");

    expect(res.status).toBe(404);
  });
});

describe("DELETE /tasks (bulk)", () => {
  it("moves all active tasks into the deleted list", async () => {
    const app = createApp(":memory:");
    await request(app).post("/tasks").send({ title: "A" });
    await request(app).post("/tasks").send({ title: "B" });

    const res = await request(app).delete("/tasks");
    expect(res.status).toBe(204);

    const active = await request(app).get("/tasks");
    expect(active.body).toEqual([]);

    const deleted = await request(app).get("/tasks/deleted");
    expect(deleted.body).toHaveLength(2);
  });
});

describe("GET /tasks/deleted", () => {
  it("returns an empty list when nothing was deleted", async () => {
    const app = createApp(":memory:");
    const res = await request(app).get("/tasks/deleted");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe("POST /tasks/:id/restore", () => {
  it("moves a deleted task back to the active list", async () => {
    const app = createApp(":memory:");
    const created = await request(app).post("/tasks").send({ title: "Buy milk" });
    const id = created.body.id;
    await request(app).delete(`/tasks/${id}`);

    const res = await request(app).post(`/tasks/${id}/restore`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(id);

    const active = await request(app).get("/tasks");
    expect(active.body).toHaveLength(1);

    const deleted = await request(app).get("/tasks/deleted");
    expect(deleted.body).toEqual([]);
  });

  it("returns 404 when the task id isn't in the deleted list", async () => {
    const app = createApp(":memory:");
    const res = await request(app).post("/tasks/999/restore");

    expect(res.status).toBe(404);
  });
});

describe("PATCH /tasks (bulk)", () => {
  it("marks all active tasks as completed", async () => {
    const app = createApp(":memory:");
    await request(app).post("/tasks").send({ title: "A" });
    await request(app).post("/tasks").send({ title: "B" });

    const res = await request(app).patch("/tasks").send({ completed: true });
    expect(res.status).toBe(200);

    const list = await request(app).get("/tasks");
    expect(list.body.every((t: { completed: boolean }) => t.completed)).toBe(true);
  });

  it("marks all active tasks as not completed", async () => {
    const app = createApp(":memory:");
    const created = await request(app).post("/tasks").send({ title: "A" });
    await request(app).patch(`/tasks/${created.body.id}`).send({ completed: true });

    const res = await request(app).patch("/tasks").send({ completed: false });
    expect(res.status).toBe(200);

    const list = await request(app).get("/tasks");
    expect(list.body.every((t: { completed: boolean }) => !t.completed)).toBe(true);
  });
});
