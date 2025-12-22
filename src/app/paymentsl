async function getPayments() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${apiUrl}/api/payments`, {
    cache: "no-store",
  });

  return res.json();
}

export default async function PaymentsList() {
  const payments = await getPayments();

  if (!payments || payments.length === 0) {
    return (
      <p className="text-gray-500 text-sm">
        No payments yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {payments.map((p: any) => (
        <div
          key={p.id}
          className="p-3 bg-white/5 rounded-lg border border-white/10 flex justify-between"
        >
          <div>
            <p className="text-white text-sm font-medium">
              {p.email || "—"}
            </p>
            <p className="text-gray-400 text-xs">
              {new Date(p.created_at).toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <p className="text-emerald-400 font-semibold">
              £{(p.amount / 100).toFixed(2)}
            </p>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                p.status === "paid"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-300/20"
                  : "bg-yellow-500/20 text-yellow-300 border border-yellow-300/20"
              }`}
            >
              {p.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
