"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="min-h-screen text-white"
      style={{
        background:
          "radial-gradient(circle at top, rgba(0,61,245,0.18), transparent 32%), linear-gradient(to bottom right, #050816, #071227 45%, #0a1630 100%)",
      }}
    >
      {/* Top bar (homepage only) */}
      <header className="w-full px-4 sm:px-6 pt-4 sm:pt-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-white font-extrabold tracking-tight text-2xl sm:text-3xl md:text-4xl"
          >
            EverPay
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-3 sm:px-4 py-2 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] transition text-xs sm:text-sm font-semibold"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#2EE4A5] to-[#41E8A5] text-black hover:opacity-90 transition text-xs sm:text-sm font-semibold shadow-[0_10px_30px_rgba(46,228,165,0.2)]"
            >
              Create your page
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="px-3 sm:px-6 pt-8 sm:pt-10 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-5 sm:p-8 md:p-12 shadow-2xl">
            <div className="text-[11px] sm:text-xs tracking-widest text-white/60 font-semibold">
              CREATOR GIFT PAGES
            </div>

            <h1 className="mt-4 text-[28px] leading-[1.02] sm:text-5xl md:text-6xl font-extrabold">
              <span className="block">Get gifted online.</span>

              <span className="block text-white/70 sm:hidden">No wallets</span>
              <span className="block text-white/70 sm:hidden">No balances</span>
              <span className="block text-white/70 sm:hidden">No delays</span>

              <span className="hidden sm:block text-white/70">
                No wallets. No balances. No delays.
              </span>
            </h1>

            <p className="mt-4 text-white/90 font-semibold text-sm sm:text-base">
              Creators keep 100% of gifts. Only Stripe processing applies.
            </p>

            <p className="mt-3 max-w-2xl text-white/80 leading-relaxed text-sm sm:text-base">
              EverPay gives creators a clean page to receive gifts online. People
              can choose an amount, leave a message, and pay securely with no card
              details needed.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90">
                Pay by bank
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90">
                No card details needed
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90">
                Secure checkout by Stripe
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90">
                Built for creators
              </span>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2EE4A5] to-[#41E8A5] text-black hover:opacity-90 transition font-semibold text-center shadow-[0_10px_30px_rgba(46,228,165,0.2)]"
              >
                Create your EverPay page
              </Link>

              <Link
                href="/example"
                className="px-6 py-3 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] transition font-semibold text-center"
              >
                View EverPay demo
              </Link>
            </div>

            <p className="mt-5 text-xs text-white/55">
              Share one clean link across your social platforms and give people a
              faster, safer way to send you a gift.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold">How EverPay works</h2>
          <p className="mt-2 text-white/60 max-w-2xl">
            A simple gifting flow designed to feel clear, safe, and easy to use.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 transition hover:-translate-y-[2px] hover:bg-white/[0.08]">
              <div className="text-xs text-white/50 font-semibold">STEP 1</div>
              <div className="mt-2 font-semibold text-lg">Create your page</div>
              <p className="mt-2 text-white/65 text-sm">
                Add your name, profile picture, and links. Your EverPay page
                becomes your single shareable gift link.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 transition hover:-translate-y-[2px] hover:bg-white/[0.08]">
              <div className="text-xs text-white/50 font-semibold">STEP 2</div>
              <div className="mt-2 font-semibold text-lg">Share it anywhere</div>
              <p className="mt-2 text-white/65 text-sm">
                Put it across your social platforms, livestreams, bio links, or
                anywhere your audience already follows you.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 transition hover:-translate-y-[2px] hover:bg-white/[0.08]">
              <div className="text-xs text-white/50 font-semibold">STEP 3</div>
              <div className="mt-2 font-semibold text-lg">Receive gifts</div>
              <p className="mt-2 text-white/65 text-sm">
                People choose an amount, add a message, and check out securely
                through a clean pay-by-bank flow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold">Built on trust</h2>
          <p className="mt-2 text-white/60 max-w-2xl">
            Clear, simple, and designed to make gifting feel safer and more
            premium.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 transition hover:-translate-y-[2px] hover:bg-white/[0.08]">
              <div className="font-semibold text-white">Secure checkout by Stripe</div>
              <p className="mt-2 text-white/65 text-sm">
                Checkout is powered by Stripe, helping EverPay feel familiar and
                secure from the moment someone pays.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 transition hover:-translate-y-[2px] hover:bg-white/[0.08]">
              <div className="font-semibold text-white">No card details needed</div>
              <p className="mt-2 text-white/65 text-sm">
                Pay by bank keeps the gifting flow simple and can feel safer for
                people sending money online.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 transition hover:-translate-y-[2px] hover:bg-white/[0.08]">
              <div className="font-semibold text-white">Cleaner than a payment link</div>
              <p className="mt-2 text-white/65 text-sm">
                EverPay is built to give creators a cleaner, more premium gift
                page instead of a basic payment link alone.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 transition hover:-translate-y-[2px] hover:bg-white/[0.08]">
              <div className="font-semibold text-white">Simple fee structure</div>
              <p className="mt-2 text-white/65 text-sm">
                No confusing wallets, stored balances, or cluttered checkout
                journey just a simple gift experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 sm:px-6 pb-16 pt-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-xl p-8 sm:p-10 text-center">
            <h3 className="text-2xl md:text-3xl font-bold">
              Start receiving gifts today
            </h3>
            <p className="mt-2 text-white/65">
              Set up your page in minutes, then share your link anywhere.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2EE4A5] to-[#41E8A5] text-black hover:opacity-90 transition font-semibold shadow-[0_10px_30px_rgba(46,228,165,0.2)]"
              >
                Create your EverPay page
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 rounded-2xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] transition font-semibold"
              >
                Log in
              </Link>
            </div>

            <p className="mt-4 text-xs text-white/50">
              No monthly fees. No setup costs.
            </p>
          </div>

          <footer className="mt-10 text-center text-xs text-white/40">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span>© {new Date().getFullYear()} EverPay. Powered by Stripe.</span>
              <span className="opacity-40">•</span>
              <Link href="/terms" className="hover:text-white transition">
                Terms
              </Link>
              <span className="opacity-40">•</span>
              <Link href="/privacy" className="hover:text-white transition">
                Privacy
              </Link>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}
