import type { Client } from "@modelcontextprotocol/sdk/client/index.js";
import {
  callOpenRouter,
  type ChatMessage,
  type OpenRouterTool,
} from "./openrouter.js";

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

export async function answerWithTools(
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
