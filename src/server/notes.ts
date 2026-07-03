import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const notesFile = path.join(__dirname, "..", "..", "data", "notes.json");

export async function readNotes(): Promise<Note[]> {
  try {
    const raw = await readFile(notesFile, "utf8");
    if (raw.trim().length === 0) {
      return [];
    }

    return JSON.parse(raw) as Note[];
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

export async function writeNotes(notes: Note[]): Promise<void> {
  await mkdir(path.dirname(notesFile), { recursive: true });
  await writeFile(notesFile, JSON.stringify(notes, null, 2), "utf8");
}

export function formatNote(note: Note): string {
  return `${note.id}: ${note.title}\n${note.body}\nCreated: ${note.createdAt}`;
}
