"use client";

import { useState } from "react";
import Link from "next/link";
import { FlaskConical, X } from "lucide-react";
import { DEV_TOOLS } from "@/lib/dev";
import { restartOnboarding } from "@/app/dev/actions";

/**
 * A small testing panel, preview-only.
 *
 * Deliberately unstyled by the design system — it should never be mistaken for
 * part of the product, and it disappears entirely in production.
 */
export function DevTools() {
  const [open, setOpen] = useState(false);
  if (!DEV_TOOLS) return null;

  return (
    <div className="fixed bottom-24 left-3 z-[70] font-mono text-[11px]">
      {open ? (
        <div className="flex flex-col gap-1 rounded-lg bg-black/85 p-2 text-white shadow-lg">
          <div className="flex items-center justify-between gap-3 pb-1">
            <span className="opacity-60">dev tools</span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close dev tools">
              <X size={12} />
            </button>
          </div>
          <form action={restartOnboarding}>
            <button type="submit" className="w-full rounded bg-white/15 px-2 py-1 text-left">
              Restart onboarding
            </button>
          </form>
          <Link href="/" className="rounded bg-white/15 px-2 py-1">Skip to Home</Link>
          <Link href="/health" className="rounded bg-white/15 px-2 py-1">Health</Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="w-full rounded bg-white/15 px-2 py-1 text-left">
              Sign out
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open dev tools"
          className="flex size-8 items-center justify-center rounded-full bg-black/70 text-white"
        >
          <FlaskConical size={14} />
        </button>
      )}
    </div>
  );
}
