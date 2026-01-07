"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";

type GiftFormProps = {
  onGift: () => void;
};

export default function GiftForm({ onGift }: GiftFormProps) {
  const params = useParams<{ username: string }>();
  const username = params?.username;

  const [name, setName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        alert("Missing NEXT_PUBLIC_API_URL");
        return;
      }

      if (!username) {
        alert("Missing creator username");
        return;
      }

      const amountPounds = Number(amount);
      const amountPence = Math.round(amountPounds * 100);

      if (!Number.isFinite(amountPence) || amountPence < 50) {
        alert("Minimum gift is £0.50");
        return;
      }

      setLoading(true);

      // Backend creates a Stripe Checkout session and returns { url }
      const res = await fetch(
        `${apiUrl}/pay?amount=${amountPence}&creator=${encodeURIComponent(username)}`
      );

      const data = await res.json().catch(() => ({} as any));

      if (!res.ok || !data?.url) {
        console.error("Gift payment create failed:", data);
        alert(data?.error || "Payment failed");
        return;
      }

      // Optional: trigger UI celebration immediately before redirect
      // (backend will record payment via webhook after checkout completes)
      onGift();

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="gift-form">
      <input
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setName(e.target.value)
        }
        placeholder="Your name"
      />

      <input
        value={amount}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setAmount(e.target.value)
        }
        placeholder="Amount (£)"
        inputMode="decimal"
      />

      <textarea
        value={message}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          setMessage(e.target.value)
        }
        placeholder="Leave a message"
      />

      <button type="submit" disabled={loading}>
        {loading ? "Redirecting…" : "Send Gift 🎁"}
      </button>

      {/* NOTE:
          Your current backend /pay route only sends { creator } as metadata.
          The name/message fields are kept for UI but are not stored yet.
          We can extend the backend later to include gift_name/message/anonymous. */}
    </form>
  );
}
