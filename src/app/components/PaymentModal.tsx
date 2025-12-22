"use client";

export default function PaymentModal({ payment, onClose }) {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal box */}
      <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-xl w-full max-w-md animate-fadeIn">
        <h2 className="text-xl font-semibold text-white mb-4">Payment Details</h2>

        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <span className="text-gray-400">Email:</span>
            <br />
            {payment.email}
          </div>
          <div>
            <span className="text-gray-400">Amount:</span>
            <br />
            £{(payment.amount / 100).toLocaleString()}
          </div>
          <div>
            <span className="text-gray-400">Status:</span>
            <br />
            {payment.status}
          </div>
          <div>
            <span className="text-gray-400">Date:</span>
            <br />
            {new Date(payment.created_at).toLocaleString()}
          </div>
          <div>
            <span className="text-gray-400">Session ID:</span>
            <br />
            <code className="text-xs">{payment.id}</code>
          </div>
        </div>

        <button
          className="w-full mt-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition font-medium"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
