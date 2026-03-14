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

  useEffect(() => {
    if (!username) return;

    const safeUsername: string = username;

    async function loadStatus() {
      try {
        const res = await fetch(
          `${API_URL}/api/stripe/connect/status?username=${encodeURIComponent(
            safeUsername
          )}`
        );

        const data = await res.json();

        setStatus({
          connected: data?.connected,
          payoutsEnabled: data?.payoutsEnabled,
        });
      } catch (e) {
        console.error("Failed to load Stripe status", e);
      } finally {
        setLoading(false);
      }
    }

    loadStatus();
  }, [username]);

  if (loading || !status) return null;

  if (status.connected && status.payoutsEnabled) {
    return null;
  }

  return (
    <div className="mb-6 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-amber-200">
            Connect Stripe to receive gifts
          </p>

          <p className="text-sm text-amber-100/80">
            Your page is live, but payouts are not enabled yet. Go to Settings
            and connect Stripe to start receiving gifts.
          </p>
        </div>

        <a
          href="/creator/settings"
          className="px-4 py-2 rounded-xl bg-amber-300 text-black font-semibold text-sm whitespace-nowrap"
        >
          Go to Settings
        </a>
      </div>
    </div>
  );
}
