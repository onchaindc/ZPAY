"use client";

import { useState } from "react";
import { isAddress } from "ethers";
import { connectWallet, getZamapayContract, truncateAddress } from "@/lib/contract";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { getFriendlyErrorMessage, parseTokenAmount } from "@/lib/ui";

export default function FaucetPage() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  async function mintBalance() {
    setToast("");
    setTone("idle");

    const wallet = await connectWallet().catch(() => null);
    if (!wallet) {
      setToast("Connect your wallet first.");
      setTone("error");
      return;
    }

    const target = recipient.trim() || wallet.address;
    if (!isAddress(target)) {
      setToast("Enter a valid recipient address.");
      setTone("error");
      return;
    }

    const parsedAmount = parseTokenAmount(amount);
    if (!parsedAmount) {
      setToast("Enter a whole number of tokens greater than zero.");
      setTone("error");
      return;
    }

    setLoading(true);
    setToast("Submitting mint transaction...");

    try {
      const contract = getZamapayContract(wallet.signer);
      const tx = await contract.mint(target, parsedAmount);
      setToast(`Mint submitted: ${truncateAddress(tx.hash)}`);
      await tx.wait();
      setToast(`Minted ${amount} private tokens to ${truncateAddress(target)}.`);
      setTone("success");
      setRecipient("");
    } catch (error) {
      // mint() is owner-only — surface that clearly instead of the generic
      // "check your balance" message from getFriendlyErrorMessage.
      const msg = error instanceof Error ? error.message.toLowerCase() : "";
      if (
        msg.includes("owner") ||
        msg.includes("ownable") ||
        msg.includes("missing role") ||
        msg.includes("execution reverted")
      ) {
        setToast("Mint is owner-only. Connect with the deployer wallet.");
      } else {
        setToast(getFriendlyErrorMessage(error, "contract"));
      }
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-normal text-zama-soft sm:text-sm">Mint</p>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">Fund a private balance</h1>
        <p className="mt-3 max-w-2xl text-sm text-zinc-400">
          The ZamaPay contract has no public deposit path — balance is created by the
          contract owner via <code className="text-zama-gold">mint()</code>. Connect with the
          deployer wallet to credit any address with encrypted tokens.
        </p>
      </div>

      <section className="glass rounded-xl p-4 sm:p-6">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-white">
            Recipient
            <input
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
              placeholder="0x... (defaults to your wallet)"
              className="input-field"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-white">
            Amount (tokens)
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="numeric"
              placeholder="100"
              className="input-field"
            />
          </label>

          <button type="button" onClick={mintBalance} disabled={loading} className="primary-button sm:w-auto">
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            Mint Private Balance
          </button>
        </div>

        <div className="mt-4">
          <Toast message={toast} tone={tone} />
        </div>
      </section>
    </main>
  );
}
