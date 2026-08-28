"use client";

import { Avatar } from "./avatar";
import { Button } from "./button";
import { cn } from "@/lib/cn";
import { useT } from "@/lib/i18n/client";

/**
 * Family Member Card — 179px wide, same container styling as Card/List Row.
 * Composes real Avatar and Tertiary/Compact Button instances rather than
 * restyled copies, matching how it's built in Figma.
 *
 * Figma's embedded button is overridden to radius/full; the compact Button's
 * own radius is radius/sm. Kept as the component default here.
 */
export interface FamilyMemberCardProps extends React.ComponentPropsWithoutRef<"div"> {
  name: string;
  relation: string;
  photoUrl?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function FamilyMemberCard({
  name,
  relation,
  photoUrl,
  actionLabel,
  onAction,
  className,
  ...props
}: FamilyMemberCardProps) {
  const t = useT();
  return (
    <div
      className={cn(
        "bg-surface-default border-border-soft flex w-[179px] flex-col items-center gap-3 rounded-xl border-[0.5px] px-3 py-4",
        className,
      )}
      {...props}
    >
      <Avatar src={photoUrl} name={name} />
      <div className="flex w-full flex-col items-center gap-1">
        <span className="text-name-label text-text-primary w-full truncate text-center">
          {name}
        </span>
        <span className="text-body-secondary text-text-secondary">{relation}</span>
      </div>
      <Button variant="tertiary" size="compact" onClick={onAction} className="w-full">
        {actionLabel ?? t.invitations.manage}
      </Button>
    </div>
  );
}
