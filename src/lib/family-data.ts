import { createClient } from "@/lib/supabase/server";
import { localDate, slotHasStarted, SLOT_ORDER } from "@/lib/today";
import type { Enums } from "@/lib/supabase/types";
import type { DocumentSummary, LatestMeasurement } from "@/lib/health-data";

/**
 * What a family member's Home is made of.
 *
 * The owner's Home answers "what do I need to do today". This one answers a
 * different question — "how is she doing" — so it is built from different data
 * and shaped differently. It is not the owner's screen with the buttons taken
 * away.
 *
 * WHAT IS DELIBERATELY NOT HERE: her mood. The daily check-in is a soft,
 * private signal she gives herself, and the access screen a family member
 * agreed to promises medicines, readings, documents and today's care — not how
 * she said she felt. Nothing should appear here that was not asked for there.
 */
export type UpdateKind =
  | "blood_pressure"
  | "blood_sugar"
  | "weight"
  | "medicine"
  | "document"
  | "walk";

export type RecentUpdate = {
  /** Stable across a render, so React has a key that is not an index. */
  id: string;
  kind: UpdateKind;
  /** ISO. Formatted at render, in the reader's language. */
  at: string;
  /** The number, already assembled: "128/82". Null for non-numeric events. */
  value: string | null;
  unit: string | null;
  /** A medicine name, a document title, a walk length — otherwise null. */
  detail: string | null;
  /** For medicine and walk activity. Never "missed" — no such state exists. */
  status: Enums<"medication_status"> | null;
  slot: Enums<"time_of_day"> | null;
};

export type MedicinesToday = {
  confirmed: number;
  /** Doses due so far today: medicines x slots that have already come around. */
  due: number;
  activeCount: number;
};

export type FamilyHome = {
  updates: RecentUpdate[];
  latest: Record<Enums<"measurement_type">, LatestMeasurement | null>;
  medicines: MedicinesToday;
  documents: DocumentSummary[];
};

/** How far back the feed looks. Beyond this, "recent" stops being true. */
const WINDOW_DAYS = 30;
const MAX_UPDATES = 8;
const MAX_DOCUMENTS = 3;

/**
 * Everything the family Home renders, in one pass.
 *
 * Six queries in parallel rather than six awaits in sequence — this screen is
 * read from another city and every avoidable round trip to Mumbai is felt.
 *
 * Each feed query is bounded by both a date window and a row limit. A feed
 * that reads the whole history to show eight rows gets slower every month she
 * uses the app.
 */
export async function getFamilyHome(accountId: string): Promise<FamilyHome> {
  const supabase = await createClient();
  const since = new Date(Date.now() - WINDOW_DAYS * 86_400_000).toISOString();
  const today = localDate();

  const [measurements, logs, docs, walks, meds, todaysLogs] = await Promise.all([
    supabase
      .from("health_measurements")
      .select("id, type, value, value_secondary, unit, measured_at")
      .eq("account_id", accountId)
      .order("measured_at", { ascending: false })
      // Not date-filtered: the Health Overview needs the latest of each type
      // however old it is — a weight recorded in June is still her latest
      // weight — and the feed slices its own window out of the same rows.
      .limit(60),
    // created_at, not confirmed_at: this is "when did something happen on the
    // account", and a dose confirmed late still happened when she confirmed it.
    supabase
      .from("medication_logs")
      .select("id, slot, status, created_at, medications(name)")
      .eq("account_id", accountId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(MAX_UPDATES),
    supabase
      .from("health_documents")
      .select("id, title, doc_date, created_at")
      .eq("account_id", accountId)
      .order("created_at", { ascending: false })
      .limit(MAX_DOCUMENTS),
    supabase
      .from("walk_checkins")
      .select("id, did_walk, duration_minutes, created_at")
      .eq("account_id", accountId)
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(MAX_UPDATES),
    supabase
      .from("medications")
      .select("id, times_of_day")
      .eq("account_id", accountId)
      .is("archived_at", null),
    supabase
      .from("medication_logs")
      .select("medication_id, slot, status")
      .eq("account_id", accountId)
      .eq("local_date", today),
  ]);

  const measurementRows = measurements.data ?? [];
  const updates: RecentUpdate[] = [];

  for (const m of measurementRows) {
    if (m.measured_at < since) continue;
    updates.push({
      id: `m-${m.id}`,
      kind: m.type,
      at: m.measured_at,
      value:
        m.type === "blood_pressure" && m.value_secondary != null
          ? `${Number(m.value)}/${Number(m.value_secondary)}`
          : String(Number(m.value)),
      unit: m.unit,
      detail: null,
      status: null,
      slot: null,
    });
  }

  for (const l of logs.data ?? []) {
    const med = l.medications as unknown as { name: string } | null;
    updates.push({
      id: `l-${l.id}`,
      kind: "medicine",
      at: l.created_at,
      value: null,
      unit: null,
      detail: med?.name ?? null,
      status: l.status,
      slot: l.slot,
    });
  }

  for (const d of docs.data ?? []) {
    updates.push({
      id: `d-${d.id}`,
      kind: "document",
      at: d.created_at,
      value: null,
      unit: null,
      detail: d.title,
      status: null,
      slot: null,
    });
  }

  for (const w of walks.data ?? []) {
    updates.push({
      id: `w-${w.id}`,
      kind: "walk",
      at: w.created_at,
      value: null,
      unit: null,
      detail: w.did_walk && w.duration_minutes ? String(w.duration_minutes) : null,
      // A walk that did not happen is still worth showing — it is the honest
      // answer to "did she walk today" and carries no judgement either way.
      status: w.did_walk ? "confirmed" : "skipped",
      slot: null,
    });
  }

  updates.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));

  const latest: FamilyHome["latest"] = {
    blood_sugar: null,
    blood_pressure: null,
    weight: null,
  };
  for (const row of measurementRows) {
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
    updates: updates.slice(0, MAX_UPDATES),
    latest,
    medicines: countToday(meds.data ?? [], todaysLogs.data ?? []),
    documents: (docs.data ?? []).map((d) => ({
      id: d.id,
      title: d.title,
      at: d.doc_date ?? d.created_at,
    })),
  };
}


