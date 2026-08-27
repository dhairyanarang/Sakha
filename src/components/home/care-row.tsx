import { cn } from "@/lib/cn";

type Tone = "brand-solid" | "brand" | "error" | "success";

const TONE: Record<Tone, { bg: string; fg: string }> = {
  "brand-solid": { bg: "bg-action-primary", fg: "text-text-on-brand" },
  brand: { bg: "bg-surface-tinted-strong", fg: "text-action-primary" },
  error: { bg: "bg-feedback-error-surface", fg: "text-feedback-error" },
  success: { bg: "bg-feedback-success-surface", fg: "text-feedback-success-text" },
};

/** A today's-care row: icon, title, supporting line, trailing action. */
export function CareRow({
  tone,
  icon,
  title,
  children,
  action,
  className,
}: {
  tone: Tone;
  icon: React.ReactNode;
  title: string;
  children?: React.ReactNode;
  action: React.ReactNode;
  className?: string;
}) {
  const t = TONE[tone];
  return (
    <div
      className={cn(
        "bg-surface-default border-border-soft flex shrink-0 items-center gap-3 rounded-xl border-[0.5px] px-3 py-4",
        className,
      )}
    >
      <span className={cn("flex shrink-0 items-center justify-center rounded-full p-3", t.bg, t.fg)}>
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-body-medium text-text-primary">{title}</p>
        {children}
      </div>
      {action}
    </div>
  );
}
