"use client";

import { useMemo } from "react";

export default function PaymentDate({ date }: { date: string }) {
  const formatted = useMemo(() => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "—";

    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = d.toDateString() === yesterday.toDateString();

    const base = d.toLocaleString("en-GB", {
      timeZone: "Europe/London",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) return `${base} (Today)`;
    if (isYesterday) return `${base} (Yesterday)`;
    return base;
  }, [date]);

  return <span>{formatted}</span>;
}
