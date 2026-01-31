// ~/everpay-frontend/src/app/example/DemoDashboardClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";

type Payment = {
  id: string;
  amount: number;
  gift_name?: string;
  gift_message?: string;
  anonymous?: number;
  created_at: string;
};

type CreatorProfile = {
  username: string;
  profile_name: string;
  avatar_url: string;
  bio: string;
  milestone_enabled?: number | boolean;
  milestone_amount?: number;
  milestone_text?: string;
};

export default function DemoDashboardClient({ username }: { username: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const origin = mounted ? window.location.origin : "";
  const pageUrl = origin ? `${origin}/creator/${username}` : `https://everpay.com/creator/${username}`;

  const [showQRModal, setShowQRModal] = useState(false);

  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    };
  }, []);

  const profile: CreatorProfile = {
    username,
    profile_name: "Lee (Demo Creator)",
    avatar_url: "",
    bio: "Demo preview dashboard.",
    milestone_enabled: 1,
    milestone_amount: 250,
    milestone_text: "New mic 🎤",
  };

  // Realistic demo payments (fixed dates to avoid hydration mismatch)
  const payments: Payment[] = [
    {
      id: "ep_demo_dash_001",
      amount: 500,
      gift_name: "Sarah",
      gift_message: "Love your content 🎁",
      anonymous: 0,
      created_at: "2026-01-30T08:10:00.000Z",
    },
    {
      id: "ep_demo_dash_002",
      amount: 1000,
      gift_name: "",
      gift_message: "Keep going!",
      anonymous: 1,
      created_at: "2026-01-29T19:30:00.000Z",
    },
    {
      id: "ep_demo_dash_003",
      amount: 2500,
      gift_name: "Tom",
      gift_message: "Legend 🙌",
      anonymous: 0,
      created_at: "2026-01-29T12:05:00.000Z",
    },
    {
      id: "ep_demo_dash_004",
      amount: 300,
      gift_name: "Mia",
      gift_message: "",
      anonymous: 0,
      created_at: "2026-01-28T21:40:00.000Z",
    },
  ];

  const totalEarned = payments.reduce((sum, p) => sum + p.amount, 0) / 100;
  const formattedTotal = totalEarned.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const milestoneEnabled =
    profile &&
    (profile.milestone_enabled === 1 || profile.milestone_enabled === true) &&
    (profile.milestone_amount || 0) > 0;

  const milestoneTarget = profile.milestone_amount || 0;
  const progress = milestoneTarget > 0 ? Math.min(1, totalEarned / milestoneTarget) : 0;
  const progressPercent = Math.round(progress * 100);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      alert("Copy failed (demo).");
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 text-white mt-10 pb-32 bg-gradient-to-b from-slate-800/40 via-slate-900/25 to-transparent rounded-3xl">
        {/* Profile header */}
        {profile && (
          <div className="w-full bg-black/60 border border-white/10 rounded-3xl p-8 shadow-2xl flex items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-full border-[5px] border-white/30 overflow-hidden shadow-xl bg-white/10 flex items-center justify-center">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="Creator avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">{profile.profile_name?.[0] || username[0]}</span>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold uppercase">{profile.profile_name}</h1>
              <p className="text-sm text-white/60">@{username}</p>
              <p className="text-[11px] text-white/40 mt-1">Demo preview • fake data</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8">
          {/* LEFT */}
          <div className="space-y-8">
            {milestoneEnabled && (
              <div className="bg-black/40 border border-white/10 rounded-3xl px-6 py-5">
                <p className="text-xs uppercase text-white/70 mb-1">Current goal</p>

                {profile.milestone_text && <p className="text-sm font-medium mb-2">{profile.milestone_text}</p>}

                <p className="text-[13px] text-white/80 mb-3">
                  £{formattedTotal} of £
                  {milestoneTarget.toLocaleString("en-GB", { minimumFractionDigits: 2 })} raised
                </p>

                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
              <p className="text-sm uppercase text-white/60">Total Earnings</p>
              <p className="text-5xl font-bold">£{formattedTotal}</p>
            </div>

            {/* SHARE */}
            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 space-y-4">
              <p className="text-sm text-center">Share your gift page 🌍</p>

              <div className="bg-black/60 rounded-xl px-4 py-2 text-sm text-white/70 break-all">
                {pageUrl}
              </div>

              <button
                onClick={handleCopy}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold"
              >
                {copied ? "Copied ✓" : "Copy Link"}
              </button>

              <button
                onClick={() => setShowQRModal(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold"
              >
                📷 Show Live Stream QR
              </button>

              <p className="text-center text-[11px] text-white/40">
                Demo preview — buttons are (safe) and do not affect a real account.
              </p>
            </div>
          </div>

          {/* RIGHT */}
          <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl font-semibold mb-5 text-center">Recent Supporters</h2>

            {payments.slice(0, 5).map((p) => (
              <div key={p.id} className="bg-white/5 rounded-xl p-4 mb-2 flex justify-between">
                <div className="min-w-0">
                  <p className="text-sm">
                    {p.anonymous ? "Anonymous" : p.gift_name?.trim() ? p.gift_name : "Someone"}
                  </p>
                  <p className="font-semibold">
                    £{(p.amount / 100).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                  </p>

                  {p.gift_message ? (
                    <p className="text-xs text-white/60 truncate max-w-[220px]">“{p.gift_message}”</p>
                  ) : null}
                </div>

                <div className="text-xs opacity-60 whitespace-nowrap">
                  {new Date(p.created_at).toLocaleDateString("en-GB")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR MODAL (render QR only after mount to avoid hydration mismatch) */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 shadow-2xl text-center">
            {mounted ? <QRCode value={pageUrl} size={220} /> : <div className="w-[220px] h-[220px]" />}
            <p className="mt-3 text-xs text-slate-500">
              Powered by <strong>EverPay</strong> · Demo preview
            </p>
            <button
              onClick={() => setShowQRModal(false)}
              className="mt-4 text-sm text-slate-400 hover:text-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
