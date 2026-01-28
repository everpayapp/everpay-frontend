"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function NavBar() {
  const pathname = usePathname();
  const { status, data: session } = useSession();

  // ✅ Hide navbar on public / marketing pages + auth pages
  const hideOn = [
    "/",                 // marketing homepage
    "/example",          // example page
    "/login",
    "/signup",
    "/forgot-password",
    "/reset-password",
  ];

  if (hideOn.includes(pathname)) {
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

  // ✅ Safe for NextAuth default types
  const username = session?.user?.email?.split("@")[0] ?? "creator";

  return (
    <nav className="w-full flex justify-center items-center gap-8 py-6 border-b border-white/10 bg-black/30 backdrop-blur-xl">
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
            onClick={() =>
              signOut({
                callbackUrl: "/login",
              })
            }
            className="text-white/60 hover:text-white transition"
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
}
