import { useEffect, useMemo, useState } from "react";
import { adultFolderIds } from "@/lib/videos/adult-providers";
import { scheduleBackgroundWork } from "@/lib/interaction-budget";
import { addCountBatch, countActivityMatches, emptyCatalogCounts, type CatalogCounts, type CountRow } from "@/lib/videos/catalog-counts";
import type { Folder, HistoryEntry, LibraryVideo } from "@/lib/videos/types";
import { activityLookupAsync } from '@/lib/videos/activity-lookup';

const EMPTY_COUNTS = emptyCatalogCounts();
// Sidebar remounts and foregrounding reuse completed counts. Weak keys release
// superseded catalogs; only two visibility/privacy configurations are retained.
const completedCounts = new WeakMap<LibraryVideo[], Array<{
  folders: Folder[]; hidden: Record<string, true>; hideDemo: boolean; counts: CatalogCounts;
}>>();

/** One disposable worker, bounded packets, acknowledgement backpressure. */
export function useCatalogCounts(videos: LibraryVideo[], folders: Folder[], favorites: Record<string, true>, likes: Record<string, true>, history: HistoryEntry[], hidden: Record<string, true>, hideDemo: boolean) {
  const [counts, setCounts] = useState<CatalogCounts | null>(null);
  const [activity, setActivity] = useState<{ favCount: number; historyCount: number } | null>(null);
  const [visibilityRevision, setVisibilityRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setVisibilityRevision(n => n + 1);
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);
  useEffect(() => {
    if (!videos.length || document.visibilityState === "hidden") return;
    const cached = completedCounts.get(videos)?.find(row => row.folders === folders && row.hidden === hidden && row.hideDemo === hideDemo);
    if (cached) { setCounts(cached.counts); return; }
    let worker: Worker | undefined;
    let cancel = () => {};
    let deadline: ReturnType<typeof setTimeout> | undefined;
    let stopped = false, offset = 0;
    let fallback = emptyCatalogCounts();
    const adultIds = adultFolderIds(folders);
    const finish = (result: CatalogCounts) => {
      if (stopped) return;
      stopped = true;
      clearTimeout(deadline);
      worker?.terminate(); worker = undefined;
      const saved = completedCounts.get(videos) ?? [];
      saved.unshift({ folders, hidden, hideDemo, counts: result });
      completedCounts.set(videos, saved.slice(0, 2));
      setCounts(result);
    };
    const send = () => {
      if (stopped) return;
      const reset = offset === 0;
      const rows: CountRow[] = [];
      const started = performance.now();
      while (offset < videos.length && rows.length < 512 && performance.now() - started < 4) {
        const v = videos[offset++];
        const adult = adultIds.has(v.folderId);
        const visible = !hidden[v.id] && !(hideDemo && v.isSample);
        let flags = adult ? (visible ? 32 : 0) : 0;
        if (!adult) {
          if (visible) flags |= 1;
          if (v.remote?.kind === "youtube") flags |= 2;
          if (v.remote?.kind === "twitch") flags |= 4;
          if (v.remote?.live) flags |= 8;
        }
        rows.push([flags, 0]);
      }
      const done = offset >= videos.length;
      if (worker) {
        clearTimeout(deadline);
        deadline = setTimeout(restartFallback, 10_000);
        worker.postMessage({ reset, done, rows });
      } else {
        addCountBatch(fallback, rows);
        if (done) finish(fallback);
        else cancel = scheduleBackgroundWork(send);
      }
    };
    const restartFallback = () => {
      if (stopped) return;
      clearTimeout(deadline); cancel();
      worker?.terminate(); worker = undefined;
      offset = 0; fallback = emptyCatalogCounts();
      cancel = scheduleBackgroundWork(send);
    };
    cancel = scheduleBackgroundWork(() => {
      try {
        worker = new Worker(new URL("../../lib/videos/catalog-counts.worker.ts", import.meta.url), { type: "module" });
        worker.onerror = restartFallback;
        worker.onmessageerror = restartFallback;
        worker.onmessage = ({ data }) => {
          if (stopped) return;
          clearTimeout(deadline);
          if (data.type === "done") finish(data.counts);
          else cancel = scheduleBackgroundWork(send);
        };
      } catch { worker = undefined; }
      send();
    }, { fallbackDelayMs: 350 });
    return () => { stopped = true; cancel(); clearTimeout(deadline); worker?.terminate(); };
  }, [videos, folders, hidden, hideDemo, visibilityRevision]);
  // Activity changes are sparse. A play or heart must not terminate/rebuild a
  // worker and resend 100k cards just to update two sidebar numbers.
  useEffect(() => {
    let cancelled = false, cancel = () => {}, rejectTurn: ((reason: Error) => void) | undefined;
    const adultIds = adultFolderIds(folders);
    const saved = new Set([...Object.keys(favorites), ...Object.keys(likes)]);
    const events = new Map<string, number>();
    for (const entry of history) events.set(entry.id, (events.get(entry.id) ?? 0) + 1);
    const turn = () => new Promise<void>((resolve, reject) => {
      if (cancelled) { reject(new Error('Activity count replaced')); return; }
      rejectTurn = reject;
      cancel = scheduleBackgroundWork(() => { rejectTurn = undefined; resolve(); });
    });
    void (async () => {
      await turn();
      const matches = await activityLookupAsync(videos, [...saved, ...events.keys()], turn);
      if (cancelled) return;
      const { favCount, historyCount } = countActivityMatches(matches, saved, events, adultIds, hidden, hideDemo);
      setActivity(previous => previous?.favCount === favCount && previous.historyCount === historyCount ? previous : { favCount, historyCount });
    })().catch(() => { /* Replaced/hidden work will restart on the next effect. */ });
    return () => { cancelled = true; cancel(); rejectTurn?.(new Error('Activity count replaced')); };
  }, [videos, folders, favorites, likes, history, hidden, hideDemo, visibilityRevision]);
  return useMemo(() => videos.length ? counts && activity && { ...counts, ...activity } : EMPTY_COUNTS, [videos.length, counts, activity]);
}
