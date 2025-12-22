"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SuccessBanner() {
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger on URL success parameter
    if (searchParams.get("success") === "true") {
      setVisible(true);

      // Optional: vibration/haptic on payment (mobile only)
      if (navigator?.vibrate) navigator.vibrate(40);

      // Auto-hide after 6 seconds
      const t = setTimeout(() => setVisible(false), 6000);

      // Clean URL (remove ?success=true)
      window.history.replaceState({}, "", window.location.pathname);

      return () => clearTimeout(t);
    }
  }, [searchParams]);

  // Optional — trigger if dashboard stores new payments event
  useEffect(() => {
    const handler = () => {
      setVisible(true);
      const t = setTimeout(() => setVisible(false), 6000);
      return () => clearTimeout(t);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="
        fixed top-5 left-1/2 transform -translate-x-1/2
        bg-emerald-500 text-white px-6 py-3 rounded-xl
        shadow-lg z-50 animate-bannerDown
        border border-white/10 backdrop-blur
      "
    >
      ✅ Payment Successful — funds received securely via Stripe.
    </div>
  );
}
