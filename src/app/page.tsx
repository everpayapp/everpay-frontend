"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen text-white bg-gradient-to-b from-[#0e1b2b] to-[#061018]">
      {/* Top bar (homepage only) */}
      <header className="w-full px-6 pt-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          {/* Brand */}
          <Link
            href="/"
            className="text-white font-bold tracking-tight text-3xl md:text-4xl"
          >
            EverPay
          </Link>

          {/* Actions */}
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
      </header>

      {/* Hero */}
      <section className="px-6 pt-8 pb-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 md:p-12 shadow-2xl">
            <div className="text-xs tracking-widest text-white/60 font-semibold uppercase">
              Creator-first gifting
            </div>

            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight">
              Get paid instantly.
              <br />
              <span className="text-white/70">
                No wallets. No balances. No delays.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-white/70 leading-relaxed">
              EverPay lets supporters send you a gift that routes directly to you.
              We don&apos;t store balances and we don&apos;t hold your funds.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-black/30 border border-white/10 text-white/70">
                UK based
              </span>
              <span className="px-3 py-1 rounded-full bg-black/30 border border-white/10 text-white/70">
                Payments protected by Stripe
              </span>
              <span className="px-3 py-1 rounded-full bg-black/30 border border-white/10 text-white/70">
                Funds route directly to you
              </span>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#2EE4A5] to-[#41E8A5] text-black hover:opacity-90 transition font-semibold"
              >
                Create your EverPay page
              </Link>

              <a
                href="#how"
                className="px-5 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-semibold"
              >
                Learn how it works
              </a>
            </div>

            <p className="mt-5 text-xs text-white/50">
              EverPay routes payments via Stripe. EverPay does not store or hold your funds.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold">How EverPay works</h2>
          <p className="mt-2 text-white/60 max-w-2xl">
            A simple flow supporters understand instantly. Built to feel safe and familiar.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-xs text-white/50 font-semibold">STEP 1</div>
              <div className="mt-2 font-semibold text-lg">Create your page</div>
              <p className="mt-2 text-white/60 text-sm">
                Add your name, avatar, and links. Your EverPay page becomes your single shareable link.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-xs text-white/50 font-semibold">STEP 2</div>
              <div className="mt-2 font-semibold text-lg">Share it anywhere</div>
              <p className="mt-2 text-white/60 text-sm">
                Put it in TikTok, Instagram, YouTube, Twitch, or anywhere your supporters already are.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="text-xs text-white/50 font-semibold">STEP 3</div>
              <div className="mt-2 font-semibold text-lg">Supporters send a gift</div>
              <p className="mt-2 text-white/60 text-sm">
                They choose an amount, add a message, and checkout securely. Funds route directly to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold">Built on trust</h2>
          <p className="mt-2 text-white/60 max-w-2xl">
            Clear, simple, and designed to make supporters feel safe.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">Payments protected by Stripe</div>
              <p className="mt-2 text-white/60 text-sm">
                Checkout is handled by Stripe, a globally trusted payments provider used by major brands.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">No funds held by EverPay</div>
              <p className="mt-2 text-white/60 text-sm">
                Unlike platforms that hold your balance, EverPay routes payments directly to you.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">Simple for supporters</div>
              <p className="mt-2 text-white/60 text-sm">
                A clean page, a clear amount, and a familiar checkout. Less confusion means more gifts.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">UK first, global next</div>
              <p className="mt-2 text-white/60 text-sm">
                Launching UK first. Bank-to-bank instant payments are the long-term goal, with Stripe as the secure base.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold">Before you get started</h2>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">Do you store my money?</div>
              <p className="mt-2 text-white/60 text-sm">
                No. EverPay does not hold balances or wallet funds. Payments are processed by Stripe and route directly to you.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">Is it safe for supporters?</div>
              <p className="mt-2 text-white/60 text-sm">
                Yes. Supporters use a familiar Stripe checkout with a clear amount, optional message, and secure payment.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">What do I share?</div>
              <p className="mt-2 text-white/60 text-sm">
                Your EverPay page link. Put it in your bio, pinned posts, or livestream overlays.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">How fast do I get paid?</div>
              <p className="mt-2 text-white/60 text-sm">
                Payout speed depends on Stripe&apos;s payout schedule, but the system is designed for fast, direct payouts with no wallet delays.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-16 pt-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center">
            <h3 className="text-2xl md:text-3xl font-bold">Start with EverPay today</h3>
            <p className="mt-2 text-white/60">
              Set up your page in minutes, then share your link everywhere.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2EE4A5] to-[#41E8A5] text-black hover:opacity-90 transition font-semibold"
              >
                Create your EverPay page
              </Link>

              <Link
                href="/login"
                className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-semibold"
              >
                Log in
              </Link>
            </div>

            <p className="mt-4 text-xs text-white/50">No monthly fees. No setup costs.</p>
          </div>

          <footer className="mt-10 text-center text-xs text-white/40">
            © {new Date().getFullYear()} EverPay. Powered by Stripe.
          </footer>
        </div>
      </section>
    </main>
  );
}

