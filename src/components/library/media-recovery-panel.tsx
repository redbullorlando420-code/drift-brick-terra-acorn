import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLibrary, isAdultVideo } from "@/lib/videos/store";
import {
  hydrateMediaHealth,
  mediaHealthSnapshot,
  subscribeMediaHealth,
  isCatalogDeleted,
  forgetMediaObservation,
} from "@/lib/videos/persist";
import { mediaStatusLabel, mediaBasis } from "@/lib/videos/media-health";
import { collectRecoveryGroups, type RecoveryGroup } from "@/lib/videos/media-recovery-groups";
import type { LibraryVideo } from "@/lib/videos/types";
import { FileIdentityReview } from "./file-identity-panel";
import { twitchIdentity } from "@/lib/videos/twitch-identity";

export function MediaHealthActions({ video }: { video: LibraryVideo }) {
  const ledger = useSyncExternalStore(
      subscribeMediaHealth,
      mediaHealthSnapshot,
      mediaHealthSnapshot,
    ),
    check = useLibrary((s) => s.checkMediaHealth),
    folders = useLibrary((s) => s.folders),
    unlocked = useLibrary((s) => s.adultsUnlocked);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    work = useRef<AbortController | undefined>(undefined),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    void hydrateMediaHealth().catch((e) =>
      setError(e instanceof Error ? e.message : "Recovery could not load."),
    );
    return () => {
      alive.current = false;
      work.current?.abort();
    };
  }, []);
  if (video.isSample || !mediaBasis(video)) return null;
  if (isAdultVideo(video, folders) && !unlocked)
    return <p className="text-xs text-muted">Unlock private media to review availability.</p>;
  const row = ledger.entries[video.id];
  return (
    <section
      aria-label="Selected media availability"
      className="mt-4 space-y-2 rounded-md border border-border p-3"
    >
      <p className="text-xs text-muted">
        {row ? mediaStatusLabel(row.status) : "Availability has not been checked."}{" "}
        {row?.lastConfirmed && row.status !== row.lastConfirmed
          ? "Previous verified observation kept."
          : ""}
      </p>
      <p className="text-xs leading-5 text-muted">
        {video.remote
          ? "Checks only this public Twitch VOD or clip. An embed error does not prove expiry, deletion or access rights."
          : "Checks only this selected file and its granted source. No file is deleted or moved."}
      </p>
      <Button
        variant="secondary"
        className="min-h-11"
        disabled={busy}
        onClick={() => {
          const controller = new AbortController();
          work.current = controller;
          setBusy(true);
          setError("");
          void check(video, controller.signal)
            .catch((e) => {
              if (alive.current) setError(e instanceof Error ? e.message : "Check failed.");
            })
            .finally(() => {
              if (alive.current) setBusy(false);
            });
        }}
      >
        {busy ? "Checking selected title…" : "Check selected title availability"}
      </Button>
      {busy && (
        <Button variant="ghost" className="min-h-11" onClick={() => work.current?.abort()}>
          Cancel availability check
        </Button>
      )}
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
    </section>
  );
}

