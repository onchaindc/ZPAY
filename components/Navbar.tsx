"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectButton from "@/components/ConnectButton";
import NetworkSelector from "@/components/NetworkSelector";
import ZamapayLogo from "@/components/ZamapayLogo";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-5H4v5Z" />
      </svg>
    )
  },
  {
    href: "/send",
    label: "Pay",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m5 12 14-7-4.6 14-2.6-5.8L5 12Z" />
      </svg>
    )
  },
  {
    href: "/receipts",
    label: "Activity",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-1.8-2 1.2-2-1.2-2 1.2-2-1.2L5 21V5a2 2 0 0 1 2-2Zm2 6h6V7H9v2Zm0 4h6v-2H9v2Zm0 4h4v-2H9v2Z" />
      </svg>
    )
  },
  {
    href: "/faucet",
    label: "Shield",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 4 7v6c0 4.4 3.4 7.4 8 8 4.6-.6 8-3.6 8-8V7l-8-4Zm1 5v3h3v2h-3v3h-2v-3H8v-2h3V8h2Z" />
      </svg>
    )
  }
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <aside className="app-sidebar hidden lg:flex">
        <Link href="/" aria-label="ZAMAPAY home" className="sidebar-brand">
          <ZamapayLogo compact />
        </Link>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
              >
                <span className="sidebar-icon">{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <header className="app-topbar">
        <div className="topbar-primary">
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="icon-button lg:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <Link href="/" aria-label="ZAMAPAY home" className="min-w-0 lg:hidden">
            <ZamapayLogo compact />
          </Link>
        </div>

        <div className="topbar-wallet">
          <NetworkSelector />
          <ConnectButton compact />
        </div>
      </header>

      {open ? (
        <>
          <button
            type="button"
            className="mobile-menu-backdrop lg:hidden"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
          />
          <aside className="mobile-menu lg:hidden" aria-label="Mobile navigation drawer">
            <div className="mobile-menu-header">
              <Link href="/" aria-label="ZAMAPAY home" className="min-w-0" onClick={() => setOpen(false)}>
                <ZamapayLogo compact />
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="icon-button"
                aria-label="Close navigation"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
                  <path d="M6 6 18 18M18 6 6 18" />
                </svg>
              </button>
            </div>

            <nav className="mobile-menu-nav" aria-label="Mobile navigation">
              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`sidebar-link ${active ? "sidebar-link-active" : ""}`}
                  >
                    <span className="sidebar-icon">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </>
      ) : null}
    </>
  );
}
