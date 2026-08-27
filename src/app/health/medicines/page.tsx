import { requireAccount } from "@/lib/account";
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
  const { account, canEdit } = await requireAccount();

  const groups = await getMedicines(account.accountId);

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <MedicinesHeader />
      <MedicinesList groups={groups} canEdit={canEdit} />
    </div>
  );
}
