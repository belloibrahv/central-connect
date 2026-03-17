import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const role = session?.user?.role;

    if (!role || !["HOSTEL_ADMIN", "SUPER_ADMIN", "FINANCE"].includes(role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const hostelId = searchParams.get("hostelId") || undefined;
    const status = searchParams.get("status") || undefined;
    const startDate = searchParams.get("startDate") ? new Date(searchParams.get("startDate")!) : undefined;
    const endDate = searchParams.get("endDate") ? new Date(searchParams.get("endDate")!) : undefined;

    const where: Record<string, unknown> = {};
    const paymentWhere: Record<string, unknown> = {};
    const issueWhere: Record<string, unknown> = {};

    if (hostelId) {
      where.bed = { hostelId };
      paymentWhere.booking = { bed: { hostelId } };
      issueWhere.hostelId = hostelId;
    }

    if (status === "pending") {
      where.status = "PENDING";
      paymentWhere.status = "INITIATED";
    } else if (status === "paid") {
      where.status = "CONFIRMED";
      paymentWhere.status = "SUCCESS";
    } else if (status === "failed") {
      paymentWhere.status = "FAILED";
    }

    if (startDate) {
      where.createdAt = { gte: startDate };
      paymentWhere.createdAt = { gte: startDate };
      issueWhere.createdAt = { gte: startDate };
    }

    if (endDate) {
      where.createdAt = { ...(where.createdAt as object), lte: endDate };
      paymentWhere.createdAt = { ...(paymentWhere.createdAt as object), lte: endDate };
      issueWhere.createdAt = { ...(issueWhere.createdAt as object), lte: endDate };
    }

    const [
      totalResidents,
      confirmedBookings,
      pendingBookings,
      openIssues,
      resolvedIssues,
      paymentSummary,
      paymentsByStatus,
      occupancyData
    ] = await Promise.all([
      prisma.user.count({ where: { role: "RESIDENT" } }),
      prisma.booking.count({ where: { ...where, status: "CONFIRMED" } }),
      prisma.booking.count({ where: { ...where, status: "PENDING" } }),
      prisma.issue.count({ where: { ...issueWhere, status: { in: ["NEW", "IN_PROGRESS"] } } }),
      prisma.issue.count({ where: { ...issueWhere, status: "RESOLVED" } }),
      prisma.payment.aggregate({
        where: { status: "SUCCESS", ...paymentWhere },
        _sum: { amount: true },
        _count: true
      }),
      prisma.payment.groupBy({
        by: ["status"],
        where: paymentWhere,
        _count: true,
        _sum: { amount: true }
      }),
      prisma.hostel.findMany({
        include: {
          beds: {
            include: {
              bookings: {
                where: { status: "CONFIRMED", isActive: true },
                select: { id: true }
              }
            }
          }
        }
      })
    ]);

    const occupancyRaw = occupancyData as {
      name: string;
      beds: { bookings: { id: string }[] }[];
    }[];

    const totalBeds = occupancyRaw.reduce((sum, h) => sum + h.beds.length, 0);
    const totalOccupied = occupancyRaw.reduce((sum, h) => sum + h.beds.reduce((s, b) => s + b.bookings.length, 0), 0);
    const occupancyRate = totalBeds > 0 ? Math.round((totalOccupied / totalBeds) * 100) : 0;

    const occupancyByHostel = occupancyRaw.map((h) => {
      const bookings = h.beds.reduce((s, b) => s + b.bookings.length, 0);
      return {
        name: h.name,
        beds: h.beds.length,
        bookings,
        rate: h.beds.length > 0 ? Math.round((bookings / h.beds.length) * 100) : 0
      };
    });

    return NextResponse.json({
      totalResidents,
      confirmedBookings,
      pendingBookings,
      occupancyRate,
      totalRevenue: paymentSummary._sum.amount ?? 0,
      transactionCount: paymentSummary._count,
      paymentsByStatus: (paymentsByStatus as { status: string; _sum: { amount: number | null }; _count: number }[]).map((p) => ({
        status: p.status,
        amount: p._sum.amount ?? 0,
        count: p._count
      })),
      occupancyByHostel,
      openIssues,
      resolvedIssues
    });
  } catch (error) {
    console.error("Reports API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
