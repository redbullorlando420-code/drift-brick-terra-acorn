import { useLibraryStats } from './use-library-stats';
import { useSettingsAudit } from "./use-settings-audit";
import { usePerformanceProfile } from './use-performance-profile';
import { useTextFirstArtwork } from './use-artwork-mode';
import { setTextFirstArtwork } from '@/lib/artwork-mode';
import { getPerformanceMode, getPerformanceProfile, setPerformanceMode, type PerformanceMode } from '@/lib/performance-profile';
import { EnrichmentStatus } from './enrichment-status';
import { RankingPanel } from './ranking-panel';
import { topicPreferenceScore } from '@/lib/videos/ranking-core';
import { TopicLinks } from './topic-links';
import { ArtworkAuditPanel } from './artwork-audit';
import { openTopic } from '@/lib/videos/topic-navigation';
import { createLocalId } from "@/lib/local-id";
import { mergeMissionPlan, MISSION_PLAN_REVISION, MISSION_PLAN_REVISION_KEY, type Mission, type MissionStatus } from "@/lib/mission-plan";
import { isTopicTag, canonicalTopic, topicsForVideo } from '@/lib/videos/topics';
import { type ReactNode, lazy, Suspense, useCallback, useDeferredValue, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  Bot,
  Box,
  BarChart3,
  Clapperboard,
  Copy,
  Download,
  Upload,
  Eye,
  EyeOff,
  ExternalLink,
  Gamepad2,
  Images,
  Heart,
  ImagePlus,
  MessageCircle,
  Music2,
  MonitorPlay,
  PackageSearch,
  Pause,
  Play,
  Radio,
  RefreshCw,
  Rocket,
  Search,
  Shuffle,
  Settings2,
  Star,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Lightbulb,
  Laptop,
  ShoppingBag,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PullSettingsPanel } from './pull-settings-panel';
import type { PrintViewerTarget } from "@/lib/prints-blobs";
const PrintModelViewer = lazy(async () => {
  const mod = await import("@/components/library/print-model-viewer");
  return { default: mod.PrintModelViewer };
});
import { isViewablePrintName, savePrintBlob } from "@/lib/prints-blobs";
import { fetchCompanionIcons, iconsFromFolderFiles, loadGameIconCache, saveGameIcon } from "@/lib/game-icons";
import { Input } from "@/components/ui/input";
import { isAdultVideo, resumeForVideo, useLibrary } from "@/lib/videos/store";
import { resolveCreatorCoverage } from "@/lib/videos/creator-coverage";
import { exportAdultStats } from "@/lib/videos/adult-stats";
import { buildLibraryPackFiles, downloadLibraryPackZip, importLibraryPackZip, applyLibraryPackFiles, type LibraryPackMode } from "@/lib/videos/library-pack";
import {
  companionExportLibraryPack,
  companionImportLibraryPack,
  companionSteamEpicGames,
  companionListPrints,
  companionReadPrint,
  companionSavePrint,
  companionSetAutostart,
  companionHealth,
  companionAckJobs,
  companionInspectMedia,
  type CompanionMediaInspection,
} from "@/lib/companion";
import { linksFromHistoryAndResume, saveDurablePhotos, restoreDurablePhotos, loadDurablePhotosSync, type DurablePhotoMeta } from "@/lib/videos/persist";
import { registerPeriodicTask } from '@/lib/periodic-work';
import { twitchEmbedUrl } from "@/lib/videos/twitch-embed";
import { isAdultImageKind, isAdultPullKind } from "@/lib/videos/adult-sites";
import { useThumbs } from "@/lib/videos/thumbs";
import { useSourceAssets } from "@/lib/source-assets";
import { useP2PRoom } from "@/lib/multiplayer";
import { clampRoomPosition, estimatedProviderPosition, normalizeGuestOffset, guestPlaybackPosition, hostPlaybackPosition } from "@/lib/multiplayer/room-clock";
import { describeRoomMedia, resolveRoomMedia, resolveRoomRequest, mergeRoomMedia, normalizeRoomVideo, parseRoomLinks, roomMediaKey, type RoomMediaDescriptor } from "@/lib/multiplayer/room-media";
import { ROOM_QUEUE_LIMIT, normalizeRoomQueue, distinctRoomQueue, applyRoomQueueAction, parseRoomQueueAction, shuffleRoomQueue, type RoomQueueAction } from '@/lib/multiplayer/room-queue';
import { RoomInvitation, useRoomInvitation } from './room-invitation';
import { RoomQueuePanel } from './room-queue-panel';
import { RoomRecommendations } from './room-recommendations';
import { useRoomQueueDelivery } from './use-room-queue-delivery';
import { lookupVideo, lookupVideos } from "@/lib/videos/video-lookup";
import { resolvePlayUrl, pinPlayUrl } from "@/lib/videos/sources";
import { useRoomLocalStream } from "./use-room-local-stream";
import { RoomStreamPlayer } from "./room-stream-player";
import { RoomGuestTiming } from "./room-guest-timing";
import { RoomRelaySettings } from "./room-relay-settings";
import type { RoomRelayConfig } from "@/lib/multiplayer/relay-config";
import { exportFeedback, getRating, ratingPreference, tagIsLiked, setRating as saveRating } from "@/lib/media-feedback";
import { getAdultPreviewHealth } from "@/lib/videos/adult-thumb-session";
import { PerformanceScorecard } from "./performance-scorecard";
import { measureInteraction } from "@/lib/interaction-budget";
import { catalogTurn } from "@/lib/catalog-turn";
import { prepareRoomCandidates, searchRoomCandidates } from "@/lib/multiplayer/room-candidates";
import { getYoutubeFirstClickTrace, getYoutubeTraceRevision, subscribeYoutubeTrace } from "@/lib/youtube-first-click-trace";
import { benchmarkVisionModelsLocally, classifyImagesLocally, VISION_MODELS, type VisionBenchmark, type VisionLabel, type VisionModelId } from "@/lib/local-vision";
import { LOCAL_UPSCALER, upscaleImageLocally } from "@/lib/local-upscaler";
import { getNetworkDeviceId, listNetworkDevices, type NetworkDevice } from "@/lib/network-presence";
import { NATIVE_PLAYABLE, type LibraryVideo } from "@/lib/videos/types";
import { ViewportChart } from "./viewport-chart";
import { Bar, BarChart, Cell, Pie, PieChart, Tooltip, XAxis, YAxis } from "recharts";

import { XTimeline } from "./x-timeline";
import { X_ADULT_SEED_HANDLES } from "@/lib/videos/x-adult-seed-accounts";
import { VideoCard } from "./video-card";
import { AdultComments } from "./adult-comments";

type LocalItem = {
  name: string;
  path: string;
  size: number;
  addedAt: number;
  launchUrl?: string;
  iconData?: string;
  /** IndexedDB blob id for interactive 3D preview of user-added prints. */
  id?: string;
  /** Bundled public URL for sample print geometry. */
  sampleSrc?: string;
};
type HubStore = { prints: LocalItem[]; games: LocalItem[] };
const HUB_KEY = "reelcase.hub.v1";
function gameKind(item: LocalItem) {
  if (item.launchUrl) return "web-ready" as const;
  if (/\.url$/i.test(item.name)) return "web-needs-target" as const;
  if (/\.lnk$/i.test(item.name)) return "desktop-shortcut" as const;
  if (/\.appref-ms$/i.test(item.name)) return "desktop-app" as const;
  return "desktop-executable" as const;
}
function isWebGame(item: LocalItem) { return gameKind(item).startsWith("web-"); }
function isGameHelper(item: LocalItem) {
  const value = `${item.name} ${item.path}`.toLowerCase();
  return /(?:uninstall|setup|installer|updater|crashpad|helper|redistributable|vcredist|python|node_modules|\\\\lib\\\\|\/lib\/)/.test(value);
}
function gameBadge(item: LocalItem) {
  if (item.launchUrl?.startsWith("steam:")) return "STEAM";
  if (item.launchUrl?.startsWith("epic:") || item.launchUrl?.startsWith("com.epicgames")) return "EPIC";
  if (gameKind(item) === "web-needs-target") return "LINK?";
  if (gameKind(item) === "web-ready") return "WEB";
  if (/\.appref-ms$/i.test(item.name)) return "APP";
  if (/\.lnk$/i.test(item.name)) return "LINK";
  return "GAME";
}
const PREFERENCE_GROUPS = {
  Alerts: ["Go-live alerts", "New Twitch VOD alerts", "New YouTube upload alerts", "Desktop notifications"],
  Playback: ["Autoplay next video", "Start muted"],
  Display: ["Day mode", "Compact live cards"],
  Performance: ["Use cached sources first", "Low-memory grids", "Small Home shelves"],
  Privacy: ["Reduce motion", "Hide demo media"],
} as const;
const ACTIVE_PREFERENCE_DETAILS: Record<string, string> = {
  "alerts-go-live-alerts": "Active: adds an in-app notice when a tracked Twitch channel goes live after a refresh.",
  "alerts-new-twitch-vod-alerts": "Active: adds an in-app notice when a tracked Twitch channel has a newly discovered VOD or clip.",
  "alerts-new-youtube-upload-alerts": "Active: adds an in-app notice when a tracked YouTube channel has a newly discovered upload.",
  "alerts-desktop-notifications": "Active: asks the browser for permission, then mirrors enabled Realhub alerts as desktop notifications.",
  "playback-autoplay-next-video": "Active: starts the next library title when a local video ends.",
  "playback-start-muted": "Active: local video playback starts muted until you raise the player volume.",
  "display-day-mode": "Active: uses the light palette throughout this browser.",
  "display-compact-live-cards": "Active: renders six compact live cards per wide row to reduce scrolling and image work.",
  "performance-use-cached-sources-first": "Active: opens the saved catalog before asking folders or the Companion for fresh file details.",
  "performance-low-memory-grids": "Active: keeps only a smaller card batch mounted in large grids, reducing image decode pressure.",
  "performance-small-home-shelves": "Active: draws shorter Home rails first; use Show more inside a rail when you want depth.",
  "privacy-reduce-motion": "Active: reduces animation and scrolling motion across Realhub.",
  "privacy-hide-demo-media": "Active: hides bundled demonstration titles from your library shelves.",
};
const PREFERENCES = Object.entries(PREFERENCE_GROUPS).flatMap(([group, labels]) =>
  labels.map((label) => ({
    key: `${group}-${label}`.toLowerCase().replaceAll(" ", "-"),
    group,
    label,
    detail: ACTIVE_PREFERENCE_DETAILS[`${group}-${label}`.toLowerCase().replaceAll(" ", "-")],
    implemented: true,
  })),
);

function readHub(): HubStore {
  const samples: LocalItem[] = [
    {
      name: "Calibration cube.stl",
      path: "Realhub samples/Calibration cube.stl",
      size: 2618,
      addedAt: 1,
      sampleSrc: "/samples/prints/calibration-cube.stl",
    },
    { name: "Cable clip.3mf", path: "Realhub samples/Cable clip.3mf", size: 94100, addedAt: 2 },
    {
      name: "OpenSCAD phone stand.obj",
      path: "Open-source examples/OpenSCAD phone stand.obj",
      size: 318,
      addedAt: 4,
      sampleSrc: "/samples/prints/phone-stand.obj",
    },
    {
      name: "Gridfinity bin.3mf",
      path: "Open-source examples/Gridfinity bin.3mf",
      size: 784200,
      addedAt: 5,
    },
    {
      name: "Benchy calibration.obj",
      path: "Open-source examples/Benchy calibration.obj",
      size: 236,
      addedAt: 6,
      sampleSrc: "/samples/prints/benchy.obj",
    },
    {
      name: "Parametric drawer label.stl",
      path: "Open-source examples/Parametric drawer label.stl",
      size: 229100,
      addedAt: 7,
    },
    {
      name: "Tool tray.gcode",
      path: "Realhub samples/Tool tray.gcode",
      size: 1248000,
      addedAt: 3,
    },
  ];
  try {
    const raw = localStorage.getItem(HUB_KEY);
    if (!raw) return { prints: samples, games: [] };
    return JSON.parse(raw) as HubStore;
  } catch {
    return { prints: samples, games: [] };
  }
}
function writeHub(next: HubStore) {
  localStorage.setItem(HUB_KEY, JSON.stringify(next));
}
function filesToItems(files: FileList, gamesOnly = false): LocalItem[] {
  return [...files]
    .filter((file) => !gamesOnly || /\.(exe|lnk|url|appref-ms)$/i.test(file.name))
    .filter((file) => !/^(uninstall|setup|crashreporter)/i.test(file.name))
    .map((file) => ({
      name: file.name,
      path: file.webkitRelativePath || file.name,
      size: file.size,
      addedAt: Date.now(),
    }));
}
function bytes(value: number) {
  if (value <= 0) return "0 B";
  return value < 1024 * 1024
    ? `${Math.max(1, Math.round(value / 1024))} KB`
    : `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function watchRoomEmbed(video: LibraryVideo) {
  const base = video.remote?.embedUrl;
  if (!base) return "";
  if (video.remote?.kind === "twitch") {
    // Use the same canonical route as the full player: Twitch VOD embeds need
    // a v-prefixed ID plus the exact parent host, not the raw catalog URL.
    return twitchEmbedUrl(video.remote, window.location.hostname) ?? "";
  }
  const url = new URL(base);
  url.searchParams.set("autoplay", "0");
  url.searchParams.set("rel", "0");
  url.searchParams.set("playsinline", "1");
  url.searchParams.set("controls", "1");
  url.searchParams.set("origin", window.location.origin);
  if (video.remote?.kind === "youtube") url.searchParams.set("enablejsapi", "1");
  return url.toString();
}

function watchRoomPoster(video: LibraryVideo) {
  if (video.remote?.kind === "youtube" && video.remote.videoId) return video.poster || `https://i.ytimg.com/vi/${video.remote.videoId}/hqdefault.jpg`;
  return video.poster;
}

function canStageRoomVideo(video: LibraryVideo) {
  return video.remote ? Boolean(describeRoomMedia(video)) : Boolean(video.src || NATIVE_PLAYABLE.has(video.extension.toLowerCase()));
}

function roomShuffleRank(id: string, seed: number) {
  let value = seed >>> 0;
  for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 0x45d9f3b);
  return value >>> 0;
}

type LocalRoomShare = { name: string; fingerprint: string; size: number; modified: number };
type RoomLedgerEvent = {
  at: number;
  kind: "session" | "state" | "timeline" | "queue" | "request" | "dropped";
  detail: string;
};
type RoomHealth = {
  lastPublishedAt: number;
  lastHostStateAt: number;
  lastQueueAt: number;
  lastDriftSeconds: number;
  queueRevision: number;
  queueRequests: number;
  queueAccepted: number;
  staleDropped: number;
  resyncRequests: number;
};
function normalizeLocalRoomQueue(value: unknown) {
  if (!Array.isArray(value)) return [] as LocalRoomShare[];
  const seen = new Set<string>();
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const share = item as Partial<LocalRoomShare>;
    if (typeof share.name !== "string" || typeof share.fingerprint !== "string" || !share.name.trim() || !share.fingerprint.trim() || seen.has(share.fingerprint)) return [];
    seen.add(share.fingerprint);
    return [{ name: share.name, fingerprint: share.fingerprint, size: Math.max(0, Number(share.size) || 0), modified: Math.max(0, Number(share.modified) || 0) }];
  }).slice(0, 24);
}
function trustedRoomSentAt(value: unknown) {
  const sentAt = typeof value === "number" && Number.isFinite(value) ? value : 0;
  // A room packet should be fresh. A wildly future clock would otherwise make
  // every honest state look stale until the tab is refreshed.
  return sentAt > 0 && sentAt <= Date.now() + 60_000 ? sentAt : 0;
}
function roomTimeLabel(at: number) {
  return at ? new Date(at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "waiting";
}
function localRoomFingerprint(file: File) {
  // A privacy-preserving match key, not a content hash. It is enough to stop
  // an accidental same-name handoff while never reading or transmitting bytes.
  return `${file.name.normalize("NFKC").toLowerCase()}::${file.size}::${file.lastModified}`;
}

type TwitchRoomPlayer = {
  play: () => void;
  pause: () => void;
  setMuted?: (muted: boolean) => void;
  seek: (seconds: number) => void;
  getCurrentTime: () => number;
  getDuration?: () => number;
  addEventListener: (event: string, handler: () => void) => void;
};
type TwitchEmbedApi = { Player: new (target: string, options: Record<string, unknown>) => TwitchRoomPlayer & { constructor: { READY?: string; PLAY?: string; PAUSE?: string; SEEK?: string } } };
let twitchEmbedLoader: Promise<TwitchEmbedApi> | undefined;
function loadTwitchEmbed() {
  return twitchEmbedLoader ??= new Promise<TwitchEmbedApi>((resolve, reject) => {
    const ready = (window as Window & { Twitch?: TwitchEmbedApi }).Twitch;
    if (ready?.Player) { resolve(ready); return; }
    const script = document.createElement("script");
    script.src = "https://player.twitch.tv/js/embed/v1.js";
    script.async = true;
    script.onload = () => {
      const api = (window as Window & { Twitch?: TwitchEmbedApi }).Twitch;
      if (api?.Player) resolve(api); else reject(new Error("Twitch player API unavailable"));
    };
    script.onerror = () => reject(new Error("Twitch player script failed to load"));
    document.head.append(script);
  });
}

function downloadCsv(rows: Array<Array<string | number | boolean>>, filename: string) {
  const quote = (value: string | number | boolean) => `"${String(value).replaceAll('"', '""')}"`;
  const body = rows.map((row) => row.map(quote).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function GenreSection() {
  return <HubShell eyebrow="Topic explorer" icon={<Clapperboard className="size-4"/>} title="Explore ideas across sources." copy="Follow useful topics across local media, YouTube and Twitch. Each connection shows its saved tag or title evidence."><TopicLinks explorer /></HubShell>;
}

type AnimeDeskFilter = "all" | "continue" | "series" | "films";

function animeTitleFormat(video: LibraryVideo, tags: readonly string[]) {
  const text = `${video.name} ${video.genre ?? ""} ${tags.join(" ")}`.toLowerCase();
  if (/\b(anime[- ]?(?:movie|film|special)|movie|film|theatrical|ova|ona|special)\b/.test(text)) return "films" as const;
  return "series" as const;
}

function animeSearchMatch(video: LibraryVideo, tags: readonly string[], value: string) {
  const needle = value.trim().toLowerCase();
  if (!needle) return true;
  return `${video.name} ${video.genre ?? ""} ${video.description ?? ""} ${tags.join(" ")}`.toLowerCase().includes(needle);
}

export function AnimeSection() {
  const videos = useLibrary((s) => s.videos);
  const folders = useLibrary((s) => s.folders);
  const tags = useLibrary((s) => s.tags);
  const progress = useLibrary((s) => s.progress);
  const resumeProgress = useLibrary((s) => s.resumeProgress);
  const unavailable = useLibrary((s) => s.unavailable);
  const setVideoTags = useLibrary((s) => s.setVideoTags);
  const setSource = useLibrary((s) => s.setSource);
  const [filter, setFilter] = useState<AnimeDeskFilter>("all");
  const [query, setQuery] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [limit, setLimit] = useState(36);

  const catalog = useMemo(
    () => videos.filter((video) => !isAdultVideo(video, folders) && !isAdultPullKind(video.remote?.kind) && !unavailable[video.id]),
    [folders, unavailable, videos],
  );
  const anime = useMemo(
    () => catalog
      .filter((video) => topicsForVideo(video, tags[video.id] ?? []).includes("anime"))
      .sort((a, b) => b.addedAt - a.addedAt),
    [catalog, tags],
  );
  const continuing = useMemo(
    () => anime
      .filter((video) => {
        const mark = resumeForVideo({ progress, resumeProgress }, video);
        return Boolean(mark && mark.d > 0 && mark.t >= 2 && mark.t / mark.d < 0.992);
      })
      .sort((a, b) => {
        const aMark = resumeForVideo({ progress, resumeProgress }, a)?.at ?? 0;
        const bMark = resumeForVideo({ progress, resumeProgress }, b)?.at ?? 0;
        return bMark - aMark;
      }),
    [anime, progress, resumeProgress],
  );
  const filtered = useMemo(() => {
    const base = filter === "continue"
      ? continuing
      : filter === "all"
        ? anime
        : anime.filter((video) => animeTitleFormat(video, tags[video.id] ?? []) === filter);
    return base.filter((video) => animeSearchMatch(video, tags[video.id] ?? [], query));
  }, [anime, continuing, filter, query, tags]);
  const tagMatches = useMemo(() => {
    if (!tagQuery.trim()) return [];
    return catalog
      .filter((video) => animeSearchMatch(video, tags[video.id] ?? [], tagQuery))
      .slice(0, 8);
  }, [catalog, tagQuery, tags]);
  const localCount = anime.filter((video) => !video.remote).length;
  const seriesCount = anime.filter((video) => animeTitleFormat(video, tags[video.id] ?? []) === "series").length;
  const filmCount = anime.length - seriesCount;
  const markAnime = (video: LibraryVideo) => {
    const current = tags[video.id] ?? [];
    if (!current.includes("anime")) setVideoTags(video.id, [...current, "anime"]);
  };

  const filters: Array<{ id: AnimeDeskFilter; label: string; count: number }> = [
    { id: "all", label: "All titles", count: anime.length },
    { id: "continue", label: "Continue", count: continuing.length },
    { id: "series", label: "Series", count: seriesCount },
    { id: "films", label: "Films & specials", count: filmCount },
  ];

  return (
    <HubShell
      eyebrow="Anime library"
      icon={<Clapperboard className="size-4" />}
      title="Keep anime on its own shelf."
      copy="A fast, local-first view for anime already in your Realhub catalog. Saved #anime tags and clear title/category evidence keep it separate without copying or proxying third-party playback."
    >
      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Anime library summary">
        <Stat label="Anime titles" value={anime.length} />
        <Stat label="Continue watching" value={continuing.length} />
        <Stat label="Local titles" value={localCount} />
        <Stat label="Films & specials" value={filmCount} />
      </section>

      <section className="mt-6 rounded-lg bg-elevated p-4 shadow-border sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Browse your shelf</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Search stays inside Anime. Series and film groupings use your saved tags and straightforward title cues, so nothing is guessed from a streaming site.</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setSource("home")}>Add library media</Button>
        </div>
        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <Input value={query} onChange={(event) => { setQuery(event.target.value); setLimit(36); }} placeholder="Search your anime titles and tags" aria-label="Search anime library" className="lg:max-w-md" />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Anime shelf filters">
            {filters.map((item) => <Button key={item.id} size="sm" variant={filter === item.id ? "default" : "secondary"} onClick={() => { setFilter(item.id); setLimit(36); }}>{item.label} <span className="ml-1 font-mono tabular-nums opacity-70">{item.count}</span></Button>)}
          </div>
        </div>
      </section>

      {filtered.length ? (
        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">{filters.find((item) => item.id === filter)?.label}</p><p className="mt-1 text-sm text-muted">{filtered.length.toLocaleString()} matching title{filtered.length === 1 ? "" : "s"}</p></div>
            {query && <Button size="sm" variant="ghost" onClick={() => setQuery("")}>Clear search</Button>}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {filtered.slice(0, limit).map((video, index) => <VideoCard key={video.id} video={video} variant="grid" index={index} />)}
          </div>
          {limit < filtered.length && <div className="mt-5 flex justify-center"><Button variant="secondary" onClick={() => setLimit((value) => value + 36)}>Show 36 more</Button></div>}
        </section>
      ) : (
        <section className="mt-6 rounded-lg bg-elevated p-5 shadow-border">
          <p className="font-medium text-fg">No matching anime titles yet.</p>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Add a local or authorized library source, then use the title finder below to give the right cards a saved #anime tag. Existing media, ratings, history, and resume points remain untouched.</p>
        </section>
      )}

      <section className="mt-6 rounded-lg bg-elevated p-4 shadow-border sm:p-5">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Tag a title into Anime</p>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Use this for filenames that do not say “anime” or “manga.” The tag is saved locally, searchable across the app, and included in your existing recovery export.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Input value={tagQuery} onChange={(event) => setTagQuery(event.target.value)} placeholder="Find a title already in your library" aria-label="Find a library title to tag as anime" className="sm:max-w-xl" />
          {tagQuery && <Button size="sm" variant="ghost" onClick={() => setTagQuery("")}>Clear</Button>}
        </div>
        {tagQuery && !tagMatches.length && <p className="mt-3 text-sm text-muted">No catalog titles match that search.</p>}
        {tagMatches.length > 0 && <div className="mt-4 space-y-2">{tagMatches.map((video) => {
          const alreadyAnime = topicsForVideo(video, tags[video.id] ?? []).includes("anime");
          return <div key={video.id} className="flex flex-wrap items-center gap-3 rounded-md bg-bg/45 p-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-fg">{video.name}</p><p className="mt-0.5 truncate text-xs text-muted">{video.genre || video.extension.toUpperCase()} · {video.remote?.channelName ?? (video.remote ? video.remote.kind : "Local library")}</p></div><Button size="sm" variant={alreadyAnime ? "secondary" : "default"} disabled={alreadyAnime} onClick={() => markAnime(video)}>{alreadyAnime ? "In Anime" : "Add #anime"}</Button></div>;
        })}</div>}
      </section>

      <section className="mt-6 rounded-lg border border-border bg-elevated/70 p-4 shadow-border">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Source boundary</p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">Realhub does not fetch, download, proxy, or embed video from unverified third-party streaming sites. The Anime desk only organizes media already added to your catalog, and sends external viewing choices through the separate Streaming desk.</p>
        <Button size="sm" variant="secondary" className="mt-3" onClick={() => setSource("streaming")}>Open streaming destinations</Button>
      </section>
    </HubShell>
  );
}

export function StatsSection() {
  const videos = useLibrary((s) => s.videos);
  const folders = useLibrary((s) => s.folders);
  const tags = useLibrary((s) => s.tags);
  const favorites = useLibrary((s) => s.favorites);
  const likes = useLibrary((s) => s.likes);
  const history = useLibrary((s) => s.history);
  const cameCounts = useLibrary((s) => s.cameCounts);
  const unavailable = useLibrary((s) => s.unavailable);
  const progress = useLibrary((s) => s.progress);
  const resumeProgress = useLibrary((s) => s.resumeProgress);
  const viewCounts = useLibrary((s) => s.viewCounts);
  const pullHistory = useLibrary((s) => s.pullHistory);
  const [remediationView, setRemediationView] = useState<"" | "topics" | "sources">("");
  const [favoriteRevision, setFavoriteRevision] = useState(0);
  const [previewHealthRevision, setPreviewHealthRevision] = useState(0);
  const [recoveryNote, setRecoveryNote] = useState("");
  useEffect(() => {
    const refresh = () => setFavoriteRevision((value) => value + 1);
    window.addEventListener("reelcase:rating-change", refresh);
    return () => window.removeEventListener("reelcase:rating-change", refresh);
  }, []);
  useEffect(() => { const refresh = () => setPreviewHealthRevision((value) => value + 1); window.addEventListener("reelcase:preview-health", refresh); return () => window.removeEventListener("reelcase:preview-health", refresh); }, []);
  const observedPreviewHealth = useMemo(() => getAdultPreviewHealth(), [previewHealthRevision]);
  const statsInput = useMemo(() => ({ videos, folders, tags, favorites, likes, unavailable, history, cameCounts, progress, resumeProgress, viewCounts, pullHistory }), [videos, folders, tags, favorites, likes, unavailable, history, cameCounts, progress, resumeProgress, viewCounts, pullHistory]);
  const stats = useLibraryStats(statsInput, favoriteRevision);
  const [showTopicLinks, setShowTopicLinks] = useState(false);
  if (!stats.data) return <HubShell eyebrow="Library intelligence" icon={<BarChart3 className="size-4"/>} title="Know what your library needs next." copy="Counts are calculated locally while the rest of the app stays responsive."><p role="status" className="mt-6 text-sm text-muted">{stats.error ? 'Statistics could not be calculated.' : 'Calculating library statistics…'}</p>{stats.error && <Button onClick={() => setFavoriteRevision(value => value + 1)}>Retry statistics</Button>}</HubShell>;
  const { watchScores, summary, youtubeHealth, youtubeMappedCounts, folderRows, topicReviewQueue, adultTagStats, favoriteHealth, sourceHealth, pullTotals, unavailableCount = 0, adultSnapshot, markedTitles, totalMarks, markedRows } = stats.data;
  const exportStats = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const feedback = exportFeedback();
    downloadCsv([
      ["metric", "value"],
      ["catalog_titles", videos.length], ["topic_tags_per_title", summary.tagDensity.toFixed(3)], ["remote_catalog_percent", Math.round(summary.remoteShare * 100)], ["local_storage_bytes_per_local_title", Math.round(summary.totalBytes / Math.max(summary.localTitles, 1))],
      ["local_storage_bytes", summary.totalBytes],
      ["topic_tag_assignments", summary.tagAssignments],
      ["favorites", favoriteHealth.saved],
      ["pull_runs_retained", pullTotals.runs], ["pull_successful_runs", pullTotals.successful], ["pull_partial_runs", pullTotals.partial], ["pull_failed_runs", pullTotals.failed], ["pull_creators_checked", pullTotals.checked], ["pull_videos_returned", pullTotals.returned], ["pull_new_videos", pullTotals.added],
      ["local_titles", summary.localTitles], ["remote_titles", summary.remoteTitles], ["untagged_titles", summary.untaggedTitles], ["fresh_remote_titles_7d", summary.freshRemoteTitles],
      ["youtube_titles", summary.youtubeTitles], ["twitch_titles", summary.twitchTitles], ["live_titles", summary.liveTitles], ["poster_ready_titles", summary.thumbReady], ["unavailable_titles", unavailableCount], ["history_events", history.length],
      ["topic_tag_coverage_percent", Math.round(((summary.publicTopicTitles - summary.untaggedTitles) / Math.max(summary.publicTopicTitles, 1)) * 100)], ["public_topic_titles", summary.publicTopicTitles], ["saved_topic_titles", summary.savedTopicTitles], ["derived_only_topic_titles", summary.publicTopicTitles - summary.untaggedTitles - summary.savedTopicTitles], ["youtube_distinct_video_ids", youtubeHealth.distinctVideos], ["youtube_duplicate_cached_rows", youtubeHealth.duplicateRows], ["largest_source_percent", sourceHealth.concentration], ["duplicate_source_names", sourceHealth.duplicateNames.length],
      ["metadata_tagged_titles", summary.metadataTaggedTitles], ["metadata_tag_coverage_percent", Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)], ["creator_tagged_titles", summary.creatorTaggedTitles], ["titles_with_description", summary.descriptionTaggedTitles],
      ["multi_topic_titles", summary.multiTopicTitles], ["cross_source_bridge_topics", summary.bridgeTopics], ["operational_tag_assignments", summary.operationalTagAssignments], ["useful_topic_share_percent", Math.round(((summary.publicTopicTitles - summary.untaggedTitles) / Math.max(summary.publicTopicTitles, 1)) * 100)],
      ["favorites_saved", favoriteHealth.saved], ["favorites_resolved", favoriteHealth.resolved], ["favorites_waiting_for_source", favoriteHealth.missing],
      ["video_ratings_saved", Object.keys(feedback.ratings).length], ["creator_ratings_saved", Object.keys(feedback.creatorRatings).length], ["creator_likes_saved", Object.keys(feedback.creatorLikes).length], ["notes_saved", Object.keys(feedback.notes).length],
      ["known_duration_titles", summary.durationTitles], ["known_duration_hours", Math.round(summary.knownDuration / 3600)], ["resume_marks", summary.resumedTitles], ["local_view_events", summary.totalViews],
      ...summary.genreRows.map(([name, count]) => [`genre:${name}`, count]),
      ...summary.topTags.map(([name, count]) => [`topic_tag:${name}`, count]),
      ...sourceHealth.duplicateNames.map(({ name, count }) => [`duplicate_source:${name}`, count]),
  ], `reelcase-library-insights-${stamp}.csv`);
  };
  const exportSources = () => downloadCsv([
    ["source", "kind", "mapped_titles", "local_storage_bytes", "last_checked", "source_id", "primary_folder_titles"],
    ...folderRows.map(({ folder, videos: mapped, bytes: mappedBytes }) => [folder.name, folder.kind, mapped, mappedBytes, folder.lastCheckedAt ? new Date(folder.lastCheckedAt).toISOString() : "", folder.id, summary.byFolder.get(folder.id)?.videos ?? 0]),
  ], `reelcase-source-map-${new Date().toISOString().slice(0, 10)}.csv`);
  const exportRemediation = () => downloadCsv([
    ["queue", "priority", "title_or_source", "reason", "suggested_safe_action"],
    ...topicReviewQueue.map((video, index) => ["topic-coverage", index + 1, video.name, "No saved or inferred public topic", "Review in preview or apply explainable smart tags"]),
    ...sourceHealth.duplicateNames.flatMap(({ name, count }) => [["source-hygiene", 1, name, `${count} identical source labels`, "Open source map and rename only after review"]]),
    ...(sourceHealth.largest ? [["storage-concentration", 1, sourceHealth.largest.folder.name, `${sourceHealth.concentration}% of mapped local bytes`, "Review source contents; no files are changed automatically"]] : []),
  ], `reelcase-remediation-plan-${new Date().toISOString().slice(0, 10)}.csv`);
  const importRecoveryPack = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".zip,.json,.csv,application/zip,application/json,text/csv";
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      if (!window.confirm("Merge this Realhub recovery pack? Current catalog and activity stay intact.")) return;
      void importLibraryPackZip(file, {
        getFollows: () => useLibrary.getState().follows,
        setFollows: (follows) => useLibrary.setState({ follows }),
        getHistory: () => useLibrary.getState().history,
        setHistory: (history) => useLibrary.setState({ history }),
        getViewCounts: () => useLibrary.getState().viewCounts,
        getCameCounts: () => useLibrary.getState().cameCounts,
        setMarks: (viewCounts, cameCounts) => useLibrary.setState({ viewCounts, cameCounts }),
        getFavorites: () => Object.keys(useLibrary.getState().favorites),
        getLikes: () => Object.keys(useLibrary.getState().likes),
        setShelves: (favorites, likes) => useLibrary.setState({ favorites: Object.fromEntries(favorites.map((id) => [id, true as const])), likes: Object.fromEntries(likes.map((id) => [id, true as const])) }),
        getProgress: () => useLibrary.getState().progress,
        getResumeProgress: () => useLibrary.getState().resumeProgress,
        setResume: (progress, resumeProgress) => useLibrary.setState({ progress, resumeProgress }),
        getLinks: () => linksFromHistoryAndResume(useLibrary.getState().history, useLibrary.getState().resumeProgress),
        setLinks: () => { /* Persisted by the pack importer. */ },
      }).then((result) => setRecoveryNote(`Recovered +${result.historyMerged} activity entries · +${result.followsAdded} follows · +${result.linksMerged} saved links${result.feedbackMerged ? " · ratings and hearts merged" : ""}${result.warnings.length ? ` · ${result.warnings[0]}` : ""}.`)).catch((error) => setRecoveryNote(error instanceof Error ? error.message : "Recovery import failed."));
    };
    input.click();
  };
  return <HubShell eyebrow="Library intelligence" icon={<BarChart3 className="size-4"/>} title="Know what your library needs next." copy="These local-only counts help identify coverage gaps, oversized source folders, and the tags that are driving discovery.">
    {stats.pending && <p role="status" className="mt-3 text-xs text-muted">Updating statistics…</p>}{stats.error && <p role="status" className="mt-3 text-xs text-muted">Statistics could not update. Showing the last completed snapshot.</p>}
    <RankingPanel />
    <section className="mt-2 rounded-xl border border-border bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">How your ratings work</p><h2 className="mt-2 font-display text-2xl text-fg">Your choices steer discovery</h2><p className="mt-2 text-sm leading-6 text-muted">1 star lowers a video and its related topics. 2 stars is neutral. 3 to 5 stars raise recommendations progressively. Favorites and likes add separate positive signals. Watch time is a smaller secondary score: preview and full player time count separately, while seeking adds nothing. Local playback is measured directly; visible YouTube and Twitch embeds contribute a lower-weight estimate.</p><div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2"><div className="min-w-0 rounded-lg bg-bg/50 p-3"><p className="text-sm font-medium text-fg">Most watched videos</p>{watchScores.videos.length ? watchScores.videos.map((row) => <p key={row.video.id} className="mt-2 truncate text-xs text-muted" title={row.video.name}>{row.video.name} · preview {Math.floor(row.preview / 60)}m · player {Math.floor(row.fullscreen / 60)}m{row.previewEstimated || row.fullscreenEstimated ? ` · embed estimate ${Math.floor(((row.previewEstimated ?? 0) + (row.fullscreenEstimated ?? 0)) / 60)}m` : ""} · +{row.score}</p>) : <p className="mt-2 text-xs text-muted">Watch time will appear after playback.</p>}</div><div className="min-w-0 rounded-lg bg-bg/50 p-3"><p className="text-sm font-medium text-fg">Most watched tags</p>{watchScores.tags.length ? watchScores.tags.map((row) => <p key={row.tag} className="mt-2 truncate text-xs text-muted">#{row.tag} · preview {Math.floor(row.preview / 60)}m · player {Math.floor(row.fullscreen / 60)}m{row.previewEstimated || row.fullscreenEstimated ? ` · embed estimate ${Math.floor((row.previewEstimated + row.fullscreenEstimated) / 60)}m` : ""} · +{row.score}</p>) : <p className="mt-2 text-xs text-muted">Tags inherit watch time from videos you play.</p>}</div></div></section>
    <section className="mt-5 rounded-xl border border-border bg-surface p-5 shadow-border" aria-label="Pull success statistics"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Pull success</p><h2 className="mt-2 font-display text-2xl text-fg">Know what updated—and what didn’t.</h2><p className="mt-1 max-w-2xl text-sm text-muted">Recent refresh, archive, import, and creator-pull results are saved locally. A returned count can include already-cached videos; “new” counts only additions.</p></div><span className="rounded-full bg-bg/55 px-3 py-1 text-xs text-muted">{pullTotals.runs} recent runs retained</span></div><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-6"><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Clean-run rate</p><p className="mt-1 font-display text-2xl tabular-nums text-fg">{pullTotals.runs ? `${Math.round(pullTotals.successful / pullTotals.runs * 100)}%` : "—"}</p></div><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Successful</p><p className="mt-1 font-display text-2xl tabular-nums text-fg">{pullTotals.successful.toLocaleString()}</p></div><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Partial</p><p className="mt-1 font-display text-2xl tabular-nums text-fg">{pullTotals.partial.toLocaleString()}</p></div><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Failed</p><p className="mt-1 font-display text-2xl tabular-nums text-fg">{pullTotals.failed.toLocaleString()}</p></div><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Targets checked</p><p className="mt-1 font-display text-2xl tabular-nums text-fg">{pullTotals.checked.toLocaleString()}</p></div><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Videos returned · new</p><p className="mt-1 font-display text-2xl tabular-nums text-fg">{pullTotals.returned.toLocaleString()} <span className="text-sm text-muted">· {pullTotals.added.toLocaleString()}</span></p></div></div><div className="mt-4 divide-y divide-border rounded-md bg-bg/35">{pullHistory.slice(0, 12).map((run) => <details key={run.id} className="px-3 py-3"><summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 text-sm"><span className="min-w-24 font-medium text-fg">{run.provider === "youtube" ? "YouTube" : run.provider === "twitch" ? "Twitch" : run.provider === "adult" ? "Adult sources" : run.provider === "photos" ? "Photos" : "Multiple sources"}</span><span className="text-muted">{run.action}</span><span className="ml-auto text-xs text-muted">{run.done}/{run.total} targets · {run.received} returned · {run.added} new · {run.failed} failed</span><span className={`rounded-full px-2 py-0.5 text-xs ${run.status === "success" ? "bg-accent/15 text-accent" : run.status === "partial" ? "bg-bg text-fg" : "bg-danger/15 text-danger"}`}>{run.status}</span></summary><p className="mt-2 text-xs text-muted">{new Date(run.finishedAt).toLocaleString()} · {run.targets.slice(0, 8).join(", ")}{run.targets.length > 8 ? ` + ${run.targets.length - 8} more` : ""}</p>{run.errors?.length ? <ul className="mt-2 space-y-1 text-xs text-danger">{run.errors.map((error, index) => <li key={`${run.id}:${index}`}>{error}</li>)}</ul> : null}</details>)}{!pullHistory.length && <p className="px-3 py-4 text-sm text-muted">Pull results will appear here after your next refresh or creator pull.</p>}</div></section>
    <section id="adult-stats" className="mt-2 scroll-mt-24 rounded-xl border border-accent/35 bg-elevated p-5 shadow-border">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult division</p>
          <h2 className="mt-2 font-display text-3xl text-fg">Adult tags, sources & export</h2>
          <p className="mt-1 max-w-3xl text-sm text-muted">Pinned at the top of Stats so Adult coverage is obvious. Counts stay on this device; pull the Adults catalog if this panel is empty.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => exportAdultStats(adultSnapshot, "csv")}><Download className="size-4"/>Adult CSV</Button>
          <Button size="sm" variant="secondary" onClick={() => exportAdultStats(adultSnapshot, "json")}><Download className="size-4"/>Adult JSON</Button>
          <Button size="sm" onClick={() => useLibrary.getState().setSource("adults")}>Open Adults</Button>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Adult titles</p><p className="mt-1 text-lg font-medium text-fg">{adultTagStats.adultTitles.toLocaleString()}</p></div>
        <div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Adult tag coverage</p><p className="mt-1 text-lg font-medium text-fg">{Math.round(adultTagStats.adultTagCoverage.share * 100)}%</p><p className="text-xs text-muted">{adultTagStats.adultTagCoverage.tagged.toLocaleString()} tagged</p></div>
        <div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Marked (I cummed)</p><p className="mt-1 text-lg font-medium text-fg">{markedTitles.toLocaleString()}</p></div>
        <div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Total marks</p><p className="mt-1 text-lg font-medium text-fg">{totalMarks.toLocaleString()}</p></div>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Preview URLs supplied</p><p className="mt-1 text-lg font-medium text-fg">{Math.round(adultTagStats.previewCoverage.share * 100)}%</p><p className="text-xs text-muted">{adultTagStats.previewCoverage.ready.toLocaleString()} cards declare artwork; loading is measured separately</p></div>
        <div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Observed preview loads</p><p className="mt-1 text-lg font-medium text-fg">{observedPreviewHealth.tested ? `${Math.round(observedPreviewHealth.share * 100)}%` : "—"}</p><p className="text-xs text-muted">{observedPreviewHealth.loaded} loaded · {observedPreviewHealth.failed} failed · {observedPreviewHealth.tested} tested this session</p></div>
        <div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Creator credit</p><p className="mt-1 text-lg font-medium text-fg">{Math.round(adultTagStats.creatorCoverage.share * 100)}%</p><p className="text-xs text-muted">{adultTagStats.creatorCoverage.uniqueCreators.toLocaleString()} normalized creators</p></div>
        <div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Duplicate candidates</p><p className="mt-1 text-lg font-medium text-fg">{adultTagStats.dedupe.extraTitles.toLocaleString()}</p><p className="text-xs text-muted">across {adultTagStats.dedupe.candidateGroups.toLocaleString()} media groups</p></div>
      </div>
      {adultTagStats.providerMix.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult provider mix</p>
          <p className="mt-1 text-xs text-muted">Every configured Adult source is shown. Empty means the current catalog has no returned titles yet.</p>
          <div className="mt-2 flex flex-wrap gap-2">{adultTagStats.providerMix.map((source) => <span key={source.provider} className={`rounded-full px-3 py-1 text-xs font-medium ${source.status === "active" ? "bg-accent/15 text-accent" : "bg-bg/45 text-muted"}`}>{source.label} · {source.titles.toLocaleString()} · {Math.round(source.share * 100)}%</span>)}</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{adultTagStats.providerMix.filter((source) => source.titles || source.linkedTitles).map((source) => <div key={`${source.provider}-quality`} className="rounded-md bg-bg/45 p-3 text-xs text-muted"><p className="font-medium text-fg">{source.label} · {source.titles.toLocaleString()} primary{source.linkedTitles ? ` · ${source.linkedTitles.toLocaleString()} linked` : ""}</p><p className="mt-1">Artwork URLs {Math.round(source.previewCoverage.share * 100)}% · backup URLs {Math.round(source.backupPreviewCoverage.share * 100)}%</p><p>Creator {Math.round(source.creatorCoverage.share * 100)}% · interests {Math.round(source.usefulTagCoverage.share * 100)}%</p>{source.duplicateCandidates > 0 && <p className="mt-1 text-accent">{source.duplicateCandidates.toLocaleString()} duplicate candidates</p>}</div>)}</div>
        </div>
      )}
      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="h-72 rounded-lg bg-bg/45 p-4">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Artwork availability by source</p>
          <p className="mt-1 text-xs text-muted">Declared artwork URLs by provider. Actual image loading is measured above from cards opened this session.</p>
          <ViewportChart height="78%"><BarChart data={adultTagStats.providerMix.filter((row) => row.titles > 0).map((row) => ({ name: row.label, ready: Math.round(row.previewCoverage.share * 100), backup: Math.round(row.backupPreviewCoverage.share * 100) }))}><XAxis dataKey="name" stroke="currentColor" fontSize={10} interval={0} angle={-20} textAnchor="end" height={54}/><YAxis domain={[0, 100]} stroke="currentColor" fontSize={12}/><Tooltip/><Bar isAnimationActive={false} dataKey="ready" name="Artwork URLs supplied %" fill="var(--color-accent)" radius={4}/><Bar isAnimationActive={false} dataKey="backup" name="Backup paths %" fill="var(--color-muted)" radius={4}/></BarChart></ViewportChart>
        </div>
        <div className="h-72 rounded-lg bg-bg/45 p-4">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Most applied Adult interests</p>
          <p className="mt-1 text-xs text-muted">Only recurring interest labels are shown; provider, creator, and parser labels are excluded.</p>
          <ViewportChart height="78%"><BarChart layout="vertical" margin={{ left: 16 }} data={adultTagStats.topFetish.slice(0, 8).map(([tag, count]) => ({ name: tag.replace(/^fetish-/, ""), titles: count }))}><XAxis type="number" stroke="currentColor" fontSize={12}/><YAxis type="category" dataKey="name" width={122} stroke="currentColor" fontSize={10}/><Tooltip/><Bar isAnimationActive={false} dataKey="titles" fill="var(--color-accent)" radius={4}/></BarChart></ViewportChart>
        </div>
      </section>
      <section className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="h-72 rounded-lg bg-bg/45 p-4">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult media mix</p>
          <p className="mt-1 text-xs text-muted">Videos, live rooms, and photos currently in the Adult catalog.</p>
          <ViewportChart height="78%"><PieChart><Pie isAnimationActive={false} dataKey="value" nameKey="name" data={[{ name: "Videos", value: adultTagStats.kindCounts.videos }, { name: "Live", value: adultTagStats.kindCounts.live }, { name: "Photos", value: adultTagStats.kindCounts.photos }].filter((row) => row.value > 0)} innerRadius={42} outerRadius={72} paddingAngle={2}>{["var(--color-accent)", "var(--color-muted)", "#7c6cff"].map((color, index) => <Cell key={color} fill={color} />)}</Pie><Tooltip/></PieChart></ViewportChart>
        </div>
        <div className="h-72 rounded-lg bg-bg/45 p-4">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Booru host mix</p>
          <p className="mt-1 text-xs text-muted">Rule34 is listed first so its filter chip stays accountable.</p>
          <ViewportChart height="78%"><BarChart data={adultTagStats.booruHosts.slice(0, 8).map((row) => ({ name: row.host, titles: row.count }))}><XAxis dataKey="name" stroke="currentColor" fontSize={10} interval={0} angle={-20} textAnchor="end" height={54}/><YAxis stroke="currentColor" fontSize={12}/><Tooltip/><Bar isAnimationActive={false} dataKey="titles" fill="var(--color-accent)" radius={4}/></BarChart></ViewportChart>
        </div>
        <div className="rounded-lg bg-bg/45 p-4">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult engagement table</p>
          <div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="text-muted"><th className="py-1 pr-3 font-medium">Metric</th><th className="py-1 font-medium">Value</th></tr></thead><tbody className="text-fg">
            <tr className="border-t border-border/60"><td className="py-1.5 pr-3">Local view events</td><td>{adultTagStats.adultViews.toLocaleString()}</td></tr>
            <tr className="border-t border-border/60"><td className="py-1.5 pr-3">Resume watch time</td><td>{adultTagStats.adultWatchHours.toFixed(1)} h</td></tr>
            <tr className="border-t border-border/60"><td className="py-1.5 pr-3">Rated titles</td><td>{adultTagStats.adultRated.toLocaleString()}</td></tr>
            <tr className="border-t border-border/60"><td className="py-1.5 pr-3">History events</td><td>{adultTagStats.historyAdult.toLocaleString()}</td></tr>
            <tr className="border-t border-border/60"><td className="py-1.5 pr-3">1-video tags ranked</td><td>{adultTagStats.sparseTags.toLocaleString()}</td></tr>
            <tr className="border-t border-border/60"><td className="py-1.5 pr-3">Rule34 cards</td><td>{(adultTagStats.booruHosts.find((row) => row.host === "rule34")?.count ?? 0).toLocaleString()}</td></tr>
          </tbody></table></div>
        </div>
      </section>
      {adultTagStats.booruHosts.length > 0 && <div className="mt-4 overflow-x-auto rounded-md bg-bg/45 p-3"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Booru hosts</p><table className="mt-2 w-full min-w-[28rem] text-left text-xs"><thead><tr className="text-muted"><th className="py-1 pr-3">Host</th><th className="py-1 pr-3">Titles</th><th className="py-1">Share</th></tr></thead><tbody>{adultTagStats.booruHosts.map((row) => <tr key={row.host} className="border-t border-border/60 text-fg"><td className="py-1.5 pr-3 font-medium">{row.host}</td><td className="py-1.5 pr-3">{row.count.toLocaleString()}</td><td className="py-1.5">{adultTagStats.adultTitles ? `${Math.round(row.count / adultTagStats.adultTitles * 100)}%` : "—"}</td></tr>)}</tbody></table></div>}
      {(adultTagStats.genres.length > 0 || adultTagStats.metaTags.length > 0) && <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Mapped genres</p><div className="mt-2 flex flex-wrap gap-2">{adultTagStats.genres.map((row) => <span key={row.tag} className="rounded-full bg-bg/45 px-3 py-1 text-xs text-fg">{row.label} · {row.count}</span>)}</div></div><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Recommendation metatags</p><div className="mt-2 flex flex-wrap gap-2">{adultTagStats.metaTags.map((row) => <span key={row.tag} className="rounded-full bg-bg/45 px-3 py-1 text-xs text-fg">{row.tag.replace(/^meta-/, "").replace(/-/g, " ")} · {row.count}</span>)}</div></div></div>}
      <div className="mt-4 rounded-md bg-bg/45 p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Tag health & connections</p><p className="mt-1 text-sm text-muted">{adultTagStats.tagQuality.usefulTagged.toLocaleString()} titles have a useful interest, averaging {adultTagStats.tagQuality.averageUsefulTags.toFixed(1)} interests per title. {adultTagStats.noisyTagAssignments ? `${adultTagStats.noisyTagAssignments.toLocaleString()} old parser-style labels are excluded from ranking.` : "No parser-style labels are influencing rankings."}</p></div><Button size="sm" variant="secondary" onClick={() => { void useLibrary.getState().autoTagLibrary().catch(() => undefined); }}>Repair Adult tags</Button></div>{adultTagStats.tagConnections.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{adultTagStats.tagConnections.map((connection) => <span key={`${connection.left}-${connection.right}`} className="rounded-full border border-border px-3 py-1 text-xs text-fg">#{connection.left} + #{connection.right} · {connection.count} · {connection.lift.toFixed(1)}× · {connection.providerCount} sources</span>)}</div>}</div>
      {adultTagStats.redditTags.length > 0 && <div className="mt-4 rounded-md bg-bg/45 p-3"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Reddit source coverage</p><p className="mt-1 text-sm text-muted">Your stored community tags are counted separately from generic Reddit labels, so favorites and source-list changes can guide future pulls.</p><div className="mt-3 flex flex-wrap gap-2">{adultTagStats.redditTags.map((row) => <span key={row.tag} className="rounded-full border border-border px-3 py-1 text-xs text-fg">#{row.tag.replace(/^sub-/, "")} · {row.count}</span>)}</div></div>}
      <div className="mt-4">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Your adult tags</p>
        {adultTagStats.topFetish.length || adultTagStats.topSources.length ? (
          <>
            <div className="mt-2 flex flex-wrap gap-2">{adultTagStats.topFetish.map(([tag, count]) => <span key={tag} className="rounded-full bg-bg/45 px-3 py-1 text-xs text-fg">#{tag} · {count}</span>)}</div>
            <div className="mt-2 flex flex-wrap gap-2">{adultTagStats.topSources.map(([tag, count]) => <span key={tag} className="rounded-full bg-bg/45 px-3 py-1 text-xs text-muted">#{tag} · {count}</span>)}</div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">No adult tags yet. Open Adults and pull the catalog — source/fetish tags appear here automatically.</p>
        )}
      </div>
      {markedTitles > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">I cummed to it</p>
          {markedRows.map(({ id, n, name }) => {
            return <button key={id} type="button" className="block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg" onClick={() => useLibrary.getState().openPreview(id)}>{name}<span className="ml-2 text-xs text-accent">· {n}×</span></button>;
          })}
        </div>
      )}
    </section>
    <section className="mt-6"><Button variant="secondary" onClick={() => setShowTopicLinks(value => !value)} aria-expanded={showTopicLinks}>{showTopicLinks ? "Close connected topics" : "Explore connected topics"}</Button>{showTopicLinks && <TopicLinks />}</section>
    <div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={exportStats}><Download className="size-4"/>Download insight CSV</Button><Button size="sm" variant="secondary" onClick={exportSources}><Download className="size-4"/>Download source-map CSV</Button><Button size="sm" variant="secondary" onClick={exportRemediation}><Download className="size-4"/>Download remediation CSV</Button><span className="self-center text-xs text-muted">Exports only local catalog metadata, useful for improving sorting and discovery rules.</span></div>
    <section className="mt-5 rounded-lg border border-border bg-elevated p-4 shadow-border" aria-label="Stats recovery import"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Recovery import</p><h2 className="mt-1 text-lg font-medium text-fg">Bring back your exported signals.</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-muted">Import a Realhub library pack to merge exported history, resume marks, favorites, follows, ratings, Adult marks, and saved links. Insight CSV files stay read-only reports; use the pack for recovery.</p></div><Button size="sm" variant="secondary" onClick={importRecoveryPack}><Upload className="size-4"/>Import recovery pack</Button></div>{recoveryNote && <p className="mt-3 text-xs text-accent" role="status">{recoveryNote}</p>}</section>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Catalog titles" value={videos.length.toLocaleString()}/><Stat label="Local storage mapped" value={bytes(summary.totalBytes)}/><Stat label="Saved topic assignments" value={summary.tagAssignments.toLocaleString()}/><Stat label="Favorites" value={favoriteHealth.saved.toLocaleString()}/></div>
    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Local / remote" value={`${summary.localTitles.toLocaleString()} / ${summary.remoteTitles.toLocaleString()}`}/><Stat label="Remote catalog share" value={`${Math.round(summary.remoteShare * 100)}%`}/><Stat label="New provider items · 7d" value={summary.freshRemoteTitles.toLocaleString()}/><Stat label="Needs useful topic" value={`${summary.untaggedTitles.toLocaleString()} titles`}/><Stat label="Connected topic coverage" value={`${Math.round((summary.publicTopicTitles - summary.untaggedTitles) / Math.max(summary.publicTopicTitles, 1) * 100)}%`}/><Stat label="Saved topic coverage" value={`${Math.round(summary.savedTopicTitles / Math.max(summary.publicTopicTitles, 1) * 100)}%`}/><Stat label="YouTube duplicate rows" value={youtubeHealth.duplicateRows.toLocaleString()}/><Stat label="Topic tags per title" value={summary.tagDensity.toFixed(2)}/><Stat label="Cross-source topic bridges" value={summary.bridgeTopics.toLocaleString()}/><Stat label="Multi-topic titles" value={summary.multiTopicTitles.toLocaleString()}/><Stat label="Operational labels" value={summary.operationalTagAssignments.toLocaleString()}/><Stat label="Any metadata coverage" value={`${Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)}%`}/><Stat label="Creator / description coverage" value={`${summary.creatorTaggedTitles.toLocaleString()} / ${summary.descriptionTaggedTitles.toLocaleString()}`}/><Stat label="YouTube / Twitch" value={`${summary.youtubeTitles.toLocaleString()} / ${summary.twitchTitles.toLocaleString()}`}/><Stat label="Known runtime" value={`${Math.round(summary.knownDuration / 3600).toLocaleString()} hours`}/><Stat label="Resume marks" value={summary.resumedTitles.toLocaleString()}/><Stat label="Local view events" value={summary.totalViews.toLocaleString()}/><Stat label="Saved live entries" value={summary.liveTitles.toLocaleString()}/><Stat label="Artwork coverage" value={`${Math.round(summary.thumbReady / Math.max(videos.length, 1) * 100)}%`}/><Stat label="History events" value={history.length.toLocaleString()}/><Stat label="Unavailable cards" value={unavailableCount.toLocaleString()}/></section>
    <section className="mt-5 rounded-lg border border-border bg-surface p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Fast paths from your library</p><h2 className="mt-2 font-display text-2xl text-fg">Use the small, useful slice first.</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-muted">Topic, Continue, and source views now reuse saved metadata and mount cards progressively. Favorite topics lead every topic list so the first results match what you actually want to browse.</p><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Favorite topics</p><p className="mt-1 text-lg font-medium text-fg">{summary.topicRows.filter(([topic]) => tagIsLiked(topic)).length}</p><p className="mt-1 text-xs text-muted">Pinned ahead of large catalog scans.</p></div><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Ready to resume</p><p className="mt-1 text-lg font-medium text-fg">{summary.resumedTitles.toLocaleString()}</p><p className="mt-1 text-xs text-muted">Stable resume records survive catalog refreshes.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => useLibrary.getState().setSource("continue")}>Open Continue</Button></div><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Metadata-first catalog</p><p className="mt-1 text-lg font-medium text-fg">{Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)}%</p><p className="mt-1 text-xs text-muted">Existing metadata is used before slower title-only inference.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => useLibrary.getState().setSource("genres")}>Open Topics</Button></div></div>{summary.topicRows.filter(([topic]) => tagIsLiked(topic)).length > 0 && <div className="mt-4 flex flex-wrap gap-2">{summary.topicRows.filter(([topic]) => tagIsLiked(topic)).slice(0, 12).map(([topic, count]) => <Button key={topic} size="sm" variant="secondary" onClick={() => openTopic(topic)}>★ #{topic} · {count.toLocaleString()}</Button>)}</div>}</section>
    <section className="mt-5 grid gap-5 xl:grid-cols-2"><div className="h-[42rem] min-w-0 rounded-lg bg-elevated p-5 shadow-border"><h2 className="font-display text-2xl text-fg">Provider mix</h2><p className="mt-1 text-xs text-muted">Includes local, public video providers, and the active Adult catalog sources.</p><ViewportChart height="88%"><BarChart data={[{ name: "Local", titles: summary.localTitles }, { name: "YouTube", titles: summary.youtubeTitles }, { name: "Twitch", titles: summary.twitchTitles }, ...adultTagStats.providerMix.filter((row) => row.titles > 0).map((row) => ({ name: row.label, titles: row.titles }))]}><XAxis dataKey="name" stroke="currentColor" fontSize={10} interval={0} angle={-24} textAnchor="end" height={50}/><YAxis stroke="currentColor" fontSize={12}/><Tooltip/><Bar isAnimationActive={false} dataKey="titles" fill="var(--color-accent)" radius={4}/></BarChart></ViewportChart></div><div className="h-[42rem] min-w-0 rounded-lg bg-elevated p-5 shadow-border"><h2 className="font-display text-2xl text-fg">Most useful topics</h2><p className="mt-1 text-xs text-muted">Preference points use feedback ÷ (feedback count + 3), times 10; a heart adds 12. Titles without feedback add no votes. Up to 20 topics.</p>{!summary.topTags.length && <p className="mt-8 text-sm text-muted">Heart, like, or rate a tagged video to build your topic ranking.</p>}<ViewportChart height="88%"><BarChart layout="vertical" margin={{ left: 16 }} data={summary.topTags.map(([name, titles]) => ({ name, titles, score: Number(topicPreferenceScore(summary.topicRatings.get(name)?.total ?? 0, summary.topicRatings.get(name)?.rated ?? 0, tagIsLiked(name)).toFixed(2)) })).filter((topic) => topic.score > 0).slice(0, 20)}><XAxis type="number" stroke="currentColor" fontSize={12}/><YAxis type="category" dataKey="name" width={150} stroke="currentColor" fontSize={10}/><Tooltip/><Bar isAnimationActive={false} dataKey="score" fill="var(--color-accent)" radius={4}/></BarChart></ViewportChart></div></section>
    <section className="mt-5 grid gap-3 lg:grid-cols-4"><div className="rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Tagging backlog</p><p className="mt-2 font-display text-3xl text-fg">{summary.untaggedTitles.toLocaleString()}</p><p className="mt-1 text-sm text-muted">titles still need a useful topic tag. Prioritize these before adding more discovery rules.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => setRemediationView(remediationView === "topics" ? "" : "topics")}>Review safe queue</Button></div><div className="rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Storage concentration</p><p className="mt-2 font-display text-3xl text-fg">{sourceHealth.concentration}%</p><p className="mt-1 text-sm text-muted">of mapped local bytes sit in {sourceHealth.largest?.folder.name ?? "the largest source"}.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => setRemediationView(remediationView === "sources" ? "" : "sources")}>Review source queue</Button></div><div className="rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Source hygiene</p><p className="mt-2 font-display text-3xl text-fg">{sourceHealth.duplicateNames.length}</p><p className="mt-1 text-sm text-muted">duplicate source labels can make refresh results harder to interpret.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => setRemediationView(remediationView === "sources" ? "" : "sources")}>Review duplicates</Button></div><div className="rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Heart recovery</p><p className="mt-2 font-display text-3xl text-fg">{favoriteHealth.resolved} / {favoriteHealth.saved}</p><p className="mt-1 text-sm text-muted">{favoriteHealth.missing ? `${favoriteHealth.missing} saved favorites are waiting for their source to return.` : "Every saved favorite resolves in the current catalog."}</p></div></section>
    {remediationView === "topics" && <section className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Safe tag review queue</p><p className="mt-1 text-sm text-muted">These are review candidates only—nothing is tagged or deleted by opening this queue.</p></div><Button size="sm" variant="secondary" onClick={() => useLibrary.getState().setSource("settings")}>Open smart-tag tools</Button></div><div className="mt-3 space-y-2">{topicReviewQueue.slice(0, 12).map((video) => <button key={video.id} type="button" className="block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg" onClick={() => useLibrary.getState().openPreview(video.id)}>{video.name}<span className="ml-2 text-xs text-muted">· no useful topic yet</span></button>)}</div></section>}
    {remediationView === "sources" && <section className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Safe source review queue</p><p className="mt-1 text-sm text-muted">Review signals only. Realhub will not rename, reconnect, or remove a folder from this page.</p><div className="mt-3 space-y-2">{sourceHealth.largest && <button type="button" className="block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg" onClick={() => useLibrary.getState().setSource(sourceHealth.largest!.folder.id)}>Largest source · {sourceHealth.largest.folder.name} · {bytes(sourceHealth.largest.bytes)}</button>}{sourceHealth.duplicateNames.map(({ name, count }) => <p key={name} className="rounded-sm bg-bg/45 px-3 py-2 text-sm text-fg">Duplicate label · {name} · {count} sources</p>)}</div></section>}
    <div className="mt-6"><section className="rounded-lg bg-elevated p-5 shadow-border"><h2 className="font-display text-2xl text-fg">Genre distribution</h2><p className="mt-1 text-xs text-muted">Bars compare genres with the most common genre in this list.</p><div className="mt-4 space-y-3">{summary.genreRows.slice(0, 18).map(([genre, count]) => <DistributionRow key={genre} label={genre} value={count} total={summary.genreRows[0]?.[1] ?? 1}/>) || <p className="text-sm text-muted">Genres will appear as media is tagged.</p>}</div></section></div>
  </HubShell>;
}

export function LanConnectionSection() {
  const [origin, setOrigin] = useState("");
  const [localHost, setLocalHost] = useState(false);
  const [quickTunnel, setQuickTunnel] = useState<{ running?: boolean; starting?: boolean; url?: string | null; error?: string | null }>({});
  const [tunnelBusy, setTunnelBusy] = useState(false);
  const [lanOrigins, setLanOrigins] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [companion, setCompanion] = useState<"checking" | "ready" | "offline">("checking");
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [mapStatus, setMapStatus] = useState("Checking devices…");
  const ownDeviceId = useMemo(() => getNetworkDeviceId(), []);
  const refreshDeviceMap = async (signal?: AbortSignal) => {
    try {
      const result = await listNetworkDevices();
      if (signal?.aborted) return;
      setDevices(result.devices);
      setMapStatus(result.devices.length ? `${result.devices.length} active device${result.devices.length === 1 ? "" : "s"}` : "Waiting for another device to open Realhub");
    } catch { if (!signal?.aborted) setMapStatus("Device map is temporarily unavailable"); }
  };
  useEffect(() => {
    const current = window.location;
    const loopback = current.hostname === "localhost" || current.hostname === "127.0.0.1" || current.hostname === "::1";
    setLocalHost(loopback && current.port === "8080");
    let stopTunnel: (() => void) | undefined;
    if (loopback && current.port === "8080") {
      stopTunnel = registerPeriodicTask({ name: 'Tunnel status', everyMs: 2_500, firstMs: 0,
        work: async signal => {
          try { const response = await fetch('/api/quick-tunnel', { signal: AbortSignal.any([signal, AbortSignal.timeout(5_000)]) }); const data = await response.json(); if (!signal.aborted) setQuickTunnel(data); }
          catch { if (!signal.aborted) setQuickTunnel({ error: 'Tunnel status unavailable.' }); }
        } }).cancel;
    }
    setOrigin(loopback ? "" : current.origin);
    if (loopback) void fetch("/api/lan-origin").then((response) => response.ok ? response.json() : { origins: [] }).then((data: { origins?: string[] }) => setLanOrigins(Array.isArray(data.origins) ? data.origins : [])).catch(() => setLanOrigins([]));
    if (current.port === "8080" && loopback)
      void companionHealth().then((health) => setCompanion(health?.ok ? "ready" : "offline")).catch(() => setCompanion("offline"));
    else setCompanion("offline");
    const task = registerPeriodicTask({ name: 'Device map', everyMs: 10_000, firstMs: 0, work: refreshDeviceMap });
    return () => { task.cancel(); stopTunnel?.(); };
  }, []);
  const changeTunnel = async (action: "start" | "stop") => {
    setTunnelBusy(true);
    try {
      const response = await fetch("/api/quick-tunnel", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
      setQuickTunnel(await response.json());
    } catch { setQuickTunnel({ error: "Could not reach the local tunnel controller." }); }
    finally { setTunnelBusy(false); }
  };
  const copyAddress = async () => {
    if (!origin) return;
    try { await navigator.clipboard.writeText(origin); setCopied(true); } catch { setCopied(false); }
  };
  const visibleDevices = devices.slice(0, 12);
  return <HubShell eyebrow="Home network" icon={<Wifi className="size-4"/>} title="Bring another screen into Realhub." copy="Share one address, watch the device map appear, then start a room when everyone is connected.">
    <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-lg bg-elevated p-5 shadow-border">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Share this address</p>
        {origin ? <><p className="mt-2 break-all font-mono text-sm text-fg">{origin}</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => void copyAddress()}><Copy className="size-4"/>{copied ? "Address copied" : "Copy address"}</Button><Button variant="secondary" onClick={() => useLibrary.getState().setSource("watch-room")}>Open Watch Room</Button></div><p className="mt-4 text-xs leading-5 text-muted">On another computer, phone, or TV browser: join the same normal home Wi‑Fi, open this exact address, and leave Realhub open. It will appear in the map below within about 25 seconds.</p></> : <><p className="mt-2 text-sm text-fg">This localhost address works only on this computer.</p>{lanOrigins.length > 0 ? <><p className="mt-2 text-sm leading-6 text-muted">Open Realhub through your home-network address, start a room there, then copy its invitation:</p><div className="mt-3 flex flex-wrap gap-2">{lanOrigins.map((candidate) => <a key={candidate} className="rounded-sm bg-elevated px-3 py-2 font-mono text-xs text-accent shadow-border" href={candidate}>{candidate}</a>)}</div></> : <p className="mt-2 text-sm leading-6 text-muted">No home-network address was found. Connect this computer to your normal home network, then reopen this guide.</p>}</>}
      </div>
      <div className="rounded-lg border border-border bg-surface p-5"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Local companion</p><p className="mt-2 font-display text-2xl text-fg">{companion === "ready" ? "Ready on this computer" : companion === "checking" ? "Checking…" : "Not detected"}</p><p className="mt-2 text-sm text-muted">The companion speeds up local folders on this computer. Other devices can join the Realhub page and Watch Rooms, but do not receive its local files.</p></div>
    </section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border">
      <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Across networks · Cloudflare trial</p>
      <h2 className="mt-2 font-display text-2xl text-fg">Temporary public address</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Start a Quick Tunnel on the host computer to give guests a temporary address for Realhub and Watch Room signaling. Share it only with people you invite. The address disappears when you stop the tunnel or close the host server.</p>
      {localHost ? <>
        <div className="mt-4 flex flex-wrap items-center gap-2"><Button disabled={tunnelBusy || Boolean(quickTunnel.starting)} onClick={() => void changeTunnel(quickTunnel.running ? "stop" : "start")}>{quickTunnel.running ? "Stop trial tunnel" : quickTunnel.starting ? "Starting…" : "Start trial tunnel"}</Button>{quickTunnel.url && <Button variant="secondary" onClick={() => void navigator.clipboard.writeText(quickTunnel.url!)}><Copy className="size-4"/>Copy public address</Button>}</div>
        {quickTunnel.url && <p className="mt-3 break-all font-mono text-sm text-accent">{quickTunnel.url}</p>}
        {quickTunnel.error && <p className="mt-3 text-sm text-muted">{quickTunnel.error} <a className="text-accent underline" href="https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/" target="_blank" rel="noopener noreferrer">Cloudflare install instructions</a></p>}
      </> : <p className="mt-3 text-sm text-muted">Open this tab on the host computer to control its trial tunnel.</p>}
      <p className="mt-3 text-xs leading-5 text-subtle">Quick Tunnels are for testing. A tunnel carries the page and room signaling; peer media may still require a TURN relay when direct connectivity fails.</p>
    </section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Available device map</p><h2 className="mt-2 font-display text-2xl text-fg">{mapStatus}</h2><p className="mt-1 text-sm text-muted">Devices appear only after they open Realhub. The map stores a short-lived browser label, never network addresses or files.</p></div><Button size="sm" variant="secondary" onClick={() => void refreshDeviceMap()}><RefreshCw className="size-4"/>Refresh map</Button></div>
      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(12rem,0.75fr)_minmax(0,1.25fr)]"><div className="rounded-md border border-border bg-bg/45 p-4"><div className="flex items-center gap-3"><Wifi className="size-5 text-accent"/><div><p className="text-sm font-medium text-fg">Realhub host</p><p className="text-xs text-muted">{origin || "Local preview"}</p></div></div><p className="mt-4 text-xs leading-5 text-muted">This computer shares the app address and coordinates the active-device map.</p></div><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{visibleDevices.map((device) => <div key={device.id} className="rounded-md bg-bg/45 p-3"><div className="flex items-center gap-2">{device.kind === "mobile" ? <Smartphone className="size-4 text-accent"/> : <Laptop className="size-4 text-accent"/>}<p className="min-w-0 truncate text-sm font-medium text-fg">{device.id === ownDeviceId ? "This device" : device.label}</p></div><p className="mt-2 text-xs text-muted">{device.id === ownDeviceId ? device.label : "Connected to Realhub"}</p><p className="mt-1 text-[11px] text-accent">Active now</p></div>)}{!visibleDevices.length && <div className="rounded-md border border-dashed border-border p-3 text-sm text-muted sm:col-span-2 xl:col-span-3">Waiting for a device to open the shared address.</div>}</div></div>
    </section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Four steps to connect</p><ol className="mt-4 grid gap-4 md:grid-cols-2"><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">1. Use the Ethernet address.</span><br/>Use the address shown above for normal home Wi‑Fi and Ethernet. The NordLynx address is for VPN peers.</li><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">2. Keep guests off isolated Wi‑Fi.</span><br/>Guest Wi‑Fi often blocks device-to-device traffic. Join the normal household network instead.</li><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">3. Look for the device map.</span><br/>A guest that opens Realhub shows up here automatically. Refresh the map if it has just joined.</li><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">4. Start or join a Watch Room.</span><br/>After the guest is visible, open Watch Room and use the same invitation or room code.</li></ol><p className="mt-4 text-xs leading-5 text-subtle">If the shared page does not open, allow Realhub through the host computer’s private-network firewall and confirm the guest is on the same normal home network.</p></section>
  </HubShell>;
}

export function FindPhoneSection() {
  return <HubShell eyebrow="Device recovery" icon={<Search className="size-4"/>} title="Find your phone." copy="Open your device maker’s official locator. Realhub does not collect location data or keep a copy of your account credentials.">
    <section className="mt-6 grid gap-4 md:grid-cols-2"><a href="https://www.google.com/android/find/" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Android</p><h2 className="mt-2 font-display text-2xl text-fg">Find My Device</h2><p className="mt-2 text-sm text-muted">Open Google’s official Android device locator in a secure new tab.</p></a><a href="https://www.icloud.com/find/" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">iPhone</p><h2 className="mt-2 font-display text-2xl text-fg">Find My</h2><p className="mt-2 text-sm text-muted">Open Apple’s official device locator in a secure new tab.</p></a></section>
  </HubShell>;
}

function DistributionRow({ label, value, total }: { label: string; value: number; total: number }) {
  // Distribution rows compare peers, not the whole catalog. The highest tag
  // should read as the full reference bar instead of every useful label being
  // compressed to a tiny percentage of all titles.
  return <div><div className="flex justify-between gap-3 text-sm"><span className="truncate text-fg">{label}</span><span className="text-muted">{value}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-bg/70"><div className="h-full bg-accent" style={{ width: `${Math.max(3, Math.round(value / Math.max(total, 1) * 100))}%` }}/></div></div>;
}

type CompanionInspectionPreview = {
  videoId: string;
  name: string;
  inspection: CompanionMediaInspection;
  suggestions: string[];
};

type VideoVisionPreview = {
  videoId: string;
  name: string;
  labels: VisionLabel[];
  suggestions: string[];
};

function companionFilePath(path: string) {
  // Browser-picked files intentionally use opaque handles. Only a real local
  // filesystem path can be verified by the loopback Companion's root gate.
  return /^(?:[a-z]:[\\/]|\\\\[^\\]+\\[^\\]+[\\/]|\/)/i.test(path);
}

function companionTagPart(value: string | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
}

function companionSuggestions(inspection: CompanionMediaInspection) {
  const tags = inspection.tags;
  const videoStream = inspection.streams?.find((stream) => stream.type === "video");
  const year = tags?.date?.match(/(?:19|20)\d{2}/)?.[0];
  return [...new Set([
    tags?.genre ? `genre-${companionTagPart(tags.genre)}` : "",
    tags?.artist ? `artist-${companionTagPart(tags.artist)}` : "",
    tags?.album ? `album-${companionTagPart(tags.album)}` : "",
    year ? `year-${year}` : "",
    videoStream?.codec ? `codec-${companionTagPart(videoStream.codec)}` : "",
    videoStream?.width && videoStream.height ? `resolution-${videoStream.width}x${videoStream.height}` : "",
  ].filter(Boolean))].slice(0, 6);
}

function companionTechnicalSummary(inspection: CompanionMediaInspection) {
  const streams = inspection.streams?.map((stream) => [stream.codec, stream.width && stream.height ? `${stream.width}×${stream.height}` : ""].filter(Boolean).join(" · ")).filter(Boolean) ?? [];
  const duration = Number.isFinite(inspection.duration) && inspection.duration && inspection.duration > 0 ? `${Math.round(inspection.duration)} sec` : "duration unavailable";
  return [duration, ...streams].join(" · ");
}

function metadataSourceLabel(source: string) {
  if (source === "local") return "Local files";
  return source.split("-").map((part) => part ? `${part[0].toUpperCase()}${part.slice(1)}` : part).join(" ");
}

function YoutubeFirstClickDiagnostic() {
  useSyncExternalStore(subscribeYoutubeTrace, getYoutubeTraceRevision, () => 0);
  const trace = getYoutubeFirstClickTrace();
  return <div className="mt-2 rounded-sm bg-bg/45 p-3 text-xs leading-5 text-muted">
    <p className="font-medium text-fg">YouTube first-click trace</p>
    <p>{!trace ? "Open YouTube to record a local timing sample." : <>
      {trace.railReadyMs === undefined ? "Waiting for the first available upload" : `${trace.railReadyMs}ms to ${trace.railCards} text-first cards`}
      {` · selector ${trace.selectorMs ?? "…"}ms work / ${trace.selectorReadyMs ?? "…"}ms ready · ${trace.catalogRows ?? 0} cached rows`}
      {` · artwork ${trace.artwork === "pending" ? "pending" : trace.artwork === "loaded" ? `${trace.artworkWaitMs ?? 0}ms after cards` : "deferred or unavailable"}`}
      {` · provider ${trace.provider === "idle" ? "not needed" : `${trace.providerOverlapMs}ms overlap (${trace.provider})`}`}
    </>}</p>
    <p className="text-subtle">Local timings only; cached cards do not wait for artwork or a provider request.</p>
  </div>;
}

export function SettingsSection() {
  const performanceBudget = usePerformanceProfile();
  const [performanceMode, setPerformanceModeChoice] = useState<PerformanceMode>('adaptive');
  useEffect(() => setPerformanceModeChoice(getPerformanceMode()), [performanceBudget]);
  const [hub, setHub] = useState<HubStore>({ prints: [], games: [] });
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [preferenceGroup, setPreferenceGroup] =
    useState<keyof typeof PREFERENCE_GROUPS>("Playback");
  const [zoom, setZoom] = useState(100);
  const [railLimit, setRailLimit] = useState(8);
  const [adultRailLimit, setAdultRailLimit] = useState(48);
  const [gridPageSize, setGridPageSize] = useState(24);
  const [thumbnailWorkers, setThumbnailWorkers] = useState(0);
  const textFirstArtwork = useTextFirstArtwork();
  const [photoWorkers, setPhotoWorkers] = useState(0);
  const [defaultVolume, setDefaultVolume] = useState(85);
  const [startMuted, setStartMuted] = useState(false);
  const [videoVisionBusy, setVideoVisionBusy] = useState(false);
  const [videoVisionNote, setVideoVisionNote] = useState("");
  const [videoVisionRows, setVideoVisionRows] = useState<VideoVisionPreview[]>([]);
  const [selectedVideoVision, setSelectedVideoVision] = useState<Record<string, boolean>>({});
  const [companionInspectionBusy, setCompanionInspectionBusy] = useState(false);
  const [companionInspectionNote, setCompanionInspectionNote] = useState("");
  const [companionInspectionRows, setCompanionInspectionRows] = useState<CompanionInspectionPreview[]>([]);
  const [selectedCompanionInspections, setSelectedCompanionInspections] = useState<Record<string, boolean>>({});
  const [metadataTailNote, setMetadataTailNote] = useState("");
  const [metadataTailBusy, setMetadataTailBusy] = useState(false);
  const [smartTagsBusy, setSmartTagsBusy] = useState(false);
  const [creatorCoverageNote, setCreatorCoverageNote] = useState("");
  const [twitchRefreshSeconds, setTwitchRefreshSeconds] = useState(30);
  const [liveDensity, setLiveDensity] = useState(4);
  const [sourceCacheFirst, setSourceCacheFirst] = useState(true);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [theme, setTheme] = useState<"night" | "day">("night");
  const [debugReport, setDebugReport] = useState("");
  const refreshFollows = useLibrary((s) => s.refreshFollows);
  const folders = useLibrary((s) => s.folders);
  const videos = useLibrary((s) => s.videos);
  const tags = useLibrary((s) => s.tags);
  const metadataProvenance = useLibrary((s) => s.metadataProvenance);
  const applyReviewedTags = useLibrary((s) => s.applyReviewedTags);
  const applyCompanionTags = useLibrary((s) => s.applyCompanionTags);
  const enrichMetadataTail = useLibrary((s) => s.enrichMetadataTail);
  const repairCachedMetadata = useLibrary((s) => s.repairCachedMetadata);
  const repairCreatorCoverage = useLibrary((s) => s.repairCreatorCoverage);
  const openPreview = useLibrary((s) => s.openPreview);
  const follows = useLibrary((s) => s.follows);
  const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
  const unavailableVideoCount = useLibrary((s) => Object.keys(s.unavailable).length);
  const hiddenVideos = useLibrary((s) => s.hiddenVideos);
  const unhideVideo = useLibrary((s) => s.unhideVideo);
  const remoteCheckedAt = useLibrary((s) => s.remoteCheckedAt);
  const { smartTagStatus, metadataTailCoverage, creatorCoverage, companionInspectionCandidates, vision, hiddenTitles, ready: auditReady } = useSettingsAudit(videos, tags, metadataProvenance, follows, hiddenVideos);
  const metadataTailWaiting = metadataTailCoverage.reduce((total, row) => total + row.waiting, 0);
  const runMetadataTail = async () => {
    setMetadataTailBusy(true);
    setMetadataTailNote('Queued · you can keep browsing while this batch is prepared and saved.');
    try {
    const result = await enrichMetadataTail();
    if (!result.processed) { setMetadataTailNote("Metadata coverage is current for every unlocked catalog title. Locked tags were left untouched."); return; }
    const sourceSummary = result.sources.filter((row) => row.processed).map((row) => `${metadataSourceLabel(row.source)} ${row.changed}/${row.processed}`).join(" · ");
    setMetadataTailNote(`Saved ${result.processed} cached title${result.processed === 1 ? "" : "s"}; ${result.changed} gained safe metadata tags${result.remaining ? ` · ${result.remaining.toLocaleString()} cached titles remain to check` : " · scan complete"}${sourceSummary ? ` · ${sourceSummary}` : ""}.`);
    } catch { setMetadataTailNote('This batch could not finish saving. Completed batches are retained; retry to continue.'); }
    finally { setMetadataTailBusy(false); }
  };
  const runSmartTags = async () => {
    setSmartTagsBusy(true); setServiceNote('Smart tags queued · completed batches save as you browse.');
    try {
      const changed = await useLibrary.getState().autoTagLibrary();
      setServiceNote(changed ? `Smart-tag run saved · ${changed.toLocaleString()} catalog items updated.` : 'Smart tags are already current for every loaded catalog item.');
    } catch { setServiceNote('Smart tags could not finish saving. Retry to continue from saved results.'); }
    finally { setSmartTagsBusy(false); }
  };
  const runCreatorCoverageRepair = () => {
    const result = repairCreatorCoverage();
    if (!result.processed) {
      setCreatorCoverageNote(creatorCoverage.ambiguous.length ? "No uniquely matched cards remain. Ambiguous exact-ID matches stay below for review and were not changed." : "Creator coverage is current for every card with one exact saved provider match.");
      return;
    }
    setCreatorCoverageNote(`Repaired ${result.repaired} creator ${result.repaired === 1 ? "identity" : "identities"} from exact saved provider IDs${result.tagged ? ` · ${result.tagged} unlocked card${result.tagged === 1 ? "" : "s"} also gained its creator tag` : " · locked tag choices were left unchanged"}${result.remaining ? ` · ${result.remaining} remain in the queue` : " · queue complete"}.`);
  };
  const [serviceNote, setServiceNote] = useState("");
  useEffect(() => setHub(readHub()), []);
  useEffect(() => {
    try {
      // v1 silently seeded several switches as enabled. Start this truthful
      // preference ledger empty so the count means choices made by the person
      // using this browser, not hidden defaults from an earlier build.
      const saved = JSON.parse(localStorage.getItem("reelcase.settings.v2") ?? "{}") as Record<string, boolean>;
      const next = { ...saved };
      setPreferences(next);
      localStorage.setItem("reelcase.settings.v2", JSON.stringify(next));
    } catch {
      setPreferences({});
    }
  }, []);
  useEffect(() => { const rail = Number(localStorage.getItem("reelcase.adult-rail-limit") ?? "48"); setAdultRailLimit([16, 24, 48, 72].includes(rail) ? rail : 48);  }, []);
  useEffect(() => {
    const saved = Number(localStorage.getItem("reelcase.ui-zoom") ?? "100");
    const value = [80, 90, 100, 110, 125].includes(saved) ? saved : 100;
    setZoom(value);
    document.documentElement.style.fontSize = `${value}%`;
  }, []);
  useEffect(() => {
    const saved = Number(localStorage.getItem("reelcase.home-rail-limit") ?? "8");
    setRailLimit([8, 16, 32, 48].includes(saved) ? saved : 8);
  }, []);
  useEffect(() => { const saved = Number(localStorage.getItem("reelcase.grid-page-size") ?? "24"); setGridPageSize([24, 48, 96, 144].includes(saved) ? saved : 24); }, []);
  useEffect(() => { const saved = Number(localStorage.getItem("reelcase.thumbnail-workers") ?? "0"); setThumbnailWorkers([1, 2, 3, 4].includes(saved) ? saved : 0); }, []);
  useEffect(() => { const saved = Number(localStorage.getItem("reelcase.photo-scan-workers") ?? "0"); setPhotoWorkers([2, 4, 6, 8, 12].includes(saved) ? saved : 0); }, []);
  useEffect(() => { const saved = Number(localStorage.getItem("reelcase.player-volume") ?? "85"); setDefaultVolume([25, 50, 70, 85, 100].includes(saved) ? saved : 85); setStartMuted(localStorage.getItem("reelcase.player-start-muted") === "true"); }, []);
  useEffect(() => { const saved = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "30"); setTwitchRefreshSeconds([15, 30, 60, 120, 300].includes(saved) ? saved : 30); }, []);
  useEffect(
    () => setSourceCacheFirst(localStorage.getItem("reelcase.source-cache-first") !== "false"),
    [],
  );
  useEffect(() => { try { setDebugEnabled(localStorage.getItem("reelcase.debug-panel") === "true"); } catch { /* unavailable */ } }, []);
  useEffect(() => { try { const saved = localStorage.getItem("reelcase.theme") === "day" ? "day" : "night"; setTheme(saved); document.documentElement.dataset.theme = saved; } catch { /* unavailable */ } }, []);
  useEffect(() => setLiveDensity([3, 4, 6].includes(Number(localStorage.getItem("reelcase.live-columns") ?? "4")) ? Number(localStorage.getItem("reelcase.live-columns")) : 4), []);
  const setGlobalZoom = (value: number) => {
    setZoom(value);
    localStorage.setItem("reelcase.ui-zoom", String(value));
    document.documentElement.style.fontSize = `${value}%`;
  };
  const setColorTheme = (value: "night" | "day") => {
    setTheme(value);
    localStorage.setItem("reelcase.theme", value);
    document.documentElement.dataset.theme = value;
  };
  const togglePreference = (key: string) => {
    const enabled = !preferences[key];
    const next = { ...preferences, [key]: enabled };
    setPreferences(next);
    localStorage.setItem("reelcase.settings.v2", JSON.stringify(next));
    if (key === "privacy-reduce-motion")
      document.documentElement.toggleAttribute("data-reduce-motion", enabled);
    if (key === "privacy-hide-demo-media") useLibrary.getState().setHideDemo(enabled);
    if (key === "playback-start-muted") localStorage.setItem("reelcase.player-start-muted", String(enabled));
    if (key === "display-day-mode") setColorTheme(enabled ? "day" : "night");
    if (key === "display-compact-live-cards") { localStorage.setItem("reelcase.live-columns", enabled ? "6" : "4"); setLiveDensity(enabled ? 6 : 4); }
    if (key === "performance-use-cached-sources-first") { localStorage.setItem("reelcase.source-cache-first", String(enabled)); setSourceCacheFirst(enabled); }
    if (key === "performance-low-memory-grids") { localStorage.setItem("reelcase.grid-page-size", enabled ? "24" : "48"); setGridPageSize(enabled ? 24 : 48); }
    if (key === "performance-small-home-shelves") { localStorage.setItem("reelcase.home-rail-limit", enabled ? "8" : "16"); setRailLimit(enabled ? 8 : 16); }
    if (key === "alerts-desktop-notifications" && enabled) {
      if (!("Notification" in window)) { setServiceNote("This browser does not support desktop notifications."); return; }
      void Notification.requestPermission().then((permission) => {
        if (permission !== "granted") { setPreferences((current) => ({ ...current, [key]: false })); localStorage.setItem("reelcase.settings.v2", JSON.stringify({ ...next, [key]: false })); setServiceNote("Desktop notifications were not granted. In-app alerts remain available."); }
        else { useLibrary.getState().setNotifyPush(true); setServiceNote("Desktop notifications are enabled for the alerts you keep switched on."); }
      });
    }
  };
  const exportLocal = () => {
    const state = useLibrary.getState();
    const payload = {
      exportedAt: new Date().toISOString(),
      note: "Realhub library metadata only. Original local files and browser permission handles are never exported.",
      library: {
        folders: state.folders,
        videos: state.videos,
        favorites: Object.keys(state.favorites),
        likes: Object.keys(state.likes),
              photoSources: state.folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
                id: f.id, name: f.name, kind: f.kind as "directory" | "files",
                ...(f.photoCount != null ? { photoCount: f.photoCount } : {}),
                ...(f.lastCheckedAt != null ? { lastCheckedAt: f.lastCheckedAt } : {}),
              })),
              photoMeta: loadDurablePhotosSync()?.meta,
              photoLikes: loadDurablePhotosSync()?.likes,
        tags: state.tags,
        categories: state.categories,
        progress: state.progress,
        history: state.history,
        feedback: exportFeedback(),
        follows: state.follows,
        notices: state.notices,
        sourceCompanions: {
          photoNames: useSourceAssets.getState().photos.map((asset) => asset.path),
          shortcutNames: useSourceAssets.getState().shortcuts.map((file) => file.name),
        },
      },
      hub,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `reelcase-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const tagLocalVideoFrames = async () => {
    const candidates = videos.filter((video) => !video.remote && !metadataProvenance[video.id]?.lockedFields?.includes("tags") && !(tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).slice(0, 12);
    if (!candidates.length) { setVideoVisionNote("No eligible local video frames are ready. Open a few local cards first so their cached frame artwork can warm."); return; }
    setVideoVisionBusy(true);
    setVideoVisionNote(`Warming local video frames · 0/${candidates.length}`);
    for (const video of candidates) useThumbs.getState().request(video);
    await new Promise((resolve) => window.setTimeout(resolve, 1_200));
    const thumbs = useThumbs.getState().byId;
    const ready = candidates.filter((video) => Boolean(thumbs[video.id]));
    if (!ready.length) { setVideoVisionBusy(false); setVideoVisionNote("Frames are still warming. Try again in a moment; this beta never uploads local video."); return; }
    try {
      const labels = await classifyImagesLocally(ready.map((video) => thumbs[video.id]), (done, total) => setVideoVisionNote(`Classifying local video frames · ${done}/${total}`));
      const rows = ready.map((video, index) => ({
        videoId: video.id,
        name: video.name,
        labels: labels[index] ?? [],
        suggestions: (labels[index] ?? []).map((item) => `vision-${item.label}`),
      }));
      setVideoVisionRows(rows);
      setSelectedVideoVision(Object.fromEntries(rows.flatMap((row) => row.suggestions.map((tag) => [`${row.videoId}:${tag}`, true]))));
      const suggested = rows.filter((row) => row.suggestions.length > 0).length;
      setVideoVisionNote(`${suggested} local frame result${suggested === 1 ? "" : "s"} ready for review. Nothing is saved until you apply the selected labels.`);
    } catch { setVideoVisionNote("The local vision model could not start. File data stayed on this device; filename tags are still available."); }
    finally { setVideoVisionBusy(false); }
  };
  const applyVideoVision = () => {
    let changedFiles = 0;
    let addedTags = 0;
    for (const row of videoVisionRows) {
      const selectedTags = row.suggestions.filter((tag) => selectedVideoVision[`${row.videoId}:${tag}`]);
      if (!selectedTags.length) continue;
      const added = applyReviewedTags(row.videoId, selectedTags, "local-vision");
      if (added) { changedFiles += 1; addedTags += added; }
    }
    setSelectedVideoVision({});
    setVideoVisionNote(changedFiles
      ? `Saved ${addedTags} reviewed vision tag${addedTags === 1 ? "" : "s"} on ${changedFiles} video${changedFiles === 1 ? "" : "s"}. Manual tag locks and existing tags were preserved.`
      : "No new labels were saved. They may already exist, or the selected videos now have manual tag locks.");
  };
  const inspectWithCompanion = async () => {
    if (!companionInspectionCandidates.length) {
      setCompanionInspectionNote("No catalog entries have an approved full filesystem path yet. Browser-picked files keep opaque handles by design.");
      return;
    }
    setCompanionInspectionBusy(true);
    setCompanionInspectionNote(`Inspecting ${companionInspectionCandidates.length} local file${companionInspectionCandidates.length === 1 ? "" : "s"}…`);
    const result = await companionInspectMedia(companionInspectionCandidates.map((video) => video.path));
    const byPath = new Map(companionInspectionCandidates.map((video) => [video.path, video]));
    const rows = result.entries.flatMap((inspection) => {
      const video = byPath.get(inspection.requested);
      return video ? [{ videoId: video.id, name: video.name, inspection, suggestions: companionSuggestions(inspection) }] : [];
    });
    setCompanionInspectionRows(rows);
    setSelectedCompanionInspections(Object.fromEntries(rows.filter((row) => row.inspection.inspected && row.suggestions.length > 0).map((row) => [row.videoId, true])));
    const inspected = rows.filter((row) => row.inspection.inspected).length;
    const unavailable = rows.length - inspected;
    setCompanionInspectionNote(result.ok
      ? `${inspected} metadata result${inspected === 1 ? "" : "s"} ready for review${unavailable ? ` · ${unavailable} could not be inspected` : ""}. Nothing is saved until you apply selected suggestions.`
      : result.error ?? "Companion inspection could not start.");
    setCompanionInspectionBusy(false);
  };
  const applyCompanionInspection = () => {
    const selected = companionInspectionRows.filter((row) => selectedCompanionInspections[row.videoId]);
    let changedFiles = 0;
    let addedTags = 0;
    for (const row of selected) {
      const added = applyCompanionTags(row.videoId, row.suggestions);
      if (added) { changedFiles += 1; addedTags += added; }
    }
    setSelectedCompanionInspections({});
    setCompanionInspectionNote(changedFiles
      ? `Saved ${addedTags} reviewed Companion tag${addedTags === 1 ? "" : "s"} on ${changedFiles} file${changedFiles === 1 ? "" : "s"}. Manual tag locks and existing tags were preserved.`
      : "No new suggestions were saved. They may already exist, or the selected files have manual tag locks.");
  };
  const downloadExport = (body: string, filename: string, type: string) => {
    const url = URL.createObjectURL(new Blob([body], { type }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };
  const exportChannels = () => {
    const follows = useLibrary.getState().follows.map((channel) => ({
      service: channel.kind,
      channel: channel.title,
      handle: channel.handle,
      channelId: channel.channelId ?? "",
      live: Boolean(channel.live),
    }));
    downloadExport(JSON.stringify({ exportedAt: new Date().toISOString(), channels: follows }, null, 2), `reelcase-channels-${new Date().toISOString().slice(0, 10)}.json`, "application/json");
  };
  const exportCatalogCsv = () => {
    const state = useLibrary.getState();
    const quote = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
    const rows = [["title", "source", "format", "tags", "category", "favorite", "added"], ...state.videos.map((video) => [video.name, state.folders.find((folder) => folder.id === video.folderId)?.name ?? video.remote?.channelName ?? "", video.extension, (state.tags[video.id] ?? []).join(" | "), state.categories[video.id] ?? "", Boolean(state.favorites[video.id]), new Date(video.addedAt).toISOString()])];
    downloadExport(rows.map((row) => row.map(quote).join(",")).join("\n"), `reelcase-catalog-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
  };
  return (
    <HubShell
      eyebrow="Library control"
      icon={<Settings2 className="size-4" />}
      title="Settings & local export"
      copy="Your Realhub library stays in this browser. Export a portable metadata backup whenever you need it."
    >
      <PullSettingsPanel />
      <EnrichmentStatus />
      {!auditReady && <p className="mt-4 text-sm text-muted" role="status">Updating catalog diagnostics in the background… Pull and performance controls are ready.</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Video entries" value={useLibrary((s) => s.videos.length)} />
        <Stat label="Saved sources · all networks" value={useLibrary((s) => s.follows.length)} />
        <Stat label="Saved hub items" value={hub.prints.length + hub.games.length} />
      </div>
      <div hidden={!auditReady}>
      {unavailableVideoCount > 0 && <div className="mt-4 rounded-lg border border-danger/40 bg-elevated p-4"><p className="text-sm font-medium text-fg">Playback health queue · {unavailableVideoCount} hidden</p><p className="mt-1 text-xs leading-5 text-muted">These catalog entries were hidden after a browser file-permission or decode failure. Reconnect the source folder from the playback message to rebuild its live file handles.</p></div>}
      <details className="mt-4 rounded-lg border border-border bg-elevated p-4"><summary className="cursor-pointer text-sm font-medium text-fg">Hidden titles · {hiddenTitles.length}</summary><p className="mt-2 text-xs text-muted">Hidden videos and image cards stay out of recommendations, search, and Watch Room. Your ratings and history remain saved.</p><div className="mt-3 max-h-64 space-y-2 overflow-y-auto">{hiddenTitles.length ? hiddenTitles.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-md bg-bg/50 px-3 py-2"><span className="min-w-0 truncate text-sm text-fg">{item.name}</span><Button size="sm" variant="secondary" onClick={() => unhideVideo(item.id)}>Restore</Button></div>) : <p className="text-xs text-muted">Nothing hidden yet.</p>}</div></details>
      <section className="mt-4 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Smart local tags</p><h2 className="mt-2 font-display text-2xl text-fg">Tag by name, date, and file type.</h2><p className="mt-1 max-w-2xl text-sm text-muted">Adds private, explainable tags such as year-2026, month-september, type-mp4, and meaningful words from the filename. Existing manual tags are preserved; nothing is uploaded.</p><p className="mt-3 text-xs text-accent">{smartTagStatus.tagged.toLocaleString()} of {smartTagStatus.local.toLocaleString()} local files ready · {smartTagStatus.waiting ? `${smartTagStatus.waiting.toLocaleString()} can still be enriched` : "coverage is current"}</p><Button className="mt-4" size="sm" variant="secondary" disabled={!smartTagStatus.local || smartTagsBusy} onClick={runSmartTags}> {smartTagsBusy ? "Smart tags queued…" : smartTagStatus.waiting ? "Apply smart tags to remaining files" : "Recheck smart-tag coverage"}</Button></section>
      <section className="rounded-lg border border-border bg-surface p-5"><p className="text-xs font-medium tracking-widest text-accent uppercase">YouTube title & description tags</p><p className="mt-2 text-sm text-muted">Titles, content descriptions, hashtags and chapters add searchable tags and topic connections. Promotional lines are skipped. Existing videos upgrade in idle batches; manual tags and locks stay protected. Repair waits while a search or viewer is active; clear search to resume.</p><Button className="mt-4" size="sm" variant="secondary" onClick={() => { repairCachedMetadata(); setServiceNote("YouTube tag repair queued. Follow Cached provider tags below; pause or resume background work while you browse."); }}>Improve YouTube tags</Button></section>
      <section className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Metadata tail coverage</p><h2 className="mt-2 font-display text-2xl text-fg">Finish cached catalog metadata in small batches.</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Uses already-cached provider titles, descriptions, channels, and local filenames. One pass scans in idle slices and saves at most 48 unlocked, untagged titles; it does not make a network request, inspect a media file, or replace a manual tag choice.</p><div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{metadataTailCoverage.length ? metadataTailCoverage.map((row) => <div key={row.source} className="rounded-sm bg-bg/45 p-3 text-xs"><p className="font-medium text-fg">{metadataSourceLabel(row.source)}</p><p className="mt-1 text-muted">{row.tagged.toLocaleString()} tagged · {row.waiting.toLocaleString()} waiting · {row.locked ? `${row.locked.toLocaleString()} locked` : "no locked gaps"}</p></div>) : <p className="text-xs text-muted">Add a local folder or provider channel to measure coverage.</p>}</div><div className="mt-4 flex flex-wrap items-center gap-3"><Button size="sm" variant="secondary" disabled={!auditReady || !metadataTailWaiting || metadataTailBusy} onClick={runMetadataTail}>{metadataTailBusy ? "Batch queued…" : metadataTailWaiting ? `Enrich next ${Math.min(48, metadataTailWaiting)}` : "Coverage current"}</Button><span className="text-xs text-accent">{metadataTailWaiting.toLocaleString()} unlocked title{metadataTailWaiting === 1 ? "" : "s"} waiting</span></div>{metadataTailNote && <p className="mt-3 text-xs leading-5 text-accent" role="status">Latest batch · {metadataTailNote}</p>}</section>
      <section className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Creator coverage repair</p><h2 className="mt-2 font-display text-2xl text-fg">Recover only exact creator identities.</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Matches a missing YouTube or Twitch display name only when the cached card and one of your saved follows share the exact public channel ID or saved source ID. It never guesses from titles, filenames, or loose handles; no provider request is made.</p><div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-sm bg-bg/45 p-3 text-xs"><p className="font-medium text-fg">Tracked cards</p><p className="mt-1 text-muted">{creatorCoverage.total.toLocaleString()} YouTube/Twitch</p></div><div className="rounded-sm bg-bg/45 p-3 text-xs"><p className="font-medium text-fg">Already named</p><p className="mt-1 text-muted">{creatorCoverage.present.toLocaleString()} verified names</p></div><div className="rounded-sm bg-bg/45 p-3 text-xs"><p className="font-medium text-fg">Exact repairs</p><p className="mt-1 text-muted">{creatorCoverage.repairable.toLocaleString()} safe matches</p></div><div className="rounded-sm bg-bg/45 p-3 text-xs"><p className="font-medium text-fg">Needs evidence</p><p className="mt-1 text-muted">{creatorCoverage.unresolved.toLocaleString()} unmatched · {creatorCoverage.ambiguous.length.toLocaleString()} ambiguous</p></div></div><div className="mt-4 flex flex-wrap items-center gap-3"><Button size="sm" variant="secondary" disabled={!auditReady || !creatorCoverage.repairable} onClick={runCreatorCoverageRepair}>{creatorCoverage.repairable ? `Repair next ${Math.min(48, creatorCoverage.repairable)}` : "Coverage current"}</Button><span className="text-xs text-accent">{creatorCoverage.repairable.toLocaleString()} exact match{creatorCoverage.repairable === 1 ? "" : "es"} waiting</span></div>{creatorCoverageNote && <p className="mt-3 text-xs leading-5 text-accent" role="status">Latest repair · {creatorCoverageNote}</p>}{creatorCoverage.ambiguous.length > 0 && <div className="mt-4 rounded-md border border-warning/35 bg-bg/45 p-3"><p className="text-sm font-medium text-fg">Ambiguous exact-ID matches need review</p><p className="mt-1 text-xs leading-5 text-muted">These cards match more than one saved display name. Nothing was written; open a card to inspect its provider details before changing follow data.</p><div className="mt-3 grid gap-2">{creatorCoverage.ambiguous.slice(0, 12).map((row) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-sm bg-elevated p-3"><p className="min-w-0 flex-1 truncate text-xs text-fg">{row.name}<span className="text-muted"> · {row.candidates.join(" / ")}</span></p><Button size="sm" variant="ghost" onClick={() => openPreview(row.id)}>Review card</Button></div>)}</div>{creatorCoverage.ambiguous.length > 12 && <p className="mt-3 text-xs text-muted">Showing 12 of {creatorCoverage.ambiguous.length.toLocaleString()} ambiguous cards.</p>}</div>}</section>
      <section className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Optional Companion inspection</p><h2 className="mt-2 font-display text-2xl text-fg">Review embedded local media tags.</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">The local Companion reads technical details and a small embedded-tag set with ffprobe. It accepts only files inside its approved roots, processes at most 12 files, and never uploads media bytes or saves a suggestion automatically.</p><p className="mt-3 text-xs text-accent">{companionInspectionCandidates.length} eligible full-path file{companionInspectionCandidates.length === 1 ? "" : "s"} in the next bounded batch · browser-picked opaque file handles stay private and are skipped</p><Button className="mt-4" size="sm" variant="secondary" disabled={companionInspectionBusy || !companionInspectionCandidates.length} onClick={() => void inspectWithCompanion()}>{companionInspectionBusy ? "Inspecting local metadata…" : "Inspect up to 12 local files"}</Button>{companionInspectionNote && <p className="mt-3 text-xs leading-5 text-accent">Latest inspection · {companionInspectionNote}</p>}{companionInspectionRows.length > 0 && <div className="mt-4 rounded-md border border-border bg-bg/45 p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-fg">Review suggestions before saving</p><p className="mt-1 text-xs text-muted">Embedded titles and comments stay preview-only; only the checked, compact search tags below can be saved.</p></div><Button size="sm" disabled={!companionInspectionRows.some((row) => selectedCompanionInspections[row.videoId])} onClick={applyCompanionInspection}>Apply selected suggestions</Button></div><div className="mt-3 grid gap-2">{companionInspectionRows.map((row) => <label key={row.videoId} className="flex gap-3 rounded-md border border-border bg-elevated p-3"><input className="mt-1 size-4 accent-accent" type="checkbox" checked={Boolean(selectedCompanionInspections[row.videoId])} disabled={!row.inspection.inspected || !row.suggestions.length} onChange={(event) => setSelectedCompanionInspections((current) => ({ ...current, [row.videoId]: event.target.checked }))}/><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-fg">{row.name}</span>{row.inspection.inspected ? <><span className="mt-1 block text-xs text-muted">{row.inspection.tags?.title ? `Embedded title · ${row.inspection.tags.title}` : "No embedded title"} · {companionTechnicalSummary(row.inspection)}{row.inspection.tags?.comment ? " · embedded comment present" : ""}</span><span className="mt-2 block text-xs text-accent">{row.suggestions.length ? row.suggestions.map((tag) => `#${tag}`).join(" · ") : "No safe search-tag suggestion"}</span></> : <span className="mt-1 block text-xs text-danger">Not inspected · {row.inspection.reason ?? "No readable metadata"}</span>}</span></label>)}</div></div>}</section>
      <section className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Beta · local video vision</p><h2 className="mt-2 font-display text-2xl text-fg">Review local video labels from a cached frame.</h2><p className="mt-1 max-w-2xl text-sm text-muted">Uses the same on-device image model as Photos on one cached local thumbnail per video. It runs only when you start it, uses a bounded 12-video batch, and keeps frames and labels on this device until you explicitly apply the labels you want.</p><p className="mt-3 text-xs text-accent">{vision.processed.toLocaleString()} processed · {vision.waiting.toLocaleString()} waiting · ready when local frame artwork is cached</p><Button className="mt-4" size="sm" variant="secondary" disabled={videoVisionBusy || !auditReady || !vision.eligible} onClick={() => void tagLocalVideoFrames()}>{videoVisionBusy ? videoVisionNote || "Preparing local frames…" : "Prepare next 12 local video frames"}</Button>{videoVisionNote && <p className="mt-3 text-xs leading-5 text-accent">Latest output · {videoVisionNote}</p>}{videoVisionRows.length > 0 && <div className="mt-4 rounded-md border border-border bg-bg/45 p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-medium text-fg">Review vision labels before saving</p><p className="mt-1 text-xs text-muted">Each result is local-only. Check only the labels you want to add; unselected labels are discarded when this review changes.</p></div><Button size="sm" disabled={!videoVisionRows.some((row) => row.suggestions.some((tag) => selectedVideoVision[`${row.videoId}:${tag}`]))} onClick={applyVideoVision}>Apply selected labels</Button></div><div className="mt-3 grid gap-2">{videoVisionRows.map((row) => <div key={row.videoId} className="rounded-md border border-border bg-elevated p-3"><p className="truncate text-sm font-medium text-fg">{row.name}</p>{row.labels.length ? <div className="mt-2 flex flex-wrap gap-2">{row.labels.map((item) => <label key={`${row.videoId}:${item.label}`} className="flex items-center gap-2 rounded-sm bg-bg/55 px-2 py-1 text-xs text-fg"><input className="size-3.5 accent-accent" type="checkbox" checked={Boolean(selectedVideoVision[`${row.videoId}:vision-${item.label}`])} onChange={(event) => setSelectedVideoVision((current) => ({ ...current, [`${row.videoId}:vision-${item.label}`]: event.target.checked }))}/><span>#{`vision-${item.label}`} · {Math.round(item.score * 100)}%</span></label>)}</div> : <p className="mt-2 text-xs text-muted">No confident local label suggested.</p>}</div>)}</div></div>}</section>
      </div>
      <div className="mt-6 flex flex-col gap-4 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-fg">Export local metadata</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Downloads your catalog, favorites, likes, tags, watch history, follows, notifications,
            print list, and game list. Your original media and any browser file permissions remain
            private on this device.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={exportLocal}><Download className="size-4" /> Full backup</Button>
          <Button variant="secondary" onClick={exportCatalogCsv}>Catalog CSV</Button>
          <Button variant="secondary" onClick={exportChannels}>YouTube + Twitch</Button>
        </div>
      </div>
      <section className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Library pack · local folder</p>
        <h2 className="mt-2 font-display text-2xl text-fg">Export / import follows, history, links & marks</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Downloads a zip that matches <code className="text-fg">public/import-templates/</code>: follows, watch history,
          creator collections, saved video URLs, continue-watching pointers, favorites/likes, Photos sources &amp; likes, Adult marks, ratings &amp; tag hearts, and stats.
          Import merges into durable IndexedDB stores and does not wipe unrelated data unless you confirm replace-follows.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={() => {
            const state = useLibrary.getState();
            downloadLibraryPackZip({
              follows: state.follows,
              history: state.history,
              links: linksFromHistoryAndResume(state.history, state.resumeProgress),
              favorites: Object.keys(state.favorites),
              likes: Object.keys(state.likes),
              viewCounts: state.viewCounts,
              cameCounts: state.cameCounts,
              progress: state.progress,
              resumeProgress: state.resumeProgress,
              adultVideos: state.videos,
              folders: state.folders,
              tags: state.tags,
              photoSources: state.folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
                id: f.id, name: f.name, kind: f.kind as "directory" | "files",
                ...(f.photoCount != null ? { photoCount: f.photoCount } : {}),
                ...(f.lastCheckedAt != null ? { lastCheckedAt: f.lastCheckedAt } : {}),
              })),
              photoMeta: loadDurablePhotosSync()?.meta,
              photoLikes: loadDurablePhotosSync()?.likes,
            });
            setServiceNote("Library pack zip downloaded. Unzip to edit offline, or keep as backup.");
          }}><Download className="size-4" /> Export library pack</Button>
          <Button variant="secondary" onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = ".zip,.json,.csv,application/zip,application/json,text/csv";
            input.onchange = () => {
              const file = input.files?.[0];
              if (!file) return;
              const proceed = window.confirm("Import this library pack into Realhub?\n\nData merges into durable local stores. Unrelated data is kept.");
              if (!proceed) { setServiceNote("Import cancelled."); return; }
              const wipeFollows = window.confirm("Also REPLACE all YouTube/Twitch follows with the file?\n\nOK = replace follows\nCancel = merge follows (recommended)");
              const mode: LibraryPackMode = wipeFollows ? "replace-follows" : "merge";
              void importLibraryPackZip(file, {
                getFollows: () => useLibrary.getState().follows,
                setFollows: (follows) => useLibrary.setState({ follows }),
                getHistory: () => useLibrary.getState().history,
                setHistory: (history) => useLibrary.setState({ history }),
                getViewCounts: () => useLibrary.getState().viewCounts,
                getCameCounts: () => useLibrary.getState().cameCounts,
                setMarks: (viewCounts, cameCounts) => useLibrary.setState({ viewCounts, cameCounts }),
                getFavorites: () => Object.keys(useLibrary.getState().favorites),
                getLikes: () => Object.keys(useLibrary.getState().likes),
                setShelves: (favorites, likes) => useLibrary.setState({
                  favorites: Object.fromEntries(favorites.map((id) => [id, true as const])),
                  likes: Object.fromEntries(likes.map((id) => [id, true as const])),
                }),
                getPhotoSources: () => useLibrary.getState().folders
                  .filter((f) => f.kind === "directory" || f.kind === "files")
                  .map((f) => ({ id: f.id, name: f.name, kind: f.kind as "directory" | "files", photoCount: f.photoCount, lastCheckedAt: f.lastCheckedAt })),
                setPhotoSources: (sources) => useLibrary.setState((s) => {
                  let folders = s.folders;
                  for (const source of sources) {
                    if (folders.some((f) => f.id === source.id)) {
                      folders = folders.map((f) => f.id === source.id ? { ...f, name: source.name, kind: source.kind, photoCount: source.photoCount ?? f.photoCount, lastCheckedAt: source.lastCheckedAt ?? f.lastCheckedAt } : f);
                    } else {
                      folders = [...folders, { id: source.id, name: source.name, kind: source.kind, videoCount: 0, photoCount: source.photoCount ?? 0, lastCheckedAt: source.lastCheckedAt, needsPermission: true, health: "permission-needed" as const }];
                    }
                  }
                  return { folders };
                }),
                getProgress: () => useLibrary.getState().progress,
                getResumeProgress: () => useLibrary.getState().resumeProgress,
                setResume: (progress, resumeProgress) => useLibrary.setState({ progress, resumeProgress }),
                getLinks: () => linksFromHistoryAndResume(useLibrary.getState().history, useLibrary.getState().resumeProgress),
                setLinks: () => { /* links persist via saveDurableLinks inside apply */ },
              }, mode).then((result) => {
                setServiceNote(`Pack import · +${result.followsAdded} follows · +${result.collectionsMerged} creator collections · +${result.historyMerged} history · +${result.linksMerged} links${result.photosMerged ? ` · photos ${result.photosMerged}` : ""}${result.feedbackMerged ? " · ratings/hearts merged" : ""}${result.warnings.length ? ` · ${result.warnings[0]}` : ""}`);
              }).catch((error) => {
                setServiceNote(error instanceof Error ? error.message : "Library pack import failed.");
              });
            };
            input.click();
          }}><Upload className="size-4" /> Import library pack</Button>
          <Button variant="secondary" onClick={() => {
            const state = useLibrary.getState();
            const files = buildLibraryPackFiles({
              follows: state.follows,
              history: state.history,
              links: linksFromHistoryAndResume(state.history, state.resumeProgress),
              favorites: Object.keys(state.favorites),
              likes: Object.keys(state.likes),
              viewCounts: state.viewCounts,
              cameCounts: state.cameCounts,
              progress: state.progress,
              resumeProgress: state.resumeProgress,
              adultVideos: state.videos,
              folders: state.folders,
              tags: state.tags,
              photoSources: state.folders.filter((f) => f.kind === "directory" || f.kind === "files").map((f) => ({
                id: f.id, name: f.name, kind: f.kind as "directory" | "files",
                ...(f.photoCount != null ? { photoCount: f.photoCount } : {}),
                ...(f.lastCheckedAt != null ? { lastCheckedAt: f.lastCheckedAt } : {}),
              })),
              photoMeta: loadDurablePhotosSync()?.meta,
              photoLikes: loadDurablePhotosSync()?.likes,
            });
            void companionExportLibraryPack(files).then((result) => {
              setServiceNote(result.ok
                ? `Wrote library pack to companion folder · ${result.written?.length ?? 0} files${result.root ? ` · ${result.root}` : ""}`
                : (result.error || "Companion pack export failed."));
            });
          }}>Save pack to companion folder</Button>
          <Button variant="secondary" onClick={() => {
            void companionImportLibraryPack().then((pack) => {
              if (!pack.ok || !pack.files || !Object.keys(pack.files).length) {
                setServiceNote(pack.error || "No library pack files in the companion folder.");
                return;
              }
              const proceed = window.confirm("Import the companion-folder library pack into Realhub?\n\nData merges into durable local stores.");
              if (!proceed) { setServiceNote("Companion import cancelled."); return; }
              const wipeFollows = window.confirm("Also REPLACE all YouTube/Twitch follows with the folder pack?\n\nOK = replace follows\nCancel = merge follows (recommended)");
              const mode: LibraryPackMode = wipeFollows ? "replace-follows" : "merge";
              try {
                const result = applyLibraryPackFiles(pack.files, {
                  getFollows: () => useLibrary.getState().follows,
                  setFollows: (follows) => useLibrary.setState({ follows }),
                  getHistory: () => useLibrary.getState().history,
                  setHistory: (history) => useLibrary.setState({ history }),
                  getViewCounts: () => useLibrary.getState().viewCounts,
                  getCameCounts: () => useLibrary.getState().cameCounts,
                  setMarks: (viewCounts, cameCounts) => useLibrary.setState({ viewCounts, cameCounts }),
                  getFavorites: () => Object.keys(useLibrary.getState().favorites),
                  getLikes: () => Object.keys(useLibrary.getState().likes),
                  setShelves: (favorites, likes) => useLibrary.setState({
                    favorites: Object.fromEntries(favorites.map((id) => [id, true as const])),
                    likes: Object.fromEntries(likes.map((id) => [id, true as const])),
                  }),
                  getPhotoSources: () => useLibrary.getState().folders
                    .filter((f) => f.kind === "directory" || f.kind === "files")
                    .map((f) => ({ id: f.id, name: f.name, kind: f.kind as "directory" | "files", photoCount: f.photoCount, lastCheckedAt: f.lastCheckedAt })),
                  setPhotoSources: (sources) => useLibrary.setState((s) => {
                    let folders = s.folders;
                    for (const source of sources) {
                      if (folders.some((f) => f.id === source.id)) {
                        folders = folders.map((f) => f.id === source.id ? { ...f, name: source.name, kind: source.kind, photoCount: source.photoCount ?? f.photoCount, lastCheckedAt: source.lastCheckedAt ?? f.lastCheckedAt } : f);
                      } else {
                        folders = [...folders, { id: source.id, name: source.name, kind: source.kind, videoCount: 0, photoCount: source.photoCount ?? 0, lastCheckedAt: source.lastCheckedAt, needsPermission: true, health: "permission-needed" as const }];
                      }
                    }
                    return { folders };
                  }),
                  getProgress: () => useLibrary.getState().progress,
                  getResumeProgress: () => useLibrary.getState().resumeProgress,
                  setResume: (progress, resumeProgress) => useLibrary.setState({ progress, resumeProgress }),
                  getLinks: () => linksFromHistoryAndResume(useLibrary.getState().history, useLibrary.getState().resumeProgress),
                  setLinks: () => { /* links persist via saveDurableLinks inside apply */ },
                }, mode);
                setServiceNote(`Companion pack import · +${result.followsAdded} follows · +${result.historyMerged} history · +${result.linksMerged} links${result.photosMerged ? ` · photos ${result.photosMerged}` : ""}`);
              } catch (error) {
                setServiceNote(error instanceof Error ? error.message : "Companion pack import failed.");
              }
            });
          }}>Load pack from companion folder</Button>
          <a className="inline-flex h-8 items-center rounded-md bg-bg/45 px-3 text-xs text-muted shadow-border hover:text-fg" href="/import-templates/README.md" target="_blank" rel="noreferrer">Open templates</a>
        </div>
        {serviceNote && <p className="mt-3 text-xs text-accent">{serviceNote}</p>}
      </section>
      <section className="mt-6 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Connected services</p><h2 className="mt-2 font-display text-2xl text-fg">Independent caches, on your schedule.</h2><p className="mt-1 text-sm text-muted">Twitch and YouTube refresh together from your saved follows. Photo imports, Roku discovery, and Spotify remain independently local and refresh only when you ask.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[{ name: "YouTube", detail: "Saved channels", checked: remoteCheckedAt, action: async () => { const result = await refreshFollows("youtube", { catalog: true }); const status = useLibrary.getState().remoteRefreshStatus; setServiceNote(status?.failed === status?.checked ? "YouTube refresh failed. Check channel health." : `Refreshed YouTube catalog · ${result.newVideos.length} videos added from ${status?.refreshed ?? 0} channels.`); } }, { name: "Twitch", detail: "Live + VOD cache", checked: remoteCheckedAt, action: async () => { const result = await refreshFollows("twitch"); setServiceNote(`Refreshed Twitch catalog · ${result.newVideos.length} new videos from ${result.pull?.done ?? 0} channels.`); } }, { name: "Photos", detail: `${folders.filter((folder) => folder.photoCount).length} source folders`, checked: Math.max(0, ...folders.map((folder) => folder.lastCheckedAt ?? 0)), action: async () => { const sources = folders.filter((folder) => folder.photoCount && (folder.kind === "directory" || folder.kind === "files")); const counts = await Promise.all(sources.map((folder) => refreshSourcePhotos(folder.id))); setServiceNote(`Refreshed local photo sources · ${counts.reduce((sum, count) => sum + count, 0)} photos found.`); } }, { name: "Roku", detail: "Companion-assisted", checked: 0, action: async () => { try { const res = await fetch("http://127.0.0.1:43123/roku/discover"); const data = await res.json() as { devices?: unknown[] }; setServiceNote(`Roku refresh complete · ${(data.devices ?? []).length} device(s) found.`); } catch { setServiceNote("Roku refresh needs the local Realhub Companion running."); } } }, { name: "Spotify", detail: "Saved music shortcuts", checked: 0, action: async () => { setServiceNote("Spotify shortcuts are local and ready. Open Spotify from its library section to refresh provider content."); } }].map((service) => <div key={service.name} className="rounded-md bg-bg/45 p-3 shadow-border"><p className="text-sm font-medium text-fg">{service.name}</p><p className="mt-1 text-xs text-muted">{service.detail}</p><p className="mt-1 text-[11px] text-subtle">{service.checked ? `Last refreshed ${new Date(service.checked).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Not refreshed this session"}</p><Button size="sm" variant="secondary" className="mt-3" onClick={() => void service.action()}>Refresh</Button></div>)}</div>{serviceNote && <p className="mt-3 text-xs text-accent">{serviceNote}</p>}</section>
      <section className="mt-6"><div className="mb-3"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Device & performance</p><p className="mt-1 text-sm text-muted">The controls that change how Realhub runs and fits your screen.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={`rounded-lg bg-elevated p-5 shadow-border ${debugEnabled ? 'sm:col-span-2 xl:col-span-4' : ''}`}>
          <span className="text-accent"><Settings2 className="size-5" /></span>
          <h2 className="mt-3 font-display text-2xl text-fg">Diagnostics</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Keep a local, opt-in status panel for source, cache, and companion troubleshooting. It is off by default and sends nothing away.</p>
          <ol className="mt-3 space-y-1 text-xs leading-5 text-muted"><li><span className="text-accent">1.</span> In the main Realhub folder, double-click <strong className="text-fg">Start-Realhub-Companion.cmd</strong>.</li><li><span className="text-accent">2.</span> Leave the small Companion window open until it says it is listening.</li><li><span className="text-accent">3.</span> Enable diagnostics, select Check companion, then open Games to load approved shortcuts.</li></ol>
          <p className="mt-2 text-xs leading-5 text-subtle">The companion is optional. It only runs on this computer and is needed for desktop shortcut launching, source checks, and TV discovery—not for browsing your media library.</p>
          <Button size="sm" variant={debugEnabled ? "default" : "secondary"} className="mt-4" onClick={() => { const next = !debugEnabled; setDebugEnabled(next); localStorage.setItem("reelcase.debug-panel", String(next)); window.dispatchEvent(new Event("reelcase:diagnostics-settings")); if (!next) setDebugReport(""); }}>
            {debugEnabled ? "Disable diagnostics" : "Enable diagnostics"}
          </Button>
          {debugEnabled && <><PerformanceScorecard /><div className="mt-3 text-xs"><Button size="sm" variant="ghost" className="mt-2" onClick={() => void (async () => { try { const data = await companionHealth(true); if (!data?.ok) throw new Error("offline"); setDebugReport(`Companion v${data.version ?? "?"} · ${data.roots ?? 0} approved roots · Desktop ${data.desktopEnabled ? "ready" : "not available"}`); } catch { setDebugReport("Companion is not running or is unavailable to this browser."); } })()}>Check companion</Button>{debugReport && <p className="mt-2 text-accent">{debugReport}</p>}</div></>}
          {debugEnabled && <YoutubeFirstClickDiagnostic />}
        </div>
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <span className="text-accent">
            <Settings2 className="size-5" />
          </span>
          <h2 className="mt-3 font-display text-2xl text-fg">App zoom</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Scale the entire library interface for this browser. Your choice is remembered
            everywhere in Realhub.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[80, 90, 100, 110, 125].map((value) => (
              <Button
                key={value}
                size="sm"
                variant={zoom === value ? "default" : "secondary"}
                onClick={() => setGlobalZoom(value)}
              >
                {value}%
              </Button>
            ))}
          </div>
        </div>
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <span className="text-accent"><Settings2 className="size-5" /></span>
          <h2 className="mt-3 font-display text-2xl text-fg">Day & night</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Choose the palette that is easiest on your eyes. It applies to every Realhub page and stays on this device.</p>
          <div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant={theme === "night" ? "default" : "secondary"} onClick={() => setColorTheme("night")}>Night mode</Button><Button size="sm" variant={theme === "day" ? "default" : "secondary"} onClick={() => setColorTheme("day")}>Day mode</Button></div>
        </div>
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <span className="text-accent"><Radio className="size-5" /></span>
          <h2 className="mt-3 font-display text-2xl text-fg">Live layout</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Choose a larger card layout or fit more live channels on screen. This changes the Live page without adding heavier media loads.</p>
          <div className="mt-4 flex flex-wrap gap-2">{[3, 4, 6].map((value) => <Button key={value} size="sm" variant={liveDensity === value ? "default" : "secondary"} onClick={() => { setLiveDensity(value); localStorage.setItem("reelcase.live-columns", String(value)); }}>{value === 3 ? "Large · 3 columns" : `${value} columns`}</Button>)}</div>
        </div>
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <span className="text-accent">
            <PackageSearch className="size-5" />
          </span>
          <h2 className="mt-3 font-display text-2xl text-fg">Home performance</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Choose how many cards each Home rail mounts. Lower counts keep huge folders smooth; the
            complete catalog remains searchable.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {[8, 16, 32, 48].map((value) => (
              <Button
                key={value}
                size="sm"
                variant={railLimit === value ? "default" : "secondary"}
                onClick={() => {
                  setRailLimit(value);
                  localStorage.setItem("reelcase.home-rail-limit", String(value));
                  window.dispatchEvent(new Event("reelcase:render-settings"));
                }}
              >
                {value} per shelf
              </Button>
            ))}
          </div>
          <Button
            size="sm"
            variant={sourceCacheFirst ? "default" : "secondary"}
            className="mt-3"
            onClick={() => {
              const next = !sourceCacheFirst;
              setSourceCacheFirst(next);
              localStorage.setItem("reelcase.source-cache-first", String(next));
            }}
          >
            {sourceCacheFirst ? "Use cached sources first" : "Rescan sources on launch"}
          </Button>
          <p className="mt-3 text-xs text-subtle">
            Cached source catalogs load immediately. Use a source refresh when you want to check the
            disk again.
          </p>
        </div>
        <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><PackageSearch className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Adult performance</h2><p className="mt-2 text-sm leading-6 text-muted">Tune Adult rails and one catalog request separately. Smaller choices reduce decoding and keep filtering responsive.</p><p className="mt-4 text-xs text-muted">Cards per Adult rail</p><div className="mt-2 flex flex-wrap gap-2">{[16, 24, 48, 72].map((value) => <Button key={value} size="sm" variant={adultRailLimit === value ? "default" : "secondary"} onClick={() => { setAdultRailLimit(value); localStorage.setItem("reelcase.adult-rail-limit", String(value)); window.dispatchEvent(new Event("reelcase:adult-render-settings")); }}>{value} cards</Button>)}</div><p className="mt-4 text-xs text-muted">Batch limits and automatic pacing are in Pull management above.</p></div>
        <div className="rounded-lg bg-elevated p-5 shadow-border sm:col-span-2" data-performance-profile>
          <span className="text-accent"><PackageSearch className="size-5" /></span>
          <h2 className="mt-3 font-display text-2xl text-fg">Performance profile</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Low memory keeps less artwork in RAM and starts less background work. Adaptive applies these limits automatically on smaller devices or with Save Data enabled.</p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Performance profile">
            {([['adaptive', 'Adaptive'], ['low-memory', 'Low memory']] as const).map(([mode, label]) => <Button key={mode} size="sm" aria-pressed={performanceMode === mode} variant={performanceMode === mode ? 'default' : 'secondary'} onClick={() => { setPerformanceModeChoice(mode); setPerformanceMode(mode); }}>{label}</Button>)}
          </div>
          <p className="mt-4 text-sm text-fg" role="status" aria-label="Effective performance limits">{performanceBudget.lowMemory ? 'Low memory active' : 'Standard budgets active'}{performanceBudget.reason === 'device' ? ' · device capability or Save Data' : ''} · {performanceBudget.artworkBytes / 1048576} MiB artwork cache · up to {performanceBudget.thumbnailWorkers} thumbnail {performanceBudget.thumbnailWorkers === 1 ? 'worker' : 'workers'} · {performanceBudget.imageRequests} image requests · {performanceBudget.gridMountCap} mounted cards per grid</p>
          <p className="mt-2 text-xs leading-5 text-muted">{performanceBudget.lowMemory ? 'Grids load 24 titles at a time, rails keep visible cards, and new photo scans use up to 2 workers. These ceilings apply over the individual settings below. ' : ''}Artwork evicted from RAM can reopen from disk. Your video catalog and saved worker choices stay intact. Running requests finish within their previous budget.</p>
        </div>
        <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><PackageSearch className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Grid memory budget</h2><p className="mt-2 text-sm leading-6 text-muted">Sets the poster grid page size. Only a window of those cards stays mounted. Low memory caps pages at 24; your selection returns when standard budgets are active.</p><div className="mt-4 flex flex-wrap gap-2">{[24, 48, 96, 144].map((value) => <Button key={value} size="sm" variant={gridPageSize === value ? "default" : "secondary"} onClick={() => { setGridPageSize(value); localStorage.setItem("reelcase.grid-page-size", String(value)); window.dispatchEvent(new Event("reelcase:render-settings")); }}>{value} cards</Button>)}</div></div>
        <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><PackageSearch className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Artwork worker budget</h2><p className="mt-2 text-sm leading-6 text-muted">Controls concurrent local thumbnail extraction. Adaptive uses device cores, available memory, and foreground input pressure.</p><div className="mt-4 flex flex-wrap gap-2">{[[0, "Adaptive"], [1, "Text-first · 1"], [2, "Gentle · 2"], [3, "Balanced · 3"], [4, "Fast · 4"]].map(([value, label]) => <Button key={value} size="sm" variant={thumbnailWorkers === value ? "default" : "secondary"} onClick={() => { setThumbnailWorkers(value as number); localStorage.setItem("reelcase.thumbnail-workers", String(value)); }}>{label}</Button>)}</div><Button size="sm" variant={textFirstArtwork ? "default" : "secondary"} className="mt-4" onClick={() => setTextFirstArtwork(!textFirstArtwork)}> {textFirstArtwork ? "Text-first provider rows on" : "Use text-first provider rows"}</Button></div>
        <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><PackageSearch className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Photo scan workers</h2><p className="mt-2 text-sm leading-6 text-muted">Sets background folder workers for cached photo metadata. Adaptive protects browsing; use Fast when you want a newly added photo source ready sooner.</p><div className="mt-4 flex flex-wrap gap-2">{[[0, "Adaptive"], [2, "Gentle · 2"], [4, "Balanced · 4"], [6, "Fast · 6"], [8, "Max · 8"], [12, "Turbo · 12"]].map(([value, label]) => <Button key={value} size="sm" variant={photoWorkers === value ? "default" : "secondary"} onClick={() => { setPhotoWorkers(value as number); localStorage.setItem("reelcase.photo-scan-workers", String(value)); }}>{label}</Button>)}</div></div>
        <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><Settings2 className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Player sound</h2><p className="mt-2 text-sm leading-6 text-muted">Sets the starting volume for local video and whether a newly opened player starts muted. Provider embeds keep their own service-level audio controls.</p><div className="mt-4 flex flex-wrap gap-2">{[25, 50, 70, 85, 100].map((value) => <Button key={value} size="sm" variant={defaultVolume === value ? "default" : "secondary"} onClick={() => { setDefaultVolume(value); localStorage.setItem("reelcase.player-volume", String(value)); }}>{value}%</Button>)}</div><Button className="mt-3" size="sm" variant={startMuted ? "default" : "secondary"} onClick={() => { const next = !startMuted; setStartMuted(next); localStorage.setItem("reelcase.player-start-muted", String(next)); }}>{startMuted ? "Start muted" : "Start with sound"}</Button></div>
        <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><Radio className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Twitch live & archive refresh</h2><p className="mt-2 text-sm leading-6 text-muted">Checks 12 rotating channels while this tab is visible, adding up to 100 recent VODs and 24 clips sampled across recent and older time ranges. Focused pulls continue through deeper VOD and clip history with saved cursors. Earlier items stay saved if a provider response is partial. Thirty seconds is the default.</p><div className="mt-4 flex flex-wrap gap-2">{[[15, "15 sec"], [30, "30 sec"], [60, "1 min"], [120, "2 min"], [300, "5 min"]].map(([value, label]) => <Button key={value} size="sm" variant={twitchRefreshSeconds === value ? "default" : "secondary"} onClick={() => { setTwitchRefreshSeconds(value as number); localStorage.setItem("reelcase.twitch-refresh-seconds", String(value)); window.dispatchEvent(new Event("reelcase:refresh-settings")); }}>{label}</Button>)}</div></div>
      </div></section>
      <div className="mt-6"><ArtworkAuditPanel /></div>
      <section className="mt-6"><div className="mb-3"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Connections, privacy & guides</p><p className="mt-1 text-sm text-muted">Optional services and explanations stay separate from everyday library preferences.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          icon={<Clapperboard className="size-5" />}
          title="Local edit workspace"
          copy="The player has reliable native playback and metadata tools today. A non-destructive OpenShot-style timeline requires a dedicated browser media engine; keep it local-first and never upload media by default."
        />
        <InfoCard
          icon={<Bot className="size-5" />}
          title="AI recommendations, later"
          copy="Your tags, likes, categories, history, and export file are the future recommendation signal. Add a server endpoint and explicit consent screen before any assistant can read it."
        />
        <InfoCard
          icon={<Bot className="size-5" />}
          title="AI tools directory"
          copy="Prepare future connectors for recommendations, metadata cleanup, captioning, and watch-list suggestions. Keep every connection opt-in and scoped to only the library data you select."
        />
        <InfoCard
          icon={<Settings2 className="size-5" />}
          title="Privacy defaults"
          copy="Local cataloging, tags, ratings, and history stay on this device. Export is metadata-only; no source videos, print files, game files, or browser permissions are included."
        />
        <InfoCard
          icon={<PackageSearch className="size-5" />}
          title="How Realhub works"
          copy="Folders and files are cataloged locally; channel follows use their public pages; Watch Room sends direct peer events; and external services open only when you choose them. See PROJECT_GUIDE.md and LAN_WATCH_ROOM.md in the repository for the complete maintainer guide."
        />
        <AlexaLightControl />
        <GoogleYouTubeConnection />
      </div></section>
      <div className="mt-6 rounded-lg bg-elevated p-5 shadow-border">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-2xl text-fg">Working preferences</h2>
            <p className="mt-1 text-sm text-muted">
              Every switch below works now, changes Realhub immediately, and is saved in this browser. Future ideas belong in the Mission plan—not in this control panel.
            </p>
          </div>
          <p className="text-xs text-muted">
            {Object.values(preferences).filter(Boolean).length} enabled
          </p>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(PREFERENCE_GROUPS) as Array<keyof typeof PREFERENCE_GROUPS>).map(
            (group) => (
              <Button
                key={group}
                size="sm"
                variant={preferenceGroup === group ? "default" : "secondary"}
                onClick={() => setPreferenceGroup(group)}
              >
                {group} · {PREFERENCE_GROUPS[group].length}
              </Button>
            ),
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {PREFERENCES.filter((item) => item.group === preferenceGroup).map((item) => (
            <button
              key={item.key}
              type="button"
              disabled={!item.implemented}
              onClick={() => togglePreference(item.key)}
              className="flex min-h-16 items-center justify-between gap-4 rounded-md bg-bg/45 px-4 text-left shadow-border disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>
                <span className="block text-sm font-medium text-fg">{item.label}</span>
                <span className="mt-0.5 block text-xs text-muted">{item.detail}</span>
              </span>
              <span
                className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-[background-color] duration-150 ${item.implemented && preferences[item.key] ? "bg-accent justify-end" : "bg-surface justify-start"}`}
              >
                <span
                  className={`size-5 rounded-full ${item.implemented && preferences[item.key] ? "bg-accent-fg" : "bg-muted"}`}
                />
              </span>
            </button>
          ))}
        </div>
      </div>
    </HubShell>
  );
}

export function PrintsSection() {
  return (
    <LocalCatalog
      kind="prints"
      eyebrow="Maker shelf"
      icon={<Box className="size-4" />}
      title="3D prints"
      copy="Keep a lightweight catalog of print-ready files. Preview STL, OBJ, GLB/GLTF, and 3MF in an interactive orbit viewer with transform editor, lighting presets, wireframe, grid, and fullscreen; G-code stays list-only for slicers."
      accept=".stl,.obj,.3mf,.gcode,.glb,.gltf"
      footer={
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <ServiceLink
            name="Printables"
            href="https://www.printables.com/"
            copy="Browse community-shared printable models."
          />
          <ServiceLink
            name="OpenSCAD"
            href="https://openscad.org/"
            copy="Build and customize open parametric models."
          />
        </div>
      }
    />
  );
}

export function SpotifySection() {
  const [saved, setSaved] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("reelcase.spotify.playlist") ?? "";
    } catch {
      return "";
    }
  });
  const [playlistUrl, setPlaylistUrl] = useState(saved);
  const [imports, setImports] = useState<string[]>(() => { try { const savedImports = JSON.parse(localStorage.getItem("reelcase.spotify.imports.v1") ?? "[]"); return Array.isArray(savedImports) ? savedImports.filter((item): item is string => typeof item === "string") : []; } catch { return []; } });
  const importSpotifyLink = () => {
    const value = playlistUrl.trim();
    if (!/^https:\/\/open\.spotify\.com\/(playlist|album|artist)\//i.test(value)) return;
    const next = [value, ...imports.filter((item) => item !== value)].slice(0, 50);
    setImports(next);
    setSaved(value);
    localStorage.setItem("reelcase.spotify.imports.v1", JSON.stringify(next));
    localStorage.setItem("reelcase.spotify.playlist", value);
  };
  return (
    <HubShell
      eyebrow="Music companion"
      icon={<Music2 className="size-4" />}
      title="Spotify, beside your library."
      copy="Keep music separate from video playback. Connect through Spotify’s official player or save a playlist link locally for your next listening session."
    >
      <div className="mt-6 rounded-lg bg-elevated p-5 shadow-border">
        <p className="text-sm font-medium text-fg">Open Spotify</p>
        <p className="mt-1 text-sm text-muted">
          Account sign-in and playback remain on Spotify’s official site or app. Realhub does not
          collect your Spotify password or tokens.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href="https://open.spotify.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg"
          >
            Open Spotify <ExternalLink className="ml-2 size-4" />
          </a>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-elevated p-5 shadow-border">
        <p className="text-sm font-medium text-fg">Save a playlist shortcut</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            value={playlistUrl}
            onChange={(event) => setPlaylistUrl(event.target.value)}
            placeholder="https://open.spotify.com/playlist/..."
            aria-label="Spotify playlist link"
          />
          <Button
            disabled={!playlistUrl.includes("spotify.com")}
            onClick={importSpotifyLink}
          >
            Import link
          </Button>
        </div>
        {saved && (
          <a
            className="mt-3 inline-flex text-sm text-accent hover:text-fg"
            href={saved}
            target="_blank"
            rel="noreferrer"
          >
            Open saved playlist <ExternalLink className="ml-1 size-4" />
          </a>
        )}
      </div>
      {imports.length > 0 && <div className="mt-4 rounded-lg bg-elevated p-5 shadow-border"><p className="text-sm font-medium text-fg">Imported Spotify shortcuts</p><p className="mt-1 text-xs text-muted">Playlist, album, and artist links are stored locally for quick return. Spotify account data remains in Spotify.</p><div className="mt-3 flex flex-wrap gap-2">{imports.slice(0, 12).map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="max-w-full truncate rounded-sm bg-bg/45 px-3 py-2 text-xs text-fg shadow-border">{url.replace("https://open.spotify.com/", "Spotify · ")}</a>)}</div></div>}
    </HubShell>
  );
}

function AlexaLightControl() {
  const [scene, setScene] = useState("Movie night");
  const [saved, setSaved] = useState(false);
  return (
    <div className="rounded-lg bg-elevated p-5 shadow-border">
      <span className="text-accent">
        <Lightbulb className="size-5" />
      </span>
      <h2 className="mt-3 font-display text-2xl text-fg">Alexa light scenes</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Set a preferred scene locally, then ask Alexa to run that scene. Direct device control needs
        an authorized Alexa Smart Home skill, which is not connected here.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {["Movie night", "Bright", "Warm", "Pause lights"].map((item) => (
          <Button
            key={item}
            size="sm"
            variant={scene === item ? "default" : "secondary"}
            onClick={() => setScene(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <Button
        size="sm"
        className="mt-3"
        onClick={() => {
          localStorage.setItem("reelcase.alexa.scene", scene);
          setSaved(true);
        }}
      >
        Save preferred scene
      </Button>
      {saved && (
        <p className="mt-2 text-xs text-accent">
          Saved. Say “Alexa, {scene}.” after creating that scene in the Alexa app.
        </p>
      )}
    </div>
  );
}

function GoogleYouTubeConnection() {
  const [clientId, setClientId] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState("Not connected");
  const videos = useLibrary((s) => s.videos);
  const setVideoTags = useLibrary((s) => s.setVideoTags);
  useEffect(() => {
    setClientId(localStorage.getItem("reelcase.google.client-id") ?? "");
    setToken(sessionStorage.getItem("reelcase.google.youtube-token") ?? "");
  }, []);
  const connect = () => {
    const id = clientId.trim();
    if (!id.endsWith(".apps.googleusercontent.com")) {
      setStatus("Enter the Google OAuth Client ID ending in .apps.googleusercontent.com.");
      return;
    }
    localStorage.setItem("reelcase.google.client-id", id);
    setStatus("Opening Google authorization…");
    const start = () => {
      const google = (
        window as Window & {
          google?: {
            accounts?: {
              oauth2?: {
                initTokenClient: (config: {
                  client_id: string;
                  scope: string;
                  callback: (response: { access_token?: string; error?: string }) => void;
                }) => { requestAccessToken: (config?: { prompt?: string }) => void };
              };
            };
          };
        }
      ).google;
      const client = google?.accounts?.oauth2?.initTokenClient({
        client_id: id,
        scope: "https://www.googleapis.com/auth/youtube.readonly",
        callback: (response) => {
          if (response.access_token) {
            sessionStorage.setItem("reelcase.google.youtube-token", response.access_token);
            setToken(response.access_token);
            setStatus("Google connected for this browser session.");
          } else
            setStatus(`Google authorization failed${response.error ? `: ${response.error}` : "."}`);
        },
      });
      if (!client) {
        setStatus(
          "Google authorization library did not load. Check the authorized JavaScript origin.",
        );
        return;
      }
      client.requestAccessToken({ prompt: "consent" });
    };
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-reelcase-google="true"]',
    );
    if (existing && (window as Window & { google?: unknown }).google) start();
    else {
      const script = existing ?? document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.dataset.reelcaseGoogle = "true";
      script.onload = start;
      script.onerror = () => setStatus("Google authorization library could not load.");
      if (!existing) document.head.appendChild(script);
    }
  };
  const importTags = async () => {
    if (!token) return;
    const items = videos
      .filter((video) => video.remote?.kind === "youtube" && video.remote.videoId)
      .slice(0, 50);
    if (!items.length) {
      setStatus("No YouTube videos are available to enrich yet.");
      return;
    }
    setStatus("Importing available YouTube metadata…");
    try {
      const ids = items.map((video) => video.remote!.videoId).join(",");
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(ids)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!response.ok) throw new Error("Google did not allow the metadata request.");
      const body = (await response.json()) as {
        items?: Array<{
          id: string;
          snippet?: { tags?: string[]; categoryId?: string; channelTitle?: string };
        }>;
      };
      const byId = new Map((body.items ?? []).map((item) => [item.id, item.snippet]));
      let changed = 0;
      for (const video of items) {
        const snippet = byId.get(video.remote!.videoId!);
        const imported = [
          ...new Set(
            [
              "youtube",
              snippet?.channelTitle ?? video.remote?.channelName ?? "",
              ...(snippet?.tags ?? []),
            ]
              .map((tag) => tag.trim())
              .filter(Boolean),
          ),
        ].slice(0, 30);
        if (imported.length) {
          setVideoTags(video.id, imported);
          changed += 1;
        }
      }
      setStatus(`Imported available tags for ${changed} YouTube title${changed === 1 ? "" : "s"}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not import YouTube metadata.");
    }
  };
  return (
    <div className="rounded-lg bg-elevated p-5 shadow-border">
      <span className="text-accent">
        <Clapperboard className="size-5" />
      </span>
      <h2 className="mt-3 font-display text-2xl text-fg">Google & YouTube access</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        Paste only the OAuth Client ID—never a secret. Google’s popup authorizes this browser
        session, then Realhub can read permitted YouTube metadata and available creator tags.
      </p>
      <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs leading-5 text-muted">
        <li>In Google Cloud, create a project and enable YouTube Data API v3.</li>
        <li>
          Create an OAuth Client ID for a Web application; do not create or paste a client secret.
        </li>
        <li>
          Add this exact Authorized JavaScript origin:{" "}
          {typeof window === "undefined" ? "your app origin" : window.location.origin}.
        </li>
        <li>
          Paste the Client ID here, select Connect Google, approve read-only YouTube access, then
          choose Import YouTube tags.
        </li>
      </ol>
      <Input
        className="mt-3"
        value={clientId}
        onChange={(event) => setClientId(event.target.value)}
        placeholder="Google OAuth Client ID"
        aria-label="Google OAuth Client ID"
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" onClick={connect}>
          Connect Google
        </Button>
        <Button size="sm" variant="secondary" disabled={!token} onClick={() => void importTags()}>
          Import YouTube tags
        </Button>
        {token && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              sessionStorage.removeItem("reelcase.google.youtube-token");
              setToken("");
              setStatus("Disconnected from this browser session.");
            }}
          >
            Disconnect
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-accent">{status}</p>
    </div>
  );
}
type LocalPhoto = {
  id: string;
  name: string;
  path: string;
  url: string;
  people: string[];
  tags: string[];
  album: string;
  favorite: boolean;
  hidden: boolean;
  rating: number;
  addedAt: number;
  width?: number;
  height?: number;
  /** Retained only while the current browser session derives local dimensions. */
  file?: File;
  vision?: VisionLabel[];
  visionModel?: VisionModelId;
};
type PhotoVisionPreview = {
  photoId: string;
  name: string;
  labels: VisionLabel[];
  model: VisionModelId;
};
type PhotoSort = "newest" | "name" | "rating" | "favorite" | "auto-tags";
const PHOTO_FILE_RE = /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i;
const photoSourceWarmth = new Map<string, number>();
const PHOTO_BACKGROUND_REFRESH_MS = 30 * 60_000;
let cachedPhotoMetadata: Record<string, Partial<LocalPhoto>> | null = null;
let photoMetaHydrated = false;

function photoMetadata() {
  if (cachedPhotoMetadata) return cachedPhotoMetadata;
  const durable = loadDurablePhotosSync();
  if (durable?.meta && Object.keys(durable.meta).length) {
    cachedPhotoMetadata = durable.meta as Record<string, Partial<LocalPhoto>>;
    return cachedPhotoMetadata;
  }
  try { cachedPhotoMetadata = JSON.parse(localStorage.getItem("reelcase.photo-meta.v1") ?? "{}"); }
  catch { cachedPhotoMetadata = {}; }
  return cachedPhotoMetadata as Record<string, Partial<LocalPhoto>>;
}

function persistPhotoMetadata(next: Record<string, Partial<LocalPhoto>>, sources?: Array<{ id: string; name: string; kind: "directory" | "files"; photoCount?: number; lastCheckedAt?: number }>) {
  cachedPhotoMetadata = next;
  const likes = Object.entries(next).filter(([, row]) => row.favorite).map(([id]) => id);
  saveDurablePhotos({
    meta: next as Record<string, DurablePhotoMeta>,
    likes,
    ...(sources ? { sources } : {}),
  });
}

export function PhotosSection() {
  const scannedPhotoSources = useRef(new Set<string>());
  useEffect(() => {
    if (photoMetaHydrated) return;
    photoMetaHydrated = true;
    void restoreDurablePhotos().then((durable) => {
      cachedPhotoMetadata = { ...(cachedPhotoMetadata ?? {}), ...durable.meta } as Record<string, Partial<LocalPhoto>>;
      if (durable.sources.length) {
        // Source stubs hydrate through the library folders list below.
      }
    }).catch(() => undefined);
  }, []);
  const photoUrls = useRef(new Set<string>());
  const knownPhotoIds = useRef(new Set<string>());
  const discoverySeen = useRef(new Set<string>());
  const metadataWriteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [ratingQueuePhotoId, setRatingQueuePhotoId] = useState(() => {
    try { return localStorage.getItem("reelcase.photos.rating-queue") ?? ""; } catch { return ""; }
  });
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [showHiddenPhotos, setShowHiddenPhotos] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState("All photos");
  const [selectedAlbum, setSelectedAlbum] = useState(() => {
    try { return localStorage.getItem("reelcase.photos.source-filter") || "All albums"; } catch { return "All albums"; }
  });
  const [selectedTag, setSelectedTag] = useState("All tags");
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(() => new Set());
  const [photoSearch, setPhotoSearch] = useState("");
  const [discoveryFilter, setDiscoveryFilter] = useState<"all" | "screenshots" | "camera" | "downloads">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(() => {
    try { return localStorage.getItem("reelcase.photos.favorites-only") === "true"; } catch { return false; }
  });
  const [photoSort, setPhotoSort] = useState<PhotoSort>(() => {
    try { return (localStorage.getItem("reelcase.photos.sort") as PhotoSort) || "newest"; } catch { return "newest"; }
  });
  const [showLocations, setShowLocations] = useState(() => {
    try { return localStorage.getItem("reelcase.photos.show-locations") === "true"; } catch { return false; }
  });
  const [photoFolders, setPhotoFolders] = useState<string[]>([]);
  const [slideshow, setSlideshow] = useState(false);
  const [fullScreenSlide, setFullScreenSlide] = useState(false);
  const [slideSeconds, setSlideSeconds] = useState(() => {
    try { const value = Number(localStorage.getItem("reelcase.photos.slide-seconds") ?? "5"); return [3, 5, 10, 20, 30].includes(value) ? value : 5; } catch { return 5; }
  });
  const [slideIndex, setSlideIndex] = useState(0);
  const [helperNote, setHelperNote] = useState("");
  const [focusedPhotoId, setFocusedPhotoId] = useState<string | null>(null);
  const [photoViewerLoading, setPhotoViewerLoading] = useState(false);
  const [photoSourceLoading, setPhotoSourceLoading] = useState(false);
  const [photoScanTotal, setPhotoScanTotal] = useState(0);
  const [photoScanDone, setPhotoScanDone] = useState(0);
  const [photoScanStartedAt, setPhotoScanStartedAt] = useState(0);
  const [photoScanEstimatedPhotos, setPhotoScanEstimatedPhotos] = useState(0);
  const [photoScanFoundPhotos, setPhotoScanFoundPhotos] = useState(0);
  const [photoScanAverageMs, setPhotoScanAverageMs] = useState(0);
  const [photoMetadataProgress, setPhotoMetadataProgress] = useState({ total: 0, done: 0, startedAt: 0, running: false });
  const [photoLimit, setPhotoLimit] = useState(48);
  const [visionBusy, setVisionBusy] = useState(false);
  const [visionProgress, setVisionProgress] = useState("");
  const [photoVisionRows, setPhotoVisionRows] = useState<PhotoVisionPreview[]>([]);
  const [selectedPhotoVision, setSelectedPhotoVision] = useState<Record<string, boolean>>({});
  const [visionModel, setVisionModel] = useState<VisionModelId>("semanticPlus");
  const [visionReviewOpen, setVisionReviewOpen] = useState(true);
  const [visionBenchmark, setVisionBenchmark] = useState<VisionBenchmark | null>(() => {
    try { const saved = JSON.parse(localStorage.getItem("reelcase.photo-vision-benchmark.v1") ?? "null") as Partial<VisionBenchmark> | null; return saved?.semantic && saved.semanticPlus && saved.semanticPro ? saved as VisionBenchmark : null; } catch { return null; }
  });
  const [visionBenchmarkPhotos, setVisionBenchmarkPhotos] = useState<Array<{ id: string; name: string; url: string; clip: VisionLabel[]; siglipBase: VisionLabel[]; siglipLarge: VisionLabel[] }>>([]);
  const [visionBenchmarkBusy, setVisionBenchmarkBusy] = useState(false);
  const [visionBenchmarkProgress, setVisionBenchmarkProgress] = useState("");
  const [visionBenchmarkError, setVisionBenchmarkError] = useState("");
  const [upscalerHealth, setUpscalerHealth] = useState<{ state: "checking" | "ready" | "missing"; detail: string }>({ state: "checking", detail: "Checking local model cache…" });
  const [upscalerUrl, setUpscalerUrl] = useState<string>(LOCAL_UPSCALER.artifactUrl);
  const [upscalerChecksum, setUpscalerChecksum] = useState<string>(LOCAL_UPSCALER.sha256);
  const [upscalerInstalling, setUpscalerInstalling] = useState(false);
  const [upscalePreview, setUpscalePreview] = useState("");
  const upscalePreviewRef = useRef("");
  const [upscaleBusy, setUpscaleBusy] = useState(false);
  const [upscaleStatus, setUpscaleStatus] = useState("");
  const [companionCache, setCompanionCache] = useState<{ state: string; photos: number; videos: number; scannedAt: number; truncated: boolean } | null>(null);
  const [companionDeltaNote, setCompanionDeltaNote] = useState("");
  const appliedCompanionChanges = useRef(new Set<number>());
  const companionDeltaTimer = useRef<number | null>(null);
  const [photoCacheNotice, setPhotoCacheNotice] = useState("Preparing cached photo index…");
  // Select the store's stable array first. Filtering inside the selector creates a
  // fresh value every render, which makes Zustand continuously notify this view.
  const libraryFolders = useLibrary((s) => s.folders);
  const sourcePhotos = useSourceAssets((s) => s.photos);
  const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
  const sourceFolders = useMemo(
    () => libraryFolders.filter((folder) => folder.kind === "directory" || folder.kind === "files"),
    [libraryFolders],
  );
  // Photo refresh updates folder metadata (such as image counts). Depend on
  // source identity rather than those mutable counters so that update cannot
  // repeatedly restart the background refresh effects.
  const sourceFolderIds = useMemo(() => sourceFolders.map((folder) => folder.id).sort().join("|"), [sourceFolders]);
  const checkUpscalerHealth = async () => {
    try {
      const raw = localStorage.getItem("reelcase.photo-upscaler.model.v1");
      const cache = "caches" in window ? await caches.open("reelcase-local-models-v1") : null;
      const manifest = cache ? await cache.match("/reelcase-local-models/upscaler.manifest.json") : null;
      const model = raw ? JSON.parse(raw) as { name?: string; verifiedAt?: number; version?: string; cacheKey?: string; bytes?: number } : manifest ? await manifest.json() as { name?: string; verifiedAt?: number; version?: string; cacheKey?: string; bytes?: number } : null;
      if (model?.name && model.verifiedAt) {
        const artifact = cache && model.cacheKey ? await cache.match(model.cacheKey) : null;
        if (!artifact) throw new Error("Cached model artifact is unavailable");
        setUpscalerHealth({ state: "ready", detail: `${model.name}${model.version ? ` · ${model.version}` : ""} verified ${new Date(model.verifiedAt).toLocaleDateString()} · ${bytes(model.bytes ?? 0)} cached locally. Ready for local preview runs; originals remain untouched.` });
      } else {
        const bundled = await fetch(LOCAL_UPSCALER.shippedArtifactUrl, { method: "HEAD" });
        if (bundled.ok) setUpscalerHealth({ state: "ready", detail: "Swin2SR x2 beta is bundled and SHA-256 verified. It is ready for local preview runs; originals remain untouched." });
        else setUpscalerHealth({ state: "missing", detail: "No verified local super-resolution model is installed. Upscaling is disabled, so no photo is ever mislabeled as enhanced." });
      }
    } catch { setUpscalerHealth({ state: "missing", detail: "The local model record could not be verified. Upscaling remains disabled and originals are safe." }); }
  };
  useEffect(() => { void checkUpscalerHealth(); }, []);
  const installUpscalerModel = async () => {
    const url = upscalerUrl.trim();
    const expected = upscalerChecksum.trim().toLowerCase().replace(/^sha256:/, "");
    if (!/^https:\/\//i.test(url) || !/^[a-f0-9]{64}$/.test(expected)) { setUpscalerHealth({ state: "missing", detail: "Enter an HTTPS model URL and the publisher’s exact 64-character SHA-256 checksum. Realhub will not install an unverifiable model." }); return; }
    setUpscalerInstalling(true);
    setUpscalerHealth({ state: "checking", detail: "Downloading the model after your explicit request and verifying its SHA-256…" });
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
      if (!response.ok) throw new Error(`Download returned ${response.status}`);
      const blob = await response.blob();
      if (!blob.size || blob.size > 750 * 1024 * 1024) throw new Error("Model size is outside the safe local cache budget");
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()))).map((part) => part.toString(16).padStart(2, "0")).join("");
      if (digest !== expected) throw new Error("Checksum mismatch — the model was not stored");
      const cacheKey = LOCAL_UPSCALER.cacheKey;
      const cache = await caches.open("reelcase-local-models-v1");
      await cache.put(cacheKey, new Response(blob, { headers: { "content-type": blob.type || "application/octet-stream" } }));
      const name = new URL(url).pathname.split("/").pop() || "local-upscaler.onnx";
      const model = { name, version: "user-verified", verifiedAt: Date.now(), cacheKey, bytes: blob.size, sha256: digest, url };
      await cache.put("/reelcase-local-models/upscaler.manifest.json", new Response(JSON.stringify(model), { headers: { "content-type": "application/json" } }));
      try { localStorage.setItem("reelcase.photo-upscaler.model.v1", JSON.stringify(model)); } catch { /* The cache manifest is the durable fallback for full libraries. */ }
      await checkUpscalerHealth();
    } catch (error) { setUpscalerHealth({ state: "missing", detail: `${error instanceof Error ? error.message : "Model install failed"}. No model was enabled and originals were not changed.` }); }
    finally { setUpscalerInstalling(false); }
  };
  const removeUpscalerModel = async () => {
    try { const cache = await caches.open("reelcase-local-models-v1"); await cache.delete("/reelcase-local-models/upscaler.onnx"); await cache.delete("/reelcase-local-models/upscaler.manifest.json"); localStorage.removeItem("reelcase.photo-upscaler.model.v1"); } finally { await checkUpscalerHealth(); }
  };
  const createUpscalePreview = async (photo: LocalPhoto) => {
    setUpscaleBusy(true);
    setUpscaleStatus("Preparing local x2 upscaler…");
    try {
      const preview = await upscaleImageLocally(photo.url, setUpscaleStatus);
      setUpscalePreview((current) => { if (current) URL.revokeObjectURL(current); return preview; });
      setUpscaleStatus("x2 preview ready. The original was not changed.");
    } catch (error) { setUpscaleStatus(`Upscaling stopped: ${error instanceof Error ? error.message : "unknown error"}`); }
    finally { setUpscaleBusy(false); }
  };
  useEffect(() => {
    let alive = true;
    const read = async (signal: AbortSignal) => {
      try {
        const response = await fetch("http://127.0.0.1:43123/cache-status", { signal: AbortSignal.any([signal, AbortSignal.timeout(5_000)]) });
        const data = await response.json() as { worker?: { state?: string; photos?: number; videos?: number; scannedAt?: number; truncated?: boolean }; recentChanges?: { path?: string; at?: number }[] };
        if (!alive || !data.worker) return;
        setCompanionCache({ state: data.worker.state ?? "ready", photos: Number(data.worker.photos) || 0, videos: Number(data.worker.videos) || 0, scannedAt: Number(data.worker.scannedAt) || 0, truncated: Boolean(data.worker.truncated) });
        const fresh = (data.recentChanges ?? []).filter((change) => Number(change.at) > 0 && !appliedCompanionChanges.current.has(Number(change.at)));
        // The first status load establishes a baseline. Later changes trigger
        // one delayed refresh per matching, already-approved browser handle;
        // no permission prompt and no whole-library reload is involved.
        if (!appliedCompanionChanges.current.size) {
          fresh.forEach((change) => appliedCompanionChanges.current.add(Number(change.at)));
          return;
        }
        fresh.forEach((change) => appliedCompanionChanges.current.add(Number(change.at)));
        if (appliedCompanionChanges.current.size > 240) appliedCompanionChanges.current = new Set([...appliedCompanionChanges.current].slice(-120));
        const changedIds = new Set(sourceFolders.filter((folder) => fresh.some((change) => {
          const path = String(change.path ?? "").replaceAll("\\", "/").toLowerCase();
          return path === folder.name.toLowerCase() || path.startsWith(`${folder.name.toLowerCase()}/`);
        })).map((folder) => folder.id));
        if (changedIds.size && !companionDeltaTimer.current) {
          companionDeltaTimer.current = window.setTimeout(() => {
            companionDeltaTimer.current = null;
            void Promise.all([...changedIds].slice(0, 3).map((id) => refreshSourcePhotos(id))).then((counts) => {
              if (alive) setCompanionDeltaNote(`Companion applied ${changedIds.size} folder change${changedIds.size === 1 ? "" : "s"} · ${counts.reduce((sum, count) => sum + count, 0).toLocaleString()} cached photos checked.`);
            });
          }, 1_500);
        }
      } catch { if (alive) setCompanionCache(null); }
    };
    const task = registerPeriodicTask({ name: 'Photo companion status', everyMs: 30_000, firstMs: 0,
      enabled: () => !useLibrary.getState().activeId && !useLibrary.getState().previewId, work: read });
    return () => { alive = false; task.cancel(); if (companionDeltaTimer.current) window.clearTimeout(companionDeltaTimer.current); };
  }, [refreshSourcePhotos, sourceFolderIds]);
  const addPhotos = (files: FileList | File[] | null, folderName = "Unsorted", paths?: string[], urls?: string[]) => {
    if (!files) return;
    // Ratings, tags, and favorites are a small metadata cache. Keep it in
    // memory while Photos is open instead of reparsing the whole collection
    // each time a source sends another image batch.
    const remembered = photoMetadata();
    const next = Array.from(files)
      .filter((file) => file.type.startsWith("image/") || PHOTO_FILE_RE.test(file.name))
      .slice(0, 600)
      .map((file, index): LocalPhoto | null => {
        const path = paths?.[index] || file.webkitRelativePath || `${folderName}/${file.name}`;
        const id = `${path}-${file.lastModified}`;
        if (knownPhotoIds.current.has(id)) return null;
        const url = urls?.[index] ?? URL.createObjectURL(file);
        if (!urls?.[index]) photoUrls.current.add(url);
        return {
        id,
        name: file.name,
        path,
        url,
        people: remembered[id]?.people ?? [],
        tags: remembered[id]?.tags ?? [],
        album: remembered[id]?.album ?? paths?.[index]?.split("/")[0] ?? folderName,
        favorite: remembered[id]?.favorite ?? false,
        hidden: remembered[id]?.hidden ?? false,
        rating: remembered[id]?.rating ?? 0,
        addedAt: file.lastModified,
        width: remembered[id]?.width,
        height: remembered[id]?.height,
        vision: remembered[id]?.vision ?? [], visionModel: remembered[id]?.visionModel,
          file,
        } satisfies LocalPhoto;
      }).filter((photo): photo is LocalPhoto => photo !== null);
    if (!next.length) return;
    for (const photo of next) knownPhotoIds.current.add(photo.id);
    setPhotos((current) => current.length ? [...current, ...next] : next);
  };
  useEffect(() => {
    if (sourcePhotos.length) {
      // Preserve the hot set first: rated and favorited photos become useful
      // before a large source has finished streaming every thumbnail.
      const remembered = photoMetadata();
      const metadataKey = (asset: typeof sourcePhotos[number]) => `${asset.path}-${asset.file.lastModified}`;
      // Avoid sorting tens of thousands of images whenever a source batch
      // arrives. Two linear passes keep the rated/favorite hot set first.
      const hot = sourcePhotos.filter((asset) => (remembered[metadataKey(asset)]?.rating ?? 0) > 0 || remembered[metadataKey(asset)]?.favorite);
      const remaining = sourcePhotos.filter((asset) => !((remembered[metadataKey(asset)]?.rating ?? 0) > 0 || remembered[metadataKey(asset)]?.favorite));
      const prioritized = [...hot, ...remaining].slice(0, 600);
      addPhotos(prioritized.map((asset) => asset.file), "Source import", prioritized.map((asset) => asset.path), prioritized.map((asset) => asset.url));
      setPhotoCacheNotice(`Cached index ready · ${sourcePhotos.length.toLocaleString()} source photos available`);
    }
  }, [sourcePhotos]);
  useEffect(() => { upscalePreviewRef.current = upscalePreview; }, [upscalePreview]);
  useEffect(() => () => {
    for (const url of photoUrls.current) URL.revokeObjectURL(url);
    photoUrls.current.clear();
    if (upscalePreviewRef.current) {
      try { URL.revokeObjectURL(upscalePreviewRef.current); } catch { /* ignore */ }
      upscalePreviewRef.current = "";
    }
  }, []);
  useEffect(() => {
    // Metadata writes used to serialize every photo after every streamed batch.
    // Coalescing into one idle-sized save keeps scrolling and image decode work
    // ahead of storage work for big folders.
    if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
    metadataWriteTimer.current = setTimeout(() => {
      try {
        const nextMeta = { ...photoMetadata(), ...Object.fromEntries(photos.map(({ id, path, people, tags, album, favorite, hidden, rating, width, height, vision, visionModel }) => [id, { path, people, tags, album, favorite, hidden, rating, width, height, vision, visionModel }])) };
        const photoSources = useLibrary.getState().folders
          .filter((folder) => folder.kind === "directory" || folder.kind === "files")
          .map((folder) => ({
            id: folder.id,
            name: folder.name,
            kind: folder.kind as "directory" | "files",
            ...(folder.photoCount != null ? { photoCount: folder.photoCount } : {}),
            ...(folder.lastCheckedAt != null ? { lastCheckedAt: folder.lastCheckedAt } : {}),
          }));
        persistPhotoMetadata(nextMeta, photoSources);
      } catch { /* quota */ }
    }, 650);
    return () => { if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current); };
  }, [photos]);
  useEffect(() => {
    let cancelled = false;
    const waiting = photos.filter((photo) => photo.file && (!photo.width || !photo.height));
    if (!waiting.length) return;
    setPhotoMetadataProgress({ total: waiting.length, done: 0, startedAt: performance.now(), running: true });
    void (async () => {
      // Eight-image chunks keep metadata extraction beneath the interaction
      // budget. createImageBitmap decodes off the layout path where supported.
      for (let start = 0; start < waiting.length && !cancelled; start += 8) {
        const chunk = waiting.slice(start, start + 8);
        const dimensions = await Promise.all(chunk.map(async (photo) => {
          try {
            const bitmap = await createImageBitmap(photo.file!);
            const result = { id: photo.id, width: bitmap.width, height: bitmap.height };
            bitmap.close();
            return result;
          } catch { return { id: photo.id, width: 0, height: 0 }; }
        }));
        if (cancelled) return;
        const byId = new Map(dimensions.filter((item) => item.width > 0 && item.height > 0).map((item) => [item.id, item]));
        setPhotos((items) => items.map((photo) => {
          const next = byId.get(photo.id);
          return next ? { ...photo, width: next.width, height: next.height } : photo;
        }));
        setPhotoMetadataProgress((current) => ({ ...current, done: Math.min(current.total, start + chunk.length) }));
        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      }
      if (!cancelled) setPhotoMetadataProgress((current) => ({ ...current, running: false }));
    })();
    return () => { cancelled = true; };
  }, [photos.length]);
  useEffect(() => { try { localStorage.setItem("reelcase.photos.sort", photoSort); } catch { /* storage unavailable */ } }, [photoSort]);
  useEffect(() => { try { localStorage.setItem("reelcase.photos.favorites-only", String(favoritesOnly)); } catch { /* storage unavailable */ } }, [favoritesOnly]);
  useEffect(() => { try { localStorage.setItem("reelcase.photos.rating-queue", ratingQueuePhotoId); } catch { /* storage unavailable */ } }, [ratingQueuePhotoId]);
  useEffect(() => { try { localStorage.setItem("reelcase.photos.show-locations", String(showLocations)); } catch { /* storage unavailable */ } }, [showLocations]);
  useEffect(() => { try { localStorage.setItem("reelcase.photos.slide-seconds", String(slideSeconds)); } catch { /* storage unavailable */ } }, [slideSeconds]);
  useEffect(() => {
    const onFullscreen = () => setFullScreenSlide(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      // Let cached/rated photos reach the first paint before directory walking
      // begins. The scan still runs in this visit, but no longer competes with
      // initial image decode and list layout.
      await new Promise<void>((resolve) => {
        const idle = window.requestIdleCallback;
        if (idle) idle(() => resolve(), { timeout: 450 });
        else window.setTimeout(resolve, 120);
      });
      if (cancelled) return;
      // Directory handles are re-read only when the photo shelf is opened, so the
      // startup catalog remains fast even for very large video sources.
      const toScan = sourceFolders.filter((folder) => !scannedPhotoSources.current.has(folder.id) && (Date.now() - (photoSourceWarmth.get(folder.id) ?? 0) >= PHOTO_BACKGROUND_REFRESH_MS));
      if (toScan.length) {
        // Folder records retain the last known image count. Show that cheap
        // estimate immediately, then replace it with actual refresh results
        // as each worker finishes instead of leaving a blank spinner.
        setPhotoSourceLoading(true); setPhotoScanTotal(toScan.length); setPhotoScanDone(0); setPhotoScanStartedAt(Date.now());
        setPhotoScanEstimatedPhotos(toScan.reduce((sum, folder) => sum + (folder.photoCount ?? 0), 0));
        setPhotoScanFoundPhotos(0); setPhotoScanAverageMs(0);
      }
      // Folder reads are independent. A small worker pool keeps the browser
      // responsive while allowing cached companion-backed sources to warm in
      // parallel instead of serializing a whole photo library.
      let cursor = 0;
      const adaptiveWorkers = Math.min(12, Math.max(2, Math.floor((navigator.hardwareConcurrency || 4) / 2)));
      const configuredWorkers = Number(localStorage.getItem("reelcase.photo-scan-workers") ?? "0");
      const workerCount = Math.min(toScan.length, getPerformanceProfile().photoWorkers, [2, 4, 6, 8, 12].includes(configuredWorkers) ? configuredWorkers : adaptiveWorkers);
      const workers = Array.from({ length: workerCount }, async () => {
        while (!cancelled) {
          const folder = toScan[cursor++];
          if (!folder) return;
          scannedPhotoSources.current.add(folder.id);
          const started = performance.now();
          const found = await refreshSourcePhotos(folder.id);
          const elapsed = performance.now() - started;
          photoSourceWarmth.set(folder.id, Date.now());
          if (!cancelled) { setPhotoScanDone((done) => done + 1); setPhotoScanFoundPhotos((total) => total + found); setPhotoScanAverageMs((mean) => mean ? mean * 0.65 + elapsed * 0.35 : elapsed); }
        }
      });
      await Promise.all(workers);
      if (!cancelled) setPhotoSourceLoading(false);
    })();
    return () => { cancelled = true; };
  }, [refreshSourcePhotos, sourceFolderIds]);
  const photoScanEta = photoSourceLoading && photoScanDone >= 2 && photoScanTotal > photoScanDone && photoScanAverageMs > 0
    ? Math.max(1, Math.ceil((photoScanAverageMs * (photoScanTotal - photoScanDone)) / 1000))
    : 0;
  const photoMetadataEta = photoMetadataProgress.running && photoMetadataProgress.done > 0 && photoMetadataProgress.done < photoMetadataProgress.total
    ? Math.max(1, Math.ceil(((performance.now() - photoMetadataProgress.startedAt) / photoMetadataProgress.done * (photoMetadataProgress.total - photoMetadataProgress.done)) / 1000))
    : 0;
  const addPhotoFolder = (files: FileList | null) => {
    if (!files?.length) return;
    const first =
      [...files].find((file) => file.webkitRelativePath)?.webkitRelativePath.split("/")[0] ??
      "Photo folder";
    setPhotoFolders((folders) => (folders.includes(first) ? folders : [...folders, first]));
    addPhotos(files, first);
  };
  const people = useMemo(() => [...new Set(photos.flatMap((photo) => photo.people))], [photos]);
  const albums = useMemo(() => [...new Set(photos.map((photo) => photo.album))], [photos]);
  const photoTags = useMemo(() => [...new Set(photos.flatMap((photo) => photo.tags))].sort(), [photos]);
  const visionProcessed = useMemo(() => photos.filter((photo) => photo.vision?.length || photo.tags.some((tag) => tag.startsWith("vision-"))).length, [photos]);
  const visionPending = Math.max(0, photos.length - visionProcessed);
  const visionReviewedPhotos = useMemo(() => photos.filter((photo) => photo.vision?.length || photo.tags.some((tag) => tag.startsWith("vision-"))).sort((a, b) => b.addedAt - a.addedAt), [photos]);
  const visible = useMemo(() => photos
    .filter(
      (photo) =>
        (showHiddenPhotos || !photo.hidden) &&
        (selectedPerson === "All photos" || photo.people.includes(selectedPerson)) &&
        (selectedAlbum === "All albums" || photo.album === selectedAlbum) &&
        (selectedTag === "All tags" || photo.tags.includes(selectedTag)) &&
        (!favoritesOnly || photo.favorite) &&
        (ratingFilter === "all" || (ratingFilter === "unrated" ? !photo.rating : photo.rating >= Number(ratingFilter))) &&
        (discoveryFilter === "all" || (discoveryFilter === "screenshots" ? /screenshot|screen[_ -]?shot/i.test(photo.name) : discoveryFilter === "camera" ? /^(img|dsc|pxl|photo)[_ -]?\d/i.test(photo.name) : /download|image|copy|edited/i.test(photo.name))) &&
        `${photo.name} ${photo.path} ${photo.people.join(" ")} ${photo.tags.join(" ")} ${photo.album}`
          .toLowerCase()
          .includes(photoSearch.toLowerCase()),
    )
    .sort((a, b) => {
      if (photoSort === "name") return a.name.localeCompare(b.name);
      if (photoSort === "rating") return ratingPreference(b.rating) - ratingPreference(a.rating) || b.addedAt - a.addedAt;
      if (photoSort === "favorite") return Number(b.favorite) - Number(a.favorite) || b.addedAt - a.addedAt;
      if (photoSort === "auto-tags") return b.tags.length - a.tags.length || b.addedAt - a.addedAt;
      return b.addedAt - a.addedAt;
    }), [discoveryFilter, favoritesOnly, photoSearch, photoSort, photos, ratingFilter, selectedAlbum, selectedPerson, selectedTag, showHiddenPhotos]);
  const renderedPhotos = visible.slice(0, photoLimit);
  useEffect(() => setPhotoLimit(80), [photoSearch, selectedPerson, selectedAlbum, selectedTag, favoritesOnly, photoSort, discoveryFilter, ratingFilter]);
  useEffect(() => { if (!slideshow || !visible.length) return; return registerPeriodicTask({ name: 'Photo slideshow', mode: 'visible', background: false, everyMs: slideSeconds * 1000, work: () => setSlideIndex(index => (index + 1) % visible.length) }).cancel; }, [slideshow, slideSeconds, visible.length]);
  const featuredPhoto = visible[slideIndex % Math.max(visible.length, 1)];
  const focusedIndex = visible.findIndex((photo) => photo.id === focusedPhotoId);
  // A filter may change while the viewer is opening; keep the full-size
  // viewer bound to the selected object instead of dismissing it silently.
  const focusedPhoto = focusedIndex >= 0 ? visible[focusedIndex] : photos.find((photo) => photo.id === focusedPhotoId);
  const moveFocus = (direction: -1 | 1) => {
    if (!visible.length) return;
    const nextIndex = focusedIndex < 0 ? 0 : (focusedIndex + direction + visible.length) % visible.length;
    setFocusedPhotoId(visible[nextIndex].id);
  };
  const pickFreshDiscovery = () => {
    const unseen = visible.filter((photo) => !discoverySeen.current.has(photo.id));
    const pool = unseen.length ? unseen : visible;
    if (!unseen.length) discoverySeen.current.clear();
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (!pick) return;
    discoverySeen.current.add(pick.id);
    setSlideIndex(visible.findIndex((photo) => photo.id === pick.id));
    setPhotoViewerLoading(true);
    setFocusedPhotoId(pick.id);
  };
  const suggestPeopleFromNames = () => {
    let labeled = 0;
    setPhotos((items) => items.map((photo) => {
      if (photo.people.length) return photo;
      const words = photo.name.replace(/\.[^.]+$/, "").split(/[._\-\d]+/).map((word) => word.trim()).filter((word) => /^[A-Za-z]{3,20}$/.test(word));
      const candidate = words.find((word) => !/^(img|image|photo|picture|screenshot|copy|edited|final)$/i.test(word));
      if (!candidate) return photo;
      labeled += 1;
      return { ...photo, people: [candidate[0].toUpperCase() + candidate.slice(1).toLowerCase()] };
    }));
    setHelperNote(labeled ? `Added ${labeled} suggested label${labeled === 1 ? "" : "s"} from file names. Review each label before relying on it.` : "No clear names were found in unlabeled file names.");
  };
  const autoTagPhotos = () => {
    let changed = 0;
    setPhotos((items) => items.map((photo) => {
      const text = `${photo.name} ${photo.path}`.toLowerCase();
      const extension = photo.name.split(".").pop()?.toLowerCase();
      const album = photo.album.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const suggestions = [
        /screenshot|screen[_ -]?shot/.test(text) ? "screenshot" : "",
        /^(img|dsc|pxl|photo)[_ -]?\d/i.test(photo.name) ? "camera" : "",
        /download|image|copy|edited/.test(text) ? "downloaded" : "",
        /vacation|travel|trip|beach|mountain/.test(text) ? "travel" : "",
        /birthday|wedding|party|event/.test(text) ? "event" : "",
        /pet|dog|cat/.test(text) ? "pets" : "",
        /receipt|invoice|document|scan/.test(text) ? "document" : "",
        /food|meal|restaurant|recipe/.test(text) ? "food" : "",
        /selfie|portrait|face/.test(text) ? "portrait" : "",
        extension ? `type-${extension}` : "",
        album && album !== "unsorted" && album !== "source-import" ? `album-${album}` : "",
        photo.favorite ? "favorite" : "",
        photo.rating >= 4 ? "highly-rated" : "",
        `year-${new Date(photo.addedAt).getFullYear()}`,
        `month-${new Date(photo.addedAt).toLocaleString("en-US", { month: "long" }).toLowerCase()}`,
      ].filter(Boolean);
      const tags = [...new Set([...photo.tags, ...suggestions])];
      if (tags.length === photo.tags.length) return photo;
      changed += 1;
      return { ...photo, tags };
    }));
    setHelperNote(changed ? `Added local filename-based auto tags to ${changed} photo${changed === 1 ? "" : "s"}. You can edit any tag on its card.` : "Everything already has the available local auto tags.");
  };
  const preparePhotoVision = async (candidates: LocalPhoto[]) => {
    const batchCandidates = candidates.slice(0, 48);
    if (!batchCandidates.length) { setHelperNote("Every loaded photo already has accepted local vision labels. Add more photos or edit tags to review them again."); return; }
    setVisionBusy(true);
    setVisionReviewOpen(true);
    setPhotoVisionRows([]);
    setSelectedPhotoVision({});
    setVisionProgress(`Preparing ${VISION_MODELS[visionModel].name} for ${batchCandidates.length.toLocaleString()} photos…`);
    const rows: PhotoVisionPreview[] = [];
    try {
      for (let start = 0; start < batchCandidates.length; start += 12) {
        const batch = batchCandidates.slice(start, start + 12);
        const labels = await classifyImagesLocally(batch.map((photo) => photo.url), (done, total) => setVisionProgress(`${VISION_MODELS[visionModel].name} · ${start + done}/${batchCandidates.length} photos`), visionModel, (status) => {
          const transfer = status.total ? ` · ${Math.round((status.loaded ?? 0) / status.total * 100)}%` : "";
          setVisionProgress(`${VISION_MODELS[visionModel].name} · ${status.status ?? status.file ?? "loading"}${transfer} · ${start}/${batchCandidates.length} complete`);
        });
        rows.push(...batch.map((photo, index) => ({ photoId: photo.id, name: photo.name, labels: labels[index] ?? [], model: visionModel })));
        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      }
      setPhotoVisionRows(rows);
      setSelectedPhotoVision(Object.fromEntries(rows.flatMap((row) => row.labels.map((label) => [`${row.photoId}:vision-${label.label}`, true]))));
      const suggested = rows.filter((row) => row.labels.length > 0).length;
      setHelperNote(`${VISION_MODELS[visionModel].name} prepared ${suggested} local photo result${suggested === 1 ? "" : "s"} for review. Nothing is saved until you apply selected labels.`);
    } catch (error) {
      if (rows.length) {
        setPhotoVisionRows(rows);
        setSelectedPhotoVision(Object.fromEntries(rows.flatMap((row) => row.labels.map((label) => [`${row.photoId}:vision-${label.label}`, true]))));
        setHelperNote(`${VISION_MODELS[visionModel].name} stopped after preparing ${rows.length} photo${rows.length === 1 ? "" : "s"}: ${error instanceof Error ? error.message : "unknown error"}. Review the completed labels; the remaining photos were not changed.`);
      } else {
        setHelperNote(`${VISION_MODELS[visionModel].name} could not prepare local labels: ${error instanceof Error ? error.message : "unknown error"}. No photo tags changed.`);
      }
    } finally { setVisionBusy(false); setVisionProgress(""); }
  };
  const prepareNextPhotoVision = () => void preparePhotoVision(photos.filter((photo) => !photo.vision?.length && !photo.tags.some((tag) => tag.startsWith("vision-"))).slice(0, 48));
  const applyPhotoVision = () => {
    const selectedByPhoto = new Map(photoVisionRows.map((row) => [
      row.photoId,
      { labels: row.labels.filter((label) => selectedPhotoVision[`${row.photoId}:vision-${label.label}`]), model: row.model },
    ]));
    let changedPhotos = 0;
    let addedTags = 0;
    const nextPhotos = photos.map((photo) => {
      const selected = selectedByPhoto.get(photo.id);
      if (!selected?.labels.length) return photo;
      const additions = ["auto-tagged", `auto-tag-${selected.model}-v2`, ...selected.labels.map((label) => `vision-${label.label}`)];
      const newTags = additions.filter((tag) => !photo.tags.includes(tag));
      if (!newTags.length) return photo;
      changedPhotos += 1;
      addedTags += newTags.length;
      return { ...photo, tags: [...photo.tags, ...newTags], vision: selected.labels, visionModel: selected.model };
    });
    setPhotos(nextPhotos);
    setPhotoVisionRows([]);
    setSelectedPhotoVision({});
    setHelperNote(changedPhotos
      ? `Saved ${addedTags} reviewed vision tag${addedTags === 1 ? "" : "s"} on ${changedPhotos} photo${changedPhotos === 1 ? "" : "s"}. Unselected labels were discarded.`
      : "No new labels were saved. They may already exist, or every suggested label was unchecked.");
  };
  const discardPhotoVision = () => {
    setPhotoVisionRows([]);
    setSelectedPhotoVision({});
    setHelperNote("Prepared vision labels were discarded. No photo tags changed.");
  };
  const runVisionBenchmark = async () => {
    const sample = photos.filter((photo) => Boolean(photo.url)).slice(0, 24);
    if (!sample.length) { setHelperNote("Add photos first. The benchmark only uses photos already loaded in this browser."); return; }
    setVisionBenchmarkBusy(true);
    setVisionBenchmarkError("");
    setVisionBenchmarkProgress(`Preparing a ${sample.length}-photo local comparison…`);
    try {
      const benchmark = await benchmarkVisionModelsLocally(
        sample.map((photo) => photo.url),
        (model, done, total) => setVisionBenchmarkProgress(`${VISION_MODELS[model].name} · ${done}/${total}`),
        (model, status) => {
          const transfer = status.total ? ` · ${Math.round((status.loaded ?? 0) / status.total * 100)}%` : "";
          setVisionBenchmarkProgress(`${VISION_MODELS[model].name} · ${status.status ?? status.file ?? "loading"}${transfer}`);
        },
      );
      setVisionBenchmark(benchmark);
      setVisionBenchmarkPhotos(sample.map((photo, index) => ({
        id: photo.id,
        name: photo.name,
        url: photo.url,
        clip: benchmark.semantic.labels[index] ?? [],
        siglipBase: benchmark.semanticPlus.labels[index] ?? [],
        siglipLarge: benchmark.semanticPro.labels[index] ?? [],
      })));
      try { localStorage.setItem("reelcase.photo-vision-benchmark.v1", JSON.stringify(benchmark)); } catch { /* The visible result remains available for this session. */ }
      setHelperNote(`Vision comparison completed on ${sample.length} local photos. SigLIP large+ is ready for the highest-detail browser review tags.`);
    } catch (error) {
      const message = `${error instanceof Error ? error.message : "The semantic model could not start"}. No tags or defaults were changed.`;
      setVisionBenchmarkError(message);
      setHelperNote(message);
    } finally { setVisionBenchmarkBusy(false); setVisionBenchmarkProgress(""); }
  };
  const downloadPhoto = (photo: LocalPhoto) => {
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = photo.name;
    link.click();
  };
  const applyTagToSelected = (tag: string) => {
    const clean = tag.trim().toLowerCase();
    if (!clean || !selectedPhotoIds.size) return;
    setPhotos((items) => items.map((photo) => selectedPhotoIds.has(photo.id) ? { ...photo, tags: [...new Set([...photo.tags, clean])] } : photo));
    setHelperNote(`Added “${clean}” to ${selectedPhotoIds.size} selected photo${selectedPhotoIds.size === 1 ? "" : "s"}.`);
  };
  const startFullScreenSlideshow = async () => {
    const first = visible[slideIndex % Math.max(visible.length, 1)];
    if (!first) return;
    setFocusedPhotoId(first.id);
    setSlideshow(true);
    try { await document.documentElement.requestFullscreen?.(); }
    catch { setHelperNote("Full-screen mode was blocked by this browser. The full-window viewer is still open."); }
  };
  return (
    <HubShell
      eyebrow="Photo viewer"
      icon={<Images className="size-4" />}
      title="Your photos. Your favorites."
      copy="Add photos from this device, then group them by people yourself. Nothing uploads from this browser. Google Photos remains a separate, opt-in destination."
    >
      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-lg border border-border p-4"><Star className="size-4 text-accent"/><span className="mr-2 text-sm font-medium">Rating quest</span>{[["all", "All ratings"], ["unrated", "Needs a rating"], ["3", "3+ stars"], ["4", "4+ stars"], ["5", "5 stars"]].map(([value, label]) => <Button key={value} size="sm" variant={ratingFilter === value ? "default" : "secondary"} onClick={() => setRatingFilter(value)}>{label}</Button>)}<Button size="sm" variant="secondary" disabled={!photos.some((photo) => !photo.rating)} onClick={() => { const choices = photos.filter((photo) => !photo.rating); const savedIndex = choices.findIndex((photo) => photo.id === ratingQueuePhotoId); const pick = choices[(savedIndex + 1 + choices.length) % choices.length]; if (pick) { setRatingQueuePhotoId(pick.id); setFocusedPhotoId(pick.id); } }}>{ratingQueuePhotoId ? "Continue rating queue" : "Rate a surprise photo"}</Button><span className="text-xs text-muted">{photos.filter((photo) => photo.rating > 0).length} of {photos.length} rated</span></div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted"><span>{photos.filter((photo) => photo.hidden).length} hidden photos</span><Button size="sm" variant="secondary" onClick={() => setShowHiddenPhotos((value) => !value)}>{showHiddenPhotos ? "Hide hidden photos" : "Manage hidden photos"}</Button><span>Hidden photos stay saved in their albums and can be restored here.</span></div>
      <div className="mt-6 flex flex-col gap-3 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-fg">Your local photo selection</p>
          <p className="mt-1 text-xs text-muted">
            Photo folders become albums here; people labels are local notes, ready to map to
            XMP/IPTC subject metadata later.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <label>
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => addPhotos(event.target.files)}
            />
            <span className="inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg">
              Add photos
            </span>
          </label>
          <label>
            <input
              className="sr-only"
              type="file"
              multiple
              {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
              onChange={(event) => addPhotoFolder(event.target.files)}
            />
            <span className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border">
              Add photo folder
            </span>
          </label>
          <a
            href="https://photos.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border"
          >
            Open Google Photos
          </a>
          {photoSearch.trim() && <a href={`https://photos.google.com/search/${encodeURIComponent(photoSearch.trim())}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border">Search Google Photos</a>}
          <a
            href="https://www.google.com/android/find/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border"
          >
            Find my phone
          </a>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 rounded-lg bg-elevated p-4 shadow-border">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={selectedPerson === "All photos" ? "default" : "secondary"}
            onClick={() => setSelectedPerson("All photos")}
          >
            All photos
          </Button>
          {people.map((name) => (
            <Button
              key={name}
              size="sm"
              variant={selectedPerson === name ? "default" : "secondary"}
              onClick={() => setSelectedPerson(name)}
            >
              {name}
            </Button>
          ))}
          {albums.map((album) => (
            <span key={album} className="rounded-sm bg-bg/45 px-2 py-1 text-xs text-muted">
              {album}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border pt-3"><span className="self-center text-xs text-muted">Albums</span><Button size="sm" variant={selectedAlbum === "All albums" ? "default" : "secondary"} onClick={() => { setSelectedAlbum("All albums"); localStorage.removeItem("reelcase.photos.source-filter"); }}>All albums</Button>{albums.map((album) => <Button key={album} size="sm" variant={selectedAlbum === album ? "default" : "secondary"} onClick={() => { setSelectedAlbum(album); localStorage.setItem("reelcase.photos.source-filter", album); }}>{album}</Button>)}</div>
        <div className="flex flex-wrap gap-2"><span className="self-center text-xs text-muted">Tags</span><Button size="sm" variant={selectedTag === "All tags" ? "default" : "secondary"} onClick={() => setSelectedTag("All tags")}>All tags</Button><Button size="sm" variant={selectedTag === "auto-tagged" ? "default" : "secondary"} disabled={!visionProcessed} onClick={() => setSelectedTag("auto-tagged")}>Auto-tagged · {visionProcessed}</Button>{photoTags.filter((tag) => tag !== "auto-tagged").slice(0, 16).map((tag) => <Button key={tag} size="sm" variant={selectedTag === tag ? "default" : "secondary"} onClick={() => setSelectedTag(tag)}>#{tag}</Button>)}</div>
        {selectedPhotoIds.size > 0 && <div className="flex flex-wrap items-center gap-2 rounded-sm bg-bg/45 p-3"><span className="text-sm font-medium text-fg">{selectedPhotoIds.size} selected</span><Button size="sm" variant="secondary" onClick={() => applyTagToSelected("favorite-set")}>Tag set</Button><Button size="sm" variant="secondary" onClick={() => { photos.filter((photo) => selectedPhotoIds.has(photo.id)).forEach(downloadPhoto); }}>Download selected</Button><Button size="sm" variant="ghost" onClick={() => setSelectedPhotoIds(new Set())}>Clear selection</Button></div>}
        {photoFolders.length > 0 && (
          <p className="text-xs text-muted">Sources · {photoFolders.join(" · ")}</p>
        )}
        {sourceFolders.length > 0 && <p className="text-xs text-muted">Video sources available for photo folders · {sourceFolders.map((folder) => folder.name).slice(0, 8).join(" · ")}</p>}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={photoSearch}
            onChange={(event) => setPhotoSearch(event.target.value)}
            placeholder="Search names, people, albums, or file locations"
            aria-label="Search photos"
          />
          <Button
            size="sm"
            variant={favoritesOnly ? "default" : "secondary"}
            onClick={() => setFavoritesOnly((value) => !value)}
          >
            Favorites
          </Button>
          {(["newest", "name", "rating", "favorite", "auto-tags"] as const).map((sort) => (
            <Button key={sort} size="sm" variant={photoSort === sort ? "default" : "secondary"} onClick={() => setPhotoSort(sort)}>
              {sort === "newest" ? "Newest" : sort === "name" ? "A–Z" : sort === "rating" ? "Top rated" : sort === "favorite" ? "Favorites first" : "Auto tags"}
            </Button>
          ))}
          <Button size="sm" variant={showLocations ? "default" : "secondary"} onClick={() => setShowLocations((value) => !value)}>
            {showLocations ? "Hide locations" : "Show locations"}
          </Button>
          <Button size="sm" variant={slideshow ? "default" : "secondary"} onClick={() => setSlideshow((value) => !value)}>{slideshow ? "Stop auto-change" : "Auto-change photos"}</Button>
          <Button size="sm" variant={fullScreenSlide ? "default" : "secondary"} disabled={!visible.length} onClick={() => void startFullScreenSlideshow()}>{fullScreenSlide ? "Full screen active" : "Full-screen slideshow"}</Button>
          {slideshow && <select value={slideSeconds} onChange={(event) => setSlideSeconds(Number(event.target.value))} aria-label="Photo slideshow interval" className="h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border">{[3, 5, 10, 20, 30].map((seconds) => <option key={seconds} value={seconds}>Every {seconds}s</option>)}</select>}
          <Button size="sm" variant="secondary" disabled={!visible.length} onClick={pickFreshDiscovery}>Fresh discovery</Button>
          <Button size="sm" variant="secondary" disabled={!photos.length} onClick={suggestPeopleFromNames}>Suggest people labels</Button>
          <Button size="sm" variant="secondary" disabled={!photos.length} onClick={autoTagPhotos}>Auto tag photos</Button>
          <Button size="sm" variant="secondary" disabled={!photos.length || visionBusy} onClick={prepareNextPhotoVision}>{visionBusy ? visionProgress || "Starting local vision…" : "Prepare local vision labels · 48"}</Button>
        </div>
        <div className="flex flex-wrap gap-2"><span className="self-center text-xs text-muted">Local discovery</span>{(["all", "screenshots", "camera", "downloads"] as const).map((filter) => <Button key={filter} size="sm" variant={discoveryFilter === filter ? "default" : "secondary"} onClick={() => setDiscoveryFilter(filter)}>{filter === "all" ? "All" : filter === "camera" ? "Camera names" : filter[0].toUpperCase() + filter.slice(1)}</Button>)}</div>
          <section className="rounded-md border border-border bg-bg/45 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Local vision</p><p className="mt-1 text-sm text-fg">{visionProcessed.toLocaleString()} accepted · {visionPending.toLocaleString()} waiting · SigLIP semantic+ is the balanced fast default</p></div><Button size="sm" variant="secondary" disabled={visionBusy || !visionPending} onClick={prepareNextPhotoVision}>{visionBusy ? visionProgress || "Starting model…" : `Prepare next ${Math.min(48, visionPending)}`}</Button></div>
            <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-muted">Tagging model</span>{(["semanticPro", "semanticPlus", "semantic"] as VisionModelId[]).map((model) => <Button key={model} size="sm" variant={visionModel === model ? "default" : "ghost"} disabled={visionBusy} onClick={() => setVisionModel(model)}>{VISION_MODELS[model].name}</Button>)}</div>
            <p className="mt-2 text-xs leading-5 text-muted">{VISION_MODELS[visionModel].purpose}. Labels stay on this device until you explicitly apply checked suggestions. Each review is bounded to 48 photos so you can inspect it without a bulk automatic save; CLIP and SigLIP large+ remain available for benchmarked comparison.</p>
            {photoVisionRows.length > 0 && <section className="mt-3 rounded-sm border border-border bg-elevated p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium text-fg">Review vision labels before saving · {photoVisionRows.length}</p><p className="mt-1 text-xs text-muted">Only checked labels are added. Unchecked labels are discarded when you apply or replace this review.</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="ghost" onClick={discardPhotoVision}>Discard review</Button><Button size="sm" disabled={!photoVisionRows.some((row) => row.labels.some((label) => selectedPhotoVision[`${row.photoId}:vision-${label.label}`]))} onClick={applyPhotoVision}>Apply selected labels</Button></div></div><div className="mt-3 grid gap-2">{photoVisionRows.map((row) => <div key={row.photoId} className="rounded-sm border border-border bg-bg/55 p-3"><p className="truncate text-xs font-medium text-fg">{row.name}</p>{row.labels.length ? <div className="mt-2 flex flex-wrap gap-2">{row.labels.map((label) => <label key={`${row.photoId}:${label.label}`} className="flex items-center gap-2 rounded-xs bg-elevated px-2 py-1 text-xs text-fg"><input className="size-3.5 accent-accent" type="checkbox" checked={Boolean(selectedPhotoVision[`${row.photoId}:vision-${label.label}`])} onChange={(event) => setSelectedPhotoVision((current) => ({ ...current, [`${row.photoId}:vision-${label.label}`]: event.target.checked }))}/><span>#{`vision-${label.label}`} · {Math.round(label.score * 100)}%</span></label>)}</div> : <p className="mt-2 text-xs text-muted">No confident local label suggested. Nothing will be saved for this photo.</p>}</div>)}</div></section>}
            {visionReviewedPhotos.length > 0 && <section className="mt-3 rounded-sm border border-border bg-elevated p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium text-fg">Accepted photo vision results · {visionReviewedPhotos.length}</p><p className="mt-1 text-xs text-muted">These are labels you explicitly saved. Filter the gallery with #auto-tagged or its model-version tag.</p></div><Button size="sm" variant="ghost" onClick={() => setVisionReviewOpen((open) => !open)}>{visionReviewOpen ? "Hide accepted results" : `Review ${visionReviewedPhotos.length}`}</Button></div>{visionReviewOpen && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{visionReviewedPhotos.slice(0, 24).map((photo) => { const labels = photo.vision?.length ? photo.vision : photo.tags.filter((tag) => tag.startsWith("vision-")).map((tag) => ({ label: tag.slice(7), score: 0 })); return <button key={photo.id} type="button" className="overflow-hidden rounded-xs bg-bg/55 text-left" onClick={() => { setPhotoViewerLoading(true); setFocusedPhotoId(photo.id); }} aria-label={`Review tags for ${photo.name}`}><img src={photo.url} alt="" loading="lazy" decoding="async" className="aspect-square w-full object-cover"/><span className="block p-2"><span className="block truncate text-xs font-medium text-fg">{photo.name}</span><span className="mt-1 flex flex-wrap gap-1">{labels.length ? labels.slice(0, 3).map((label) => <span key={label.label} className="rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent">{label.label}{label.score ? ` · ${Math.round(label.score * 100)}%` : ""}</span>) : <span className="text-[11px] text-muted">No confident label — review image</span>}</span></span></button>; })}</div>}{visionReviewOpen && visionReviewedPhotos.length > 24 && <p className="mt-3 text-xs text-muted">Showing 24 of {visionReviewedPhotos.length.toLocaleString()} accepted photos. Use photo tags or search to narrow the gallery.</p>}</section>}
            <div className="mt-3 rounded-sm border border-border bg-elevated p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium text-fg">Vision model benchmark</p><p className="mt-1 max-w-2xl text-xs leading-5 text-muted">Compare CLIP, SigLIP semantic+, and SigLIP large+ on the same 24 local photos. The first run downloads optional local models; later runs reuse the browser cache.</p></div><Button size="sm" disabled={visionBenchmarkBusy || !photos.length} onClick={() => void runVisionBenchmark()}>{visionBenchmarkBusy ? "Comparing…" : "Run 3-model comparison"}</Button></div>{visionBenchmarkBusy && <p className="mt-3 flex items-center gap-2 text-xs text-accent"><RefreshCw className="size-3 animate-spin"/>{visionBenchmarkProgress || "Preparing local models…"}</p>}{visionBenchmarkError && <p className="mt-3 rounded-xs bg-bg/50 px-3 py-2 text-xs text-muted">Benchmark stopped · {visionBenchmarkError}</p>}{visionBenchmark && <div className="mt-3 grid gap-2 sm:grid-cols-3"><div className="rounded-xs bg-bg/50 p-3 text-xs"><p className="font-medium text-fg">{VISION_MODELS.semantic.name}</p><p className="mt-1 text-muted">{visionBenchmark.semantic.elapsedMs.toFixed(0)} ms · {visionBenchmark.semantic.labels.flat().length} labels · {visionBenchmark.sampleSize} photos</p></div><div className="rounded-xs bg-bg/50 p-3 text-xs"><p className="font-medium text-fg">{VISION_MODELS.semanticPlus.name}</p><p className="mt-1 text-muted">{visionBenchmark.semanticPlus.elapsedMs.toFixed(0)} ms · {visionBenchmark.semanticPlus.labels.flat().length} labels · {visionBenchmark.sampleSize} photos</p></div><div className="rounded-xs bg-bg/50 p-3 text-xs"><p className="font-medium text-fg">{VISION_MODELS.semanticPro.name}</p><p className="mt-1 text-muted">{visionBenchmark.semanticPro.elapsedMs.toFixed(0)} ms · {visionBenchmark.semanticPro.labels.flat().length} labels · {visionBenchmark.sampleSize} photos</p></div></div>}{visionBenchmarkPhotos.length > 0 && <section className="mt-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium text-fg">Photo-by-photo tag review</p><p className="text-[11px] text-muted">CLIP, SigLIP semantic+, and SigLIP large+ results on the same image</p></div><div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{visionBenchmarkPhotos.map((photo) => <article key={photo.id} className="overflow-hidden rounded-xs border border-border bg-bg/50"><img src={photo.url} alt={photo.name} loading="lazy" decoding="async" className="aspect-video w-full object-cover"/><div className="p-3"><p className="truncate text-xs font-medium text-fg">{photo.name}</p><div className="mt-2 grid gap-2"><div><p className="text-[11px] font-medium text-muted">CLIP</p><p className="mt-1 flex flex-wrap gap-1">{photo.clip.length ? photo.clip.slice(0, 4).map((label) => <span key={label.label} className="rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent">{label.label} · {Math.round(label.score * 100)}%</span>) : <span className="text-[11px] text-subtle">No confident label</span>}</p></div><div><p className="text-[11px] font-medium text-muted">SigLIP semantic+</p><p className="mt-1 flex flex-wrap gap-1">{photo.siglipBase.length ? photo.siglipBase.slice(0, 4).map((label) => <span key={label.label} className="rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent">{label.label} · {Math.round(label.score * 100)}%</span>) : <span className="text-[11px] text-subtle">No confident label</span>}</p></div><div><p className="text-[11px] font-medium text-muted">SigLIP large+</p><p className="mt-1 flex flex-wrap gap-1">{photo.siglipLarge.length ? photo.siglipLarge.slice(0, 4).map((label) => <span key={label.label} className="rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent">{label.label} · {Math.round(label.score * 100)}%</span>) : <span className="text-[11px] text-subtle">No confident label</span>}</p></div></div></div></article>)}</div></section>}<p className="mt-2 text-[11px] leading-4 text-subtle">The CLIP baseline is pinned to a verified revision. Results include model preparation and inference so the comparison reflects the actual browser experience.</p></div>
            <details className="mt-3 rounded-sm border border-border bg-elevated p-3"><summary className="cursor-pointer text-xs font-medium text-fg">Upscaler beta · {upscalerHealth.state === "ready" ? "verified artifact" : "not installed"}</summary><div className="mt-3"><p className={`text-xs leading-5 ${upscalerHealth.state === "ready" ? "text-accent" : "text-muted"}`}>{upscalerHealth.detail}</p><div className="mt-3 flex gap-2"><Button size="sm" variant="ghost" onClick={() => void checkUpscalerHealth()}>Check</Button>{upscalerHealth.state === "ready" && <Button size="sm" variant="ghost" onClick={() => void removeUpscalerModel()}>Remove</Button>}</div>{upscalerHealth.state !== "ready" && <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)_auto]"><Input value={upscalerUrl} onChange={(event) => setUpscalerUrl(event.target.value)} placeholder="HTTPS model URL" aria-label="Upscaler model URL"/><Input value={upscalerChecksum} onChange={(event) => setUpscalerChecksum(event.target.value)} placeholder="Publisher SHA-256" aria-label="Upscaler model SHA-256 checksum"/><Button size="sm" disabled={upscalerInstalling} onClick={() => void installUpscalerModel()}>{upscalerInstalling ? "Verifying…" : "Download + verify"}</Button></div>}<p className="mt-2 text-[11px] leading-4 text-subtle">The verified beta artifact is bundled for local preview. Originals and exports remain untouched until you explicitly save a reviewed result.</p></div></details>
          </section>
        <p className="text-xs leading-5 text-muted">Private local discovery uses file-name patterns plus an optional on-device open-source image classifier. It analyzes up to 48 queued photos at a time; photo bytes stay in this browser. A 900-photo warm URL cache and small rendered batches keep scrolling responsive while folders continue to stream.</p>
        {companionCache && <p className="text-xs leading-5 text-subtle">Companion cache worker · {companionCache.state} · {companionCache.photos.toLocaleString()} photo metadata hints · {companionCache.videos.toLocaleString()} video metadata hints{companionCache.truncated ? " · bounded pass reached its safe limit" : ""}{companionCache.scannedAt ? ` · checked ${new Date(companionCache.scannedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}. Media files remain on this computer.</p>}
        {companionDeltaNote && <p className="text-xs leading-5 text-accent">{companionDeltaNote}</p>}
        {(helperNote || photoSourceLoading || photoMetadataProgress.running || photoCacheNotice) && <p className="flex items-center gap-2 text-xs text-accent">{(photoSourceLoading || photoMetadataProgress.running) && <RefreshCw className="size-3 animate-spin" />}{photoSourceLoading ? `Loading cached photo sources · ${photoScanDone}/${photoScanTotal} folders · ${photoScanFoundPhotos.toLocaleString()} found${photoScanEstimatedPhotos ? ` of about ${photoScanEstimatedPhotos.toLocaleString()}` : ""}${photoScanEta ? ` · about ${photoScanEta}s remaining` : " · estimating time remaining…"}` : photoMetadataProgress.running ? `Reading photo dimensions and dates · ${photoMetadataProgress.done}/${photoMetadataProgress.total} complete${photoMetadataEta ? ` · about ${photoMetadataEta}s remaining` : " · estimating time remaining…"}` : helperNote || photoCacheNotice}</p>}
      </div>
      {!photos.length ? (
        <div className="mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border">
          <img src="/art/realhub-media-cards.webp" alt="" loading="lazy" className="mx-auto h-28 w-36 object-contain" />
          <p className="mt-3 font-display text-2xl text-fg">Start with a few favorites</p>
          <p className="mt-2 text-sm text-muted">
            Add photos here to make private people sections without connecting an account.
          </p>
        </div>
      ) : (
        <><div className="mt-5 overflow-hidden rounded-lg bg-elevated shadow-border">{featuredPhoto && <div className="grid gap-0 sm:grid-cols-[minmax(0,1.5fr)_minmax(16rem,0.5fr)]"><img src={featuredPhoto.url} alt={featuredPhoto.name} decoding="async" className="aspect-video size-full object-cover"/><div className="flex flex-col justify-center p-5"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Now showing</p><p className="mt-2 font-display text-3xl text-fg">{featuredPhoto.name}</p><p className="mt-2 text-sm text-muted">{featuredPhoto.album} · {featuredPhoto.rating || 0}/5 rating</p>{showLocations && <p title={featuredPhoto.path} className="mt-2 truncate text-xs text-muted">{featuredPhoto.path}</p>}</div></div>}</div><div className="mt-5"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {renderedPhotos.map((photo) => (
            <div key={photo.id} className="relative overflow-hidden rounded-md bg-elevated shadow-border">
              <label className="absolute z-10 m-2 flex size-7 items-center justify-center rounded-sm bg-bg/75 text-fg"><input type="checkbox" checked={selectedPhotoIds.has(photo.id)} onChange={() => setSelectedPhotoIds((current) => { const next = new Set(current); if (next.has(photo.id)) next.delete(photo.id); else next.add(photo.id); return next; })} aria-label={`Select ${photo.name}`}/></label>
              <button type="button" className="group relative block w-full" onClick={() => { setPhotoViewerLoading(true); setFocusedPhotoId(photo.id); }} aria-label={`Open ${photo.name} full screen`}><img src={photo.url} alt={photo.name} loading="lazy" decoding="async" className="aspect-square w-full object-cover" /><span className="absolute inset-0 flex items-center justify-center bg-bg/45 opacity-0 transition-opacity group-hover:opacity-100"><Maximize2 className="size-6 text-fg" /></span></button>
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm text-fg">{photo.name}</p>
                  <Button
                    size="sm"
                    variant={photo.favorite ? "default" : "secondary"}
                    onClick={() =>
                      setPhotos((items) =>
                        items.map((item) =>
                          item.id === photo.id ? { ...item, favorite: !item.favorite } : item,
                        ),
                      )
                    }
                  >
                    ♥
                  </Button>
                  <Button size="sm" variant="secondary" aria-label={`Download ${photo.name}`} onClick={() => downloadPhoto(photo)}>
                    <Download className="size-4" />
                  </Button>
                  <Button size="sm" variant="secondary" aria-label={`${photo.hidden ? "Restore" : "Hide"} ${photo.name}`} onClick={() => setPhotos((items) => items.map((item) => item.id === photo.id ? { ...item, hidden: !item.hidden } : item))}><EyeOff className="size-4" /></Button>
                </div>
                {showLocations && <p title={photo.path} className="mt-1 truncate text-xs text-muted">{photo.path}</p>}
                <PhotoStars name={photo.name} rating={photo.rating} onChange={(rating) => setPhotos((items) => items.map((item) => item.id === photo.id ? { ...item, rating } : item))} />
                <Input
                  className="mt-2 h-9"
                  placeholder="People: Alex, Sam"
                  value={photo.people.join(", ")}
                  onChange={(event) => {
                    const names = event.target.value
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean);
                    setPhotos((items) =>
                      items.map((item) =>
                        item.id === photo.id ? { ...item, people: names } : item,
                      ),
                    );
                  }}
                />
                <Input
                  className="mt-2 h-9"
                  placeholder="Tags: travel, pets, event"
                  value={photo.tags.join(", ")}
                  onChange={(event) => {
                    const tags = event.target.value.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean).slice(0, 20);
                    setPhotos((items) => items.map((item) => item.id === photo.id ? { ...item, tags: [...new Set(tags)] } : item));
                  }}
                />
                <Input
                  className="mt-2 h-9"
                  placeholder="Album, e.g. Summer 2026"
                  value={photo.album}
                  onChange={(event) =>
                    setPhotos((items) =>
                      items.map((item) =>
                        item.id === photo.id
                          ? { ...item, album: event.target.value || "Unsorted" }
                          : item,
                      ),
                    )
                  }
                />
              </div>
            </div>
          ))}
        </div><div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted"><span>Showing {Math.min(renderedPhotos.length, visible.length)} of {visible.length} matching photos</span>{renderedPhotos.length < visible.length && <Button size="sm" variant="secondary" onClick={() => setPhotoLimit((limit) => limit + 80)}>Show 80 more</Button>}</div></div>{focusedPhoto && <div role="dialog" aria-modal="true" aria-label={`Viewing ${focusedPhoto.name}`} className="fixed inset-0 z-[80] flex items-center justify-center bg-bg/95 p-4" onClick={() => setFocusedPhotoId(null)}><div className="relative flex h-full w-full max-w-7xl flex-col gap-3" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between gap-3 text-fg"><div className="min-w-0"><p className="truncate font-medium">{focusedPhoto.name}</p><p className="text-xs text-muted">{Math.max(1, focusedIndex + 1)} of {visible.length || photos.length} · {focusedPhoto.album}</p>{showLocations && <p title={focusedPhoto.path} className="truncate text-xs text-muted">{focusedPhoto.path}</p>}</div><Button size="sm" variant="secondary" onClick={() => setFocusedPhotoId(null)}>Close</Button></div><div className="flex flex-wrap items-center gap-2"><Button size="sm" variant={focusedPhoto.favorite ? "default" : "secondary"} onClick={() => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? { ...item, favorite: !item.favorite } : item))}>{focusedPhoto.favorite ? "♥ Favorite" : "♡ Favorite"}</Button><Button size="sm" variant="secondary" aria-label={`Download ${focusedPhoto.name}`} onClick={() => downloadPhoto(focusedPhoto)}><Download className="size-4"/> Download</Button><Button size="sm" variant="secondary" disabled={visionBusy} onClick={() => { setFocusedPhotoId(null); void preparePhotoVision([focusedPhoto]); }}>{visionBusy ? visionProgress || "Preparing labels…" : "Prepare vision labels"}</Button><Input className="h-8 min-w-56 flex-1" aria-label="Edit photo tags" value={focusedPhoto.tags.join(", ")} placeholder="Add tags, separated by commas" onChange={(event) => { const nextTags = [...new Set(event.target.value.split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean))]; setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? { ...item, tags: nextTags } : item)); }} />{focusedPhoto.tags.length ? focusedPhoto.tags.map((tag) => <button key={tag} type="button" className="rounded-xs bg-elevated px-2 py-1 text-xs text-muted" onClick={() => setSelectedTag(tag)}>#{tag}</button>) : <span className="text-xs text-muted">No tags yet</span>}</div><PhotoStars name={focusedPhoto.name} rating={focusedPhoto.rating} onChange={(rating) => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? { ...item, rating } : item))} /><div className="relative min-h-0 flex-1">{photoViewerLoading && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg/70 text-sm text-fg"><RefreshCw className="size-7 animate-spin text-accent" />Loading full-resolution photo…</div>}<img src={focusedPhoto.url} alt={focusedPhoto.name} className="max-h-full w-full object-contain" decoding="async" onLoad={() => setPhotoViewerLoading(false)} onError={() => setPhotoViewerLoading(false)}/><Button size="sm" variant="secondary" className="absolute top-1/2 left-2 -translate-y-1/2" onClick={() => { setPhotoViewerLoading(true); moveFocus(-1); }} aria-label="Previous photo"><ChevronLeft className="size-5"/></Button><Button size="sm" variant="secondary" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={() => { setPhotoViewerLoading(true); moveFocus(1); }} aria-label="Next photo"><ChevronRight className="size-5"/></Button></div></div></div>}</>
      )}
    </HubShell>
  );
}
const missionStatus = (mission: Mission): MissionStatus => mission.done ? "complete" : mission.status ?? "planned";
const missionStatusLabel: Record<MissionStatus, string> = {
  planned: "Planned",
  "in-progress": "In progress",
  blocked: "Blocked",
  complete: "Complete",
};
const missionStatusTone: Record<MissionStatus, string> = {
  planned: "bg-bg/65 text-muted",
  "in-progress": "bg-accent/15 text-accent",
  blocked: "bg-danger/15 text-danger",
  complete: "bg-accent/10 text-accent",
};
function missionSteps(mission: Mission): [string, string, string] {
  if (mission.id === "watch") return [
    "Keep host state authoritative and reject stale playback or queue messages.",
    "Run isolated desktop-host and mobile-guest browser checks for connection, chat, playback, seek, and leave.",
    "Confirm the same flows on separate home-network devices, including local-file drift and queue changes.",
  ];
  if (mission.id === "sprint-19") return [
    "Verify the local guest-window fallback and isolated browser sessions.",
    "Check desktop and mobile room layout, chat, playback, seek, and reconnect in a repeatable browser run.",
    "Repeat on physical home-network devices and record browser, network, drift, and queue results.",
  ];
  if (mission.id === "watch-room-cross-device") return [
    "Enter temporary TURN credentials on both devices and enable relay-only mode.",
    "Verify both peers report a connected relay candidate and exchange chat and playback commands.",
    "Repeat across separate networks and record the diagnostic result without credentials.",
  ];
  if (mission.id.startsWith("watch") || mission.id.startsWith("twitch")) return [
    "Capture the current provider or room state without replacing a healthy cached result.",
    "Exercise the focused path with a bounded request, retry, and recovery case.",
    "Record the limit and verification result before increasing any default budget.",
  ];
  if (mission.id.startsWith("youtube")) return [
    "Keep the first visible shelf interactive while this provider work is deferred.",
    "Verify a recent refresh, an older-item pull, and duplicate-safe merge behavior.",
    "Measure payload and render cost before raising the routine refresh budget.",
  ];
  if (mission.id.startsWith("speed") || mission.id.startsWith("smooth") || mission.id.startsWith("warp")) return [
    "Add a local measurement or bounded scheduler for the affected work.",
    "Check the large-library path on desktop and phone without console errors or overflow.",
    "Keep the result behind a repeatable release check so it cannot silently regress.",
  ];
  return [
    "Implement the smallest durable local change that preserves existing saved data.",
    "Verify the normal path plus an interrupted or restored-session path.",
    "Run the production build check and record the remaining external dependency, if any.",
  ];
}
const DEFAULT_MISSIONS: Mission[] = [
  { id: "index", title: "Durable media index", detail: "Catalog source health, cached metadata, persistent thumbnails, and fast search without blocking the first screen.", done: true },
  { id: "companion", title: "Desktop companion", detail: "Verify local files, watch selected folders, and launch approved desktop shortcuts through a local companion.", done: true },
  { id: "watch", title: "Watch room reliability", detail: "Host-authoritative state, stale-command rejection, revisioned queue reconciliation, LAN diagnostics, and guest-access messaging are implemented. Isolated desktop-host/mobile-guest WebRTC, chat, play/pause/seek, reload reconciliation, resync, local-file matching, queue edits, and leave checks pass. Twitch status now waits for playback. Physical-device drift and catalog queue play remain.", done: false, status: "in-progress" },
  { id: "watch-room-state-integrity", title: "Watch Room state integrity", detail: "Done · Watch Room now keeps a compact local session ledger, rejects stale or out-of-order host state, gives queue changes monotonic revisions, and routes guest playback or queue changes through host confirmation.", done: true },
  { id: "watch-room-browser-compatibility", title: "Watch Room browser compatibility", detail: "Done · local room and session identifiers now fall back safely when a browser exposes Web Crypto without crypto.randomUUID, preventing the room from failing before it can join.", done: true },
  { id: "services", title: "Connected services", detail: "Keep Twitch, YouTube, Roku, Spotify, and photo imports independently cached and refreshable.", done: true },
  { id: "thumb-health", title: "Thumbnail health queue", detail: "Retry failed artwork, hide unavailable remote cards, and expose a small source diagnostic instead of blank previews.", done: true },
  { id: "windows-explorer", title: "Windows explorer bridge", detail: "Companion-backed folder health, change events, shortcut validation, and safe launch history for local libraries.", done: true },
  { id: "service-status", title: "Service refresh status", detail: "Show when each connected service last refreshed, preserve partial results, and allow focused retries without reloading the whole app.", done: true },
  { id: "vr-theater", title: "VR theater reliability", detail: "WebXR cinema surface for local playback, controller transport controls, and clear Meta Quest recovery guidance.", done: true },
  { id: "companion-onboarding", title: "Companion onboarding", detail: "One-screen startup checklist: run the companion, confirm Desktop approval, load shortcuts, verify a file, then launch one game safely.", done: true },
  { id: "large-library-views", title: "Large-library views", detail: "Progressively render grids and keep recommendations responsive with very large catalog views.", done: true },
  { id: "favorites-memory", title: "Favorites memory", detail: "Preserve favorites, shelves, and resume markers in the local catalog with export and recovery checks across sessions.", done: true },
  { id: "recovery-import", title: "History & stats recovery imports", detail: "History and Stats now expose a merge-safe Realhub library-pack import for exported activity, resume marks, follows, shelves, ratings, Adult marks, and saved links.", done: true },
  { id: "anime-library-desk", title: "Anime library desk", detail: "Done · a separate Anime desk groups saved #anime media into all, continue, series, and films/specials shelves. It can tag existing catalog cards without importing, proxying, or embedding third-party streams.", done: true },
  { id: "tag-search-upgrade", title: "Tag search everywhere", detail: "Done · the top bar and Adults controls accept human-readable partial tags, match saved creator/source/interest labels, and keep Adult results on the current desk.", done: true },
  { id: "theme-accessibility", title: "Theme & accessibility", detail: "Day/night palettes, focus styling, reduced-motion support, and per-section density preferences.", done: true },
  { id: "preview-recovery", title: "Local preview recovery", detail: "Resolve restored file handles in previews, hide failures, and log playback health without blocking the library.", done: true },
  { id: "youtube-quality", title: "YouTube channel quality", detail: "Per-channel retry controls, published-date ordering, duplicate suppression, and unavailable-card recovery are available in the YouTube desk.", done: true },
  { id: "youtube-focused-archive-capacity", title: "YouTube focused archive capacity", detail: "Done · a focused creator pull has a 100,000-item metadata ceiling and enough bounded continuation budget to stop at that ceiling or at the public archive end. Routine and bulk pulls stay smaller.", done: true },
  { id: "youtube-comment-response-recovery", title: "YouTube comment response recovery", detail: "Done · on-demand comment pulls accept both current entity payloads and the durable commentRenderer response shape, with initial-page continuation fallback.", done: true },
  { id: "twitch-quality", title: "Twitch live quality", detail: "Live-first ordering, per-channel timestamps, VOD/clip shelves, focused refresh, retry deadlines, and an additive archive cache are active.", done: true },
  { id: "x-quality", title: "X reading desk quality", detail: "Public profile/topic navigation, per-view load state, retry handling, and local reading-position timestamps are available without credentials.", done: true },
  { id: "startup-budget", title: "Startup performance budget", detail: "Catalog hydration, deferred search-index construction, lazy thumbnails, and bounded photo rendering protect the first usable shelf.", done: true },
  { id: "provider-import-recovery", title: "Provider import recovery", detail: "Provider refreshes retain successful channel rows, preserve prior cache on partial failures, and use RSS/channel-page plus public Twitch GraphQL recovery paths.", done: true },
  { id: "adult-source-recovery", title: "Adult source recovery", detail: "Done · Booru pulls use source-aware queries plus JSON, XML, and public-listing recovery so Rule34-style, Gelbooru, and Realbooru responses no longer collapse into empty source chips.", done: true },
  { id: "adult-provider-diverse-recommendations", title: "Adult provider-diverse recommendations", detail: "Done · personal Adult shelves rank by private signals, then apply creator and provider round-robin guards; videos, photos, and picks each have a full-width discovery rail.", done: true },
  { id: "watch-room-cross-device", title: "Watch Room cross-device relay", detail: "Temporary TURN credentials and relay-only mode are implemented. Candidate diagnostics now distinguish direct from TURN paths. A real TURN service and two devices on separate networks are still required to prove relay connectivity.", done: false, status: "blocked" },
  { id: "movie-private-tag-shelves", title: "Movie and private tag shelves", detail: "Movies have source, genre, and file-type rails; private shelves retain favorites, tags, history, and rating-aware sorting locally.", done: true },
  { id: "sprint-01", title: "Alert rules", detail: "Per-service alert switches and the notification activity center are active locally.", done: true },
  { id: "sprint-02", title: "Preference coverage", detail: "Shipped preferences have concrete local controls, with status copy explaining their effects.", done: true },
  { id: "sprint-03", title: "Ratings streaks", detail: "Done · choose a local 3, 5, or 10-title weekly goal on Home; distinct ratings drive a local streak counter and transparent rewards.", done: true },
  { id: "sprint-04", title: "Video rating import/export", detail: "Include local video ratings in backup and catalog export recovery.", done: true },
  { id: "sprint-05", title: "Photo rating queue", detail: "Make unrated-photo review resumable across sessions.", done: true },
  { id: "sprint-06", title: "Continue recovery", detail: "Resume marks are durable, throttled away from the video frame loop, and recovered by path when a permitted source reconnects.", done: true },
  { id: "sprint-07", title: "History timeline", detail: "Limitless activity history deduplicates start bursts while retaining provider, progress, and Watch Room recovery context.", done: true },
  { id: "sprint-08", title: "X topic desk", detail: "Add curated public topic views alongside saved X profiles.", done: true },
  { id: "sprint-09", title: "X read tracking", detail: "Public profile/topic views persist their local last-loaded position and show timeout, retry, and official-view diagnostics.", done: true },
  { id: "sprint-10", title: "Twitch discovery", detail: "Verify recommended public channels and separate discovery from follows.", done: true },
  { id: "sprint-11", title: "YouTube discovery", detail: "Build a separate creator discovery shelf with follow actions.", done: true },
  { id: "sprint-12", title: "Channel recency", detail: "Show channel freshness and focused refresh results.", done: true },
  { id: "sprint-13", title: "Remote dedupe", detail: "Suppress duplicate remote cards while retaining the newest valid metadata.", done: true },
  { id: "sprint-14", title: "Artwork retry budget", detail: "Local frame artwork has a bounded three-attempt retry budget, source rescan recovery, and per-card failure diagnostics.", done: true },
  { id: "sprint-15", title: "File type views", detail: "File-type rails now extend from Games into Movies, built from the cached catalog without rescanning sources.", done: true },
  { id: "sprint-16", title: "Tag review queue", detail: "Smart name/date/type and vision tags remain explicit, reviewable local labels before you rely on them for browsing.", done: true },
  { id: "sprint-17", title: "Fast filters", detail: "Deferred search indexing, progressive grids, source-scoped selectors, and cached metadata keep large catalog filters off the first paint.", done: true },
  { id: "sprint-18", title: "Offline resilience", detail: "Cached source health, unavailable-card hiding, recovery views, and source diagnostics distinguish a stale cache from an unavailable file.", done: true },
  { id: "sprint-19", title: "Watch room device matrix", detail: "The local guest-window fallback and isolated desktop/mobile browser sessions are covered; direct WebRTC, chat, playback requests, seek, resync after reload, local-file consent/match, queue add/remove, leave, and mobile layout pass. In the isolated check, host-to-guest play and pause arrived in roughly 70 ms. Physical home-network devices and additional browser engines remain unverified.", done: false, status: "in-progress" },
  { id: "sprint-20", title: "Accessibility audit", detail: "Shared controls use visible focus states, accessible labels, responsive targets, contrast tokens, and the persisted reduced-motion preference.", done: true },
  { id: "metadata-provenance", title: "Metadata provenance and locks", detail: "Adopt the open-library pattern: preserve manual tags, record the source of enrichment, and never let a provider overwrite a locked user choice.", done: true },
  { id: "media-inspection", title: "Companion media inspection", detail: "Use the local companion for optional ffprobe/embedded-tag extraction in bounded batches, with a preview before tags are saved.", done: true },
  { id: "vision-tagging", title: "Optional local vision tagging", detail: "Evaluate an on-device open model for photo/video scene suggestions, keeping media bytes local and requiring review before labels are applied.", done: true },
  { id: "photo-model-quality", title: "Open-source photo tagging quality", detail: "On-device vision suggestions are cached by stable file fingerprint and remain review-only as vision-* tags before joining shared taxonomy.", done: true },
  { id: "companion-cache-workers", title: "Companion cache workers", detail: "Bounded Companion folder-delta, metadata, and thumbnail-hint workers expose their file/time budget and leave the first screen responsive.", done: true },
  { id: "watch-room-local-queue", title: "Watch Room local queue handoff", detail: "Guests now match approved local files by name, size, and modified time without sending file bytes; the shared handoff queue and room controls synchronize on every device. Catalog room playback is recorded in history.", done: true },
  { id: "photo-super-resolution", title: "Local photo upscaler beta", detail: "A user-initiated model download is checksum-verified, originals remain untouched, and cache health is reported before any export capability is enabled.", done: true },
  { id: "cross-source-taste-map", title: "Cross-source taste map", detail: "Stars, creator ratings, liked tags, and shared provider topics now guide cross-source shelves while filename-only terms stay weak.", done: true },
  { id: "companion-delta-apply", title: "Companion delta application", detail: "New Companion folder-change hints now debounce into bounded refreshes of matching, already-approved browser folders—no reconnect or broad rescan required.", done: true },
  { id: "local-share-compatibility", title: "Local share compatibility matrix", detail: "The local-share panel now reports exactly how many connected guests matched the staged fingerprint before the host plays it.", done: true },
  { id: "upscaler-model-install", title: "Verified upscaler model install", detail: "A user-initiated HTTPS download requires a publisher SHA-256, stores only a verified browser-cache artifact with a version record, and offers one-click removal. Runtime/export remain disabled until compatible execution is proven.", done: true },
  { id: "stats-source-remediation", title: "Stats-driven source remediation", detail: "Stats now offers safe tag and source review queues plus an exportable remediation plan. It never renames, reconnects, or removes files automatically.", done: true },
  { id: "youtube-deep-pagination", title: "YouTube deep pagination", detail: "Done · focused creator pulls use a bounded 100,000-item public catalog ceiling, duplicate suppression, and a short server cache to avoid repeated provider work; routine and bulk windows remain smaller.", done: true },
  { id: "taste-signal-audit", title: "Taste-signal audit", detail: "Stats now separates topic coverage, multi-topic depth, cross-source bridges, and operational-label volume so ranking inputs can be inspected before their weight changes.", done: true },
  { id: "tag-noise-budget", title: "Tag noise budget", detail: "Date, provider, format, source, creator, and keyword labels remain searchable/exportable but are excluded from taste scoring.", done: true },
  { id: "creator-coverage-repair", title: "Creator coverage repair", detail: "Done · Settings repairs missing YouTube/Twitch creator names in bounded 48-card batches only from exact cached channel/source IDs, retains them across shallow refreshes, preserves locked tags, and visibly leaves conflicting matches for review.", done: true },
  { id: "metadata-tail-coverage", title: "Metadata tail coverage", detail: "Done · cached metadata enrichment now runs in bounded 48-title batches, reports tagged/waiting/locked coverage by source, preserves manual locks, and makes no provider request.", done: true },
  { id: "recommendation-diversity", title: "Recommendation diversity guardrails", detail: "Done · Home and provider discovery use deduplicated creator and provider round-robin selection, preserving highly rated favorites while preventing one creator or source from occupying a rail.", done: true },
  { id: "activity-journal", title: "Independent activity journal", detail: "Keep History, Continue marks, and local viewing counts in an IndexedDB activity record separate from broad preference storage.", done: true },
  { id: "shelf-explanations", title: "Explainable recommendation shelves", detail: "Done · recommendation rails now state their plain-language reason—ratings, saved creators, freshness, progress, or follow state—without exposing transport tags.", done: true },
  { id: "memory-pressure-observer", title: "Memory-pressure observer", detail: "Done · local Diagnostics reports mounted-card count, decoded artwork cache entries, active/queued decode work, hit/miss/eviction counts, and frame pressure so large shelves have an observable cause.", done: true },
  { id: "warp-01", title: "First-shelf trace", detail: "Done · local Diagnostics records launch-to-first-mounted-shelf time, title, and visible-card count. Deeper cache/index and thumbnail splits remain separate work.", done: true },
  { id: "warp-02", title: "Route-level code splitting", detail: "Done · Hub workspaces plus Adult controls, the video preview/player, and the local guide load on demand. The opening Home route no longer downloads those screens before it is usable.", done: true },
  { id: "warp-03", title: "Provider delta rendering", detail: "Done · routine provider refreshes keep unchanged cards at their original indexes and preserve their object identity; changed/new rows alone reach shelves, while shallow responses retain on-demand comments and verified creator names.", done: true },
  { id: "warp-04", title: "Thumbnail decode governor", detail: "Done · visible and near-view artwork uses bounded workers, pauses during input or hidden-tab time, and retains a small queue for responsive recovery.", done: true },
  { id: "warp-05", title: "Search worker index", detail: "Done · full-text tokenization runs in a dedicated worker, while the search box shows an honest warming state until its local index is ready.", done: true },
  { id: "warp-06", title: "Photo metadata stream", detail: "Done · local photo dimensions and saved dates stream in eight-item browser chunks, yield between batches, persist each result, and show completed/remaining work with a rolling estimate.", done: true },
  { id: "warp-07", title: "Warm route cache", detail: "Done · one adjacent Hub desk is warmed only after a paint frame and browser idle time; it yields to active input, hidden tabs, Save-Data, slow networks, and low-memory devices.", done: true },
  { id: "warp-08", title: "Virtual rail windows", detail: "Done · long horizontal shelves mount only a measured card window with spacers, while arrows, Home/End, and focus bridges keep keyboard travel continuous across unmounted cards.", done: true },
  { id: "warp-09", title: "Visible-card priorities", detail: "Done · a short foreground lease now protects ratings, playback, card opens, and visible artwork; deferred indexing, discovery, Adult ranking, facets, and speculative images resume only after the interaction window clears.", done: true },
  { id: "warp-10", title: "Idle tag batching", detail: "Done · each tag edit first writes a recoverable per-title journal, then coalesces the broad preference snapshot outside the input frame.", done: true },
  { id: "warp-11", title: "Artwork disk cache audit", detail: "Done · Settings audits Companion disk artwork by source with file sizes, oldest update, session hit/miss counts, and explicit partial-inventory or unavailable states.", done: true },
  { id: "warp-12", title: "Provider request coalescing", detail: "Done · matching in-flight YouTube and Twitch pulls share one provider request across tabs and focused controls.", done: true },
  { id: "warp-13", title: "Backoff-aware provider scheduler", detail: "Done · provider failures use bounded exponential backoff, show the exact retry time, and retain focused refresh as an override.", done: true },
  { id: "warp-14", title: "Twitch archive depth", detail: "Twitch now reserves archive checks in every mixed refresh, retains up to 640 recent VOD rows on routine checks and up to 8,000 on focused pulls, and reports sparse channels directly in the Live desk.", done: true },
  { id: "warp-15", title: "YouTube freshness ledger", detail: "Done · each provider channel records its last successful check, newest published item, and response count.", done: true },
  { id: "warp-16", title: "Worker budget adaptation", detail: "Done · thumbnail workers adapt to cores, memory class, visibility, and foreground input pressure.", done: true },
  { id: "warp-17", title: "Companion warmup contract", detail: "Done · warmup is bounded by a visible time/file budget and reports the exact stop reason.", done: true },
  { id: "warp-18", title: "Duplicate selector memoization", detail: "Done · source and provider selectors share a per-state memo across Home, Stats, and Search paths.", done: true },
  { id: "warp-19", title: "Feed image expiry repair", detail: "Done · a failed provider image schedules a one-creator refresh while healthy sibling cards remain cached.", done: true },
  { id: "warp-20", title: "Low-bandwidth artwork mode", detail: "Done · settings can defer provider artwork and retain text-first, fully actionable cards.", done: true },
  { id: "warp-21", title: "Catalog hydration checkpoints", detail: "Done · local scans append each bounded batch to the catalog cache; the next launch hydrates that checkpoint before any optional folder rescan.", done: true },
  { id: "warp-22", title: "History append path", detail: "History, Continue marks, and view counts persist through the independent IndexedDB activity record; evicted provider cards retain a recoverable saved-link entry.", done: true },
  { id: "warp-23", title: "Rating feedback latency", detail: "Done · star input updates locally, coalesces persistence outside the input frame, and reports queue/disk timing in Diagnostics.", done: true },
  { id: "warp-24", title: "Remote catalog partitioning", detail: "Done · refreshes merge by provider channel; partial Twitch archive responses retain earlier VODs while fresh rows update in place.", done: true },
  { id: "warp-25", title: "Tag taxonomy compaction", detail: "Done · provider enrichment removes legacy wrappers, whitespace variants, duplicates, and transport-only labels when tags enter the catalog.", done: true },
  { id: "warp-26", title: "Render budget dashboard", detail: "Done · local Diagnostics reports mounted cards, artwork cache entries, frame pressure, and rating persistence timing.", done: true },
  { id: "warp-27", title: "Near-view prefetch", detail: "Done · local artwork is requested at a small intersection margin, with bounded workers and no full-library thumbnail sweep.", done: true },
  { id: "warp-28", title: "Fast resume lookup", detail: "Done · recovery resolves History/Continue entries through a stable provider URL or local path index before falling back to a saved-link card.", done: true },
  { id: "warp-29", title: "Vision model benchmark", detail: "Compare CLIP with the optional SigLIP semantic model on a broader local sample; the result records preparation plus inference for a quality-focused default.", done: true },
  { id: "warp-30", title: "Performance regression gate", detail: "Done · the repeatable large-library browser benchmark records startup, scroll settle, mounted cards, overflow, and console errors.", done: true },
];

const ROADMAP_EXPANSION: Mission[] = [
  ...[
    ["adult-thumbnail-coverage", "Adult preview & playback coverage", "Done · Redgifs now uses its durable official iframe in both preview and full player, while direct-media providers bind their known media URL instead of opening an empty player. Existing poster fallback scoring remains in place across Reddit, Redgifs, RedTube, and other adult providers."],
    ["print-file-viewer", "3D print file viewer", "Interactive three.js orbit viewer + transform editor for STL, OBJ, GLB/GLTF, and 3MF — lighting/camera presets, wireframe, grid, explode, fullscreen; sample models plus user-added IndexedDB bytes; dispose on close."],
    ["twitch-view-modes", "Twitch viewing modes", "Done · the official Twitch player switches between theater and side-details views. Offline channel placeholders stay out of playable shelves, while useful signals rank saved VODs."],
    ["games-shortcut-curation", "Games shortcut curation", "Done · Games keeps approved launchers only, enriches companion/folder icons, and stores artwork separately in the local game-icon cache so unrelated desktop helpers cannot enter recommendations."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: ["print-file-viewer", "adult-thumbnail-coverage", "twitch-view-modes", "games-shortcut-curation"].includes(id) })),
  ...[
    ["history-01", "History integrity journal", "Add monotonic event IDs and an append-only local audit record."],
    ["history-02", "History replay recovery", "Reconcile IndexedDB activity events after an interrupted browser session."],
    ["history-03", "History source badges", "Show whether each activity came from a direct open, progress, or Watch Room."],
    ["history-04", "History retention controls", "Offer local retention windows and export before a user removes older events."],
    ["history-05", "History duplicate guard", "Collapse equivalent play bursts without hiding a separate viewing session."],
    ["history-06", "History timezone normalization", "Store epoch time and display a clear local-time conversion in every timeline."],
    ["history-07", "History orphan recovery", "Keep a saved provider URL or local fingerprint when the source card is evicted."],
    ["history-08", "History privacy review", "Expose what is stored locally and keep private/adult history behind the existing gate."],
    ["history-09", "History filter diagnostics", "Explain empty history results, source filters, and recovery-card availability."],
    ["history-10", "History restore benchmark", "Done · the repeatable isolated-history benchmark restores a 2,400-event IndexedDB snapshot plus append-only journal without duplicate events or lost source provenance."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: true })),
  ...[
    ["continue-01", "Continue stable identity", "Key resume records by provider URL and local fingerprint before transient card IDs."],
    ["continue-02", "Continue duration validation", "Reject impossible duration and position values before they enter the resume shelf."],
    ["continue-03", "Continue provider reconciliation", "Refresh a provider card without losing its last trustworthy resume point."],
    ["continue-04", "Continue local handle recovery", "Reconnect an approved local file handle without rewriting watch progress."],
    ["continue-05", "Continue completion threshold", "Remove finished items using a transparent, source-aware completion rule."],
    ["continue-06", "Continue conflict resolution", "Choose the newest credible mark when two tabs report different positions."],
    ["continue-07", "Continue shelf explanation", "Show why an item is resumable and the timestamp of its last durable mark."],
    ["continue-08", "Continue offline handoff", "Queue a local mark safely when storage is unavailable, then replay once."],
    ["continue-09", "Continue bulk repair", "Offer a preview-only scan for stale or invalid resume records."],
    ["continue-10", "Continue recovery test", "Done · a repeatable browser check validates local, YouTube, Twitch, and Watch Room recovery cards, including provider records no longer in the active catalog."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: true })),
  ...[
    ["follow-manager-01", "Bounded creator directory", "Done · YouTube and Twitch follows now use a searchable, sorted creator directory that mounts 48 channel bubbles at a time instead of expanding a thousand-channel desk."],
    ["follow-manager-02", "Creator bubble actions", "Done · each creator has a distinct provider-marked bubble and a focused control panel for creator favorite, 1–5 rating, health context, and safe manual unfollow."],
    ["follow-manager-03", "Follow collection actions", "Done · optional creator collections travel in the library pack. Bulk removal previews every affected creator and retains locally saved or watched catalog rows."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: ["follow-manager-01", "follow-manager-02", "follow-manager-03"].includes(id) })),
  ...[
    ["youtube-upgrade-01", "Feed delta cursor", "Done · routine checks persist the newest Atom upload identity, return only feed entries ahead of it, and fall back to a bounded recent window when YouTube has aged the cursor out."],
    ["youtube-upgrade-02", "Channel cache budget", "Done · channel health now reports response size, cache age, and session hit rate. The server retains only a short feed or ≤2,000-item focused catalog cache, while routine refreshes read the feed slice only."],
    ["youtube-upgrade-03", "First-click trace", "Done · YouTube Pull health and Settings diagnostics show local timing from opening YouTube to mounted text-first latest-upload cards, with selector work, artwork, and overlapping provider work separated. No viewing identities are recorded."],
    ["youtube-upgrade-04", "Rail windowing", "Done · long YouTube rails mount a measured card window with accessible deferred-card counts, keyboard arrows/Home/End, and focus bridges. The 80,000-video desktop/mobile check passes."],
    ["youtube-upgrade-05", "Artwork priority", "Done · on-screen cards take the high-priority image lane, near-view cards use a cancellable low-priority lane, and non-primary offscreen rails defer mounting. Source changes invalidate queued speculative images; titles and actions remain usable while artwork loads or fails."],
    ["youtube-upgrade-06", "Creator ambiguity review", "Flag channels whose handle, display name, and channel ID disagree; show a review choice rather than silently merging one creator into another."],
    ["youtube-upgrade-07", "Published-date repair", "Done · exact RSS dates win over provider dates and survive shallow/live refreshes, compact cards and disk recovery. Unknown dates stay last without freshness boosts; legacy dates are labeled Saved date. Imports and live observations never invent publication dates."],
    ["youtube-upgrade-08", "Live/VOD split", "Done · saved-format controls separate uploads, Shorts and completed streams; current live and upcoming events have their own rows. Cooperative cached groups share cards. Only a successful live check ends a stream, and completed links remain saved with local feedback."],
    ["youtube-upgrade-09", "Deep-pull checkpoint", "Done · each creator keeps its catalog continuation and last-check state across reloads. Bounded page/item budgets resume older uploads, detect terminal pages, and stop when continuation data cannot advance."],
    ["youtube-upgrade-10", "Provider error taxonomy", "Classify YouTube failures as unavailable, rate-limited, malformed, or network/offline; show the next retry time and keep cached cards untouched."],
    ["youtube-upgrade-11", "Subscription import staging", "Validate, deduplicate, and preview a pasted subscription list before network work begins; report accepted, duplicate, and unresolved handles separately."],
    ["youtube-upgrade-12", "Channel health matrix", "Show each saved channel’s last successful check, newest known upload, response count, cache age, and retry state in one compact diagnostics view."],
    ["youtube-upgrade-13", "Recommendation diversity", "Cap repeated creators and topics across adjacent YouTube rails while preserving highly rated favorites and exposing the diversity rule in shelf copy."],
    ["youtube-upgrade-14", "Shelf explanations", "Attach short, human-readable reasons to recommendation rails—rating, creator affinity, freshness, or topic—without exposing internal transport tags."],
    ["youtube-upgrade-15", "Background refresh budget", "Reserve a small bounded concurrency and payload budget for automatic YouTube refreshes so provider work cannot delay interactions or Twitch checks."],
    ["youtube-upgrade-16", "Search source filter", "Use the existing search index to restrict results to YouTube before rendering suggestion cards, including creator and provider URL matches."],
    ["youtube-upgrade-17", "Offline cache audit", "Report cached channel and artwork coverage, oldest cache age, and recoverable saved links; never call a stale cache a successful provider refresh."],
    ["youtube-upgrade-18", "Mobile rail gesture", "Validate horizontal rail scrolling, focus visibility, and card action targets on a phone viewport without accidental page scroll or gesture conflicts."],
    ["youtube-upgrade-19", "Refresh result diff", "Apply and display only changed channel/video rows after a refresh, preserving card identity, scroll position, ratings, and healthy artwork."],
    ["youtube-upgrade-20", "YouTube regression suite", "Done · actual-provider-path fixtures cover feeds, deep pages, cursors, duplicates, metadata recovery and live transitions. The 80,000-entry desktop/mobile gate checks dates, formats, previews, focus and input budgets on dev and production; a million-entry benchmark verifies cooperative shared indexes. Real-provider soaking remains separate."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: ["youtube-upgrade-01", "youtube-upgrade-02", "youtube-upgrade-03", "youtube-upgrade-04", "youtube-upgrade-05", "youtube-upgrade-07", "youtube-upgrade-08", "youtube-upgrade-09", "youtube-upgrade-10", "youtube-upgrade-11", "youtube-upgrade-12", "youtube-upgrade-13", "youtube-upgrade-14", "youtube-upgrade-15", "youtube-upgrade-16", "youtube-upgrade-19", "youtube-upgrade-20"].includes(id) })),
  ...[
    ["twitch-upgrade-01", "Archive page checkpoint", "Done · reloads and library packs retain archive/clip positions and the last accepted VOD. Fresh mirrors beat stale disk lists; unreadable or non-advancing pages hold their safe checkpoint."],
    ["twitch-upgrade-02", "Focused pull queue", "Verified · the focused queue holds at most eight explicit creators, runs one selected 500/2,000-VOD and 0/50/250/500-clip batch per creator, and gives shallow live checks a turn before each batch. Duplicate jobs, paused queue cancellation, in-flight stop and global cancellation are covered. Waiting work lives outside the library root and releases on exit; accepted rows and saved positions remain durable."],
    ["twitch-upgrade-03", "VOD cursor diagnostics", "Done · Archive coverage shows accepted pages, distinct VODs, repeats, saved position, last VOD and stop reason, including first-page failures. Creator diagnostics load 30 at a time with Show 100 more controls."],
    ["twitch-upgrade-04", "Clip separation audit", "Identify clip-length media independently from full VODs using duration and provider shape; correct mislabeled cards without deleting user saves."],
    ["twitch-upgrade-05", "Live-state clock", "Record the exact successful live-state observation time, expire stale live labels, and distinguish a live estimate from a confirmed current stream."],
    ["twitch-upgrade-06", "Provider integrity fallback", "When Twitch requires an integrity challenge for deeper pages, retain accepted archive data, report the limit plainly, and avoid retry loops that waste provider budget."],
    ["twitch-upgrade-07", "Archive coverage report", "Show cached VOD count, oldest/newest known dates, sparse creators, completed historical pulls, and public-provider limits for every followed channel."],
    ["twitch-upgrade-08", "Channel retry budget", "Verified · archive and live failure budgets persist independently per creator, back off 15 seconds to five minutes, and survive reload/backup import. Partial page/clip failures also receive cooldowns; healthy live checks cannot erase archive failures. Background rotation skips only the cooling scope. Explicit creator retries remain available and reset only the successful scope."],
    ["twitch-upgrade-09", "VOD merge proof", "Done · provider and real-store regression tests preserve accepted pages, older VODs, favorites, ratings, history, progress and valid duration/artwork metadata through partial, empty and failed pulls."],
    ["twitch-upgrade-10", "Creator archive controls", "Verified · creator coverage shows the last accepted depth, result, exact saved position, actionable archive/live failures and recommended retry time. Choose VOD/clip budgets, queue up to eight sparse eligible creators, retry an individual creator, open its public channel, remove waiting jobs or stop after the current batch. Budgets are captured per job. Desktop/390px mobile controls and creator paging are verified."],
    ["twitch-upgrade-11", "Stream title delta", "Update a live card’s stream title and category only when the provider reports a newer observation, preventing stale title flashes."],
    ["twitch-upgrade-12", "Viewer freshness", "Show viewer counts with an observation timestamp and remove them from ranking once they become stale."],
    ["twitch-upgrade-13", "Local cache compaction", "Compact duplicate VOD rows by stable provider video ID while retaining the newest metadata and all local feedback references."],
    ["twitch-upgrade-14", "Guest-ready embeds", "Verify Twitch Watch Room embeds receive the correct parent host, preserve the selected VOD, and surface a direct-link fallback when the player is blocked."],
    ["twitch-upgrade-15", "VOD duration repair", "Recover missing or impossible duration values from accepted provider metadata and never infer a full VOD from a short clip duration."],
    ["twitch-upgrade-16", "Historical search filter", "Done · saved archive search filters title, exact creator, inclusive dates and VOD/clip type. Cancellable scans yield between slices and retain 24 results plus one lookahead; keyset pages avoid whole-catalog sorting and preserve preview return focus."],
    ["twitch-upgrade-17", "Mobile live rail", "Done · fresh live streams lead the first phone viewport; quick creator refresh is collapsible. Rail navigation follows actual scroll position, including within overscan. Coverage adds 100 creators in small painted batches and releases cards when closed. Desktop/390px production checks cover stale-live exclusion, artwork bounds, filters, paging and preview return."],
    ["twitch-upgrade-18", "Provider error taxonomy", "Verified · integrity challenges, public page limits, unavailable creators, unreadable responses, rate limits, network delays and response budgets have bounded diagnoses and recovery actions. First-page failures and partial results preserve saved videos and positions. Global live-query errors are rejected before cached streams can be retired. Deterministic actual API/store regressions and desktop/mobile creator controls pass."],
    ["twitch-upgrade-19", "Twitch device regression", "Exercise live, VOD, clip, blocked-embed, and Watch Room handoff behavior across supported browser/device paths before release."],
    ["twitch-upgrade-20", "Twitch archive benchmark", "Done · the reproducible 384 MiB Node benchmark measures 20-page cursor walks, additive/repeat merges, serialized growth and bounded search on 100k/million-entry compact archives. The 30k Twitch desktop/phone gate measures browser storage growth, live first paint, scroll settle, input paint and mounted cards. Network throughput, transcripts, physical devices and long-session heap soak remain separate checks; default pull depth is unchanged."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: ["twitch-upgrade-01", "twitch-upgrade-03", "twitch-upgrade-09", "twitch-upgrade-16", "twitch-upgrade-17", "twitch-upgrade-20", "twitch-upgrade-02", "twitch-upgrade-04", "twitch-upgrade-05", "twitch-upgrade-06", "twitch-upgrade-07", "twitch-upgrade-08", "twitch-upgrade-10", "twitch-upgrade-11", "twitch-upgrade-12", "twitch-upgrade-13", "twitch-upgrade-14", "twitch-upgrade-15", "twitch-upgrade-18"].includes(id) })),
  ...[
    ["speed-01", "First interaction budget", "Verified · local diagnostics use navigation time origin and separate first contentful paint, Home controls, preferences, provider/local disk reads, cooperative preparation, catalog readiness, first mounted shelf and its artwork. YouTube selector work and provider overlap retain their own trace. Startup filtering, indexing, merging and resume linking yield after 512 records or about four milliseconds, and rebase around foreground edits. Large saved-library desktop/phone launches, early navigation, synthetic million-entry preparation, listener cleanup and production rendering checked. Catalog restoration still takes seconds; physical-device and memory soak budgets remain open."],
    ["speed-02", "Provider payload budget", "Verified · YouTube, Twitch and Adult metadata reads count decompressed stream bytes, reject incomplete pages above 8 MiB and cancel stalled bodies after 15 seconds. Shared lanes retain bounded waiting work and release cancelled transfers. Warm YouTube/Twitch caches retain at most 250 rows per result, 1 MiB per entry and 4 MiB per provider; larger focused results are delivered whole without a second cached graph. Adult warm responses retain at most 12 MiB. Routine refresh, live, archive and import workers retain explicit concurrency and retry budgets; deep pull targets, pacing settings and manual force retries stay available. Settings diagnostics disclose these safeguards and export numeric limits. Oversize, cancellation, cooldown, accepted-page recovery, focused history, desktop/phone and production checks pass. Real-provider and long-session memory soaking remain open."],
    ["speed-03", "Render invalidation audit", "Verified · card reactions subscribe to their own title, including shared preview ratings; unmounted cards release their listeners. Unchanged search grids skip parent updates and retain one published order across watch, like and rating changes. Refresh ranking applies the latest feedback on demand; query, source, hidden, unavailable, privacy and tag changes invalidate old results immediately. Transient work cancels during viewers and on navigation/idle release, and covered grids stop automatic paging. Sidebar counts and covered shelves reuse playback snapshots; comments, clocks and live expiry update only their own surfaces. A million-row result survives 10,000 feedback changes without a scan or rerank. Populated desktop/phone search pagination, preview return, keyboard focus and provider navigation checked. Long-session and physical-device memory soak remain separate milestones."],
    ["speed-04", "Visible artwork priority", "Prioritize visible and near-view images, pause offscreen decoding during input, and resume through a bounded queue once the main thread is idle."],
    ["speed-05", "Input latency monitor", "Measure interaction-to-paint time for rating, search, queue, play/pause, and source navigation on a large local and provider catalog."],
    ["speed-06", "Idle enrichment queue", "Verified · cached repair, metadata-tail batches and smart tags share one cancelable queue. Input, scrolling, hidden tabs and viewers interrupt unfinished work. Sparse immutable tag updates share unchanged entries instead of enumerating or copying full ledgers; manual edits and provider pulls use the same indexed records. Completed rows save in 64-record transactions and recover in 256-row pages, preserving manual tags and categories. Pause/resume, million-entry no-copy tests, desktop/mobile controls, saved recovery and production rendering checked. Full exports, broad preference writes and memory soak remain separate budgets."],
    ["speed-07", "Route warmup policy", "Done · one likely Hub module warms after paint and idle time, with Home recommendations given priority. Pending warmup is canceled on navigation or a hidden tab; Save-Data, slow networks, low memory, and active input defer it."],
    ["speed-08", "Cache hit dashboard", "Verified · opt-in Settings snapshots report immutable catalog-selector reuse, bounded artwork memory, thumbnail disk recall, viewer-detail retention, and saved YouTube/Twitch provider samples. Ages and payload estimates are labeled by observation scope; missing sizes remain unknown. No media, keys, channel names or URLs enter the export. Captures run on demand instead of rerendering Settings every second; provider metadata survives follow and library-pack recovery. Desktop/phone 80,000-entry and production checks pass."],
    ["speed-09", "Mobile memory budget", "Verified · a populated 172,070-entry library with 99,999 YouTube videos runs phone navigation, bounded search, paging, preview, ratings and return under Low memory. The grid starts at 24 titles, retains a 36-card mount ceiling and mounted 12 cards after paging to 48; covered grids hold paging, artwork defers during input and focus returns to the opened title. The compact editor and mobile drawer dismiss correctly without horizontal overflow. Tag inference caps text, words and its 512-card cache; sparse repairs yield to input and wait during active searches/viewers. A 384 MiB Node benchmark covers 100k/million-entry metadata and bounded viewport windows. Desktop/phone development and production checks pass. Capability hints do not emulate CPU speed; physical-device and long-session browser heap soak remain open."],
    ["speed-10", "Performance release gate", "Verified · npm run check:performance creates isolated desktop/phone profiles with 80,000 compact entries, paused pulling and Text-first artwork. It gates Home readiness, source navigation, scroll settle, input-to-paint latency, mounted-card count, overflow, console errors, scorecard refresh and private export. Missing measurements fail. Synthetic media and offline Companion responses are explicit fixtures; real-provider throughput, long-session memory and physical devices remain separate checks. Development and production runs pass."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: ["speed-01", "speed-02", "speed-03", "speed-04", "speed-05", "speed-06", "speed-07", "speed-08", "speed-09", "speed-10"].includes(id) })),
  ...[
    ["smooth-01", "Navigation transition budget", "Verified · source controls and a destination loading shell paint before catalog subscribers run. Rapid switches retain one latest destination; Home and tools can interrupt it immediately. YouTube filtering, stable date sorting, demo exclusion and creator indexing prepare in cancelable slices targeting four milliseconds and reuse exact immutable caches. Hidden preparation sleeps; viewers and unmount cancel it. Desktop/mobile navigation, preview/player return and million-entry cancellation tests checked. Broader render and slow-device audits remain separate."],
    ["smooth-02", "Long-list virtualization proof", "Verified · rails resolve only their visible card references, including End jumps; rendered card widths and gaps drive responsive windows. Grids retain bounded measured rows and mounted cards. Arrow/Home/End and bidirectional Tab entry reach unmounted titles; accessible item positions retain catalog totals. Preview return restores a stable grid's visible anchor and keyboard focus. Desktop/phone checks on a 100,000-video YouTube archive, million-entry window tests, 10,000-visit geometry benchmarks and production rendering checked. Physical-device memory soak and browser maximum scroll dimensions remain separate limits."],
    ["smooth-03", "Image decode pressure gauge", "Expose decoded-image count, pending decode work, and cache evictions in Diagnostics so memory pressure has an observable cause and recovery."],
    ["smooth-04", "Background-tab throttle", "Reduce polling, thumbnail work, and timer-driven reranks while the tab is hidden, then perform one bounded reconciliation when it returns."],
    ["smooth-05", "Search keystroke budget", "Done · suggestions debounce and token matching runs in a worker. Search filtering, ranking, sorting, and card resolution yield in cancelable slices outside render. Loading stays visible until matching and ranking both finish; changing input discards stale results. A compact query control opens an editor with Ctrl/Cmd+K or /. The editor collapses on submit, outside pointer, focus exit, Escape, selection, navigation, idle release or viewer open; it releases its catalog inputs and cancels pending drafts while closed. Active queries remain available to reopen or clear. Explicit tool-page searches open a visible result desk; provider and private tag scopes stay intact."],
    ["smooth-06", "Local persistence coalescing", "Batch preference and tag writes away from click handlers while journaling the latest operation immediately so a crash cannot lose a user action."],
    ["smooth-07", "Provider-card structural sharing", "Reuse unchanged provider card objects and artwork references across refreshes to prevent image reloads, animation resets, and avoidable React reconciliation."],
    ["smooth-08", "Cold-start source ordering", "Hydrate the saved local catalog and active source before optional folder verification, remote refresh, Companion warmup, or recommendation ranking begins."],
    ["smooth-09", "Timer consolidation", "Verified · recurring pulls, presence, clocks, discovery, diagnostics, photo status/slideshows and Watch Room updates share one lifecycle scheduler. Hidden/idle cosmetic work sleeps; visible idle YouTube archives and background room synchronization retain their policies. Slow requests never overlap or replay missed ticks. One idle deadline replaces activity polling; transport retries and input debounces keep their own deadlines. Desktop/mobile controls and production rendering checked."],
    ["smooth-10", "Slow-device profile", "Verified · Adaptive selects smaller budgets for limited device capabilities or Save Data; Low memory can be selected on any device. Artwork retains at most 72 records / 2 MiB, thumbnail work uses one worker, remote images use four slots, new photo scans use two workers, grids load 24 titles with a 36-card mount ceiling, and rails omit extra overscan. Individual settings are retained. Budget changes release cached blob URLs and wake held requests without restarting running network work. Repeated catalog pages and unchanged resume ledgers avoid full copies; large change batches stage only a small scratch map. A reproducible 384 MiB Node benchmark with two-core/two-GiB hints checks 100k/million-entry metadata and viewport windows; populated desktop/phone settings, search and preview paths checked. Capability hints do not emulate CPU speed, and physical-device/browser memory soak remains open."],
    ["smooth-11", "Accessibility performance audit", "Verified · deferred shelves mount immediately on keyboard focus and canceled release timers cannot unmount a focused card. Virtual grid and rail Home/End jumps stay bounded and preserve logical positions; page additions have a polite count announcement and keyboard instructions. One modal covers loading, preview and playback, with immediate cancel focus, contained Tab navigation, accessible titles, nested menu Escape handling and return to the opened card. Player shortcuts yield to controls and provider playback keys; local controls stay visible during keyboard focus. A populated saved catalog and 390px phone YouTube grid/preview/player handoffs pass, including artwork still deferred. Development and production desktop/phone render checks pass. Native local playback automation and physical screen-reader/device testing remain limited; long-session memory soak is tracked separately."],
    ["smooth-12", "Smoothness scorecard", "Verified · Settings diagnoses Home readiness, latest input paint, recent frame pressure, mounted cards and bounded cache use, with a practical next step that respects paused pulling. Missing/stale samples are shown explicitly. Opt-in frame monitoring follows browsing, stores at most 240 durations, ignores hidden time and releases its loop when shelves unmount or diagnostics turn off. Text-first restores at startup and skips image slots, decoding, Companion recall and timeout-driven creator repair. Automatic artwork repair honors Pause pulls. Tests plus populated desktop/phone and production checks pass."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: ["smooth-01", "smooth-02", "smooth-03", "smooth-04", "smooth-05", "smooth-06", "smooth-07", "smooth-08", "smooth-09", "smooth-10", "smooth-11", "smooth-12"].includes(id) })),
  { id: "recent-remote-cache-pages", title: "Paged remote catalog recovery", detail: "Done · saved provider cards restore in bounded 512-row IndexedDB pages instead of one cursor callback per card. Legacy snapshot rows remain readable; an 80,000-video desktop/mobile restore passes.", done: true },
  { id: "recent-tag-enrichment", title: "Low-allocation tag recovery", detail: "Verified · YouTube titles, substantive descriptions, hashtags, entities and chapters add keyword tags and explainable topic connections. Promotional lines, links and catalog placeholders are excluded. Text/token/tag and 512-card inference-cache limits keep work bounded. Provider-authored keywords upgrade in idle batches, preserve manual/unknown tags and locks, and save a durable repair version so reloads skip completed work. New pulls use the same inference. Search and viewers hold optional ledger updates; Settings offers Improve YouTube tags and queue controls.", done: true },
  { id: "recent-resume-reconcile", title: "Sparse Continue recovery", detail: "Done · empty resume maps skip the catalog walk and watched cards resolve stable ID, provider URL, source URL, and path aliases without per-card Set allocations.", done: true },
  { id: "recent-youtube-sweep", title: "Fair YouTube archive schedule", detail: "Done · hourly background archive sweeps use a small rotating creator budget, recent and live checks have separate clocks, and manual pulls can walk deeper across every eligible creator or playlist. Cursor tests cover reloads and successive next-creator pulls.", done: true },
  { id: "recent-pull-ledger", title: "Cross-site pull outcomes", detail: "Done · active target and returned/new/failure counts appear during pulls; a bounded local result ledger feeds pull-success statistics and failure details in Stats.", done: true },
  { id: "recent-cold-home-readiness", title: "Cold Home readiness proof", detail: "Verified · lightweight Home mounts working destination controls before the saved catalog is ready. Home, whole-library restoration and Landing's first recommendation shelf have separate timings; returning Home does not mount recommendations or artwork. Fresh production navigation and reloads, a 172,070-entry saved development profile, and phone/desktop early navigation checked. The full Landing experience waits for usable saved rows. Large-library disk restore remains a measured delay; these checks do not claim physical-device cold storage or a long memory soak.", done: true },
  { id: "recent-saved-library-hydration", title: "Saved-library hydration integrity", detail: "Done · the first client snapshot now matches the server; saved pull results restore after mount. Populated desktop and phone profiles reload with the result and Mission plan intact and no hydration error.", done: true },
  { id: "recent-provider-soak", title: "Real-provider archive soak", detail: "Exercise large YouTube/Twitch follow lists under provider limits, confirm fair rotation and retry timing, and record catalog growth, memory pressure, and live-check latency without increasing automatic pull budgets.", done: false, status: "planned" },
  { id: "viewer-detail-isolation", title: "Viewer detail isolation", detail: "Comments update only the selected preview/player and persist one current video to disk. Closing comments performs no catalog scan, card copy, or browse notification; late responses from closed viewers are ignored.", done: true },
  { id: "viewer-detail-memory-budget", title: "Viewer detail memory budget", detail: "Detail reads coalesce across preview/player, reuse at most twelve records within a 512 KB estimated budget, and exclude oversized transcripts. Clearing the cache prevents old reads repopulating it; repeat-cycle tests and the Settings memory readout track retained details.", done: true },
  { id: "recent-search-result-budget", title: "Large-library search result budget", detail: "Done · filtering, taste scoring, full-result sorting, and card resolution run outside render in cancelable slices. Search skips covered browse shelves, scopes YouTube/Twitch results before scoring, keeps description/path matches, and counts each top tag once per video. A 100,000-match test and populated desktop/mobile interaction checks pass.", done: true },
];
const ALL_DEFAULT_MISSIONS = [...DEFAULT_MISSIONS, ...ROADMAP_EXPANSION];

export function MissionPlanSection() {
  const [missions, setMissions] = useState<Mission[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("reelcase.mission-plan.v1") ?? "null") as Mission[] | null;
      const revision = Number(localStorage.getItem(MISSION_PLAN_REVISION_KEY) ?? "0");
      return mergeMissionPlan(Array.isArray(saved) ? saved : null, ALL_DEFAULT_MISSIONS, Number.isFinite(revision) ? revision : 0);
    } catch { return ALL_DEFAULT_MISSIONS; }
  });
  const [idea, setIdea] = useState("");
  const [showArchive, setShowArchive] = useState(false);
  const [companionCheck, setCompanionCheck] = useState<{ ready: boolean; desktop: boolean; detail: string } | null>(null);
  useEffect(() => { try { localStorage.setItem("reelcase.mission-plan.v1", JSON.stringify(missions)); localStorage.setItem(MISSION_PLAN_REVISION_KEY, String(MISSION_PLAN_REVISION)); } catch { /* storage unavailable */ } }, [missions]);
  const completed = missions.filter((mission) => missionStatus(mission) === "complete").length;
  const activeMissions = missions.filter((mission) => missionStatus(mission) !== "complete");
  const archivedMissions = missions.filter((mission) => missionStatus(mission) === "complete");
  const setMissionStatus = (id: string, status: MissionStatus) => setMissions((items) => items.map((item) => item.id === id ? { ...item, status, done: status === "complete" } : item));
  const exportMissions = () => downloadCsv([["step", "title", "status", "detail"], ...missions.map((mission, index) => [index + 1, mission.title, missionStatus(mission), mission.detail])], `reelcase-mission-plan-${new Date().toISOString().slice(0, 10)}.csv`);
  return <HubShell eyebrow="Mission plan" icon={<Rocket className="size-4"/>} title="Build a private media home that scales." copy="Realhub is moving toward a fast, local-first media hub: your files load from a durable catalog, your watch room works across your home network, and connected services remain optional and easy to control.">
    <section className="mt-6 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Product mission</p><h2 className="mt-2 font-display text-3xl text-fg">One calm control room for a very large library.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Make a million-file media collection feel immediate: cache its catalog locally, keep original files private, surface useful recommendations, and let trusted people watch together without turning the app into a cloud upload service.</p><div className="mt-5 flex items-end justify-between gap-4"><div><p className="font-display text-2xl text-fg">{completed} of {missions.length} milestones complete</p><p className="mt-1 text-sm text-muted">Every milestone includes implementation, browser verification, and a production build check.</p></div><div className="rounded-full bg-accent/15 px-3 py-1 text-sm text-accent">{missions.length ? Math.round(completed / missions.length * 100) : 0}%</div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-bg/70"><div className="h-full bg-accent transition-all" style={{ width: `${missions.length ? completed / missions.length * 100 : 0}%` }}/></div></section>
    <section className="mt-5"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Active delivery queue</p><p className="mt-1 text-sm text-muted">{activeMissions.length} milestone{activeMissions.length === 1 ? "" : "s"} still need implementation or verification. Each status is saved locally with the plan.</p></div></div><div className="space-y-3">{activeMissions.map((mission, index) => { const status = missionStatus(mission); return <article key={mission.id} className="flex gap-4 rounded-lg bg-elevated p-4 shadow-border"><div className="flex shrink-0 flex-col gap-2"><span className="inline-flex min-h-8 items-center justify-center rounded-sm bg-bg/65 px-2 text-xs font-medium text-muted">{`Step ${index + 1}`}</span>{status === "planned" && <Button size="sm" variant="secondary" aria-label={`Start ${mission.title}`} onClick={() => setMissionStatus(mission.id, "in-progress")}>Start</Button>}{status === "in-progress" && <><Button size="sm" variant="secondary" aria-label={`Mark ${mission.title} complete`} onClick={() => setMissionStatus(mission.id, "complete")}>Done</Button><Button size="sm" variant="ghost" aria-label={`Mark ${mission.title} blocked`} onClick={() => setMissionStatus(mission.id, "blocked")}>Block</Button></>}{status === "blocked" && <Button size="sm" variant="secondary" aria-label={`Resume ${mission.title}`} onClick={() => setMissionStatus(mission.id, "in-progress")}>Resume</Button>}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-medium text-fg">{mission.title}</h2><span className={`rounded-full px-2 py-1 text-xs font-medium ${missionStatusTone[status]}`}>{missionStatusLabel[status]}</span></div><p className="mt-1 text-sm text-muted">{mission.detail}</p><details className="mt-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted"><summary className="cursor-pointer font-medium text-fg">Break this down</summary><ol className="mt-2 list-decimal space-y-1 pl-4">{missionSteps(mission).map((step) => <li key={step}>{step}</li>)}</ol></details></div></article>; })}</div></section>
    <section className="mt-5 rounded-lg border border-border bg-elevated/70 p-4 shadow-border"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Delivery archive</p><p className="mt-1 text-sm text-muted">{archivedMissions.length} completed milestones are retained for reference and export.</p></div><Button size="sm" variant="secondary" onClick={() => setShowArchive((value) => !value)}>{showArchive ? "Hide completed work" : "Show completed work"}</Button></div>{showArchive && <div className="mt-4 space-y-2">{archivedMissions.map((mission) => <article key={mission.id} className="flex gap-3 rounded-sm bg-bg/45 p-3"><Button size="sm" variant="ghost" aria-label={`Restore ${mission.title} to planned work`} onClick={() => setMissionStatus(mission.id, "planned")}>Done</Button><div className="min-w-0"><h2 className="text-sm font-medium text-muted line-through">{mission.title}</h2><p className="mt-1 text-xs text-muted">{mission.detail}</p></div></article>)}</div>}</section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Companion onboarding</p><h2 className="mt-2 font-display text-2xl text-fg">A safe five-minute desktop setup.</h2><ol className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2"><li className="rounded-sm bg-bg/45 p-3"><span className="font-medium text-fg">1. Start Companion</span><br/>Double-click Start-Realhub-Companion.cmd in the main Realhub folder.</li><li className="rounded-sm bg-bg/45 p-3"><span className="font-medium text-fg">2. Confirm Desktop</span><br/>Keep its window open, then run the check below.</li><li className="rounded-sm bg-bg/45 p-3"><span className="font-medium text-fg">3. Load shortcuts</span><br/>Open Games and choose Load approved desktop shortcuts or Steam/Epic roots.</li><li className="rounded-sm bg-bg/45 p-3"><span className="font-medium text-fg">4. Verify first</span><br/>Use a listed shortcut inside an approved root before launching it.</li></ol><div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => void (async () => { try { const data = await companionHealth(true); if (!data?.ok) throw new Error("offline"); setCompanionCheck({ ready: true, desktop: Boolean(data.desktopEnabled), detail: `v${data.version ?? "?"} · ${data.roots ?? 0} roots · badge ${data.trayBadge ?? 0}` }); if ((data.trayBadge ?? 0) > 0) void companionAckJobs(); } catch { setCompanionCheck({ ready: false, desktop: false, detail: "Companion not detected. Start it, leave the window open, then retry." }); } })()}>Check Companion setup</Button><Button variant="secondary" onClick={() => void companionSetAutostart(true).then((r) => setCompanionCheck({ ready: Boolean(r.ok), desktop: companionCheck?.desktop ?? false, detail: r.ok ? "Windows auto-start enabled for Companion." : (r.error || "Auto-start failed.") }))}>Enable Windows auto-start</Button><Button variant="ghost" onClick={() => void companionSetAutostart(false).then((r) => setCompanionCheck({ ready: companionCheck?.ready ?? false, desktop: companionCheck?.desktop ?? false, detail: r.ok ? "Windows auto-start removed." : (r.error || "Could not clear auto-start.") }))}>Disable auto-start</Button></div>{companionCheck && <p className={`mt-3 text-sm ${companionCheck.ready && companionCheck.desktop ? "text-accent" : "text-danger"}`}>{companionCheck.ready ? `Ready · Desktop ${companionCheck.desktop ? "approved" : "not approved"} · ${companionCheck.detail}` : companionCheck.detail}</p>}<p className="mt-2 text-xs text-muted">Offline yt-dlp jobs raise a Windows tray balloon when they finish. Loopback + origin check only — Companion never accepts LAN clients.</p></section>
    <section className="mt-5 grid gap-3 sm:grid-cols-3"><InfoCard icon={<Wifi className="size-5"/>} title="Next: home network" copy="Folder watch events, Roku discovery, stable room invitations, and stronger timeline recovery."/><InfoCard icon={<Images className="size-5"/>} title="Then: media intelligence" copy="Background metadata, thumbnail health, faster source search, and reviewable local tags."/><InfoCard icon={<Bot className="size-5"/>} title="Later: optional assistants" copy="Private recommendation controls, explainable picks, and only opt-in service connections."/></section>
    <div className="mt-5 flex flex-wrap gap-2"><Button variant="secondary" onClick={exportMissions}><Download className="size-4"/>Export mission plan</Button><Button variant="secondary" onClick={() => setMissions(ALL_DEFAULT_MISSIONS)}>Reset to the current delivery queue</Button><span className="self-center text-xs text-muted">Exports the current status, or restores the complete delivery baseline.</span></div>
    <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const title = idea.trim(); if (!title) return; setMissions((items) => [...items, { id: createLocalId("mission-"), title, detail: "New idea — break this into implementation and verification steps.", done: false }]); setIdea(""); }}><Input value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="Add a larger change idea" aria-label="New mission idea"/><Button type="submit">Add to plan</Button></form>
  </HubShell>;
}
export function GamesSection() {
  const [games, setGames] = useState<LocalItem[]>([]);
  const [filter, setFilter] = useState("");
  const [removeGame, setRemoveGame] = useState<string | null>(null);
  const [launchNotice, setLaunchNotice] = useState("");
  const [shortcutView, setShortcutView] = useState<"all" | "ready" | "desktop" | "unknown">("all");
  const [fileType, setFileType] = useState("all");
  const [sort, setSort] = useState<"name" | "newest" | "type">("name");
  const [companionLoading, setCompanionLoading] = useState(false);
  const sourceShortcuts = useSourceAssets((s) => s.shortcuts);
  const [iconPulling, setIconPulling] = useState(false);
  useEffect(() => {
    const saved = readHub().games;
    const icons = loadGameIconCache();
    setGames(saved.map((game) => ({ ...game, iconData: game.iconData || icons[game.path] })));
  }, []);
  const saveGames = (next: LocalItem[]) => {
    // Keep hub metadata lean — icon data URLs live in reelcase.game-icons.v1.
    const slim = next.map(({ iconData, ...rest }) => {
      if (iconData) saveGameIcon(rest.path, iconData);
      return rest;
    });
    setGames(next);
    const hub = readHub();
    writeHub({ ...hub, games: slim });
  };
  const mergeIcons = (current: LocalItem[], iconMap: Map<string, string>) =>
    current.map((game) => {
      const icon = iconMap.get(game.path);
      return icon ? { ...game, iconData: icon } : game;
    });
  const pullMissingIcons = async (list: LocalItem[]) => {
    const missing = list.filter((game) => !game.iconData).map((game) => game.path);
    if (!missing.length) return list;
    setIconPulling(true);
    try {
      const iconMap = await fetchCompanionIcons(missing);
      if (!iconMap.size) return list;
      const next = mergeIcons(list, iconMap);
      saveGames(next);
      return next;
    } finally {
      setIconPulling(false);
    }
  };
  const add = async (files: FileList | File[] | null, allowWebShortcut = false) => {
    if (!files) return;
    const allFiles = Array.from(files);
    const source = allFiles.filter((file) =>
      allowWebShortcut
        ? /\.(exe|lnk|url|appref-ms)$/i.test(file.name)
        : /\.(exe|lnk|url|appref-ms)$/i.test(file.name),
    );
    const folderIcons = await iconsFromFolderFiles(allFiles);
    const next = await Promise.all(
      source.map(async (file) => {
        let launchUrl: string | undefined;
        if (/\.url$/i.test(file.name)) {
          const match = (await file.text()).match(/^URL\s*=\s*((?:https?|steam|epic|com\.epicgames\.launcher|xbox):\S+)/im);
          launchUrl = match?.[1];
        }
        const path = file.webkitRelativePath || file.name;
        const iconData = folderIcons.get(path.replace(/\\/g, "/")) || folderIcons.get(path);
        if (iconData) saveGameIcon(path, iconData);
        return {
          name: file.name,
          path,
          size: file.size,
          addedAt: Date.now(),
          launchUrl,
          iconData,
        };
      }),
    );
    let merged: LocalItem[] = [];
    setGames((current) => {
      merged = [
        ...current,
        ...next.filter((item) => !current.some((game) => game.path === item.path)),
      ];
      const hub = readHub();
      writeHub({ ...hub, games: merged.map(({ iconData: _icon, ...rest }) => rest) });
      return merged;
    });
    // Companion can still fill Windows shell icons for paths under approved roots.
    void pullMissingIcons(merged.length ? merged : next);
  };
  useEffect(() => { if (sourceShortcuts.length) void add(sourceShortcuts, true); }, [sourceShortcuts]);
  const launchDesktop = async (game: LocalItem) => {
    try {
      const response = await fetch("http://127.0.0.1:43123/launch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: game.path }) });
      const result = await response.json() as { ok?: boolean; error?: string };
      setLaunchNotice(result.ok ? `Launching ${game.name} through the local companion.` : result.error ?? "The companion could not launch this item.");
    } catch {
      setLaunchNotice("Desktop launch needs the Realhub Companion running and this shortcut inside one of its approved Windows folders.");
    }
  };
  const loadApprovedShortcuts = async () => {
    setCompanionLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:43123/shortcuts?limit=300");
      const result = await response.json() as { ok?: boolean; shortcuts?: Array<{ name: string; path: string; launchUrl?: string }>; error?: string };
      if (!result.ok) throw new Error(result.error ?? "The companion could not read approved shortcuts.");
      const cachedIcons = loadGameIconCache();
      const next = (result.shortcuts ?? []).map((item) => ({
        ...item,
        size: 0,
        addedAt: Date.now(),
        iconData: cachedIcons[item.path],
      }));
      let merged: LocalItem[] = [];
      setGames((current) => {
        // Refresh existing rows too: legacy .url entries may have been saved
        // before the companion could safely surface their readable target.
        const incoming = new Map(next.map((item) => [item.path, item]));
        merged = [
          ...current.map((game) => {
            const refreshed = incoming.get(game.path);
            return refreshed ? { ...game, ...refreshed, iconData: game.iconData || refreshed.iconData } : game;
          }),
          ...next.filter((item) => !current.some((game) => game.path === item.path)),
        ];
        writeHub({ ...readHub(), games: merged.map(({ iconData: _icon, ...rest }) => rest) });
        return merged;
      });
      const withIcons = await pullMissingIcons(merged.length ? merged : next);
      const got = withIcons.filter((game) => game.iconData).length;
      setLaunchNotice(
        next.length
          ? `Added ${next.length} approved desktop shortcuts · ${got} icons cached. Desktop launch still needs the companion.`
          : "No approved desktop shortcuts were found. Add a shortcut to Desktop or another approved companion folder.",
      );
    } catch {
      setLaunchNotice("Companion connection unavailable. Start the local Realhub Companion, then try again.");
    } finally { setCompanionLoading(false); }
  };
  const gameTypes = [...new Set(games.map((game) => (game.name.match(/\.([^.]+)$/)?.[1] ?? "other").toLowerCase()))].sort();
  const visible = games
    .filter((game) => game.name.toLowerCase().includes(filter.toLowerCase()) && (shortcutView === "all" || (shortcutView === "ready" ? gameKind(game) === "web-ready" : shortcutView === "unknown" ? gameKind(game) === "web-needs-target" : !isWebGame(game))) && (fileType === "all" || game.name.toLowerCase().endsWith(`.${fileType}`)))
    .filter((game) => shortcutView === "all" || !isGameHelper(game))
    .sort((a, b) => sort === "newest" ? b.addedAt - a.addedAt : sort === "type" ? a.name.split(".").pop()!.localeCompare(b.name.split(".").pop()!) || a.name.localeCompare(b.name) : a.name.localeCompare(b.name));
  return (
    <HubShell
      eyebrow="Desktop game shelf"
      icon={<Gamepad2 className="size-4" />}
      title="A clearer game drawer."
      copy="Choose a dedicated games folder (icons from sibling .ico/.png), load approved Desktop shortcuts through the companion (shell icons + folder art), or set a cover manually. Web shortcuts open directly; desktop launchers need the companion."
    >
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label>
          <input
            className="sr-only"
            type="file"
            multiple
            accept=".url"
            onChange={(event) => void add(event.target.files, true)}
          />
          <span className="inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg">
            Add web game shortcut
          </span>
        </label>
        <Button variant="secondary" disabled={companionLoading} onClick={() => void loadApprovedShortcuts()}>
          {companionLoading ? "Reading approved shortcuts…" : "Load approved desktop shortcuts"}
        </Button>
        <Button variant="secondary" disabled={companionLoading} onClick={() => void (async () => {
          setCompanionLoading(true);
          try {
            const listed = await companionSteamEpicGames(250);
            if (!listed.length) {
              setLaunchNotice("No Steam/Epic libraries under approved roots. Add the Steam or Epic Games folder to REELCASE_ALLOWED_ROOTS.");
              return;
            }
            const next: LocalItem[] = listed.map((game) => ({
              name: game.name,
              path: game.path,
              size: 0,
              addedAt: Date.now(),
            }));
            setGames((current) => {
              const merged: LocalItem[] = [
                ...current,
                ...next.filter((item) => !current.some((game) => game.path === item.path)),
              ];
              const hubState = readHub();
              writeHub({ ...hubState, games: merged.map(({ iconData: _icon, ...rest }) => rest) });
              return merged;
            });
            setLaunchNotice(`Loaded ${listed.length} Steam/Epic title${listed.length === 1 ? "" : "s"} from known install dirs under approved roots.`);
            void pullMissingIcons(next);
          } finally {
            setCompanionLoading(false);
          }
        })()}>
          Load Steam / Epic from approved roots
        </Button>
        <Button
          variant="secondary"
          disabled={iconPulling || companionLoading || !games.some((game) => !game.iconData)}
          onClick={() => void (async () => {
            const next = await pullMissingIcons(games);
            const filled = next.filter((game) => game.iconData).length - games.filter((game) => game.iconData).length;
            setLaunchNotice(filled > 0 ? `Pulled ${filled} desktop icon${filled === 1 ? "" : "s"} via companion / folder art.` : "No new icons found. Start the companion or add .ico/.png next to launchers.");
          })()}
        >
          {iconPulling ? "Pulling icons…" : "Pull missing icons"}
        </Button>
        <label>
          <input
            className="sr-only"
            type="file"
            multiple
            {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
            onChange={(event) => void add(event.target.files)}
          />
          <span className="inline-flex min-h-10 items-center rounded-sm bg-elevated px-4 text-sm text-fg shadow-border">
            Choose game folder
          </span>
        </label>
        <Input
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter your games"
          aria-label="Filter games"
        />
        {(["all", "ready", "desktop", "unknown"] as const).map((view) => <Button key={view} size="sm" variant={shortcutView === view ? "default" : "secondary"} onClick={() => setShortcutView(view)}>{view === "all" ? "All (helpers hidden)" : view === "ready" ? "Web ready" : view === "desktop" ? "Desktop" : "Unknown URL"}</Button>)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-muted">File type</span><Button size="sm" variant={fileType === "all" ? "default" : "secondary"} onClick={() => setFileType("all")}>All types</Button>{gameTypes.map((type) => <Button key={type} size="sm" variant={fileType === type ? "default" : "secondary"} onClick={() => setFileType(type)}>.{type}</Button>)}<span className="ml-2 text-xs text-muted">Sort</span>{(["name", "newest", "type"] as const).map((value) => <Button key={value} size="sm" variant={sort === value ? "default" : "secondary"} onClick={() => setSort(value)}>{value === "name" ? "A–Z" : value === "newest" ? "Recently added" : "File type"}</Button>)}</div>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted"><span>{visible.length} shown · {games.filter((game) => gameKind(game) === "web-needs-target").length} web shortcuts need a readable target</span><Button size="sm" variant="ghost" onClick={() => downloadCsv([["name", "path", "kind", "extension", "launch_ready", "helper", "added_at"], ...games.map((game) => [game.name, game.path, gameKind(game), game.name.split(".").pop() ?? "", Boolean(game.launchUrl), isGameHelper(game), new Date(game.addedAt).toISOString()])], `reelcase-games-debug-${new Date().toISOString().slice(0, 10)}.csv`)}><Download className="size-3" /> Export game debug CSV</Button></div>
      {visible.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {visible.map((game) => (
            <div
              key={game.path}
              className="flex items-center gap-4 rounded-lg bg-elevated p-4 shadow-border"
            >
              <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-accent/10 text-center text-[10px] font-bold tracking-[0.08em] text-accent">
                {game.iconData ? (
                  <img src={game.iconData} alt="" className="size-full object-cover" />
                ) : (
                  gameBadge(game)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-fg">
                  {game.name.replace(/\.(exe|lnk|url|appref-ms)$/i, "")}
                </p>
                <p className="mt-1 truncate text-xs text-muted">
                  {gameKind(game) === "web-ready" ? "Web launcher ready" : gameKind(game) === "web-needs-target" ? "Shortcut target is unknown here — open it through the Companion or refresh its target" : game.path}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (game.launchUrl) {
                        const link = document.createElement("a");
                        link.href = game.launchUrl;
                        link.target = game.launchUrl.startsWith("http") ? "_self" : "_blank";
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        return;
                      }
                      if (gameKind(game) === "web-needs-target") { void launchDesktop(game); return; }
                      void launchDesktop(game);
                    }}
                  >
                    <Rocket className="size-3" />
                    {gameKind(game) === "web-needs-target" ? "Open .url shortcut" : isWebGame(game) ? "Open web game" : "Launch desktop game"}
                  </Button>
                  <label className="inline-flex cursor-pointer items-center text-xs text-muted hover:text-fg">
                    <ImagePlus className="mr-1 size-3" /> Set icon
                    <input
                      className="sr-only"
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const iconData = String(reader.result);
                          saveGameIcon(game.path, iconData);
                          saveGames(
                            games.map((item) =>
                              item.path === game.path
                                ? { ...item, iconData }
                                : item,
                            ),
                          );
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={`https://store.steampowered.com/search/?term=${encodeURIComponent(game.name.replace(/\..*$/, ""))}`}
                    className="inline-flex text-xs text-muted hover:text-fg"
                  >
                    Store page <ExternalLink className="ml-1 size-3" />
                  </a>
                  <button
                    type="button"
                    className="text-xs text-muted hover:text-danger"
                    onClick={() =>
                      removeGame === game.path
                        ? (saveGames(games.filter((item) => item.path !== game.path)),
                          setRemoveGame(null))
                        : setRemoveGame(game.path)
                    }
                  >
                    {removeGame === game.path ? "Confirm remove" : "Remove"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border">
          <Gamepad2 className="mx-auto size-7 text-accent" />
          <p className="mt-3 font-display text-2xl text-fg">Build your launch list</p>
          <p className="mt-2 text-sm text-muted">
            Add `.url` shortcuts to launch their approved web destination, or catalog desktop
            launchers and choose a custom cover icon.
          </p>
        </div>
      )}
      {launchNotice && <p className="mt-3 rounded-md bg-elevated px-3 py-2 text-xs leading-5 text-muted shadow-border">{launchNotice}</p>}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ServiceLink
          name="Nexus Mods"
          href="https://www.nexusmods.com/"
          copy="Browse mod pages and collections."
        />
        <ServiceLink
          name="Vortex"
          href="https://www.nexusmods.com/about/vortex/"
          copy="Open the official mod manager page."
        />
      </div>
    </HubShell>
  );
}

type PrivateWebShortcut = { id: string; name: string; url: string };
const PRIVATE_SHORTCUTS_KEY = "reelcase.private-web-shortcuts.v1";

export function PrivateWebShortcuts() {
  const [links, setLinks] = useState<PrivateWebShortcut[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PRIVATE_SHORTCUTS_KEY) ?? "[]");
      return Array.isArray(saved) ? saved.filter((item): item is PrivateWebShortcut => typeof item?.name === "string" && typeof item?.url === "string") : [];
    } catch { return []; }
  });
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const save = (next: PrivateWebShortcut[]) => { setLinks(next); localStorage.setItem(PRIVATE_SHORTCUTS_KEY, JSON.stringify(next)); };
  const add = () => {
    try {
      const parsed = new URL(url);
      if (!/^https?:$/.test(parsed.protocol)) throw new Error("unsupported");
      save([...links, { id: createLocalId("link-"), name: name.trim() || parsed.hostname, url: parsed.toString() }]);
      setName(""); setUrl("");
    } catch { setUrl(""); }
  };
  return <section className="mb-6 rounded-xl bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Private web shortcuts</p><h2 className="mt-2 font-display text-2xl text-fg">Your saved destinations</h2><p className="mt-1 text-xs leading-5 text-muted">Add only links you trust. These are saved only in this browser and open when you press Launch.</p><div className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto]"><Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Name" aria-label="Shortcut name"/><Input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://…" aria-label="Shortcut URL"/><Button disabled={!url.trim()} onClick={add}>Save shortcut</Button></div>{links.length > 0 && <div className="mt-4 grid gap-2 sm:grid-cols-2">{links.map((link) => <div key={link.id} className="flex items-center gap-3 rounded-md bg-bg/45 p-3 shadow-border"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-fg">{link.name}</p><p className="truncate text-xs text-muted">{link.url}</p></div><Button size="sm" onClick={() => window.location.assign(link.url)}><Rocket className="size-3"/>Launch</Button><Button size="sm" variant="secondary" onClick={() => save(links.filter((item) => item.id !== link.id))}>Remove</Button></div>)}</div>}</section>;
}

function LocalCatalog({
  kind,
  eyebrow,
  icon,
  title,
  copy,
  accept,
  directory,
  footer,
}: {
  kind: "prints" | "games";
  eyebrow: string;
  icon: ReactNode;
  title: string;
  copy: string;
  accept?: string;
  directory?: boolean;
  footer?: ReactNode;
}) {
  const [hub, setHub] = useState<HubStore>({ prints: [], games: [] });
  const [viewer, setViewer] = useState<PrintViewerTarget | null>(null);
  const [busy, setBusy] = useState(false);
  const [companionNote, setCompanionNote] = useState("");
  useEffect(() => setHub(readHub()), []);
  const items = hub[kind];
  const change = async (files: FileList | null) => {
    if (!files?.length) return;
    if (kind === "prints") {
      setBusy(true);
      try {
        const nextItems: LocalItem[] = [];
        for (const file of [...files]) {
          const blobId = await savePrintBlob(file);
          nextItems.push({
            name: file.name,
            path: file.webkitRelativePath || file.name,
            size: file.size,
            addedAt: Date.now(),
            id: blobId ?? undefined,
          });
        }
        const next = { ...hub, prints: [...nextItems, ...hub.prints].slice(0, 120) };
        setHub(next);
        writeHub(next);
      } finally {
        setBusy(false);
      }
      return;
    }
    const next = { ...hub, [kind]: filesToItems(files, kind === "games") };
    setHub(next);
    writeHub(next);
  };
  const canView = (item: LocalItem) => Boolean(item.sampleSrc || (item.id && isViewablePrintName(item.name)));
  return (
    <HubShell eyebrow={eyebrow} icon={icon} title={title} copy={copy}>
      <label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-elevated/40 px-5 text-center transition-[background-color,border-color] duration-150 hover:border-fg/30 hover:bg-elevated">
        <PackageSearch className="size-7 text-accent" />
        <span className="mt-3 text-sm font-medium text-fg">
          {directory ? "Choose Desktop games folder" : busy ? "Saving print files…" : "Add print files"}
        </span>
        <span className="mt-1 text-xs text-muted">
          {directory
            ? "Keeps only game launchers and shortcuts; folders and support files stay out."
            : "STL, OBJ, GLB/GLTF, and 3MF open in the in-app viewer; G-code is catalog-only."}
        </span>
        <input
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          disabled={busy}
          {...(directory ? ({ webkitdirectory: "", directory: "" } as Record<string, string>) : {})}
          onChange={(event) => {
            void change(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      {kind === "prints" && (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => void (async () => {
            setBusy(true);
            try {
              const { prints } = await companionListPrints(120);
              if (!prints.length) {
                setCompanionNote("No STL/OBJ/GLB/3MF under approved roots (or Realhub Prints). Add a prints folder to REELCASE_ALLOWED_ROOTS.");
                return;
              }
              const nextItems: LocalItem[] = [];
              for (const row of prints.slice(0, 40)) {
                if (!isViewablePrintName(row.name)) continue;
                const file = await companionReadPrint(row.path);
                if (!file.ok || !file.dataBase64) continue;
                const bytes = Uint8Array.from(atob(file.dataBase64), (c) => c.charCodeAt(0));
                const blob = new File([bytes], file.name || row.name, { type: "application/octet-stream" });
                const blobId = await savePrintBlob(blob);
                nextItems.push({
                  name: row.name,
                  path: row.path,
                  size: row.size,
                  addedAt: Date.now(),
                  id: blobId ?? undefined,
                });
              }
              if (!nextItems.length) {
                setCompanionNote("Companion listed prints, but none could be loaded (size/format).");
                return;
              }
              const next = { ...hub, prints: [...nextItems, ...hub.prints].slice(0, 120) };
              setHub(next);
              writeHub(next);
              setCompanionNote(`Opened ${nextItems.length} print file${nextItems.length === 1 ? "" : "s"} from approved companion folders.`);
            } finally {
              setBusy(false);
            }
          })()}>Open prints from companion folder</Button>
          <Button size="sm" variant="secondary" disabled={busy || !items.some((item) => item.id)} onClick={() => void (async () => {
            setBusy(true);
            try {
              let saved = 0;
              for (const item of items.slice(0, 20)) {
                if (!item.id || !isViewablePrintName(item.name)) continue;
                const { loadPrintBlob } = await import("@/lib/prints-blobs");
                const record = await loadPrintBlob(item.id);
                if (!record?.blob) continue;
                const buffer = new Uint8Array(await record.blob.arrayBuffer());
                let binary = "";
                for (let i = 0; i < buffer.length; i += 1) binary += String.fromCharCode(buffer[i]!);
                const result = await companionSavePrint(item.name, btoa(binary));
                if (result.ok) saved += 1;
              }
              setCompanionNote(saved ? `Saved ${saved} print file${saved === 1 ? "" : "s"} into the companion Realhub Prints folder.` : "Nothing saved — start Companion and ensure an approved prints folder exists.");
            } finally {
              setBusy(false);
            }
          })()}>Save open prints to companion</Button>
          {companionNote && <p className="w-full text-xs text-muted">{companionNote}</p>}
        </div>
      )}
      {items.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg shadow-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-fg">
              {items.length} saved {kind === "prints" ? "print files" : "games"}
            </p>
            <p className="text-xs text-subtle">
              {kind === "prints" ? "Names in localStorage · viewable bytes in IndexedDB" : "Stored as names only"}
            </p>
          </div>
          {items.slice(0, 80).map((item) => (
            <div
              key={`${item.path}:${item.addedAt}`}
              className="flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-fg">{item.name}</p>
                <p className="truncate text-xs text-muted">{item.path}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {kind === "prints" && (
                  <Button
                    size="sm"
                    variant={canView(item) ? "default" : "secondary"}
                    type="button"
                    disabled={!canView(item)}
                    title={canView(item) ? "Open viewer + editor" : /\.gcode$/i.test(item.name) ? "G-code is not a mesh preview" : "Re-add this file to enable preview"}
                    onClick={() =>
                      setViewer({
                        name: item.name,
                        path: item.path,
                        size: item.size,
                        sampleSrc: item.sampleSrc,
                        blobId: item.id,
                      })
                    }
                  >
                    <Eye className="size-3.5" />
                    View / Edit
                  </Button>
                )}
                <p className="font-mono text-xs text-subtle">{bytes(item.size)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {footer}
      {viewer && (
        <Suspense fallback={null}>
          <PrintModelViewer target={viewer} onClose={() => setViewer(null)} />
        </Suspense>
      )}
    </HubShell>
  );
}

export function ShopSection() {
  const [query, setQuery] = useState("");
  type Package = { id: string; title: string; carrier: string; tracking: string; status: "Ordered" | "Shipped" | "Out for delivery" | "Delivered" };
  const [packages, setPackages] = useState<Package[]>([]);
  const [packageTitle, setPackageTitle] = useState("");
  const [carrier, setCarrier] = useState("USPS");
  const [tracking, setTracking] = useState("");
  useEffect(() => { try { setPackages(JSON.parse(localStorage.getItem("reelcase.package-tracking.v1") ?? "[]") as Package[]); } catch { setPackages([]); } }, []);
  useEffect(() => { try { localStorage.setItem("reelcase.package-tracking.v1", JSON.stringify(packages)); } catch { /* storage unavailable */ } }, [packages]);
  const encoded = encodeURIComponent(query.trim());
  const stores = useMemo(
    () => [
      { name: "Amazon", href: `https://www.amazon.com/s?k=${encoded}`, detail: "Search Amazon" },
      {
        name: "Walmart",
        href: `https://www.walmart.com/search?q=${encoded}`,
        detail: "Search Walmart",
      },
      {
        name: "eBay",
        href: `https://www.ebay.com/sch/i.html?_nkw=${encoded}`,
        detail: "Search eBay",
      },
      { name: "Etsy", href: `https://www.etsy.com/search?q=${encoded}`, detail: "Search handmade & niche shops" },
      { name: "Diipoo", href: `https://diipoo.com/?s=${encoded}`, detail: "Search Diipoo deals" },
    ],
    [encoded],
  );
  return (
    <HubShell
      eyebrow="Shopping shortcuts"
      icon={<ShoppingBag className="size-4" />}
      title="Find gear for your setup"
      copy="Search major retailers from one clean starting point. Listings, prices, checkout, and account activity stay on the retailer’s site."
    >
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search film gear, printer parts, controllers…"
            className="pl-9"
          />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {stores.map((store) => (
          <a
            key={store.name}
            href={store.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover"
          >
            <p className="font-display text-2xl text-fg">{store.name}</p>
            <p className="mt-1 text-sm text-muted">
              {query.trim() ? `${store.detail} for “${query.trim()}”` : store.detail}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
              Open search <ExternalLink className="size-4" />
            </span>
          </a>
        ))}
      </div>
      <section className="mt-7 rounded-lg bg-elevated p-5 shadow-border">
        <div><p className="flex items-center gap-2 font-display text-2xl text-fg"><PackageSearch className="size-5 text-accent" />Package tracking</p><p className="mt-1 text-sm text-muted">A private local list for orders you are expecting. Tracking opens the carrier lookup in a new page; no retailer account is connected.</p></div>
        <div className="mt-4 grid gap-2 sm:grid-cols-[1.2fr_.8fr_1fr_auto]"><Input value={packageTitle} onChange={(event) => setPackageTitle(event.target.value)} placeholder="Package or order name" aria-label="Package name" /><Input value={carrier} onChange={(event) => setCarrier(event.target.value)} placeholder="Carrier" aria-label="Carrier" /><Input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="Tracking number (optional)" aria-label="Tracking number" /><Button onClick={() => { if (!packageTitle.trim()) return; setPackages((items) => [{ id: createLocalId("package-"), title: packageTitle.trim(), carrier: carrier.trim() || "Carrier", tracking: tracking.trim(), status: "Ordered" }, ...items]); setPackageTitle(""); setTracking(""); }}>Add package</Button></div>
        {packages.length ? <div className="mt-4 space-y-2">{packages.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-md bg-bg/45 px-3 py-3"><div className="min-w-36 flex-1"><p className="text-sm font-medium text-fg">{item.title}</p><p className="text-xs text-muted">{item.carrier}{item.tracking ? ` · ${item.tracking}` : ""}</p></div><select value={item.status} onChange={(event) => setPackages((items) => items.map((entry) => entry.id === item.id ? { ...entry, status: event.target.value as Package["status"] } : entry))} className="h-9 rounded-sm bg-elevated px-2 text-xs text-fg shadow-border"><option>Ordered</option><option>Shipped</option><option>Out for delivery</option><option>Delivered</option></select>{item.tracking && <a href={`https://www.17track.net/en/track?nums=${encodeURIComponent(item.tracking)}`} target="_blank" rel="noreferrer" className="rounded-sm bg-accent px-3 py-2 text-xs font-medium text-accent-fg">Track</a>}<Button size="sm" variant="secondary" onClick={() => setPackages((items) => items.filter((entry) => entry.id !== item.id))}>Remove</Button></div>)}</div> : <p className="mt-4 text-sm text-muted">No packages yet. Add an order to keep its delivery status beside your shopping shortcuts.</p>}
      </section>
    </HubShell>
  );
}

export function StreamingSection() {
  const [ratingQuery, setRatingQuery] = useState("");
  const services = [
    { name: "Netflix", href: "https://www.netflix.com/", copy: "Movies & series" },
    { name: "Hulu", href: "https://www.hulu.com/", copy: "TV & films" },
    { name: "Crunchyroll", href: "https://www.crunchyroll.com/", copy: "Anime streaming" },
    { name: "Kick", href: "https://kick.com/", copy: "Live streaming" },
    { name: "Vimeo", href: "https://vimeo.com/", copy: "Creator video" },
    { name: "Nebula", href: "https://nebula.tv/", copy: "Independent creators" },
    { name: "Plex", href: "https://www.plex.tv/", copy: "Personal media & streaming" },
    {
      name: "Internet Archive",
      href: "https://archive.org/details/feature_films",
      copy: "Open & public-domain films",
    },
    {
      name: "Old Time Movies",
      href: "https://archive.org/details/moviesandfilms",
      copy: "Classic and public-domain cinema",
    },
    {
      name: "Library of Congress",
      href: "https://www.loc.gov/film-and-videos/",
      copy: "Historic films and moving images",
    },
    {
      name: "Open Culture",
      href: "https://www.openculture.com/freemoviesonline",
      copy: "Free film collections and courses",
    },
    { name: "AniList", href: "https://anilist.co/", copy: "Anime discovery & ratings" },
    { name: "AniDB", href: "https://anidb.net/", copy: "Anime database" },
    { name: "Rotten Tomatoes", href: "https://www.rottentomatoes.com/", copy: "Critic & audience ratings" },
  ];
  return (
    <HubShell
      eyebrow="Movie streaming"
      icon={<Clapperboard className="size-4" />}
      title="Streaming destinations"
      copy="Keep watch sources separate from shopping. These official services and public collections open in their own sites."
    >
      <section className="mt-6 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">External rating search</p><p className="mt-1 text-sm text-muted">Look up a title on the source you trust. Searches open on the official site; Realhub does not copy ratings into your local catalog.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input value={ratingQuery} onChange={(event) => setRatingQuery(event.target.value)} placeholder="Search an anime, movie, or series" aria-label="External rating search"/><div className="flex flex-wrap gap-2">{[{ label: "AniList", url: "https://anilist.co/search/anime?search=" }, { label: "AniDB", url: "https://anidb.net/anime/?adb.search=" }, { label: "Rotten Tomatoes", url: "https://www.rottentomatoes.com/search?search=" }].map((source) => <a key={source.label} href={`${source.url}${encodeURIComponent(ratingQuery.trim())}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-3 text-sm text-fg shadow-border">{source.label}<ExternalLink className="ml-2 size-3.5"/></a>)}</div></div></section>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <ServiceLink key={service.name} {...service} />
        ))}
      </div>
    </HubShell>
  );
}

export function SocialSection() {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [handle, setHandle] = useState("");
  const [active, setActive] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [lastRead, setLastRead] = useState<Record<string, number>>({});
  const [topic, setTopic] = useState<{ label: string; query: string } | null>(null);
  const defaultTopics = useMemo(() => [{ label: "Movies & TV", query: "movies OR tv" }, { label: "Anime", query: "anime" }, { label: "Gaming", query: "gaming" }, { label: "Live creators", query: "twitch streamer" }], []);
  useEffect(() => {
    try {
      const raw: unknown = JSON.parse(localStorage.getItem("reelcase.x-accounts") ?? "[]");
      let saved = Array.isArray(raw) ? raw.filter((value): value is string => typeof value === "string" && /^[A-Za-z0-9_]{1,15}$/.test(value)) : [];
      // One-time seed from curated helper list. Never re-add after the user clears or removes accounts.
      const seededFlag = localStorage.getItem("reelcase.x-adult-seeded") === "1";
      if (!saved.length && !seededFlag) {
        saved = [...new Set(X_ADULT_SEED_HANDLES)].slice(0, 50);
        localStorage.setItem("reelcase.x-accounts", JSON.stringify(saved));
        localStorage.setItem("reelcase.x-adult-seeded", "1");
      } else if (!seededFlag) {
        localStorage.setItem("reelcase.x-adult-seeded", "1");
      }
      setAccounts(saved);
      const last = localStorage.getItem("reelcase.x-active") ?? "";
      setActive(saved.includes(last) ? last : saved[0] ?? "");
      if (!saved.length) setTopic(defaultTopics[0]);
      const reads: unknown = JSON.parse(localStorage.getItem("reelcase.x-last-read") ?? "{}");
      if (reads && typeof reads === "object") setLastRead(reads as Record<string, number>);
    } catch { /* empty shelf */ }
  }, []);
  const choose = (account: string) => { const at = Date.now(); setTopic(null); setActive(account); setLastRead((current) => { const next = { ...current, [account]: at }; try { localStorage.setItem("reelcase.x-last-read", JSON.stringify(next)); } catch { /* session only */ } return next; }); try { localStorage.setItem("reelcase.x-active", account); } catch { /* session only */ } };
  const save = (next: string[]) => { setAccounts(next); try { localStorage.setItem("reelcase.x-accounts", JSON.stringify(next)); } catch { setError("Storage is full. Account changes will last for this session only."); } };
  const add = () => {
    const value = handle.trim().replace(/^https?:\/\/(?:www\.)?(?:x|twitter)\.com\//i, "").replace(/^@/, "").replace(/[/?#].*$/, "").toLowerCase();
    if (!/^[a-z0-9_]{1,15}$/.test(value)) { setError("Enter a valid X handle or profile URL (up to 15 letters, numbers or underscores)."); return; }
    if (accounts.length >= 50 && !accounts.includes(value)) { setError("Your shelf holds 50 accounts. Remove one before adding another."); return; }
    setError(""); save([...new Set([...accounts, value])]); choose(value); setHandle("");
  };
  return <HubShell eyebrow="Social desk" icon={<X className="size-4" />} title="Keep your people close." copy="Save X profiles, switch between public timelines, and pick up where you left off. Public timelines render inside Realhub through X’s official widget; private posts and account likes stay on X.">
    <form className="mt-6 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); add(); }}><Input value={handle} onChange={(event) => setHandle(event.target.value)} placeholder="@handle or X profile URL" aria-label="X account handle"/><Button type="submit" disabled={!handle.trim()}>Add account</Button></form>
    {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
    <Input className="mt-4" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a saved account" aria-label="Search saved X accounts"/>
    <section className="mt-5 rounded-lg bg-elevated p-4 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Public topic views</p><p className="mt-1 text-sm text-muted">Explore these X searches separately from your saved people. X supplies the public timeline; open the topic if it is unavailable.</p><div className="mt-3 flex flex-wrap gap-2">{defaultTopics.map((item) => <Button key={item.label} size="sm" variant={topic?.label === item.label ? "default" : "secondary"} onClick={() => { setTopic(item); setActive(""); }}>{item.label}</Button>)}</div></section>
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{accounts.filter((account) => account.toLowerCase().includes(search.toLowerCase())).map((account) => <div key={account} className={"flex items-center gap-2 rounded-lg border p-2 " + (active === account ? "border-accent bg-elevated" : "border-border bg-surface")}><button type="button" aria-pressed={active === account} onClick={() => choose(account)} className="min-w-0 flex-1 p-3 text-left"><span className="block truncate text-lg font-semibold">@{account}</span><span className="text-xs text-muted">{lastRead[account] ? `Read ${new Date(lastRead[account]).toLocaleDateString()}` : "Public profile"}</span></button><Button variant="ghost" size="icon" aria-label={"Remove @" + account} onClick={() => { const next = accounts.filter((value) => value !== account); save(next); if (active === account) choose(next[0] ?? ""); }}><X className="size-4"/></Button></div>)}</div>
    {!accounts.length && <p className="mt-6 rounded-lg border border-border p-5 text-sm text-muted">Showing the default public topic view below. Add a profile to create a personal reading shelf; if X blocks embedded posts, the Open topic/profile button is the reliable fallback.</p>}
    {(active || topic) && <XTimeline key={topic ? `topic:${topic.label}` : active} account={active || undefined} topic={topic ?? undefined}/>}
  </HubShell>;
}

export function WatchRoomSection() {
  const [roomCode, setRoomCode] = useState(
    () => `RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
  );
  const [roomInput, setRoomInput] = useState("");
  const [recentLocalRoom, setRecentLocalRoom] = useState(() => localStorage.getItem("reelcase.watch-room.last-host") ?? "");
  const [name, setName] = useState(() => localStorage.getItem("reelcase.profile-name") || (new URLSearchParams(window.location.search).get('theater')==='1'?'Guest':'Host'));
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [joinedAsGuest, setJoinedAsGuest] = useState(false);
  const [guestAccess, setGuestAccess] = useState(false);
  const [localVideo, setLocalVideo] = useState<File | null>(null);
  const [localShare, setLocalShare] = useState<LocalRoomShare | null>(null);
  const [pickedLocalVideo, setPickedLocalVideo] = useState<File | null>(null);
  const localFiles = useRef(new Map<string, File>());
  const [pendingLocalShare, setPendingLocalShare] = useState<LocalRoomShare | null>(null);
  const [sharedRoomVideos, setSharedRoomVideos] = useState<Record<string, LibraryVideo>>({});
  const sharedRoomVideosRef = useRef(sharedRoomVideos);
  sharedRoomVideosRef.current = sharedRoomVideos;
  const [sharedLocalMedia, setSharedLocalMedia] = useState<RoomMediaDescriptor | null>(null);
  const [mediaHostId, setMediaHostId] = useState("");
  const [localQueue, setLocalQueue] = useState<LocalRoomShare[]>([]);
  const [localShareMatches, setLocalShareMatches] = useState<Record<string, { name: string; fingerprint: string; at: number }>>({});
  const [rokuAddress, setRokuAddress] = useState("");
  const [rokuReady, setRokuReady] = useState(false);
  const [rokuDevices, setRokuDevices] = useState<{ address: string; location: string }[]>([]);
  const [rokuNotice, setRokuNotice] = useState("");
  const [queue, setQueue] = useState<string[]>([]);
  const queueRef = useRef<string[]>([]);
  const [queueNotice, setQueueNotice] = useState('');
  const [autoAdvance,setAutoAdvance]=useState(()=>localStorage.getItem('reelcase.watch-room.auto-advance')!=='false');
  const lastEndedTitle=useRef('');
  const [roomHealth, setRoomHealth] = useState<RoomHealth>({ lastPublishedAt: 0, lastHostStateAt: 0, lastQueueAt: 0, lastDriftSeconds: 0, queueRevision: 0, queueRequests: 0, queueAccepted: 0, staleDropped: 0, resyncRequests: 0 });
  const [roomLedger, setRoomLedger] = useState<RoomLedgerEvent[]>([]);
  const [ledgerRoom, setLedgerRoom] = useState("");
  const [stageSize, setStageSize] = useState<"compact" | "theater" | "cinema">("theater");
  const [playback, setPlayback] = useState({ playing: false, position: 0 });
  const [guestOffset, setGuestOffset] = useState(() => {
    try { return normalizeGuestOffset(Number(localStorage.getItem("reelcase.watch-room.guest-offset.v1") ?? 0)); }
    catch { return 0; }
  });
  const guestPlayerOffset = useRef(0);
  const [timelineEvidence, setTimelineEvidence] = useState<{ source: "local" | "remote" | "estimated"; at: number }>({ source: "local", at: Date.now() });
  const [chat, setChat] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [deferredRoomSearch, setDeferredRoomSearch] = useState("");
  const [roomCandidates, setRoomCandidates] = useState<LibraryVideo[]>([]);
  const [roomCandidatesPending, setRoomCandidatesPending] = useState(false);
  const [roomSearchResults, setRoomSearchResults] = useState<LibraryVideo[]>([]);
  const [roomSearchPending, setRoomSearchPending] = useState(false);
  const [roomLocalToolsOpen, setRoomLocalToolsOpen] = useState(false);
  const [roomRatingRevision, setRoomRatingRevision] = useState(0);
  const [partyPrompt, setPartyPrompt] = useState("Pick the next vibe");
  const [partyVotes, setPartyVotes] = useState<Record<string, number>>({ Comedy: 0, Action: 0, Surprise: 0 });
  const [friendName, setFriendName] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [inviteNotice, setInviteNotice] = useState("");
  const [pulseStatus, setPulseStatus] = useState("No chat transport test yet.");
  const [friends, setFriends] = useState<{ name: string; code: string }[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem("reelcase.lan-friends.v1") ?? "[]"); return Array.isArray(saved) ? saved.slice(0, 16) : []; } catch { return []; }
  });
  const videos = useLibrary((s) => s.videos);
  const favorites = useLibrary((s) => s.favorites);
  const hiddenVideos = useLibrary((s) => s.hiddenVideos);
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);
  const history = useLibrary((s) => s.history);
  const recordPlay = useLibrary((s) => s.recordPlay);
  const unavailable = useLibrary((s) => s.unavailable);
  useEffect(() => { localStorage.setItem("reelcase.profile-name", name.trim() || "Host"); }, [name]);
  const [sharedVideoId, setSharedVideoIdState] = useState(
    () => {
      if(new URLSearchParams(window.location.search).get('theater')==='1') return '';
      const pending = localStorage.getItem("reelcase.watch-room.pending-video");
      const requested = pending ? videos.find((video) => video.id === pending && canStageRoomVideo(video)) : undefined;
      return requested?.id ?? videos.find(canStageRoomVideo)?.id ?? "";
    },
  );
  const currentVideoIdRef = useRef(sharedVideoId);
  const setSharedVideoId = (id: string) => {
    currentVideoIdRef.current = id;
    setSharedVideoIdState(id);
  };
  const adoptRoomMedia = useCallback((values: unknown[], ids: string[]) => {
    const next = mergeRoomMedia(sharedRoomVideosRef.current, values, ids);
    sharedRoomVideosRef.current = next;
    setSharedRoomVideos(next);
  }, []);
  const sharedVideo = useMemo(() => {
    const video = joinedAsGuest ? sharedRoomVideos[sharedVideoId] ?? lookupVideo(videos,sharedVideoId) : lookupVideo(videos,sharedVideoId) ?? sharedRoomVideos[sharedVideoId];
    return video ? normalizeRoomVideo(video) : undefined;
  },[videos,sharedRoomVideos,sharedVideoId,joinedAsGuest]);
  const roomVideoForId = (id: string) => joinedAsGuest ? sharedRoomVideosRef.current[id] ?? lookupVideo(videos,id) : lookupVideo(videos, id) ?? sharedRoomVideosRef.current[id];
  const pickedLocalShare = pickedLocalVideo ? { name: pickedLocalVideo.name, fingerprint: localRoomFingerprint(pickedLocalVideo), size: pickedLocalVideo.size, modified: pickedLocalVideo.lastModified } : null;
  useEffect(() => {
    const retained = new Set([sharedVideoId, ...queue]);
    for (const id of localFiles.current.keys()) if (!retained.has(id)) localFiles.current.delete(id);
  }, [sharedVideoId, queue]);
  const roomRating = useMemo(() => sharedVideoId ? getRating(sharedVideoId) : 0, [roomRatingRevision, sharedVideoId]);
  const twitchClip = sharedVideo?.remote?.kind === "twitch" && (sharedVideo.extension === "clip" || sharedVideo.remote.embedUrl?.includes("clips.twitch.tv"));
  // Providers occasionally surface corrupt/millisecond clocks. Never let an
  // untrusted embed turn the room state into days of phantom playback.
  const [measuredDuration, setMeasuredDuration] = useState<{ videoId: string; seconds: number } | null>(null);
  const roomDuration = (videoId = sharedVideoId) => {
    if (videoId === sharedVideoId) {
      const mediaDuration = roomVideoRef.current?.duration;
      const twitchDuration = sharedVideo?.remote?.kind === "twitch" && !sharedVideo.remote.live ? twitchPlayerRef.current?.getDuration?.() : undefined;
      for (const duration of [mediaDuration, twitchDuration, measuredDuration?.videoId === videoId ? measuredDuration.seconds : undefined])
        if (typeof duration === "number" && Number.isFinite(duration) && duration > 0) return duration;
    }
    const video = videoId === sharedVideoId ? sharedVideo : videos.find((item) => item.id === videoId);
    return video?.remote?.live ? undefined : video?.duration;
  };
  const clampRoomClock = (seconds: number, videoId = sharedVideoId) => clampRoomPosition(seconds, roomDuration(videoId));
  const currentHostClock = () => {
    const media = roomVideoRef.current;
    if (media && !sharedVideo?.remote) {
      const actual = media.currentTime;
      return clampRoomClock(actual > 0.25 || playback.position <= 0.25 ? actual : playback.position);
    }
    const estimated = estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing && (sharedVideo?.remote?.kind !== "twitch" || twitchPlayingRef.current) ? youtubePlaybackStartedAt.current : null, Date.now());
    const twitch = sharedVideo?.remote?.kind === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : undefined;
    return clampRoomClock(typeof twitch === "number" && Number.isFinite(twitch) && twitch > 0.25 ? Math.max(twitch, estimated) : estimated);
  };
  const localShareIsMatched = !sharedVideoId.startsWith("local:") || localShare?.fingerprint === sharedVideoId.slice("local:".length);
  const roomVideoRef = useRef<HTMLVideoElement>(null);
  const remoteFrameRef = useRef<HTMLIFrameElement>(null);
  const twitchPlayerHostRef = useRef<HTMLDivElement>(null);
  const twitchPlayerRef = useRef<TwitchRoomPlayer | null>(null);
  const twitchPlayingRef = useRef(false);
  const [twitchActuallyPlaying, setTwitchActuallyPlaying] = useState(false);
  const [remoteFrameReady, setRemoteFrameReady] = useState<{id:string;at:number}|null>(null);
  const [remoteSeekNonce, setRemoteSeekNonce] = useState(0);
  const lastYoutubeSeekNonce = useRef(0);
  const lastTwitchSeekNonce = useRef(0);
  const lastTwitchPlaybackCommand = useRef<boolean | null>(null);
  const suppressRemotePlayerEchoUntil = useRef(0);
  const [twitchPlayerStatus, setTwitchPlayerStatus] = useState("Waiting for Twitch player…");
  const [twitchPlayerReady, setTwitchPlayerReady] = useState(0);
  const [candidateSeed, setCandidateSeed] = useState(() => Date.now());
  const [roomPickLimit, setRoomPickLimit] = useState(18);
  const youtubePlaybackStartedAt = useRef<number | null>(null);
  const [localVideoSource, setLocalVideoSource] = useState<{file:File;url:string}|null>(null);
  const localVideoUrl = localVideoSource?.file === localVideo ? localVideoSource.url : "";
  const [resolvedRoomSource, setResolvedRoomSource] = useState<{ id: string; url: string } | null>(null);
  const lastRoomTick = useRef(0);
  const lastRoomHistoryId = useRef("");
  const lastRoomPosition = useRef(0);
  const applyingRemotePlaybackUntil = useRef(0);
  const queueRevisionRef = useRef(0);
  const lastAcceptedQueueRevision = useRef(0);
  const lastAcceptedTimelineAt = useRef(0);
  const lastAcceptedRoomStateAt = useRef(0);
  const room = activeRoom ?? "";
  const [relayConfig, setRelayConfig] = useState<RoomRelayConfig>();
  const p2p = useP2PRoom(room, name.trim() || "Guest", relayConfig);
  const { request: requestQueueChange, replay: replayQueueReceipt, confirm: confirmQueueChange, accept: acceptQueueReceipt, pending: pendingQueueChanges } = useRoomQueueDelivery(room, joinedAsGuest, mediaHostId, p2p.send, setQueueNotice);
  const matchingLocalSource = localShare && sharedVideoId === `local:${localShare.fingerprint}` ? localVideoUrl : "";
  const libraryLocalSource = !joinedAsGuest ? resolvedRoomSource?.id === sharedVideoId ? resolvedRoomSource.url : !sharedVideo?.remote ? sharedVideo?.src ?? "" : "" : "";
  const hostLocalSource = !joinedAsGuest ? matchingLocalSource || libraryLocalSource : "";
  useEffect(() => {
    if (joinedAsGuest || !sharedVideo || sharedVideo.remote || !room || sharedVideo.id.startsWith("local:")) return;
    let cancelled = false;
    const release = pinPlayUrl(sharedVideo.id);
    void resolvePlayUrl(sharedVideo).then((url) => {
      if (!cancelled) setResolvedRoomSource({ id: sharedVideo.id, url });
    }).catch((error) => { if (!cancelled) setInviteNotice(error instanceof Error ? error.message : "The host could not open this local file."); });
    return () => { cancelled = true; release(); };
  }, [joinedAsGuest, sharedVideo, room]);
  const localStream = useRoomLocalStream(roomVideoRef, hostLocalSource, Boolean(room) && !joinedAsGuest, p2p.setMediaStream);
  const roomMedia = useMemo(() => {
    const descriptor = describeRoomMedia(sharedVideo, sharedVideoId === `local:${localShare?.fingerprint}` ? localShare : null);
    const seconds = measuredDuration?.videoId === sharedVideoId ? measuredDuration.seconds : descriptor?.duration;
    return descriptor?.kind === "local" ? { ...descriptor, duration:typeof seconds === "number" && Number.isFinite(seconds) && seconds>0 ? Math.min(seconds,12*60*60) : undefined, streamId: localStream.streamId || undefined } : descriptor;
  }, [sharedVideo, sharedVideoId, localShare, localStream.streamId, measuredDuration]);
  const roomQueueMedia = useMemo(() => queue.map(id => {
    const file = localFiles.current.get(id);
    const share = file ? { name: file.name, fingerprint: localRoomFingerprint(file), size: file.size, modified: file.lastModified } : undefined;
    return describeRoomMedia(lookupVideo(videos,id) ?? sharedRoomVideos[id], share);
  }).filter(Boolean), [videos, queue, sharedRoomVideos]);
  const incomingStream = p2p.mediaStreams[mediaHostId];
  const guestLocalStream = joinedAsGuest && !matchingLocalSource && sharedLocalMedia?.id === sharedVideoId && sharedLocalMedia.streamId === incomingStream?.id ? incomingStream : undefined;
  const timingAdjustsPlayback = Boolean(sharedVideo?.remote
    ? !sharedVideo.remote.live && !twitchClip && ["youtube", "twitch"].includes(sharedVideo.remote.kind)
    : matchingLocalSource && localShareIsMatched && !guestLocalStream);
  guestPlayerOffset.current = joinedAsGuest && timingAdjustsPlayback ? guestOffset : 0;
  const devicePlaybackPosition = guestPlaybackPosition(playback.position, guestPlayerOffset.current, roomDuration());
  const adjustedTimerPosition = guestPlaybackPosition(playback.position, joinedAsGuest ? guestOffset : 0, roomDuration());
  const changeGuestOffset = (seconds: number) => {
    const value = normalizeGuestOffset(seconds);
    applyingRemotePlaybackUntil.current = Date.now() + 1200;
    suppressRemotePlayerEchoUntil.current = Date.now() + 1200;
    setGuestOffset(value);
    try { localStorage.setItem("reelcase.watch-room.guest-offset.v1", String(value)); } catch { /* Session adjustment still works. */ }
  };
  const acceptRoomMedia = useCallback((from: string, value: unknown, id?: string) => {
    const resolved = resolveRoomMedia(value);
    if (!resolved || resolved.descriptor.id !== id) return;
    setMediaHostId(from);
    setSharedLocalMedia(resolved.descriptor.kind === "local" ? resolved.descriptor : null);
    if (resolved.video) adoptRoomMedia([value], [resolved.descriptor.id, ...queueRef.current]);
    if (resolved.descriptor.local) setPendingLocalShare(resolved.descriptor.local);
  }, [adoptRoomMedia]);
  const invitation = useRoomInvitation(activeRoom ?? roomCode);
  const roomInvite = invitation.url;
  useEffect(() => {
    setSharedRoomVideos({});
    setSharedLocalMedia(null);
    setMediaHostId("");
    queueRevisionRef.current = 0;
    queueRef.current = queue;
    if(joinedAsGuest) {queueRef.current=[];setQueue([]);setSharedVideoId('');}
    setQueueNotice('');
    lastAcceptedQueueRevision.current = 0;
    lastAcceptedTimelineAt.current = 0;
    lastAcceptedRoomStateAt.current = 0;
    setRoomHealth({ lastPublishedAt: 0, lastHostStateAt: 0, lastQueueAt: 0, lastDriftSeconds: 0, queueRevision: 0, queueRequests: 0, queueAccepted: 0, staleDropped: 0, resyncRequests: 0 });
    if (!room) { setRoomLedger([]); setLedgerRoom(""); return; }
    try {
      const stored = JSON.parse(localStorage.getItem(`reelcase.watch-room.ledger.v1:${room}`) ?? "[]");
      setRoomLedger(Array.isArray(stored) ? stored.filter((item): item is RoomLedgerEvent => Boolean(item && typeof item.at === "number" && typeof item.kind === "string" && typeof item.detail === "string")).slice(-32) : []);
    } catch { setRoomLedger([]); }
    setLedgerRoom(room);
  }, [room]);
  useEffect(() => {
    if (!room || ledgerRoom !== room) return;
    try { localStorage.setItem(`reelcase.watch-room.ledger.v1:${room}`, JSON.stringify(roomLedger.slice(-32))); } catch { /* diagnostics are best-effort */ }
  }, [ledgerRoom, room, roomLedger]);
  const noteRoom = useCallback((kind: RoomLedgerEvent["kind"], detail: string) => {
    if (!room) return;
    setRoomLedger((events) => [...events, { at: Date.now(), kind, detail }].slice(-32));
  }, [room]);
  useEffect(() => {
    if (!room || ledgerRoom !== room) return;
    noteRoom("session", `Opened as ${joinedAsGuest ? "guest" : "host"}; room commands require a fresh host state.`);
  }, [joinedAsGuest, ledgerRoom, noteRoom, room]);
  useEffect(() => {
    if (!localVideo) { setLocalVideoSource(null); return; }
    const url = URL.createObjectURL(localVideo);
    setLocalVideoSource({file:localVideo,url});
    return () => URL.revokeObjectURL(url);
  }, [localVideo]);
  useEffect(() => {
    localStorage.removeItem("reelcase.watch-room.pending-video");
  }, []);
  // Open local file sources only when selected; allocating URLs for the whole
  // catalog would waste memory. Guests receive provider metadata or RTC media.
  useEffect(() => {
    if (!activeRoom) {
      setRoomCandidates([]);
      setRoomCandidatesPending(false);
      setRoomSearchResults([]);
      return;
    }
    const controller = new AbortController();
    setRoomCandidates([]);
    setRoomCandidatesPending(true);
    const turn = catalogTurn(controller.signal);
    void prepareRoomCandidates({
      videos, shared: sharedRoomVideos, guest: joinedAsGuest, favorites, hidden: hiddenVideos,
      unavailable, history, seed: candidateSeed, canStage: canStageRoomVideo, rank: roomShuffleRank,
    }, turn).then((rows) => {
      if (controller.signal.aborted) return;
      setRoomCandidates(rows);
      setRoomCandidatesPending(false);
    }).catch(() => {
      if (!controller.signal.aborted) {
        setRoomCandidates([]);
        setRoomCandidatesPending(false);
        setInviteNotice("Room recommendations could not be prepared. Try reopening the room.");
      }
    });
    return () => controller.abort();
  }, [activeRoom, candidateSeed, favorites, hiddenVideos, history, videos, joinedAsGuest, sharedRoomVideos, unavailable]);
  useEffect(() => {
    if (!activeRoom || roomCandidatesPending) { setRoomSearchPending(false); return; }
    const controller = new AbortController();
    setRoomSearchPending(true);
    void searchRoomCandidates(roomCandidates, deferredRoomSearch, deferredRoomSearch.trim() ? 20 : 12, catalogTurn(controller.signal))
      .then(rows => { if (!controller.signal.aborted) { setRoomSearchResults(rows); setRoomSearchPending(false); } })
      .catch(() => { if (!controller.signal.aborted) setRoomSearchPending(false); });
    return () => controller.abort();
  }, [activeRoom, deferredRoomSearch, roomCandidates, roomCandidatesPending]);
  useEffect(() => { const refresh = () => setRoomRatingRevision((value) => value + 1); window.addEventListener("reelcase:rating-change", refresh); return () => window.removeEventListener("reelcase:rating-change", refresh); }, []);
  const localQueueCandidates = useMemo(
    () => {
      if (!roomLocalToolsOpen) return [];
      const result: LibraryVideo[] = [];
      for (const video of roomCandidates) {
        if (video.remote || video.id === sharedVideoId || queue.includes(video.id)) continue;
        result.push(video);
        if (result.length === 18) break;
      }
      return result;
    },
    [queue, roomCandidates, roomLocalToolsOpen, sharedVideoId],
  );
  const youtubeRoomCandidates = useMemo(() => roomCandidates.filter((video) => video.remote?.kind === "youtube"), [roomCandidates]);
  const queueRecommendations = useMemo(() => {
    const alreadyShown = new Set(roomCandidates.slice(0, roomPickLimit).map((video) => video.id));
    const queued = new Set(queue);
    const unseen: LibraryVideo[] = [];
    for (const video of roomCandidates) {
      if (video.id === sharedVideoId || queued.has(video.id) || alreadyShown.has(video.id)) continue;
      unseen.push(video);
      if (unseen.length === 12) break;
    }
    // Small libraries may not have a second pool yet; keep the control useful.
    return (unseen.length ? unseen : roomCandidates.filter((video) => video.id !== sharedVideoId && !queued.has(video.id))).slice(0, 12);
  }, [candidateSeed, queue, roomCandidates, roomPickLimit, sharedVideoId]);
  useEffect(() => {
    // Changing every candidate/queue rail while watching needlessly reranked
    // the full room catalog. Keep manual shuffle available during playback.
    if (!activeRoom || playback.playing) return;
    return registerPeriodicTask({ name: 'Room discoveries', everyMs: 30_000, work: () => setCandidateSeed(Date.now()) }).cancel;
  }, [activeRoom, playback.playing]);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invitedRoom = (params.get("room") ?? "").trim().toUpperCase();
    if (!/^RC[A-Z0-9]{4,12}$/.test(invitedRoom)) return;
    setRoomInput(invitedRoom);
    if (params.get("theater") === "1") {
      setJoinedAsGuest(true);
      setStageSize("cinema");
      setActiveRoom(invitedRoom);
    }
  }, []);
  useEffect(() => {
    // Host is the authoritative publisher. Previously guests echoed the
    // room-state they had just received, which could race a newer host state.
    if (joinedAsGuest || !p2p.peers.length) return;
    const sentAt = Date.now();
    queueRevisionRef.current = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current);
    p2p.send({
      type: "room-state",
      playing: playback.playing,
      position: playback.position,
      videoId: sharedVideoId,
      media: roomMedia,
      queue,
      queueMedia: roomQueueMedia,
      localQueue,
      queueRevision: queueRevisionRef.current,
      sentAt,
    });
    setRoomHealth((health) => ({ ...health, lastPublishedAt: sentAt, queueRevision: queueRevisionRef.current }));
  }, [joinedAsGuest, localQueue, p2p.readyRevision, p2p.peers.length, playback.playing, playback.position, queue, roomMedia, roomQueueMedia, sharedVideoId]);
  useEffect(() => {
    // Registration can finish before the host has installed its listener or a
    // peer channel has opened. Retry until a fresh state actually arrives.
    if (!joinedAsGuest || !p2p.joined || lastAcceptedRoomStateAt.current) return;
    let attempts = 0;
    const request = () => {
      if (lastAcceptedRoomStateAt.current || ++attempts > 8) { task.cancel(); return; }
      p2p.send({ type: "resync-request", sentAt: Date.now() });
      setRoomHealth((health) => ({ ...health, resyncRequests: health.resyncRequests + 1 }));
      if (attempts === 1) noteRoom("request", "Requested the host’s initial state.");
    };
    const task = registerPeriodicTask({ name: 'Room initial sync', mode: 'always', background: false,
      firstMs: 0, everyMs: 1_500, work: request });
    return task.cancel;
  }, [joinedAsGuest, noteRoom, p2p.joined, p2p.readyRevision, p2p.send, room]);
  useEffect(
    () =>
      p2p.onMessage((from, raw, channel) => {
        const data = raw as {
          type?: string;
          text?: string;
          name?: string;
          playing?: boolean;
          position?: number;
          sentAt?: number;
          seek?: boolean;
          videoId?: string;
          media?: RoomMediaDescriptor;
          queue?: string[];
          queueMedia?: unknown[];
          queueRevision?: number;
          localQueue?: LocalRoomShare[];
          fingerprint?: string;
          size?: number;
          modified?: number;
          action?: "play" | "stage";
          operation?: unknown;
          requestId?: string;
          skipped?: number;
          duplicates?: number;
          truncated?: boolean;
        };
        if (data.type === "chat" && data.text)
          setChat((rows) => [...rows, `${data.name ?? from}: ${data.text}`].slice(-50));
        if (data.type === "room-pulse") p2p.send({ type: "room-pulse-ack", sentAt: data.sentAt }, from);
        if (data.type === "room-pulse-ack" && data.sentAt) setPulseStatus(`Chat transport confirmed · ${Math.max(0, Date.now() - data.sentAt)}ms round trip.`);
        if (data.type === "share-ready" && data.name && data.fingerprint) {
          const share = { name: data.name, fingerprint: data.fingerprint, size: Number(data.size) || 0, modified: Number(data.modified) || 0 };
          setPendingLocalShare(share);
          setInviteNotice(`${data.name} is shared by the host. Playback streams to this device; choosing a matching local copy is optional.`);
        }
        if (data.type === "share-matched" && data.name && data.fingerprint) {
          setLocalShareMatches((matches) => ({ ...matches, [from]: { name: data.name!, fingerprint: data.fingerprint!, at: Date.now() } }));
          setInviteNotice(`${data.name} was matched by a guest. The approved local copy can now follow the room timeline.`);
        }
        if (data.type === "sync-request" && !joinedAsGuest) {
          const sentAt = trustedRoomSentAt(data.sentAt);
          if (!sentAt) {
            setRoomHealth((health) => ({ ...health, staleDropped: health.staleDropped + 1 }));
            noteRoom("dropped", "Ignored a guest playback request with an invalid clock.");
          } else {
            noteRoom("request", data.seek ? "Accepted a guest timeline seek request." : "Accepted a guest playback request.");
            if (data.videoId && data.videoId !== sharedVideoId) {
              noteRoom("dropped", "Ignored a playback request for a different video.");
            } else {
              const requested = typeof data.position === "number" && Number.isFinite(data.position) ? data.position : playback.position;
              sync({ playing: Boolean(data.playing), position: clampRoomClock(requested) }, Boolean(data.seek), true);
            }
          }
        }
        if (data.type === "sync") {
          // Only guests consume canonical playback packets. The host remains
          // the clock leader even when guests make a control request.
          if (!joinedAsGuest) return;
          const sentAt = trustedRoomSentAt(data.sentAt);
          if (!sentAt || sentAt + 500 < lastAcceptedTimelineAt.current) {
            setRoomHealth((health) => ({ ...health, staleDropped: health.staleDropped + 1 }));
            noteRoom("dropped", "Ignored an expired or out-of-order playback command.");
            return;
          }
          // A late provider event from the title that was just replaced must
          // never rewind the current room. Sync packets now carry their title
          // identity, while legacy packets retain the conservative clock guard.
          if (data.videoId && currentVideoIdRef.current && data.videoId !== currentVideoIdRef.current) return;
          const position = Number(data.position) || 0;
          const elapsed = data.playing ? Math.max(0, (Date.now() - sentAt) / 1000) : 0;
          const nextPosition = position + elapsed;
          // Old iframe events can occasionally report 0 after a pause. Unless
          // this is an explicit seek/new-video command, never let that stale
          // value rewind an established room timeline.
          const safePosition = clampRoomClock(!data.seek && nextPosition < lastRoomPosition.current
            ? lastRoomPosition.current
            : nextPosition, data.videoId);
          const drift = Math.abs(safePosition - playback.position);
          lastAcceptedTimelineAt.current = sentAt;
          lastRoomPosition.current = safePosition;
          youtubePlaybackStartedAt.current = data.playing ? Date.now() - safePosition * 1000 : null;
          applyingRemotePlaybackUntil.current = Date.now() + 900;
          setTimelineEvidence({ source: "remote", at: Date.now() });
          if (data.seek || drift > 0.75) setRemoteSeekNonce((value) => value + 1);
          setPlayback({ playing: Boolean(data.playing), position: safePosition });
          setRoomHealth((health) => ({ ...health, lastDriftSeconds: drift, lastHostStateAt: Date.now() }));
          if (drift >= 1) noteRoom("timeline", `Reconciled ${drift.toFixed(1)}s of playback drift over ${channel}.`);
        }
        if (data.type === "video" && data.videoId && joinedAsGuest) {
          setSharedVideoId(data.videoId);
          acceptRoomMedia(from, data.media, data.videoId);
        }
        if (data.type === "video-request" && data.videoId && !joinedAsGuest) {
          const requested = resolveGuestRoomVideo(data.videoId,data.media);
          if (requested) { noteRoom("request", "Accepted a guest video request."); chooseVideo(requested,data.action==='play'); }
          else p2p.send({type:"video-rejected",text:"The host cannot open that file. Ask the host to choose and queue it; public YouTube and Twitch links can be shared directly."},from);
        }
        if (data.type === "video-rejected" && joinedAsGuest) setInviteNotice(data.text?.slice(0,300) || "The host could not play that title.");
        if (data.type === "next-request" && !joinedAsGuest && data.videoId === currentVideoIdRef.current) playNext();
        if (data.type === "queue-shuffle" && !joinedAsGuest && typeof data.requestId === "string" && data.requestId.length <= 160) {
          if (replayQueueReceipt(from, data.requestId)) return;
          shuffleQueue();
          confirmQueueChange(from, data.requestId, "Queue shuffle confirmed by the host.");
        }
        if (data.type === 'queue-action' && !joinedAsGuest) {
          let operation = parseRoomQueueAction(data.operation);
          if (!operation || typeof data.requestId !== 'string' || data.requestId.length>160) return;
          if (replayQueueReceipt(from, data.requestId)) return;
          const addsTitle = operation.kind === 'add' || operation.kind === 'next';
          const requested = addsTitle ? resolveGuestRoomVideo(operation.id,data.media) : undefined;
          if (addsTitle && !requested) {
            confirmQueueChange(from,data.requestId,'This title is unavailable on the host. YouTube and Twitch links can be shared; local files must be opened by the host.');
            return;
          }
          if (requested) operation = { ...operation, id: requested.id };
          if (operation.id === currentVideoIdRef.current || operation.kind === 'add' && queueRef.current.includes(operation.id)) {
            confirmQueueChange(from,data.requestId,'That video is already playing or queued.');
            return;
          }
          if (addsTitle && !queueRef.current.includes(operation.id) && queueRef.current.length >= ROOM_QUEUE_LIMIT) {
            confirmQueueChange(from,data.requestId,'The queue is full. Remove a title before adding another.');
            return;
          }
          publishQueue(applyRoomQueueAction(queueRef.current,operation));
          confirmQueueChange(from,data.requestId,'Queue change confirmed by the host.');
          noteRoom('queue',`Applied a guest ${operation.kind} action to the latest queue.`);
        }
        if (data.type === "queue-batch" && !joinedAsGuest && Array.isArray(data.queueMedia) && typeof data.requestId === "string" && data.requestId.length <= 160) {
          if (replayQueueReceipt(from, data.requestId)) return;
          const result=queueLinkBatch(data.queueMedia);
          const skipped=result.invalid+Math.min(48,Math.max(0,Number(data.skipped)||0));
          const duplicates=result.duplicates+Math.min(48,Math.max(0,Number(data.duplicates)||0));
          confirmQueueChange(from,data.requestId,batchQueueNotice({...result,invalid:skipped,duplicates},Boolean(data.truncated)));
        }
        if (data.type === "queue-result" && joinedAsGuest && typeof data.requestId === "string") acceptQueueReceipt(from, data.requestId, data.text || "");
        if (data.type === "queue-batch-result" && joinedAsGuest) setQueueNotice(data.text?.slice(0,300)||"The host checked your queue links.");
        if (data.type === 'queue-rejected' && joinedAsGuest) setQueueNotice(data.text?.slice(0,300) || 'The host could not apply this queue change.');
        if (data.type === "queue-request" && Array.isArray(data.queue) && !joinedAsGuest) {
          if (data.queueRevision !== queueRevisionRef.current) {
            p2p.send({type:'queue',queue:queueRef.current,queueMedia:roomQueueMedia,queueRevision:queueRevisionRef.current,sentAt:Date.now()},from);
            return;
          }
          // A guest can only propose titles the host can actually stage. This
          // prevents an out-of-date catalog or arbitrary packet from adding a
          // permanent “Unavailable title” entry to the canonical queue.
          const requested = normalizeRoomQueue(data.queue).filter((id) => id !== sharedVideoId && Boolean(lookupVideo(videos, id) && canStageRoomVideo(lookupVideo(videos, id)!)));
          const revision = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current) + 1;
          queueRevisionRef.current = revision;
          lastAcceptedQueueRevision.current = revision;
          queueRef.current = requested;
          setQueue(requested);
          p2p.send({ type: "queue", queue: requested, queueMedia: requested.map((id) => describeRoomMedia(videos.find((video) => video.id === id))), queueRevision: revision, sentAt: Date.now() });
          setRoomHealth((health) => ({ ...health, queueAccepted: health.queueAccepted + 1, queueRevision: revision, lastQueueAt: Date.now() }));
          noteRoom("queue", `Accepted a guest queue proposal as revision ${revision}.`);
        }
        if (data.type === "queue" && Array.isArray(data.queue) && joinedAsGuest) {
          const revision = Number.isInteger(data.queueRevision) && Number(data.queueRevision) >= 0 ? Number(data.queueRevision) : 0;
          if (revision < lastAcceptedQueueRevision.current) {
            setRoomHealth((health) => ({ ...health, staleDropped: health.staleDropped + 1 }));
            noteRoom("dropped", `Ignored stale queue revision ${revision}.`);
          } else {
            const accepted = normalizeRoomQueue(data.queue);
            if (revision) lastAcceptedQueueRevision.current = revision;
            queueRef.current = accepted;
            setQueue(accepted);
            if (Array.isArray(data.queueMedia)) adoptRoomMedia(data.queueMedia, [currentVideoIdRef.current, ...accepted]);
            setRoomHealth((health) => ({ ...health, queueRevision: revision || health.queueRevision, lastQueueAt: Date.now() }));
          }
        }
        if (data.type === "local-queue-request" && Array.isArray(data.localQueue) && !joinedAsGuest) {
          const requested = normalizeLocalRoomQueue(data.localQueue);
          setLocalQueue(requested);
          p2p.send({ type: "local-queue", localQueue: requested, sentAt: Date.now() });
          noteRoom("queue", "Accepted a guest local-handoff queue proposal.");
        }
        if (data.type === "local-queue" && Array.isArray(data.localQueue) && joinedAsGuest) setLocalQueue(normalizeLocalRoomQueue(data.localQueue));
        if (data.type === "local-stage-request" && data.fingerprint && !joinedAsGuest) {
          const requested = localQueue.find((share) => share.fingerprint === data.fingerprint);
          if (requested) { noteRoom("request", "Accepted a guest request to stage a local handoff."); stageLocalShare(requested); }
        }
        if (data.type === "party-vote" && data.name) setPartyVotes((votes) => ({ ...votes, [data.name!]: Number(data.position) || 0 }));
        if (data.type === "room-state") {
          if (!joinedAsGuest) return;
          const sentAt = trustedRoomSentAt(data.sentAt);
          if (!sentAt || sentAt + 500 < lastAcceptedRoomStateAt.current) {
            setRoomHealth((health) => ({ ...health, staleDropped: health.staleDropped + 1 }));
            noteRoom("dropped", "Ignored an expired or out-of-order host state.");
            return;
          }
          const videoChanged = Boolean(data.videoId && data.videoId !== currentVideoIdRef.current);
          if (data.videoId) setSharedVideoId(data.videoId);
          acceptRoomMedia(from, data.media, data.videoId);
          if (Array.isArray(data.queue)) {
            const revision = Number.isInteger(data.queueRevision) && Number(data.queueRevision) >= 0 ? Number(data.queueRevision) : 0;
            if (revision >= lastAcceptedQueueRevision.current) {
              if (revision) lastAcceptedQueueRevision.current = revision;
              queueRef.current = normalizeRoomQueue(data.queue);
              setQueue(queueRef.current);
              if (Array.isArray(data.queueMedia)) adoptRoomMedia(data.queueMedia, [currentVideoIdRef.current, ...queueRef.current]);
              setRoomHealth((health) => ({ ...health, queueRevision: revision || health.queueRevision, lastQueueAt: Date.now() }));
            } else {
              setRoomHealth((health) => ({ ...health, staleDropped: health.staleDropped + 1 }));
              noteRoom("dropped", `Ignored stale queue revision ${revision} in a room state.`);
            }
          }
          if (Array.isArray(data.localQueue)) setLocalQueue(normalizeLocalRoomQueue(data.localQueue));
          const position = Number(data.position) || 0;
          const elapsed = data.playing ? Math.max(0, (Date.now() - sentAt) / 1000) : 0;
          const nextPosition = position + elapsed;
          const safePosition = clampRoomClock(!videoChanged && nextPosition + 0.75 < lastRoomPosition.current ? lastRoomPosition.current : nextPosition, data.videoId);
          const drift = Math.abs(safePosition - playback.position);
          lastAcceptedRoomStateAt.current = sentAt;
          lastAcceptedTimelineAt.current = Math.max(lastAcceptedTimelineAt.current, sentAt);
          lastRoomPosition.current = safePosition;
          youtubePlaybackStartedAt.current = data.playing ? Date.now() - safePosition * 1000 : null;
          applyingRemotePlaybackUntil.current = Date.now() + 900;
          setTimelineEvidence({ source: "remote", at: Date.now() });
          if (videoChanged || drift > 0.75) setRemoteSeekNonce((value) => value + 1);
          setPlayback({ playing: Boolean(data.playing), position: safePosition });
          setRoomHealth((health) => ({ ...health, lastHostStateAt: Date.now(), lastDriftSeconds: drift }));
          if (drift >= 1) noteRoom("timeline", `Reconciled ${drift.toFixed(1)}s from the authoritative room state.`);
        }
        if (data.type === "resync-request" && !joinedAsGuest) {
          const position = currentHostClock();
          const sentAt = Date.now();
          p2p.send({ type: "room-state", playing: playback.playing, position, videoId: sharedVideoId, media: roomMedia, queue, queueMedia: roomQueueMedia, localQueue, queueRevision: queueRevisionRef.current, sentAt }, from);
          setRoomHealth((health) => ({ ...health, lastPublishedAt: sentAt }));
          noteRoom("state", "Sent a targeted state reconciliation to a guest.");
        }
      }),
    [joinedAsGuest, localQueue, noteRoom, p2p.onMessage, p2p.send, playback.playing, playback.position, queue, sharedVideoId, videos, sharedRoomVideos, measuredDuration, acceptRoomMedia, roomMedia, roomQueueMedia, replayQueueReceipt, confirmQueueChange, acceptQueueReceipt],
  );
  const sync = (next: { playing: boolean; position: number }, seek = false, explicit = false) => {
    if (!seek && !explicit && Date.now() < applyingRemotePlaybackUntil.current) return;
    if (joinedAsGuest) {
      p2p.send({ type: "sync-request", ...next, videoId: sharedVideoId, seek, sentAt: Date.now() });
      setInviteNotice("Playback change sent to the host. Your theater will reconcile when it is confirmed.");
      noteRoom("request", seek ? "Requested a host timeline seek." : "Requested a host playback update.");
      return;
    }
    // The YouTube iframe cannot expose its live time without a separate API
    // event bridge. Keep an accurate-enough local clock between room commands
    // so Pause does not broadcast the original zero timestamp back to guests.
    const isYoutube = sharedVideo?.remote?.kind === "youtube";
    const isTwitch = sharedVideo?.remote?.kind === "twitch";
    const playerPosition = isTwitch ? twitchPlayerRef.current?.getCurrentTime() : undefined;
    const hasTwitchPosition = typeof playerPosition === "number" && Number.isFinite(playerPosition) && playerPosition > 0.25;
    // Provider event handlers occasionally emit a transient zero immediately
    // after Play/Pause. That is not a seek. Never let it overwrite an
    // established VOD timeline unless the user explicitly asked to seek.
    const providerFallback = lastRoomPosition.current > 0.25 && next.position <= 0.25 && !seek;
    // A provider pause is a time capture, not a seek. Its callback can be
    // late (or transiently zero), so freeze the furthest trusted local clock.
    const providerClock = estimatedProviderPosition(lastRoomPosition.current, playback.position, playback.playing ? youtubePlaybackStartedAt.current : null, Date.now());
    const position = !seek && !sharedVideo?.remote && roomVideoRef.current ? roomVideoRef.current.currentTime : seek ? next.position : (isYoutube || isTwitch) && !next.playing
      ? Math.max(providerClock, next.position)
      : isTwitch
        ? hasTwitchPosition
          ? Math.max(playerPosition, providerClock, next.position)
          : providerFallback ? providerClock : Math.max(providerClock, next.position)
        : providerFallback
          ? providerClock
          : isYoutube ? Math.max(providerClock, next.position) : next.position;
    const resolved = { ...next, position: clampRoomClock(position) };
    lastRoomPosition.current = resolved.position;
    youtubePlaybackStartedAt.current = resolved.playing ? Date.now() - resolved.position * 1000 : null;
    setTimelineEvidence({ source: sharedVideo?.remote ? "estimated" : "local", at: Date.now() });
    setPlayback(resolved);
    if (resolved.playing && sharedVideoId && !sharedVideoId.startsWith("local:") && lastRoomHistoryId.current !== sharedVideoId) {
      lastRoomHistoryId.current = sharedVideoId;
      recordPlay(sharedVideoId, "watch-room");
    }
    if (seek) setRemoteSeekNonce((value) => value + 1);
    const sentAt = Date.now();
    p2p.send({ type: "sync", ...resolved, videoId: sharedVideoId, seek, sentAt });
    setRoomHealth((health) => ({ ...health, lastPublishedAt: sentAt }));
  };
  const syncDevicePlayback = (next: { playing: boolean; position: number }, seek = false) => {
    // Programmatic device alignment must not become a room-wide seek or echo.
    if (joinedAsGuest && Date.now() < applyingRemotePlaybackUntil.current) return;
    sync({ ...next, position: hostPlaybackPosition(next.position, guestPlayerOffset.current, roomDuration()) }, seek);
  };
  useEffect(() => {
    if (!joinedAsGuest) return;
    applyingRemotePlaybackUntil.current = Date.now() + 1200;
    suppressRemotePlayerEchoUntil.current = Date.now() + 1200;
    setRemoteSeekNonce(value => value + 1);
  }, [guestOffset, joinedAsGuest]);
  useEffect(() => {
    // Iframe providers do not continuously expose a readable clock. Maintain
    // a conservative room estimate between controls and have only the host
    // publish a heartbeat, preventing the old guest echo loop at position 0.
    const provider = sharedVideo?.remote?.kind;
    if (!provider || !playback.playing || !youtubePlaybackStartedAt.current) return;
    const task = registerPeriodicTask({ name: 'Room playback clock', mode: 'always', background: false, everyMs: 1_000, work: () => {
      const twitchTime = provider === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : undefined;
      const actual = typeof twitchTime === "number" && twitchTime > 0.25 ? hostPlaybackPosition(twitchTime, guestPlayerOffset.current, roomDuration()) : undefined;
      const estimated = clampRoomClock(actual ?? estimatedProviderPosition(lastRoomPosition.current, playback.position, youtubePlaybackStartedAt.current, Date.now()));
      if (provider === "twitch" && !twitchPlayingRef.current) return;
      if (estimated <= lastRoomPosition.current + 0.2) return;
      lastRoomPosition.current = estimated;
      setPlayback((current) => current.playing ? { ...current, position: estimated } : current);
      setTimelineEvidence({ source: actual === undefined ? "estimated" : "local", at: Date.now() });
      if (!joinedAsGuest) p2p.send({ type: "sync", playing: true, position: estimated, videoId: sharedVideoId, seek: false, sentAt: Date.now() });
    } });
    return task.cancel;
  }, [joinedAsGuest, p2p.send, playback.playing, sharedVideo?.id, sharedVideo?.remote?.kind]);
  const resync = () => {
    if (joinedAsGuest) {
      p2p.send({ type: "resync-request", sentAt: Date.now() });
      setRoomHealth((health) => ({ ...health, resyncRequests: health.resyncRequests + 1 }));
      noteRoom("request", "Requested an explicit host state reconciliation.");
      setInviteNotice("Requested the host’s current room state.");
      return;
    }
    const position = currentHostClock();
    const playing = roomVideoRef.current ? !roomVideoRef.current.paused : playback.playing;
    lastRoomPosition.current = position;
    youtubePlaybackStartedAt.current = playing ? Date.now() - position * 1000 : null;
    setPlayback({ playing, position });
    const sentAt = Date.now();
    p2p.send({ type: "room-state", playing, position, videoId: sharedVideoId, media: roomMedia, queue, queueMedia: roomQueueMedia, localQueue, queueRevision: queueRevisionRef.current, sentAt });
    setRoomHealth((health) => ({ ...health, lastPublishedAt: sentAt }));
    noteRoom("state", "Published an explicit room reconciliation.");
    setInviteNotice("Sent the current video and timeline to every guest.");
  };
  useEffect(() => {
    const media = roomVideoRef.current;
    if (!media || sharedVideo?.remote) return;
    let cancelled = false;
    const driftLimit = playback.playing ? 0.65 : 0.1;
    if (Math.abs(media.currentTime - devicePlaybackPosition) > driftLimit) {
      if (joinedAsGuest) applyingRemotePlaybackUntil.current = Date.now() + 900;
      media.currentTime = devicePlaybackPosition;
    }
    if (playback.playing && media.paused) void media.play().catch((error: unknown) => {
      if (cancelled || roomVideoRef.current !== media) return;
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setInviteNotice("This browser needs a Play press to start the local video.");
        if (!joinedAsGuest) sync({ playing: false, position: media.currentTime });
      }
    });
    if (!playback.playing && !media.paused) media.pause();
    return () => { cancelled = true; };
  }, [playback, sharedVideo, libraryLocalSource, matchingLocalSource, joinedAsGuest, devicePlaybackPosition]);
  useEffect(() => {
    // YouTube's iframe API accepts command messages once enablejsapi=1 is in
    // the URL. This keeps the in-room controls meaningful instead of merely
    // changing a label beside an uncontrolled embed.
    if (sharedVideo?.remote?.kind !== "youtube" || remoteFrameReady?.id !== sharedVideo.id) return;
    const frame = remoteFrameRef.current?.contentWindow;
    if (!frame) return;
    const target = new URL(watchRoomEmbed(sharedVideo)).origin;
    // Seeking is destructive for an iframe player. Do it only for an explicit
    // +/- seek (or a newly selected video), never as a side effect of Pause.
    if (remoteSeekNonce !== lastYoutubeSeekNonce.current) {
      lastYoutubeSeekNonce.current = remoteSeekNonce;
      if (remoteSeekNonce && !sharedVideo.remote.live) {
        suppressRemotePlayerEchoUntil.current = Date.now() + 1000;
        frame.postMessage(JSON.stringify({ event: "command", func: "seekTo", args: [devicePlaybackPosition, true] }), target);
      }
    }
    frame.postMessage(JSON.stringify({ event: "command", func: playback.playing ? "playVideo" : "pauseVideo", args: [] }), target);
  }, [playback.playing, remoteFrameReady, remoteSeekNonce, sharedVideo?.id, guestOffset]);
  useEffect(() => {
    if (sharedVideo?.remote?.kind !== "twitch" || twitchClip) { twitchPlayerRef.current = null; return; }
    const host = twitchPlayerHostRef.current;
    if (!host) return;
    let cancelled = false;
    const hostId = `reelcase-twitch-${p2p.selfId}`;
    host.id = hostId;
    host.replaceChildren();
    twitchPlayingRef.current = false;
    setTwitchActuallyPlaying(false);
    setTwitchPlayerReady(0);
    lastTwitchSeekNonce.current = -1;
    setTwitchPlayerStatus("Loading Twitch interactive player…");
    void loadTwitchEmbed().then((api) => {
      if (cancelled) return;
      const live = Boolean(sharedVideo.remote?.live);
      const rawVideo = sharedVideo.remote?.videoId ?? "";
      const video = rawVideo ? (rawVideo.startsWith("v") ? rawVideo : `v${rawVideo}`) : undefined;
      const player = new api.Player(hostId, {
        width: "100%", height: "100%", parent: [window.location.hostname], autoplay: false, muted: false,
        ...(live ? { channel: sharedVideo.remote?.watchUrl?.split("/").pop() } : { video }),
      });
      twitchPlayerRef.current = player;
      lastTwitchPlaybackCommand.current = null;
      const events = player.constructor as { READY?: string; PLAY?: string; PAUSE?: string; SEEK?: string; PLAYING?: string; PLAYBACK_BLOCKED?: string; ENDED?:string };
      player.addEventListener(events.READY ?? "ready", () => { if (!cancelled) {
        const duration = player.getDuration?.();
        if (!live && typeof duration === "number" && Number.isFinite(duration) && duration > 0) setMeasuredDuration({ videoId: sharedVideo.id, seconds: duration });
        setTwitchPlayerStatus("Twitch player ready. Use room controls to start."); setTwitchPlayerReady(Date.now());
      } });
      player.addEventListener(events.PLAY ?? "play", () => { const position = player.getCurrentTime(); if (!cancelled && Date.now() > suppressRemotePlayerEchoUntil.current) syncDevicePlayback({ playing: true, position: position > 0.25 ? position : guestPlaybackPosition(playback.position, guestPlayerOffset.current) }); });
      player.addEventListener(events.PAUSE ?? "pause", () => { twitchPlayingRef.current = false; setTwitchActuallyPlaying(false); const position = player.getCurrentTime(); if (!cancelled && Date.now() > suppressRemotePlayerEchoUntil.current) syncDevicePlayback({ playing: false, position: position > 0.25 ? position : guestPlaybackPosition(playback.position, guestPlayerOffset.current) }); });
      player.addEventListener(events.SEEK ?? "seek", () => { if (!cancelled && !live && Date.now() > suppressRemotePlayerEchoUntil.current) syncDevicePlayback({ playing: true, position: player.getCurrentTime() }, true); });
      player.addEventListener(events.PLAYING ?? "playing", () => { if (!cancelled) { twitchPlayingRef.current = true; setTwitchActuallyPlaying(true); setTwitchPlayerStatus("Twitch playback started."); } });
      player.addEventListener(events.PLAYBACK_BLOCKED ?? "playback-blocked", () => { if (!cancelled) { twitchPlayingRef.current = false; setTwitchActuallyPlaying(false); setTwitchPlayerStatus("Twitch blocked playback. Press Play in its player."); } });
      player.addEventListener(events.ENDED ?? 'ended',()=>{if(!cancelled) finishLatestRoomTitle.current();});
    }).catch(() => { if (!cancelled) setTwitchPlayerStatus("Twitch interactive player could not load. Open Twitch directly below."); });
    return () => { cancelled = true; twitchPlayerRef.current = null; lastTwitchPlaybackCommand.current = null; host.replaceChildren(); };
  // The player belongs to the selected card, not to every timeline tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p2p.selfId, room, sharedVideo?.id]);
  useEffect(() => {
    if (sharedVideo?.remote?.kind !== "twitch" || twitchClip) return;
    const player = twitchPlayerRef.current;
    if (!player || !twitchPlayerReady) return;
    if (remoteSeekNonce !== lastTwitchSeekNonce.current) {
      lastTwitchSeekNonce.current = remoteSeekNonce;
      if (remoteSeekNonce && !sharedVideo.remote.live) {
        suppressRemotePlayerEchoUntil.current = Date.now() + 1_000;
        player.seek(devicePlaybackPosition);
      }
    }
    // A clock heartbeat is not a playback command. Calling play each second
    // can restart a buffering Twitch VOD near its first second.
    if (lastTwitchPlaybackCommand.current !== playback.playing) {
      lastTwitchPlaybackCommand.current = playback.playing;
      suppressRemotePlayerEchoUntil.current = Date.now() + 750;
      if (playback.playing) player.play(); else player.pause();
    }
  }, [playback.playing, playback.position, remoteSeekNonce, sharedVideo?.id, twitchPlayerReady, guestOffset]);
  const toggleRoomPlayback = () => {
    const playing = !playback.playing;
    const player = twitchPlayerRef.current;
    // Call Twitch inside the click gesture to satisfy browser media policy;
    // the shared state still travels to every connected guest afterwards.
    if (sharedVideo?.remote?.kind === "twitch" && !twitchClip && (!player || !twitchPlayerReady)) {
      setInviteNotice("Twitch is still preparing its player. Wait for “Twitch player ready,” then press Play.");
      return;
    }
    if (sharedVideo?.remote?.kind === "twitch" && !twitchClip && player) {
      lastTwitchPlaybackCommand.current = playing;
      suppressRemotePlayerEchoUntil.current = Date.now() + 750;
      if (playing) {
        // This call is deliberately inside the click gesture. Do not mute a
        // VOD before trying to start it: Twitch permits a direct user-start
        // with sound, whereas a later effect-driven attempt can be rejected.
        player.setMuted?.(false);
        player.play();
        setTwitchPlayerStatus("Starting Twitch from the room control…");
        window.setTimeout(() => { if (!twitchPlayingRef.current) setTwitchPlayerStatus("Twitch is waiting for a Play press inside its player."); }, 1800);
      } else player.pause();
    }
    sync({ ...playback, playing }, false, true);
  };
  const chooseVideo = (video: LibraryVideo, startPlayback = false) => {
    if (joinedAsGuest) {
      p2p.send({ type: "video-request", videoId: video.id, media: describeRoomMedia(video), action:startPlayback?'play':'stage', sentAt: Date.now() });
      setInviteNotice(`Requested ${video.name} from the host. The room changes only after host confirmation.`);
      noteRoom("request", "Requested a host video change.");
      return;
    }
    const file = localFiles.current.get(video.id);
    if (!video.remote && video.id.startsWith("local:") && !file) {
      setInviteNotice(`Choose ${video.name} on the host before playing it.`);
      return;
    }
    const share = file ? { name: file.name, fingerprint: localRoomFingerprint(file), size: file.size, modified: file.lastModified } : null;
    setLocalVideo(file ?? null);
    setLocalShare(share);
    setLocalShareMatches({});
    setSharedVideoId(video.id);
    const selectedKey = roomMediaKey(video);
    const remaining = queueRef.current.filter(id => {
      const queued = roomVideoForId(id);
      return queued && roomMediaKey(queued) !== selectedKey;
    });
    if (remaining.length !== queueRef.current.length) publishQueue(remaining, video.id);
    setPlayback({ playing: startPlayback, position: 0 });
    youtubePlaybackStartedAt.current=startPlayback?Date.now():null;
    lastRoomPosition.current = 0;
    lastRoomHistoryId.current = "";
    recordPlay(video.id, "watch-room");
    p2p.send({ type: "video", videoId: video.id, media: describeRoomMedia(video, share), sentAt: Date.now() });
    p2p.send({ type: "sync", playing: startPlayback, position: 0, videoId: video.id, seek: true, sentAt: Date.now() });
    noteRoom("state", "Host selected a new room video.");
  };
  const resolveGuestRoomVideo = (id: string, media: unknown) => {
    const requested = resolveRoomRequest(id, media, roomVideoForId, [currentVideoIdRef.current, ...queueRef.current]);
    if (!requested || !canStageRoomVideo(requested)) return undefined;
    if (!requested.remote && requested.id.startsWith("local:") && !localFiles.current.has(requested.id)) return undefined;
    if (requested.remote) adoptRoomMedia([describeRoomMedia(requested)], [currentVideoIdRef.current, ...queueRef.current, requested.id]);
    return requested;
  };
  const publishQueue = (next: string[], currentId = currentVideoIdRef.current) => {
    measureInteraction("queue");
    const current = roomVideoForId(currentId);
    const bounded = distinctRoomQueue(next, id => {
      const video = roomVideoForId(id);
      return video && canStageRoomVideo(video) ? roomMediaKey(video) : undefined;
    }, current ? roomMediaKey(current) : undefined);
    const revision = Math.max(queueRevisionRef.current, lastAcceptedQueueRevision.current) + 1;
    queueRevisionRef.current = revision;
    lastAcceptedQueueRevision.current = revision;
    queueRef.current = bounded;
    setQueue(bounded);
    p2p.send({ type: "queue", queue: bounded, queueMedia: bounded.map(id=>{
      const file=localFiles.current.get(id);
      const share=file?{name:file.name,fingerprint:localRoomFingerprint(file),size:file.size,modified:file.lastModified}:undefined;
      return describeRoomMedia(roomVideoForId(id),share);
    }), queueRevision: revision, sentAt: Date.now() });
    setRoomHealth((health) => ({ ...health, queueAccepted: health.queueAccepted + 1, queueRevision: revision, lastQueueAt: Date.now() }));
    noteRoom("queue", `Published queue revision ${revision} with ${bounded.length} title${bounded.length === 1 ? "" : "s"}.`);
  };
  const changeQueue = (operation: RoomQueueAction, video?: LibraryVideo) => {
    if (joinedAsGuest) {
      requestQueueChange({type:'queue-action',operation,media:describeRoomMedia(video ?? roomVideoForId(operation.id)),queueRevision:lastAcceptedQueueRevision.current},'Queue change sent · waiting for host confirmation.');
      setRoomHealth(health=>({...health,queueRequests:health.queueRequests+1}));
      return;
    }
    if ((operation.kind==='add'||operation.kind==='next') && !queueRef.current.includes(operation.id) && queueRef.current.length>=ROOM_QUEUE_LIMIT) {setQueueNotice('The queue holds 48 titles. Remove one before adding another.');return;}
    publishQueue(applyRoomQueueAction(queueRef.current,operation));
  };
  const shuffleQueue = () => {
    if (joinedAsGuest) {
      requestQueueChange({type:"queue-shuffle"},"Shuffle requested · waiting for host confirmation.");
      return;
    }
    if (queueRef.current.length < 2) return;
    publishQueue(shuffleRoomQueue(queueRef.current));
    setQueueNotice("Queue shuffled. The current video keeps playing.");
  };
  const queueLinkBatch = (values: unknown[]) => {
    const next=[...queueRef.current], media:RoomMediaDescriptor[]=[];
    const staged = new Map<string, LibraryVideo>();
    const seen=new Set([currentVideoIdRef.current,...next].flatMap(id=>{const video=roomVideoForId(id);return video?[roomMediaKey(video)]:[];}));
    const result={added:0,duplicates:0,invalid:0,full:0};
    for (const value of values.slice(0,ROOM_QUEUE_LIMIT)) {
      const resolved=resolveRoomMedia(value);
      if (!resolved?.video?.remote) {result.invalid++;continue;}
      const key=roomMediaKey(resolved.video);
      if (seen.has(key)) {result.duplicates++;continue;}
      if (next.length>=ROOM_QUEUE_LIMIT) {result.full++;continue;}
      const requested=resolveRoomRequest(resolved.video.id,value,id=>staged.get(id)??roomVideoForId(id),[currentVideoIdRef.current,...next]);
      if (!requested) {result.invalid++;continue;}
      staged.set(requested.id,requested);
      next.push(requested.id);seen.add(key);media.push(describeRoomMedia(requested)!);result.added++;
    }
    if (result.added) {adoptRoomMedia(media,[currentVideoIdRef.current,...next]);publishQueue(next);}
    return result;
  };
  const batchQueueNotice = (result:{added:number;duplicates:number;invalid:number;full:number},truncated=false) => [
    `${result.added} queued`,result.duplicates?`${result.duplicates} already playing/queued`:"",result.invalid?`${result.invalid} invalid or unavailable`:"",result.full?`${result.full} skipped · queue full`:"",truncated?"Only the first 48 links were checked":"",
  ].filter(Boolean).join(" · ");
  const queuePublicLinks = (value:string) => {
    const parsed=parseRoomLinks(value);
    if (!parsed.videos.length) {setQueueNotice("Enter public YouTube or Twitch links, one per line.");return false;}
    if (joinedAsGuest) {
      return requestQueueChange({type:"queue-batch",queueMedia:parsed.videos.map(video=>describeRoomMedia(video)),skipped:parsed.invalid,duplicates:parsed.duplicates,truncated:parsed.truncated},`${parsed.videos.length} links sent · waiting for host confirmation.`);
    } else {
      const result=queueLinkBatch(parsed.videos.map(video=>describeRoomMedia(video)));
      setQueueNotice(batchQueueNotice({...result,invalid:result.invalid+parsed.invalid,duplicates:result.duplicates+parsed.duplicates},parsed.truncated));
    }
    return true;
  };
  const updateQueue = (next: string[]) => {
    if (!joinedAsGuest) { publishQueue(next); return; }
    // Older queue surfaces use a proposed array; translate changes into
    // intentions instead of allowing that stale array to replace host state.
    for (const id of queueRef.current) if (!next.includes(id)) changeQueue({kind:'remove',id});
    for (let index=next.length-1;index>=0;index--) {
      const id=next[index]!;
      if (!queueRef.current.includes(id)) changeQueue({kind:'add',id,before:next[index+1]});
      else if (next.indexOf(id)!==queueRef.current.indexOf(id) && next.length===queueRef.current.length) changeQueue({kind:'move',id,before:next[index+1]});
    }
  };
  const updateLocalQueue = (next: LocalRoomShare[]) => {
    const bounded = normalizeLocalRoomQueue(next);
    if (joinedAsGuest) {
      p2p.send({ type: "local-queue-request", localQueue: bounded, sentAt: Date.now() });
      noteRoom("request", "Sent a local-handoff queue proposal to the host.");
      setInviteNotice("Local handoff proposal sent to the host. It appears once confirmed.");
      return;
    }
    setLocalQueue(bounded);
    p2p.send({ type: "local-queue", localQueue: bounded, sentAt: Date.now() });
    noteRoom("queue", "Published the approved local-handoff queue.");
  };
  const stageLocalShare = (share: LocalRoomShare) => {
    if (joinedAsGuest) {
      p2p.send({ type: "local-stage-request", fingerprint: share.fingerprint, sentAt: Date.now() });
      noteRoom("request", "Requested that the host stage a local handoff.");
      setInviteNotice("Requested that the host stage this local handoff.");
      return;
    }
    if (!localShare || localShare.fingerprint !== share.fingerprint || !localVideo) {
      setPendingLocalShare(share);
      setInviteNotice(`Choose ${share.name} on the host before staging its playback stream.`);
      return;
    }
    if (!guestAccess) { setInviteNotice("Confirm guest viewing access in Local sharing before staging this file."); return; }
    setSharedVideoId(`local:${share.fingerprint}`);
    setPlayback({ playing: false, position: 0 });
    lastRoomPosition.current = 0;
    p2p.send({ type: "share-ready", ...share });
    p2p.send({ type: "video", videoId: `local:${share.fingerprint}`, media: describeRoomMedia(undefined, share) });
    p2p.send({ type: "sync", playing: false, position: 0, videoId: `local:${share.fingerprint}`, seek: true, sentAt: Date.now() });
    setInviteNotice(`${share.name} is staged. Press Play to stream it to every connected guest.`);
  };
  const selectLocalVideo = (file: File | null) => {
    if (!file) return;
    const share: LocalRoomShare = { name: file.name, fingerprint: localRoomFingerprint(file), size: file.size, modified: file.lastModified };
    if (joinedAsGuest && !pendingLocalShare) {
      setInviteNotice("Wait for the host’s local-share request before matching a permitted file on this device.");
      return;
    }
    if (joinedAsGuest && pendingLocalShare && pendingLocalShare.fingerprint !== share.fingerprint) {
      setInviteNotice(`That file does not match ${pendingLocalShare.name}. Select the same permitted copy (name, size, and modified time must agree).`);
      return;
    }
    if (!joinedAsGuest) {
      setPickedLocalVideo(file);
      setInviteNotice("File selected. Queue it or share it when ready; the current video keeps playing.");
      return;
    }
    setLocalVideo(file);
    setLocalShare(share);
    if (joinedAsGuest && pendingLocalShare) {
      setSharedVideoId(`local:${share.fingerprint}`);
      setPendingLocalShare(null);
      p2p.send({ type: "share-matched", name: share.name, fingerprint: share.fingerprint });
      setInviteNotice(`${share.name} matched locally. Waiting for the host to stage or play it.`);
      return;
    }
  };
  const preparePickedLocal = (keepCurrent = true) => {
    if (joinedAsGuest || !pickedLocalVideo || !pickedLocalShare || !guestAccess) return undefined;
    const media = describeRoomMedia(undefined, pickedLocalShare);
    const video = resolveRoomMedia(media)?.video;
    if (!media || !video) return undefined;
    localFiles.current.set(video.id, pickedLocalVideo);
    adoptRoomMedia([media], keepCurrent ? [currentVideoIdRef.current, ...queueRef.current, video.id] : [video.id, ...queueRef.current]);
    return video;
  };
  const queuePickedLocal = () => {
    if (queueRef.current.length >= ROOM_QUEUE_LIMIT) {setQueueNotice("The queue is full. Remove a title first.");return;}
    const video = preparePickedLocal();
    if (!video) return;
    if (video.id === currentVideoIdRef.current || queueRef.current.includes(video.id)) {setQueueNotice("That file is already playing or queued.");return;}
    changeQueue({kind:"add",id:video.id},video);
    setQueueNotice(`${video.name} queued. Guests receive the host stream when it plays.`);
  };
  const sharePickedLocal = () => {
    const video = preparePickedLocal(false);
    if (!video || !pickedLocalShare) return;
    chooseVideo(video);
    p2p.send({type:"share-ready",...pickedLocalShare});
    setInviteNotice("Local playback shared. Press Play to stream it to the room; guests do not need a local copy.");
  };
  const queueVideo = (video: LibraryVideo) => {
    if (video.id !== sharedVideoId && !queue.includes(video.id)) changeQueue({kind:'add',id:video.id},video);
  };
  const queueImmediately = (video: LibraryVideo) => {
    if (video.id === sharedVideoId) return;
    changeQueue({kind:'next',id:video.id},video);
    if (!joinedAsGuest) setInviteNotice(`${video.name} will play next for everyone in the room.`);
  };
  const playNext = () => {
    if (joinedAsGuest) {p2p.send({type:"next-request",videoId:currentVideoIdRef.current,sentAt:Date.now()});setQueueNotice("Requested the next queued title from the host.");return;}
    const nextId = queueRef.current[0];
    if (!nextId) return;
    const next = roomVideoForId(nextId);
    if (next) chooseVideo(next,true);
    else publishQueue(queueRef.current.slice(1));
  };
  const queuePanelActions = useRef({
    search: (_value: string) => {}, autoAdvance: (_value: boolean) => {}, select: (_video: LibraryVideo) => {},
    add: (_video: LibraryVideo) => {}, change: (_action: RoomQueueAction) => {}, clear: () => {},
    next: () => {}, shuffle: () => {}, link: (_value: string): boolean => false,
  });
  queuePanelActions.current = {
    search: setDeferredRoomSearch,
    autoAdvance: setAutoAdvance,
    select: video => chooseVideo(video, true),
    add: queueVideo,
    change: changeQueue,
    clear: () => updateQueue([]),
    next: playNext,
    shuffle: shuffleQueue,
    link: queuePublicLinks,
  };
  const onQueueSearch = useCallback((value: string) => queuePanelActions.current.search(value), []);
  const onQueueAutoAdvance = useCallback((value: boolean) => queuePanelActions.current.autoAdvance(value), []);
  const onQueueSelect = useCallback((video: LibraryVideo) => queuePanelActions.current.select(video), []);
  const onQueueAdd = useCallback((video: LibraryVideo) => queuePanelActions.current.add(video), []);
  const onQueueChange = useCallback((action: RoomQueueAction) => queuePanelActions.current.change(action), []);
  const onQueueClear = useCallback(() => queuePanelActions.current.clear(), []);
  const onQueueNext = useCallback(() => queuePanelActions.current.next(), []);
  const onQueueShuffle = useCallback(() => queuePanelActions.current.shuffle(), []);
  const onQueueLink = useCallback((value: string) => queuePanelActions.current.link(value), []);
  const recommendationSelectRef = useRef<(video: LibraryVideo) => void>(() => {});
  recommendationSelectRef.current = video => chooseVideo(video);
  const onRecommendationSelect = useCallback((video: LibraryVideo) => recommendationSelectRef.current(video), []);
  const onMixRecommendations = useCallback(() => { setCandidateSeed(Date.now()); setRoomPickLimit(18); }, []);
  const onLoadRecommendations = useCallback(() => setRoomPickLimit(limit => Math.min(roomCandidates.length, limit + 18)), [roomCandidates.length]);
  const queuePanelRows = useMemo(() => queue.map(id => ({
    id,
    video: joinedAsGuest ? sharedRoomVideos[id] ?? lookupVideo(videos, id) : lookupVideo(videos, id) ?? sharedRoomVideos[id],
  })), [joinedAsGuest, queue, sharedRoomVideos, videos]);
  const playQueuedNow = (id: string) => {
    const video = roomVideoForId(id);
    if (!video) return;
    if(joinedAsGuest) {chooseVideo(video,true);return;}
    chooseVideo(video,true);
  };
  const finishRoomTitle = () => {
    if (joinedAsGuest || !autoAdvance || !queueRef.current.length || lastEndedTitle.current===sharedVideoId) return;
    lastEndedTitle.current=sharedVideoId;
    playNext();
  };
  const finishLatestRoomTitle=useRef(finishRoomTitle);
  finishLatestRoomTitle.current=finishRoomTitle;
  useEffect(()=>{lastEndedTitle.current='';},[sharedVideoId]);
  useEffect(()=> {
    try {localStorage.setItem('reelcase.watch-room.auto-advance',String(autoAdvance));}catch{/* Session preference. */}
  },[autoAdvance]);
  useEffect(()=> {
    if (sharedVideo?.remote?.kind!=='youtube') return;
    const listener=(event:MessageEvent)=> {
      if (event.source!==remoteFrameRef.current?.contentWindow || event.origin!==new URL(watchRoomEmbed(sharedVideo)).origin) return;
      let data: {event?:string;info?:number|{playerState?:number;duration?:number}};
      try {data=typeof event.data==='string'?JSON.parse(event.data):event.data;}catch{return;}
      if (!data) return;
      if (data.event==='onStateChange' && data.info===0 || data.event==='infoDelivery' && typeof data.info==='object' && data.info?.playerState===0) finishRoomTitle();
    };
    window.addEventListener('message',listener);
    return ()=>window.removeEventListener('message',listener);
  },[sharedVideo?.id,joinedAsGuest,autoAdvance,queue]);
  useEffect(()=> {
    if(sharedVideo?.remote?.kind!=='youtube'||remoteFrameReady?.id!==sharedVideo.id)return;
    const target=new URL(watchRoomEmbed(sharedVideo)).origin;
    const frame=remoteFrameRef.current?.contentWindow;
    frame?.postMessage(JSON.stringify({event:'listening',id:'room-youtube'}),target);
    frame?.postMessage(JSON.stringify({event:'command',func:'addEventListener',args:['onStateChange']}),target);
  },[sharedVideo?.id,remoteFrameReady]);
  const send = () => {
    const text = message.trim();
    if (!text) return;
    setChat((rows) => [...rows, `You: ${text}`].slice(-50));
    p2p.send({ type: "chat", text, name: name.trim() || "Guest" });
    setMessage("");
  };
  if (!activeRoom)
    return (
      <HubShell
        eyebrow="LAN watch room"
        icon={<Users className="size-4" />}
        title="Watch together, on your terms."
        copy="Create a private room code or join one on the same network. Peers exchange names, chat, and playback commands over a direct or configured relay path."
      >
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg bg-elevated p-5 shadow-border">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Create a room
            </p>
            <p className="mt-3 font-mono text-3xl tracking-[0.16em] text-fg">{roomCode}</p>
            <p className="mt-2 text-sm text-muted">
              Share this code only with people you want in your watch room.
            </p>
            <RoomInvitation invitation={invitation} started={false} onNotice={setInviteNotice}/>
            {!roomInvite && <p className="mt-2 text-xs leading-5 text-muted">This localhost address opens only on this computer. Use the home-network address in the Connection guide before sharing with another device. <button type="button" className="text-accent underline" onClick={() => useLibrary.getState().setSource("connection")}>Open Connection guide</button></p>}
            {inviteNotice && <p className="mt-2 break-all text-xs text-accent">{inviteNotice}</p>}
            <Button
              className="mt-5 w-full"
              onClick={() => {
                setJoinedAsGuest(false);
                localStorage.setItem("reelcase.watch-room.last-host", roomCode);
                setRecentLocalRoom(roomCode);
                setActiveRoom(roomCode);
              }}
            >
              <Wifi className="size-4" /> Start room
            </Button>
            <p className="mt-3 text-xs leading-5 text-subtle">Testing on one computer? Start the room first, then use <strong className="text-fg">Open local guest window</strong> inside the room. A second browser window is a separate peer; a single tab cannot chat with itself.</p>
          </div>
          <div className="rounded-lg bg-elevated p-5 shadow-border">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Join a theater
            </p>
            <p className="mt-2 text-sm text-muted">
              Guests enter a focused theater view first; controls and chat stay available beside the
              screen.
            </p>
            <Input
              className="mt-3"
              value={roomInput}
              onChange={(event) => setRoomInput(event.target.value.toUpperCase())}
              placeholder="Enter room code"
              aria-label="Watch room code"
            />
            {recentLocalRoom && recentLocalRoom !== roomInput && <Button size="sm" variant="secondary" className="mt-2" onClick={() => { setRoomInput(recentLocalRoom); setInviteNotice(`Using this browser’s active host room: ${recentLocalRoom}.`); }}>Join local host · {recentLocalRoom}</Button>}
            <Input
              className="mt-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your display name"
              aria-label="Your display name"
            />
            <Button
              variant="secondary"
              className="mt-3 w-full"
              disabled={!roomInput.trim()}
              onClick={() => {
                setJoinedAsGuest(true);
                setStageSize("cinema");
                setActiveRoom(roomInput.trim());
              }}
            >
              Join theater
            </Button>
            <div className="mt-5 border-t border-border pt-4">
              <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Local friends</p>
              <p className="mt-1 text-xs leading-5 text-muted">Save a trusted friend name and their current room code for one-tap joining on this network.</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2"><Input value={friendName} onChange={(event) => setFriendName(event.target.value)} placeholder="Friend name" aria-label="Friend name"/><Input value={friendCode} onChange={(event) => setFriendCode(event.target.value.toUpperCase())} placeholder="Room code" aria-label="Friend room code"/></div>
              <Button size="sm" variant="secondary" className="mt-2" disabled={!friendName.trim() || !friendCode.trim()} onClick={() => { const next = [{ name: friendName.trim(), code: friendCode.trim() }, ...friends.filter((friend) => friend.code !== friendCode.trim())].slice(0, 16); setFriends(next); localStorage.setItem("reelcase.lan-friends.v1", JSON.stringify(next)); setFriendName(""); setFriendCode(""); }}>Save friend</Button>
              {friends.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{friends.map((friend) => <Button key={`${friend.name}-${friend.code}`} size="sm" variant="secondary" onClick={() => { setRoomInput(friend.code); setName(friend.name); }}>{friend.name} · {friend.code}</Button>)}</div>}
            </div>
          </div>
        </div>
      </HubShell>
    );
  return (
    <HubShell
      eyebrow="Connected watch room"
      icon={<Users className="size-4" />}
      title={joinedAsGuest ? `Theater · ${activeRoom}` : `Room ${activeRoom}`}
      copy={
        joinedAsGuest
          ? "Guest theater view. The host's current video, queue, and timeline arrive as the connection settles."
          : "Peer connection for your selected guests. Playback events are synchronized across connected devices."
      }
    >
      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(20rem,0.6fr)]">
        <div className="min-w-0 rounded-lg bg-elevated p-5 shadow-border">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">
              Synchronized playback
            </p>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              <Radio className={`size-3 ${p2p.joined ? "text-accent" : "text-subtle"}`} />
              {p2p.joined ? "Signaling online" : "Connecting…"}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" disabled={!p2p.joined} onClick={() => {
              const invite = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}&theater=1`;
              const opened = window.open(invite, "reelcase-local-guest", "noopener,width=1200,height=820");
              setInviteNotice(opened ? "Opened a separate local guest window. Give it a moment to appear in Guests." : "Your browser blocked the guest window. Allow pop-ups, then try again.");
            }}>Open local guest window</Button>
            <Button size="sm" variant="ghost" onClick={() => void navigator.clipboard?.writeText(JSON.stringify({ room: activeRoom, invitation: roomInvite, invitationNote: roomInvite ? undefined : "Open Realhub from a home-network address before sharing this room with another device.", role: joinedAsGuest ? "guest" : "host", self: p2p.selfId, signaling: p2p.joined, peers: p2p.peers, transportTest: pulseStatus, reliability: roomHealth, ledger: roomLedger, events: p2p.events, capturedAt: new Date().toISOString() }, null, 2)).then(() => setInviteNotice("Connection and reconciliation diagnostic copied."), () => setInviteNotice("Could not copy the diagnostic."))}>Copy room diagnostic</Button>
          </div>
          {!roomInvite && <p className="mt-2 text-xs leading-5 text-muted">A localhost invitation cannot open on another device. Open this room through the home-network address before sharing. <button type="button" className="text-accent underline" onClick={() => useLibrary.getState().setSource("connection")}>Open Connection guide</button></p>}
          <details className="mt-3 rounded-sm bg-bg/45 p-3"><summary className="cursor-pointer text-xs font-medium text-fg">Connection details · {p2p.peers.filter((peer) => peer.connectionState === "connected").length}/{p2p.peers.length} connected</summary>
            <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-fg">Connection signals</p><span className="text-xs text-muted">{p2p.peers.filter((peer) => peer.connectionState === "connected").length}/{p2p.peers.length} connected · {p2p.peers.filter((peer) => peer.connectionState === "connected" && peer.candidateType === "relay").length} relayed</span></div>
            <RoomRelaySettings config={relayConfig} onChange={setRelayConfig} />
            <div className="mt-2 max-h-28 space-y-1 overflow-y-auto font-mono text-[11px] leading-4 text-muted">{p2p.events.map((event, index) => <p key={`${event}-${index}`}>{event}</p>)}</div>
            {!p2p.peers.length && p2p.joined && <p className="mt-2 text-xs text-accent">Signaling is healthy, but no peer is in <strong>{activeRoom}</strong>. The other window must join this exact code—not create its own. Use Open local guest window or copy this room link.</p>}
            {p2p.peers.length > 0 && <div className="mt-2 space-y-1 text-xs text-muted">{p2p.peers.map((peer) => <p key={peer.id}><strong className="text-fg">{peer.name || "Guest"}</strong> · {peer.connectionState} · {peer.candidateType ?? "path pending"} · {peer.rttMs == null ? "RTT pending" : `${peer.rttMs}ms`} · {peer.id.slice(-6)}</p>)}</div>}
            <div className="mt-3 flex flex-wrap items-center gap-2"><Button size="sm" variant="secondary" disabled={!p2p.peers.some((peer) => peer.connectionState === "connected")} onClick={() => { setPulseStatus("Sending chat transport test…"); p2p.send({ type: "room-pulse", sentAt: Date.now() }); }}>Test chat transport</Button><span className="text-xs text-muted">{pulseStatus}</span></div>
          </details>
          <h2 className="mt-2 font-display text-3xl text-fg">
            {playback.playing && sharedVideo?.remote?.kind === "twitch" && !twitchClip && !twitchActuallyPlaying ? "Twitch waiting for playback" : playback.playing ? "Playing together" : "Paused together"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Timeline {Math.floor(playback.position / 60)}:
            {String(Math.floor(playback.position % 60)).padStart(2, "0")} · {timelineEvidence.source === "remote" ? "host-confirmed" : timelineEvidence.source === "local" ? "local player" : "provider estimate"} · checked {new Date(timelineEvidence.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}.
          </p>
          {joinedAsGuest && <RoomGuestTiming offset={guestOffset} position={adjustedTimerPosition} adjustsPlayback={timingAdjustsPlayback} onChange={changeGuestOffset}/>}
          <details className="mt-4 rounded-md border border-border bg-bg/45 p-3" aria-label="Room reliability"><summary className="cursor-pointer text-xs font-medium text-fg">Room reliability · r{roomHealth.queueRevision} · {roomHealth.staleDropped} stale commands dropped</summary>
            <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Room reliability</p><p className="mt-1 text-xs text-muted">{joinedAsGuest ? "Guest commands are requests; the host publishes the canonical state." : "This device is the host and publishes the canonical state."}</p></div><span className="rounded-full bg-accent/15 px-2 py-1 text-xs text-accent">{p2p.peers.some((peer) => peer.connectionState === "connected" && peer.candidateType === "relay") ? "TURN relay connected" : p2p.peers.some((peer) => peer.connectionState === "connected" && ["host", "srflx", "prflx"].includes(peer.candidateType ?? "")) ? "direct path connected" : p2p.peers.some((peer) => peer.connectionState === "connected") ? "connected · path pending" : p2p.joined ? "signaling online · peer pending" : "connecting"}</span></div>
            <div className="mt-3 grid gap-2 text-xs sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-sm bg-elevated p-2"><span className="block text-muted">{joinedAsGuest ? "Last host state" : "Last publish"}</span><strong className="mt-1 block text-fg">{roomTimeLabel(joinedAsGuest ? roomHealth.lastHostStateAt : roomHealth.lastPublishedAt)}</strong></div><div className="rounded-sm bg-elevated p-2"><span className="block text-muted">Queue revision</span><strong className="mt-1 block text-fg">r{roomHealth.queueRevision} · {queue.length} title{queue.length === 1 ? "" : "s"}</strong></div><div className="rounded-sm bg-elevated p-2"><span className="block text-muted">Last correction</span><strong className="mt-1 block text-fg">{roomHealth.lastDriftSeconds ? `${roomHealth.lastDriftSeconds.toFixed(1)}s` : "none needed"}</strong></div><div className="rounded-sm bg-elevated p-2"><span className="block text-muted">Safety checks</span><strong className="mt-1 block text-fg">{roomHealth.staleDropped} stale dropped · {roomHealth.resyncRequests} resync</strong></div></div>
            <details className="mt-3 rounded-sm bg-elevated p-2 text-xs text-muted"><summary className="cursor-pointer font-medium text-fg">Session ledger · {roomLedger.length} local event{roomLedger.length === 1 ? "" : "s"}</summary><div className="mt-2 max-h-32 space-y-1 overflow-y-auto">{roomLedger.length ? roomLedger.slice().reverse().map((event, index) => <p key={`${event.at}-${index}`}><span className="font-mono text-subtle">{roomTimeLabel(event.at)}</span> · {event.detail}</p>) : <p>No room decisions recorded yet.</p>}</div></details>
          </details>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={toggleRoomPlayback}>
              {playback.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playback.playing ? "Pause" : "Play"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => sync({ ...playback, position: clampRoomClock(playback.position - 15) }, true)}
            >
              −15 sec
            </Button>
            <Button
              variant="secondary"
              onClick={() => sync({ ...playback, position: clampRoomClock(playback.position + 15) }, true)}
            >
              +15 sec
            </Button>
            <Button variant="secondary" onClick={resync}>
              <Wifi className="size-4" /> {joinedAsGuest ? "Request resync" : "Resync guests"}
            </Button>
            <Button variant="ghost" size="sm" disabled={!queue.length} onClick={playNext}>
              {joinedAsGuest ? "Request next" : "Play next"} {queue.length ? `(${queue.length})` : ""}
            </Button>
          </div>
          {inviteNotice && <p className="mt-3 text-xs text-accent">{inviteNotice}</p>}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>Stage size</span>
            {(["compact", "theater", "cinema"] as const).map((size) => (
              <Button
                key={size}
                size="sm"
                variant={stageSize === size ? "default" : "secondary"}
                onClick={() => setStageSize(size)}
              >
                {size}
              </Button>
            ))}
          </div>
          <div
            className={`mt-3 mx-auto w-full max-w-full overflow-hidden rounded-md bg-bg shadow-border ${stageSize === "compact" ? "lg:max-w-3xl" : ""}`}
          >
            {guestLocalStream ? <RoomStreamPlayer stream={guestLocalStream} title={sharedVideo?.name ?? sharedLocalMedia?.name ?? "Host video"} playing={playback.playing} position={playback.position} duration={roomDuration()} onPlayback={playing=>sync({...playback,playing},false,true)} onSeek={position=>sync({...playback,position},true,true)} onResync={resync}/> : matchingLocalSource && localShareIsMatched ? (
              <video
                key={sharedVideoId}
                ref={roomVideoRef}
                className="aspect-video w-full bg-bg"
                src={matchingLocalSource}
                controls
                playsInline
                onLoadedMetadata={() => { const seconds = roomVideoRef.current?.duration; if (typeof seconds === "number" && Number.isFinite(seconds)) setMeasuredDuration({ videoId: sharedVideoId, seconds }); }}
                onEnded={finishRoomTitle}
                onPlay={() => syncDevicePlayback({ playing: true, position: roomVideoRef.current?.currentTime ?? 0 })}
                onPause={() => syncDevicePlayback({ playing: false, position: roomVideoRef.current?.currentTime ?? 0 })}
                onSeeked={() => syncDevicePlayback({ playing: roomVideoRef.current ? !roomVideoRef.current.paused : false, position: roomVideoRef.current?.currentTime ?? 0 }, true)}
                onTimeUpdate={() => {
                  const media = roomVideoRef.current;
                  if (joinedAsGuest || !media || media.paused || Date.now() - lastRoomTick.current < 900) return;
                  lastRoomTick.current = Date.now();
                  sync({ playing: true, position: media.currentTime });
                }}
              />
            ) : sharedVideo?.remote?.kind === "twitch" && !twitchClip ? (
              <div className="relative aspect-video w-full bg-bg">
                <div ref={twitchPlayerHostRef} className="absolute inset-0" />
                <p className="absolute bottom-2 left-2 rounded-sm bg-bg/80 px-2 py-1 text-xs text-muted">{twitchPlayerStatus}</p>
              </div>
            ) : sharedVideo?.remote?.embedUrl ? (
              <iframe
                ref={remoteFrameRef}
                key={sharedVideo.id}
                title={sharedVideo.name}
                src={watchRoomEmbed(sharedVideo)}
                className="aspect-video w-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                onLoad={() => {lastYoutubeSeekNonce.current=-1;setRemoteFrameReady({id:sharedVideo.id,at:Date.now()});}}
              />
            ) : libraryLocalSource ? (
              <video
                key={sharedVideoId}
                ref={roomVideoRef}
                className="aspect-video w-full bg-bg"
                src={libraryLocalSource}
                controls
                playsInline
                onLoadedMetadata={() => { const seconds = roomVideoRef.current?.duration; if (typeof seconds === "number" && Number.isFinite(seconds)) setMeasuredDuration({ videoId: sharedVideoId, seconds }); }}
                onEnded={finishRoomTitle}
                onPlay={() =>
                  syncDevicePlayback({ playing: true, position: roomVideoRef.current?.currentTime ?? 0 })
                }
                onPause={() =>
                  syncDevicePlayback({ playing: false, position: roomVideoRef.current?.currentTime ?? 0 })
                }
                onSeeked={() =>
                  syncDevicePlayback({
                    playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
                    position: roomVideoRef.current?.currentTime ?? 0,
                  }, true)
                }
                onTimeUpdate={() => {
                  const media = roomVideoRef.current;
                  if (joinedAsGuest || !media || media.paused || Date.now() - lastRoomTick.current < 900) return;
                  lastRoomTick.current = Date.now();
                  sync({ playing: true, position: media.currentTime });
                }}
              />
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center px-6 text-center text-sm text-muted">
                <img src="/art/realhub-projector.webp" alt="" loading="lazy" className="mb-2 h-28 w-36 object-contain" />
                {sharedLocalMedia?.id === sharedVideoId ? `Waiting for the host to play ${sharedLocalMedia.name}. Local video streams directly to this device once playback starts.` : sharedVideoId.startsWith("local:") ? "Waiting for the host’s local video stream or a matching file on this device." : "Choose a starter movie or an online video to show it to the room."}
              </div>
            )}
          </div>
          {localStream.status && <p className="mt-2 text-xs text-muted">{localStream.status}</p>}
          {guestLocalStream && <p className="mt-2 text-xs text-muted">Watching the host’s local video. Use the room controls to pause or seek for everyone.</p>}
          {sharedVideo?.remote?.kind === "youtube" ? (
            <p className="mt-2 text-xs text-subtle">
              YouTube room controls retain the last trusted clock on pause, then resume from that same point. Use the room controls so every guest receives the same command.
            </p>
          ) : sharedVideo?.remote?.kind === "twitch" && twitchClip ? (
            <p className="mt-2 text-xs text-subtle">Twitch clips use Twitch’s separate clip player. Use its own controls to watch; room selection and chat remain shared. If Twitch shows a content classification error, <a href={sharedVideo.remote.watchUrl} target="_blank" rel="noreferrer" className="text-accent underline">open the clip directly</a>.</p>
          ) : sharedVideo?.remote?.kind === "twitch" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle"><p><strong className="text-fg">Twitch currently needs one manual Play press in each viewer’s embed.</strong> Browser media rules prevent Realhub from forcing a guest stream to start. Selection, queue, chat, and the preserved pause clock still sync through the room controls.</p>{sharedVideo.remote.watchUrl && <a href={sharedVideo.remote.watchUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center rounded-sm bg-elevated px-2 text-xs text-fg shadow-border"><ExternalLink className="mr-1 size-3"/>Open Twitch directly</a>}</div>
          ) : null}
          {sharedVideo && <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md border border-border bg-bg/45 p-3"><span className="mr-auto min-w-0 truncate text-sm font-medium text-fg">{sharedVideo.name}</span><Button size="sm" variant={favorites[sharedVideo.id] ? "default" : "secondary"} onClick={() => toggleFavorite(sharedVideo.id)}><Heart className={`size-4 ${favorites[sharedVideo.id] ? "fill-current" : ""}`} />{favorites[sharedVideo.id] ? "Favorited" : "Favorite"}</Button><div className="flex items-center gap-1" aria-label="Rate current room video">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className="flex size-9 items-center justify-center rounded-md text-accent hover:bg-elevated" aria-label={`Rate ${sharedVideo.name} ${value} stars`} aria-pressed={roomRating === value} onClick={() => { saveRating(sharedVideo.id, roomRating === value ? 0 : value); setRoomRatingRevision((revision) => revision + 1); }}><Star className={`size-4 ${value <= roomRating ? "fill-current" : ""}`} /></button>)}</div></div>}
          <details className="mt-5 rounded-md border border-border bg-bg/35 p-3"><summary className="cursor-pointer text-sm font-medium text-fg">Explore more videos and advanced queue controls</summary><p className="mt-3 text-xs text-muted">Recommended from your playable library — saved titles get a small lift while unplayed playable videos rotate to the front. Ready local files can be added to the queue below without taking over the stage.</p>
          <RoomRecommendations videos={roomCandidates} youtubeVideos={youtubeRoomCandidates} currentId={sharedVideoId} visibleCount={roomPickLimit} pending={roomCandidatesPending} onSelect={onRecommendationSelect} onMix={onMixRecommendations} onLoadMore={onLoadRecommendations}/>
          <div className="mt-3 rounded-md bg-bg/45 p-3 shadow-border">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-fg">Up next queue</p>
              <span className="text-xs text-muted">{joinedAsGuest ? "Propose changes; host confirms the shared order" : "Host-controlled shared order"}</span>
            </div>
            {queue.length ? (
              <div className="mt-2 space-y-2">
                {queue.map((id, index) => {
                  const video = videos.find((item) => item.id === id) ?? sharedRoomVideos[id];
                  return (
                    <div key={id} className="flex items-center justify-between gap-3 rounded-sm bg-elevated p-2">
                      <div className="flex min-w-0 items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">{index + 1}</span>{video && watchRoomPoster(video) ? <img src={watchRoomPoster(video)} alt="" className="aspect-video w-16 shrink-0 rounded-sm object-cover" /> : <div className="flex aspect-video w-16 shrink-0 items-center justify-center rounded-sm bg-bg/60 text-xs text-muted"><Play className="size-3" /></div>}<span className="min-w-0"><span className="block truncate text-sm text-fg">{video?.name ?? "Unavailable title"}</span><span className="block truncate text-xs text-muted">{video?.remote?.channelName ?? (video?.remote ? "Remote video" : "Local file")}</span></span></div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => playQueuedNow(id)}
                        >
                          {joinedAsGuest?'Request play':'Play now'}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={index === 0}
                          onClick={() => {
                            const next = [...queue];
                            [next[index - 1], next[index]] = [next[index], next[index - 1]];
                            updateQueue(next);
                          }}
                        >
                          ↑
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateQueue(queue.filter((item) => item !== id))}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted">
                Choose “Add next” below to build the shared queue.
              </p>
            )}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {roomCandidates
                    .filter((video) => video.id !== sharedVideoId)
                .slice(0, 12)
                .map((video) => (
                  <span key={video.id} className="inline-flex shrink-0 overflow-hidden rounded-sm shadow-border">
                    <Button size="sm" variant="secondary" onClick={() => queueImmediately(video)}>Play next</Button>
                    <Button size="sm" variant="ghost" disabled={queue.includes(video.id)} onClick={() => queueVideo(video)}>+ queue · {video.name}</Button>
                  </span>
                ))}
            </div>
            {queueRecommendations.length > 0 && <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-fg">More queue ideas</p><span className="text-xs text-muted">Different from the theater picks above</span></div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {queueRecommendations.map((video) => (
                  <span key={video.id} className="inline-flex shrink-0 overflow-hidden rounded-sm shadow-border">
                    <Button size="sm" variant="secondary" onClick={() => queueImmediately(video)}>Play next</Button>
                    <Button size="sm" variant="ghost" onClick={() => queueVideo(video)}>+ queue · {video.name}</Button>
                  </span>
                ))}
              </div>
            </div>}
            {localQueueCandidates.length > 0 && <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-fg">Ready local files</p><span className="text-xs text-muted">Add to queue without opening now</span></div>
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {localQueueCandidates.map((video) => <Button key={video.id} size="sm" variant="ghost" onClick={() => queueVideo(video)}>+ queue · {video.name}</Button>)}
              </div>
            </div>}
            {localQueue.length > 0 && <div className="mt-4 border-t border-border pt-3">
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-fg">Approved local handoffs</p><span className="text-xs text-muted">Shared manifest · files stay on each device</span></div>
              <div className="mt-2 space-y-2">{localQueue.map((share) => <div key={share.fingerprint} className="flex flex-wrap items-center justify-between gap-2 rounded-sm bg-elevated px-3 py-2"><span className="min-w-0 truncate text-xs text-fg">{share.name} · {bytes(share.size)}</span><div className="flex gap-1"><Button size="sm" variant="secondary" onClick={() => stageLocalShare(share)}>Stage</Button><Button size="sm" variant="ghost" onClick={() => updateLocalQueue(localQueue.filter((item) => item.fingerprint !== share.fingerprint))}>Remove</Button></div></div>)}</div>
            </div>}
          </div></details>
          <details className="mt-4 rounded-md border border-border bg-bg/35 p-3" onToggle={event => setRoomLocalToolsOpen(event.currentTarget.open)}><summary className="cursor-pointer text-sm font-medium text-fg">Local sharing, games & TV</summary>
          <div className="mt-5 rounded-md bg-bg/45 p-4 shadow-border">
            <div className="flex items-center gap-2">
              <MonitorPlay className="size-4 text-accent" />
              <p className="text-sm font-medium text-fg">Share local video</p>
            </div>
            <p className="mt-1 text-xs text-muted">
              Choose a file you may share with your guests. Playback streams from the host;
              phones do not need a copy of the file. Keep this player open while watching.
            </p>
            <label className="mt-3 block">
              <input
                className="sr-only"
                type="file"
                accept="video/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  selectLocalVideo(file);
                }}
              />
              <span className="inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border">
                {joinedAsGuest ? localVideo?.name ?? "Choose matching local video" : pickedLocalVideo?.name ?? "Choose local video"}
              </span>
            </label>
            {(pickedLocalShare ?? localShare) && <p className="mt-2 text-xs text-subtle">Selected file · {bytes((pickedLocalShare ?? localShare)!.size)}. Only title and match metadata are shared; file bytes stream during playback.</p>}
            {localShare && <p className="mt-1 text-xs text-muted">Optional local copies · {Object.values(localShareMatches).filter((match) => match.fingerprint === localShare.fingerprint).length}/{p2p.peers.length} guests matched this file. Other guests receive the host’s playback stream.</p>}
            {pendingLocalShare && <p className="mt-2 text-xs text-accent">Optional local copy: {pendingLocalShare.name} · {bytes(pendingLocalShare.size)}. You may choose a matching copy above instead of receiving the stream.</p>}
            <label className="mt-3 flex items-start gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={guestAccess}
                onChange={(event) => setGuestAccess(event.target.checked)}
              />
              <span>
                I confirm guests have access to this video and may receive this direct share.
              </span>
            </label>
            <Button
              size="sm"
              className="mt-3"
              disabled={joinedAsGuest || !pickedLocalVideo || !guestAccess || !p2p.peers.length}
              onClick={sharePickedLocal}
            >
              Send sharing request
            </Button>
            {!joinedAsGuest && <Button size="sm" variant="secondary" className="mt-3 ml-2 min-h-11" disabled={!pickedLocalVideo || !guestAccess || queue.length >= ROOM_QUEUE_LIMIT} onClick={queuePickedLocal}>Queue selected local file</Button>}
            <Button size="sm" variant="ghost" className="mt-3 min-h-11" disabled={!(pickedLocalShare ?? localShare)} onClick={() => { const share=pickedLocalShare??localShare; if (!share) return; if (!localQueue.some((item) => item.fingerprint === share.fingerprint)) updateLocalQueue([...localQueue, share]); setInviteNotice("Added file match metadata to the handoff list. Queue selected local file above for automatic playback."); }}>Add to matching-file list</Button>
          </div>
          <div className="mt-4 rounded-md bg-bg/45 p-4 shadow-border">
            <p className="text-sm font-medium text-fg">Watch-party mini games</p>
            <p className="mt-1 text-xs text-muted">Start a lightweight shared vote while the room is paused. Votes are sent to connected guests.</p>
            <Input className="mt-3" value={partyPrompt} onChange={(event) => setPartyPrompt(event.target.value)} aria-label="Party vote question" />
            <div className="mt-3 flex flex-wrap gap-2">{Object.keys(partyVotes).map((choice) => <Button key={choice} size="sm" variant="secondary" onClick={() => { const next = (partyVotes[choice] ?? 0) + 1; setPartyVotes((votes) => ({ ...votes, [choice]: next })); p2p.send({ type: "party-vote", name: choice, position: next }); }}>{choice} · {partyVotes[choice] ?? 0}</Button>)}</div>
            <p className="mt-3 text-xs text-accent">Now voting: {partyPrompt}</p>
          </div>
          <div className="mt-3 rounded-md bg-bg/45 p-4 shadow-border">
            <p className="flex items-center gap-2 text-sm font-medium text-fg">
              <MonitorPlay className="size-4 text-accent" />
              Roku handoff
            </p>
            <ol className="mt-2 space-y-1 text-xs text-muted">
              <li>
                <span className="mr-2 text-accent">1.</span>On Roku, open Settings → Network → About
                and copy its IP address.
              </li>
              <li>
                <span className="mr-2 text-accent">2.</span>Enter it below to save this TV as a
                trusted handoff target.
              </li>
              <li>
                <span className="mr-2 text-accent">3.</span>Launch the channel and copy the room
                invitation to your Roku browser or companion app.
              </li>
            </ol>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Input
                value={rokuAddress}
                onChange={(event) => {
                  setRokuAddress(event.target.value);
                  setRokuReady(false);
                }}
                placeholder="Roku IP address, e.g. 192.168.1.24"
                aria-label="Roku IP address"
              />
              <Button
                variant="secondary"
                disabled={!rokuAddress.trim()}
                onClick={() => {
                  setRokuReady(true);
                  localStorage.setItem("reelcase.roku", rokuAddress.trim());
                }}
              >
                Save & pair TV
              </Button>
              <Button variant="secondary" onClick={() => void (async () => {
                try {
                  const response = await fetch("http://127.0.0.1:43123/roku/discover");
                  const data = await response.json() as { devices?: { address: string; location: string }[] };
                  const devices = data.devices ?? [];
                  setRokuDevices(devices);
                  setRokuNotice(devices.length ? `${devices.length} Roku device${devices.length === 1 ? "" : "s"} found on this network.` : "No Roku devices responded. You can still pair one by its IP address.");
                } catch { setRokuNotice("Roku discovery needs the local Realhub Companion running on this Windows computer."); }
              })()}>
                Discover TVs
              </Button>
            </div>
            {rokuNotice && <p className="mt-2 text-xs text-muted">{rokuNotice}</p>}
            {rokuDevices.length > 0 && <div className="mt-2 flex flex-wrap gap-2">{rokuDevices.map((device) => <Button key={device.address} size="sm" variant="secondary" onClick={() => { setRokuAddress(device.address); setRokuReady(true); localStorage.setItem("reelcase.roku", device.address); }}>{device.address}</Button>)}</div>}
            {rokuReady && (
              <div className="mt-3 rounded-sm bg-elevated p-3">
                <span className="text-xs text-accent">Step 3 ready · {rokuAddress}</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}`;
                      window.open(`http://${rokuAddress}:8060/launch/837`, "_blank", "noopener");
                      navigator.clipboard?.writeText(url).catch(() => {});
                    }}
                  >
                    Launch & copy room link
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setRokuReady(false);
                      localStorage.removeItem("reelcase.roku");
                    }}
                  >
                    Forget TV
                  </Button>
                </div>
              </div>
            )}
          </div>
          </details>
        </div>
        <div className="min-w-0 space-y-4 self-start">
        <section className="rounded-lg bg-elevated p-4 shadow-border">
          <p className="flex items-center gap-2 text-sm font-medium text-fg">
            <MessageCircle className="size-4 text-accent" /> Room chat
          </p>
          <div className="mt-3 min-h-24 max-h-48 space-y-2 overflow-y-auto text-sm text-muted">
            {chat.map((row, index) => (
              <p key={`${row}-${index}`} className="rounded-sm bg-bg/45 px-3 py-2">
                {row}
              </p>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") send();
              }}
              placeholder="Say something"
              aria-label="Room chat message"
            />
            <Button size="sm" onClick={send}>
              Send
            </Button>
          </div>
        </section>
        {joinedAsGuest?<details className="rounded-lg border border-border bg-surface p-4"><summary className="cursor-pointer text-sm text-fg">Invite another guest</summary><RoomInvitation invitation={invitation} started onNotice={setInviteNotice}/></details>:<RoomInvitation invitation={invitation} started onNotice={setInviteNotice}/>}
        <RoomQueuePanel key={room} onSearch={onQueueSearch} results={roomSearchResults} queue={queuePanelRows} currentId={sharedVideoId} currentMediaKey={sharedVideo?roomMediaKey(sharedVideo):undefined} guest={joinedAsGuest} notice={queueNotice} pending={pendingQueueChanges} autoAdvance={autoAdvance} onAutoAdvance={onQueueAutoAdvance} onSelect={onQueueSelect} onAdd={onQueueAdd} onChange={onQueueChange} onClear={onQueueClear} onNext={onQueueNext} onShuffle={onQueueShuffle} onLink={onQueueLink} catalogPending={roomCandidatesPending} searching={roomSearchPending}/>
        {sharedVideo?.remote?.kind === "youtube" && <section className="rounded-lg bg-elevated p-2 shadow-border"><AdultComments video={sharedVideo}/></section>}
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-elevated p-4 shadow-border">
        <p className="text-sm font-medium text-fg">Guests & connection status</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted">
            You · {p2p.joined ? "ready" : "joining"}
          </span>
          {p2p.peers.length ? (
            p2p.peers.map((peer) => (
              <span key={peer.id} className="rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted">
                {peer.name || "Guest"} · {peer.connectionState}
                {peer.rttMs ? ` · ${peer.rttMs}ms` : ""}
              </span>
            ))
          ) : (
            <span className="text-xs text-subtle">
              Waiting for guests to join with the room code.
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Display name"
            className="max-w-56"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setActiveRoom(null);
              queueRef.current = [];
              setQueue([]);
              localFiles.current.clear();
              setLocalVideo(null);
              setLocalShare(null);
              setPickedLocalVideo(null);
              setPendingLocalShare(null);
              setPlayback({playing:false,position:0});
              setSharedVideoId("");
              setRoomCode(`RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
            }}
          >
            Leave room
          </Button>
        </div>
      </div>
    </HubShell>
  );
}

function HubShell({
  eyebrow,
  icon,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <section className="w-full max-w-none rounded-xl bg-surface p-5 shadow-border sm:p-6 xl:p-8">
      <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase">
        {icon} {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">{copy}</p>
      {children}
    </section>
  );
}
function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-elevated px-4 py-4 shadow-border">
      <p className="font-mono text-2xl tabular-nums text-fg">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
function ServiceLink({ name, href, copy }: { name: string; href: string; copy: string }) {
  return (
    <a
      href={href}
      className="rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover"
    >
      <p className="font-display text-2xl text-fg">{name}</p>
      <p className="mt-1 text-sm text-muted">{copy}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
        Open <ExternalLink className="size-4" />
      </span>
    </a>
  );
}
function InfoCard({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-lg bg-elevated p-5 shadow-border">
      <span className="text-accent">{icon}</span>
      <h2 className="mt-3 font-display text-2xl text-fg">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
    </div>
  );
}

function PhotoStars({ name, rating, onChange }: { name: string; rating: number; onChange: (rating: number) => void }) {
  return <div className="mt-2 flex flex-wrap items-center gap-1" role="group" aria-label={"Rating for " + name}>{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className="inline-flex size-11 items-center justify-center rounded-sm hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent" aria-label={"Rate " + name + " " + value + " stars"} aria-pressed={rating === value} onClick={() => onChange(value)}><Star className={"size-5 " + (value <= rating ? "fill-accent text-accent" : "text-muted")}/></button>)}{rating > 0 && <button type="button" className="min-h-11 px-2 text-xs text-muted" aria-label={"Clear rating for " + name} onClick={() => onChange(0)}>Clear</button>}</div>;
}
