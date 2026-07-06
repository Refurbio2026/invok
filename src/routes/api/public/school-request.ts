import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  sendEmail,
  escapeHtml,
  EMAIL_ADMIN,
} from "@/lib/email/resend.server";

const Schema = z.object({
  skola: z.string().min(2).max(200),
  mesto: z.string().min(1).max(120),
  meno: z.string().min(2).max(120),
  email: z.string().email().max(255),
  telefon: z.string().min(3).max(40),
  pocetZiakov: z.string().max(10),
  sprava: z.string().max(2000).optional().default(""),
});

function adminHtml(d: z.infer<typeof Schema>) {
  const rows: Array<[string, string]> = [
    ["Škola", d.skola],
    ["Mesto", d.mesto],
    ["Kontaktná osoba", d.meno],
    ["E-mail", d.email],
    ["Telefón", d.telefon],
    ["Počet žiakov", d.pocetZiakov],
    ["Správa", d.sprava || "—"],
  ];
  const body = rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:8px 12px;color:#64748b;font-size:13px;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:8px 12px;color:#0f172a;font-size:14px;">${escapeHtml(v).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");
  return `<!doctype html><html><body style="margin:0;background:#f8fafc;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:24px;">
<div style="background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
<div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
<h1 style="margin:0;font-size:18px;color:#0f172a;">Nová žiadosť školy – INVOK</h1>
<p style="margin:6px 0 0;color:#64748b;font-size:13px;">Doručené z kontaktného formulára na invok.pscno.sk</p>
</div>
<table style="width:100%;border-collapse:collapse;">${body}</table>
</div>
<p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:16px;">Odpovedaním priamo na tento e-mail píšete žiadateľovi.</p>
</div></body></html>`;
}

function confirmationHtml(d: z.infer<typeof Schema>) {
  return `<!doctype html><html><body style="margin:0;background:#ffffff;font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#0f172a;">
<div style="max-width:560px;margin:0 auto;padding:32px 24px;">
<h1 style="font-size:22px;margin:0 0 12px;">Ďakujeme za váš záujem, ${escapeHtml(d.meno)}!</h1>
<p style="color:#334155;line-height:1.6;">Prijali sme vašu žiadosť o predstavenie programu <strong>INVOK</strong> pre školu <strong>${escapeHtml(d.skola)}</strong>. Koordinátor programu vás bude kontaktovať do dvoch pracovných dní.</p>
<div style="margin:24px 0;padding:16px 20px;background:#f1f5f9;border-radius:12px;">
<p style="margin:0;color:#475569;font-size:14px;">Ak potrebujete niečo doplniť, jednoducho odpovedzte na tento e-mail alebo nás kontaktujte na <a href="mailto:invok@pscno.sk" style="color:#0f766e;">invok@pscno.sk</a>.</p>
</div>
<p style="color:#64748b;font-size:13px;margin-top:32px;">S pozdravom,<br>tím INVOK</p>
</div></body></html>`;
}

export const Route = createFileRoute("/api/public/school-request")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }
        const parsed = Schema.safeParse(payload);
        if (!parsed.success) {
          return Response.json(
            { error: "Invalid input", issues: parsed.error.issues },
            { status: 400 },
          );
        }
        const d = parsed.data;

        try {
          // Admin notification (reply-to points to submitter for easy reply)
          await sendEmail({
            to: EMAIL_ADMIN,
            subject: `Nová žiadosť školy: ${d.skola}`,
            html: adminHtml(d),
            replyTo: d.email,
          });
          // Confirmation to submitter
          await sendEmail({
            to: d.email,
            subject: "Prijali sme vašu žiadosť – INVOK",
            html: confirmationHtml(d),
          });
        } catch (e) {
          console.error("[school-request] email send failed", e);
          return Response.json(
            { error: "Email delivery failed" },
            { status: 502 },
          );
        }

        return Response.json({ ok: true });
      },
    },
  },
});
