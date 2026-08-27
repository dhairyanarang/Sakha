"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Bottom sheet.
 *
 * Hand-built rather than pulled from a library — the design system permits
 * Radix only for a select and a future date picker, and adding a component
 * library for this would breach "one visual system only".
 *
 * Keyboard: the container BECOMES the visual viewport — same height, same
 * offset — so anything aligned to its bottom sits exactly above the keyboard
 * whatever iOS does with scroll position. No offset arithmetic to get wrong.
 *
 * Dismissal: tap the scrim, press Escape, hit Cancel, or drag the sheet down
 * by its handle. The drag is an ADDITION, never the only way out — no action
 * here may depend on a gesture, which rules out swipe-only dismissal.
 *
 * Leaving is animated as deliberately as arriving; a sheet that vanishes
 * instantly reads as a glitch rather than a dismissal.
 */
const CLOSE_MS = 240;
const DRAG_TO_DISMISS = 110; // px past which the release closes it

export function Sheet({
  open,
  onClose,
  title,
  action,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Sits opposite the title. Used for Delete on Edit Medicine. */
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const dragged = useRef(0);
  const [closing, setClosing] = useState(false);

  // Exit is driven by `open` flipping false, not by an internal request — so
  // EVERY dismissal animates: scrim, Escape, the drag, and Cancel/Save inside
  // the sheet, which call the parent's onClose directly.
  const [wasOpen, setWasOpen] = useState(open);
  if (wasOpen !== open) {
    setWasOpen(open);
    if (!open) setClosing(true);
  }

  const requestClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    if (!closing) return;
    const t = setTimeout(() => setClosing(false), CLOSE_MS);
    return () => clearTimeout(t);
  }, [closing]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);

    const vv = window.visualViewport;
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

    /**
     * Lock the page behind the sheet without losing her place.
     *
     * The document is the scroller now, and `overflow: hidden` on a scrolled
     * body makes iOS snap to the top — so closing the sheet would dump her
     * back at the start of a long list. Pinning the body at a negative offset
     * holds the page exactly where it was, and the scroll position is restored
     * on the way out.
     */
    const scrollY = window.scrollY;
    const previous = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.removeEventListener("keydown", onKey);
      vv?.removeEventListener("resize", trackViewport);
      vv?.removeEventListener("scroll", trackViewport);
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, [open, requestClose]);

  // --- drag the handle down to dismiss -----------------------------------
  function onDragStart(e: React.PointerEvent) {
    if (closing || !open) return;
    dragStart.current = e.clientY;
    dragged.current = 0;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    if (panelRef.current) panelRef.current.style.transition = "none";
  }

  function onDragMove(e: React.PointerEvent) {
    if (dragStart.current === null || !panelRef.current) return;
    // Downward only — dragging up shouldn't lift the sheet off its edge.
    dragged.current = Math.max(0, e.clientY - dragStart.current);
    panelRef.current.style.transform = `translateY(${dragged.current}px)`;
  }

  function onDragEnd() {
    if (dragStart.current === null || !panelRef.current) return;
    const travelled = dragged.current;
    dragStart.current = null;
    panelRef.current.style.transition = `transform ${CLOSE_MS}ms cubic-bezier(0.32,0.72,0,1)`;
    if (travelled > DRAG_TO_DISMISS) {
      requestClose();
    } else {
      panelRef.current.style.transform = "translateY(0)";
    }
  }

  // Stay mounted through the exit animation.
  if ((!open && !closing) || typeof document === "undefined") return null;

  return createPortal(
    <div ref={wrapRef} className="fixed inset-x-0 top-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={requestClose}
        className={
          closing
            ? "absolute inset-0 animate-[scrim-clear_240ms_ease-in_forwards] bg-black/40"
            : "absolute inset-0 animate-[scrim-fade_200ms_ease-out] bg-black/40"
        }
      />
      <div className="relative flex w-full max-w-[430px] justify-center">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onPointerDown={(e) => {
            const target = e.target as HTMLElement;
            if (!target.closest("input, textarea, select, button, [role='slider']")) {
              (document.activeElement as HTMLElement | null)?.blur();
            }
          }}
          className={
            "bg-surface-default flex w-full flex-col gap-2 overflow-y-auto overscroll-contain rounded-t-[38px] pb-2 " +
            (closing
              ? "animate-[sheet-fall_240ms_cubic-bezier(0.32,0.72,0,1)_forwards]"
              : "animate-[sheet-rise_260ms_cubic-bezier(0.32,0.72,0,1)]")
          }
        >
          {/* Generous grab area — the visible bar is 48x4, the target is the
              full width and 32px tall. */}
          <div
            onPointerDown={onDragStart}
            onPointerMove={onDragMove}
            onPointerUp={onDragEnd}
            onPointerCancel={onDragEnd}
            className="flex h-8 w-full shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
          >
            <span className="bg-border-default h-1 w-12 rounded-full" aria-hidden />
          </div>
          <div className="flex items-center gap-3 px-4">
            <h2 className="text-screen-title text-text-primary min-w-0 flex-1 truncate">
              {title}
            </h2>
            {action ? <div className="shrink-0">{action}</div> : null}
          </div>
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
