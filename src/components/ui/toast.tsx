"use client";

import { useEffect } from "react";
import { Check } from "lucide-react";

/**
 * A brief confirmation that something was saved.
 *
 * Announced politely rather than assertively — this is reassurance, not an
 * alert, and it must never interrupt what she's doing. It also dismisses on
 * its own without a countdown or any way to "miss" it.
 */
export function Toast({
  message,
  open,
  onDone,
  duration = 2600,
}: {
  message: string;
  open: boolean;
  onDone: () => void;
  duration?: number;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [open, onDone, duration]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4"
      style={{ bottom: "var(--spacing-7)" }}
    >
      <div className="bg-feedback-success-surface border-feedback-success flex items-center gap-2 rounded-full border px-4 py-3 shadow-[0_4px_16px_rgb(0_0_0/0.16)]">
        <Check size={18} className="text-feedback-success-text shrink-0" aria-hidden />
        <span className="text-body-medium text-feedback-success-text">{message}</span>
      </div>
    </div>
  );
}
