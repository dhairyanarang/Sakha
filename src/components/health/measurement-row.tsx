import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import { IconCircle } from "@/components/ui";
import { getMessages } from "@/lib/i18n/server";

/**
 * One measurement inside the Measurements card: tinted icon, label, the
 * reading itself, and when it was taken.
 *
 * The reading deliberately mixes two sizes in one line — 22px for the number,
 * 18px for the unit. That is authored content, not a missing text style; no
 * single style can cover a mixed-size run (see the Design MD).
 *
 * With no reading yet the row still renders and keeps its place in the card —
 * a missing row reads as something broken rather than something not yet done.
 * It drops the value line entirely and says so on the date line instead, as
 * drawn, rather than putting a placeholder where a number belongs.
 *
 * Prefetched in full. These detail routes are dynamic, and for a dynamic route
 * the default prefetch only reaches the nearest loading boundary — there are
 * none, so it fetched nothing and every tap waited on a cold server render.
 * Next still only prefetches links that are actually on screen, so this costs
 * three requests here rather than one per row in the whole app.
 */
export async function MeasurementRow({
  href,
  icon,
  tone,
  label,
  value,
  unit,
  when,
}: {
  href: string;
  icon: React.ReactNode;
  tone: "brand" | "error" | "success" | "neutral";
  label: string;
  value: string | null;
  unit: string;
  when: string | null;
}) {
  const t = await getMessages();
  return (
    <Link href={href} prefetch className="flex w-full items-center gap-3">
      <IconCircle tone={tone}>{icon}</IconCircle>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* rgba(0,0,0,0.8) over surface/default, resolved to a solid value —
            text is never lightened with opacity. */}
        <p className="text-[16px] leading-[1.2] text-[#333333]">{label}</p>

        {value ? (
          <p className="text-text-primary leading-[1.2] font-medium">
            <span className="text-[22px]">{value}</span>{" "}
            <span className="text-[18px]">{unit}</span>
          </p>
        ) : null}

        <span className="flex items-center gap-1">
          <Calendar size={16} className="text-text-tertiary shrink-0" aria-hidden />
          {/* rgba(0,0,0,0.4) over surface/default, resolved to a solid. */}
          <span className="text-[14px] leading-[1.2] text-[#999999]">
            {when ?? t.home.notRecordedYet}
          </span>
        </span>
      </div>

      <ChevronRight size={20} className="text-text-tertiary shrink-0" aria-hidden />
    </Link>
  );
}
