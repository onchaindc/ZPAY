import { BrowserProvider, Contract, EventLog, JsonRpcProvider, formatEther } from "ethers";
import { VAULT_ABI } from "@/lib/abi";
import { isConfiguredContractAddress, getSelectedNetwork, truncateAddress } from "@/lib/contract";
import { publicDecryptHandle } from "@/lib/fhevm";

export const VAULT_ACTIVITY_EVENT = "zpay:activity";

export type VaultEventType = "Shielded" | "Transferred" | "UnshieldRequested" | "Unshielded";
export type VaultEventVariant = "shielded" | "sent" | "received" | "unshield-requested" | "unshielded";

export type VaultEventItem = {
  id: string;
  type: VaultEventType;
  variant: VaultEventVariant;
  title: string;
  amountLabel: string;
  sender: string;
  receiver: string;
  counterparty: string;
  timestamp: number;
  txHash: string;
  status: string;
  blockNumber: number;
  networkName: string;
  explorerUrl: string;
  requestId?: string;
};

type RawVaultEvent = {
  type: VaultEventType;
  variant: VaultEventVariant;
  title: string;
  txHash: string;
  logIndex: number;
  blockNumber: number;
  timestamp: number;
  sender: string;
  receiver: string;
  amountLabel: string;
  status: string;
  requestId?: string;
};

const DEPLOYMENT_BLOCK_CACHE = new Map<string, number>();
const LOG_CHUNK_SIZE = 2_000;
const RECENT_LOG_WINDOW = 250_000;
const SEPOLIA_LOG_RPC_FALLBACKS = [
  "https://eth-sepolia.g.alchemy.com/v2/Rb4zCUqWcgclddPU7dqz4DThjdQmkMC8",
  "https://sepolia.gateway.tenderly.co"
];

function isEventLog(log: unknown): log is EventLog {
  return typeof log === "object" && log !== null && "args" in log;
}

function normalizeClearValue(value: unknown) {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return BigInt(value);
    } catch {
      return null;
    }
  }

  return null;
}

async function getConnectedAddress() {
  const accounts = (await window.ethereum?.request?.({ method: "eth_accounts" })) as string[] | undefined;
  return accounts?.[0] ?? "";
}

export function notifyVaultActivityChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(VAULT_ACTIVITY_EVENT));
}

function isAddressMatch(candidate: string, expected: string) {
  return candidate.toLowerCase() === expected.toLowerCase();
}

function getRpcCandidates(rpcUrl: string) {
  const candidates = [rpcUrl];

  for (const fallbackUrl of SEPOLIA_LOG_RPC_FALLBACKS) {
    if (!candidates.includes(fallbackUrl)) {
      candidates.push(fallbackUrl);
    }
  }

  return candidates;
}

function shouldTryNextRpc(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    message.includes("eth_getlogs") ||
    message.includes("request timeout") ||
    message.includes("archive requests require") ||
    message.includes("free tier plan") ||
    message.includes("unable to load vault activity from the rpc") ||
    message.includes("could not coalesce error") ||
    message.includes("jsonrpcprovider failed to detect network") ||
    message.includes("timeout")
  );
}

async function findContractDeploymentBlock(provider: JsonRpcProvider, contractAddress: string) {
  const cacheKey = `${provider._getConnection().url}:${contractAddress.toLowerCase()}`;
  const cached = DEPLOYMENT_BLOCK_CACHE.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const latestBlock = await provider.getBlockNumber();
  const latestCode = await provider.getCode(contractAddress, latestBlock);
  if (!latestCode || latestCode === "0x") {
    DEPLOYMENT_BLOCK_CACHE.set(cacheKey, latestBlock);
    return latestBlock;
  }

  let low = 0;
  let high = latestBlock;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const code = await provider.getCode(contractAddress, mid);

    if (code && code !== "0x") {
      high = mid;
    } else {
      low = mid + 1;
    }
  }

  DEPLOYMENT_BLOCK_CACHE.set(cacheKey, low);
  return low;
}

async function queryLogsInChunks(
  contract: Contract,
  filter: Parameters<Contract["queryFilter"]>[0],
  fromBlock: number,
  toBlock: number
) {
  const logs: EventLog[] = [];

  for (let start = fromBlock; start <= toBlock; start += LOG_CHUNK_SIZE) {
    const end = Math.min(start + LOG_CHUNK_SIZE - 1, toBlock);
    const chunkLogs = (await contract.queryFilter(filter, start, end)).filter(isEventLog);
    logs.push(...chunkLogs);
  }

  return logs;
}

