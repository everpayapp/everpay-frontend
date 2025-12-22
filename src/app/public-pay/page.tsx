"use client";

import { useState, useRef } from "react";

export default function PublicPay() {
  const [amountInput, setAmountInput] = useState("0.00");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const formatWithCommas = (value: string) => {
    if (!value) return "";
    const [intPart, decPart] = value.split(".");
    const intDigits = intPart.replace(/\D/g, "");
    const withCommas = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const raw = el.value.replace(/,/g, "");
    const cursorPos = el.selectionStart || 0;

    let clean = raw.replace(/[^\d.]/g, "");
    const firstDot = clean.indexOf(".");
    if (firstDot !== -1) {
      clean = clean.slice(0, firstDot + 1) + clean.slice(firstDot + 1).replace(/\./g, "");
    }
    clean = clean.replace(/^(\d+)(\.\d{0,2}).*$/, (_, a, b) => a + b);

    const formatted = formatWithCommas(clean);
    setAmountInput(formatted);

    const numeric = parseFloat(clean);
    setAmount(isNaN(numeric) ? 0 : numeric);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        const leftOfCaretRaw = raw.slice(0, cursorPos);
        const leftOfCaretFormatted = formatWithCommas(leftOfCaretRaw);
        const newPos = leftOfCaretFormatted.length;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    });
  };

  const formatDisplay = (value: number) =>
    value.toLocaleString("en-UK", { minimumFractionDigits: 2 });

  const handlePay = async () => {
    if (isNaN(amount) || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/pay?amount=${amount}`);
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        alert("Failed to start payment");
      }
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1623] via-[#0E1B2A] to-[#090E14] text-white p-6">
      <div className="max-w-md w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl text-center">
        <h1 className="text-3xl font-bold mb-2">EverPay</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Enter the amount (£) you’d like to pay securely via bank.
        </p>

        <label className="text-sm text-gray-300 mb-2 block">Amount (£)</label>
        <input
          ref={inputRef}
          type="text"
          value={amountInput}
          onChange={handleInput}
          inputMode="decimal"
          placeholder="0.00"
          className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
        />

        <button
          onClick={handlePay}
          disabled={loading}
          className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? "Processing…" : `Pay £${formatDisplay(amount)}`}
        </button>

        <p className="text-xs text-gray-500 text-center mt-6">
          Secure payments powered by <span className="font-semibold text-cyan-400">EverPay</span> — Protected by Stripe ✅
        </p>
      </div>
    </main>
  );
}
