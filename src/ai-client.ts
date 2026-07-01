import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
};

type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

type AssistantMessage = {
  role: "assistant";
  content: string | null;
  tool_calls?: ToolCall[];
};

type OpenRouterTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

type OpenRouterResponse = {
  choices?: Array<{
    message?: AssistantMessage;
  }>;
  error?: {
    message?: string;
  };
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4.1-mini";

async function loadEnvFile(): Promise<void> {
  try {
    const raw = await readFile(".env", "utf8");

    for (const line of raw.split("\n")) {
      const trimmed = line.trim();

      if (trimmed.length === 0 || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");

      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return;
    }

    throw error;
  }
}

function createMcpClient(): Client {
  return new Client({
    name: "notes-mcp-ai-client",
    version: "1.0.0",
  });
}

function createMcpTransport(): StdioClientTransport {
  return new StdioClientTransport({
    command: process.execPath,
    args: ["dist/index.js"],
    cwd: process.cwd(),
  });
}

function toOpenRouterTools(
  tools: Awaited<ReturnType<Client["listTools"]>>["tools"],
): OpenRouterTool[] {
  return tools.map((tool) => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description ?? tool.title ?? tool.name,
      parameters:
        tool.inputSchema ??
        ({
          type: "object",
          properties: {},
          additionalProperties: false,
        } satisfies Record<string, unknown>),
    },
  }));
}

function parseToolArguments(rawArguments: string): Record<string, unknown> {
  if (rawArguments.trim().length === 0) {
    return {};
  }

  const parsed = JSON.parse(rawArguments) as unknown;

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Tool arguments must be a JSON object. Got: ${rawArguments}`);
  }

  return parsed as Record<string, unknown>;
}

function toolResultToText(result: Awaited<ReturnType<Client["callTool"]>>): string {
  return JSON.stringify(result.content ?? result, null, 2);
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  tools: OpenRouterTool[],
): Promise<AssistantMessage> {
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Title": "notes-mcp-learning-client",
    },
    body: JSON.stringify({
      model,
      messages,
      tools,
      tool_choice: "auto",
    }),
  });

  const body = (await response.json()) as OpenRouterResponse;

  if (!response.ok) {
    throw new Error(body.error?.message ?? `OpenRouter request failed: ${response.status}`);
  }

  const message = body.choices?.[0]?.message;

  if (!message) {
    throw new Error("OpenRouter returned no assistant message.");
  }

  return message;
}

async function answerWithTools(
  mcpClient: Client,
  apiKey: string,
  model: string,
  tools: OpenRouterTool[],
  userInput: string,
): Promise<string> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content:
        "You are a small MCP learning client. Use the available note tools when the user asks to save, list, or search notes. After tool calls, explain the result briefly.",
    },
    {
      role: "user",
      content: userInput,
    },
  ];

  for (let step = 0; step < 5; step += 1) {
    const assistantMessage = await callOpenRouter(apiKey, model, messages, tools);
    const toolCalls = assistantMessage.tool_calls ?? [];

    messages.push({
      role: "assistant",
      content: assistantMessage.content,
      tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
    });

    if (toolCalls.length === 0) {
      return assistantMessage.content ?? "";
    }

    for (const toolCall of toolCalls) {
      const toolName = toolCall.function.name;
      const toolArguments = parseToolArguments(toolCall.function.arguments);
      const result = await mcpClient.callTool({
        name: toolName,
        arguments: toolArguments,
      });

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        name: toolName,
        content: toolResultToText(result),
      });
    }
  }

  return "Stopped after too many tool-call rounds.";
}

async function main(): Promise<void> {
  await loadEnvFile();

  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL;

  if (!apiKey) {
    throw new Error(
      "Missing OPENROUTER_API_KEY. Add it to a local .env file or export it in your shell.",
    );
  }

  const mcpClient = createMcpClient();
  const transport = createMcpTransport();
  const terminal = createInterface({ input, output });

  try {
    await mcpClient.connect(transport);
    const mcpTools = await mcpClient.listTools();
    const tools = toOpenRouterTools(mcpTools.tools);

    console.log(`Connected to MCP server with tools: ${mcpTools.tools.map((tool) => tool.name).join(", ")}`);
    console.log(`Using OpenRouter model: ${model}`);
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
