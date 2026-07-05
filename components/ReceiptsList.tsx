"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/Toast";
import { truncateAddress } from "@/lib/contract";
import { formatRelativeTime, getFriendlyErrorMessage } from "@/lib/ui";
import { loadVaultEventsForConnectedUser, type VaultEventItem } from "@/lib/vaultEvents";

function getStatusTone(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "completed" || normalized === "confirmed") {
    return "activity-status-success";
  }

  if (normalized === "pending") {
    return "activity-status-pending";
  }

  return "activity-status-neutral";
}

function ReceiptCard({ item }: { item: VaultEventItem }) {
  return (
    <article className="activity-card receipt-card">
      <div className="activity-timeline-marker" aria-hidden="true" />

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="activity-badge">{item.title}</span>
              <span className={`activity-status-badge ${getStatusTone(item.status)}`}>{item.status}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{formatRelativeTime(item.timestamp)}</p>
          </div>

          <a
            href={item.explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="secondary-button activity-explorer-link"
          >
            View on Sepolia Explorer
          </a>
        </div>

        <div className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
          <div className="activity-detail">
            <span className="activity-detail-label">Transfer type</span>
            <span className="font-semibold text-white">{item.title}</span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Sender</span>
            <span className="status-text font-semibold text-white">
              {item.sender === "Vault" ? "Vault" : truncateAddress(item.sender)}
            </span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Recipient</span>
            <span className="status-text font-semibold text-white">
              {item.receiver === "Vault" ? "Vault" : truncateAddress(item.receiver)}
            </span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Transaction hash</span>
            <span className="status-text font-semibold text-white">{truncateAddress(item.txHash)}</span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Date</span>
            <span className="font-semibold text-white">{new Date(item.timestamp * 1000).toLocaleString()}</span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Network</span>
            <span className="font-semibold text-white">{item.networkName}</span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Status</span>
            <span className="font-semibold text-white">{item.status}</span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Amount</span>
            <span className="status-text font-semibold text-white">{item.amountLabel}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function ReceiptsList() {
  const [receipts, setReceipts] = useState<VaultEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadReceipts() {
      try {
        setLoading(true);
        setError("");
        const events = await loadVaultEventsForConnectedUser();

        if (active) {
          setReceipts(events);
        }
      } catch (loadError) {
        if (active) {
          setReceipts([]);
          setError(getFriendlyErrorMessage(loadError, "network"));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadReceipts();

    const handleWalletStateChange = () => {
      void loadReceipts();
    };

    window.ethereum?.on?.("accountsChanged", handleWalletStateChange);
    window.ethereum?.on?.("chainChanged", handleWalletStateChange);
    window.addEventListener("zpay:network", handleWalletStateChange as EventListener);

    return () => {
      active = false;
      window.ethereum?.removeListener?.("accountsChanged", handleWalletStateChange);
      window.ethereum?.removeListener?.("chainChanged", handleWalletStateChange);
      window.removeEventListener("zpay:network", handleWalletStateChange as EventListener);
    };
  }, []);

  return (
    <section className="activity-surface mx-auto w-full">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Receipts</p>
          <h2 className="mt-2 text-xl font-black text-white md:text-2xl">Sepolia vault receipts</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Receipts are generated directly from confirmed vault events on Sepolia.
          </p>
        </div>
        <span className="text-sm font-semibold text-zinc-500">{receipts.length} receipts</span>
      </div>

      {error ? (
        <div className="mb-4">
          <Toast message={error} tone="error" />
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="activity-skeleton-card">
              <div className="activity-timeline-marker" aria-hidden="true" />
              <div className="grid gap-3">
                <div className="activity-skeleton-line h-4 w-28" />
                <div className="activity-skeleton-line h-4 w-40" />
                <div className="activity-skeleton-line h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : receipts.length ? (
        <div className="activity-timeline grid gap-3">
          {receipts.map((item) => (
            <ReceiptCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="activity-empty-state px-4 py-10 text-center md:px-6">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-zama-gold/20 bg-zama-gold/10 text-zama-gold">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
              <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-1.8-2 1.2-2-1.2-2 1.2-2-1.2L5 21V5a2 2 0 0 1 2-2Zm2 6h6V7H9v2Zm0 4h6v-2H9v2Zm0 4h4v-2H9v2Z" />
            </svg>
          </div>
          <p className="mt-4 font-black text-white">No transactions yet.</p>
          <p className="mt-2 text-sm text-zinc-400">
            Confirmed shield, transfer, and unshield events from Sepolia will appear here automatically.
          </p>
        </div>
      )}
    </section>
  );
}
