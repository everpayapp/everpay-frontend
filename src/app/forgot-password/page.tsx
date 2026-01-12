"use client";

import { useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Enter your email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      // Always show success message (prevents email enumeration)
      await res.json().catch(() => ({}));
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-slate-50 px-6 py-12 flex justify-center">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Forgot password</h1>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          {done ? (
            <div className="space-y-3">
              <div className="text-lg font-semibold">Check your email</div>
              <p className="text-sm text-white/70">
                If an account exists for that email, we’ve generated a reset link.
              </p>

              {/* TEMP for testing: we are not emailing yet.
                  We'll wire email next. */}
              <p className="text-xs text-white/50">
                (Dev note: tokens are currently returned by the backend for testing.)
              </p>

              <Link
                href="/login"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-white text-black font-semibold hover:bg-white/90"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <label className="block text-sm font-medium">Email</label>
              <input
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
              />

              {error && (
                <p className="text-red-400 bg-red-950/40 p-2 rounded-lg text-sm">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-500 text-slate-900 rounded-xl py-2 font-medium hover:bg-emerald-400 disabled:opacity-60"
                disabled={loading}
              >
                {loading ? "Sending…" : "Send reset link"}
              </button>

              <div className="text-center">
                <Link href="/login" className="text-sm text-white/70 hover:text-white">
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
