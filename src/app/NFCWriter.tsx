"use client";

import { useState } from "react";

export default function NFCWriter({ link }: { link: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [writing, setWriting] = useState(false);

  const writeNFC = async () => {
    if (!("NDEFWriter" in window)) {
      setStatus("❌ This device does not support NFC writing.");
      return;
    }

    try {
      setWriting(true);
      setStatus("📡 Bring your NFC tag close to write...");
      const writer = new (window as any).NDEFWriter();

      await writer.write({
        records: [
          {
            recordType: "url",
            data: link,
          },
        ],
      });

      setStatus("✅ NFC tag written successfully!");
    } catch (err) {
      console.error("NFC write failed:", err);
      setStatus("⚠️ Failed to write tag. Try again.");
    } finally {
      setWriting(false);
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5 text-sm text-gray-300">
      <h3 className="font-semibold mb-2 text-white">NFC Tag Writer</h3>
      <p className="text-gray-400 mb-3">
        Tap below to encode this payment link onto a compatible NFC tag.
      </p>

      <button
        onClick={writeNFC}
        disabled={writing}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 font-semibold hover:opacity-90 transition disabled:opacity-50"
      >
        {writing ? "Writing…" : "Write to NFC Tag"}
      </button>

      {status && <p className="mt-3 text-gray-300">{status}</p>}
    </div>
  );
}
