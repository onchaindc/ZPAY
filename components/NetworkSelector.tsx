"use client";

import { BrowserProvider } from "ethers";
import { useEffect, useState } from "react";
import { DEFAULT_NETWORK, NETWORKS, NetworkKey } from "@/lib/constants";
import { getInjectedProvider, getNetworkKeyForChainId, getSelectedNetworkKey, setSelectedNetworkKey, switchToNetwork } from "@/lib/contract";
import { resetInstance } from "@/lib/fhevm";

export default function NetworkSelector() {
  const [networkKey, setNetworkKey] = useState<NetworkKey>(DEFAULT_NETWORK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function syncNetworkFromWallet() {
      const walletProvider = getInjectedProvider();

      if (!walletProvider) {
        if (mounted) {
          setNetworkKey(getSelectedNetworkKey());
        }
        return;
      }

      const selectedKey = getSelectedNetworkKey();
      if (mounted) {
        setNetworkKey(selectedKey);
      }

      const provider = new BrowserProvider(walletProvider);
      const network = await provider.getNetwork();
      const walletKey = getNetworkKeyForChainId(network.chainId);

      if (walletKey === selectedKey) {
        setSelectedNetworkKey(selectedKey);
      }
    }

    void syncNetworkFromWallet();

    const handleChainChanged = () => {
      void syncNetworkFromWallet();
      resetInstance();
    };

    const walletProvider = getInjectedProvider();
    walletProvider?.on?.("chainChanged", handleChainChanged);

    return () => {
      mounted = false;
      walletProvider?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  async function handleNetworkChange(nextNetwork: NetworkKey) {
    setNetworkKey(nextNetwork);
    setLoading(true);

    try {
      await switchToNetwork(nextNetwork);
      resetInstance();
    } finally {
      setLoading(false);
    }
  }

  return (
    <label>
      <span className="sr-only">Network</span>
      <select
        value={networkKey}
        disabled={loading}
        onChange={(event) => handleNetworkChange(event.target.value as NetworkKey)}
        className="network-select"
      >
        {Object.entries(NETWORKS).map(([key, network]) => (
          <option key={key} value={key} className="bg-midnight text-white">
            {network.name}
          </option>
        ))}
      </select>
    </label>
  );
}
