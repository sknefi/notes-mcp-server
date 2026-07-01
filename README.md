# Notes MCP Server

A tiny Model Context Protocol server for learning the basic idea: an AI client can call local tools exposed by your server.

## What It Exposes

- `add_note(title, body)` saves a note to `data/notes.json`
- `list_notes()` returns every saved note
- `search_notes(query)` searches note titles and bodies

## Run It

```bash
npm run dev
```

MCP servers usually run over stdio, so you will normally start this from an MCP client config instead of typing into it directly.
For an MCP client config, use `node` as the command and `dist/index.js` as the argument after running `npm run build`.

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

The AI client starts the MCP server, gives its tools to OpenRouter, executes requested MCP tool calls locally, and returns the final assistant answer.

## Build

```bash
npm run build
```
