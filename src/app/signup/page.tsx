"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

function sanitizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z0-9._-]/g, "");
}

export default function SignupPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewUsername = useMemo(() => sanitizeUsername(username), [username]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;

    setError(null);

    if (!API_URL) {
      setError("App setup error. Please try again later.");
      return;
    }

    const cleanUsername = sanitizeUsername(username);
    const cleanEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!cleanUsername) {
      setError("Username is required.");
      return;
    }

    if (!/^[a-z0-9._-]{3,30}$/.test(cleanUsername)) {
      setError("Username must be 3–30 characters and use only letters, numbers, dots, underscores, or hyphens.");
      return;
    }

    if (!cleanEmail) {
      setError("Email is required.");
      return;
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: cleanUsername,
          email: cleanEmail,
          password: trimmedPassword,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setError(
          typeof data?.error === "string" && data.error.trim()
            ? data.error
            : "Signup failed. Please try again."
        );
        return;
      }

      router.push("/login?created=1");
    } catch {
      setError("Could not create your account right now. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#041b4d] bg-[radial-gradient(circle_at_top,_rgba(30,64,175,0.35),_transparent_35%),linear-gradient(to_bottom,_#041b4d,_#020817)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-4 text-center sm:mb-5">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            EverPay
          </h1>
        </div>

        <div className="w-full rounded-[28px] border border-white/20 bg-black/45 px-6 py-7 sm:px-8 sm:py-8 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.55)] text-white">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center leading-[1.05]">
            Create your EverPay
            <br />
            page
          </h2>

          <p className="mt-3 text-center text-white/72 text-base">
            Set up your page, receive gifts, and start getting paid.
          </p>

          {error && (
            <div
              className="mt-5 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs text-white/70">
                Username
              </label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                autoComplete="username"
                spellCheck={false}
                autoCapitalize="none"
                autoCorrect="off"
                inputMode="text"
                required
                minLength={3}
                maxLength={30}
                className="w-full rounded-2xl bg-white/85 border border-white/30 px-4 py-3.5 text-base text-black placeholder:text-black/45 outline-none transition focus:border-white/60 focus:bg-white"
              />
              <p className="mt-2 text-xs text-white/55 break-all">
                This becomes your link: everpayapp.co.uk/{previewUsername || "username"}
              </p>
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs text-white/70">
                Email
              </label>
              <input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                type="email"
                autoComplete="email"
                inputMode="email"
                required
                className="w-full rounded-2xl bg-white/85 border border-white/30 px-4 py-3.5 text-base text-black placeholder:text-black/45 outline-none transition focus:border-white/60 focus:bg-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs text-white/70">
                Password
              </label>
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-2xl bg-white/85 border border-white/30 px-4 py-3.5 text-base text-black placeholder:text-black/45 outline-none transition focus:border-white/60 focus:bg-white"
              />
              <p className="mt-2 text-xs text-white/50">
                Minimum 6 characters.
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-xs text-white/70">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full rounded-2xl bg-white/85 border border-white/30 px-4 py-3.5 text-base text-black placeholder:text-black/45 outline-none transition focus:border-white/60 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="mt-2 w-full rounded-2xl bg-gradient-to-r from-teal-400 to-emerald-500 py-4 text-lg font-bold text-black shadow-[0_0_28px_rgba(45,212,191,0.35)] transition hover:opacity-95 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-center text-[13px] text-white/60">
              Secure signup • Start receiving gifts today
            </p>
          </form>

          <p className="mt-5 text-center text-sm text-white/68">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-white underline underline-offset-4"
            >
              Log in →
            </Link>
          </p>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs text-white/45">
            <Link href="/help" className="hover:text-white/70 transition">
              Help
            </Link>
            <Link href="/terms" className="hover:text-white/70 transition">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white/70 transition">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
