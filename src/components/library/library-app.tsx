import { useEffect, useMemo, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Lock, Shuffle } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar";
import { TopBar } from "./top-bar";
import { InviteStrip } from "./invite";
import { VideoGrid } from "./video-grid";
import { VideoCard } from "./video-card";
import { Billboard, PosterGrid, TitleRail } from "./browse";
import { PinGate } from "./pin-gate";
import { Player } from "./player";
import { PreVideo } from "./pre-video";
import { AiGuide } from "./ai-guide";
import { ConnectPanel } from "./connect-panel";
import {
  GamesSection,
  MissionPlanSection,
  PhotosSection,
  PrivateWebShortcuts,
  PrintsSection,
  SettingsSection,
  ShopSection,
  SocialSection,
  SpotifySection,
  StreamingSection,
  WatchRoomSection,
} from "./hub-sections";
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
  const [movieShuffle, setMovieShuffle] = useState(0);
  const [adultTag, setAdultTag] = useState("All");
  const [adultSort, setAdultSort] = useState<"recent" | "name" | "favorites">("recent");
  const [twitchSort, setTwitchSort] = useState<"live" | "viewers" | "name">("live");
  const [liveColumns, setLiveColumns] = useState(4);

  const restoreFolders = useLibrary((s) => s.restoreFolders);
  const openVideo = useLibrary((s) => s.openVideo);
  const addFolder = useLibrary((s) => s.addFolder);
  const ingestFromInput = useLibrary((s) => s.ingestFromInput);
  const ingestDrop = useLibrary((s) => s.ingestDrop);
  const clearHistory = useLibrary((s) => s.clearHistory);
  const folders = useLibrary((s) => s.folders);
  const sourceId = useLibrary((s) => s.sourceId);
  const setSource = useLibrary((s) => s.setSource);
  const hydrated = useLibrary((s) => s.hydrated);
  const query = useLibrary((s) => s.query);
  const scanning = useLibrary((s) => s.scanning);
  const activeId = useLibrary((s) => s.activeId);
  const previewId = useLibrary((s) => s.previewId);
  const history = useLibrary((s) => s.history);
  const adultsUnlocked = useLibrary((s) => s.adultsUnlocked);
  const videos = useLibrary(useShallow(selectVisible));
  const continueVideos = useLibrary(useShallow((s) => selectContinue(s, false)));
  const favoriteVideos = useLibrary(useShallow((s) => selectFavorites(s, false)));
  const historyVideos = useLibrary(useShallow((s) => selectHistory(s, false)));
  const historyLastDay = useMemo(() => history.filter((entry) => entry.at > Date.now() - 86_400_000).length, [history]);
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
  const tags = useLibrary((s) => s.tags);
  const favorites = useLibrary((s) => s.favorites);
  const progress = useLibrary((s) => s.progress);
  const favoriteLiveVideos = useMemo(() => liveVideos.filter((video) => favorites[video.id]), [favorites, liveVideos]);
  const likes = useLibrary((s) => s.likes);
  const adultTagNames = useMemo(() => [...new Set(videos.flatMap((video) => tags[video.id] ?? []))].sort(), [tags, videos]);
  const moviesByGenre = useMemo(() => [...videos].filter((video) => Boolean(video.genre)).sort((a, b) => a.genre!.localeCompare(b.genre!)), [videos]);
  const randomSourceMovies = useMemo(() => videos.filter((video) => !video.remote && !video.isSample).map((video) => ({ video, rank: ((video.id.length * 31 + video.addedAt + movieShuffle * 7919) % 100003) })).sort((a, b) => a.rank - b.rank).map((entry) => entry.video), [movieShuffle, videos]);
  const priorityMovieGenres = useMemo(() => ["Comedy", "Action", "Horror", "Drama", "Documentary", "Science Fiction"].map((genre) => ({ genre, videos: videos.filter((video) => video.genre?.toLowerCase() === genre.toLowerCase()) })).filter((shelf) => shelf.videos.length > 0), [videos]);
  const adultSorted = useMemo(() => [...videos].sort((a, b) => adultSort === "name" ? a.name.localeCompare(b.name) : adultSort === "favorites" ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || b.addedAt - a.addedAt : b.addedAt - a.addedAt), [adultSort, favorites, videos]);
  const personalizedPicks = useMemo(() => {
    const watched = new Set(history.map((entry) => entry.id));
    const preferredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id]).flatMap((video) => tags[video.id] ?? []));
    return [...videos].filter((video) => !watched.has(video.id)).sort((a, b) => {
      const score = (video: typeof a) => (favorites[video.id] ? 5 : 0) + (likes[video.id] ? 3 : 0) + (tags[video.id] ?? []).filter((tag) => preferredTags.has(tag)).length + (video.remote?.live ? 1 : 0);
      return score(b) - score(a) || b.addedAt - a.addedAt;
    });
  }, [favorites, history, likes, tags, videos]);
  const sortedTwitch = useMemo(() => [...twitchVideos].sort((a, b) => {
    if (twitchSort === "viewers") return (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0) || a.name.localeCompare(b.name);
    if (twitchSort === "name") return a.name.localeCompare(b.name);
    return Number(Boolean(b.remote?.live)) - Number(Boolean(a.remote?.live)) || (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0) || b.addedAt - a.addedAt;
  }), [twitchSort, twitchVideos]);
  const twitchVodPicks = useMemo(() => sortedTwitch.filter((video) => !video.remote?.live).sort((a, b) => (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0) || b.addedAt - a.addedAt), [sortedTwitch]);
  const twitchClips = useMemo(() => twitchVodPicks.filter((video) => (video.duration ?? 0) > 0 && (video.duration ?? 0) <= 1200).slice(0, 24), [twitchVodPicks]);
  const relatedYoutube = useMemo(() => {
    const likedChannels = new Set(youtubeVideos.filter((video) => favorites[video.id] || likes[video.id]).map((video) => video.remote?.channelName).filter(Boolean));
    return youtubeVideos.filter((video) => likedChannels.has(video.remote?.channelName));
  }, [favorites, likes, youtubeVideos]);

  useEffect(() => {
    void restoreFolders();
  }, [restoreFolders]);
  useEffect(() => {
    // Theater invitations are regular shareable links. Route them to the room
    // after saved preferences hydrate so a remembered last page cannot win.
    if (!hydrated) return;
    const room = new URLSearchParams(window.location.search).get("room")?.trim().toUpperCase() ?? "";
    if (/^RC[A-Z0-9]{4,12}$/.test(room)) setSource("watch-room");
  }, [hydrated, setSource]);
  useEffect(() => { const sync = () => setLiveColumns(Number(localStorage.getItem("reelcase.live-columns") ?? "4")); sync(); window.addEventListener("storage", sync); return () => window.removeEventListener("storage", sync); }, []);

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
    const first = window.setTimeout(() => void tick(), 250);
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
      // Empty folders remain in the durable index for later rescans, but do not
      // interrupt every launch with a misleading "no photos" notification.
      if (n === 0 && folder?.photoCount) toast.success(`Found ${folder.photoCount} photo${folder.photoCount === 1 ? "" : "s"} in ${was.folderName}`);
      else if (n > 0) toast.success(`Found ${n} video${n === 1 ? "" : "s"} in ${was.folderName}`);
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
  const invitedToTheater = typeof window !== "undefined" && /^RC[A-Z0-9]{4,12}$/.test(
    (new URLSearchParams(window.location.search).get("room") ?? "").trim().toUpperCase(),
  );
  const isHubSection = [
    "photos",
    "spotify",
    "prints",
    "games",
    "shop",
    "streaming",
    "social",
    "watch-room",
    "settings",
    "assistant",
    "mission-plan",
  ].includes(sourceId) || invitedToTheater;

  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 border-r border-border bg-surface/80 px-3 py-5 lg:block">
        <SidebarNav onAddFolder={(adult) => onAddFolder(undefined, adult)} />
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
        <main className="w-full max-w-none flex-1 px-4 py-6 sm:px-6 xl:px-8 2xl:px-10">
          {lockedAdults ? (
            <PinGate />
          ) : isHubSection ? (
            <>
              {sourceId === "prints" && <PrintsSection />}
              {sourceId === "photos" && <PhotosSection />}
              {sourceId === "spotify" && <SpotifySection />}
              {sourceId === "games" && <GamesSection />}
              {sourceId === "shop" && <ShopSection />}
              {sourceId === "streaming" && <StreamingSection />}
              {sourceId === "social" && <SocialSection />}
              {(sourceId === "watch-room" || invitedToTheater) && <WatchRoomSection />}
              {sourceId === "settings" && <SettingsSection />}
              {sourceId === "assistant" && <AiGuide />}
              {sourceId === "mission-plan" && <MissionPlanSection />}
            </>
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
                !query && (sourceId !== "home" || !follows.length) && (
                  <ConnectPanel key={sourceId === "twitch" ? "twitch-imports" : sourceId === "youtube" ? "youtube-imports" : "home-imports"} defaultKind={sourceId === "twitch" ? "twitch" : "youtube"} lockedKind={sourceId === "youtube" || sourceId === "twitch" ? sourceId : undefined} />
                )}

              {sourceId === "home" && !query && featured && <Billboard video={featured} />}
              {sourceId === "movies" && !query && (randomSourceMovies[0] || featured) && (
                <Billboard video={randomSourceMovies[0] ?? featured!} />
              )}
              {sourceId === "adults" && adultsUnlocked && featured && (
                <Billboard video={featured} />
              )}

              {sourceId === "home" && browsing && (
                <>
                  <TitleRail title="Live now" videos={liveVideos} variant="rail" />
                  <TitleRail
                    title={follows.length ? "Latest from your channels" : "Fresh from YouTube"}
                    videos={[...youtubeVideos, ...twitchVideos]
                      .filter((video) => !video.remote?.live)
                      .sort((a, b) => b.addedAt - a.addedAt)
                      .slice(0, 32)}
                    variant="rail"
                  />
                  <TitleRail title="Continue watching" videos={continueVideos} variant="rail" />
                  <TitleRail title="From YouTube" videos={youtubeVideos} variant="rail" />
                  <TitleRail title="Twitch" videos={twitchVideos} variant="rail" />
                  <TitleRail title="Popular Twitch VODs" videos={twitchVodPicks} variant="rail" />
                  <TitleRail title="Twitch clips & short watches" videos={twitchClips} variant="rail" />
                  <TitleRail title="Favorites" videos={favoriteVideos} variant="poster" />
                  <TitleRail title="Classic movies" videos={classics} variant="poster" />
                  <section className="mb-8 rounded-xl bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Recommendation loader</p><h2 className="mt-2 font-display text-2xl text-fg">For you, locally</h2><p className="mt-1 text-sm text-muted">This shelf refreshes from your likes, favorites, tags, and watch history. It stays on this device.</p><div className="mt-4"><TitleRail title="Personalized picks" videos={personalizedPicks} variant="poster" /></div></section>
                  <TitleRail title="Because you liked classics" videos={[...videos].filter((video) => video.collection === "classics" || video.genre === "Drama" || video.genre === "Noir").slice(0, 18)} variant="poster" />
                  <TitleRail title="Short films & quick watches" videos={videos.filter((video) => video.collection === "shorts" || (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1800).slice(0, 18)} variant="rail" />
                  <TitleRail title="Browse by genre" videos={moviesByGenre.slice(0, 24)} variant="poster" />
                  <TitleRail
                    title="History"
                    videos={historyVideos}
                    variant="rail"
                    playedAt={playedAt}
                  />
                  {publicFolders.map((folder) => (
                    <TitleRail
                      key={folder.id}
                      title={folder.name}
                      videos={videos.filter((v) => v.folderId === folder.id).slice(0, 24)}
                      variant="rail"
                    />
                  ))}
                </>
              )}

              {sourceId === "youtube" && browsing && (
                <>
                  <section className="mb-7 rounded-xl bg-elevated p-5 shadow-border sm:p-6"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Discovery desk</p><h1 className="mt-2 font-display text-4xl text-fg">YouTube, tuned to you.</h1><p className="mt-2 max-w-2xl text-sm text-muted">Fresh uploads, short watches, and recommendations from channels you like stay together here.</p></section>
                  <TitleRail title="Latest uploads" videos={youtubeVideos} variant="rail" />
                  <TitleRail title="More from channels you like" videos={relatedYoutube} variant="rail" />
                  <TitleRail title="Quick picks" videos={youtubeVideos.filter((video) => (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1200)} variant="rail" />
                  <PosterGrid videos={youtubeVideos} />
                </>
              )}

              {sourceId === "twitch" && browsing && (
                <>
                  <section className="mb-7 rounded-xl bg-elevated p-5 shadow-border sm:p-6"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Live desk</p><h1 className="mt-2 font-display text-4xl text-fg">Twitch, live first.</h1><p className="mt-2 max-w-2xl text-sm text-muted">Sort live streams and VODs by what matters right now.</p><div className="mt-4 flex flex-wrap gap-2">{(["live", "viewers", "name"] as const).map((sort) => <Button key={sort} size="sm" variant={twitchSort === sort ? "default" : "secondary"} onClick={() => setTwitchSort(sort)}>{sort === "live" ? "Live first" : sort === "viewers" ? "Most viewers" : "A–Z"}</Button>)}</div></section>
                  <TitleRail title="Twitch sorted" videos={sortedTwitch} variant="rail" />
                  <TitleRail title="Live" videos={sortedTwitch.filter((video) => video.remote?.live)} variant="rail" />
                  <TitleRail title="Popular VODs" videos={twitchVodPicks} variant="rail" />
                  <TitleRail title="Clips & quick watches" videos={twitchClips} variant="rail" />
                  {!twitchVideos.length && (
                    <p className="text-sm text-muted">Follow a channel above to fill this shelf.</p>
                  )}
                </>
              )}

              {sourceId === "live" && browsing && (
                <>
                  {liveVideos.length ? (
                    <>
                      {favoriteLiveVideos.length > 0 && <TitleRail title="Favorites live now" videos={favoriteLiveVideos} variant="rail" />}
                      <h1 className="mb-3 font-display text-2xl text-fg">Everyone else live now</h1>
                      <div className={liveColumns === 3 ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" : liveColumns === 6 ? "grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6" : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"}>{liveVideos.filter((video) => !favorites[video.id]).slice(0, 120).map((video, index) => <VideoCard key={video.id} video={video} variant="rail" index={index} className="w-full" />)}</div>
                    </>
                  ) : (
                    <div className="rounded-xl bg-surface px-6 py-16 text-center shadow-border">
                      <p className="font-display text-2xl text-fg">Nobody you follow is live</p>
                      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                        Add Twitch channels. Reelcase checks them and pings Notifications when they
                        go live.
                      </p>
                    </div>
                  )}
                </>
              )}

              {sourceId === "movies" && browsing && (
                <>
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h1 className="font-display text-4xl text-fg">Movies</h1>
                      <p className="mt-1 text-sm text-muted">
                        Liked titles stay at the front. Change the order when you want a surprise.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setMovieShuffle((value) => value + 1)}
                    >
                      <Shuffle className="size-4" /> Random pick
                    </Button>
                  </div>
                  <TitleRail title="From your source folders" videos={videos.filter((video) => !video.remote && !video.isSample).sort((a, b) => Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || b.addedAt - a.addedAt)} variant="poster" />
                  <TitleRail title="Random from your library" videos={randomSourceMovies} variant="poster" />
                  {priorityMovieGenres.map((shelf) => <TitleRail key={shelf.genre} title={`${shelf.genre} first`} videos={shelf.videos} variant="poster" />)}
                  <TitleRail
                    title="All movies"
                    videos={[...videos.filter((v) => !isClassicVideo(v))].sort(
                      (a, b) =>
                        ((a.id.charCodeAt(0) + movieShuffle * 17) % 29) -
                        ((b.id.charCodeAt(0) + movieShuffle * 17) % 29),
                    )}
                    variant="poster"
                  />
                  <TitleRail title="Classic movies" videos={classics} variant="poster" />
                  {classics.length === 0 && videos.length === 0 ? null : null}
                </>
              )}

              {sourceId === "adults" && adultsUnlocked && browsing && (
                <>
                  <section className="mb-6 rounded-xl bg-elevated p-5 shadow-border"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Private library</p><h1 className="mt-2 font-display text-4xl text-fg">Your shelves, your tags.</h1><p className="mt-2 text-sm text-muted">Tags, history, and organization remain private to this browser. Edit a title’s tags from its preview or player.</p></div><Button disabled={!videos.length} onClick={() => { const choices = adultTag === "All" ? adultSorted : adultSorted.filter((video) => (tags[video.id] ?? []).includes(adultTag)); const pick = choices[Math.floor(Math.random() * choices.length)]; if (pick) openVideo(pick.id); }}><Shuffle className="size-4" /> Random private pick</Button></div><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant={adultTag === "All" ? "default" : "secondary"} onClick={() => setAdultTag("All")}>All titles</Button>{adultTagNames.map((tag) => <Button key={tag} size="sm" variant={adultTag === tag ? "default" : "secondary"} onClick={() => setAdultTag(tag)}>{tag}</Button>)}</div><div className="mt-3 flex flex-wrap gap-2"><span className="self-center text-xs text-muted">Sort</span>{(["recent", "name", "favorites"] as const).map((sort) => <Button key={sort} size="sm" variant={adultSort === sort ? "default" : "secondary"} onClick={() => setAdultSort(sort)}>{sort}</Button>)}</div></section>
                  <div className="mb-6 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-surface p-4 shadow-border"><p className="text-sm font-medium text-fg">Private favorite links</p><p className="mt-1 text-xs leading-5 text-muted">Reserved for your personally saved, consented links. Nothing is added or shared automatically.</p></div><div className="rounded-lg bg-surface p-4 shadow-border"><p className="text-sm font-medium text-fg">Recommended sites</p><p className="mt-1 text-xs leading-5 text-muted">Reserved for future opt-in recommendations. Link sorting will stay separate from your private video catalog.</p></div></div>
                  <PrivateWebShortcuts />
                  <TitleRail title="Continue watching" videos={adultContinue} variant="rail" />
                  <TitleRail title="Favorites" videos={adultFavorites} variant="poster" />
                  <TitleRail title="Recently added" videos={[...videos].sort((a, b) => b.addedAt - a.addedAt).slice(0, 24)} variant="rail" />
                  <TitleRail title={adultTag === "All" ? "All private titles" : `Tagged · ${adultTag}`} videos={adultTag === "All" ? adultSorted : adultSorted.filter((video) => (tags[video.id] ?? []).includes(adultTag))} variant="poster" />
                  <TitleRail
                    title="History"
                    videos={adultHistory}
                    variant="rail"
                    playedAt={playedAt}
                  />
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
                        Add a private folder, or lock an existing source. Those titles stay off
                        Home, Movies, and Favorites.
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

              {sourceId === "favorites" && !query && favoriteVideos.length > 0 && (
                <>
                  <TitleRail title="Continue your favorites" videos={favoriteVideos.filter((video) => { const mark = progress[video.id]; return mark && mark.t > 0 && mark.t < mark.d; })} variant="rail" />
                  <TitleRail title="Favorite movies" videos={favoriteVideos.filter((video) => !video.remote && !video.isSample)} variant="poster" />
                  <TitleRail title="Favorite YouTube" videos={favoriteVideos.filter((video) => video.remote?.kind === "youtube")} variant="rail" />
                  <TitleRail title="Favorite Twitch" videos={favoriteVideos.filter((video) => video.remote?.kind === "twitch")} variant="rail" />
                  <h2 className="mb-3 font-display text-xl text-fg sm:text-2xl">Everything in My List</h2>
                </>
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
                        {sourceId === "history"
                          ? `${history.length} watched title${history.length === 1 ? "" : "s"} · ${historyLastDay} in the last 24 hours · newest first`
                          : scanning
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
                  {folders.find((folder) => folder.id === sourceId)?.photoCount ? <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-border"><p className="text-sm text-fg">This source also has {folders.find((folder) => folder.id === sourceId)?.photoCount} discovered photos.</p><Button size="sm" variant="secondary" onClick={() => setSource("photos")}>Open Photos</Button></div> : null}
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
      {previewId && <PreVideo />}

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
