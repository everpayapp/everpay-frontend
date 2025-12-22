"use client";

import { useState } from "react";

export default function PayLinkPage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = parseFloat(amount);
    if (isNaN(numeric) || numeric <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const pence = Math.round(numeric * 100);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      window.location.href = `${apiUrl}/link?amount=${pence}`;
    } catch (err) {
      console.error("❌ Payment link error:", err);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1623] via-[#0E1B2A] to-[#090E14] text-white p-6">
      <div className="relative bg-gradient-to-b from-[#0B1623] to-[#0E1B2A] rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center border border-white/10">
        {/* 🌈 EverPay Wordmark with Halo Glow */}
        <div className="relative mb-8">
          <div className="absolute inset-0 blur-3xl opacity-50 bg-gradient-to-r from-cyan-400 to-emerald-400 animate-pulse rounded-full w-28 h-10 left-1/2 transform -translate-x-1/2 -top-2"></div>
          <h1 className="relative text-4xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
            EverPay
          </h1>
          <div className="w-10 h-1 bg-gradient-to-r from-cyan-400 to-emerald-400 mx-auto mt-2 rounded-full animate-pulse"></div>
        </div>

        <p className="text-sm text-gray-400 mb-6">
          Enter the amount you’d like to pay securely below
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount (£)"
            className="w-full text-center text-xl font-semibold border border-white/10 rounded-xl py-3 px-4 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-white font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Redirecting…" : `Continue`}
          </button>
        </form>

        <p className="text-xs text-gray-500 mt-6">
          Secure payments powered by{" "}
          <span className="font-semibold text-cyan-400">EverPay</span>
          <br />
          Protected by <span className="text-emerald-400">Stripe ✅</span>
        </p>
      </div>
    </main>
  );
}
