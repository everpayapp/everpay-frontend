"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { QRCodeCanvas } from "qrcode.react";
import PaymentsList from "./PaymentsList";

export default function Home() {
  const [amountInput, setAmountInput] = useState("0.00");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showToast, setShowToast] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ✅ Detect Stripe redirect success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setShowSuccess(true);
      setAmountInput("0.00");
      setAmount(0);
      if (window.localStorage) {
        window.localStorage.setItem("refreshPayments", Date.now().toString());
      }
      setTimeout(() => setShowSuccess(false), 6000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // ✅ Auto-detect new payments and close QR instantly
  useEffect(() => {
    let lastCheck = Date.now();

    const checkPayments = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments`);
        const payments = await res.json();
        if (payments?.length) {
          const latest = new Date(payments[0].created_at).getTime();
          if (latest > lastCheck) {
            console.log("💷 New payment detected — closing QR and showing banner");
            setShowModal(false);
            setShowSuccess(true);
            lastCheck = Date.now();
            setTimeout(() => setShowSuccess(false), 6000);
            if (window.localStorage) {
              window.localStorage.setItem("refreshPayments", Date.now().toString());
            }
          }
        }
      } catch (err) {
        console.warn("🔁 Auto-refresh failed:", err);
      }
    };

    const interval = setInterval(checkPayments, 5000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Format input
  const formatWithCommas = (value: string) => {
    if (!value) return "";
    const [intPart, decPart] = value.split(".");
    const intDigits = intPart.replace(/\D/g, "");
    const withCommas = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return decPart !== undefined ? `${withCommas}.${decPart}` : withCommas;
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const raw = el.value.replace(/,/g, "");
    const cursorPos = el.selectionStart || 0;

    let clean = raw.replace(/[^\d.]/g, "");
    const firstDot = clean.indexOf(".");
    if (firstDot !== -1) {
      clean = clean.slice(0, firstDot + 1) + clean.slice(firstDot + 1).replace(/\./g, "");
    }
    clean = clean.replace(/^(\d+)(\.\d{0,2}).*$/, (_, a, b) => a + b);

    const formatted = formatWithCommas(clean);
    setAmountInput(formatted);
    const numeric = parseFloat(clean);
    if (!isNaN(numeric)) setAmount(numeric);

    requestAnimationFrame(() => {
      if (inputRef.current) {
        const leftOfCaretRaw = raw.slice(0, cursorPos);
        const leftOfCaretFormatted = formatWithCommas(leftOfCaretRaw);
        const newPos = leftOfCaretFormatted.length;
        inputRef.current.setSelectionRange(newPos, newPos);
      }
    });
  };

  const formatDisplay = (value: number) =>
    value.toLocaleString("en-UK", { minimumFractionDigits: 2 });

  // ✅ Pay (Stripe Checkout)
  const handlePay = async () => {
    if (isNaN(amount) || amount <= 0) {
      setShowToast("Enter a valid amount");
      setTimeout(() => setShowToast(null), 2500);
      setShowModal(false);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/pay?amount=${amount}`);
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        setShowToast("Failed to start payment");
        setTimeout(() => setShowToast(null), 2500);
        setShowModal(false);
      }
    } catch (err) {
      console.error("❌ Error during payment:", err);
      setShowToast("Something went wrong. Try again.");
      setTimeout(() => setShowToast(null), 2500);
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Generate Link (QR + SMS)
  const handleGenerate = async () => {
    if (isNaN(amount) || amount <= 0) {
      setShowToast("Enter a valid amount");
      setTimeout(() => setShowToast(null), 2500);
      setShowModal(false);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const res = await fetch(`${apiUrl}/pay?amount=${amount}`);
      const data = await res.json();
      if (data?.url) {
        setLink(data.url);
        setShowModal(true);
        setAmountInput("0.00");
        setAmount(0);
        setShowToast("Payment link generated ✅");
        setTimeout(() => setShowToast(null), 2500);
      } else {
        setShowToast("Failed to generate link");
        setTimeout(() => setShowToast(null), 2500);
        setShowModal(false);
      }
    } catch (err) {
      console.error("❌ Error generating link:", err);
      setShowToast("Something went wrong. Try again.");
      setTimeout(() => setShowToast(null), 2500);
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ JSX
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0B1623] via-[#0E1B2A] to-[#090E14] text-white p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 💳 Accept Payment */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-white">Accept Payment</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Enter an amount in pounds (£) to generate or process a secure payment.
          </p>

          <label className="text-sm text-gray-300 mb-2 block">Amount (£)</label>
          <input
            ref={inputRef}
            type="text"
            value={amountInput}
            onChange={handleInput}
            inputMode="decimal"
            placeholder="0.00"
            className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white focus:outline-none focus:border-cyan-400"
          />

          <div className="flex flex-col gap-3 mt-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Generating…" : `Generate £${formatDisplay(amount)} Link`}
            </button>

            <button
              onClick={handlePay}
              disabled={loading}
              className="py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Processing…" : `Pay £${formatDisplay(amount)}`}
            </button>
          </div>

          <div className="border-t border-gray-200 mt-6 pt-4 text-center text-xs text-gray-400">
            Secure payments powered by <span className="font-semibold text-gray-500">EverPay</span>
            <br />
            Protected by Stripe ✅
          </div>
        </div>

        {/* 🧾 Recent Payments */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Recent Payments</h2>
            <a href="/payments" className="text-cyan-400 text-sm hover:underline">
              View All →
            </a>
          </div>
          <Suspense fallback={<p className="text-gray-400 text-sm">Loading…</p>}>
            <PaymentsList limit={10} />
          </Suspense>
        </div>
      </div>

      {/* ✅ QR Modal */}
      {showModal && (
        <dialog
          open
          className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300"
        >
          <div className="relative bg-white rounded-2xl p-8 w-[400px] shadow-2xl text-center text-gray-800">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              aria-label="Close QR modal"
            >
              ×
            </button>

            <h3 className="text-2xl font-semibold mb-1 text-gray-900">Complete Payment</h3>
            <p className="text-gray-500 text-sm mb-6">
              Scan the QR code below or send the payment link to your customer.
            </p>

            <div className="bg-gray-100 p-5 rounded-2xl mx-auto w-fit shadow-inner border border-gray-300 mb-6">
              <QRCodeCanvas value={link || ""} size={220} includeMargin className="mx-auto" />
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => window.open(link || "", "_blank", "noopener,noreferrer")}
                className="py-2 rounded-lg bg-gradient-to-r from-[#00c2ff] to-[#3bffbd] text-white font-semibold hover:opacity-90 transition text-sm"
              >
                Continue on Web
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(link || "");
                  setShowToast("✅ Payment link copied!");
                  setTimeout(() => setShowToast(null), 2500);
                  setShowModal(false);
                }}
                className="py-2 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 transition text-sm text-gray-800"
              >
                Copy Payment Link
              </button>

              {/* 📱 Send via SMS */}
              <div className="mt-4 border-t border-gray-200 pt-4">
                <p className="text-xs text-gray-500 mb-2">
                  Can’t scan the QR? Send the payment link to a mobile number:
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const phone = (e.target as any).elements.phone.value;
                    if (!phone) return alert("Enter a phone number");
                    const encoded = encodeURIComponent(`Your EverPay payment link: ${link}`);
                    const smsLink = `sms:${phone}?body=${encoded}`;
                    window.location.href = smsLink;
                    setShowModal(false);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Enter mobile number"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-gradient-to-r from-[#00c2ff] to-[#3bffbd] text-white rounded-lg text-sm font-medium hover:opacity-90 transition"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-6">
              Powered by <span className="font-semibold text-gray-500">EverPay</span> | Secure Stripe Checkout
            </p>
          </div>
        </dialog>
      )}

      {showToast && (
        <div
          className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold px-6 py-3 rounded-xl shadow-lg z-50 animate-fadeIn backdrop-blur-md border border-white/10"
        >
          {showToast}
        </div>
      )}

      {showSuccess && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-bannerDown">
          ✅ Payment complete — funds received instantly!
        </div>
      )}
    </main>
  );
}
