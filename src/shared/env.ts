import { readFile } from "node:fs/promises";

export async function loadEnvFile(filePath = ".env"): Promise<void> {
  try {
    const raw = await readFile(filePath, "utf8");

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
