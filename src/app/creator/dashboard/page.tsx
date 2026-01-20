// ~/everpay-frontend/src/app/creator/dashboard/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  // 🔒 ENV
  const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
  const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_BASE_URL!;

  // 🔐 AUTH
  const { status, data: session } = useSession();
  const router = useRouter();

  // ✅ SESSION-BASED USERNAME
  const username = session?.user?.email?.split("@")[0] || "lee";

  // ✅ STATE
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  // ✅ Copy feedback
  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    };
  }, []);

  // 🔐 Redirect if logged out
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // 🔁 Load payments (with auto-refresh)
  useEffect(() => {
    if (status !== "authenticated") return;

    let isMounted = true;

    const loadPayments = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/payments/${encodeURIComponent(username)}`
        );
        const data = await res.json();
        if (isMounted) {
          setPayments(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load payments", err);
      }
    };

    loadPayments();
    const interval = setInterval(loadPayments, 15000); // ⏱️ 15s auto-refresh

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [apiUrl, username, status]);

  // Load profile (once)
  useEffect(() => {
    if (status !== "authenticated") return;

    async function loadProfile() {
      try {
        const res = await fetch(
          `${apiUrl}/api/creator/profile?username=${username}`
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
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [apiUrl, username, status]);

  // 🧠 Derived values
  const totalEarned = useMemo(() => {
    return payments.reduce((sum, p) => sum + p.amount, 0) / 100;
  }, [payments]);

  const formattedTotal = totalEarned.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const pageUrl = `${baseUrl}/creator/${username}`;

  const milestoneEnabled =
    profile &&
    (profile.milestone_enabled === 1 || profile.milestone_enabled === true) &&
    (profile.milestone_amount || 0) > 0;

  const milestoneTarget = profile?.milestone_amount || 0;
  const progress =
    milestoneTarget > 0 ? Math.min(1, totalEarned / milestoneTarget) : 0;
  const progressPercent = Math.round(progress * 100);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);

      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (err) {
      console.error("Copy failed", err);
      // Fallback: still show feedback so users aren't confused
      setCopied(true);
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => {
        setCopied(false);
      }, 1600);
    }
  };

  if (status === "loading") return null;

  return (
    <>
      {/* Slightly lighter premium background (page-only) */}
      <div className="relative min-h-screen">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e2238] via-[#081624] to-[#050b12]" />
        <div className="relative">
          <div className="max-w-6xl mx-auto px-4 text-white mt-10 pb-32">
            {profile && (
              <div className="w-full bg-black/55 border border-white/10 rounded-3xl p-8 shadow-2xl flex items-center gap-6 mb-10">
                <div className="w-24 h-24 rounded-full border-[5px] border-white/30 overflow-hidden shadow-xl">
                  {profile.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt="Creator avatar"
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
              {/* LEFT */}
              <div className="space-y-8">
                {milestoneEnabled && (
                  <div className="bg-black/40 border border-white/10 rounded-3xl px-6 py-5">
                    <p className="text-xs uppercase text-white/70 mb-1">
                      Current goal
                    </p>

                    {profile?.milestone_text && (
                      <p className="text-sm font-medium mb-2">
                        {profile.milestone_text}
                      </p>
                    )}

                    <p className="text-[13px] text-white/80 mb-3">
                      £{formattedTotal} of £
                      {milestoneTarget.toLocaleString("en-GB", {
                        minimumFractionDigits: 2,
                      })}{" "}
                      raised
                    </p>

                    <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                  {loading ? (
                    <p className="text-white/60">Loading…</p>
                  ) : (
                    <>
                      <p className="text-sm uppercase text-white/60">
                        Total Earnings
                      </p>
                      <p className="text-5xl font-bold">£{formattedTotal}</p>
                    </>
                  )}
                </div>

                {/* SHARE */}
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6 space-y-4">
                  <p className="text-sm text-center">Share your gift page 🌍</p>

                  <div className="bg-black/60 rounded-xl px-4 py-2 text-sm text-white/70 break-all">
                    {pageUrl}
                  </div>

                  <button
                    onClick={handleCopy}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold"
                  >
                    {copied ? "Copied ✓" : "Copy Link"}
                  </button>

                  <button
                    onClick={() => setShowQRModal(true)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-black font-semibold"
                  >
                    📷 Show Live Stream QR
                  </button>
                </div>
              </div>

              {/* RIGHT */}
              <div className="bg-black/40 border border-white/10 rounded-3xl p-6">
                <h2 className="text-2xl font-semibold mb-5 text-center">
                  Recent Supporters
                </h2>

                {payments.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="bg-white/5 rounded-xl p-4 mb-2 flex justify-between"
                  >
                    <div>
                      <p className="text-sm">
                        {p.anonymous ? "Anonymous" : p.gift_name || "Someone"}
                      </p>
                      <p className="font-semibold">
                        £
                        {(p.amount / 100).toLocaleString("en-GB", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div className="text-xs opacity-60">
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* QR MODAL */}
          {showQRModal && (
            <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
              <div className="bg-white rounded-3xl p-6 shadow-2xl text-center">
                <QRCode value={pageUrl} size={220} />
                <p className="mt-3 text-xs text-slate-500">
                  Powered by <strong>EverPay</strong> · Scan to support live
                </p>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="mt-4 text-sm text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

