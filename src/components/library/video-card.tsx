import { useEffect, useRef, useState } from "react";
import { Heart, Play, Tag, ThumbsUp } from "lucide-react";
import { cn, formatAgo, formatBytes, formatTime } from "@/lib/utils";
import type { LibraryVideo } from "@/lib/videos/types";
import { isLikelyPlayable, titleOf } from "@/lib/videos/types";
import { useThumbs } from "@/lib/videos/thumbs";
import { useLibrary } from "@/lib/videos/store";

type Variant = "grid" | "list" | "rail" | "poster";
const EMPTY_TAGS: string[] = [];

export function VideoCard({
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
  const progress = useLibrary((s) => s.progress[video.id]);
  const fav = useLibrary((s) => Boolean(s.favorites[video.id]));
  const liked = useLibrary((s) => Boolean(s.likes[video.id]));
  const tags = useLibrary((s) => s.tags[video.id] ?? EMPTY_TAGS);
  const category = useLibrary((s) => s.categories[video.id] ?? "");
  const toggleLike = useLibrary((s) => s.toggleLike);
  const openVideo = useLibrary((s) => s.openVideo);
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);
  const duration = capturedDur ?? video.duration;
  const ratio = progress && progress.d > 0 ? Math.min(1, progress.t / progress.d) : 0;
  const playable = isLikelyPlayable(video.extension);
  const art = variant === "poster" ? video.poster || thumb : thumb || video.poster;
  const isPoster = variant === "poster";
  const live = Boolean(video.remote?.live);
  const preview = video.remote?.previewUrl;
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) request(video);
      },
      { rootMargin: "160px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [request, video]);

  const poster = (
    <div
      className={cn(
        "relative overflow-hidden bg-elevated",
        variant === "list" && "h-16 w-28 shrink-0 rounded-sm",
        variant === "poster" && "aspect-poster w-full rounded-md",
        (variant === "grid" || variant === "rail") && "aspect-video w-full rounded-md",
      )}
    >
      {art ? (
        <img
          src={hovered && preview ? preview : art}
          alt=""
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
        </div>
      )}
      <div className="absolute inset-0 bg-linear-to-t from-bg/80 via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
        <span className="flex size-11 items-center justify-center rounded-full bg-accent text-accent-fg shadow-lift">
          <Play className="ml-0.5 size-4 fill-current" />
        </span>
      </div>
      {live && (
        <span className="absolute top-2 left-2 flex items-center gap-1.5 rounded-xs bg-bg/80 px-1.5 py-0.5 text-xs font-medium tracking-wide text-fg uppercase">
          <span className="live-dot size-1.5 rounded-full bg-danger" />
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
      className={cn("stagger-in group relative", isPoster && "poster-hit", className)}
      style={{ ["--stagger-i" as string]: Math.min(index, 16) }}
    >
      <button
        ref={ref}
        type="button"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => openVideo(video.id)}
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
                {video.remote?.viewers ? (
                  <>
                    <span className="text-subtle"> · </span>
                    {video.remote.viewers.toLocaleString()} watching
                  </>
                ) : null}
              </>
            ) : video.remote ? (
              <>{video.remote.channelName ?? video.remote.kind}</>
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
      <button
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
      </button>
      <button
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
      </button>
    </div>
  );
}
