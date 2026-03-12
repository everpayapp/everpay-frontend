// ~/everpay-frontend/src/app/creator/dashboard/page.tsx
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

  const username = (session?.user as any)?.username as string | undefined;

  const PAGE_BG = "#0B0D12";

  const PANEL =
    "bg-black/25 rounded-3xl border border-white/18 shadow-[0_18px_60px_rgba(0,0,0,0.55)] ring-1 ring-white/10";

  const SUBPANEL =
    "bg-black/20 rounded-2xl border border-white/12";

  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile] = useState<CreatorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  const [copied, setCopied] = useState(false);
  const copiedTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimer.current) window.clearTimeout(copiedTimer.current);
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!username) {
      console.error("Session missing username");
    }
  }, [status, username]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!username) return;

    const safeUsername: string = username;
    let isMounted = true;

    const loadPayments = async () => {
      try {
        const res = await fetch(
          `${apiUrl}/api/payments/creator/${encodeURIComponent(safeUsername)}`
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
    const interval = setInterval(loadPayments, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [apiUrl, username, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!username) return;

    const safeUsername: string = username;

    async function loadProfile() {
      try {
        const res = await fetch(
          `${apiUrl}/api/creator/profile?username=${encodeURIComponent(
            safeUsername
          )}`
        );

        const data = await res.json();

        setProfile({
          username: data.username || safeUsername,
          profile_name: data.profile_name || safeUsername,
          avatar_url: data.avatar_url || "",
          bio: data.bio || "",
          milestone_enabled: data.milestone_enabled,
          milestone_amount: Number(data.milestone_amount) || 0,
          milestone_text: data.milestone_text || "",
        });
      } catch (err) {
        console.error("Failed to load profile", err);
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    }

    loadProfile();
  }, [apiUrl, username, status]);

  const totalEarned =
    payments.reduce((sum, p) => sum + p.amount, 0) / 100;

  const formattedTotal =
    totalEarned.toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const pageUrl =
    username
      ? `${baseUrl}/creator/${encodeURIComponent(username)}`
      : `${baseUrl}/creator/`;

  const milestoneEnabled =
    profile &&
    (profile.milestone_enabled === 1 ||
      profile.milestone_enabled === true) &&
    (profile.milestone_amount || 0) > 0;

  const milestoneTarget = profile?.milestone_amount || 0;

  const progress =
    milestoneTarget > 0
      ? Math.min(1, totalEarned / milestoneTarget)
      : 0;

  const progressPercent =
    Math.round(progress * 100);

  const handleCopy = async () => {
    if (!username) return;

    await navigator.clipboard.writeText(pageUrl);
    setCopied(true);

    if (copiedTimer.current) {
      window.clearTimeout(copiedTimer.current);
    }

    copiedTimer.current =
      window.setTimeout(() => setCopied(false), 1600);
  };

  const handleOpenMyPage = () => {
    if (!username) return;
    window.open(pageUrl, "_blank", "noopener,noreferrer");
  };

  const handleShare = async () => {
    if (!username) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile?.profile_name || username} on EverPay`,
          text: `Support ${profile?.profile_name || username} on EverPay`,
          url: pageUrl,
        });
      } else {
        await navigator.clipboard.writeText(pageUrl);
        setCopied(true);
      }
    } catch {
      console.log("Share cancelled");
    }
  };

  if (status === "loading") return null;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: PAGE_BG }}
    >
      <div className="max-w-7xl mx-auto px-6 text-white pt-10 pb-32">

        {profile && (
          <div className={`w-full ${PANEL} p-8 flex items-center gap-6 mb-10`}>
            <div className="w-28 h-28 rounded-full border-[5px] border-white/30 overflow-hidden shadow-xl">
              {profile.avatar_url && (
                <img
                  src={profile.avatar_url}
                  alt="Creator avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div>
              <h1 className="text-4xl font-bold uppercase">
                {profile.profile_name}
              </h1>
              <p className="text-sm text-white/60">@{username}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8">

          <div className="space-y-8">
            {milestoneEnabled && (
              <div className={`${PANEL} px-6 py-5`}>
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
                  })} raised
                </p>

                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-400 to-emerald-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className={`${PANEL} p-6`}>
              <p className="text-sm uppercase text-white/60">
                Total Earnings
              </p>

              <p className="text-5xl font-bold">
                £{formattedTotal}
              </p>
            </div>

            <div className={`${PANEL} p-6 space-y-4`}>
              <p className="text-sm text-center">
                Share your gift page 🌍
              </p>

              <div
                className={`${SUBPANEL} rounded-xl px-4 py-2 text-xs sm:text-sm text-white/70 break-all`}
              >
                {pageUrl}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleCopy}
                  className="py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold"
                >
                  {copied ? "Copied ✓" : "Copy Link"}
                </button>

                <button
                  onClick={handleOpenMyPage}
                  className="py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold"
                >
                  View My Gift Page
                </button>

                <button
                  onClick={() => setShowQRModal(true)}
                  className="py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold"
                >
                  📷 Show Live Stream QR
                </button>

                <button
                  onClick={handleShare}
                  className="py-3 rounded-xl bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-semibold"
                >
                  Share Page
                </button>
              </div>
            </div>
          </div>

          <div className={`${PANEL} p-6`}>
            <h2 className="text-2xl font-semibold mb-5 text-center">
              Recent Gifts
            </h2>

            {payments.slice(0, 5).map((p) => (
              <div
                key={p.id}
                className="bg-black/20 border border-white/12 rounded-xl p-4 mb-2 flex justify-between"
              >
                <div>
                  <p className="text-sm">
                    {p.anonymous
                      ? "Anonymous"
                      : p.gift_name || "Someone"}
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

        {showQRModal && (
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-6 shadow-2xl text-center">
              <QRCode value={pageUrl} size={220} />

              <p className="mt-3 text-xs text-slate-500">
                Powered by <strong>EverPay</strong>
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
  );
}
