import { useEffect, useMemo, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Lock, Shuffle } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DiscoveryDesk, LiveDesk } from "./discovery-desk";
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
  GenreSection,
  MissionPlanSection,
  PhotosSection,
  PrivateWebShortcuts,
  PrintsSection,
  SettingsSection,
  StatsSection,
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
import { useThumbs } from "@/lib/videos/thumbs";
import { librarySearchIndex } from "@/lib/videos/search-index";

function shuffleRank(id: string, seed: number) {
  let value = seed >>> 0;
  for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 0x45d9f3b);
  return value >>> 0;
}

// The bundled Blender films are useful as fallback media, but they should
// never displace a person's followed or recently published YouTube uploads.
function isBlenderVideo(video: { name: string; remote?: { channelName?: string }; tagline?: string }) {
  return /\bblender\b/i.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`);
}

function isFreshRemoteUpload(video: { addedAt: number }) {
  // A channel can be imported for the first time with years of feed history.
  // Alert only for a genuinely recent provider-published item, not every item
  // that happened to enter our cache during this refresh.
  const age = Date.now() - video.addedAt;
  return age >= -5 * 60_000 && age <= 14 * 24 * 60 * 60_000;
}

export function LibraryApp() {
  const dirInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingAdult = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [movieShuffle, setMovieShuffle] = useState(() => Date.now());
  const [homePickShuffle, setHomePickShuffle] = useState(() => Date.now());
  const [adultTag, setAdultTag] = useState("All");
  const [adultSort, setAdultSort] = useState<"recent" | "name" | "favorites" | "tagged" | "played">("recent");
  const [twitchSort, setTwitchSort] = useState<"live" | "viewers" | "name">("live");
  const [twitchFilter, setTwitchFilter] = useState("all");
  const [youtubeTagFilter, setYoutubeTagFilter] = useState("all");
  const [twitchTagFilter, setTwitchTagFilter] = useState("all");
  const [historyWindow, setHistoryWindow] = useState<"all" | "day" | "week">("all");
  const [remoteRefreshMs, setRemoteRefreshMs] = useState(() => {
    try { const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "60"); return [30, 60, 120, 300].includes(seconds) ? seconds * 1_000 : 60_000; }
    catch { return 60_000; }
  });

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
  const youtubeCatalog = useLibrary(useShallow(selectYoutube));
  const youtubeVideos = useMemo(() => youtubeCatalog.filter((video) => !isBlenderVideo(video)), [youtubeCatalog]);
  const newestYoutube = useMemo(() => [...youtubeVideos].sort((a, b) => b.addedAt - a.addedAt || a.name.localeCompare(b.name)), [youtubeVideos]);
  const twitchVideos = useLibrary(useShallow(selectTwitch));
  const newThisWeek = useMemo(() => [...youtubeVideos, ...twitchVideos].filter((video) => video.remote && Date.now() - video.addedAt >= -5 * 60_000 && Date.now() - video.addedAt < 7 * 24 * 60 * 60_000).sort((a, b) => b.addedAt - a.addedAt), [twitchVideos, youtubeVideos]);
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
  const categories = useLibrary((s) => s.categories);
  const catalogVideos = useLibrary((s) => s.videos);
  const favorites = useLibrary((s) => s.favorites);
  const progress = useLibrary((s) => s.progress);
  const likes = useLibrary((s) => s.likes);
  const viewCounts = useLibrary((s) => s.viewCounts);
  const follows = useLibrary((s) => s.follows);
  const remoteCheckedAt = useLibrary((s) => s.remoteCheckedAt);
  const adultTagNames = useMemo(() => [...new Set(videos.flatMap((video) => tags[video.id] ?? []))].sort(), [tags, videos]);
  const moviesByGenre = useMemo(() => [...videos].filter((video) => Boolean(video.genre)).sort((a, b) => a.genre!.localeCompare(b.genre!)), [videos]);
  const randomSourceMovies = useMemo(() => videos.filter((video) => !video.remote && !video.isSample).map((video) => ({ video, rank: shuffleRank(video.id, movieShuffle) })).sort((a, b) => a.rank - b.rank).map((entry) => entry.video), [movieShuffle, videos]);
  const priorityMovieGenres = useMemo(() => ["Comedy", "Action", "Horror", "Drama", "Documentary", "Science Fiction"].map((genre) => ({ genre, videos: videos.filter((video) => video.genre?.toLowerCase() === genre.toLowerCase()) })).filter((shelf) => shelf.videos.length > 0), [videos]);
  const adultSorted = useMemo(() => [...videos].sort((a, b) => adultSort === "name" ? a.name.localeCompare(b.name) : adultSort === "favorites" ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || b.addedAt - a.addedAt : adultSort === "tagged" ? (tags[b.id] ?? []).length - (tags[a.id] ?? []).length || b.addedAt - a.addedAt : adultSort === "played" ? (progress[b.id]?.at ?? 0) - (progress[a.id]?.at ?? 0) || b.addedAt - a.addedAt : b.addedAt - a.addedAt), [adultSort, favorites, progress, tags, videos]);
  const adultTagged = useMemo(() => videos.filter((video) => (tags[video.id] ?? []).length > 0).sort((a, b) => (tags[b.id] ?? []).length - (tags[a.id] ?? []).length), [tags, videos]);
  const adultNeedsTags = useMemo(() => videos.filter((video) => !(tags[video.id] ?? []).length), [tags, videos]);
  const personalizedPicks = useMemo(() => {
    const watched = new Set(history.map((entry) => entry.id));
    const preferredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id]).flatMap((video) => tags[video.id] ?? []));
    return [...videos].filter((video) => !video.isSample && !watched.has(video.id)).sort((a, b) => {
      const score = (video: typeof a) => (favorites[video.id] ? 5 : 0) + (likes[video.id] ? 3 : 0) + (tags[video.id] ?? []).filter((tag) => preferredTags.has(tag)).length + (video.remote?.live ? 1 : 0);
      // A recommendation shelf should have a bias, not a fixed handful of
      // winners. Blend preference signals with a fresh shuffle so lower-score
      // local titles still get a real chance to reach the first cards.
      const rank = (video: typeof a) => score(video) * 0.18 + shuffleRank(`${video.id}:${homePickShuffle}`, homePickShuffle) / 0xffffffff;
      return rank(b) - rank(a);
    });
  }, [favorites, history, homePickShuffle, likes, tags, videos]);
  const freshPicks = useMemo(() => {
    const seed = Math.floor(Date.now() / 3_600_000);
    return videos
      .filter((video) => !video.isSample && !video.remote?.live)
      .map((video) => ({ video, views: viewCounts[video.id] ?? 0, rank: shuffleRank(`${video.id}:${seed}`, seed) }))
      .sort((a, b) => a.views - b.views || a.rank - b.rank)
      .slice(0, 48)
      .map(({ video }) => video);
  }, [videos, viewCounts]);
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
  const youtubeDiscovery = useMemo(() => {
    const known = new Set(follows.filter((channel) => channel.kind === "youtube").map((channel) => channel.title.toLowerCase()));
    return youtubeVideos.filter((video) => !known.has((video.remote?.channelName ?? "").toLowerCase()) || Boolean(video.isSample));
  }, [follows, youtubeVideos]);
  const channelTagShelves = useMemo(() => {
    const build = (items: typeof videos, kind: "youtube" | "twitch") => {
      const groups = new Map<string, typeof videos>();
      for (const video of items) {
        if (video.remote?.kind !== kind) continue;
        for (const tag of tags[video.id] ?? []) {
          const clean = tag.toLowerCase();
          if ([kind, "vod", "live"].includes(clean) || clean.length < 4) continue;
          const list = groups.get(clean) ?? [];
          list.push(video);
          groups.set(clean, list);
        }
      }
      return [...groups.entries()].filter(([, items]) => items.length >= 2).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).slice(0, 8).map(([tag, videos]) => ({ tag, videos }));
    };
    return { youtube: build(youtubeVideos, "youtube"), twitch: build(twitchVideos, "twitch") };
  }, [tags, twitchVideos, youtubeVideos]);

  useEffect(() => {
    void restoreFolders();
  }, [restoreFolders]);
  useEffect(() => { void useThumbs.getState().hydrate(); }, []);
  useEffect(() => {
    const update = () => { try { const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "60"); setRemoteRefreshMs(([30, 60, 120, 300].includes(seconds) ? seconds : 60) * 1_000); } catch { setRemoteRefreshMs(60_000); } };
    window.addEventListener("reelcase:refresh-settings", update);
    return () => window.removeEventListener("reelcase:refresh-settings", update);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    // Build the disk-wide search index after the first screen paints. The old
    // path built it on the first typed character, which was especially visible
    // with several thousand remote cards.
    const build = () => librarySearchIndex.sync(catalogVideos, tags, categories);
    const scheduleIdle = window.requestIdleCallback;
    if (typeof scheduleIdle === "function") {
      const id = scheduleIdle(build, { timeout: 2_000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(build, 350);
    return () => window.clearTimeout(id);
  }, [catalogVideos, categories, hydrated, tags]);
  useEffect(() => {
    // Theater invitations are regular shareable links. Route them to the room
    // after saved preferences hydrate so a remembered last page cannot win.
    if (!hydrated) return;
    const room = new URLSearchParams(window.location.search).get("room")?.trim().toUpperCase() ?? "";
    if (/^RC[A-Z0-9]{4,12}$/.test(room)) setSource("watch-room");
  }, [hydrated, setSource]);

  const refreshFollows = useLibrary((s) => s.refreshFollows);
  const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
  const pushNotice = useLibrary((s) => s.pushNotice);
  const [channelRefreshing, setChannelRefreshing] = useState("");

  useEffect(() => {
    if (!hydrated || !follows.length) return;
    let cancelled = false;
    const tick = async () => {
      if (document.hidden || !navigator.onLine) return;
      // Live status ages quickly. Keep the provider cache bounded without
      // reloading the whole app or refreshing while the tab is backgrounded.
      if (Date.now() - useLibrary.getState().remoteCheckedAt < Math.max(5_000, remoteRefreshMs - 5_000)) return;
      const { wentLive, newVideos } = await refreshFollows();
      if (cancelled) return;
      const preferences = (() => { try { return JSON.parse(localStorage.getItem("reelcase.settings.v1") ?? "{}") as Record<string, boolean>; } catch { return {}; } })();
      if (preferences["alerts-go-live-alerts"] !== false) for (const ch of wentLive) {
        pushNotice({
          title: `${ch.title} is live`,
          body: "Tap to watch in Reelcase.",
          kind: "twitch",
          videoId: `tw:${ch.handle}:live`,
        });
      }
      for (const v of newVideos.filter((video) => video.remote?.kind === "youtube" && isFreshRemoteUpload(video) && preferences["alerts-new-youtube-upload-alerts"] !== false).slice(0, 3)) {
        pushNotice({
          title: v.name,
          body: `${v.remote?.channelName ?? "YouTube"} · published ${new Date(v.addedAt).toLocaleDateString()}`,
          kind: "youtube",
          videoId: v.id,
        });
      }
      for (const v of newVideos.filter((video) => video.remote?.kind === "twitch" && preferences["alerts-new-twitch-vod-alerts"] !== false).slice(0, 3)) pushNotice({ title: v.name, body: v.remote?.channelName ?? "New Twitch video", kind: "twitch", videoId: v.id });
    };
    const id = window.setInterval(() => void tick(), remoteRefreshMs);
    const first = window.setTimeout(() => void tick(), 1500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [hydrated, follows.length, refreshFollows, pushNotice, remoteRefreshMs]);

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
      const message = err instanceof Error ? err.message : "Could not open folder";
      toast.error(/system files|system folder|not allowed/i.test(message) ? "Choose a media subfolder instead. Windows system folders cannot be cataloged; use Folder to pick Videos, Downloads, or a dedicated library folder." : message);
    });
  };

  const playlist = videos.map((v) => v.id);
  const playedAt = useMemo(() => {
    const map: Record<string, number> = {};
    for (const h of history) map[h.id] = h.at;
    return map;
  }, [history]);
  const historyFilteredVideos = useMemo(() => {
    const cutoff = historyWindow === "day" ? Date.now() - 86_400_000 : historyWindow === "week" ? Date.now() - 604_800_000 : 0;
    return historyWindow === "all" ? videos : videos.filter((video) => (playedAt[video.id] ?? 0) >= cutoff);
  }, [historyWindow, playedAt, videos]);

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
    "stats",
    "genres",
    "assistant",
    "mission-plan",
  ].includes(sourceId) || invitedToTheater;

  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 overflow-y-auto border-r border-border bg-surface/80 px-3 py-5 lg:block">
        <SidebarNav onAddFolder={(adult) => onAddFolder(undefined, adult)} />
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="overflow-y-auto bg-surface p-4">
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
        <TopBar onMenu={() => setMenuOpen(true)} onAddFolder={() => onAddFolder()} />
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
              {sourceId === "stats" && <StatsSection />}
              {sourceId === "genres" && <GenreSection />}
              {sourceId === "assistant" && <AiGuide />}
              {sourceId === "mission-plan" && <MissionPlanSection />}
            </>
          ) : (
            <>
              {sourceId === "home" && !query && <DiscoveryDesk videos={videos} />}
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


              {sourceId === "movies" && !query && (randomSourceMovies[0] || featured) && (
                <Billboard video={randomSourceMovies[0] ?? featured!} />
              )}
              {sourceId === "adults" && adultsUnlocked && featured && (
                <Billboard video={featured} />
              )}

              {sourceId === "home" && browsing && (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-border"><p className="text-sm text-muted">Local picks rotate inside your taste matches, so the same few titles do not take over Home.</p><Button size="sm" variant="secondary" onClick={() => setHomePickShuffle(Date.now())}><Shuffle className="size-4" /> Mix local picks</Button></div>
                  <TitleRail title="Recently added from your folders" videos={videos.filter((video) => !video.remote && !video.isSample).sort((a, b) => b.addedAt - a.addedAt)} variant="rail" />
                  <TitleRail title="Unseen & ready to discover" videos={freshPicks} variant="rail" />
                  <TitleRail title="Local picks for you" videos={personalizedPicks.filter((video) => !video.remote && !video.isSample)} variant="rail" />
                  <TitleRail title="Live now" videos={liveVideos} variant="rail" />
                  <TitleRail title="New this week" videos={newThisWeek} variant="rail" />
                  <TitleRail
                    title={follows.length ? "Latest from your channels" : "Fresh from YouTube"}
                    videos={[...youtubeVideos, ...twitchVideos]
                      .filter((video) => !video.remote?.live && !video.isSample)
                      .sort((a, b) => b.addedAt - a.addedAt)
                      .slice(0, 32)}
                    variant="rail"
                  />
                  <TitleRail title="Continue watching" videos={continueVideos} variant="rail" />
                  <TitleRail title="From YouTube" videos={youtubeVideos.filter((video) => !video.isSample)} variant="rail" />
                  <TitleRail title="Twitch" videos={twitchVideos.filter((video) => !video.isSample)} variant="rail" />
                  <TitleRail title="Popular Twitch VODs" videos={twitchVodPicks} variant="rail" />
                  <TitleRail title="Twitch clips & short watches" videos={twitchClips} variant="rail" />
                  <TitleRail title="Favorites" videos={favoriteVideos} variant="rail" />
                  {personalizedPicks.length > 0 && <section className="mb-8 rounded-xl bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Recommendation loader</p><h2 className="mt-2 font-display text-2xl text-fg">For you, locally</h2><p className="mt-1 text-sm text-muted">This shelf refreshes from your likes, favorites, tags, and watch history. It stays on this device.</p><div className="mt-4"><TitleRail title="Personalized picks" videos={personalizedPicks} variant="rail" /></div></section>}
                  <TitleRail title="Short films & quick watches" videos={videos.filter((video) => !video.isSample && (video.collection === "shorts" || (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1800)).slice(0, 18)} variant="rail" />
                  <TitleRail title="Browse by genre" videos={moviesByGenre.filter((video) => !video.isSample).slice(0, 24)} variant="rail" />
                  <TitleRail
                    title="History"
                    videos={historyVideos}
                    variant="rail"
                    playedAt={playedAt}
                  />
                  {publicFolders.slice(0, 12).map((folder) => (
                    <TitleRail
                      key={folder.id}
                      title={folder.name}
                      videos={videos.filter((v) => v.folderId === folder.id).slice(0, 24)}
                      variant="rail"
                      onTitleClick={() => setSource(folder.id)}
                    />
                  ))}
                </>
              )}

              {sourceId === "youtube" && browsing && (
                <>
                  <section className="mb-7 rounded-xl bg-elevated p-5 shadow-border sm:p-6"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Discovery desk</p><h1 className="mt-2 font-display text-4xl text-fg">YouTube, tuned to you.</h1><p className="mt-2 max-w-2xl text-sm text-muted">Fresh uploads are ordered by YouTube’s published date, not title. Alerts only fire for uploads published within the last 14 days, so importing an older channel does not flood your notices. {follows.filter((channel) => channel.kind === "youtube").length} channel{follows.filter((channel) => channel.kind === "youtube").length === 1 ? "" : "s"} tracked locally.</p><p className="mt-2 text-xs text-accent">{remoteCheckedAt ? `Most recent channel batch checked ${new Date(remoteCheckedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Waiting for the first channel check."}</p><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => void refreshFollows()}>Refresh next channel batch</Button>{follows.filter((channel) => channel.kind === "youtube").slice(0, 12).map((channel) => <Button key={channel.id} size="sm" variant="ghost" disabled={channelRefreshing === channel.id} onClick={() => void (async () => { setChannelRefreshing(channel.id); try { await followRemoteQuery(channel.handle, "youtube"); } finally { setChannelRefreshing(""); } })()}>{channelRefreshing === channel.id ? "Retrying…" : `Retry ${channel.title}`}</Button>)}</div></section>
                  <TitleRail title="Latest uploads" videos={newestYoutube} variant="rail" />
                  <TitleRail title="New to you on YouTube" videos={freshPicks.filter((video) => video.remote?.kind === "youtube")} variant="rail" />
                  <TitleRail title="More from channels you like" videos={relatedYoutube} variant="rail" />
                  <TitleRail title="Quick picks" videos={newestYoutube.filter((video) => (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1200)} variant="rail" />
                  <div className="mb-5 flex flex-wrap gap-2"><Button size="sm" variant={youtubeTagFilter === "all" ? "default" : "secondary"} onClick={() => setYoutubeTagFilter("all")}>All tags</Button>{channelTagShelves.youtube.map((shelf) => <Button key={shelf.tag} size="sm" variant={youtubeTagFilter === shelf.tag ? "default" : "secondary"} onClick={() => setYoutubeTagFilter(shelf.tag)}>#{shelf.tag} · {shelf.videos.length}</Button>)}</div>
                  <section className="mb-6 rounded-xl border border-border bg-surface p-5"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Creator discovery</p><h2 className="mt-2 font-display text-2xl text-fg">Outside your known follows.</h2><p className="mt-1 text-sm text-muted">Discovery stays in its own shelf so saved channels never get mixed with suggestions. Follow adds a channel to your saved refresh list.</p><div className="mt-4"><TitleRail title="Explore new YouTube" videos={youtubeDiscovery} variant="rail" /></div><div className="mt-4 flex flex-wrap gap-2">{[["Kurzgesagt", "kurzgesagt"], ["Veritasium", "veritasium"], ["PBS Space Time", "pbsspacetime"]].filter(([, handle]) => !follows.some((channel) => channel.kind === "youtube" && channel.handle.toLowerCase() === handle)).map(([label, handle]) => <Button key={handle} size="sm" variant="secondary" disabled={channelRefreshing === handle} onClick={() => void (async () => { setChannelRefreshing(handle); try { await followRemoteQuery(handle, "youtube"); } finally { setChannelRefreshing(""); } })()}>{channelRefreshing === handle ? "Checking…" : `Follow ${label}`}</Button>)}</div></section>
                  {[...new Set(newestYoutube.map((video) => video.remote?.channelName).filter(Boolean))].slice(0, 8).map((channel) => <TitleRail key={channel} title={`From ${channel}`} videos={newestYoutube.filter((video) => video.remote?.channelName === channel)} variant="rail" />)}
                  {channelTagShelves.youtube.map((shelf) => <TitleRail key={`youtube-tag-${shelf.tag}`} title={`YouTube · ${shelf.tag}`} videos={shelf.videos} variant="rail" />)}
                  <PosterGrid videos={youtubeTagFilter === "all" ? newestYoutube : newestYoutube.filter((video) => (tags[video.id] ?? []).includes(youtubeTagFilter))} />
                </>
              )}

              {sourceId === "twitch" && browsing && (
                <>
                  <section className="mb-7 rounded-xl bg-elevated p-5 shadow-border sm:p-6"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Live desk</p><h1 className="mt-2 font-display text-4xl text-fg">Twitch, live first.</h1><p className="mt-2 max-w-2xl text-sm text-muted">Sort live streams and VODs by what matters right now. {follows.filter((channel) => channel.kind === "twitch").length} channel{follows.filter((channel) => channel.kind === "twitch").length === 1 ? "" : "s"} tracked locally. A different rotating batch checks every minute; a successful check removes stale live cards.</p><div className="mt-4 flex flex-wrap gap-2">{(["live", "viewers", "name"] as const).map((sort) => <Button key={sort} size="sm" variant={twitchSort === sort ? "default" : "secondary"} onClick={() => setTwitchSort(sort)}>{sort === "live" ? "Live first" : sort === "viewers" ? "Most viewers" : "A–Z"}</Button>)}<Button size="sm" variant="secondary" onClick={() => void refreshFollows()}>Refresh next live batch</Button>{follows.filter((channel) => channel.kind === "twitch").slice(0, 12).map((channel) => <Button key={channel.id} size="sm" variant="ghost" disabled={channelRefreshing === channel.id} onClick={() => void (async () => { setChannelRefreshing(channel.id); try { await followRemoteQuery(channel.handle, "twitch"); } finally { setChannelRefreshing(""); } })()}>{channelRefreshing === channel.id ? "Checking…" : `Refresh ${channel.title}`}</Button>)}</div></section>
                  <div className="mb-5 flex flex-wrap gap-2">{[["all", "All Twitch"], ["favorites", "Favorites"], ["likes", "Liked"]].map(([value, label]) => <Button key={value} variant={twitchFilter === value ? "default" : "secondary"} onClick={() => setTwitchFilter(value)}>{label}{value === "all" ? "" : " · " + twitchVideos.filter((video) => value === "favorites" ? favorites[video.id] : likes[video.id]).length}</Button>)}</div>
                  <div className="mb-5 flex flex-wrap gap-2"><Button size="sm" variant={twitchTagFilter === "all" ? "default" : "secondary"} onClick={() => setTwitchTagFilter("all")}>All tags</Button>{channelTagShelves.twitch.map((shelf) => <Button key={shelf.tag} size="sm" variant={twitchTagFilter === shelf.tag ? "default" : "secondary"} onClick={() => setTwitchTagFilter(shelf.tag)}>#{shelf.tag} · {shelf.videos.length}</Button>)}</div>
                  {twitchFilter === "all" ? <><TitleRail title="Favorite Twitch videos" videos={sortedTwitch.filter((video) => favorites[video.id])} variant="rail"/><TitleRail title="Liked on Twitch" videos={sortedTwitch.filter((video) => likes[video.id])} variant="rail"/></> : null}
                  {twitchFilter !== "all" && !sortedTwitch.some((video) => twitchFilter === "favorites" ? favorites[video.id] : likes[video.id]) && <p className="mb-6 rounded-lg border border-border p-6 text-muted">Nothing saved here yet. Use the heart or like action on a Twitch video to keep it here between visits.</p>}
                  <TitleRail title={twitchFilter === "all" ? "Your Twitch mix" : twitchFilter === "favorites" ? "Your favorites" : "Your liked videos"} videos={sortedTwitch.filter((video) => twitchFilter === "all" || (twitchFilter === "favorites" ? favorites[video.id] : likes[video.id]))} variant="rail" />
                  {twitchFilter === "all" && <TitleRail title="New to you on Twitch" videos={freshPicks.filter((video) => video.remote?.kind === "twitch")} variant="rail" />}
                  {twitchFilter === "all" && <>
                  <TitleRail title="Live" videos={sortedTwitch.filter((video) => video.remote?.live)} variant="rail" />
                  <TitleRail title="Popular VODs" videos={twitchVodPicks} variant="rail" />
                  <TitleRail title="Clips & quick watches" videos={twitchClips} variant="rail" />
                  {channelTagShelves.twitch.map((shelf) => <TitleRail key={`twitch-tag-${shelf.tag}`} title={`Twitch · ${shelf.tag}`} videos={shelf.videos} variant="rail" />)}
                  </>}
                  <PosterGrid videos={sortedTwitch.filter((video) => (twitchFilter === "all" || (twitchFilter === "favorites" ? favorites[video.id] : likes[video.id])) && (twitchTagFilter === "all" || (tags[video.id] ?? []).includes(twitchTagFilter)))} />
                  {!twitchVideos.length && (
                    <p className="text-sm text-muted">Follow a channel above to fill this shelf.</p>
                  )}
                </>
              )}

              {sourceId === "live" && browsing && <LiveDesk videos={liveVideos} />}

              {sourceId === "movies" && browsing && (
                <>
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <h1 className="font-display text-4xl text-fg">Movies <span className="text-xl text-muted">{videos.filter((video) => !video.remote).length}</span></h1>
                      <p className="mt-1 text-sm text-muted">
                        Liked titles stay at the front. Change the order when you want a surprise.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setMovieShuffle(Date.now())}
                    >
                      <Shuffle className="size-4" /> Random pick
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => void restoreFolders()}>
                      Reload local files
                    </Button>
                  </div>
                  <TitleRail title="From your source folders" videos={videos.filter((video) => !video.remote && !video.isSample).sort((a, b) => Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || b.addedAt - a.addedAt)} variant="poster" />
                  <TitleRail title="Random from your library" videos={randomSourceMovies} variant="poster" />
                  {priorityMovieGenres.map((shelf) => <TitleRail key={shelf.genre} title={`${shelf.genre} first`} videos={shelf.videos} variant="poster" />)}
                  <TitleRail
                    title="All movies"
                    videos={randomSourceMovies.filter((video) => !isClassicVideo(video))}
                    variant="poster"
                  />
                  <TitleRail title="Classic movies" videos={classics} variant="poster" />
                  {classics.length === 0 && videos.length === 0 ? null : null}
                </>
              )}

              {sourceId === "adults" && adultsUnlocked && browsing && (
                <>
                  <section className="mb-6 rounded-xl bg-elevated p-5 shadow-border"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Private library</p><h1 className="mt-2 font-display text-4xl text-fg">Your shelves, your tags.</h1><p className="mt-2 text-sm text-muted">Tags, history, and organization remain private to this browser. Edit a title’s tags from its preview or player.</p></div><Button disabled={!videos.length} onClick={() => { const choices = adultTag === "All" ? adultSorted : adultSorted.filter((video) => (tags[video.id] ?? []).includes(adultTag)); const pick = choices[Math.floor(Math.random() * choices.length)]; if (pick) openVideo(pick.id); }}><Shuffle className="size-4" /> Random private pick</Button></div><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant={adultTag === "All" ? "default" : "secondary"} onClick={() => setAdultTag("All")}>All titles</Button>{adultTagNames.map((tag) => <Button key={tag} size="sm" variant={adultTag === tag ? "default" : "secondary"} onClick={() => setAdultTag(tag)}>{tag}</Button>)}</div><div className="mt-3 flex flex-wrap gap-2"><span className="self-center text-xs text-muted">Sort</span>{(["recent", "name", "favorites", "tagged", "played"] as const).map((sort) => <Button key={sort} size="sm" variant={adultSort === sort ? "default" : "secondary"} onClick={() => setAdultSort(sort)}>{sort === "tagged" ? "Most tagged" : sort === "played" ? "Last played" : sort}</Button>)}</div></section>
                  <div className="mb-6 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-surface p-4 shadow-border"><p className="text-sm font-medium text-fg">Private favorite links</p><p className="mt-1 text-xs leading-5 text-muted">Reserved for your personally saved, consented links. Nothing is added or shared automatically.</p></div><div className="rounded-lg bg-surface p-4 shadow-border"><p className="text-sm font-medium text-fg">Recommended sites</p><p className="mt-1 text-xs leading-5 text-muted">Reserved for future opt-in recommendations. Link sorting will stay separate from your private video catalog.</p></div></div>
                  <PrivateWebShortcuts />
                  <TitleRail title="Continue watching" videos={adultContinue} variant="rail" />
                  <TitleRail title="Favorites" videos={adultFavorites} variant="poster" />
                  <TitleRail title="Most organized" videos={adultTagged} variant="rail" />
                  <TitleRail title="Needs a tag" videos={adultNeedsTags} variant="rail" />
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
                  sourceId !== "adults" &&
                  sourceId !== "genres" &&
                  sourceId !== "stats")) && (
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
                      <div className="flex flex-wrap gap-2"><Button size="sm" variant={historyWindow === "all" ? "default" : "secondary"} onClick={() => setHistoryWindow("all")}>All time</Button><Button size="sm" variant={historyWindow === "day" ? "default" : "secondary"} onClick={() => setHistoryWindow("day")}>24 hours</Button><Button size="sm" variant={historyWindow === "week" ? "default" : "secondary"} onClick={() => setHistoryWindow("week")}>7 days</Button><Button variant="ghost" size="sm" onClick={clearHistory}>Clear history</Button></div>
                    )}
                  </div>
                  {folders.find((folder) => folder.id === sourceId)?.photoCount ? <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-border"><p className="text-sm text-fg">This source also has {folders.find((folder) => folder.id === sourceId)?.photoCount} discovered photos.</p><Button size="sm" variant="secondary" onClick={() => { const folder = folders.find((item) => item.id === sourceId); if (folder) localStorage.setItem("reelcase.photos.source-filter", folder.name); setSource("photos"); }}>Browse this source’s photos</Button></div> : null}
                  {sourceId === "history" || sourceId === "continue" || query ? (
                    <VideoGrid
                      videos={sourceId === "history" ? historyFilteredVideos : videos}
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

