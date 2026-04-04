// ~/everpay-frontend/src/app/admin/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const OWNER_EMAIL = "lee@everpayapp.co.uk";

type UserRow = {
  username: string;
  email?: string;
  profile_name?: string;
  stripe_account_id?: string;
  updated_at?: string;
  gifts_count: number;
  gross_volume_pence: number;
  net_volume_pence: number;
  everpay_revenue_pence: number;
  last_gift_at?: string | null;
};

type GiftRow = {
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
  profile_name?: string;
};

type AdminStatsResponse = {
  totals: {
    total_users: number;
    connected_creators: number;
    total_gifts: number;
    gift_volume_pence: number;
    everpay_revenue_pence: number;
    total_net_payouts_pence: number;
  };
  users: UserRow[];
  recent_gifts: GiftRow[];
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
  const [search, setSearch] = useState("");
  const [stripeOnly, setStripeOnly] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);

  const email = String(session?.user?.email || "").trim().toLowerCase();
  const isOwner = email === OWNER_EMAIL;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    if (!isOwner) {
      setLoading(false);
      return;
    }

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

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (data?.users || [])
      .filter((user) =>
        stripeOnly ? !!(user.stripe_account_id && user.stripe_account_id.trim()) : true
      )
      .filter((user) => {
        if (!q) return true;
        return (
          String(user.profile_name || "").toLowerCase().includes(q) ||
          String(user.username || "").toLowerCase().includes(q) ||
          String(user.email || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.net_volume_pence - a.net_volume_pence);
  }, [data, search, stripeOnly]);

  const selectedUser =
    filteredUsers.find((user) => user.username === selectedUsername) || null;

  const selectedUserRecentGifts = useMemo(() => {
    if (!selectedUser) return [];
    return (data?.recent_gifts || []).filter(
      (gift) => String(gift.creator || "").toLowerCase() === selectedUser.username.toLowerCase()
    );
  }, [data, selectedUser]);

  useEffect(() => {
    if (!selectedUsername && filteredUsers.length > 0) {
      setSelectedUsername(filteredUsers[0].username);
    } else if (
      selectedUsername &&
      !filteredUsers.some((user) => user.username === selectedUsername)
    ) {
      setSelectedUsername(filteredUsers[0]?.username || null);
    }
  }, [filteredUsers, selectedUsername]);

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
          <h1 className="text-3xl sm:text-4xl font-semibold">EverPay Admin</h1>
          <p className="text-white/60 mt-2">
            Platform overview, full creator list, and individual earnings.
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

            <div className="grid grid-cols-1 xl:grid-cols-[1.35fr_0.95fr] gap-6">
              <section className="bg-black/20 border border-white/12 rounded-3xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">Creators</h2>
                    <p className="text-sm text-white/55 mt-1">
                      Search every user and click one to view their earnings.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name, username, email…"
                      className="w-full sm:w-[280px] bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/35 outline-none"
                    />
                    <button
                      onClick={() => setStripeOnly((v) => !v)}
                      className={`px-4 py-2.5 rounded-xl text-sm border ${
                        stripeOnly
                          ? "bg-white/10 border-white/20"
                          : "bg-transparent border-white/10 text-white/70"
                      }`}
                    >
                      Stripe only: {stripeOnly ? "ON" : "OFF"}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-white/10">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="bg-white/5 text-white/60">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium">Creator</th>
                        <th className="text-left px-4 py-3 font-medium">Email</th>
                        <th className="text-left px-4 py-3 font-medium">Stripe</th>
                        <th className="text-right px-4 py-3 font-medium">Gifts</th>
                        <th className="text-right px-4 py-3 font-medium">Gross</th>
                        <th className="text-right px-4 py-3 font-medium">Net</th>
                        <th className="text-right px-4 py-3 font-medium">EVP Rev</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => {
                        const active = selectedUsername === user.username;

                        return (
                          <tr
                            key={user.username}
                            onClick={() => setSelectedUsername(user.username)}
                            className={`border-t border-white/10 cursor-pointer transition ${
                              active ? "bg-white/10" : "hover:bg-white/[0.04]"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <div>
                                <p className="font-medium text-white">
                                  {user.profile_name || user.username}
                                </p>
                                <p className="text-white/50 text-xs">@{user.username}</p>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-white/70">
                              {user.email || "No email"}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs border ${
                                  user.stripe_account_id
                                    ? "border-emerald-400/30 text-emerald-300 bg-emerald-500/10"
                                    : "border-white/10 text-white/50 bg-white/5"
                                }`}
                              >
                                {user.stripe_account_id ? "Connected" : "Not connected"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">{user.gifts_count}</td>
                            <td className="px-4 py-3 text-right">
                              {formatGBP(user.gross_volume_pence / 100)}
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-emerald-300">
                              {formatGBP(user.net_volume_pence / 100)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {formatGBP(user.everpay_revenue_pence / 100)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="bg-black/20 border border-white/12 rounded-3xl p-5 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
                <h2 className="text-xl font-semibold mb-4">Creator details</h2>

                {!selectedUser ? (
                  <p className="text-white/60">Select a creator to view details.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="border border-white/10 rounded-2xl p-4 bg-black/20">
                      <p className="text-xl font-semibold">
                        {selectedUser.profile_name || selectedUser.username}
                      </p>
                      <p className="text-white/60 text-sm mt-1">
                        @{selectedUser.username}
                      </p>
                      <p className="text-white/60 text-sm">
                        {selectedUser.email || "No email"}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-[11px] uppercase text-white/45 mb-1">Gifts</p>
                          <p className="font-semibold">{selectedUser.gifts_count}</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-[11px] uppercase text-white/45 mb-1">Stripe</p>
                          <p className="font-semibold">
                            {selectedUser.stripe_account_id ? "Connected" : "Not connected"}
                          </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-[11px] uppercase text-white/45 mb-1">Gross</p>
                          <p className="font-semibold">
                            {formatGBP(selectedUser.gross_volume_pence / 100)}
                          </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                          <p className="text-[11px] uppercase text-white/45 mb-1">Net earned</p>
                          <p className="font-semibold text-emerald-300">
                            {formatGBP(selectedUser.net_volume_pence / 100)}
                          </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-xl p-3 col-span-2">
                          <p className="text-[11px] uppercase text-white/45 mb-1">
                            EverPay revenue from creator
                          </p>
                          <p className="font-semibold">
                            {formatGBP(selectedUser.everpay_revenue_pence / 100)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <a
                          href={`/creator/${encodeURIComponent(selectedUser.username)}`}
                          target="_blank"
                          className="px-4 py-2 rounded-xl bg-white text-black text-sm font-medium"
                        >
                          View public page
                        </a>
                      </div>

                      <p className="text-xs text-white/45 mt-4">
                        Last updated:{" "}
                        {selectedUser.updated_at
                          ? new Date(selectedUser.updated_at).toLocaleString()
                          : "—"}
                      </p>
                      <p className="text-xs text-white/45">
                        Last gift:{" "}
                        {selectedUser.last_gift_at
                          ? new Date(selectedUser.last_gift_at).toLocaleString()
                          : "No gifts yet"}
                      </p>
                    </div>

                    <div className="border border-white/10 rounded-2xl p-4 bg-black/20">
                      <h3 className="font-semibold mb-3">Recent gifts for this creator</h3>

                      <div className="space-y-3">
                        {selectedUserRecentGifts.length === 0 ? (
                          <p className="text-white/55 text-sm">No recent gifts found.</p>
                        ) : (
                          selectedUserRecentGifts.map((gift) => {
                            const gross = Number(gift.gift_amount || 0) / 100;
                            const net =
                              Number(gift.net_amount || 0) > 0
                                ? Number(gift.net_amount || 0) / 100
                                : gross;

                            return (
                              <div
                                key={gift.id}
                                className="border border-white/10 rounded-xl p-3 bg-white/[0.02]"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="font-medium">
                                      {gift.anonymous
                                        ? "Anonymous"
                                        : gift.gift_name || "Someone"}
                                    </p>
                                    {gift.gift_message ? (
                                      <p className="text-sm text-white/65 mt-1">
                                        “{gift.gift_message}”
                                      </p>
                                    ) : null}
                                  </div>

                                  <div className="text-right">
                                    <p className="text-sm text-white">
                                      Gift {formatGBP(gross)}
                                    </p>
                                    <p className="text-sm text-emerald-300">
                                      Net {formatGBP(net)}
                                    </p>
                                  </div>
                                </div>

                                <p className="text-xs text-white/45 mt-2">
                                  {gift.created_at
                                    ? new Date(gift.created_at).toLocaleString()
                                    : "—"}
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
