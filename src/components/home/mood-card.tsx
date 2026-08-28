"use client";

import { useState, useTransition } from "react";
import { FaceExpressionless, FaceGrinning, FaceSlightlyFrowning } from "lucide-react";
import { setMood } from "@/app/actions/home";
import { Toast } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/client";
import type { Enums } from "@/lib/supabase/types";

/**
 * The daily mood check-in.
 *
 * Asked once a day and then gone: once she has answered, the card is replaced
 * by a short confirmation and removed, so Home isn't asking her the same
 * question every time she opens it.
 *
 * The selected state was never designed, so it is built from the system. All
 * three moods share the same action/primary fill rather than being colour
 * coded — mood is a soft personal signal and must never read as an alarm, so
 * "Not Good" is deliberately NOT rendered in the error red.
 */
const MOODS: { value: Enums<"mood_level">; Icon: typeof FaceGrinning }[] = [
  { value: "not_good", Icon: FaceSlightlyFrowning },
  { value: "good", Icon: FaceExpressionless },
  { value: "very_good", Icon: FaceGrinning },
];

export function MoodCard({ mood }: { mood: Enums<"mood_level"> | null }) {
  // Already answered today — nothing to ask.
  const t = useT();
  const MOOD_LABEL: Record<Enums<"mood_level">, string> = {
    not_good: t.home.moodNotGood,
    good: t.home.moodGood,
    very_good: t.home.moodVeryGood,
  };
  const [answered, setAnswered] = useState(mood !== null);
  const [chosen, setChosen] = useState<Enums<"mood_level"> | null>(mood);
  const [toast, setToast] = useState(false);
  const [, startTransition] = useTransition();

  function choose(value: Enums<"mood_level">) {
    // Fill the circle straight away; the write happens behind it. Waiting on a
    // round trip to answer "how are you feeling" is what stops people
    // answering at all.
    setChosen(value);
    setToast(true);
    startTransition(async () => {
      await setMood(value);
      setAnswered(true);
    });
  }

  return (
    <>
      {!answered ? (
        <section className="bg-surface-default border-border-soft flex shrink-0 flex-col gap-4 rounded-xl border-[0.5px] p-3">
          <h2 className="text-body-medium text-text-primary">{t.home.moodQuestion}</h2>
          <div className="flex items-start gap-2">
            {MOODS.map(({ value, Icon }) => {
              const selected = chosen === value;
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
                    {MOOD_LABEL[value]}
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <Toast message={t.home.moodNoted} open={toast} onDone={() => setToast(false)} />
    </>
  );
}
