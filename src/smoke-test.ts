import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["dist/index.js"],
  cwd: process.cwd(),
});

const client = new Client({
  name: "notes-mcp-smoke-test",
  version: "1.0.0",
});

try {
  await client.connect(transport);

  const tools = await client.listTools();
  console.log(
    "Tools:",
    tools.tools.map((tool) => tool.name).join(", "),
  );

  const addResult = await client.callTool({
    name: "add_note",
    arguments: {
      title: "Learn MCP",
      body: "Tools let the model ask our local server to do useful work.",
    },
  });
  console.log("add_note:", addResult.content);

  const searchResult = await client.callTool({
    name: "search_notes",
    arguments: {
      query: "tools",
    },
  });
  console.log("search_notes:", searchResult.content);
} finally {
  await client.close();
}
