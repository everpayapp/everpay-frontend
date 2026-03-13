// ~/everpay-frontend/src/app/example/payments/DemoPaymentsClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Payment = {
  id: string;
  amount: number;
  gift_name?: string;
  gift_message?: string;
  anonymous?: number;
  created_at: string;
};

const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);

const formatMonthLabel = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);

type RangeKey = "today" | "7d" | "30d" | "all";

type MonthGroup = {
  key: string;
  label: string;
  payments: Payment[];
  total: number;
};

export default function DemoPaymentsClient({ username }: { username: string }) {
  const PAGE_BG = "#0B0D12";
  const PANEL =
    "bg-black/25 rounded-3xl border border-white/18 shadow-[0_18px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/10";

  const payments: Payment[] = [
    {
      id: "ep_demo_pay_001",
      amount: 500,
      gift_name: "Sarah",
      gift_message: "Love your content 🎁",
      anonymous: 0,
      created_at: "2026-03-14T08:10:00.000Z",
    },
    {
      id: "ep_demo_pay_002",
      amount: 1000,
      gift_name: "",
      gift_message: "Keep going 👏",
      anonymous: 1,
      created_at: "2026-03-13T19:30:00.000Z",
    },
    {
      id: "ep_demo_pay_003",
      amount: 2500,
      gift_name: "Tom",
      gift_message: "Legend 🙌",
      anonymous: 0,
      created_at: "2026-03-12T12:05:00.000Z",
    },
    {
      id: "ep_demo_pay_004",
      amount: 300,
      gift_name: "Mia",
      gift_message: "",
      anonymous: 0,
      created_at: "2026-03-11T21:40:00.000Z",
    },
    {
      id: "ep_demo_pay_005",
      amount: 1200,
      gift_name: "Ariana",
      gift_message: "You got this",
      anonymous: 0,
      created_at: "2026-02-26T10:15:00.000Z",
    },
    {
      id: "ep_demo_pay_006",
      amount: 700,
      gift_name: "Leo",
      gift_message: "",
      anonymous: 0,
      created_at: "2026-02-21T14:20:00.000Z",
    },
    {
      id: "ep_demo_pay_007",
      amount: 1800,
      gift_name: "",
      gift_message: "Proud of you",
      anonymous: 1,
      created_at: "2026-02-16T18:45:00.000Z",
    },
    {
      id: "ep_demo_pay_008",
      amount: 950,
      gift_name: "Chris",
      gift_message: "Amazing work",
      anonymous: 0,
      created_at: "2026-01-30T09:00:00.000Z",
    },
  ];

  const [range, setRange] = useState<RangeKey>("today");
  const [search, setSearch] = useState("");
  const [anonymousOnly, setAnonymousOnly] = useState(false);
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const now = new Date("2026-03-14T09:00:00.000Z");

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

  const groupedPayments = useMemo<MonthGroup[]>(() => {
    const groups = new Map<string, MonthGroup>();

    for (const payment of filtered) {
      const d = new Date(payment.created_at);
      const year = d.getFullYear();
      const month = d.getMonth();
      const key = `${year}-${String(month + 1).padStart(2, "0")}`;
      const label = formatMonthLabel(new Date(year, month, 1));

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          label,
          payments: [],
          total: 0,
        });
      }

      const group = groups.get(key)!;
      group.payments.push(payment);
      group.total += payment.amount;
    }

    return Array.from(groups.values()).sort((a, b) =>
      b.key.localeCompare(a.key)
    );
  }, [filtered]);

  const toggleMonth = (monthKey: string) => {
    setOpenMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAGE_BG }}>
      <main className="max-w-7xl mx-auto pt-4 sm:pt-10 px-3 sm:px-6 text-white pb-16 sm:pb-24">

        <h1 className="text-[20px] sm:text-2xl font-semibold mb-5 sm:mb-6">
          Creator Gifts
        </h1>

        {filtered.length > 0 && (
          <div className="mb-4 px-1">
            <p className="text-sm text-white/60">
              Showing <span className="text-white font-medium">{filtered.length}</span>{" "}
              gift{filtered.length === 1 ? "" : "s"} •{" "}
              <span className="text-white font-medium">{formatGBP(totalRange)}</span>{" "}
              in this range
            </p>
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-white/70">No gifts found for this filter.</p>
        ) : (
          <div className="space-y-4">
            {groupedPayments.map((group, index) => {
              const isOpen = openMonths[group.key] ?? index === 0;

              return (
                <div
                  key={group.key}
                  className="bg-black/20 border border-white/12 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-1 ring-white/10 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => toggleMonth(group.key)}
                    className="w-full px-4 py-4 flex items-center justify-between gap-4 text-left hover:bg-white/[0.03] transition"
                  >
                    <div className="min-w-0">
                      <p className="text-base sm:text-lg font-semibold text-white">
                        {group.label}
                      </p>
                      <p className="text-xs sm:text-sm text-white/60 mt-1">
                        {group.payments.length} gift{group.payments.length === 1 ? "" : "s"} •{" "}
                        {formatGBP(group.total / 100)}
                      </p>
                    </div>

                    <div className="shrink-0 text-white/70 text-lg">
                      {isOpen ? "−" : "+"}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3">
                      {group.payments.map((p) => (
                        <div
                          key={p.id}
                          className="bg-black/20 border border-white/12 rounded-xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)]"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="text-xl font-semibold tracking-tight">
                              {formatGBP(p.amount / 100)}
                            </p>

                            <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70">
                              Completed
                            </span>
                          </div>

                          <p className="text-sm text-white/70 break-words">
                            {p.anonymous ? "Anonymous" : p.gift_name || "Someone"}
                            {p.gift_message ? ` — “${p.gift_message}”` : ""}
                          </p>

                          <p className="mt-1 text-[11px] text-white/40">
                            {new Date(p.created_at).toLocaleDateString("en-GB")}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
