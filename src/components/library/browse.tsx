import { ChevronDown, ChevronRight, Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./video-card";
import { cn } from "@/lib/utils";
import { titleOf, type LibraryVideo } from "@/lib/videos/types";
import { useLibrary } from "@/lib/videos/store";
import { useThumbs } from "@/lib/videos/thumbs";
import { adultThumbCandidatesForVideo } from "@/lib/videos/adult-thumbs";
import { markFirstShelf } from "@/lib/first-shelf-trace";
import { useEffect, useRef, useState } from "react";

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
  const [artIndex, setArtIndex] = useState(0);
  const artwork = [thumb, video.poster, video.remote?.previewUrl, ...adultThumbCandidatesForVideo(video)]
    .filter((url, index, all): url is string => Boolean(url) && all.indexOf(url) === index);
  const art = artwork[artIndex];

  useEffect(() => {
    request(video);
  }, [request, video]);
  useEffect(() => setArtIndex(0), [video.id]);

  return (
    <section className="relative mb-8 overflow-hidden rounded-xl bg-elevated shadow-border">
      <div className="relative aspect-video max-h-[min(72vh,560px)] w-full min-h-64">
        {art ? (
          <img src={art} alt="" decoding="async" referrerPolicy="no-referrer" onError={() => setArtIndex((index) => Math.min(index + 1, artwork.length))} className="absolute inset-0 size-full object-cover" />
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
  reason,
}: {
  title: string;
  videos: LibraryVideo[];
  variant?: "poster" | "rail";
  playedAt?: Record<string, number>;
  onTitleClick?: () => void;
  /** Human explanation for a recommendation shelf; never exposes provider tags. */
  reason?: string;
}) {
  const shelfRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const scrollLeft = useRef(0);
  const leaveTimer = useRef<number | undefined>(undefined);
  const [nearViewport, setNearViewport] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [shelfHeight, setShelfHeight] = useState<number>();
  const [railWidth, setRailWidth] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  // Approximate card stride (width + gap). Used only for horizontal windowing.
  const cardStride = variant === "poster" ? 148 : 236;
  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf || !videos.length) return;
    if (typeof IntersectionObserver === "undefined") { setNearViewport(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      const keep = entry.isIntersecting || shelf.contains(document.activeElement);
      if (keep) {
        if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
        leaveTimer.current = undefined;
        setNearViewport(true);
        return;
      }
      // Debounce unmount so bounce-scroll does not thrash card remounts / image decode.
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
      leaveTimer.current = window.setTimeout(() => setNearViewport(false), 1_200);
    }, { rootMargin: "480px 0px" });
    observer.observe(shelf);
    return () => {
      observer.disconnect();
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    };
  }, [Boolean(videos.length)]);
  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf || !nearViewport) return;
    const observer = new ResizeObserver(() => setShelfHeight(shelf.getBoundingClientRect().height));
    observer.observe(shelf);
    return () => observer.disconnect();
  }, [nearViewport]);
  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !nearViewport) return;
    const sync = () => setRailWidth(Math.max(320, Math.round(rail.clientWidth)));
    sync();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : undefined;
    observer?.observe(rail);
    return () => observer?.disconnect();
  }, [nearViewport, variant]);
  const [limit, setLimit] = useState(() => savedRenderBudget("reelcase.home-rail-limit", RAIL_SIZES, 8));
  useEffect(() => {
    const sync = () => setLimit(savedRenderBudget("reelcase.home-rail-limit", RAIL_SIZES, 8));
    window.addEventListener("reelcase:render-settings", sync);
    return () => window.removeEventListener("reelcase:render-settings", sync);
  }, []);
  useEffect(() => { if (nearViewport && videos.length) markFirstShelf(title, Math.min(videos.length, limit)); }, [nearViewport, limit, title, videos.length]);
  if (!videos.length) return null;
  const shown = videos.slice(0, limit);
  const overscan = 3;
  const visibleSlots = Math.max(6, Math.ceil((railWidth || 800) / cardStride) + overscan * 2);
  const maxStart = Math.max(0, shown.length - visibleSlots);
  const start = Math.max(0, Math.min(windowStart, maxStart));
  const end = Math.min(shown.length, start + visibleSlots);
  const windowed = shown.slice(start, end);
  const leadPx = start * cardStride;
  const trailCount = Math.max(0, shown.length - end);
  const trailPx = trailCount * cardStride;
  const endCaps = Math.max(0, Math.min(6, Math.min(limit, 8) - shown.length));
  const onRailScroll = (rail: HTMLDivElement) => {
    scrollLeft.current = rail.scrollLeft;
    const nextStart = Math.max(0, Math.floor(rail.scrollLeft / cardStride) - overscan);
    setWindowStart((current) => (current === nextStart ? current : nextStart));
    if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 160) {
      setLimit((value) => Math.min(videos.length, value + 16));
    }
  };
  return (
    <section ref={shelfRef} className="media-shelf mb-8" style={!nearViewport ? { minHeight: shelfHeight ?? (variant === "poster" ? 320 : 250) } : undefined}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">{onTitleClick ? <button type="button" onClick={onTitleClick} className="block min-w-0 truncate font-display text-xl text-fg hover:text-accent sm:text-2xl">{title} <span className="text-sm text-muted">Open source →</span></button> : <h2 className="min-w-0 truncate font-display text-xl text-fg sm:text-2xl">{title}</h2>}{reason && <p className="mt-1 truncate text-xs text-muted">{reason}</p>}</div>
        <div className="flex shrink-0 items-center gap-1">{videos.length > limit && !collapsed && <Button size="sm" variant="ghost" className="text-xs" onClick={() => setLimit((value) => Math.min(videos.length, value + 16))}>Show 16 more · {videos.length - limit}</Button>}<Button size="sm" variant="ghost" aria-expanded={!collapsed} aria-label={`${collapsed ? "Expand" : "Minimize"} ${title}`} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronRight className="size-4"/> : <ChevronDown className="size-4"/>}{collapsed ? "Expand" : "Minimize"}</Button></div>
      </div>
      {nearViewport && !collapsed && <div ref={(rail) => { railRef.current = rail; if (rail) rail.scrollLeft = scrollLeft.current; }} onScroll={(event) => onRailScroll(event.currentTarget)} className="rail-scroll flex gap-3 overflow-x-auto pb-3 sm:gap-4">
        {leadPx > 0 && <div aria-hidden="true" className="shrink-0" style={{ width: leadPx, height: 1 }} />}
        {windowed.map((video, i) => (
          <div
            key={video.id}
            className={cn(variant === "poster" && "w-32 shrink-0 sm:w-36 md:w-40", variant === "rail" && "shrink-0")}
          >
            <VideoCard
              video={video}
              variant={variant}
              index={start + i}
              playedAt={playedAt?.[video.id]}
            />
          </div>
        ))}
        {trailPx > 0 && <div aria-hidden="true" className="shrink-0" style={{ width: trailPx, height: 1 }} />}
        {Array.from({ length: endCaps }, (_, index) => (
          <div key={`end-cap-${index}`} aria-hidden="true" className={cn("shrink-0 rounded-md border border-border/50 bg-elevated/35", variant === "poster" ? "aspect-poster w-32 sm:w-36 md:w-40" : "h-36 w-56")} />
        ))}
      </div>}
    </section>
  );
}

