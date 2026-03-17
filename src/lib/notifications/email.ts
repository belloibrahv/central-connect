import { env } from "@/lib/env";

type EmailPayload = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
};

export async function sendEmail(payload: EmailPayload) {
  if (env.EMAIL_PROVIDER === "RESEND" && env.RESEND_API_KEY) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text
      })
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`Email send failed: ${errorBody}`);
    }

    return;
  }

  console.warn("Email provider not configured. Skipping send.");
}
