"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/Toast";
import { getSelectedNetwork, truncateAddress } from "@/lib/contract";
import { getFriendlyErrorMessage } from "@/lib/ui";
import { loadVaultEventsForConnectedUser, type VaultEventItem } from "@/lib/vaultEvents";

function ReceiptCard({ item }: { item: VaultEventItem }) {
  const explorerBaseUrl = getSelectedNetwork().blockExplorerUrls[0];

  return (
    <article className="activity-card">
      <div className="activity-timeline-marker" aria-hidden="true" />

      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="activity-badge">{item.type}</span>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{item.status}</span>
        </div>

        <div className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
          <div className="activity-detail">
            <span className="activity-detail-label">Sender</span>
            <span className="status-text font-semibold text-white">
              {item.sender === "Vault" ? "Vault" : truncateAddress(item.sender)}
            </span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Receiver</span>
            <span className="status-text font-semibold text-white">
              {item.receiver === "Vault" ? "Vault" : truncateAddress(item.receiver)}
            </span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Amount</span>
            <span className="status-text font-semibold text-white">{item.amountLabel}</span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Status</span>
            <span className="font-semibold text-white">{item.status}</span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Timestamp</span>
            <span className="font-semibold text-white">{new Date(item.timestamp * 1000).toLocaleString()}</span>
          </div>

          <div className="activity-detail">
            <span className="activity-detail-label">Transaction hash</span>
            <a
              href={`${explorerBaseUrl}/tx/${item.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="status-text font-semibold text-white underline decoration-white/15 underline-offset-4 transition hover:text-zama-soft"
            >
              {truncateAddress(item.txHash)}
            </a>
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
    window.addEventListener("zamapay:network", handleWalletStateChange as EventListener);

    return () => {
      active = false;
      window.ethereum?.removeListener?.("accountsChanged", handleWalletStateChange);
      window.ethereum?.removeListener?.("chainChanged", handleWalletStateChange);
      window.removeEventListener("zamapay:network", handleWalletStateChange as EventListener);
    };
  }, []);

  return (
    <section className="activity-surface mx-auto w-full">
      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Receipts</p>
          <h2 className="mt-2 text-xl font-black text-white md:text-2xl">Confirmed vault transactions</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Receipts are generated directly from ZamapayVault events on the selected network.
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
            Confirmed shield, transfer, and unshield events will appear here automatically.
          </p>
        </div>
      )}
    </section>
  );
}
