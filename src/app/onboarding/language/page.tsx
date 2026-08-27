import { requireUser } from "../guard";
import { getOwnedAccount } from "@/lib/account";
import { LanguageForm } from "./language-form";

export default async function LanguagePage() {
  await requireUser();
  const owned = await getOwnedAccount();
  return <LanguageForm defaultLanguage={owned?.language ?? "en"} />;
}
