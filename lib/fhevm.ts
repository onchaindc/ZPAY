import { createInstance } from "fhevmjs";
import { DEFAULT_NETWORK, NETWORKS, NetworkKey } from "@/lib/constants";
import { getSelectedNetworkKey } from "@/lib/contract";

type FhevmInstance = {
  encrypt64: (value: bigint | number | string) => Promise<unknown> | unknown;
  decrypt: (ciphertext: unknown) => Promise<unknown>;
};

let instance: FhevmInstance | null = null;
let instanceNetwork: NetworkKey | null = null;

export async function getFhevmInstance(networkKey: NetworkKey = DEFAULT_NETWORK) {
  if (instance && instanceNetwork === networkKey) {
    return instance;
  }

  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is required.");
  }

  const network = NETWORKS[networkKey];
  instance = await (createInstance as unknown as (config: Record<string, unknown>) => Promise<FhevmInstance>)({
    kmsContractAddress: network.kmsContractAddress,
    aclContractAddress: network.aclContractAddress,
    network: window.ethereum,
    gatewayUrl: network.gatewayUrl
  });
  instanceNetwork = networkKey;

  return instance;
}

export function resetFhevmInstance() {
  instance = null;
  instanceNetwork = null;
}

export async function encrypt64(amount: string) {
  const fhevm = await getFhevmInstance(getSelectedNetworkKey());
  const encrypted = await fhevm.encrypt64(BigInt(amount));

  if (
    encrypted &&
    typeof encrypted === "object" &&
    "handles" in encrypted &&
    "inputProof" in encrypted
  ) {
    const payload = encrypted as { handles: unknown[]; inputProof: unknown };
    return {
      encryptedAmount: payload.handles[0],
      inputProof: payload.inputProof
    };
  }

  return {
    encryptedAmount: encrypted,
    inputProof: "0x"
  };
}

export async function decryptValue(ciphertext: unknown) {
  const fhevm = await getFhevmInstance(getSelectedNetworkKey());
  const value = await fhevm.decrypt(ciphertext);
  return value?.toString?.() ?? String(value);
}
