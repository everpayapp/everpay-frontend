import PaymentsTable from "./PaymentsTable";
import { Suspense } from "react";

async function getPayments() {
  try {
    // ❗ Use internal backend URL on server to avoid NEXT_PUBLIC leakage
    const backendUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(`${backendUrl}/api/payments`, {
      cache: "no-store",
      // Force revalidation on each view (SSR-friendly)
      next: { revalidate: 0 },
    });

    if (!res.ok) throw new Error("Failed to fetch payments");

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("💥 Error fetching payments:", err);
    return [];
  }
}

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          All Payments
        </h1>

        <a
          href="/"
          className="text-sm text-cyan-400 hover:underline hover:text-white transition"
        >
          ← Back to Dashboard
        </a>
      </div>

      {payments.length > 0 ? (
        <Suspense
          fallback={
            <p className="text-gray-400 text-sm text-center mt-10">
              Loading payment records…
            </p>
          }
        >
          <PaymentsTable initialPayments={payments} />
        </Suspense>
      ) : (
        <div className="text-gray-400 text-center mt-20">
          No payments found yet 💷
        </div>
      )}
    </div>
  );
}
