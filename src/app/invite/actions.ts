"use server";

import { createHash } from "node:crypto";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { setActiveAccount } from "@/lib/account";

/**
 * Claims an invitation for the signed-in person.
 *
 * The raw token from the link never leaves this function — it is hashed here
 * and only the hash is sent on, so the database is asked "does this hash match
 * a live invitation" rather than being handed anything reusable.
 *
 * The account it grants becomes the active one, so he lands on her Home rather
 * than an empty account of his own.
 */
export async function acceptInvitation(token: string): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "Please sign in first.";

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { data, error } = await supabase.rpc("accept_invitation", {
    p_token_hash: tokenHash,
  });

  if (error) return "We couldn't open this invitation. Please try again.";
  if (!data) return "This invitation is no longer valid.";

  await setActiveAccount(data);
  redirect("/");
}
