"use client";

import { useState } from "react";
import { connectWallet, getSelectedContractAddress, getVaultContract, truncateAddress } from "@/lib/contract";
import { encryptAmount64 } from "@/lib/fhevm";
import LoadingSpinner from "@/components/LoadingSpinner";
import ReceiptsList from "@/components/ReceiptsList";
import Toast from "@/components/Toast";
import { formatTokenAmount, getFriendlyErrorMessage, parseTokenAmount } from "@/lib/ui";
import { notifyVaultActivityChanged } from "@/lib/vaultEvents";

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
      setToast("Enter a whole ETH amount greater than zero.");
      setTone("error");
      return;
    }

    setLoading(true);
    setToast("Encrypting unshield amount locally...");

    try {
      const wallet = await connectWallet();
      const contract = getVaultContract(wallet.signer);
      const contractAddress = getSelectedContractAddress();
      const encryptedAmount = await encryptAmount64(contractAddress, wallet.address, parsedAmount.toString());
      const tx = await contract.unshield(encryptedAmount.encryptedAmount, encryptedAmount.inputProof);

      setToast(`Unshield transaction submitted: ${truncateAddress(tx.hash)}`);
      await tx.wait();
      notifyVaultActivityChanged();
      setToast(`Unshielded ${formatTokenAmount(parsedAmount)} confidential ETH.`);
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
    <main className="mx-auto w-full max-w-6xl overflow-x-hidden px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-5">
      <div className="mx-auto mb-5 max-w-3xl text-center md:mb-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Powered by Zama FHE</p>
          <h1 className="mt-2 text-[1.85rem] font-black leading-tight text-white md:mt-2 md:text-[2.9rem]">
            Receipt history.
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-zinc-400 md:mt-3 md:text-base">
            Review real vault events, including shields, transfers, withdrawal requests, and completed unshields.
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:gap-6">
        <ReceiptsList />

        <section className="activity-surface mx-auto w-full max-w-[640px]">
          <div className="mb-6 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Unshield</p>
            <h2 className="mt-2 text-xl font-black text-white md:text-2xl">Request an ETH withdrawal</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Submit the amount you want to unshield from your encrypted vault balance.
            </p>
          </div>

          <div className="grid gap-5">
            <label className="grid gap-2 text-sm font-semibold text-white">
              Confidential ETH amount
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
              Unshield ETH
            </button>
          </div>

          <div className="mt-4">
            <Toast message={toast} tone={tone} />
          </div>
        </section>
      </div>
    </main>
  );
}
