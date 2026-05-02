"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OpenInBrowserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const destination = useMemo(() => {
    const to = searchParams.get("to");

    if (!to || !to.startsWith("/") || to.startsWith("//")) {
      return "/";
    }

    return to;
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[#0B0D12] text-white px-4 py-6 flex items-center justify-center">
      <section className="w-full max-w-md rounded-[28px] border-2 border-white/20 bg-white/[0.06] p-5 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10 text-2xl">
            🎁
          </div>

          <p className="mb-2 text-sm font-semibold text-emerald-300">
            One quick step
          </p>

          <h1 className="text-3xl font-bold leading-tight">
            Open this in your browser to send a gift
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/70">
            TikTok may block payments inside the app. To continue safely, open
            this page in your browser first.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="rounded-2xl border border-white/15 bg-black/25 p-4">
            <p className="text-sm font-semibold">1. Tap the 3 dots</p>
            <p className="mt-1 text-sm text-white/60">
              They are usually in the top right corner.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-black/25 p-4">
            <p className="text-sm font-semibold">2. Tap “Open in browser”</p>
            <p className="mt-1 text-sm text-white/60">
              This opens EverPay outside TikTok.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-black/25 p-4">
            <p className="text-sm font-semibold">3. Come back and continue</p>
            <p className="mt-1 text-sm text-white/60">
              Then tap the button below to send your gift securely.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-center">
          <p className="text-sm font-semibold text-emerald-200">
            Secure payments powered by Stripe
          </p>
          <p className="mt-1 text-xs text-white/60">
            Pay safely by bank — no card details needed.
          </p>
        </div>

        <button
          onClick={() => router.push(destination)}
          className="mt-6 w-full rounded-2xl bg-emerald-400 px-5 py-4 text-base font-bold text-black shadow-lg transition hover:bg-emerald-300"
        >
          Continue to gift page
        </button>

        <p className="mt-4 text-center text-xs leading-5 text-white/45">
          If payment does not continue, tap the 3 dots in TikTok and choose “Open
          in browser”.
        </p>
      </section>
    </main>
  );
}

export default function OpenInBrowserPage() {
  return (
    <Suspense fallback={null}>
      <OpenInBrowserContent />
    </Suspense>
  );
}
