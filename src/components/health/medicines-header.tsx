"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { ScreenHeader } from "@/components/screen-header";
import { InfoCallout } from "@/components/ui";

/**
 * Medicines header, with the info affordance from the design.
 *
 * FLAGGED: Figma puts an info icon top-right on this screen but never draws
 * what it opens. Rather than ship a button that does nothing, it toggles a
 * short legend for the dots, which is the only thing on this screen that
 * needs explaining. Built from the existing Info Callout, nothing invented —
 * but the real destination is a design question, not an implementation one.
 *
 * A disclosure rather than a modal: it can be ignored, it never covers the
 * list, and closing it is the same tap that opened it.
 */
export function MedicinesHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ScreenHeader
        backHref="/health"
        title="Medicines"
        action={
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="medicines-legend"
            aria-label={open ? "Hide what the dots mean" : "What do the dots mean?"}
            className="text-text-primary flex size-[42px] items-center justify-center"
          >
            <Info size={24} aria-hidden />
          </button>
        }
      />
      {open ? (
        <div id="medicines-legend" className="bg-surface-page shrink-0 px-4 pt-4">
          <InfoCallout label="What the dots mean">
            One dot for each time you take a medicine today. A filled dot is one
            you have confirmed. An empty dot simply means not yet — you can
            confirm it whenever you like.
          </InfoCallout>
        </div>
      ) : null}
    </>
  );
}
