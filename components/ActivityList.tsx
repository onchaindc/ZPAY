"use client";

import { EventLog } from "ethers";
import { useState } from "react";
import { connectWallet, getZamapayContract } from "@/lib/contract";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import TransactionRow from "@/components/TransactionRow";

type ActivityItem = {
  id: string;
  address: string;
  timestamp: number;
  label: string;
};

export default function ActivityList() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  async function loadActivity() {
    setLoading(true);
    setToast("Loading encrypted transfer events...");
    setTone("idle");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
      const events = await Promise.all([
        contract.queryFilter(contract.filters.Transfer(wallet.address, null)),
        contract.queryFilter(contract.filters.Transfer(null, wallet.address)),
        contract.queryFilter(contract.filters.TransferWithReceipt(wallet.address, null, null)),
        contract.queryFilter(contract.filters.TransferWithReceipt(null, wallet.address, null))
      ]);

      const uniqueEvents = Array.from(
        new Map(
          events
            .flat()
            .filter((event): event is EventLog => "args" in event)
            .map((event) => [`${event.transactionHash}-${event.index}`, event])
        ).values()
      );

      const rows = await Promise.all(
        uniqueEvents.map(async (event) => {
          const block = await wallet.provider.getBlock(event.blockNumber);
          const from = String(event.args.from);
          const to = String(event.args.to);
          const outgoing = from.toLowerCase() === wallet.address.toLowerCase();
          const withReceipt = event.eventName === "TransferWithReceipt";

          return {
            id: `${event.transactionHash}-${event.index}`,
            address: outgoing ? to : from,
            timestamp: block?.timestamp ?? 0,
            label: `${outgoing ? "Sent" : "Received"}${withReceipt ? " with receipt" : ""}`
          };
        })
      );

      rows.sort((a, b) => b.timestamp - a.timestamp);
      setActivity(rows);
      setLoaded(true);
      setToast(rows.length ? "Activity loaded." : "");
      setTone("success");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not load activity.");
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass rounded-lg p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-zama-soft">Recent Activity</p>
          <h2 className="mt-2 text-2xl font-black text-white">Encrypted transfers</h2>
        </div>
        <button type="button" onClick={loadActivity} disabled={loading} className="secondary-button">
          {loading ? <LoadingSpinner className="mr-2" /> : null}
          Refresh
        </button>
      </div>

      {activity.length ? (
        <div>
          {activity.map((transaction) => (
            <TransactionRow
              key={transaction.id}
              address={transaction.address}
              timestamp={transaction.timestamp}
              label={transaction.label}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-zama-gold/12 bg-white/5 px-5 py-8 text-center">
          <p className="font-black text-white">No transfers yet</p>
          <p className="mt-2 text-sm text-zinc-300">
            Your private activity will appear here after the connected wallet sends or receives ZAMAPAY tokens.
          </p>
          {!loaded ? (
            <button type="button" onClick={loadActivity} disabled={loading} className="primary-button mt-5">
              {loading ? <LoadingSpinner className="mr-2" /> : null}
              Load Activity
            </button>
          ) : null}
        </div>
      )}

      <div className="mt-4">
        <Toast message={toast} tone={tone} />
      </div>
    </section>
  );
}
