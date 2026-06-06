export const ZAMAPAY_CONTRACT_SEPOLIA =
  process.env.NEXT_PUBLIC_ZAMAPAY_CONTRACT_SEPOLIA ??
  process.env.NEXT_PUBLIC_ZAMAPAY_CONTRACT ??
  "0x3cE4bB69e2Aa72A336251064101F6a42779b132C";

export const ZAMAPAY_CONTRACT_MAINNET =
  process.env.NEXT_PUBLIC_ZAMAPAY_CONTRACT_MAINNET ??
  "0x0000000000000000000000000000000000000000";

export const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrl: "https://rpc.sepolia.org",
    kmsContractAddress: "0x208De73316E44722e16f6dDFF40881A3e4F86104",
    aclContractAddress: "0xFee8407e2f5e3Ee68ad77cAE98c434e637f516EC",
    gatewayUrl: "https://gateway.sepolia.zama.ai/",
    contractAddress: ZAMAPAY_CONTRACT_SEPOLIA,
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
    kmsContractAddress: "0x9D6AdBa497Cef4232d97e9a05F4AEB0b96a26Cc3",
    aclContractAddress: "0xa2073A7558F8A432f645eaA5D0e54E3D8839c1b4",
    gatewayUrl: "https://gateway.main.zama.ai/",
    contractAddress: ZAMAPAY_CONTRACT_MAINNET,
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
export const NETWORK_STORAGE_KEY = "zamapay:network";

export function toHexChainId(chainId: number) {
  return `0x${chainId.toString(16)}`;
}
