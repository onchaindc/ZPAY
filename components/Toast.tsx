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
      ? "surface-toast-success"
      : tone === "error"
        ? "surface-toast-error"
        : "surface-toast-idle";

  return (
    <p className={`surface-toast status-text ${toneClass}`} role="status">
      <span className="surface-toast-indicator" aria-hidden="true" />
      <span className="min-w-0">{message}</span>
    </p>
  );
}
