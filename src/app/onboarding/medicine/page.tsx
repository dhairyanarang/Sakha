import { requireUser } from "../guard";
import { getOwnedAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { MedicineForm } from "./medicine-form";

export default async function MedicinePage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  await requireUser();
  const { added } = await searchParams;

  const owned = await getOwnedAccount();
  let existing: { id: string; name: string; times_of_day: string[] }[] = [];
  if (owned) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("medications")
      .select("id, name, times_of_day")
      .eq("account_id", owned.accountId)
      .is("archived_at", null)
      .order("created_at");
    existing = data ?? [];
  }

  return <MedicineForm justAdded={added === "1"} existing={existing} />;
}
