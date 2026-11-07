import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  seriesProgress,
  changeSeriesProgress,
  undoSeriesProgress,
  summarizeSeriesProgress,
  slotProgress,
} from "@/lib/series-progress";
import type { AnimeEpisodeMap, AnimeSeriesReview } from "@/lib/videos/anime-review";
import { useReviewedDocument } from "./use-reviewed-document";
export function SeriesProgressPanel({
  series,
  map,
}: {
  series: AnimeSeriesReview;
  map: AnimeEpisodeMap;
}) {
  const state = useReviewedDocument(seriesProgress),
    [open, setOpen] = useState(false),
    [page, setPage] = useState(0),
    [confirmed, setConfirmed] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    tracked = state.data.series[series.id],
    summary = summarizeSeriesProgress(series, map, tracked),
    slots = map.numbered.filter((s) => s.numbering === series.policy.numbering),
    offset = Math.min(page * 10, Math.max(0, Math.ceil(slots.length / 10) - 1) * 10),
    known = [...map.numbered, ...map.specials].map((s) => s.key);
  const run = (fn: () => void, note: string) => {
    try {
      fn();
      setError("");
      setNotice(note);
      setConfirmed(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Series tracking could not be saved.");
    }
  };
  return (
    <section
      data-series-progress={series.id}
      className="mt-4 rounded-lg border border-border bg-bg p-4"
    >
      <h4 className="text-lg font-medium text-fg">Series progress</h4>
      <p role="status" className="mt-2 text-sm text-fg">
        {state.ready ? `${summary.complete} / ${summary.known} known episodes tracked as watched` : 'Loading saved series decisions…'}
      </p>
      <p className="mt-2 text-xs leading-5 text-muted">
        {summary.missing} absent slots · {summary.unavailable} known episodes need a source
        reconnected · {summary.otherNumbering} entries in another numbering lane ·{" "}
        {summary.unresolved} unresolved sources · {summary.specials} specials/OVAs kept separate
        {summary.uncertain ? " · expected range unverified" : ""}. Numbering:{" "}
        {series.policy.numbering}. Duplicate versions count once; missing entries are never marked
        watched.
      </p>
      <details className="mt-3" onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary className="min-h-11 cursor-pointer content-center text-sm font-medium text-fg">
          Correct or reset series tracking
        </summary>
        {open && (
          <>
            <p className="mt-2 text-sm leading-6 text-muted">
              Playback evidence uses this series’ completion threshold (
              {Math.round(series.policy.threshold * 100)}%). Owner corrections override only series
              tracking. Reset ignores older playback evidence for this series; future playback can
              count again. Original resume positions, ratings, tags and watch history stay intact.
            </p>
            {slots.slice(offset, offset + 10).map((slot) => {
              const p = slotProgress(slot, series, tracked),
                choice = tracked?.decisions[slot.key];
              return (
                <label
                  key={slot.key}
                  data-series-progress-slot={slot.key}
                  className="mt-3 grid min-w-0 gap-2 rounded-md border border-border p-3 text-sm sm:grid-cols-2"
                >
                  <span>
                    {slot.numbering === "absolute" ? "Absolute" : "Season " + slot.season} · Episode{" "}
                    {slot.episode}
                    <span className="mt-1 block text-xs text-muted">
                      {p.complete ? "Watched" : "Incomplete"} · {p.origin} · {slot.versions.length}{" "}
                      version(s)
                    </span>
                  </span>
                  <select
                    className="min-h-11 min-w-0 rounded-md border border-border bg-surface px-3 text-sm text-fg"
                    aria-label={"Series decision " + slot.key}
                    value={choice === undefined ? "evidence" : choice ? "watched" : "unwatched"}
                    disabled={!state.ready || Boolean(state.error)}
                    onChange={(e) =>
                      run(
                        () =>
                          seriesProgress.write(
                            changeSeriesProgress(
                              state.data,
                              series.id,
                              {
                                kind: "decision",
                                slot: slot.key,
                                value:
                                  e.target.value === "evidence"
                                    ? undefined
                                    : e.target.value === "watched",
                              },
                              known,
                            ),
                          ),
                        "Series correction saved. Playback marks were retained.",
                      )
                    }
                  >
                    <option value="evidence">Use playback evidence</option>
                    <option value="watched">Owner: watched</option>
                    <option value="unwatched">Owner: not watched</option>
                  </select>
                </label>
              );
            })}
            {slots.length > 10 && (
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  disabled={!offset}
                  onClick={() => setPage(offset / 10 - 1)}
                >
                  Previous tracked episodes
                </Button>
                <Button
                  variant="secondary"
                  disabled={offset + 10 >= slots.length}
                  onClick={() => setPage(offset / 10 + 1)}
                >
                  Next tracked episodes
                </Button>
              </div>
            )}
            <label className="mt-4 flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                aria-label="I want to reset only this series tracking"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />
              Reset tracking for {series.title}; keep source playback history and positions.
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                disabled={!confirmed || !state.ready || Boolean(state.error)}
                onClick={() =>
                  run(
                    () =>
                      seriesProgress.write(
                        changeSeriesProgress(
                          state.data,
                          series.id,
                          { kind: "reset", at: Date.now() },
                          known,
                        ),
                      ),
                    "Series tracking reset saved. Undo remains available after reload.",
                  )
                }
              >
                Reset this series tracking
              </Button>
              <Button
                variant="secondary"
                disabled={state.data.undo?.id !== series.id || !state.ready || Boolean(state.error)}
                onClick={() =>
                  run(
                    () => seriesProgress.write(undoSeriesProgress(state.data)),
                    "Previous series tracking restored.",
                  )
                }
              >
                Undo series tracking change
              </Button>
              <Button variant="secondary" onClick={() => {seriesProgress.reload();setError('');setNotice('Saved series tracking reloaded.');}}>
                Reload series tracking
              </Button>
            </div>
          </>
        )}
      </details>
      {tracked?.resetAt !== undefined && (
        <p className="mt-2 text-xs text-muted">
          Playback evidence at or before {new Date(tracked.resetAt).toLocaleString()} is ignored for
          this series summary.
        </p>
      )}
      <p role="status" className="mt-2 text-xs text-muted">
        {notice}
      </p>
      {(error || state.error) && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error || state.error}
        </p>
      )}
    </section>
  );
}
