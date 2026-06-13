"use client";

import { useState } from "react";
import { isAddress } from "ethers";
import { connectWallet, getSelectedContractAddress, getZamapayContract, truncateAddress } from "@/lib/contract";
import { encryptAmount64 } from "@/lib/fhevm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { formatEthAmount, getFriendlyErrorMessage, parseEthAmount } from "@/lib/ui";

type SendFormProps = {
  compact?: boolean;
};

export default function SendForm({ compact = false }: SendFormProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [generateReceipt, setGenerateReceipt] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  async function submitTransfer() {
    setToast("");
    setTone("idle");

    if (!isAddress(recipient)) {
      setToast("Enter a valid recipient address.");
      setTone("error");
      return;
    }

    const parsedAmount = parseEthAmount(amount);

    if (!parsedAmount) {
      setToast("Enter a valid ETH amount greater than zero.");
      setTone("error");
      return;
    }

    setLoading(true);
    setToast("Encrypting ETH amount locally...");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
      const contractAddress = getSelectedContractAddress();
      const encryptedAmount = await encryptAmount64(contractAddress, wallet.address, parsedAmount.toString());
      const displayAmount = formatEthAmount(parsedAmount);
      setToast(generateReceipt ? `Sending ${displayAmount} ETH privately with receipt...` : `Sending ${displayAmount} ETH privately...`);

      const tx = generateReceipt
        ? await contract.privateTransferWithReceipt(recipient, encryptedAmount.encryptedAmount, encryptedAmount.inputProof)
        : await contract.privateTransfer(recipient, encryptedAmount.encryptedAmount, encryptedAmount.inputProof);

      setToast(`Transaction submitted: ${truncateAddress(tx.hash)}`);
      await tx.wait();
      setToast("Private transfer confirmed.");
      setTone("success");
      setRecipient("");
      setAmount("");
    } catch (error) {
      setToast(getFriendlyErrorMessage(error, "contract"));
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`glass rounded-xl ${compact ? "p-4 sm:p-6" : "p-4 sm:p-6"}`}>
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-normal text-zama-soft sm:text-sm">Private Transfer</p>
        <h2 className="mt-2 text-xl font-black text-white sm:text-2xl">Send encrypted ETH</h2>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-white">
          Recipient
          <input
            value={recipient}
            onChange={(event) => setRecipient(event.target.value)}
            placeholder="0x..."
            className="input-field"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-white">
          Amount (ETH)
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="decimal"
            placeholder="0.05"
            className="input-field"
          />
        </label>

        <button
          type="button"
          onClick={() => setGenerateReceipt((current) => !current)}
          className="flex items-center justify-between rounded-xl border border-zama-gold/25 bg-white/5 px-4 py-3 text-left"
          aria-pressed={generateReceipt}
        >
          <span className="min-w-0">
            <span className="block font-semibold text-white">Generate receipt</span>
            <span className="block text-sm text-zinc-400">Reveal payment details only to authorized parties.</span>
          </span>
          <span
            className={`ml-4 flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${
              generateReceipt ? "bg-zama-gold" : "bg-white/12"
            }`}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white transition ${
                generateReceipt ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </span>
        </button>

        <button type="button" onClick={submitTransfer} disabled={loading} className="primary-button sm:w-auto">
          {loading ? <LoadingSpinner className="mr-2" /> : null}
          Submit Transfer
        </button>
      </div>

      <div className="mt-4">
        <Toast message={toast} tone={tone} />
      </div>
    </section>
  );
}
