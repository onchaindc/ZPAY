"use client";

import { useState } from "react";
import { connectWallet, getZamapayContract, truncateAddress } from "@/lib/contract";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { getFriendlyErrorMessage, parseEthAmount } from "@/lib/ui";

export default function FaucetPage() {
  const [amount, setAmount] = useState("0.10");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  async function depositEth() {
    setToast("");
    setTone("idle");

    const parsedAmount = parseEthAmount(amount);

    if (!parsedAmount) {
      setToast("Enter a valid ETH amount greater than zero.");
      setTone("error");
      return;
    }

    setLoading(true);
    setToast("Preparing private ETH deposit...");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
      const tx = await contract.deposit({ value: parsedAmount });
      setToast(`Deposit submitted: ${truncateAddress(tx.hash)}`);
      await tx.wait();
      setToast("Private balance funded.");
      setTone("success");
    } catch (error) {
      setToast(getFriendlyErrorMessage(error, "contract"));
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-normal text-zama-soft sm:text-sm">Deposit</p>
        <h1 className="mt-2 text-2xl font-black text-white sm:text-4xl">Fund your private ETH vault</h1>
      </div>

      <section className="glass rounded-xl p-4 sm:p-6">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-white">
            Amount (ETH)
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              className="input-field"
            />
          </label>

          <button type="button" onClick={depositEth} disabled={loading} className="primary-button sm:w-auto">
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            Deposit ETH
          </button>
        </div>

        <div className="mt-4">
          <Toast message={toast} tone={tone} />
        </div>
      </section>
    </main>
  );
}
