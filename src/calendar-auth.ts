import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { getAuthUrl, saveTokenFromCode } from "./server/integrations/google-calendar.js";
import { loadEnvFile } from "./shared/env.js";

async function main(): Promise<void> {
  await loadEnvFile();

  const terminal = createInterface({ input, output });
  const codeFromArgs = process.argv.slice(2).join("").trim();

  try {
    const authUrl = await getAuthUrl();
    console.log("Open this URL in your browser:");
    console.log(authUrl);
    console.log("\nAfter approving access, copy the code from the redirect URL.");

    if (codeFromArgs) {
      const tokenPath = await saveTokenFromCode(codeFromArgs);
      console.log(`Google Calendar token saved to ${tokenPath}`);
      return;
    }

    if (!process.stdin.isTTY) {
      console.log('Then run: npm run calendar:auth -- "PASTE_CODE_HERE"');
      return;
    }

    const code = (await terminal.question("Google auth code: ")).trim();

    if (!code) {
      throw new Error("No auth code provided.");
    }

    const tokenPath = await saveTokenFromCode(code);
    console.log(`Google Calendar token saved to ${tokenPath}`);
  } finally {
    terminal.close();
  }
}

main().catch((error: unknown) => {
  console.error("Google Calendar auth error:", error);
  process.exit(1);
});
