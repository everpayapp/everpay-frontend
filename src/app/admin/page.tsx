// ~/everpay-frontend/src/app/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const OWNER_EMAIL = "lee@everpayapp.co.uk";

type AdminStatsResponse = {
  totals: {
    total_users: number;
    connected_creators: number;
    total_gifts: number;
    gift_volume_pence: number;
    everpay_revenue_pence: number;
    total_net_payouts_pence: number;
  };
  recent_signups: Array<{
    username: string;
    email?: string;
    profile_name?: string;
    stripe_account_id?: string;
    updated_at?: string;
  }>;
  recent_gifts: Array<{
    id: string;
    creator: string;
    gift_name?: string;
    anonymous?: number;
    gift_message?: string;
    gift_amount?: number;
    fee_amount?: number;
    stripe_fee_amount?: number;
    net_amount?: number;
    created_at?: string;
    status?: string;
  }>;
};

const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-black/20 border border-white/12 rounded-2xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/55 mb-2">
        {label}
      </p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function AdminPage() {
  const { status, data: session } = useSession();
  const router = useRouter();

  const [data, setData] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const email = String(session?.user?.email || "").trim().toLowerCase();
  const isOwner = email === OWNER_EMAIL;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!isOwner) return;

    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/admin/stats?email=${encodeURIComponent(email)}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Failed to load admin stats");
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status, isOwner, email]);

  const totals = useMemo(
    () => ({
      totalUsers: data?.totals?.total_users || 0,
      connectedCreators: data?.totals?.connected_creators || 0,
      totalGifts: data?.totals?.total_gifts || 0,
      giftVolume: (data?.totals?.gift_volume_pence || 0) / 100,
      everpayRevenue: (data?.totals?.everpay_revenue_pence || 0) / 100,
      totalNetPayouts: (data?.totals?.total_net_payouts_pence || 0) / 100,
    }),
    [data]
  );

  if (status === "loading") return null;

  if (!isOwner) {
    return (
      <div className="min-h-screen bg-[#0B0D12] text-white px-6 py-16">
        <div className="max-w-3xl mx-auto bg-black/20 border border-white/12 rounded-3xl p-8">
          <h1 className="text-2xl font-semibold mb-2">Access denied</h1>
          <p className="text-white/65">
            This page is available to the EverPay owner only.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0D12] text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/45 mb-2">
            Owner only
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold">
            EverPay Admin
          </h1>
          <p className="text-white/60 mt-2">
            Platform overview, recent signups, and recent gifts.
          </p>
        </div>

        {loading ? (
          <p className="text-white/70">Loading admin stats…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
              <StatCard label="Total users" value={totals.totalUsers} />
              <StatCard label="Connected creators" value={totals.connectedCreators} />
              <StatCard label="Total gifts" value={totals.totalGifts} />
              <StatCard label="Gift volume" value={formatGBP(totals.giftVolume)} />
              <StatCard label="EverPay revenue" value={formatGBP(totals.everpayRevenue)} />
              <StatCard label="Net creator payouts" value={formatGBP(totals.totalNetPayouts)} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <section className="bg-black/20 border border-white/12 rounded-3xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
                <h2 className="text-xl font-semibold mb-4">Recent signups</h2>
                <div className="space-y-3">
                  {(data?.recent_signups || []).map((user) => (
                    <div
                      key={`${user.username}-${user.updated_at}`}
                      className="border border-white/10 rounded-2xl p-4 bg-black/20"
                    >
                      <p className="font-medium text-white">
                        {user.profile_name || user.username}
                      </p>
                      <p className="text-sm text-white/65">@{user.username}</p>
                      <p className="text-sm text-white/65">{user.email || "No email"}</p>
                      <p className="text-xs text-white/45 mt-2">
                        Stripe connected: {user.stripe_account_id ? "Yes" : "No"}
                      </p>
                      <p className="text-xs text-white/45">
                        Updated:{" "}
                        {user.updated_at
                          ? new Date(user.updated_at).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  ))}
                  {(!data?.recent_signups || data.recent_signups.length === 0) && (
                    <p className="text-white/60">No recent signups found.</p>
                  )}
                </div>
              </section>

              <section className="bg-black/20 border border-white/12 rounded-3xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
                <h2 className="text-xl font-semibold mb-4">Recent gifts</h2>
                <div className="space-y-3">
                  {(data?.recent_gifts || []).map((gift) => {
                    const giftAmount = Number(gift.gift_amount || 0) / 100;
                    const netAmount =
                      Number(gift.net_amount || 0) > 0
                        ? Number(gift.net_amount || 0) / 100
                        : Number(gift.gift_amount || 0) / 100;

                    return (
                      <div
                        key={gift.id}
                        className="border border-white/10 rounded-2xl p-4 bg-black/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-white">
                              {gift.anonymous ? "Anonymous" : gift.gift_name || "Someone"}
                            </p>
                            <p className="text-sm text-white/65">
                              Creator: @{gift.creator}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-white">
                              Gift {formatGBP(giftAmount)}
                            </p>
                            <p className="text-sm text-emerald-300">
                              Net {formatGBP(netAmount)}
                            </p>
                          </div>
                        </div>

                        {gift.gift_message ? (
                          <p className="text-sm text-white/70 mt-2">
                            “{gift.gift_message}”
                          </p>
                        ) : null}

                        <p className="text-xs text-white/45 mt-2">
                          {gift.created_at
                            ? new Date(gift.created_at).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    );
                  })}
                  {(!data?.recent_gifts || data.recent_gifts.length === 0) && (
                    <p className="text-white/60">No recent gifts found.</p>
                  )}
                </div>
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
