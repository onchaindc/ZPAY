import { createInstance } from "fhevmjs";

type FhevmInstance = {
  encrypt64: (value: bigint | number | string) => Promise<unknown> | unknown;
  decrypt: (ciphertext: unknown) => Promise<unknown>;
};

let instance: FhevmInstance | null = null;

export async function getFhevmInstance() {
  if (instance) return instance;

  instance = (await createInstance({
    kmsContractAddress: "0x208De73316E44722e16f6dDFF40881A3e4F86104",
    aclContractAddress: "0xFee8407e2f5e3Ee68ad77cAE98c434e637f516EC",
    network: window.ethereum,
    gatewayUrl: "https://gateway.sepolia.zama.ai/",
  }) as unknown) as FhevmInstance;

  return instance;
}

export function resetInstance() {
  instance = null;
}
