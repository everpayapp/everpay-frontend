"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export default function ResetPasswordClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Missing reset token. Please use the link from your email.");
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

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok) {
        setError(data?.error || "Reset failed.");
        setLoading(false);
        return;
      }

      setSuccess("Password updated. You can now log in.");
      setLoading(false);

      // small delay so user sees success
      setTimeout(() => router.push("/login"), 900);
    } catch {
      setError("Reset failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4"
      >
        <h1 className="text-center text-xl font-semibold">Reset Password</h1>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        {success && (
          <p className="text-emerald-400 text-sm text-center">{success}</p>
        )}

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-xl bg-white text-black"
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full p-3 rounded-xl bg-white text-black"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-white text-black font-semibold"
        >
          {loading ? "Updating…" : "Update Password"}
        </button>

        <div className="text-center">
          <a href="/login" className="text-xs text-white/70 hover:text-white">
            Back to login
          </a>
        </div>
      </form>
    </div>
  );
}
