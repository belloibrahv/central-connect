import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyPaystackTransaction } from "@/lib/paystack";

const schema = z.object({
  reference: z.string().min(1)
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const payment = await prisma.payment.findFirst({
    where: { providerRef: parsed.data.reference }
  });

  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const result = await verifyPaystackTransaction(parsed.data.reference);
  const status = result.data.status;

  if (status === "success") {
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

    return NextResponse.json({ ok: true });
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED" }
  });

  return NextResponse.json({ ok: false });
}