/**
 * How today's medicines are going, as a count.
 *
 * A family member does not need the per-dose grid the owner confirms against —
 * they need "3 of 4 confirmed". Doses that have not come around yet are not
 * counted against her: at nine in the morning an evening tablet is not
 * outstanding, it simply has not happened. That is the same rule the owner's
 * own Home follows, and it is what keeps this screen from manufacturing alarm
 * out of a perfectly normal Tuesday morning.
 */
function countToday(
  meds: { id: string; times_of_day: Enums<"time_of_day">[] }[],
  logs: { medication_id: string; slot: Enums<"time_of_day">; status: string }[],
): MedicinesToday {
  const confirmedKeys = new Set(
    logs.filter((l) => l.status === "confirmed").map((l) => `${l.medication_id}:${l.slot}`),
  );

  let due = 0;
  let confirmed = 0;
  for (const m of meds) {
    for (const slot of SLOT_ORDER) {
      if (!m.times_of_day.includes(slot)) continue;
      if (!slotHasStarted(slot)) continue;
      due += 1;
      if (confirmedKeys.has(`${m.id}:${slot}`)) confirmed += 1;
    }
  }

  return { confirmed, due, activeCount: meds.length };
}

/** One medicine as it reads on the family Health page, under its time of day. */
export type MedicineAtSlot = {
  id: string;
  name: string;
  conditionTag: string | null;
  remarks: string | null;
  /** All the slots this medicine is taken at, for the three dots. */
  times: Enums<"time_of_day">[];
  /** Today, at THIS slot. "unconfirmed" is the absence of a log row. */
  status: Enums<"medication_status">;
  /** False for a slot that has not come around yet — not a missed dose. */
  started: boolean;
};

export type MedicinesBySlot = {
  slot: Enums<"time_of_day">;
  medicines: MedicineAtSlot[];
}[];

/**
 * Her medicines, grouped the way her own Home groups them: morning,
 * afternoon, evening.
 *
 * The son is answering "what does Mum take, and has she taken it" — which is
 * the same shape as her own screen, so it is grouped the same way rather than
 * given a layout of its own. A medicine taken twice a day appears under both
 * slots, because that is when she takes it and the count of rows is not the
 * point.
 *
 * Status is per medicine per slot rather than the aggregate the owner's Home
 * uses: she is confirming a whole slot at once and he is reading it, so he
 * wants to know WHICH one is outstanding, not how many.
 */
export async function getMedicinesBySlot(accountId: string): Promise<MedicinesBySlot> {
  const supabase = await createClient();

  const [meds, logs] = await Promise.all([
    supabase
      .from("medications")
      .select("id, name, condition_tag, remarks, times_of_day")
      .eq("account_id", accountId)
      .is("archived_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("medication_logs")
      .select("medication_id, slot, status")
      .eq("account_id", accountId)
      .eq("local_date", localDate()),
  ]);

  const logged = new Map(
    (logs.data ?? []).map((l) => [`${l.medication_id}:${l.slot}`, l.status]),
  );

  return SLOT_ORDER.map((slot) => ({
    slot,
    started: slotHasStarted(slot),
    medicines: (meds.data ?? [])
      .filter((m) => m.times_of_day.includes(slot))
      .map((m) => ({
        id: m.id,
        name: m.name,
        conditionTag: m.condition_tag,
        remarks: m.remarks,
        times: m.times_of_day,
        status:
          (logged.get(`${m.id}:${slot}`) as Enums<"medication_status">) ?? "unconfirmed",
        started: slotHasStarted(slot),
      })),
  }))
    // A slot she takes nothing at is not an empty section, it is not a section.
    .filter((group) => group.medicines.length > 0)
    .map(({ slot, medicines }) => ({ slot, medicines }));
}
