import { useEffect, useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/** Mount tools on demand, then retain form drafts and in-flight job feedback. */
export function DeskDisclosure({
  title,
  description,
  children,
  expanded,
  onExpandedChange,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  expanded?: boolean;
  onExpandedChange?: (open: boolean) => void;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [visited, setVisited] = useState(false);
  const visible = expanded ?? open;
  useEffect(() => {
    if (visible) setVisited(true);
  }, [visible]);
  return (
    <section
      className="mb-4 min-w-0 rounded-xl border border-border bg-surface"
      data-desk-disclosure={title}
    >
      <h2>
        <button
          type="button"
          aria-label={title}
          aria-expanded={visible}
          aria-controls={id}
          className="flex min-h-14 w-full items-center gap-3 rounded-xl p-4 text-left text-fg hover:bg-elevated focus-visible:outline-2 focus-visible:outline-accent"
          onClick={() => {
            setVisited(true);
            setOpen(!visible);
            onExpandedChange?.(!visible);
          }}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">{title}</span>
            {description && (
              <span className="mt-1 block text-xs leading-5 text-muted">{description}</span>
            )}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={"size-4 shrink-0 text-muted " + (visible ? "rotate-180" : "")}
          />
        </button>
      </h2>
      <div id={id} hidden={!visible} className="min-w-0 border-t border-border p-4 sm:p-5">
        {(visited || visible) && children}
      </div>
    </section>
  );
}
