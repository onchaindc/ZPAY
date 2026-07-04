import ActivityList from "@/components/ActivityList";

export default function ActivityPage() {
  return (
    <main className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-5">
      <div className="mx-auto mb-5 max-w-3xl text-center md:mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Activity</p>
        <h1 className="mt-2 text-[1.85rem] font-black leading-tight text-white md:mt-2 md:text-[2.9rem]">
          Confidential activity.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-400 md:mt-3 md:text-base">
          Review shield, transfer, withdrawal request, and completed unshield events from your Zamapay vault.
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <ActivityList />
      </div>
    </main>
  );
}
