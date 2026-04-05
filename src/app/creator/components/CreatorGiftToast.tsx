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
  const audioUnlockedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const audio = new Audio("/sounds/gift-pop.wav");
    audio.preload = "auto";
    audio.volume = 1;
    audioRef.current = audio;

    const unlockAudio = async () => {
      if (!audioRef.current || audioUnlockedRef.current) return;

      try {
        audioRef.current.muted = true;
        await audioRef.current.play();
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.muted = false;
        audioUnlockedRef.current = true;
        console.log("✅ audio unlocked");
      } catch (err) {
        console.error("❌ audio unlock failed", err);
      }
    };

    const handleFirstInteraction = () => {
      void unlockAudio();
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction, { passive: true });
    window.addEventListener("touchstart", handleFirstInteraction, { passive: true });
    window.addEventListener("keydown", handleFirstInteraction);

    audioRef.current.oncanplaythrough = () => {
      console.log("✅ sound ready");
    };

    audioRef.current.onerror = () => {
      console.error("❌ sound failed to load");
    };

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);

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
        console.log("🔊 sound played");
      } catch (err) {
        console.error("❌ sound blocked", err);
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

  const supporterName = gift?.anonymous
    ? "Anonymous"
    : gift?.gift_name?.trim() || "Someone";

  const amount = gift
    ? (gift.amount / 100).toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  return (
    <>
      {gift && visible && (
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
      )}
    </>
  );
}
