import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/account";
import { BottomNav, EmptyState } from "@/components/ui";

/**
 * Placeholder so the Health tab has somewhere to land. Medicines,
 * Measurements and Documents arrive in Phase 5.
 */
export default async function HealthPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/welcome");
  if (!(await getActiveAccount())) redirect("/onboarding/name");

  return (
    <div className="bg-surface-tinted flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 px-4 pb-4" style={{ paddingTop: "var(--spacing-3)" }}>
        <h1 className="text-screen-title text-text-primary">Health</h1>
      </header>
      <main className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-contain px-4 pb-4">
        <EmptyState message="Your medicines, measurements and documents will live here." />
      </main>
      <BottomNav active="health" className="shrink-0" />
    </div>
  );
}
