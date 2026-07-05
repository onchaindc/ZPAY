import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { VAULT_ABI } from "@/lib/abi";
import {
  DEFAULT_NETWORK,
  NETWORK_STORAGE_KEY,
  NETWORKS,
  NetworkKey,
  toHexChainId
} from "@/lib/constants";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, handler: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
    };
  }
}

export function hasMetaMask() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export function truncateAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getSelectedNetworkKey(): NetworkKey {
  if (typeof window === "undefined") {
    return DEFAULT_NETWORK;
  }

  const stored = window.localStorage.getItem(NETWORK_STORAGE_KEY) as NetworkKey | null;
  return stored && stored in NETWORKS ? stored : DEFAULT_NETWORK;
}

export function setSelectedNetworkKey(networkKey: NetworkKey) {
  window.localStorage.setItem(NETWORK_STORAGE_KEY, networkKey);
  window.dispatchEvent(new CustomEvent("zpay:network", { detail: networkKey }));
}

export function getSelectedNetwork() {
  return NETWORKS[getSelectedNetworkKey()];
}

export function getNetworkKeyForChainId(chainId: bigint | number) {
  const normalizedChainId = typeof chainId === "bigint" ? chainId : BigInt(chainId);
  const matchedEntry = Object.entries(NETWORKS).find(([, value]) => BigInt(value.chainId) === normalizedChainId);

  return (matchedEntry?.[0] as NetworkKey | undefined) ?? null;
}

export function getSelectedContractAddress() {
  return getSelectedNetwork().contractAddress;
}

export function isConfiguredContractAddress(address: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(address) && !/^0x0{40}$/i.test(address);
}

export function assertConfiguredContractAddress() {
  const network = getSelectedNetwork();

  if (!isConfiguredContractAddress(network.contractAddress)) {
    throw new Error(
      `ZPAY contract address is missing for ${network.name}. Set ${
        getSelectedNetworkKey() === "sepolia"
          ? "NEXT_PUBLIC_ZPAY_CONTRACT_SEPOLIA"
          : "NEXT_PUBLIC_ZPAY_CONTRACT_MAINNET"
      } to the deployed contract address.`
    );
  }
}

export async function switchToNetwork(networkKey: NetworkKey) {
  if (!window.ethereum) {
    throw new Error("MetaMask is required.");
  }

  const network = NETWORKS[networkKey];
  const chainId = toHexChainId(network.chainId);

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }]
    });
  } catch (error) {
    const switchError = error as { code?: number };

    if (switchError.code !== 4902) {
      throw error;
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId,
          chainName: network.name,
          nativeCurrency: network.nativeCurrency,
          rpcUrls: [network.rpcUrl],
          blockExplorerUrls: network.blockExplorerUrls
        }
      ]
    });
  }

  setSelectedNetworkKey(networkKey);
}

export async function getBrowserProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask is required.");
  }

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const walletNetworkKey = getNetworkKeyForChainId(network.chainId);

  if (walletNetworkKey) {
    const selectedNetworkKey = getSelectedNetworkKey();

    if (walletNetworkKey !== selectedNetworkKey) {
      setSelectedNetworkKey(walletNetworkKey);
    }
  }

  const selectedNetwork = getSelectedNetwork();

  if (network.chainId !== BigInt(selectedNetwork.chainId)) {
    await switchToNetwork(getSelectedNetworkKey());
  }

  return new BrowserProvider(window.ethereum);
}

export async function connectWallet() {
  const provider = await getBrowserProvider();
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  return {
    provider,
    signer,
    address: await signer.getAddress()
  };
}

export function getVaultContract(signerOrProvider: JsonRpcSigner | BrowserProvider) {
  assertConfiguredContractAddress();
  return new Contract(getSelectedContractAddress(), VAULT_ABI, signerOrProvider);
}

export async function getConnectedNetworkName() {
  if (!window.ethereum) {
    return getSelectedNetwork().name;
  }

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  const matchedKey = getNetworkKeyForChainId(network.chainId);

  if (matchedKey) {
    setSelectedNetworkKey(matchedKey);
  }

  return matchedKey ? NETWORKS[matchedKey].name : getSelectedNetwork().name;
}
