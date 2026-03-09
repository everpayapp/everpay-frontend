// ~/everpay-frontend/src/app/example/DemoDashboardClient.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";

type Payment = {
  id: string;
  amount: number;
  gift_name?: string | null;
  gift_message?: string | null;
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

function firstChar(s: string) {
  const t = (s || "").trim();
  return t.length ? t[0] : "?";
}

function formatGBP(pence: number) {
  return `£${(Number(pence || 0) / 100).toFixed(2)}`;
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] text-white/80 shrink-0">
      <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#1d9bf0] shadow-sm">
        <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true" className="fill-white">
          <path d="M9.0 16.2 4.8 12l1.4-1.4L9 13.4l8.8-8.8L19.2 6z" />
        </svg>
      </span>
      <span className="font-medium">Verified</span>
    </span>
  );
}

export default function DemoDashboardClient({ username }: { username: string }) {
  const [mounted, setMounted] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    };
  }, []);

  const pageUrl = "https://everpayapp.co.uk/example/gift";

  const profile: CreatorProfile = {
    username: "everpay",
    profile_name: "EverPay App",
    avatar_url: "",
    bio: "Demo preview dashboard.",
    milestone_enabled: 1,
    milestone_amount: 100,
    milestone_text: "",
  };

  const payments: Payment[] = [
    {
      id: "ep_demo_dash_001",
      amount: 205,
      gift_name: "Ariana",
      gift_message: "Keep going",
      anonymous: 0,
      created_at: "2026-03-08T08:10:00.000Z",
    },
    {
      id: "ep_demo_dash_002",
      amount: 205,
      gift_name: "Leo",
      gift_message: "You got this",
      anonymous: 0,
      created_at: "2026-03-08T07:30:00.000Z",
    },
    {
      id: "ep_demo_dash_003",
      amount: 205,
      gift_name: "",
      gift_message: "Keep going!",
      anonymous: 1,
      created_at: "2026-03-07T21:05:00.000Z",
    },
    {
      id: "ep_demo_dash_004",
      amount: 513,
      gift_name: "Lee",
      gift_message: "Looking great",
      anonymous: 0,
      created_at: "2026-03-07T19:20:00.000Z",
    },
  ];

  const totalPence = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const totalEarned = totalPence / 100;

  const milestoneEnabled =
    profile &&
    (profile.milestone_enabled === 1 || profile.milestone_enabled === true) &&
    (profile.milestone_amount || 0) > 0;

  const milestoneTarget = profile.milestone_amount || 0;
  const progress = milestoneTarget > 0 ? Math.min(1, totalEarned / milestoneTarget) : 0;
  const progressPercent = Math.round(progress * 100);

  const panelClass = "bg-black/45 backdrop-blur-md rounded-3xl border border-white/18 shadow-2xl";

  const recentGifts = useMemo(() => payments.slice(0, 5), [payments]);

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
      <div
        className="max-w-6xl mx-auto px-4 text-white mt-10 pb-24"
        style={{ background: "linear-gradient(to bottom right, #0B0D12, #121826, #0B0D12)" }}
      >
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            Demo preview — actions are disabled on this page.
          </div>

          <section className={`w-full ${panelClass} px-5 sm:px-8 py-5 sm:py-6 overflow-x-hidden`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6">
              <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[4px] border-white/35 bg-white/10 flex items-center justify-center overflow-hidden shadow-xl shrink-0">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile picture" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-2xl font-bold">{firstChar(profile.profile_name)}</span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start gap-2 min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">{profile.profile_name}</h1>
                    <div className="pt-1">
                      <VerifiedBadge />
                    </div>
                  </div>

                  <p className="text-sm text-white/60">@everpay</p>
                  <p className="text-[11px] text-white/45 mt-1">Demo preview • fake data</p>
                </div>
              </div>

              <div className="hidden sm:flex items-start justify-end pt-1">
                <span className="text-[12px] text-white/70 font-medium tracking-wide">Powered by EverPay</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
            <div className="space-y-6">
              {milestoneEnabled && (
                <section className={`${panelClass} px-5 py-4 overflow-x-hidden`}>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/70 mb-1">Current goal</p>

                  {profile.milestone_text && <p className="text-sm font-semibold mb-1">{profile.milestone_text}</p>}

                  <p className="text-[13px] text-white/80 mb-3">
                    £{totalEarned.toLocaleString("en-GB", { minimumFractionDigits: 2 })} of £
                    {milestoneTarget.toLocaleString("en-GB", { minimumFractionDigits: 2 })} raised
                  </p>

                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <p className="mt-1 text-[11px] text-white/65">{progressPercent}% complete</p>
                </section>
              )}

              <section className={`${panelClass} p-6`}>
                <p className="text-sm uppercase text-white/60 mb-2">Total earnings</p>
                <p className="text-5xl font-bold">£{totalEarned.toFixed(2)}</p>
              </section>

              <section className={`${panelClass} p-6 space-y-4`}>
                <p className="text-sm text-center">Share your gift page 🌍</p>

                <div className="bg-black/60 rounded-xl px-4 py-2 text-sm text-white/70 break-all border border-white/10">
                  {pageUrl}
                </div>

                <button
                  onClick={handleCopy}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2EE4A5] to-[#41E8A5] text-black font-semibold hover:opacity-95 transition"
                >
                  {copied ? "Copied ✓" : "Copy Link"}
                </button>

                <button
                  onClick={() => setShowQRModal(true)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#2EE4A5] to-[#41E8A5] text-black font-semibold hover:opacity-95 transition"
                >
                  📷 Show Live Stream QR
                </button>

                <p className="text-center text-[11px] text-white/40">
                  Demo preview — buttons are safe and do not affect a real account.
                </p>
              </section>
            </div>

            <section className={`${panelClass} p-6`}>
              <h2 className="text-2xl font-semibold mb-5 text-center">Recent Gifts 🎁</h2>

              <div className="space-y-3">
                {recentGifts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm flex justify-between gap-3 shadow-sm overflow-hidden"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">
                        {p.anonymous ? "Anonymous" : p.gift_name?.trim() ? p.gift_name : "Someone"}
                      </p>
                      <p className="font-bold text-white">{formatGBP(p.amount)}</p>
                      {p.gift_message ? (
                        <p className="text-xs text-white/60 truncate max-w-[240px]">“{p.gift_message}”</p>
                      ) : null}
                    </div>

                    <div className="text-xs opacity-60 whitespace-nowrap mt-1">
                      {new Date(p.created_at).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-3xl p-6 shadow-2xl text-center max-w-sm w-full">
            {mounted ? <QRCode value={pageUrl} size={220} /> : <div className="w-[220px] h-[220px] mx-auto" />}
            <p className="mt-3 text-xs text-slate-500">
              Powered by <strong>EverPay</strong> · Demo preview
            </p>
            <button
              onClick={() => setShowQRModal(false)}
              className="mt-4 text-sm text-slate-500 hover:text-slate-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
