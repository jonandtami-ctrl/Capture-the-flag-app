import { NextResponse } from "next/server";
import { restoringFoundationsSchema } from "@/lib/validation/restoringFoundations";
import { sendFormNotification } from "@/lib/email";

export async function POST(request: Request) {
  const payload = await request.json();

  // Spam protection placeholder — see prophetic-session route for notes.
  if (payload.honeypot) {
    return NextResponse.json({ ok: true });
  }

  const result = restoringFoundationsSchema.safeParse(payload);
  if (!result.success) {
    return NextResponse.json(
      { ok: false, errors: result.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const data = result.data;

  await sendFormNotification({
    subject: `New Restoring the Foundations Application — ${data.fullName}`,
    body: JSON.stringify(data, null, 2),
  });

  return NextResponse.json({ ok: true });
}
