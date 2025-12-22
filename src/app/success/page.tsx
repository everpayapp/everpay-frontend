export default function Success() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl font-bold text-emerald-400 mb-4">✅ Payment Successful</h1>
      <p className="text-gray-300 mb-8">Thank you! Your payment was processed.</p>
      <a
        href="/"
        className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90"
      >
        Return to Dashboard
      </a>
    </main>
  );
}
