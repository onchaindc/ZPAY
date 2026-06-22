"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ConnectButton from "@/components/ConnectButton";
import NetworkSelector from "@/components/NetworkSelector";
import ZamapayLogo from "@/components/ZamapayLogo";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/send", label: "Send" },
  { href: "/receipts", label: "Receipts" },
  { href: "/faucet", label: "Mint" }
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-zama-gold/10 bg-midnight/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-[1200px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" aria-label="ZAMAPAY home">
            <ZamapayLogo compact />
          </Link>

          <div className="flex items-center gap-2 md:hidden">
            <ConnectButton compact />
            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className="secondary-button w-auto px-3"
              aria-expanded={open}
              aria-label="Toggle navigation"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          <div className="flex flex-wrap gap-2">
            {links.map((link) => {
              const active = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-zama-gold/18 text-zama-gold"
                      : "text-zinc-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <NetworkSelector />
            <ConnectButton compact />
          </div>
        </div>

        {open ? (
          <div className="glass rounded-xl p-4 md:hidden">
            <div className="grid gap-2">
              {links.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      active
                        ? "bg-zama-gold/18 text-zama-gold"
                        : "text-zinc-300 hover:bg-white/8 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="mt-4">
              <NetworkSelector />
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
