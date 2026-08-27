"use client";

import { useState } from "react";
import { Pill } from "lucide-react";
import { EmptyState, IconCircle, Toast } from "@/components/ui";
import { MedicineRow } from "./medicine-row";
import { MedicineSheet } from "./medicine-sheet";
import type { MedicineDetail, MedicineGroup } from "@/lib/health-data";

/**
 * The Medicines list and its Add/Edit sheet.
 *
 * Add and Edit are sheets over this screen rather than pushed routes, which is
 * how Figma draws them — the list stays visible behind the scrim.
 *
 * The sheet is keyed by what it is editing so that switching from one medicine
 * to another, or from editing to adding, rebuilds it with the right values.
 * Without the key it would keep the first medicine's state and quietly save
 * the wrong thing.
 */
export function MedicinesList({ groups }: { groups: MedicineGroup[] }) {
  const [editing, setEditing] = useState<MedicineDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function add() {
    setEditing(null);
    setOpen(true);
  }

  function edit(medicine: MedicineDetail) {
    setEditing(medicine);
    setOpen(true);
  }

  return (
    <>
      <main className="flex flex-1 flex-col gap-6 p-4">
        {groups.length === 0 ? (
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
              className="flex shrink-0 flex-col gap-2.5"
            >
              <h2 className="text-subsection-heading text-action-primary uppercase tracking-[0.04em]">
                {/* She never chose a condition for these, so the heading must
                    not invent one for her. */}
                {group.conditionTag ?? "Other"}
              </h2>
              {group.medicines.map((m) => (
                <MedicineRow key={m.id} medicine={m} onEdit={() => edit(m)} />
              ))}
            </section>
          ))
        )}
      </main>

      <footer
        className="bg-surface-page sticky bottom-0 z-30 shrink-0 px-4 pt-4"
        style={{ paddingBottom: "var(--spacing-7)" }}
      >
        <button
          type="button"
          onClick={add}
          className="bg-action-primary text-text-on-brand text-button-label active:bg-action-primary-pressed flex h-[60px] w-full items-center justify-center rounded-xl transition-colors"
        >
          Add Medicine
        </button>
      </footer>

      <MedicineSheet
        key={editing?.id ?? "new"}
        open={open}
        onClose={() => setOpen(false)}
        onSaved={setToast}
        medicine={editing}
      />

      <Toast message={toast ?? ""} open={toast !== null} onDone={() => setToast(null)} />
    </>
  );
}
