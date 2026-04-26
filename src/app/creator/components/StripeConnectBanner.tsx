"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type ConnectStatus = {
  connected: boolean;
  payoutsEnabled?: boolean;
};

export default function StripeConnectBanner() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username as string | undefined;

  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  async function loadStatus(safeUsername: string) {
    try {
      const res = await fetch(
        `${API_URL}/api/stripe/connect/status?username=${encodeURIComponent(
          safeUsername
        )}`
      );

      const data = await res.json().catch(() => ({} as any));

      setStatus({
        connected: !!data?.connected,
        payoutsEnabled: !!data?.payoutsEnabled,
      });
    } catch (e) {
      console.error("Failed to load Stripe status", e);
    } finally {
      setLoading(false);
      setConnecting(false);
    }
  }

  useEffect(() => {
    if (!username) return;
    loadStatus(username);
  }, [username]);

  useEffect(() => {
    if (!username) return;

    const handleReturn = () => {
      setConnecting(false);
      loadStatus(username);
    };

    window.addEventListener("focus", handleReturn);
    window.addEventListener("pageshow", handleReturn);

    return () => {
      window.removeEventListener("focus", handleReturn);
      window.removeEventListener("pageshow", handleReturn);
    };
  }, [username]);

  async function handleConnectStripe() {
    if (!username || connecting) return;

    setConnecting(true);

    try {
      const res = await fetch(`${API_URL}/api/stripe/connect/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
        }),
      });

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        throw new Error(data?.error || "Unable to start Stripe onboarding");
      }

      if (data?.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("No onboarding URL returned");
    } catch (e) {
      console.error("Stripe connect failed", e);
      alert("Unable to start Stripe onboarding right now.");
      setConnecting(false);
    }
  }

  if (loading || !status) return null;

  if (status.connected && status.payoutsEnabled) {
    return null;
  }

  return (
    <div className="mb-6 rounded-3xl border border-white/12 bg-white/[0.04] px-5 py-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] ring-1 ring-white/8 backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300">
            Action needed
          </div>

          <h3 className="mt-3 text-base sm:text-lg font-semibold text-white">
            ⚠️ You’re not live yet — connect Stripe to receive gifts
          </h3>

          <p className="mt-1 text-sm leading-relaxed text-white/70 max-w-2xl">
            People can view your page, but you can’t receive any gifts until Stripe is connected. Takes 2 minutes to go live.
          </p>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <button
            onClick={handleConnectStripe}
            disabled={connecting}
            className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(16,185,129,0.28)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {connecting ? "Connecting..." : "Connect Stripe"}
          </button>
        </div>
      </div>
    </div>
  );
}
