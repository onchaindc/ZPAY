"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import ThemeControl from "@/components/ThemeControl";

type AppChromeProps = {
  children: React.ReactNode;
};

export default function AppChrome({ children }: AppChromeProps) {
  const pathname = usePathname();
  const landing = pathname === "/";

  return (
    <>
      {landing ? null : <Navbar />}
      <ThemeControl landing={landing} />
      <div className={landing ? "app-shell app-shell-landing" : "app-shell"}>{children}</div>
    </>
  );
}
