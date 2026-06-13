import { formatEther, parseEther } from "ethers";

export function getFriendlyErrorMessage(
  error: unknown,
  fallback: "network" | "contract" | "generic" = "generic"
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
    message.includes("rpc") ||
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("fetch") ||
    message.includes("bad gateway")
  ) {
    return "Network error. Please try again.";
  }

  if (fallback === "contract") {
    return "Transaction failed. Check your balance.";
  }

  if (fallback === "network") {
    return "Network error. Please try again.";
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
