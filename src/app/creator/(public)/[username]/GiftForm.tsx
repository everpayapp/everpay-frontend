"use client";
import React, { useState } from "react";

export default function GiftForm({ onGift }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e) => {
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
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
      <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount (£)" />
      <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Leave a message" />
      <button type="submit">Send Gift 🎁</button>
    </form>
  );
}
