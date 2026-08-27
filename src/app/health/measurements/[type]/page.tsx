import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/account";
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
  { type: Enums<"measurement_type">; title: string; unit: string; range: RangeNote }
> = {
  "blood-sugar": {
    type: "blood_sugar",
    title: "Blood Sugar",
    unit: "mg/dL",
    range: { kind: "badge", label: "Normal Range", value: "70-140 mg/dL" },
  },
  "blood-pressure": {
    type: "blood_pressure",
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
    title: "Weight",
    unit: "kg",
    /* FLAGGED: weight has no detail frame in Figma. It reuses this shape
       because the Health screen links to it and a designed link that 404s is
       worse than a screen built from its two designed siblings. No range
       note — none was written, and a healthy weight is not a fixed number. */
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

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/welcome");

  const account = await getActiveAccount();
  if (!account) redirect("/onboarding/name");

  const months = await getMeasurementHistory(account.accountId, config.type);

  return (
    <div className="bg-surface-page flex min-h-0 flex-1 flex-col overflow-hidden">
      <ScreenHeader backHref="/health" title={config.title} />
      <MeasurementDetail
        type={config.type}
        unit={config.unit}
        rangeNote={config.range}
        months={months}
      />
    </div>
  );
}
