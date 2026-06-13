"use client";

import { useEffect, useState } from "react";
import { connectWallet, getConnectedNetworkName, getZamapayContract } from "@/lib/contract";
import { userDecryptBalanceHandle } from "@/lib/fhevm";
import LoadingSpinner from "@/components/LoadingSpinner";
import Toast from "@/components/Toast";
import { formatEthAmount, getFriendlyErrorMessage, parseEthAmount } from "@/lib/ui";

const MAX_UINT64 = BigInt("18446744073709551615");
const DECRYPTION_UPPER_BOUND = BigInt("1000000000000");

export default function BalanceCard() {
  const [balance, setBalance] = useState("");
  const [networkName, setNetworkName] = useState("Connected network");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [toast, setToast] = useState("");
  const [tone, setTone] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    let active = true;

    async function syncNetworkName() {
      try {
        const nextName = await getConnectedNetworkName();

        if (active) {
          setNetworkName(nextName);
        }
      } catch {
        if (active) {
          setNetworkName("Connected network");
        }
      }
    }

    void syncNetworkName();

    const handleChainChanged = () => {
      void syncNetworkName();
    };

    window.ethereum?.on?.("chainChanged", handleChainChanged);

    return () => {
      active = false;
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  async function revealBalance() {
    setLoading(true);
    setToast("");
    setTone("idle");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
      const userAddress = await wallet.signer.getAddress();
      const handle = await contract.balanceOf(userAddress);
      const value = await userDecryptBalanceHandle(userAddress, handle, wallet.signer);
      const decryptedBalance = value?.toString?.() ?? String(value);

      if (BigInt(decryptedBalance) === MAX_UINT64 || BigInt(decryptedBalance) > DECRYPTION_UPPER_BOUND) {
        setBalance("Decryption pending...");
        return;
      }

      setBalance(formatEthAmount(decryptedBalance));
      setToast("Balance revealed locally.");
      setTone("success");
    } catch (error) {
      setToast(getFriendlyErrorMessage(error, "network"));
      setTone("error");
    } finally {
      setLoading(false);
    }
  }

  async function withdrawBalance() {
    const parsedAmount = parseEthAmount(withdrawAmount);

    if (!parsedAmount) {
      setToast("Enter a valid ETH amount to withdraw.");
      setTone("error");
      return;
    }

    setWithdrawing(true);
    setToast("");
    setTone("idle");

    try {
      const wallet = await connectWallet();
      const contract = getZamapayContract(wallet.signer);
      const tx = await contract.withdraw(parsedAmount);
      await tx.wait();
      setToast("Withdrawal confirmed.");
      setTone("success");
      setWithdrawAmount("");
    } catch (error) {
      setToast(getFriendlyErrorMessage(error, "contract"));
      setTone("error");
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <section className="glass rounded-xl p-4 sm:p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-zama-soft sm:text-sm">
              Your Balance
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <span className="status-text text-3xl font-black text-white sm:text-4xl lg:text-5xl">
                {balance || "\u2022\u2022\u2022\u2022"}
              </span>
              <span className="pb-1 text-sm font-semibold text-zinc-400">ETH</span>
            </div>
            <p className="mt-3 text-sm text-zinc-400">{networkName}</p>
          </div>
          <button
            type="button"
            onClick={revealBalance}
            disabled={loading}
            className="secondary-button sm:w-auto"
          >
            {loading ? <LoadingSpinner className="mr-2" /> : null}
            Reveal
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm font-semibold text-white">
            Withdraw ETH
            <input
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              inputMode="decimal"
              placeholder="0.10"
              className="input-field"
            />
          </label>
          <button
            type="button"
            onClick={withdrawBalance}
            disabled={withdrawing}
            className="primary-button sm:w-auto"
          >
            {withdrawing ? <LoadingSpinner className="mr-2" /> : null}
            Withdraw
          </button>
        </div>
      </div>

      <div className="mt-4">
        <Toast message={toast} tone={tone} />
      </div>
    </section>
  );
}
