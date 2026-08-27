"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

/**
 * Bottom sheet.
 *
 * Hand-built rather than pulled from a library — the design system permits
 * Radix only for a select and a future date picker, and adding a component
 * library for this would breach "one visual system only".
 *
 * Portalled to <body> so it positions against the viewport rather than Home's
 * full-height flex column; rendered inline, the iOS keyboard resizing the
 * viewport shunted the page behind it upwards.
 *
 * The rise is a CSS animation, not React state, so there's no mount/animate
 * bookkeeping — and reduced-motion collapses it globally.
 *
 * The scrim is real runtime opacity over whatever is actually behind it, never
 * a pre-computed solid. Dismissal is Escape, the scrim, or Cancel — never a
 * swipe, because no action may depend on a gesture beyond a tap.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  // No portal target during server rendering; `open` is always false there.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 animate-[scrim-fade_200ms_ease-out]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        // Tapping any non-field part of the sheet dismisses the keyboard,
        // which is otherwise awkward to put away on iOS.
        onPointerDown={(e) => {
          const target = e.target as HTMLElement;
          if (!target.closest("input, textarea, select, button")) {
            (document.activeElement as HTMLElement | null)?.blur();
          }
        }}
        className="bg-surface-default relative flex max-h-[92dvh] w-full max-w-[430px] flex-col gap-2 overflow-y-auto rounded-t-[38px] pb-2 animate-[sheet-rise_260ms_cubic-bezier(0.32,0.72,0,1)]"
      >
        <div className="flex h-3 w-full shrink-0 items-end justify-center">
          <span className="bg-border-default h-1 w-12 rounded-full" aria-hidden />
        </div>
        <h2 className="text-screen-title text-text-primary px-4 pt-4">{title}</h2>
        <div className="border-border-default mt-4 border-t" />
        <div
          className="flex flex-col gap-7 px-4 pt-6"
          style={{ paddingBottom: "calc(var(--spacing-5) + env(safe-area-inset-bottom))" }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
