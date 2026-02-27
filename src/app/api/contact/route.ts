import { NextRequest, NextResponse } from "next/server";

/* src/app/api/contact/route.ts
 * Fixed: Resend uses `reply_to` not `replyTo` in CreateEmailOptions.
 */

export async function POST(req: NextRequest) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Email service not configured." }, { status: 500 });
  }

  try {
    const { name, email, subject, message } = await req.json() as {
      name:    string;
      email:   string;
      subject: string;
      message: string;
    };

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(resendKey);

    const { error } = await resend.emails.send({
      from:     "Trippy Hippie Contact <noreply@trippyhippie.org>",
      to:       ["support@trippyhippie.org"],
      reply_to: email,           // ← correct Resend field name
      subject:  `[Contact] ${subject || "New message from website"}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#7CB342">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:8px 0;color:#666;width:80px">Name</td>
              <td style="padding:8px 0;font-weight:bold">${name}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666">Email</td>
              <td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666">Subject</td>
              <td style="padding:8px 0">${subject || "—"}</td>
            </tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f5f5f5;border-radius:8px;white-space:pre-wrap;">${message}</div>
        </div>
      `,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });

  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
