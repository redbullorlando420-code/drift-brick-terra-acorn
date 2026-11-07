import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import { useSessionPhase } from "@/lib/use-session-phase";
import {
  suggestSearchSpelling,
  type SpellingInput,
  type SpellingReport,
} from "@/lib/videos/search-spelling";

export function SearchSpelling() {
  const videos = useLibrary((s) => s.videos),
    tags = useLibrary((s) => s.tags),
    categories = useLibrary((s) => s.categories),
    folders = useLibrary((s) => s.folders);
  const hidden = useLibrary((s) => s.hiddenVideos),
    unavailable = useLibrary((s) => s.unavailable),
    query = useLibrary((s) => s.query),
    sourceId = useLibrary((s) => s.sourceId),
    adultsUnlocked = useLibrary((s) => s.adultsUnlocked);
  const viewer = useLibrary((s) => Boolean(s.activeId || s.previewId)),
    phase = useSessionPhase();
  const input = useMemo<SpellingInput>(
    () => ({
      videos,
      tags,
      categories,
      folders,
      hidden,
      unavailable,
      query,
      sourceId,
      adultsUnlocked,
    }),
    [videos, tags, categories, folders, hidden, unavailable, query, sourceId, adultsUnlocked],
  );
  const [packet, setPacket] = useState<{ input: SpellingInput; report: SpellingReport }>();
  const active = !viewer && phase === "active";
  useEffect(() => {
    if (!active) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      void suggestSearchSpelling(input, controller.signal)
        .then((report) => {
          if (!controller.signal.aborted) setPacket({ input, report });
        })
        .catch(() => {
          /* Superseded or unavailable vocabulary never changes search results. */
        });
    }, 350);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [active, input]);
  const report = active && packet?.input === input ? packet.report : undefined;
  if (!report?.suggestions.length) return null;
  return (
    <section
      aria-label="Local spelling suggestions"
      className="mb-5 rounded-lg border border-border bg-surface p-4"
    >
      <h2 className="text-sm font-medium text-fg">Try a spelling from this desk</h2>
      <p className="mt-1 text-xs leading-5 text-muted">
        Based on visible titles, creator names and tags. Your search stays unchanged until you
        choose one.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {report.suggestions.map((row) => (
          <Button
            key={row.query}
            variant="secondary"
            className="min-h-11 max-w-full flex-col items-start whitespace-normal break-words py-2 text-left"
            aria-label={`Try ${row.word} instead of ${row.original}`}
            onClick={() => {
              const state = useLibrary.getState();
              if (
                state.query === input.query &&
                state.sourceId === input.sourceId &&
                state.adultsUnlocked === input.adultsUnlocked &&
                state.videos === input.videos &&
                state.tags === input.tags &&
                state.categories === input.categories &&
                state.hiddenVideos === input.hidden &&
                state.unavailable === input.unavailable &&
                state.folders === input.folders &&
                !state.activeId &&
                !state.previewId
              )
                state.setQuery(row.query);
            }}
          >
            <span>
              {row.original} → {row.word}
            </span>
            <span className="text-xs font-normal text-muted">
              One edit · at least {row.titles} visible titles
            </span>
          </Button>
        ))}
      </div>
      {report.capped && (
        <p className="mt-2 text-xs text-muted">
          Suggestions use a limited vocabulary sample; other spellings may also match.
        </p>
      )}
    </section>
  );
}
