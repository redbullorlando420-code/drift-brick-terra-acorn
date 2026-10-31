import {BrowserPermissionControl} from './capability-permissions';
import { companionFetch } from '@/lib/companion';
import { decodeArtworkBitmap } from '@/lib/videos/bitmap-pool';
import {clearReviewedPhotos,setReviewedPhotos} from '@/lib/reviewed-photo-bridges';
import { getPerformanceProfile } from '@/lib/performance-profile';
import { useEffect, useMemo, useRef, useState } from "react";
import { Download, EyeOff, Images, RefreshCw, Star, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { saveDurablePhotos, restoreDurablePhotos, loadDurablePhotosSync, type DurablePhotoMeta } from "@/lib/videos/persist";
import { registerPeriodicTask } from '@/lib/periodic-work';
import { useSourceAssets } from "@/lib/source-assets";
import { ratingPreference } from "@/lib/media-feedback";
import { benchmarkVisionModelsLocally, classifyImagesLocally, VISION_MODELS, type VisionBenchmark, type VisionLabel, type VisionModelId } from "@/lib/local-vision";
import { LOCAL_UPSCALER, upscaleImageLocally } from "@/lib/local-upscaler";
import { bytes, HubShell } from './hub-shared';
import { PhotoLabelInput } from './photo-label-input';

type LocalPhoto = {
  id: string;
  name: string;
  path: string;
  url: string;
  people: string[];
  tags: string[];
  album: string;
  bridgeAuditEligible: boolean;
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
  const [photoAuditAck,setPhotoAuditAck]=useState(false);
  useEffect(()=>{clearReviewedPhotos();},[]);
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
        const response = await companionFetch("/cache-status", { signal: AbortSignal.any([signal, AbortSignal.timeout(5_000)]) });
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
        bridgeAuditEligible: !paths,
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
  const flushPhotoMetadata=()=>{if(metadataWriteTimer.current)clearTimeout(metadataWriteTimer.current);
      if (!photos.length) { metadataWriteTimer.current=null; return; }
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
    metadataWriteTimer.current=null;
  };
  const latestPhotoFlush=useRef(flushPhotoMetadata);
  latestPhotoFlush.current=flushPhotoMetadata;
  useEffect(()=>{
    const flush=()=>{if(metadataWriteTimer.current)latestPhotoFlush.current();};
    const hidden=()=>{if(document.visibilityState==='hidden')flush();};
    window.addEventListener('pagehide',flush);
    document.addEventListener('visibilitychange',hidden);
    return()=>{window.removeEventListener('pagehide',flush);document.removeEventListener('visibilitychange',hidden);flush();};
  },[]);
  useEffect(() => {
    // Metadata writes used to serialize every photo after every streamed batch.
    // Coalescing into one idle-sized save keeps scrolling and image decode work
    // ahead of storage work for big folders.
    if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current);
    if (!photos.length) return;
    metadataWriteTimer.current = setTimeout(flushPhotoMetadata,650);
    return () => { if (metadataWriteTimer.current) clearTimeout(metadataWriteTimer.current); };
  }, [photos]);
  useEffect(() => {
    let cancelled = false;
    const controller=new AbortController();
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
            const bitmap = await decodeArtworkBitmap(photo.file!,controller.signal);
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
    return () => { cancelled = true; controller.abort(); };
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
  useEffect(()=>setPhotoAuditAck(false),[photos,selectedPhotoIds]);
  const auditPhotoSelection=photos.filter(photo=>selectedPhotoIds.has(photo.id)&&!photo.hidden&&photo.bridgeAuditEligible);
  const reviewPhotoTopics=()=>{if(!photoAuditAck||auditPhotoSelection.length!==selectedPhotoIds.size||auditPhotoSelection.length>48)return;flushPhotoMetadata();setReviewedPhotos(auditPhotoSelection.map((photo,index)=>({id:'reviewed-photo:'+index,name:photo.name,tags:photo.tags,reviewed:true,direct:true,hidden:false})));useLibrary.getState().setQuery('');useLibrary.getState().setSource('assistant');};
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
        {selectedPhotoIds.size > 0 && <div className="flex flex-wrap items-center gap-2 rounded-sm bg-bg/45 p-3"><span className="text-sm font-medium text-fg">{selectedPhotoIds.size} selected</span><Button size="sm" variant="secondary" onClick={() => applyTagToSelected("favorite-set")}>Tag set</Button><Button size="sm" variant="secondary" onClick={() => { photos.filter((photo) => selectedPhotoIds.has(photo.id)).forEach(downloadPhoto); }}>Download selected</Button><Button size="sm" variant="ghost" onClick={() => setSelectedPhotoIds(new Set())}>Clear selection</Button><div className="w-full border-t border-border pt-3"><label className="flex min-h-11 items-center gap-3 text-xs text-fg"><input type="checkbox" checked={photoAuditAck} onChange={event=>setPhotoAuditAck(event.target.checked)} aria-label="Confirm selected photos are suitable for public topic connections"/>I reviewed these visible photos as suitable for public topic connections.</label><p className="mt-1 text-xs leading-5 text-muted">Only photos chosen directly here qualify; imported source photos and hidden photos stay excluded. Review up to 48 saved tag sets. Image bytes, paths and people labels stay out of the audit. This review clears on reload or when you return to Photos.</p><Button className="mt-2 min-h-11" variant="secondary" disabled={!photoAuditAck||!auditPhotoSelection.length||auditPhotoSelection.length!==selectedPhotoIds.size||auditPhotoSelection.length>48} onClick={reviewPhotoTopics}>Audit selected photo topics</Button></div></div>}
        {photoFolders.length > 0 && (
          <p className="text-xs text-muted">Sources · {photoFolders.join(" · ")}</p>
        )}
        {sourceFolders.length > 0 && <p className="text-xs text-muted">Video sources available for photo folders · {sourceFolders.map((folder) => folder.name).slice(0, 8).join(" · ")}</p>}
        <div className="flex min-w-0 flex-col flex-wrap gap-2 sm:flex-row" aria-label="Photo search and sorting">
          <Input
            value={photoSearch}
            onChange={(event) => setPhotoSearch(event.target.value)}
            placeholder="Search names, people, albums, or file locations"
            aria-label="Search photos"
            className="min-w-0 sm:w-64 sm:flex-1"
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
            <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Local vision</p><BrowserPermissionControl scope="local-vision"/><p className="mt-1 text-sm text-fg">{visionProcessed.toLocaleString()} accepted · {visionPending.toLocaleString()} waiting · SigLIP semantic+ is the balanced fast default</p></div><Button size="sm" variant="secondary" disabled={visionBusy || !visionPending} onClick={prepareNextPhotoVision}>{visionBusy ? visionProgress || "Starting model…" : `Prepare next ${Math.min(48, visionPending)}`}</Button></div>
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
                <PhotoLabelInput
                  className="mt-2 h-9"
                  placeholder="People: Alex, Sam"
                  label={`People in ${photo.name}`}
                  value={photo.people}
                  onChange={(names) => {
                    setPhotos((items) =>
                      items.map((item) =>
                        item.id === photo.id ? { ...item, people: names } : item,
                      ),
                    );
                  }}
                />
                <PhotoLabelInput
                  className="mt-2 h-9"
                  placeholder="Tags: travel, pets, event"
                  label={`Tags for ${photo.name}`}
                  tags
                  value={photo.tags}
                  onChange={(tags) => {
                    setPhotos((items) => items.map((item) => item.id === photo.id ? { ...item, tags } : item));
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
        </div><div className="mt-4 flex items-center justify-between gap-3 text-xs text-muted"><span>Showing {Math.min(renderedPhotos.length, visible.length)} of {visible.length} matching photos</span>{renderedPhotos.length < visible.length && <Button size="sm" variant="secondary" onClick={() => setPhotoLimit((limit) => limit + 80)}>Show 80 more</Button>}</div></div>{focusedPhoto && <div role="dialog" aria-modal="true" aria-label={`Viewing ${focusedPhoto.name}`} className="fixed inset-0 z-[80] flex items-center justify-center bg-bg/95 p-4" onClick={() => setFocusedPhotoId(null)}><div className="relative flex h-full w-full max-w-7xl flex-col gap-3" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between gap-3 text-fg"><div className="min-w-0"><p className="truncate font-medium">{focusedPhoto.name}</p><p className="text-xs text-muted">{Math.max(1, focusedIndex + 1)} of {visible.length || photos.length} · {focusedPhoto.album}</p>{showLocations && <p title={focusedPhoto.path} className="truncate text-xs text-muted">{focusedPhoto.path}</p>}</div><Button size="sm" variant="secondary" onClick={() => setFocusedPhotoId(null)}>Close</Button></div><div className="flex flex-wrap items-center gap-2"><Button size="sm" variant={focusedPhoto.favorite ? "default" : "secondary"} onClick={() => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? { ...item, favorite: !item.favorite } : item))}>{focusedPhoto.favorite ? "♥ Favorite" : "♡ Favorite"}</Button><Button size="sm" variant="secondary" aria-label={`Download ${focusedPhoto.name}`} onClick={() => downloadPhoto(focusedPhoto)}><Download className="size-4"/> Download</Button><Button size="sm" variant="secondary" disabled={visionBusy} onClick={() => { setFocusedPhotoId(null); void preparePhotoVision([focusedPhoto]); }}>{visionBusy ? visionProgress || "Preparing labels…" : "Prepare vision labels"}</Button><PhotoLabelInput key={focusedPhoto.id} className="h-8 min-w-0 basis-56 flex-1" label="Edit photo tags" tags value={focusedPhoto.tags} placeholder="Add tags, separated by commas" onChange={(tags) => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? { ...item, tags } : item))} />{focusedPhoto.tags.length ? focusedPhoto.tags.map((tag) => <button key={tag} type="button" className="rounded-xs bg-elevated px-2 py-1 text-xs text-muted" onClick={() => setSelectedTag(tag)}>#{tag}</button>) : <span className="text-xs text-muted">No tags yet</span>}</div><PhotoStars name={focusedPhoto.name} rating={focusedPhoto.rating} onChange={(rating) => setPhotos((items) => items.map((item) => item.id === focusedPhoto.id ? { ...item, rating } : item))} /><div className="relative min-h-0 flex-1">{photoViewerLoading && <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg/70 text-sm text-fg"><RefreshCw className="size-7 animate-spin text-accent" />Loading full-resolution photo…</div>}<img src={focusedPhoto.url} alt={focusedPhoto.name} className="max-h-full w-full object-contain" decoding="async" onLoad={() => setPhotoViewerLoading(false)} onError={() => setPhotoViewerLoading(false)}/><Button size="sm" variant="secondary" className="absolute top-1/2 left-2 -translate-y-1/2" onClick={() => { setPhotoViewerLoading(true); moveFocus(-1); }} aria-label="Previous photo"><ChevronLeft className="size-5"/></Button><Button size="sm" variant="secondary" className="absolute top-1/2 right-2 -translate-y-1/2" onClick={() => { setPhotoViewerLoading(true); moveFocus(1); }} aria-label="Next photo"><ChevronRight className="size-5"/></Button></div></div></div>}</>
      )}
    </HubShell>
  );
}

function PhotoStars({ name, rating, onChange }: { name: string; rating: number; onChange: (rating: number) => void }) {
  return <div className="mt-2 flex flex-wrap items-center gap-1" role="group" aria-label={"Rating for " + name}>{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" className="inline-flex size-11 items-center justify-center rounded-sm hover:bg-accent/10 focus-visible:outline-2 focus-visible:outline-accent" aria-label={"Rate " + name + " " + value + " stars"} aria-pressed={rating === value} onClick={() => onChange(value)}><Star className={"size-5 " + (value <= rating ? "fill-accent text-accent" : "text-muted")}/></button>)}{rating > 0 && <button type="button" className="min-h-11 px-2 text-xs text-muted" aria-label={"Clear rating for " + name} onClick={() => onChange(0)}>Clear</button>}</div>;
}
