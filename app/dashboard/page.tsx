import ActivityList from "@/components/ActivityList";
import BalanceCard from "@/components/BalanceCard";
import SendForm from "@/components/SendForm";

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-normal text-zama-soft sm:text-sm">Dashboard</p>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">Confidential ETH vault</h1>
      </div>

      <div className="grid gap-6">
        <BalanceCard />
        <div className="grid gap-6 md:grid-cols-2">
          <ActivityList />
          <SendForm compact />
        </div>
      </div>
    </main>
  );
}
