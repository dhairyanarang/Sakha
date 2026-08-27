import { notFound } from "next/navigation";
import { requireAccount } from "@/lib/account";
import { getMeasurementHistory } from "@/lib/health-data";
import { ScreenHeader } from "@/components/screen-header";
import {
  MeasurementDetail,
  type RangeNote,
} from "@/components/health/measurement-detail";
import type { Enums } from "@/lib/supabase/types";

/**
 * The three measurements, one screen shape.
 *
 * Range copy is taken verbatim from the frames and is not generated from the
 * stored values — these are health statements and must never be paraphrased or
 * invented. Weight has no range at all, because none was written for it and
 * one is not ours to make up.
 */
const TYPES: Record<
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
> = {
  "blood-sugar": {
    type: "blood_sugar",
    heading: "Blood Sugar",
    title: "Blood Sugar",
    unit: "mg/dL",
    range: { kind: "badge", label: "Normal Range", value: "70-140 mg/dL" },
  },
  "blood-pressure": {
    type: "blood_pressure",
    heading: "Blood Pressure",
    title: "Blood Pressure",
    unit: "mmHg",
    range: {
      kind: "callout",
      label: "Typical range for adults:",
      value: "90–120 systolic, 60–80 diastolic",
    },
  },
  weight: {
    type: "weight",
    /* Frame 213:12807 titles this "Weight Progress" where the other two are
       just the measurement name. Followed per frame rather than reconciled —
       flagged as an inconsistency between the three. */
    heading: "Weight Progress",
    title: "Weight",
    unit: "kg",
    /* No range note: none was written for weight, and a healthy weight is not
       a fixed number to invent one from. */
    range: null,
  },
};

export default async function MeasurementPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;
  const config = TYPES[slug];
  if (!config) notFound();

  const { account } = await requireAccount();

  const months = await getMeasurementHistory(account.accountId, config.type);

  return (
    <div className="bg-surface-page flex min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader backHref="/health" title={config.heading} />
      <MeasurementDetail
        type={config.type}
        title={config.title}
        unit={config.unit}
        rangeNote={config.range}
        months={months}
      />
    </div>
  );
}
