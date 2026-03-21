// ~/everpay-frontend/src/app/creator/(public)/[username]/CreatorClient.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
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

function normalizeSocialLinks(input: unknown): string[] {
  let arr: string[] = [];

  if (Array.isArray(input)) {
    arr = input.map((x) => String(x));
  } else if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) arr = parsed.map((x) => String(x));
      else arr = [trimmed];
    } catch {
      arr = [trimmed];
    }
  } else if (input && typeof input === "object") {
    try {
      arr = Object.values(input as any).map((x) => String(x));
    } catch {
      arr = [];
    }
  }

  const cleaned = arr
    .map((u) => (u ?? "").toString().trim())
    .filter(Boolean)
    .map((u) => {
      const hasScheme = /^https?:\/\//i.test(u);
      return hasScheme ? u : `https://${u}`;
    });

  return Array.from(new Set(cleaned));
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

export default function CreatorClient({ username: propUsername }: { username?: string }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_BASE_URL;

  const params = useParams<{ username?: string | string[] }>();
  const searchParams = useSearchParams();

  const routeUsernameRaw = params?.username;
  const routeUsername =
    typeof routeUsernameRaw === "string" ? routeUsernameRaw : Array.isArray(routeUsernameRaw) ? routeUsernameRaw[0] : "";

  const username = String(propUsername || routeUsername || "").trim();

  const origin = typeof window !== "undefined" ? window.location.origin : baseUrl || "";
  const pageUrl = origin && username ? `${origin}/creator/${encodeURIComponent(username)}` : "";

  const [amount, setAmount] = useState("");
  const [supporterName, setSupporterName] = useState("");
  const [message, setMessage] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(true);

  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);

  const [showAvatar, setShowAvatar] = useState(false);
  const [displayMilestonePercent, setDisplayMilestonePercent] = useState(0);
  const [showMobileQR, setShowMobileQR] = useState(false);
  const [showTopSupportersMobile, setShowTopSupportersMobile] = useState(false);

  const [activeToastPayment, setActiveToastPayment] = useState<Payment | null>(null);
  const [successToast, setSuccessToast] = useState(false);
  const [successToastName, setSuccessToastName] = useState("");

  const latestSeenPaymentIdRef = useRef<string | null>(null);
  const toastQueueRef = useRef<Payment[]>([]);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successToastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressNextLiveToastRef = useRef(false);

  const presetAmounts = [2, 5, 10, 20, 50];

  const creatorDisplayName = (profile?.profile_name || username || "").trim();
  const creatorFirstName = creatorDisplayName.split(" ")[0] || creatorDisplayName || "Creator";

  function enqueueToast(payment: Payment) {
    const alreadyQueued = toastQueueRef.current.some((p) => p.id === payment.id);
    const isActive = activeToastPayment?.id === payment.id;
    if (alreadyQueued || isActive) return;

    toastQueueRef.current.push(payment);

    if (!activeToastPayment) {
      showNextToast();
    }
  }

  function showNextToast() {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    const next = toastQueueRef.current.shift() || null;
    setActiveToastPayment(next);

    if (next) {
      toastTimeoutRef.current = setTimeout(() => {
        setActiveToastPayment(null);
      }, 3200);
    }
  }

  useEffect(() => {
    if (!activeToastPayment && toastQueueRef.current.length > 0) {
      showNextToast();
    }
    return undefined;
  }, [activeToastPayment]);

  useEffect(() => {
    async function load() {
      try {
        if (!apiUrl || !username) return;

        const res = await fetch(`${apiUrl}/api/creator/profile?username=${encodeURIComponent(username)}`);
        const data = await res.json().catch(() => ({} as any));

        if (!data || !data.username) {
          setProfile(null);
          return;
        }

        const socialLinks = normalizeSocialLinks(data.social_links);

        setProfile({
          username: data.username || username,
          profile_name: data.profile_name || username,
          avatar_url: data.avatar_url || "",
          bio: data.bio || "",
          social_links: socialLinks,
          theme_start: data.theme_start || "#0B0D12",
          theme_mid: data.theme_mid || "#121826",
          theme_end: data.theme_end || "#0B0D12",
          milestone_enabled: data.milestone_enabled,
          milestone_amount: Number(data.milestone_amount) || 0,
          milestone_text: data.milestone_text || "",
        });
      } catch {
        setProfile(null);
      } finally {
        setProfileLoaded(true);
      }
    }

    load();
  }, [apiUrl, username]);

  useEffect(() => {
    if (!apiUrl || !username) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${apiUrl}/api/creator/profile?username=${encodeURIComponent(username)}`);
        const data = await res.json().catch(() => ({} as any));

        setProfile((prev) => {
          if (!prev) return prev;

          const nextThemeStart = data.theme_start || prev.theme_start;
          const nextThemeMid = data.theme_mid || prev.theme_mid;
          const nextThemeEnd = data.theme_end || prev.theme_end;

          const nextMilestoneEnabled = data.milestone_enabled ?? prev.milestone_enabled;
          const nextMilestoneAmount = Number(data.milestone_amount) || prev.milestone_amount || 0;
          const nextMilestoneText = data.milestone_text ?? prev.milestone_text ?? "";

          const changed =
            prev.theme_start !== nextThemeStart ||
            prev.theme_mid !== nextThemeMid ||
            prev.theme_end !== nextThemeEnd ||
            prev.milestone_enabled !== nextMilestoneEnabled ||
            (prev.milestone_amount || 0) !== (nextMilestoneAmount || 0) ||
            (prev.milestone_text || "") !== (nextMilestoneText || "");

          if (!changed) return prev;

          return {
            ...prev,
            theme_start: nextThemeStart,
            theme_mid: nextThemeMid,
            theme_end: nextThemeEnd,
            milestone_enabled: nextMilestoneEnabled,
            milestone_amount: nextMilestoneAmount,
            milestone_text: nextMilestoneText,
          };
        });
      } catch {
        // ignore
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [apiUrl, username]);

  useEffect(() => {
    if (!apiUrl || !username) return;

    async function loadPayments() {
      try {
        const res = await fetch(`${apiUrl}/api/payments/creator/${encodeURIComponent(username)}`);
        const data = await res.json().catch(() => []);
        const nextPayments = Array.isArray(data) ? data : [];

        setPayments(nextPayments);

        if (nextPayments.length > 0) {
          const newest = nextPayments[0];
          if (!newest?.id) return;

          if (!latestSeenPaymentIdRef.current) {
            latestSeenPaymentIdRef.current = newest.id;
            return;
          }

          if (newest.id !== latestSeenPaymentIdRef.current) {
            if (suppressNextLiveToastRef.current) {
              suppressNextLiveToastRef.current = false;
              latestSeenPaymentIdRef.current = newest.id;
              return;
            }

            latestSeenPaymentIdRef.current = newest.id;
            enqueueToast(newest);
          }
        }
      } catch {
        setPayments([]);
      } finally {
        setLoadingPayments(false);
      }
    }

    loadPayments();
    const interval = setInterval(loadPayments, 5000);

    return () => {
      clearInterval(interval);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (successToastTimeoutRef.current) clearTimeout(successToastTimeoutRef.current);
    };
  }, [apiUrl, username, activeToastPayment]);

  useEffect(() => {
    const success = searchParams.get("success");
    if (success !== "true") return;
    if (typeof window === "undefined") return;

    const pendingKey = `everpay_pending_gift_${username}`;
    const pendingNameKey = `everpay_pending_gift_name_${username}`;

    const hadPendingGift = window.localStorage.getItem(pendingKey) === "1";
    if (!hadPendingGift) return;

    const storedName = (window.localStorage.getItem(pendingNameKey) || "").trim();

    suppressNextLiveToastRef.current = true;
    setSuccessToastName(storedName);
    setSuccessToast(true);

    window.localStorage.removeItem(pendingKey);
    window.localStorage.removeItem(pendingNameKey);

    if (successToastTimeoutRef.current) clearTimeout(successToastTimeoutRef.current);
    successToastTimeoutRef.current = setTimeout(() => {
      setSuccessToast(false);
    }, 4000);

    return () => {
      if (successToastTimeoutRef.current) clearTimeout(successToastTimeoutRef.current);
    };
  }, [searchParams, username]);

  async function handlePay() {
    if (!apiUrl) {
      alert("Missing API URL");
      return;
    }
    if (!username) {
      alert("Missing creator username in URL");
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
        const safeSupporterName = anonymous ? "" : supporterName.trim();
        window.localStorage.setItem(`everpay_pending_gift_name_${username}`, safeSupporterName);
      }

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

  const bgStart = profile?.theme_start;
  const bgMid = profile?.theme_mid;
  const bgEnd = profile?.theme_end;

  const totalEarned = payments.reduce((sum, p) => sum + getGiftPence(p), 0) / 100;

  const topSupporters = useMemo(() => {
    if (!Array.isArray(payments) || payments.length === 0) return [];

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

  useEffect(() => {
    if (!milestoneEnabled) {
      setDisplayMilestonePercent(0);
      return;
    }

    const target = Math.max(0, Math.min(100, milestonePercent));

    const interval = setInterval(() => {
      setDisplayMilestonePercent((p) => {
        if (p === target) return p;
        return p < target ? p + 1 : p - 1;
      });
    }, 20);

    return () => clearInterval(interval);
  }, [milestoneEnabled, milestonePercent]);

  if (!username) {
    return <div className="min-h-screen flex items-center justify-center text-white">Creator username missing in URL.</div>;
  }

  if (!profileLoaded) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading creator...</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-white">Creator not found.</div>;
  }

  const ctaStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, ${bgStart}, ${bgMid}, ${bgEnd})`,
  };

  const panelClass =
    "bg-black/45 backdrop-blur-md rounded-3xl border-2 border-white/60 shadow-[0_20px_80px_rgba(0,0,0,0.6)]";

  const fieldClass =
    "w-full rounded-xl bg-[#0B0D12] border-[1.5px] border-white/60 px-3 text-white placeholder-white/50 outline-none focus:border-white/80";

  const rowClass = "bg-black/20 border-[1.5px] border-white/60 rounded-xl";
  const supporterCardClass = "bg-black/20 border-[1.5px] border-white/60 rounded-2xl";

  const toastName = activeToastPayment
    ? activeToastPayment.anonymous
      ? "Someone"
      : activeToastPayment.gift_name?.trim() || "Someone"
    : "";

  const toastAmount = activeToastPayment ? formatGBP(getGiftPence(activeToastPayment)) : "";
  const successNameLabel = successToastName || "there";

  return (
    <div
      className="min-h-screen text-white flex justify-center px-4 py-6 sm:py-8 transition-[background] duration-[600ms] overflow-x-hidden"
      style={{ background: `linear-gradient(to bottom right, ${bgStart}, ${bgMid}, ${bgEnd})` }}
    >
      <div className="w-full max-w-[1550px] space-y-5 sm:space-y-6 px-1 sm:px-0 overflow-x-hidden">
        {successToast && (
          <div className="fixed inset-0 z-[121] flex items-center justify-center px-4 pointer-events-none sm:inset-auto sm:bottom-6 sm:right-6 sm:block sm:px-0">
            <div className="px-4 py-3 rounded-2xl border-[1.5px] border-white/60 bg-black/78 backdrop-blur-xl shadow-2xl text-white min-w-[240px] max-w-[90vw] animate-[fadeInUp_.25s_ease]">
              <p className="text-sm sm:text-[15px] font-semibold">
                🎁 Thank you {successNameLabel} — your gift to {creatorFirstName} was sent
              </p>
              <p className="text-[11px] sm:text-xs text-white/65 mt-1">Added to Recent Gifts</p>
            </div>
          </div>
        )}

        {activeToastPayment && (
          <div className="fixed left-1/2 -translate-x-1/2 bottom-5 sm:left-auto sm:right-6 sm:translate-x-0 sm:bottom-6 z-[120] pointer-events-none">
            <div className="px-4 py-3 rounded-2xl border-[1.5px] border-white/60 bg-black/75 backdrop-blur-xl shadow-2xl text-white min-w-[220px] max-w-[88vw] animate-[fadeInUp_.25s_ease]">
              <p className="text-sm sm:text-[15px] font-semibold truncate">
                🔥 {toastName} just gifted {toastAmount}
              </p>
              <p className="text-[11px] sm:text-xs text-white/65 mt-1">Added to Recent Gifts</p>
            </div>
          </div>
        )}

        <section className={`w-full ${panelClass} px-6 sm:px-9 py-5 sm:py-6 overflow-x-hidden`}>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
              <button
                type="button"
                onClick={() => profile.avatar_url && setShowAvatar(true)}
                title="View profile picture"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[4px] border-white/40 bg-white/10 flex items-center justify-center overflow-hidden shadow-xl shrink-0 cursor-pointer hover:opacity-90 transition active:scale-[0.98]"
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
                              className="shrink-0 inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/60 text-xs text-white/90 hover:bg-white/15 transition"
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
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/60 text-xs text-white/90 hover:bg-white/15 transition"
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
          <section className={`${panelClass} px-6 sm:px-9 py-5 overflow-x-hidden`}>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/70 mb-1">Goal</p>

            {profile.milestone_text && <p className="text-sm font-semibold mb-1">{profile.milestone_text}</p>}

            <p className="text-[13px] text-white/80 mb-3">
              £{totalEarned.toLocaleString("en-GB", { minimumFractionDigits: 2 })} of £
              {milestoneTarget.toLocaleString("en-GB", { minimumFractionDigits: 2 })} raised
            </p>

            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-emerald-400 to-lime-300"
                style={{ width: `${displayMilestonePercent}%` }}
              />
            </div>

            <p className="mt-1 text-[11px] text-white/65">
              {displayMilestonePercent >= 100 ? "Goal reached 🎉 — you smashed it!" : `${displayMilestonePercent}% complete`}
            </p>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-7 sm:gap-8 items-start lg:items-stretch overflow-x-hidden">
          <section className={`${panelClass} p-6 sm:p-9 flex flex-col min-h-0 overflow-hidden lg:h-[760px]`}>
            <h2 className="text-xl sm:text-[30px] font-semibold mb-4">Send a Gift</h2>

            <div className="flex flex-wrap gap-2 mb-4">
              {presetAmounts.map((v) => {
                const selected = Number(amount) === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className={`px-5 py-2.5 rounded-full border text-sm font-semibold transition ${
                      selected ? "bg-white text-black border-white/80" : "bg-white/10 text-white border-[1.5px] border-white/60 hover:bg-white/15"
                    }`}
                  >
                    £{v}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 mb-4 w-full min-w-0">
              <span className="text-2xl font-bold shrink-0">£</span>
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
                className={`${fieldClass} min-w-0 flex-1 py-3.5 text-base`}
              />
            </div>

            <input
              type="text"
              value={supporterName}
              onChange={(e) => setSupporterName(e.target.value)}
              placeholder="Your name (optional)"
              disabled={anonymous}
              className={`${fieldClass} mb-4 py-3.5`}
            />

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 120))}
              placeholder="Leave a message (optional)"
              rows={3}
              style={{ minHeight: 100, height: 100 }}
              className={`${fieldClass} mb-4 py-3 resize-none overflow-hidden leading-5`}
            />

            <label className="flex items-center gap-2 text-sm mb-4 cursor-pointer">
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
              <span>Gift anonymously</span>
            </label>

            <button
              className="w-full py-4 rounded-xl text-white font-semibold active:scale-[0.98] transition mb-2 shadow-xl border-[2.5px] border-white hover:border-white hover:opacity-[0.97]"
              style={ctaStyle}
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? "Redirecting..." : "Send a Gift 🎁"}
            </button>

            <p className="text-center text-[12px] text-white/85">Instant bank payment • No card details needed</p>
            <p className="text-center text-[11px] text-white/65 mt-1 tracking-wide">Powered by Stripe</p>

            <div className="mt-4 lg:mt-auto pt-1 pb-0 hidden lg:flex flex-col items-center gap-2 opacity-95 hover:opacity-100 transition">
              <div className="bg-white rounded-2xl p-3 border-2 border-black/20 shadow-xl flex items-center justify-center">
                {pageUrl ? (
                  <QRCode value={pageUrl} size={132} bgColor="#ffffff" fgColor="#000000" />
                ) : (
                  <span className="text-black/70 text-xs">QR unavailable</span>
                )}
              </div>

              <p className="text-[13px] text-white/85">Scan to gift</p>
              <p className="text-[11px] text-white/65 tracking-wide">Powered by EverPay</p>
            </div>
          </section>

          <section className={`${panelClass} p-6 sm:p-9 flex flex-col min-h-0 overflow-hidden lg:h-[760px]`}>
            <div className="mb-4 flex items-center justify-start lg:justify-between">
              <h2 className="text-xl sm:text-[30px] font-semibold">Recent Gifts 🎁</h2>
            </div>

            {loadingPayments ? (
              <p className="text-center text-white/70 text-sm">Loading...</p>
            ) : payments.length === 0 ? (
              <p className="text-center text-white/70 text-sm">No gifts yet — be the first! 🎁</p>
            ) : (
              <div className="w-full overflow-y-auto pr-1 everpay-scroll mb-4 space-y-2 max-h-[300px] sm:max-h-[400px] lg:max-h-none lg:flex-1 lg:min-h-0">
                {payments.map((p) => {
                  const displayName = p.anonymous ? "Anonymous" : p.gift_name?.trim() ? p.gift_name : "Someone";
                  const giftPence = getGiftPence(p);

                  return (
                    <div key={p.id} className={`${rowClass} px-4 py-3 text-sm flex justify-between gap-3 shadow-sm overflow-hidden`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[14px] sm:text-[15px] truncate">
                          {displayName} gifted {formatGBP(giftPence)}
                        </p>
                        {p.gift_message && (
                          <p className="text-[11px] sm:text-xs opacity-80 mt-1 italic line-clamp-2">“{p.gift_message}”</p>
                        )}
                      </div>

                      <p className="text-[10px] opacity-60 whitespace-nowrap mt-1">{new Date(p.created_at).toLocaleDateString()}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {!loadingPayments && topSupporters.length > 0 && (
              <>
                <div className="lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowTopSupportersMobile((v) => !v)}
                    className={`w-full ${supporterCardClass} px-4 py-3 flex items-center justify-between`}
                    aria-expanded={showTopSupportersMobile}
                  >
                    <div className="text-left">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">Top Supporters</p>
                      <p className="text-[11px] text-white/55">This month</p>
                    </div>
                    <span className="text-sm text-white/80">{showTopSupportersMobile ? "Hide" : "Show"}</span>
                  </button>

                  {showTopSupportersMobile && (
                    <div className={`mt-3 ${supporterCardClass} p-4`}>
                      <div className="space-y-2">
                        {topSupporters.map((s, idx) => (
                          <div
                            key={`${s.label}-${idx}`}
                            className={`${rowClass} flex items-center justify-between gap-3 px-4 py-3 overflow-hidden`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-white/10 border-[1.5px] border-white/60 flex items-center justify-center text-[12px] font-bold text-white/85 shrink-0">
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

                <div className={`hidden lg:block ${supporterCardClass} p-4`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/70">Top Supporters</p>
                    <p className="text-[11px] text-white/55">This month</p>
                  </div>

                  <div className="space-y-2">
                    {topSupporters.map((s, idx) => (
                      <div key={`${s.label}-${idx}`} className={`${rowClass} flex items-center justify-between gap-3 px-4 py-3`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-white/10 border-[1.5px] border-white/60 flex items-center justify-center text-[12px] font-bold text-white/85 shrink-0">
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

        <section className={`lg:hidden ${panelClass} px-6 py-5 overflow-hidden`}>
          <button
            type="button"
            onClick={() => setShowMobileQR((v) => !v)}
            className="w-full flex items-center justify-between"
            aria-expanded={showMobileQR}
          >
            <div className="text-left">
              <p className="text-base font-semibold text-white">QR code</p>
              <p className="text-[11px] text-white/70">Show to let someone nearby scan and gift</p>
            </div>

            <span className="text-white/80 text-sm">{showMobileQR ? "Hide" : "Show"}</span>
          </button>

          {showMobileQR && (
            <>
              <div className="mt-4 mx-auto w-full max-w-[260px] bg-white rounded-2xl p-3 border-2 border-black/20 shadow-xl flex items-center justify-center">
                {pageUrl ? (
                  <QRCode value={pageUrl} size={190} bgColor="#ffffff" fgColor="#000000" />
                ) : (
                  <span className="text-black/70 text-xs">QR unavailable</span>
                )}
              </div>

              <p className="mt-3 text-center text-xs text-white/80">Scan to gift</p>
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
              className="relative w-full max-w-md sm:max-w-lg rounded-3xl border-2 border-white/60 bg-black/40 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowAvatar(false)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/10 border-2 border-white/60 text-white/90 hover:bg-white/15 transition flex items-center justify-center"
                aria-label="Close"
                type="button"
              >
                ✕
              </button>

              <div className="p-4 sm:p-6">
                <div className="w-full aspect-square rounded-2xl bg-white/5 border-2 border-white/60 overflow-hidden flex items-center justify-center">
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
            scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.05);
          }
          .everpay-scroll::-webkit-scrollbar {
            width: 5px;
          }
          .everpay-scroll::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 999px;
          }
          .everpay-scroll::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.3);
            border-radius: 999px;
          }
          .everpay-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.42);
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
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
