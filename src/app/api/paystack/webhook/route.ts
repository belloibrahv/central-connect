import { NextResponse } from "next/server";
import crypto from "crypto";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

export async function POST(request: Request) {
  const signature = request.headers.get("x-paystack-signature");
  const rawBody = await request.text();

  const hash = crypto
    .createHmac("sha512", env.PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  if (!signature || signature !== hash) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as {
    event: string;
    data: { reference: string; status: string };
  };

  if (event.event === "charge.success") {
    const payment = await prisma.payment.findFirst({
      where: { providerRef: event.data.reference }
    });

    if (payment) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: { status: "SUCCESS", paidAt: new Date() }
        }),
        prisma.booking.update({
          where: { id: payment.bookingId },
          data: { status: "CONFIRMED", holdExpiresAt: null }
        })
      ]);
    }
  }

  return NextResponse.json({ ok: true });
}
