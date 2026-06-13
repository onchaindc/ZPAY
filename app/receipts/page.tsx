"use client";

import { useState } from "react";
import { connectWallet, getZamapayContract } from "@/lib/contract";
import ReceiptCard, { ReceiptView } from "@/components/ReceiptCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { getFriendlyErrorMessage } from "@/lib/ui";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptView[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  async function loadReceipts() {
    setLoading(true);
    setToast("Loading receipt IDs...");
    setTone("idle");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
      const [sentIds, receivedIds] = await Promise.all([
        contract.getSentReceipts(wallet.address),
        contract.getReceivedReceipts(wallet.address)
      ]);
      const ids = Array.from(new Set([...(sentIds as string[]), ...(receivedIds as string[])]));
      setToast("Loading encrypted receipt details...");

      const details = await Promise.all(
        ids.map(async (id) => {
          const receipt = await contract.getReceipt(id);
          return {
            id,
            sender: receipt.sender,
            receiver: receipt.receiver,
            encryptedAmount: receipt.encryptedAmount,
            timestamp: Number(receipt.timestamp)
          };
        })
      );

      setReceipts(details);
      setToast(details.length ? "Receipts loaded." : "No receipts found for this wallet.");
      setTone("success");
    } catch (error) {
      setToast(getFriendlyErrorMessage(error, "network"));
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-zama-soft sm:text-sm">Receipts</p>
          <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">Private payment receipts</h1>
        </div>
        <button type="button" onClick={loadReceipts} disabled={loading} className="primary-button sm:w-auto">
          {loading ? <LoadingSpinner className="mr-2" /> : null}
          Load Receipts
        </button>
      </div>

      <div className="mb-5">
        <Toast message={toast} tone={tone} />
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        {receipts.map((receipt) => (
          <ReceiptCard key={receipt.id} receipt={receipt} />
        ))}
      </section>
    </main>
  );
}
