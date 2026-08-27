import { createClient } from "@/lib/supabase/server";
import { localDate, SLOT_ORDER } from "@/lib/today";
import type { Enums } from "@/lib/supabase/types";

export type MedicineSummary = {
  id: string;
  name: string;
  /** One entry per slot this medicine is actually taken in, in day order. */
  slots: { slot: Enums<"time_of_day">; confirmed: boolean }[];
};

export type LatestMeasurement = {
  type: Enums<"measurement_type">;
  value: number;
  valueSecondary: number | null;
  unit: string;
  measuredAt: string;
};

export type DocumentSummary = {
  id: string;
  title: string;
  at: string;
};

export type HealthOverview = {
  medicines: MedicineSummary[];
  latest: Record<Enums<"measurement_type">, LatestMeasurement | null>;
  documents: DocumentSummary[];
};

/**
 * Everything the Health landing screen renders, in one pass.
 *
 * The dots beside each medicine are per-slot, not a count: a medicine taken
 * morning and evening shows two dots, and the one it skipped this afternoon
 * cannot appear at all. Same rule as Home — "unconfirmed" is the absence of a
 * log row, never a stored value.
 */
export async function getHealthOverview(accountId: string): Promise<HealthOverview> {
  const supabase = await createClient();
  const today = localDate();

  const [meds, logs, measurements, docs] = await Promise.all([
    supabase
      .from("medications")
      .select("id, name, times_of_day")
      .eq("account_id", accountId)
      .is("archived_at", null)
      .order("created_at"),
    supabase
      .from("medication_logs")
      .select("medication_id, slot, status")
      .eq("account_id", accountId)
      .eq("local_date", today),
    supabase
      .from("health_measurements")
      .select("type, value, value_secondary, unit, measured_at")
      .eq("account_id", accountId)
      .order("measured_at", { ascending: false }),
    supabase
      .from("health_documents")
      .select("id, title, doc_date, created_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const logged = new Map(
    (logs.data ?? []).map((l) => [`${l.medication_id}:${l.slot}`, l.status]),
  );

  const medicines: MedicineSummary[] = (meds.data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    // Ordered by time of day rather than however the array was stored, so the
    // dots always read morning to evening, left to right.
    slots: SLOT_ORDER.filter((s) => m.times_of_day.includes(s)).map((slot) => ({
      slot,
      confirmed: logged.get(`${m.id}:${slot}`) === "confirmed",
    })),
  }));

  // One query, sorted newest first — the first row seen for a type is its
  // latest reading, which avoids three separate round trips.
  const latest: HealthOverview["latest"] = {
    blood_sugar: null,
    blood_pressure: null,
    weight: null,
  };
  for (const row of measurements.data ?? []) {
    if (latest[row.type]) continue;
    latest[row.type] = {
      type: row.type,
      value: Number(row.value),
      valueSecondary: row.value_secondary == null ? null : Number(row.value_secondary),
      unit: row.unit,
      measuredAt: row.measured_at,
    };
  }

  return {
    medicines,
    latest,
    documents: (docs.data ?? []).map((d) => ({
      id: d.id,
      title: d.title,
      // doc_date is the date on the document itself; created_at is when it was
      // uploaded. The list is about the document, so prefer its own date.
      at: d.doc_date ?? d.created_at,
    })),
  };
}
