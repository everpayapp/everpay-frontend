// ~/everpay-frontend/src/app/creator/payments/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StripeConnectBanner from "../components/StripeConnectBanner";

type Payment = {
  id: string;
  amount: number;
  gift_amount?: number;
  fee_amount?: number;
  total_paid?: number;
  stripe_fee_amount?: number;
  net_amount?: number;
  gift_name?: string;
  gift_message?: string;
  anonymous?: number;
  created_at: string;
  status?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

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

function getDisplayAmountPence(payment: Payment) {
  const net = Number(payment.net_amount || 0);
  if (net > 0) return net;

  const amount = Number(payment.amount || 0);
  return amount > 0 ? amount : 0;
}

type DecoratedPayment = Payment & {
  display_amount_pence: number;
};

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
  const [openMonths, setOpenMonths] = useState<Record<string, boolean>>({});

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

  const decoratedPayments = useMemo<DecoratedPayment[]>(
    () =>
      payments.map((payment) => ({
        ...payment,
        display_amount_pence: getDisplayAmountPence(payment),
      })),
    [payments]
  );

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

  const withinRange = (p: DecoratedPayment) => {
    if (!rangeStart) return true;
    const d = new Date(p.created_at);
    return d >= rangeStart;
  };

  const matchesSearch = (p: DecoratedPayment) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;

    const supporter = (
      p.anonymous ? "anonymous" : p.gift_name || "someone"
    ).toLowerCase();
    const message = (p.gift_message || "").toLowerCase();
    const amount = (p.display_amount_pence / 100).toFixed(2);

    return (
      supporter.includes(q) ||
      message.includes(q) ||
      amount.includes(q) ||
      p.created_at.toLowerCase().includes(q)
    );
  };

  const filtered = decoratedPayments
    .filter(withinRange)
    .filter((p) => (anonymousOnly ? !!p.anonymous : true))
    .filter(matchesSearch);

  const totalRange =
    filtered.reduce((sum, p) => sum + p.display_amount_pence, 0) / 100;

  const avg = filtered.length > 0 ? totalRange / filtered.length : 0;

  const todaysTotal =
    decoratedPayments
      .filter((p) => new Date(p.created_at) >= startOfToday)
      .reduce((sum, p) => sum + p.display_amount_pence, 0) / 100;

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
      group.total += payment.display_amount_pence;
    }

    return Array.from(groups.values()).sort((a, b) =>
      b.key.localeCompare(a.key)
    );
  }, [filtered]);

  useEffect(() => {
    if (groupedPayments.length === 0) return;

    const firstMonthKey = groupedPayments[0].key;

    setOpenMonths((prev) => {
      if (typeof prev[firstMonthKey] !== "undefined") {
        return prev;
      }

      return {
        ...prev,
        [firstMonthKey]: true,
      };
    });
  }, [groupedPayments]);

  const toggleMonth = (monthKey: string) => {
    setOpenMonths((prev) => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  const exportCSV = () => {
    const rows = [
      ["date", "supporter", "amount_received_gbp", "message", "status"],
      ...filtered.map((p) => [
        new Date(p.created_at).toISOString(),
        p.anonymous ? "Anonymous" : p.gift_name || "Someone",
        (p.display_amount_pence / 100).toFixed(2),
        (p.gift_message || "").replaceAll('"', '""'),
        p.status || "Completed",
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

  const chipBase =
    "px-3 py-2 rounded-xl text-xs border transition min-w-[78px] text-center";
  const chipOn = "bg-white/10 border-white/20";
  const chipOff =
    "bg-transparent border-white/10 text-white/70 hover:text-white";

  if (status === "loading") return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: PAGE_BG }}>
      <main className="max-w-7xl mx-auto pt-4 sm:pt-10 px-3 sm:px-6 text-white pb-16 sm:pb-24">
        <StripeConnectBanner />

        <h1 className="text-[20px] sm:text-2xl font-semibold mb-5 sm:mb-6">
          Creator Gifts
        </h1>

        <div className={`mb-6 sm:mb-8 ${PANEL} p-4 sm:p-6`}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm uppercase text-white/60 mb-1">
                  Today received
                </p>
                <p className="text-4xl font-bold">{formatGBP(todaysTotal)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-2">
                <button
                  onClick={() => setRange("today")}
                  className={`${chipBase} ${
                    range === "today" ? chipOn : chipOff
                  }`}
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
                  className={`${chipBase} ${
                    range === "30d" ? chipOn : chipOff
                  }`}
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
                  Total received
                </p>
                <p className="text-lg font-semibold">{formatGBP(totalRange)}</p>
              </div>

              <div className="bg-black/20 border border-white/12 rounded-xl p-4">
                <p className="text-[11px] uppercase text-white/60 mb-1">
                  Gifts
                </p>
                <p className="text-lg font-semibold">{filtered.length}</p>
              </div>

              <div className="bg-black/20 border border-white/12 rounded-xl p-4">
                <p className="text-[11px] uppercase text-white/60 mb-1">
                  Average received
                </p>
                <p className="text-lg font-semibold">{formatGBP(avg)}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search supporter, message, amount…"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none"
              />

              <div className="grid grid-cols-1 sm:grid-cols-[auto_auto] gap-3 sm:justify-end">
                <button
                  onClick={() => setAnonymousOnly((v) => !v)}
                  className={`w-full sm:w-auto px-4 py-3 rounded-xl text-sm border ${
                    anonymousOnly
                      ? "bg-white/10 border-white/20"
                      : "bg-white/10 border-white/20 text-white/70 hover:text-white"
                  }`}
                >
                  Anonymous: {anonymousOnly ? "ON" : "OFF"}
                </button>

                <button
                  onClick={exportCSV}
                  className="w-full sm:w-auto px-4 py-3 rounded-xl text-sm bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold"
                >
                  Export CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="mb-4 px-1">
            <p className="text-sm text-white/60">
              Showing <span className="text-white font-medium">{filtered.length}</span>{" "}
              gift{filtered.length === 1 ? "" : "s"} •{" "}
              <span className="text-white font-medium">{formatGBP(totalRange)}</span>{" "}
              received in this range
            </p>
          </div>
        )}

        {loading ? (
          <p className="text-white/70">Loading gifts…</p>
        ) : filtered.length === 0 ? (
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
                            <p className="text-lg font-semibold">
                              {formatGBP(p.display_amount_pence / 100)}
                            </p>

                            <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white/70">
                              Completed
                            </span>
                          </div>

                          <p className="text-sm text-white/80 break-words">
                            {p.anonymous ? "Anonymous" : p.gift_name || "Someone"}
                            {p.gift_message ? ` — “${p.gift_message}”` : ""}
                          </p>

                          <p className="mt-2 text-[11px] text-white/50">
                            {new Date(p.created_at).toLocaleDateString()}
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
