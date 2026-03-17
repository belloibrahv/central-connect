import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const hostels = await prisma.hostel.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" }
    });
    return NextResponse.json(hostels);
  } catch (error) {
    console.error("Hostels API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
