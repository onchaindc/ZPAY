"use client";

import { useState } from "react";
import { isAddress } from "ethers";
import { connectWallet, getZamapayContract, truncateAddress } from "@/lib/contract";
import { getFhevmInstance } from "@/lib/fhevm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";

type SendFormProps = {
  compact?: boolean;
};

type EncryptedPayload = {
  handles: unknown[];
  inputProof: unknown;
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

    if (!amount || Number(amount) <= 0 || !Number.isInteger(Number(amount))) {
      setToast("Enter a whole token amount greater than zero.");
      setTone("error");
      return;
    }

    setLoading(true);
    setToast("Encrypting amount locally...");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
      const fhevm = await getFhevmInstance();
      const encrypted = await fhevm.encrypt64(BigInt(amount));
      const hasPayload =
        encrypted && typeof encrypted === "object" && "handles" in encrypted && "inputProof" in encrypted;
      const { encryptedAmount, inputProof } =
        hasPayload
          ? {
              encryptedAmount: (encrypted as EncryptedPayload).handles[0],
              inputProof: (encrypted as EncryptedPayload).inputProof
            }
          : {
              encryptedAmount: encrypted,
              inputProof: "0x"
            };
      setToast(generateReceipt ? "Sending private transfer with receipt..." : "Sending private transfer...");

      const tx = generateReceipt
        ? await contract.transferWithReceipt(recipient, encryptedAmount, inputProof)
        : await contract.transfer(recipient, encryptedAmount, inputProof);

      setToast(`Transaction submitted: ${truncateAddress(tx.hash)}`);
      await tx.wait();
      setToast("Transfer confirmed.");
      setTone("success");
      setRecipient("");
      setAmount("");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Transfer failed.");
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`glass rounded-lg ${compact ? "p-5" : "p-5 sm:p-6"}`}>
      <div className="mb-5">
        <p className="text-sm font-semibold uppercase tracking-normal text-zama-soft">Private Transfer</p>
        <h2 className="mt-2 text-2xl font-black text-white">Send encrypted tokens</h2>
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
          Amount
          <input
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            inputMode="numeric"
            placeholder="100"
            className="input-field"
          />
        </label>

        <button
          type="button"
          onClick={() => setGenerateReceipt((current) => !current)}
          className="flex items-center justify-between rounded-lg border border-zama-gold/25 bg-white/5 px-4 py-3 text-left"
          aria-pressed={generateReceipt}
        >
          <span>
            <span className="block font-semibold text-white">Generate receipt</span>
            <span className="text-sm text-zinc-400">Authorized parties can reveal the amount later.</span>
          </span>
          <span
            className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
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

        <button type="button" onClick={submitTransfer} disabled={loading} className="primary-button w-full">
          {loading ? <LoadingSpinner className="mr-2" /> : null}
          Submit Transfer
        </button>
      </div>

      <div className="mt-5">
        <Toast message={toast} tone={tone} />
      </div>
    </section>
  );
}
