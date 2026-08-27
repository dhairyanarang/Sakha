import { requireAccount } from "@/lib/account";
import { BottomNav, EmptyState } from "@/components/ui";

/**
 * Placeholder so the Library tab has somewhere to land. Curated wellness
 * content is P1 and may launch with little or nothing in it.
 */
export default async function LibraryPage() {
  await requireAccount();

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <header className="shrink-0 px-4 pb-4" style={{ paddingTop: "var(--spacing-3)" }}>
        <h1 className="text-screen-title text-text-primary">Library</h1>
      </header>
      <main className="flex flex-1 flex-col justify-center px-4 pb-4">
        <EmptyState message="Gentle exercises and guidance will appear here." />
      </main>
      <BottomNav active="library" className="shrink-0" />
    </div>
  );
}
