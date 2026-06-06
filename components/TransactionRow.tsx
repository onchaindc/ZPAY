"use client";

import { truncateAddress } from "@/lib/contract";

type TransactionRowProps = {
  address: string;
  timestamp: number;
  label?: string;
};

export default function TransactionRow({ address, timestamp, label = "Transfer" }: TransactionRowProps) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b border-white/8 px-1 py-4 last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-4">
      <div>
        <p className="font-semibold text-white">{label}</p>
        <p className="text-sm text-zinc-400">{truncateAddress(address)}</p>
      </div>
      <p className="text-sm text-zinc-400">{new Date(timestamp * 1000).toLocaleString()}</p>
      <p className="font-black text-white">••••</p>
    </div>
  );
}
