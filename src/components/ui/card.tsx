import { cn } from "@/lib/cn";

/**
 * Card / List Row — one component, two jobs. A card and a list row are the
 * same container at different heights, so there is deliberately no separate
 * ListRow component.
 *
 * Auto-height, white, border/soft hairline, radius/xl. Padding is space/4.
 */
export interface CardProps extends React.ComponentPropsWithoutRef<"div"> {
  as?: "div" | "li";
}

export function Card({ as: Tag = "div", className, children, ...props }: CardProps) {
  const Comp = Tag as React.ElementType;
  return (
    <Comp
      className={cn(
        "bg-surface-default border-border-soft flex w-full items-center gap-3 rounded-xl border-[0.5px] p-4",
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
