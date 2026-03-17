import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generatePaystackReference, initPaystackTransaction } from "@/lib/paystack";

const schema = z.object({
  bookingId: z.string().min(1)
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const user = await prisma.user.findFirst({
    where: { email: session.user.email }
  });

  if (!user || !user.email) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsed.data.bookingId }
  });

  if (!booking || booking.userId !== user.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (booking.status !== "PENDING") {
    return NextResponse.json({ error: "Booking is not pending" }, { status: 400 });
  }

  if (booking.holdExpiresAt && booking.holdExpiresAt < new Date()) {
    return NextResponse.json({ error: "Booking hold expired" }, { status: 400 });
  }

  const reference = generatePaystackReference();
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId: user.id,
      amount: booking.price,
      currency: booking.currency,
      providerRef: reference,
      status: "INITIATED"
    }
  });

  const response = await initPaystackTransaction({
    email: user.email,
    amount: booking.price * 100,
    reference,
    callbackUrl: `${process.env.NEXTAUTH_URL}/book?payment=return`,
    metadata: {
      bookingId: booking.id,
      paymentId: payment.id
    }
  });

  return NextResponse.json({
    authorizationUrl: response.data.authorization_url,
    reference
  });
}
