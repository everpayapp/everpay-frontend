"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
      return;
    }

    window.location.href = "/creator/dashboard";
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10 text-white"
      style={{
        background:
          "radial-gradient(circle at top, rgba(0,61,245,0.18), transparent 32%), linear-gradient(to bottom right, #050816, #071227 45%, #0a1630 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-block text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
          >
            EverPay
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full bg-black/40 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Sign in to your creator dashboard
            </h1>
            <p className="text-sm text-white/65">
              Manage your gift page, payments, and settings.
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl bg-white text-black placeholder:text-black/50 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-white text-black placeholder:text-black/50 outline-none"
            required
          />

          <div className="text-right">
            <a
              href="/forgot-password"
              className="text-xs text-white/70 hover:text-white transition"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold hover:opacity-95 transition disabled:opacity-70"
          >
            {loading ? "Logging in…" : "Log In"}
          </button>

          <div className="pt-2 text-center">
            <p className="text-sm text-white/65">
              Don&apos;t have a page yet?{" "}
              <Link
                href="/signup"
                className="text-white font-medium hover:text-teal-300 transition"
              >
                Create your EverPay page
              </Link>
            </p>
          </div>

          <div className="pt-2 text-center">
            <p className="text-xs text-white/45">
              Secure login • Payments powered by Stripe
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
