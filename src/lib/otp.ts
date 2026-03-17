import { addMinutes } from "date-fns";
import { env } from "@/lib/env";

export function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getOtpExpiry() {
  const ttl = Number(env.OTP_TTL_MINUTES || "10");
  return addMinutes(new Date(), ttl);
}
