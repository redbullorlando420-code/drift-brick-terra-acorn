import { useEffect, useMemo, useState } from "react";
import { adultFolderIds } from "@/lib/videos/adult-providers";
import { getInteractionPriorityDelay, scheduleBackgroundWork } from "@/lib/interaction-budget";
import { countActivityMatches, emptyCatalogCounts, type CatalogCounts } from "@/lib/videos/catalog-counts";
import type { Folder, HistoryEntry, LibraryVideo } from "@/lib/videos/types";
import { activityLookupAsync } from '@/lib/videos/activity-lookup';
import { createCatalogCounter } from '@/lib/videos/catalog-count-cache';
import { yieldCatalogTask } from '@/lib/catalog-work';

const EMPTY_COUNTS = emptyCatalogCounts();
// Desktop and mobile share completed work. The service retains only weak
// catalog references and cancels a superseded job at its next short task.
const catalogCounter = createCatalogCounter();

/** Cheap provider counts and sparse activity are independent subscriptions. */
export function useCatalogCounts(videos: LibraryVideo[], folders: Folder[], favorites: Record<string, true>, likes: Record<string, true>, history: HistoryEntry[], hidden: Record<string, true>, hideDemo: boolean) {
  const [counts, setCounts] = useState<CatalogCounts | null>(null);
  const [activity, setActivity] = useState<{ favCount: number; historyCount: number } | null>(null);
  const [visibilityRevision, setVisibilityRevision] = useState(0);
  const adultIds = adultFolderIds(folders);
  useEffect(() => {
    const refresh = () => { if (document.hidden) catalogCounter.cancel(); setVisibilityRevision(n => n + 1); };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, []);
  useEffect(() => {
    if (!videos.length || document.hidden) return;
    let current = true;
    void catalogCounter.count({ videos, adultIds, hidden, hideDemo }).then(result => {
      if (current) setCounts(result);
    }).catch(() => { /* Superseded jobs never publish partial counts. */ });
    return () => { current = false; };
  }, [videos, adultIds, hidden, hideDemo, visibilityRevision]);
  // Activity changes are sparse. A play or heart must not restart provider
  // counts just to update two sidebar numbers.
  useEffect(() => {
    let cancelled = false, cancel = () => {}, rejectTurn: ((reason: Error) => void) | undefined;
    const saved = new Set([...Object.keys(favorites), ...Object.keys(likes)]);
    const events = new Map<string, number>();
    for (const entry of history) events.set(entry.id, (events.get(entry.id) ?? 0) + 1);
    const turn = async () => {
      await yieldCatalogTask();
      if (cancelled) throw new Error("Activity count replaced");
      if (!document.hidden && getInteractionPriorityDelay() === 0) return;
      await new Promise<void>((resolve, reject) => {
        if (cancelled) { reject(new Error('Activity count replaced')); return; }
        rejectTurn = reject;
        cancel = scheduleBackgroundWork(() => { rejectTurn = undefined; resolve(); });
      });
    };
    void (async () => {
      await turn();
      const matches = await activityLookupAsync(videos, [...saved, ...events.keys()], turn);
      if (cancelled) return;
      const { favCount, historyCount } = countActivityMatches(matches, saved, events, adultIds, hidden, hideDemo);
      setActivity(previous => previous?.favCount === favCount && previous.historyCount === historyCount ? previous : { favCount, historyCount });
    })().catch(() => { /* Replaced/hidden work will restart on the next effect. */ });
    return () => { cancelled = true; cancel(); rejectTurn?.(new Error('Activity count replaced')); };
  }, [videos, adultIds, favorites, likes, history, hidden, hideDemo, visibilityRevision]);
  return useMemo(() => videos.length ? counts && { ...counts, ...(activity ?? { favCount: undefined, historyCount: undefined }) } : EMPTY_COUNTS, [videos.length, counts, activity]);
}
