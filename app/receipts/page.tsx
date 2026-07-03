"use client";

import { useState } from "react";
import { connectWallet, getSelectedContractAddress, getZamapayContract, truncateAddress } from "@/lib/contract";
import { encryptAmount64 } from "@/lib/fhevm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { formatTokenAmount, getFriendlyErrorMessage, parseTokenAmount } from "@/lib/ui";

export default function ReceiptsPage() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  async function unshieldBalance() {
    setToast("");
    setTone("idle");

    const parsedAmount = parseTokenAmount(amount);
    if (!parsedAmount) {
      setToast("Enter a whole number of tokens greater than zero.");
      setTone("error");
      return;
    }

    setLoading(true);
    setToast("Encrypting unshield amount locally...");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
      const contractAddress = getSelectedContractAddress();
      const encryptedAmount = await encryptAmount64(contractAddress, wallet.address, parsedAmount.toString());
      const tx = await contract.unshield(encryptedAmount.encryptedAmount, encryptedAmount.inputProof);

      setToast(`Unshield transaction submitted: ${truncateAddress(tx.hash)}`);
      await tx.wait();
      setToast(`Unshielded ${formatTokenAmount(parsedAmount)} confidential tokens.`);
      setTone("success");
      setAmount("");
    } catch (error) {
      setToast(getFriendlyErrorMessage(error, "contract"));
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[640px] overflow-x-hidden px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto mb-7 max-w-[640px] text-center md:mb-9">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Powered by Zama FHE</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">
            Unshield confidential funds.
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400 md:text-base">
            Reduce your encrypted ZamaPay vault balance. ETH withdrawals will be enabled after the confidential accounting flow is complete.
          </p>
        </div>
      </div>

      <section className="activity-surface mx-auto w-full">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Unshield</p>
          <h2 className="mt-2 text-xl font-black text-white md:text-2xl">Update encrypted balance</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            For now this updates the confidential balance only. No ETH is sent from the vault in this phase.
          </p>
        </div>

        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-white">
            Confidential token amount
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="numeric"
              placeholder="25"
              className="input-field"
            />
          </label>

          <button type="button" onClick={unshieldBalance} disabled={loading} className="primary-button w-full">
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            Unshield Funds
          </button>
        </div>

        <div className="mt-4">
          <Toast message={toast} tone={tone} />
        </div>
      </section>
    </main>
  );
}
