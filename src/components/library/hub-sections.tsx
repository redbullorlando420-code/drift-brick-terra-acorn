import { TopicLinks } from './topic-links';
import { openTopic } from '@/lib/videos/topic-navigation';
import { isTopicTag, canonicalTopic } from '@/lib/videos/topics';
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Box,
  BarChart3,
  Clapperboard,
  Copy,
  Download,
  ExternalLink,
  Gamepad2,
  Images,
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
import { Input } from "@/components/ui/input";
import { resumeForVideo, useLibrary } from "@/lib/videos/store";
import { buildAdultStatsSnapshot, exportAdultStats } from "@/lib/videos/adult-stats";
import { getThumbDiagnostics, useThumbs } from "@/lib/videos/thumbs";
import { useSourceAssets } from "@/lib/source-assets";
import { useP2PRoom } from "@/lib/multiplayer";
import { exportFeedback, getFeedbackDiagnostics, getRating, tagIsLiked } from "@/lib/media-feedback";
import { getRenderBudgetSnapshot } from "@/lib/render-budget";
import { getInteractionBudgetSnapshot, measureInteraction } from "@/lib/interaction-budget";
import { getFirstShelfTrace } from "@/lib/first-shelf-trace";
import { benchmarkVisionModelsLocally, classifyImagesLocally, VISION_MODELS, type VisionBenchmark, type VisionLabel, type VisionModelId } from "@/lib/local-vision";
import { LOCAL_UPSCALER, upscaleImageLocally } from "@/lib/local-upscaler";
import { getNetworkDeviceId, listNetworkDevices, type NetworkDevice } from "@/lib/network-presence";
import type { LibraryVideo } from "@/lib/videos/types";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { XTimeline } from "./x-timeline";
import { X_ADULT_SEED_HANDLES } from "@/lib/videos/x-adult-seed-accounts";
import { VideoCard } from "./video-card";

type LocalItem = {
  name: string;
  path: string;
  size: number;
  addedAt: number;
  launchUrl?: string;
  iconData?: string;
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
  "alerts-desktop-notifications": "Active: asks the browser for permission, then mirrors enabled Reelcase alerts as desktop notifications.",
  "playback-autoplay-next-video": "Active: starts the next library title when a local video ends.",
  "playback-start-muted": "Active: local video playback starts muted until you raise the player volume.",
  "display-day-mode": "Active: uses the light palette throughout this browser.",
  "display-compact-live-cards": "Active: renders six compact live cards per wide row to reduce scrolling and image work.",
  "performance-use-cached-sources-first": "Active: opens the saved catalog before asking folders or the Companion for fresh file details.",
  "performance-low-memory-grids": "Active: keeps only a smaller card batch mounted in large grids, reducing image decode pressure.",
  "performance-small-home-shelves": "Active: draws shorter Home rails first; use Show more inside a rail when you want depth.",
  "privacy-reduce-motion": "Active: reduces animation and scrolling motion across Reelcase.",
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
      path: "Reelcase samples/Calibration cube.stl",
      size: 182400,
      addedAt: 1,
    },
    { name: "Cable clip.3mf", path: "Reelcase samples/Cable clip.3mf", size: 94100, addedAt: 2 },
    {
      name: "OpenSCAD phone stand.stl",
      path: "Open-source examples/OpenSCAD phone stand.stl",
      size: 512400,
      addedAt: 4,
    },
    {
      name: "Gridfinity bin.3mf",
      path: "Open-source examples/Gridfinity bin.3mf",
      size: 784200,
      addedAt: 5,
    },
    {
      name: "Benchy calibration.stl",
      path: "Open-source examples/Benchy calibration.stl",
      size: 643100,
      addedAt: 6,
    },
    {
      name: "Parametric drawer label.stl",
      path: "Open-source examples/Parametric drawer label.stl",
      size: 229100,
      addedAt: 7,
    },
    {
      name: "Tool tray.gcode",
      path: "Reelcase samples/Tool tray.gcode",
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
  const url = new URL(base);
  if (video.remote?.kind === "twitch") {
    // Twitch rejects every embed without a parent matching the page host.
    url.searchParams.set("parent", window.location.hostname);
    url.searchParams.set("autoplay", "false");
  } else {
    url.searchParams.set("autoplay", "0");
    url.searchParams.set("rel", "0");
    url.searchParams.set("playsinline", "1");
    url.searchParams.set("controls", "1");
    url.searchParams.set("origin", window.location.origin);
    if (video.remote?.kind === "youtube") url.searchParams.set("enablejsapi", "1");
  }
  return url.toString();
}

function watchRoomPoster(video: LibraryVideo) {
  if (video.remote?.kind === "youtube" && video.remote.videoId) return video.poster || `https://i.ytimg.com/vi/${video.remote.videoId}/hqdefault.jpg`;
  return video.poster;
}

function roomShuffleRank(id: string, seed: number) {
  let value = seed >>> 0;
  for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 0x45d9f3b);
  return value >>> 0;
}

type LocalRoomShare = { name: string; fingerprint: string; size: number; modified: number };
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
  const [showAllSources, setShowAllSources] = useState(false);
  const [remediationView, setRemediationView] = useState<"" | "topics" | "sources">("");
  const [favoriteRevision, setFavoriteRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setFavoriteRevision((value) => value + 1);
    window.addEventListener("reelcase:rating-change", refresh);
    return () => window.removeEventListener("reelcase:rating-change", refresh);
  }, []);
  const summary = useMemo(() => {
    const byFolder = new Map<string, { videos: number; bytes: number }>();
    const byGenre = new Map<string, number>();
    const byTag = new Map<string, number>();
    const topicRatings = new Map<string, { total: number; newest: number }>();
    let totalBytes = 0;
    let localTitles = 0;
    let remoteTitles = 0;
    let untaggedTitles = 0;
    let freshRemoteTitles = 0;
    let thumbReady = 0;
    let youtubeTitles = 0;
    let twitchTitles = 0;
    let liveTitles = 0;
    let knownDuration = 0;
    let durationTitles = 0;
    let resumedTitles = 0;
    let totalViews = 0;
    let metadataTaggedTitles = 0;
    let creatorTaggedTitles = 0;
    let descriptionTaggedTitles = 0;
    let multiTopicTitles = 0;
    let operationalTagAssignments = 0;
    const topicSources = new Map<string, Set<string>>();
    for (const video of videos) {
      totalBytes += video.size;
      if (video.remote) remoteTitles += 1; else localTitles += 1;
      if (video.poster) thumbReady += 1;
      if (video.remote?.kind === "youtube") youtubeTitles += 1;
      if (video.remote?.kind === "twitch") twitchTitles += 1;
      if (video.remote?.live) liveTitles += 1;
      if ((video.duration ?? 0) > 0) { knownDuration += video.duration ?? 0; durationTitles += 1; }
      if (resumeForVideo({ progress, resumeProgress }, video)?.t) resumedTitles += 1;
      totalViews += viewCounts[video.id] ?? 0;
      const videoTags = tags[video.id] ?? [];
      const usefulTopics = new Set(videoTags.map(canonicalTopic).filter((tag): tag is string => Boolean(tag)));
      if (videoTags.length) metadataTaggedTitles += 1;
      if (Boolean(video.remote?.channelName?.trim())) creatorTaggedTitles += 1;
      if (video.description?.trim()) descriptionTaggedTitles += 1;
      if (!videoTags.some(isTopicTag)) untaggedTitles += 1;
      for (const topic of usefulTopics) {
        byTag.set(topic, (byTag.get(topic) ?? 0) + 1);
        const rating = topicRatings.get(topic) ?? { total: 0, newest: 0 };
        rating.total += getRating(video.id); rating.newest = Math.max(rating.newest, video.addedAt);
        topicRatings.set(topic, rating);
        const sources = topicSources.get(topic) ?? new Set<string>();
        sources.add(video.remote?.kind ?? 'local');
        topicSources.set(topic, sources);
      }
      if (usefulTopics.size >= 2) multiTopicTitles += 1;
      if (video.remote && Date.now() - video.addedAt < 7 * 24 * 60 * 60_000) freshRemoteTitles += 1;
      const folder = byFolder.get(video.folderId) ?? { videos: 0, bytes: 0 };
      folder.videos += 1;
      folder.bytes += video.size;
      byFolder.set(video.folderId, folder);
      if (video.genre?.trim()) byGenre.set(video.genre, (byGenre.get(video.genre) ?? 0) + 1);
      for (const tag of videoTags) {
        const clean = tag.trim().toLowerCase();
        if (/^(?:year-|month-|day-|type-|provider-|format-|source-|keyword-|creator-|https?$)/.test(clean)) operationalTagAssignments += 1;

      }
    }
    const tagAssignments = [...byTag.values()].reduce((sum, count) => sum + count, 0);
    const bridgeTopics = [...topicSources.values()].filter((sources) => sources.size >= 2).length;
    const topicRows = [...byTag.entries()].filter(([, count]) => count >= 2).sort((a, b) => {
      const aRating = (topicRatings.get(a[0])?.total ?? 0) / a[1];
      const bRating = (topicRatings.get(b[0])?.total ?? 0) / b[1];
      return Number(tagIsLiked(b[0])) - Number(tagIsLiked(a[0])) || bRating - aRating || (topicRatings.get(b[0])?.newest ?? 0) - (topicRatings.get(a[0])?.newest ?? 0) || b[1] - a[1] || a[0].localeCompare(b[0]);
    });
    // “Most useful” is driven by saved reactions. An unrated topic may still
    // be useful for browsing, but it must not displace a topic with evidence.
    const ratedTopicRows = topicRows.filter(([topic, count]) => ((topicRatings.get(topic)?.total ?? 0) / count) > 0);
    return { totalBytes, byFolder, localTitles, remoteTitles, untaggedTitles, metadataTaggedTitles, creatorTaggedTitles, descriptionTaggedTitles, multiTopicTitles, operationalTagAssignments, bridgeTopics, freshRemoteTitles, thumbReady, youtubeTitles, twitchTitles, liveTitles, knownDuration, durationTitles, resumedTitles, totalViews, genreRows: [...byGenre.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])), topicRows, topicRatings, topTags: (ratedTopicRows.length ? ratedTopicRows : topicRows).slice(0, 14), tagAssignments, tagDensity: tagAssignments / Math.max(videos.length, 1), remoteShare: remoteTitles / Math.max(videos.length, 1) };
  }, [favoriteRevision, progress, resumeProgress, tags, videos, viewCounts]);
  const folderRows = useMemo(() => folders.filter((folder) => folder.kind !== "demo").map((folder) => ({ folder, ...(summary.byFolder.get(folder.id) ?? { videos: 0, bytes: 0 }) })).sort((a, b) => b.bytes - a.bytes || b.videos - a.videos || a.folder.name.localeCompare(b.folder.name)), [folders, summary.byFolder]);
  const adultTagStats = useMemo(() => {
    const fetish = new Map<string, number>();
    const sources = new Map<string, number>();
    let adultTitles = 0;
    for (const video of videos) {
      const folder = folders.find((f) => f.id === video.folderId);
      const isAdult = Boolean(folder?.adult) || Boolean(video.remote && ["eporner", "redtube", "chaturbate", "camsoda", "myfreecams", "reddit", "booru", "redgifs"].includes(video.remote.kind));
      if (!isAdult) continue;
      adultTitles += 1;
      for (const tag of tags[video.id] ?? []) {
        if (tag.startsWith("source-") || tag.startsWith("provider-")) {
          sources.set(tag, (sources.get(tag) ?? 0) + 1);
        } else if (tag.startsWith("fetish-") || (!tag.startsWith("format-") && !tag.startsWith("genre-") && tag.length >= 3)) {
          fetish.set(tag, (fetish.get(tag) ?? 0) + 1);
        }
      }
    }
    return {
      adultTitles,
      topFetish: [...fetish.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 16),
      topSources: [...sources.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10),
    };
  }, [folders, tags, videos]);
    const favoriteHealth = useMemo(() => {
    const videoIds = new Set(videos.map((video) => video.id));
    const saved = Object.keys(favorites);
    return { saved: saved.length, resolved: saved.filter((id) => videoIds.has(id)).length, missing: saved.filter((id) => !videoIds.has(id)).length };
  }, [favorites, videos]);
  const sourceHealth = useMemo(() => {
    const names = new Map<string, number>();
    for (const { folder } of folderRows) names.set(folder.name.trim().toLowerCase(), (names.get(folder.name.trim().toLowerCase()) ?? 0) + 1);
    const duplicateNames = [...names.entries()].filter(([, count]) => count > 1).map(([name, count]) => ({ name, count }));
    const largest = folderRows[0];
    return { duplicateNames, largest, concentration: largest ? Math.round(largest.bytes / Math.max(summary.totalBytes, 1) * 100) : 0 };
  }, [folderRows, summary.totalBytes]);
  const visibleFolderRows = showAllSources ? folderRows : folderRows.slice(0, 80);
  const exportStats = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    const feedback = exportFeedback();
    downloadCsv([
      ["metric", "value"],
      ["catalog_titles", videos.length], ["topic_tags_per_title", summary.tagDensity.toFixed(3)], ["remote_catalog_percent", Math.round(summary.remoteShare * 100)], ["local_storage_bytes_per_local_title", Math.round(summary.totalBytes / Math.max(summary.localTitles, 1))],
      ["local_storage_bytes", summary.totalBytes],
      ["topic_tag_assignments", summary.tagAssignments],
      ["favorites", Object.keys(favorites).length],
      ["local_titles", summary.localTitles], ["remote_titles", summary.remoteTitles], ["untagged_titles", summary.untaggedTitles], ["fresh_remote_titles_7d", summary.freshRemoteTitles],
      ["youtube_titles", summary.youtubeTitles], ["twitch_titles", summary.twitchTitles], ["live_titles", summary.liveTitles], ["poster_ready_titles", summary.thumbReady], ["unavailable_titles", Object.keys(unavailable).length], ["history_events", history.length],
      ["topic_tag_coverage_percent", Math.round(((videos.length - summary.untaggedTitles) / Math.max(videos.length, 1)) * 100)], ["largest_source_percent", sourceHealth.concentration], ["duplicate_source_names", sourceHealth.duplicateNames.length],
      ["metadata_tagged_titles", summary.metadataTaggedTitles], ["metadata_tag_coverage_percent", Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)], ["creator_tagged_titles", summary.creatorTaggedTitles], ["titles_with_description", summary.descriptionTaggedTitles],
      ["multi_topic_titles", summary.multiTopicTitles], ["cross_source_bridge_topics", summary.bridgeTopics], ["operational_tag_assignments", summary.operationalTagAssignments], ["useful_topic_share_percent", Math.round(((videos.length - summary.untaggedTitles) / Math.max(videos.length, 1)) * 100)],
      ["favorites_saved", favoriteHealth.saved], ["favorites_resolved", favoriteHealth.resolved], ["favorites_waiting_for_source", favoriteHealth.missing],
      ["video_ratings_saved", Object.keys(feedback.ratings).length], ["creator_ratings_saved", Object.keys(feedback.creatorRatings).length], ["creator_likes_saved", Object.keys(feedback.creatorLikes).length], ["notes_saved", Object.keys(feedback.notes).length],
      ["known_duration_titles", summary.durationTitles], ["known_duration_hours", Math.round(summary.knownDuration / 3600)], ["resume_marks", summary.resumedTitles], ["local_view_events", summary.totalViews],
      ...summary.genreRows.map(([name, count]) => [`genre:${name}`, count]),
      ...summary.topTags.map(([name, count]) => [`topic_tag:${name}`, count]),
      ...sourceHealth.duplicateNames.map(({ name, count }) => [`duplicate_source:${name}`, count]),
    ], `reelcase-library-insights-${stamp}.csv`);
  };
  const exportSources = () => downloadCsv([
    ["source", "kind", "mapped_titles", "local_storage_bytes", "last_checked"],
    ...folderRows.map(({ folder, videos: mapped, bytes: mappedBytes }) => [folder.name, folder.kind, mapped, mappedBytes, folder.lastCheckedAt ? new Date(folder.lastCheckedAt).toISOString() : ""]),
  ], `reelcase-source-map-${new Date().toISOString().slice(0, 10)}.csv`);
  const exportRemediation = () => downloadCsv([
    ["queue", "priority", "title_or_source", "reason", "suggested_safe_action"],
    ...videos.filter((video) => !(tags[video.id] ?? []).some(isTopicTag)).slice(0, 500).map((video, index) => ["topic-coverage", index + 1, video.name, "No useful topic tag", "Review in preview or apply explainable smart tags"]),
    ...sourceHealth.duplicateNames.flatMap(({ name, count }) => [["source-hygiene", 1, name, `${count} identical source labels`, "Open source map and rename only after review"]]),
    ...(sourceHealth.largest ? [["storage-concentration", 1, sourceHealth.largest.folder.name, `${sourceHealth.concentration}% of mapped local bytes`, "Review source contents; no files are changed automatically"]] : []),
  ], `reelcase-remediation-plan-${new Date().toISOString().slice(0, 10)}.csv`);
  return <HubShell eyebrow="Library intelligence" icon={<BarChart3 className="size-4"/>} title="Know what your library needs next." copy="These local-only counts help identify coverage gaps, oversized source folders, and the tags that are driving discovery.">
    <TopicLinks />
    <div className="mt-5 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={exportStats}><Download className="size-4"/>Download insight CSV</Button><Button size="sm" variant="secondary" onClick={exportSources}><Download className="size-4"/>Download source-map CSV</Button><Button size="sm" variant="secondary" onClick={exportRemediation}><Download className="size-4"/>Download remediation CSV</Button><span className="self-center text-xs text-muted">Exports only local catalog metadata, useful for improving sorting and discovery rules.</span></div>
    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Catalog titles" value={videos.length.toLocaleString()}/><Stat label="Local storage mapped" value={bytes(summary.totalBytes)}/><Stat label="Saved topic assignments" value={summary.tagAssignments.toLocaleString()}/><Stat label="Favorites" value={Object.keys(favorites).length.toLocaleString()}/></div>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult marks</p><h2 className="mt-2 font-display text-2xl text-fg">I cummed to it</h2><p className="mt-1 max-w-3xl text-sm text-muted">Private local counters only — stored with watch history on this device, never synced.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Marked titles</p><p className="mt-1 text-lg font-medium text-fg">{Object.values(cameCounts).filter((n) => n > 0).length.toLocaleString()}</p></div><div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Total marks</p><p className="mt-1 text-lg font-medium text-fg">{Object.values(cameCounts).reduce((sum, n) => sum + n, 0).toLocaleString()}</p></div></div><div className="mt-3 space-y-2">{Object.entries(cameCounts).filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, n]) => { const video = videos.find((item) => item.id === id); return <button key={id} type="button" className="block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg" onClick={() => video && useLibrary.getState().openPreview(video.id)}>{video?.name ?? id}<span className="ml-2 text-xs text-accent">· {n}×</span></button>; })}</div></section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult tags</p><h2 className="mt-2 font-display text-2xl text-fg">Fetish & source coverage</h2><p className="mt-1 max-w-3xl text-sm text-muted">Pulled from official adult APIs and private adult folders. Public Home rails stay public-only; these counts stay on this device.</p><div className="mt-3 grid gap-3 sm:grid-cols-3"><div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Adult titles</p><p className="mt-1 text-lg font-medium text-fg">{adultTagStats.adultTitles.toLocaleString()}</p></div><div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Top fetish tags</p><p className="mt-1 text-lg font-medium text-fg">{adultTagStats.topFetish.length.toLocaleString()}</p></div><div className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">Source tags</p><p className="mt-1 text-lg font-medium text-fg">{adultTagStats.topSources.length.toLocaleString()}</p></div></div><div className="mt-4 flex flex-wrap gap-2">{adultTagStats.topFetish.map(([tag, count]) => <span key={tag} className="rounded-full bg-bg/45 px-3 py-1 text-xs text-fg">#{tag} · {count}</span>)}</div><div className="mt-3 flex flex-wrap gap-2">{adultTagStats.topSources.map(([tag, count]) => <span key={tag} className="rounded-full bg-bg/45 px-3 py-1 text-xs text-muted">#{tag} · {count}</span>)}</div><Button className="mt-4" size="sm" variant="secondary" onClick={() => useLibrary.getState().setSource("adults")}>Open Adults</Button></section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Adult stats</p><h2 className="mt-2 font-display text-2xl text-fg">Exportable Adult rankings</h2><p className="mt-1 max-w-3xl text-sm text-muted">Source mix, ranked tags, Reddit signals, and I-cummed marks — local-only JSON or CSV.</p><div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => exportAdultStats(buildAdultStatsSnapshot(videos, folders, tags, { favorites, likes, cameCounts, viewCounts, ratingOf: getRating }), "csv")}><Download className="size-4"/>Adult stats CSV</Button><Button size="sm" variant="secondary" onClick={() => exportAdultStats(buildAdultStatsSnapshot(videos, folders, tags, { favorites, likes, cameCounts, viewCounts, ratingOf: getRating }), "json")}><Download className="size-4"/>Adult stats JSON</Button></div></section>
    <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Stat label="Local / remote" value={`${summary.localTitles.toLocaleString()} / ${summary.remoteTitles.toLocaleString()}`}/><Stat label="Remote catalog share" value={`${Math.round(summary.remoteShare * 100)}%`}/><Stat label="New provider items · 7d" value={summary.freshRemoteTitles.toLocaleString()}/><Stat label="Needs useful topic" value={`${summary.untaggedTitles.toLocaleString()} titles`}/><Stat label="Saved topic coverage" value={`${Math.round(((videos.length - summary.untaggedTitles) / Math.max(videos.length, 1)) * 100)}%`}/><Stat label="Topic tags per title" value={summary.tagDensity.toFixed(2)}/><Stat label="Cross-source topic bridges" value={summary.bridgeTopics.toLocaleString()}/><Stat label="Multi-topic titles" value={summary.multiTopicTitles.toLocaleString()}/><Stat label="Operational labels" value={summary.operationalTagAssignments.toLocaleString()}/><Stat label="Any metadata coverage" value={`${Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)}%`}/><Stat label="Creator / description coverage" value={`${summary.creatorTaggedTitles.toLocaleString()} / ${summary.descriptionTaggedTitles.toLocaleString()}`}/><Stat label="YouTube / Twitch" value={`${summary.youtubeTitles.toLocaleString()} / ${summary.twitchTitles.toLocaleString()}`}/><Stat label="Known runtime" value={`${Math.round(summary.knownDuration / 3600).toLocaleString()} hours`}/><Stat label="Resume marks" value={summary.resumedTitles.toLocaleString()}/><Stat label="Local view events" value={summary.totalViews.toLocaleString()}/><Stat label="Live right now" value={summary.liveTitles.toLocaleString()}/><Stat label="Artwork coverage" value={`${Math.round(summary.thumbReady / Math.max(videos.length, 1) * 100)}%`}/><Stat label="History events" value={history.length.toLocaleString()}/><Stat label="Unavailable cards" value={Object.keys(unavailable).length.toLocaleString()}/></section>
    <section className="mt-5 rounded-lg border border-border bg-surface p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Fast paths from your library</p><h2 className="mt-2 font-display text-2xl text-fg">Use the small, useful slice first.</h2><p className="mt-1 max-w-3xl text-sm leading-6 text-muted">Topic, Continue, and source views now reuse saved metadata and mount cards progressively. Favorite topics lead every topic list so the first results match what you actually want to browse.</p><div className="mt-4 grid gap-3 md:grid-cols-3"><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Favorite topics</p><p className="mt-1 text-lg font-medium text-fg">{summary.topicRows.filter(([topic]) => tagIsLiked(topic)).length}</p><p className="mt-1 text-xs text-muted">Pinned ahead of large catalog scans.</p></div><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Ready to resume</p><p className="mt-1 text-lg font-medium text-fg">{summary.resumedTitles.toLocaleString()}</p><p className="mt-1 text-xs text-muted">Stable resume records survive catalog refreshes.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => useLibrary.getState().setSource("continue")}>Open Continue</Button></div><div className="rounded-md bg-elevated p-3"><p className="text-xs text-muted">Metadata-first catalog</p><p className="mt-1 text-lg font-medium text-fg">{Math.round(summary.metadataTaggedTitles / Math.max(videos.length, 1) * 100)}%</p><p className="mt-1 text-xs text-muted">Existing metadata is used before slower title-only inference.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => useLibrary.getState().setSource("genres")}>Open Topics</Button></div></div>{summary.topicRows.filter(([topic]) => tagIsLiked(topic)).length > 0 && <div className="mt-4 flex flex-wrap gap-2">{summary.topicRows.filter(([topic]) => tagIsLiked(topic)).slice(0, 12).map(([topic, count]) => <Button key={topic} size="sm" variant="secondary" onClick={() => openTopic(topic)}>★ #{topic} · {count.toLocaleString()}</Button>)}</div>}</section>
    <section className="mt-5 grid gap-5 xl:grid-cols-2"><div className="h-72 rounded-lg bg-elevated p-5 shadow-border"><h2 className="font-display text-2xl text-fg">Provider mix</h2><ResponsiveContainer width="100%" height="85%"><BarChart data={[{ name: "Local", titles: summary.localTitles }, { name: "YouTube", titles: summary.youtubeTitles }, { name: "Twitch", titles: summary.twitchTitles }]}><XAxis dataKey="name" stroke="currentColor" fontSize={12}/><YAxis stroke="currentColor" fontSize={12}/><Tooltip/><Bar dataKey="titles" fill="var(--color-accent)" radius={4}/></BarChart></ResponsiveContainer></div><div className="h-72 rounded-lg bg-elevated p-5 shadow-border"><h2 className="font-display text-2xl text-fg">Most useful topics</h2><p className="mt-1 text-xs text-muted">Only topics with a saved rating appear here. Score is scaled to 5,000.</p><ResponsiveContainer width="100%" height="80%"><BarChart layout="vertical" margin={{ left: 16 }} data={summary.topTags.map(([name, titles]) => ({ name, titles, score: Math.round(((summary.topicRatings.get(name)?.total ?? 0) / titles) * 1000) })).filter((topic) => topic.score > 0).slice(0, 8)}><XAxis type="number" stroke="currentColor" fontSize={12}/><YAxis type="category" dataKey="name" width={150} stroke="currentColor" fontSize={10}/><Tooltip/><Bar dataKey="score" fill="var(--color-accent)" radius={4}/></BarChart></ResponsiveContainer></div></section>
    <section className="mt-5 grid gap-3 lg:grid-cols-4"><div className="rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Tagging backlog</p><p className="mt-2 font-display text-3xl text-fg">{summary.untaggedTitles.toLocaleString()}</p><p className="mt-1 text-sm text-muted">titles still need a useful topic tag. Prioritize these before adding more discovery rules.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => setRemediationView(remediationView === "topics" ? "" : "topics")}>Review safe queue</Button></div><div className="rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Storage concentration</p><p className="mt-2 font-display text-3xl text-fg">{sourceHealth.concentration}%</p><p className="mt-1 text-sm text-muted">of mapped local bytes sit in {sourceHealth.largest?.folder.name ?? "the largest source"}.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => setRemediationView(remediationView === "sources" ? "" : "sources")}>Review source queue</Button></div><div className="rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Source hygiene</p><p className="mt-2 font-display text-3xl text-fg">{sourceHealth.duplicateNames.length}</p><p className="mt-1 text-sm text-muted">duplicate source labels can make refresh results harder to interpret.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => setRemediationView(remediationView === "sources" ? "" : "sources")}>Review duplicates</Button></div><div className="rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Favorite recovery</p><p className="mt-2 font-display text-3xl text-fg">{favoriteHealth.resolved} / {favoriteHealth.saved}</p><p className="mt-1 text-sm text-muted">{favoriteHealth.missing ? `${favoriteHealth.missing} saved favorites are waiting for their source to return.` : "Every saved favorite resolves in the current catalog."}</p></div></section>
    {remediationView === "topics" && <section className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Safe tag review queue</p><p className="mt-1 text-sm text-muted">These are review candidates only—nothing is tagged or deleted by opening this queue.</p></div><Button size="sm" variant="secondary" onClick={() => useLibrary.getState().setSource("settings")}>Open smart-tag tools</Button></div><div className="mt-3 space-y-2">{videos.filter((video) => !(tags[video.id] ?? []).some(isTopicTag)).slice(0, 12).map((video) => <button key={video.id} type="button" className="block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg" onClick={() => useLibrary.getState().openPreview(video.id)}>{video.name}<span className="ml-2 text-xs text-muted">· no useful topic yet</span></button>)}</div></section>}
    {remediationView === "sources" && <section className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Safe source review queue</p><p className="mt-1 text-sm text-muted">Review signals only. Reelcase will not rename, reconnect, or remove a folder from this page.</p><div className="mt-3 space-y-2">{sourceHealth.largest && <button type="button" className="block w-full rounded-sm bg-bg/45 px-3 py-2 text-left text-sm text-fg" onClick={() => useLibrary.getState().setSource(sourceHealth.largest!.folder.id)}>Largest source · {sourceHealth.largest.folder.name} · {bytes(sourceHealth.largest.bytes)}</button>}{sourceHealth.duplicateNames.map(({ name, count }) => <p key={name} className="rounded-sm bg-bg/45 px-3 py-2 text-sm text-fg">Duplicate label · {name} · {count} sources</p>)}</div></section>}
    <div className="mt-6 grid gap-5 xl:grid-cols-2"><section className="rounded-lg bg-elevated p-5 shadow-border"><h2 className="font-display text-2xl text-fg">Genre distribution</h2><p className="mt-1 text-xs text-muted">Bars compare genres with the most common genre in this list.</p><div className="mt-4 space-y-3">{summary.genreRows.slice(0, 18).map(([genre, count]) => <DistributionRow key={genre} label={genre} value={count} total={summary.genreRows[0]?.[1] ?? 1}/>) || <p className="text-sm text-muted">Genres will appear as media is tagged.</p>}</div></section><section className="rounded-lg bg-elevated p-5 shadow-border"><h2 className="font-display text-2xl text-fg">Most useful tags</h2><p className="mt-1 text-xs text-muted">Bars compare useful topics with the leading topic, not the full catalog.</p><div className="mt-4 space-y-3">{summary.topTags.map(([tag, count]) => <button key={tag} className="block w-full text-left" onClick={() => openTopic(tag)}><DistributionRow label={`#${tag}`} value={count} total={summary.topTags[0]?.[1] ?? 1}/></button>) || <p className="text-sm text-muted">Tags will appear as media is indexed.</p>}</div></section></div>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border"><h2 className="font-display text-2xl text-fg">Source mapping & storage</h2><p className="mt-1 text-sm text-muted">Only local files contribute bytes; remote providers report catalog counts but not source storage.</p><div className="mt-4 space-y-2">{visibleFolderRows.map(({ folder, videos: mapped, bytes: folderBytes }) => <div key={folder.id} className="flex flex-wrap items-center justify-between gap-3 rounded-sm bg-bg/45 px-3 py-3"><span className="min-w-0 truncate text-sm text-fg">{folder.name}</span><span className="text-xs text-muted">{mapped.toLocaleString()} mapped · {folderBytes ? bytes(folderBytes) : folder.kind === "youtube" || folder.kind === "twitch" ? "remote catalog" : "no local media yet"}</span></div>)}</div>{folderRows.length > visibleFolderRows.length && <Button variant="secondary" size="sm" className="mt-4" onClick={() => setShowAllSources(true)}>Show all {folderRows.length.toLocaleString()} sources</Button>}</section>
  </HubShell>;
}

