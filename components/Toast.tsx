"use client";

type ToastProps = {
  message: string;
  tone?: "idle" | "success" | "error";
};

export default function Toast({ message, tone = "idle" }: ToastProps) {
  if (!message) {
    return null;
  }

  const toneClass =
    tone === "success"
      ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-100"
      : tone === "error"
        ? "border-rose-400/40 bg-rose-400/10 text-rose-100"
        : "border-zama-gold/30 bg-zama-gold/10 text-zama-soft";

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${toneClass}`} role="status">
      {message}
    </div>
  );
}
