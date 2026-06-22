// ABI mirrors the ZamaPay contract actually deployed on Sepolia
// (0x3cE4bB69e2Aa72A336251064101F6a42779b132C). Every selector below was
// verified against the on-chain bytecode — see contracts/ZamaPay.sol.
//
// NOTE: there is NO deposit() and NO withdraw() on-chain. Balance only enters
// the system via the owner-only mint(). The "vault" ABI that previously lived
// here called functions that do not exist, which is why every tx reverted.

export const ZAMAPAY_ABI = [
  // ---- events ----
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "from", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "to", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "sender", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "receiver", "type": "address" },
      { "indexed": false, "internalType": "bytes32", "name": "receiptId", "type": "bytes32" },
      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "name": "TransferWithReceipt",
    "type": "event"
  },
  // ---- functions ----
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint64", "name": "amount", "type": "uint64" }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "externalEuint64", "name": "encryptedAmount", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
    ],
    "name": "transfer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "externalEuint64", "name": "encryptedAmount", "type": "bytes32" },
      { "internalType": "bytes", "name": "inputProof", "type": "bytes" }
    ],
    "name": "transferWithReceipt",
    "outputs": [{ "internalType": "bytes32", "name": "receiptId", "type": "bytes32" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "euint64", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes32", "name": "receiptId", "type": "bytes32" }],
    "name": "getReceipt",
    "outputs": [
      { "internalType": "address", "name": "sender", "type": "address" },
      { "internalType": "address", "name": "receiver", "type": "address" },
      { "internalType": "euint64", "name": "encryptedAmount", "type": "bytes32" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getSentReceipts",
    "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getReceivedReceipts",
    "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
