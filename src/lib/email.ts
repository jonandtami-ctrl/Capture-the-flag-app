import { Resend } from "resend";

/**
 * Sends form submission notifications via Resend.
 *
 * Required environment variables (see .env.local.example):
 *   - RESEND_API_KEY: API key from https://resend.com/api-keys
 *   - MINISTRY_NOTIFICATION_EMAIL: inbox that should receive form submissions
 *   - MINISTRY_FROM_EMAIL: "from" address. Until a domain is verified in
 *     Resend, use the default "onboarding@resend.dev" sender, which can
 *     deliver to any inbox without domain setup.
 *
 * If RESEND_API_KEY is not set (e.g. local development), submissions are
 * logged to the console instead of sent, so the forms still work end to end.
 */
export async function sendFormNotification({
  subject,
  body,
}: {
  subject: string;
  body: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.MINISTRY_NOTIFICATION_EMAIL;
  const from = process.env.MINISTRY_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey || !to) {
    // eslint-disable-next-line no-console
    console.log(`[email not configured] ${subject}\n${body}`);
    return;
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: `Ministry Website <${from}>`,
    to,
    replyTo: extractReplyTo(body),
    subject,
    text: body,
  });

  if (error) {
    throw new Error(`Failed to send email notification: ${error.message}`);
  }
}

/** Pulls the submitter's email out of the JSON body so replies go straight to them. */
function extractReplyTo(body: string): string | undefined {
  try {
    const data = JSON.parse(body);
    return typeof data.email === "string" ? data.email : undefined;
  } catch {
    return undefined;
  }
}
