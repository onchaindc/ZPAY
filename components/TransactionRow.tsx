"use client";

import { getSelectedNetwork, truncateAddress } from "@/lib/contract";
import type { VaultEventItem } from "@/lib/vaultEvents";

type TransactionRowProps = {
  item: VaultEventItem;
};

export default function TransactionRow({ item }: TransactionRowProps) {
  const explorerBaseUrl = getSelectedNetwork().blockExplorerUrls[0];

  return (
    <article className="activity-card">
      <div className="activity-timeline-marker" aria-hidden="true" />

      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="activity-badge">{item.type}</span>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{item.status}</span>
          </div>

          <div className="mt-4 grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
            <div className="activity-detail">
              <span className="activity-detail-label">Counterparty</span>
              <span className="status-text font-semibold text-white">
                {item.counterparty === "Vault" ? item.counterparty : truncateAddress(item.counterparty)}
              </span>
            </div>

            <div className="activity-detail">
              <span className="activity-detail-label">Transaction</span>
              <a
                href={`${explorerBaseUrl}/tx/${item.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="status-text font-semibold text-white underline decoration-white/15 underline-offset-4 transition hover:text-zama-soft"
              >
                {truncateAddress(item.txHash)}
              </a>
            </div>

            <div className="activity-detail">
              <span className="activity-detail-label">Timestamp</span>
              <span className="font-semibold text-white">{new Date(item.timestamp * 1000).toLocaleString()}</span>
            </div>

            <div className="activity-detail">
              <span className="activity-detail-label">Status</span>
              <span className="font-semibold text-white">{item.status}</span>
            </div>
          </div>
        </div>

        <div className="activity-amount-panel">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft">Amount</p>
          <p className="mt-3 text-2xl font-black leading-none text-white md:text-3xl">{item.amountLabel}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Confidential ETH</p>
        </div>
      </div>
    </article>
  );
}
