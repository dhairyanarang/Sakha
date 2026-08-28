import { notFound } from "next/navigation";
import { requireAccount } from "@/lib/account";
import { getMeasurementHistory } from "@/lib/health-data";
import { ScreenHeader } from "@/components/screen-header";
import {
  MeasurementDetail,
  type RangeNote,
} from "@/components/health/measurement-detail";
import type { Enums } from "@/lib/supabase/types";
import { getT } from "@/lib/i18n/server";
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
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;
  const { t, locale } = await getT();
  const config = typesFor(t)[slug];
  if (!config) notFound();

  const { account, canEdit } = await requireAccount();

  const months = await getMeasurementHistory(account.accountId, config.type, locale);

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <ScreenHeader backHref="/health" title={config.heading} />
      <MeasurementDetail
        type={config.type}
        title={config.title}
        unit={config.unit}
        rangeNote={config.range}
        months={months}
        canEdit={canEdit}
      />
    </div>
  );
}
