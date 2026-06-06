"use client";

import { useState } from "react";
import { connectWallet, getZamapayContract } from "@/lib/contract";
import { decryptValue } from "@/lib/fhevm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";

export default function BalanceCard() {
  const [balance, setBalance] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  async function revealBalance() {
    setLoading(true);
    setToast("Requesting encrypted balance...");
    setTone("idle");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
      const encryptedBalance = await contract.balanceOf(wallet.address);
      const decryptedBalance = await decryptValue(encryptedBalance);
      setBalance(decryptedBalance);
      setToast("Balance revealed locally.");
      setTone("success");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Could not reveal balance.");
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="glass rounded-lg p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-normal text-lavender">Your Balance</p>
          <div className="mt-3 flex items-end gap-3">
            <span className="text-4xl font-black text-white sm:text-5xl">
              {balance ? balance : "••••"}
            </span>
            <span className="pb-1 text-sm font-semibold text-violet-100/60">ZAMA</span>
          </div>
        </div>
        <button type="button" onClick={revealBalance} disabled={loading} className="secondary-button">
          {loading ? <LoadingSpinner className="mr-2" /> : null}
          Reveal
        </button>
      </div>
      <div className="mt-5">
        <Toast message={toast} tone={tone} />
      </div>
    </section>
  );
}
