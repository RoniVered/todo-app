import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createDb } from "./db";

const server = new McpServer({ name: "todo-app-mcp", version: "1.0.0" });

server.registerTool(
  "get_task_stats",
  {
    title: "Get task stats",
    description:
      "Get counts of open, completed, and deleted tasks in the todo-app database",
  },
  async () => {
    const db = createDb("todo.db");
    const open = db
      .prepare("SELECT COUNT(*) as c FROM tasks WHERE deleted = 0 AND completed = 0")
      .get() as { c: number };
    const completed = db
      .prepare("SELECT COUNT(*) as c FROM tasks WHERE deleted = 0 AND completed = 1")
      .get() as { c: number };
    const deleted = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE deleted = 1").get() as {
      c: number;
    };

    const stats = { open: open.c, completed: completed.c, deleted: deleted.c };
    return {
      content: [{ type: "text" as const, text: JSON.stringify(stats) }],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
