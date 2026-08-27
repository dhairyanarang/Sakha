import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/account";
import { BottomNav } from "@/components/ui";

/**
 * Entry point. Routes to the right place rather than rendering a landing page:
 * signed out goes to Welcome, signed in without an account resumes onboarding,
 * and everyone else lands on Home.
 *
 * Home itself is Phase 4 — the placeholder below is scaffolding.
 */
export default async function RootPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/welcome");

  const account = await getActiveAccount();
  if (!account) redirect("/onboarding/name");

  return (
    <div className="bg-surface-page flex min-h-dvh flex-col">
      <main className="flex flex-1 flex-col gap-2 px-4 pt-6">
        <h1 className="text-screen-title text-text-primary">
          Good Morning, {account.displayName}
        </h1>
        <p className="text-body-secondary text-text-secondary">
          Home is being built in Phase 4.
        </p>
        <form action="/auth/signout" method="post" className="mt-6">
          <button type="submit" className="text-body-medium text-action-primary">
            Sign out
          </button>
        </form>
      </main>
      <BottomNav active="home" />
    </div>
  );
}