async function loadVaultEventsFromRpc(rpcUrl: string, userAddress: string, selectedNetwork: ReturnType<typeof getSelectedNetwork>) {
  const contractAddress = selectedNetwork.contractAddress;
  const provider = new JsonRpcProvider(rpcUrl);
  const contract = new Contract(contractAddress, VAULT_ABI, provider);
  const latestBlock = await provider.getBlockNumber();
  const deploymentBlock = await findContractDeploymentBlock(provider, contractAddress);
  const fromBlock = Math.max(deploymentBlock, latestBlock - RECENT_LOG_WINDOW);
  const [allShieldedLogs, allTransferredLogs, allUnshieldRequestedLogs, allUnshieldedLogs] = await Promise.all([
    queryLogsInChunks(contract, contract.filters.Shielded(), fromBlock, latestBlock),
    queryLogsInChunks(contract, contract.filters.Transferred(), fromBlock, latestBlock),
    queryLogsInChunks(contract, contract.filters.UnshieldRequested(), fromBlock, latestBlock),
    queryLogsInChunks(contract, contract.filters.Unshielded(), fromBlock, latestBlock)
  ]);

  const shieldedLogs = allShieldedLogs.filter((log) => isAddressMatch(String(log.args.user), userAddress));
  const sentLogs = allTransferredLogs.filter((log) => isAddressMatch(String(log.args.from), userAddress));
  const receivedLogs = allTransferredLogs.filter((log) => isAddressMatch(String(log.args.to), userAddress));
  const unshieldRequestedLogs = allUnshieldRequestedLogs.filter((log) => isAddressMatch(String(log.args.user), userAddress));
  const unshieldedLogs = allUnshieldedLogs.filter((log) => isAddressMatch(String(log.args.user), userAddress));

  const timestampByBlock = new Map<number, number>();
  const allLogs = [...shieldedLogs, ...sentLogs, ...receivedLogs, ...unshieldRequestedLogs, ...unshieldedLogs];

  await Promise.all(
    Array.from(new Set(allLogs.map((log) => log.blockNumber))).map(async (blockNumber) => {
      const block = await provider.getBlock(blockNumber);
      timestampByBlock.set(blockNumber, block?.timestamp ?? 0);
    })
  );

  const requestAmountByUser = new Map<string, string[]>();
  const rawEvents: RawVaultEvent[] = [];

  for (const log of shieldedLogs.filter(isEventLog)) {
    const amount = typeof log.args.ethAmount === "bigint" ? formatEther(log.args.ethAmount) : "0";

    rawEvents.push({
      type: "Shielded",
      variant: "shielded",
      title: "Funds Shielded",
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      timestamp: timestampByBlock.get(log.blockNumber) ?? 0,
      sender: "Vault",
      receiver: String(log.args.user),
      amountLabel: `${amount} ETH`,
      status: "Confirmed"
    });
  }

  for (const log of unshieldRequestedLogs.filter(isEventLog)) {
    const requestId = String(log.args.requestId);
    const amountHandle = String(log.args.amountHandle);
    let amountLabel = "Encrypted";

    try {
      const clearValue = normalizeClearValue(await publicDecryptHandle(amountHandle));
      if (clearValue !== null) {
        amountLabel = `${clearValue.toString()} ETH`;
      }
    } catch {
      amountLabel = "Encrypted";
    }

    const userKey = String(log.args.user).toLowerCase();
    const userRequests = requestAmountByUser.get(userKey) ?? [];
    userRequests.push(amountLabel);
    requestAmountByUser.set(userKey, userRequests);

    rawEvents.push({
      type: "UnshieldRequested",
      variant: "unshield-requested",
      title: "Withdrawal Requested",
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      timestamp: timestampByBlock.get(log.blockNumber) ?? 0,
      sender: String(log.args.user),
      receiver: "Vault",
      amountLabel,
      status: "Pending",
      requestId
    });
  }

  for (const log of unshieldedLogs.filter(isEventLog)) {
    const userKey = String(log.args.user).toLowerCase();
    const userRequests = requestAmountByUser.get(userKey) ?? [];
    const matchedAmount = userRequests.shift() ?? "Encrypted";
    requestAmountByUser.set(userKey, userRequests);

    rawEvents.push({
      type: "Unshielded",
      variant: "unshielded",
      title: "Withdrawal Completed",
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      timestamp: timestampByBlock.get(log.blockNumber) ?? 0,
      sender: "Vault",
      receiver: String(log.args.user),
      amountLabel: matchedAmount,
      status: "Completed"
    });
  }

  for (const log of sentLogs.filter(isEventLog)) {
    rawEvents.push({
      type: "Transferred",
      variant: "sent",
      title: "Payment Sent",
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      timestamp: timestampByBlock.get(log.blockNumber) ?? 0,
      sender: String(log.args.from),
      receiver: String(log.args.to),
      amountLabel: "Encrypted",
      status: "Confirmed"
    });
  }

  for (const log of receivedLogs.filter(isEventLog)) {
    rawEvents.push({
      type: "Transferred",
      variant: "received",
      title: "Payment Received",
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      timestamp: timestampByBlock.get(log.blockNumber) ?? 0,
      sender: String(log.args.from),
      receiver: String(log.args.to),
      amountLabel: "Encrypted",
      status: "Confirmed"
    });
  }

  rawEvents.sort((a, b) => {
    if (b.blockNumber !== a.blockNumber) {
      return b.blockNumber - a.blockNumber;
    }

    return b.logIndex - a.logIndex;
  });

  const completedUnshieldUsers = new Set(
    rawEvents.filter((event) => event.variant === "unshielded").map((event) => event.receiver.toLowerCase())
  );

  const currentUser = userAddress.toLowerCase();

  return rawEvents.map((event) => {
    const counterparty = deriveCounterparty(event, currentUser);
    const status = deriveStatus(event, completedUnshieldUsers);

    return {
      id: `${event.txHash}-${event.logIndex}`,
      type: event.type,
      variant: event.variant,
      title: event.title,
      amountLabel: event.amountLabel,
      sender: event.sender,
      receiver: event.receiver,
      counterparty: counterparty === "Vault" ? "Vault" : truncateAddress(counterparty),
      timestamp: event.timestamp,
      txHash: event.txHash,
      status,
      blockNumber: event.blockNumber,
      networkName: selectedNetwork.name,
      explorerUrl: `${selectedNetwork.blockExplorerUrls[0]}/tx/${event.txHash}`,
      requestId: event.requestId
    };
  });
}

