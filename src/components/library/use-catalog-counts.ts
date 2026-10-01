import { useEffect, useState } from "react";
import { adultFolderIds } from "@/lib/videos/adult-providers";
import { scheduleBackgroundWork } from "@/lib/interaction-budget";
import { addCountBatch, emptyCatalogCounts, type CatalogCounts, type CountRow } from "@/lib/videos/catalog-counts";
import type { Folder, HistoryEntry, LibraryVideo } from "@/lib/videos/types";

const EMPTY_COUNTS = emptyCatalogCounts();

/** One disposable worker, bounded packets, acknowledgement backpressure. */
export function useCatalogCounts(videos: LibraryVideo[], folders: Folder[], favorites: Record<string, true>, likes: Record<string, true>, history: HistoryEntry[], hidden: Record<string, true>, hideDemo: boolean) {
  const [counts, setCounts] = useState<CatalogCounts | null>(null);
  const [visibilityRevision, setVisibilityRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setVisibilityRevision(n => n + 1);
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);
  useEffect(() => {
    if (!videos.length || document.visibilityState === "hidden") return;
    let worker: Worker | undefined;
    let cancel = () => {};
    let deadline: ReturnType<typeof setTimeout> | undefined;
    let stopped = false, offset = 0;
    let fallback = emptyCatalogCounts();
    const adultIds = adultFolderIds(folders);
    const historyEvents = new Map<string, number>();
    for (const entry of history) historyEvents.set(entry.id, (historyEvents.get(entry.id) ?? 0) + 1);
    const finish = (result: CatalogCounts) => {
      if (stopped) return;
      stopped = true;
      clearTimeout(deadline);
      worker?.terminate(); worker = undefined;
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
          if (visible && (favorites[v.id] || likes[v.id])) flags |= 16;
        }
        rows.push([flags, !adult && visible ? historyEvents.get(v.id) ?? 0 : 0]);
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
  }, [videos, folders, favorites, likes, history, hidden, hideDemo, visibilityRevision]);
  return videos.length ? counts : EMPTY_COUNTS;
}
