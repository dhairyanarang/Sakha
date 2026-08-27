"use client";

import { useOptimistic, useTransition } from "react";
import { FaceExpressionless, FaceGrinning, FaceSlightlyFrowning } from "lucide-react";
import { setMood } from "@/app/actions/home";
import { cn } from "@/lib/cn";
import type { Enums } from "@/lib/supabase/types";

/**
 * The daily mood check-in.
 *
 * The selected state was never designed, so it is built here from the system.
 * All three moods select to the same action/primary fill rather than being
 * colour-coded: mood is a soft personal signal and must never read as an
 * alarm, so "Not Good" is deliberately NOT rendered in the error red. The
 * mood-not-good token stays available for history views where the three need
 * telling apart at a glance.
 *
 * Selection is carried by fill AND label weight, never colour alone.
 *
 * The tap is optimistic: the circle fills immediately and the write happens
 * behind it, because waiting on a round trip to answer "how are you feeling"
 * is exactly the kind of friction that stops someone answering at all.
 */
const MOODS: { value: Enums<"mood_level">; label: string; Icon: typeof FaceGrinning }[] = [
  { value: "not_good", label: "Not Good", Icon: FaceSlightlyFrowning },
  { value: "good", label: "Good", Icon: FaceExpressionless },
  { value: "very_good", label: "Very Good", Icon: FaceGrinning },
];

export function MoodCard({ mood }: { mood: Enums<"mood_level"> | null }) {
  const [optimistic, setOptimistic] = useOptimistic(mood);
  const [, startTransition] = useTransition();

  function choose(value: Enums<"mood_level">) {
    startTransition(async () => {
      setOptimistic(value);
      await setMood(value);
    });
  }

  return (
    <section className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] p-3">
      <h2 className="text-body-medium text-text-primary">How are you feeling today?</h2>
      <div className="flex items-start gap-2">
        {MOODS.map(({ value, label, Icon }) => {
          const selected = optimistic === value;
          return (
            <button
              key={value}
              type="button"
              aria-pressed={selected}
              onClick={() => choose(value)}
              className="flex flex-1 flex-col items-center justify-center gap-2"
            >
              <span
                className={cn(
                  "flex items-center justify-center rounded-full p-2 transition-colors",
                  selected ? "bg-action-primary" : "bg-surface-tinted-strong",
                )}
              >
                <Icon
                  size={36}
                  className={selected ? "text-text-on-brand" : "text-action-primary"}
                  aria-hidden
                />
              </span>
              <span
                className={cn(
                  "text-action-primary w-full text-center text-[14px] leading-[1.2]",
                  selected ? "font-medium" : "font-normal",
                )}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
