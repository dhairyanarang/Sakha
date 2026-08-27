import { cn } from "@/lib/cn";

/**
 * Empty State — the screen's own artwork above a short line, centred.
 *
 * The artwork is authored per screen and passed in; it is not a token. The
 * fallback block only exists so the kitchen sink has something to show.
 *
 * FLAGGED: the empty-state frames disagree on the message colour — brand on
 * the Medicines screen, black on Documents, Invitations and Home. `tone` keeps
 * each frame honest rather than picking a winner, but it is worth settling.
 */
export interface EmptyStateProps extends React.ComponentPropsWithoutRef<"div"> {
  message: string;
  illustration?: React.ReactNode;
  tone?: "default" | "brand";
}

export function EmptyState({
  message,
  illustration,
  tone = "default",
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn("flex w-full flex-col items-center justify-center gap-2.5 py-4", className)}
      {...props}
    >
      {illustration ?? (
        <div className="bg-surface-tinted h-[150px] w-[214px] rounded-md" />
      )}
      <p
        className={cn(
          "text-center text-[16px] leading-[1.4] font-medium",
          tone === "brand" ? "text-action-primary" : "text-text-primary",
        )}
      >
        {message}
      </p>
      {children}
    </div>
  );
}
