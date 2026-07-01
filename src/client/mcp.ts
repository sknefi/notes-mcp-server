import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export function createNotesMcpClient(name: string): Client {
  return new Client({
    name,
    version: "1.0.0",
  });
}

export function createNotesMcpTransport(): StdioClientTransport {
  return new StdioClientTransport({
    command: process.execPath,
    args: ["dist/server/index.js"],
    cwd: process.cwd(),
  });
}
