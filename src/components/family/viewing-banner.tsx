import { Eye } from "lucide-react";
import { getMessages } from "@/lib/i18n/server";

/**
 * "You are viewing Asha's health information."
 *
 * Said plainly, at the top, on every family screen — never implied by missing
 * buttons. Someone who has just accepted an invitation is looking at another
 * person's medical history on their own phone, and should never be even
 * momentarily unsure whose it is.
 */
export async function ViewingBanner({ name }: { name: string }) {
  const t = await getMessages();
  return (
    <div className="bg-surface-tinted border-action-primary flex shrink-0 items-center gap-3 rounded-sm border px-3 py-2.5">
      <Eye size={22} className="text-action-primary shrink-0" aria-hidden />
      <p className="text-action-primary text-[16px] leading-[1.4]">
        {t.family.viewingTheirInformation(name)}
      </p>
    </div>
  );
}
