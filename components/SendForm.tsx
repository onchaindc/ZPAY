"use client";

import { useState } from "react";
import { isAddress, type Log } from "ethers";
import { connectWallet, getSelectedContractAddress, getZamapayContract, truncateAddress } from "@/lib/contract";
import { encryptAmount64 } from "@/lib/fhevm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { formatTokenAmount, getFriendlyErrorMessage, parseTokenAmount } from "@/lib/ui";

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
  const [recipientTouched, setRecipientTouched] = useState(false);
  const [amountTouched, setAmountTouched] = useState(false);
  const [successSummary, setSuccessSummary] = useState<{
    recipient: string;
    amount: string;
    receipt: boolean;
  } | null>(null);

  const trimmedRecipient = recipient.trim();
  const recipientValid = !trimmedRecipient || isAddress(trimmedRecipient);
  const parsedAmount = parseTokenAmount(amount);
  const amountValid = !amount.trim() || parsedAmount !== null;
  const formValid = Boolean(trimmedRecipient) && Boolean(parsedAmount) && recipientValid;
  const recipientError = recipientTouched && !trimmedRecipient
    ? "Enter the recipient wallet address."
    : recipientTouched && !recipientValid
      ? "Enter a valid wallet address."
      : "";
  const amountError = amountTouched && !amount.trim()
    ? "Enter the amount to encrypt."
    : amountTouched && !amountValid
      ? "Use a whole number of tokens greater than zero."
      : "";

  const primaryActionLabel = loading ? "Processing confidential payment" : "Review confidential payment";

  function updateRecipient(value: string) {
    setRecipient(value);
    if (!recipientTouched) {
      setRecipientTouched(true);
    }
    if (successSummary) {
      setSuccessSummary(null);
    }
  }

  function updateAmount(value: string) {
    setAmount(value);
    if (!amountTouched) {
      setAmountTouched(true);
    }
    if (successSummary) {
      setSuccessSummary(null);
    }
  }

  async function submitTransfer() {
    setRecipientTouched(true);
    setAmountTouched(true);
    setToast("");
    setTone("idle");
    setSuccessSummary(null);

    if (!isAddress(trimmedRecipient)) {
      setToast("Enter a valid recipient address.");
      setTone("error");
      return;
    }

    if (!parsedAmount) {
      setToast("Enter a whole number of tokens greater than zero.");
      setTone("error");
      return;
    }

    setLoading(true);
    setToast("Encrypting payment amount locally...");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
      const contractAddress = getSelectedContractAddress();
      const encryptedAmount = await encryptAmount64(contractAddress, wallet.address, parsedAmount.toString());
      const displayAmount = formatTokenAmount(parsedAmount);
      setToast(generateReceipt ? `Sending ${displayAmount} confidential tokens with receipt...` : `Sending ${displayAmount} confidential tokens...`);

      const tx = generateReceipt
        ? await contract.transferWithReceipt(trimmedRecipient, encryptedAmount.encryptedAmount, encryptedAmount.inputProof)
        : await contract.transfer(trimmedRecipient, encryptedAmount.encryptedAmount, encryptedAmount.inputProof);

      setToast(`Transaction submitted: ${truncateAddress(tx.hash)}`);
      const receipt = await tx.wait();
      // The receiptId is emitted in the TransferWithReceipt event (return values
      // of non-view functions are not accessible off-chain).
      const receiptEvent = receipt?.logs
        ? (contract.interface.parseLog(receipt.logs.find((log: Log) => {
            try {
              return contract.interface.parseLog(log)?.name === "TransferWithReceipt";
            } catch {
              return false;
            }
          }) ?? receipt.logs[0]) ?? null)
        : null;
      const receiptId = (receiptEvent?.args?.receiptId as string | undefined) ?? null;
      setToast(
        generateReceipt && receiptId
          ? `Confidential payment confirmed. Receipt: ${truncateAddress(receiptId)}`
          : "Confidential payment confirmed."
      );
      setTone("success");
      setSuccessSummary({
        recipient: trimmedRecipient,
        amount: displayAmount,
        receipt: generateReceipt
      });
      setRecipient("");
      setAmount("");
      setRecipientTouched(false);
      setAmountTouched(false);
    } catch (error) {
      setToast(getFriendlyErrorMessage(error, "contract"));
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={`send-surface ${compact ? "p-4 sm:p-6" : "p-4 sm:p-6 lg:p-8"}`}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:gap-8">
        <div className="min-w-0">
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft sm:text-sm">Powered by Zama FHE</p>
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Send confidential tokens</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
              Confirm the recipient, encrypt the payment amount, and choose whether to generate a selective receipt.
            </p>
          </div>

          <div className="grid gap-5">
            <div className="send-input-group">
              <div className="send-group-header">
                <div>
                  <p className="text-sm font-bold text-white">Payment details</p>
                  <p className="mt-1 text-sm text-zinc-400">Recipient and amount are prepared for confidential settlement.</p>
                </div>
                <span className="send-step-pill">Step 1</span>
              </div>

              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-white">
                  Recipient wallet
                  <input
                    value={recipient}
                    onChange={(event) => updateRecipient(event.target.value)}
                    onBlur={() => setRecipientTouched(true)}
                    placeholder="0x..."
                    className={`input-field ${recipientError ? "input-field-error" : ""}`}
                    aria-invalid={recipientError ? true : false}
                  />
                  <span className={`text-xs ${recipientError ? "text-rose-300" : "text-zinc-500"}`}>
                    {recipientError || "Paste the destination address exactly as provided."}
                  </span>
                </label>

                <label className="grid gap-2 text-sm font-semibold text-white">
                  Amount
                  <input
                    value={amount}
                    onChange={(event) => updateAmount(event.target.value)}
                    onBlur={() => setAmountTouched(true)}
                    inputMode="numeric"
                    placeholder="25"
                    className={`input-field ${amountError ? "input-field-error" : ""}`}
                    aria-invalid={amountError ? true : false}
                  />
                  <span className={`text-xs ${amountError ? "text-rose-300" : "text-zinc-500"}`}>
                    {amountError || "Whole confidential token units only."}
                  </span>
                </label>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setGenerateReceipt((current) => !current)}
              className="send-receipt-toggle"
              aria-pressed={generateReceipt}
            >
              <span className="min-w-0">
                <span className="block text-sm font-bold uppercase tracking-[0.18em] text-zama-soft">Selective proof</span>
                <span className="mt-2 block text-base font-black text-white">Generate selective receipt</span>
                <span className="mt-1 block text-sm leading-6 text-zinc-400">
                  Preserve a confidential proof trail for authorized parties after settlement.
                </span>
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
          </div>
        </div>

        <div className="send-summary-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft">Review</p>
              <h3 className="mt-2 text-xl font-black text-white">Payment review</h3>
            </div>
            <span className={`send-status-pill ${loading ? "send-status-pill-live" : tone === "success" ? "send-status-pill-success" : ""}`}>
              {loading ? "Encrypting" : tone === "success" ? "Confirmed" : "Ready"}
            </span>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="send-summary-row">
              <span className="text-zinc-400">Recipient</span>
              <span className="status-text text-right font-semibold text-white">
                {trimmedRecipient ? truncateAddress(trimmedRecipient) : "Not entered"}
              </span>
            </div>
            <div className="send-summary-row">
              <span className="text-zinc-400">Amount</span>
              <span className="font-semibold text-white">
                {parsedAmount ? `${formatTokenAmount(parsedAmount)} tokens` : "Not entered"}
              </span>
            </div>
            <div className="send-summary-row">
              <span className="text-zinc-400">Receipt</span>
              <span className="font-semibold text-white">{generateReceipt ? "Included" : "Skipped"}</span>
            </div>
          </div>

          {loading ? (
            <div className="send-progress-card">
              <div className="flex items-center gap-3">
                <LoadingSpinner />
                <div>
                  <p className="font-bold text-white">Preparing confidential payment</p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Encrypting with Zama FHE, then waiting for wallet confirmation and Ethereum settlement.
                  </p>
                </div>
              </div>
            </div>
          ) : successSummary ? (
            <div className="send-success-card">
              <div className="flex items-start gap-3">
                <span className="send-success-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24">
                    <path d="m9.2 16.6-3.8-3.8 1.4-1.4 2.4 2.4 8-8 1.4 1.4-9.4 9.4Z" />
                  </svg>
                </span>
                <div>
                  <p className="font-black text-white">Confidential payment confirmed</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">
                    {successSummary.amount} tokens sent to {truncateAddress(successSummary.recipient)}.
                    {successSummary.receipt ? " Selective receipt enabled." : " No receipt generated."}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="send-progress-card">
              <p className="font-bold text-white">Final review</p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Check the recipient, amount, and disclosure setting before opening your wallet confirmation.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={submitTransfer}
            disabled={loading || !formValid}
            className="primary-button send-submit-button"
          >
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            {primaryActionLabel}
          </button>

          <div className="mt-4">
            <Toast message={toast} tone={tone} />
          </div>
        </div>
      </div>
    </section>
  );
}
