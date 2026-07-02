"use client";

import { BrowserProvider, EventLog } from "ethers";
import { useEffect, useState } from "react";
import { getZamapayContract } from "@/lib/contract";
import TransactionRow from "@/components/TransactionRow";

type ActivityItem = {
  id: string;
  address: string;
  timestamp: number;
  label: string;
};

export default function ActivityList() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let active = true;

    async function loadActivity() {
      if (!window.ethereum) {
        if (active) {
          setActivity([]);
        }
        return;
      }

      try {
        const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
        const userAddress = accounts[0];

        if (!userAddress) {
          if (active) {
            setActivity([]);
          }
          return;
        }

        const provider = new BrowserProvider(window.ethereum);
        const signer = await provider.getSigner(userAddress);
        const contract = getZamapayContract(signer);
        const events = await Promise.all([
          contract.queryFilter(contract.filters.Transfer(userAddress, null, null)),
          contract.queryFilter(contract.filters.Transfer(null, userAddress, null)),
          contract.queryFilter(contract.filters.TransferWithReceipt(userAddress, null, null, null)),
          contract.queryFilter(contract.filters.TransferWithReceipt(null, userAddress, null, null)),
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
            const block = await provider.getBlock(event.blockNumber);
            const from = String(event.args.from ?? event.args.sender ?? userAddress);
            const to = String(event.args.to ?? event.args.receiver ?? userAddress);
            const outgoing = from.toLowerCase() === userAddress.toLowerCase();
            const label = `${outgoing ? "Sent" : "Received"}${
              event.eventName === "TransferWithReceipt" ? " with receipt" : ""
            }`;

            return {
              id: `${event.transactionHash}-${event.index}`,
              address: outgoing ? to : from,
              timestamp: block?.timestamp ?? 0,
              label,
            };
          })
        );

        if (!active) {
          return;
        }

        rows.sort((a, b) => b.timestamp - a.timestamp);
        setActivity(rows);
      } catch {
        if (active) {
          setActivity([]);
        }
      }
    }

    void loadActivity();

    const handleWalletStateChange = () => {
      void loadActivity();
    };

    window.ethereum?.on?.("accountsChanged", handleWalletStateChange);
    window.ethereum?.on?.("chainChanged", handleWalletStateChange);

    return () => {
      active = false;
      window.ethereum?.removeListener?.("accountsChanged", handleWalletStateChange);
      window.ethereum?.removeListener?.("chainChanged", handleWalletStateChange);
    };
  }, []);

  return (
    <section className="glass rounded-xl p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Recent Activity</p>
          <h2 className="mt-2 text-xl font-black text-white md:text-2xl">Confidential transfers</h2>
        </div>
        <span className="text-sm font-semibold text-zinc-500">{activity.length} events</span>
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
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.035] px-4 py-10 text-center md:px-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-zama-gold/20 bg-zama-gold/10 text-zama-gold">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-1.8-2 1.2-2-1.2-2 1.2-2-1.2L5 21V5a2 2 0 0 1 2-2Zm2 6h6V7H9v2Zm0 4h6v-2H9v2Z" />
            </svg>
          </div>
          <p className="mt-4 font-black text-white">No confidential activity yet</p>
          <p className="mt-2 text-sm text-zinc-400">
            Shield funds or send your first confidential payment. Confirmed activity will appear here automatically.
          </p>
        </div>
      )}
    </section>
  );
}
