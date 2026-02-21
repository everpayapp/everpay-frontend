import Link from "next/link";

export default function TermsPage() {
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
          <h1 className="text-3xl md:text-4xl font-extrabold">Terms &amp; Conditions</h1>
          <p className="mt-2 text-sm text-white/60">Last updated: February 2026</p>

          <div className="mt-6 space-y-6 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-white">1. About EverPay</h2>
              <p className="mt-2">
                EverPay provides tools for creators to receive gifts from supporters via a secure checkout.
                Payments are processed by Stripe. EverPay does not store card details. EverPay is not a bank
                and does not provide financial advice.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">2. Eligibility</h2>
              <p className="mt-2">
                You must be at least 18 years old (or the age of majority in your location) to create an EverPay account
                and receive payouts.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">3. Payments &amp; Payouts</h2>
              <p className="mt-2">
                Supporter payments are handled by Stripe. Payout speed depends on bank and Stripe settings.
                EverPay does not guarantee payout timing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">4. Fees</h2>
              <p className="mt-2">
                Any applicable fees are shown clearly in the experience. EverPay may use a portion of fees to fund
                features like monthly prize pools (where offered). Prize pool totals can change as gifts are made.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">5. Prohibited Use</h2>
              <p className="mt-2">
                You may not use EverPay for illegal activity, fraud, scams, harassment, or to sell restricted goods/services.
                We may suspend accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">6. Content &amp; Creator Pages</h2>
              <p className="mt-2">
                You are responsible for the content and links you publish on your creator page. Do not post content that
                infringes rights or violates applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">7. Limitation of Liability</h2>
              <p className="mt-2">
                EverPay is provided “as is”. To the maximum extent permitted by law, EverPay is not liable for indirect or
                consequential losses. Stripe’s terms also apply to payment processing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-white">8. Contact</h2>
              <p className="mt-2">
                Questions? Email us at{" "}
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

