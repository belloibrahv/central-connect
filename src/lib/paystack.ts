import { env } from "@/lib/env";

const PAYSTACK_BASE = "https://api.paystack.co";

export type PaystackInitInput = {
  email: string;
  amount: number;
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
};

export async function initPaystackTransaction(input: PaystackInitInput) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata
    })
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Paystack init failed: ${errorBody}`);
  }

  return res.json() as Promise<{ status: boolean; data: { authorization_url: string } }>;
}

export async function verifyPaystackTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${env.PAYSTACK_SECRET_KEY}`
    }
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Paystack verify failed: ${errorBody}`);
  }

  return res.json() as Promise<{ status: boolean; data: { status: string; amount: number; reference: string } }>;
}

export function generatePaystackReference(prefix = "cc") {
  const stamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  return `${prefix}_${stamp}_${random}`;
}
