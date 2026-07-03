"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectButton from "@/components/ConnectButton";
import NetworkSelector from "@/components/NetworkSelector";
import ZamapayLogo from "@/components/ZamapayLogo";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/send", label: "Send" },
  { href: "/receipts", label: "Receipts" },
  { href: "/faucet", label: "Faucet" }
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "/dashboard";
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <>
      <header className="app-topbar">
        <div className="navbar-row">
          <Link href="/" aria-label="ZAMAPAY home" className="navbar-brand">
            <ZamapayLogo compact />
          </Link>

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

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="navbar-toggle md:hidden"
            aria-expanded={open}
            aria-label="Toggle navigation"
          >
            <span aria-hidden="true">&#9776;</span>
          </button>

          <nav className="navbar-links hidden md:flex" aria-label="Primary navigation">
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

          <div className="navbar-actions hidden md:flex">
            <NetworkSelector />
            <ConnectButton compact />
          </div>
        </div>

        {open ? (
          <>
            <button
              type="button"
              className="mobile-menu-backdrop md:hidden"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
            />
            <aside className="mobile-menu md:hidden" aria-label="Mobile navigation menu">
              <nav className="mobile-menu-nav" aria-label="Mobile navigation">
                {links.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`navbar-link ${active ? "navbar-link-active" : ""}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="mobile-menu-controls">
                <NetworkSelector />
                <ConnectButton compact />
              </div>
            </aside>
          </>
        ) : null}
      </header>
    </>
  );
}
