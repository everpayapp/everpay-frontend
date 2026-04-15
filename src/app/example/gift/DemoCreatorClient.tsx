// ~/everpay-frontend/src/app/example/gift/DemoCreatorClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";

type Payment = {
  id: string;
  amount: number;
  gift_amount?: number | null;
  fee_amount?: number | null;
  total_paid?: number | null;
  gift_name?: string | null;
  anonymous?: number;
  gift_message?: string | null;
  created_at: string;
};

type CreatorProfile = {
  username: string;
  profile_name: string;
  avatar_url: string;
  bio: string;
  social_links: string[];
  theme_start?: string;
  theme_mid?: string;
  theme_end?: string;
  milestone_enabled?: number | boolean;
  milestone_amount?: number;
  milestone_text?: string;
};

function getSocialMeta(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes("tiktok.com")) return { label: "TikTok", short: "TT" };
  if (lower.includes("instagram.com")) return { label: "Instagram", short: "IG" };
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return { label: "YouTube", short: "YT" };
  if (lower.includes("facebook.com")) return { label: "Facebook", short: "FB" };
  if (lower.includes("x.com") || lower.includes("twitter.com")) return { label: "X", short: "X" };
  return { label: "Website", short: "WWW" };
}

function firstChar(s: string) {
  const t = (s || "").trim();
  return t.length ? t[0] : "?";
}

function formatGBP(pence: number) {
  const v = Number(pence || 0) / 100;
  return `£${v.toFixed(2)}`;
}

