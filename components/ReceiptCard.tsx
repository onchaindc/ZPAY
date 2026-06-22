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
    <article className="glass rounded-xl p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-normal text-zama-soft">{receipt.id}</p>
          <div className="mt-3 grid gap-2 text-sm text-zinc-300">
            <p className="status-text">
              Sender <span className="font-semibold text-white">{truncateAddress(receipt.sender)}</span>
            </p>
            <p className="status-text">
              Receiver <span className="font-semibold text-white">{truncateAddress(receipt.receiver)}</span>
            </p>
            <p>{new Date(receipt.timestamp * 1000).toLocaleString()}</p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-2xl font-black text-white">{amount || "\u2022\u2022\u2022\u2022"}</p>
          <p className="text-xs font-semibold text-zinc-400">tokens</p>
        </div>
      </div>

      <button type="button" onClick={revealAmount} disabled={loading} className="secondary-button mt-5 sm:w-auto">
        {loading ? <LoadingSpinner className="mr-2" /> : null}
        Reveal Amount
      </button>

      <div className="mt-4">
        <Toast message={toast} tone={tone} />
      </div>
    </article>
  );
}
