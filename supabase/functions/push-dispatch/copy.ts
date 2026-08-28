/**
 * Notification copy, in both languages.
 *
 * Deliberately a small, separate copy of the wording rather than an import
 * from the app's dictionary: this runs in Deno on Supabase's edge, the app's
 * dictionary is a Next.js module, and wiring a build step between them to
 * share fourteen strings would cost more than it saves. If a line changes
 * here, change it in src/lib/i18n too — there is no other coupling.
 *
 * The same rules as the rest of the product apply. Nothing says "missed" or
 * "late". Numbers and units stay Latin, because they are printed that way on
 * her meter. A name is hers and is never translated.
 */
export type Lang = "en" | "hi";

const SLOT: Record<Lang, Record<string, string>> = {
  en: { morning: "morning", afternoon: "afternoon", evening: "evening" },
  hi: { morning: "सुबह", afternoon: "दोपहर", evening: "शाम" },
};

export type Payload = {
  kind: string;
  lang: Lang;
  actorName: string | null;
  slot: string | null;
  measurementType: string | null;
  bodyValue: string | null;
  medicineNames: string | null;
};

export function render(p: Payload): { title: string; body: string } {
  const L = p.lang;
  const who = p.actorName ?? (L === "hi" ? "उन्होंने" : "They");
  const slot = p.slot ? SLOT[L][p.slot] : "";

  switch (p.kind) {
    case "medicine_reminder":
      return L === "hi"
        ? { title: `${slot} की दवा का समय हो गया`, body: p.medicineNames ?? "" }
        : { title: `Time for your ${slot} medicine`, body: p.medicineNames ?? "" };

    case "medicine_confirmed":
      return L === "hi"
        ? { title: `${who} ने ${slot} की दवा ले ली।`, body: p.medicineNames ?? "" }
        : { title: `${who} took the ${slot} medicine.`, body: p.medicineNames ?? "" };

    case "measurement": {
      const what = measurementName(L, p.measurementType);
      return L === "hi"
        ? { title: `${who} ने ${what} दर्ज किया।`, body: p.bodyValue ?? "" }
        : { title: `${who} recorded a ${what} reading.`, body: p.bodyValue ?? "" };
    }

    case "document":
      return L === "hi"
        ? { title: `${who} ने एक नया डॉक्यूमेंट जोड़ा।`, body: "" }
        : { title: `${who} uploaded a new health document.`, body: "" };

    default:
      return { title: "Sakha", body: "" };
  }
}

function measurementName(lang: Lang, type: string | null): string {
  const en: Record<string, string> = {
    blood_sugar: "blood sugar",
    blood_pressure: "blood pressure",
    weight: "weight",
  };
  const hi: Record<string, string> = {
    blood_sugar: "ब्लड शुगर",
    blood_pressure: "ब्लड प्रेशर",
    weight: "वज़न",
  };
  return (lang === "hi" ? hi : en)[type ?? ""] ?? "";
}

/**
 * Where tapping it should land.
 *
 * Every path is routed through /n/<account>, which re-checks membership and
 * switches the reader to the right account before going on — a family member
 * may be looking at their own Sakha when the notification arrives.
 */
export function deepLink(accountId: string, kind: string, measurementType: string | null): string {
  const to =
    kind === "measurement"
      ? measurementType === "blood_pressure"
        ? "/health/measurements/blood-pressure"
        : measurementType === "weight"
          ? "/health/measurements/weight"
          : "/health/measurements/blood-sugar"
      : kind === "document"
        ? "/health"
        : "/";
  return `/n/${accountId}?to=${encodeURIComponent(to)}`;
}
