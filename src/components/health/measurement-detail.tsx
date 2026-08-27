"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { InfoCallout, Toast } from "@/components/ui";
import { RecordMeasurementSheet } from "@/components/home/record-measurement-sheet";
import { readingStamp, relativeWhen } from "@/lib/today";
import type { MeasurementMonth } from "@/lib/health-data";
import type { Enums } from "@/lib/supabase/types";

export type RangeNote =
  | { kind: "badge"; label: string; value: string }
  | { kind: "callout"; label: string; value: string }
  | null;

/**
 * One measurement's detail: the latest reading, its healthy range, and every
 * reading so far grouped by month.
 *
 * NOT BUILT: the chart. Both frames put a line chart under the latest reading
 * — dual-line for blood pressure, single-line with a shaded band for sugar —
 * along with the 7 days / 30 days / 3 months pills that only exist to drive
 * it. The Design MD defers the chart as its own focused task and says not to
 * rush a version of it in to complete a set, so it is absent rather than
 * approximated. Everything either side of it is here, and the screen reads as
 * finished without it rather than showing a hole.
 */
export function MeasurementDetail({
  type,
  unit,
  rangeNote,
  months,
}: {
  type: Enums<"measurement_type">;
  unit: string;
  rangeNote: RangeNote;
  months: MeasurementMonth[];
}) {
  const [recording, setRecording] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const latest = months[0]?.entries[0] ?? null;
  const format = (e: { value: number; valueSecondary: number | null }) =>
    e.valueSecondary == null ? String(e.value) : `${e.value}/${e.valueSecondary}`;

  return (
    <>
      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
        <section className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] p-3">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="text-eyebrow-label text-action-primary uppercase tracking-[0.04em]">
                Latest
              </p>
              {latest ? (
                <>
                  <p className="text-text-primary leading-[1.2] font-medium">
                    <span className="text-[24px]">{format(latest)}</span>{" "}
                    <span className="text-[16px]">{unit}</span>
                  </p>
                  <span className="flex items-center gap-1">
                    <Calendar size={16} className="text-text-tertiary shrink-0" aria-hidden />
                    {/* rgba(0,0,0,0.4) over surface/default, as a solid. */}
                    <span className="text-[14px] leading-[1.2] text-[#999999]">
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
          </div>

          {rangeNote?.kind === "callout" ? (
            <InfoCallout label={rangeNote.label}>{rangeNote.value}</InfoCallout>
          ) : null}
        </section>

        {months.map((month) => (
          <section key={month.label} className="flex flex-col gap-2.5">
            <h2 className="text-subsection-heading text-action-primary uppercase tracking-[0.04em]">
              {month.label}
            </h2>
            <div className="bg-surface-default border-border-soft flex flex-col gap-5 rounded-xl border-[0.5px] px-3 py-5">
              {month.entries.map((e, i) => (
                <div key={e.id} className="flex flex-col gap-5">
                  {i > 0 ? <div className="border-border-default border-t" /> : null}
                  <div className="flex items-baseline gap-3">
                    <p className="text-text-primary flex-1 leading-[1.2] font-medium">
                      <span className="text-[18px]">{format(e)}</span>{" "}
                      <span className="text-text-tertiary text-[14px] font-normal">
                        {e.unit}
                      </span>
                    </p>
                    {/* rgba(0,0,0,0.4) over surface/default, as a solid. */}
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

      <footer
        className="bg-surface-page shrink-0 px-4 pt-4"
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
