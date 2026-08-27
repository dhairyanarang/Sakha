import { notFound } from "next/navigation";
import { Calendar, ExternalLink, FileText } from "lucide-react";
import { requireAccount } from "@/lib/account";
import { getDocument } from "@/lib/health-data";
import { relativeWhen } from "@/lib/today";
import { ScreenHeader } from "@/components/screen-header";
import { FixedBar, IconCircle } from "@/components/ui";

/**
 * One stored document.
 *
 * DESIGNED IN CODE. Figma has no frame for viewing a document, and the user
 * asked for Documents to be built from the existing system. Everything here is
 * an existing part — the screen header, a card, an Icon Circle, the same
 * metadata treatment the measurement screens use.
 *
 * A photo is shown directly, because that is what most of these will be and
 * making her tap through to see a prescription she just photographed would be
 * pointless. A PDF cannot be shown inline reliably on a phone, so it gets an
 * honest button that hands it to whatever already opens PDFs on her device —
 * "one tap, no new patterns to learn".
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
    <div data-surface="page" className="bg-surface-page flex flex-1 flex-col">
      <ScreenHeader backHref="/health" title={doc.title} />

      <main className="flex flex-1 flex-col gap-6 p-4">
        <section className="bg-surface-default border-border-soft flex flex-col gap-4 rounded-xl border-[0.5px] p-3">
          <div className="flex items-center gap-3">
            <IconCircle tone="brand">
              <FileText size={22} className="text-action-primary" aria-hidden />
            </IconCircle>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="text-body-medium text-text-primary">{doc.title}</p>
              <span className="flex items-center gap-1">
                <Calendar size={16} className="text-text-tertiary shrink-0" aria-hidden />
                {/* rgba(0,0,0,0.4) over surface/default, as a solid. */}
                <span className="text-[14px] leading-[1.2] text-[#999999]">
                  {relativeWhen(when)}
                </span>
              </span>
            </div>
          </div>

          {doc.docType ? (
            <span className="bg-surface-tinted text-action-primary self-start rounded-full px-4 py-2 text-[14px] leading-[1.2]">
              {doc.docType}
            </span>
          ) : null}

          {doc.notes ? (
            <p className="text-body-secondary text-text-secondary whitespace-pre-line">
              {doc.notes}
            </p>
          ) : null}
        </section>

        {doc.signedUrl ? (
          doc.isImage ? (
            <div className="border-border-soft overflow-hidden rounded-xl border-[0.5px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.signedUrl}
                alt={doc.title}
                className="block h-auto w-full object-contain"
              />
            </div>
          ) : null
        ) : (
          <p className="text-body-secondary text-text-secondary">
            We couldn&apos;t load this document right now. Please try again.
          </p>
        )}
      </main>

      {doc.signedUrl ? (
        <FixedBar reserve={120}>
        <footer
          className="bg-surface-page px-4 pt-4"
          style={{ paddingBottom: "var(--spacing-7)" }}
        >
          <a
            href={doc.signedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-action-primary text-text-on-brand text-button-label active:bg-action-primary-pressed flex h-[60px] w-full items-center justify-center gap-3 rounded-xl transition-colors"
          >
            <ExternalLink size={22} aria-hidden />
            Open document
          </a>
        </footer>
        </FixedBar>
      ) : null}
    </div>
  );
}
