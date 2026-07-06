"use client";

import { useEffect, useState } from "react";
import { connectWallet, getInjectedProvider, getSelectedContractAddress, getSelectedNetwork, getVaultContract } from "@/lib/contract";
import { userDecryptBalanceHandle } from "@/lib/fhevm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { formatTokenAmount, getFriendlyErrorMessage } from "@/lib/ui";

// Sentinel values the relayer can return when decryption isn't possible
// (ACL not granted, ciphertext not yet available, etc.). We treat any value
// above the sanity ceiling as "not a real balance" rather than pretending a
// successful reveal.
const MAX_UINT64 = BigInt("18446744073709551615");
const DECRYPTION_UPPER_BOUND = MAX_UINT64 - BigInt(1);

type RevealState = "idle" | "real" | "empty" | "pending" | "unavailable";

export default function BalanceCard() {
  const [balance, setBalance] = useState("");
  const [revealState, setRevealState] = useState<RevealState>("idle");
  const [networkName, setNetworkName] = useState(getSelectedNetwork().name);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    let active = true;

    function syncNetworkName() {
      if (active) {
        setNetworkName(getSelectedNetwork().name);
      }
    }

    syncNetworkName();

    const handleChainChanged = () => {
      syncNetworkName();
    };

    const walletProvider = getInjectedProvider();
    walletProvider?.on?.("chainChanged", handleChainChanged);
    window.addEventListener("zpay:network", handleChainChanged as EventListener);

    return () => {
      active = false;
      walletProvider?.removeListener?.("chainChanged", handleChainChanged);
      window.removeEventListener("zpay:network", handleChainChanged as EventListener);
    };
  }, []);

  async function revealBalance() {
    setLoading(true);
    setToast("");
    setTone("idle");
    setRevealState("idle");

    try {
      const wallet = await connectWallet();
      const contract = getVaultContract(wallet.signer);
      const contractAddress = getSelectedContractAddress();
      const userAddress = await wallet.signer.getAddress();
      const handle = await contract.balanceOf(userAddress);
      const value = await userDecryptBalanceHandle(contractAddress, userAddress, handle, wallet.signer);
      const decryptedBalance = value?.toString?.() ?? String(value);

      // The contract never granted this user decryption rights (no mint /
      // transfer has touched their balance yet), so the relayer returns a
      // sentinel. Don't pretend success.
      if (!decryptedBalance || decryptedBalance === "0") {
        setBalance("");
        setRevealState("empty");
        return;
      }

      let asBigInt: bigint;
      try {
        asBigInt = BigInt(decryptedBalance);
      } catch {
        setBalance("");
        setRevealState("unavailable");
        return;
      }

      if (asBigInt === MAX_UINT64 || asBigInt > DECRYPTION_UPPER_BOUND) {
        setBalance("");
        setRevealState("pending");
        return;
      }

      setBalance(formatTokenAmount(asBigInt));
      setRevealState("real");
    } catch (error) {
      setBalance("");
      setRevealState("idle");
      setToast(getFriendlyErrorMessage(error, "balance"));
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  const balanceLabel = (() => {
    if (loading) {
      return "";
    }

    switch (revealState) {
      case "empty":
        return "No balance yet";
      case "pending":
        return "Decrypting…";
      case "unavailable":
        return "Not decryptable yet";
      default:
        return balance || "\u2022\u2022\u2022\u2022";
    }
  })();

  return (
    <section className="balance-hero">
      <div className="balance-hero-glow" aria-hidden="true" />
      <div className="relative flex flex-col gap-5 md:gap-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 md:gap-3">
              <span className="balance-shield" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3 5 6.2v5.6c0 4.1 2.9 7.7 7 8.7 4.1-1 7-4.6 7-8.7V6.2L12 3Zm0 4.2 3.8 1.7v3c0 2.5-1.5 4.7-3.8 5.7-2.3-1-3.8-3.2-3.8-5.7v-3L12 7.2Z" />
                </svg>
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zama-soft md:text-sm">
                Balance
              </p>
            </div>

            <div className="mt-3 min-h-[3.7rem] md:mt-4 md:min-h-[5rem]">
              {loading ? (
                <div className="balance-skeleton" aria-label="Loading balance" />
              ) : (
                <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                  <span className="status-text text-4xl font-black leading-none text-white md:text-5xl lg:text-6xl">
                    {balanceLabel}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex flex-col gap-2 md:mt-4 md:flex-row md:items-center md:gap-3">
              <span className="balance-network-pill">{networkName}</span>
            </div>

          </div>

          <button
            type="button"
            onClick={revealBalance}
            disabled={loading}
            className="balance-reveal-button"
          >
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            View Balance
          </button>
        </div>
      </div>

      {tone === "error" ? (
        <div className="mt-4">
          <Toast message={toast} tone={tone} />
        </div>
      ) : null}
    </section>
  );
}
