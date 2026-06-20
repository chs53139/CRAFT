"use client";

import { usePathname } from "next/navigation";
import { AppTopBar } from "./AppTopBar";
import { BottomNav } from "./BottomNav";

function shouldHideNav(pathname: string) {
  if (pathname.startsWith("/auth")) return true;
  if (pathname === "/login" || pathname === "/register") return true;
  if (/^\/cocktails\/[^/]+$/.test(pathname)) return true;
  return false;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !shouldHideNav(pathname);

  return (
    <div className="app-frame">
      {showNav && <AppTopBar />}
      <main className={showNav ? "app-main" : "app-main app-main-full"}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  );
}
