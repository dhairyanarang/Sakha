import { requireUser } from "../guard";
import { LanguageForm } from "./language-form";

export default async function LanguagePage() {
  await requireUser();
  return <LanguageForm />;
}
