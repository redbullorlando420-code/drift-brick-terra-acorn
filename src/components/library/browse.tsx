import { Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./video-card";
import { cn } from "@/lib/utils";
import { titleOf, type LibraryVideo } from "@/lib/videos/types";
import { useLibrary } from "@/lib/videos/store";
import { useThumbs } from "@/lib/videos/thumbs";
import { useEffect, useState } from "react";

const RAIL_SIZES = [8, 16, 32, 48];
const GRID_SIZES = [24, 48, 96, 144];

function savedRenderBudget(key: string, allowed: number[], fallback: number) {
  if (typeof window === "undefined") return fallback;
  const value = Number(localStorage.getItem(key) ?? fallback);
  return allowed.includes(value) ? value : fallback;
}

export function Billboard({ video }: { video: LibraryVideo }) {
  const thumb = useThumbs((s) => s.byId[video.id]);
  const request = useThumbs((s) => s.request);
  const openVideo = useLibrary((s) => s.openVideo);
  const toggleFavorite = useLibrary((s) => s.toggleFavorite);
  const fav = useLibrary((s) => Boolean(s.favorites[video.id]));
  const art = thumb || video.poster;

  useEffect(() => {
    request(video);
  }, [request, video]);

  return (
    <section className="relative mb-8 overflow-hidden rounded-xl bg-elevated shadow-border">
      <div className="relative aspect-video max-h-[min(72vh,560px)] w-full min-h-64">
        {art ? (
          <img src={art} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-elevated" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-bg via-bg/40 to-bg/10" />
        <div className="absolute inset-0 bg-linear-to-r from-bg/80 via-bg/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-5 py-5 sm:max-w-xl sm:px-8 sm:py-8">
          {video.genre || video.year ? (
            <p className="text-xs font-medium tracking-wide text-accent uppercase">
              {video.genre ?? "Featured"}
              {video.year ? ` · ${video.year}` : ""}
            </p>
          ) : (
            <p className="text-xs font-medium tracking-wide text-accent uppercase">Featured</p>
          )}
          <h2 className="font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl">
            {titleOf(video)}
          </h2>
          {video.tagline && (
            <p className="max-w-md text-sm text-muted sm:text-base">{video.tagline}</p>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            <Button onClick={() => openVideo(video.id)}>
              <Play className="size-4 fill-current" />
              Play
            </Button>
            <Button variant="secondary" onClick={() => toggleFavorite(video.id)}>
              <Heart className={cn("size-4", fav && "fill-accent text-accent")} />
              {fav ? "In My List" : "My List"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TitleRail({
  title,
  videos,
  variant = "poster",
  playedAt,
  onTitleClick,
}: {
  title: string;
  videos: LibraryVideo[];
  variant?: "poster" | "rail";
  playedAt?: Record<string, number>;
  onTitleClick?: () => void;
}) {
  const [limit, setLimit] = useState(() => savedRenderBudget("reelcase.home-rail-limit", RAIL_SIZES, 8));
  useEffect(() => {
    const sync = () => setLimit(savedRenderBudget("reelcase.home-rail-limit", RAIL_SIZES, 8));
    window.addEventListener("reelcase:render-settings", sync);
    return () => window.removeEventListener("reelcase:render-settings", sync);
  }, []);
  if (!videos.length) return null;
  const shown = videos.slice(0, limit);
  const endCaps = Math.max(0, Math.min(6, Math.min(limit, 8) - shown.length));
  return (
    <section className="media-shelf mb-8">
      <div className="mb-3 flex items-center justify-between gap-3">
        {onTitleClick ? <button type="button" onClick={onTitleClick} className="block min-w-0 truncate font-display text-xl text-fg hover:text-accent sm:text-2xl">{title} <span className="text-sm text-muted">Open source →</span></button> : <h2 className="min-w-0 truncate font-display text-xl text-fg sm:text-2xl">{title}</h2>}
        {videos.length > limit && <Button size="sm" variant="ghost" className="shrink-0 text-xs" onClick={() => setLimit((value) => Math.min(videos.length, value + 16))}>Show 16 more · {videos.length - limit}</Button>}
      </div>
      <div className="rail-scroll flex gap-3 overflow-x-auto pb-3 sm:gap-4">
        {shown.map((video, i) => (
          <div
            key={video.id}
            className={cn(variant === "poster" && "w-32 shrink-0 sm:w-36 md:w-40", variant === "rail" && "shrink-0")}
          >
            <VideoCard
              video={video}
              variant={variant}
              index={i}
              playedAt={playedAt?.[video.id]}
            />
          </div>
        ))}
        {Array.from({ length: endCaps }, (_, index) => (
          <div key={`end-cap-${index}`} aria-hidden="true" className={cn("shrink-0 rounded-md border border-border/50 bg-elevated/35", variant === "poster" ? "aspect-poster w-32 sm:w-36 md:w-40" : "h-36 w-56")} />
        ))}
      </div>
    </section>
  );
}

export function PosterGrid({ videos }: { videos: LibraryVideo[] }) {
  const [pageSize, setPageSize] = useState(() => savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 48));
  useEffect(() => {
    const sync = () => setPageSize(savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 48));
    window.addEventListener("reelcase:render-settings", sync);
    return () => window.removeEventListener("reelcase:render-settings", sync);
  }, []);
  const safePageSize = pageSize;
  const [limit, setLimit] = useState(safePageSize);
  // Selectors may return an equivalent new array after catalog metadata
  // changes. Reset only when the displayed catalog size or chosen page budget
  // actually changes, otherwise a grid can feed its own state update loop.
  useEffect(() => setLimit(safePageSize), [safePageSize, videos.length]);
  if (!videos.length) return null;
  return (
    <>
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
      {videos.slice(0, limit).map((video, i) => (
        <VideoCard key={video.id} video={video} variant="poster" index={i} className="w-full" />
      ))}
    </div>
    {videos.length > limit && <div className="mt-5 flex items-center justify-between gap-3"><p className="text-xs text-muted">Page {Math.ceil(limit / safePageSize)} · showing {limit.toLocaleString()} of {videos.length.toLocaleString()} titles</p><Button variant="secondary" onClick={() => setLimit((value) => Math.min(value + safePageSize, videos.length))}>Next page · {safePageSize}</Button></div>}
    </>
  );
}
