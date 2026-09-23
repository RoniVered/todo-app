export type Task = {
  id: number;
  title: string;
  completed: boolean;
};

export function addTask(tasks: Task[], title: string): Task[] {
  const nextId = tasks.length > 0 ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
  return [...tasks, { id: nextId, title, completed: false }];
}

export function markDone(task: Task): Task {
  return { ...task, completed: true };
}

export function markAllDone(tasks: Task[]): Task[] {
  return tasks.map((task) => ({ ...task, completed: true }));
}

export function getOpenTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => !task.completed);
}

export function getClosedTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.completed);
}

export function resetTasks(tasks: Task[]): Task[] {
  return tasks.map((task) => ({ ...task, completed: false }));
}
