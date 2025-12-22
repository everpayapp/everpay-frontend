"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const path = usePathname();

  const isActive = (href: string) =>
    path === href
      ? "text-emerald-400 font-medium"
      : "text-gray-400 hover:text-white transition";

  return (
    <header className="w-full border-b border-white/10 bg-black/50 backdrop-blur-md py-4 px-8 flex justify-between items-center fixed top-0 z-50">

      {/* Brand */}
      <h1 className="text-xl font-semibold text-white tracking-tight">
        Ever<span className="text-emerald-400">Pay</span>
      </h1>

      {/* Navigation */}
      <nav className="flex gap-8 text-sm">
        <Link href="/" className={isActive("/")}>
          Dashboard
        </Link>
        <Link href="/creator/dashboard" className={isActive("/creator/dashboard")}>
          Creator Dashboard
        </Link>
        <Link href="/payments" className={isActive("/payments")}>
          Payments
        </Link>
      </nav>

      {/* Security Badge */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
        Secure • Stripe Verified
      </div>
    </header>
  );
}

