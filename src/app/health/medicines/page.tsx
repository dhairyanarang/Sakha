import Link from "next/link";
import { redirect } from "next/navigation";
import { Pill } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getActiveAccount } from "@/lib/account";
import { getMedicines } from "@/lib/health-data";
import { EmptyState, IconCircle } from "@/components/ui";
import { MedicinesHeader } from "@/components/health/medicines-header";
import { MedicineRow } from "@/components/health/medicine-row";

/**
 * Medicines — everything she takes, grouped by what it is for.
 *
 * Add Medicine is pinned to the bottom rather than sitting at the end of the
 * list, so it stays reachable however long the list gets. Same treatment as
 * the onboarding footers.
 */
export default async function MedicinesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/welcome");

  const account = await getActiveAccount();
  if (!account) redirect("/onboarding/name");

  const groups = await getMedicines(account.accountId);
  const isEmpty = groups.length === 0;

  return (
    <div className="bg-surface-page flex min-h-0 flex-1 flex-col overflow-hidden">
      <MedicinesHeader />

      <main className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 pt-4 pb-4">
        {isEmpty ? (
          <div className="flex flex-1 flex-col justify-center">
            <EmptyState
              message="You have no medicines yet."
              illustration={
                <IconCircle tone="brand" className="size-[88px]">
                  <Pill size={36} className="text-action-primary" aria-hidden />
                </IconCircle>
              }
            />
          </div>
        ) : (
          groups.map((group) => (
            <section
              key={group.conditionTag ?? "__untagged"}
              className="flex flex-col gap-2.5"
            >
              <h2 className="text-subsection-heading text-action-primary uppercase tracking-[0.04em]">
                {/* Untagged medicines still need a heading — she never chose a
                    condition for these, so the heading must not invent one. */}
                {group.conditionTag ?? "Other"}
              </h2>
              {group.medicines.map((m) => (
                <MedicineRow key={m.id} medicine={m} />
              ))}
            </section>
          ))
        )}
      </main>

      <footer
        className="bg-surface-page shrink-0 px-4 pt-4"
        style={{ paddingBottom: "var(--spacing-7)" }}
      >
        <Link
          href="/health/medicines/new"
          className="bg-action-primary text-text-on-brand text-button-label active:bg-action-primary-pressed flex h-[60px] w-full items-center justify-center rounded-xl transition-colors"
        >
          Add Medicine
        </Link>
      </footer>
    </div>
  );
}
