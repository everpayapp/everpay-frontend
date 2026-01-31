// ~/everpay-frontend/src/app/example/gift/DemoCreatorClient.tsx
"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

type Payment = {
  id: string;
  amount: number;
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
  if (lower.includes("youtube.com") || lower.includes("youtu.be"))
    return { label: "YouTube", short: "YT" };
  if (lower.includes("facebook.com")) return { label: "Facebook", short: "FB" };
  if (lower.includes("x.com") || lower.includes("twitter.com"))
    return { label: "X", short: "X" };
  return { label: "Website", short: "WWW" };
}

export default function DemoCreatorClient({ username }: { username: string }) {
  // Prevent hydration mismatch for QR + any window-derived values
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const origin = mounted ? window.location.origin : "";
  const pageUrl = origin
    ? `${origin}/creator/${username}`
    : `https://everpay.com/creator/${username}`;

  const [amount, setAmount] = useState("");
  const [supporterName, setSupporterName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  // DEMO profile (mirrors your real fields)
  const profile: CreatorProfile = {
    username,
    profile_name: "Lee (Demo Creator)",
    avatar_url: "",
    bio: "This is a demo preview.",
    social_links: ["https://tiktok.com/@demo", "https://instagram.com/demo"],
    theme_start: "#ff0080",
    theme_mid: "#7c3aed",
    theme_end: "#2563eb",
    milestone_enabled: 1,
    milestone_amount: 250,
    milestone_text: "New mic 🎤",
  };

  // DEMO payments (IMPORTANT: fixed timestamps to avoid hydration mismatch)
  const payments: Payment[] = [
    {
      id: "ep_demo_001",
      amount: 500,
      gift_name: "Sarah",
      anonymous: 0,
      gift_message: "Love your content 🎁",
      created_at: "2026-01-30T08:10:00.000Z",
    },
    {
      id: "ep_demo_002",
      amount: 1000,
      gift_name: null,
      anonymous: 1,
      gift_message: "Keep going!",
      created_at: "2026-01-29T19:30:00.000Z",
    },
    {
      id: "ep_demo_003",
      amount: 2500,
      gift_name: "Tom",
      anonymous: 0,
      gift_message: "Legend 🙌",
      created_at: "2026-01-29T12:05:00.000Z",
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

  const bgStart = profile?.theme_start;
  const bgMid = profile?.theme_mid;
  const bgEnd = profile?.theme_end;

  const totalEarned = payments.reduce((sum, p) => sum + p.amount, 0) / 100;

  const milestoneEnabled =
    profile &&
    (profile.milestone_enabled === 1 || profile.milestone_enabled === true) &&
    (profile.milestone_amount || 0) > 0;

  const milestoneTarget = profile?.milestone_amount || 0;
  const milestoneProgress =
    milestoneTarget > 0 ? Math.min(1, totalEarned / milestoneTarget) : 0;
  const milestonePercent = Math.round(milestoneProgress * 100);

  return (
    <div
      className="min-h-screen text-white flex justify-center px-4 py-10 transition-[background] duration-[600ms]"
      style={{
        background: `linear-gradient(to bottom right, ${bgStart}, ${bgMid}, ${bgEnd})`,
      }}
    >
      <div className="w-full max-w-6xl space-y-8">
        {/* Header */}
        <section className="w-full bg-black/20 rounded-3xl border border-white/20 backdrop-blur-xl px-6 sm:px-10 py-6 sm:py-7 shadow-2xl flex items-center gap-5 sm:gap-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[5px] border-white/40 bg-white/10 flex items-center justify-center overflow-hidden shadow-xl">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-xl sm:text-2xl font-bold">
                {profile.profile_name?.[0] || username[0]}
              </span>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {profile.profile_name || "EVER PAY"}
            </h1>
            <p className="text-xs sm:text-sm text-white/70">@{username}</p>

            {Array.isArray(profile.social_links) &&
              profile.social_links.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
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
              )}
          </div>
        </section>

        {/* Milestone bar */}
        {milestoneEnabled && (
          <section className="bg-black/25 rounded-3xl border border-white/20 backdrop-blur-xl px-5 py-4 shadow-2xl">
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/70 mb-1">
              Goal
            </p>

            {profile.milestone_text && (
              <p className="text-sm font-semibold mb-1">
                {profile.milestone_text}
              </p>
            )}

            <p className="text-[13px] text-white/80 mb-3">
              £
              {totalEarned.toLocaleString("en-UK", {
                minimumFractionDigits: 2,
              })}{" "}
              of £
              {milestoneTarget.toLocaleString("en-UK", {
                minimumFractionDigits: 2,
              })}{" "}
              raised
            </p>

            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300"
                style={{ width: `${milestonePercent}%` }}
              />
            </div>

            <p className="mt-1 text-[11px] text-white/65">
              {milestonePercent >= 100
                ? "Goal reached 🎉 — you smashed it!"
                : `${milestonePercent}% complete`}
            </p>
          </section>
        )}

        {/* Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Send a Gift */}
          <section className="bg-black/25 rounded-3xl border border-white/20 backdrop-blur-xl p-6 sm:p-8 shadow-2xl flex flex-col">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">
              Send a Gift
            </h2>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl font-bold">£</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-base text-white placeholder-white/60 outline-none"
              />
            </div>

            <input
              type="text"
              value={supporterName}
              onChange={(e) => setSupporterName(e.target.value)}
              placeholder="Your name (optional)"
              disabled={anonymous}
              className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/60 outline-none mb-3"
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 120))}
              placeholder="Leave a message (optional)"
              className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/60 outline-none h-24 resize-none mb-4"
            />

            <label className="flex items-center gap-2 text-xs sm:text-sm mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              <span>Gift anonymously</span>
            </label>

            <button
              className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 active:scale-[0.98] transition mb-2"
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? "Redirecting…" : "Send Gift 🎁"}
            </button>

            <p className="text-center text-[11px] text-white/70">
              Secure checkout powered by Stripe{" "}
              <span className="text-white/40">• Demo preview (no payment)</span>
            </p>

            <div className="mt-auto flex flex-col items-center gap-3">
              <div className="w-[220px] h-[220px] bg-white rounded-2xl p-3 border border-black/20 shadow-xl flex items-center justify-center">
                {mounted && pageUrl ? (
                  <QRCode
                    value={pageUrl}
                    size={190}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                ) : (
                  <span className="text-black/70 text-xs">QR loading…</span>
                )}
              </div>

              <p className="text-xs text-white/80">Scan to support me</p>
              <p className="text-[11px] text-white/50 tracking-wide">
                Powered by EverPay
              </p>
            </div>
          </section>

          {/* Recent Gifts */}
          <section className="bg-black/25 rounded-3xl border border-white/20 backdrop-blur-xl p-6 sm:p-8 shadow-2xl flex flex-col h-[560px]">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
              Recent Gifts 🎁
            </h2>

            {payments.length === 0 ? (
              <p className="text-center text-white/70 text-sm">
                No gifts yet — be the first! 🎁
              </p>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-1">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm flex justify-between gap-3 shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-[13px] sm:text-sm">
                        {p.anonymous
                          ? "Anonymous"
                          : p.gift_name?.length
                          ? p.gift_name
                          : "Someone"}{" "}
                        gifted £{(p.amount / 100).toFixed(2)}
                      </p>
                      {p.gift_message && (
                        <p className="text-[11px] sm:text-xs opacity-80 mt-1 italic">
                          “{p.gift_message}”
                        </p>
                      )}
                    </div>
                    <p className="text-[10px] opacity-60 whitespace-nowrap mt-1">
                      {new Date(p.created_at).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

