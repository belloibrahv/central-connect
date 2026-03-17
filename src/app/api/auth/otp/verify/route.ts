import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const schema = z.object({
  otp: z.string().min(6)
});

export async function GET(request: Request) {
  try {
    const cookieStore = request.headers.get("cookie");
    const pendingId = cookieStore?.match(/otp_pending=([^;]+)/)?.[1];

    if (!pendingId) {
      return NextResponse.json({ error: "No pending verification" }, { status: 401 });
    }

    const pending = await prisma.pendingOtp.findUnique({
      where: { id: pendingId },
      include: { user: { select: { email: true, phone: true } } }
    });

    if (!pending || pending.expiresAt < new Date()) {
      return NextResponse.json({ error: "Verification expired" }, { status: 401 });
    }

    const maskEmail = pending.user.email 
      ? pending.user.email.replace(/(.{2})(.*)(@.*)/, "$1***$3") 
      : null;
    const maskPhone = pending.user.phone 
      ? pending.user.phone.replace(/(.{3})(.*)(.{4})/, "$1***$3") 
      : null;

    return NextResponse.json({ 
      contact: maskEmail || maskPhone || "your account" 
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = request.headers.get("cookie");
    const pendingId = cookieStore?.match(/otp_pending=([^;]+)/)?.[1];

    if (!pendingId) {
      return NextResponse.json({ error: "No pending verification" }, { status: 401 });
    }

    const pending = await prisma.pendingOtp.findUnique({
      where: { id: pendingId }
    });

    if (!pending || pending.expiresAt < new Date()) {
      return NextResponse.json({ error: "Verification expired" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    if (pending.code !== parsed.data.otp) {
      return NextResponse.json({ error: "Invalid code" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: pending.userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    await prisma.pendingOtp.delete({ where: { id: pendingId } });

    return NextResponse.json({ 
      ok: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
