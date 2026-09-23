import { describe, it, expect } from "vitest";
import { addTask } from "./index";

describe("addTask", () => {
  it("adds a new task with completed set to false", () => {
    const tasks = [{ id: 1, title: "Existing", completed: true }];
    const result = addTask(tasks, "New task");

    expect(result).toHaveLength(2);
    expect(result[1].title).toBe("New task");
    expect(result[1].completed).toBe(false);
  });

  it("assigns a new id that doesn't collide with existing ones", () => {
    const tasks = [
      { id: 1, title: "A", completed: false },
      { id: 5, title: "B", completed: false },
    ];
    const result = addTask(tasks, "C");

    expect(result[2].id).toBe(6);
  });
});
