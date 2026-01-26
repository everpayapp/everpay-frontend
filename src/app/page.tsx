import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1623] via-[#0E1B2A] to-[#090E14] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        {/* HERO */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-12 shadow-2xl">
          <div className="max-w-2xl">
            <p className="text-sm tracking-wide text-white/60">
              EverPay • Creator-first gifting
            </p>

            <h1 className="mt-3 text-4xl md:text-5xl font-semibold leading-tight">
              Get gifted in seconds.
              <span className="block text-white/70">
                One clean link your fans can trust.
              </span>
            </h1>

            <p className="mt-5 text-base md:text-lg text-white/70">
              EverPay lets creators share a simple page where supporters can send a gift fast.
              UK-first launch — with instant-style bank payments as the goal.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white text-black px-5 py-3 font-medium hover:bg-white/90 transition"
              >
                Create your page
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 text-white px-5 py-3 font-medium hover:bg-white/5 transition"
              >
                Log in
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/60">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Secure checkout
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Built for creators
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                UK-first
              </span>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold">How it works</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-white/70 text-sm">Step 1</p>
              <h3 className="mt-2 text-lg font-semibold">Create your page</h3>
              <p className="mt-2 text-white/70">
                Set your name, avatar and links. Your page becomes your one shareable link.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-white/70 text-sm">Step 2</p>
              <h3 className="mt-2 text-lg font-semibold">Share it anywhere</h3>
              <p className="mt-2 text-white/70">
                Put it on TikTok, Instagram, YouTube, Twitch — anywhere your fans are.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-white/70 text-sm">Step 3</p>
              <h3 className="mt-2 text-lg font-semibold">Supporters send a gift</h3>
              <p className="mt-2 text-white/70">
                Fans choose an amount, add a message, and complete checkout in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* WHY EVERPAY */}
        <section className="mt-14">
          <h2 className="text-2xl md:text-3xl font-semibold">Why EverPay</h2>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Built for trust</h3>
              <p className="mt-2 text-white/70">
                Clean pages, consistent branding, and a payment flow supporters understand.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">UK-first, global next</h3>
              <p className="mt-2 text-white/70">
                Launching UK-first. Instant bank payments are the long-term goal.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Creator-first features</h3>
              <p className="mt-2 text-white/70">
                QR gifting, milestones, recent gifts — built around creators and supporters.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Secure by design</h3>
              <p className="mt-2 text-white/70">
                Password reset, secure auth, and a backend already live and stable.
              </p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mt-14">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold">
                Ready to set up your page?
              </h2>
              <p className="mt-2 text-white/70">
                Create your EverPay page in minutes — then share your link everywhere.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-xl bg-white text-black px-5 py-3 font-medium hover:bg-white/90 transition"
              >
                Get started
              </Link>
              <Link
                href="/creator/lee"
                className="inline-flex items-center justify-center rounded-xl border border-white/15 text-white px-5 py-3 font-medium hover:bg-white/5 transition"
              >
                View an example
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-14 pb-10 text-sm text-white/50">
          <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-start md:items-center justify-between border-t border-white/10 pt-6">
            <p>© {new Date().getFullYear()} EverPay</p>
            <div className="flex gap-4">
              <Link className="hover:text-white/70" href="/login">
                Login
              </Link>
              <Link className="hover:text-white/70" href="/signup">
                Sign up
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
