import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const schema = z.object({
  hostelId: z.string().min(1),
  roomId: z.string().optional(),
  location: z.string().optional(),
  category: z.string().min(2),
  description: z.string().min(10)
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

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const issue = await prisma.issue.create({
    data: {
      userId: user.id,
      hostelId: parsed.data.hostelId,
      roomId: parsed.data.roomId,
      location: parsed.data.location,
      category: parsed.data.category,
      description: parsed.data.description
    }
  });

  return NextResponse.json({ id: issue.id });
}
