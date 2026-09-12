import { memo, useEffect, useRef, useState } from "react";
import { Heart, Play, Tag, ThumbsUp, RefreshCw, Star, Users } from "lucide-react";
import { cn, formatAgo, formatBytes, formatTime } from "@/lib/utils";
import type { LibraryVideo } from "@/lib/videos/types";
import { hasFreshViewerCount, isLikelyPlayable, titleOf } from "@/lib/videos/types";
import { useThumbs } from "@/lib/videos/thumbs";
import { useLibrary } from "@/lib/videos/store";
import { getRating, setRating as setMediaRating } from "@/lib/media-feedback";
import { registerMountedCard } from "@/lib/render-budget";
import { measureInteraction } from "@/lib/interaction-budget";

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
}: {
  video: LibraryVideo;
  variant?: Variant;
  index?: number;
  playedAt?: number;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const thumb = useThumbs((s) => s.byId[video.id]);
  const failed = useThumbs((s) => s.failed[video.id]);
  const capturedDur = useThumbs((s) => s.durations[video.id]);
  const request = useThumbs((s) => s.request);
  const retry = useThumbs((s) => s.retry);
  const artworkDiagnostic = useThumbs((s) => s.diagnostics[video.id]);
  const repairArtworkSource = useLibrary((s) => s.repairArtworkSource);
  const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
  const progress = useLibrary((s) => s.progress[video.id]);
  const fav = useLibrary((s) => Boolean(s.favorites[video.id]));
  const liked = useLibrary((s) => Boolean(s.likes[video.id]));
  const tags = useLibrary((s) => s.tags[video.id] ?? EMPTY_TAGS);
  const category = useLibrary((s) => s.categories[video.id] ?? "");
  const viewCount = useLibrary((s) => s.viewCounts[video.id] ?? 0);
  const toggleLike = useLibrary((s) => s.toggleLike);
  const openPreview = useLibrary((s) => s.openPreview);
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);
  const setSource = useLibrary((s) => s.setSource);
  const duration = capturedDur ?? video.duration;
  const ratio = progress && progress.d > 0 ? Math.min(1, progress.t / progress.d) : 0;
  const playable = isLikelyPlayable(video.extension);
  const youtubeId = video.remote?.kind === "youtube" ? video.remote.videoId ?? video.remote.embedUrl?.match(/(?:embed\/|v=)([A-Za-z0-9_-]{11})/)?.[1] : undefined;
  const youtubeFallback = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : undefined;
  const providerArt = video.poster || youtubeFallback || video.remote?.previewUrl;
  // Provider artwork is already the authoritative thumbnail. Never route it
  // through the local video-frame worker, which cannot decode cross-origin
  // embeds and was incorrectly marking good remote cards as unavailable.
  const art = variant === "poster" ? providerArt || thumb : thumb || providerArt;
  const isPoster = variant === "poster";
  const live = Boolean(video.remote?.live);
  const preview = video.remote?.previewUrl;
  const [hovered, setHovered] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [textFirst, setTextFirst] = useState(false);
  const [rating, setRating] = useState(0);


  useEffect(() => {
    const el = ref.current;
    if (!el || video.remote) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) request(video);
      },
      { rootMargin: "160px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [request, video]);
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

  const poster = (
    <div
      className={cn(
        "relative overflow-hidden bg-elevated",
        variant === "list" && "h-16 w-28 shrink-0 rounded-sm",
        variant === "poster" && "aspect-poster w-full rounded-md",
        (variant === "grid" || variant === "rail") && "aspect-video w-full rounded-md",
      )}
    >
      {!textFirst && (imageFailed && youtubeFallback ? youtubeFallback : art) ? (
        <img
          loading="lazy"
          decoding="async"
          src={imageFailed && youtubeFallback ? youtubeFallback : hovered && preview ? preview : art}
          alt=""
          onError={() => { setImageFailed(true); repairRemoteArtwork(); }}
          className="size-full object-cover outline outline-1 -outline-offset-1 outline-fg/10"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-elevated outline outline-1 -outline-offset-1 outline-fg/10">
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full bg-bg/40 text-muted",
              !failed && "animate-pulse",
            )}
          >
            <Play className="ml-0.5 size-4 fill-current" />
          </span>
          {failed && !video.remote && <span title={artworkDiagnostic ? `${artworkDiagnostic.lastError} · attempt ${artworkDiagnostic.attempts}/3` : undefined} className="absolute bottom-2 left-2 right-2 rounded-xs bg-bg/80 px-2 py-1 text-center text-[11px] text-muted">Local artwork unavailable{artworkDiagnostic ? ` · ${artworkDiagnostic.attempts}/3` : ""}</span>}
        </div>
      )}
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
      className={cn("stagger-in group relative", isPoster && "poster-hit", live && "rounded-lg border border-border bg-surface p-2 shadow-border", className)}
      style={{ ["--stagger-i" as string]: Math.min(index, 16) }}
    >
      <button
        ref={ref}
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => openPreview(video.id)}
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
              <>{video.remote.channelName ?? video.remote.kind}{video.remote.views ? <><span className="text-subtle"> · </span>{video.remote.views.toLocaleString()} views</> : null}{(video.remote.kind === "youtube" || (video.remote.kind === "twitch" && !live)) ? <><span className="text-subtle"> · </span>{video.addedAt > Date.UTC(2000, 0, 1) ? `Published ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(video.addedAt)}` : "Older catalog item"}</> : null}</>
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
          {(category || tags.length > 0) && variant !== "list" && (
            <p className="mt-1 flex items-center gap-1 truncate text-xs text-subtle">
              <Tag className="size-3 shrink-0" />
              {[category, ...tags].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        {variant === "list" && (
          <span className="hidden max-w-xs truncate text-xs text-subtle sm:block">
            {video.path}
          </span>
        )}
      </button>
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
