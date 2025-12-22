"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Payment = {
  id: string;
  amount: number;
  gift_name?: string;
  gift_message?: string;
  anonymous?: number;
  created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// Helper: format GBP nicely
const formatGBP = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);

export default function CreatorPaymentsPage() {
  // 🔐 AUTH
  const { status, data: session } = useSession();
  const router = useRouter();

  // ✅ SESSION-BASED USERNAME
  const username =
    session?.user?.username ||
    session?.user?.email?.split("@")[0] ||
    "lee";

  // STATE
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔐 Redirect if logged out
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  // Load payments
  useEffect(() => {
    if (status !== "authenticated") return;

    async function load() {
      try {
        const res = await fetch(
          `${API_URL}/api/payments/creator/${username}`
        );
        const data = await res.json();
        setPayments(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load creator payments", e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [status, username]);

  // ⛔ Wait for auth resolution
  if (status === "loading") {
    return null;
  }

  // 📅 Calculate TODAY’s earnings (local day)
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const todaysTotal =
    payments
      .filter(
        (p) => new Date(p.created_at) >= startOfToday
      )
      .reduce((sum, p) => sum + p.amount, 0) / 100;

  return (
    <main className="max-w-4xl mx-auto mt-10 text-white">
      <h1 className="text-2xl font-semibold mb-6">
        Creator Payments
      </h1>

      {/* TODAY’S EARNINGS */}
      <div className="mb-8 bg-black/40 border border-white/10 rounded-2xl p-6 text-center">
        <p className="text-sm uppercase text-white/60 mb-1">
          Today
        </p>
        <p className="text-4xl font-bold">
          {formatGBP(todaysTotal)}
        </p>
      </div>

      {loading ? (
        <p className="text-white/70">Loading payments…</p>
      ) : payments.length === 0 ? (
        <p className="text-white/70">No payments yet.</p>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => (
            <div
              key={p.id}
              className="bg-black/40 border border-white/10 rounded-xl p-4 flex justify-between"
            >
              <div>
                <p className="font-semibold">
                  {formatGBP(p.amount / 100)}
                </p>
                <p className="text-xs text-white/70">
                  {p.anonymous
                    ? "Anonymous"
                    : p.gift_name || "Someone"}{" "}
                  {p.gift_message
                    ? `— "${p.gift_message}"`
                    : ""}
                </p>
              </div>
              <div className="text-xs text-white/60 whitespace-nowrap">
                {new Date(p.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
