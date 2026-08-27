"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { ScreenHeader } from "@/components/screen-header";
import { Button, FixedBar } from "@/components/ui";
import { PdfPreview } from "./pdf-preview";
import { deleteDocument } from "@/app/health/actions";
import { relativeWhen } from "@/lib/today";
import type { StoredDocument } from "@/lib/health-data";

/**
 * One stored document, with the document itself leading.
 *
 * The preview shows the FIRST PAGE ONLY, fitted to the width available. This
 * screen is for recognising the document, not reading it end to end — Open
 * hands the whole thing to the viewer her phone already has, which pages
 * properly. The page count sits on the preview so a multi-page document says
 * so rather than pretending to be one sheet.
 *
 * Delete sits in the header, where Edit Medicine puts it: away from Open and
 * Download so it cannot be hit while reaching for them, and confirmed in place
 * rather than behind a dialog stacked on the screen.
 */
export function DocumentView({ doc }: { doc: StoredDocument }) {
  const router = useRouter();
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Stable, or PdfPreview would re-render the page on every parent update.
  const handlePageCount = useCallback((n: number) => setPageCount(n), []);

  const when = doc.docDate ?? doc.createdAt;

  function remove() {
    setError(null);
    startTransition(async () => {
      const err = await deleteDocument(doc.id);
      if (err) setError(err);
      else router.push("/health");
    });
  }

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <ScreenHeader
        backHref="/health"
        title={doc.title}
        action={
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            disabled={pending}
            className="text-feedback-error -mr-2 flex h-[42px] items-center px-2 text-[16px] leading-[1.2] font-medium"
          >
            Delete
          </button>
        }
      />

      <main className="flex flex-1 flex-col gap-4 p-4">
        {confirmingDelete ? (
          <section className="bg-feedback-error-surface flex flex-col gap-4 rounded-md p-4">
            <div className="flex flex-col gap-1">
              <p className="text-body-medium text-text-primary">Remove this document?</p>
              <p className="text-body-secondary text-text-secondary">
                It will be deleted from your documents. This cannot be undone.
              </p>
            </div>
            <div className="flex items-start gap-3">
              {/* The safe answer first. */}
              <Button
                variant="tertiary"
                onClick={() => setConfirmingDelete(false)}
                disabled={pending}
                className="flex-1"
              >
                Keep it
              </Button>
              {/* Not a Button variant: the library has no destructive style,
                  and this matches Edit Medicine rather than inventing one. */}
              <button
                type="button"
                onClick={remove}
                disabled={pending}
                className="bg-feedback-error text-text-on-brand text-button-label flex h-[60px] flex-1 items-center justify-center rounded-xl transition-colors disabled:opacity-60"
              >
                {pending ? "Removing…" : "Remove"}
              </button>
            </div>
            {error ? (
              <p role="alert" className="text-body-secondary text-feedback-error">
                {error}
              </p>
            ) : null}
          </section>
        ) : null}

        {doc.signedUrl ? (
          <section className="bg-surface-default border-border-soft relative overflow-hidden rounded-xl border-[0.5px]">
            {pageCount && pageCount > 1 ? (
              <span className="bg-surface-default/90 text-text-secondary absolute top-3 right-3 z-10 rounded-full px-3 py-1.5 text-[14px] leading-[1.2]">
                Page 1 of {pageCount}
              </span>
            ) : null}

            {doc.isImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={doc.signedUrl}
                alt={doc.title}
                className="block h-auto w-full object-contain"
              />
            ) : (
              <PdfPreview url={doc.signedUrl} onPageCount={handlePageCount} />
            )}
          </section>
        ) : (
          <section className="bg-surface-default border-border-soft rounded-xl border-[0.5px] p-4">
            <p className="text-body-secondary text-text-secondary">
              We couldn&apos;t load this document right now. Please try again.
            </p>
          </section>
        )}

        {/* The details it arrived with, under the thing itself. */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <Calendar size={16} className="text-text-tertiary shrink-0" aria-hidden />
              {/* rgba(0,0,0,0.4) over surface/page, resolved to a solid value. */}
              <span className="text-[14px] leading-[1.2] text-[#999999]">
                {relativeWhen(when)}
              </span>
            </span>
            {doc.docType ? (
              <span className="bg-surface-tinted text-action-primary rounded-full px-4 py-2 text-[14px] leading-[1.2]">
                {doc.docType}
              </span>
            ) : null}
          </div>

          {doc.notes ? (
            <p className="text-body-secondary text-text-secondary whitespace-pre-line">
              {doc.notes}
            </p>
          ) : null}
        </section>
      </main>

      {doc.downloadUrl ? (
        <FixedBar reserve={120}>
          <footer
            className="bg-surface-page flex items-start gap-3 px-4 pt-4"
            style={{ paddingBottom: "var(--spacing-7)" }}
          >
            {/* Reading it properly is the phone's job, not this screen's. */}
            {doc.isPdf && doc.signedUrl ? (
              <a
                href={doc.signedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-surface-default border-action-primary text-action-primary text-button-label active:bg-surface-tinted flex h-[60px] flex-1 items-center justify-center gap-2 rounded-xl border transition-colors"
              >
                <ExternalLink size={22} aria-hidden />
                Open
              </a>
            ) : null}
            <a
              href={doc.downloadUrl}
              className="bg-action-primary text-text-on-brand text-button-label active:bg-action-primary-pressed flex h-[60px] flex-1 items-center justify-center gap-2 rounded-xl transition-colors"
            >
              <Download size={22} aria-hidden />
              Download
            </a>
          </footer>
        </FixedBar>
      ) : null}
    </div>
  );
}
