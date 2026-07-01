"use client";

import { useState } from "react";
import { userDecryptHandle } from "@/lib/fhevm";
import { connectWallet, getSelectedContractAddress, truncateAddress } from "@/lib/contract";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { getFriendlyErrorMessage } from "@/lib/ui";

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
    setToast("");
    setTone("idle");

    try {
      const wallet = await connectWallet();
      const contractAddress = getSelectedContractAddress();
      const value = await userDecryptHandle(contractAddress, wallet.address, receipt.encryptedAmount, wallet.signer);
      const decrypted = value?.toString?.() ?? String(value);

      if (!decrypted || decrypted === "0") {
        setAmount("");
        setToast("Amount is zero or could not be decrypted.");
        setTone("idle");
        return;
      }

      setAmount(decrypted);
      setToast("Amount revealed locally.");
      setTone("success");
    } catch (error) {
      setToast(getFriendlyErrorMessage(error, "network"));
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article className="activity-card">
      <div className="activity-timeline-marker" aria-hidden="true" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <span className="activity-badge">Encrypted</span>
            <p className="truncate text-xs font-bold uppercase tracking-[0.18em] text-zama-soft">{receipt.id}</p>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
            <div className="activity-detail">
              <span className="activity-detail-label">Sender</span>
              <span className="status-text font-semibold text-white">{truncateAddress(receipt.sender)}</span>
            </div>
            <div className="activity-detail">
              <span className="activity-detail-label">Receiver</span>
              <span className="status-text font-semibold text-white">{truncateAddress(receipt.receiver)}</span>
            </div>
            <div className="activity-detail sm:col-span-2">
              <span className="activity-detail-label">Settled</span>
              <span className="font-semibold text-white">{new Date(receipt.timestamp * 1000).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="activity-amount-panel">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft">Amount</p>
          <p className="mt-3 text-3xl font-black leading-none text-white sm:text-4xl">
            {loading ? <span className="activity-skeleton-line block h-10 w-24" aria-label="Loading amount" /> : amount || "\u2022\u2022\u2022\u2022"}
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Encrypted tokens</p>
        </div>
      </div>

      <button type="button" onClick={revealAmount} disabled={loading} className="secondary-button mt-6 sm:w-auto">
        {loading ? <LoadingSpinner className="mr-2" /> : null}
        Reveal Amount
      </button>

      <div className="mt-4">
        <Toast message={toast} tone={tone} />
      </div>
    </article>
  );
}
