"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { InfoCallout, Toast } from "@/components/ui";
import { RecordMeasurementSheet } from "@/components/home/record-measurement-sheet";
import { MeasurementChart, type ChartPoint, type Series } from "./measurement-chart";
import { readingStamp, relativeWhen } from "@/lib/today";
import type { MeasurementMonth } from "@/lib/health-data";
import type { Enums } from "@/lib/supabase/types";

export type RangeNote =
  | { kind: "badge"; label: string; value: string }
  | { kind: "callout"; label: string; value: string }
  | null;

/**
 * One measurement's detail: the latest reading, how it has moved, its healthy
 * range, and every reading so far grouped by month.
 *
 * The chart plots at most the last 30 readings. Anything older stays in the
 * history below rather than being crushed into a few pixels — the list is the
 * complete record, the chart is the shape of it.
 */
export function MeasurementDetail({
  type,
  title,
  unit,
  rangeNote,
  months,
}: {
  type: Enums<"measurement_type">;
  title: string;
  unit: string;
  rangeNote: RangeNote;
  months: MeasurementMonth[];
}) {
  const [recording, setRecording] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isBp = type === "blood_pressure";
  const latest = months[0]?.entries[0] ?? null;
  const format = (e: { value: number; valueSecondary: number | null }) =>
    e.valueSecondary == null ? String(e.value) : `${e.value}/${e.valueSecondary}`;

  // The query returns newest first; a chart reads left to right through time.
  const chronological = months.flatMap((m) => m.entries).slice().reverse();
  const points: ChartPoint[] = chronological.map((e) => ({
    at: Date.parse(e.measuredAt),
    values: isBp ? [e.value, e.valueSecondary] : [e.value],
  }));

  const series: Series[] = isBp
    ? [
        { label: "Systolic", color: "var(--color-chart-systolic)", values: [] },
        { label: "Diastolic", color: "var(--color-chart-diastolic)", values: [] },
      ]
    : [{ label: title, color: "var(--color-action-primary)", values: [] }];

  const summary = buildSummary(title, unit, chronological, isBp);

  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
        <section className="bg-surface-default border-border-soft flex shrink-0 flex-col gap-4 rounded-xl border-[0.5px] p-3">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="text-eyebrow-label text-action-primary uppercase tracking-[0.04em]">
                Latest
              </p>
              {latest ? (
                <>
                  <p className="text-text-primary leading-[1.2] font-medium">
                    <span className="text-[24px]">{format(latest)}</span>{" "}
                    <span className="text-[14px] font-normal">{unit}</span>
                  </p>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} className="text-text-tertiary shrink-0" aria-hidden />
                    {/* rgba(0,0,0,0.6) over surface/default, as a solid. */}
                    <span className="text-[14px] leading-[1.2] text-[#666666]">
                      {relativeWhen(latest.measuredAt)}
                    </span>
                  </span>
                </>
              ) : (
                <p className="text-text-tertiary text-[18px] leading-[1.4] font-medium">
                  No readings yet
                </p>
              )}
            </div>

            {rangeNote?.kind === "badge" ? (
              <div className="bg-feedback-success-surface border-feedback-success flex shrink-0 flex-col gap-1 rounded-sm border px-3 py-2">
                <span className="text-feedback-success-text flex items-center gap-1.5 text-[14px] leading-[1.2]">
                  <span
                    className="bg-feedback-success-text block size-1.5 rounded-full"
                    aria-hidden
                  />
                  {rangeNote.label}
                </span>
                <span className="text-text-primary text-[16px] leading-[1.2] font-medium">
                  {rangeNote.value}
                </span>
              </div>
            ) : null}

            {/* Two lines cannot be told apart by colour alone, so they are
                named. The legend is the pairing the accessibility rule asks
                for, not decoration. */}
            {isBp && points.length > 0 ? (
              <div className="flex shrink-0 flex-col gap-1.5">
                {series.map((s) => (
                  <span
                    key={s.label}
                    className="text-text-secondary flex items-center gap-2 text-[14px] leading-[1.2]"
                  >
                    <span
                      className="block size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: s.color }}
                      aria-hidden
                    />
                    {s.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          {points.length > 0 ? (
            <>
              <div className="border-border-default border-t" />
              <MeasurementChart
                points={points}
                series={series}
                unit={unit}
                summary={summary}
              />
            </>
          ) : null}

          {rangeNote?.kind === "callout" ? (
            <InfoCallout label={rangeNote.label}>{rangeNote.value}</InfoCallout>
          ) : null}
        </section>

        {months.map((month) => (
          <section key={month.label} className="flex shrink-0 flex-col gap-2.5">
            <h2 className="text-subsection-heading text-action-primary uppercase tracking-[0.04em]">
              {month.label}
            </h2>
            <div className="bg-surface-default border-border-soft flex flex-col gap-5 rounded-xl border-[0.5px] px-3 py-5">
              {month.entries.map((e, i) => (
                <div key={e.id} className="flex flex-col gap-5">
                  {i > 0 ? <div className="border-border-default border-t" /> : null}
                  <div className="flex items-end gap-1.5">
                    <p className="flex flex-1 items-end gap-1">
                      <span className="text-text-primary text-[18px] leading-[1.2] font-medium">
                        {format(e)}
                      </span>
                      {/* rgba(0,0,0,0.4) over surface/default, as a solid. */}
                      <span className="text-[14px] leading-[1.2] text-[#999999]">{e.unit}</span>
                    </p>
                    <span className="shrink-0 text-[14px] leading-[1.2] text-[#999999]">
                      {readingStamp(e.measuredAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* The list fades under the pinned button rather than stopping dead
          against it, as drawn. */}
      <div className="relative shrink-0">
        <div
          aria-hidden
          className="from-surface-page/0 to-surface-page pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-b"
        />
        <footer
          className="bg-surface-page px-4 pt-2"
          style={{ paddingBottom: "var(--spacing-7)" }}
        >
          <button
            type="button"
            onClick={() => setRecording(true)}
            className="bg-action-primary text-text-on-brand text-button-label active:bg-action-primary-pressed flex h-[60px] w-full items-center justify-center rounded-xl transition-colors"
          >
            Record new reading
          </button>
        </footer>
      </div>

      <RecordMeasurementSheet
        open={recording}
        onClose={() => setRecording(false)}
        type={type}
        onSaved={setToast}
      />

      <Toast message={toast ?? ""} open={toast !== null} onDone={() => setToast(null)} />
    </>
  );
}

/**
 * What the chart says, in words.
 *
 * A line is invisible to a screen reader, so the figure carries a sentence
 * describing the same thing: how many readings, over what span, and where they
 * range. Deliberately descriptive and never interpretive — it reports numbers
 * and does not tell her whether they are good.
 */
function buildSummary(
  title: string,
  unit: string,
  entries: { value: number; valueSecondary: number | null; measuredAt: string }[],
  isBp: boolean,
): string {
  if (entries.length === 0) return `${title}: no readings yet.`;
  if (entries.length === 1) {
    const only = entries[0];
    return `${title}: one reading, ${isBp ? `${only.value} over ${only.valueSecondary}` : only.value} ${unit}.`;
  }
  const first = entries[0];
  const last = entries[entries.length - 1];
  const primary = entries.map((e) => e.value);
  const lo = Math.min(...primary);
  const hi = Math.max(...primary);
  const when = `${readingStamp(first.measuredAt)} to ${readingStamp(last.measuredAt)}`;

  if (isBp) {
    const dia = entries.map((e) => e.valueSecondary ?? 0);
    return `${title}: ${entries.length} readings from ${when}. Systolic ${lo} to ${hi}, diastolic ${Math.min(...dia)} to ${Math.max(...dia)} ${unit}. Most recent ${last.value} over ${last.valueSecondary}.`;
  }
  return `${title}: ${entries.length} readings from ${when}, ranging ${lo} to ${hi} ${unit}. Most recent ${last.value} ${unit}.`;
}
