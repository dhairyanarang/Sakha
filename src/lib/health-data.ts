import { createClient } from "@/lib/supabase/server";
import { SLOT_ORDER, TZ } from "@/lib/today";
import type { Locale } from "@/lib/i18n";
import type { Enums } from "@/lib/supabase/types";

export type MedicineSummary = {
  id: string;
  name: string;
  /**
   * Which of the three times of day this medicine is taken in.
   *
   * This is her SCHEDULE, not today's progress. The three dots beside a
   * medicine always read morning, afternoon, evening in that order; a filled
   * one means she takes it then, an empty one means she does not. Nothing
   * about confirmation is expressed here.
   */
  times: Enums<"time_of_day">[];
};

export type MedicineDetail = MedicineSummary & {
  conditionTag: string | null;
  remarks: string | null;
};

/** Medicines grouped under their condition, in the order they were added. */
export type MedicineGroup = {
  /** null means she never set one — rendered under a general heading. */
  conditionTag: string | null;
  medicines: MedicineDetail[];
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
 * Note this deliberately does NOT read medication_logs. The dots beside each
 * medicine describe her schedule, not today's progress, so nothing here
 * depends on what has been confirmed — Home is where today's state lives.
 */
export async function getHealthOverview(accountId: string): Promise<HealthOverview> {
  const supabase = await createClient();

  const [meds, measurements, docs] = await Promise.all([
    supabase
      .from("medications")
      .select("id, name, times_of_day")
      .eq("account_id", accountId)
      .is("archived_at", null)
      .order("created_at"),
    supabase
      .from("health_measurements")
      .select("type, value, value_secondary, unit, measured_at")
      .eq("account_id", accountId)
      .order("measured_at", { ascending: false }),
    supabase
      .from("health_documents")
      .select("id, title, doc_date, created_at")
      .eq("account_id", accountId)
      // No limit: Figma gives the Documents heading no chevron and the file
      // has no Documents screen, so this list is the only way to reach them.
      .order("created_at", { ascending: false }),
  ]);

  const medicines: MedicineSummary[] = (meds.data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    // Ordered rather than taken as stored, so the dots always read morning to
    // evening left to right regardless of the order they were saved in.
    times: SLOT_ORDER.filter((s) => m.times_of_day.includes(s)),
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

/**
 * Every active medicine, grouped by condition, with today's per-slot state.
 *
 * Grouping follows the IA: medicines carrying a condition tag group under it,
 * and anything untagged falls under one general heading at the end rather than
 * being hidden or forced into a category she never chose.
 *
 * Groups keep first-added order rather than being sorted alphabetically, so
 * the list she built stays in the order she built it.
 */
export async function getMedicines(accountId: string): Promise<MedicineGroup[]> {
  const supabase = await createClient();

  const meds = await supabase
    .from("medications")
    .select("id, name, times_of_day, condition_tag, remarks")
    .eq("account_id", accountId)
    .is("archived_at", null)
    .order("created_at");

  const groups = new Map<string, MedicineGroup>();
  for (const m of meds.data ?? []) {
    const key = m.condition_tag ?? "";
    if (!groups.has(key)) {
      groups.set(key, { conditionTag: m.condition_tag ?? null, medicines: [] });
    }
    groups.get(key)!.medicines.push({
      id: m.id,
      name: m.name,
      conditionTag: m.condition_tag,
      remarks: m.remarks,
      times: SLOT_ORDER.filter((s) => m.times_of_day.includes(s)),
    });
  }

  // Untagged medicines sit last, under their own heading.
  return [...groups.values()].sort((a, b) =>
    a.conditionTag === null ? 1 : b.conditionTag === null ? -1 : 0,
  );
}


export type MeasurementEntry = {
  id: string;
  value: number;
  valueSecondary: number | null;
  unit: string;
  measuredAt: string;
  note: string | null;
  /** Who wrote it down. Null on readings that predate the column. */
  createdBy: string | null;
};

/** Readings grouped under the month they were taken in, newest first. */
export type MeasurementMonth = {
  /** "August", or "August 2025" once it is not this year. */
  label: string;
  entries: MeasurementEntry[];
};

/**
 * Every reading of one kind, newest first, grouped by month.
 *
 * The month heading drops the year while it is still the current one — she
 * does not need "August 2026" told to her in August 2026 — and adds it once
 * that stops being obvious.
 */
export async function getMeasurementHistory(
  accountId: string,
  type: Enums<"measurement_type">,
  /** Month names are shown to her, so they are formatted in her language. */
  locale: Locale = "en",
): Promise<MeasurementMonth[]> {
  const intlLocale = locale === "hi" ? "hi-IN" : "en-GB";
  const supabase = await createClient();
  const { data } = await supabase
    .from("health_measurements")
    .select("id, value, value_secondary, unit, measured_at, note, created_by")
    .eq("account_id", accountId)
    .eq("type", type)
    .order("measured_at", { ascending: false });

  const thisYear = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric" })
    .format(new Date());

  const months = new Map<string, MeasurementMonth>();
  for (const row of data ?? []) {
    const at = new Date(row.measured_at);
    const parts = new Intl.DateTimeFormat(intlLocale, {
      timeZone: TZ,
      month: "long",
      year: "numeric",
    }).formatToParts(at);
    const month = parts.find((p) => p.type === "month")!.value;
    // Keyed and compared on the Gregorian year in Latin digits, never on the
    // localised string — hi-IN could change the label without changing the year.
    const year = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric" }).format(at);
    const key = `${year}-${month}`;

    if (!months.has(key)) {
      months.set(key, { label: year === thisYear ? month : `${month} ${year}`, entries: [] });
    }
    months.get(key)!.entries.push({
      id: row.id,
      value: Number(row.value),
      valueSecondary: row.value_secondary == null ? null : Number(row.value_secondary),
      unit: row.unit,
      measuredAt: row.measured_at,
      note: row.note,
      createdBy: row.created_by,
    });
  }

  return [...months.values()];
}

export type StoredDocument = {
  id: string;
  title: string;
  docDate: string | null;
  docType: string | null;
  storagePath: string;
  notes: string | null;
  createdAt: string;
  /** Short-lived; the bucket is private and has no public URL. */
  signedUrl: string | null;
  /** Same object, signed to arrive as a download rather than open inline. */
  downloadUrl: string | null;
  /** The name the download lands under. */
  fileName: string;
  isImage: boolean;
  isPdf: boolean;
  /** Who added it. Null on documents that predate the column. */
  createdBy: string | null;
};

/** One document, with a link that can actually be opened. */
export async function getDocument(
  accountId: string,
  id: string,
): Promise<StoredDocument | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("health_documents")
    .select("id, title, doc_date, doc_type, storage_path, notes, created_at, created_by")
    .eq("account_id", accountId)
    .eq("id", id)
    .maybeSingle();
  if (!data) return null;

  const extension = data.storage_path.split(".").pop()?.toLowerCase() ?? "";
  const isPdf = extension === "pdf";
  // A safe, recognisable filename — she should not be handed a UUID.
  const fileName = `${data.title.replace(/[^\w\s.-]/g, "").trim() || "document"}${extension ? `.${extension}` : ""}`;

  const [{ data: signed }, { data: signedDownload }] = await Promise.all([
    supabase.storage.from("health-documents").createSignedUrl(data.storage_path, 60 * 10),
    // download: sets Content-Disposition, which is the only thing that makes a
    // cross-origin link actually save. The HTML download attribute is ignored
    // across origins, and this URL is on the Supabase host.
    supabase.storage
      .from("health-documents")
      .createSignedUrl(data.storage_path, 60 * 10, { download: fileName }),
  ]);

  return {
    id: data.id,
    title: data.title,
    docDate: data.doc_date,
    docType: data.doc_type,
    storagePath: data.storage_path,
    createdBy: data.created_by,
    notes: data.notes,
    createdAt: data.created_at,
    signedUrl: signed?.signedUrl ?? null,
    downloadUrl: signedDownload?.signedUrl ?? null,
    fileName,
    isImage: !isPdf,
    isPdf,
  };
}

/**
 * The readings actually recorded on one day — never a fallback to another.
 *
 * getHealthOverview answers "what is her latest", which is the right question
 * for Health and the wrong one for a screen showing a chosen date: a blood
 * pressure from June must not appear under Saturday the 2nd as though it were
 * taken then. A day with no reading returns null for that type, and the screen
 * says so.
 *
 * Bounded to her timezone, not the server's. The date column on a measurement
 * is a timestamp, so the window is built in +05:30 rather than sliced off an
 * ISO string, which would file anything before half past five in the morning
 * under the previous day.
 */
export async function getMeasurementsOn(
  accountId: string,
  date: string,
): Promise<Record<Enums<"measurement_type">, LatestMeasurement | null>> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("health_measurements")
    .select("type, value, value_secondary, unit, measured_at")
    .eq("account_id", accountId)
    .gte("measured_at", `${date}T00:00:00+05:30`)
    .lte("measured_at", `${date}T23:59:59.999+05:30`)
    .order("measured_at", { ascending: false });

  const on: Record<Enums<"measurement_type">, LatestMeasurement | null> = {
    blood_sugar: null,
    blood_pressure: null,
    weight: null,
  };
  // Newest first, so the first of each type is that day's most recent.
  for (const row of data ?? []) {
    if (on[row.type]) continue;
    on[row.type] = {
      type: row.type,
      value: Number(row.value),
      valueSecondary: row.value_secondary == null ? null : Number(row.value_secondary),
      unit: row.unit,
      measuredAt: row.measured_at,
    };
  }
  return on;
}

/**
 * Just the documents.
 *
 * getHealthOverview answers three questions at once, which is right for the
 * Health screen where all three are on the page. Family View needs only this
 * one — it reads its medicines and its measurements for a chosen day through
 * their own queries — and calling the overview there re-fetched medications
 * and health_measurements it already had, twice per render and again on every
 * date change.
 */
export async function getDocuments(accountId: string): Promise<DocumentSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("health_documents")
    .select("id, title, doc_date, created_at")
    .eq("account_id", accountId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((d) => ({
    id: d.id,
    title: d.title,
    at: d.doc_date ?? d.created_at,
  }));
}
