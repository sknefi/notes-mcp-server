import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { createNotesMcpClient, createNotesMcpTransport } from "./mcp.js";
import { DEFAULT_OPENROUTER_MODEL, toOpenRouterTools } from "./openrouter.js";
import { answerWithTools } from "./tool-runner.js";
import { loadEnvFile } from "../shared/env.js";

async function main(): Promise<void> {
  await loadEnvFile();

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_OPENROUTER_MODEL;

  if (!apiKey) {
    throw new Error(
      "Missing OPENROUTER_API_KEY. Add it to a local .env file or export it in your shell.",
    );
  }

  const mcpClient = createNotesMcpClient("notes-mcp-ai-client");
  const transport = createNotesMcpTransport();
  const terminal = createInterface({ input, output });
  const oneShotInput = process.argv.slice(2).join(" ").trim();

  try {
    await mcpClient.connect(transport);
    const mcpTools = await mcpClient.listTools();
    const tools = toOpenRouterTools(mcpTools.tools);

    console.log(`Connected to MCP server with tools: ${mcpTools.tools.map((tool) => tool.name).join(", ")}`);
    console.log(`Using OpenRouter model: ${model}`);

    if (oneShotInput.length > 0) {
      const answer = await answerWithTools(mcpClient, apiKey, model, tools, oneShotInput);
      console.log(`Assistant: ${answer}`);
      return;
    }

    if (!process.stdin.isTTY) {
      console.log('Pass a message after "--", for example: npm run ai -- "list my notes"');
      return;
    }

    console.log('Try: "remember that MCP servers expose tools"');
    console.log('Type "exit" to quit.\n');

    while (true) {
      const userInput = (await terminal.question("You: ")).trim();

      if (userInput.toLowerCase() === "exit") {
        break;
      }

      if (userInput.length === 0) {
        continue;
      }

      const answer = await answerWithTools(mcpClient, apiKey, model, tools, userInput);
      console.log(`Assistant: ${answer}\n`);
    }
  } finally {
    terminal.close();
    await mcpClient.close();
  }
}

main().catch((error: unknown) => {
  console.error("AI client error:", error);
  process.exit(1);
});
