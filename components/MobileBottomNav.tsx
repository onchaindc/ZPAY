"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1v-9.5Z" />
      </svg>
    )
  },
  {
    href: "/send",
    label: "Send",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="m4.6 11.4 13.9-6.2c.8-.3 1.5.4 1.2 1.2l-6.2 13.9c-.3.8-1.4.8-1.7 0l-2.1-5.1-5.1-2.1c-.8-.3-.8-1.4 0-1.7Z" />
      </svg>
    )
  },
  {
    href: "/faucet",
    label: "Shield",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M12 3 5 6.2v5.6c0 4.1 2.9 7.7 7 8.7 4.1-1 7-4.6 7-8.7V6.2L12 3Zm0 4.2 3.8 1.7v3c0 2.5-1.5 4.7-3.8 5.7-2.3-1-3.8-3.2-3.8-5.7v-3L12 7.2Z" />
      </svg>
    )
  },
  {
    href: "/activity",
    label: "Activity",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
        <path d="M6 5.5h12M6 12h12M6 18.5h7" />
        <path d="M4.5 5.5h.01M4.5 12h.01M4.5 18.5h.01" />
      </svg>
    )
  },
  {
    href: "/profile",
    label: "Profile",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-none stroke-current stroke-[1.8]">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M5 20a7 7 0 0 1 14 0" />
      </svg>
    )
  }
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  if (href === "/profile") {
    return pathname === "/profile" || pathname === "/receipts";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="pointer-events-none fixed inset-x-0 bottom-0 z-50 md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="pointer-events-auto mx-auto w-full max-w-lg px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="grid grid-cols-5 gap-1 rounded-[24px] border border-white/10 bg-[color:var(--theme-surface)] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-[60px] min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] px-2 py-2 text-center transition duration-200 ${
                  active
                    ? "bg-zama-gold/12 text-zama-soft"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                <span className="text-[0.68rem] font-bold uppercase tracking-[0.12em]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
