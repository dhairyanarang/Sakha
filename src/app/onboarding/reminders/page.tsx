import { requireUser } from "../guard";
import { RemindersPrompt } from "./reminders-prompt";

export default async function RemindersPage() {
  await requireUser();
  return <RemindersPrompt />;
}
