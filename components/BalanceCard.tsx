"use client";

import { useEffect, useState } from "react";
import { connectWallet, getConnectedNetworkName, getSelectedContractAddress, getZamapayContract } from "@/lib/contract";
import { userDecryptBalanceHandle } from "@/lib/fhevm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { getFriendlyErrorMessage } from "@/lib/ui";

// Sentinel values the relayer can return when decryption isn't possible
// (ACL not granted, ciphertext not yet available, etc.). We treat any value
// above the sanity ceiling as "not a real balance" rather than pretending a
// successful reveal.
const MAX_UINT64 = BigInt("18446744073709551615");
const DECRYPTION_UPPER_BOUND = BigInt("1000000000000");

type RevealState = "idle" | "real" | "empty" | "pending" | "unavailable";

export default function BalanceCard() {
  const [balance, setBalance] = useState("");
  const [revealState, setRevealState] = useState<RevealState>("idle");
  const [networkName, setNetworkName] = useState("Connected network");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    let active = true;

    async function syncNetworkName() {
      try {
        const nextName = await getConnectedNetworkName();

        if (active) {
          setNetworkName(nextName);
        }
      } catch {
        if (active) {
          setNetworkName("Connected network");
        }
      }
    }

    void syncNetworkName();

    const handleChainChanged = () => {
      void syncNetworkName();
    };

    window.ethereum?.on?.("chainChanged", handleChainChanged);

    return () => {
      active = false;
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  async function revealBalance() {
    setLoading(true);
    setToast("");
    setTone("idle");
    setRevealState("idle");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
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

      setBalance(asBigInt.toString());
      setRevealState("real");
    } catch (error) {
      setBalance("");
      setRevealState("idle");
      setToast(getFriendlyErrorMessage(error, "network"));
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
        return "No confidential balance yet";
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
      <div className="relative flex flex-col gap-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <span className="balance-shield" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3 5 6.2v5.6c0 4.1 2.9 7.7 7 8.7 4.1-1 7-4.6 7-8.7V6.2L12 3Zm0 4.2 3.8 1.7v3c0 2.5-1.5 4.7-3.8 5.7-2.3-1-3.8-3.2-3.8-5.7v-3L12 7.2Z" />
                </svg>
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-zama-soft md:text-sm">
                Confidential Balance
              </p>
            </div>

            <div className="mt-6 min-h-[5.5rem]">
              {loading ? (
                <div className="balance-skeleton" aria-label="Loading balance" />
              ) : (
                <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                  <span className="status-text text-4xl font-black leading-none text-white md:text-6xl lg:text-7xl">
                    {balanceLabel}
                  </span>
                  {revealState === "real" ? (
                    <span className="pb-1 text-sm font-bold uppercase tracking-[0.18em] text-zinc-400 md:pb-2">
                      tokens
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
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
            Reveal Confidential Balance
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
