import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen text-white px-6 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-2xl font-extrabold tracking-tight">
            EverPay
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-sm font-semibold"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2EE4A5] to-[#41E8A5] text-black hover:opacity-90 transition text-sm font-semibold"
            >
              Create your page
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 md:p-10 shadow-2xl">
          <h1 className="text-3xl md:text-4xl font-extrabold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-white/60">Last updated: February 2026</p>

          <div className="mt-6 space-y-6 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-white">1. What we collect</h2>
              <p className="mt-2">
                We collect information needed to operate EverPay, such as account details (email, username),
                creator profile info you choose to provide (name, bio, links, profile picture), and basic usage data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">2. Payments</h2>
              <p className="mt-2">
                Payments are processed by Stripe. EverPay does not store full card details. We may store limited
                payment-related metadata (e.g., amount, time, creator, status) to show receipts and recent gifts.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">3. How we use data</h2>
              <p className="mt-2">
                We use data to provide the service, improve reliability, prevent fraud, provide support, and comply with
                legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">4. Sharing</h2>
              <p className="mt-2">
                We share data with service providers only as needed to run EverPay (for example, Stripe for payments).
                We do not sell your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">5. Data retention</h2>
              <p className="mt-2">
                We retain information only as long as necessary for the service, legal compliance, and fraud
                prevention.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">6. Your rights</h2>
              <p className="mt-2">
                You may request access, correction, or deletion of your data where applicable. You can also
                delete your account from the creator dashboard where available.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">7. Cookies &amp; analytics</h2>
              <p className="mt-2">
                We may use privacy-friendly analytics to understand usage and improve EverPay. We do not sell your
                personal data.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">8. Contact</h2>
              <p className="mt-2">
                For privacy requests, email{" "}
                <a className="underline hover:text-white" href="mailto:support@everpayapp.co.uk">
                  support@everpayapp.co.uk
                </a>
                .
              </p>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <Link href="/" className="text-sm text-white/70 hover:text-white transition">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
