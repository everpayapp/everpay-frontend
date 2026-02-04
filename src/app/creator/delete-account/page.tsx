"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const REASONS = [
  { value: "not_using", label: "I’m not using EverPay" },
  { value: "too_expensive", label: "Fees / costs aren’t worth it" },
  { value: "confusing", label: "It’s confusing to use" },
  { value: "missing_features", label: "Missing features I need" },
  { value: "privacy_concerns", label: "Privacy / security concerns" },
  { value: "found_alternative", label: "I found another platform" },
  { value: "technical_issue", label: "I had a technical issue" },
  { value: "other", label: "Other" },
];

export default function DeleteAccountPage() {
  const router = useRouter();
  const { status, data: session } = useSession();

  const username =
    (session?.user as any)?.username ||
    session?.user?.email?.split("@")[0] ||
    "";

  const [reason, setReason] = useState<string>("");
  const [detail, setDetail] = useState<string>("");
  const [confirmText, setConfirmText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === "loading") return null;

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  const canDelete =
    !!username && !!reason && confirmText.trim().toUpperCase() === "DELETE";

  async function handleDelete() {
    setError(null);

    if (!canDelete) {
      setError("Please pick a reason and type DELETE to confirm.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/delete-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          reason,
          detail,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Delete failed.");
        return;
      }

      // sign out + back to homepage
      await signOut({ callbackUrl: "/" });
    } catch {
      setError("Delete failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-black/30 border border-white/15 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl text-white">
        <h1 className="text-2xl font-bold mb-2">Delete account</h1>
        <p className="text-sm text-white/70 mb-6">
          This will permanently delete your creator profile and public gift page.
        </p>

        <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
          <p className="text-sm font-semibold text-red-200">Warning</p>
          <p className="text-sm text-white/70 mt-1">
            This cannot be undone.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs text-white/70">Why are you deleting?</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white outline-none"
            >
              <option value="" className="text-black">Select a reason…</option>
              {REASONS.map((r) => (
                <option key={r.value} value={r.value} className="text-black">
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/70">
              Anything else you want to tell us? (optional)
            </label>
            <textarea
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder="Tell us what we could improve…"
              rows={4}
              className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/40 outline-none"
            />
          </div>

          <div>
            <label className="text-xs text-white/70">Type DELETE to confirm</label>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE"
              className="mt-1 w-full rounded-xl bg-white/10 border border-white/20 px-3 py-2 text-sm text-white placeholder-white/40 outline-none"
            />
          </div>

          <button
            onClick={handleDelete}
            disabled={!canDelete || loading}
            className="w-full py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-500/90 active:scale-[0.98] transition disabled:opacity-60"
          >
            {loading ? "Deleting…" : "Delete my account"}
          </button>

          <button
            onClick={() => router.push("/creator/settings")}
            className="w-full py-3 rounded-xl bg-white/10 border border-white/15 text-white/80 hover:text-white transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
