export default function Cancel() {
  return (
    <main className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="text-4xl font-bold text-yellow-400 mb-4">⚠️ Payment Cancelled</h1>
      <p className="text-gray-300 mb-8">No charge was made.</p>
      <a
        href="/"
        className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90"
      >
        Back to Dashboard
      </a>
    </main>
  );
}
