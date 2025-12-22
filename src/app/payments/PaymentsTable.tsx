"use client";

import { useState, useMemo, useEffect } from "react";
import PaymentDate from "./PaymentDate";
import StatusBadge from "./StatusBadge";

export default function PaymentsTable({ initialPayments }: { initialPayments: any[] }) {
  const normalize = (status: string) =>
    status === "succeeded" ? "paid" : status;

  const [payments, setPayments] = useState(
    initialPayments.map((p) => ({ ...p, status: normalize(p.status) }))
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<"created" | "email" | "amount" | "status">("created");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // 🔁 Auto-refresh — stays in sync with Dashboard
  useEffect(() => {
    const handler = () => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`)
        .then((res) => res.json())
        .then((data) =>
          Array.isArray(data) &&
          setPayments(data.map((p) => ({ ...p, status: normalize(p.status) })))
        )
        .catch(() => {});
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // 🔍 Filtering + sorting
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    let filtered = payments.filter((p) => {
      const created = new Date(p.created_at);
      const date1 = created.toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" }).toLowerCase();
      const date2 = created.toLocaleDateString("en-GB").replace(/\//g, "-").toLowerCase();

      const matchSearch =
        p.email?.toLowerCase().includes(query) ||
        (p.amount / 100).toString().includes(query.replace(/[^\d]/g, "")) ||
        date1.includes(query) ||
        date2.includes(query);

      const matchStatus = statusFilter === "all" || p.status === statusFilter;
      return matchSearch && matchStatus;
    });

    // 📌 Sorting
    filtered.sort((a, b) => {
      let valA, valB;
      if (sortKey === "created") {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else if (sortKey === "amount") {
        valA = a.amount;
        valB = b.amount;
      } else {
        valA = a[sortKey]?.toString().toLowerCase() || "";
        valB = b[sortKey]?.toString().toLowerCase() || "";
      }
      return sortDir === "asc" ? valA - valB : valB - valA;
    });

    return filtered;
  }, [payments, search, statusFilter, sortKey, sortDir]);

  // 📄 Export CSV
  const exportCSV = () => {
    const header = "email,amount,status,date,id\n";
    const rows = payments
      .map((p) => `${p.email},${p.amount / 100},${p.status},${p.created_at},${p.id}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "everpay_payments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-4">
      {/* 🔍 Search + Filter + Export */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by email, amount, or date…"
          value={search}
          onChange={(e) => setSearch(e.target.value.replace(/[\/.]/g, "-"))}
          className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400 w-full sm:w-1/2"
        />

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-slate-800 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
            <option value="failed">Failed</option>
          </select>

          <button
            onClick={exportCSV}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 text-sm font-semibold hover:opacity-90 transition"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* 📊 Table */}
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-white/5 backdrop-blur shadow-xl">
        <table className="w-full text-sm">
          <thead className="text-gray-300 border-b border-white/10 select-none">
            <tr>
              <th onClick={() => toggleSort("email")} className="px-4 py-3 text-left cursor-pointer">Customer</th>
              <th onClick={() => toggleSort("amount")} className="px-4 py-3 text-left cursor-pointer">Amount</th>
              <th onClick={() => toggleSort("status")} className="px-4 py-3 text-left cursor-pointer">Status</th>
              <th onClick={() => toggleSort("created")} className="px-4 py-3 text-left cursor-pointer">Date</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                  No matching payments found.
                </td>
              </tr>
            )}

            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/10 transition">
                <td className="px-4 py-3">{p.email || "—"}</td>
                <td className="px-4 py-3 font-medium text-emerald-400">
                  £{(p.amount / 100).toLocaleString("en-UK", { minimumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-4 py-3 text-gray-400">
                  <PaymentDate date={p.created_at} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

