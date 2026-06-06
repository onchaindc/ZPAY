import BalanceCard from "@/components/BalanceCard";
import SendForm from "@/components/SendForm";
import TransactionRow from "@/components/TransactionRow";

const activity = [
  { address: "0x7a92b4c8f1a3e52b940cc4e4b5670a8e10d4a81c", timestamp: 1717654200, label: "Sent" },
  { address: "0xa403926bf0c936451f2ab021729ff928df3519f2", timestamp: 1717567800, label: "Received" },
  { address: "0x27bc21c18090b4623dcb5521d57e0a8d5f9db336", timestamp: 1717481400, label: "Sent" }
];

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-normal text-lavender">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Confidential account</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-5">
          <BalanceCard />
          <section className="glass rounded-lg p-5 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-normal text-lavender">Recent Activity</p>
                <h2 className="mt-2 text-2xl font-black text-white">Encrypted transfers</h2>
              </div>
              <span className="rounded-lg border border-lavender/20 px-3 py-2 text-sm font-bold text-violet-100/72">
                ••••
              </span>
            </div>
            <div>
              {activity.map((transaction) => (
                <TransactionRow
                  key={`${transaction.address}-${transaction.timestamp}`}
                  address={transaction.address}
                  timestamp={transaction.timestamp}
                  label={transaction.label}
                />
              ))}
            </div>
          </section>
        </div>
        <SendForm compact />
      </div>
    </main>
  );
}
