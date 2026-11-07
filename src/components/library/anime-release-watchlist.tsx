import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import {
  animeReleases,
  readAnimeReleases,
  releaseObservation,
  type AnimeRelease,
} from "@/lib/anime-releases";
import {
  getAnimeReviews,
  getServerAnimeReviews,
  subscribeAnimeReviews,
  hydrateAnimeReviews,
} from "@/lib/anime-review-store";
import { animeReviewVisibility } from "@/lib/videos/anime-review";
import { forEachCatalogSlice } from "@/lib/catalog-work";
import { catalogTurn } from "@/lib/catalog-turn";
export function AnimeReleaseWatchlist() {
  const [open, setOpen] = useState(false);
  return (
    <details
      data-anime-watchlist
      className="mt-5 rounded-lg border border-border bg-surface p-4"
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary className="min-h-11 cursor-pointer content-center text-sm font-medium">
        Expected anime releases
      </summary>
      {open && <ReleaseEditor />}
    </details>
  );
}
function ReleaseEditor() {
  const reviews = useSyncExternalStore(
      subscribeAnimeReviews,
      getAnimeReviews,
      getServerAnimeReviews,
    ),
    videos = useLibrary((s) => s.videos),
    folders = useLibrary((s) => s.folders),
    hidden = useLibrary((s) => s.hiddenVideos),
    unavailable = useLibrary((s) => s.unavailable),
    [state, setState] = useState(() => animeReleases.read()),
    [error, setError] = useState(""),
    [note, setNote] = useState(""),
    [now, setNow] = useState(Date.now),
    [available, setAvailable] = useState<{ input: unknown; ids: Set<string> }>();
  const scope = useMemo(
    () => ({
      videos,
      folders,
      hidden,
      unavailable,
      reviews: reviews.ledger,
      entries: state.entries,
    }),
    [videos, folders, hidden, unavailable, reviews.ledger, state.entries],
  );
  const blank = (): AnimeRelease => ({
      id: crypto.randomUUID(),
      seriesId: Object.keys(reviews.ledger.series)[0] ?? "",
      numbering: "season",
      season: 1,
      episode: 1,
      expected: "",
      zone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      postponed: false,
      remind: false,
      acknowledged: false,
      source: "Owner-entered observation",
    }),
    [draft, setDraft] = useState<AnimeRelease>(blank);
  useEffect(() => {
    void hydrateAnimeReviews();
  }, []);
  useEffect(() => {
    const c = new AbortController(),
      ids = new Set<string>(),
      visible = animeReviewVisibility(scope),
      wanted = new Set(state.entries.map((r) => r.seriesId)),
      permitted = new Set(folders.filter((f) => !f.needsPermission && !f.adult).map((f) => f.id));
    void forEachCatalogSlice(
      videos,
      (v) => {
        const e = reviews.ledger.episodes[v.id];
        if (e && wanted.has(e.seriesId) && visible(v) && permitted.has(v.folderId)) ids.add(v.id);
      },
      catalogTurn(c.signal),
    )
      .then(() => {
        if (!c.signal.aborted) setAvailable({ input: scope, ids });
      })
      .catch(() => {});
    return () => c.abort();
  }, [scope]);
  const act = (fn: () => void) => {
    try {
      fn();
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Release could not be saved.");
    }
  };
  const commit = (entries: AnimeRelease[]) =>
    setState(animeReleases.write(readAnimeReleases({ version: 1, entries })));
  return (
    <div className="mt-3 space-y-4">
      <p className="text-sm leading-6 text-muted">
        Opt-in, owner-entered expectations for reviewed series. Dates never establish availability.
        Reminders are checked only here while the app is open, on entry or Refresh; no background or
        closed-app delivery is promised.
      </p>
      <form
        className="grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          act(() => {
            if (!reviews.ledger.series[draft.seriesId])
              throw Error("First review this series in the anime series/episode tools.");
            commit([
              ...state.entries.filter((r) => r.id !== draft.id),
              { ...draft, acknowledged: false },
            ]);
            setDraft(blank());
            setNote("Release observation saved. Editing replaces its reminder identity.");
          });
        }}
      >
        <label className="space-y-1 text-sm">
          Reviewed series
          <select
            aria-label="Release series"
            className="min-h-11 w-full rounded-md border border-border bg-bg px-3"
            value={draft.seriesId}
            onChange={(e) => setDraft({ ...draft, seriesId: e.target.value })}
          >
            <option value="">Choose reviewed series</option>
            {Object.values(reviews.ledger.series).map((s) => (
              <option key={s.id} value={s.id}>
                {s.title} · {s.release}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-sm">
          Numbering
          <select
            aria-label="Release numbering"
            className="min-h-11 w-full rounded-md border border-border bg-bg px-3"
            value={draft.numbering}
            onChange={(e) =>
              setDraft({
                ...draft,
                numbering: e.target.value as "season" | "absolute",
                season: e.target.value === "absolute" ? 0 : 1,
              })
            }
          >
            <option value="season">Season / episode</option>
            <option value="absolute">Absolute episode</option>
          </select>
        </label>
        {(["season", "episode"] as const).map((k) => (
          <label key={k} className="space-y-1 text-sm">
            {k}
            <Input
              aria-label={"Release " + k}
              type="number"
              value={draft[k]}
              onChange={(e) => setDraft({ ...draft, [k]: Number(e.target.value) })}
            />
          </label>
        ))}
        <label className="space-y-1 text-sm">
          Expected time (ISO with UTC offset)
          <Input
            aria-label="Expected release time"
            placeholder="2026-11-04T20:00:00-05:00"
            value={draft.expected}
            onChange={(e) => setDraft({ ...draft, expected: e.target.value })}
          />
        </label>
        <label className="space-y-1 text-sm">
          Display time zone
          <Input
            aria-label="Release time zone"
            value={draft.zone}
            onChange={(e) => setDraft({ ...draft, zone: e.target.value })}
          />
        </label>
        <label className="space-y-1 text-sm">
          Observation source / note
          <Input
            aria-label="Release observation source"
            maxLength={200}
            value={draft.source}
            onChange={(e) => setDraft({ ...draft, source: e.target.value })}
          />
        </label>
        <div className="space-y-2">
          {(["postponed", "remind"] as const).map((k) => (
            <label key={k} className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft[k]}
                onChange={(e) => setDraft({ ...draft, [k]: e.target.checked })}
              />
              {k === "postponed" ? "Postponed (no due reminder)" : "Remind me here when due"}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="min-h-11">
            Save release observation
          </Button>
          <Button type="button" variant="secondary" onClick={() => setDraft(blank())}>
            Cancel release edit
          </Button>
        </div>
      </form>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => setNow(Date.now())}>
          Refresh release reminders
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setState(animeReleases.read());
            setError(animeReleases.error());
          }}
        >
          Reload watchlist
        </Button>
      </div>
      <p className="break-words text-xs text-muted">
        Checked {new Date(now).toLocaleString()}. Explicit offsets distinguish repeated
        daylight-saving hours; changing display zone changes no stored instant.
      </p>
      {state.entries.map((row) => {
        const observation =
          available?.input === scope
            ? releaseObservation(row, reviews.ledger, available.ids, now)
            : undefined;
        return (
          <article
            key={row.id}
            data-release-id={row.id}
            className="space-y-2 rounded-lg border border-border p-3"
          >
            <h3 className="font-medium">
              {reviews.ledger.series[row.seriesId]?.title ?? "Reviewed series unavailable"} ·{" "}
              {row.numbering === "absolute" ? "Absolute" : `Season ${row.season}`} episode{" "}
              {row.episode}
            </h3>
            <p className="text-sm text-muted">
              Expected:{" "}
              {new Intl.DateTimeFormat(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: row.zone,
              }).format(Date.parse(row.expected))}{" "}
              · {row.zone}
            </p>
            <p className="break-words text-xs text-muted">
              Owner-entered · {row.source || "Source not recorded"} ·{" "}
              {row.postponed
                ? "Postponed"
                : observation?.available
                  ? "Available: matching reviewed library observation"
                  : observation
                    ? "Expected only; no matching available reviewed episode"
                    : "Checking library observations…"}
            </p>
            {observation?.due && (
              <p role="status" className="text-sm text-accent">
                Reminder due here. Expected time passed; this does not confirm a release or library
                arrival.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setDraft(row)}>
                Edit release
              </Button>
              <Button
                variant="secondary"
                onClick={() =>
                  act(() =>
                    commit(
                      state.entries.map((r) =>
                        r.id === row.id ? { ...r, acknowledged: true } : r,
                      ),
                    ),
                  )
                }
              >
                Acknowledge reminder
              </Button>
              <Button
                variant="secondary"
                onClick={() => act(() => commit(state.entries.filter((r) => r.id !== row.id)))}
              >
                Remove release
              </Button>
              {observation?.ids.map((id) => (
                <Button key={id} onClick={() => useLibrary.getState().openPreview(id)}>
                  Open available episode
                </Button>
              ))}
            </div>
          </article>
        );
      })}
      {!state.entries.length && (
        <p className="text-sm text-muted">
          No expected releases saved. Create or review a series below before adding an observation.
        </p>
      )}
      <p role="status" className="text-sm text-muted">
        {note}
      </p>
      {(error || animeReleases.error()) && (
        <p role="alert" className="text-sm text-danger">
          {error || animeReleases.error()}
        </p>
      )}
    </div>
  );
}
