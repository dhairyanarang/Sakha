"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FamilyDateBar } from "./family-date-bar";
import { DaySkeleton } from "./day-skeleton";
import { localDate } from "@/lib/today";

/**
 * The date, and the part of the screen that belongs to it.
 *
 * Changing the day is a navigation — the day lives in the URL so back works
 * and a refresh keeps it — but a plain router.push would hand the whole screen
 * to the route's loading boundary and blank the date bar along with everything
 * else. Inside startTransition React keeps this screen mounted instead, and
 * isPending tells us to swap only the medicines and measurements for their
 * skeleton.
 *
 * The bar shows the day you just chose rather than the one still on screen.
 * Without that it would say Today for as long as the fetch took, which reads
 * as the tap not having registered. It corrects itself when the navigation
 * lands: the props catch up and the optimistic value is dropped.
 *
 * Children are the server-rendered day. They are replaced, never dimmed —
 * yesterday's blood pressure under today's date would be a false statement,
 * and a stale reading is worse than no reading.
 */
export function FamilyDay({
  date,
  children,
}: {
  /** The day the server rendered. */
  date: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [chosen, setChosen] = useState<string | null>(null);

  // Drop the optimistic day once the navigation it belonged to has landed.
  // Adjusted during render rather than in an effect, which is the pattern this
  // codebase's lint rules require and avoids a second paint.
  const [seen, setSeen] = useState(date);
  if (seen !== date) {
    setSeen(date);
    setChosen(null);
  }

  const shown = chosen ?? date;
  const today = localDate();

  function select(next: string) {
    if (next === date) return; // Same day: nothing to fetch, nothing to show.
    setChosen(next);
    startTransition(() => {
      // Today drops the parameter, so the plain URL is always today.
      router.push(next === today ? "/" : `/?d=${next}`);
    });
  }

  return (
    <>
      <FamilyDateBar date={shown} isToday={shown === today} onSelect={select} />
      {isPending ? <DaySkeleton /> : children}
    </>
  );
}
