"use client";

import { useState } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { FixedBar, InfoCallout, SectionHeading, Toast } from "@/components/ui";
import { RecordMeasurementSheet } from "@/components/home/record-measurement-sheet";
import { MeasurementChart, type ChartPoint, type Series } from "./measurement-chart";
import { readingStamp, relativeWhen } from "@/lib/today";
import { useI18n } from "@/lib/i18n/client";
import type { Locale, Messages } from "@/lib/i18n";
import type { MeasurementEntry, MeasurementMonth } from "@/lib/health-data";
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
 *
 * Tapping a reading edits it. The row IS the target, so nothing is added to a
 * dense list and no row carries competing buttons; a chevron marks it as going
 * somewhere, the way every other row in this app does. It opens the same sheet
 * used to record one, with Delete inside it — so correcting a number and
 * removing one are the same move she already knows from Edit Medicine.
 */
export function MeasurementDetail({
  type,
  title,
  unit,
  rangeNote,
  months,
  canEdit = true,
  canRecord = true,
  viewerId = null,
}: {
  type: Enums<"measurement_type">;
  title: string;
  unit: string;
  rangeNote: RangeNote;
  months: MeasurementMonth[];
  /** Owner only: tap a past reading to correct or remove it. */
  canEdit?: boolean;
  /**
   * Owner AND family: add a new reading. Split from canEdit because a son can
   * take his mother's sugar for her and write it down, but correcting what is
   * already in her history is hers to do.
   */
  canRecord?: boolean;
  /**
   * Set only on the family experience. A row this person recorded themselves
   * says so; everything else says nothing. Left null on the owner's own
   * screens, where nearly every row would carry the label and none of them
   * would be telling her anything she does not know.
   */
  viewerId?: string | null;
}) {
  const [recording, setRecording] = useState(false);
  const [editingEntry, setEditingEntry] = useState<MeasurementEntry | null>(null);
  // Bumped on every open so the sheet always remounts clean and never shows
  // the previous reading's values.
  const [sheetNonce, setSheetNonce] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  function openNew() {
    setEditingEntry(null);
    setSheetNonce((n) => n + 1);
    setRecording(true);
  }

  function openEdit(entry: MeasurementEntry) {
    setEditingEntry(entry);
    setSheetNonce((n) => n + 1);
    setRecording(true);
  }

  function closeSheet() {
    setRecording(false);
  }

  const { t, locale } = useI18n();
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
        { label: t.health.systolic, color: "var(--color-chart-systolic)", values: [] },
        { label: t.health.diastolic, color: "var(--color-chart-diastolic)", values: [] },
      ]
    : [{ label: title, color: "var(--color-action-primary)", values: [] }];

  const summary = buildSummary(title, unit, chronological, isBp, t, locale);

  return (
    <>
      <main className="flex flex-1 flex-col gap-6 p-4">
        <section className="bg-surface-default border-border-soft flex shrink-0 flex-col gap-4 rounded-xl border-[0.5px] p-3">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <SectionHeading as="p" size="eyebrow">
                {t.health.latest}
              </SectionHeading>
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
                      {relativeWhen(latest.measuredAt, locale)}
                    </span>
                  </span>
                </>
              ) : (
                <p className="text-text-tertiary text-[18px] leading-[1.4] font-medium">
                  {t.health.noReadingsYet}
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
            <SectionHeading>
              {month.label}
            </SectionHeading>
            <div className="bg-surface-default border-border-soft flex flex-col gap-5 rounded-xl border-[0.5px] px-3 py-5">
              {month.entries.map((e, i) => (
                <div key={e.id} className="flex flex-col gap-5">
                  {i > 0 ? <div className="border-border-default border-t" /> : null}
                  <button
                    type="button"
                    onClick={() => canEdit && openEdit(e)}
                    disabled={!canEdit}
                    aria-label={
                      canEdit
                        ? t.health.editReadingAria(
                            format(e),
                            e.unit,
                            readingStamp(e.measuredAt, locale),
                          )
                        : t.health.readingAria(
                            format(e),
                            e.unit,
                            readingStamp(e.measuredAt, locale),
                          )
                    }
                    className="active:bg-surface-tinted -mx-2 flex items-end gap-2 rounded-md px-2 py-1 text-left transition-colors disabled:pointer-events-none"
                  >
                    <p className="flex flex-1 items-end gap-1">
                      <span className="text-text-primary text-[18px] leading-[1.2] font-medium">
                        {format(e)}
                      </span>
                      {/* rgba(0,0,0,0.4) over surface/default, as a solid. */}
                      <span className="text-[14px] leading-[1.2] text-[#999999]">{e.unit}</span>
                    </p>
                    <span className="flex shrink-0 flex-col items-end gap-0.5">
                      <span className="text-[14px] leading-[1.2] text-[#999999]">
                        {readingStamp(e.measuredAt, locale)}
                      </span>
                      {viewerId && e.createdBy === viewerId ? (
                        <span className="text-text-tertiary text-[12px] leading-[1.2]">
                          {t.family.recordedByYou}
                        </span>
                      ) : null}
                    </span>
                    {canEdit ? (
                      <ChevronRight
                        size={16}
                        className="text-text-tertiary shrink-0"
                        aria-hidden
                      />
                    ) : null}
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* The list fades under the pinned button rather than stopping dead
          against it, as drawn. */}
      {canRecord ? (
      <FixedBar reserve={112}>
        <div
          aria-hidden
          className="from-surface-page/0 to-surface-page pointer-events-none absolute inset-x-0 bottom-full h-10 bg-gradient-to-b"
        />
        <footer
          className="bg-surface-page relative px-4 pt-2"
          style={{ paddingBottom: "var(--spacing-7)" }}
        >
          <button
            type="button"
            onClick={openNew}
            className="bg-action-primary text-text-on-brand text-button-label active:bg-action-primary-pressed flex h-[60px] w-full items-center justify-center rounded-xl transition-colors"
          >
            {t.health.recordNewReading}
          </button>
        </footer>
      </FixedBar>
      ) : null}

      <RecordMeasurementSheet
        key={`${editingEntry?.id ?? "new"}-${sheetNonce}`}
        open={recording}
        onClose={closeSheet}
        type={type}
        onSaved={setToast}
        entry={editingEntry}
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
  t: Messages,
  locale: Locale,
): string {
  if (entries.length === 0) return t.health.chartNone(title);
  if (entries.length === 1) {
    const only = entries[0];
    const value = isBp
      ? t.health.over(only.value, only.valueSecondary)
      : String(only.value);
    return t.health.chartOne(title, value, unit);
  }
  const first = entries[0];
  const last = entries[entries.length - 1];
  const primary = entries.map((e) => e.value);
  const lo = Math.min(...primary);
  const hi = Math.max(...primary);
  const from = readingStamp(first.measuredAt, locale);
  const to = readingStamp(last.measuredAt, locale);

  if (isBp) {
    const dia = entries.map((e) => e.valueSecondary ?? 0);
    return t.health.chartRangeBp(
      title,
      entries.length,
      from,
      to,
      lo,
      hi,
      Math.min(...dia),
      Math.max(...dia),
      unit,
      t.health.over(last.value, last.valueSecondary),
    );
  }
  return t.health.chartRange(
    title,
    entries.length,
    from,
    to,
    lo,
    hi,
    unit,
    String(last.value),
  );
}
