import { Languages } from "lucide-react";
import { requireUser } from "../guard";
import { LanguageForm } from "./language-form";

export default async function LanguagePage() {
  await requireUser();
  return <LanguageForm icon={<Languages size={60} strokeWidth={1.5} aria-hidden />} />;
}
