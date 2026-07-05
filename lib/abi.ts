// ABI generated from ZamapayVault deployed on Sepolia:
// 0xF32bcD889C5E63584dba4b36D40Dfcfc3f448693
export const VAULT_ABI = [
  {
    inputs: [
      { internalType: "bytes32", name: "handle", type: "bytes32" },
      { internalType: "address", name: "sender", type: "address" }
    ],
    name: "SenderNotAllowedToUseHandle",
    type: "error"
  },
  {
    inputs: [],
    name: "ZamaProtocolUnsupported",
    type: "error"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "uint256", name: "ethAmount", type: "uint256" }
    ],
    name: "Shielded",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "from", type: "address" },
      { indexed: true, internalType: "address", name: "to", type: "address" }
    ],
    name: "Transferred",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "uint256", name: "requestId", type: "uint256" },
      { indexed: true, internalType: "address", name: "user", type: "address" },
      { indexed: false, internalType: "bytes32", name: "amountHandle", type: "bytes32" }
    ],
    name: "UnshieldRequested",
    type: "event"
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, internalType: "address", name: "user", type: "address" }],
    name: "Unshielded",
    type: "event"
  },
  {
    inputs: [{ internalType: "address", name: "user", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "euint64", name: "", type: "bytes32" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [],
    name: "confidentialProtocolId",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { internalType: "uint256", name: "requestId", type: "uint256" },
      { internalType: "bytes", name: "abiEncodedCleartexts", type: "bytes" },
      { internalType: "bytes", name: "decryptionProof", type: "bytes" }
    ],
    name: "finalizeUnshield",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "externalEuint64", name: "encryptedAmount", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" }
    ],
    name: "shield",
    outputs: [],
    stateMutability: "payable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "address", name: "to", type: "address" },
      { internalType: "externalEuint64", name: "encryptedAmount", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" }
    ],
    name: "transfer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "externalEuint64", name: "encryptedAmount", type: "bytes32" },
      { internalType: "bytes", name: "inputProof", type: "bytes" }
    ],
    name: "unshield",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  }
] as const;
