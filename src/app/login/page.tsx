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
        <div className="text-center mb-5">
          <Link
            href="/"
            className="inline-block text-3xl sm:text-4xl font-extrabold tracking-tight text-white"
          >
            EverPay
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full bg-black/45 border border-white/40 rounded-3xl p-6 sm:p-8 space-y-5 backdrop-blur-xl shadow-[0_18px_60px_rgba(0,0,0,0.45),0_0_0_1.5px_rgba(255,255,255,0.25)]"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Sign in to your EverPay dashboard
            </h1>
            <p className="text-sm text-white/70">
              Manage your page, track gifts, and get paid instantly.
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
            className="w-full p-3 rounded-xl bg-white/90 text-black placeholder:text-black/40 outline-none"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 rounded-xl bg-white/90 text-black placeholder:text-black/40 outline-none"
            required
          />

          <div className="text-right mt-2 mb-4">
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold hover:opacity-95 transition disabled:opacity-70 shadow-[0_10px_30px_rgba(46,228,165,0.25)]"
          >
            {loading ? "Logging in…" : "Log In"}
          </button>

          <p className="text-xs text-white/50 mt-4 text-center">
            Secure login. Start receiving gifts today.
          </p>

          <div className="pt-3 text-center">
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

          <div className="pt-3 text-center">
            <div className="text-xs text-white/40 flex justify-center gap-3">
              <Link href="/help?from=login" className="hover:text-white transition">
                Help
              </Link>

              <Link href="/terms" className="hover:text-white transition">
                Terms
              </Link>

              <Link href="/privacy" className="hover:text-white transition">
                Privacy
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
