import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { VAULT_ABI } from "@/lib/abi";
import {
  DEFAULT_NETWORK,
  NETWORK_STORAGE_KEY,
  NETWORKS,
  NetworkKey,
  toHexChainId
} from "@/lib/constants";

export type InjectedEthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  providers?: InjectedEthereumProvider[];
  selectedAddress?: string;
  isConnected?: () => boolean;
};

declare global {
  interface Window {
    ethereum?: InjectedEthereumProvider;
  }
}

export function getInjectedProvider() {
  if (typeof window === "undefined" || !window.ethereum) {
    return null;
  }

  const rootProvider = window.ethereum;
  const nestedProviders = Array.isArray(rootProvider.providers) ? rootProvider.providers.filter(Boolean) : [];

  if (!nestedProviders.length) {
    return rootProvider;
  }

  return (
    nestedProviders.find((provider) => typeof provider.selectedAddress === "string" && provider.selectedAddress.length > 0) ??
    nestedProviders.find((provider) => {
      try {
        return typeof provider.isConnected === "function" && provider.isConnected();
      } catch {
        return false;
      }
    }) ??
    rootProvider
  );
}

export function hasInjectedWallet() {
  return Boolean(getInjectedProvider());
}

export function getWalletUnavailableMessage() {
  return "No compatible wallet detected. Open any injected Ethereum wallet to continue.";
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
  const walletProvider = getInjectedProvider();

  if (!walletProvider) {
    throw new Error(getWalletUnavailableMessage());
  }

  const network = NETWORKS[networkKey];
  const chainId = toHexChainId(network.chainId);

  try {
    await walletProvider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId }]
    });
  } catch (error) {
    const switchError = error as { code?: number };

    if (switchError.code !== 4902) {
      throw error;
    }

    await walletProvider.request({
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
  const walletProvider = getInjectedProvider();

  if (!walletProvider) {
    throw new Error(getWalletUnavailableMessage());
  }

  const provider = new BrowserProvider(walletProvider);
  const network = await provider.getNetwork();
  const selectedNetworkKey = getSelectedNetworkKey();
  const selectedNetwork = getSelectedNetwork();

  if (network.chainId !== BigInt(selectedNetwork.chainId)) {
    await switchToNetwork(selectedNetworkKey);
  }

  return new BrowserProvider(walletProvider);
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
  const walletProvider = getInjectedProvider();

  if (!walletProvider) {
    return getSelectedNetwork().name;
  }

  const provider = new BrowserProvider(walletProvider);
  const network = await provider.getNetwork();
  const matchedKey = getNetworkKeyForChainId(network.chainId);

  return matchedKey ? NETWORKS[matchedKey].name : getSelectedNetwork().name;
}
