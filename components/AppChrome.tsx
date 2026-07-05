"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import ThemeControl from "@/components/ThemeControl";

type AppChromeProps = {
  children: React.ReactNode;
};

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const router = useRouter();
  const landing = pathname === "/";

  useEffect(() => {
    if (pathname === "/") {
      return;
    }

    const navigationEntry = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigationEntry?.type === "reload") {
      router.replace("/");
    }
  }, [pathname, router]);

  return (
    <>
      {landing ? null : <Navbar />}
      {landing ? <ThemeControl landing={landing} /> : null}
      <div className={landing ? "app-shell app-shell-landing" : "app-shell"}>{children}</div>
      {landing ? null : <MobileBottomNav />}
    </>
  );
}
