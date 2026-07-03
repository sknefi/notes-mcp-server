import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { google } from "googleapis";

type OAuthClientConfig = {
  client_id: string;
  client_secret: string;
  redirect_uris?: string[];
};

type GoogleCredentials = {
  installed?: OAuthClientConfig;
  web?: OAuthClientConfig;
};

export type CalendarEventInput = {
  title: string;
  start: string;
  end: string;
  description?: string;
  location?: string;
};

const CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar";

function getCalendarId(): string {
  return process.env.GOOGLE_CALENDAR_ID ?? "primary";
}

function getCredentialsPath(): string {
  return process.env.GOOGLE_CREDENTIALS_PATH ?? ".credentials/google-oauth-client.json";
}

function getTokenPath(): string {
  return process.env.GOOGLE_TOKEN_PATH ?? ".credentials/google-calendar-token.json";
}

function getOAuthConfig(credentials: GoogleCredentials): OAuthClientConfig {
  const config = credentials.installed ?? credentials.web;

  if (!config?.client_id || !config.client_secret) {
    throw new Error("Google OAuth credentials must include client_id and client_secret.");
  }

  return config;
}

async function readCredentials(): Promise<OAuthClientConfig> {
  const raw = await readFile(getCredentialsPath(), "utf8");
  return getOAuthConfig(JSON.parse(raw) as GoogleCredentials);
}

export async function createOAuthClient() {
  const config = await readCredentials();
  const redirectUri = config.redirect_uris?.[0] ?? "http://localhost";

  return new google.auth.OAuth2(config.client_id, config.client_secret, redirectUri);
}

export async function getAuthUrl(): Promise<string> {
  const oauth2Client = await createOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [CALENDAR_SCOPE],
  });
}

export async function saveTokenFromCode(code: string): Promise<string> {
  const oauth2Client = await createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  const tokenPath = getTokenPath();

  await mkdir(path.dirname(tokenPath), { recursive: true });
  await writeFile(tokenPath, JSON.stringify(tokens, null, 2), "utf8");

  return tokenPath;
}

export async function createAuthorizedCalendarClient() {
  const oauth2Client = await createOAuthClient();

  let rawToken: string;
  try {
    rawToken = await readFile(getTokenPath(), "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      throw new Error("Google Calendar token is missing. Run: npm run calendar:auth");
    }

    throw error;
  }

  oauth2Client.setCredentials(JSON.parse(rawToken));

  return google.calendar({
    version: "v3",
    auth: oauth2Client,
  });
}

export async function createCalendarEvent(input: CalendarEventInput): Promise<string> {
  const calendar = await createAuthorizedCalendarClient();
  const response = await calendar.events.insert({
    calendarId: getCalendarId(),
    requestBody: {
      summary: input.title,
      description: input.description,
      location: input.location,
      start: {
        dateTime: input.start,
      },
      end: {
        dateTime: input.end,
      },
    },
  });

  const event = response.data;
  const link = event.htmlLink ? `\nLink: ${event.htmlLink}` : "";

  return `Calendar event created: ${event.summary ?? input.title}${link}`;
}

export async function listCalendarEvents(
  start: string,
  end: string,
  maxResults: number,
): Promise<string> {
  const calendar = await createAuthorizedCalendarClient();
  const response = await calendar.events.list({
    calendarId: getCalendarId(),
    timeMin: start,
    timeMax: end,
    maxResults,
    singleEvents: true,
    orderBy: "startTime",
  });

  const events = response.data.items ?? [];

  if (events.length === 0) {
    return "No calendar events found.";
  }

  return events
    .map((event) => {
      const eventStart = event.start?.dateTime ?? event.start?.date ?? "unknown start";
      return `${eventStart}: ${event.summary ?? "(untitled)"}`;
    })
    .join("\n");
}
