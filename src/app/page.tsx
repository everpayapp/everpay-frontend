"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen text-white">
      {/* HERO */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20">
        <div className="relative rounded-3xl bg-white/5 border border-white/10 p-12 backdrop-blur-xl">
          <p className="text-xs tracking-widest text-white/50 mb-3">
            EVERPAY · CREATOR FIRST GIFTING
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Get paid instantly.
            <br />
            <span className="text-white/70">
              No wallets. No balances. No delays.
            </span>
          </h1>

          <p className="text-white/70 max-w-2xl mb-8">
            EverPay lets supporters send you a gift that goes straight to your
            bank. We never store your money and we never hold your funds.
          </p>

          {/* Trust pills */}
          <div className="flex flex-wrap gap-3 mb-8">
            <span className="px-3 py-1 rounded-full bg-white/10 text-sm">
              🇬🇧 UK based
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-sm">
              🔒 Payments protected by Stripe
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 text-sm">
              💸 Funds go directly to you
            </span>
          </div>

          {/* CTA */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl font-semibold bg-cyan-400 text-black hover:bg-cyan-300 transition"
            >
              Create your EverPay page
            </Link>

            <Link
              href="#how"
              className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition"
            >
              Learn how it works
            </Link>
          </div>

          <p className="mt-6 text-sm text-white/40">
            EverPay sends payments directly to you via Stripe. We never touch or
            store your funds.
          </p>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-semibold mb-10">
          How EverPay works
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <p className="text-sm text-white/50 mb-2">STEP 1</p>
            <h3 className="font-semibold mb-2">Create your page</h3>
            <p className="text-white/70 text-sm">
              Add your name, avatar, and links. Your EverPay page becomes your
              single shareable link.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <p className="text-sm text-white/50 mb-2">STEP 2</p>
            <h3 className="font-semibold mb-2">Share it anywhere</h3>
            <p className="text-white/70 text-sm">
              Put it in TikTok, Instagram, YouTube, Twitch, or anywhere your
              supporters already are.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <p className="text-sm text-white/50 mb-2">STEP 3</p>
            <h3 className="font-semibold mb-2">Supporters send a gift</h3>
            <p className="text-white/70 text-sm">
              They choose an amount, add a message, and checkout securely.
              Funds go straight to your bank.
            </p>
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-semibold mb-4">
          Built on trust
        </h2>

        <p className="text-white/60 mb-10 max-w-2xl">
          The homepage must make people feel safe. So we say it clearly and we
          mean it.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-semibold mb-2">Payments protected by Stripe</h3>
            <p className="text-white/70 text-sm">
              Checkout is handled by Stripe, a globally trusted payments
              provider used by major brands.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-semibold mb-2">No funds held by EverPay</h3>
            <p className="text-white/70 text-sm">
              Unlike platforms that hold your balance, EverPay routes payments
              directly to you.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-semibold mb-2">Simple for supporters</h3>
            <p className="text-white/70 text-sm">
              A clear page, a clear amount, and a familiar checkout.
              Less confusion means more gifts.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-semibold mb-2">UK first, global next</h3>
            <p className="text-white/70 text-sm">
              Launching UK first. Instant style bank payments are the long term
              goal, with Stripe as the secure base.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-semibold mb-10">
          Before you get started
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-semibold mb-2">Do you store my money?</h3>
            <p className="text-white/70 text-sm">
              No. EverPay does not hold balances or wallet funds. Payments are
              processed by Stripe and go directly to you.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-semibold mb-2">Is it safe for supporters?</h3>
            <p className="text-white/70 text-sm">
              Yes. Supporters use a familiar Stripe checkout with a clear
              amount, optional message, and secure payment.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-semibold mb-2">What do I share?</h3>
            <p className="text-white/70 text-sm">
              Your EverPay page link. Put it in your bio, pinned posts, or
              livestream overlays.
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="font-semibold mb-2">How fast do I get paid?</h3>
            <p className="text-white/70 text-sm">
              Payout speed depends on Stripe’s payout schedule, but the system
              is designed for fast, direct payouts with no wallet delays.
            </p>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-28">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-12 text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Start with EverPay today
          </h2>
          <p className="text-white/60 mb-8">
            Set up your page in minutes, then share your link everywhere.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl font-semibold bg-cyan-400 text-black hover:bg-cyan-300 transition"
            >
              Create your EverPay page
            </Link>

            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition"
            >
              Log in
            </Link>
          </div>

          <p className="mt-4 text-xs text-white/40">
            No monthly fees. No setup costs.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center text-xs text-white/40 pb-8">
        © 2026 EverPay · Powered by Stripe
      </footer>
    </main>
  );
}

