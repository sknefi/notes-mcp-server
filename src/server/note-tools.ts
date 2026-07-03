import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { formatNote, type Note, readNotes, writeNotes } from "./notes.js";

export function registerNoteTools(server: McpServer): void {
  server.registerTool(
    "add_note",
    {
      title: "Add note",
      description: "Save a new note with a title and body.",
      inputSchema: {
        title: z.string().min(1).describe("Short note title"),
        body: z.string().min(1).describe("Note body text"),
      },
    },
    async ({ title, body }) => {
      const notes = await readNotes();
      const note: Note = {
        id: crypto.randomUUID(),
        title,
        body,
        createdAt: new Date().toISOString(),
      };

      notes.push(note);
      await writeNotes(notes);

      return {
        content: [
          {
            type: "text",
            text: `Saved note:\n${formatNote(note)}`,
          },
        ],
      };
    },
  );

  server.registerTool(
    "list_notes",
    {
      title: "List notes",
      description: "Return all saved notes.",
    },
    async () => {
      const notes = await readNotes();

      return {
        content: [
          {
            type: "text",
            text:
              notes.length === 0
                ? "No notes saved yet."
                : notes.map(formatNote).join("\n\n"),
          },
        ],
      };
    },
  );

  server.registerTool(
    "search_notes",
    {
      title: "Search notes",
      description: "Search saved notes by title or body text.",
      inputSchema: {
        query: z.string().min(1).describe("Text to search for"),
      },
    },
    async ({ query }) => {
      const notes = await readNotes();
      const lowerQuery = query.toLowerCase();
      const matches = notes.filter(
        (note) =>
          note.title.toLowerCase().includes(lowerQuery) ||
          note.body.toLowerCase().includes(lowerQuery),
      );

      return {
        content: [
          {
            type: "text",
            text:
              matches.length === 0
                ? `No notes matched "${query}".`
                : matches.map(formatNote).join("\n\n"),
          },
        ],
      };
    },
  );
}
