// ~/everpay-frontend/src/app/example/layout.tsx
import Link from "next/link";

export default function ExampleLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen text-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-3xl font-extrabold tracking-tight">
            EverPay
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-semibold"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2EE4A5] to-[#41E8A5] text-black hover:opacity-90 transition text-sm font-semibold"
            >
              Create your page
            </Link>
          </div>
        </div>

        {/* Demo nav tabs */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/example"
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-semibold"
          >
            Dashboard
          </Link>
          <Link
            href="/example/payments"
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-semibold"
          >
            Payments
          </Link>
          <Link
            href="/example/settings"
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-semibold"
          >
            Settings
          </Link>
          <Link
            href="/example/gift"
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-semibold"
          >
            Gift Page
          </Link>

          <div className="ml-auto text-xs text-white/50">
            Demo preview • fake data • safe mode
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}
