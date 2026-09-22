import { ChevronDown, ChevronRight, Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./video-card";
import { cn } from "@/lib/utils";
import { titleOf, type LibraryVideo } from "@/lib/videos/types";
import { useLibrary } from "@/lib/videos/store";
import { useThumbs } from "@/lib/videos/thumbs";
import { adultThumbCandidatesForVideo } from "@/lib/videos/adult-thumbs";
import { markFirstShelf } from "@/lib/first-shelf-trace";
import { railKeyboardTarget, railLimitForTarget, railWindow, railWindowStartForTarget } from "@/lib/virtual-rail";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";

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
  const pendingFocus = useRef<number | undefined>(undefined);
  const attachRail = useCallback((rail: HTMLDivElement | null) => { railRef.current = rail; if (rail) rail.scrollLeft = scrollLeft.current; }, []);
  const leaveTimer = useRef<number | undefined>(undefined);
  const [nearViewport, setNearViewport] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [shelfHeight, setShelfHeight] = useState<number>();
  const [railWidth, setRailWidth] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  const [focusRequest, setFocusRequest] = useState(0);
  // Approximate card stride (width + gap). Used only for horizontal windowing.
  const cardStride = variant === "poster" ? 148 : 236;
  const overscan = 1;
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
      leaveTimer.current = window.setTimeout(() => setNearViewport(false), 900);
    }, { rootMargin: "240px 0px" });
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
  useEffect(() => {
    const target = pendingFocus.current;
    const rail = railRef.current;
    if (target === undefined || !rail || !nearViewport) return;
    const trigger = rail.querySelector<HTMLButtonElement>(`[data-rail-index="${target}"] [data-video-card-open]`);
    if (!trigger) return;
    pendingFocus.current = undefined;
    const centeredLeft = Math.max(0, target * cardStride - Math.max(0, (rail.clientWidth - cardStride) / 2));
    scrollLeft.current = centeredLeft;
    rail.scrollLeft = centeredLeft;
    trigger.focus({ preventScroll: true });
  }, [cardStride, focusRequest, limit, nearViewport, railWidth, windowStart]);
  useEffect(() => { if (nearViewport && videos.length) markFirstShelf(title, Math.min(videos.length, limit)); }, [nearViewport, limit, title, videos.length]);
  if (!videos.length) return null;
  const shown = videos.slice(0, limit);
  const { start, end, visibleSlots } = railWindow(shown.length, railWidth || 320, cardStride, windowStart, overscan);
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
  const focusRailIndex = (target: number) => {
    if (target < 0 || target >= videos.length) return;
    pendingFocus.current = target;
    setFocusRequest((value) => value + 1);
    setLimit((value) => railLimitForTarget(value, target, videos.length));
    setWindowStart(railWindowStartForTarget(target, Math.max(shown.length, target + 1), visibleSlots, overscan));
  };
  const onRailKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const trigger = event.target instanceof Element ? event.target.closest<HTMLButtonElement>("[data-video-card-open]") : null;
    const card = trigger?.closest<HTMLElement>("[data-rail-index]");
    const index = Number(card?.dataset.railIndex);
    if (!Number.isInteger(index)) return;
    event.preventDefault();
    const target = railKeyboardTarget(event.key, index, videos.length);
    if (target !== null) focusRailIndex(target);
  };
  return (
    <section ref={shelfRef} className="media-shelf mb-8 min-w-0" style={!nearViewport ? { minHeight: shelfHeight ?? (variant === "poster" ? 320 : 250) } : undefined}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1 basis-48">{onTitleClick ? <button type="button" onClick={onTitleClick} className="block min-w-0 truncate font-display text-xl text-fg hover:text-accent sm:text-2xl">{title} <span className="text-sm text-muted">Open source →</span></button> : <h2 className="min-w-0 truncate font-display text-xl text-fg sm:text-2xl">{title}</h2>}{reason && <p className="mt-1 truncate text-xs text-muted">{reason}</p>}</div>
        <div className="flex shrink-0 items-center gap-1">{videos.length > limit && !collapsed && <Button size="sm" variant="ghost" className="text-xs" onClick={() => setLimit((value) => Math.min(videos.length, value + 16))}>Show 16 more · {videos.length - limit}</Button>}<Button size="sm" variant="ghost" aria-expanded={!collapsed} aria-label={`${collapsed ? "Expand" : "Minimize"} ${title}`} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronRight className="size-4"/> : <ChevronDown className="size-4"/>}{collapsed ? "Expand" : "Minimize"}</Button></div>
      </div>
      {nearViewport && !collapsed && <div ref={attachRail} onScroll={(event) => onRailScroll(event.currentTarget)} onKeyDown={onRailKeyDown} className="rail-scroll flex gap-3 overflow-x-auto pb-3 sm:gap-4">
        {leadPx > 0 && <div aria-hidden="true" className="shrink-0" style={{ width: leadPx, height: 1 }} />}
        {start > 0 && <button type="button" className="sr-only focus:not-sr-only focus:rounded-sm focus:bg-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-fg" onFocus={() => focusRailIndex(start - 1)}>Previous {title} title</button>}
        {windowed.map((video, i) => (
          <div
            key={video.id}
            data-rail-index={start + i}
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
        {end < videos.length && <button type="button" className="sr-only focus:not-sr-only focus:rounded-sm focus:bg-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-fg" onFocus={() => focusRailIndex(end)}>Next {title} title</button>}
        {trailPx > 0 && <div aria-hidden="true" className="shrink-0" style={{ width: trailPx, height: 1 }} />}
        {Array.from({ length: endCaps }, (_, index) => (
          <div key={`end-cap-${index}`} aria-hidden="true" className={cn("shrink-0 rounded-md border border-border/50 bg-elevated/35", variant === "poster" ? "aspect-poster w-32 sm:w-36 md:w-40" : "h-36 w-56")} />
        ))}
      </div>}
    </section>
  );
}

// Each row owns its visibility and measured placeholder. Scrolling does not
// rerender the catalog or retain image subscriptions for previously read pages.
function PosterRow({ videos, start, estimate }: { videos: LibraryVideo[]; start: number; estimate: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const intersecting = useRef(false);
  const [visible, setVisible] = useState(false);
  const [height, setHeight] = useState(estimate);
  useEffect(() => setHeight(estimate), [estimate]);
  useEffect(() => {
    const row = ref.current;
    if (!row) return;
    if (typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      intersecting.current = entry.isIntersecting;
      setVisible(entry.isIntersecting || row.contains(document.activeElement));
    }, { rootMargin: "180px 0px" });
    observer.observe(row);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const row = ref.current;
    if (!row || !visible) return;
    const observer = new ResizeObserver(() => setHeight(Math.ceil(row.getBoundingClientRect().height)));
    observer.observe(row);
    return () => observer.disconnect();
  }, [visible]);
  return <div ref={ref} data-poster-row role="group" aria-label={`Titles ${start + 1}–${start + videos.length}`}
    tabIndex={visible ? -1 : 0} onFocus={() => setVisible(true)}
    onBlur={(event) => { if (!intersecting.current && !event.currentTarget.contains(event.relatedTarget)) setVisible(false); }}
    className="col-span-full grid grid-cols-subgrid gap-3 sm:gap-4" style={!visible ? { height } : undefined}>
    {visible && videos.map((video, i) => <VideoCard key={video.id} video={video} variant="poster" index={start + i} className="w-full" />)}
  </div>;
}

export function PosterGrid({ videos }: { videos: LibraryVideo[] }) {
  const gridRef = useRef<HTMLElement>(null);
  const layoutRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ columns: 3, estimate: 260 });
  const leaveTimer = useRef<number | undefined>(undefined);
  const [nearViewport, setNearViewport] = useState(false);
  const [gridHeight, setGridHeight] = useState<number>();
  const [pageSize, setPageSize] = useState(() => savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 24));
  useEffect(() => {
    const sync = () => setPageSize(savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 24));
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
      leaveTimer.current = window.setTimeout(() => setNearViewport(false), 900);
    }, { rootMargin: "320px 0px" });
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
  useEffect(() => {
    const grid = layoutRef.current;
    if (!grid) return;
    const sync = () => {
      const style = getComputedStyle(grid);
      const columns = style.gridTemplateColumns.split(" ").length;
      const gap = parseFloat(style.columnGap) || 12;
      const estimate = Math.ceil((grid.clientWidth - gap * (columns - 1)) / columns * (9 / 16) + 80);
      setLayout((old) => old.columns === columns && old.estimate === estimate ? old : { columns, estimate });
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [nearViewport]);
  if (!videos.length) return null;
  const visible = videos.slice(0, limit);
  const rows = Array.from({ length: Math.ceil(visible.length / layout.columns) }, (_, row) => row * layout.columns);
  return (
    <section ref={gridRef} className="media-shelf" style={!nearViewport ? { minHeight: gridHeight ?? 900 } : undefined}>
      {nearViewport && <>
        <div ref={layoutRef} className="grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {rows.map((start) => <PosterRow key={`${layout.columns}:${start}`} start={start} videos={visible.slice(start, start + layout.columns)} estimate={layout.estimate} />)}
        </div>
        {videos.length > limit && <div className="mt-5 flex items-center justify-between gap-3"><p className="text-xs text-muted">Page {Math.ceil(limit / safePageSize)} · showing {limit.toLocaleString()} of {videos.length.toLocaleString()} titles</p><Button variant="secondary" onClick={() => setLimit((value) => Math.min(value + safePageSize, videos.length))}>Next page · {safePageSize}</Button></div>}
      </>}
    </section>
  );
}
