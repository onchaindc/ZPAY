import { hexlify } from "ethers";
import type { JsonRpcSigner } from "ethers";
import type { FhevmInstance } from "@zama-fhe/relayer-sdk/web";

let instance: FhevmInstance | null = null;

export async function getFhevmInstance() {
  if (instance) return instance;

  const { initSDK, createInstance, SepoliaConfig } = await import("@zama-fhe/relayer-sdk/web");

  await initSDK();

  instance = await createInstance({
    ...SepoliaConfig,
    network: "https://ethereum-sepolia-rpc.publicnode.com",
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
  contractAddress: string,
  userAddress: string,
  encryptedHandle: unknown,
  signer: JsonRpcSigner
) {
  const fhevm = await getFhevmInstance();
  const handle = normalizeHandle(encryptedHandle);
  const { publicKey, privateKey } = fhevm.generateKeypair();
  const startTimestamp = Math.floor(Date.now() / 1000);
  const durationDays = 7;
  const eip712 = fhevm.createEIP712(publicKey, [contractAddress], startTimestamp, durationDays);
  const signature = await signer.signTypedData(
    eip712.domain,
    { UserDecryptRequestVerification: [...eip712.types.UserDecryptRequestVerification] },
    eip712.message
  );
  const decrypted = await fhevm.userDecrypt(
    [{ handle, contractAddress }],
    privateKey,
    publicKey,
    signature,
    [contractAddress],
    userAddress,
    startTimestamp,
    durationDays
  );

  return decrypted[handle] ?? decrypted[handle.toLowerCase() as `0x${string}`];
}

export async function publicDecryptHandle(encryptedHandle: unknown) {
  const fhevm = await getFhevmInstance();
  const handle = normalizeHandle(encryptedHandle);
  const decrypted = await fhevm.publicDecrypt([handle]);

  return decrypted.clearValues[handle] ?? decrypted.clearValues[handle.toLowerCase() as `0x${string}`];
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
