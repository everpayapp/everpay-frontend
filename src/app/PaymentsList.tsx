"use client";

import useSWR from "swr";
import { useState, useMemo, useEffect } from "react";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok || res.headers.get("content-type")?.includes("text/html")) {
    console.warn("⚠️ Bad response from API:", res.status);
    return [];
  }
  return res.json();
};

// GBP format helper
const formatGBP = (value: number) =>
  `£${(value / 100).toLocaleString("en-UK", { minimumFractionDigits: 2 })}`;

// Badge style mapping
const statusStyles: Record<string, string> = {
  paid: "bg-emerald-500/10 text-emerald-400 border border-emerald-400/20",
  succeeded: "bg-emerald-500/10 text-emerald-400 border border-emerald-400/20", // Stripe status (bank payments)
  failed: "bg-red-500/10 text-red-400 border border-red-400/20",
  pending: "bg-yellow-500/10 text-yellow-400 border border-yellow-400/20",
  refunded: "bg-amber-500/10 text-amber-400 border border-amber-400/20",
  default: "bg-gray-500/10 text-gray-300 border border-gray-400/20",
};

export default function PaymentsList({ limit }: { limit?: number }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const { data: payments = [] } = useSWR(
    `${apiUrl}/api/payments`,
    fetcher,
    { refreshInterval: 4000 }
  );

  const [selected, setSelected] = useState<any | null>(null);

  // stop polling temporarily when modal is open (performance)
  useEffect(() => {
    if (!selected) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected]);

  // slice only once when data changes
  const visiblePayments = useMemo(() => {
    return payments.slice(0, limit ?? payments.length);
  }, [payments, limit]);

  return (
    <>
      {/* Status Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-400 mb-3">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-emerald-500/40"></span> Paid
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500/40"></span> Failed
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-yellow-500/40"></span> Pending
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-500/40"></span> Refunded
        </span>
      </div>

      {/* Payments */}
      <div className="space-y-2">
        {visiblePayments.length === 0 ? (
          <p className="text-gray-400 text-sm italic py-4 text-center">No payments yet</p>
        ) : (
          visiblePayments.map((p: any) => (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              className="flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-lg cursor-pointer hover:bg-white/10 transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">
                    {p.email || "Unknown"}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded font-medium ${
                      statusStyles[p.status] || statusStyles.default
                    }`}
                  >
                    {p.status 
  ? p.status.charAt(0).toUpperCase() + p.status.slice(1) 
  : "Succeeded"}

                  </span>
                </div>
                <p className="text-xs text-gray-400">{formatGBP(p.amount)}</p>
              </div>
              <p className="text-xs text-gray-500">
                {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 animate-zoomIn"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-[#111827] border border-white/10 rounded-xl p-6 w-[360px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Payment Details
            </h3>

            <p className="text-gray-300 mb-2 text-sm">
              <strong>Email:</strong> {selected.email || "N/A"}
            </p>

            <p className="text-gray-300 mb-2 text-sm">
              <strong>Amount:</strong> {formatGBP(selected.amount)}
            </p>

            <p className="text-gray-300 mb-2 text-sm">
              <strong>Status:</strong>{" "}
              <span
                className={`px-2 py-0.5 text-xs rounded font-medium ${
                  statusStyles[selected.status] || statusStyles.default
                }`}
              >
                {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
              </span>
            </p>

            <p className="text-gray-300 text-xs mb-3">
              <strong>Date:</strong> {new Date(selected.created_at).toLocaleString()}
            </p>

            <p className="text-gray-200 mb-2 text-sm break-all">
              <strong>Session ID:</strong>
              <span className="text-xs text-gray-100 block bg-slate-700 p-2 rounded mt-1 border border-white/10">
                {selected.id}
              </span>
            </p>

            <button
              onClick={() => setSelected(null)}
              className="w-full py-2 mt-4 bg-gradient-to-r from-cyan-500 to-emerald-400 text-white font-semibold rounded-lg hover:opacity-90 transition text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
