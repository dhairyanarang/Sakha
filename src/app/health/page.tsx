import { redirect } from "next/navigation";
import { Droplet, HeartPulse, Weight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/account";
import { getHealthOverview } from "@/lib/health-data";
import { relativeWhen } from "@/lib/today";
import { BottomNav } from "@/components/ui";
import { AppHeader } from "@/components/app-header";
import { MedicinesCard } from "@/components/health/medicines-card";
import { MeasurementRow } from "@/components/health/measurement-row";
import { DocumentsSection } from "@/components/health/documents-section";

/**
 * Health — Medicines, Measurements and Documents, in that order.
 *
 * Unlike Home this screen sits on surface/page rather than surface/tinted, as
 * drawn. Figma also gives the content panel a rounded top and a 4% brand wash
 * over white, which resolves to exactly surface/page — the same colour as the
 * frame behind it, so both are invisible and neither is reproduced here.
 */
export default async function HealthPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/welcome");

  const account = await getActiveAccount();
  if (!account) redirect("/onboarding/name");

  const { medicines, latest, documents } = await getHealthOverview(account.accountId);
  const sugar = latest.blood_sugar;
  const bp = latest.blood_pressure;
  const weight = latest.weight;

  return (
    <div className="bg-surface-page flex min-h-0 flex-1 flex-col overflow-hidden">
      <AppHeader name={account.displayName} />

      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
        <MedicinesCard medicines={medicines} />

        <section className="flex shrink-0 flex-col gap-2.5">
          <h2 className="text-subsection-heading text-action-primary uppercase tracking-[0.04em]">
            Measurements
          </h2>
          <div className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] px-3 py-4">
            <MeasurementRow
              href="/health/measurements/blood-sugar"
              tone="error"
              icon={<Droplet size={22} className="text-feedback-error" aria-hidden />}
              label="Blood Sugar"
              value={sugar ? String(sugar.value) : null}
              unit={sugar?.unit ?? "mg/dL"}
              when={sugar ? relativeWhen(sugar.measuredAt) : null}
            />
            <div className="border-border-default border-t" />
            <MeasurementRow
              href="/health/measurements/blood-pressure"
              tone="error"
              icon={<HeartPulse size={22} className="text-feedback-error" aria-hidden />}
              label="Blood Pressure"
              value={bp ? `${bp.value}/${bp.valueSecondary}` : null}
              unit={bp?.unit ?? "mmHg"}
              when={bp ? relativeWhen(bp.measuredAt) : null}
            />
            <div className="border-border-default border-t" />
            <MeasurementRow
              href="/health/measurements/weight"
              tone="success"
              /* Figma draws a hugeicons weight-scale here. Icons are Lucide
                 only, so this is Lucide's nearest equivalent — flagged. */
              icon={<Weight size={22} className="text-feedback-success-text" aria-hidden />}
              label="Weight"
              value={weight ? String(weight.value) : null}
              unit={weight?.unit ?? "kg"}
              when={weight ? relativeWhen(weight.measuredAt) : null}
            />
          </div>
        </section>

        <DocumentsSection documents={documents} />
      </main>

      <BottomNav active="health" className="shrink-0" />
    </div>
  );
}
