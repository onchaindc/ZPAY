"use client";

import { useState } from "react";
import { connectWallet, getSelectedContractAddress, getVaultContract, truncateAddress } from "@/lib/contract";
import { encryptAmount64 } from "@/lib/fhevm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { formatTokenAmount, getFriendlyErrorMessage, parseTokenAmount } from "@/lib/ui";
import { notifyVaultActivityChanged } from "@/lib/vaultEvents";

export default function FaucetPage() {
  const [amount, setAmount] = useState("0.001");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  async function shieldBalance() {
    setToast("");
    setTone("idle");

    const wallet = await connectWallet().catch(() => null);
    if (!wallet) {
      setToast("Connect your wallet first.");
      setTone("error");
      return;
    }

    const parsedAmount = parseTokenAmount(amount);
    if (!parsedAmount) {
      setToast("Enter an ETH amount greater than zero.");
      setTone("error");
      return;
    }

    setLoading(true);
    setToast("Encrypting shield amount locally...");

    try {
      const contract = getVaultContract(wallet.signer);
      const contractAddress = getSelectedContractAddress();
      const encryptedAmount = await encryptAmount64(contractAddress, wallet.address, parsedAmount.toString());
      const tx = await contract.shield(encryptedAmount.encryptedAmount, encryptedAmount.inputProof, {
        value: parsedAmount
      });

      setToast(`Shield transaction submitted: ${truncateAddress(tx.hash)}`);
      await tx.wait();
      notifyVaultActivityChanged();
      setToast(`Shielded ${formatTokenAmount(parsedAmount)} ETH into your confidential balance.`);
      setTone("success");
    } catch (error) {
      setToast(getFriendlyErrorMessage(error, "contract"));
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[640px] overflow-x-hidden px-4 pb-20 pt-3 md:px-8 md:pb-5 md:pt-4">
      <div className="mx-auto mb-4 max-w-[640px] text-center md:mb-4">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Shield Funds</p>
        <h1 className="mt-2 text-[1.85rem] font-black leading-tight text-white md:mt-2 md:text-[2.9rem]">Shield ETH into your vault</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400 md:mt-3 md:text-base">
          Shielding locks your ETH in the vault and converts it into a confidential encrypted balance.
        </p>
      </div>

      <section className="glass mx-auto w-full rounded-xl p-4 md:p-6">
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-white">
            Amount to Shield (ETH)
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="0.001"
              className="input-field"
            />
          </label>

          <button type="button" onClick={shieldBalance} disabled={loading} className="primary-button w-full">
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            Shield ETH
          </button>
        </div>

        <div className="mt-4">
          <Toast message={toast} tone={tone} />
        </div>
      </section>
    </main>
  );
}
