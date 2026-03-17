import Link from "next/link";

const hostels = [
  "Cocoa Grove",
  "Odua Court",
  "Lagoon View",
  "Hilltop House",
  "Sunrise Lodge",
  "Maple Court",
  "Unity Crest"
];

export default function HomePage() {
  return (
    <div className="gradient-orb">
      <section className="px-6 pb-16 pt-8 md:px-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-ink/60">Student Accommond8</p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight">
              Book your hostel bed in minutes. Simple, fast, and clear.
            </h1>
            <p className="text-lg text-ink/70">
              CentralConnect keeps all 7 hostels in one place, with live availability,
              secure payments, and issue reporting that works.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register" className="button-primary">
                Start booking
              </Link>
              <Link href="/login" className="button-secondary">
                I already have an account
              </Link>
            </div>
          </div>
          <div className="card space-y-4">
            <h2 className="section-title">Why students like it</h2>
            <ul className="space-y-3 text-sm text-ink/70">
              <li>Live bed availability with no double booking</li>
              <li>One flow from booking to payment</li>
              <li>Clear issue tracking and fast updates</li>
              <li>Works well on mobile during heavy traffic</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 md:px-12">
        <h2 className="section-title">Hostels on the platform</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {hostels.map((hostel) => (
            <div key={hostel} className="card">
              <p className="font-display text-lg">{hostel}</p>
              <p className="text-sm text-ink/60">Book beds by room type and term.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20 md:px-12">
        <div className="card flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="section-title">Ready to book?</h2>
            <p className="text-sm text-ink/70">Create an account and lock your bed with a 10-minute hold.</p>
          </div>
          <Link href="/register" className="button-primary">
            Get started
          </Link>
        </div>
      </section>
    </div>
  );
}
