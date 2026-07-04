import ActivityList from "@/components/ActivityList";
import BalanceCard from "@/components/BalanceCard";
import Link from "next/link";

const quickActions = [
  {
    href: "/faucet",
    title: "Shield Funds",
    description: "Create a confidential balance protected by Zama FHE.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 5 6.2v5.6c0 4.1 2.9 7.7 7 8.7 4.1-1 7-4.6 7-8.7V6.2L12 3Zm1 5v3h3v2h-3v3h-2v-3H8v-2h3V8h2Z" />
      </svg>
    )
  },
  {
    href: "/send",
    title: "Send Confidential Payment",
    description: "Move encrypted payment value across Ethereum.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m5 12 14-7-4.6 14-2.5-5.8L5 12Z" />
      </svg>
    )
  },
  {
    href: "/receipts",
    title: "Unshield Funds",
    description: "Review receipts and reveal details only when needed.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-1.8-2 1.2-2-1.2-2 1.2-2-1.2L5 21V5a2 2 0 0 1 2-2Zm2 6h6V7H9v2Zm0 4h6v-2H9v2Zm0 4h4v-2H9v2Z" />
      </svg>
    )
  }
];

export default function DashboardPage() {
  return (
    <main className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 pb-28 pt-6 md:px-8 md:py-8">
      <div className="mx-auto mb-7 max-w-3xl text-center md:mb-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Powered by Zama FHE</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">
          Your confidential balance.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
          Manage shielded funds, confidential payments, and selective receipts from one encrypted vault.
        </p>
      </div>

      <div className="grid gap-5 md:gap-6 lg:gap-7">
        <BalanceCard />

        <section aria-labelledby="quick-actions-title" className="grid gap-4">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Quick Actions</p>
            <h2 id="quick-actions-title" className="mt-2 text-xl font-black text-white md:text-2xl">
              Move value confidentially
            </h2>
          </div>

          <div className="grid grid-cols-3 gap-3 md:hidden">
            <Link href="/faucet" className="glass flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-[20px] p-3 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-[14px] border border-zama-gold/20 bg-zama-gold/10 text-zama-soft">
                {quickActions[0].icon}
              </span>
              <span className="text-sm font-black text-white">Shield</span>
            </Link>
            <Link href="/send" className="glass flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-[20px] p-3 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-[14px] border border-zama-gold/20 bg-zama-gold/10 text-zama-soft">
                {quickActions[1].icon}
              </span>
              <span className="text-sm font-black text-white">Send</span>
            </Link>
            <Link href="/receipts" className="glass flex min-h-[92px] flex-col items-center justify-center gap-2 rounded-[20px] p-3 text-center">
              <span className="grid h-10 w-10 place-items-center rounded-[14px] border border-zama-gold/20 bg-zama-gold/10 text-zama-soft">
                {quickActions[2].icon}
              </span>
              <span className="text-sm font-black text-white">Withdraw</span>
            </Link>
          </div>

          <div className="hidden grid-cols-1 gap-3 md:grid md:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href} className="dashboard-action-card">
                <span className="dashboard-action-icon">{action.icon}</span>
                <span className="min-w-0">
                  <span className="block text-base font-black text-white">{action.title}</span>
                  <span className="mt-1 block text-sm leading-5 text-zinc-400">{action.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <ActivityList />
      </div>
    </main>
  );
}
