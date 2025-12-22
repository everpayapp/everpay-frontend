export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-10 animate-fadeIn">
      {/* 🌈 Page Title */}
      <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
        Settings
      </h1>
      <p className="text-gray-400">
        Manage your EverPay profile, business information, and preferences.
      </p>

      {/* 👤 Profile */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Profile
        </h2>

        <input
          type="text"
          placeholder="Your Name"
          defaultValue="Lee"
          className="w-full bg-[#0d1722] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
        />

        <input
          type="email"
          placeholder="Email Address"
          defaultValue="admin@everpay.co.uk"
          className="w-full bg-[#0d1722] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
        />

        <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 text-white font-semibold hover:opacity-90 transition">
          Save Profile
        </button>
      </section>

      {/* 🏢 Business Details */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Business Details
        </h2>

        <input
          type="text"
          placeholder="Business Name"
          defaultValue="EverPay Ltd"
          className="w-full bg-[#0d1722] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
        />

        <input
          type="text"
          placeholder="Company Registration No."
          defaultValue="13579964"
          className="w-full bg-[#0d1722] border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-400"
        />

        <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 text-white font-semibold hover:opacity-90 transition">
          Save Business Info
        </button>
      </section>

      {/* 🔔 Notifications */}
      <section className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 backdrop-blur">
        <h2 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          Notifications
        </h2>

        {[
          "Email me when a payment succeeds",
          "Email me if a payment fails",
          "Send me payout summaries",
        ].map((label) => (
          <label key={label} className="flex items-center gap-3 text-sm text-gray-300">
            <input type="checkbox" className="w-4 h-4 accent-emerald-400" defaultChecked />
            {label}
          </label>
        ))}

        <button className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 text-white font-semibold hover:opacity-90 transition">
          Save Notification Settings
        </button>
      </section>
    </div>
  );
}
