import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { generateOtpCode, getOtpExpiry } from "@/lib/otp";
import { sendEmail } from "@/lib/notifications/email";
import { sendSms } from "@/lib/notifications/sms";

const schema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(6)
});

const PENDING_COOKIE = "otp_pending";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { identifier, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { phone: identifier }]
      }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const passwordOk = await verifyPassword(password, user.passwordHash);
    if (!passwordOk) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const code = generateOtpCode();
    const expiresAt = getOtpExpiry();

    const pendingOtp = await prisma.pendingOtp.create({
      data: {
        userId: user.id,
        code,
        expiresAt
      }
    });

    const tasks: Promise<unknown>[] = [];

    if (user.email) {
      tasks.push(
        sendEmail({
          to: user.email,
          subject: "Your CentralConnect login code",
          text: `Your one-time code is ${code}. It expires in 10 minutes.`
        }).catch(console.error)
      );
    }

    if (user.phone) {
      tasks.push(
        sendSms({
          to: user.phone,
          message: `CentralConnect code: ${code}. It expires in 10 minutes.`
        }).catch(console.error)
      );
    }

    await Promise.all(tasks);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(PENDING_COOKIE, pendingOtp.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 10,
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("OTP request error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
