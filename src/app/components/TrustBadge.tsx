"use client";

import { ShieldCheck, Lock } from "lucide-react";

export default function TrustBadge() {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 mt-4 pt-4 border-t border-white/10">
      <ShieldCheck size={16} className="text-emerald-400" />
      <span className="text-gray-300">Secure payments • Powered by Stripe</span>
      <Lock size={14} className="text-gray-400" />
    </div>
  );
}
