import { requireUser } from "../guard";
import { getOwnedAccount } from "@/lib/account";
import { NameForm } from "./name-form";

export default async function NamePage() {
  await requireUser();
  // Pre-fill from what's already saved, so coming back a step never looks
  // like the answer was thrown away.
  const owned = await getOwnedAccount();
  return <NameForm defaultName={owned?.displayName ?? ""} />;
}
