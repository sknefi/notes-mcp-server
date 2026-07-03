import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { createCalendarEvent, listCalendarEvents } from "./integrations/google-calendar.js";

function errorToText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function registerCalendarTools(server: McpServer): void {
  server.registerTool(
    "create_calendar_event",
    {
      title: "Create calendar event",
      description:
        "Create an event in the configured Google Calendar. Start and end must be ISO datetime strings with timezone offsets.",
      inputSchema: {
        title: z.string().min(1).describe("Calendar event title"),
        start: z.string().datetime({ offset: true }).describe("Event start ISO datetime with timezone"),
        end: z.string().datetime({ offset: true }).describe("Event end ISO datetime with timezone"),
        description: z.string().optional().describe("Optional event description"),
        location: z.string().optional().describe("Optional event location"),
      },
    },
    async ({ title, start, end, description, location }) => {
      let result: string;
      try {
        result = await createCalendarEvent({
          title,
          start,
          end,
          description,
          location,
        });
      } catch (error) {
        result = `Calendar event creation failed: ${errorToText(error)}`;
      }

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

  server.registerTool(
    "list_calendar_events",
    {
      title: "List calendar events",
      description:
        "List events from the configured Google Calendar between two ISO datetimes with timezone offsets.",
      inputSchema: {
        start: z.string().datetime({ offset: true }).describe("Range start ISO datetime with timezone"),
        end: z.string().datetime({ offset: true }).describe("Range end ISO datetime with timezone"),
        maxResults: z
          .number()
          .int()
          .min(1)
          .max(50)
          .default(10)
          .describe("Maximum number of events to return"),
      },
    },
    async ({ start, end, maxResults }) => {
      let result: string;
      try {
        result = await listCalendarEvents(start, end, maxResults);
      } catch (error) {
        result = `Calendar event listing failed: ${errorToText(error)}`;
      }

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
