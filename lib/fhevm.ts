type FhevmInstance = {
  encrypt64: (value: bigint | number | string) => Promise<unknown> | unknown;
  decrypt: (ciphertext: unknown) => Promise<unknown>;
};

let instance: FhevmInstance | null = null;

export async function getFhevmInstance() {
  if (instance) return instance;

  const { createInstance } = await import("@zama-fhe/relayer-sdk/web");

  instance = (await createInstance({
    aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
    kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
    inputVerifierContractAddress: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
    verifyingContractAddressDecryption: "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
    verifyingContractAddressInputVerification: "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
    chainId: 11155111,
    gatewayChainId: 55815,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
    relayerUrl: "https://relayer.testnet.zama.org",
  }) as unknown) as FhevmInstance;

  return instance;
}

export function resetInstance() {
  instance = null;
}
