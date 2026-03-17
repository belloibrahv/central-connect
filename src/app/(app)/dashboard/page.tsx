import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return null;
  }

  const user = await prisma.user.findFirst({ where: { email } });

  const bookings = user
    ? await prisma.booking.findMany({
        where: { userId: user.id, isActive: true },
        include: { bed: { include: { room: { include: { hostel: true } } } }, term: true }
      })
    : [];

  const issues = user
    ? await prisma.issue.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 5
      })
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Welcome back</h1>
        <p className="text-sm text-ink/70">Track your booking and issues in one place.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="font-display text-lg">Active booking</h2>
          {bookings.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">No booking yet. Go to “Book a bed”.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="mt-4 text-sm">
                <p className="font-medium">{booking.bed.room.hostel.name}</p>
                <p className="text-ink/60">
                  Bed {booking.bed.label}, status {booking.status}
                </p>
                <p className="text-ink/60">
                  Term: {booking.term.startDate.toDateString()} - {booking.term.endDate.toDateString()}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="card">
          <h2 className="font-display text-lg">Recent issues</h2>
          {issues.length === 0 ? (
            <p className="mt-3 text-sm text-ink/60">No issues reported yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {issues.map((issue) => (
                <li key={issue.id} className="flex items-center justify-between">
                  <span>{issue.category}</span>
                  <span className="text-ink/60">{issue.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
