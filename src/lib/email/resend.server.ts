// Server-only Resend helper. Do not import from client code.
// Uses the RESEND_API_KEY secret directly (not via connector gateway).

const RESEND_API = "https://api.resend.com/emails";

export const EMAIL_FROM = "INVOK <noreply@invok.pscno.sk>";
export const EMAIL_REPLY_TO = "invok@pscno.sk";
export const EMAIL_ADMIN = "invok@pscno.sk";

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  from?: string;
};

export async function sendEmail(args: SendArgs) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: args.from ?? EMAIL_FROM,
      to: Array.isArray(args.to) ? args.to : [args.to],
      subject: args.subject,
      html: args.html,
      text: args.text,
      reply_to: args.replyTo ?? EMAIL_REPLY_TO,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend ${res.status}: ${body.slice(0, 500)}`);
  }
  return (await res.json()) as { id: string };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
