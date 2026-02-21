"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [prizePoolGbp, setPrizePoolGbp] = useState<number | null>(null);
  const [loadingPrizePool, setLoadingPrizePool] = useState(true);

  useEffect(() => {
    if (!apiUrl) return;

    async function loadPrizePool() {
      try {
        const res = await fetch(`${apiUrl}/api/prize-pool`);
        const data = await res.json().catch(() => ({} as any));
        const gbp = Number(data?.prize_pool_gbp);
        setPrizePoolGbp(Number.isFinite(gbp) ? gbp : null);
      } catch {
        setPrizePoolGbp(null);
      } finally {
        setLoadingPrizePool(false);
      }
    }

    loadPrizePool();
    const interval = setInterval(loadPrizePool, 15000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  return (
    <main className="min-h-screen text-white">
      {/* Top bar (homepage only) */}
      <header className="w-full px-6 pt-6">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="text-white font-extrabold tracking-tight text-3xl md:text-4xl">
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
      <section className="px-6 pt-10 pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 md:p-12 shadow-2xl">
            <div className="text-xs tracking-widest text-white/60 font-semibold">CREATOR FIRST GIFTING</div>

            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight">
              Get paid fast.
              <br />
              <span className="text-white/70">No wallets. No balances. No delays.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-white/70 leading-relaxed">
              EverPay lets supporters send you a gift that routes directly to your bank. We do not store balances and we
              never hold your funds.
            </p>

            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-black/30 border border-white/10 text-white/70">UK based</span>
              <span className="px-3 py-1 rounded-full bg-black/30 border border-white/10 text-white/70">
                Payments protected by Stripe
              </span>
              <span className="px-3 py-1 rounded-full bg-black/30 border border-white/10 text-white/70">
                Funds go directly to you
              </span>
            </div>

            {/* ✅ Live prize pool pill */}
            <div className="mt-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1 text-xs text-white/80">
                <span>🏆 Monthly Prize Pool (live) grows with every gift </span>
                <span className="opacity-60">•</span>
                <span className="font-semibold text-white">
                  {loadingPrizePool ? "£…" : prizePoolGbp !== null ? `£${prizePoolGbp.toFixed(2)}` : "£0.00"}
                </span>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2EE4A5] to-[#41E8A5] text-black hover:opacity-90 transition font-semibold"
              >
                Create your EverPay page
              </Link>

              <Link
                href="/example"
                className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition font-semibold"
              >
                View example
              </Link>
            </div>

            <p className="mt-5 text-xs text-white/50">Payments are processed by Stripe and routed directly to creators.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="px-6 py-12">
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
                Add your name, profile picture, and links. Your EverPay page becomes your single shareable link.
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
                They choose an amount, add a message, and checkout securely. Funds route straight to your bank.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold">Built on trust</h2>
          <p className="mt-2 text-white/60 max-w-2xl">
            Clear, simple, and designed to make supporters feel safe.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">Payments protected by Stripe</div>
              <p className="mt-2 text-white/60 text-sm">
                Checkout is handled by Stripe, a globally trusted payments provider.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">No funds held by EverPay</div>
              <p className="mt-2 text-white/60 text-sm">
                EverPay never holds balances. Payments route directly to creators.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">Simple for supporters</div>
              <p className="mt-2 text-white/60 text-sm">
                A clear page, a clear amount, and a familiar checkout.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="font-semibold">UK first, global next</div>
              <p className="mt-2 text-white/60 text-sm">Launching UK first with Stripe as the secure base.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 pb-16 pt-6">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10 text-center">
            <h3 className="text-2xl md:text-3xl font-bold">Start with EverPay today</h3>
            <p className="mt-2 text-white/60">Set up your page in minutes, then share your link everywhere.</p>

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
