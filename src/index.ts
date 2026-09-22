type Task = {
  id: number;
  title: string;
  completed: boolean;
};

function markDone(task: Task): Task {
  return { ...task, completed: true };
}

function markAllDone(tasks: Task[]): Task[] {
  return tasks.map((task) => ({ ...task, completed: true }));
}

function getOpenTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => !task.completed);
}

function getClosedTasks(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.completed);
}

function resetTasks(tasks: Task[]): Task[] {
  return tasks.map((task) => ({ ...task, completed: false }));
}

const sample: Task = { id: 1, title: "Learn TypeScript", completed: false };
console.log(markDone(sample));

const tasks: Task[] = [
  { id: 1, title: "Learn TypeScript", completed: false },
  { id: 2, title: "Learn Git", completed: true },
  { id: 3, title: "Learn npm", completed: true },
];

console.log("open:", getOpenTasks(tasks));
console.log("closed:", getClosedTasks(tasks));
console.log("all done:", markAllDone(tasks));
console.log("reset:", resetTasks(tasks));
