import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  PAYSTACK_SECRET_KEY: z.string().min(1),
  PAYSTACK_PUBLIC_KEY: z.string().min(1),
  PAYSTACK_WEBHOOK_SECRET: z.string().min(1),
  EMAIL_FROM: z.string().min(1),
  EMAIL_PROVIDER: z.string().default("RESEND"),
  RESEND_API_KEY: z.string().optional(),
  SMTP_URL: z.string().optional(),
  SMS_PROVIDER: z.string().default("TERMII"),
  SMS_SENDER_ID: z.string().min(1),
  TERMII_API_KEY: z.string().optional(),
  TERMII_BASE_URL: z.string().optional(),
  OTP_TTL_MINUTES: z.string().default("10")
});

export const env = envSchema.parse(process.env);