export function LanConnectionSection() {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [companion, setCompanion] = useState<"checking" | "ready" | "offline">("checking");
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [mapStatus, setMapStatus] = useState("Checking devices…");
  const ownDeviceId = useMemo(() => getNetworkDeviceId(), []);
  const refreshDeviceMap = async () => {
    try {
      const result = await listNetworkDevices();
      setDevices(result.devices);
      setMapStatus(result.devices.length ? `${result.devices.length} active device${result.devices.length === 1 ? "" : "s"}` : "Waiting for another device to open Reelcase");
    } catch { setMapStatus("Device map is temporarily unavailable"); }
  };
  useEffect(() => {
    const current = window.location;
    const loopback = current.hostname === "localhost" || current.hostname === "127.0.0.1" || current.hostname === "::1";
    setOrigin(loopback ? "" : current.origin);
    void fetch("http://127.0.0.1:43123/health").then((response) => setCompanion(response.ok ? "ready" : "offline")).catch(() => setCompanion("offline"));
    void refreshDeviceMap();
    const timer = window.setInterval(() => void refreshDeviceMap(), 10_000);
    return () => window.clearInterval(timer);
  }, []);
  const copyAddress = async () => {
    if (!origin) return;
    try { await navigator.clipboard.writeText(origin); setCopied(true); } catch { setCopied(false); }
  };
  const visibleDevices = devices.slice(0, 12);
  return <HubShell eyebrow="Home network" icon={<Wifi className="size-4"/>} title="Bring another screen into Reelcase." copy="Share one address, watch the device map appear, then start a room when everyone is connected.">
    <section className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-lg bg-elevated p-5 shadow-border">
        <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Share this address</p>
        {origin ? <><p className="mt-2 break-all font-mono text-sm text-fg">{origin}</p><div className="mt-4 flex flex-wrap gap-2"><Button onClick={() => void copyAddress()}><Copy className="size-4"/>{copied ? "Address copied" : "Copy address"}</Button><Button variant="secondary" onClick={() => useLibrary.getState().setSource("watch-room")}>Open Watch Room</Button></div><p className="mt-4 text-xs leading-5 text-muted">On another computer, phone, or TV browser: join the same normal home Wi‑Fi, open this exact address, and leave Reelcase open. It will appear in the map below within about 25 seconds.</p></> : <><p className="mt-2 text-sm text-fg">Open Reelcase through the Ethernet address before sharing.</p><p className="mt-2 text-sm leading-6 text-muted">This local-only address cannot be reached by another device. Use the Connection guide from the shared Ethernet address, then copy the address it shows.</p></>}
      </div>
      <div className="rounded-lg border border-border bg-surface p-5"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Local companion</p><p className="mt-2 font-display text-2xl text-fg">{companion === "ready" ? "Ready on this computer" : companion === "checking" ? "Checking…" : "Not detected"}</p><p className="mt-2 text-sm text-muted">The companion speeds up local folders on this computer. Other devices can join the Reelcase page and Watch Rooms, but do not receive its local files.</p></div>
    </section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Available device map</p><h2 className="mt-2 font-display text-2xl text-fg">{mapStatus}</h2><p className="mt-1 text-sm text-muted">Devices appear only after they open Reelcase. The map stores a short-lived browser label, never network addresses or files.</p></div><Button size="sm" variant="secondary" onClick={() => void refreshDeviceMap()}><RefreshCw className="size-4"/>Refresh map</Button></div>
      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(12rem,0.75fr)_minmax(0,1.25fr)]"><div className="rounded-md border border-border bg-bg/45 p-4"><div className="flex items-center gap-3"><Wifi className="size-5 text-accent"/><div><p className="text-sm font-medium text-fg">Reelcase host</p><p className="text-xs text-muted">{origin || "Local preview"}</p></div></div><p className="mt-4 text-xs leading-5 text-muted">This computer shares the app address and coordinates the active-device map.</p></div><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{visibleDevices.map((device) => <div key={device.id} className="rounded-md bg-bg/45 p-3"><div className="flex items-center gap-2">{device.kind === "mobile" ? <Smartphone className="size-4 text-accent"/> : <Laptop className="size-4 text-accent"/>}<p className="min-w-0 truncate text-sm font-medium text-fg">{device.id === ownDeviceId ? "This device" : device.label}</p></div><p className="mt-2 text-xs text-muted">{device.id === ownDeviceId ? device.label : "Connected to Reelcase"}</p><p className="mt-1 text-[11px] text-accent">Active now</p></div>)}{!visibleDevices.length && <div className="rounded-md border border-dashed border-border p-3 text-sm text-muted sm:col-span-2 xl:col-span-3">Waiting for a device to open the shared address.</div>}</div></div>
    </section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Four steps to connect</p><ol className="mt-4 grid gap-4 md:grid-cols-2"><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">1. Use the Ethernet address.</span><br/>Use the address shown above for normal home Wi‑Fi and Ethernet. The NordLynx address is for VPN peers.</li><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">2. Keep guests off isolated Wi‑Fi.</span><br/>Guest Wi‑Fi often blocks device-to-device traffic. Join the normal household network instead.</li><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">3. Look for the device map.</span><br/>A guest that opens Reelcase shows up here automatically. Refresh the map if it has just joined.</li><li className="rounded-md bg-bg/45 p-4 text-sm text-muted"><span className="font-medium text-fg">4. Start or join a Watch Room.</span><br/>After the guest is visible, open Watch Room and use the same invitation or room code.</li></ol><p className="mt-4 text-xs leading-5 text-subtle">If the shared page does not open, allow Reelcase through the host computer’s private-network firewall and confirm the guest is on the same normal home network.</p></section>
  </HubShell>;
}

export function FindPhoneSection() {
  return <HubShell eyebrow="Device recovery" icon={<Search className="size-4"/>} title="Find your phone." copy="Open your device maker’s official locator. Reelcase does not collect location data or keep a copy of your account credentials.">
    <section className="mt-6 grid gap-4 md:grid-cols-2"><a href="https://www.google.com/android/find/" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Android</p><h2 className="mt-2 font-display text-2xl text-fg">Find My Device</h2><p className="mt-2 text-sm text-muted">Open Google’s official Android device locator in a secure new tab.</p></a><a href="https://www.icloud.com/find/" target="_blank" rel="noopener noreferrer" className="rounded-lg bg-elevated p-5 shadow-border transition-colors hover:bg-surface"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">iPhone</p><h2 className="mt-2 font-display text-2xl text-fg">Find My</h2><p className="mt-2 text-sm text-muted">Open Apple’s official device locator in a secure new tab.</p></a></section>
  </HubShell>;
}

function DistributionRow({ label, value, total }: { label: string; value: number; total: number }) {
  // Distribution rows compare peers, not the whole catalog. The highest tag
  // should read as the full reference bar instead of every useful label being
  // compressed to a tiny percentage of all titles.
  return <div><div className="flex justify-between gap-3 text-sm"><span className="truncate text-fg">{label}</span><span className="text-muted">{value}</span></div><div className="mt-1 h-2 overflow-hidden rounded-full bg-bg/70"><div className="h-full bg-accent" style={{ width: `${Math.max(3, Math.round(value / Math.max(total, 1) * 100))}%` }}/></div></div>;
}

