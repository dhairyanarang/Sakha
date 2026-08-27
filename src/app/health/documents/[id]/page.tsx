import { notFound } from "next/navigation";
import { Calendar, Download, ExternalLink } from "lucide-react";
import { requireAccount } from "@/lib/account";
import { getDocument } from "@/lib/health-data";
import { relativeWhen } from "@/lib/today";
import { ScreenHeader } from "@/components/screen-header";
import { FixedBar } from "@/components/ui";

/**
 * One stored document.
 *
 * DESIGNED IN CODE — Figma has no frame for this. The document itself leads:
 * it is the reason she opened the screen, so it gets the top of the page and
 * the full width, and the details it came with sit underneath rather than in
 * front of it.
 *
 * A photo — which most of these will be, since she photographs prescriptions —
 * renders directly at its natural proportions. Pinch-zoom is never disabled in
 * this app, so reading small print needs no control of ours.
 *
 * A PDF is handed to the browser's own viewer in an iframe, which is what gives
 * page-by-page scrolling without shipping a PDF engine to her phone. iOS Safari
 * is unreliable at paging inside an iframe, so PDFs also get Open, which hands
 * the file to the full-screen viewer that pages properly. FLAGGED: making
 * in-page paging identical on iOS would mean bundling pdf.js, a real weight to
 * put on a phone for a file the OS already opens well.
 */
export default async function DocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { account } = await requireAccount();

  const doc = await getDocument(account.accountId, id);
  if (!doc) notFound();

  const when = doc.docDate ?? doc.createdAt;

  return (
    <div className="bg-surface-page flex flex-1 flex-col">
      <ScreenHeader backHref="/health" title={doc.title} />

      <main className="flex flex-1 flex-col gap-4 p-4">
        {doc.signedUrl ? (
          <section className="bg-surface-default border-border-soft overflow-hidden rounded-xl border-[0.5px]">
            {doc.isImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={doc.signedUrl}
                alt={doc.title}
                className="block h-auto w-full object-contain"
              />
            ) : (
              <iframe
                src={doc.signedUrl}
                title={doc.title}
                /* Tall enough that a page of A4 reads as a page rather than a
                   letterbox, and it scrolls within itself. */
                className="block h-[70vh] w-full border-0"
              />
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
            {/* PDFs only: iOS pages them properly in the full-screen viewer,
                which an iframe cannot be relied on to do. */}
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
