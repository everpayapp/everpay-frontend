"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function HelpPage() {
  const [question, setQuestion] = useState("");
  const { status } = useSession();
  const searchParams = useSearchParams();

  const from = searchParams.get("from");

  // 🔥 Smart back button logic
  const backHref =
    from === "login"
      ? "/login"
      : status === "authenticated"
      ? "/creator/dashboard"
      : "/login";

  const backLabel =
    from === "login"
      ? "Back to Login"
      : status === "authenticated"
      ? "Back to Dashboard"
      : "Back to Login";

  const handleAskQuestion = () => {
    const subject = encodeURIComponent("EverPay Support Request");
    const body = encodeURIComponent(
      question.trim() || "Hi EverPay, I need help with..."
    );

    window.location.href = `mailto:support@everpayapp.co.uk?subject=${subject}&body=${body}`;
  };

  return (
    <main className="min-h-screen bg-[#0B0D12] text-white px-6 py-12">
      {/* 🔥 TOP BAR */}
      <div className="max-w-7xl mx-auto mb-10 flex items-center justify-between">
        {/* 🔥 EverPay logo with glow */}
        <Link
          href="/"
          className="text-3xl font-extrabold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.7)] hover:opacity-80 transition"
        >
          EverPay
        </Link>

        {/* 🔥 Dynamic back button */}
        <Link
          href={backHref}
          className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-sm font-medium text-white hover:bg-white/15 transition"
        >
          {backLabel}
        </Link>
      </div>

      <div className="w-full max-w-3xl mx-auto space-y-8">
        {/* HEADER */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-white/70">
            Need help with EverPay? Here are answers to the most common questions.
          </p>
        </div>

        {/* FAQ */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Where do my gifts go?</h2>
          <p className="text-white/70 text-sm">
            All gifts are processed securely through Stripe and paid directly
            to your connected Stripe account.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">How do payouts work?</h2>
          <p className="text-white/70 text-sm">
            Once you connect Stripe in Settings, gifts are sent to your Stripe
            account and paid out to your bank automatically.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">
            How do I start receiving gifts?
          </h2>
          <p className="text-white/70 text-sm">
            Create your account, connect Stripe in Settings, and share your
            EverPay link with supporters.
          </p>
        </div>

        {/* ASK QUESTION */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Ask a question</h2>

          <p className="text-white/70 text-sm mb-3">
            Send your question to support and we’ll get back to you as soon as possible.
          </p>

          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="w-full min-h-[140px] rounded-2xl bg-white/10 border border-white/15 px-4 py-3 text-sm text-white placeholder:text-white/40 outline-none resize-none"
          />

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-white/70">
              support@everpayapp.co.uk
            </p>

            <button
              type="button"
              onClick={handleAskQuestion}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold hover:opacity-95 transition"
            >
              Send Question
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
