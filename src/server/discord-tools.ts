import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { sendDiscordWebhookMessage } from "./integrations/discord.js";

export function registerDiscordTools(server: McpServer): void {
  server.registerTool(
    "send_discord_message",
    {
      title: "Send Discord message",
      description: "Send a plain text message to the configured Discord webhook channel.",
      inputSchema: {
        message: z.string().min(1).max(2000).describe("Message text to send to Discord"),
      },
    },
    async ({ message }) => {
      const result = await sendDiscordWebhookMessage(message);

      return {
        content: [
          {
            type: "text",
            text: result,
          },
        ],
      };
    },
  );
}
