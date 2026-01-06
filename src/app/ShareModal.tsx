"use client";

import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function ShareModal({ link }: { link: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-4 py-2 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
      >
        Share
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-black/70 border border-white/15 backdrop-blur-xl p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Share your link</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 break-all text-sm mb-4">
              {link}
            </div>

            <div className="flex items-center justify-center mb-4">
              <div className="bg-white p-3 rounded-2xl shadow-xl">
                <QRCodeCanvas value={link} size={220} />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(link);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition"
              >
                Copy Link
              </button>

              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/15 text-white hover:bg-white/15 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
