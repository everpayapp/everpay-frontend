// ~/everpay-frontend/src/app/creator/payments/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Payment = {
  id: string;
  amount: number;
  gift_name?: string;
  gift_message?: string;
  anonymous?: number;
  created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);

type RangeKey = "today" | "7d" | "30d" | "all";

export default function CreatorPaymentsPage() {
  const { status, data: session } = useSession();
  const router = useRouter();

  const username: string = String(
    (session?.user as any)?.username ||
      session?.user?.email?.split("@")?.[0] ||
      "lee"
  );

  const PAGE_BG = "#0B0D12";
  const PANEL =
    "bg-black/25 rounded-3xl border border-white/18 shadow-[0_18px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/10";

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const [range, setRange] = useState<RangeKey>("today");
  const [search, setSearch] = useState("");
  const [anonymousOnly, setAnonymousOnly] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/payments/creator/${encodeURIComponent(username)}`
        );
        const data = await res.json();
        if (!mountedRef.current) return;
        setPayments(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load creator payments", e);
      } finally {
        if (!mountedRef.current) return;
        setLoading(false);
      }
    }

    load();
  }, [status, username]);

  if (status === "loading") return null;

  const now = new Date();

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOf7d = new Date(now);
  startOf7d.setDate(startOf7d.getDate() - 7);

  const startOf30d = new Date(now);
  startOf30d.setDate(startOf30d.getDate() - 30);

  const rangeStart =
    range === "today"
      ? startOfToday
      : range === "7d"
      ? startOf7d
      : range === "30d"
      ? startOf30d
      : null;

  const withinRange = (p: Payment) => {
    if (!rangeStart) return true;
    const d = new Date(p.created_at);
    return d >= rangeStart;
  };

  const matchesSearch = (p: Payment) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const supporter = (
      p.anonymous ? "anonymous" : p.gift_name || "someone"
    ).toLowerCase();
    const message = (p.gift_message || "").toLowerCase();
    const amount = (p.amount / 100).toFixed(2);

    return (
      supporter.includes(q) ||
      message.includes(q) ||
      amount.includes(q) ||
      p.created_at.toLowerCase().includes(q)
    );
  };

  const filtered = payments
    .filter(withinRange)
    .filter((p) => (anonymousOnly ? !!p.anonymous : true))
    .filter(matchesSearch);

  const totalRange = filtered.reduce((sum, p) => sum + p.amount, 0) / 100;
  const avg = filtered.length > 0 ? totalRange / filtered.length : 0;

  const todaysTotal =
    payments
      .filter((p) => new Date(p.created_at) >= startOfToday)
      .reduce((sum, p) => sum + p.amount, 0) / 100;

  const exportCSV = () => {
    const rows = [
      ["date", "supporter", "amount_gbp", "message", "status"],
      ...filtered.map((p) => [
        new Date(p.created_at).toISOString(),
        p.anonymous ? "Anonymous" : p.gift_name || "Someone",
        (p.amount / 100).toFixed(2),
        (p.gift_message || "").replaceAll('"', '""'),
        "Completed",
      ]),
    ];

    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell)}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `everpay-payments-${username}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const chipBase = "shrink-0 px-3 py-1.5 rounded-lg text-xs border transition";
  const chipOn = "bg-white/10 border-white/20";
  const chipOff =
    "bg-transparent border-white/10 text-white/70 hover:text-white";

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAGE_BG }}>
    <main className="max-w-7xl mx-auto pt-6 sm:pt-10 px-6 text-white pb-24">
        <h1 className="text-2xl font-semibold mb-6">Creator Payments</h1>

        <div className={`mb-8 ${PANEL} p-6`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <p className="text-sm uppercase text-white/60 mb-1">Today</p>
                <p className="text-4xl font-bold">{formatGBP(todaysTotal)}</p>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap -mx-2 px-2 pb-1">
                <button
                  onClick={() => setRange("today")}
                  className={`${chipBase} ${range === "today" ? chipOn : chipOff}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setRange("7d")}
                  className={`${chipBase} ${range === "7d" ? chipOn : chipOff}`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setRange("30d")}
                  className={`${chipBase} ${range === "30d" ? chipOn : chipOff}`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setRange("all")}
                  className={`${chipBase} ${range === "all" ? chipOn : chipOff}`}
                >
                  All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-black/20 border border-white/12 rounded-xl p-4">
                <p className="text-[11px] uppercase text-white/60 mb-1">
                  Total (range)
                </p>
                <p className="text-lg font-semibold">{formatGBP(totalRange)}</p>
              </div>

              <div className="bg-black/20 border border-white/12 rounded-xl p-4">
                <p className="text-[11px] uppercase text-white/60 mb-1">
                  Payments
                </p>
                <p className="text-lg font-semibold">{filtered.length}</p>
              </div>

              <div className="bg-black/20 border border-white/12 rounded-xl p-4">
                <p className="text-[11px] uppercase text-white/60 mb-1">
                  Average
                </p>
                <p className="text-lg font-semibold">{formatGBP(avg)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search supporter, message, amount…"
                className="w-full sm:flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none"
              />

              <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap -mx-2 px-2 pb-1 sm:overflow-visible sm:whitespace-normal sm:mx-0 sm:px-0 sm:pb-0">
                <button
                  onClick={() => setAnonymousOnly((v) => !v)}
                  className={`shrink-0 px-3 py-2 rounded-xl text-xs border ${
                    anonymousOnly
                      ? "bg-white/10 border-white/20"
                      : "bg-white/10 border-white/20 text-white/70 hover:text-white"
                  }`}
                >
                  Anonymous: {anonymousOnly ? "ON" : "OFF"}
                </button>

                <button
                  onClick={exportCSV}
                  className="shrink-0 px-3 py-2 rounded-xl text-xs bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold"
                  >
                  
                  Export CSV
                </button>
              </div>
            </div>

          </div>
        </div>

        {loading ? (
          <p className="text-white/70">Loading payments…</p>
        ) : filtered.length === 0 ? (
          <p className="text-white/70">No payments found for this filter.</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-black/20 border border-white/12 rounded-xl p-4 flex justify-between gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{formatGBP(p.amount / 100)}</p>

                    <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70">
                      Completed
                    </span>
                  </div>

                  <p className="text-xs text-white/70 truncate">
                    {p.anonymous ? "Anonymous" : p.gift_name || "Someone"}
                    {p.gift_message ? ` — “${p.gift_message}”` : ""}
                  </p>
                </div>

                <div className="text-xs text-white/60 whitespace-nowrap">
                  {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
