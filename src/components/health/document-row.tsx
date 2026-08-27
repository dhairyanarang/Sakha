import Link from "next/link";
import { ChevronRight, File } from "lucide-react";
import { IconCircle } from "@/components/ui";

/** One stored document: title and when it is from. */
export function DocumentRow({
  href,
  title,
  when,
}: {
  href: string;
  title: string;
  when: string;
}) {
  return (
    <Link
      href={href}
      className="bg-surface-default border-border-soft flex w-full items-center gap-3 rounded-xl border-[0.5px] px-3 py-4"
    >
      <IconCircle tone="brand">
        <File size={22} className="text-action-primary" aria-hidden />
      </IconCircle>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-body-medium text-text-primary truncate">{title}</p>
        {/* rgba(0,0,0,0.4) over surface/default, resolved to a solid value. */}
        <p className="text-[14px] leading-[1.2] text-[#999999]">{when}</p>
      </div>
      <ChevronRight size={20} className="text-text-tertiary shrink-0" aria-hidden />
    </Link>
  );
}
