export default function HelpPage() {
  return (
    <main className="min-h-screen bg-[#0B0D12] text-white px-6 py-16 flex justify-center">
      <div className="w-full max-w-3xl space-y-10">

        <div>
          <h1 className="text-3xl font-bold mb-2">Help & Support</h1>
          <p className="text-white/70">
            Need help with EverPay? Here are answers to the most common questions.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Where do my gifts go?</h2>
          <p className="text-white/70 text-sm">
            All gifts are processed securely through Stripe and paid directly
            to your connected Stripe account.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">How do payouts work?</h2>
          <p className="text-white/70 text-sm">
            Once you connect Stripe in Settings, gifts are sent to your Stripe
            account and paid out to your bank automatically.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">How do I start receiving gifts?</h2>
          <p className="text-white/70 text-sm">
            Create your account, connect Stripe in Settings, and share your
            EverPay link with supporters.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-2">Need more help?</h2>
          <p className="text-white/70 text-sm">
            Contact our support team and we’ll respond as soon as possible.
          </p>

          <p className="mt-3 text-sm font-medium">
            support@everpayapp.co.uk
          </p>
        </div>

      </div>
    </main>
  );
}
