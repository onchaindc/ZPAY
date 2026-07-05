export const ZPAY_CONTRACT_SEPOLIA =
  process.env.NEXT_PUBLIC_ZPAY_CONTRACT_SEPOLIA ??
  process.env.NEXT_PUBLIC_ZPAY_CONTRACT ??
  "0xF32bcD889C5E63584dba4b36D40Dfcfc3f448693";

export const ZPAY_CONTRACT_MAINNET =
  process.env.NEXT_PUBLIC_ZPAY_CONTRACT_MAINNET ??
  "0x0000000000000000000000000000000000000000";

export const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    kmsContractAddress: "0x208De73316E44722e16f6dDFF40881A3e4F86104",
    aclContractAddress: "0xfee8407e2f5e3ee68ad77cae98c434e637f516ec",
    gatewayUrl: "https://gateway.sepolia.zama.ai/",
    contractAddress: ZPAY_CONTRACT_SEPOLIA,
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io"]
  },
  mainnet: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrl: "https://eth.llamarpc.com",
    kmsContractAddress: "0x208De73316E44722e16f6dDFF40881A3e4F86104",
    aclContractAddress: "0xfee8407e2f5e3ee68ad77cae98c434e637f516ec",
    gatewayUrl: "https://gateway.main.zama.ai/",
    contractAddress: ZPAY_CONTRACT_MAINNET,
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://etherscan.io"]
  }
} as const;

export type NetworkKey = keyof typeof NETWORKS;

export const DEFAULT_NETWORK: NetworkKey = "sepolia";
export const NETWORK_STORAGE_KEY = "zpay:network";

export function toHexChainId(chainId: number) {
  return `0x${chainId.toString(16)}`;
}
