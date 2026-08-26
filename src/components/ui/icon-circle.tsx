import { cn } from "@/lib/cn";

/**
 * Icon Circle — 46x46, fully round, four tones. The icon sits directly on the
 * fill; this is the ONLY circular icon container in the system (see CLAUDE.md:
 * icons are otherwise unwrapped).
 */
type Tone = "brand" | "error" | "success" | "neutral";

const TONE: Record<Tone, string> = {
  brand: "bg-surface-tinted",
  error: "bg-feedback-error-surface",
  success: "bg-feedback-success-surface",
  neutral: "bg-surface-subtle",
};

export interface IconCircleProps extends React.ComponentPropsWithoutRef<"div"> {
  tone?: Tone;
}

export function IconCircle({ tone = "brand", className, children, ...props }: IconCircleProps) {
  return (
    <div
      className={cn(
        "flex size-[46px] shrink-0 items-center justify-center rounded-full",
        TONE[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
