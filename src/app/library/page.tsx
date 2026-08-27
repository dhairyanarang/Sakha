import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/account";
import { BottomNav, EmptyState } from "@/components/ui";

/**
 * Placeholder so the Library tab has somewhere to land. Curated wellness
 * content is P1 and may launch with little or nothing in it.
 */
export default async function LibraryPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/welcome");
  if (!(await getActiveAccount())) redirect("/onboarding/name");

  return (
    <div className="bg-surface-tinted flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 px-4 pb-4" style={{ paddingTop: "var(--spacing-3)" }}>
        <h1 className="text-screen-title text-text-primary">Library</h1>
      </header>
      <main className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto overscroll-contain px-4 pb-4">
        <EmptyState message="Gentle exercises and guidance will appear here." />
      </main>
      <BottomNav active="library" className="shrink-0" />
    </div>
  );
}
