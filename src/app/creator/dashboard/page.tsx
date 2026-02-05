"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

type Payment = {
  id: string;
  amount: number;
  gift_name?: string;
  gift_message?: string;
  anonymous?: number;
  created_at: string;
};

type CreatorProfile = {
  username: string;
  profile_name: string;
  avatar_url: string;
  bio: string;
  milestone_enabled?: number | boolean;
  milestone_amount?: number;
  milestone_text?: string;
};

export default function CreatorDashboard() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_BASE_URL!;

  const { status, data: session } = useSession();
  const router = useRouter();

  // ✅ HARD SAFE USERNAME (no email fallback ever)
  const username = String((session?.user as any)?.username || "")
    .trim()
    .toLowerCase();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    if (status === "authenticated" && !username) router.replace("/login");
  }, [status, username, router]);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    };
  }, []);

  // 🔁 Load payments
  useEffect(() => {
    if (status !== "authenticated" || !username) return;

    let mounted = true;

    const loadPayments = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/payments/${encodeURIComponent(username)}`
        );
        const data = await res.json();
        if (mounted) setPayments(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Payments load failed", err);
      }
    };

    loadPayments();
    const interval = setInterval(loadPayments, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [apiUrl, username, status]);

  // 🔁 Load profile
  useEffect(() => {
    if (status !== "authenticated" || !username) return;

    async function loadProfile() {
      try {
        const res = await fetch(
          `${apiUrl}/api/creator/profile?username=${encodeURIComponent(username)}`
        );
        const data = await res.json();

        setProfile({
          username,
          profile_name: data.profile_name || username,
          avatar_url: data.avatar_url || "",
          bio: data.bio || "",
          milestone_enabled: data.milestone_enabled,
          milestone_amount: Number(data.milestone_amount) || 0,
          milestone_text: data.milestone_text || "",
        });
      } catch (err) {
        console.error("Profile load failed", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [apiUrl, username, status]);

  const totalEarned = payments.reduce((s, p) => s + p.amount, 0) / 100;

  const formattedTotal = totalEarned.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const pageUrl = `${baseUrl}/creator/${username}`;

  const milestoneEnabled =
    profile &&
    (profile.milestone_enabled === 1 || profile.milestone_enabled === true) &&
    (profile.milestone_amount || 0) > 0;

  const target = profile?.milestone_amount || 0;
  const progress = target > 0 ? Math.min(1, totalEarned / target) : 0;
  const percent = Math.round(progress * 100);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);
    if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 1500);
  };

  if (status === "loading") return null;

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 text-white mt-10 pb-32">

        {profile && (
          <div className="bg-black/60 border border-white/10 rounded-3xl p-8 flex items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden">
              {profile.avatar_url && (
                <img
                  src={profile.avatar_url}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold uppercase">
                {profile.profile_name}
              </h1>
              <p className="text-sm text-white/60">@{username}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8">

          <div className="space-y-8">

            {milestoneEnabled && (
              <div className="bg-black/40 border border-white/10 rounded-3xl px-6 py-5">
                {profile?.milestone_text && (
                  <p className="text-sm mb-2">{profile.milestone_text}</p>
                )}

                <p className="text-sm mb-3">
                  £{formattedTotal} of £{target.toFixed(2)} raised
                </p>

                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
              {loading ? (
                <p className="text-white/60">Loading…</p>
              ) : (
                <>
                  <p className="text-sm text-white/60">Total earnings</p>
                  <p className="text-5xl font-bold">£{formattedTotal}</p>
                </>
              )}
            </div>

            <div className="bg-black/40 border border-white/10 rounded-3xl p-6 space-y-4">
              <p className="text-sm text-center">Share your gift page 🌍</p>

              <div className="bg-black/60 rounded-xl px-4 py-2 text-sm">
                {pageUrl}
              </div>

              <button
                onClick={handleCopy}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold"
              >
                {copied ? "Copied ✓" : "Copy link"}
              </button>

              <button
                onClick={() => setShowQRModal(true)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold"
              >
                Show QR code
              </button>
            </div>
          </div>

          <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
            <h2 className="text-2xl mb-5 text-center">Recent supporters</h2>

            {payments.slice(0, 5).map((p) => (
              <div key={p.id} className="bg-white/5 rounded-xl p-4 mb-2 flex justify-between">
                <div>
                  <p>{p.anonymous ? "Anonymous" : p.gift_name || "Someone"}</p>
                  <p className="font-semibold">£{(p.amount / 100).toFixed(2)}</p>
                </div>
                <div className="text-xs opacity-60">
                  {new Date(p.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showQRModal && (
        <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 text-center">
            <QRCode value={pageUrl} size={220} />
            <p className="mt-3 text-xs text-slate-500">
              Powered by EverPay
            </p>
            <button
              onClick={() => setShowQRModal(false)}
              className="mt-4 text-sm text-slate-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
