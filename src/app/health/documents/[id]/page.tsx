import { notFound } from "next/navigation";
import { getViewer, requireAccount } from "@/lib/account";
import { getDocument } from "@/lib/health-data";
import { DocumentView } from "@/components/health/document-view";
import { safeReturnTo } from "@/lib/return-to";

/**
 * One stored document.
 *
 * DESIGNED IN CODE — Figma has no frame for this. The screen itself lives in
 * DocumentView, which needs client state for the PDF's page count and the
 * delete confirmation; this stays a server component that only fetches.
 */
export default async function DocumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  // Back — and the redirect after a delete — go where you came from. Family
  // View has no Health tab to return to.
  const backHref = safeReturnTo((await searchParams).from, "/health");
  const { account, canEdit, isFamily } = await requireAccount();
  const { user } = await getViewer();

  const doc = await getDocument(account.accountId, id);
  if (!doc) notFound();

  return (
    <DocumentView
      doc={doc}
      backHref={backHref}
      canDelete={canEdit}
      viewerId={isFamily ? (user?.id ?? null) : null}
    />
  );
}
