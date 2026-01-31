// ~/everpay-frontend/src/app/example/payments/DemoPaymentsClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Payment = {
  id: string;
  amount: number;
  gift_name?: string;
  gift_message?: string;
  anonymous?: number;
  created_at: string;
};

const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(value);

type RangeKey = "today" | "7d" | "30d" | "all";

export default function DemoPaymentsClient({ username }: { username: string }) {
  // Demo payments (fixed timestamps to avoid hydration mismatch)
  const payments: Payment[] = [
    {
      id: "ep_demo_pay_001",
      amount: 500,
      gift_name: "Sarah",
      gift_message: "Love your content 🎁",
      anonymous: 0,
      created_at: "2026-01-30T08:10:00.000Z",
    },
    {
      id: "ep_demo_pay_002",
      amount: 1000,
      gift_name: "",
      gift_message: "Keep going 👏",
      anonymous: 1,
      created_at: "2026-01-29T19:30:00.000Z",
    },
    {
      id: "ep_demo_pay_003",
      amount: 2500,
      gift_name: "Tom",
      gift_message: "Legend 🙌",
      anonymous: 0,
      created_at: "2026-01-29T12:05:00.000Z",
    },
    {
      id: "ep_demo_pay_004",
      amount: 300,
      gift_name: "Mia",
      gift_message: "",
      anonymous: 0,
      created_at: "2026-01-28T21:40:00.000Z",
    },
  ];

  const [range, setRange] = useState<RangeKey>("today");
  const [search, setSearch] = useState("");
  const [anonymousOnly, setAnonymousOnly] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid any SSR/client mismatch around dates/locales
  useEffect(() => setMounted(true), []);

  // Avoid setting state after unmount (pattern consistent with your real page)
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const now = new Date("2026-01-30T09:00:00.000Z"); // fixed "now" for demo realism + stability

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOf7d = new Date(now);
  startOf7d.setDate(startOf7d.getDate() - 7);

  const startOf30d = new Date(now);
  startOf30d.setDate(startOf30d.getDate() - 30);

  const rangeStart =
    range === "today" ? startOfToday : range === "7d" ? startOf7d : range === "30d" ? startOf30d : null;

  const withinRange = (p: Payment) => {
    if (!rangeStart) return true;
    const d = new Date(p.created_at);
    return d >= rangeStart;
  };

  const matchesSearch = (p: Payment) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const supporter = (p.anonymous ? "anonymous" : p.gift_name || "someone").toLowerCase();
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
    a.download = `everpay-demo-payments-${username}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="max-w-6xl mx-auto px-4 text-white mt-10 pb-32 bg-gradient-to-b from-slate-800/40 via-slate-900/25 to-transparent rounded-3xl">
      <h1 className="text-2xl font-semibold mb-6">Creator Payments</h1>

      <div className="mb-8 bg-black/40 border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase text-white/60 mb-1">Today</p>
              <p className="text-4xl font-bold">{formatGBP(todaysTotal)}</p>
              <p className="text-[11px] text-white/40 mt-1">Demo preview • fake data</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRange("today")}
                className={`px-3 py-1.5 rounded-lg text-xs border ${
                  range === "today" ? "bg-white/10 border-white/20" : "bg-transparent border-white/10 text-white/70 hover:text-white"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setRange("7d")}
                className={`px-3 py-1.5 rounded-lg text-xs border ${
                  range === "7d" ? "bg-white/10 border-white/20" : "bg-transparent border-white/10 text-white/70 hover:text-white"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setRange("30d")}
                className={`px-3 py-1.5 rounded-lg text-xs border ${
                  range === "30d" ? "bg-white/10 border-white/20" : "bg-transparent border-white/10 text-white/70 hover:text-white"
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setRange("all")}
                className={`px-3 py-1.5 rounded-lg text-xs border ${
                  range === "all" ? "bg-white/10 border-white/20" : "bg-transparent border-white/10 text-white/70 hover:text-white"
                }`}
              >
                All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-black/30 border border-white/10 rounded-xl p-4">
              <p className="text-[11px] uppercase text-white/60 mb-1">Total (range)</p>
              <p className="text-lg font-semibold">{formatGBP(totalRange)}</p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-xl p-4">
              <p className="text-[11px] uppercase text-white/60 mb-1">Payments</p>
              <p className="text-lg font-semibold">{filtered.length}</p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-xl p-4">
              <p className="text-[11px] uppercase text-white/60 mb-1">Average</p>
              <p className="text-lg font-semibold">{formatGBP(avg)}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search supporter, message, amount…"
              className="w-full sm:flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setAnonymousOnly((v) => !v)}
                className={`px-3 py-2 rounded-xl text-xs border ${
                  anonymousOnly ? "bg-white/10 border-white/20" : "bg-black/30 border-white/10 text-white/70 hover:text-white"
                }`}
              >
                Anonymous: {anonymousOnly ? "ON" : "OFF"}
              </button>

              <button
                onClick={exportCSV}
                className="px-3 py-2 rounded-xl text-xs bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold"
              >
                Export CSV
              </button>
            </div>
          </div>

          <p className="text-[11px] text-white/40">
            Demo preview — export works, but data is sample-only. Status is shown as Completed.
          </p>
        </div>
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <p className="text-white/70">No payments found for this filter.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-black/40 border border-white/10 rounded-xl p-4 flex justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{formatGBP(p.amount / 100)}</p>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70">
                    Completed
                  </span>
                </div>

                <p className="text-xs text-white/70 truncate">
                  {p.anonymous ? "Anonymous" : p.gift_name || "Someone"}
                  {p.gift_message ? ` — “${p.gift_message}”` : ""}
                </p>
              </div>

              <div className="text-xs text-white/60 whitespace-nowrap">
                {mounted ? new Date(p.created_at).toLocaleDateString("en-GB") : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
