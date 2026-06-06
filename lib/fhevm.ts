import { createInstance } from "fhevmjs";
import { FHEVM_GATEWAY_URL, SEPOLIA } from "@/lib/constants";

type FhevmInstance = {
  encrypt64: (value: bigint | number | string) => Promise<unknown> | unknown;
  decrypt: (ciphertext: unknown) => Promise<unknown>;
};

let instancePromise: Promise<FhevmInstance> | null = null;

export async function getFhevmInstance() {
  if (!instancePromise) {
    instancePromise = Promise.resolve(
      (createInstance as unknown as (config: Record<string, unknown>) => FhevmInstance)({
        chainId: SEPOLIA.chainId,
        gatewayUrl: FHEVM_GATEWAY_URL,
        networkUrl: SEPOLIA.rpcUrls[0]
      })
    );
  }

  return instancePromise;
}

export async function encrypt64(amount: string) {
  const fhevm = await getFhevmInstance();
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
  const fhevm = await getFhevmInstance();
  const value = await fhevm.decrypt(ciphertext);
  return value?.toString?.() ?? String(value);
}
