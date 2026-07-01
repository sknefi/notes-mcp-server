import { createNotesMcpClient, createNotesMcpTransport } from "./mcp.js";

const transport = createNotesMcpTransport();
const client = createNotesMcpClient("notes-mcp-smoke-test");

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
