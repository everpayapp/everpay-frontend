"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Payment = {
  id: string;
  amount: number; // pence
  gift_name?: string;
  gift_message?: string;
  anonymous?: number; // 0/1
  created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Helper: format GBP nicely (from pounds)
const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
  }).format(value);

const formatGBPFromPence = (pence: number) => formatGBP((pence || 0) / 100);

type RangeKey = "today" | "7d" | "30d" | "all";

function safeGetLocalStorage(key: string): string | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetLocalStorage(key: string, value: string) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  } catch {
    // ignore (prevents crash in strict/privacy modes)
  }
}

export default function CreatorPaymentsPage() {
  // 🔐 AUTH
  const { status, data: session } = useSession();
  const router = useRouter();

  // ✅ SESSION-BASED USERNAME
  const username = session?.user?.email?.split("@")[0] || "lee";

  // STATE
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // UI
  const [range, setRange] = useState<RangeKey>("30d");
  const [query, setQuery] = useState("");
  const [anonymousOnly, setAnonymousOnly] = useState(false);
  const [selected, setSelected] = useState<Payment | null>(null);

  // “New” highlighting (safe)
  const lastSeenKey = `everpay:lastSeenPayments:${username}`;
  const [lastSeen, setLastSeen] = useState<number>(0);
  const lastSeenRef = useRef<number>(0);

  // 🔐 Redirect if logged out
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Load lastSeen safely
  useEffect(() => {
    const raw = safeGetLocalStorage(lastSeenKey);
    const v = raw ? Number(raw) : 0;
    const safe = Number.isFinite(v) ? v : 0;
    setLastSeen(safe);
    lastSeenRef.current = safe;
  }, [lastSeenKey]);

  // Load payments (with refresh loop)
  useEffect(() => {
    if (status !== "authenticated") return;

    let isMounted = true;

    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/payments/${encodeURIComponent(username)}`
        );
        const data = await res.json();
        if (!isMounted) return;
        setPayments(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load creator payments", e);
        if (isMounted) setPayments([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [status, username]);

  // Update lastSeen after initial load (safe)
  useEffect(() => {
    if (loading) return;
    const now = Date.now();
    safeSetLocalStorage(lastSeenKey, String(now));
    setLastSeen(now);
    lastSeenRef.current = now;
  }, [loading, lastSeenKey]);

  // ⛔ Wait for auth resolution
  if (status === "loading") return null;

  // helpers
  const safeTime = (iso: string) => {
    const t = new Date(iso).getTime();
    return Number.isFinite(t) ? t : 0;
  };

  const startOfToday = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  // Today total
  const todaysTotalPence = useMemo(() => {
    return payments
      .filter((p) => safeTime(p.created_at) >= startOfToday)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }, [payments, startOfToday]);

  const rangeStart = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    if (range === "today") {
      start.setHours(0, 0, 0, 0);
      return start.getTime();
    }
    if (range === "7d") {
      start.setDate(now.getDate() - 7);
      return start.getTime();
    }
    if (range === "30d") {
      start.setDate(now.getDate() - 30);
      return start.getTime();
    }
    return 0;
  }, [range]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return payments
      .filter((p) => safeTime(p.created_at) >= rangeStart)
      .filter((p) => (!anonymousOnly ? true : !!p.anonymous))
      .filter((p) => {
        if (!q) return true;
        const name = (p.anonymous ? "anonymous" : p.gift_name || "someone").toLowerCase();
        const msg = (p.gift_message || "").toLowerCase();
        const amt = formatGBPFromPence(p.amount).toLowerCase();
        return name.includes(q) || msg.includes(q) || amt.includes(q);
      })
      .sort((a, b) => safeTime(b.created_at) - safeTime(a.created_at));
  }, [payments, rangeStart, anonymousOnly, query]);

  const summary = useMemo(() => {
    const count = filtered.length;
    const totalPence = filtered.reduce((sum, p) => sum + (p.amount || 0), 0);
    const avgPence = count > 0 ? Math.round(totalPence / count) : 0;
    return { count, totalPence, avgPence };
  }, [filtered]);

  const isNewPayment = (p: Payment) => {
    if (!lastSeen) return false;
    return safeTime(p.created_at) > lastSeen;
  };

  const exportCSV = () => {
    try {
      const rows = [
        ["date", "supporter", "amount_gbp", "anonymous", "message", "id"],
        ...filtered.map((p) => {
          const date = new Date(p.created_at).toISOString();
          const supporter = p.anonymous ? "Anonymous" : p.gift_name || "Someone";
          const amount = (p.amount / 100).toFixed(2);
          const anon = p.anonymous ? "1" : "0";
          const msg = (p.gift_message || "").replace(/\r?\n/g, " ").trim();
          return [date, supporter, amount, anon, msg, p.id];
        }),
      ];

      const csv = rows
        .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `everpay-payments-${username}-${range}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("CSV export failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e2238] via-[#081624] to-[#050b12]">
      <main className="max-w-4xl mx-auto mt-10 px-4 text-white pb-28">
        <h1 className="text-2xl font-semibold mb-6">Creator Payments</h1>

        {/* SUMMARY + RANGE */}
        <div className="mb-6 bg-black/40 border border-white/10 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm uppercase text-white/60 mb-1">Today</p>
              <p className="text-4xl font-bold">{formatGBPFromPence(todaysTotalPence)}</p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center md:justify-end">
              {(
                [
                  ["today", "Today"],
                  ["7d", "7 Days"],
                  ["30d", "30 Days"],
                  ["all", "All"],
                ] as Array<[RangeKey, string]>
              ).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setRange(k)}
                  className={[
                    "px-4 py-2 rounded-xl text-sm border",
                    range === k
                      ? "bg-white/10 border-white/20"
                      : "bg-black/20 border-white/10 hover:border-white/20",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-5">
            <div className="bg-black/35 border border-white/10 rounded-2xl p-4">
              <p className="text-xs uppercase text-white/60">Total (range)</p>
              <p className="text-xl font-semibold">{formatGBPFromPence(summary.totalPence)}</p>
            </div>
            <div className="bg-black/35 border border-white/10 rounded-2xl p-4">
              <p className="text-xs uppercase text-white/60">Payments</p>
              <p className="text-xl font-semibold">{summary.count}</p>
            </div>
            <div className="bg-black/35 border border-white/10 rounded-2xl p-4">
              <p className="text-xs uppercase text-white/60">Average</p>
              <p className="text-xl font-semibold">{formatGBPFromPence(summary.avgPence)}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mt-5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search supporter, message, amount…"
              className="flex-1 bg-black/55 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-white/20"
            />

            <button
              onClick={() => setAnonymousOnly((v) => !v)}
              className={[
                "px-4 py-3 rounded-xl text-sm border whitespace-nowrap",
                anonymousOnly
                  ? "bg-white/10 border-white/20"
                  : "bg-black/30 border-white/10 hover:border-white/20",
              ].join(" ")}
            >
              {anonymousOnly ? "Anonymous: ON" : "Anonymous: OFF"}
            </button>

            <button
              onClick={exportCSV}
              className="px-4 py-3 rounded-xl text-sm bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold whitespace-nowrap"
            >
              Export CSV
            </button>
          </div>

          <p className="text-xs text-white/45 mt-3">
            Status is shown as <span className="text-white/70">Completed</span> (Stripe-confirmed). Payout status can be added later.
          </p>
        </div>

        {/* LIST */}
        {loading ? (
          <p className="text-white/70">Loading payments…</p>
        ) : filtered.length === 0 ? (
          <p className="text-white/70">No payments found for this range.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const supporter = p.anonymous ? "Anonymous" : p.gift_name || "Someone";
              const dateStr = new Date(p.created_at).toLocaleDateString("en-GB");
              const isNew = isNewPayment(p);

              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={[
                    "w-full text-left bg-black/40 border rounded-xl p-4 flex justify-between gap-4",
                    isNew ? "border-cyan-400/40" : "border-white/10",
                    "hover:border-white/20",
                  ].join(" ")}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{formatGBPFromPence(p.amount)}</p>

                      {isNew && (
                        <span className="text-[11px] px-2 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-200">
                          New
                        </span>
                      )}

                      <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                        Completed
                      </span>
                    </div>

                    <p className="text-xs text-white/70 truncate mt-1">
                      {supporter}
                      {p.gift_message ? (
                        <span className="text-white/45"> — “{p.gift_message}”</span>
                      ) : null}
                    </p>
                  </div>

                  <div className="text-xs text-white/60 whitespace-nowrap">{dateStr}</div>
                </button>
              );
            })}
          </div>
        )}

        {/* MODAL */}
        {selected && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
            <div className="w-full max-w-lg bg-[#0b111a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-white/60">Payment details</p>
                  <p className="text-lg font-semibold">{formatGBPFromPence(selected.amount)}</p>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="text-white/60 hover:text-white text-sm px-3 py-2 rounded-xl border border-white/10 bg-white/5"
                >
                  Close
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="bg-black/35 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs uppercase text-white/60">Supporter</p>
                  <p className="text-sm mt-1">
                    {selected.anonymous ? "Anonymous" : selected.gift_name || "Someone"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-black/35 border border-white/10 rounded-2xl p-4">
                    <p className="text-xs uppercase text-white/60">Date</p>
                    <p className="text-sm mt-1">
                      {new Date(selected.created_at).toLocaleString("en-GB")}
                    </p>
                  </div>

                  <div className="bg-black/35 border border-white/10 rounded-2xl p-4">
                    <p className="text-xs uppercase text-white/60">Status</p>
                    <p className="text-sm mt-1">Completed</p>
                  </div>
                </div>

                <div className="bg-black/35 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs uppercase text-white/60">Message</p>
                  <p className="text-sm mt-1 text-white/80">
                    {selected.gift_message ? `“${selected.gift_message}”` : "No message"}
                  </p>
                </div>

                <div className="bg-black/35 border border-white/10 rounded-2xl p-4">
                  <p className="text-xs uppercase text-white/60">Reference</p>
                  <p className="text-xs mt-1 text-white/60 break-all">{selected.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
