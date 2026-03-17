import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const session = await auth();
  const role = session?.user?.role;

  if (!role || !["HOSTEL_ADMIN", "SUPER_ADMIN", "FINANCE"].includes(role)) {
    return (
      <div className="card">
        <h1 className="section-title">Reports</h1>
        <p className="text-sm text-ink/70">You do not have access to reports.</p>
      </div>
    );
  }

  const [residentCount, bookingCount, openIssues, paymentSummary] = await Promise.all([
    prisma.user.count({ where: { role: "RESIDENT" } }),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.issue.count({ where: { status: { in: ["NEW", "IN_PROGRESS"] } } }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS" },
      _sum: { amount: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="section-title">Reports</h1>
        <p className="text-sm text-ink/70">Quick overview. Filters will be added next.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <p className="text-sm text-ink/60">Residents</p>
          <p className="text-2xl font-display">{residentCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink/60">Confirmed bookings</p>
          <p className="text-2xl font-display">{bookingCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-ink/60">Open issues</p>
          <p className="text-2xl font-display">{openIssues}</p>
        </div>
      </div>
      <div className="card">
        <p className="text-sm text-ink/60">Total payments</p>
        <p className="text-2xl font-display">NGN {(paymentSummary._sum.amount ?? 0).toLocaleString()}</p>
      </div>
    </div>
  );
}
