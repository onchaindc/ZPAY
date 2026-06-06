import ActivityList from "@/components/ActivityList";
import BalanceCard from "@/components/BalanceCard";
import SendForm from "@/components/SendForm";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-normal text-zama-soft">Dashboard</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Confidential account</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="grid gap-5">
          <BalanceCard />
          <ActivityList />
        </div>
        <SendForm compact />
      </div>
    </main>
  );
}
