#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadEnvFile } from "../shared/env.js";
import { registerCalendarTools } from "./calendar-tools.js";
import { registerDiscordTools } from "./discord-tools.js";
import { registerNoteTools } from "./note-tools.js";

const server = new McpServer({
  name: "notes-mcp-server",
  version: "1.0.0",
});

registerNoteTools(server);
registerDiscordTools(server);
registerCalendarTools(server);

async function main(): Promise<void> {
  await loadEnvFile();

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Notes MCP server running on stdio");
}

main().catch((error: unknown) => {
  console.error("Server error:", error);
  process.exit(1);
});
