export const ZAMAPAY_CONTRACT =
  process.env.NEXT_PUBLIC_ZAMAPAY_CONTRACT ??
  "0x0000000000000000000000000000000000000000";

export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_CHAIN_ID_HEX = "0xaa36a7";

export const SEPOLIA = {
  chainId: SEPOLIA_CHAIN_ID,
  chainIdHex: SEPOLIA_CHAIN_ID_HEX,
  chainName: "Sepolia",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18
  },
  rpcUrls: ["https://rpc.sepolia.org"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"]
};

export const FHEVM_GATEWAY_URL = "https://gateway.sepolia.zama.ai";
