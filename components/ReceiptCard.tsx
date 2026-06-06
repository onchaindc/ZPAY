"use client";

import { useState } from "react";
import { decryptValue } from "@/lib/fhevm";
import { truncateAddress } from "@/lib/contract";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";

export type ReceiptView = {
  id: string;
  sender: string;
  receiver: string;
  encryptedAmount: unknown;
  timestamp: number;
};

type ReceiptCardProps = {
  receipt: ReceiptView;
};

export default function ReceiptCard({ receipt }: ReceiptCardProps) {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  async function revealAmount() {
    setLoading(true);
    setToast("Decrypting receipt amount...");
    setTone("idle");

    try {
      const value = await decryptValue(receipt.encryptedAmount);
      setAmount(value);
      setToast("Amount revealed locally.");
      setTone("success");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not reveal receipt amount.");
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="glass rounded-lg p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-normal text-lavender">
            {receipt.id}
          </p>
          <div className="mt-3 grid gap-2 text-sm text-violet-50/76">
            <p>
              Sender <span className="font-semibold text-white">{truncateAddress(receipt.sender)}</span>
            </p>
            <p>
              Receiver <span className="font-semibold text-white">{truncateAddress(receipt.receiver)}</span>
            </p>
            <p>{new Date(receipt.timestamp * 1000).toLocaleString()}</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-black text-white">{amount || "••••"}</p>
          <p className="text-xs font-semibold text-violet-100/56">ZAMA</p>
        </div>
      </div>

      <button type="button" onClick={revealAmount} disabled={loading} className="secondary-button mt-5 w-full">
        {loading ? <LoadingSpinner className="mr-2" /> : null}
        Reveal Amount
      </button>

      <div className="mt-4">
        <Toast message={toast} tone={tone} />
      </div>
    </article>
  );
}
