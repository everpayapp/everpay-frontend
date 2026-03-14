"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!username) return;

    const safeUsername: string = username;

    async function checkForNewGift() {
      try {
        const res = await fetch(
          `${API_URL}/api/payments/creator/${encodeURIComponent(safeUsername)}`
        );

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) return;

        const latest = data[0];

        if (!lastGiftId) {
          setLastGiftId(latest.id);
          return;
        }

        if (latest.id !== lastGiftId) {
          setLastGiftId(latest.id);
          setGift(latest);
          setVisible(true);

          setTimeout(() => {
            setVisible(false);
          }, 4500);
        }
      } catch (err) {
        console.error("Gift toast error", err);
      }
    }

    checkForNewGift();

    const interval = setInterval(checkForNewGift, 15000);

    return () => clearInterval(interval);
  }, [username, lastGiftId]);

  if (!gift || !visible) return null;

  const supporterName = gift.anonymous
    ? "Anonymous"
    : gift.gift_name || "Someone";

  const amount = (gift.amount / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
  });

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-xs rounded-2xl bg-black/70 border border-white/20 px-4 py-3 backdrop-blur-xl shadow-xl text-white">
      <p className="text-sm font-semibold">
        🎁 {supporterName} sent £{amount}
      </p>

      {gift.gift_message && (
        <p className="text-xs text-white/70 mt-1">
          "{gift.gift_message}"
        </p>
      )}
    </div>
  );
}
