import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { ConflictReview, ConflictChoice } from "@/lib/videos/pack-conflicts";
const fieldLabels: Record<string, string> = {
  ratings: "Video rating",
  notes: "Personal note",
  creatorRatings: "Creator rating",
  creatorLikes: "Creator like",
  creatorFavorites: "Creator favorite",
  watchTime: "Watch time",
  progress: "Playback position",
  resumeProgress: "Continue watching",
  metadata: "Tags, category and locks",
  meta: "Photo details",
};
const clock = (n: number) => `${Math.floor(n / 60)}:${String(Math.floor(n % 60)).padStart(2, "0")}`;
const preview = (value: unknown, field: string) => {
  const v = value as Record<string, any>;
  let text = typeof value === "string" ? value : JSON.stringify(value);
  if (field === "ratings")
    text = `${v.rating} of 5 stars\nSaved: ${v.history?.updatedAt ? new Date(v.history.updatedAt).toLocaleString() : "Timestamp unavailable"}`;
  if (field === "progress" || field === "resumeProgress")
    text = `${clock(v.t)} of ${clock(v.d)}\nSaved: ${v.at ? new Date(v.at).toLocaleString() : "Timestamp unavailable"}`;
  if (field === "metadata")
    text = `Tags: ${(v.tags ?? []).join(", ") || "None supplied"}\nCategory: ${v.categories ?? "None supplied"}\nLocks: ${(v.metadataProvenance?.lockedFields ?? []).join(", ") || "None supplied"}\nTag origins: ${
      Object.entries(v.metadataProvenance?.tags ?? {})
        .map(([tag, source]) => tag + " · " + String(source).replace("provider:", ""))
        .join(", ") || "Unspecified"
    }`;
  if (field === "watchTime")
    text = `Preview: ${clock(v.preview ?? 0)}\nFull player: ${clock(v.fullscreen ?? 0)}`;
  return text.length > 600 ? text.slice(0, 600) + "…" : text;
};
export function PackConflictReview({
  review,
  choices,
  disabled,
  onChange,
}: {
  review: ConflictReview;
  choices: Record<string, ConflictChoice>;
  disabled: boolean;
  onChange: (next: Record<string, ConflictChoice>) => void;
}) {
  const [page, setPage] = useState(0),
    count = review.conflicts.length,
    remaining = review.conflicts.filter((c) => !choices[c.id]).length;
  const currentPage = Math.min(page, Math.max(0, Math.ceil(count / 8) - 1));
  return (
    <section aria-label="Backup field choices" className="space-y-4 border-t border-border pt-4">
      <h3 className="text-lg font-medium">Review saved field conflicts</h3>
      <p className="text-sm leading-6 text-muted">
        {count
          ? `${remaining.toLocaleString()} of ${count.toLocaleString()} differing fields still need a choice.`
          : "No opposing personal fields were found."}{" "}
        Current and imported values are shown together. Ratings travel with their rating history;
        tags travel with category and provenance locks. Safe merge keeps the newer resume timestamp,
        the larger watch-time counters, or combines tags while preserving locks. Opposing categories
        and ratings need a choice. Existing metadata locks are always retained; importing does not
        unlock a field.
      </p>
      {!!count && (
        <>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={disabled}
              onClick={() =>
                onChange(Object.fromEntries(review.conflicts.map((c) => [c.id, "current"])))
              }
            >
              Keep all current fields
            </Button>
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={disabled}
              onClick={() =>
                onChange(
                  Object.fromEntries(
                    review.conflicts.map((c) => [c.id, c.safe !== undefined ? "safe" : "current"]),
                  ),
                )
              }
            >
              Merge safe fields; keep other current fields
            </Button>
          </div>
          <div className="space-y-4">
            {review.conflicts.slice(currentPage * 8, currentPage * 8 + 8).map((c) => (
              <article
                key={c.id}
                className="space-y-3 rounded-md border border-border bg-elevated p-3"
              >
                <p className="break-all text-xs font-medium">
                  {fieldLabels[c.field] ?? c.field} · {c.key}
                </p>
                <div className="grid min-w-0 gap-3 md:grid-cols-2">
                  <div className="min-w-0">
                    <p className="text-xs text-muted">Current library</p>
                    <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-all text-xs">
                      {preview(c.current, c.field)}
                    </pre>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted">Imported backup</p>
                    <pre className="mt-1 max-h-32 overflow-auto whitespace-pre-wrap break-all text-xs">
                      {preview(c.incoming, c.field)}
                    </pre>
                  </div>
                </div>
                <label className="block text-sm">
                  Choice
                  <select
                    aria-label={"Backup choice " + c.field + " " + c.key}
                    disabled={disabled}
                    className="mt-2 block min-h-11 w-full rounded-md border border-border bg-bg px-3"
                    value={choices[c.id] ?? ""}
                    onChange={(e) =>
                      onChange({ ...choices, [c.id]: e.target.value as ConflictChoice })
                    }
                  >
                    <option value="" disabled>
                      Choose a saved value
                    </option>
                    <option value="current">Keep current</option>
                    <option value="imported">Use imported</option>
                    <option value="safe" disabled={c.safe === undefined}>
                      Merge safe values{c.safe === undefined ? " · unavailable" : ""}
                    </option>
                  </select>
                </label>
              </article>
            ))}
          </div>
          <nav
            aria-label="Backup conflict pages"
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <Button
              variant="ghost"
              className="min-h-11"
              disabled={disabled || !currentPage}
              onClick={() => setPage(currentPage - 1)}
            >
              Previous fields
            </Button>
            <span className="text-xs text-muted">
              {currentPage * 8 + 1}–{Math.min(count, currentPage * 8 + 8)} of{" "}
              {count.toLocaleString()}
            </span>
            <Button
              variant="ghost"
              className="min-h-11"
              disabled={disabled || (currentPage + 1) * 8 >= count}
              onClick={() => setPage(currentPage + 1)}
            >
              Next fields
            </Button>
          </nav>
        </>
      )}
    </section>
  );
}
