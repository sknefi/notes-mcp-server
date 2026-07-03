# MCP Integrations Learning Project

A small Model Context Protocol project for learning how an AI client can discover and call local tools. The server currently exposes local note tools plus external integrations for Discord and Google Calendar.

## What This Project Shows

- An MCP server exposing tools over stdio
- A scripted MCP smoke-test client
- An OpenRouter-powered AI client that chooses MCP tools
- Discord webhook side effects
- Google Calendar OAuth and event tools

## Setup

Follow the full setup guide:

[docs/setup.md](/Users/filip/Desktop/mcp/docs/setup.md)

That guide covers `.env`, Discord webhooks, Google Calendar OAuth, and common setup issues.

## MCP Tools

Local notes:

- `add_note(title, body)`
- `list_notes()`
- `search_notes(query)`

Discord:

- `send_discord_message(message)`

Google Calendar:

- `create_calendar_event(title, start, end, description?, location?)`
- `list_calendar_events(start, end, maxResults?)`

## Commands

Install dependencies:

```bash
npm install
```

Build:

```bash
npm run build
```

Verify MCP tool discovery and basic note tools:

```bash
npm run smoke
```

Run the AI client:

```bash
npm run ai
```

Run a one-shot AI prompt:

```bash
npm run ai -- "send a Discord message saying MCP works"
```

Authorize Google Calendar:

```bash
npm run calendar:auth
```

## MCP Server Config

The server runs over stdio. After building, an MCP client can start it with:

```text
command: node
args: ["dist/server/index.js"]
```

The local AI client already does this automatically.
