"use client";

import { useEffect, useState } from "react";
import { DEFAULT_NETWORK, NETWORKS, NetworkKey } from "@/lib/constants";
import { getSelectedNetworkKey, switchToNetwork } from "@/lib/contract";
import { resetFhevmInstance } from "@/lib/fhevm";

export default function NetworkSelector() {
  const [networkKey, setNetworkKey] = useState<NetworkKey>(DEFAULT_NETWORK);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setNetworkKey(getSelectedNetworkKey());
  }, []);

  async function handleNetworkChange(nextNetwork: NetworkKey) {
    setNetworkKey(nextNetwork);
    setLoading(true);

    try {
      await switchToNetwork(nextNetwork);
      resetFhevmInstance();
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
        className="h-11 rounded-lg border border-zama-gold/25 bg-white/8 px-3 text-sm font-bold text-white outline-none transition hover:border-zama-gold/55 focus:border-zama-gold"
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
