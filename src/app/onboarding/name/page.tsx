import { User } from "lucide-react";
import { requireUser } from "../guard";
import { NameForm } from "./name-form";

export default async function NamePage() {
  await requireUser();
  return <NameForm icon={<User size={60} strokeWidth={1.5} aria-hidden />} />;
}
