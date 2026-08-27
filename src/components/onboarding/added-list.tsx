import { Check } from "lucide-react";

/**
 * What's already been saved on an "add another" step.
 *
 * Without this, coming back to the screen shows an empty form and reads as
 * data loss — the entry is safely stored, the form is simply for the next one.
 */
export function AddedList({ items }: { items: { id: string; primary: string; secondary?: string }[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-col gap-2">
      {items.map((it) => (
        <li
          key={it.id}
          className="bg-surface-default border-border-soft flex items-center gap-3 rounded-xl border-[0.5px] px-4 py-3"
        >
          <span className="bg-feedback-success-surface flex size-6 shrink-0 items-center justify-center rounded-full">
            <Check size={14} className="text-feedback-success-text" aria-hidden />
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-body-medium text-text-primary truncate">{it.primary}</span>
            {it.secondary ? (
              <span className="text-body-secondary text-text-secondary truncate">
                {it.secondary}
              </span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
