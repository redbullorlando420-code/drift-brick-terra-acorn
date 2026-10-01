import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { GRID_MOUNT_CAP, GridRowMetrics, gridWindow, type GridWindow } from "@/lib/virtual-grid";
import type { LibraryVideo } from "@/lib/videos/types";
import { VideoCard } from "./video-card";
import { useLibrary } from "@/lib/videos/store";

type Variant = "grid" | "poster" | "list";
const layouts: Record<Variant, string> = {
  grid: "grid grid-cols-2 gap-x-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  poster: "grid grid-cols-3 gap-x-3 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7",
  list: "grid grid-cols-1",
};
const sameWindow = (a: GridWindow, b: GridWindow) => a.start === b.start && a.end === b.end && a.lead === b.lead && a.tail === b.tail;

/** One viewport window and one row observer, however far the catalog is paged. */
export function VirtualVideoGrid({ videos, playedAt, variant, pageSize, automatic = false }: {
  videos: LibraryVideo[]; playedAt?: Record<string, number>; variant: Variant; pageSize: number; automatic?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const frame = useRef<number | undefined>(undefined);
  const anchorAdjustment = useRef(0);
  const focusedIndex = useRef<number | undefined>(undefined);
  const [limit, setLimit] = useState(pageSize);
  const [layout, setLayout] = useState({ columns: variant === "list" ? 1 : variant === "poster" ? 3 : 2, width: 0 });
  const [geometry, setGeometry] = useState(() => new GridRowMetrics(variant === "list" ? 88 : 260));
  const calibrated = useRef(false);
  const [measurement, setMeasurement] = useState(0);
  const [window, setWindow] = useState<GridWindow>({ start: 0, end: Math.min(108, pageSize), lead: 0, tail: 0 });
  const length = Math.min(limit, videos.length);
  const sourceKey = useLibrary(state => `${state.sourceId}:${state.query}:${state.sort}`);

  useEffect(() => {
    setLimit(pageSize);
    // Measurements describe row content, not the previous search/source.
    setGeometry(new GridRowMetrics(variant === "list" ? 88 : 260));
    calibrated.current = false;
  }, [sourceKey, variant, pageSize]);

  const refresh = useCallback(() => {
    const el = root.current;
    if (!el) return;
    const top = -el.getBoundingClientRect().top;
    const height = globalThis.window.innerHeight;
    const total = geometry.offset(Math.ceil(length / layout.columns));
    let next = top + height < -320 ? { start: 0, end: 0, lead: 0, tail: total }
      : top > total + 320 ? { start: length, end: length, lead: total, tail: 0 }
      : gridWindow(length, layout.columns, top, height, geometry);
    // A focused row stays mounted during a small wheel movement. Far-away
    // rows are released rather than making a second unbounded focus window.
    const focused = el.querySelector<HTMLElement>("[data-video-grid-index]:focus-within");
    if (focused) {
      const index = Number(focused.dataset.videoGridIndex);
      const focusedStart = Math.min(next.start, Math.floor(index / layout.columns) * layout.columns);
      const focusedEnd = Math.min(length, Math.max(next.end, (Math.floor(index / layout.columns) + 1) * layout.columns));
      if (index >= next.start - layout.columns * 2 && index < next.end + layout.columns * 2 && focusedEnd - focusedStart <= GRID_MOUNT_CAP) {
        next = { ...next, start: focusedStart, end: focusedEnd };
        next.lead = geometry.offset(next.start / layout.columns);
        next.tail = total - geometry.offset(Math.ceil(next.end / layout.columns));
      }
    }
    setWindow(old => sameWindow(old, next) ? old : next);
  }, [geometry, layout.columns, length]);

  const scheduleRefresh = useCallback(() => {
    if (frame.current !== undefined) return;
    frame.current = globalThis.window.requestAnimationFrame(() => { frame.current = undefined; refresh(); });
  }, [refresh]);

  useLayoutEffect(() => {
    if (anchorAdjustment.current) {
      globalThis.window.scrollBy({ top: anchorAdjustment.current, behavior: "instant" });
      anchorAdjustment.current = 0;
    }
    refresh();
  }, [refresh, measurement]);

  useEffect(() => {
    globalThis.window.addEventListener("scroll", scheduleRefresh, { passive: true });
    globalThis.window.addEventListener("resize", scheduleRefresh, { passive: true });
    return () => {
      globalThis.window.removeEventListener("scroll", scheduleRefresh);
      globalThis.window.removeEventListener("resize", scheduleRefresh);
      if (frame.current !== undefined) globalThis.window.cancelAnimationFrame(frame.current);
      frame.current = undefined;
    };
  }, [scheduleRefresh]);

  useLayoutEffect(() => {
    const el = probe.current;
    if (!el) return;
    const sync = () => {
      const columns = getComputedStyle(el).gridTemplateColumns.split(" ").length;
      const width = Math.round(el.getBoundingClientRect().width);
      setLayout(old => old.columns === columns && old.width === width ? old : { columns, width });
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [variant]);

  useLayoutEffect(() => {
    calibrated.current = false;
    setGeometry(new GridRowMetrics(variant === "list" ? 88 : 260));
  }, [layout.columns, layout.width, variant]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const top = -el.getBoundingClientRect().top;
      const anchor = geometry.rowAt(Math.max(0, top), Math.ceil(length / layout.columns));
      const before = geometry.offset(anchor);
      if (!calibrated.current && entries.length) {
        // New geometry has no cached deltas yet. Calibrate from real rows
        // before reserving the rest of the loaded catalog's scroll space.
        geometry.estimate = Math.max(1, entries.reduce((sum, entry) => sum + entry.target.getBoundingClientRect().height, 0) / entries.length);
        calibrated.current = true;
      }
      let changed = false;
      for (const entry of entries) changed = geometry.measure(Number((entry.target as HTMLElement).dataset.videoGridRow), entry.target.getBoundingClientRect().height) || changed;
      if (!changed) return;
      if (top > 0) anchorAdjustment.current += geometry.offset(anchor) - before;
      setMeasurement(value => value + 1);
    });
    el.querySelectorAll("[data-video-grid-row]").forEach(row => observer.observe(row));
    return () => observer.disconnect();
  }, [geometry, layout.columns, length, window.start, window.end, videos]);

  const loadMore = useCallback(() => setLimit(value => Math.min(videos.length, value + pageSize)), [pageSize, videos.length]);
  useEffect(() => {
    const el = sentinel.current;
    if (!automatic || !el || length >= videos.length) return;
    const observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) loadMore(); }, { rootMargin: "400px 0px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [automatic, length, loadMore, videos.length]);

  useLayoutEffect(() => {
    if (focusedIndex.current === undefined) return;
    const button = root.current?.querySelector<HTMLButtonElement>(`[data-video-grid-index="${focusedIndex.current}"] [data-video-card-open]`);
    if (button) { button.focus({ preventScroll: true }); focusedIndex.current = undefined; }
  }, [window.start, window.end]);

  const start = Math.floor(Math.min(window.start, length) / layout.columns) * layout.columns;
  const end = Math.min(length, window.end);
  const rows = [];
  for (let index = start; index < end; index += layout.columns) rows.push(index);
  return <div ref={root} data-virtual-video-grid data-grid-columns={layout.columns} data-grid-loaded={length}
    style={{ overflowAnchor: "none" }} onKeyDown={event => {
      if (!(event.target as HTMLElement).matches("[data-video-card-open]")) return;
      const item = (event.target as HTMLElement).closest<HTMLElement>("[data-video-grid-index]");
      if (!item) return;
      const index = Number(item.dataset.videoGridIndex);
      const target = event.key === "ArrowDown" ? index + layout.columns : event.key === "ArrowUp" ? index - layout.columns
        : event.key === "ArrowRight" ? index + 1 : event.key === "ArrowLeft" ? index - 1
        : event.key === "Home" ? 0 : event.key === "End" ? length - 1 : undefined;
      if (target === undefined || target < 0 || target >= length) return;
      event.preventDefault();
      const mounted = root.current?.querySelector<HTMLButtonElement>(`[data-video-grid-index="${target}"] [data-video-card-open]`);
      if (mounted) {
        focusedIndex.current = undefined;
        mounted.focus({ preventScroll: true });
        mounted.scrollIntoView({ block: "nearest", behavior: "instant" });
        refresh();
        return;
      }
      focusedIndex.current = target;
      const row = Math.floor(target / layout.columns);
      const docTop = root.current!.getBoundingClientRect().top + globalThis.window.scrollY;
      globalThis.window.scrollTo({ top: docTop + geometry.offset(row), behavior: "instant" });
      refresh();
    }}>
    <div ref={probe} className={layouts[variant]} aria-hidden="true" />
    {window.lead > 0 && <div aria-hidden="true" data-grid-spacer="lead" style={{ height: window.lead }} />}
    {rows.map(index => <div key={`${layout.columns}:${index}`} data-video-grid-row={Math.floor(index / layout.columns)} className={layouts[variant]}
      style={{ paddingBottom: index + layout.columns >= length ? 0 : variant === "list" ? 4 : 24 }}>
      {videos.slice(index, Math.min(index + layout.columns, end)).map((video, offset) => <div key={video.id} data-video-grid-index={index + offset} className="min-w-0">
        <VideoCard video={video} variant={variant} index={index + offset} playedAt={playedAt?.[video.id]} animate={false} className={variant === "poster" ? "w-full" : undefined} />
      </div>)}
    </div>)}
    {window.tail > 0 && <div aria-hidden="true" data-grid-spacer="tail" style={{ height: window.tail }} />}
    {length < videos.length && <>
      {automatic && <div ref={sentinel} className="h-8" aria-hidden="true" />}
      <div className="mt-5 flex items-center justify-between gap-3">
        {!automatic && <p className="text-xs text-muted">Page {Math.ceil(length / pageSize)} · showing {length.toLocaleString()} of {videos.length.toLocaleString()} titles</p>}
        <Button variant="secondary" className={automatic ? "w-full" : undefined} onClick={loadMore}>
          {automatic ? `Show more · ${videos.length - length} remaining` : `Next page · ${pageSize}`}
        </Button>
      </div>
    </>}
  </div>;
}
