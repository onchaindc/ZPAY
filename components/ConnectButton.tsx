"use client";

import { useEffect, useState } from "react";
import { connectWallet, hasMetaMask, truncateAddress } from "@/lib/contract";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getFriendlyErrorMessage } from "@/lib/ui";

type ConnectButtonProps = {
  compact?: boolean;
  onConnected?: (address: string) => void;
};

export default function ConnectButton({ compact = false, onConnected }: ConnectButtonProps) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasMetaMask()) {
      return;
    }

    window.ethereum
      ?.request({ method: "eth_accounts" })
      .then((accounts) => {
        const [account] = accounts as string[];
        if (account) {
          setAddress(account);
          onConnected?.(account);
        }
      })
      .catch(() => null);

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[];
      const nextAddress = accounts?.[0] ?? "";
      setAddress(nextAddress);
      if (nextAddress) {
        onConnected?.(nextAddress);
      }
    };

    window.ethereum?.on?.("accountsChanged", handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
    };
  }, [onConnected]);

  async function handleConnect() {
    setError("");

    if (!hasMetaMask()) {
      setError("MetaMask is required.");
      return;
    }

    setLoading(true);
    try {
      const wallet = await connectWallet();
      setAddress(wallet.address);
      onConnected?.(wallet.address);
    } catch (connectError) {
      setError(getFriendlyErrorMessage(connectError, "network"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col items-stretch gap-2 sm:items-end">
      <button
        type="button"
        onClick={handleConnect}
        disabled={loading}
        className={`primary-button ${compact ? "wallet-button" : "px-5"}`}
      >
        {loading ? <LoadingSpinner className="mr-2" /> : null}
        <span className="truncate">{address ? truncateAddress(address) : "Connect Wallet"}</span>
      </button>
      {error ? <p className="status-text max-w-52 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
