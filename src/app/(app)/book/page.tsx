import { prisma } from "@/lib/prisma";

const hostelInclude = {
  roomTypes: true,
  terms: { where: { status: "OPEN" as const } }
} as const;

export default async function BookPage() {
  const hostels = await prisma.hostel.findMany({
    include: hostelInclude
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-title">Book a bed</h1>
        <p className="text-sm text-ink/70">Choose a hostel and room type. You will see live beds when they are loaded.</p>
      </div>

      <div className="grid gap-6">
        {hostels.map((hostel) => (
          <div key={hostel.id} className="card">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-display text-lg">{hostel.name}</h2>
                <p className="text-sm text-ink/60">{hostel.city}</p>
              </div>
              <span className="text-xs uppercase tracking-wide text-ink/50">
                {hostel.genderPolicy}
              </span>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {hostel.roomTypes.map((type) => (
                <div key={type.id} className="rounded-xl border border-ink/10 p-4">
                  <p className="font-medium">{type.name}</p>
                  <p className="text-sm text-ink/60">{type.capacity} bed(s)</p>
                  <p className="text-sm text-ink/70">NGN {type.basePrice.toLocaleString()}</p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-xs text-ink/50">
              Beds and rooms will appear here once hostel admin loads them.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
