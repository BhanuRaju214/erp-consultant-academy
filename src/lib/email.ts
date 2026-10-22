import "server-only";

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export type EmailResult = { ok: true; id?: string } | { ok: false; error: string };

/**
 * Sends transactional email through Resend when RESEND_API_KEY is set.
 * Without a key, development logs the message to the server console so flows
 * like password reset can be tested locally; production logs an error instead.
 */
export async function sendEmail(msg: EmailMessage): Promise<EmailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") {
      console.error(`[email] RESEND_API_KEY is not set; could not send "${msg.subject}".`);
      return { ok: false, error: "Email is not configured." };
    }
    console.info(`\n[email] To: ${msg.to}\n[email] Subject: ${msg.subject}\n${msg.text}\n`);
    return { ok: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM ?? "nexusEPM Academy <no-reply@example.com>",
      to: [msg.to],
      subject: msg.subject,
      text: msg.text,
      html: msg.html,
    }),
    cache: "no-store",
  });
  const body = await res.text();
  if (!res.ok) {
    console.error(`[email] Resend returned ${res.status} for "${msg.subject}": ${body}`);
    return { ok: false, error: `Resend ${res.status}: ${body}` };
  }
  const id = (JSON.parse(body) as { id?: string }).id;
  console.info(`[email] Sent "${msg.subject}" (Resend id ${id})`);
  return { ok: true, id };
}
