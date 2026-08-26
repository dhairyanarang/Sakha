import { cn } from "@/lib/cn";

/** Avatar — 52x52 circle. Falls back to a brand tint when there's no photo. */
export interface AvatarProps extends React.ComponentPropsWithoutRef<"div"> {
  src?: string;
  name?: string;
}

export function Avatar({ src, name, className, children, ...props }: AvatarProps) {
  return (
    <div
      className={cn(
        "size-[52px] shrink-0 overflow-hidden rounded-full",
        src ? "bg-border-default" : "bg-surface-tinted",
        "flex items-center justify-center",
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={name ?? ""} className="size-full object-cover" />
      ) : (
        children
      )}
    </div>
  );
}
