import { createInstance } from "fhevmjs";

type FhevmInstance = {
  encrypt64: (value: bigint | number | string) => Promise<unknown> | unknown;
  decrypt: (ciphertext: unknown) => Promise<unknown>;
};

let cachedInstance: FhevmInstance | null = null;

export async function getFhevmInstance() {
  if (cachedInstance) return cachedInstance;

  const instance = await createInstance({
    kmsContractAddress: "0x208De73316E44722e16f6dDFF40881A3e4F86104",
    aclContractAddress: "0xfee8407e2f5e3ee68ad77cae98c434e637f516ec",
    network: window.ethereum,
    gatewayUrl: "https://gateway.sepolia.zama.ai/",
  });

  cachedInstance = instance as unknown as FhevmInstance;

  return cachedInstance;
}

export function resetInstance() {
  cachedInstance = null;
}
