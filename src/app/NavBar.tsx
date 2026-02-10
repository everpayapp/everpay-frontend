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
  // Show only on creator dashboard routes (dashboard/payments/settings)
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

  const username = (session?.user as any)?.username ?? "creator";

  return (
    <nav className="sticky top-0 z-50 w-full bg-black/30 backdrop-blur-xl border-b border-white/10">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 py-3 sm:py-5">
        {/* Row 1: main links (scrollable on mobile so nothing gets cut off) */}
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

          {/* Spacer on desktop so right-side items sit on the right */}
          <div className="hidden sm:block flex-1" />

          {status === "authenticated" && (
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-white/50 text-sm">
                Logged in as <span className="text-white/80">@{username}</span>
              </span>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-white/60 hover:text-white transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Row 2 (mobile only): user + logout ALWAYS visible */}
        {status === "authenticated" && (
          <div className="sm:hidden mt-2 flex items-center justify-between">
            <span className="text-white/60 text-sm">
              <span className="text-white/80">@{username}</span>
            </span>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-white/70 hover:text-white transition text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
