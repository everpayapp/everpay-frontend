"use client";
import { useState, useEffect, useRef, Suspense, useCallback } from "react";
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  /*------------- Detect success after Stripe redirect ------------*/
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      setShowSuccess(true);
      setAmountInput("0.00");
      setAmount(0);
      localStorage?.setItem("refreshPayments", Date.now().toString());
      setTimeout(() => setShowSuccess(false), 6000);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  /*------------- Auto-close QR when payment arrives ------------*/
  useEffect(() => {
    let lastCheck = Date.now();
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/payments`);
        const payments = await res.json();
        if (payments?.length) {
          const newest = new Date(payments[0].created_at).getTime();
          if (newest > lastCheck) {
            setShowModal(false);
            setShowSuccess(true);
            lastCheck = Date.now();
            localStorage?.setItem("refreshPayments", Date.now().toString());
            setTimeout(() => setShowSuccess(false), 6000);
          }
        }
      } catch {}
    }, 5000);
    return () => clearInterval(interval);
  }, [API_URL]);

  /*------------- Amount Formatting ------------*/
  const formatNumber = useCallback((v: string) => {
    const [int, dec] = v.split(".");
    const formatted = int.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return dec !== undefined ? `${formatted}.${dec}` : formatted;
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*\.?\d*$/.test(value)) return;
    setAmountInput(value);
    setAmount(parseFloat(value) || 0);
  };

  const display = (n: number) =>
    n.toLocaleString("en-UK", { minimumFractionDigits: 2 });

  /*------------- Start Stripe Checkout ------------*/
  const handlePay = async () => {
    if (amount <= 0) return toast("Enter a valid amount");
    action(async () => {
      const res = await fetch(`${API_URL}/pay?amount=${amount}&source=business`);
      const data = await res.json();
      if (data?.url) window.location.href = data.url;
      else toast("Failed to start payment");
    });
  };

  /*------------- Generate QR / Link ------------*/
  const handleGenerate = async () => {
    if (amount <= 0) return toast("Enter a valid amount");
    action(async () => {
      const res = await fetch(`${API_URL}/pay?amount=${amount}&source=business`);
      const data = await res.json();
      if (data?.url) {
        setLink(data.url);
        setShowModal(true);
        setAmountInput("0.00");
        setAmount(0);
        toast("Payment link generated ✓");
      } else toast("Could not generate link");
    });
  };

  const action = async (fn: Function) => {
    setLoading(true);
    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  const toast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  /*------------- UI ------------*/
  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-[#0B1623] via-[#0E1B2A] to-[#090E14] text-white p-8 animate-fadeIn">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Accept Payment */}
          <div className="bg-[#0E1B2A] border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4">Accept Payment</h2>
            <p className="text-gray-400 mb-6 text-sm">
              Enter an amount in pounds (£)
            </p>

            {/* Amount input */}
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-6 py-3">
                <span className="text-[22px] font-semibold text-white">£</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={amountInput}
                  onChange={handleInput}
                  inputMode="decimal"
                  placeholder="0.00"
                  className="text-white bg-transparent text-[22px] font-medium w-[110px] focus:outline-none placeholder-gray-400"
                />
              </div>
            </div>

            {/* Buttons row */}
            <div className="flex gap-4 justify-center mb-4">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="
                  w-full py-4 rounded-2xl font-semibold
                  bg-[#14212E] border border-white/10
                  hover:bg-white/10
                  text-transparent bg-clip-text bg-gradient-to-r from-[#2EE4FF] to-[#41E8A5]
                  transition disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                {loading ? "Generating…" : `Generate £${display(amount)} Link`}
              </button>

              <button
                onClick={handlePay}
                disabled={loading}
                className="
                  w-full py-4 rounded-2xl font-semibold
                  bg-[#14212E] border border-white/10
                  hover:bg-white/10
                  text-transparent bg-clip-text bg-gradient-to-r from-[#2EE4FF] to-[#41E8A5]
                  transition disabled:opacity-40 disabled:cursor-not-allowed
                "
              >
                {loading ? "Processing…" : `Pay £${display(amount)}`}
              </button>
            </div>

            {/* Stripe assurance */}
            <p className="text-sm text-gray-500 text-center">
              🔒 Powered by EverPay — Protected by Stripe ✓
            </p>
          </div>

          {/* Recent Payments */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Recent Payments</h2>
              <a
                href="/payments"
                className="text-sm font-semibold bg-gradient-to-r from-[#00Eaff] to-[#2DE38A] bg-clip-text text-transparent hover:opacity-80 transition"
              >
                View All →
              </a>
            </div>

            <Suspense
              fallback={
                <p className="text-gray-400 text-sm">Loading…</p>
              }
            >
              <PaymentsList limit={10} />
            </Suspense>
          </div>
        </div>

        {/* QR Modal */}
        {showModal && (
          <div className="fixed inset-0 grid place-items-center bg-black/40 backdrop-blur-sm z-50">
            <div className="relative bg-white rounded-2xl p-8 w-[400px] shadow-2xl text-center text-gray-800 animate-zoomIn">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>

              <h3 className="text-2xl font-semibold mb-1">Complete Payment</h3>
              <p className="text-gray-500 text-sm mb-6">
                Scan the QR code or share the link.
              </p>

              <div className="bg-gray-100 p-5 rounded-2xl mx-auto shadow-inner mb-6">
                <QRCodeCanvas value={link || ""} size={220} includeMargin />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => window.open(link || "", "_blank")}
                  className="w-full py-2 rounded-full bg-gradient-to-r from-[#1c7dff] to-[#0049ff] text-white font-semibold hover:opacity-90 transition"
                >
                  Continue on Web
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(link || "");
                    toast("✓ Link copied!");
                    setShowModal(false);
                  }}
                  className="w-full py-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-800 transition"
                >
                  Copy Payment Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {showToast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#1c7dff] to-[#0049ff] text-white font-semibold px-6 py-3 rounded-full shadow-xl animate-fadeIn z-50">
            {showToast}
          </div>
        )}

        {/* Success Banner */}
        {showSuccess && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-bannerDown">
            ✓ Payment complete — funds received instantly!
          </div>
        )}
      </main>
    </>
  );
}

