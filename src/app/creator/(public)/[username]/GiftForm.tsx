"use client";

import React, { useState } from "react";

type GiftFormProps = {
  onGift: () => void;
};

export default function GiftForm({ onGift }: GiftFormProps) {
  const [name, setName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const res = await fetch("/api/gift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, amount, message }),
    });

    if (res.ok) {
      setName("");
      setAmount("");
      setMessage("");
      onGift(); // triggers celebration & reload recent gifts
    }
  };

  return (
    <form onSubmit={submit} className="gift-form">
      <input
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
        placeholder="Your name"
      />

      <input
        value={amount}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
        placeholder="Amount (£)"
      />

      <textarea
        value={message}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
        placeholder="Leave a message"
      />

      <button type="submit">Send Gift 🎁</button>
    </form>
  );
}
