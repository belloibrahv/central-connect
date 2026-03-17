import { NextResponse } from "next/server";
import { z } from "zod";
import { addMinutes } from "date-fns";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  bedId: z.string().min(1),
  termId: z.string().min(1)
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

  const { bedId, termId } = parsed.data;
  const user = await prisma.user.findFirst({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const bed = await prisma.bed.findUnique({
    where: { id: bedId },
    include: { room: { include: { roomType: true } }, hostel: true }
  });

  const term = await prisma.term.findUnique({ where: { id: termId } });

  if (!bed || !term || bed.hostelId !== term.hostelId) {
    return NextResponse.json({ error: "Invalid bed or term" }, { status: 400 });
  }

  const existingBooking = await prisma.booking.findFirst({
    where: {
      bedId,
      termId,
      isActive: true,
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [
        { holdExpiresAt: null },
        { holdExpiresAt: { gt: new Date() } }
      ]
    }
  });

  if (existingBooking) {
    if (existingBooking.status === "CONFIRMED") {
      return NextResponse.json({ error: "This bed is already booked" }, { status: 409 });
    }
    if (existingBooking.userId === user.id) {
      return NextResponse.json({ error: "You already have a pending booking for this bed" }, { status: 409 });
    }
    return NextResponse.json({ error: "This bed is currently being booked by another user" }, { status: 409 });
  }

  const existingUserBooking = await prisma.booking.findFirst({
    where: {
      userId: user.id,
      termId,
      isActive: true,
      status: { in: ["PENDING", "CONFIRMED"] },
      OR: [
        { holdExpiresAt: null },
        { holdExpiresAt: { gt: new Date() } }
      ]
    }
  });

  if (existingUserBooking) {
    return NextResponse.json({ error: "You already have a booking for this term" }, { status: 409 });
  }

  const holdExpiresAt = addMinutes(new Date(), 10);
  const price = bed.room.roomType.basePrice;

  try {
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        bedId,
        termId,
        price,
        holdExpiresAt,
        status: "PENDING",
        isActive: true
      }
    });

    return NextResponse.json({ bookingId: booking.id, holdExpiresAt, price });
  } catch (error) {
    return NextResponse.json({ error: "Bed is already held or booked" }, { status: 409 });
  }
}
