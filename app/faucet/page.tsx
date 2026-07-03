"use client";

import { useState } from "react";
import { parseEther } from "ethers";
import { connectWallet, getSelectedContractAddress, getZamapayContract, truncateAddress } from "@/lib/contract";
import { encryptAmount64 } from "@/lib/fhevm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { getFriendlyErrorMessage, parseTokenAmount } from "@/lib/ui";

export default function FaucetPage() {
  const [amount, setAmount] = useState("100");
  const [ethAmount, setEthAmount] = useState("0.001");
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
      setToast("Enter a whole number of tokens greater than zero.");
      setTone("error");
      return;
    }

    let ethValue: bigint;
    try {
      ethValue = parseEther(ethAmount || "0");
    } catch {
      setToast("Enter a valid ETH amount to lock.");
      setTone("error");
      return;
    }

    if (ethValue <= BigInt(0)) {
      setToast("Enter an ETH amount greater than zero.");
      setTone("error");
      return;
    }

    setLoading(true);
    setToast("Encrypting shield amount locally...");

    try {
      const contract = getZamapayContract(wallet.signer);
      const contractAddress = getSelectedContractAddress();
      const encryptedAmount = await encryptAmount64(contractAddress, wallet.address, parsedAmount.toString());
      const tx = await contract.shield(encryptedAmount.encryptedAmount, encryptedAmount.inputProof, {
        value: ethValue
      });

      setToast(`Shield transaction submitted: ${truncateAddress(tx.hash)}`);
      await tx.wait();
      setToast(`Shielded ${amount} confidential tokens to ${truncateAddress(wallet.address)}.`);
      setTone("success");
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
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Shield Funds</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">Create a confidential balance</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-400 md:text-base">
          Shield funds into ZamaPay&apos;s confidential payment layer. Balances are encrypted with
          Zama FHE and can be used for confidential payments on Ethereum.
        </p>
      </div>

      <section className="glass mx-auto w-full rounded-xl p-4 md:p-6">
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-semibold text-white">
            Confidential token amount
            <input
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="numeric"
              placeholder="100"
              className="input-field"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-white">
            ETH to lock
            <input
              value={ethAmount}
              onChange={(event) => setEthAmount(event.target.value)}
              inputMode="decimal"
              placeholder="0.001"
              className="input-field"
            />
          </label>

          <button type="button" onClick={shieldBalance} disabled={loading} className="primary-button w-full">
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            Shield Funds
          </button>
        </div>

        <div className="mt-4">
          <Toast message={toast} tone={tone} />
        </div>
      </section>
    </main>
  );
}
