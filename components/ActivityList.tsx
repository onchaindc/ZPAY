"use client";

import { useEffect, useMemo, useState } from "react";
import Toast from "@/components/Toast";
import TransactionRow, { getEventIcon, getStatusTone } from "@/components/TransactionRow";
import { getFriendlyErrorMessage, formatRelativeTime } from "@/lib/ui";
import {
  loadVaultEventsForConnectedUser,
  subscribeToVaultEventsForConnectedUser,
  type VaultEventItem,
  VAULT_ACTIVITY_EVENT
} from "@/lib/vaultEvents";

function ActivityPreview({ item, onOpen }: { item: VaultEventItem; onOpen: () => void }) {
  const relativeTime = useMemo(() => formatRelativeTime(item.timestamp), [item.timestamp]);

  return (
    <button type="button" className="activity-card activity-card-button activity-preview-card" onClick={onOpen}>
      <div className="activity-timeline-marker" aria-hidden="true" />

      <div className="flex flex-col gap-4">
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

          <div className="min-w-0 text-left md:text-right">
            <p className="text-base font-black text-white">{item.amountLabel}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{relativeTime}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="activity-hash-chip">{item.txHash.slice(0, 10)}...{item.txHash.slice(-6)}</span>
            <span>{item.networkName}</span>
          </div>

          <span className="inline-flex items-center gap-2 font-semibold text-zama-soft">
            See all
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="m9 6 6 6-6 6-1.4-1.4 4.6-4.6-4.6-4.6L9 6Z" />
            </svg>
          </span>
        </div>
      </div>
    </button>
  );
}

export default function ActivityList() {
  const [activity, setActivity] = useState<VaultEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    async function loadActivity() {
      try {
        if (active) {
          setLoading(true);
        }
        setError("");
        const events = await loadVaultEventsForConnectedUser();

        if (active) {
          setActivity(events);
        }
      } catch (loadError) {
        if (active) {
          setActivity([]);
          setError(getFriendlyErrorMessage(loadError, "network"));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadActivity();
    void subscribeToVaultEventsForConnectedUser(() => {
      void loadActivity();
    }).then((cleanup) => {
      unsubscribe = cleanup;
    });

    const handleWalletStateChange = () => {
      void loadActivity();
    };

    const handleActivityChange = () => {
      void loadActivity();
    };

    window.ethereum?.on?.("accountsChanged", handleWalletStateChange);
    window.ethereum?.on?.("chainChanged", handleWalletStateChange);
    window.addEventListener("zpay:network", handleWalletStateChange as EventListener);
    window.addEventListener(VAULT_ACTIVITY_EVENT, handleActivityChange as EventListener);

    return () => {
      active = false;
      unsubscribe?.();
      window.ethereum?.removeListener?.("accountsChanged", handleWalletStateChange);
      window.ethereum?.removeListener?.("chainChanged", handleWalletStateChange);
      window.removeEventListener("zpay:network", handleWalletStateChange as EventListener);
      window.removeEventListener(VAULT_ACTIVITY_EVENT, handleActivityChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!historyOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHistoryOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [historyOpen]);

  const latestActivity = activity[0];

  return (
    <>
      <section className="glass rounded-xl p-4 md:flex md:min-h-0 md:flex-col md:p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Recent Activity</p>
            <h2 className="mt-2 text-xl font-black text-white md:text-2xl">Vault event history</h2>
          </div>

          <div className="flex items-center gap-3 self-start">
            <span className="text-sm font-semibold text-zinc-500">{activity.length} events</span>
            {activity.length ? (
              <button type="button" className="secondary-button activity-inline-action" onClick={() => setHistoryOpen(true)}>
                See all
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="m9 6 6 6-6 6-1.4-1.4 4.6-4.6-4.6-4.6L9 6Z" />
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="mb-4">
            <Toast message={error} tone="error" />
          </div>
        ) : null}

        {loading ? (
          <div className="grid gap-3">
            <div className="activity-skeleton-card">
              <div className="activity-timeline-marker" aria-hidden="true" />
              <div className="grid gap-3">
                <div className="activity-skeleton-line h-4 w-28" />
                <div className="activity-skeleton-line h-4 w-40" />
                <div className="activity-skeleton-line h-16 w-full" />
              </div>
            </div>
          </div>
        ) : latestActivity ? (
          <div className="grid gap-3">
            <ActivityPreview item={latestActivity} onOpen={() => setHistoryOpen(true)} />
            {activity.length > 1 ? (
              <p className="text-sm text-zinc-500">
                Showing the latest event. Open the full activity view to see {activity.length - 1} more.
              </p>
            ) : null}
          </div>
        ) : (
          <div className="activity-empty-state px-4 py-10 text-center md:px-6">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-zama-gold/20 bg-zama-gold/10 text-zama-gold">
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-1.8-2 1.2-2-1.2-2 1.2-2-1.2L5 21V5a2 2 0 0 1 2-2Zm2 6h6V7H9v2Zm0 4h6v-2H9v2Z" />
              </svg>
            </div>
            <p className="mt-4 font-black text-white">No activity yet.</p>
            <p className="mt-2 text-sm text-zinc-400">
              Your encrypted activity will appear here after your first confidential transaction.
            </p>
          </div>
        )}
      </section>

      {historyOpen ? (
        <div className="modal-overlay" onClick={() => setHistoryOpen(false)} role="presentation">
          <div
            className="activity-modal activity-history-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Full activity history"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="activity-history-header">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft">Recent Activity</p>
                <h3 className="mt-2 text-2xl font-black text-white md:text-3xl">Full vault event history</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Review every shield, transfer, withdrawal request, and completed unshield in one place.
                </p>
              </div>

              <button type="button" className="icon-button" onClick={() => setHistoryOpen(false)} aria-label="Close activity history">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="m13.4 12 5.3-5.3-1.4-1.4-5.3 5.3-5.3-5.3-1.4 1.4 5.3 5.3-5.3 5.3 1.4 1.4 5.3-5.3 5.3 5.3 1.4-1.4-5.3-5.3Z" />
                </svg>
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 text-sm text-zinc-500">
              <span>{activity.length} events</span>
              <button type="button" className="secondary-button activity-inline-action" onClick={() => setHistoryOpen(false)}>
                Close
              </button>
            </div>

            {error ? (
              <div className="mt-4">
                <Toast message={error} tone="error" />
              </div>
            ) : null}

            <div className="activity-history-scroll mt-5">
              {loading ? (
                <div className="grid gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="activity-skeleton-card">
                      <div className="activity-timeline-marker" aria-hidden="true" />
                      <div className="grid gap-3">
                        <div className="activity-skeleton-line h-4 w-28" />
                        <div className="activity-skeleton-line h-4 w-40" />
                        <div className="activity-skeleton-line h-16 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : activity.length ? (
                <div className="activity-timeline grid gap-3 pr-1">
                  {activity.map((item) => (
                    <TransactionRow key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="activity-empty-state px-4 py-10 text-center md:px-6">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-zama-gold/20 bg-zama-gold/10 text-zama-gold">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                      <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-1.8-2 1.2-2-1.2-2 1.2-2-1.2L5 21V5a2 2 0 0 1 2-2Zm2 6h6V7H9v2Zm0 4h6v-2H9v2Z" />
                    </svg>
                  </div>
                  <p className="mt-4 font-black text-white">No activity yet.</p>
                  <p className="mt-2 text-sm text-zinc-400">
                    Your encrypted activity will appear here after your first confidential transaction.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
