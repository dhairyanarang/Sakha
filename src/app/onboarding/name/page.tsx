import { requireUser } from "../guard";
import { NameForm } from "./name-form";

export default async function NamePage() {
  await requireUser();
  return <NameForm />;
}
