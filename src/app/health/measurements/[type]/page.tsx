import { notFound } from "next/navigation";
import { getViewer, requireAccount } from "@/lib/account";
import { getMeasurementHistory } from "@/lib/health-data";
import { ScreenHeader } from "@/components/screen-header";
import {
  MeasurementDetail,
  type RangeNote,
} from "@/components/health/measurement-detail";
import type { Enums } from "@/lib/supabase/types";
import { getT } from "@/lib/i18n/server";
import { safeReturnTo } from "@/lib/return-to";
import type { Messages } from "@/lib/i18n";

/**
 * The three measurements, one screen shape.
 *
 * Range copy is taken verbatim from the frames and is not generated from the
 * stored values — these are health statements and must never be paraphrased or
 * invented. Weight has no range at all, because none was written for it and
 * one is not ours to make up.
 */
const typesFor = (
  t: Messages,
): Record<
  string,
  {
    type: Enums<"measurement_type">;
    /** The header. Only weight says "Progress" — that is what its frame says. */
    heading: string;
    /** The plain name, used in the chart's spoken summary. */
    title: string;
    unit: string;
    range: RangeNote;
  }
> => ({
  "blood-sugar": {
    type: "blood_sugar",
    heading: t.health.bloodSugar,
    title: t.health.bloodSugar,
    // The unit is stored on the row and printed on her meter — never translated.
    unit: "mg/dL",
    range: {
      kind: "badge",
      label: t.health.normalRange,
      value: t.health.sugarRangeValue,
    },
  },
  "blood-pressure": {
    type: "blood_pressure",
    heading: t.health.bloodPressure,
    title: t.health.bloodPressure,
    unit: "mmHg",
    range: {
      kind: "callout",
      label: t.health.typicalRangeAdults,
      value: t.health.bpRangeValue,
    },
  },
  weight: {
    type: "weight",
    /* Frame 213:12807 titles this "Weight Progress" where the other two are
       just the measurement name. Followed per frame rather than reconciled —
       flagged as an inconsistency between the three. */
    heading: t.health.weightProgress,
    title: t.health.weight,
    unit: "kg",
    /* No range note: none was written for weight, and a healthy weight is not
       a fixed number to invent one from. */
    range: null,
  },
});

export default async function MeasurementPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { type: slug } = await params;
  /**
   * Back goes where you came from.
   *
   * This screen opens from her Health tab and from a family member's Family
   * View, and Family View has no Health tab to return to — it was sending them
   * into a screen their app no longer has. The origin travels with the link,
   * so it also carries the day being viewed.
   */
  const backHref = safeReturnTo((await searchParams).from, "/health");
  const { t, locale } = await getT();
  const config = typesFor(t)[slug];
  if (!config) notFound();

  const { account, canEdit, isFamily } = await requireAccount();
  const { user } = await getViewer();

  const months = await getMeasurementHistory(account.accountId, config.type, locale);

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <ScreenHeader backHref={backHref} title={config.heading} />
      <MeasurementDetail
        type={config.type}
        title={config.title}
        unit={config.unit}
        rangeNote={config.range}
        months={months}
        canEdit={canEdit}
        /* Everyone on the account may add a reading — a son taking his
           mother's sugar for her is the whole point of family access. Only
           she may change one that is already there. */
        canRecord
        viewerId={isFamily ? (user?.id ?? null) : null}
      />
    </div>
  );
}
