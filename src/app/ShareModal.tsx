"use client";

import { useState } from "react";
import QRCode from "qrcode.react";

export default function ShareModal({ link }: { link: string }) {
  const [open, setOpen] = useState(false);

  if (!link) return null;

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 font-semibold hover:opacity-90 transition"
      >
        Share Payment
      </button>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 shadow-xl max-w-sm w-full text-center">
            <h2 className="text-xl font-semibold mb-4 text-white">Share Payment</h2>

            <QRCode value={link} size={180} className="mx-auto mb-4" />

            <input
              type="text"
              readOnly
              value={link}
              className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-gray-300 mb-3"
              onFocus={(e) => e.target.select()}
            />

            <button
              onClick={() => {
                navigator.clipboard.writeText(link);
                alert("Payment link copied!");
              }}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 font-semibold hover:opacity-90 mb-3"
            >
              Copy Link
            </button>

            <p className="text-gray-400 text-xs mb-4">or scan QR to pay instantly</p>

            <button
              onClick={() => setOpen(false)}
              className="text-gray-400 hover:text-white text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