export function PosterGrid({ videos }: { videos: LibraryVideo[] }) {
  const gridRef = useRef<HTMLElement>(null);
  const leaveTimer = useRef<number | undefined>(undefined);
  const [nearViewport, setNearViewport] = useState(false);
  const [gridHeight, setGridHeight] = useState<number>();
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
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !videos.length) return;
    if (typeof IntersectionObserver === "undefined") { setNearViewport(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      // Keep a focused card mounted for keyboard users, even when its shelf is
      // just outside the viewport. Debounce leave so scroll bounce is cheap.
      const keep = entry.isIntersecting || grid.contains(document.activeElement);
      if (keep) {
        if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
        leaveTimer.current = undefined;
        setNearViewport((current) => (current ? current : true));
        return;
      }
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
      leaveTimer.current = window.setTimeout(() => setNearViewport(false), 1_400);
    }, { rootMargin: "560px 0px" });
    observer.observe(grid);
    return () => {
      observer.disconnect();
      if (leaveTimer.current) window.clearTimeout(leaveTimer.current);
    };
  }, [videos.length]);
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || !nearViewport || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      const next = Math.round(grid.getBoundingClientRect().height);
      setGridHeight((current) => current === next ? current : next);
    });
    observer.observe(grid);
    return () => observer.disconnect();
  }, [nearViewport]);
  if (!videos.length) return null;
  const visible = videos.slice(0, limit);
  return (
    <section ref={gridRef} className="media-shelf" style={!nearViewport ? { minHeight: gridHeight ?? 900 } : undefined}>
      {nearViewport && <>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {visible.map((video, i) => (
            <VideoCard key={video.id} video={video} variant="poster" index={i} className="w-full" />
          ))}
        </div>
        {videos.length > limit && <div className="mt-5 flex items-center justify-between gap-3"><p className="text-xs text-muted">Page {Math.ceil(limit / safePageSize)} · showing {limit.toLocaleString()} of {videos.length.toLocaleString()} titles</p><Button variant="secondary" onClick={() => setLimit((value) => Math.min(value + safePageSize, videos.length))}>Next page · {safePageSize}</Button></div>}
      </>}
    </section>
  );
}
