"use client";

import { useEffect, useState } from "react";
import { connectWallet, getConnectedNetworkName, getZamapayContract } from "@/lib/contract";
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
      const userAddress = await wallet.signer.getAddress();
      const handle = await contract.balanceOf(userAddress);
      const value = await userDecryptBalanceHandle(userAddress, handle, wallet.signer);
      const decryptedBalance = value?.toString?.() ?? String(value);

      // The contract never granted this user decryption rights (no mint /
      // transfer has touched their balance yet), so the relayer returns a
      // sentinel. Don't pretend success.
      if (!decryptedBalance || decryptedBalance === "0") {
        setBalance("");
        setRevealState("empty");
        setToast("No private balance yet. Receive a transfer or ask the owner to mint you tokens.");
        setTone("idle");
        return;
      }

      let asBigInt: bigint;
      try {
        asBigInt = BigInt(decryptedBalance);
      } catch {
        setBalance("");
        setRevealState("unavailable");
        setToast("Balance could not be decrypted yet.");
        setTone("idle");
        return;
      }

      if (asBigInt === MAX_UINT64 || asBigInt > DECRYPTION_UPPER_BOUND) {
        setBalance("");
        setRevealState("pending");
        setToast("Decryption pending — try again in a moment.");
        setTone("idle");
        return;
      }

      setBalance(asBigInt.toString());
      setRevealState("real");
      setToast("Balance revealed locally.");
      setTone("success");
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
    switch (revealState) {
      case "empty":
        return "No private balance yet";
      case "pending":
        return "Decrypting…";
      case "unavailable":
        return "Not decryptable yet";
      default:
        return balance || "\u2022\u2022\u2022\u2022";
    }
  })();

  return (
    <section className="glass rounded-xl p-4 sm:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-zama-soft sm:text-sm">
              Your Private Balance
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <span className="status-text text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                {balanceLabel}
              </span>
              {revealState === "real" ? (
                <span className="pb-1 text-sm font-semibold text-zinc-400">tokens</span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-zinc-400">{networkName}</p>
            {revealState === "empty" ? (
              <p className="mt-2 max-w-md text-xs text-zinc-500">
                Receive a private transfer, or ask the contract owner to mint you tokens from the Mint page.
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={revealBalance}
            disabled={loading}
            className="secondary-button sm:w-auto"
          >
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            Reveal
          </button>
        </div>
      </div>

      <div className="mt-4">
        <Toast message={toast} tone={tone} />
      </div>
    </section>
  );
}
