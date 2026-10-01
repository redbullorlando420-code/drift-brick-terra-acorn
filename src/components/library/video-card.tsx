import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from 'zustand/react/shallow';
import { cardVisibility, type CardVisibility } from '@/lib/card-visibility';
import { folderIsPrivate } from '@/lib/videos/folder-privacy';
import { warmVideoPreview } from "./video-overlay-loader";
import { allowCardArtwork } from "@/lib/session-activity";
import { useSessionPhase } from "@/lib/use-session-phase";
import { Download, Eye, EyeOff, Flame, Heart, ImageOff, LoaderCircle, Play, Tag, ThumbsUp, RefreshCw, Star, Users } from "lucide-react";
import { cn, formatAgo, formatBytes, formatTime } from "@/lib/utils";
import type { LibraryVideo } from "@/lib/videos/types";
import { hasFreshViewerCount, isLikelyPlayable, titleOf } from "@/lib/videos/types";
import { useThumbs, mirrorRemotePosterToCompanion } from "@/lib/videos/thumbs";
import { adultThumbCandidatesForVideo, isDecodedAdultThumbLikelyReal } from "@/lib/videos/adult-thumbs";
import {
  isAdultThumbBlacklisted,
  markAdultThumbFailed,
  markAdultThumbGood,
} from "@/lib/videos/adult-thumb-session";
import { isAdultImageKind, isAdultPullKind } from "@/lib/videos/adult-sites";
import { downloadAdultPhoto } from "@/lib/videos/adult-photo-download";
import { useLibrary } from "@/lib/videos/store";
import { toast } from "sonner";
import { getRating, setRating as setMediaRating } from "@/lib/media-feedback";
import { registerMountedCard } from "@/lib/render-budget";
import { measureInteraction } from "@/lib/interaction-budget";
import { acquireImageSlot, isArtworkSuppressed } from "@/lib/videos/image-load-budget";

const publishedDateFormat = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });

const THUMB_LOAD_TIMEOUT_MS = 4500;

type Variant = "grid" | "list" | "rail" | "poster";
const EMPTY_TAGS: string[] = [];
const artworkRepairRequested = new Set<string>();
const remoteArtworkRepairRequested = new Set<string>();

