"use client";
import React, { useEffect, useState } from "react";

export default function RecentGifts({ username }) {
  const [gifts, setGifts] = useState([]);

  const load = async () => {
    const res = await fetch(`/api/creator/${username}/gifts`);
    if (!res.ok) return;
    const data = await res.json();
    setGifts(data);
  };

  // auto-refresh list every 5 seconds
  useEffect(() => {
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
  }, [username]);

  return (
    <div className="recent-gifts">
      {gifts.map((g, idx) => (
        <div key={idx} className="gift-row">
          <strong>{g.name || "Anonymous"}</strong> donated £{g.amount}
          {g.message && <span> — "{g.message}"</span>}
        </div>
      ))}
    </div>
  );
}
