import { Users } from "lucide-react";
import { requireUser } from "../guard";
import { FamilyForm } from "./family-form";

export default async function FamilyPage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  await requireUser();
  const { added } = await searchParams;
  return (
    <FamilyForm
      icon={<Users size={60} strokeWidth={1.5} aria-hidden />}
      justAdded={added === "1"}
    />
  );
}
