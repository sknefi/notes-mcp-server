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

## Build

```bash
npm run build
```