export const VideoCard = memo(function VideoCard({
  video,
  variant = "grid",
  index = 0,
  playedAt,
  className,
  animate = true,
}: {
  video: LibraryVideo;
  variant?: Variant;
  index?: number;
  playedAt?: number;
  className?: string;
  animate?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  // One subscription per store, scoped to this card's values. Unrelated
  // progress/thumbnail writes do not allocate dozens of hook snapshots.
  const { thumb, failed, capturedDur, request, retry, recallCompanion, artworkDiagnostic } = useThumbs(useShallow(s => ({
    thumb: s.byId[video.id], failed: s.failed[video.id], capturedDur: s.durations[video.id],
    request: s.request, retry: s.retry, recallCompanion: s.recallCompanion, artworkDiagnostic: s.diagnostics[video.id],
  })));
  const { repairArtworkSource, followRemoteQuery, progress, fav, liked, tags, category, viewCount, cameCount,
    adultFolder, markCame, toggleLike, openPreview, toggleFavorite, hideVideo, setVideoTags, setQuery, setSource, sourceId } = useLibrary(useShallow(s => ({
    repairArtworkSource: s.repairArtworkSource, followRemoteQuery: s.followRemoteQuery, progress: s.progress[video.id],
    fav: Boolean(s.favorites[video.id]), liked: Boolean(s.likes[video.id]), tags: s.tags[video.id] ?? EMPTY_TAGS,
    category: s.categories[video.id] ?? '', viewCount: s.viewCounts[video.id] ?? 0, cameCount: s.cameCounts[video.id] ?? 0,
    adultFolder: folderIsPrivate(s.folders, video.folderId), markCame: s.markCame, toggleLike: s.toggleLike,
    openPreview: s.openPreview, toggleFavorite: s.toggleFavorite, hideVideo: s.hideVideo,
    setVideoTags: s.setVideoTags, setQuery: s.setQuery, setSource: s.setSource, sourceId: s.sourceId,
  })));
  const adult = adultFolder || isAdultPullKind(video.remote?.kind);
  const adultPhoto = Boolean(adult && isAdultImageKind(video.remote?.kind, video.mime, video.extension));
  const hiddenAdult = adult && tags.includes("hidden");
  const duration = capturedDur ?? video.duration;
  const ratio = progress && progress.d > 0 ? Math.min(1, progress.t / progress.d) : 0;
  const playable = isLikelyPlayable(video.extension);
  const youtubeId = video.remote?.kind === "youtube" ? video.remote.videoId ?? video.remote.embedUrl?.match(/(?:embed\/|v=)([A-Za-z0-9_-]{11})/)?.[1] : undefined;
  const youtubeFallback = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined;
  const youtubeFallbacks = youtubeId
    ? [
        `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
        `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`,
        `https://i.ytimg.com/vi/${youtubeId}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${youtubeId}/default.jpg`,
      ]
    : [];
  const adultCandidates = useMemo(
    () => (video.remote && video.remote.kind !== "youtube" && video.remote.kind !== "twitch"
      ? adultThumbCandidatesForVideo(video)
      : []),
    [video],
  );
  const providerArt = video.poster || youtubeFallback || video.remote?.previewUrl;
  // Provider artwork is already the authoritative thumbnail. Never route it
  // through the local video-frame worker, which cannot decode cross-origin
  // embeds and was incorrectly marking good remote cards as unavailable.
  const art = variant === "poster" ? providerArt || thumb : thumb || providerArt;
  const isPoster = variant === "poster";
  const live = Boolean(video.remote?.live);
  // Rule34 image hosts can reject a deliberately stripped request. Keep the
  // normal privacy policy for every other provider, but preserve the ordinary
  // cross-origin referrer for its public booru thumbnails.
  const imageReferrerPolicy = video.remote?.kind === "booru" && video.remote.channelId === "rule34"
    ? "strict-origin-when-cross-origin"
    : "no-referrer";
  const dualSource = video.remote?.sourceKinds?.includes("reddit") && video.remote.sourceKinds.includes("redgifs");
  const preview = video.remote?.previewUrl;
  const [hovered, setHovered] = useState(false);
  const [thumbIndex, setThumbIndex] = useState(0);
  const [artVisibility, setArtVisibility] = useState<CardVisibility>({ near: false, visible: false });
  const artVisible = artVisibility.near;
  const artPriority = artVisibility.visible ? 'high' : 'low';
  const sessionPhase = useSessionPhase();
  const artAwake = allowCardArtwork(sessionPhase, artVisible, artPriority === "high");
  const [artAllowed, setArtAllowed] = useState(false);
  const [paintedSrc, setPaintedSrc] = useState<string | undefined>();
  const [candidateReady, setCandidateReady] = useState(false);
  const [textFirst, setTextFirst] = useState(false);
  const [rating, setRating] = useState(0);
  const imageSlotRelease = useRef<(() => void) | undefined>(undefined);

  const releaseImageSlot = () => {
    imageSlotRelease.current?.();
    imageSlotRelease.current = undefined;
    setArtAllowed(false);
  };

  const thumbCandidates = useMemo(() => {
    const out: string[] = [];
    const seen = new Set<string>();
    const push = (url?: string) => {
      // Keep the list identity-stable across blacklist updates so thumbIndex
      // does not skip a still-good neighbor when a dead URL is removed.
      if (!url || seen.has(url)) return;
      seen.add(url);
      out.push(url);
    };
    if (variant === "poster") {
      push(providerArt);
      push(thumb);
    } else {
      push(thumb);
      push(providerArt);
    }
    for (const url of adultCandidates) push(url);
    for (const url of youtubeFallbacks) push(url);
    push(preview);
    return out;
  }, [adultCandidates, preview, providerArt, thumb, variant, youtubeId]);

  const resolvedThumbIndex = (() => {
    for (let i = thumbIndex; i < thumbCandidates.length; i++) {
      if (!isAdultThumbBlacklisted(thumbCandidates[i])) return i;
    }
    return thumbCandidates.length;
  })();
  const thumbsExhausted = thumbCandidates.length === 0 || resolvedThumbIndex >= thumbCandidates.length;
  const activeThumb = thumbsExhausted ? undefined : thumbCandidates[resolvedThumbIndex];
  const showPreview = Boolean(sessionPhase === "active" && hovered && preview && preview !== activeThumb && resolvedThumbIndex === 0 && !isAdultThumbBlacklisted(preview));
  const advanceThumb = () => {
    setCandidateReady(false);
    setThumbIndex((index) => {
      let next = index + 1;
      while (next < thumbCandidates.length && isAdultThumbBlacklisted(thumbCandidates[next])) next += 1;
      return next;
    });
  };

  useEffect(() => {
    setThumbIndex(0);
    setPaintedSrc(undefined);
    setCandidateReady(false);
  }, [video.id, video.poster, video.remote?.previewUrl]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return cardVisibility.observe(el, value => setArtVisibility(previous =>
      previous.near === value.near && previous.visible === value.visible ? previous : value));
  }, [video.id]);

  useEffect(() => {
    if (!artAwake || isArtworkSuppressed() || !video.remote) return;
    void recallCompanion(video.id);
  }, [artAwake, recallCompanion, video.id, video.remote]);

  useEffect(() => {
    if (sessionPhase !== 'active' || !artVisible || video.remote || thumb) return;
    // Keep the subscription through viewer pauses; the queue resumes it on
    // close and cancels the capture when this card leaves the nearby window.
    return request(video, { priority: artPriority });
  }, [artVisible, artPriority, request, sessionPhase, thumb, video]);

  // On-screen cards use the high lane; near-view cards use a cancellable low
  // lane. A slot lasts only while the current candidate loads, and the last
  // successful image stays mounted underneath every fallback.
  useEffect(() => {
    // Queue ownership handles viewer pauses. Skipping the request here could
    // strand a newly mounted card after close, because no card state changes.
    if (!artAwake || thumbsExhausted || candidateReady || paintedSrc === activeThumb) {
      setArtAllowed(false);
      return;
    }
    let release: (() => void) | undefined;
    let cancelled = false;
    const controller = new AbortController();
    void acquireImageSlot({ priority: artPriority, signal: controller.signal }).then((done) => {
      if (!done) return;
      if (cancelled) {
        done();
        return;
      }
      release = done;
      imageSlotRelease.current = done;
      setArtAllowed(true);
    });
    return () => {
      cancelled = true;
      controller.abort();
      if (imageSlotRelease.current === release) imageSlotRelease.current = undefined;
      release?.();
      setArtAllowed(false);
    };
  }, [activeThumb, artPriority, artAwake, candidateReady, paintedSrc, thumbsExhausted, video.id]);

  useEffect(() => {
    setCandidateReady(false);
  }, [activeThumb]);

  useEffect(() => {
    if (artAwake) return;
    setPaintedSrc(undefined);
    setCandidateReady(false);
  }, [artAwake]);

  // Stuck CDN loads: advance fallback instead of sitting on a blank forever.
  useEffect(() => {
    if (!artAwake || !artAllowed || !activeThumb || showPreview || candidateReady) return;
    if (paintedSrc === activeThumb) return;
    const timer = window.setTimeout(() => {
      markAdultThumbFailed(activeThumb, adult ? video.id : undefined);
      releaseImageSlot();
      advanceThumb();
    }, THUMB_LOAD_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
    // advanceThumb closes over thumbCandidates; thumbIndex drives activeThumb.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThumb, artAllowed, artAwake, candidateReady, paintedSrc, showPreview, thumbIndex]);

  useEffect(() => { setRating(getRating(video.id)); }, [video.id]);
  useEffect(() => { setTextFirst(document.documentElement.dataset.artworkMode === "text"); }, []);
  useEffect(() => registerMountedCard(), []);
  useEffect(() => {
    if (!failed || video.remote || artworkRepairRequested.has(video.folderId)) return;
    artworkRepairRequested.add(video.folderId);
    // A stale local file handle is a common cause of missing artwork. If the
    // source remains approved, refresh its index once in the background and
    // retry the specific card afterwards; otherwise leave the visible retry.
    void repairArtworkSource(video.folderId).then((rescanned) => {
      if (rescanned) retry(video);
    });
  }, [failed, repairArtworkSource, retry, video]);
  const rate = (value: number) => {
    measureInteraction("rating");
    setRating(value);
    // Keep the card responsive; the persisted feedback write is coalesced by
    // media-feedback so a quick sequence of ratings does not stall the rail.
    window.requestAnimationFrame(() => setMediaRating(video.id, value));
  };
  const repairRemoteArtwork = () => {
    if (!video.remote || (video.remote.kind !== "youtube" && video.remote.kind !== "twitch") || remoteArtworkRepairRequested.has(video.folderId)) return;
    remoteArtworkRepairRequested.add(video.folderId);
    // A signed/expired provider thumbnail is repaired by refreshing only this
    // creator. The catalog merge is additive, so healthy sibling cards keep
    // their existing artwork and never flicker out of the shelf.
    const query = video.remote.channelId ?? video.folderId.replace(/^(?:yt|tw):/, "");
    void followRemoteQuery(query, video.remote.kind).catch(() => undefined);
  };

  // Functional state updaters can run during React rendering. Trigger the
  // source/store repair after commit, never from the thumbnail-index updater.
  useEffect(() => {
    if (thumbsExhausted && thumbIndex > 0) repairRemoteArtwork();
  }, [thumbsExhausted, thumbIndex, followRemoteQuery, video.folderId, video.remote?.kind, video.remote?.channelId]);

  const poster = (
    <div
      className={cn(
        "relative overflow-hidden bg-elevated",
        variant === "list" && "h-16 w-28 shrink-0 rounded-sm",
        variant === "poster" && "aspect-poster w-full rounded-md",
        (variant === "grid" || variant === "rail") && "aspect-video w-full rounded-md",
      )}
    >
      <div aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface text-muted">
        {failed || thumbsExhausted ? <ImageOff className="size-8" strokeWidth={1.5} /> : <LoaderCircle className="size-7 animate-spin text-accent" strokeWidth={1.75} />}
        <span className="text-xs">{failed || thumbsExhausted ? "Artwork unavailable" : "Loading preview"}</span>
      </div>
      {/* Hold last good paint under the candidate so fallbacks never flash blank. */}
      {paintedSrc && artAwake && !textFirst && (paintedSrc !== activeThumb || showPreview) && (
        <img
          src={paintedSrc}
          alt=""
          aria-hidden
          decoding="async"
          referrerPolicy={imageReferrerPolicy}
          className="absolute inset-0 size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
        />
      )}
      {/* Once decoded, keep the active image mounted after its scheduling slot
          is released. Unmounting it immediately forced a second decode of the
          same CDN asset and caused the visible Adult-card flash. */}
      {!textFirst && artAwake && (artAllowed || candidateReady || paintedSrc === activeThumb) && !thumbsExhausted && (showPreview ? preview : activeThumb) ? (
        <img
          key={`${video.id}:${resolvedThumbIndex}:${showPreview ? "p" : "a"}`}
          // Intersection + slot admission already provide lazy loading. Native
          // lazy loading could hold a slot for an image it had not requested.
          loading="eager"
          decoding="async"
          fetchPriority={index <= 3 && artPriority === "high" ? "high" : "auto"}
          referrerPolicy={imageReferrerPolicy}
          src={showPreview ? preview! : activeThumb!}
          alt=""
          onLoad={(event) => {
            if (showPreview) return;
            const img = event.currentTarget;
            const url = activeThumb;
            if (!url) return;
            if (!isDecodedAdultThumbLikelyReal(img)) {
              markAdultThumbFailed(url, adult ? video.id : undefined);
              releaseImageSlot();
              advanceThumb();
              return;
            }
            markAdultThumbGood(url, adult ? video.id : undefined);
            setPaintedSrc(url);
            setCandidateReady(true);
            releaseImageSlot();
            if (video.remote && /^https:\/\//i.test(url)) {
              void mirrorRemotePosterToCompanion(video.id, url);
            }
          }}
          onError={() => {
            if (showPreview) return;
            if (activeThumb) markAdultThumbFailed(activeThumb, adult ? video.id : undefined);
            releaseImageSlot();
            advanceThumb();
          }}
          className={cn(
            "relative size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10 transition-opacity duration-150",
            candidateReady || paintedSrc === activeThumb ? "opacity-100" : "opacity-0",
          )}
        />
      ) : !paintedSrc ? (
        <div className="absolute inset-0 outline outline-1 -outline-offset-1 outline-fg/10">
          {failed && !video.remote && <span title={artworkDiagnostic ? `${artworkDiagnostic.lastError} · attempt ${artworkDiagnostic.attempts}/3` : undefined} className="absolute bottom-2 left-2 right-2 rounded-xs bg-bg/80 px-2 py-1 text-center text-[11px] text-muted">Local artwork unavailable{artworkDiagnostic ? ` · ${artworkDiagnostic.attempts}/3` : ""}</span>}
        </div>
      ) : null}
      <div className="absolute inset-0 bg-linear-to-t from-bg/80 via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lift">
          <Play className="ml-0.5 size-4 fill-current" />
        </span>
      </div>
      {live && (
        <span className="absolute top-2 left-2 flex items-center gap-1.5 rounded-full border border-danger/40 bg-danger px-2.5 py-1 text-[11px] font-bold tracking-[0.12em] text-white uppercase shadow-lift">
          <span className="live-dot size-1.5 rounded-full bg-white shadow-[0_0_0_3px_rgb(255_255_255_/_0.2)]" />
          Live
        </span>
      )}
      {video.remote?.kind === "youtube" && !live && (
        <span className="absolute top-2 left-2 rounded-xs bg-bg/75 px-1.5 py-0.5 text-xs text-muted">
          YouTube
        </span>
      )}
      {video.remote?.kind === "twitch" && !live && (
        <span className="absolute top-2 left-2 rounded-xs bg-bg/75 px-1.5 py-0.5 text-xs text-muted">
          Twitch
        </span>
      )}
      {dualSource && (
        <span className="absolute top-2 left-2 rounded-xs bg-bg/80 px-1.5 py-0.5 text-xs text-accent">
          Reddit + Redgifs
        </span>
      )}
      {duration && !isPoster && !live ? (
        <span className="absolute right-2 bottom-2 rounded-xs bg-bg/75 px-1.5 py-0.5 font-mono text-xs tabular-nums text-fg">
          {formatTime(duration)}
        </span>
      ) : null}
      {isPoster && video.year ? (
        <span className="absolute bottom-2 left-2 font-mono text-xs tabular-nums text-fg/90">
          {video.year}
        </span>
      ) : null}
      {ratio > 0.02 && (
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-fg/20">
          <span
            className="block h-full bg-accent"
            style={{ width: `${Math.round(ratio * 100)}%` }}
          />
        </span>
      )}
    </div>
  );

  return (
    <div
      data-video-card
      className={cn("group relative", animate && "card-appear", isPoster && "poster-hit", live && "rounded-lg border border-border bg-surface p-2 shadow-border", className)}
    >
      <button
        ref={ref}
        data-video-card-open
        type="button"
        onMouseEnter={() => { setHovered(true); warmVideoPreview(); }}
        onFocus={warmVideoPreview}
        onPointerDown={warmVideoPreview}
        onMouseLeave={() => setHovered(false)}
        onClick={() => openPreview(video.id, video)}
        className={cn(
          "w-full text-left outline-none",
          variant === "list" && "flex items-center gap-3 rounded-lg p-2 hover:bg-elevated",
          variant === "grid" && "block",
          variant === "rail" && "block w-56 shrink-0",
          variant === "poster" && "block w-full",
        )}
      >
        {poster}
        <div className={cn("min-w-0", variant === "list" ? "flex-1" : "mt-2.5")}>
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 truncate text-sm font-medium text-fg">
              {titleOf(video)}
            </h3>
            {fav && variant !== "list" && (
              <Heart className="mt-0.5 size-3.5 shrink-0 fill-accent text-accent" />
            )}
          </div>
          <p className="mt-0.5 truncate text-xs text-muted">
            {playedAt ? (
              <>{formatAgo(playedAt)}</>
            ) : live ? (
              <>
                {video.remote?.channelName ?? "Twitch"}
                {hasFreshViewerCount(video.remote) ? (
                  <>
                    <span className="text-subtle"> · </span>
                    {video.remote?.viewers?.toLocaleString()} watching
                  </>
                ) : null}
              </>
            ) : video.remote ? (
              <>{video.remote.channelName ?? video.remote.kind}{video.remote.views ? <><span className="text-subtle"> · </span>{video.remote.views.toLocaleString()} views</> : null}{(video.remote.kind === "youtube" || (video.remote.kind === "twitch" && !live)) ? <><span className="text-subtle"> · </span>{video.addedAt > Date.UTC(2000, 0, 1) ? `Published ${publishedDateFormat.format(video.addedAt)}` : "Older catalog item"}</> : null}</>
            ) : video.year || video.genre ? (
              <>
                {video.year ?? video.extension.toUpperCase()}
                {video.genre && (
                  <>
                    <span className="text-subtle"> · </span>
                    {video.genre}
                  </>
                )}
              </>
            ) : (
              <>
                {video.extension.toUpperCase()}
                <span className="text-subtle"> · </span>
                {formatBytes(video.size)}
                {!playable && (
                  <>
                    <span className="text-subtle"> · </span>
                    <span>May not play</span>
                  </>
                )}
              </>
            )}
          </p>
          {rating > 0 && <p className="mt-1 flex items-center gap-1 text-xs text-accent"><Star className="size-3 fill-current" /> Your rating {rating}/5</p>}
          {viewCount > 0 && <p className="mt-1 text-xs text-subtle">Watched {viewCount} time{viewCount === 1 ? "" : "s"}</p>}
          {adult && cameCount > 0 && <p className="mt-1 text-xs text-accent">I cummed to it · {cameCount}×</p>}
          {(category || tags.length > 0) && variant !== "list" && variant !== "rail" && (
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-subtle">
              <Tag className="size-3 shrink-0" />
              {[category, ...tags.slice(0, 6)].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        {variant === "list" && (
          <span className="hidden max-w-xs truncate text-xs text-subtle sm:block">
            {video.path}
          </span>
        )}
      </button>
      {tags.length > 0 && variant !== "list" && variant !== "rail" && (
        <div className="mt-1 flex flex-wrap gap-1" aria-label="Tags">
          {tags.slice(0, 4).map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                const onAdultDesk = sourceId === "adults" || sourceId === "adult-fetishes";
                if (adult || onAdultDesk) {
                  // Keep Adults browsing mounted: global search blanks selectVisible
                  // while the index builds and hid the Adult shelves for 1-video tags.
                  setQuery("");
                  setSource("adults");
                  window.dispatchEvent(new CustomEvent("reelcase:adult-tag", { detail: { tag } }));
                } else {
                  setQuery(tag);
                }
              }}
              className="rounded-sm bg-elevated px-1.5 py-0.5 text-[10px] text-subtle transition-colors hover:bg-border hover:text-fg"
              title={`Show titles tagged ${tag}`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
      {failed && <button type="button" aria-label={`Retry artwork for ${video.name}`} onClick={(event) => { event.stopPropagation(); retry(video); }} className="absolute bottom-2 right-2 flex size-8 items-center justify-center rounded-sm bg-bg/75 text-fg opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"><RefreshCw className="size-3.5" /></button>}
      {!live && <button
        type="button"
        aria-label={fav ? "Remove from favorites" : "Add to favorites"}
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(video.id);
        }}
        className={cn(
          "absolute top-2 right-2 flex size-9 items-center justify-center rounded-sm bg-bg/55 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100",
          fav && "opacity-100",
          variant === "list" && "top-3 right-3",
        )}
      >
        <Heart className={cn("size-3.5", fav && "fill-accent text-accent")} />
      </button>}
      <button type="button" aria-label={`Hide ${video.name} from your library`} title="Hide this title everywhere until restored in Settings" onClick={(event) => { event.stopPropagation(); hideVideo(video.id); toast.message("Title hidden. Restore it from Settings → Hidden titles."); }} className="absolute top-2 left-2 flex size-9 items-center justify-center rounded-sm bg-bg/75 text-fg opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"><EyeOff className="size-3.5" /></button>
      <button
        type="button"
        aria-label={`Watch ${video.name} together`}
        onClick={(event) => {
          event.stopPropagation();
          localStorage.setItem("reelcase.watch-room.pending-video", video.id);
          setSource("watch-room");
        }}
        className={cn(
          "absolute bottom-2 left-2 flex min-h-9 items-center gap-1 rounded-sm bg-bg/75 px-2 text-xs text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100",
          variant === "list" && "bottom-3 left-auto right-3",
        )}
      >
        <Users className="size-3.5" /> Together
      </button>
      {!live && <button
        type="button"
        aria-label={liked ? "Remove like" : "Like"}
        onClick={(event) => {
          event.stopPropagation();
          toggleLike(video.id);
        }}
        className={cn(
          "absolute top-11 right-2 flex size-9 items-center justify-center rounded-sm bg-bg/55 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100",
          liked && "opacity-100",
          variant === "list" && "top-12 right-3",
        )}
      >
        <ThumbsUp className={cn("size-3.5", liked && "fill-accent text-accent")} />
      </button>}
      {adult && <button
        type="button"
        aria-label="I cummed to it"
        onClick={(event) => {
          event.stopPropagation();
          markCame(video.id);
        }}
        className={cn(
          "absolute top-20 right-2 flex min-h-9 items-center gap-1 rounded-sm bg-bg/55 px-1.5 text-[10px] text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100",
          cameCount > 0 && "opacity-100 text-accent",
          variant === "list" && "top-[4.75rem] right-3",
        )}
      >
        <Flame className={cn("size-3.5", cameCount > 0 && "fill-accent text-accent")} />
        {cameCount > 0 ? cameCount : ""}
      </button>}
      {adult && <button
        type="button"
        aria-label={hiddenAdult ? "Show this Adult title in rails" : "Hide this Adult title from rails"}
        title={hiddenAdult ? "Remove #hidden and show in Adult rails" : "Add #hidden and remove from Adult rails"}
        onClick={(event) => {
          event.stopPropagation();
          setVideoTags(video.id, hiddenAdult ? tags.filter((tag) => tag !== "hidden") : [...tags, "hidden"]);
          toast.message(hiddenAdult ? "Removed #hidden — title is visible again." : "Added #hidden — title is removed from Adult rails.");
        }}
        className={cn(
          "absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-sm bg-bg/75 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100",
          hiddenAdult && "opacity-100 text-accent",
          failed && "bottom-11",
          variant === "list" && "bottom-3 right-3",
        )}
      >
        {hiddenAdult ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
      </button>}
      {adultPhoto && <button
        type="button"
        aria-label="Download photo"
        title="Download photo to this device"
        onClick={(event) => {
          event.stopPropagation();
          void downloadAdultPhoto(video).then((result) => {
            if (result.ok) toast.success(`Saved ${result.name}`);
            else if (result.error !== "Save cancelled.") toast.error(result.error);
          });
        }}
        className={cn(
          "absolute top-[7.25rem] right-2 flex size-9 items-center justify-center rounded-sm bg-bg/55 text-fg opacity-0 backdrop-blur-sm transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100",
          variant === "list" && "top-[6.5rem] right-3",
        )}
      >
        <Download className="size-3.5" />
      </button>}
      {live && (
        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <span className="text-[11px] text-muted">Save this stream</span>
          <div className="flex items-center gap-1">
            <button type="button" aria-label={fav ? "Remove from favorites" : "Add to favorites"} onClick={(event) => { event.stopPropagation(); toggleFavorite(video.id); }} className={cn("flex min-h-8 items-center gap-1 rounded-sm px-2 text-xs transition-colors hover:bg-elevated", fav && "bg-accent/15 text-accent")}><Heart className={cn("size-3.5", fav && "fill-current")} />{fav ? "Saved" : "Save"}</button>
            <button type="button" aria-label={liked ? "Remove like" : "Like"} onClick={(event) => { event.stopPropagation(); toggleLike(video.id); }} className={cn("flex min-h-8 items-center gap-1 rounded-sm px-2 text-xs transition-colors hover:bg-elevated", liked && "bg-accent/15 text-accent")}><ThumbsUp className={cn("size-3.5", liked && "fill-current")} />{liked ? "Liked" : "Like"}</button>
          </div>
        </div>
      )}
      {!live && <div className="absolute right-2 bottom-2 hidden items-center gap-0.5 rounded-sm bg-bg/75 p-1 text-accent backdrop-blur-sm group-hover:flex group-focus-within:flex">
        {[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" aria-label={`Rate ${video.name} ${value} stars`} onClick={(event) => { event.stopPropagation(); rate(value); }} className={cn("p-0.5", value <= rating && "text-fg")}><Star className={cn("size-3", value <= rating && "fill-current")} /></button>)}
      </div>}
    </div>
  );
});
