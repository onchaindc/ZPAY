import { hexlify } from "ethers";
import type { JsonRpcSigner } from "ethers";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/web";

const ZAMAPAY_SEPOLIA_ADDRESS = "0x3cE4bB69e2Aa72A336251064101F6a42779b132C";

let instance: FhevmInstance | null = null;

export async function getFhevmInstance() {
  if (instance) return instance;

  const { initSDK, createInstance } = await import("@zama-fhe/relayer-sdk/web");

  await initSDK();

  instance = await createInstance({
    aclContractAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
    kmsContractAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
    inputVerifierContractAddress: "0xbc91f3daD1A5F19F8390c400196e58073B6a0BC4",
    verifyingContractAddressDecryption: "0xb6E160B1ff80D67Bfe90A85eE06Ce0A2613607D1",
    verifyingContractAddressInputVerification: "0x7048C39f048125eDa9d678AEbaDfB22F7900a29F",
    chainId: 11155111,
    gatewayChainId: 55815,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
    relayerUrl: "https://relayer.testnet.zama.org",
  });

  return instance;
}

export async function encryptAmount64(contractAddress: string, userAddress: string, amount: string) {
  const fhevm = await getFhevmInstance();
  const input = fhevm.createEncryptedInput(contractAddress, userAddress);

  input.add64(BigInt(amount));

  const encryptedInput = await input.encrypt();

  return {
    encryptedAmount: encryptedInput.handles[0],
    inputProof: encryptedInput.inputProof,
  };
}

export async function userDecryptHandle(
  contractAddress: string,
  userAddress: string,
  encryptedHandle: unknown,
  signer: JsonRpcSigner
) {
  const fhevm = await getFhevmInstance();
  const handle = normalizeHandle(encryptedHandle);
  const { publicKey, privateKey } = fhevm.generateKeypair();
  const startTimestamp = Math.floor(Date.now() / 1000).toString();
  const durationDays = 7;
  const eip712 = fhevm.createEIP712(publicKey, [contractAddress], Number(startTimestamp), durationDays);
  const signTypedDataTypes = {
    UserDecryptRequestVerification: [...eip712.types.UserDecryptRequestVerification],
  };
  const signature = await signer.signTypedData(
    eip712.domain,
    signTypedDataTypes,
    eip712.message
  );
  const decrypted = await fhevm.userDecrypt(
    [{ handle, contractAddress }],
    privateKey,
    publicKey,
    signature,
    [contractAddress],
    userAddress,
    Number(startTimestamp),
    durationDays
  );

  return decrypted[handle] ?? decrypted[handle.toLowerCase() as `0x${string}`];
}

export async function userDecryptBalanceHandle(
  userAddress: string,
  encryptedHandle: unknown,
  signer: JsonRpcSigner
) {
  const fhevm = await getFhevmInstance();
  const handle = normalizeHandle(encryptedHandle);
  const { publicKey, privateKey } = fhevm.generateKeypair();
  const startTimestamp = Math.floor(Date.now() / 1000);
  const durationDays = 7;
  const eip712 = fhevm.createEIP712(publicKey, [ZAMAPAY_SEPOLIA_ADDRESS], startTimestamp, durationDays);
  const signature = await signer.signTypedData(
    eip712.domain,
    { UserDecryptRequestVerification: [...eip712.types.UserDecryptRequestVerification] },
    eip712.message
  );
  const decrypted = await fhevm.userDecrypt(
    [{ handle, contractAddress: ZAMAPAY_SEPOLIA_ADDRESS }],
    privateKey,
    publicKey,
    signature,
    [ZAMAPAY_SEPOLIA_ADDRESS],
    userAddress,
    startTimestamp,
    durationDays
  );

  return decrypted[handle] ?? decrypted[handle.toLowerCase() as `0x${string}`];
}

export function resetInstance() {
  instance = null;
}

function normalizeHandle(handle: unknown) {
  if (typeof handle === "string") {
    return handle as `0x${string}`;
  }

  if (handle instanceof Uint8Array) {
    return hexlify(handle) as `0x${string}`;
  }

  throw new Error("Invalid encrypted handle.");
}
