import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import { selectRecentPullChannels } from "@/lib/videos/recent-pull";
import { selectYoutubeSweepChannels } from "@/lib/remote/youtube-sweep";
import { selectTwitchRefreshBatch } from "@/lib/videos/twitch-refresh-selection";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
export function ProviderPullPanel({ kind }: { kind: "youtube" | "twitch" }) {
  const follows = useLibrary((state) => state.follows),
    refresh = useLibrary((state) => state.refreshFollows),
    refreshing = useLibrary((state) => state.refreshing),
    remoteBusy = useLibrary((state) => state.remoteBusy),
    active = useLibrary((state) => state.pullActivity);
  const channels = useMemo(
    () => follows.filter((row) => row.kind === kind && !row.importNeedsReview),
    [follows, kind],
  );
  const [creator, setCreator] = useState("all"),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const name = kind === "youtube" ? "YouTube" : "Twitch";
  const checked = channels.filter((row) => row.recentPull?.checkedAt).length,
    failed = channels.filter((row) => row.recentPull?.failure);
  const archives = channels.filter((row) =>
    kind === "youtube" ? row.catalogCursor : row.twitchArchiveCursor,
  ).length;
  const start = async (archive: boolean) => {
    if (busy || refreshing || remoteBusy) return;
    const current = useLibrary.getState().follows,
      now = Date.now();
    const selected =
      creator !== "all"
        ? current.filter((row) => row.id === creator && row.kind === kind)
        : !archive
          ? selectRecentPullChannels(current, kind, now, 12)
          : kind === "youtube"
            ? selectYoutubeSweepChannels(
                current,
                now,
                12,
                LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs,
                { includePlaylists: true },
              )
            : selectTwitchRefreshBatch(
                current.filter((row) => row.kind === kind && !row.twitchArchiveExhaustedAt),
                12,
                0,
                "archive",
                now,
              ).channels;
    if (!selected.length) {
      setNotice(
        "No eligible creators in this lane. Retry waits apply to the affected creator; completed archives keep their saved end position.",
      );
      return;
    }
    setBusy(true);
    setNotice(
      archive
        ? "Continuing saved older-video positions…"
        : "Checking recent uploads in small batches…",
    );
    try {
      const result = await refresh(kind, {
        channelIds: selected.map((row) => row.id),
        ...(archive
          ? kind === "youtube"
            ? { catalog: true }
            : { twitchContinueArchive: true }
          : kind === "twitch"
            ? { twitchRoutine: true }
            : {}),
      });
      if (!mounted.current) return;
      setNotice(
        result.pull
          ? result.pull.done +
              " / " +
              result.pull.total +
              " creators checked · " +
              result.pull.received.toLocaleString() +
              " returned · " +
              result.pull.added.toLocaleString() +
              " newly saved · " +
              result.pull.failed +
              " need attention" +
              (result.pull.errors?.[0] ? ". " + result.pull.errors[0] : ".")
          : result.skipped === "cooldown"
            ? "This lane is waiting for the provider retry time. Saved results and archive positions are kept."
            : result.skipped === "busy"
              ? "Another pull owns this lane. Try again after it finishes."
              : "No eligible creators; check retry waits or add a verified channel.",
      );
    } catch (error) {
      if (mounted.current)
        setNotice(
          error instanceof Error
            ? error.message
            : "The pull could not finish. Saved results are kept.",
        );
    } finally {
      if (mounted.current) setBusy(false);
    }
  };
  return (
    <section
      aria-label={name + " pull control"}
      className="mb-5 rounded-lg border border-border bg-surface p-4"
    >
      <h2 className="font-display text-xl text-fg">Fresh uploads. Saved archive progress.</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
        Recent uploads and older videos keep separate check times and retry state. Live checks use
        their own lane. A failed creator does not erase saved videos or reset an older-video
        position.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted">
        {[
          ["Recent checks", checked + " / " + channels.length],
          ["Archive positions", archives],
          ["Recent checks need attention", failed.length],
        ].map(([label, value]) => (
          <div key={label} className="min-w-0 rounded-md bg-bg/45 p-3">
            <p>{label}</p>
            <p className="mt-1 text-lg text-fg">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-0 basis-full flex-1 text-xs text-muted sm:basis-auto">
          Creators
          <select
            aria-label={name + " pull creators"}
            className="mt-1 block min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg"
            disabled={busy || refreshing || remoteBusy}
            value={creator}
            onChange={(event) => setCreator(event.target.value)}
          >
            <option value="all">Next 12 eligible creators · oldest attempt first</option>
            {channels.map((row) => (
              <option key={row.id} value={row.id}>
                {row.title}
              </option>
            ))}
          </select>
        </label>
        <Button
          className="min-h-11"
          disabled={busy || refreshing || remoteBusy || !channels.length}
          onClick={() => void start(false)}
        >
          Check recent uploads
        </Button>
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={busy || refreshing || remoteBusy || !channels.length}
          onClick={() => void start(true)}
        >
          Continue older videos
        </Button>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">
        Recent checks rotate across the full follow list and save their own progress. Older pulls
        use the existing archive budgets and saved continuations. Pause or cancel using the app’s
        Pull controls.
      </p>
      {active?.provider === kind && refreshing && (
        <p role="status" className="mt-3 text-sm text-accent">
          {active.done} / {active.total} creators · {active.received.toLocaleString()} returned
        </p>
      )}
      {notice && (
        <p role="status" className="mt-3 text-sm text-accent">
          {notice}
        </p>
      )}
      {failed.length > 0 && (
        <details className="mt-3 text-xs text-muted">
          <summary className="min-h-11 cursor-pointer">
            Recent upload checks needing attention · {failed.length}
          </summary>
          <ul className="space-y-3">
            {failed.slice(0, 8).map((row) => (
              <li key={row.id}>
                <p className="font-medium text-fg">{row.title}</p>
                <p>{row.recentPull?.failure?.message}</p>
                {row.recentPull?.retryAt && (
                  <p>
                    Retry after {new Date(row.recentPull.retryAt).toLocaleTimeString()} · saved
                    results kept
                  </p>
                )}
              </li>
            ))}
          </ul>
          {failed.length > 8 && (
            <p className="mt-2">{failed.length - 8} more creators have a saved retry wait.</p>
          )}
        </details>
      )}
    </section>
  );
}