function deriveStatus(event: RawVaultEvent, completedUnshieldUsers: Set<string>) {
  if (event.variant === "unshield-requested" && completedUnshieldUsers.has(event.sender.toLowerCase())) {
    return "Completed";
  }

  return event.status;
}

function deriveCounterparty(event: RawVaultEvent, currentUser: string) {
  if (event.variant === "shielded" || event.variant === "unshield-requested" || event.variant === "unshielded") {
    return "Vault";
  }

  return event.sender.toLowerCase() === currentUser ? event.receiver : event.sender;
}

export async function loadVaultEventsForConnectedUser(): Promise<VaultEventItem[]> {
  if (typeof window === "undefined" || !window.ethereum) {
    return [];
  }

  const userAddress = await getConnectedAddress();

  if (!userAddress) {
    return [];
  }

  const selectedNetwork = getSelectedNetwork();
  const contractAddress = selectedNetwork.contractAddress;
  if (!isConfiguredContractAddress(contractAddress)) {
    return [];
  }

  const walletProvider = new BrowserProvider(window.ethereum);
  await walletProvider.send("eth_accounts", []);

  let lastError: unknown;

  for (const rpcUrl of getRpcCandidates(selectedNetwork.rpcUrl)) {
    try {
      return await loadVaultEventsFromRpc(rpcUrl, userAddress, selectedNetwork);
    } catch (error) {
      lastError = error;
      if (!shouldTryNextRpc(error)) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Unable to load vault activity from the RPC.");
}

export async function subscribeToVaultEventsForConnectedUser(onChange: () => void) {
  if (typeof window === "undefined" || !window.ethereum) {
    return () => undefined;
  }

  const userAddress = await getConnectedAddress();
  if (!userAddress) {
    return () => undefined;
  }

  const selectedNetwork = getSelectedNetwork();
  const contractAddress = selectedNetwork.contractAddress;
  if (!isConfiguredContractAddress(contractAddress)) {
    return () => undefined;
  }

  const provider = new JsonRpcProvider(getRpcCandidates(selectedNetwork.rpcUrl)[0]);
  const contract = new Contract(contractAddress, VAULT_ABI, provider);
  const filters = [
    contract.filters.Shielded(),
    contract.filters.Transferred(),
    contract.filters.UnshieldRequested(),
    contract.filters.Unshielded()
  ];

  for (const filter of filters) {
    contract.on(filter, onChange);
  }

  return () => {
    for (const filter of filters) {
      contract.off(filter, onChange);
    }
    void provider.destroy();
  };
}
