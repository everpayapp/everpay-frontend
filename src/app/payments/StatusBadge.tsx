"use client";

type StatusType =
  | "paid"
  | "succeeded"
  | "success"
  | "pending"
  | "processing"
  | "failed"
  | "unpaid"
  | "refunded"
  | "canceled"
  | string;

export default function StatusBadge({ status }: { status: StatusType }) {
  const normalized = (status || "unknown").trim().toLowerCase();

  const group: Record<string, StatusType> = {
    succeeded: "paid",
    success: "paid",
    unpaid: "failed",
    processing: "pending",
  };

  const canonical = group[normalized] || normalized;

  const style: Record<string, string> = {
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-400/20",
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-400/20",
    refunded: "bg-amber-500/10 text-amber-400 border-amber-400/20",
    failed: "bg-red-500/10 text-red-400 border-red-400/20",
    canceled: "bg-gray-500/10 text-gray-400 border-gray-400/20",
    unknown: "bg-gray-500/10 text-gray-300 border-gray-400/20",
  };

  const colorClass = style[canonical] || style.unknown;

  const label =
    canonical.charAt(0).toUpperCase() + canonical.slice(1);

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${colorClass}`}
    >
      {label}
    </span>
  );
}
