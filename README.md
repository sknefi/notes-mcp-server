# Notes MCP Server

A tiny Model Context Protocol server for learning the basic idea: an AI client can call local tools exposed by your server.

## What It Exposes

- `add_note(title, body)` saves a note to `data/notes.json`
- `list_notes()` returns every saved note
- `search_notes(query)` searches note titles and bodies
- `send_discord_message(message)` sends a message through the configured Discord webhook
- `create_calendar_event(title, start, end, description?, location?)` creates a Google Calendar event
- `list_calendar_events(start, end, maxResults?)` lists Google Calendar events

## Run It

```bash
npm run dev
```

MCP servers usually run over stdio, so you will normally start this from an MCP client config instead of typing into it directly.
For an MCP client config, use `node` as the command and `dist/server/index.js` as the argument after running `npm run build`.

## Verify It

```bash
npm run smoke
```

The smoke test starts the MCP server, lists its tools, adds a note, and searches for it.

## AI Client

Create a local `.env` file:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4.1-mini
```

Then run:

```bash
npm run ai
```

Or run one prompt directly:

```bash
npm run ai -- "remember that MCP servers expose tools"
```

The AI client starts the MCP server, gives its tools to OpenRouter, executes requested MCP tool calls locally, and returns the final assistant answer.

## External Integrations

Discord uses `DISCORD_WEBHOOK_URL` from `.env`.

Google Calendar uses OAuth credentials from `.credentials/google-oauth-client.json`. Run this once to create the token file:

```bash
npm run calendar:auth
```

If your terminal cannot prompt for input, paste the returned code as an argument:

```bash
npm run calendar:auth -- "PASTE_CODE_HERE"
```

Then the AI client can create or list calendar events through MCP tools.

## Build

```bash
npm run build
```
