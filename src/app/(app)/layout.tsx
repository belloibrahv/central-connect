import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[260px_1fr]">
      <aside className="border-r border-ink/10 bg-white/70 px-6 py-8">
        <Link href="/dashboard" className="font-display text-xl font-semibold">
          CentralConnect
        </Link>
        <nav className="mt-10 space-y-3 text-sm">
          <Link className="block hover:text-clay" href="/dashboard">
            Dashboard
          </Link>
          <Link className="block hover:text-clay" href="/book">
            Book a bed
          </Link>
          <Link className="block hover:text-clay" href="/issues">
            Report an issue
          </Link>
          <Link className="block hover:text-clay" href="/admin/reports">
            Reports
          </Link>
        </nav>
      </aside>
      <div className="px-6 py-10 md:px-10">
        {children}
      </div>
    </div>
  );
}
