/**
 * Email submission integration placeholder.
 *
 * Wire this up to a real provider before launch, for example:
 *   - Resend (https://resend.com)
 *   - Postmark
 *   - SendGrid
 *   - A CRM / Google Sheets webhook
 *
 * Example with Resend:
 *
 *   import { Resend } from "resend";
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({
 *     from: "Ministry Website <forms@yourdomain.org>",
 *     to: process.env.MINISTRY_NOTIFICATION_EMAIL!,
 *     subject,
 *     text: body,
 *   });
 */
export async function sendFormNotification({
  subject,
  body,
}: {
  subject: string;
  body: string;
}): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`[email placeholder] ${subject}\n${body}`);
}
