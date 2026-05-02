"use client";

import { Suspense, useEffect, useMemo } from "react";
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

  useEffect(() => {
    const ua = navigator.userAgent || "";

    const isTikTok =
      /tiktok/i.test(ua) ||
      /musical_ly/i.test(ua) ||
      /bytedance/i.test(ua);

    const isRealBrowser =
      /safari/i.test(ua) ||
      /chrome/i.test(ua) ||
      /crios/i.test(ua) ||
      /fxios/i.test(ua);

    if (isRealBrowser && !isTikTok) {
      router.replace(destination);
    }
  }, [router, destination]);

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
            Open this in your browser
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/70">
            TikTok may block payments inside the app. Open EverPay in your
            browser to send your gift safely.
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
              You’ll be taken straight to the gift page.
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

        <p className="mt-4 text-center text-xs leading-5 text-white/45">
          After opening in your browser, EverPay will continue automatically.
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
