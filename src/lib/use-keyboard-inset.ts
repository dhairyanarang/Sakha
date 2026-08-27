"use client";

import { useEffect, useState } from "react";

/**
 * How much of the viewport the on-screen keyboard is covering, in px. 0 when
 * the keyboard is closed.
 *
 * The naive version of this — innerHeight minus visualViewport.height — is
 * wrong, and wrongly in a way desktop can never show you. It measures ANY
 * shrinkage of the visual viewport, and on iOS two ordinary things shrink it:
 * the URL bar collapsing and expanding as you scroll, and the rubber-band at
 * either end moving offsetTop. Feeding that into a fixed element's `bottom`
 * makes it slide around during plain scrolling. On desktop Chrome the visual
 * viewport always matches the layout viewport, so the figure is a constant 0
 * and the bug is invisible.
 *
 * Two guards make it mean what it says. Nothing counts unless a text field is
 * actually focused — a keyboard cannot be open otherwise — and the shrinkage
 * has to be larger than any browser chrome could account for. A URL bar is
 * roughly 50-100px; a phone keyboard is 250px and up.
 */
const KEYBOARD_MIN_HEIGHT = 120;

function editableIsFocused(): boolean {
  const el = document.activeElement as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function useKeyboardInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      if (!editableIsFocused()) {
        setInset(0);
        return;
      }
      const covered = window.innerHeight - vv.height - vv.offsetTop;
      setInset(covered > KEYBOARD_MIN_HEIGHT ? Math.round(covered) : 0);
    };

    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    // Focus changes decide whether a shrunken viewport counts at all, and they
    // do not always coincide with a viewport event.
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);

  return inset;
}
