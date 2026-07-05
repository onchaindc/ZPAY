import { BrowserProvider, Contract, EventLog, JsonRpcProvider, formatEther } from "ethers";
import { VAULT_ABI } from "@/lib/abi";
import { NETWORKS } from "@/lib/constants";
import { isConfiguredContractAddress, truncateAddress } from "@/lib/contract";
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

const SEPOLIA_NETWORK = NETWORKS.sepolia;
const SEPOLIA_EXPLORER = `${SEPOLIA_NETWORK.blockExplorerUrls[0]}/tx/`;

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

  const contractAddress = SEPOLIA_NETWORK.contractAddress;
  if (!isConfiguredContractAddress(contractAddress)) {
    return [];
  }

  const walletProvider = new BrowserProvider(window.ethereum);
  await walletProvider.send("eth_accounts", []);

  const provider = new JsonRpcProvider(SEPOLIA_NETWORK.rpcUrl);
  const contract = new Contract(contractAddress, VAULT_ABI, provider);
  const [shieldedLogs, sentLogs, receivedLogs, unshieldRequestedLogs, unshieldedLogs] = await Promise.all([
    contract.queryFilter(contract.filters.Shielded(userAddress)),
    contract.queryFilter(contract.filters.Transferred(userAddress, null)),
    contract.queryFilter(contract.filters.Transferred(null, userAddress)),
    contract.queryFilter(contract.filters.UnshieldRequested(null, userAddress)),
    contract.queryFilter(contract.filters.Unshielded(userAddress))
  ]);

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
    const sender = event.sender;
    const receiver = event.receiver;
    const counterparty = deriveCounterparty(event, currentUser);
    const status = deriveStatus(event, completedUnshieldUsers);

    return {
      id: `${event.txHash}-${event.logIndex}`,
      type: event.type,
      variant: event.variant,
      title: event.title,
      amountLabel: event.amountLabel,
      sender,
      receiver,
      counterparty: counterparty === "Vault" ? "Vault" : truncateAddress(counterparty),
      timestamp: event.timestamp,
      txHash: event.txHash,
      status,
      blockNumber: event.blockNumber,
      networkName: SEPOLIA_NETWORK.name,
      explorerUrl: `${SEPOLIA_EXPLORER}${event.txHash}`,
      requestId: event.requestId
    };
  });
}

export async function subscribeToVaultEventsForConnectedUser(onChange: () => void) {
  if (typeof window === "undefined" || !window.ethereum) {
    return () => undefined;
  }

  const userAddress = await getConnectedAddress();
  if (!userAddress) {
    return () => undefined;
  }

  const contractAddress = SEPOLIA_NETWORK.contractAddress;
  if (!isConfiguredContractAddress(contractAddress)) {
    return () => undefined;
  }

  const provider = new JsonRpcProvider(SEPOLIA_NETWORK.rpcUrl);
  const contract = new Contract(contractAddress, VAULT_ABI, provider);
  const filters = [
    contract.filters.Shielded(userAddress),
    contract.filters.Transferred(userAddress, null),
    contract.filters.Transferred(null, userAddress),
    contract.filters.UnshieldRequested(null, userAddress),
    contract.filters.Unshielded(userAddress)
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
