import { BrowserProvider, Contract, EventLog, formatEther } from "ethers";
import { ZAMAPAY_ABI } from "@/lib/abi";
import { getSelectedContractAddress, getSelectedNetwork, isConfiguredContractAddress, truncateAddress } from "@/lib/contract";
import { publicDecryptHandle } from "@/lib/fhevm";

export type VaultEventType = "Shielded" | "Transferred" | "UnshieldRequested" | "Unshielded";

export type VaultEventItem = {
  id: string;
  type: VaultEventType;
  amountLabel: string;
  sender: string;
  receiver: string;
  counterparty: string;
  timestamp: number;
  txHash: string;
  status: string;
  blockNumber: number;
  requestId?: string;
};

type RawVaultEvent = {
  type: VaultEventType;
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

async function getConnectedAddress(provider: BrowserProvider) {
  const accounts = (await window.ethereum?.request?.({ method: "eth_accounts" })) as string[] | undefined;
  return accounts?.[0] ?? "";
}

export async function loadVaultEventsForConnectedUser(): Promise<VaultEventItem[]> {
  if (typeof window === "undefined" || !window.ethereum) {
    return [];
  }

  const provider = new BrowserProvider(window.ethereum);
  const userAddress = await getConnectedAddress(provider);

  if (!userAddress) {
    return [];
  }

  const network = await provider.getNetwork();
  if (network.chainId !== BigInt(getSelectedNetwork().chainId)) {
    return [];
  }

  const contractAddress = getSelectedContractAddress();
  if (!isConfiguredContractAddress(contractAddress)) {
    return [];
  }

  const contract = new Contract(contractAddress, ZAMAPAY_ABI, provider);
  const [shieldedLogs, sentLogs, receivedLogs, unshieldRequestedLogs, unshieldedLogs] = await Promise.all([
    contract.queryFilter(contract.filters.Shielded(userAddress)),
    contract.queryFilter(contract.filters.Transferred(userAddress, null)),
    contract.queryFilter(contract.filters.Transferred(null, userAddress)),
    contract.queryFilter(contract.filters.UnshieldRequested(null, userAddress)),
    contract.queryFilter(contract.filters.Unshielded(userAddress)),
  ]);

  const timestampByBlock = new Map<number, number>();
  const allLogs = [...shieldedLogs, ...sentLogs, ...receivedLogs, ...unshieldRequestedLogs, ...unshieldedLogs];

  await Promise.all(
    Array.from(new Set(allLogs.map((log) => log.blockNumber))).map(async (blockNumber) => {
      const block = await provider.getBlock(blockNumber);
      timestampByBlock.set(blockNumber, block?.timestamp ?? 0);
    }),
  );

  const requestAmountByUser = new Map<string, string[]>();
  const rawEvents: RawVaultEvent[] = [];

  for (const log of shieldedLogs.filter(isEventLog)) {
    const amount = typeof log.args.ethAmount === "bigint" ? formatEther(log.args.ethAmount) : "0";

    rawEvents.push({
      type: "Shielded",
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      timestamp: timestampByBlock.get(log.blockNumber) ?? 0,
      sender: "Vault",
      receiver: String(log.args.user),
      counterparty: "Vault",
      amountLabel: `${amount} ETH`,
      status: "Confirmed",
    } as RawVaultEvent & { counterparty: string });
  }

  for (const log of unshieldRequestedLogs.filter(isEventLog)) {
    const requestId = String(log.args.requestId);
    const amountHandle = String(log.args.amountHandle);
    let amountLabel = "Decrypting";

    try {
      const clearValue = normalizeClearValue(await publicDecryptHandle(amountHandle));
      if (clearValue !== null) {
        amountLabel = `${clearValue.toString()} ETH`;
      }
    } catch {
      amountLabel = "Decrypting";
    }

    const userKey = String(log.args.user).toLowerCase();
    const userRequests = requestAmountByUser.get(userKey) ?? [];
    userRequests.push(amountLabel);
    requestAmountByUser.set(userKey, userRequests);

    rawEvents.push({
      type: "UnshieldRequested",
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      timestamp: timestampByBlock.get(log.blockNumber) ?? 0,
      sender: String(log.args.user),
      receiver: "Vault",
      amountLabel,
      status: "Pending",
      requestId,
    });
  }

  for (const log of unshieldedLogs.filter(isEventLog)) {
    const userKey = String(log.args.user).toLowerCase();
    const userRequests = requestAmountByUser.get(userKey) ?? [];
    const matchedAmount = userRequests.shift() ?? "Completed";
    requestAmountByUser.set(userKey, userRequests);

    rawEvents.push({
      type: "Unshielded",
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      timestamp: timestampByBlock.get(log.blockNumber) ?? 0,
      sender: "Vault",
      receiver: String(log.args.user),
      amountLabel: matchedAmount,
      status: "Completed",
    });
  }

  for (const log of sentLogs.filter(isEventLog)) {
    rawEvents.push({
      type: "Transferred",
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      timestamp: timestampByBlock.get(log.blockNumber) ?? 0,
      sender: String(log.args.from),
      receiver: String(log.args.to),
      amountLabel: "Encrypted",
      status: "Confirmed",
    });
  }

  for (const log of receivedLogs.filter(isEventLog)) {
    rawEvents.push({
      type: "Transferred",
      txHash: log.transactionHash,
      logIndex: log.index,
      blockNumber: log.blockNumber,
      timestamp: timestampByBlock.get(log.blockNumber) ?? 0,
      sender: String(log.args.from),
      receiver: String(log.args.to),
      amountLabel: "Encrypted",
      status: "Confirmed",
    });
  }

  rawEvents.sort((a, b) => {
    if (b.blockNumber !== a.blockNumber) {
      return b.blockNumber - a.blockNumber;
    }

    return b.logIndex - a.logIndex;
  });

  const completedUnshieldUsers = new Set(
    rawEvents.filter((event) => event.type === "Unshielded").map((event) => event.receiver.toLowerCase()),
  );

  return rawEvents.map((event) => {
    const currentUser = userAddress.toLowerCase();
    const sender = event.sender;
    const receiver = event.receiver;
    const counterparty =
      event.type === "Shielded" || event.type === "UnshieldRequested" || event.type === "Unshielded"
        ? "Vault"
        : sender.toLowerCase() === currentUser
          ? truncateAddress(receiver)
          : truncateAddress(sender);

    const status =
      event.type === "UnshieldRequested" && completedUnshieldUsers.has(sender.toLowerCase()) ? "Completed" : event.status;

    return {
      id: `${event.txHash}-${event.logIndex}`,
      type: event.type,
      amountLabel: event.amountLabel,
      sender,
      receiver,
      counterparty,
      timestamp: event.timestamp,
      txHash: event.txHash,
      status,
      blockNumber: event.blockNumber,
      requestId: event.requestId,
    };
  });
}
