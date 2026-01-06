// ~/everpay-frontend/src/app/components/PaymentModal.tsx
"use client";

export type Payment = {
  id: string;
  amount: number;
  status?: string | null;
  created_at?: string | null;

  // optional gift fields you use across EverPay
  gift_name?: string | null;
  gift_message?: string | null;
  anonymous?: number | boolean | null;

  // optional extras
  email?: string | null;
  creator?: string | null;
  profile_name?: string | null;
};

type Props = {
  payment: Payment | null;
  onClose: () => void;
};

export default function PaymentModal({ payment, onClose }: Props) {
  if (!payment) return null;

  const amountGBP = `£${((payment.amount || 0) / 100).toFixed(2)}`;
  const who = payment.anonymous
    ? "Anonymous"
    : payment.gift_name?.trim()
    ? payment.gift_name
    : "Someone";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-white/60">Payment</p>
            <p className="text-lg font-semibold text-white">{payment.id}</p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            Close
          </button>
        </div>

        <div className="p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70">From</p>
            <p className="font-semibold">{who}</p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70">Amount</p>
            <p className="text-2xl font-bold">{amountGBP}</p>
          </div>

          {payment.gift_message && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase text-white/60 mb-1">Message</p>
              <p className="text-sm italic text-white/90">
                “{payment.gift_message}”
              </p>
            </div>
          )}

          <div className="mt-6 text-xs text-white/60 flex justify-between">
            <span>Status: {payment.status || "unknown"}</span>
            <span>
              {payment.created_at
                ? new Date(payment.created_at).toLocaleString()
                : ""}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
