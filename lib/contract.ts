import { BrowserProvider, Contract, JsonRpcSigner } from "ethers";
import { ZAMAPAY_ABI } from "@/lib/abi";
import { SEPOLIA, SEPOLIA_CHAIN_ID_HEX, ZAMAPAY_CONTRACT } from "@/lib/constants";

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

export async function switchToSepolia() {
  if (!window.ethereum) {
    throw new Error("MetaMask is required.");
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }]
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
          chainId: SEPOLIA.chainIdHex,
          chainName: SEPOLIA.chainName,
          nativeCurrency: SEPOLIA.nativeCurrency,
          rpcUrls: SEPOLIA.rpcUrls,
          blockExplorerUrls: SEPOLIA.blockExplorerUrls
        }
      ]
    });
  }
}

export async function getBrowserProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask is required.");
  }

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();

  if (network.chainId !== BigInt(SEPOLIA.chainId)) {
    await switchToSepolia();
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

export function getZamapayContract(signerOrProvider: JsonRpcSigner | BrowserProvider) {
  return new Contract(ZAMAPAY_CONTRACT, ZAMAPAY_ABI, signerOrProvider);
}
