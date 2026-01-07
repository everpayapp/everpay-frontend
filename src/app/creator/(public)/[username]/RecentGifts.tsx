"use client";

import React, { useEffect, useState } from "react";

type Gift = {
  id?: string;
  name?: string;
  amount?: number | string;
  message?: string;
  created_at?: string;
};

type RecentGiftsProps = {
  username: string;
};

export default function RecentGifts({ username }: RecentGiftsProps) {
  const [gifts, setGifts] = useState<Gift[]>([]);

  const load = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl || !username) return;

      const res = await fetch(
        `${apiUrl}/api/payments/${encodeURIComponent(username)}`
      );
      if (!res.ok) return;

      const data = await res.json();
      setGifts(Array.isArray(data) ? (data as Gift[]) : []);
    } catch {
      // keep quiet, just don't crash builds
    }
  };

  // auto-refresh list every 5 seconds
  useEffect(() => {
    if (!username) return;
    load();
    const timer = setInterval(load, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  return (
    <div className="recent-gifts">
      {gifts.map((g, idx) => (
        <div key={g.id ?? `${username}-${idx}`} className="gift-row">
          <strong>{g.name || "Anonymous"}</strong> donated £{Number(g.amount ?? 0)}
          {g.message ? <span> — "{g.message}"</span> : null}
        </div>
      ))}
    </div>
  );
}
