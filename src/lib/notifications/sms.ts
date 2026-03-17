import { env } from "@/lib/env";

type SmsPayload = {
  to: string;
  message: string;
};

export async function sendSms(payload: SmsPayload) {
  if (env.SMS_PROVIDER === "TERMII" && env.TERMII_API_KEY) {
    const baseUrl = env.TERMII_BASE_URL ?? "https://api.ng.termii.com";

    const res = await fetch(`${baseUrl}/api/sms/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        api_key: env.TERMII_API_KEY,
        to: payload.to,
        from: env.SMS_SENDER_ID,
        sms: payload.message,
        type: "plain",
        channel: "generic"
      })
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`SMS send failed: ${errorBody}`);
    }

    return;
  }

  console.warn("SMS provider not configured. Skipping send.");
}
