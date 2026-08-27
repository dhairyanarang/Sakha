import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/account";
import { getMedicines } from "@/lib/health-data";
import { MedicinesHeader } from "@/components/health/medicines-header";
import { MedicinesList } from "@/components/health/medicines-list";

/**
 * Medicines — everything she takes, grouped by what it is for.
 *
 * Add and Edit are sheets over this screen rather than routes of their own,
 * because that is how both are drawn. The list holds the sheet state, so this
 * stays a server component that only fetches.
 */
export default async function MedicinesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/welcome");

  const account = await getActiveAccount();
  if (!account) redirect("/onboarding/name");

  const groups = await getMedicines(account.accountId);

  return (
    <div className="bg-surface-page flex min-h-0 flex-1 flex-col overflow-hidden">
      <MedicinesHeader />
      <MedicinesList groups={groups} />
    </div>
  );
}
