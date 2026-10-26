import {hydrateProviderViewing} from '@/lib/provider-viewing-store';
import {hydrateAnimeReviews} from '@/lib/anime-review-store';
import {hydrateFilmReviews} from '@/lib/film-review-store';
import {hydrateGuidePreset} from '@/lib/guide-preset-store';
import { YoutubeTagsControl } from './youtube-tags-control';
import { useSettingsAudit } from "./use-settings-audit";
import { usePerformanceProfile } from './use-performance-profile';
import { useTextFirstArtwork } from './use-artwork-mode';
import { setTextFirstArtwork } from '@/lib/artwork-mode';
import { getPerformanceMode, setPerformanceMode, type PerformanceMode } from '@/lib/performance-profile';
import { EnrichmentStatus } from './enrichment-status';
import { ArtworkAuditPanel } from './artwork-audit';
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Bot, Clapperboard, Download, Upload, PackageSearch, Radio, Settings2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PullSettingsPanel } from './pull-settings-panel';
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { buildLibraryPackFiles, downloadLibraryPackZip, importLibraryPackZip, applyLibraryPackFiles, type LibraryPackMode } from "@/lib/videos/library-pack";
import { companionExportLibraryPack, companionImportLibraryPack, companionHealth, companionInspectMedia, type CompanionMediaInspection } from "@/lib/companion";
import { linksFromHistoryAndResume, loadDurablePhotosSync } from "@/lib/videos/persist";
import { useThumbs } from "@/lib/videos/thumbs";
import { useSourceAssets } from "@/lib/source-assets";
import { exportFeedback } from "@/lib/media-feedback";
import { PerformanceScorecard } from "./performance-scorecard";
import { getYoutubeFirstClickTrace, getYoutubeTraceRevision, subscribeYoutubeTrace } from "@/lib/youtube-first-click-trace";
import { classifyImagesLocally, type VisionLabel } from "@/lib/local-vision";
import { readHub, HubShell, Stat, InfoCard } from './hub-shared';
import type { HubStore } from './hub-shared';

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
  const [creatorCoverageBusy, setCreatorCoverageBusy] = useState(false);
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
  const unavailable = useLibrary((s) => s.unavailable);
  const unavailableVideoCount = useMemo(() => Object.keys(unavailable).length, [unavailable]);
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
  const runCreatorCoverageRepair = async () => {
    setCreatorCoverageBusy(true);
    setCreatorCoverageNote('Queued · you can keep browsing while exact creator matches are prepared and saved.');
    try {
    const result = await repairCreatorCoverage();
    if (!result.processed) {
      setCreatorCoverageNote(creatorCoverage.ambiguous.length ? "No uniquely matched cards remain. Ambiguous exact-ID matches stay below for review and were not changed." : "Creator coverage is current for every card with one exact saved provider match.");
      return;
    }
    setCreatorCoverageNote(`Repaired ${result.repaired} creator ${result.repaired === 1 ? "identity" : "identities"} from exact saved provider IDs${result.tagged ? ` · ${result.tagged} unlocked card${result.tagged === 1 ? "" : "s"} also gained its creator tag` : " · locked tag choices were left unchanged"}${result.remaining ? ` · ${result.remaining} remain in the queue` : " · queue complete"}.`);
    } catch { setCreatorCoverageNote('Creator names could not be saved. No repair was applied; retry when storage is available.'); }
    finally { setCreatorCoverageBusy(false); }
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
      <section aria-label="YouTube tag enrichment" className="rounded-lg border border-border bg-surface p-5"><p className="text-xs font-medium tracking-widest text-accent uppercase">YouTube video tags & descriptions</p><p className="mt-2 text-sm leading-6 text-muted">Pull creator-supplied video tags and full descriptions directly from YouTube, five videos at a time. Hashtags, chapter phrases and relevant keywords improve search and recommendations. Public metadata may be unavailable for restricted videos. No sign-in or video download is needed for public metadata.</p><div className="mt-4"><YoutubeTagsControl /></div><div className="mt-5 border-t border-border pt-4"><p className="text-xs leading-5 text-muted">Already saved metadata upgrades in idle batches. Recheck cached tags uses no network requests. Manual edits and locks stay protected; repair waits while search or a viewer is active.</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => { repairCachedMetadata(); setServiceNote("YouTube tag repair queued. Follow Cached provider tags below; pause or resume background work while you browse."); }}>Improve YouTube tags</Button></div></section>
      <section className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Metadata tail coverage</p><h2 className="mt-2 font-display text-2xl text-fg">Finish cached catalog metadata in small batches.</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Uses already-cached provider titles, descriptions, channels, and local filenames. One pass scans in idle slices and saves at most 48 unlocked, untagged titles; it does not make a network request, inspect a media file, or replace a manual tag choice.</p><div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{metadataTailCoverage.length ? metadataTailCoverage.map((row) => <div key={row.source} className="rounded-sm bg-bg/45 p-3 text-xs"><p className="font-medium text-fg">{metadataSourceLabel(row.source)}</p><p className="mt-1 text-muted">{row.tagged.toLocaleString()} tagged · {row.waiting.toLocaleString()} waiting · {row.locked ? `${row.locked.toLocaleString()} locked` : "no locked gaps"}</p></div>) : <p className="text-xs text-muted">Add a local folder or provider channel to measure coverage.</p>}</div><div className="mt-4 flex flex-wrap items-center gap-3"><Button size="sm" variant="secondary" disabled={!auditReady || !metadataTailWaiting || metadataTailBusy} onClick={runMetadataTail}>{metadataTailBusy ? "Batch queued…" : metadataTailWaiting ? `Enrich next ${Math.min(48, metadataTailWaiting)}` : "Coverage current"}</Button><span className="text-xs text-accent">{metadataTailWaiting.toLocaleString()} unlocked title{metadataTailWaiting === 1 ? "" : "s"} waiting</span></div>{metadataTailNote && <p className="mt-3 text-xs leading-5 text-accent" role="status">Latest batch · {metadataTailNote}</p>}</section>
      <section data-creator-coverage data-creator-coverage-pending={!auditReady} aria-busy={!auditReady || creatorCoverageBusy} className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Creator coverage repair</p><h2 className="mt-2 font-display text-2xl text-fg">Recover only exact creator identities.</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-muted">Matches a missing YouTube or Twitch display name only when the cached card and one of your saved follows share the exact public channel ID or saved source ID. It never guesses from titles, filenames, or loose handles; no provider request is made.</p><div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-sm bg-bg/45 p-3 text-xs"><p className="font-medium text-fg">Tracked cards</p><p className="mt-1 text-muted">{creatorCoverage.total.toLocaleString()} YouTube/Twitch</p></div><div className="rounded-sm bg-bg/45 p-3 text-xs"><p className="font-medium text-fg">Already named</p><p className="mt-1 text-muted">{creatorCoverage.present.toLocaleString()} verified names</p></div><div className="rounded-sm bg-bg/45 p-3 text-xs"><p className="font-medium text-fg">Exact repairs</p><p className="mt-1 text-muted">{creatorCoverage.repairable.toLocaleString()} safe matches</p></div><div className="rounded-sm bg-bg/45 p-3 text-xs"><p className="font-medium text-fg">Needs evidence</p><p className="mt-1 text-muted">{creatorCoverage.unresolved.toLocaleString()} unmatched · {creatorCoverage.ambiguous.length.toLocaleString()} ambiguous</p></div></div><div className="mt-4 flex flex-wrap items-center gap-3"><Button size="sm" variant="secondary" disabled={creatorCoverageBusy || !auditReady || !creatorCoverage.repairable} onClick={() => void runCreatorCoverageRepair()}>{creatorCoverageBusy ? "Saving creator names…" : creatorCoverage.repairable ? `Repair next ${Math.min(48, creatorCoverage.repairable)}` : "Coverage current"}</Button><span className="text-xs text-accent">{creatorCoverage.repairable.toLocaleString()} exact match{creatorCoverage.repairable === 1 ? "" : "es"} waiting</span></div>{creatorCoverageNote && <p className="mt-3 text-xs leading-5 text-accent" role="status">Latest repair · {creatorCoverageNote}</p>}{creatorCoverage.ambiguous.length > 0 && <div className="mt-4 rounded-md border border-warning/35 bg-bg/45 p-3"><p className="text-sm font-medium text-fg">Ambiguous exact-ID matches need review</p><p className="mt-1 text-xs leading-5 text-muted">These cards match more than one saved display name. Nothing was written; open a card to inspect its provider details before changing follow data.</p><div className="mt-3 grid gap-2">{creatorCoverage.ambiguous.slice(0, 12).map((row) => <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-sm bg-elevated p-3"><p className="min-w-0 flex-1 truncate text-xs text-fg">{row.name}<span className="text-muted"> · {row.candidates.join(" / ")}</span></p><Button size="sm" variant="ghost" onClick={() => openPreview(row.id)}>Review card</Button></div>)}</div>{creatorCoverage.ambiguous.length > 12 && <p className="mt-3 text-xs text-muted">Showing 12 of {creatorCoverage.ambiguous.length.toLocaleString()} ambiguous cards.</p>}</div>}</section>
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
          <Button onClick={async () => {
            await Promise.all([hydrateGuidePreset(),hydrateFilmReviews(),hydrateAnimeReviews(),hydrateProviderViewing()]);
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
          <Button variant="secondary" onClick={async () => {
            await Promise.all([hydrateGuidePreset(),hydrateFilmReviews(),hydrateAnimeReviews(),hydrateProviderViewing()]);
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
