import Link from "next/link";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="px-6 py-6 md:px-12">
        <nav className="flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-semibold">
            CentralConnect
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="button-secondary">
              Sign in
            </Link>
            <Link href="/register" className="button-primary">
              Create account
            </Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
