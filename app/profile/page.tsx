"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ConnectButton from "@/components/ConnectButton";
import NetworkSelector from "@/components/NetworkSelector";
import ThemeControl from "@/components/ThemeControl";
import { getConnectedNetworkName, hasMetaMask, truncateAddress } from "@/lib/contract";

const shortcuts = [
  {
    href: "/receipts",
    title: "Receipts",
    description: "Open confirmed vault receipts and completed withdrawals.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M7 3h10a2 2 0 0 1 2 2v16l-3-1.8-2 1.2-2-1.2-2 1.2-2-1.2L5 21V5a2 2 0 0 1 2-2Zm2 6h6V7H9v2Zm0 4h6v-2H9v2Zm0 4h4v-2H9v2Z" />
      </svg>
    )
  },
  {
    href: "/faucet",
    title: "Faucet",
    description: "Shield ETH into the vault and keep payment value encrypted.",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M12 3 5 6.2v5.6c0 4.1 2.9 7.7 7 8.7 4.1-1 7-4.6 7-8.7V6.2L12 3Zm0 4.2 3.8 1.7v3c0 2.5-1.5 4.7-3.8 5.7-2.3-1-3.8-3.2-3.8-5.7v-3L12 7.2Z" />
      </svg>
    )
  }
];

export default function ProfilePage() {
  const [address, setAddress] = useState("");
  const [networkName, setNetworkName] = useState("Selected network");

  useEffect(() => {
    let active = true;

    async function syncWalletState() {
      try {
        const nextNetwork = await getConnectedNetworkName();
        if (active) {
          setNetworkName(nextNetwork);
        }
      } catch {
        if (active) {
          setNetworkName("Selected network");
        }
      }

      if (!hasMetaMask()) {
        if (active) {
          setAddress("");
        }
        return;
      }

      try {
        const accounts = (await window.ethereum?.request({ method: "eth_accounts" })) as string[] | undefined;
        if (active) {
          setAddress(accounts?.[0] ?? "");
        }
      } catch {
        if (active) {
          setAddress("");
        }
      }
    }

    void syncWalletState();

    const handleAccountsChanged = (...args: unknown[]) => {
      const accounts = args[0] as string[] | undefined;
      setAddress(accounts?.[0] ?? "");
    };

    const handleChainChanged = () => {
      void syncWalletState();
    };

    window.ethereum?.on?.("accountsChanged", handleAccountsChanged);
    window.ethereum?.on?.("chainChanged", handleChainChanged);
    window.addEventListener("zpay:network", handleChainChanged as EventListener);

    return () => {
      active = false;
      window.ethereum?.removeListener?.("accountsChanged", handleAccountsChanged);
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
      window.removeEventListener("zpay:network", handleChainChanged as EventListener);
    };
  }, []);

  return (
    <main className="mx-auto w-full max-w-[640px] overflow-x-hidden px-4 pb-24 pt-4 md:max-w-6xl md:px-8 md:pb-8 md:pt-5">
      <div className="mx-auto mb-5 max-w-2xl text-center md:mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft md:text-sm">Profile</p>
        <h1 className="mt-2 text-[1.85rem] font-black leading-tight text-white md:mt-2 md:text-[2.9rem]">Your wallet hub.</h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-zinc-400 md:mt-3 md:text-base">
          Manage wallet access, receipts, theme preferences, and the confidential payment tools that support your vault.
        </p>
      </div>

      <div className="grid gap-4">
        <section className="glass rounded-[20px] p-4 md:p-6">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft">Wallet Info</p>
              <h2 className="mt-2 text-xl font-black text-white">Connected wallet</h2>
            </div>
            <span className="inline-flex min-h-[44px] items-center rounded-full border border-white/10 bg-white/5 px-3 text-xs font-bold uppercase tracking-[0.16em] text-zinc-400">
              {networkName}
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">Wallet</p>
              <p className="mt-2 text-base font-black text-white">
                {address ? truncateAddress(address) : "Not connected"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-white">
                Network
                <NetworkSelector />
              </label>
              <div className="grid gap-2 text-sm font-semibold text-white">
                Wallet access
                <ConnectButton />
              </div>
            </div>
          </div>
        </section>

        <section className="glass rounded-[20px] p-4 md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft">Shortcuts</p>
          <h2 className="mt-2 text-xl font-black text-white">Profile actions</h2>

          <div className="mt-5 grid gap-3">
            {shortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[64px] items-center gap-4 rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 transition duration-200 hover:border-zama-gold/30 hover:bg-zama-gold/10"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-zama-gold/20 bg-zama-gold/10 text-zama-soft">
                  {item.icon}
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-black text-white">{item.title}</span>
                  <span className="mt-1 block text-sm leading-6 text-zinc-400">{item.description}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="glass rounded-[20px] p-4 md:p-6">
          <div className="flex min-h-[44px] flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft">Theme Toggle</p>
              <h2 className="mt-2 text-xl font-black text-white">Display mode</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Switch between dark and light presentation while keeping the same wallet flow.
              </p>
            </div>
            <ThemeControl variant="inline" />
          </div>
        </section>

        <section className="glass rounded-[20px] p-4 md:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-zama-soft">About ZPAY</p>
          <h2 className="mt-2 text-xl font-black text-white">Confidential payments on Ethereum</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            ZPAY is the confidential payment layer for Ethereum powered by Zama FHE. Shield ETH into your vault,
            send confidential payments, and unshield only when you choose to reveal value locally.
          </p>
        </section>
      </div>
    </main>
  );
}
