"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();

  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Missing token.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Reset failed.");
        setLoading(false);
        return;
      }

      setOk(true);
      setTimeout(() => router.push("/login"), 900);
    } catch {
      setError("Reset failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-black text-slate-50 px-6 py-12 flex justify-center">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-semibold">Reset password</h1>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          {!token ? (
            <div className="space-y-2">
              <div className="text-lg font-semibold">Invalid link</div>
              <p className="text-sm text-white/70">
                This reset link is missing a token.
              </p>
              <Link href="/forgot-password" className="text-sm text-white/70 hover:text-white">
                Request a new one
              </Link>
            </div>
          ) : ok ? (
            <div className="space-y-2">
              <div className="text-lg font-semibold text-emerald-300">
                Password updated ✅
              </div>
              <p className="text-sm text-white/70">Redirecting to login…</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">New password</label>
                <input
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Confirm password</label>
                <input
                  className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="********"
                />
              </div>

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
                {loading ? "Updating…" : "Update password"}
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
