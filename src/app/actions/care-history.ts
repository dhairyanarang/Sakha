"use server";

import { getCareMonth, type CareDay } from "@/lib/care-history";
import { getViewer } from "@/lib/account";

/**
 * One month of care history, for the calendar sheet.
 *
 * The account id arrives from the client, so it is checked here rather than
 * trusted: the caller must actually be a member of it. RLS would refuse the
 * rows anyway — every table this reads is gated on
 * private.is_account_member — but an endpoint that leans on that alone tells
 * an attacker "wrong account" by returning an empty month instead of nothing.
 * Two locks on the same door, which is how the rest of this app is written.
 */
export async function loadCareMonth(
  accountId: string,
  year: number,
  month: number,
): Promise<CareDay[]> {
  const { memberships } = await getViewer();
  if (!memberships.some((m) => m.accountId === accountId)) return [];

  // A month outside anything the app could have recorded is a malformed
  // request, not a query worth running.
  if (!Number.isInteger(year) || !Number.isInteger(month)) return [];
  if (year < 2020 || year > 2100 || month < 1 || month > 12) return [];

  return getCareMonth(accountId, year, month);
}
