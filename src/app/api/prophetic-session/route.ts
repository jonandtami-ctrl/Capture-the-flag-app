import { NextResponse } from "next/server";
import { propheticSessionSchema } from "@/lib/validation/propheticSession";
import { sendFormNotification } from "@/lib/email";

export async function POST(request: Request) {
  const payload = await request.json();

  // Spam protection placeholder: a hidden honeypot field. Real bots tend to
  // fill in every field, so a non-empty honeypot means we quietly discard it.
  // Consider replacing/augmenting with a service like Cloudflare Turnstile
  // or hCaptcha before launch.
  if (payload.honeypot) {
    return NextResponse.json({ ok: true });
  }

  const result = propheticSessionSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json(
      { ok: false, errors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = result.data;

  await sendFormNotification({
    subject: `New Prophetic Session Request — ${data.fullName}`,
    body: JSON.stringify(data, null, 2),
  });

  return NextResponse.json({ ok: true });
}
