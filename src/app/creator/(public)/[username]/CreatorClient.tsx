// ~/everpay-frontend/src/app/creator/(public)/[username]/CreatorClient.tsx
"use client";

import { useState, useEffect } from "react";
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

export default function CreatorClient({ username }: { username: string }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_BASE_URL;

  // Always resolve a valid public URL (works on Vercel + locally)
  const origin =
    typeof window !== "undefined" ? window.location.origin : baseUrl || "";

  const pageUrl = origin ? `${origin}/creator/${username}` : "";


  const [amount, setAmount] = useState("");
  const [supporterName, setSupporterName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [celebration, setCelebration] = useState<{
    amount: number;
    name: string;
    message?: string | null;
  } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);


  // Load creator profile (+ milestone)
  useEffect(() => {
    async function load() {
      try {
        if (!apiUrl) return;

        const res = await fetch(`${apiUrl}/api/creator/profile?username=${username}`);
        const data = await res.json();

        const socialLinks = Array.isArray(data.social_links)
          ? data.social_links
          : (() => {
              try {
                return JSON.parse(data.social_links ?? "[]");
              } catch {
                return [];
              }
            })();

        setProfile({
          username,
          profile_name: data.profile_name || username,
          avatar_url: data.avatar_url || "",
          bio: data.bio || "",
          social_links: socialLinks,
          theme_start: data.theme_start || "#ff0080",
          theme_mid: data.theme_mid || "#7c3aed",
          theme_end: data.theme_end || "#2563eb",
          milestone_enabled: data.milestone_enabled,
          milestone_amount: Number(data.milestone_amount) || 0,
          milestone_text: data.milestone_text || "",
        });
      } catch {
        // ignore
      } finally {
        setProfileLoaded(true);
      }
    }

    load();
  }, [apiUrl, username]);

  // Refresh colours & milestone every 3 seconds
  useEffect(() => {
    if (!apiUrl) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/api/creator/profile?username=${username}`);
        const data = await res.json();

        setProfile((prev) =>
          prev &&
          (prev.theme_start !== data.theme_start ||
            prev.theme_mid !== data.theme_mid ||
            prev.theme_end !== data.theme_end ||
            prev.milestone_enabled !== data.milestone_enabled ||
            prev.milestone_amount !== data.milestone_amount ||
            prev.milestone_text !== data.milestone_text)
            ? {
                ...prev,
                theme_start: data.theme_start,
                theme_mid: data.theme_mid,
                theme_end: data.theme_end,
                milestone_enabled: data.milestone_enabled,
                milestone_amount: Number(data.milestone_amount) || 0,
                milestone_text: data.milestone_text || "",
              }
            : prev
        );
      } catch {
        // ignore
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [apiUrl, username]);

  // Load payments (and keep refreshing)
  useEffect(() => {
    if (!apiUrl) return;

    async function loadPayments() {
      try {
        const res = await fetch(
          `${apiUrl}/api/payments/${encodeURIComponent(username)}`
        );
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
      setLoadingPayments(false);
    }

    loadPayments();
    const interval = setInterval(loadPayments, 5000);
    return () => clearInterval(interval);
  }, [apiUrl, username]);


  // Handle send gift
  async function handlePay() {
    if (!apiUrl) {
      alert("Missing API URL");
      return;
    }

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
    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(`everpay_pending_gift_${username}`, "1");
      }

      // Creator gifts: POST /creator/pay/:username (Pay by Bank)
const res = await fetch(`${apiUrl}/creator/pay/${encodeURIComponent(username)}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    amount: amountPence,
    supporterName,
    anonymous,
    gift_message: message,
    isUK: true,
  }),
});


      const data = await res.json().catch(() => ({} as any));

      if (res.ok && data?.url) {
        window.location.href = data.url;
        return;
      }

      console.error("Payment create failed:", data);
      alert(data?.error || "Payment failed");
      setLoading(false);
    } catch {
      alert("Payment failed");
      setLoading(false);
    }
  }

  // Celebration logic – runs after we have payments
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!payments.length) return;

    const pendingKey = `everpay_pending_gift_${username}`;
    const lastKey = `everpay_last_celebrated_${username}`;

    const pending = window.localStorage.getItem(pendingKey);
    if (pending !== "1") return;

    const latest = payments[0];
    if (!latest) return;

    const lastCelebratedId = window.localStorage.getItem(lastKey);
    if (lastCelebratedId === latest.id) {
      window.localStorage.removeItem(pendingKey);
      return;
    }

    const displayName =
      latest.anonymous
        ? "Someone"
        : latest.gift_name && latest.gift_name.trim().length
        ? latest.gift_name
        : "Someone";

    setCelebration({
      amount: latest.amount,
      name: displayName,
      message: latest.gift_message,
    });
    setShowCelebration(true);

    window.localStorage.setItem(lastKey, latest.id);
    window.localStorage.removeItem(pendingKey);

    const timeout = setTimeout(() => {
      setShowCelebration(false);
    }, 3500);

    return () => clearTimeout(timeout);
  }, [payments, username]);

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

  // 🔹 Loading & "creator not found" handling
  if (!profileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading creator…
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Creator not found.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-white flex justify-center px-4 py-10 transition-[background] duration-[600ms]"
      style={{
        background: `linear-gradient(to bottom right, ${bgStart}, ${bgMid}, ${bgEnd})`,
      }}
    >
      {/* Celebration bubble overlay */}
      {showCelebration && celebration && (
        <div className="fixed inset-0 z-40 flex items-center justify-center pointer-events-none">
          <div className="gift-celebration-bubble text-center">
            <div className="text-xs uppercase tracking-[0.18em] opacity-80 mb-1">
              Thank you! 🎁
            </div>
            <div className="text-2xl sm:text-3xl font-bold">
              £{(celebration.amount / 100).toFixed(2)} from {celebration.name}!
            </div>
            {celebration.message && (
              <div className="mt-2 text-sm sm:text-base opacity-95 italic">
                “{celebration.message}”
              </div>
            )}
          </div>
        </div>
      )}

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
              Send a Gift 💝
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
              className="w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 active:scale-[0.98] transition mb-6"
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? "Redirecting…" : "Send Gift 💝"}
            </button>

            <div className="mt-auto flex flex-col items-center gap-3">
            <div className="w-[220px] h-[220px] bg-white rounded-2xl shadow-xl flex items-center justify-center">
  {pageUrl ? (
    <QRCode value={pageUrl} size={200} />
  ) : (
    <span className="text-black/70 text-xs">QR unavailable</span>
  )}
</div>
              <p className="text-xs text-white/80">Scan to support me</p>
            </div>
          </section>

          {/* Recent Gifts */}
          <section className="bg-black/25 rounded-3xl border border-white/20 backdrop-blur-xl p-6 sm:p-8 shadow-2xl flex flex-col h-[560px]">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">
              Recent Gifts 💖
            </h2>

            {loadingPayments ? (
              <p className="text-center text-white/70 text-sm">Loading…</p>
            ) : payments.length === 0 ? (
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
                      {new Date(p.created_at).toLocaleDateString()}
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
