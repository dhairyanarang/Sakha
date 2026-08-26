import { cn } from "@/lib/cn";

/**
 * Empty State — illustration plus a message, vertically centred, 16px gap.
 *
 * The 214x150 tinted block is the library placeholder. Each real screen brings
 * its own authored artwork; that artwork is not a token and should be passed in.
 */
export interface EmptyStateProps extends React.ComponentPropsWithoutRef<"div"> {
  message: string;
  illustration?: React.ReactNode;
}

export function EmptyState({
  message,
  illustration,
  className,
  children,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn("flex w-full flex-col items-center justify-center gap-4", className)}
      {...props}
    >
      {illustration ?? (
        <div className="bg-surface-tinted h-[150px] w-[214px] rounded-md" />
      )}
      <p className="text-body-primary text-text-primary text-center">{message}</p>
      {children}
    </div>
  );
}
