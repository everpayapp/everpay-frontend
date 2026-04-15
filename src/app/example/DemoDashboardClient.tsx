// ~/everpay-frontend/src/app/example/DemoDashboardClient.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
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

export default function DemoDashboardClient({ username }: { username: string }) {
  const PAGE_BG = "#0B0D12";

  const PANEL =
    "bg-black/25 rounded-3xl border border-white/18 shadow-[0_18px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/10";

  const SUBPANEL =
    "bg-black/20 rounded-2xl border border-white/12";

  const [showQRModal, setShowQRModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  useEffect(() => {
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

  // Demo amounts below are NET received after Stripe fees
  const payments: Payment[] = [
    {
      id: "ep_demo_dash_001",
      amount: 1912,
      gift_name: "Ariana",
      gift_message: "Keep building this 👏",
      anonymous: 0,
      created_at: "2026-03-08T08:10:00.000Z",
    },
    {
      id: "ep_demo_dash_002",
      amount: 956,
      gift_name: "Leo",
      gift_message: "Love this idea",
      anonymous: 0,
      created_at: "2026-03-08T07:30:00.000Z",
    },
    {
      id: "ep_demo_dash_003",
      amount: 478,
      gift_name: "",
      gift_message: "Keep going!",
      anonymous: 1,
      created_at: "2026-03-07T21:05:00.000Z",
    },
    {
      id: "ep_demo_dash_004",
      amount: 2870,
      gift_name: "Mia",
      gift_message: "This looks premium",
      anonymous: 0,
      created_at: "2026-03-07T19:20:00.000Z",
    },
  ];

  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0) / 100;

  const formattedTotal = totalReceived.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const milestoneEnabled =
    profile &&
    (profile.milestone_enabled === 1 || profile.milestone_enabled === true) &&
    (profile.milestone_amount || 0) > 0;

  const milestoneTarget = profile.milestone_amount || 0;
  const progress =
    milestoneTarget > 0 ? Math.min(1, totalReceived / milestoneTarget) : 0;
  const progressPercent = Math.round(progress * 100);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);

      if (copiedTimer.current) {
        window.clearTimeout(copiedTimer.current);
      }

      copiedTimer.current = window.setTimeout(() => setCopied(false), 1600);
    } catch {
      alert("Copy failed (demo).");
    }
  };

  const handleOpenMyPage = () => {
    window.open(pageUrl, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.profile_name} on EverPay`,
          text: `Support ${profile.profile_name} on EverPay`,
          url: pageUrl,
        });
      } else {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
      }
    } catch {
      // cancelled
    }
  };

  return (
    <>
      <div className="min-h-screen" style={{ backgroundColor: PAGE_BG }}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 text-white pt-4 sm:pt-10 pb-16 sm:pb-32">
          <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 mb-5 sm:mb-6">
            Demo preview — actions are safe and do not affect a real account.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[58%_42%] gap-5 sm:gap-8">
            <div
              className={`lg:col-span-2 ${PANEL} px-4 py-4 sm:p-9 flex items-center gap-4 sm:gap-7`}
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-[4px] sm:border-[5px] border-white/30 overflow-hidden shadow-xl shrink-0 bg-white/5 flex items-center justify-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Creator avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-4xl font-bold">
                    {firstChar(profile.profile_name)}
                  </span>
                )}
              </div>

              <div className="min-w-0">
                <h1 className="text-[18px] leading-[1.05] sm:text-4xl font-bold uppercase break-words">
                  {profile.profile_name}
                </h1>
                <p className="text-xs sm:text-sm text-white/60 mt-1 break-all">
                  @{profile.username}
                </p>
                <p className="text-[11px] sm:text-xs text-white/45 mt-1">
                  Demo preview • fake data
                </p>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-8">
              {milestoneEnabled && (
                <div className={`${PANEL} px-5 py-5 sm:px-7 sm:py-6`}>
                  <p className="text-[11px] sm:text-xs uppercase text-white/70 mb-1">
                    Current goal
                  </p>

                  <p className="text-[13px] text-white/80 mb-3">
                    £{formattedTotal} of £
                    {milestoneTarget.toLocaleString("en-GB", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    raised
                  </p>

                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-400 to-emerald-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              <div className={`${PANEL} px-5 py-5 sm:p-7`}>
                <p className="text-sm uppercase text-white/60">
                  Total Received
                </p>

                <p className="text-[44px] leading-none sm:text-5xl font-bold mt-2 sm:mt-0">
                  £{formattedTotal}
                </p>
              </div>

              <div className={`${PANEL} px-5 py-5 sm:p-7 space-y-4 sm:space-y-5`}>
                <p className="text-sm text-center">
                  Share your gift page 🌍
                </p>

                <div
                  className={`${SUBPANEL} rounded-xl px-4 py-2.5 text-[13px] sm:text-sm text-white/70 break-all leading-snug`}
                >
                  {pageUrl}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <button
                    onClick={handleCopy}
                    className="min-h-[50px] sm:min-h-0 py-2 sm:py-3 px-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold text-[13px] sm:text-base leading-snug"
                  >
                    {copied ? "Copied ✓" : "Copy Link"}
                  </button>

                  <button
                    onClick={handleOpenMyPage}
                    className="min-h-[50px] sm:min-h-0 py-2 sm:py-3 px-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold text-[13px] sm:text-base leading-snug"
                  >
                    View Page
                  </button>

                  <button
                    onClick={() => setShowQRModal(true)}
                    className="min-h-[50px] sm:min-h-0 py-2 sm:py-3 px-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold text-[13px] sm:text-base leading-snug"
                  >
                    Show QR
                  </button>

                  <button
                    onClick={handleShare}
                    className="min-h-[50px] sm:min-h-0 py-2 sm:py-3 px-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold text-[13px] sm:text-base leading-snug"
                  >
                    Share Page
                  </button>
                </div>
              </div>
            </div>

            <div className={`${PANEL} px-5 py-5 sm:p-7`}>
              <h2 className="text-[20px] sm:text-2xl font-semibold mb-4 sm:mb-5 text-center">
                Recent Gifts
              </h2>

              <div className="space-y-3">
                {payments.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="bg-black/20 border border-white/12 rounded-xl px-4 py-3 sm:p-4 mb-3 flex justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm truncate">
                        {p.anonymous ? "Anonymous" : p.gift_name || "Someone"}
                      </p>

                      <p className="font-semibold text-[15px] sm:text-base mt-1">
                        £
                        {(p.amount / 100).toLocaleString("en-GB", {
                          minimumFractionDigits: 2,
                        })}
                      </p>

                      {p.gift_message ? (
                        <p className="text-xs text-white/60 mt-1 truncate">
                          “{p.gift_message}”
                        </p>
                      ) : null}
                    </div>

                    <div className="text-[11px] sm:text-xs opacity-60 whitespace-nowrap pt-0.5">
                      {new Date(p.created_at).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl text-center max-w-[92vw]">
            <QRCode value={pageUrl} size={220} />

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
