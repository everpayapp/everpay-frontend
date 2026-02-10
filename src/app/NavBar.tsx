"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function NavBar() {
  const pathname = usePathname();
  const { status, data: session } = useSession();

  // ✅ Hide navbar on marketing, example & auth pages
  if (
    pathname === "/" ||
    pathname.startsWith("/example") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
    return null;
  }

  // ✅ Hide navbar on public creator pages (/creator/username)
  if (
    pathname.startsWith("/creator/") &&
    !pathname.includes("/dashboard") &&
    !pathname.includes("/payments") &&
    !pathname.includes("/settings")
  ) {
    return null;
  }

  const linkClass = (path: string) =>
    pathname === path
      ? "text-white font-semibold border-b-2 border-cyan-400 pb-1"
      : "text-white/70 hover:text-white transition";

  // ✅ REAL username from session
  const username = (session?.user as any)?.username ?? "creator";

  return (
    <nav className="w-full border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-3 sm:py-5">

        {/* ===================== */}
        {/* 📱 MOBILE NAV (2 ROW) */}
        {/* ===================== */}
        <div className="sm:hidden">
          {/* Top row: links (scrollable) */}
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap [-webkit-overflow-scrolling:touch]">
            <Link href="/creator/dashboard" className={linkClass("/creator/dashboard")}>
              Dashboard
            </Link>
            <Link href="/creator/payments" className={linkClass("/creator/payments")}>
              Payments
            </Link>
            <Link href="/creator/settings" className={linkClass("/creator/settings")}>
              Settings
            </Link>
          </div>

          {/* Bottom row: user + logout */}
          {status === "authenticated" && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-white/60 text-sm truncate">
                @{username}
              </span>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-white/60 hover:text-white transition text-sm shrink-0"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* ===================== */}
        {/* 🖥️ DESKTOP NAV (1 ROW) */}
        {/* ===================== */}
        <div className="hidden sm:flex items-center justify-center gap-8">
          <Link href="/creator/dashboard" className={linkClass("/creator/dashboard")}>
            Dashboard
          </Link>

          <Link href="/creator/payments" className={linkClass("/creator/payments")}>
            Payments
          </Link>

          <Link href="/creator/settings" className={linkClass("/creator/settings")}>
            Settings
          </Link>

          {status === "authenticated" && (
            <>
              <span className="text-white/50 text-sm">
                Logged in as <span className="text-white/80">@{username}</span>
              </span>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-white/60 hover:text-white transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}
