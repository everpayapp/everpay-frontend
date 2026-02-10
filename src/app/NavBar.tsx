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
    <nav className="w-full border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-6 sm:gap-8 py-4 sm:py-6 px-4 sm:px-0 overflow-x-auto whitespace-nowrap">
          <Link href="/creator/dashboard" className={`shrink-0 ${linkClass("/creator/dashboard")}`}>
            Dashboard
          </Link>

          <Link href="/creator/payments" className={`shrink-0 ${linkClass("/creator/payments")}`}>
            Payments
          </Link>

          <Link href="/creator/settings" className={`shrink-0 ${linkClass("/creator/settings")}`}>
            Settings
          </Link>

          {status === "authenticated" && (
            <>
              {/* Mobile: keep this short so Logout stays reachable */}
              <span className="shrink-0 text-white/50 text-sm sm:hidden">
                @{username}
              </span>

              {/* Desktop: full label */}
              <span className="shrink-0 text-white/50 text-sm hidden sm:inline">
                Logged in as <span className="text-white/80">@{username}</span>
              </span>

              <button
                onClick={() =>
                  signOut({
                    callbackUrl: "/login",
                  })
                }
                className="shrink-0 text-white/60 hover:text-white transition"
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
