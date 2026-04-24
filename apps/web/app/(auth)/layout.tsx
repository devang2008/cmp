// ============================================================
// AUTH LAYOUT — Centered auth container with SHIELD branding
// ============================================================
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen gradient-shield flex flex-col">
      {/* Mini Nav */}
      <nav className="px-6 py-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--primary-hover)] flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-[var(--foreground)]">SHIELD</span>
        </Link>
      </nav>

      {/* Centered Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </main>

      {/* Mini Footer */}
      <footer className="px-6 py-4 text-center text-xs text-[var(--muted-foreground)]">
        <p>Your identity is protected by 256-bit encryption · Zero-knowledge architecture</p>
      </footer>
    </div>
  );
}
