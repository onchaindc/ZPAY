"use client";

import { useEffect, useMemo, useState } from "react";
import type { VaultEventItem, VaultEventVariant } from "@/lib/vaultEvents";
import { formatRelativeTime } from "@/lib/ui";

type TransactionRowProps = {
  item: VaultEventItem;
};

function getEventIcon(variant: VaultEventVariant) {
  switch (variant) {
    case "shielded":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3 5 6.2v5.6c0 4.1 2.9 7.7 7 8.7 4.1-1 7-4.6 7-8.7V6.2L12 3Zm0 4.2 3.8 1.7v3c0 2.5-1.5 4.7-3.8 5.7-2.3-1-3.8-3.2-3.8-5.7v-3L12 7.2Z" />
        </svg>
      );
    case "sent":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m4.6 11.4 13.9-6.2c.8-.3 1.5.4 1.2 1.2l-6.2 13.9c-.3.8-1.4.8-1.7 0l-2.1-5.1-5.1-2.1c-.8-.3-.8-1.4 0-1.7Z" />
        </svg>
      );
    case "received":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 4v10.2l3.4-3.4 1.4 1.4L12 18 7.2 12.2l1.4-1.4 3.4 3.4V4H12Z" />
        </svg>
      );
    case "unshield-requested":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 5a7 7 0 1 0 7 7h-2a5 5 0 1 1-1.46-3.54L13 11h6V5l-2.2 2.2A6.96 6.96 0 0 0 12 5Z" />
        </svg>
      );
    case "unshielded":
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9.2 16.6-3.8-3.8 1.4-1.4 2.4 2.4 8-8 1.4 1.4-9.4 9.4Z" />
        </svg>
      );
  }
}

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

export default function TransactionRow({ item }: TransactionRowProps) {
  const [open, setOpen] = useState(false);
  const relativeTime = useMemo(() => formatRelativeTime(item.timestamp), [item.timestamp]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open]);

  function copyHash() {
    void navigator.clipboard.writeText(item.txHash);
  }

  function openDetails() {
    setOpen(true);
  }

  return (
    <>
      <article
        className="activity-card activity-card-button"
        onClick={openDetails}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDetails();
          }
        }}
        role="button"
        tabIndex={0}
      >
        <div className="activity-timeline-marker" aria-hidden="true" />

        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="activity-event-icon" aria-hidden="true">
                {getEventIcon(item.variant)}
              </span>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-black text-white">{item.title}</p>
                  <span className={`activity-status-badge ${getStatusTone(item.status)}`}>{item.status}</span>
                </div>
                <p className="mt-1 text-sm text-zinc-400">Counterparty: {item.counterparty}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-base font-black text-white">{item.amountLabel}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{relativeTime}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span className="activity-hash-chip">{item.txHash.slice(0, 10)}...{item.txHash.slice(-6)}</span>
              <span>{item.networkName}</span>
            </div>

            <a
              href={item.explorerUrl}
              target="_blank"
              rel="noreferrer"
              className="secondary-button activity-explorer-link"
              onClick={(event) => event.stopPropagation()}
            >
              View on Etherscan
            </a>
          </div>
        </div>
      </article>

      {open ? (
        <div className="modal-overlay" onClick={() => setOpen(false)} role="presentation">
          <div
            className="activity-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Transaction details"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft">Transaction Details</p>
                <h3 className="mt-2 text-2xl font-black text-white">{item.title}</h3>
              </div>

              <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label="Close details">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="m13.4 12 5.3-5.3-1.4-1.4-5.3 5.3-5.3-5.3-1.4 1.4 5.3 5.3-5.3 5.3 1.4 1.4 5.3-5.3 5.3 5.3 1.4-1.4-5.3-5.3Z" />
                </svg>
              </button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="activity-detail">
                <span className="activity-detail-label">Event type</span>
                <span className="font-semibold text-white">{item.type}</span>
              </div>
              <div className="activity-detail">
                <span className="activity-detail-label">Status</span>
                <span className="font-semibold text-white">{item.status}</span>
              </div>
              <div className="activity-detail">
                <span className="activity-detail-label">Sender</span>
                <span className="status-text font-semibold text-white">{item.sender}</span>
              </div>
              <div className="activity-detail">
                <span className="activity-detail-label">Receiver</span>
                <span className="status-text font-semibold text-white">{item.receiver}</span>
              </div>
              <div className="activity-detail">
                <span className="activity-detail-label">Timestamp</span>
                <span className="font-semibold text-white">{new Date(item.timestamp * 1000).toLocaleString()}</span>
              </div>
              <div className="activity-detail">
                <span className="activity-detail-label">Network</span>
                <span className="font-semibold text-white">{item.networkName}</span>
              </div>
              <div className="activity-detail md:col-span-2">
                <span className="activity-detail-label">Amount</span>
                <span className="font-semibold text-white">{item.amountLabel}</span>
              </div>
              <div className="activity-detail md:col-span-2">
                <span className="activity-detail-label">Transaction hash</span>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <span className="status-text font-semibold text-white">{item.txHash}</span>
                  <button type="button" className="secondary-button activity-copy-button" onClick={copyHash}>
                    Copy hash
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <a href={item.explorerUrl} target="_blank" rel="noreferrer" className="secondary-button">
                View on Etherscan
              </a>
              <button type="button" className="primary-button" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
