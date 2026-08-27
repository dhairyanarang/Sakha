"use client";

import { useState } from "react";
import { EmptyState, FixedBar, Toast } from "@/components/ui";
import { MedicineRow } from "./medicine-row";
import { MedicineSheet } from "./medicine-sheet";
import type { MedicineDetail, MedicineGroup } from "@/lib/health-data";

/**
 * The Medicines list and its Add/Edit sheet.
 *
 * Add and Edit are sheets over this screen rather than pushed routes, which is
 * how Figma draws them — the list stays visible behind the scrim.
 *
 * The sheet is keyed by what it is editing AND by how many times it has been
 * opened. The id alone was not enough: adding a medicine leaves that key at
 * "new", so opening Add again reused the component and showed the medicine she
 * had just saved. The counter forces a fresh mount every time, so Add always
 * starts empty while Edit still fills itself in from the medicine.
 */
export function MedicinesList({
  groups,
  canEdit = true,
}: {
  groups: MedicineGroup[];
  canEdit?: boolean;
}) {
  const [editing, setEditing] = useState<MedicineDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  function add() {
    setEditing(null);
    setOpenCount((n) => n + 1);
    setOpen(true);
  }

  function edit(medicine: MedicineDetail) {
    setEditing(medicine);
    setOpenCount((n) => n + 1);
    setOpen(true);
  }

  return (
    <>
      <main className="flex flex-1 flex-col gap-6 p-4">
        {groups.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center">
            <EmptyState
              tone="brand"
              message="You have no medicines."
              illustration={
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/empty/medicines.webp"
                  alt=""
                  aria-hidden
                  className="h-[150px] w-[214px] object-contain"
                />
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
                <MedicineRow key={m.id} medicine={m} onEdit={canEdit ? () => edit(m) : null} />
              ))}
            </section>
          ))
        )}
      </main>

      {canEdit ? (
      <FixedBar reserve={120}>
      <footer
        className="bg-surface-page px-4 pt-4"
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
      </FixedBar>
      ) : null}

      <MedicineSheet
        key={`${editing?.id ?? "new"}-${openCount}`}
        open={open}
        onClose={() => setOpen(false)}
        onSaved={setToast}
        medicine={editing}
      />

      <Toast message={toast ?? ""} open={toast !== null} onDone={() => setToast(null)} />
    </>
  );
}
