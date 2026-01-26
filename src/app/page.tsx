// ~/everpay-frontend/src/app/page.tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1623] via-[#0E1B2A] to-[#090E14] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B1623]/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight">EverPay</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/70">
              UK-first · Creator gifting
            </span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 transition"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-[#2EE4FF] to-[#41E8A5] px-4 py-2 text-sm font-semibold text-[#06131E] hover:opacity-90 transition"
            >
              Create your page
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-10 shadow-[0_0_80px_rgba(0,0,0,0.55)]">
          <p className="text-xs tracking-widest text-white/60">
            EVERPAY · CREATOR-FIRST GIFTING
          </p>

          <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-[1.05]">
            Get paid instantly.
            <br />
            <span className="text-white/75">No wallets. No balances. No waiting.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-base md:text-lg text-white/70 leading-relaxed">
            EverPay lets supporters send you a gift that goes <span className="text-white font-semibold">straight to your bank</span>.
            We don’t store your money in a wallet — and we never hold your funds.
          </p>

          {/* Trust Row */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              🇬🇧 UK-based
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              🔒 Payments protected by Stripe
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              💸 Funds go directly to you
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
              ⚡ Built for creators
            </span>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#2EE4FF] to-[#41E8A5] px-6 py-3 font-semibold text-[#06131E] hover:opacity-90 transition"
            >
              Create your EverPay page
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              Learn how it works
            </Link>
            <Link
              href="/creator/lee"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-transparent px-6 py-3 font-semibold text-white/80 hover:bg-white/5 transition"
            >
              View an example →
            </Link>
          </div>

          {/* Differentiator Block */}
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/75">
              <span className="font-semibold text-white">How EverPay is different:</span>{" "}
              other platforms often hold your money in a wallet or balance. EverPay sends payments directly to you via Stripe —
              <span className="font-semibold text-white"> we never touch or store your funds.</span>
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-8">
        <h2 className="text-2xl md:text-3xl font-bold">How EverPay works</h2>
        <p className="mt-2 text-white/65 max-w-2xl">
          A simple flow your supporters understand instantly — built to feel safe and familiar.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs text-white/55">STEP 1</p>
            <h3 className="mt-2 text-lg font-semibold">Create your page</h3>
            <p className="mt-2 text-sm text-white/70">
              Add your name, avatar, and links. Your EverPay page becomes your one shareable link.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs text-white/55">STEP 2</p>
            <h3 className="mt-2 text-lg font-semibold">Share it anywhere</h3>
            <p className="mt-2 text-sm text-white/70">
              Put it in TikTok, Instagram, YouTube, Twitch — anywhere your fans already are.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-xs text-white/55">STEP 3</p>
            <h3 className="mt-2 text-lg font-semibold">Supporters send a gift</h3>
            <p className="mt-2 text-sm text-white/70">
              They choose an amount, add a message, and checkout securely. Funds go directly to you.
            </p>
          </div>
        </div>

        <p className="mt-4 text-xs text-white/45">
          EverPay never stores your money. No wallets. No balances.
        </p>
      </section>

      {/* Trust / Why */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl md:text-3xl font-bold">Built on trust</h2>
        <p className="mt-2 text-white/65 max-w-2xl">
          The homepage must make people feel safe. So we say it clearly — and we mean it.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-semibold">Payments protected by Stripe</h3>
            <p className="mt-2 text-sm text-white/70">
              Checkout is handled by Stripe — a globally trusted payments provider used by major brands.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-semibold">No funds held by EverPay</h3>
            <p className="mt-2 text-sm text-white/70">
              Unlike platforms that hold your balance, EverPay routes payments directly to you.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-semibold">Simple for supporters</h3>
            <p className="mt-2 text-sm text-white/70">
              A clean page, a clear amount, a familiar checkout. Less confusion = more gifts.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-lg font-semibold">UK-first, global next</h3>
            <p className="mt-2 text-sm text-white/70">
              Launching UK-first. Instant-style bank payments are the long-term goal — Stripe is the secure base.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="text-2xl md:text-3xl font-bold">Questions people ask</h2>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-base font-semibold">Do you store my money?</h3>
            <p className="mt-2 text-sm text-white/70">
              No. EverPay doesn’t hold balances or wallet funds. Payments are processed by Stripe and go directly to you.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-base font-semibold">Is it safe for supporters?</h3>
            <p className="mt-2 text-sm text-white/70">
              Yes — supporters use a familiar Stripe checkout flow. Clear amount, optional message, secure payment.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-base font-semibold">What do I share?</h3>
            <p className="mt-2 text-sm text-white/70">
              Your EverPay page link (like a profile). Put it in your bio, pinned posts, or livestream overlays.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-base font-semibold">How fast do I get paid?</h3>
            <p className="mt-2 text-sm text-white/70">
              Payout speed depends on Stripe’s payout schedule, but the system is designed for fast, direct payouts — no wallet delays.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.03] p-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">Start with EverPay today</h2>
          <p className="mt-2 text-white/65">
            Set up your page in minutes — then share your link everywhere.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#2EE4FF] to-[#41E8A5] px-6 py-3 font-semibold text-[#06131E] hover:opacity-90 transition"
            >
              Create your EverPay page
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white hover:bg-white/10 transition"
            >
              Log in
            </Link>
          </div>

          <p className="mt-4 text-xs text-white/45">
            No monthly fees · No setup costs
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#090E14]">
        <div className="mx-auto max-w-6xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© {new Date().getFullYear()} EverPay</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-white/80 transition">Login</Link>
            <Link href="/signup" className="hover:text-white/80 transition">Sign up</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

