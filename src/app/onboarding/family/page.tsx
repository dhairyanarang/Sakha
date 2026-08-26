import { requireUser } from "../guard";
import { FamilyForm } from "./family-form";

export default async function FamilyPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  await requireUser();
  const { added } = await searchParams;
  return <FamilyForm justAdded={added === "1"} />;
}
