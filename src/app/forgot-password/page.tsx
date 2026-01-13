"use client";

import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "Something went wrong");
        setLoading(false);
        return;
      }

      setSuccess(
        "If an account exists for this email, a reset link has been sent."
      );
    } catch {
      setError("Unable to send reset email");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-black/40 border border-white/10 rounded-2xl p-6 space-y-4"
      >
        <h1 className="text-center text-xl font-semibold">
          Forgot Password
        </h1>

        {error && (
          <p className="text-red-400 text-sm text-center">
            {error}
          </p>
        )}

        {success && (
          <p className="text-green-400 text-sm text-center">
            {success}
          </p>
        )}

        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-xl bg-white text-black"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-white text-black font-semibold"
        >
          {loading ? "Sending…" : "Send reset link"}
        </button>

        <div className="text-center">
          <a
            href="/login"
            className="text-xs text-white/70 hover:text-white"
          >
            Back to login
          </a>
        </div>
      </form>
    </div>
  );
}
