// ~/everpay-frontend/src/app/creator/(public)/[username]/CreatorClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return { label: "YouTube", short: "YT" };
  if (lower.includes("facebook.com")) return { label: "Facebook", short: "FB" };
  if (lower.includes("x.com") || lower.includes("twitter.com")) return { label: "X", short: "X" };
  return { label: "Website", short: "WWW" };
}

// Normalize social links from API into a clean clickable array
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

// TikTok-ish verified badge (subtle)
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

  // ✅ CRITICAL FIX: fallback to route params on client
  const params = useParams<{ username?: string | string[] }>();
  const routeUsernameRaw = params?.username;
  const routeUsername =
    typeof routeUsernameRaw === "string"
      ? routeUsernameRaw
      : Array.isArray(routeUsernameRaw)
      ? routeUsernameRaw[0]
      : "";

  const username = String(propUsername || routeUsername || "").trim();

  // Always resolve a valid public URL (works on Vercel + locally)
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

  const [celebration, setCelebration] = useState<{
    amount: number;
    name: string;
    message?: string | null;
  } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // ✅ Profile picture modal
  const [showAvatar, setShowAvatar] = useState(false);

  // ✅ Animated milestone percent (smooth climb)
  const [displayMilestonePercent, setDisplayMilestonePercent] = useState(0);

  // ✅ Mobile QR collapsible (default collapsed)
  const [showMobileQR, setShowMobileQR] = useState(false);

  // Preset amounts (GBP) — no Custom
  const presetAmounts = [2, 5, 10, 20, 50];

  // Load creator profile (+ milestone)
  useEffect(() => {
    async function load() {
      try {
        if (!apiUrl) return;
        if (!username) return;

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
          theme_start: data.theme_start || "#ff0080",
          theme_mid: data.theme_mid || "#7c3aed",
          theme_end: data.theme_end || "#2563eb",
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

  // Refresh colours & milestone every 3 seconds (but never overwrite with undefined)
  useEffect(() => {
    if (!apiUrl) return;
    if (!username) return;

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

  // Load payments (and keep refreshing)
  useEffect(() => {
    if (!apiUrl) return;
    if (!username) return;

    async function loadPayments() {
      try {
        const res = await fetch(`${apiUrl}/api/payments/creator/${encodeURIComponent(username)}`);
        const data = await res.json().catch(() => []);
        setPayments(Array.isArray(data) ? data : []);
      } catch {
        setPayments([]);
      } finally {
        setLoadingPayments(false);
      }
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

  // Celebration logic – runs after we have payments
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!username) return;
    if (!Array.isArray(payments) || payments.length === 0) return;

    const pendingKey = `everpay_pending_gift_${username}`;
    const lastKey = `everpay_last_celebrated_${username}`;

    const pending = window.localStorage.getItem(pendingKey);
    if (pending !== "1") return;

    const latest = payments[0] ?? null;
    if (!latest) return;

    const lastCelebratedId = window.localStorage.getItem(lastKey);
    if (lastCelebratedId === latest.id) {
      window.localStorage.removeItem(pendingKey);
      return;
    }

    const displayName = latest.anonymous
      ? "Anonymous"
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

    const timeout = setTimeout(() => setShowCelebration(false), 3500);
    return () => clearTimeout(timeout);
  }, [payments, username]);

  const bgStart = profile?.theme_start;
  const bgMid = profile?.theme_mid;
  const bgEnd = profile?.theme_end;

  const totalEarned = payments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100;

  // ✅ Top Supporters — top 4
  const topSupporters = useMemo(() => {
    if (!Array.isArray(payments) || payments.length === 0) return [];

    const map = new Map<string, { label: string; totalPence: number; gifts: number }>();

    for (const p of payments) {
      const isAnon = !!p.anonymous;
      const rawName = (p.gift_name || "").trim();

      let label = "Someone";
      if (isAnon) label = "Anonymous";
      else if (rawName) label = rawName;

      const key = isAnon ? "__anonymous__" : rawName ? rawName.toLowerCase() : "__someone__";

      const prev = map.get(key);
      if (prev) {
        prev.totalPence += p.amount || 0;
        prev.gifts += 1;
      } else {
        map.set(key, { label, totalPence: p.amount || 0, gifts: 1 });
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

  // ✅ Animate milestone percent smoothly instead of jumping
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
    return <div className="min-h-screen flex items-center justify-center text-white">Loading creator…</div>;
  }

  if (!profile) {
    return <div className="min-h-screen flex items-center justify-center text-white">Creator not found.</div>;
  }

  const ctaStyle: React.CSSProperties = {
    background: `linear-gradient(90deg, ${bgStart}, ${bgMid}, ${bgEnd})`,
  };

  return (
    <div
      className="min-h-screen text-white flex justify-center px-4 py-6 sm:py-8 transition-[background] duration-[600ms]"
      style={{
        background: `linear-gradient(to bottom right, ${bgStart}, ${bgMid}, ${bgEnd})`,
      }}
    >
      <div className="w-full max-w-6xl space-y-4 sm:space-y-6 px-1 sm:px-0 overflow-x-hidden">
        {/* Header (tighter) */}
        <section className="w-full bg-black/30 rounded-3xl border border-white/20 backdrop-blur-xl px-5 sm:px-8 py-4 sm:py-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6">
            <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <div
                className="w-14 h-14 sm:w-20 sm:h-20 rounded-full border-[4px] border-white/40 bg-white/10 flex items-center justify-center overflow-hidden shadow-xl shrink-0 cursor-pointer hover:opacity-90 transition"
                onClick={() => profile.avatar_url && setShowAvatar(true)}
                title="View profile picture"
              >
                {profile.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile picture" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xl sm:text-2xl font-bold">
                    {firstChar(profile.profile_name) || firstChar(username)}
                  </span>
                )}
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
                    {profile.profile_name || "EVER PAY"}
                  </h1>
                  <VerifiedBadge />
                </div>

                {/* Socials */}
                {Array.isArray(profile.social_links) && profile.social_links.length > 0 && (
                  <>
                    <div className="sm:hidden mt-2 -mx-1 px-1 overflow-x-auto whitespace-nowrap">
                      <div className="inline-flex gap-2">
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
              </div>
            </div>
          </div>
        </section>

        {/* Milestone bar (slightly higher contrast) */}
        {milestoneEnabled && (
          <section className="bg-black/30 rounded-3xl border border-white/20 backdrop-blur-xl px-5 py-4 shadow-2xl">
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
              {displayMilestonePercent >= 100
                ? "Goal reached 🎉 — you smashed it!"
                : `${displayMilestonePercent}% complete`}
            </p>
          </section>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 items-start lg:items-stretch">
          {/* LEFT — Send Gift */}
          <section className="bg-black/30 rounded-3xl border border-white/20 backdrop-blur-xl p-5 sm:p-8 shadow-2xl flex flex-col min-h-0 h-auto max-h-[360px] lg:h-[670px] lg:max-h-none overflow-hidden">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 flex items-center gap-2">Send a Gift</h2>

            {/* Amount */}
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xl font-bold">£</span>
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
                className="flex-1 rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-base text-white placeholder-white/60 outline-none focus:border-white/35"
              />
            </div>

            {/* Preset amounts (bigger, clearer, no custom) */}
            <div className="flex flex-wrap gap-2 mb-4">
              {presetAmounts.map((v) => {
                const selected = Number(amount) === v;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setAmount(String(v))}
                    className={`px-4 py-2 rounded-full border text-sm font-semibold transition ${
                      selected
                        ? "bg-white text-black border-white/70"
                        : "bg-white/10 text-white border-white/20 hover:bg-white/15"
                    }`}
                  >
                    £{v}
                  </button>
                );
              })}
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
              className="w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/60 outline-none h-24 resize-none mb-4 shrink-0 focus:border-white/35"
            />

            <label className="flex items-center gap-2 text-xs sm:text-sm mb-4 cursor-pointer">
              <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
              <span>Gift anonymously</span>
            </label>

            {/* Branded CTA */}
            <button
              className="w-full py-3 rounded-xl text-white font-semibold active:scale-[0.98] transition mb-2 shadow-xl border border-white/15 hover:opacity-[0.96]"
              style={ctaStyle}
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? "Redirecting…" : "Send Gift 🎁"}
            </button>

            {/* Trust copy tuned for Pay by Bank */}
            <p className="text-center text-[11px] text-white/80">Pay by bank • No card details needed</p>
            <p className="text-center text-[11px] text-white/60 mt-1 tracking-wide">Secure checkout powered by Stripe</p>

            {/* Desktop QR (slightly less dominant) */}
            <div className="mt-auto pt-4 pb-2 hidden lg:flex flex-col items-center gap-2">
              <div className="w-[170px] h-[170px] bg-white rounded-2xl p-3 border border-black/20 shadow-xl flex items-center justify-center">
                {pageUrl ? (
                  <QRCode value={pageUrl} size={140} bgColor="#ffffff" fgColor="#000000" />
                ) : (
                  <span className="text-black/70 text-xs">QR unavailable</span>
                )}
              </div>

              <p className="text-xs text-white/80">Scan to support me</p>
              <p className="text-[11px] text-white/65 tracking-wide">Powered by EverPay</p>
            </div>
          </section>

          {/* RIGHT — Recent Gifts (first) + Top Supporters */}
          <section className="bg-black/30 rounded-3xl border border-white/20 backdrop-blur-xl p-5 sm:p-8 shadow-2xl flex flex-col min-h-0 h-auto max-h-[360px] lg:h-[670px] lg:max-h-none">
            {/* Recent Gifts FIRST (trust) */}
            <div className="mb-4 flex items-center justify-start lg:justify-between">
              <h2 className="text-lg sm:text-xl font-semibold">Recent Gifts 🎁</h2>
            </div>

            {loadingPayments ? (
              <p className="text-center text-white/70 text-sm">Loading…</p>
            ) : payments.length === 0 ? (
              <p className="text-center text-white/70 text-sm">No gifts yet — be the first! 🎁</p>
            ) : (
              <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1 everpay-scroll mb-4">
                {payments.map((p) => {
                  const displayName = p.anonymous
                    ? "Anonymous"
                    : p.gift_name?.trim()
                    ? p.gift_name!
                    : "Someone";

                  return (
                    <div
                      key={p.id}
                      className="bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm flex justify-between gap-3 shadow-sm"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-[13px] sm:text-sm">
                          {displayName} gifted {formatGBP(p.amount)}
                        </p>
                        {p.gift_message && (
                          <p className="text-[11px] sm:text-xs opacity-80 mt-1 italic">“{p.gift_message}”</p>
                        )}
                      </div>

                      <p className="text-[10px] opacity-60 whitespace-nowrap mt-1">
                        {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Top Supporters SECOND */}
            {!loadingPayments && topSupporters.length > 0 && (
              <div className="rounded-2xl bg-white/6 border border-white/15 p-4">
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
            )}
          </section>
        </div>

        {/* ✅ MOBILE QR — collapsible (default collapsed) */}
        <section className="lg:hidden bg-black/30 rounded-3xl border border-white/20 backdrop-blur-xl px-5 py-4 shadow-2xl">
          <button
            type="button"
            onClick={() => setShowMobileQR((v) => !v)}
            className="w-full flex items-center justify-between"
            aria-expanded={showMobileQR}
          >
            <div className="text-left">
              <p className="text-base font-semibold text-white">QR code</p>
              <p className="text-[11px] text-white/70">Show to let someone scan and gift</p>
            </div>

            <span className="text-white/80 text-sm">{showMobileQR ? "Hide" : "Show"}</span>
          </button>

          {showMobileQR && (
            <>
              <div className="mt-4 mx-auto w-full max-w-[220px] bg-white rounded-2xl p-3 border border-black/20 shadow-xl flex items-center justify-center">
                {pageUrl ? (
                  <QRCode value={pageUrl} size={170} bgColor="#ffffff" fgColor="#000000" />
                ) : (
                  <span className="text-black/70 text-xs">QR unavailable</span>
                )}
              </div>

              <p className="mt-3 text-center text-xs text-white/80">Scan to support me</p>
              <p className="mt-1 text-center text-[11px] text-white/65 tracking-wide">Powered by EverPay</p>
            </>
          )}
        </section>

        {/* ✅ Avatar modal */}
        {showAvatar && profile.avatar_url && (
          <div
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShowAvatar(false)}
            role="dialog"
            aria-modal="true"
          >
            <div
              className="relative w-full max-w-md sm:max-w-lg rounded-3xl border border-white/15 bg-black/30 shadow-2xl overflow-hidden"
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

        {/* ✅ Local thin scrollbar styling (scoped) */}
        <style jsx global>{`
          .everpay-scroll {
            scrollbar-width: thin; /* Firefox */
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
        `}</style>
      </div>
    </div>
  );
}
