import type { Enums } from "@/lib/supabase/types";

/**
 * The normal ranges, as numbers, in one place.
 *
 * These were previously only ever a sentence: "70-140 mg/dL" lived in the
 * dictionary, once per language, and nothing else knew them. That is fine
 * while the only job is printing them and impossible as soon as the chart has
 * to draw them — two copies of a health statement drift, and a graph whose
 * green band disagrees with the badge above it is worse than no band at all.
 *
 * So the numbers live here and the words are still written per language, with
 * these values passed in. Nothing is paraphrased or generated: the sentence
 * structure is still authored in the dictionary, in the language it belongs to.
 *
 * The values are exactly the ones the product already stated. Nothing was
 * invented and nothing came from outside the codebase — see the dictionary
 * entries these replaced.
 *
 * WEIGHT HAS NO RANGE, deliberately. None was ever written for it, a healthy
 * weight is not a number this product is in a position to assert, and its
 * absence must stay an absence rather than becoming a guess.
 */
export type Band = {
  /** Which series this band belongs to, for a chart with more than one. */
  series: number;
  min: number;
  max: number;
};

export const NORMAL_RANGES: Record<Enums<"measurement_type">, Band[]> = {
  // "70-140 mg/dL"
  blood_sugar: [{ series: 0, min: 70, max: 140 }],
  // "90–120 systolic, 60–80 diastolic" — series 0 is systolic, 1 is diastolic,
  // matching the order MeasurementDetail builds them in.
  blood_pressure: [
    { series: 0, min: 90, max: 120 },
    { series: 1, min: 60, max: 80 },
  ],
  weight: [],
};

export const SUGAR = NORMAL_RANGES.blood_sugar[0];
export const BP_SYSTOLIC = NORMAL_RANGES.blood_pressure[0];
export const BP_DIASTOLIC = NORMAL_RANGES.blood_pressure[1];
