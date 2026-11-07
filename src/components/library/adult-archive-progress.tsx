import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import { ADULT_PULL_PROVIDERS } from "@/lib/videos/adult-providers";
import {
  ADULT_ARCHIVE_EVENT,
  ADULT_ARCHIVE_ORDERS,
  loadAdultArchiveCursors,
  hydrateAdultArchiveCursors,
  adultArchiveResumeStatus,
  subscribeAdultArchiveResume,
} from "@/lib/videos/adult-archive-cursors";
import {
  archiveOrdersFor,
  archiveOrderLabel,
  archiveCoverageState,
} from "@/lib/videos/adult-archive-coverage";
import {
  DEFAULT_PULL_SETTINGS,
  getPullSettings,
  subscribePullSettings,
  updatePullSettings,
  adultGrowthPreset,
} from "@/lib/pull-settings";
import { remoteEntryCounts, type EntryCounts } from "@/lib/videos/entry-limits";
import { adultGrowthCounts, type AdultGrowthCounts } from "@/lib/videos/adult-growth";
import {ArchiveWorkStatus} from './archive-work-window-panel';
import {explainAdultDiscovery} from '@/lib/videos/adult-discovery-plan';

const names: Record<string, string> = {
  eporner: "Eporner",
  redtube: "RedTube",
  chaturbate: "Chaturbate",
  myfreecams: "MyFreeCams",
  reddit: "Reddit",
  booru: "Booru",
  redgifs: "Redgifs",
};
export function AdultArchiveProgress() {
  const videos = useLibrary((s) => s.videos),
    folders = useLibrary((s) => s.folders),
    setSource = useLibrary((s) => s.setSource);
  const policy = useSyncExternalStore(
    subscribePullSettings,
    getPullSettings,
    () => DEFAULT_PULL_SETTINGS,
  );
  const resume = useSyncExternalStore(
    subscribeAdultArchiveResume,
    adultArchiveResumeStatus,
    adultArchiveResumeStatus,
  );
  const busy = useLibrary((s) => s.remoteBusy || s.refreshing);
  // Count snapshots must not keep an obsolete catalog alive while collapsed.
  const usage = useRef(new WeakMap<typeof videos, EntryCounts>());
  const growthUsage = useRef(new WeakMap<typeof videos, AdultGrowthCounts>());
  const [, refreshUsage] = useState(0);
  const [open, setOpen] = useState(false),
    [revision, setRevision] = useState(0),
    [note, setNote] = useState("");
  useEffect(() => {
    if (open && resume.phase === "idle") void hydrateAdultArchiveCursors().catch(() => {});
  }, [open, resume.phase]);
  useEffect(() => {
    if (!open) return;
    let alive = true;
    void remoteEntryCounts(videos)
      .then(async (counts) => [counts, await adultGrowthCounts(videos)] as const)
      .then(([counts, growth]) => {
        if (alive) {
          usage.current.set(videos, counts);
          growthUsage.current.set(videos, growth);
          refreshUsage((v) => v + 1);
        }
      });
    return () => {
      alive = false;
    };
  }, [videos, open]);
  useEffect(() => {
    const changed = () => setRevision((r) => r + 1);
    const storage = (event: StorageEvent) => {
      if (event.key === null || event.key === "reelcase.adult-archive-cursors.v1") changed();
    };
    window.addEventListener(ADULT_ARCHIVE_EVENT, changed);
    window.addEventListener("storage", storage);
    return () => {
      window.removeEventListener(ADULT_ARCHIVE_EVENT, changed);
      window.removeEventListener("storage", storage);
    };
  }, []);
  const counts = usage.current.get(videos);
  const growth = growthUsage.current.get(videos);
  const savedCount =
    counts?.adult ??
    folders.reduce(
      (sum, folder) =>
        sum +
        ((ADULT_PULL_PROVIDERS as readonly string[]).includes(folder.kind) ? folder.videoCount : 0),
      0,
    );
  const remaining = counts
    ? Math.max(
        0,
        Math.min(policy.adultMaxEntries - counts.adult, policy.remoteMaxEntries - counts.total),
      )
    : undefined;
  const lanes = useMemo(
    () =>
      open
        ? ADULT_ARCHIVE_ORDERS.map((order) => ({
            order,
            cursors: loadAdultArchiveCursors("all", order),
          }))
        : [],
    [revision, open],
  );
  return (
    <details
      onToggle={(event) => setOpen(event.currentTarget.open)}
      aria-label="Adult archive progress"
      className="mt-4 rounded-lg border border-border bg-surface p-4"
    >
      <summary className="min-h-11 cursor-pointer content-center font-medium text-fg">
        Archive growth · {savedCount.toLocaleString()} saved entries
      </summary>
      <div className="mt-3 space-y-3 text-sm leading-6 text-muted">
        {open && <ArchiveWorkStatus window={policy.archiveWorkWindow}/>}
        <p>
          Automatic archived-video goal:{" "}
          <strong className="text-fg">{policy.adultCatalogTarget.toLocaleString()}</strong> · Adults
          retention limit: {policy.adultMaxEntries.toLocaleString()} · Shared limit:{" "}
          {policy.remoteMaxEntries.toLocaleString()}.{" "}
          {remaining === undefined
            ? "Checking remaining capacity."
            : `${remaining.toLocaleString()} new-entry slots currently available.`}
        </p>
        <p>
          {!policy.automaticPulls
            ? "Automatic pulls are off."
            : counts && remaining === 0
              ? "A retention limit is full. Existing cleanup rules may rotate eligible older entries; review limits to grow the library."
              : growth && growth.archivedVideos >= policy.adultCatalogTarget
                ? "The automatic goal is reached. Increase it to continue growing."
                : "Automatic discovery continues while Adults is open and unlocked, the app is active, and pulls are allowed."}{" "}
          Photos and live rooms count toward retention limits, but do not fill the archived-video
          goal.
        </p>
        <div
          className="grid grid-cols-2 gap-2 lg:grid-cols-4"
          aria-label="Adult media counts"
          aria-busy={!growth}
        >
          {(
            [
              ["archivedVideos", "Archived videos"],
              ["photos", "Photos"],
              ["liveRooms", "Live room cards"],
              ["unknown", "Unclassified"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="rounded-md bg-bg/50 p-3">
              <strong className="block text-lg text-fg">
                {growth ? growth[key].toLocaleString() : "…"}
              </strong>
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>
        <p>
          Video archives keep separate saved positions for Latest, Most popular and rating/time
          listings. Repeated titles are skipped; one listing ending does not end the other archives.
          Existing pace, pause, data caps and provider cooldowns still apply.
        </p>
        <div aria-label="Archive resume storage" className="rounded-md border border-border p-3">
          <p className="text-xs">
            {resume.phase === "ready"
              ? "Resume positions saved with accepted catalog windows in this profile."
              : resume.phase === "error"
                ? resume.error
                : "Restoring saved archive positions…"}
          </p>
          <Button
            className="mt-2 min-h-11 max-w-full whitespace-normal"
            variant="secondary"
            disabled={busy || resume.phase === "loading"}
            onClick={() => void hydrateAdultArchiveCursors(true).catch(() => {})}
          >
            {resume.phase === "error" ? "Retry archive recovery" : "Refresh coverage"}
          </Button>
        </div>
        {open && resume.phase==='ready' && <div aria-label="Automatic source planning" className="rounded-md border border-border p-3">
          <p className="font-medium text-fg">Automatic source planning</p>
          <p className="text-xs">The oldest eligible source gets a guaranteed turn. Remaining compatible slots favor new entries and useful refreshes. Intervals, manual choices and provider cooldowns stay authoritative. This is a preview; it does not start a pull.</p>
          <ul className="mt-2 space-y-2">{explainAdultDiscovery(order=>lanes.find(lane=>lane.order===order)?.cursors??{},Date.now()).tasks.map(task=><li key={task.provider} className="text-xs" data-yield-provider={task.provider}>
            <strong className="text-fg">{names[task.provider]}</strong> · {task.reason} · {task.sample?`${task.sample.windows} sampled windows · useful-yield score ${(task.weight/10).toFixed(1)}%`:'No durable yield sample yet'}
          </li>)}</ul>
        </div>}
        {(policy.adultCatalogTarget < 250000 ||
          (policy.adultMaxEntries > 0 && policy.adultMaxEntries < 300000) ||
          policy.adultBatchVideos < 10000 ||
          policy.adultIntervalSeconds > 60 ||
          (policy.remoteMaxEntries > 0 && policy.remoteMaxEntries < 450000)) && (
          <Button
            className="min-h-11 h-auto max-w-full whitespace-normal"
            onClick={() => {
              const saved = updatePullSettings(adultGrowthPreset(policy));
              setNote(
                saved
                  ? "Larger archive growth saved: at least 10,000 candidates per pull, a 250,000-video goal and room for other providers. Disabled caps, pause and automatic-pull choices are preserved."
                  : "The higher goal is active for this tab, but browser storage could not save it. Free storage and retry after reload; prior saved preferences were kept.",
              );
            }}
          >
            Use larger archive growth
          </Button>
        )}
        <Button className="min-h-11" variant="secondary" onClick={() => setSource("settings")}>
          Review pull limits
        </Button>
        {note && <p role="status">{note}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          {ADULT_PULL_PROVIDERS.map((provider) => {
            const rows = lanes
                .flatMap((l) =>
                  l.cursors[provider] ? [{ ...l.cursors[provider]!, order: l.order }] : [],
                )
                .sort((a, b) => b.updatedAt - a.updatedAt),
              latest = rows[0],
              count = folders.find((f) => f.id === provider + ":discover")?.videoCount ?? 0;
            return (
              <div key={provider} className="rounded-md border border-border p-3">
                <p className="font-medium text-fg">
                  {names[provider]} · {count.toLocaleString()} saved
                </p>
                <p className="text-xs">
                  {!latest
                    ? "No saved discovery check yet."
                    : `${latest.order} · page ${latest.page}${latest.offset ? " + " + latest.offset : ""} · ${latest.rewound ? "restarting stable paging; saved entries kept" : latest.state === "failed" ? "last request failed; cursor kept" : latest.state === "exhausted" ? "current listing complete; scheduled for a later recheck" : "ready to continue"}`}
                </p>
                {latest?.added !== undefined && (
                  <p className="text-xs">
                    Last accepted window: {latest.added.toLocaleString()} new ·{" "}
                    {(latest.duplicates ?? 0).toLocaleString()} saved/repeated candidates skipped.
                  </p>
                )}
                {latest?.retryAt && latest.retryAt > Date.now() && (
                  <p className="text-xs">
                    Retry after {new Date(latest.retryAt).toLocaleTimeString()}.
                  </p>
                )}
                <details className="mt-2 border-t border-border pt-2" data-archive-lanes={provider}>
                  <summary className="min-h-11 cursor-pointer content-center text-xs font-medium text-fg">
                    {provider === "chaturbate" || provider === "myfreecams"
                      ? "Directory status"
                      : "Sort coverage and continuation"}
                  </summary>
                  {provider === "chaturbate" || provider === "myfreecams" ? (
                    <p className="text-xs">
                      Live roster pages are not video archives.{" "}
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2 min-h-11 max-w-full whitespace-normal"
                        onClick={() => setSource("live")}
                      >
                        Open Live directory
                      </Button>
                    </p>
                  ) : (
                    <>
                      <p className="mb-2 text-xs">
                        {provider === "reddit"
                          ? "Public feed rotation; page numbers are rotation positions."
                          : provider === "booru"
                            ? "Image pages use each host’s supported order."
                            : provider === "redgifs"
                              ? "Provider trending pages; independent date/rating sorts are not exposed."
                              : "Each listing keeps its own resume position. Page depth does not prove complete catalog coverage."}{" "}
                        Each action targets up to 400 entries.
                      </p>
                      {archiveOrdersFor(provider,rows.map(row=>row.order)).map((order) => {
                        const cursor = lanes.find((l) => l.order === order)?.cursors[provider],
                          providerRetry = Math.max(
                            0,
                            ...rows.filter((r) => r.state === "failed").map((r) => r.retryAt ?? 0),
                          ),
                          state = archiveCoverageState(cursor, Date.now(), providerRetry);
                        return (
                          <div
                            key={order}
                            data-archive-lane={provider + ":" + order}
                            className="mb-2 rounded-md bg-bg/50 p-3"
                          >
                            <p className="text-xs font-medium text-fg">
                              {provider === "eporner" || provider === "redtube"
                                ? archiveOrderLabel(order)
                                : provider === "reddit"
                                  ? `Feed rotation · ${archiveOrderLabel(order)} slot`
                                  : `Provider pages · ${archiveOrderLabel(order)} slot`}
                            </p>
                            <p className="text-xs">
                              {state.label}
                              {cursor
                                ? ` · page ${cursor.page}${cursor.offset ? " + " + cursor.offset : ""}`
                                : ""}
                            </p>
                            {cursor?.added !== undefined && (
                              <p className="text-xs">
                                Last window: {cursor.added} added · {cursor.duplicates ?? 0} repeats
                                · {cursor.received ?? 0} accepted candidates
                              </p>
                            )}
                            {state.retryAt > Date.now() && (
                              <p className="text-xs">
                                Retry after {new Date(state.retryAt).toLocaleTimeString()}.
                              </p>
                            )}
                            <Button
                              size="sm"
                              variant="secondary"
                              className="mt-2 min-h-11 h-auto max-w-full whitespace-normal"
                              aria-label={
                                "Continue " + names[provider] + " " + archiveOrderLabel(order)
                              }
                              disabled={busy || resume.phase !== "ready" || !state.canContinue}
                              onClick={() => {
                                setNote(
                                  "Continuing " +
                                    names[provider] +
                                    " · " +
                                    archiveOrderLabel(order) +
                                    "…",
                                );
                                void useLibrary
                                  .getState()
                                  .searchAdultFeed("all", order, {
                                    providers: [provider],
                                    resumeArchive: true,
                                    append: true,
                                    maxVideos: Math.min(400, policy.adultBatchVideos),
                                  })
                                  .then(() =>
                                    setNote(
                                      adultArchiveResumeStatus().phase === "error"
                                        ? adultArchiveResumeStatus().error ?? "Archive recovery needs attention."
                                        : 'Archive turn finished. Review the saved position and provider status below.',
                                    ),
                                  )
                                  .catch((error) =>
                                    setNote(
                                      error instanceof Error
                                        ? error.message
                                        : "Could not continue archive.",
                                    ),
                                  );
                              }}
                            >
                              Continue{" "}
                              {provider === "eporner" || provider === "redtube"
                                ? archiveOrderLabel(order)
                                : "pages"}
                            </Button>
                          </div>
                        );
                      })}
                    </>
                  )}
                </details>
              </div>
            );
          })}
        </div>
      </div>
    </details>
  );
}
