"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0B1623] via-[#0E1B2A] to-[#090E14] text-white">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-24">
        <h1 className="text-4xl md:text-5xl font-bold leading-tight max-w-3xl">
          Get paid by your supporters.
          <br />
          Straight to your bank.
        </h1>

        <p className="mt-6 text-lg text-white/70 max-w-2xl">
          EverPay helps creators receive gifts and tips securely, with fast
          payouts and no confusing wallets.
        </p>

        <p className="mt-4 text-sm text-white/50">
          UK-based · Secure · Powered by Stripe
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold
                       bg-gradient-to-r from-cyan-400 to-emerald-400 text-black
                       hover:opacity-90 transition"
          >
            Create your EverPay page
          </Link>

          <Link
            href="#how-it-works"
            className="inline-flex items-center justify-center rounded-xl px-6 py-3 font-semibold
                       border border-white/15 text-white/80 hover:bg-white/5 transition"
          >
            Learn how it works
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="max-w-6xl mx-auto px-6 pb-24"
      >
        <h2 className="text-2xl font-semibold mb-10">
          How EverPay works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <h3 className="font-semibold mb-2">1. Create your page</h3>
            <p className="text-sm text-white/70">
              Get a personal EverPay link you can share anywhere.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <h3 className="font-semibold mb-2">2. Supporters send a gift</h3>
            <p className="text-sm text-white/70">
              Payments are made securely using trusted payment methods.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <h3 className="font-semibold mb-2">3. Money goes to you</h3>
            <p className="text-sm text-white/70">
              Fast payouts, no wallets, no balances to manage.
            </p>
          </div>
        </div>

        <p className="mt-6 text-xs text-white/50">
          EverPay never stores your money.
        </p>
      </section>

      {/* TRUST */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold mb-8">
          Built on trust
        </h2>

        <ul className="space-y-4 text-white/80 text-sm">
          <li>🇬🇧 UK-based platform</li>
          <li>🔒 Payments protected by Stripe</li>
          <li>🏦 No funds held by EverPay</li>
          <li>🧾 Transparent fees</li>
          <li>📧 Real support from real people</li>
        </ul>
      </section>

      {/* WHO IT’S FOR */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold mb-6">
          Built for creators
        </h2>

        <p className="text-white/70 max-w-2xl">
          Streamers, content creators, influencers, and anyone who receives
          online support. If people support you online, EverPay works for you.
        </p>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="rounded-3xl border border-white/10 bg-black/40 p-10 text-center">
          <h2 className="text-3xl font-semibold">
            Start with EverPay today
          </h2>

          <p className="mt-4 text-white/70">
            Set up your page in minutes. No commitment.
          </p>

          <Link
            href="/signup"
            className="inline-flex mt-8 items-center justify-center rounded-xl px-8 py-4 font-semibold
                       bg-gradient-to-r from-cyan-400 to-emerald-400 text-black
                       hover:opacity-90 transition"
          >
            Create your EverPay page
          </Link>

          <p className="mt-4 text-xs text-white/50">
            No monthly fees · No setup costs
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/50">
        © {new Date().getFullYear()} EverPay · Powered by Stripe
      </footer>
    </main>
  );
}

