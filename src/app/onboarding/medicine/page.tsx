import { requireUser } from "../guard";
import { MedicineForm } from "./medicine-form";

export default async function MedicinePage({
  searchParams,
}: {
  searchParams: Promise<{ added?: string }>;
}) {
  await requireUser();
  const { added } = await searchParams;
  return <MedicineForm justAdded={added === "1"} />;
}
