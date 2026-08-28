"use client";

import { useState, useTransition } from "react";
import { Sheet } from "./sheet";
import { Button, Chip } from "@/components/ui";
import { logWalk } from "@/app/actions/home";
import { useT } from "@/lib/i18n/client";

/**
 * Logging a walk was never designed, so this is built from the system:
 * the sheet, chips and buttons already in the library, nothing invented.
 *
 * Self-reported only, per the PRD — there is no automatic tracking anywhere in
 * this product. "No" is a first-class answer, recorded without comment or
 * encouragement, because a day without a walk is not a failure.
 */
const DURATIONS = [10, 15, 20, 30, 45, 60];

export function LogWalkSheet({
  open,
  onClose,
  onSaved,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (message: string) => void;
  existing: { didWalk: boolean; minutes: number | null } | null;
}) {
  // Pre-fill from today's entry so updating it isn't starting over.
  const t = useT();
  const [didWalk, setDidWalk] = useState<boolean | null>(existing?.didWalk ?? null);
  const [minutes, setMinutes] = useState<number | null>(existing?.minutes ?? null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    if (didWalk === null) {
      setError(t.home.chooseYesOrNo);
      return;
    }
    setError(null);
    startTransition(async () => {
      const err = await logWalk(didWalk, minutes);
      if (err) setError(err);
      else {
        onSaved(didWalk ? t.home.walkLogged : t.home.noWalkToday);
        onClose();
      }
    });
  }

  return (
    <Sheet open={open} onClose={onClose} title={t.home.logWalk}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <p className="text-body-medium text-text-primary">{t.home.didYouWalk}</p>
          <div className="flex gap-2">
            <Chip selected={didWalk === true} onClick={() => setDidWalk(true)}>
              {t.home.yes}
            </Chip>
            <Chip
              selected={didWalk === false}
              onClick={() => {
                setDidWalk(false);
                setMinutes(null);
              }}
            >
              {t.home.no}
            </Chip>
          </div>
        </div>

        {didWalk ? (
          <div className="flex flex-col gap-2.5">
            <p className="text-body-medium text-text-primary">{t.home.forHowLong}</p>
            <div className="flex flex-wrap gap-2">
              {DURATIONS.map((m) => (
                <Chip key={m} selected={minutes === m} onClick={() => setMinutes(m)}>
                  {t.units.minutesShort(m)}
                </Chip>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <p role="alert" className="text-body-secondary text-feedback-error">{error}</p>
        ) : null}
      </div>

      <div className="flex items-start gap-3">
        <Button variant="tertiary" onClick={onClose} disabled={pending} className="flex-1">
          {t.common.cancel}
        </Button>
        <Button onClick={save} disabled={pending} className="flex-1">
          {pending ? t.common.saving : t.common.save}
        </Button>
      </div>
    </Sheet>
  );
}
