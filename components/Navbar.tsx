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

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="app-topbar">
        <div className="navbar-row">
          <Link href="/" aria-label="ZAMAPAY home" className="navbar-brand">
            <ZamapayLogo compact />
          </Link>

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
            <aside className="mobile-menu md:hidden" aria-label="Mobile navigation drawer">
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
