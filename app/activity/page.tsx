import ActivityList from "@/components/ActivityList";

export default function ActivityPage() {
  return (
    <main className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 pb-28 pt-6 md:px-8 md:py-8">
      <div className="mx-auto mb-7 max-w-3xl text-center md:mb-9">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Activity</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">
          Confidential activity.
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400 md:text-base">
          Review shield, transfer, withdrawal request, and completed unshield events from your Zamapay vault.
        </p>
      </div>

      <div className="mx-auto w-full max-w-4xl">
        <ActivityList />
      </div>
    </main>
  );
}
