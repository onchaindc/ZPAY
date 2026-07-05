import { formatEther, parseEther } from "ethers";

export function getFriendlyErrorMessage(
  error: unknown,
  fallback: "network" | "contract" | "balance" | "generic" = "generic"
) {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (
    message.includes("eth_getlogs") ||
    message.includes("queryfilter") ||
    message.includes("block range") ||
    message.includes("response size exceeded")
  ) {
    return "";
  }

  if (
    message.includes("user rejected") ||
    message.includes("rejected the request") ||
    message.includes("denied")
  ) {
    return "Request cancelled.";
  }

  if (
    message.includes("missing revert data") ||
    message.includes("call_exception") ||
    message.includes("execution reverted") ||
    message.includes("revert")
  ) {
    return "Transaction failed. Check your balance.";
  }

  if (
    message.includes("chain") ||
    message.includes("wrong network") ||
    message.includes("unsupported network") ||
    message.includes("switch network")
  ) {
    return "Chain request failed.";
  }

  if (
    message.includes("rpc") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("fetch") ||
    message.includes("bad gateway") ||
    message.includes("gateway timeout")
  ) {
    return "Unable to reach the selected RPC.";
  }

  if (fallback === "contract") {
    return "Chain request failed.";
  }

  if (fallback === "network") {
    return "Unable to reach the selected RPC.";
  }

  if (fallback === "balance") {
    return "Unable to fetch encrypted balance.";
  }

  return "Something went wrong. Please try again.";
}

export function parseEthAmount(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  try {
    const wei = parseEther(trimmed);
    return wei > BigInt(0) ? wei : null;
  } catch {
    return null;
  }
}

export function formatEthAmount(value: bigint | string) {
  const normalized = typeof value === "string" ? BigInt(value) : value;
  const formatted = formatEther(normalized);

  if (!formatted.includes(".")) {
    return formatted;
  }

  return formatted.replace(/(\.\d*?[1-9])0+$|\.0+$/, "$1");
}

// ZPAY's _balances is an euint64 of raw tokens: no decimals. Vault methods
// operate in these whole units, so the UI must too. Parsing as ETH (18 decimals)
// would inflate amounts by 1e20 and silently overflow uint64.
export function parseTokenAmount(value: string): bigint | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const asBigInt = BigInt(Math.floor(Number(trimmed)));
    return asBigInt > BigInt(0) ? asBigInt : null;
  } catch {
    return null;
  }
}

export function formatTokenAmount(value: bigint | string) {
  const normalized = typeof value === "string" ? BigInt(value) : value;
  return normalized.toString();
}

export function formatRelativeTime(unixTimestamp: number) {
  const diffSeconds = Math.max(0, Math.floor(Date.now() / 1000) - unixTimestamp);

  if (diffSeconds < 60) {
    return `${diffSeconds || 1} sec ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) {
    return `${diffWeeks} wk ago`;
  }

  return new Date(unixTimestamp * 1000).toLocaleDateString();
}
