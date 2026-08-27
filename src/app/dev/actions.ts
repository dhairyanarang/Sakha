"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOwnedAccount } from "@/lib/account";

/**
 * Wipes the signed-in user's own account so onboarding starts from the top.
 *
 * Preview-only. Deletes the account row, which cascades to contacts,
 * medicines, logs and check-ins — the auth user is left alone so there's no
 * need to sign in again.
 */
export async function restartOnboarding() {
  if (process.env.NEXT_PUBLIC_DEV_TOOLS !== "1") return;

  const owned = await getOwnedAccount();
  if (owned) {
    const supabase = await createClient();
    await supabase.from("accounts").delete().eq("id", owned.accountId);
  }
  redirect("/onboarding/name");
}