export function MediaRecoveryPanel() {
  const ledger = useSyncExternalStore(
      subscribeMediaHealth,
      mediaHealthSnapshot,
      mediaHealthSnapshot,
    ),
    unlocked = useLibrary((s) => s.adultsUnlocked),
    check = useLibrary((s) => s.checkMediaHealth),
    choose = useLibrary((s) => s.chooseMediaRecovery),
    remove = useLibrary((s) => s.removeVideo),
    reconnect = useLibrary((s) => s.reconnectMediaSource),
    rescan = useLibrary((s) => s.restoreOne),
    addFolder = useLibrary((s) => s.addFolder);
  const [query, setQuery] = useState(""),
    [open, setOpen] = useState(false),
    [groups, setGroups] = useState<RecoveryGroup[]>([]),
    [all, setAll] = useState(false),
    [limit, setLimit] = useState(12),
    [busy, setBusy] = useState(""),
    [cancelable, setCancelable] = useState(false),
    [note, setNote] = useState(""),
    [error, setError] = useState(""),
    [selected, setSelected] = useState<LibraryVideo>(),
    [confirm, setConfirm] = useState<LibraryVideo>(),
    [forget, setForget] = useState<LibraryVideo>();
  const work = useRef<AbortController | undefined>(undefined),
    alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    void hydrateMediaHealth().catch((e) =>
      setError(e instanceof Error ? e.message : "Recovery records could not load."),
    );
    return () => {
      alive.current = false;
      work.current?.abort();
    };
  }, []);
  const refresh = async (signal: AbortSignal, includeAll = all) => {
    await hydrateMediaHealth();
    signal.throwIfAborted();
    const state = useLibrary.getState(),
      next = await collectRecoveryGroups(
        state.videos,
        state.folders,
        state.unavailable,
        mediaHealthSnapshot(),
        includeAll,
        signal,
        query,
        state.adultsUnlocked,
      );
    signal.throwIfAborted();
    if (alive.current)
      setGroups(
        next
          .map((group) => ({
            ...group,
            videos: group.videos.filter((video) => !isCatalogDeleted(video)),
          }))
          .filter((group) => group.videos.length),
      );
  };
  const run = (label: string, canCancel: boolean, task: (signal: AbortSignal) => Promise<void>) => {
    if (busy) return;
    const controller = new AbortController();
    work.current = controller;
    setBusy(label);
    setCancelable(canCancel);
    setError("");
    setNote("");
    void task(controller.signal)
      .catch((e) => {
        if (alive.current)
          setError(
            e instanceof Error ? e.message : "Recovery failed. Existing bookmarks were kept.",
          );
      })
      .finally(() => {
        if (alive.current) {
          setBusy("");
          setCancelable(false);
        }
      });
  };
  return (
    <section
      aria-label="Media recovery"
      className="mt-5 space-y-3 rounded-lg border border-border bg-elevated p-5"
    >
      <h2 className="font-display text-2xl">Media recovery</h2>
      <p className="text-sm leading-6 text-muted">
        Review unavailable Twitch videos and disconnected local sources without losing bookmarks,
        ratings, notes or resume. Checks start only from these controls. A missing drive or a
        temporary error never proves deletion.
      </p>
      <p className="text-xs text-muted">
        {Object.keys(ledger.entries).length}/1,024 recovery records. Source groups retain at most 20
        visible candidates each; refresh after repairing a batch to find the next entries. Saved
        recovery choices travel with library backups.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          className="min-h-11"
          disabled={!!busy}
          onClick={() => {
            setOpen(true);
            run("Preparing review", true, (signal) => refresh(signal));
          }}
        >
          {open ? "Refresh affected media" : "Review affected media"}
        </Button>
        {open && (
          <>
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={!!busy}
              onClick={() => {
                const next = !all;
                setAll(next);
                run("Preparing review", true, (signal) => refresh(signal, next));
              }}
            >
              {all ? "Show unresolved only" : "Include checked bookmarks"}
            </Button>
            <Button
              variant="ghost"
              className="min-h-11"
              disabled={!!busy}
              onClick={() => {
                setOpen(false);
                setGroups([]);
                setSelected(undefined);
              }}
            >
              Close media review
            </Button>
          </>
        )}
      </div>
      {open && (
        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
          <Input
            aria-label="Find an affected title"
            value={query}
            disabled={!!busy}
            placeholder="Search affected title names"
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button
            variant="secondary"
            className="min-h-11"
            disabled={!!busy}
            onClick={() => run("Finding affected titles", true, (signal) => refresh(signal))}
          >
            Find affected titles
          </Button>
        </div>
      )}
      {open && !busy && !groups.length && (
        <p className="text-sm text-muted">
          No affected media in this view. Open a title preview to check an individual Twitch item or
          local file.
        </p>
      )}
      {open &&
        groups.slice(0, limit).map((group) => (
          <section
            key={group.id}
            aria-label={
              group.private && !unlocked
                ? "Private source recovery"
                : "Recovery source " + group.name
            }
            className="space-y-3 rounded-md border border-border bg-bg p-4"
          >
            <h3 className="break-words font-medium">
              {group.private && !unlocked ? "Private source" : group.name} · {group.count} affected
            </h3>
            {group.private && !unlocked ? (
              <p className="text-sm text-muted">Unlock private media to review this source.</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    className="min-h-11 max-w-full whitespace-normal"
                    disabled={!!busy}
                    onClick={() =>
                      run("Checking selected source entries", true, async (signal) => {
                        let done = 0;
                        for (const video of group.videos) {
                          signal.throwIfAborted();
                          if (isCatalogDeleted(video)) continue;
                          await check(video, signal);
                          done++;
                          if (alive.current)
                            setNote(
                              "Checked " +
                                done +
                                " / " +
                                group.videos.length +
                                " selected entries. Earlier results stay saved if cancelled.",
                            );
                        }
                        await refresh(signal);
                      })
                    }
                  >
                    Check next {group.videos.length}{" "}
                    {group.videos.length === 1 ? "entry" : "entries"}
                  </Button>
                  {!group.remote && (
                    <>
                      <Button
                        variant="secondary"
                        className="min-h-11"
                        disabled={!!busy}
                        onClick={() =>
                          run("Reconnecting source", false, async () => {
                            await reconnect(group.id);
                            setNote(
                              "Folder access granted. Check the selected entries or explicitly rescan this folder.",
                            );
                          })
                        }
                      >
                        Reconnect permission
                      </Button>
                      <Button
                        variant="secondary"
                        className="min-h-11"
                        disabled={!!busy}
                        onClick={() =>
                          run("Rescanning selected source", false, async (signal) => {
                            await rescan(group.id);
                            await refresh(signal);
                            setNote(
                              "Selected folder rescanned. Missing bookmarks and all saved marks were retained.",
                            );
                          })
                        }
                      >
                        Rescan this folder
                      </Button>
                    </>
                  )}
                </div>
                {group.videos.map((video) => {
                  const row = ledger.entries[video.id],
                    identity = video.remote
                      ? twitchIdentity(video.remote, video.extension)
                      : undefined,
                    url =
                      identity?.kind === "vod"
                        ? "https://www.twitch.tv/videos/" + identity.value
                        : identity?.kind === "clip"
                          ? "https://clips.twitch.tv/" + identity.value
                          : undefined;
                  return (
                    <article key={video.id} className="space-y-2 rounded-md bg-elevated p-3">
                      <h4 className="break-words text-sm font-medium">{video.name}</h4>
                      <p className="text-xs leading-5 text-muted">
                        {row
                          ? mediaStatusLabel(row.status)
                          : "Source access or legacy playback error needs checking."}
                        {row?.at ? " · " + new Date(row.at).toLocaleString() : ""}
                        {row?.lastConfirmed && row.status !== row.lastConfirmed
                          ? " · Previous verified observation kept."
                          : ""}{" "}
                        {row?.choice === "hidden"
                          ? "Hidden by your recovery choice."
                          : row?.choice === "bookmark"
                            ? "Kept as a bookmark."
                            : ""}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          className="min-h-11"
                          disabled={!!busy}
                          onClick={() =>
                            run("Checking selected title", true, async (signal) => {
                              await check(video, signal);
                              setNote("Selected title checked. No visibility choice changed.");
                            })
                          }
                        >
                          Check this title
                        </Button>
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center text-xs text-accent"
                          >
                            Open official Twitch page
                          </a>
                        )}
                        {!video.remote && (
                          <Button
                            variant="secondary"
                            className="min-h-11"
                            disabled={!!busy}
                            onClick={() => setSelected(video)}
                          >
                            Review verified identity
                          </Button>
                        )}
                        {row && (
                          <>
                            <Button
                              variant="secondary"
                              className="min-h-11"
                              disabled={!!busy}
                              onClick={() =>
                                run("Saving bookmark choice", false, async () => {
                                  await choose(video.id, "bookmark");
                                  setNote(
                                    "Bookmark retained. Saved feedback is unchanged; playback availability is separate.",
                                  );
                                })
                              }
                            >
                              Keep bookmark
                            </Button>
                            <Button
                              variant="secondary"
                              className="min-h-11"
                              disabled={!!busy}
                              onClick={() =>
                                run("Saving hidden choice", false, async () => {
                                  await choose(video.id, "hidden");
                                  setNote(
                                    "Hidden from browsing. Keep bookmark reverses this choice; no source media was deleted.",
                                  );
                                })
                              }
                            >
                              Hide from browsing
                            </Button>
                            <Button
                              variant="ghost"
                              className="min-h-11"
                              disabled={!!busy}
                              onClick={() => setConfirm(video)}
                            >
                              Remove saved title
                            </Button>
                            <Button
                              variant="ghost"
                              className="min-h-11"
                              disabled={!!busy}
                              onClick={() => setForget(video)}
                            >
                              Forget check record
                            </Button>
                          </>
                        )}
                      </div>
                    </article>
                  );
                })}
              </>
            )}
          </section>
        ))}
      {open && groups.length > limit && (
        <Button variant="secondary" className="min-h-11" onClick={() => setLimit((n) => n + 12)}>
          Show 12 more source groups
        </Button>
      )}
      {selected && (
        <>
          <FileIdentityReview
            key={selected.id}
            video={selected}
            onComplete={() => setSelected(undefined)}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              className="min-h-11"
              disabled={!!busy}
              onClick={() => run("Adding destination source", false, () => addFolder())}
            >
              Add destination folder
            </Button>
            <Button variant="ghost" className="min-h-11" onClick={() => setSelected(undefined)}>
              Close identity repair
            </Button>
          </div>
        </>
      )}
      {confirm && (
        <div
          role="group"
          aria-label="Confirm recovery removal"
          className="space-y-3 rounded-md border border-border p-4"
        >
          <p className="break-words text-sm">
            Remove{" "}
            {isAdultVideo(confirm, useLibrary.getState().folders) && !unlocked
              ? "this private title"
              : confirm.name}{" "}
            from the saved catalog? Its source file is untouched. Ratings, notes, history and resume
            stay saved. Restore this one title in Settings → Removed titles; recovery records do not
            expire automatically.
          </p>
          <Button
            variant="secondary"
            className="min-h-11"
            disabled={!!busy}
            onClick={() => setConfirm(undefined)}
          >
            Cancel removal
          </Button>
          <Button
            className="min-h-11"
            disabled={!!busy || (isAdultVideo(confirm, useLibrary.getState().folders) && !unlocked)}
            onClick={() =>
              run("Removing selected title", false, async (signal) => {
                await remove(confirm.id);
                if (!isCatalogDeleted(confirm))
                  throw Error("Removal was not saved. Existing title was kept.");
                setConfirm(undefined);
                await refresh(signal);
                setNote(
                  "Title removed. Restore it individually from Removed titles; saved marks were kept.",
                );
              })
            }
          >
            Confirm remove saved title
          </Button>
        </div>
      )}
      {forget && (
        <div
          role="group"
          aria-label="Confirm forget recovery record"
          className="space-y-3 rounded-md border border-border p-4"
        >
          <p className="text-sm">
            Forget this selected availability check and its recovery-choice timestamp? The title,
            source media, ratings, notes, history and resume stay unchanged. Current hidden state
            stays unchanged. Export a backup first to retain this diagnostic; a forgotten check has
            no automatic Undo.
          </p>
          <Button
            variant="secondary"
            className="min-h-11"
            disabled={!!busy}
            onClick={() => setForget(undefined)}
          >
            Keep check record
          </Button>
          <Button
            className="min-h-11"
            disabled={!!busy || (isAdultVideo(forget, useLibrary.getState().folders) && !unlocked)}
            onClick={() =>
              run("Forgetting selected check", false, async (signal) => {
                await forgetMediaObservation(forget.id);
                setForget(undefined);
                await refresh(signal);
                setNote(
                  "Selected check record forgotten. Saved media and personal marks were kept.",
                );
              })
            }
          >
            Confirm forget check record
          </Button>
        </div>
      )}
      {busy && (
        <p role="status" className="text-sm text-muted">
          {busy}…
        </p>
      )}
      {busy && cancelable && (
        <Button variant="secondary" className="min-h-11" onClick={() => work.current?.abort()}>
          Cancel remaining checks
        </Button>
      )}
      {note && (
        <p role="status" className="text-sm text-accent">
          {note}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
