export async function sendDiscordWebhookMessage(message: string): Promise<string> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    return "Discord webhook is not configured. Set DISCORD_WEBHOOK_URL in .env.";
  }

  let response: Response;
  try {
    response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: message,
      }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `Discord message failed: ${message}`;
  }

  if (!response.ok) {
    const body = await response.text();
    return `Discord message failed with ${response.status}: ${body}`;
  }

  return "Discord message sent.";
}
