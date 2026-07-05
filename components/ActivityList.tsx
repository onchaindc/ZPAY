"use client";

import { useEffect, useState } from "react";
import Toast from "@/components/Toast";
import TransactionRow from "@/components/TransactionRow";
import { getFriendlyErrorMessage } from "@/lib/ui";
import {
  loadVaultEventsForConnectedUser,
  subscribeToVaultEventsForConnectedUser,
  type VaultEventItem,
  VAULT_ACTIVITY_EVENT
} from "@/lib/vaultEvents";

export default function ActivityList() {
  const [activity, setActivity] = useState<VaultEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <section className="glass rounded-xl p-4 md:flex md:min-h-0 md:flex-1 md:flex-col md:p-5">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Recent Activity</p>
          <h2 className="mt-2 text-xl font-black text-white md:text-2xl">Vault event history</h2>
        </div>
        <span className="text-sm font-semibold text-zinc-500">{activity.length} events</span>
      </div>

      {error ? (
        <div className="mb-4">
          <Toast message={error} tone="error" />
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-3 md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
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
        <div className="activity-timeline grid gap-3 md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
          {activity.map((item) => (
            <TransactionRow key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="activity-empty-state px-4 py-10 text-center md:min-h-0 md:flex-1 md:px-6">
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
  );
}