export function SettingsSection() {
  const [hub, setHub] = useState<HubStore>({ prints: [], games: [] });
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [preferenceGroup, setPreferenceGroup] =
    useState<keyof typeof PREFERENCE_GROUPS>("Playback");
  const [zoom, setZoom] = useState(100);
  const [railLimit, setRailLimit] = useState(8);
  const [gridPageSize, setGridPageSize] = useState(48);
  const [thumbnailWorkers, setThumbnailWorkers] = useState(0);
  const [textFirstArtwork, setTextFirstArtwork] = useState(false);
  const [photoWorkers, setPhotoWorkers] = useState(0);
  const [defaultVolume, setDefaultVolume] = useState(85);
  const [startMuted, setStartMuted] = useState(false);
  const [videoVisionBusy, setVideoVisionBusy] = useState(false);
  const [videoVisionNote, setVideoVisionNote] = useState("");
  const [twitchRefreshSeconds, setTwitchRefreshSeconds] = useState(30);
  const [liveDensity, setLiveDensity] = useState(4);
  const [sourceCacheFirst, setSourceCacheFirst] = useState(true);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [theme, setTheme] = useState<"night" | "day">("night");
  const [debugReport, setDebugReport] = useState("");
  const [, refreshDebug] = useState(0);
  const refreshFollows = useLibrary((s) => s.refreshFollows);
  const folders = useLibrary((s) => s.folders);
  const videos = useLibrary((s) => s.videos);
  const tags = useLibrary((s) => s.tags);
  const setVideoTags = useLibrary((s) => s.setVideoTags);
  const refreshSourcePhotos = useLibrary((s) => s.refreshSourcePhotos);
  const unavailableVideoCount = useLibrary((s) => Object.keys(s.unavailable).length);
  const remoteCheckedAt = useLibrary((s) => s.remoteCheckedAt);
  const smartTagStatus = useMemo(() => {
    const local = videos.filter((video) => !video.remote);
    const tagged = local.filter((video) => (tags[video.id] ?? []).some((tag) => /^(?:year-|month-|type-|source-)/.test(tag))).length;
    return { local: local.length, tagged, waiting: Math.max(0, local.length - tagged) };
  }, [tags, videos]);
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
  useEffect(() => { const saved = Number(localStorage.getItem("reelcase.grid-page-size") ?? "48"); setGridPageSize([24, 48, 96, 144].includes(saved) ? saved : 48); }, []);
  useEffect(() => { const saved = Number(localStorage.getItem("reelcase.thumbnail-workers") ?? "0"); setThumbnailWorkers([1, 2, 3, 4].includes(saved) ? saved : 0); }, []);
  useEffect(() => { const textFirst = localStorage.getItem("reelcase.artwork-mode") === "text"; setTextFirstArtwork(textFirst); document.documentElement.dataset.artworkMode = textFirst ? "text" : "images"; }, []);
  useEffect(() => { const saved = Number(localStorage.getItem("reelcase.photo-scan-workers") ?? "0"); setPhotoWorkers([2, 4, 6, 8, 12].includes(saved) ? saved : 0); }, []);
  useEffect(() => { const saved = Number(localStorage.getItem("reelcase.player-volume") ?? "85"); setDefaultVolume([25, 50, 70, 85, 100].includes(saved) ? saved : 85); setStartMuted(localStorage.getItem("reelcase.player-start-muted") === "true"); }, []);
  useEffect(() => { const saved = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "30"); setTwitchRefreshSeconds([15, 30, 60, 120, 300].includes(saved) ? saved : 30); }, []);
  useEffect(
    () => setSourceCacheFirst(localStorage.getItem("reelcase.source-cache-first") !== "false"),
    [],
  );
  useEffect(() => { try { setDebugEnabled(localStorage.getItem("reelcase.debug-panel") === "true"); } catch { /* unavailable */ } }, []);
  useEffect(() => {
    if (!debugEnabled) return;
    const timer = window.setInterval(() => refreshDebug((value) => value + 1), 1_000);
    return () => window.clearInterval(timer);
  }, [debugEnabled]);
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
      note: "Reelcase library metadata only. Original local files and browser permission handles are never exported.",
      library: {
        folders: state.folders,
        videos: state.videos,
        favorites: Object.keys(state.favorites),
        likes: Object.keys(state.likes),
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
    const candidates = videos.filter((video) => !video.remote && !(tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).slice(0, 12);
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
      ready.forEach((video, index) => setVideoTags(video.id, [...(useLibrary.getState().tags[video.id] ?? []), ...labels[index].map((item) => `vision-${item.label}`)]));
      const report = ready.slice(0, 3).map((video, index) => `${video.name}: ${labels[index].map((item) => `${item.label} ${Math.round(item.score * 100)}%`).join(", ") || "no confident label"}`).join(" · ");
      setVideoVisionNote(`Tagged ${ready.length} local video frame${ready.length === 1 ? "" : "s"} · ${report}`);
    } catch { setVideoVisionNote("The local vision model could not start. File data stayed on this device; filename tags are still available."); }
    finally { setVideoVisionBusy(false); }
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
      copy="Your Reelcase library stays in this browser. Export a portable metadata backup whenever you need it."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Video entries" value={useLibrary((s) => s.videos.length)} />
        <Stat label="Followed channels" value={useLibrary((s) => s.follows.length)} />
        <Stat label="Saved hub items" value={hub.prints.length + hub.games.length} />
      </div>
      {unavailableVideoCount > 0 && <div className="mt-4 rounded-lg border border-danger/40 bg-elevated p-4"><p className="text-sm font-medium text-fg">Playback health queue · {unavailableVideoCount} hidden</p><p className="mt-1 text-xs leading-5 text-muted">These catalog entries were hidden after a browser file-permission or decode failure. Reconnect the source folder from the playback message to rebuild its live file handles.</p></div>}
      <section className="mt-4 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Smart local tags</p><h2 className="mt-2 font-display text-2xl text-fg">Tag by name, date, and file type.</h2><p className="mt-1 max-w-2xl text-sm text-muted">Adds private, explainable tags such as year-2026, month-september, type-mp4, and meaningful words from the filename. Existing manual tags are preserved; nothing is uploaded.</p><p className="mt-3 text-xs text-accent">{smartTagStatus.tagged.toLocaleString()} of {smartTagStatus.local.toLocaleString()} local files ready · {smartTagStatus.waiting ? `${smartTagStatus.waiting.toLocaleString()} can still be enriched` : "coverage is current"}</p><Button className="mt-4" size="sm" variant="secondary" disabled={!smartTagStatus.local} onClick={() => { const changed = useLibrary.getState().autoTagLibrary(); setServiceNote(changed ? `Smart-tag run finished · ${changed} catalog item${changed === 1 ? "" : "s"} updated.` : "Smart tags are already current for every loaded catalog item."); }}> {smartTagStatus.waiting ? "Apply smart tags to remaining files" : "Recheck smart-tag coverage"}</Button></section>
      <section className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Beta · local video vision</p><h2 className="mt-2 font-display text-2xl text-fg">Tag local videos from a cached frame.</h2><p className="mt-1 max-w-2xl text-sm text-muted">Uses the same on-device image model as Photos on one cached local thumbnail per video. It runs only when you start it, uses a bounded 12-video batch, and keeps frames and labels on this device.</p><p className="mt-3 text-xs text-accent">{videos.filter((video) => !video.remote && (tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).length.toLocaleString()} processed · {videos.filter((video) => !video.remote && !(tags[video.id] ?? []).some((tag) => tag.startsWith("vision-"))).length.toLocaleString()} waiting · ready when local frame artwork is cached</p><Button className="mt-4" size="sm" variant="secondary" disabled={videoVisionBusy || !videos.some((video) => !video.remote)} onClick={() => void tagLocalVideoFrames()}>{videoVisionBusy ? videoVisionNote || "Preparing local frames…" : "Prepare and tag next 12 local videos"}</Button>{videoVisionNote && <p className="mt-3 text-xs text-accent">Latest output · {videoVisionNote}</p>}</section>
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
      <section className="mt-6 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Connected services</p><h2 className="mt-2 font-display text-2xl text-fg">Independent caches, on your schedule.</h2><p className="mt-1 text-sm text-muted">Twitch and YouTube refresh together from your saved follows. Photo imports, Roku discovery, and Spotify remain independently local and refresh only when you ask.</p><div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{[{ name: "YouTube", detail: "Saved channels", checked: remoteCheckedAt, action: async () => { const result = await refreshFollows(); setServiceNote(`Refreshed channel cache · ${result.newVideos.length} new items.`); } }, { name: "Twitch", detail: "Live + VOD cache", checked: remoteCheckedAt, action: async () => { const result = await refreshFollows(); setServiceNote(`Refreshed Twitch status · ${result.wentLive.length} channels live.`); } }, { name: "Photos", detail: `${folders.filter((folder) => folder.photoCount).length} source folders`, checked: Math.max(0, ...folders.map((folder) => folder.lastCheckedAt ?? 0)), action: async () => { const sources = folders.filter((folder) => folder.photoCount && (folder.kind === "directory" || folder.kind === "files")); const counts = await Promise.all(sources.map((folder) => refreshSourcePhotos(folder.id))); setServiceNote(`Refreshed local photo sources · ${counts.reduce((sum, count) => sum + count, 0)} photos found.`); } }, { name: "Roku", detail: "Companion-assisted", checked: 0, action: async () => { try { const res = await fetch("http://127.0.0.1:43123/roku/discover"); const data = await res.json() as { devices?: unknown[] }; setServiceNote(`Roku refresh complete · ${(data.devices ?? []).length} device(s) found.`); } catch { setServiceNote("Roku refresh needs the local Reelcase Companion running."); } } }, { name: "Spotify", detail: "Saved music shortcuts", checked: 0, action: async () => { setServiceNote("Spotify shortcuts are local and ready. Open Spotify from its library section to refresh provider content."); } }].map((service) => <div key={service.name} className="rounded-md bg-bg/45 p-3 shadow-border"><p className="text-sm font-medium text-fg">{service.name}</p><p className="mt-1 text-xs text-muted">{service.detail}</p><p className="mt-1 text-[11px] text-subtle">{service.checked ? `Last refreshed ${new Date(service.checked).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Not refreshed this session"}</p><Button size="sm" variant="secondary" className="mt-3" onClick={() => void service.action()}>Refresh</Button></div>)}</div>{serviceNote && <p className="mt-3 text-xs text-accent">{serviceNote}</p>}</section>
      <section className="mt-6"><div className="mb-3"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Device & performance</p><p className="mt-1 text-sm text-muted">The controls that change how Reelcase runs and fits your screen.</p></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <span className="text-accent"><Settings2 className="size-5" /></span>
          <h2 className="mt-3 font-display text-2xl text-fg">Diagnostics</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Keep a local, opt-in status panel for source, cache, and companion troubleshooting. It is off by default and sends nothing away.</p>
          <ol className="mt-3 space-y-1 text-xs leading-5 text-muted"><li><span className="text-accent">1.</span> In the main Reelcase folder, double-click <strong className="text-fg">Start-Reelcase-Companion.cmd</strong>.</li><li><span className="text-accent">2.</span> Leave the small Companion window open until it says it is listening.</li><li><span className="text-accent">3.</span> Enable diagnostics, select Check companion, then open Games to load approved shortcuts.</li></ol>
          <p className="mt-2 text-xs leading-5 text-subtle">The companion is optional. It only runs on this computer and is needed for desktop shortcut launching, source checks, and TV discovery—not for browsing your media library.</p>
          <Button size="sm" variant={debugEnabled ? "default" : "secondary"} className="mt-4" onClick={() => { const next = !debugEnabled; setDebugEnabled(next); localStorage.setItem("reelcase.debug-panel", String(next)); if (!next) setDebugReport(""); }}>
            {debugEnabled ? "Disable diagnostics" : "Enable diagnostics"}
          </Button>
          {debugEnabled && <div className="mt-3 rounded-sm bg-bg/45 p-3 text-xs leading-5 text-muted"><p>{useLibrary.getState().videos.length} catalog entries · {useLibrary.getState().folders.length} sources · {navigator.onLine ? "browser online" : "browser offline"}</p><p>{useLibrary.getState().folders.filter((folder) => folder.health === "healthy").length} healthy · {useLibrary.getState().folders.filter((folder) => folder.health === "cached").length} cache-first · {useLibrary.getState().folders.filter((folder) => folder.health === "permission-needed" || folder.health === "unavailable").length} need attention</p><p>{(() => { const budget = getRenderBudgetSnapshot(); const feedback = getFeedbackDiagnostics(); const thumbs = useThumbs.getState(); const artwork = getThumbDiagnostics(); return `${budget.mountedCards} mounted cards · ${Object.keys(thumbs.byId).length} artwork cache entries · ${artwork.active} decoding / ${artwork.queued} queued · artwork ${artwork.hits} hit / ${artwork.misses} miss${artwork.evictions ? ` / ${artwork.evictions} evicted` : ""} · ${budget.lastFrameMs}ms last frame${budget.longFrames ? ` · ${budget.longFrames} long frames (worst ${budget.worstFrameMs}ms)` : ""} · rating queue ${feedback.lastRatingQueueMs}ms / disk ${feedback.lastPersistMs}ms${feedback.pendingWrites ? " pending" : ""}`; })()}</p><p>{(() => { const first = getFirstShelfTrace(); return first.elapsedMs ? `First shelf · ${first.elapsedMs}ms · ${first.title} · ${first.cards} visible cards` : "First shelf · waiting for the first visible rail"; })()}</p><p>{(() => { const interaction = getInteractionBudgetSnapshot(); return `Input to next paint · navigation ${interaction.navigation.lastMs}ms (worst ${interaction.navigation.worstMs}ms) · search ${interaction.search.lastMs}ms · rating ${interaction.rating.lastMs}ms`; })()}</p><Button size="sm" variant="ghost" className="mt-2" onClick={() => void (async () => { try { const response = await fetch("http://127.0.0.1:43123/health"); const data = await response.json() as { version?: number; roots?: number; desktopEnabled?: boolean }; setDebugReport(`Companion v${data.version ?? "?"} · ${data.roots ?? 0} approved roots · Desktop ${data.desktopEnabled ? "ready" : "not available"}`); } catch { setDebugReport("Companion is not running or is unavailable to this browser."); } })()}>Check companion</Button>{debugReport && <p className="mt-2 text-accent">{debugReport}</p>}</div>}
        </div>
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <span className="text-accent">
            <Settings2 className="size-5" />
          </span>
          <h2 className="mt-3 font-display text-2xl text-fg">App zoom</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Scale the entire library interface for this browser. Your choice is remembered
            everywhere in Reelcase.
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
          <p className="mt-2 text-sm leading-6 text-muted">Choose the palette that is easiest on your eyes. It applies to every Reelcase page and stays on this device.</p>
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
        <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><PackageSearch className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Grid memory budget</h2><p className="mt-2 text-sm leading-6 text-muted">Sets how many poster cards are mounted at once before a Next page control. Use 24 for the smoothest experience with very large YouTube and Twitch libraries.</p><div className="mt-4 flex flex-wrap gap-2">{[24, 48, 96, 144].map((value) => <Button key={value} size="sm" variant={gridPageSize === value ? "default" : "secondary"} onClick={() => { setGridPageSize(value); localStorage.setItem("reelcase.grid-page-size", String(value)); window.dispatchEvent(new Event("reelcase:render-settings")); }}>{value} cards</Button>)}</div></div>
        <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><PackageSearch className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Artwork worker budget</h2><p className="mt-2 text-sm leading-6 text-muted">Controls concurrent local thumbnail extraction. Adaptive uses device cores, available memory, and foreground input pressure.</p><div className="mt-4 flex flex-wrap gap-2">{[[0, "Adaptive"], [1, "Text-first · 1"], [2, "Gentle · 2"], [3, "Balanced · 3"], [4, "Fast · 4"]].map(([value, label]) => <Button key={value} size="sm" variant={thumbnailWorkers === value ? "default" : "secondary"} onClick={() => { setThumbnailWorkers(value as number); localStorage.setItem("reelcase.thumbnail-workers", String(value)); }}>{label}</Button>)}</div><Button size="sm" variant={textFirstArtwork ? "default" : "secondary"} className="mt-4" onClick={() => { const next = !textFirstArtwork; setTextFirstArtwork(next); localStorage.setItem("reelcase.artwork-mode", next ? "text" : "images"); document.documentElement.dataset.artworkMode = next ? "text" : "images"; }}> {textFirstArtwork ? "Text-first provider rows on" : "Use text-first provider rows"}</Button></div>
        <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><PackageSearch className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Photo scan workers</h2><p className="mt-2 text-sm leading-6 text-muted">Sets background folder workers for cached photo metadata. Adaptive protects browsing; use Fast when you want a newly added photo source ready sooner.</p><div className="mt-4 flex flex-wrap gap-2">{[[0, "Adaptive"], [2, "Gentle · 2"], [4, "Balanced · 4"], [6, "Fast · 6"], [8, "Max · 8"], [12, "Turbo · 12"]].map(([value, label]) => <Button key={value} size="sm" variant={photoWorkers === value ? "default" : "secondary"} onClick={() => { setPhotoWorkers(value as number); localStorage.setItem("reelcase.photo-scan-workers", String(value)); }}>{label}</Button>)}</div></div>
        <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><Settings2 className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Player sound</h2><p className="mt-2 text-sm leading-6 text-muted">Sets the starting volume for local video and whether a newly opened player starts muted. Provider embeds keep their own service-level audio controls.</p><div className="mt-4 flex flex-wrap gap-2">{[25, 50, 70, 85, 100].map((value) => <Button key={value} size="sm" variant={defaultVolume === value ? "default" : "secondary"} onClick={() => { setDefaultVolume(value); localStorage.setItem("reelcase.player-volume", String(value)); }}>{value}%</Button>)}</div><Button className="mt-3" size="sm" variant={startMuted ? "default" : "secondary"} onClick={() => { const next = !startMuted; setStartMuted(next); localStorage.setItem("reelcase.player-start-muted", String(next)); }}>{startMuted ? "Start muted" : "Start with sound"}</Button></div>
        <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><Radio className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Twitch live & archive refresh</h2><p className="mt-2 text-sm leading-6 text-muted">Checks a rotating batch while this tab is visible. Every mixed pass reserves Twitch archive channels, keeps earlier VODs when a provider response is partial, and updates live state separately. Thirty seconds is the default.</p><div className="mt-4 flex flex-wrap gap-2">{[[15, "15 sec"], [30, "30 sec"], [60, "1 min"], [120, "2 min"], [300, "5 min"]].map(([value, label]) => <Button key={value} size="sm" variant={twitchRefreshSeconds === value ? "default" : "secondary"} onClick={() => { setTwitchRefreshSeconds(value as number); localStorage.setItem("reelcase.twitch-refresh-seconds", String(value)); window.dispatchEvent(new Event("reelcase:refresh-settings")); }}>{label}</Button>)}</div></div>
      </div></section>
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
          title="How Reelcase works"
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
              Every switch below works now, changes Reelcase immediately, and is saved in this browser. Future ideas belong in the Mission plan—not in this control panel.
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
      copy="Keep a lightweight catalog of print-ready files. Add STL, OBJ, 3MF, or G-code files to track what is ready for the printer."
      accept=".stl,.obj,.3mf,.gcode"
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
          Account sign-in and playback remain on Spotify’s official site or app. Reelcase does not
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
        session, then Reelcase can read permitted YouTube metadata and available creator tags.
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
  rating: number;
  addedAt: number;
  width?: number;
  height?: number;
  /** Retained only while the current browser session derives local dimensions. */
  file?: File;
  vision?: VisionLabel[];
  visionModel?: VisionModelId;
};
type PhotoSort = "newest" | "name" | "rating" | "favorite" | "auto-tags";
const PHOTO_FILE_RE = /\.(avif|bmp|gif|heic|heif|jpe?g|png|tiff?|webp)$/i;
const photoSourceWarmth = new Map<string, number>();
const PHOTO_BACKGROUND_REFRESH_MS = 30 * 60_000;
let cachedPhotoMetadata: Record<string, Partial<LocalPhoto>> | null = null;

function photoMetadata() {
  if (cachedPhotoMetadata) return cachedPhotoMetadata;
  try { cachedPhotoMetadata = JSON.parse(localStorage.getItem("reelcase.photo-meta.v1") ?? "{}"); }
  catch { cachedPhotoMetadata = {}; }
  return cachedPhotoMetadata as Record<string, Partial<LocalPhoto>>;
}

export function PhotosSection() {
  const scannedPhotoSources = useRef(new Set<string>());
  const photoUrls = useRef(new Set<string>());
  const knownPhotoIds = useRef(new Set<string>());
  const discoverySeen = useRef(new Set<string>());
  const metadataWriteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [ratingQueuePhotoId, setRatingQueuePhotoId] = useState(() => {
    try { return localStorage.getItem("reelcase.photos.rating-queue") ?? ""; } catch { return ""; }
  });
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
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
  const [photoLimit, setPhotoLimit] = useState(80);
  const [visionBusy, setVisionBusy] = useState(false);
  const [visionProgress, setVisionProgress] = useState("");
  const [visionReport, setVisionReport] = useState<Array<{ id: string; name: string; labels: VisionLabel[] }>>([]);
  const [visionModel, setVisionModel] = useState<VisionModelId>("semanticPro");
  const [visionReviewOpen, setVisionReviewOpen] = useState(true);
  const [visionBenchmark, setVisionBenchmark] = useState<VisionBenchmark | null>(() => {
    try { const saved = JSON.parse(localStorage.getItem("reelcase.photo-vision-benchmark.v1") ?? "null") as Partial<VisionBenchmark> | null; return saved?.semantic && saved.semanticPro ? saved as VisionBenchmark : null; } catch { return null; }
  });
  const [visionBenchmarkPhotos, setVisionBenchmarkPhotos] = useState<Array<{ id: string; name: string; url: string; clip: VisionLabel[]; siglip: VisionLabel[] }>>([]);
  const [visionBenchmarkBusy, setVisionBenchmarkBusy] = useState(false);
  const [visionBenchmarkProgress, setVisionBenchmarkProgress] = useState("");
  const [visionBenchmarkError, setVisionBenchmarkError] = useState("");
  const [upscalerHealth, setUpscalerHealth] = useState<{ state: "checking" | "ready" | "missing"; detail: string }>({ state: "checking", detail: "Checking local model cache…" });
  const [upscalerUrl, setUpscalerUrl] = useState<string>(LOCAL_UPSCALER.artifactUrl);
  const [upscalerChecksum, setUpscalerChecksum] = useState<string>(LOCAL_UPSCALER.sha256);
  const [upscalerInstalling, setUpscalerInstalling] = useState(false);
  const [upscalePreview, setUpscalePreview] = useState("");
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
    if (!/^https:\/\//i.test(url) || !/^[a-f0-9]{64}$/.test(expected)) { setUpscalerHealth({ state: "missing", detail: "Enter an HTTPS model URL and the publisher’s exact 64-character SHA-256 checksum. Reelcase will not install an unverifiable model." }); return; }
    setUpscalerInstalling(true);
    setUpscalerHealth({ state: "checking", detail: "Downloading the model after your explicit request and verifying its SHA-256…" });
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(120_000) });
      if (!response.ok) throw new Error(`Download returned ${response.status}`);
      const blob = await response.blob();
      if (!blob.size || blob.size > 750 * 1024 * 1024) throw new Error("Model size is outside the safe local cache budget");
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()))).map((part) => part.toString(16).padStart(2, "0")).join("");
      if (digest !== expected) throw new Error("Checksum mismatch — the model was not stored");
      const cacheKey = "/reelcase-local-models/upscaler.onnx";
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
    const read = async () => {
      try {
        const response = await fetch("http://127.0.0.1:43123/cache-status");
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
    void read();
    const timer = window.setInterval(() => void read(), 30_000);
    return () => { alive = false; window.clearInterval(timer); if (companionDeltaTimer.current) window.clearTimeout(companionDeltaTimer.current); };
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
  useEffect(() => () => { for (const url of photoUrls.current) URL.revokeObjectURL(url); photoUrls.current.clear(); }, []);
  useEffect(() => {
    // Metadata writes used to serialize every photo after every streamed batch.
    // Coalescing into one idle-sized save keeps scrolling and image decode work
    // ahead of storage work for big folders.
    if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
    metadataWriteTimer.current = setTimeout(() => {
      try {
        cachedPhotoMetadata = { ...photoMetadata(), ...Object.fromEntries(photos.map(({ id, path, people, tags, album, favorite, rating, width, height, vision, visionModel }) => [id, { path, people, tags, album, favorite, rating, width, height, vision, visionModel }])) };
        localStorage.setItem("reelcase.photo-meta.v1", JSON.stringify(cachedPhotoMetadata));
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
      const workerCount = Math.min(toScan.length, [2, 4, 6, 8, 12].includes(configuredWorkers) ? configuredWorkers : adaptiveWorkers);
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
  const visionProcessed = useMemo(() => photos.filter((photo) => photo.tags.includes("auto-tagged")).length, [photos]);
  const visionPending = Math.max(0, photos.length - visionProcessed);
  const visionReviewedPhotos = useMemo(() => photos.filter((photo) => photo.tags.includes("auto-tagged")).sort((a, b) => b.addedAt - a.addedAt), [photos]);
  const visible = useMemo(() => photos
    .filter(
      (photo) =>
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
      if (photoSort === "rating") return b.rating - a.rating || b.addedAt - a.addedAt;
      if (photoSort === "favorite") return Number(b.favorite) - Number(a.favorite) || b.addedAt - a.addedAt;
      if (photoSort === "auto-tags") return b.tags.length - a.tags.length || b.addedAt - a.addedAt;
      return b.addedAt - a.addedAt;
    }), [discoveryFilter, favoritesOnly, photoSearch, photoSort, photos, ratingFilter, selectedAlbum, selectedPerson, selectedTag]);
  const renderedPhotos = visible.slice(0, photoLimit);
  useEffect(() => setPhotoLimit(80), [photoSearch, selectedPerson, selectedAlbum, selectedTag, favoritesOnly, photoSort, discoveryFilter, ratingFilter]);
  useEffect(() => { if (!slideshow || !visible.length) return; const timer = window.setInterval(() => setSlideIndex((index) => (index + 1) % visible.length), slideSeconds * 1000); return () => window.clearInterval(timer); }, [slideshow, slideSeconds, visible.length]);
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
  const applyVisionTags = (batch: LocalPhoto[], labels: VisionLabel[][]) => {
    const byId = new Map(batch.map((photo, index) => [photo.id, labels[index] ?? []]));
    setPhotos((items) => items.map((photo) => {
      const report = byId.get(photo.id);
      if (!report) return photo;
      const additions = ["auto-tagged", `auto-tag-${visionModel}-v2`, ...report.map((item) => `vision-${item.label}`)];
      return { ...photo, tags: [...new Set([...photo.tags, ...additions])], vision: report, visionModel };
    }));
    setVisionReport((current) => [...batch.map((photo, index) => ({ id: photo.id, name: photo.name, labels: labels[index] ?? [] })), ...current.filter((row) => !byId.has(row.id))].slice(0, 48));
  };
  const runVisionQueue = async (candidates: LocalPhoto[], allPhotos: boolean) => {
    if (!candidates.length) { setHelperNote("Every loaded photo already has a local vision pass. Add more photos or edit tags to review them."); return; }
    setVisionBusy(true);
    setVisionReviewOpen(true);
    setVisionReport([]);
    setVisionProgress(`Preparing ${VISION_MODELS[visionModel].name} for ${candidates.length.toLocaleString()} photos…`);
    try {
      for (let start = 0; start < candidates.length; start += 12) {
        const batch = candidates.slice(start, start + 12);
        const labels = await classifyImagesLocally(batch.map((photo) => photo.url), (done, total) => setVisionProgress(`${VISION_MODELS[visionModel].name} · ${start + done}/${candidates.length} photos`), visionModel, (status) => {
          const transfer = status.total ? ` · ${Math.round((status.loaded ?? 0) / status.total * 100)}%` : "";
          setVisionProgress(`${VISION_MODELS[visionModel].name} · ${status.status ?? status.file ?? "loading"}${transfer} · ${start}/${candidates.length} complete`);
        });
        // Commit each checkpoint immediately. An overnight run can be safely
        // restarted because completed photos no longer enter the pending queue.
        applyVisionTags(batch, labels);
        await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
      }
      setHelperNote(`${VISION_MODELS[visionModel].name} reviewed ${candidates.length.toLocaleString()} photo${candidates.length === 1 ? "" : "s"}${allPhotos ? " in the full queued library" : ""}. Labels and confidence scores are ready for review.`);
    } catch (error) {
      setHelperNote(`${VISION_MODELS[visionModel].name} stopped after saving every completed checkpoint: ${error instanceof Error ? error.message : "unknown error"}. Retry continues with the remaining photos.`);
    } finally { setVisionBusy(false); setVisionProgress(""); }
  };
  const autoTagPhotosWithVision = async () => runVisionQueue(photos.filter((photo) => !photo.tags.includes("auto-tagged")).slice(0, 48), false);
  const autoTagAllPhotosWithVision = async () => runVisionQueue(photos.filter((photo) => !photo.tags.includes("auto-tagged")), true);
  const autoTagOnePhoto = async (photo: LocalPhoto) => {
    setVisionBusy(true);
    setVisionProgress(`Preparing ${VISION_MODELS[visionModel].name} for ${photo.name}…`);
    try {
      const [labels] = await classifyImagesLocally([photo.url], (done, total) => setVisionProgress(`${VISION_MODELS[visionModel].name} · ${done}/${total}`), visionModel, (status) => {
        const transfer = status.total ? ` · ${Math.round((status.loaded ?? 0) / status.total * 100)}%` : "";
        setVisionProgress(`${VISION_MODELS[visionModel].name} · ${status.status ?? status.file ?? "loading"}${transfer}`);
      });
      applyVisionTags([photo], [labels ?? []]);
      setVisionReviewOpen(true);
      setSelectedTag("auto-tagged");
      setHelperNote(`${VISION_MODELS[visionModel].name} reviewed ${photo.name}. The photo is now in the Auto-tagged review filter with its new visible tags.`);
    } catch (error) {
      setHelperNote(`${VISION_MODELS[visionModel].name} could not tag ${photo.name}: ${error instanceof Error ? error.message : "unknown error"}.`);
    } finally { setVisionBusy(false); setVisionProgress(""); }
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
        siglip: benchmark.semanticPro.labels[index] ?? [],
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
          <Button size="sm" variant="secondary" disabled={!photos.length || visionBusy} onClick={() => void autoTagPhotosWithVision()}>{visionBusy ? visionProgress || "Starting local vision…" : "Local vision tags · 48"}</Button>
        </div>
        <div className="flex flex-wrap gap-2"><span className="self-center text-xs text-muted">Local discovery</span>{(["all", "screenshots", "camera", "downloads"] as const).map((filter) => <Button key={filter} size="sm" variant={discoveryFilter === filter ? "default" : "secondary"} onClick={() => setDiscoveryFilter(filter)}>{filter === "all" ? "All" : filter === "camera" ? "Camera names" : filter[0].toUpperCase() + filter.slice(1)}</Button>)}</div>
          <section className="rounded-md border border-border bg-bg/45 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Local vision</p><p className="mt-1 text-sm text-fg">{visionProcessed.toLocaleString()} processed · {visionPending.toLocaleString()} waiting · SigLIP large+ is the current quality-first default</p></div><div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={visionBusy || !visionPending} onClick={() => void autoTagPhotosWithVision()}>{visionBusy ? visionProgress || "Starting model…" : `Process next ${Math.min(48, visionPending)}`}</Button><Button size="sm" disabled={visionBusy || !visionPending} onClick={() => void autoTagAllPhotosWithVision()}>{visionBusy ? "Queue running…" : `Process all ${visionPending.toLocaleString()}`}</Button></div></div>
            <div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs text-muted">Tagging model</span>{(["semanticPro", "semanticPlus", "semantic"] as VisionModelId[]).map((model) => <Button key={model} size="sm" variant={visionModel === model ? "default" : "ghost"} disabled={visionBusy} onClick={() => setVisionModel(model)}>{VISION_MODELS[model].name}</Button>)}</div>
            <p className="mt-2 text-xs leading-5 text-muted">{VISION_MODELS[visionModel].purpose}. Labels stay on this device and are review-only. SigLIP large+ is selected for the most detailed browser-side photo tags; smaller SigLIP and CLIP remain available for comparison.</p>
            {visionReport.length > 0 && <div className="mt-3 divide-y divide-border rounded-sm border border-border bg-elevated"><p className="px-3 py-2 text-xs font-medium text-fg">Latest local results</p>{visionReport.slice(0, 8).map((row) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"><span className="min-w-0 truncate text-xs text-fg">{row.name}</span><span className="flex flex-wrap gap-1">{row.labels.length ? row.labels.slice(0, 3).map((item) => <span key={item.label} className="rounded-xs bg-bg/60 px-2 py-1 text-xs text-accent">{item.label} · {Math.round(item.score * 100)}%</span>) : <span className="text-xs text-muted">No confident label</span>}</span></div>)}</div>}
            {visionReviewedPhotos.length > 0 && <section className="mt-3 rounded-sm border border-border bg-elevated p-3"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium text-fg">Tagged photo review · {visionReviewedPhotos.length}</p><p className="mt-1 text-xs text-muted">Every completed photo is here, including low-confidence results. Filter the gallery with #auto-tagged or its model-version tag.</p></div><Button size="sm" variant="ghost" onClick={() => setVisionReviewOpen((open) => !open)}>{visionReviewOpen ? "Hide review" : `Review ${visionReviewedPhotos.length}`}</Button></div>{visionReviewOpen && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{visionReviewedPhotos.slice(0, 24).map((photo) => { const labels = photo.vision?.length ? photo.vision : photo.tags.filter((tag) => tag.startsWith("vision-")).map((tag) => ({ label: tag.slice(7), score: 0 })); return <button key={photo.id} type="button" className="overflow-hidden rounded-xs bg-bg/55 text-left" onClick={() => { setPhotoViewerLoading(true); setFocusedPhotoId(photo.id); }} aria-label={`Review tags for ${photo.name}`}><img src={photo.url} alt="" loading="lazy" decoding="async" className="aspect-square w-full object-cover"/><span className="block p-2"><span className="block truncate text-xs font-medium text-fg">{photo.name}</span><span className="mt-1 flex flex-wrap gap-1">{labels.length ? labels.slice(0, 3).map((label) => <span key={label.label} className="rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent">{label.label}{label.score ? ` · ${Math.round(label.score * 100)}%` : ""}</span>) : <span className="text-[11px] text-muted">No confident label — review image</span>}</span></span></button>; })}</div>}{visionReviewOpen && visionReviewedPhotos.length > 24 && <p className="mt-3 text-xs text-muted">Showing 24 of {visionReviewedPhotos.length.toLocaleString()} tagged photos. Use photo tags or search to narrow the gallery.</p>}</section>}
            <div className="mt-3 rounded-sm border border-border bg-elevated p-3"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-medium text-fg">Vision model benchmark</p><p className="mt-1 max-w-2xl text-xs leading-5 text-muted">Compare the pinned CLIP baseline with SigLIP large+ on the same 24 local photos. The first large-model run downloads its optional local model; later runs reuse the browser cache.</p></div><Button size="sm" disabled={visionBenchmarkBusy || !photos.length} onClick={() => void runVisionBenchmark()}>{visionBenchmarkBusy ? "Comparing…" : "Run local comparison"}</Button></div>{visionBenchmarkBusy && <p className="mt-3 flex items-center gap-2 text-xs text-accent"><RefreshCw className="size-3 animate-spin"/>{visionBenchmarkProgress || "Preparing local models…"}</p>}{visionBenchmarkError && <p className="mt-3 rounded-xs bg-bg/50 px-3 py-2 text-xs text-muted">Benchmark stopped · {visionBenchmarkError}</p>}{visionBenchmark && <div className="mt-3 grid gap-2 sm:grid-cols-2"><div className="rounded-xs bg-bg/50 p-3 text-xs"><p className="font-medium text-fg">{VISION_MODELS.semantic.name}</p><p className="mt-1 text-muted">{visionBenchmark.semantic.elapsedMs.toFixed(0)} ms · {visionBenchmark.semantic.labels.flat().length} labels · {visionBenchmark.sampleSize} photos</p></div><div className="rounded-xs bg-bg/50 p-3 text-xs"><p className="font-medium text-fg">{VISION_MODELS.semanticPro.name}</p><p className="mt-1 text-muted">{visionBenchmark.semanticPro.elapsedMs.toFixed(0)} ms · {visionBenchmark.semanticPro.labels.flat().length} labels · {visionBenchmark.sampleSize} photos</p></div></div>}{visionBenchmarkPhotos.length > 0 && <section className="mt-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium text-fg">Photo-by-photo tag review</p><p className="text-[11px] text-muted">CLIP and SigLIP large+ results on the same image</p></div><div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{visionBenchmarkPhotos.map((photo) => <article key={photo.id} className="overflow-hidden rounded-xs border border-border bg-bg/50"><img src={photo.url} alt={photo.name} loading="lazy" decoding="async" className="aspect-video w-full object-cover"/><div className="p-3"><p className="truncate text-xs font-medium text-fg">{photo.name}</p><div className="mt-2 grid gap-2"><div><p className="text-[11px] font-medium text-muted">CLIP</p><p className="mt-1 flex flex-wrap gap-1">{photo.clip.length ? photo.clip.slice(0, 4).map((label) => <span key={label.label} className="rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent">{label.label} · {Math.round(label.score * 100)}%</span>) : <span className="text-[11px] text-subtle">No confident label</span>}</p></div><div><p className="text-[11px] font-medium text-muted">SigLIP large+</p><p className="mt-1 flex flex-wrap gap-1">{photo.siglip.length ? photo.siglip.slice(0, 4).map((label) => <span key={label.label} className="rounded-xs bg-elevated px-1.5 py-0.5 text-[11px] text-accent">{label.label} · {Math.round(label.score * 100)}%</span>) : <span className="text-[11px] text-subtle">No confident label</span>}</p></div></div></div></article>)}</div></section>}<p className="mt-2 text-[11px] leading-4 text-subtle">The CLIP baseline is pinned to a verified revision. Results include model preparation and inference so the comparison reflects the actual browser experience.</p></div>
            <details className="mt-3 rounded-sm border border-border bg-elevated p-3"><summary className="cursor-pointer text-xs font-medium text-fg">Upscaler beta · {upscalerHealth.state === "ready" ? "verified artifact" : "not installed"}</summary><div className="mt-3"><p className={`text-xs leading-5 ${upscalerHealth.state === "ready" ? "text-accent" : "text-muted"}`}>{upscalerHealth.detail}</p><div className="mt-3 flex gap-2"><Button size="sm" variant="ghost" onClick={() => void checkUpscalerHealth()}>Check</Button>{upscalerHealth.state === "ready" && <Button size="sm" variant="ghost" onClick={() => void removeUpscalerModel()}>Remove</Button>}</div>{upscalerHealth.state !== "ready" && <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(14rem,0.7fr)_auto]"><Input value={upscalerUrl} onChange={(event) => setUpscalerUrl(event.target.value)} placeholder="HTTPS model URL" aria-label="Upscaler model URL"/><Input value={upscalerChecksum} onChange={(event) => setUpscalerChecksum(event.target.value)} placeholder="Publisher SHA-256" aria-label="Upscaler model SHA-256 checksum"/><Button size="sm" disabled={upscalerInstalling} onClick={() => void installUpscalerModel()}>{upscalerInstalling ? "Verifying…" : "Download + verify"}</Button></div>}<p className="mt-2 text-[11px] leading-4 text-subtle">The verified beta artifact is bundled for local preview. Originals and exports remain untouched until you explicitly save a reviewed result.</p></div></details>
          </section>
        <p className="text-xs leading-5 text-muted">Private local discovery uses file-name patterns plus an optional on-device open-source image classifier. It analyzes up to 48 queued photos at a time; photo bytes stay in this browser. A 900-photo warm URL cache and small rendered batches keep scrolling responsive while folders continue to stream.</p>
        {companionCache && <p className="text-xs leading-5 text-subtle">Companion cache worker · {companionCache.state} · {companionCache.photos.toLocaleString()} photo metadata hints · {companionCache.videos.toLocaleString()} video metadata hints{companionCache.truncated ? " · bounded pass reached its safe limit" : ""}{companionCache.scannedAt ? ` · checked ${new Date(companionCache.scannedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : ""}. Media files remain on this computer.</p>}
        {companionDeltaNote && <p className="text-xs leading-5 text-accent">{companionDeltaNote}</p>}
        {(helperNote || photoSourceLoading || photoMetadataProgress.running || photoCacheNotice) && <p className="flex items-center gap-2 text-xs text-accent">{(photoSourceLoading || photoMetadataProgress.running) && <RefreshCw className="size-3 animate-spin" />}{photoSourceLoading ? `Loading cached photo sources · ${photoScanDone}/${photoScanTotal} folders · ${photoScanFoundPhotos.toLocaleString()} found${photoScanEstimatedPhotos ? ` of about ${photoScanEstimatedPhotos.toLocaleString()}` : ""}${photoScanEta ? ` · about ${photoScanEta}s remaining` : " · estimating time remaining…"}` : photoMetadataProgress.running ? `Reading photo dimensions and dates · ${photoMetadataProgress.done}/${photoMetadataProgress.total} complete${photoMetadataEta ? ` · about ${photoMetadataEta}s remaining` : " · estimating time remaining…"}` : helperNote || photoCacheNotice}</p>}
      </div>
      {!photos.length ? (
        <div className="mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border">
          <Images className="mx-auto size-7 text-accent" />
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
        </div><div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted"><span>Showing {Math.min(renderedPhotos.length, visible.length)} of {visible.length} matching photos</span>{renderedPhotos.length < visible.length && <Button size="sm" variant="secondary" onClick={() => setPhotoLimit((limit) => limit + 80)}>Show 80 more</Button>}</div></div>{focusedPhoto && <div role="dialog" aria-modal="true" aria-label={`Viewing ${focusedPhoto.name}`} className="fixed inset-0 z-[80] flex items-center justify-center bg-bg/95 p-4" onClick={() => setFocusedPhotoId(null)}><div className="relative flex h-full w-full max-w-7xl flex-col gap-3" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between gap-3 text-fg"><div className="min-w-0"><p className="truncate font-medium">{focusedPhoto.name}</p><p className="text-xs text-muted">{Math.max(1, focusedIndex + 1)} of {visible.length || photos.length} · {focusedPhoto.album}</p>{showLocations && <p title={focusedPhoto.path} className="truncate text-xs text-muted">{focusedPhoto.path}</p>}</div><Button size="sm" variant="secondary" onClick={() => setFocusedPhotoId(null)}>Close</Button></div><div className="flex flex-wrap items-center gap-2"><Button size="sm" variant={focusedPhoto.favorite ? "default" : "secondary"} onClick={() => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? { ...item, favorite: !item.favorite } : item))}>{focusedPhoto.favorite ? "♥ Favorite" : "♡ Favorite"}</Button><Button size="sm" variant="secondary" disabled={visionBusy} onClick={() => void autoTagOnePhoto(focusedPhoto)}>{visionBusy ? visionProgress || "Tagging…" : "Run auto tags"}</Button>{focusedPhoto.tags.length ? focusedPhoto.tags.map((tag) => <span key={tag} className="rounded-xs bg-elevated px-2 py-1 text-xs text-muted">#{tag}</span>) : <span className="text-xs text-muted">No tags yet</span>}</div><PhotoStars name={focusedPhoto.name} rating={focusedPhoto.rating} onChange={(rating) => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? { ...item, rating } : item))} /><div className="relative min-h-0 flex-1">{photoViewerLoading && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg/70 text-sm text-fg"><RefreshCw className="size-7 animate-spin text-accent" />Loading full-resolution photo…</div>}<img src={focusedPhoto.url} alt={focusedPhoto.name} className="max-h-full w-full object-contain" decoding="async" onLoad={() => setPhotoViewerLoading(false)} onError={() => setPhotoViewerLoading(false)}/><Button size="sm" variant="secondary" className="absolute top-1/2 left-2 -translate-y-1/2" onClick={() => { setPhotoViewerLoading(true); moveFocus(-1); }} aria-label="Previous photo"><ChevronLeft className="size-5"/></Button><Button size="sm" variant="secondary" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={() => { setPhotoViewerLoading(true); moveFocus(1); }} aria-label="Next photo"><ChevronRight className="size-5"/></Button></div></div></div>}</>
      )}
    </HubShell>
  );
}
type Mission = { id: string; title: string; detail: string; done: boolean };
function missionSteps(mission: Mission): [string, string, string] {
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
  { id: "watch", title: "Watch room reliability", detail: "LAN diagnostics, timeline reconciliation, queue controls, and guest-access messaging are implemented; real cross-device matrix validation remains in progress.", done: false },
  { id: "services", title: "Connected services", detail: "Keep Twitch, YouTube, Roku, Spotify, and photo imports independently cached and refreshable.", done: true },
  { id: "thumb-health", title: "Thumbnail health queue", detail: "Retry failed artwork, hide unavailable remote cards, and expose a small source diagnostic instead of blank previews.", done: true },
  { id: "windows-explorer", title: "Windows explorer bridge", detail: "Companion-backed folder health, change events, shortcut validation, and safe launch history for local libraries.", done: true },
  { id: "service-status", title: "Service refresh status", detail: "Show when each connected service last refreshed, preserve partial results, and allow focused retries without reloading the whole app.", done: true },
  { id: "vr-theater", title: "VR theater reliability", detail: "WebXR cinema surface for local playback, controller transport controls, and clear Meta Quest recovery guidance.", done: true },
  { id: "companion-onboarding", title: "Companion onboarding", detail: "One-screen startup checklist: run the companion, confirm Desktop approval, load shortcuts, verify a file, then launch one game safely.", done: true },
  { id: "large-library-views", title: "Large-library views", detail: "Progressively render grids and keep recommendations responsive with very large catalog views.", done: true },
  { id: "favorites-memory", title: "Favorites memory", detail: "Preserve favorites, shelves, and resume markers in the local catalog with export and recovery checks across sessions.", done: true },
  { id: "theme-accessibility", title: "Theme & accessibility", detail: "Day/night palettes, focus styling, reduced-motion support, and per-section density preferences.", done: true },
  { id: "preview-recovery", title: "Local preview recovery", detail: "Resolve restored file handles in previews, hide failures, and log playback health without blocking the library.", done: true },
  { id: "youtube-quality", title: "YouTube channel quality", detail: "Per-channel retry controls, published-date ordering, duplicate suppression, and unavailable-card recovery are available in the YouTube desk.", done: true },
  { id: "twitch-quality", title: "Twitch live quality", detail: "Live-first ordering, per-channel timestamps, VOD/clip shelves, focused refresh, retry deadlines, and an additive archive cache are active.", done: true },
  { id: "x-quality", title: "X reading desk quality", detail: "Public profile/topic navigation, per-view load state, retry handling, and local reading-position timestamps are available without credentials.", done: true },
  { id: "startup-budget", title: "Startup performance budget", detail: "Catalog hydration, deferred search-index construction, lazy thumbnails, and bounded photo rendering protect the first usable shelf.", done: true },
  { id: "provider-import-recovery", title: "Provider import recovery", detail: "Provider refreshes retain successful channel rows, preserve prior cache on partial failures, and use RSS/channel-page plus public Twitch GraphQL recovery paths.", done: true },
  { id: "watch-room-cross-device", title: "Watch Room cross-device relay", detail: "Verify the signaling relay across separate devices and add a TURN-backed recovery route for networks that block direct peer negotiation.", done: false },
  { id: "movie-private-tag-shelves", title: "Movie and private tag shelves", detail: "Movies have source, genre, and file-type rails; private shelves retain favorites, tags, history, and rating-aware sorting locally.", done: true },
  { id: "sprint-01", title: "Alert rules", detail: "Per-service alert switches and the notification activity center are active locally.", done: true },
  { id: "sprint-02", title: "Preference coverage", detail: "Shipped preferences have concrete local controls, with status copy explaining their effects.", done: true },
  { id: "sprint-03", title: "Ratings streaks", detail: "In progress · choose a local 3, 5, or 10-title weekly goal on Home; distinct ratings drive a streak counter and transparent rewards. Creator and longer-term reward paths remain next.", done: false },
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
  { id: "sprint-19", title: "Watch room device matrix", detail: "Validate host and guest paths across browsers and home-network devices.", done: false },
  { id: "sprint-20", title: "Accessibility audit", detail: "Shared controls use visible focus states, accessible labels, responsive targets, contrast tokens, and the persisted reduced-motion preference.", done: true },
  { id: "metadata-provenance", title: "Metadata provenance and locks", detail: "Adopt the open-library pattern: preserve manual tags, record the source of enrichment, and never let a provider overwrite a locked user choice.", done: false },
  { id: "media-inspection", title: "Companion media inspection", detail: "Use the local companion for optional ffprobe/embedded-tag extraction in bounded batches, with a preview before tags are saved.", done: false },
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
  { id: "youtube-deep-pagination", title: "YouTube deep pagination", detail: "Creator pulls now use a bounded 2,880-item deep public catalog window, duplicate suppression, and a short server cache to avoid repeated provider work.", done: true },
  { id: "taste-signal-audit", title: "Taste-signal audit", detail: "Stats now separates topic coverage, multi-topic depth, cross-source bridges, and operational-label volume so ranking inputs can be inspected before their weight changes.", done: true },
  { id: "tag-noise-budget", title: "Tag noise budget", detail: "Date, provider, format, source, creator, and keyword labels remain searchable/exportable but are excluded from taste scoring.", done: true },
  { id: "creator-coverage-repair", title: "Creator coverage repair", detail: "Backfill missing creator identity from public provider metadata and flag ambiguous matches for review.", done: false },
  { id: "metadata-tail-coverage", title: "Metadata tail coverage", detail: "Run bounded enrichment batches over the remaining untagged catalog and report coverage by source before applying recommendations.", done: false },
  { id: "recommendation-diversity", title: "Recommendation diversity guardrails", detail: "Done · Home and provider discovery use deduplicated creator round-robin selection, preserving highly rated favorites while preventing one creator from occupying a rail.", done: true },
  { id: "activity-journal", title: "Independent activity journal", detail: "Keep History, Continue marks, and local viewing counts in an IndexedDB activity record separate from broad preference storage.", done: true },
  { id: "shelf-explanations", title: "Explainable recommendation shelves", detail: "Done · recommendation rails now state their plain-language reason—ratings, saved creators, freshness, progress, or follow state—without exposing transport tags.", done: true },
  { id: "memory-pressure-observer", title: "Memory-pressure observer", detail: "Done · local Diagnostics reports mounted-card count, decoded artwork cache entries, active/queued decode work, hit/miss/eviction counts, and frame pressure so large shelves have an observable cause.", done: true },
  { id: "warp-01", title: "First-shelf trace", detail: "In progress · local Diagnostics now records launch-to-first-mounted-shelf time, title, and visible-card count. Cache/index and thumbnail-work splits remain next.", done: false },
  { id: "warp-02", title: "Route-level code splitting", detail: "Photo, Stats, Watch Room, Settings, and other hub workspaces now load only when opened, keeping media browsing out of their first-load cost.", done: true },
  { id: "warp-03", title: "Provider delta rendering", detail: "Apply only changed provider rows after a refresh instead of rebuilding every shelf.", done: false },
  { id: "warp-04", title: "Thumbnail decode governor", detail: "Done · visible and near-view artwork uses bounded workers, pauses during input or hidden-tab time, and retains a small queue for responsive recovery.", done: true },
  { id: "warp-05", title: "Search worker index", detail: "Done · full-text tokenization runs in a dedicated worker, while the search box shows an honest warming state until its local index is ready.", done: true },
  { id: "warp-06", title: "Photo metadata stream", detail: "Done · local photo dimensions and saved dates stream in eight-item browser chunks, yield between batches, persist each result, and show completed/remaining work with a rolling estimate.", done: true },
  { id: "warp-07", title: "Warm route cache", detail: "Prefetch the next likely hub only after the current view becomes idle.", done: false },
  { id: "warp-08", title: "Virtual rail windows", detail: "Render only card windows in long horizontal shelves while preserving keyboard navigation.", done: false },
  { id: "warp-09", title: "Visible-card priorities", detail: "Give ratings, playback, and visible-card actions a higher scheduling priority than background enrichment.", done: false },
  { id: "warp-10", title: "Idle tag batching", detail: "Done · each tag edit first writes a recoverable per-title journal, then coalesces the broad preference snapshot outside the input frame.", done: true },
  { id: "warp-11", title: "Artwork disk cache audit", detail: "Measure cache hit rate and size by source before expanding thumbnail retention.", done: false },
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
    ["history-01", "History integrity journal", "Add monotonic event IDs and an append-only local audit record."],
    ["history-02", "History replay recovery", "Reconcile IndexedDB activity events after an interrupted browser session."],
    ["history-03", "History source badges", "Show whether each activity came from a direct open, progress, or Watch Room."],
    ["history-04", "History retention controls", "Offer local retention windows and export before a user removes older events."],
    ["history-05", "History duplicate guard", "Collapse equivalent play bursts without hiding a separate viewing session."],
    ["history-06", "History timezone normalization", "Store epoch time and display a clear local-time conversion in every timeline."],
    ["history-07", "History orphan recovery", "Keep a saved provider URL or local fingerprint when the source card is evicted."],
    ["history-08", "History privacy review", "Expose what is stored locally and keep private/adult history behind the existing gate."],
    ["history-09", "History filter diagnostics", "Explain empty history results, source filters, and recovery-card availability."],
    ["history-10", "History restore benchmark", "Measure large-history hydration and replay before changing the default journal path."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: id !== "history-10" })),
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
    ["continue-10", "Continue recovery test", "Exercise local, YouTube, Twitch, and Watch Room resume paths in one repeatable check."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: id !== "continue-10" })),
  ...[
    ["youtube-upgrade-01", "Feed delta cursor", "Persist the newest trustworthy upload identity per channel, request only newer feed entries during routine refresh, and fall back to a bounded recent window if the cursor is missing."],
    ["youtube-upgrade-02", "Channel cache budget", "Track response size, age, and cache-hit rate per channel; retain a short deep-catalog cache while returning only the requested shallow slice to routine refreshes."],
    ["youtube-upgrade-03", "First-click trace", "Record time from choosing YouTube to its first usable latest-upload rail, split into catalog selector, image work, and provider work without collecting viewing data."],
    ["youtube-upgrade-04", "Rail windowing", "Keep keyboard and touch navigation intact while mounting only the visible window of long YouTube rails, including an accessible count of deferred cards."],
    ["youtube-upgrade-05", "Artwork priority", "Queue visible and near-view thumbnails before offscreen cards, cancel obsolete image work on source changes, and preserve text-first cards when artwork is unavailable."],
    ["youtube-upgrade-06", "Creator ambiguity review", "Flag channels whose handle, display name, and channel ID disagree; show a review choice rather than silently merging one creator into another."],
    ["youtube-upgrade-07", "Published-date repair", "Prefer RSS published timestamps, retain the provider-provided date source, and label archive rows with unknown dates instead of sorting them as new uploads."],
    ["youtube-upgrade-08", "Live/VOD split", "Separate current live cards, completed streams, Shorts, and ordinary uploads in selectors so a live event cannot displace historical VODs or recommendations."],
    ["youtube-upgrade-09", "Deep-pull checkpoint", "Make deep historical pulls resumable per channel with a visible item/page budget and a saved checkpoint; pause safely when provider data stops advancing."],
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
    ["youtube-upgrade-20", "YouTube regression suite", "Add repeatable checks for first-click load, shallow refresh, deep pull, duplicate handling, cached recovery, and mobile rail rendering."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: ["youtube-upgrade-11", "youtube-upgrade-12", "youtube-upgrade-13", "youtube-upgrade-14", "youtube-upgrade-15", "youtube-upgrade-19"].includes(id) })),
  ...[
    ["twitch-upgrade-01", "Archive page checkpoint", "Persist the last accepted archive cursor and VOD ID for each creator; resume a focused historical pull only when Twitch returns a forward-moving public page."],
    ["twitch-upgrade-02", "Focused pull queue", "Let users queue a small number of explicit archive pulls, run them serially within a visible budget, and never let them starve live-state refreshes."],
    ["twitch-upgrade-03", "VOD cursor diagnostics", "Show page count, accepted cursor, duplicate count, provider challenge state, and stop reason for each historical VOD pull."],
    ["twitch-upgrade-04", "Clip separation audit", "Identify clip-length media independently from full VODs using duration and provider shape; correct mislabeled cards without deleting user saves."],
    ["twitch-upgrade-05", "Live-state clock", "Record the exact successful live-state observation time, expire stale live labels, and distinguish a live estimate from a confirmed current stream."],
    ["twitch-upgrade-06", "Provider integrity fallback", "When Twitch requires an integrity challenge for deeper pages, retain accepted archive data, report the limit plainly, and avoid retry loops that waste provider budget."],
    ["twitch-upgrade-07", "Archive coverage report", "Show cached VOD count, oldest/newest known dates, sparse creators, completed historical pulls, and public-provider limits for every followed channel."],
    ["twitch-upgrade-08", "Channel retry budget", "Apply per-channel exponential backoff to failed public pulls while preserving a focused user retry that does not reset healthy channels."],
    ["twitch-upgrade-09", "VOD merge proof", "Test that a partial or empty refresh can never erase older VODs, favorites, ratings, history, or valid local archive metadata."],
    ["twitch-upgrade-10", "Creator archive controls", "Provide per-creator archive actions with clear depth, last result, and cooldown information instead of one opaque global refresh."],
    ["twitch-upgrade-11", "Stream title delta", "Update a live card’s stream title and category only when the provider reports a newer observation, preventing stale title flashes."],
    ["twitch-upgrade-12", "Viewer freshness", "Show viewer counts with an observation timestamp and remove them from ranking once they become stale."],
    ["twitch-upgrade-13", "Local cache compaction", "Compact duplicate VOD rows by stable provider video ID while retaining the newest metadata and all local feedback references."],
    ["twitch-upgrade-14", "Guest-ready embeds", "Verify Twitch Watch Room embeds receive the correct parent host, preserve the selected VOD, and surface a direct-link fallback when the player is blocked."],
    ["twitch-upgrade-15", "VOD duration repair", "Recover missing or impossible duration values from accepted provider metadata and never infer a full VOD from a short clip duration."],
    ["twitch-upgrade-16", "Historical search filter", "Add a source-scoped historical VOD search that can target creator, date range, title, and clip/VOD state without scanning every shelf."],
    ["twitch-upgrade-17", "Mobile live rail", "Validate live-first ordering and archive controls at phone width, with compact cards and no accidental load of every archived thumbnail."],
    ["twitch-upgrade-18", "Provider error taxonomy", "Classify Twitch failures—including public-page limit, integrity challenge, unavailable creator, and network delay—and show the safest recovery action."],
    ["twitch-upgrade-19", "Twitch device regression", "Exercise live, VOD, clip, blocked-embed, and Watch Room handoff behavior across supported browser/device paths before release."],
    ["twitch-upgrade-20", "Twitch archive benchmark", "Measure a large archive’s cursor work, merge time, storage growth, first paint, and scrolling before increasing any default depth budget."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: ["twitch-upgrade-02", "twitch-upgrade-04", "twitch-upgrade-05", "twitch-upgrade-06", "twitch-upgrade-07", "twitch-upgrade-08", "twitch-upgrade-10", "twitch-upgrade-11", "twitch-upgrade-12", "twitch-upgrade-13", "twitch-upgrade-14", "twitch-upgrade-15"].includes(id) })),
  ...[
    ["speed-01", "First interaction budget", "Measure cached and cold launch-to-first-interactive-shelf time, separately reporting catalog hydration, selector work, thumbnail work, and any provider request."],
    ["speed-02", "Provider payload budget", "Set explicit row, byte, concurrency, and retry budgets for routine provider work; reserve historical pulls for visible user actions."],
    ["speed-03", "Render invalidation audit", "Trace state changes that rebuild unrelated rails or grids, then stabilize selectors and props so a rating, like, or clock tick updates only affected cards."],
    ["speed-04", "Visible artwork priority", "Prioritize visible and near-view images, pause offscreen decoding during input, and resume through a bounded queue once the main thread is idle."],
    ["speed-05", "Input latency monitor", "Measure interaction-to-paint time for rating, search, queue, play/pause, and source navigation on a large local and provider catalog."],
    ["speed-06", "Idle enrichment queue", "Run optional tag, metadata, and cache work in short cancelable idle slices; persist each completed batch so tab sleep never loses progress."],
    ["speed-07", "Route warmup policy", "Warm only the next likely route after the current page is visibly settled, cancel speculative work on navigation, and never fetch a hub just because it exists."],
    ["speed-08", "Cache hit dashboard", "Report catalog, provider, artwork, and thumbnail-cache hit/miss counts with age and size, while retaining metadata only and no media bytes."],
    ["speed-09", "Mobile memory budget", "Exercise scrolling, search, artwork deferment, and card actions in a phone viewport under a small worker/cache budget with no horizontal overflow."],
    ["speed-10", "Performance release gate", "Require repeatable startup, scroll-settle, mounted-card, input-latency, and console-error checks before a shelf or provider feature is marked complete."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: ["speed-04", "speed-05"].includes(id) })),
  ...[
    ["smooth-01", "Navigation transition budget", "Keep source switches responsive by rendering the destination shell first and scheduling expensive derived rails in a transition after controls become interactive."],
    ["smooth-02", "Long-list virtualization proof", "Benchmark and verify virtual windows for grids and horizontal rails at provider-library scale, including keyboard focus, screen-reader counts, and scroll restoration."],
    ["smooth-03", "Image decode pressure gauge", "Expose decoded-image count, pending decode work, and cache evictions in Diagnostics so memory pressure has an observable cause and recovery."],
    ["smooth-04", "Background-tab throttle", "Reduce polling, thumbnail work, and timer-driven reranks while the tab is hidden, then perform one bounded reconciliation when it returns."],
    ["smooth-05", "Search keystroke budget", "Debounce suggestions, move full-catalog token work off the input frame, and show a truthful warming state while the search index catches up."],
    ["smooth-06", "Local persistence coalescing", "Batch preference and tag writes away from click handlers while journaling the latest operation immediately so a crash cannot lose a user action."],
    ["smooth-07", "Provider-card structural sharing", "Reuse unchanged provider card objects and artwork references across refreshes to prevent image reloads, animation resets, and avoidable React reconciliation."],
    ["smooth-08", "Cold-start source ordering", "Hydrate the saved local catalog and active source before optional folder verification, remote refresh, Companion warmup, or recommendation ranking begins."],
    ["smooth-09", "Timer consolidation", "Audit periodic provider, Watch Room, clock, and visibility timers; share intervals where possible and stop them when their owning surface unmounts."],
    ["smooth-10", "Slow-device profile", "Add a reproducible constrained-core/memory benchmark profile and use it to choose safe default worker, cache, and rail-window budgets."],
    ["smooth-11", "Accessibility performance audit", "Verify deferred and virtualized cards retain focus order, announce loading state, and never make a keyboard action wait for offscreen artwork."],
    ["smooth-12", "Smoothness scorecard", "Publish a local diagnostics scorecard with first interaction, frame pressure, cache health, visible-card count, and the next safest remediation."],
  ].map(([id, title, detail]) => ({ id, title, detail, done: ["smooth-03", "smooth-04", "smooth-05", "smooth-06", "smooth-07", "smooth-08"].includes(id) })),
];
const ALL_DEFAULT_MISSIONS = [...DEFAULT_MISSIONS, ...ROADMAP_EXPANSION];

export function MissionPlanSection() {
  const [missions, setMissions] = useState<Mission[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem("reelcase.mission-plan.v1") ?? "null") as Mission[] | null; return Array.isArray(saved) ? [...saved.map((item) => { const current = ALL_DEFAULT_MISSIONS.find((mission) => mission.id === item.id); return current ? { ...item, title: current.title, detail: current.detail, done: item.done || current.done } : item; }), ...ALL_DEFAULT_MISSIONS.filter((mission) => !saved.some((item) => item.id === mission.id))] : ALL_DEFAULT_MISSIONS; } catch { return ALL_DEFAULT_MISSIONS; }
  });
  const [idea, setIdea] = useState("");
  const [showArchive, setShowArchive] = useState(false);
  const [companionCheck, setCompanionCheck] = useState<{ ready: boolean; desktop: boolean; detail: string } | null>(null);
  useEffect(() => { try { localStorage.setItem("reelcase.mission-plan.v1", JSON.stringify(missions)); } catch { /* storage unavailable */ } }, [missions]);
  const completed = missions.filter((mission) => mission.done).length;
  const activeMissions = missions.filter((mission) => !mission.done);
  const archivedMissions = missions.filter((mission) => mission.done);
  const exportMissions = () => downloadCsv([["step", "title", "status", "detail"], ...missions.map((mission, index) => [index + 1, mission.title, mission.done ? "complete" : "in-progress", mission.detail])], `reelcase-mission-plan-${new Date().toISOString().slice(0, 10)}.csv`);
  return <HubShell eyebrow="Mission plan" icon={<Rocket className="size-4"/>} title="Build a private media home that scales." copy="Reelcase is moving toward a fast, local-first media hub: your files load from a durable catalog, your watch room works across your home network, and connected services remain optional and easy to control.">
    <section className="mt-6 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Product mission</p><h2 className="mt-2 font-display text-3xl text-fg">One calm control room for a very large library.</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Make a million-file media collection feel immediate: cache its catalog locally, keep original files private, surface useful recommendations, and let trusted people watch together without turning the app into a cloud upload service.</p><div className="mt-5 flex items-end justify-between gap-4"><div><p className="font-display text-2xl text-fg">{completed} of {missions.length} milestones complete</p><p className="mt-1 text-sm text-muted">Every milestone includes implementation, browser verification, and a production build check.</p></div><div className="rounded-full bg-accent/15 px-3 py-1 text-sm text-accent">{missions.length ? Math.round(completed / missions.length * 100) : 0}%</div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-bg/70"><div className="h-full bg-accent transition-all" style={{ width: `${missions.length ? completed / missions.length * 100 : 0}%` }}/></div></section>
    <section className="mt-5"><div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Active delivery queue</p><p className="mt-1 text-sm text-muted">{activeMissions.length} milestone{activeMissions.length === 1 ? "" : "s"} still need implementation or verification.</p></div></div><div className="space-y-3">{activeMissions.map((mission, index) => <article key={mission.id} className="flex gap-4 rounded-lg bg-elevated p-4 shadow-border"><Button size="sm" variant="secondary" aria-label={`Mark ${mission.title} complete`} onClick={() => setMissions((items) => items.map((item) => item.id === mission.id ? { ...item, done: true } : item))}>{`Step ${index + 1}`}</Button><div className="min-w-0 flex-1"><h2 className="text-sm font-medium text-fg">{mission.title}</h2><p className="mt-1 text-sm text-muted">{mission.detail}</p><details className="mt-3 rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted"><summary className="cursor-pointer font-medium text-fg">Break this down</summary><ol className="mt-2 list-decimal space-y-1 pl-4">{missionSteps(mission).map((step) => <li key={step}>{step}</li>)}</ol></details></div></article>)}</div></section>
    <section className="mt-5 rounded-lg border border-border bg-elevated/70 p-4 shadow-border"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Delivery archive</p><p className="mt-1 text-sm text-muted">{archivedMissions.length} completed milestones are retained for reference and export.</p></div><Button size="sm" variant="secondary" onClick={() => setShowArchive((value) => !value)}>{showArchive ? "Hide completed work" : "Show completed work"}</Button></div>{showArchive && <div className="mt-4 space-y-2">{archivedMissions.map((mission) => <article key={mission.id} className="flex gap-3 rounded-sm bg-bg/45 p-3"><Button size="sm" variant="ghost" aria-label={`Restore ${mission.title} to active work`} onClick={() => setMissions((items) => items.map((item) => item.id === mission.id ? { ...item, done: false } : item))}>Done</Button><div className="min-w-0"><h2 className="text-sm font-medium text-muted line-through">{mission.title}</h2><p className="mt-1 text-xs text-muted">{mission.detail}</p></div></article>)}</div>}</section>
    <section className="mt-5 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Companion onboarding</p><h2 className="mt-2 font-display text-2xl text-fg">A safe five-minute desktop setup.</h2><ol className="mt-4 grid gap-3 text-sm text-muted sm:grid-cols-2"><li className="rounded-sm bg-bg/45 p-3"><span className="font-medium text-fg">1. Start Companion</span><br/>Double-click Start-Reelcase-Companion.cmd in the main Reelcase folder.</li><li className="rounded-sm bg-bg/45 p-3"><span className="font-medium text-fg">2. Confirm Desktop</span><br/>Keep its window open, then run the check below.</li><li className="rounded-sm bg-bg/45 p-3"><span className="font-medium text-fg">3. Load shortcuts</span><br/>Open Games and choose Load approved desktop shortcuts.</li><li className="rounded-sm bg-bg/45 p-3"><span className="font-medium text-fg">4. Verify first</span><br/>Use a listed shortcut inside an approved root before launching it.</li></ol><Button className="mt-4" variant="secondary" onClick={() => void (async () => { try { const response = await fetch("http://127.0.0.1:43123/health"); const data = await response.json() as { roots?: number; desktopEnabled?: boolean }; setCompanionCheck({ ready: true, desktop: Boolean(data.desktopEnabled), detail: `${data.roots ?? 0} approved root(s)` }); } catch { setCompanionCheck({ ready: false, desktop: false, detail: "Companion not detected. Start it, leave the window open, then retry." }); } })()}>Check Companion setup</Button>{companionCheck && <p className={`mt-3 text-sm ${companionCheck.ready && companionCheck.desktop ? "text-accent" : "text-danger"}`}>{companionCheck.ready ? `Ready · Desktop ${companionCheck.desktop ? "approved" : "not approved"} · ${companionCheck.detail}` : companionCheck.detail}</p>}</section>
    <section className="mt-5 grid gap-3 sm:grid-cols-3"><InfoCard icon={<Wifi className="size-5"/>} title="Next: home network" copy="Folder watch events, Roku discovery, stable room invitations, and stronger timeline recovery."/><InfoCard icon={<Images className="size-5"/>} title="Then: media intelligence" copy="Background metadata, thumbnail health, faster source search, and reviewable local tags."/><InfoCard icon={<Bot className="size-5"/>} title="Later: optional assistants" copy="Private recommendation controls, explainable picks, and only opt-in service connections."/></section>
    <div className="mt-5 flex flex-wrap gap-2"><Button variant="secondary" onClick={exportMissions}><Download className="size-4"/>Export mission plan</Button><Button variant="secondary" onClick={() => setMissions(DEFAULT_MISSIONS)}>Reset to the current delivery queue</Button><span className="self-center text-xs text-muted">Exports the current status, or restores the complete delivery baseline.</span></div>
    <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); const title = idea.trim(); if (!title) return; setMissions((items) => [...items, { id: crypto.randomUUID(), title, detail: "New idea — break this into implementation and verification steps.", done: false }]); setIdea(""); }}><Input value={idea} onChange={(event) => setIdea(event.target.value)} placeholder="Add a larger change idea" aria-label="New mission idea"/><Button type="submit">Add to plan</Button></form>
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
  useEffect(() => {
    const saved = readHub().games;
    setGames(saved);
  }, []);
  const saveGames = (next: LocalItem[]) => {
    setGames(next);
    const hub = readHub();
    writeHub({ ...hub, games: next });
  };
  const add = async (files: FileList | File[] | null, allowWebShortcut = false) => {
    if (!files) return;
    const source = Array.from(files).filter((file) =>
      allowWebShortcut
        ? /\.(exe|lnk|url|appref-ms)$/i.test(file.name)
        : /\.(exe|lnk|url|appref-ms)$/i.test(file.name),
    );
    const next = await Promise.all(
      source.map(async (file) => {
        let launchUrl: string | undefined;
        if (/\.url$/i.test(file.name)) {
          const match = (await file.text()).match(/^URL\s*=\s*((?:https?|steam|epic|com\.epicgames\.launcher|xbox):\S+)/im);
          launchUrl = match?.[1];
        }
        return {
          name: file.name,
          path: file.webkitRelativePath || file.name,
          size: file.size,
          addedAt: Date.now(),
          launchUrl,
        };
      }),
    );
    setGames((current) => {
      const merged = [
        ...current,
        ...next.filter((item) => !current.some((game) => game.path === item.path)),
      ];
      const hub = readHub();
      writeHub({ ...hub, games: merged });
      return merged;
    });
  };
  useEffect(() => { if (sourceShortcuts.length) void add(sourceShortcuts, true); }, [sourceShortcuts]);
  const launchDesktop = async (game: LocalItem) => {
    try {
      const response = await fetch("http://127.0.0.1:43123/launch", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ path: game.path }) });
      const result = await response.json() as { ok?: boolean; error?: string };
      setLaunchNotice(result.ok ? `Launching ${game.name} through the local companion.` : result.error ?? "The companion could not launch this item.");
    } catch {
      setLaunchNotice("Desktop launch needs the Reelcase Companion running and this shortcut inside one of its approved Windows folders.");
    }
  };
  const loadApprovedShortcuts = async () => {
    setCompanionLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:43123/shortcuts?limit=300");
      const result = await response.json() as { ok?: boolean; shortcuts?: Array<{ name: string; path: string; launchUrl?: string }>; error?: string };
      if (!result.ok) throw new Error(result.error ?? "The companion could not read approved shortcuts.");
      const next = (result.shortcuts ?? []).map((item) => ({ ...item, size: 0, addedAt: Date.now() }));
      setGames((current) => {
        // Refresh existing rows too: legacy .url entries may have been saved
        // before the companion could safely surface their readable target.
        const incoming = new Map(next.map((item) => [item.path, item]));
        const merged = [
          ...current.map((game) => {
            const refreshed = incoming.get(game.path);
            return refreshed ? { ...game, ...refreshed, iconData: game.iconData } : game;
          }),
          ...next.filter((item) => !current.some((game) => game.path === item.path)),
        ];
        writeHub({ ...readHub(), games: merged });
        return merged;
      });
      setLaunchNotice(next.length ? `Added ${next.length} approved desktop shortcuts. They can launch through the companion.` : "No approved desktop shortcuts were found. Add a shortcut to Desktop or another approved companion folder.");
    } catch {
      setLaunchNotice("Companion connection unavailable. Start the local Reelcase Companion, then try again.");
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
      copy="Choose a dedicated games folder, add custom cover icons, and explicitly import web game shortcuts. Every card has a launch control: web shortcuts open directly; desktop launchers are clearly marked because browsers cannot start an .exe by themselves."
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
                        reader.onload = () =>
                          saveGames(
                            games.map((item) =>
                              item.path === game.path
                                ? { ...item, iconData: String(reader.result) }
                                : item,
                            ),
                          );
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
      save([...links, { id: crypto.randomUUID(), name: name.trim() || parsed.hostname, url: parsed.toString() }]);
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
  useEffect(() => setHub(readHub()), []);
  const items = hub[kind];
  const change = (files: FileList | null) => {
    if (!files?.length) return;
    const next = { ...hub, [kind]: filesToItems(files, kind === "games") };
    setHub(next);
    writeHub(next);
  };
  return (
    <HubShell eyebrow={eyebrow} icon={icon} title={title} copy={copy}>
      <label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-elevated/40 px-5 text-center transition-[background-color,border-color] duration-150 hover:border-fg/30 hover:bg-elevated">
        <PackageSearch className="size-7 text-accent" />
        <span className="mt-3 text-sm font-medium text-fg">
          {directory ? "Choose Desktop games folder" : "Add print files"}
        </span>
        <span className="mt-1 text-xs text-muted">
          {directory
            ? "Keeps only game launchers and shortcuts; folders and support files stay out."
            : "STL, OBJ, 3MF, and G-code are supported."}
        </span>
        <input
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          {...(directory ? ({ webkitdirectory: "", directory: "" } as Record<string, string>) : {})}
          onChange={(event) => change(event.target.files)}
        />
      </label>
      {items.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg shadow-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-fg">
              {items.length} saved {kind === "prints" ? "print files" : "games"}
            </p>
            <p className="text-xs text-subtle">Stored as names only</p>
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
              <p className="shrink-0 font-mono text-xs text-subtle">{bytes(item.size)}</p>
            </div>
          ))}
        </div>
      )}
      {footer}
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
        <div className="mt-4 grid gap-2 sm:grid-cols-[1.2fr_.8fr_1fr_auto]"><Input value={packageTitle} onChange={(event) => setPackageTitle(event.target.value)} placeholder="Package or order name" aria-label="Package name" /><Input value={carrier} onChange={(event) => setCarrier(event.target.value)} placeholder="Carrier" aria-label="Carrier" /><Input value={tracking} onChange={(event) => setTracking(event.target.value)} placeholder="Tracking number (optional)" aria-label="Tracking number" /><Button onClick={() => { if (!packageTitle.trim()) return; setPackages((items) => [{ id: crypto.randomUUID(), title: packageTitle.trim(), carrier: carrier.trim() || "Carrier", tracking: tracking.trim(), status: "Ordered" }, ...items]); setPackageTitle(""); setTracking(""); }}>Add package</Button></div>
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
      <section className="mt-6 rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">External rating search</p><p className="mt-1 text-sm text-muted">Look up a title on the source you trust. Searches open on the official site; Reelcase does not copy ratings into your local catalog.</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input value={ratingQuery} onChange={(event) => setRatingQuery(event.target.value)} placeholder="Search an anime, movie, or series" aria-label="External rating search"/><div className="flex flex-wrap gap-2">{[{ label: "AniList", url: "https://anilist.co/search/anime?search=" }, { label: "AniDB", url: "https://anidb.net/anime/?adb.search=" }, { label: "Rotten Tomatoes", url: "https://www.rottentomatoes.com/search?search=" }].map((source) => <a key={source.label} href={`${source.url}${encodeURIComponent(ratingQuery.trim())}`} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-3 text-sm text-fg shadow-border">{source.label}<ExternalLink className="ml-2 size-3.5"/></a>)}</div></div></section>
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
  return <HubShell eyebrow="Social desk" icon={<X className="size-4" />} title="Keep your people close." copy="Save X profiles, switch between public timelines, and pick up where you left off. Public timelines render inside Reelcase through X’s official widget; private posts and account likes stay on X.">
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
  const [name, setName] = useState(() => localStorage.getItem("reelcase.profile-name") || "Host");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [joinedAsGuest, setJoinedAsGuest] = useState(false);
  const [guestAccess, setGuestAccess] = useState(false);
  const [localVideo, setLocalVideo] = useState<File | null>(null);
  const [localShare, setLocalShare] = useState<LocalRoomShare | null>(null);
  const [pendingLocalShare, setPendingLocalShare] = useState<LocalRoomShare | null>(null);
  const [localQueue, setLocalQueue] = useState<LocalRoomShare[]>([]);
  const [localShareMatches, setLocalShareMatches] = useState<Record<string, { name: string; fingerprint: string; at: number }>>({});
  const [rokuAddress, setRokuAddress] = useState("");
  const [rokuReady, setRokuReady] = useState(false);
  const [rokuDevices, setRokuDevices] = useState<{ address: string; location: string }[]>([]);
  const [rokuNotice, setRokuNotice] = useState("");
  const [queue, setQueue] = useState<string[]>([]);
  const [stageSize, setStageSize] = useState<"compact" | "theater" | "cinema">("compact");
  const [playback, setPlayback] = useState({ playing: false, position: 0 });
  const [timelineEvidence, setTimelineEvidence] = useState<{ source: "local" | "remote" | "estimated"; at: number }>({ source: "local", at: Date.now() });
  const [chat, setChat] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [partyPrompt, setPartyPrompt] = useState("Pick the next vibe");
  const [partyVotes, setPartyVotes] = useState<Record<string, number>>({ Comedy: 0, Action: 0, Surprise: 0 });
  const [friendName, setFriendName] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [inviteNotice, setInviteNotice] = useState("");
  const [pulseStatus, setPulseStatus] = useState("No direct transport test yet.");
  const [friends, setFriends] = useState<{ name: string; code: string }[]>(() => {
    try { const saved = JSON.parse(localStorage.getItem("reelcase.lan-friends.v1") ?? "[]"); return Array.isArray(saved) ? saved.slice(0, 16) : []; } catch { return []; }
  });
  const videos = useLibrary((s) => s.videos);
  const favorites = useLibrary((s) => s.favorites);
  const history = useLibrary((s) => s.history);
  const recordPlay = useLibrary((s) => s.recordPlay);
  useEffect(() => { localStorage.setItem("reelcase.profile-name", name.trim() || "Host"); }, [name]);
  const [sharedVideoId, setSharedVideoId] = useState(
    () => {
      const pending = localStorage.getItem("reelcase.watch-room.pending-video");
      const requested = pending ? videos.find((video) => video.id === pending && Boolean(video.src || video.remote?.embedUrl)) : undefined;
      return requested?.id ?? videos.find((video) => Boolean(video.src || video.remote?.embedUrl))?.id ?? "";
    },
  );
  const sharedVideo = videos.find((video) => video.id === sharedVideoId);
  // Providers occasionally surface corrupt/millisecond clocks. Never let an
  // untrusted embed turn the room state into days of phantom playback.
  const roomClockCeiling = Math.max(60, Math.min(sharedVideo?.duration && sharedVideo.duration > 0 ? sharedVideo.duration + 30 : 12 * 60 * 60, 12 * 60 * 60));
  const clampRoomClock = (seconds: number) => Math.max(0, Math.min(roomClockCeiling, Number.isFinite(seconds) ? seconds : 0));
  const localShareIsMatched = !sharedVideoId.startsWith("local:") || localShare?.fingerprint === sharedVideoId.slice("local:".length);
  const roomVideoRef = useRef<HTMLVideoElement>(null);
  const remoteFrameRef = useRef<HTMLIFrameElement>(null);
  const twitchPlayerHostRef = useRef<HTMLDivElement>(null);
  const twitchPlayerRef = useRef<TwitchRoomPlayer | null>(null);
  const [remoteFrameReady, setRemoteFrameReady] = useState(0);
  const [remoteSeekNonce, setRemoteSeekNonce] = useState(0);
  const lastYoutubeSeekNonce = useRef(0);
  const lastTwitchSeekNonce = useRef(0);
  const suppressRemotePlayerEchoUntil = useRef(0);
  const [twitchPlayerStatus, setTwitchPlayerStatus] = useState("Waiting for Twitch player…");
  const [twitchPlayerReady, setTwitchPlayerReady] = useState(0);
  const [candidateSeed, setCandidateSeed] = useState(() => Date.now());
  const [roomPickLimit, setRoomPickLimit] = useState(18);
  const youtubePlaybackStartedAt = useRef<number | null>(null);
  const [localVideoUrl, setLocalVideoUrl] = useState("");
  const lastRoomTick = useRef(0);
  const lastRoomHistoryId = useRef("");
  const lastRoomPosition = useRef(0);
  const applyingRemotePlaybackUntil = useRef(0);
  const room = activeRoom ?? "";
  const p2p = useP2PRoom(room, name.trim() || "Guest");
  useEffect(() => {
    if (!localVideo) { setLocalVideoUrl(""); return; }
    const url = URL.createObjectURL(localVideo);
    setLocalVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [localVideo]);
  useEffect(() => {
    localStorage.removeItem("reelcase.watch-room.pending-video");
  }, []);
  // A room must not advertise catalog-only local records as playable. Browser
  // File handles need an explicit resolved source first, so show only videos
  // that already have a usable embedded or direct media URL here.
  const roomCandidates = useMemo(() => {
    const played = new Set(history.map((entry) => entry.id));
    return videos
      .filter((video) => !video.isSample && !/\b(blender|big buck bunny|cosmos laundromat|tears of steel|elephants dream|sintel|night rain|empty house|golden coast|tungsten reel)\b/i.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`) && !useLibrary.getState().unavailable[video.id] && Boolean(video.remote?.embedUrl || video.src))
      // Room starters intentionally favor exposure over a fixed "top picks"
      // list: a saved title gets a light lift, while something already played
      // yields space to an unplayed playable title.
      .map((video) => {
        const random = roomShuffleRank(`${video.id}:${candidateSeed}`, candidateSeed) / 0xffffffff;
        // Taste signals nudge the order, but the timestamped shuffle remains
        // dominant so a Watch Room exposes genuinely different candidates.
        return { video, rank: random + (favorites[video.id] ? 0.18 : 0) - (played.has(video.id) ? 0.32 : 0) };
      })
      .sort((a, b) => b.rank - a.rank)
      .map(({ video }) => video);
  }, [candidateSeed, favorites, history, videos]);
  const localQueueCandidates = useMemo(
    () => roomCandidates.filter((video) => !video.remote && video.id !== sharedVideoId && !queue.includes(video.id)).slice(0, 18),
    [queue, roomCandidates, sharedVideoId],
  );
  const queueRecommendations = useMemo(() => {
    const alreadyShown = new Set(roomCandidates.slice(0, roomPickLimit).map((video) => video.id));
    const queued = new Set(queue);
    const unseen = roomCandidates
      .filter((video) => video.id !== sharedVideoId && !queued.has(video.id) && !alreadyShown.has(video.id))
      .sort((a, b) => roomShuffleRank(`${a.id}:queue`, candidateSeed + 17) - roomShuffleRank(`${b.id}:queue`, candidateSeed + 17));
    // Small libraries may not have a second pool yet; keep the control useful.
    return (unseen.length ? unseen : roomCandidates.filter((video) => video.id !== sharedVideoId && !queued.has(video.id))).slice(0, 12);
  }, [candidateSeed, queue, roomCandidates, roomPickLimit, sharedVideoId]);
  useEffect(() => {
    const rotate = () => setCandidateSeed(Date.now());
    const timer = window.setInterval(rotate, 30_000);
    return () => window.clearInterval(timer);
  }, []);
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
    if (!p2p.peers.length) return;
    p2p.send({
      type: "room-state",
      playing: playback.playing,
      position: playback.position,
      videoId: sharedVideoId,
      queue,
      localQueue,
    });
  }, [localQueue, p2p.peers.length, playback.playing, playback.position, queue, sharedVideoId]);
  useEffect(() => {
    // A theater invite should request state immediately. This also wakes the
    // same-machine BroadcastChannel fallback before WebRTC has a peer row.
    if (joinedAsGuest && p2p.joined) p2p.send({ type: "resync-request" });
  }, [joinedAsGuest, p2p.joined, p2p.send]);
  useEffect(
    () =>
      p2p.onMessage((from, raw) => {
        const data = raw as {
          type?: string;
          text?: string;
          name?: string;
          playing?: boolean;
          position?: number;
          sentAt?: number;
          seek?: boolean;
          videoId?: string;
          queue?: string[];
          localQueue?: LocalRoomShare[];
          fingerprint?: string;
          size?: number;
          modified?: number;
        };
        if (data.type === "chat" && data.text)
          setChat((rows) => [...rows, `${data.name ?? from}: ${data.text}`].slice(-50));
        if (data.type === "room-pulse") p2p.send({ type: "room-pulse-ack", sentAt: data.sentAt }, from);
        if (data.type === "room-pulse-ack" && data.sentAt) setPulseStatus(`Direct transport confirmed · ${Math.max(0, Date.now() - data.sentAt)}ms round trip.`);
        if (data.type === "share-ready" && data.name && data.fingerprint) {
          const share = { name: data.name, fingerprint: data.fingerprint, size: Number(data.size) || 0, modified: Number(data.modified) || 0 };
          setPendingLocalShare(share);
          setInviteNotice(`${data.name} is waiting for a permitted local match. Select the same file on this device; Reelcase compares name, size, and modified time without sending file contents.`);
        }
        if (data.type === "share-matched" && data.name && data.fingerprint) {
          setLocalShareMatches((matches) => ({ ...matches, [from]: { name: data.name!, fingerprint: data.fingerprint!, at: Date.now() } }));
          setInviteNotice(`${data.name} was matched by a guest. The approved local copy can now follow the room timeline.`);
        }
        if (data.type === "sync") {
          // A late provider event from the title that was just replaced must
          // never rewind the current room. Sync packets now carry their title
          // identity, while legacy packets retain the conservative clock guard.
          if (data.videoId && sharedVideoId && data.videoId !== sharedVideoId) return;
          const position = Number(data.position) || 0;
          const elapsed = data.playing && data.sentAt ? Math.max(0, (Date.now() - data.sentAt) / 1000) : 0;
          const nextPosition = position + elapsed;
          // Old iframe events can occasionally report 0 after a pause. Unless
          // this is an explicit seek/new-video command, never let that stale
          // value rewind an established room timeline.
          const safePosition = clampRoomClock(!data.seek && nextPosition < lastRoomPosition.current
            ? lastRoomPosition.current
            : nextPosition);
          lastRoomPosition.current = safePosition;
          applyingRemotePlaybackUntil.current = Date.now() + 900;
          setTimelineEvidence({ source: "remote", at: Date.now() });
          if (data.seek) setRemoteSeekNonce((value) => value + 1);
          setPlayback({ playing: Boolean(data.playing), position: safePosition });
        }
        if (data.type === "video" && data.videoId) setSharedVideoId(data.videoId);
        if (data.type === "queue" && Array.isArray(data.queue)) setQueue(data.queue);
        if (data.type === "local-queue" && Array.isArray(data.localQueue)) setLocalQueue(data.localQueue.slice(0, 24));
        if (data.type === "party-vote" && data.name) setPartyVotes((votes) => ({ ...votes, [data.name!]: Number(data.position) || 0 }));
        if (data.type === "room-state") {
          const videoChanged = Boolean(data.videoId && data.videoId !== sharedVideoId);
          if (data.videoId) setSharedVideoId(data.videoId);
          if (Array.isArray(data.queue)) setQueue(data.queue);
          if (Array.isArray(data.localQueue)) setLocalQueue(data.localQueue.slice(0, 24));
          const position = Number(data.position) || 0;
          const elapsed = data.playing && data.sentAt ? Math.max(0, (Date.now() - data.sentAt) / 1000) : 0;
          const nextPosition = position + elapsed;
          const safePosition = clampRoomClock(!videoChanged && nextPosition + 0.75 < lastRoomPosition.current ? lastRoomPosition.current : nextPosition);
          lastRoomPosition.current = safePosition;
          applyingRemotePlaybackUntil.current = Date.now() + 900;
          setTimelineEvidence({ source: "remote", at: Date.now() });
          setPlayback({ playing: Boolean(data.playing), position: safePosition });
        }
        if (data.type === "resync-request" && !joinedAsGuest) {
          const position = roomVideoRef.current?.currentTime ?? playback.position;
          p2p.send({ type: "room-state", playing: !roomVideoRef.current?.paused && playback.playing, position, videoId: sharedVideoId, queue, localQueue, sentAt: Date.now() }, from);
        }
      }),
    [joinedAsGuest, localQueue, p2p.onMessage, p2p.send, playback.playing, playback.position, queue, roomClockCeiling, sharedVideoId],
  );
  const sync = (next: { playing: boolean; position: number }, seek = false) => {
    if (!seek && Date.now() < applyingRemotePlaybackUntil.current) return;
    // The YouTube iframe cannot expose its live time without a separate API
    // event bridge. Keep an accurate-enough local clock between room commands
    // so Pause does not broadcast the original zero timestamp back to guests.
    const isYoutube = sharedVideo?.remote?.kind === "youtube";
    const isTwitch = sharedVideo?.remote?.kind === "twitch";
    const elapsed = (isYoutube || isTwitch) && playback.playing && youtubePlaybackStartedAt.current ? Math.max(0, (Date.now() - youtubePlaybackStartedAt.current) / 1000) : 0;
    const playerPosition = isTwitch ? twitchPlayerRef.current?.getCurrentTime() : undefined;
    const hasTwitchPosition = typeof playerPosition === "number" && Number.isFinite(playerPosition) && playerPosition > 0.25;
    // Provider event handlers occasionally emit a transient zero immediately
    // after Play/Pause. That is not a seek. Never let it overwrite an
    // established VOD timeline unless the user explicitly asked to seek.
    const providerFallback = lastRoomPosition.current > 0.25 && next.position <= 0.25 && !seek;
    // A provider pause is a time capture, not a seek. Its callback can be
    // late (or transiently zero), so freeze the furthest trusted local clock.
    const providerClock = Math.max(lastRoomPosition.current, playback.position + elapsed);
    const position = !seek && (isYoutube || isTwitch) && !next.playing
      ? Math.max(providerClock, next.position)
      : isTwitch
        ? hasTwitchPosition
          ? playerPosition
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
    p2p.send({ type: "sync", ...resolved, videoId: sharedVideoId, seek, sentAt: Date.now() });
  };
  useEffect(() => {
    // Iframe providers do not continuously expose a readable clock. Maintain
    // a conservative room estimate between controls and have only the host
    // publish a heartbeat, preventing the old guest echo loop at position 0.
    const provider = sharedVideo?.remote?.kind;
    if (!provider || !playback.playing || !youtubePlaybackStartedAt.current) return;
    const timer = window.setInterval(() => {
      const twitchTime = provider === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : undefined;
      const actual = typeof twitchTime === "number" && twitchTime > 0.25 ? twitchTime : undefined;
      const estimated = clampRoomClock(actual ?? Math.max(lastRoomPosition.current, (Date.now() - youtubePlaybackStartedAt.current!) / 1000));
      if (estimated <= lastRoomPosition.current + 0.2) return;
      lastRoomPosition.current = estimated;
      setPlayback((current) => current.playing ? { ...current, position: estimated } : current);
      setTimelineEvidence({ source: actual === undefined ? "estimated" : "local", at: Date.now() });
      if (!joinedAsGuest) p2p.send({ type: "sync", playing: true, position: estimated, videoId: sharedVideoId, seek: false, sentAt: Date.now() });
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [joinedAsGuest, p2p.send, playback.playing, sharedVideo?.id, sharedVideo?.remote?.kind]);
  const resync = () => {
    if (joinedAsGuest) {
      p2p.send({ type: "resync-request" });
      setInviteNotice("Requested the host’s current room state.");
      return;
    }
    const localPosition = roomVideoRef.current?.currentTime;
    const twitchPosition = sharedVideo?.remote?.kind === "twitch" ? twitchPlayerRef.current?.getCurrentTime() : undefined;
    const position = typeof localPosition === "number" && localPosition > 0.25 ? localPosition : typeof twitchPosition === "number" && twitchPosition > 0.25 ? twitchPosition : playback.position;
    const playing = roomVideoRef.current ? !roomVideoRef.current.paused : playback.playing;
    sync({ playing, position });
    p2p.send({ type: "room-state", playing, position, videoId: sharedVideoId, queue, localQueue, sentAt: Date.now() });
    setInviteNotice("Sent the current video and timeline to every guest.");
  };
  const copyInvite = async () => {
    const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}&theater=1`;
    try {
      await navigator.clipboard.writeText(link);
      setInviteNotice("Theater invitation link copied.");
    } catch {
      setInviteNotice(`Share this theater link: ${link}`);
    }
  };
  useEffect(() => {
    const media = roomVideoRef.current;
    if (!media || sharedVideo?.remote) return;
    const driftLimit = playback.playing ? 0.65 : 0.1;
    if (Math.abs(media.currentTime - playback.position) > driftLimit)
      media.currentTime = playback.position;
    if (playback.playing && media.paused) void media.play().catch(() => {});
    if (!playback.playing && !media.paused) media.pause();
  }, [playback, sharedVideo]);
  useEffect(() => {
    // YouTube's iframe API accepts command messages once enablejsapi=1 is in
    // the URL. This keeps the in-room controls meaningful instead of merely
    // changing a label beside an uncontrolled embed.
    if (sharedVideo?.remote?.kind !== "youtube" || !remoteFrameReady) return;
    const frame = remoteFrameRef.current?.contentWindow;
    if (!frame) return;
    const target = new URL(watchRoomEmbed(sharedVideo)).origin;
    // Seeking is destructive for an iframe player. Do it only for an explicit
    // +/- seek (or a newly selected video), never as a side effect of Pause.
    if (remoteSeekNonce !== lastYoutubeSeekNonce.current) {
      lastYoutubeSeekNonce.current = remoteSeekNonce;
      if (remoteSeekNonce) frame.postMessage(JSON.stringify({ event: "command", func: "seekTo", args: [playback.position, true] }), target);
    }
    frame.postMessage(JSON.stringify({ event: "command", func: playback.playing ? "playVideo" : "pauseVideo", args: [] }), target);
  }, [playback, remoteFrameReady, remoteSeekNonce, sharedVideo]);
  useEffect(() => {
    if (sharedVideo?.remote?.kind !== "twitch") { twitchPlayerRef.current = null; return; }
    const host = twitchPlayerHostRef.current;
    if (!host) return;
    let cancelled = false;
    const hostId = `reelcase-twitch-${p2p.selfId}`;
    host.id = hostId;
    host.replaceChildren();
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
      const events = player.constructor as { READY?: string; PLAY?: string; PAUSE?: string; SEEK?: string };
      player.addEventListener(events.READY ?? "ready", () => { if (!cancelled) { setTwitchPlayerStatus("Twitch player ready. Use room controls to start."); setTwitchPlayerReady(Date.now()); } });
      player.addEventListener(events.PLAY ?? "play", () => { const position = player.getCurrentTime(); if (!cancelled && Date.now() > suppressRemotePlayerEchoUntil.current) sync({ playing: true, position: position > 0.25 ? position : playback.position }); });
      player.addEventListener(events.PAUSE ?? "pause", () => { const position = player.getCurrentTime(); if (!cancelled && Date.now() > suppressRemotePlayerEchoUntil.current) sync({ playing: false, position: position > 0.25 ? position : playback.position }); });
      player.addEventListener(events.SEEK ?? "seek", () => { if (!cancelled && !live) sync({ playing: true, position: player.getCurrentTime() || playback.position }, true); });
    }).catch(() => { if (!cancelled) setTwitchPlayerStatus("Twitch interactive player could not load. Open Twitch directly below."); });
    return () => { cancelled = true; twitchPlayerRef.current = null; host.replaceChildren(); };
  // The player belongs to the selected card, not to every timeline tick.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p2p.selfId, sharedVideo?.id]);
  useEffect(() => {
    if (sharedVideo?.remote?.kind !== "twitch") return;
    const player = twitchPlayerRef.current;
    if (!player) return;
    if (remoteSeekNonce !== lastTwitchSeekNonce.current) {
      lastTwitchSeekNonce.current = remoteSeekNonce;
      if (remoteSeekNonce && !sharedVideo.remote.live) player.seek(playback.position);
    }
    suppressRemotePlayerEchoUntil.current = Date.now() + 750;
    if (playback.playing) player.play(); else player.pause();
  }, [playback, remoteSeekNonce, sharedVideo, twitchPlayerReady]);
  const toggleRoomPlayback = () => {
    const playing = !playback.playing;
    const player = twitchPlayerRef.current;
    // Call Twitch inside the click gesture to satisfy browser media policy;
    // the shared state still travels to every connected guest afterwards.
    if (sharedVideo?.remote?.kind === "twitch" && (!player || !twitchPlayerReady)) {
      setInviteNotice("Twitch is still preparing its player. Wait for “Twitch player ready,” then press Play.");
      return;
    }
    if (sharedVideo?.remote?.kind === "twitch" && player) {
      if (playing) {
        // This call is deliberately inside the click gesture. Do not mute a
        // VOD before trying to start it: Twitch permits a direct user-start
        // with sound, whereas a later effect-driven attempt can be rejected.
        player.setMuted?.(false);
        player.play();
        setTwitchPlayerStatus("Starting Twitch from the room control…");
      } else player.pause();
    }
    sync({ ...playback, playing });
  };
  const chooseVideo = (video: LibraryVideo) => {
    setLocalVideo(null);
    setLocalShare(null);
    setLocalShareMatches({});
    setSharedVideoId(video.id);
    setPlayback({ playing: false, position: 0 });
    lastRoomPosition.current = 0;
    lastRoomHistoryId.current = "";
    recordPlay(video.id, "watch-room");
    p2p.send({ type: "video", videoId: video.id });
    p2p.send({ type: "sync", playing: false, position: 0, seek: true });
  };
  const updateQueue = (next: string[]) => {
    measureInteraction("queue");
    setQueue(next);
    p2p.send({ type: "queue", queue: next });
  };
  const updateLocalQueue = (next: LocalRoomShare[]) => {
    const bounded = next.slice(0, 24);
    setLocalQueue(bounded);
    p2p.send({ type: "local-queue", localQueue: bounded });
  };
  const stageLocalShare = (share: LocalRoomShare) => {
    if (!localShare || localShare.fingerprint !== share.fingerprint || !localVideo) {
      setPendingLocalShare(share);
      setInviteNotice(`Choose ${share.name} on this device before staging it. File contents are never transferred.`);
      return;
    }
    setSharedVideoId(`local:${share.fingerprint}`);
    setPlayback({ playing: false, position: 0 });
    lastRoomPosition.current = 0;
    p2p.send({ type: "video", videoId: `local:${share.fingerprint}` });
    p2p.send({ type: "sync", playing: false, position: 0, videoId: `local:${share.fingerprint}`, seek: true, sentAt: Date.now() });
    setInviteNotice(`${share.name} is staged. Guests with a verified local match can play it in sync.`);
  };
  const selectLocalVideo = (file: File | null) => {
    if (!file) return;
    const share: LocalRoomShare = { name: file.name, fingerprint: localRoomFingerprint(file), size: file.size, modified: file.lastModified };
    if (joinedAsGuest && pendingLocalShare && pendingLocalShare.fingerprint !== share.fingerprint) {
      setInviteNotice(`That file does not match ${pendingLocalShare.name}. Select the same permitted copy (name, size, and modified time must agree).`);
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
    setSharedVideoId(`local:${share.fingerprint}`);
    setLocalShareMatches({});
    setPlayback({ playing: false, position: 0 });
    lastRoomPosition.current = 0;
    p2p.send({ type: "share-ready", ...share });
    p2p.send({ type: "video", videoId: `local:${share.fingerprint}` });
    setInviteNotice("Local video is staged by a privacy-preserving fingerprint. Guests choose their own permitted matching copy; no file bytes leave this computer.");
  };
  const queueVideo = (video: LibraryVideo) => {
    if (video.id !== sharedVideoId && !queue.includes(video.id)) updateQueue([...queue, video.id]);
  };
  const queueImmediately = (video: LibraryVideo) => {
    if (video.id === sharedVideoId) return;
    updateQueue([video.id, ...queue.filter((id) => id !== video.id)]);
    setInviteNotice(`${video.name} will play next for everyone in the room.`);
  };
  const playNext = () => {
    const nextId = queue[0];
    if (!nextId) return;
    const next = videos.find((video) => video.id === nextId);
    updateQueue(queue.slice(1));
    if (next) chooseVideo(next);
  };
  const playQueuedNow = (id: string) => {
    const video = videos.find((item) => item.id === id);
    if (!video) return;
    updateQueue(queue.filter((item) => item !== id));
    chooseVideo(video);
  };
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
        copy="Create a private room code or join one on the same network. Peers connect directly; names, chat, and playback commands stay in the room."
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
            <Button variant="secondary" className="mt-3 w-full" onClick={() => void copyInvite()}>
              <Copy className="size-4" /> Copy theater invitation link
            </Button>
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
          : "Direct peer connection for your selected guests. Playback events are synchronized across connected devices."
      }
    >
      <div className="mt-6 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(18rem,0.7fr)]">
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
            <Button size="sm" variant="secondary" onClick={() => {
              const invite = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}&theater=1`;
              const opened = window.open(invite, "reelcase-local-guest", "noopener,width=1200,height=820");
              setInviteNotice(opened ? "Opened a separate local guest window. Give it a moment to appear in Guests." : "Your browser blocked the guest window. Allow pop-ups, then try again.");
            }}>Open local guest window</Button>
            <Button size="sm" variant="ghost" onClick={() => void navigator.clipboard?.writeText(JSON.stringify({ room: activeRoom, invitation: `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}&theater=1`, self: p2p.selfId, signaling: p2p.joined, peers: p2p.peers, transportTest: pulseStatus, events: p2p.events, capturedAt: new Date().toISOString() }, null, 2)).then(() => setInviteNotice("Connection diagnostic copied."), () => setInviteNotice("Could not copy the diagnostic."))}>Copy connection diagnostic</Button>
          </div>
          <div className="mt-3 rounded-sm bg-bg/45 p-3">
            <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium text-fg">Connection signals</p><span className="text-xs text-muted">{p2p.peers.filter((peer) => peer.connectionState === "connected").length}/{p2p.peers.length} direct</span></div>
            <div className="mt-2 max-h-28 space-y-1 overflow-y-auto font-mono text-[11px] leading-4 text-muted">{p2p.events.map((event, index) => <p key={`${event}-${index}`}>{event}</p>)}</div>
            {!p2p.peers.length && p2p.joined && <p className="mt-2 text-xs text-accent">Signaling is healthy, but no peer is in <strong>{activeRoom}</strong>. The other window must join this exact code—not create its own. Use Open local guest window or copy this room link.</p>}
            {p2p.peers.length > 0 && <div className="mt-2 space-y-1 text-xs text-muted">{p2p.peers.map((peer) => <p key={peer.id}><strong className="text-fg">{peer.name || "Guest"}</strong> · {peer.connectionState} · {peer.candidateType ?? "path pending"} · {peer.rttMs == null ? "RTT pending" : `${peer.rttMs}ms`} · {peer.id.slice(-6)}</p>)}</div>}
            <div className="mt-3 flex flex-wrap items-center gap-2"><Button size="sm" variant="secondary" disabled={!p2p.peers.some((peer) => peer.connectionState === "connected")} onClick={() => { setPulseStatus("Sending direct transport test…"); p2p.send({ type: "room-pulse", sentAt: Date.now() }); }}>Test chat transport</Button><span className="text-xs text-muted">{pulseStatus}</span></div>
          </div>
          <h2 className="mt-2 font-display text-3xl text-fg">
            {playback.playing ? "Playing together" : "Paused together"}
          </h2>
          <p className="mt-2 text-sm text-muted">
            Timeline {Math.floor(playback.position / 60)}:
            {String(Math.floor(playback.position % 60)).padStart(2, "0")} · {timelineEvidence.source === "remote" ? "host-confirmed" : timelineEvidence.source === "local" ? "local player" : "provider estimate"} · checked {new Date(timelineEvidence.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" })}.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={toggleRoomPlayback}>
              {playback.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              {playback.playing ? "Pause" : "Play"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => sync({ ...playback, position: Math.max(0, playback.position - 15) }, true)}
            >
              −15 sec
            </Button>
            <Button
              variant="secondary"
              onClick={() => sync({ ...playback, position: playback.position + 15 }, true)}
            >
              +15 sec
            </Button>
            <Button variant="secondary" onClick={resync}>
              <Wifi className="size-4" /> {joinedAsGuest ? "Request resync" : "Resync guests"}
            </Button>
            <Button variant="ghost" size="sm" disabled={!queue.length} onClick={playNext}>
              Play next {queue.length ? `(${queue.length})` : ""}
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
            className={`mt-3 mx-auto w-full max-w-full overflow-hidden rounded-md bg-bg shadow-border ${stageSize === "compact" ? "lg:max-w-2xl" : stageSize === "theater" ? "lg:max-w-6xl" : ""}`}
          >
            {localVideoUrl && localShareIsMatched ? (
              <video
                ref={roomVideoRef}
                className="aspect-video w-full bg-bg"
                src={localVideoUrl}
                controls
                onEnded={playNext}
                onPlay={() => sync({ playing: true, position: roomVideoRef.current?.currentTime ?? 0 })}
                onPause={() => sync({ playing: false, position: roomVideoRef.current?.currentTime ?? 0 })}
                onSeeked={() => sync({ playing: roomVideoRef.current ? !roomVideoRef.current.paused : false, position: roomVideoRef.current?.currentTime ?? 0 })}
              />
            ) : sharedVideo?.remote?.kind === "twitch" ? (
              <div className="relative aspect-video w-full bg-bg">
                <div ref={twitchPlayerHostRef} className="absolute inset-0" />
                <p className="absolute bottom-2 left-2 rounded-sm bg-bg/80 px-2 py-1 text-xs text-muted">{twitchPlayerStatus}</p>
              </div>
            ) : sharedVideo?.remote?.embedUrl ? (
              <iframe
                ref={remoteFrameRef}
                title={sharedVideo.name}
                src={watchRoomEmbed(sharedVideo)}
                className="aspect-video w-full border-0"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
                onLoad={() => setRemoteFrameReady(Date.now())}
              />
            ) : sharedVideo?.src ? (
              <video
                ref={roomVideoRef}
                className="aspect-video w-full bg-bg"
                src={sharedVideo.src}
                controls
                onEnded={playNext}
                onPlay={() =>
                  sync({ playing: true, position: roomVideoRef.current?.currentTime ?? 0 })
                }
                onPause={() =>
                  sync({ playing: false, position: roomVideoRef.current?.currentTime ?? 0 })
                }
                onSeeked={() =>
                  sync({
                    playing: roomVideoRef.current ? !roomVideoRef.current.paused : false,
                    position: roomVideoRef.current?.currentTime ?? 0,
                  })
                }
                onTimeUpdate={() => {
                  const media = roomVideoRef.current;
                  if (!media || media.paused || Date.now() - lastRoomTick.current < 900) return;
                  lastRoomTick.current = Date.now();
                  sync({ playing: true, position: media.currentTime });
                }}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-muted">
                {sharedVideoId.startsWith("local:") ? "This local handoff is waiting for a matching permitted file on this device." : "Choose a starter movie or an online video to show it to the room."}
              </div>
            )}
          </div>
          {sharedVideo?.remote?.kind === "youtube" ? (
            <p className="mt-2 text-xs text-subtle">
              YouTube room controls retain the last trusted clock on pause, then resume from that same point. Use the room controls so every guest receives the same command.
            </p>
          ) : sharedVideo?.remote?.kind === "twitch" ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-subtle"><p><strong className="text-fg">Twitch currently needs one manual Play press in each viewer’s embed.</strong> Browser media rules prevent Reelcase from forcing a guest stream to start. Selection, queue, chat, and the preserved pause clock still sync through the room controls.</p>{sharedVideo.remote.watchUrl && <a href={sharedVideo.remote.watchUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-8 items-center rounded-sm bg-elevated px-2 text-xs text-fg shadow-border"><ExternalLink className="mr-1 size-3"/>Open Twitch directly</a>}</div>
          ) : null}
          <p className="mt-3 text-xs text-muted">Recommended from your playable library — saved titles get a small lift while unplayed playable videos rotate to the front. Ready local files can be added to the queue below without taking over the stage.</p>
          <div className="mt-2 flex flex-wrap gap-2"><Button size="sm" variant="ghost" onClick={() => { setCandidateSeed(Date.now()); setRoomPickLimit(18); }}><Shuffle className="size-3.5" /> Mix playable picks</Button>{roomCandidates.length > roomPickLimit && <Button size="sm" variant="ghost" onClick={() => setRoomPickLimit((limit) => Math.min(roomCandidates.length, limit + 18))}>Load 18 more playable videos</Button>}</div>
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
            {roomCandidates
              .slice(0, roomPickLimit)
              .map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => chooseVideo(video)}
                  className={`w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === sharedVideoId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`}
                >
                  {watchRoomPoster(video) ? (
                    <img src={watchRoomPoster(video)} alt="" className="aspect-video w-full object-cover" onError={(event) => { const fallback = video.remote?.kind === "youtube" && video.remote.videoId ? `https://i.ytimg.com/vi/${video.remote.videoId}/mqdefault.jpg` : ""; if (fallback && event.currentTarget.src !== fallback) event.currentTarget.src = fallback; else event.currentTarget.style.display = "none"; }} />
                  ) : null}
                  <span className="block truncate px-2 py-2 text-xs">{video.name}</span>
                </button>
              ))}
          </div>
          <div className="mt-3 rounded-md bg-bg/45 p-3 shadow-border">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-fg">Up next queue</p>
              <span className="text-xs text-muted">Hosts can order the room playlist</span>
            </div>
            {queue.length ? (
              <div className="mt-2 space-y-2">
                {queue.map((id, index) => {
                  const video = videos.find((item) => item.id === id);
                  return (
                    <div key={id} className="flex items-center justify-between gap-3 rounded-sm bg-elevated p-2">
                      <div className="flex min-w-0 items-center gap-3"><span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">{index + 1}</span>{video && watchRoomPoster(video) ? <img src={watchRoomPoster(video)} alt="" className="aspect-video w-16 shrink-0 rounded-sm object-cover" /> : <div className="flex aspect-video w-16 shrink-0 items-center justify-center rounded-sm bg-bg/60 text-xs text-muted"><Play className="size-3" /></div>}<span className="min-w-0"><span className="block truncate text-sm text-fg">{video?.name ?? "Unavailable title"}</span><span className="block truncate text-xs text-muted">{video?.remote?.channelName ?? (video?.remote ? "Remote video" : "Local file")}</span></span></div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => playQueuedNow(id)}
                        >
                          Play now
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
          </div>
          <div className="mt-5 rounded-md bg-bg/45 p-4 shadow-border">
            <div className="flex items-center gap-2">
              <MonitorPlay className="size-4 text-accent" />
              <p className="text-sm font-medium text-fg">Share local video</p>
            </div>
            <p className="mt-1 text-xs text-muted">
              Choose a file only when every guest has permission to view it. Guests confirm access
              before you start sharing.
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
                {localVideo ? localVideo.name : "Choose local video"}
              </span>
            </label>
            {localShare && <p className="mt-2 text-xs text-subtle">Fingerprint match: name + {bytes(localShare.size)} + modified {new Date(localShare.modified).toLocaleDateString()}. This is shared as metadata only.</p>}
            {localShare && <p className="mt-1 text-xs text-muted">Compatibility matrix · {Object.values(localShareMatches).filter((match) => match.fingerprint === localShare.fingerprint).length}/{p2p.peers.length} guests matched this exact file{p2p.peers.length ? ". Stage or play only when the expected guests are ready." : ". Connect a guest to verify the handoff."}</p>}
            {pendingLocalShare && <p className="mt-2 text-xs text-accent">Guest match requested: {pendingLocalShare.name} · {bytes(pendingLocalShare.size)}. Choose the matching permitted copy above.</p>}
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
              disabled={!localVideo || !guestAccess || !p2p.peers.length}
              onClick={() => { if (!localShare) return; setLocalShareMatches({}); p2p.send({ type: "share-ready", ...localShare }); p2p.send({ type: "video", videoId: `local:${localShare.fingerprint}` }); setInviteNotice("Local-share request sent with a match fingerprint. Guests must choose their permitted local copy before playback can align."); }}
            >
              Send sharing request
            </Button>
            <Button size="sm" variant="secondary" className="mt-3 ml-2" disabled={!localShare} onClick={() => { if (!localShare) return; if (!localQueue.some((item) => item.fingerprint === localShare.fingerprint)) updateLocalQueue([...localQueue, localShare]); setInviteNotice("Added this local file to the shared handoff queue. Guests see only its match metadata."); }}>Add to local queue</Button>
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
                } catch { setRokuNotice("Roku discovery needs the local Reelcase Companion running on this Windows computer."); }
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
        </div>
        <div className="rounded-lg bg-elevated p-4 shadow-border">
          <p className="flex items-center gap-2 text-sm font-medium text-fg">
            <MessageCircle className="size-4 text-accent" /> Room chat
          </p>
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm text-muted">
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
