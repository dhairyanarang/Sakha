import { requireUser } from "../guard";
import { getOwnedAccount } from "@/lib/account";
import { createClient } from "@/lib/supabase/server";
import { FamilyForm } from "./family-form";

export default async function FamilyPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  await requireUser();
  const { added } = await searchParams;

  // Anyone already added is shown back, so returning to this step doesn't look
  // like the entry vanished — the form itself is for adding the NEXT person.
  const owned = await getOwnedAccount();
  let existing: { id: string; name: string; relation: string | null }[] = [];
  if (owned) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("trusted_contacts")
      .select("id, name, relation")
      .eq("account_id", owned.accountId)
      .order("created_at");
    existing = data ?? [];
  }

  return <FamilyForm justAdded={added === "1"} existing={existing} />;
}
