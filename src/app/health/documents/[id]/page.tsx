import { notFound } from "next/navigation";
import { requireAccount } from "@/lib/account";
import { getDocument } from "@/lib/health-data";
import { DocumentView } from "@/components/health/document-view";

/**
 * One stored document.
 *
 * DESIGNED IN CODE — Figma has no frame for this. The screen itself lives in
 * DocumentView, which needs client state for the PDF's page count and the
 * delete confirmation; this stays a server component that only fetches.
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

  return <DocumentView doc={doc} />;
}
