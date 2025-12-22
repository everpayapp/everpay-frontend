"use client";

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export default function LayoutClientWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isAuthPage = pathname === "/login";

  return (
    <>
      
      {isAuthPage ? (
        <>{children}</>
      ) : (
        <main className="pt-6 px-6">{children}</main>
      )}
    </>
  );
}
