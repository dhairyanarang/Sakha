import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Onboarding past the sign-in screen requires a signed-in user. */
export async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/sign-in");
  return data.user;
}
