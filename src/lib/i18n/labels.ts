import type { Messages } from ".";

/**
 * Values that are OURS wearing her data's clothing.
 *
 * A condition tag, a document type and a relation are all stored as plain text
 * on the row. Most of the time that text came from a chip we wrote in English
 * — "Sugar", "Lab Report", "Son" — but she can also type her own, and a custom
 * tag is genuinely her words.
 *
 * So the rule is: translate what we put there, and pass through untouched
 * anything we did not. "Sugar" becomes शुगर because that string is our
 * vocabulary; "ghutne ka dard" stays exactly as she typed it, in either
 * language. Matching is case-insensitive and trimmed, because the stored value
 * has been round-tripping through a text input.
 *
 * Nothing here ever writes — the database keeps the English canonical value,
 * so switching language never rewrites a single row.
 */
function lookup(
  value: string | null | undefined,
  table: Record<string, string>,
  fallback: string,
): string {
  if (!value) return fallback;
  const hit = table[value.trim().toLowerCase()];
  return hit ?? value;
}

/** "Sugar" → शुगर; "knee pain" → "knee pain". */
export function conditionLabel(tag: string | null | undefined, t: Messages): string {
  return lookup(
    tag,
    {
      sugar: t.medicines.conditions.sugar,
      bp: t.medicines.conditions.bp,
      acidity: t.medicines.conditions.acidity,
      thyroid: t.medicines.conditions.thyroid,
      asthma: t.medicines.conditions.asthma,
      other: t.medicines.conditions.other,
    },
    // No tag at all: she never chose one, so the heading must not invent one.
    t.medicines.conditions.other,
  );
}

/** "Lab Report" → लैब रिपोर्ट; anything else is left alone. */
export function documentTypeLabel(type: string | null | undefined, t: Messages): string {
  return lookup(
    type,
    {
      prescription: t.documents.types.prescription,
      "lab report": t.documents.types.labReport,
      scan: t.documents.types.scan,
      bill: t.documents.types.bill,
      other: t.documents.types.other,
    },
    "",
  );
}

/** "Son" → बेटा; "Sister" (typed by her) → "Sister". */
export function relationLabel(relation: string | null | undefined, t: Messages): string {
  return lookup(
    relation,
    {
      son: t.invitations.relations.son,
      daughter: t.invitations.relations.daughter,
      spouse: t.invitations.relations.spouse,
      other: t.invitations.relations.other,
    },
    t.invitations.familyFallback,
  );
}
