# Setup Guide

This guide explains how to run this MCP learning project locally.

## Requirements

- Node.js 20+
- npm
- OpenRouter API key
- Discord webhook URL
- Google Cloud OAuth desktop credentials

## Install Dependencies

```bash
npm install
```

## Create `.env`

Copy the example file:

```bash
cp .env.example .env
```

Fill in:

```bash
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4.1-mini

DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

GOOGLE_CALENDAR_ID=primary
GOOGLE_CREDENTIALS_PATH=.credentials/google-oauth-client.json
GOOGLE_TOKEN_PATH=.credentials/google-calendar-token.json
```

`.env` is ignored by Git.

## Discord Webhook

In Discord:

1. Open your server.
2. Open the channel for MCP updates.
3. Go to channel settings.
4. Open **Integrations**.
5. Create a webhook.
6. Copy the webhook URL.
7. Paste it into `DISCORD_WEBHOOK_URL`.

## Google Calendar OAuth

In Google Cloud Console:

1. Create or select a Google Cloud project.
2. Enable **Google Calendar API**.
3. Configure the OAuth consent screen.
4. If the app is external/testing, add your Google email as a test user.
5. Create OAuth credentials.
6. Choose application type: **Desktop app**.
7. Download the JSON file.
8. Save it as:

```text
.credentials/google-oauth-client.json
```

`.credentials/` is ignored by Git.

Then run:

```bash
npm run calendar:auth
```

Open the printed Google URL and approve access.

Google will redirect to `http://localhost/?code=...`. It is okay if the page says `localhost refused to connect`. Copy the `code` value from the address bar.

Then run:

```bash
npm run calendar:auth -- "PASTE_CODE_HERE"
```

This creates:

```text
.credentials/google-calendar-token.json
```

## Verify MCP Tools

Run:

```bash
npm run smoke
```

Expected tools:

```text
add_note
list_notes
search_notes
send_discord_message
create_calendar_event
list_calendar_events
```

## Run AI Client

Interactive mode:

```bash
npm run ai
```

One-shot mode:

```bash
npm run ai -- "send a Discord message saying MCP works"
```

Calendar example:

```bash
npm run ai -- "create a calendar event called MCP test from 2026-07-04T10:00:00+02:00 to 2026-07-04T10:30:00+02:00"
```

List calendar events:

```bash
npm run ai -- "list my calendar events from 2026-07-04T00:00:00+02:00 to 2026-07-05T00:00:00+02:00"
```

## Useful Commands

```bash
npm run build
npm run smoke
npm run ai
npm run calendar:auth
```

## Common Issues

### Google says app is not verified

For local testing, add your Google email as a test user in Google Cloud Console:

```text
Google Auth Platform -> Audience -> Test users
```

### localhost refused to connect

This is expected. Copy the `code` parameter from the browser address bar and run:

```bash
npm run calendar:auth -- "PASTE_CODE_HERE"
```

### Google Calendar token is missing

Run:

```bash
npm run calendar:auth
```

### Discord message fails

Check that `DISCORD_WEBHOOK_URL` is present in `.env` and that the webhook still exists in Discord.
