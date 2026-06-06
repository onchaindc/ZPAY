"use client";

import { useState } from "react";
import { connectWallet, getZamapayContract, truncateAddress } from "@/lib/contract";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";

export default function FaucetPage() {
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  async function mintTokens() {
    setToast("");
    setTone("idle");

    if (!amount || Number(amount) <= 0 || !Number.isInteger(Number(amount))) {
      setToast("Enter a whole token amount greater than zero.");
      setTone("error");
      return;
    }

    setLoading(true);
    setToast("Preparing faucet transaction...");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
      const tx = await contract.mint(wallet.address, BigInt(amount));
      setToast(`Mint submitted: ${truncateAddress(tx.hash)}`);
      await tx.wait();
      setToast("Test tokens minted.");
      setTone("success");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Mint failed.");
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-7">
        <p className="text-sm font-bold uppercase tracking-normal text-zama-soft">Faucet</p>
        <h1 className="mt-2 text-3xl font-black text-white sm:text-4xl">Get Sepolia test tokens</h1>
      </div>

      <section className="glass rounded-lg p-5 sm:p-6">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-white">
            Amount
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="numeric"
              className="input-field"
            />
          </label>

          <button type="button" onClick={mintTokens} disabled={loading} className="primary-button w-full">
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            Get Test Tokens
          </button>
        </div>

        <div className="mt-5">
          <Toast message={toast} tone={tone} />
        </div>
      </section>
    </main>
  );
}
