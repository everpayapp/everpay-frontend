"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

type Payment = {
  id: string;
  amount: number;
  gift_name?: string;
  gift_message?: string;
  anonymous?: number;
  created_at: string;
};

export default function CreatorGiftToast() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username as string | undefined;

  const [lastGiftId, setLastGiftId] = useState<string | null>(null);
  const [gift, setGift] = useState<Payment | null>(null);
  const [visible, setVisible] = useState(false);

  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!username) return;

    const safeUsername: string = username;

    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    async function checkForNewGift() {
      try {
        const res = await fetch(
          `${API_URL}/api/payments/creator/${encodeURIComponent(safeUsername)}`,
          { cache: "no-store" }
        );

        const data = await res.json().catch(() => []);

        if (!Array.isArray(data) || data.length === 0) return;

        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const latest = sorted[0];
        if (!latest?.id) return;

        if (!lastGiftId) {
          setLastGiftId(latest.id);
          return;
        }

        if (latest.id !== lastGiftId) {
          setLastGiftId(latest.id);
          setGift(latest);
          setVisible(true);

          clearHideTimer();
          hideTimerRef.current = window.setTimeout(() => {
            setVisible(false);
          }, 4500);
        }
      } catch (err) {
        console.error("Gift toast error", err);
      }
    }

    checkForNewGift();
    const interval = window.setInterval(checkForNewGift, 8000);

    return () => {
      window.clearInterval(interval);
      clearHideTimer();
    };
  }, [username, lastGiftId]);

  if (!gift || !visible) return null;

  const supporterName = gift.anonymous
    ? "Anonymous"
    : gift.gift_name || "Someone";

  const amount = (gift.amount / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[min(92vw,360px)] rounded-2xl border border-white/15 bg-[#11151f]/95 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <p className="text-sm font-semibold text-white">
        🎁 {supporterName} sent £{amount}
      </p>

      {gift.gift_message && (
        <p className="mt-1 text-xs leading-relaxed text-white/70 break-words">
          “{gift.gift_message}”
        </p>
      )}
    </div>
  );
}
