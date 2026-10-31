import { BatchStatusAnnouncement } from './batch-status-announcement';
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import { selectClipRefreshCreators } from "@/lib/videos/twitch-clip-refresh";
import { getPullCancellationRevision } from "@/lib/pull-control";
import { TwitchClipCoveragePanel } from "./twitch-clip-coverage-panel";
import { clipCoverageAction } from "@/lib/videos/twitch-clip-coverage";
type Result = {
  id: string;
  title: string;
  received: number;
  duplicates: number;
  pages: number;
  error?: string;
};
export function TwitchClipsControl() {
  const follows = useLibrary((s) => s.follows),
    pull = useLibrary((s) => s.followRemoteQuery),
    remoteBusy = useLibrary((s) => s.remoteBusy),
    refreshing = useLibrary((s) => s.refreshing);
  const channels = useMemo(
    () => follows.filter((row) => row.kind === "twitch" && !row.importNeedsReview),
    [follows],
  );
  const [creator, setCreator] = useState("all"),
    [limit, setLimit] = useState(50),
    [batch, setBatch] = useState(8),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [results, setResults] = useState<Result[]>([]),
    [progress, setProgress] = useState({ done: 0, total: 0 });
  const batchRevision = useRef(0);
  const stopped = useRef(false),
    mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stopped.current = true;
    };
  }, []);
  const start = async (mode: "recent" | "archive", focusedId?: string, fresh = false) => {
    if (busy || remoteBusy || refreshing) return;
    batchRevision.current++;
    const current = useLibrary.getState().follows,
      queue =
        !focusedId && creator === "all"
          ? selectClipRefreshCreators(current, mode, Date.now(), batch)
          : current.filter((row) => row.id === (focusedId ?? creator) && row.kind === "twitch");
    if (focusedId && queue[0]) {
      const eligibility = clipCoverageAction(queue[0], mode, Date.now());
      if (!eligibility.allowed) { setNotice(eligibility.reason); return; }
    }
    if (!queue.length) {
      setNotice(
        "No eligible creators in this clip lane. Retry waits and completed older shelves are skipped. Select a creator for an explicit retry.",
      );
      return;
    }
    const cancellation = getPullCancellationRevision();
    stopped.current = false;
    setBusy(true);
    setResults([]);
    setProgress({ done: 0, total: queue.length });
    let checked = 0,
      received = 0,
      duplicates = 0,
      failed = 0;
    try {
      for (const channel of queue) {
        if (
          stopped.current ||
          document.visibilityState === "hidden" ||
          getPullCancellationRevision() !== cancellation
        )
          break;
        if (!useLibrary.getState().follows.some((c) => c.id === channel.id)) continue;
        if (mounted.current)
          setNotice("Checking " + channel.title + " · " + (checked + 1) + " / " + queue.length);
        let row: Result = {
          id: channel.id,
          title: channel.title,
          received: 0,
          duplicates: 0,
          pages: 0,
        };
        try {
          await pull(channel.handle, "twitch", { clipLimit: limit, twitchClipMode: mode, ...(fresh ? {freshTwitchClips:true} : {}) });
          const saved = useLibrary.getState().follows.find((c) => c.id === channel.id);
          row = {
            ...row,
            received: saved?.lastResponseCount ?? 0,
            duplicates: saved?.twitchClipDiagnostics?.duplicates ?? 0,
            pages: saved?.twitchClipDiagnostics?.pages ?? 0,
            error: saved?.lastClipFailure?.message,
          };
        } catch (error) {
          row.error = error instanceof Error ? error.message : "Clip update failed.";
        }
        received += row.received;
        duplicates += row.duplicates;
        if (row.error) failed++;
        checked++;
        if (mounted.current) {
          setResults((rows) => [...rows, row]);
          setProgress({ done: checked, total: queue.length });
        }
        if (
          row.error &&
          /entry limit|pull cancelled|catalog pull is already running|\b429\b|rate.?limit|integrity|challenge/i.test(
            row.error,
          )
        )
          break;
      }
    } finally {
      if (mounted.current) {
        setBusy(false);
        setNotice(
          checked +
            " / " +
            queue.length +
            " creators checked · " +
            received +
            " clips returned (saved matches included) · " +
            duplicates +
            " repeated listings skipped · " +
            failed +
            " need attention" +
            (checked < queue.length
              ? " · remaining creators keep their place for the next batch."
              : "."),
        );
      }
    }
  };
  const archived = channels.filter((c) => c.twitchClipExhaustedAt).length;
  return (
    <section
      className="mb-5 rounded-lg border border-border bg-surface p-4"
      data-status-scope aria-label="Twitch clip updates"
    >
      <h2 className="font-display text-xl text-fg">Keep clips fresh.</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
        Discover clips across current, weekly and monthly public shelves. Overlapping listings are
        deduplicated; healthy windows continue after a partial failure. Older discovery resumes its
        saved all-time position.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-0 basis-full flex-1 text-xs text-muted sm:basis-auto">
          Creators
          <select
            aria-label="Clip update creators"
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            disabled={busy}
            className="mt-1 block min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg"
          >
            <option value="all">Next {batch} eligible creators · oldest attempt first</option>
            {channels.map((row) => (
              <option key={row.id} value={row.id}>
                {row.title}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Creators per batch
          <select
            aria-label="Clip creator batch size"
            value={batch}
            onChange={(e) => setBatch(Number(e.target.value))}
            disabled={busy || creator !== "all"}
            className="mt-1 block min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg"
          >
            {[8, 25, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} creators
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs text-muted">
          Per creator
          <select
            aria-label="Clip update count"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            disabled={busy}
            className="mt-1 block min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg"
          >
            {[25, 50, 100, 250, 500].map((n) => (
              <option key={n} value={n}>
                {n} clips
              </option>
            ))}
          </select>
        </label>
        <Button
          className="min-h-11"
          disabled={busy || remoteBusy || refreshing || !channels.length}
          onClick={() => void start("recent")}
        >
          Refresh recent clips
        </Button>
        <Button
          className="min-h-11"
          variant="secondary"
          disabled={busy || remoteBusy || refreshing || !channels.length}
          onClick={() => void start("archive")}
        >
          Continue older clips
        </Button>
        {busy && (
          <Button
            variant="secondary"
            className="min-h-11"
            onClick={() => {
              stopped.current = true;
              setNotice("Stopping after this creator; accepted clips will stay saved.");
            }}
          >
            Stop after this creator
          </Button>
        )}
      </div>
      <p className="mt-3 text-xs leading-5 text-muted">
        Up to 100 creators per explicit batch, one at a time, with at most eight clip pages per
        creator. Each creator is saved before continuing. Recent and older retries are independent;
        failed attempts rotate fairly after their wait. {archived} older shelves complete. Public
        clip windows rank highlights and may not expose every clip.
      </p>
      {busy && (
        <progress
          aria-label="Clip creator progress"
          className="mt-3 h-2 w-full accent-accent"
          value={progress.done}
          max={progress.total}
        />
      )}
      <BatchStatusAnnouncement id={String(batchRevision.current)} label="Twitch clip update" phase={busy?stopped.current?'waiting':'running':notice?'complete':'idle'} total={progress.total} outcome={notice}/>
      {notice && (
        <p className="mt-3 text-sm text-accent">
          {notice}
        </p>
      )}
      {results.length > 0 && (
        <details className="mt-3 text-xs text-muted" open={results.some((r) => r.error)}>
          <summary className="min-h-11 cursor-pointer">Creator results · {results.length}</summary>
          <ul aria-label="Clip creator results" className="max-h-72 space-y-3 overflow-y-auto">
            {results.map((row) => (
              <li key={row.id}>
                <p className="font-medium text-fg">{row.title}</p>
                <p>
                  {row.received} clips · {row.pages} pages · {row.duplicates} repeated listings
                  skipped
                </p>
                {row.error && (
                  <p className="mt-1">{row.error} Accepted clips and safe positions are kept.</p>
                )}
              </li>
            ))}
          </ul>
        </details>
      )}
      <TwitchClipCoveragePanel channels={channels} busy={busy || remoteBusy || refreshing} onPull={(mode,id,fresh)=>void start(mode,id,fresh)} />
    </section>
  );
}
