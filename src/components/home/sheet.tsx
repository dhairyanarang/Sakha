"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Bottom sheet.
 *
 * Hand-built rather than pulled from a library — the design system permits
 * Radix only for a select and a future date picker, and adding a component
 * library for this would breach "one visual system only".
 *
 * The scrim is real runtime opacity over whatever is actually rendered behind
 * it, never a pre-computed solid — that distinction is explicit in the Design
 * MD. Dismissal is Escape, the scrim, or Cancel: never a swipe, because no
 * action here may depend on a gesture beyond a tap.
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
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    // Stop the page behind from scrolling while the sheet is up.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("input, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "bg-surface-default relative flex w-full max-w-[430px] flex-col gap-2",
          "rounded-t-[38px] pb-2",
        )}
      >
        <div className="flex h-3 w-full items-end justify-center">
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
    </div>
  );
}
