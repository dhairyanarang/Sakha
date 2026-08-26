import { Bell } from "lucide-react";
import { requireUser } from "../guard";
import { RemindersPrompt } from "./reminders-prompt";

export default async function RemindersPage() {
  await requireUser();
  return <RemindersPrompt icon={<Bell size={60} strokeWidth={1.5} aria-hidden />} />;
}
