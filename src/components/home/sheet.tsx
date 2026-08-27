"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Bottom sheet.
 *
 * Hand-built rather than pulled from a library — the design system permits
 * Radix only for a select and a future date picker, and adding a component
 * library for this would breach "one visual system only".
 *
 * Keyboard handling: the keyboard OVERLAYS the sheet rather than reflowing the
 * page. iOS shrinks only the visual viewport when it opens, so a fixed sheet
 * keeps its geometry and ends up hidden behind the keyboard. We measure the
 * overlap from visualViewport and lift the sheet by exactly that much as
 * padding on the OUTER container — not a transform on the panel, which would
 * fight the entrance animation.
 *
 * The lift is capped so the fields stay on screen while Cancel and Save are
 * allowed to slide under the keyboard; they're reachable again the moment the
 * keyboard is dismissed, and tapping any non-field part of the sheet does that.
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
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const vv = window.visualViewport;
    // Rather than computing how tall the keyboard is and padding around it,
    // the container simply BECOMES the visual viewport: same height, same
    // offset. Anything aligned to its bottom then sits exactly above the
    // keyboard, whatever iOS does with scroll position or reserved bars.
    // This is what production sheet libraries do, and it self-corrects.
    const trackViewport = () => {
      if (!vv || !wrapRef.current) return;
      wrapRef.current.style.height = `${vv.height}px`;
      wrapRef.current.style.transform = `translateY(${vv.offsetTop}px)`;
      if (panelRef.current) {
        panelRef.current.style.maxHeight = `${Math.max(240, vv.height - 24)}px`;
      }
    };
    trackViewport();
    vv?.addEventListener("resize", trackViewport);
    vv?.addEventListener("scroll", trackViewport);

    return () => {
      document.removeEventListener("keydown", onKey);
      vv?.removeEventListener("resize", trackViewport);
      vv?.removeEventListener("scroll", trackViewport);
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={wrapRef}
      className="fixed inset-x-0 top-0 z-50 flex items-end justify-center"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 animate-[scrim-fade_200ms_ease-out] bg-black/40"
      />
      <div className="relative flex w-full max-w-[430px] justify-center">
        <div
          ref={panelRef}
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
          className="bg-surface-default flex w-full flex-col gap-2 overflow-y-auto rounded-t-[38px] pb-2 animate-[sheet-rise_260ms_cubic-bezier(0.32,0.72,0,1)]"
        >
          <div className="flex h-3 w-full shrink-0 items-end justify-center">
            <span className="bg-border-default h-1 w-12 rounded-full" aria-hidden />
          </div>
          <h2 className="text-screen-title text-text-primary px-4 pt-4">{title}</h2>
          <div className="border-border-default mt-4 border-t" />
          <div
            className="flex flex-col gap-7 px-4 pt-6"
            style={{ paddingBottom: "var(--spacing-5)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
