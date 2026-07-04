"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ConnectButton from "@/components/ConnectButton";
import NetworkSelector from "@/components/NetworkSelector";
import ThemeControl from "@/components/ThemeControl";
import ZamapayLogo from "@/components/ZamapayLogo";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/send", label: "Send" },
  { href: "/receipts", label: "Receipts" },
  { href: "/faucet", label: "Faucet" }
];

export default function Navbar() {
  const pathname = usePathname();
  const showBackButton = pathname !== "/" && pathname !== "/dashboard";
  const showMobileThemeToggle = pathname === "/dashboard";
  const mobileTitle =
    pathname === "/send"
      ? "Send"
      : pathname === "/faucet"
        ? "Shield"
        : pathname === "/activity"
          ? "Activity"
          : pathname === "/profile"
            ? "Profile"
            : pathname === "/receipts"
              ? "Receipts"
              : "Home";

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <header className="app-topbar">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 md:hidden">
        <Link href="/" aria-label="ZAMAPAY home" className="navbar-brand">
          <ZamapayLogo compact />
        </Link>

        {showBackButton ? (
          <button
            type="button"
            onClick={goBack}
            className="navbar-back-button"
            aria-label="Go back"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15.7 5.3 9 12l6.7 6.7-1.4 1.4L6.2 12l8.1-8.1 1.4 1.4Z" />
            </svg>
          </button>
        ) : showMobileThemeToggle ? (
          <ThemeControl variant="inline" />
        ) : (
          <span className="inline-flex min-h-[2.5rem] items-center rounded-full border border-white/10 bg-white/5 px-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-zama-soft">
            {mobileTitle}
          </span>
        )}
      </div>

      <div className="navbar-row hidden md:grid">
        <div className="navbar-left">
          <Link href="/" aria-label="ZAMAPAY home" className="navbar-brand">
            <ZamapayLogo compact />
          </Link>

          {showBackButton ? (
            <button
              type="button"
              onClick={goBack}
              className="navbar-back-button"
              aria-label="Go back"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15.7 5.3 9 12l6.7 6.7-1.4 1.4L6.2 12l8.1-8.1 1.4 1.4Z" />
              </svg>
            </button>
          ) : null}
        </div>

        <nav className="navbar-links" aria-label="Primary navigation">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`navbar-link ${active ? "navbar-link-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="navbar-actions">
          <ThemeControl variant="inline" />
          <NetworkSelector />
          <ConnectButton compact />
        </div>
      </div>
    </header>
  );
}