function getGiftPence(payment: Payment) {
  if (typeof payment.gift_amount === "number" && Number.isFinite(payment.gift_amount)) {
    return payment.gift_amount;
  }
  return Number(payment.amount || 0);
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

export default function DemoCreatorClient({ username }: { username: string }) {
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState("");
  const [supporterName, setSupporterName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showMobileQR, setShowMobileQR] = useState(false);
  const [showTopSupportersMobile, setShowTopSupportersMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const origin = mounted && typeof window !== "undefined" ? window.location.origin : "";
  const pageUrl = origin ? `${origin}/example/gift` : "https://everpayapp.co.uk/example/gift";

  const profile: CreatorProfile = {
    username: "everpay",
    profile_name: "EverPay App",
    avatar_url: "",
    bio: "Example EverPay gift page preview.",
    social_links: ["https://tiktok.com/@everpayapp"],
    theme_start: "#0B0D12",
    theme_mid: "#121826",
    theme_end: "#0B0D12",
    milestone_enabled: 1,
    milestone_amount: 100,
    milestone_text: "",
  };

  // Demo amounts below are the full gift amount shown to supporters
  const payments: Payment[] = [
    {
      id: "ep_demo_001",
      amount: 500,
      gift_amount: 500,
      fee_amount: 0,
      total_paid: 500,
      gift_name: "Ariana",
      anonymous: 0,
      gift_message: "Keep going",
      created_at: "2026-03-08T08:10:00.000Z",
    },
    {
      id: "ep_demo_002",
      amount: 1000,
      gift_amount: 1000,
      fee_amount: 0,
      total_paid: 1000,
      gift_name: "Leo",
      anonymous: 0,
      gift_message: "You got this",
      created_at: "2026-03-08T07:30:00.000Z",
    },
    {
      id: "ep_demo_003",
      amount: 500,
      gift_amount: 500,
      fee_amount: 0,
      total_paid: 500,
      gift_name: null,
      anonymous: 1,
      gift_message: "Keep going!",
      created_at: "2026-03-07T21:05:00.000Z",
    },
    {
      id: "ep_demo_004",
      amount: 3000,
      gift_amount: 3000,
      fee_amount: 0,
      total_paid: 3000,
      gift_name: "Mia",
      anonymous: 0,
      gift_message: "Looking great",
      created_at: "2026-03-07T19:20:00.000Z",
    },
  ];

  async function handlePay() {
    if (!amount || Number(amount) <= 0) {
      alert("Enter an amount");
      return;
    }

    const amountPence = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountPence) || amountPence < 50) {
      alert("Minimum gift is £0.50");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Demo preview only — checkout is disabled here.");
    }, 650);
  }

  const bgStart = profile.theme_start || "#0B0D12";
  const bgMid = profile.theme_mid || "#121826";
  const bgEnd = profile.theme_end || "#0B0D12";

  const totalEarned = payments.reduce((sum, p) => sum + getGiftPence(p), 0) / 100;

  const topSupporters = useMemo(() => {
    const map = new Map<string, { label: string; totalPence: number; gifts: number }>();

    for (const p of payments) {
      const isAnon = !!p.anonymous;
      const rawName = (p.gift_name || "").trim();
      const giftPence = getGiftPence(p);

      let label = "Someone";
      if (isAnon) label = "Anonymous";
      else if (rawName) label = rawName;

      const key = isAnon ? "__anonymous__" : rawName ? rawName.toLowerCase() : "__someone__";

      const prev = map.get(key);
      if (prev) {
        prev.totalPence += giftPence;
        prev.gifts += 1;
      } else {
        map.set(key, { label, totalPence: giftPence, gifts: 1 });
      }
    }

    return Array.from(map.values())
      .sort((a, b) => b.totalPence - a.totalPence)
      .slice(0, 4);
  }, [payments]);

  const milestoneEnabled =
    profile &&
    (profile.milestone_enabled === 1 || profile.milestone_enabled === true) &&
    (profile.milestone_amount || 0) > 0;

  const milestoneTarget = profile?.milestone_amount || 0;
  const milestoneProgress = milestoneTarget > 0 ? Math.min(1, totalEarned / milestoneTarget) : 0;
  const milestonePercent = Math.round(milestoneProgress * 100);

  const panelClass = "bg-black/45 backdrop-blur-md rounded-3xl border border-white/18 shadow-2xl";
  const presetAmounts = [2, 5, 10, 20, 50];
  const creatorDisplayName = (profile?.profile_name || username || "").trim();
  const creatorFirstName = creatorDisplayName.split(" ")[0] || creatorDisplayName || "Creator";

  return (
    <div
      className="min-h-screen text-white flex justify-center px-4 py-6 sm:py-8 transition-[background] duration-[600ms] overflow-x-hidden"
      style={{ background: `linear-gradient(to bottom right, ${bgStart}, ${bgMid}, ${bgEnd})` }}
    >
      <div className="w-full max-w-6xl space-y-4 sm:space-y-6 px-1 sm:px-0 overflow-x-hidden">
        <div className="rounded-2xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          Demo preview — payments are disabled on this page.
        </div>

        <section className={`w-full ${panelClass} px-5 sm:px-8 py-4 sm:py-6 overflow-x-hidden`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => profile.avatar_url && setShowAvatar(true)}
                title="View profile picture"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[4px] border-white/35 bg-white/10 flex items-center justify-center overflow-hidden shadow-xl shrink-0 cursor-pointer"
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile picture" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-2xl sm:text-2xl font-bold">{firstChar(profile.profile_name) || firstChar(username)}</span>
                )}
              </button>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex flex-wrap items-start gap-2 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight whitespace-normal break-words sm:truncate">
                    {profile.profile_name || username}
                  </h1>
                  <div className="pt-1">
                    <VerifiedBadge />
                  </div>
                </div>

                {Array.isArray(profile.social_links) && profile.social_links.length > 0 && (
                  <>
                    <div className="sm:hidden mt-2 w-full overflow-x-auto whitespace-nowrap">
                      <div className="inline-flex gap-2 pr-1">
                        {profile.social_links.map((url) => {
                          const meta = getSocialMeta(url);
                          return (
                            <a
                              key={url}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white/90 hover:bg-white/15 transition"
                              title={url}
                            >
                              <span>{meta.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>

                    <div className="hidden sm:flex mt-2 flex-wrap gap-2">
                      {profile.social_links.map((url) => {
                        const meta = getSocialMeta(url);
                        return (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs text-white/90 hover:bg-white/15 transition"
                            title={url}
                          >
                            <span>{meta.label}</span>
                          </a>
                        );
                      })}
                    </div>
                  </>
                )}

                <div className="sm:hidden mt-3 w-full flex justify-center">
                  <span className="text-[11px] text-white/55 tracking-wide text-center">Powered by EverPay</span>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-start justify-end pt-1">
              <span className="text-[12px] text-white/70 font-medium tracking-wide">Powered by EverPay</span>
            </div>
          </div>
        </section>

        {milestoneEnabled && (
          <section className={`${panelClass} px-5 py-4 overflow-x-hidden`}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/70 mb-1">Goal</p>

            {profile.milestone_text && <p className="text-sm font-semibold mb-1">{profile.milestone_text}</p>}

            <p className="text-[13px] text-white/80 mb-3">
              £{totalEarned.toLocaleString("en-GB", { minimumFractionDigits: 2 })} of £
              {milestoneTarget.toLocaleString("en-GB", { minimumFractionDigits: 2 })} raised
            </p>

            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300"
                style={{ width: `${milestonePercent}%` }}
              />
            </div>

            <p className="mt-1 text-[11px] text-white/65">
              {milestonePercent >= 100 ? "Goal reached 🎉 — you smashed it!" : `${milestonePercent}% complete`}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start lg:items-stretch overflow-x-hidden">
          <section className={`${panelClass} p-4 sm:p-8 flex flex-col min-h-0 overflow-hidden lg:h-[720px]`}>
            <h2 className="text-lg sm:text-xl font-semibold mb-3">Send a Gift</h2>

            <div className="flex flex-wrap gap-2 mb-3">
              {presetAmounts.map((v) => {
                const selected = Number(amount) === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
                      selected ? "bg-white text-black border-white/70" : "bg-white/10 text-white border-white/20 hover:bg-white/15"
                    }`}
                  >
                    £{v}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mb-3 w-full min-w-0">
              <span className="text-xl font-bold shrink-0">£</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, ".");
                  if (!/^\d*\.?\d{0,2}$/.test(raw)) return;
                  setAmount(raw);
                }}
                placeholder="0.00"
                className="min-w-0 flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 sm:py-2.5 text-base text-white placeholder-white/60 outline-none focus:border-white/35"
              />
            </div>

            <input
              type="text"
              value={supporterName}
              onChange={(e) => setSupporterName(e.target.value)}
              placeholder="Your name (optional)"
              disabled={anonymous}
              className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/60 outline-none mb-3 focus:border-white/35"
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 120))}
              placeholder="Leave a message (optional)"
              className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/60 outline-none h-12 sm:h-24 resize-none mb-3 focus:border-white/35"
            />

            <label className="flex items-center gap-2 text-xs sm:text-sm mb-3 cursor-pointer">
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
              <span>Gift anonymously</span>
            </label>

            <button
              className="w-full py-3 rounded-xl text-white font-semibold active:scale-[0.98] transition mb-2 shadow-xl border-2 border-white/70 hover:border-white hover:opacity-[0.97]"
              style={{ background: `linear-gradient(90deg, ${bgStart}, ${bgMid}, ${bgEnd})` }}
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? "Redirecting..." : `Send ${creatorFirstName} a Gift 🎁`}
            </button>

            <p className="text-center text-[11px] text-white/80">Pay by bank • No card details needed</p>
            <p className="text-center text-[11px] text-white/60 mt-1 tracking-wide">Secure checkout powered by Stripe</p>

            <div className="mt-auto pt-4 pb-2 hidden lg:flex flex-col items-center gap-2">
              <div className="bg-white rounded-2xl p-3 border border-black/20 shadow-xl flex items-center justify-center">
                {mounted && pageUrl ? (
                  <QRCode value={pageUrl} size={138} bgColor="#ffffff" fgColor="#000000" />
                ) : (
                  <span className="text-black/70 text-xs">QR loading…</span>
                )}
              </div>

              <p className="text-[12px] text-white/80">Scan demo QR</p>
              <p className="text-[11px] text-white/60 tracking-wide">Powered by EverPay</p>
            </div>
          </section>

          <section className={`${panelClass} p-4 sm:p-8 flex flex-col min-h-0 overflow-hidden lg:h-[720px]`}>
            <div className="mb-4 flex items-center justify-start lg:justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Recent Gifts 🎁</h2>
            </div>

            {payments.length === 0 ? (
              <p className="text-center text-white/70 text-sm">No gifts yet — be the first! 🎁</p>
            ) : (
              <div className="w-full overflow-y-auto pr-1 everpay-scroll mb-4 space-y-2 max-h-[260px] sm:max-h-[360px] lg:max-h-none lg:flex-1 lg:min-h-0">
                {payments.map((p) => {
                  const displayName = p.anonymous ? "Anonymous" : p.gift_name?.trim() ? p.gift_name : "Someone";
                  const giftPence = getGiftPence(p);

                  return (
                    <div
                      key={p.id}
                      className="bg-white/6 border border-white/10 rounded-xl px-3 py-2 text-sm flex justify-between gap-3 shadow-sm overflow-hidden"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[13px] sm:text-sm break-words leading-tight">
                          {displayName} gifted {formatGBP(giftPence)}
                        </p>
                        {p.gift_message && (
                          <p className="text-[11px] sm:text-xs opacity-80 mt-1 italic line-clamp-2">“{p.gift_message}”</p>
                        )}
                      </div>

                      <p className="text-[10px] opacity-60 whitespace-nowrap mt-1">
                        {new Date(p.created_at).toLocaleDateString("en-GB")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {topSupporters.length > 0 && (
              <>
                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowTopSupportersMobile((v) => !v)}
                    className="w-full rounded-2xl bg-white/6 border border-white/15 px-4 py-3 flex items-center justify-between"
                    aria-expanded={showTopSupportersMobile}
                  >
                    <div className="text-left">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">Top Supporters</p>
                      <p className="text-[11px] text-white/55">This month</p>
                    </div>
                    <span className="text-sm text-white/80">{showTopSupportersMobile ? "Hide" : "Show"}</span>
                  </button>

                  {showTopSupportersMobile && (
                    <div className="mt-3 rounded-2xl bg-white/6 border border-white/15 p-4">
                      <div className="space-y-2">
                        {topSupporters.map((s, idx) => (
                          <div
                            key={`${s.label}-${idx}`}
                            className="flex items-center justify-between gap-3 rounded-xl bg-white/6 border border-white/10 px-3 py-2 overflow-hidden"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[12px] font-bold text-white/85 shrink-0">
                                {idx + 1}
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold truncate">{s.label}</p>
                                <p className="text-[11px] text-white/60">
                                  {s.gifts} gift{s.gifts === 1 ? "" : "s"}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 text-sm font-semibold">{formatGBP(s.totalPence)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="hidden lg:block rounded-2xl bg-white/6 border border-white/15 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">Top Supporters</p>
                    <p className="text-[11px] text-white/55">This month</p>
                  </div>

                  <div className="space-y-2">
                    {topSupporters.map((s, idx) => (
                      <div
                        key={`${s.label}-${idx}`}
                        className="flex items-center justify-between gap-3 rounded-xl bg-white/6 border border-white/10 px-3 py-2"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[12px] font-bold text-white/85 shrink-0">
                            {idx + 1}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{s.label}</p>
                            <p className="text-[11px] text-white/60">
                              {s.gifts} gift{s.gifts === 1 ? "" : "s"}
                            </p>
                          </div>
                        </div>

                        <div className="shrink-0 text-sm font-semibold">{formatGBP(s.totalPence)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>

        <section className={`lg:hidden ${panelClass} px-5 py-4 overflow-hidden`}>
          <button
            type="button"
            onClick={() => setShowMobileQR((v) => !v)}
            className="w-full flex items-center justify-between"
            aria-expanded={showMobileQR}
          >
            <div className="text-left">
              <p className="text-base font-semibold text-white">QR code</p>
              <p className="text-[11px] text-white/70">Show the demo QR preview</p>
            </div>

            <span className="text-white/80 text-sm">{showMobileQR ? "Hide" : "Show"}</span>
          </button>

          {showMobileQR && (
            <>
              <div className="mt-4 mx-auto w-full max-w-[240px] bg-white rounded-2xl p-3 border border-black/20 shadow-xl flex items-center justify-center">
                {mounted && pageUrl ? (
                  <QRCode value={pageUrl} size={185} bgColor="#ffffff" fgColor="#000000" />
                ) : (
                  <span className="text-black/70 text-xs">QR loading…</span>
                )}
              </div>

              <p className="mt-3 text-center text-xs text-white/80">Scan demo QR</p>
              <p className="mt-1 text-center text-[11px] text-white/60 tracking-wide">Powered by EverPay</p>
            </>
          )}
        </section>

        {showAvatar && profile.avatar_url && (
          <div
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowAvatar(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full max-w-md sm:max-w-lg rounded-3xl border border-white/15 bg-black/40 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAvatar(false)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/10 border border-white/15 text-white/90 hover:bg-white/15 transition flex items-center justify-center"
                aria-label="Close"
                type="button"
              >
                ✕
              </button>

              <div className="p-4 sm:p-6">
                <div className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
                  <img src={profile.avatar_url} alt="Profile picture" className="w-full h-full object-contain" />
                </div>
                <p className="mt-3 text-center text-sm text-white/80">{profile.profile_name}</p>
              </div>
            </div>
          </div>
        )}

        <style jsx global>{`
          .everpay-scroll {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.22) rgba(255, 255, 255, 0.05);
          }
          .everpay-scroll::-webkit-scrollbar {
            width: 5px;
          }
          .everpay-scroll::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 999px;
          }
          .everpay-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.22);
            border-radius: 999px;
          }
          .everpay-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.32);
          }

          html,
          body {
            overflow-x: hidden;
          }

          #__next {
            overflow-x: hidden;
          }
        `}</style>
      </div>
    </div>
  );
}
