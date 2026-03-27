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
  created_at?: string;
};

export default function CreatorGiftToast() {
  const { data: session } = useSession();
  const username = (session?.user as any)?.username as string | undefined;

  const [gift, setGift] = useState<Payment | null>(null);
  const [visible, setVisible] = useState(false);

  const lastGiftIdRef = useRef<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    audioRef.current = new Audio("/sounds/gift-pop.wav");
    audioRef.current.preload = "auto";
    audioRef.current.volume = 0.9;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!username) return;

    const safeUsername = username;

    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };

    const playSound = async () => {
      try {
        if (!audioRef.current) return;
        audioRef.current.currentTime = 0;
        await audioRef.current.play();
      } catch {
        // ignore browser autoplay restrictions
      }
    };

    const showToast = (payment: Payment) => {
      clearHideTimer();
      setGift(payment);
      setVisible(true);
      void playSound();

      hideTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        setGift(null);
      }, 4500);
    };

    const checkForNewGift = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/payments/creator/${encodeURIComponent(safeUsername)}`,
          { cache: "no-store" }
        );

        const data = await res.json().catch(() => []);

        if (!Array.isArray(data) || data.length === 0) return;

        const sorted = [...data].sort((a, b) => {
          const aTime = new Date(a.created_at || 0).getTime();
          const bTime = new Date(b.created_at || 0).getTime();
          const aSafe = Number.isFinite(aTime) ? aTime : 0;
          const bSafe = Number.isFinite(bTime) ? bTime : 0;
          return bSafe - aSafe;
        });

        const latest = sorted[0];
        if (!latest?.id) return;

        if (!lastGiftIdRef.current) {
          lastGiftIdRef.current = latest.id;
          return;
        }

        if (latest.id !== lastGiftIdRef.current) {
          lastGiftIdRef.current = latest.id;
          showToast(latest);
        }
      } catch (err) {
        console.error("Gift toast error", err);
      }
    };

    checkForNewGift();
    intervalRef.current = window.setInterval(checkForNewGift, 8000);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      clearHideTimer();
    };
  }, [username]);

  if (!gift || !visible) return null;

  const supporterName = gift.anonymous
    ? "Anonymous"
    : gift.gift_name?.trim() || "Someone";

  const amount = (gift.amount / 100).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="fixed bottom-28 right-10 z-50 w-[min(92vw,460px)] rounded-2xl border border-white/40 bg-[#131a26]/96 px-5 py-4 shadow-[0_30px_80px_rgba(0,0,0,0.62)] backdrop-blur-xl animate-gift-glow">
      <p className="text-lg font-semibold text-white">
        🎁 {supporterName} sent £{amount}
      </p>

      {gift.gift_message && (
        <p className="mt-2 text-sm leading-relaxed text-white/85 break-words">
          “{gift.gift_message}”
        </p>
      )}
    </div>
  );
}
