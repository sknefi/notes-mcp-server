import type { Client } from "@modelcontextprotocol/sdk/client/index.js";

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type ChatMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
};

export type AssistantMessage = {
  role: "assistant";
  content: string | null;
  tool_calls?: ToolCall[];
};

export type OpenRouterTool = {
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

export const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4.1-mini";

export function toOpenRouterTools(
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

export async function callOpenRouter(
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

  console.error("\nOpenRouter assistant message:");
  console.error(JSON.stringify(message, null, 2));

  return message;
}
