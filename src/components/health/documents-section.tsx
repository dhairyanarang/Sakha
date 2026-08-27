"use client";

import { useState } from "react";
import { EmptyState, Toast } from "@/components/ui";
import { DocumentRow } from "./document-row";
import { AddTile } from "./add-tile";
import { AddDocumentSheet } from "./add-document-sheet";
import { relativeWhen } from "@/lib/today";
import type { DocumentSummary } from "@/lib/health-data";

/**
 * The Documents section of the Health screen.
 *
 * Adding is a sheet over this screen rather than a pushed route, matching how
 * Add Medicine works — there is no designed Add Document frame, so following
 * the pattern that does exist beats inventing a second one.
 *
 * Every document is listed rather than a recent few. Figma shows no way to
 * reach a fuller list — no chevron on this heading, no Documents screen in the
 * file — so truncating here would put documents somewhere she cannot get to.
 */
export function DocumentsSection({ documents }: { documents: DocumentSummary[] }) {
  const [adding, setAdding] = useState(false);
  // Remount on each open, so a second document never opens on the first one's
  // title, date and type.
  const [openCount, setOpenCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <section className="flex shrink-0 flex-col gap-2.5">
      <h2 className="text-subsection-heading text-action-primary uppercase tracking-[0.04em]">
        Documents
      </h2>

      {documents.length === 0 ? (
        <EmptyState
          message="You have no uploaded documents."
          illustration={
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="/empty/documents.webp"
              alt=""
              aria-hidden
              className="h-[104px] w-[148px] object-contain"
            />
          }
        />
      ) : (
        documents.map((d) => (
          <DocumentRow
            key={d.id}
            href={`/health/documents/${d.id}`}
            title={d.title}
            when={relativeWhen(d.at)}
          />
        ))
      )}

      <AddTile onClick={() => { setOpenCount((n) => n + 1); setAdding(true); }}>+ Add Document</AddTile>

      <AddDocumentSheet
        key={openCount}
        open={adding}
        onClose={() => setAdding(false)}
        onSaved={setToast}
      />
      <Toast message={toast ?? ""} open={toast !== null} onDone={() => setToast(null)} />
    </section>
  );
}
