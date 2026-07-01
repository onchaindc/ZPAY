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

  const skeletonRows = Array.from({ length: 3 }, (_, index) => `receipt-skeleton-${index}`);

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
    <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft sm:text-sm">Activity</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">
            Encrypted payment history.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">
            Review selective receipts, inspect counterparties, and reveal encrypted amounts locally when needed.
          </p>
        </div>
        <button type="button" onClick={loadReceipts} disabled={loading} className="primary-button sm:w-auto">
          {loading ? <LoadingSpinner className="mr-2" /> : null}
          Load Activity
        </button>
      </div>

      <div className="mb-5">
        <Toast message={toast} tone={tone} />
      </div>

      <section className="activity-surface">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft sm:text-sm">Timeline</p>
            <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Encrypted transactions</h2>
          </div>
          <span className="text-sm font-semibold text-zinc-500">
            {loading ? "Refreshing..." : `${receipts.length} receipts`}
          </span>
        </div>

        {loading ? (
          <div className="activity-timeline">
            {skeletonRows.map((row) => (
              <div key={row} className="activity-skeleton-card">
                <div className="activity-timeline-marker" aria-hidden="true" />
                <div className="grid gap-4">
                  <div className="activity-skeleton-line h-3 w-28" />
                  <div className="activity-skeleton-line h-9 w-40" />
                  <div className="activity-skeleton-line h-3 w-full max-w-[22rem]" />
                  <div className="activity-skeleton-line h-3 w-full max-w-[18rem]" />
                </div>
              </div>
            ))}
          </div>
        ) : receipts.length ? (
          <div className="activity-timeline">
            {receipts.map((receipt) => (
              <ReceiptCard key={receipt.id} receipt={receipt} />
            ))}
          </div>
        ) : (
          <div className="activity-empty-state">
            <div className="activity-empty-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
                <path d="M12 3 5 6.2v5.6c0 4.1 2.9 7.7 7 8.7 4.1-1 7-4.6 7-8.7V6.2L12 3Zm0 4.2 3.8 1.7v3c0 2.5-1.5 4.7-3.8 5.7-2.3-1-3.8-3.2-3.8-5.7v-3L12 7.2Z" />
              </svg>
            </div>
            <p className="mt-4 font-black text-white">No encrypted activity yet</p>
            <p className="mt-2 max-w-lg text-sm leading-6 text-zinc-400">
              Load your wallet activity to view private receipts here. Once payments settle, each transaction will appear in this encrypted timeline.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
