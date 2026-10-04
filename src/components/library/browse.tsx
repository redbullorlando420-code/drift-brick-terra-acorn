import { ChevronDown, ChevronRight, Heart, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoCard } from "./video-card";
import { VirtualVideoGrid } from "./virtual-video-grid";
import { usePerformanceProfile } from './use-performance-profile';
import { cn } from "@/lib/utils";
import { titleOf, type LibraryVideo } from "@/lib/videos/types";
import { useLibrary } from "@/lib/videos/store";
import { useThumbs } from "@/lib/videos/thumbs";
import { adultThumbCandidatesForVideo } from "@/lib/videos/adult-thumbs";
import { getFirstShelfTrace, markFirstShelf, markFirstShelfArtwork } from "@/lib/first-shelf-trace";
import { watchShelfArtwork } from '@/lib/shelf-artwork';
import { getYoutubeFirstClickTrace, markYoutubeArtworkReady, markYoutubeRailReady } from "@/lib/youtube-first-click-trace";
import { railItems, railKeyboardTarget, railLimitForTarget, railWindowStartForTarget, windowBoundaryTarget } from "@/lib/virtual-rail";
import { createShelfRelease } from '@/lib/viewer-accessibility';
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
    return request(video, { priority: 'high' });
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
  priority = false,
}: {
  title: string;
  videos: LibraryVideo[];
  variant?: "poster" | "rail";
  playedAt?: Record<string, number>;
  onTitleClick?: () => void;
  /** Human explanation for a recommendation shelf; never exposes provider tags. */
  reason?: string;
  /** A primary rail can mount its small card window before it enters the viewport. */
  priority?: boolean;
}) {
  const shelfRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const scrollLeft = useRef(0);
  const pendingFocus = useRef<number | undefined>(undefined);
  const attachRail = useCallback((rail: HTMLDivElement | null) => {
    railRef.current = rail;
    if (!rail) return;
    rail.scrollLeft = scrollLeft.current;
    // Seed virtualization from the actual mount width so delayed shelves do
    // not briefly render (or remain at) the four-card fallback window.
    const width = Math.max(320, Math.round(rail.clientWidth));
    setRailWidth((current) => current === width ? current : width);
    const card = rail.querySelector<HTMLElement>('[data-rail-index]');
    if (card) setCardStride(card.getBoundingClientRect().width + (parseFloat(getComputedStyle(rail).columnGap) || 0));
  }, []);
  const release = useRef<ReturnType<typeof createShelfRelease> | null>(null);
  if (!release.current) release.current = createShelfRelease((callback, delay) => {
    const timer = window.setTimeout(callback, delay);
    return () => window.clearTimeout(timer);
  });
  const [nearViewport, setNearViewport] = useState(priority);
  const [collapsed, setCollapsed] = useState(false);
  const [shelfHeight, setShelfHeight] = useState<number>();
  const [railWidth, setRailWidth] = useState(0);
  const [windowStart, setWindowStart] = useState(0);
  const [focusRequest, setFocusRequest] = useState(0);
  const firstShelfOwner = useRef(false);
  const firstArtworkEpoch = useRef(0);
  // Use the rendered card width and gap: poster widths change at breakpoints.
  const [cardStride, setCardStride] = useState(variant === "poster" ? 148 : 236);
  const overscan = usePerformanceProfile().railOverscan;
  useEffect(() => {
    const shelf = shelfRef.current;
    if (!shelf || !videos.length) return;
    if (priority) { setNearViewport(true); return; }
    if (typeof IntersectionObserver === "undefined") { setNearViewport(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      const keep = entry.isIntersecting || shelf.contains(document.activeElement);
      if (keep) {
        release.current!.cancel();
        setNearViewport(true);
        return;
      }
      // Debounce unmount so bounce-scroll does not thrash card remounts / image decode.
      release.current!.defer(() => shelf.contains(document.activeElement), () => setNearViewport(false));
    }, { rootMargin: "240px 0px" });
    observer.observe(shelf);
    return () => {
      observer.disconnect();
      release.current!.cancel();
    };
  }, [priority, Boolean(videos.length)]);
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
    const sync = () => {
      setRailWidth(Math.max(320, Math.round(rail.clientWidth)));
      const card = rail.querySelector<HTMLElement>('[data-rail-index]');
      if (card) setCardStride(card.getBoundingClientRect().width + (parseFloat(getComputedStyle(rail).columnGap) || 0));
    };
    sync();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : undefined;
    observer?.observe(rail);
    return () => observer?.disconnect();
  // A shelf can render empty first, then receive its videos after the initial
  // effect has run. Reattach the observer when that happens so the virtual
  // window uses the real rail width instead of its narrow fallback width.
  }, [nearViewport, variant, Boolean(videos.length)]);
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
  useEffect(() => {
    const rail = railRef.current;
    if (!nearViewport || !videos.length || !rail) return;
    if (markFirstShelf(title, rail.querySelectorAll('[data-rail-index]').length)) firstShelfOwner.current = true;
    if (firstShelfOwner.current && getFirstShelfTrace().artwork === 'pending') {
      const epoch = ++firstArtworkEpoch.current;
      const stop = watchShelfArtwork(rail, markFirstShelfArtwork);
      return () => {
        stop();
        // Strict Mode can recreate this same owner before the microtask.
        // Actual departure records deferment instead of leaving a pending trace.
        queueMicrotask(() => { if (firstArtworkEpoch.current === epoch) markFirstShelfArtwork(false); });
      };
    }
  }, [nearViewport, limit, title, videos.length]);
  useEffect(() => {
    if (!priority || title !== "Latest uploads" || !nearViewport || !videos.length) return;
    const rail = railRef.current;
    const mountedCards = rail?.querySelectorAll("[data-rail-index]").length ?? 0;
    if (!rail || !mountedCards) return;
    markYoutubeRailReady(mountedCards);
    // React Strict Mode replays effects after cleanup; keep the artwork watch
    // alive even when the first pass already recorded the text-first rail.
    if (getYoutubeFirstClickTrace()?.artwork !== "pending" || getYoutubeFirstClickTrace()?.railReadyMs === undefined) return;
    return watchShelfArtwork(rail, markYoutubeArtworkReady);
  }, [priority, title, nearViewport, Boolean(videos.length), limit]);
  if (!videos.length) return null;
  const { start, end, visibleSlots, loaded, items: windowed } = railItems(videos, limit, railWidth || 320, cardStride, windowStart, overscan);
  const leadPx = start * cardStride;
  const trailCount = Math.max(0, loaded - end);
  const trailPx = trailCount * cardStride;
  const endCaps = Math.max(0, Math.min(6, Math.min(limit, 8) - loaded));
  const onRailScroll = (rail: HTMLDivElement) => {
    scrollLeft.current = rail.scrollLeft;
    const nextStart = Math.max(0, Math.floor(rail.scrollLeft / cardStride) - overscan);
    setWindowStart((current) => (current === nextStart ? current : nextStart));
    if (rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 160) {
      setLimit((value) => Math.min(videos.length, value + 16));
    }
  };
  const pageRail = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (rail) rail.scrollBy({ left: direction * Math.max(cardStride, rail.clientWidth - cardStride), behavior: "smooth" });
  };
  const focusRailIndex = (target: number) => {
    if (target < 0 || target >= videos.length) return;
    pendingFocus.current = target;
    setFocusRequest((value) => value + 1);
    setLimit((value) => railLimitForTarget(value, target, videos.length));
    setWindowStart(railWindowStartForTarget(target, Math.max(loaded, target + 1), visibleSlots, overscan));
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
    <section ref={shelfRef} className="media-shelf mb-8 min-w-0" style={!nearViewport ? { minHeight: shelfHeight ?? (variant === "poster" ? 320 : 250) } : undefined}
      onFocusCapture={() => { release.current!.cancel(); setNearViewport(true); }}
      onBlurCapture={event => {
        if (priority || event.currentTarget.contains(event.relatedTarget as Node | null)) return;
        const shelf = event.currentTarget;
        const box = shelf.getBoundingClientRect();
        if (box.bottom < -240 || box.top > window.innerHeight + 240) {
          release.current!.defer(() => shelf.contains(document.activeElement), () => setNearViewport(false));
        }
      }}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1 basis-48">{onTitleClick ? <button type="button" onClick={onTitleClick} className="block min-w-0 truncate font-display text-xl text-fg hover:text-accent sm:text-2xl">{title} <span className="text-sm text-muted">Open source →</span></button> : <h2 className="min-w-0 truncate font-display text-xl text-fg sm:text-2xl">{title}</h2>}{reason && <p className="mt-1 truncate text-xs text-muted">{reason}</p>}</div>
        <div className="flex shrink-0 items-center gap-1">
          {variant === "rail" && videos.length > visibleSlots && <>
            <span className="hidden text-xs tabular-nums text-muted sm:inline">{Math.min(videos.length, limit).toLocaleString()} titles</span>
            <Button size="sm" variant="ghost" disabled={windowStart === 0} aria-label={`Previous ${title} videos`} onClick={() => pageRail(-1)}>Previous</Button>
            <Button size="sm" variant="ghost" disabled={windowStart + visibleSlots >= loaded} aria-label={`Next ${title} videos`} onClick={() => pageRail(1)}>Next</Button>
          </>}
          {videos.length > limit && !collapsed && <Button size="sm" variant="ghost" className="text-xs" onClick={() => setLimit((value) => Math.min(videos.length, value + 16))}>Show 16 more · {videos.length - limit}</Button>}
          <Button size="sm" variant="ghost" aria-expanded={!collapsed} aria-label={`${collapsed ? "Expand" : "Minimize"} ${title}`} onClick={() => setCollapsed((value) => !value)}>{collapsed ? <ChevronRight className="size-4"/> : <ChevronDown className="size-4"/>}{collapsed ? "Expand" : "Minimize"}</Button>
        </div>
      </div>
      {nearViewport && !collapsed && <div ref={attachRail} role="list" aria-label={`${title} · ${videos.length.toLocaleString()} titles`} onScroll={(event) => onRailScroll(event.currentTarget)} onKeyDown={onRailKeyDown} className="rail-scroll flex gap-3 overflow-x-auto pb-3 sm:gap-4">
        {leadPx > 0 && <div aria-hidden="true" className="shrink-0" style={{ width: leadPx, height: 1 }} />}
        {start > 0 && <button type="button" className="sr-only focus:not-sr-only focus:rounded-sm focus:bg-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-fg" onFocus={event => {
          const target = windowBoundaryTarget('previous', start, end, videos.length, event.relatedTarget instanceof Element && Boolean(event.relatedTarget.closest('[data-rail-index]')));
          if (target !== null) focusRailIndex(target);
        }}>Previous {title} title</button>}
        {windowed.map((video, i) => (
          <div
            key={video.id}
            data-rail-index={start + i}
            role="listitem" aria-posinset={start + i + 1} aria-setsize={videos.length}
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
        {end < videos.length && <button type="button" className="sr-only focus:not-sr-only focus:rounded-sm focus:bg-elevated focus:px-3 focus:py-2 focus:text-sm focus:text-fg" onFocus={event => {
          const target = windowBoundaryTarget('next', start, end, videos.length, event.relatedTarget instanceof Element && Boolean(event.relatedTarget.closest('[data-rail-index]')));
          if (target !== null) focusRailIndex(target);
        }}>Next {title} title</button>}
        {trailPx > 0 && <div aria-hidden="true" className="shrink-0" style={{ width: trailPx, height: 1 }} />}
        {Array.from({ length: endCaps }, (_, index) => (
          <div key={`end-cap-${index}`} aria-hidden="true" className={cn("shrink-0 rounded-md border border-border/50 bg-elevated/35", variant === "poster" ? "aspect-poster w-32 sm:w-36 md:w-40" : "h-36 w-56")} />
        ))}
      </div>}
    </section>
  );
}

export function PosterGrid({ videos }: { videos: LibraryVideo[] }) {
  const [pageSize, setPageSize] = useState(() => savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 24));
  useEffect(() => {
    const sync = () => setPageSize(savedRenderBudget("reelcase.grid-page-size", GRID_SIZES, 24));
    window.addEventListener("reelcase:render-settings", sync);
    return () => window.removeEventListener("reelcase:render-settings", sync);
  }, []);
  if (!videos.length) return null;
  return <VirtualVideoGrid videos={videos} variant="poster" pageSize={pageSize} />;
}
