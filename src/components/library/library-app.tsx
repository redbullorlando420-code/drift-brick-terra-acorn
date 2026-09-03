import { useEffect, useMemo, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Lock } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar";
import { TopBar } from "./top-bar";
import { InviteStrip } from "./invite";
import { VideoGrid } from "./video-grid";
import { Billboard, PosterGrid, TitleRail } from "./browse";
import { PinGate } from "./pin-gate";
import { Player } from "./player";
import { ConnectPanel } from "./connect-panel";
import {
  selectClassics,
  selectContinue,
  selectFavorites,
  selectFeatured,
  selectHistory,
  selectLive,
  selectTwitch,
  selectVisible,
  selectYoutube,
  useLibrary,
  userFolderCount,
} from "@/lib/videos/store";
import { DEMO_FOLDER_ID } from "@/lib/videos/samples";
import type { WellKnownStart } from "@/lib/videos/types";
import { isClassicVideo } from "@/lib/videos/types";

export function LibraryApp() {
  const dirInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingAdult = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);

  const restoreFolders = useLibrary((s) => s.restoreFolders);
  const addFolder = useLibrary((s) => s.addFolder);
  const ingestFromInput = useLibrary((s) => s.ingestFromInput);
  const ingestDrop = useLibrary((s) => s.ingestDrop);
  const clearHistory = useLibrary((s) => s.clearHistory);
  const folders = useLibrary((s) => s.folders);
  const sourceId = useLibrary((s) => s.sourceId);
  const query = useLibrary((s) => s.query);
  const scanning = useLibrary((s) => s.scanning);
  const activeId = useLibrary((s) => s.activeId);
  const hideDemo = useLibrary((s) => s.hideDemo);
  const history = useLibrary((s) => s.history);
  const adultsUnlocked = useLibrary((s) => s.adultsUnlocked);
  const videos = useLibrary(useShallow(selectVisible));
  const continueVideos = useLibrary(useShallow((s) => selectContinue(s, false)));
  const favoriteVideos = useLibrary(useShallow((s) => selectFavorites(s, false)));
  const historyVideos = useLibrary(useShallow((s) => selectHistory(s, false)));
  const classics = useLibrary(useShallow(selectClassics));
  const featured = useLibrary((s) => selectFeatured(s, s.sourceId === "adults"));
  const youtubeVideos = useLibrary(useShallow(selectYoutube));
  const twitchVideos = useLibrary(useShallow(selectTwitch));
  const liveVideos = useLibrary(useShallow(selectLive));
  const adultContinue = useLibrary(useShallow((s) => selectContinue(s, true)));
  const adultFavorites = useLibrary(useShallow((s) => selectFavorites(s, true)));
  const adultHistory = useLibrary(useShallow((s) => selectHistory(s, true)));
  const hasUserFolders = userFolderCount(folders) > 0;
  const publicFolders = folders.filter(
    (f) => f.kind !== "demo" && f.kind !== "youtube" && f.kind !== "twitch" && !f.adult,
  );
  const adultFolders = folders.filter((f) => f.adult);

  useEffect(() => {
    void restoreFolders();
  }, [restoreFolders]);

  const refreshFollows = useLibrary((s) => s.refreshFollows);
  const pushNotice = useLibrary((s) => s.pushNotice);
  const follows = useLibrary((s) => s.follows);

  useEffect(() => {
    if (!follows.length) return;
    let cancelled = false;
    const tick = async () => {
      const { wentLive, newVideos } = await refreshFollows();
      if (cancelled) return;
      for (const ch of wentLive) {
        pushNotice({
          title: `${ch.title} is live`,
          body: "Tap to watch in Reelcase.",
          kind: "twitch",
          videoId: `tw:${ch.handle}:live`,
        });
      }
      for (const v of newVideos.slice(0, 3)) {
        pushNotice({
          title: v.name,
          body: v.remote?.channelName ?? "New on YouTube",
          kind: "youtube",
          videoId: v.id,
        });
      }
    };
    const id = window.setInterval(() => void tick(), 90_000);
    const first = window.setTimeout(() => void tick(), 4000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [follows.length, refreshFollows, pushNotice]);

  const prevScanning = useRef<typeof scanning>(null);
  useEffect(() => {
    const was = prevScanning.current;
    prevScanning.current = scanning;
    if (was && !scanning) {
      const folder = useLibrary.getState().folders.find((f) => f.name === was.folderName);
      const n = folder?.videoCount ?? 0;
      if (n === 0) toast.message(`No videos in ${was.folderName}`);
      else toast.success(`Found ${n} video${n === 1 ? "" : "s"} in ${was.folderName}`);
    }
  }, [scanning]);

  useEffect(() => {
    let depth = 0;
    const prevent = (e: DragEvent) => e.preventDefault();
    const enter = (e: DragEvent) => {
      e.preventDefault();
      depth += 1;
      setDragging(true);
    };
    const leave = (e: DragEvent) => {
      e.preventDefault();
      depth -= 1;
      if (depth <= 0) {
        depth = 0;
        setDragging(false);
      }
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      depth = 0;
      setDragging(false);
      if (!e.dataTransfer) return;
      void ingestDrop(e.dataTransfer).catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Could not read files");
      });
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", drop);
    };
  }, [ingestDrop]);

  const heading = useMemo(() => {
    if (sourceId === "continue") return "Continue watching";
    if (sourceId === "favorites") return "Favorites";
    if (sourceId === "history") return "History";
    if (sourceId === "movies") return "Movies";
    if (sourceId === "home") return "Home";
    if (sourceId === "adults") return "Adults";
    if (sourceId === "youtube") return "YouTube";
    if (sourceId === "twitch") return "Twitch";
    if (sourceId === "live") return "Live";
    return folders.find((f) => f.id === sourceId)?.name ?? "Library";
  }, [sourceId, folders]);

  const onAddFolder = (startIn?: WellKnownStart, adult?: boolean) => {
    pendingAdult.current = Boolean(adult);
    void addFolder(dirInputRef.current, startIn, { adult }).catch((err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Could not open folder");
    });
  };

  const playlist = videos.map((v) => v.id);
  const playedAt = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of history) map[h.id] = h.at;
    return map;
  }, [history]);

  const browsing =
    !query &&
    (sourceId === "home" ||
      sourceId === "movies" ||
      sourceId === "adults" ||
      sourceId === "youtube" ||
      sourceId === "twitch" ||
      sourceId === "live");
  const lockedAdults = sourceId === "adults" && !adultsUnlocked;

  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-border bg-surface/80 px-3 py-5 lg:block">
        <SidebarNav
          onAddFolder={(adult) => onAddFolder(undefined, adult)}
        />
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="bg-surface p-4">
          <SheetTitle className="sr-only">Library menu</SheetTitle>
          <SidebarNav
            onAddFolder={(adult) => {
              setMenuOpen(false);
              onAddFolder(undefined, adult);
            }}
            onNavigate={() => setMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setMenuOpen(true)} onAddFiles={() => fileInputRef.current?.click()} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
          {lockedAdults ? (
            <PinGate />
          ) : (
            <>
              {!hasUserFolders && sourceId === "home" && (
                <InviteStrip
                  onAddFolder={() => onAddFolder()}
                  onAddFiles={() => fileInputRef.current?.click()}
                  onRecommended={(id) => onAddFolder(id)}
                />
              )}
              {(sourceId === "home" || sourceId === "youtube" || sourceId === "twitch") &&
                !query && (
                  <ConnectPanel
                    defaultKind={sourceId === "twitch" ? "twitch" : "youtube"}
                  />
                )}

              {sourceId === "home" && !query && featured && <Billboard video={featured} />}
              {sourceId === "movies" && !query && (classics[0] || featured) && (
                <Billboard video={classics[0] ?? featured!} />
              )}
              {sourceId === "adults" && adultsUnlocked && featured && (
                <Billboard video={featured} />
              )}

              {sourceId === "home" && browsing && (
                <>
                  <TitleRail title="Live now" videos={liveVideos} variant="rail" />
                  <TitleRail title="Continue watching" videos={continueVideos} variant="rail" />
                  <TitleRail title="From YouTube" videos={youtubeVideos} variant="rail" />
                  <TitleRail title="Twitch" videos={twitchVideos} variant="rail" />
                  <TitleRail title="Favorites" videos={favoriteVideos} variant="poster" />
                  <TitleRail title="Classic movies" videos={classics} variant="poster" />
                  <TitleRail title="History" videos={historyVideos} variant="rail" playedAt={playedAt} />
                  {publicFolders.map((folder) => (
                    <TitleRail
                      key={folder.id}
                      title={folder.name}
                      videos={videos.filter((v) => v.folderId === folder.id)}
                      variant="rail"
                    />
                  ))}
                </>
              )}

              {sourceId === "youtube" && browsing && (
                <>
                  <TitleRail title="Latest" videos={youtubeVideos} variant="rail" />
                  <PosterGrid videos={videos} />
                </>
              )}

              {sourceId === "twitch" && browsing && (
                <>
                  <TitleRail title="Live" videos={liveVideos} variant="rail" />
                  <TitleRail title="Recent" videos={twitchVideos.filter((v) => !v.remote?.live)} variant="rail" />
                  {!twitchVideos.length && (
                    <p className="text-sm text-muted">Follow a channel above to fill this shelf.</p>
                  )}
                </>
              )}

              {sourceId === "live" && browsing && (
                <>
                  {liveVideos.length ? (
                    <PosterGrid videos={liveVideos} />
                  ) : (
                    <div className="rounded-xl bg-surface px-6 py-16 text-center shadow-border">
                      <p className="font-display text-2xl text-fg">Nobody you follow is live</p>
                      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                        Add Twitch channels. Reelcase checks them and pings Notifications when they go live.
                      </p>
                    </div>
                  )}
                </>
              )}

              {sourceId === "movies" && browsing && (
                <>
                  <TitleRail title="Classic movies" videos={classics} variant="poster" />
                  <TitleRail
                    title="All movies"
                    videos={videos.filter((v) => !isClassicVideo(v))}
                    variant="poster"
                  />
                  {classics.length === 0 && videos.length === 0 ? null : null}
                </>
              )}

              {sourceId === "adults" && adultsUnlocked && browsing && (
                <>
                  <TitleRail title="Continue watching" videos={adultContinue} variant="rail" />
                  <TitleRail title="Favorites" videos={adultFavorites} variant="poster" />
                  <TitleRail title="History" videos={adultHistory} variant="rail" playedAt={playedAt} />
                  {adultFolders.map((folder) => (
                    <TitleRail
                      key={folder.id}
                      title={folder.name}
                      videos={videos.filter((v) => v.folderId === folder.id)}
                      variant="rail"
                    />
                  ))}
                  {adultFolders.length === 0 && (
                    <div className="rounded-xl bg-surface px-6 py-14 text-center shadow-border">
                      <Lock className="mx-auto size-6 text-muted" />
                      <p className="mt-3 font-display text-2xl text-fg">No private folders yet</p>
                      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                        Add a private folder, or lock an existing source. Those titles stay off Home,
                        Movies, and Favorites.
                      </p>
                      <Button className="mt-5" onClick={() => onAddFolder(undefined, true)}>
                        Add private folder
                      </Button>
                    </div>
                  )}
                </>
              )}

              {sourceId === "favorites" && !query && favoriteVideos.length > 0 && (
                <div className="mb-6">
                  <h1 className="font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl">
                    Favorites
                  </h1>
                  <p className="mt-2 text-sm text-muted">Your list, on this computer.</p>
                </div>
              )}

              {sourceId === "favorites" && !query ? (
                favoriteVideos.length ? (
                  <PosterGrid videos={favoriteVideos} />
                ) : (
                  <div className="rounded-xl bg-surface px-6 py-16 text-center shadow-border">
                    <p className="font-display text-2xl text-fg">Nothing in Favorites</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                      Heart a title or use My List on the billboard.
                    </p>
                  </div>
                )
              ) : null}

              {(sourceId === "history" ||
                sourceId === "continue" ||
                query ||
                (!browsing &&
                  sourceId !== "favorites" &&
                  sourceId !== "home" &&
                  sourceId !== "movies" &&
                  sourceId !== "adults")) && (
                <>
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <h1 className="font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl">
                        {query ? "Search" : heading}
                      </h1>
                      <p className="mt-2 text-sm text-muted">
                        {scanning
                          ? `Scanning ${scanning.folderName} · ${scanning.found} found`
                          : `${videos.length} video${videos.length === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    {sourceId === "history" && history.length > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearHistory}>
                        Clear history
                      </Button>
                    )}
                  </div>
                  {sourceId === "history" || sourceId === "continue" || query ? (
                    <VideoGrid
                      videos={videos}
                      playedAt={sourceId === "history" ? playedAt : undefined}
                    />
                  ) : (
                    <PosterGrid videos={videos} />
                  )}
                </>
              )}

              {sourceId === DEMO_FOLDER_ID && (
                <p className="mt-8 text-center text-xs text-subtle">
                  Original shorts styled as classics. Add a folder to scan this computer.
                </p>
              )}
            </>
          )}
        </main>
      </div>

      {activeId && <Player playlist={playlist} />}

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-bg/80">
          <div className="rounded-xl bg-surface px-8 py-6 text-center shadow-border shadow-lift">
            <p className="font-display text-2xl text-fg">Drop to add</p>
            <p className="mt-1 text-sm text-muted">Folders or video files</p>
          </div>
        </div>
      )}

      <input
        ref={dirInputRef}
        type="file"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
        onChange={(e) => {
          const files = e.target.files;
          const adult = pendingAdult.current;
          pendingAdult.current = false;
          if (files?.length) {
            void ingestFromInput(files, true, { adult }).catch((err: unknown) => {
              toast.error(err instanceof Error ? err.message : "Could not read folder");
            });
          }
          e.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length) {
            void ingestFromInput(files, false).catch((err: unknown) => {
              toast.error(err instanceof Error ? err.message : "Could not read files");
            });
          }
          e.target.value = "";
        }}
      />

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-elevated text-fg shadow-border border-0",
            title: "text-fg",
            description: "text-muted",
          },
        }}
      />
    </div>
  );
}
