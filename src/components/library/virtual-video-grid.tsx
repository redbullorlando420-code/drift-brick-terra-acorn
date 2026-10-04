import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { GridRowMetrics, gridWindow, gridKeyboardTarget, type GridWindow } from "@/lib/virtual-grid";
import { windowBoundaryTarget } from '@/lib/virtual-rail';
import type { LibraryVideo } from "@/lib/videos/types";
import { VideoCard } from "./video-card";
import { useLibrary } from "@/lib/videos/store";
import { usePerformanceProfile } from './use-performance-profile';

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
  const budget = usePerformanceProfile();
  pageSize = budget.lowMemory ? Math.min(pageSize, budget.gridPageSize) : pageSize;
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
  const [window, setWindow] = useState<GridWindow>({ start: 0, end: Math.min(budget.gridMountCap, pageSize), lead: 0, tail: 0 });
  const length = Math.min(limit, videos.length);
  const sourceKey = useLibrary(state => `${state.sourceId}:${state.query}:${state.sort}`);
  const viewerOpen = useLibrary(state => Boolean(state.activeId || state.previewId));
  const returnAnchor = useRef<{ catalog: LibraryVideo[]; source: string; index: number; id: string; top: number; focused: boolean } | undefined>(undefined);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (viewerOpen) {
      if (returnAnchor.current) return;
      const focused = el.querySelector<HTMLElement>('[data-video-grid-index]:focus-within');
      const visible = focused ?? [...el.querySelectorAll<HTMLElement>('[data-video-grid-index]')].find(card => {
        const box = card.getBoundingClientRect();
        return box.bottom > 0 && box.top < globalThis.window.innerHeight;
      });
      if (!visible) return;
      const index = Number(visible.dataset.videoGridIndex);
      const video = videos[index];
      if (video) returnAnchor.current = { catalog: videos, source: sourceKey, index, id: video.id, top: visible.getBoundingClientRect().top, focused: Boolean(focused) };
      return;
    }
    const anchor = returnAnchor.current;
    returnAnchor.current = undefined;
    // Retain the visible title's position when shelves above it change after
    // watching. Never search the full catalog or restore across navigation.
    if (!anchor || anchor.catalog !== videos || anchor.source !== sourceKey) return;
    const card = el.querySelector<HTMLElement>(`[data-video-grid-index="${anchor.index}"]`);
    if (!card || videos[anchor.index]?.id !== anchor.id) return;
    const delta = card.getBoundingClientRect().top - anchor.top;
    if (Math.abs(delta) > 1) globalThis.window.scrollBy({ top: delta, behavior: 'instant' });
    if (anchor.focused) card.querySelector<HTMLButtonElement>('[data-video-card-open]')?.focus({ preventScroll: true });
  }, [sourceKey, videos, viewerOpen]);

  useEffect(() => {
    setLimit(pageSize);
    // Measurements describe row content, not the previous search/source.
    setGeometry(new GridRowMetrics(variant === "list" ? 88 : 260));
    calibrated.current = false;
    focusedIndex.current = undefined;
  }, [sourceKey, variant, pageSize]);

  const refresh = useCallback(() => {
    const el = root.current;
    if (!el) return;
    const top = -el.getBoundingClientRect().top;
    const height = globalThis.window.innerHeight;
    const total = geometry.offset(Math.ceil(length / layout.columns));
    let next = top + height < -320 ? { start: 0, end: 0, lead: 0, tail: total }
      : top > total + 320 ? { start: length, end: length, lead: total, tail: 0 }
      : gridWindow(length, layout.columns, top, height, geometry, budget.gridMountCap, budget.lowMemory ? 1 : 2);
    // A focused row stays mounted during a small wheel movement. Far-away
    // rows are released rather than making a second unbounded focus window.
    const focused = el.querySelector<HTMLElement>("[data-video-grid-index]:focus-within");
    if (focused) {
      const index = Number(focused.dataset.videoGridIndex);
      const focusedStart = Math.min(next.start, Math.floor(index / layout.columns) * layout.columns);
      const focusedEnd = Math.min(length, Math.max(next.end, (Math.floor(index / layout.columns) + 1) * layout.columns));
      if (index >= next.start - layout.columns * 2 && index < next.end + layout.columns * 2 && focusedEnd - focusedStart <= budget.gridMountCap) {
        next = { ...next, start: focusedStart, end: focusedEnd };
        next.lead = geometry.offset(next.start / layout.columns);
        next.tail = total - geometry.offset(Math.ceil(next.end / layout.columns));
      }
    }
    setWindow(old => sameWindow(old, next) ? old : next);
  }, [geometry, layout.columns, length, budget]);

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
  const focusIndex = (target: number) => {
    const mounted = root.current?.querySelector<HTMLButtonElement>(`[data-video-grid-index="${target}"] [data-video-card-open]`);
    if (mounted) {
      focusedIndex.current = undefined;
      mounted.focus({ preventScroll: true });
      mounted.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      refresh();
      return;
    }
    focusedIndex.current = target;
    const row = Math.floor(target / layout.columns);
    const docTop = root.current!.getBoundingClientRect().top + globalThis.window.scrollY;
    globalThis.window.scrollTo({ top: docTop + geometry.offset(row), behavior: 'instant' });
    refresh();
  };
  return <div ref={root} data-virtual-video-grid data-grid-columns={layout.columns} data-grid-loaded={length} data-grid-mount-cap={budget.gridMountCap}
    style={{ overflowAnchor: "none" }} onKeyDown={event => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (!(event.target as HTMLElement).matches("[data-video-card-open]")) return;
      const item = (event.target as HTMLElement).closest<HTMLElement>("[data-video-grid-index]");
      if (!item) return;
      const index = Number(item.dataset.videoGridIndex);
      if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
      const target = gridKeyboardTarget(event.key, index, length, layout.columns);
      event.preventDefault();
      if (target === null) return;
      focusIndex(target);
    }}>
    <div ref={probe} className={layouts[variant]} aria-hidden="true" />
    {start > 0 && <button type="button" className="sr-only focus:not-sr-only" onFocus={event => {
      const target = windowBoundaryTarget('previous', start, end, length, event.relatedTarget instanceof Element && Boolean(event.relatedTarget.closest('[data-video-grid-index]')));
      if (target !== null) focusIndex(target);
    }}>Previous media title</button>}
    <div role="list" aria-label={`Media catalog · ${videos.length.toLocaleString()} titles`}>
    {window.lead > 0 && <div aria-hidden="true" data-grid-spacer="lead" style={{ height: window.lead }} />}
    {rows.map(index => <div key={`${layout.columns}:${index}`} role="presentation" data-video-grid-row={Math.floor(index / layout.columns)} className={layouts[variant]}
      style={{ paddingBottom: index + layout.columns >= length ? 0 : variant === "list" ? 4 : 24 }}>
      {videos.slice(index, Math.min(index + layout.columns, end)).map((video, offset) => <div key={video.id} role="listitem" aria-posinset={index + offset + 1} aria-setsize={videos.length} data-video-grid-index={index + offset} className="min-w-0">
        <VideoCard video={video} variant={variant} index={index + offset} playedAt={playedAt?.[video.id]} animate={false} className={variant === "poster" ? "w-full" : undefined} />
      </div>)}
    </div>)}
    {window.tail > 0 && <div aria-hidden="true" data-grid-spacer="tail" style={{ height: window.tail }} />}
    </div>
    {end < length && <button type="button" className="sr-only focus:not-sr-only" onFocus={event => {
      const target = windowBoundaryTarget('next', start, end, length, event.relatedTarget instanceof Element && Boolean(event.relatedTarget.closest('[data-video-grid-index]')));
      if (target !== null) focusIndex(target);
    }}>Next media title</button>}
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
