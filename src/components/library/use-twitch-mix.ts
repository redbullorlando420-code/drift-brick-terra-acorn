import { useEffect, useMemo, useState } from "react";
import { buildTwitchMix } from "@/lib/videos/twitch-mix";
import type { LibraryVideo } from "@/lib/videos/types";
import { useSessionPhase } from "@/lib/use-session-phase";
import { useLibrary } from "@/lib/videos/store";
import { createWeakSnapshotCache } from '@/lib/weak-snapshot-cache';
import { getRating } from '@/lib/media-feedback';
const EMPTY: LibraryVideo[] = [];
const NO_ACTIVITY={};
type MixScope={videos:readonly LibraryVideo[];activity:object};
const caches={mix:createWeakSnapshotCache<MixScope,LibraryVideo[]>(30000),ranked:createWeakSnapshotCache<MixScope,LibraryVideo[]>(30000),fresh:createWeakSnapshotCache<MixScope,LibraryVideo[]>(30000)};
export function useTwitchMix(
  videos: readonly LibraryVideo[],
  seed: number,
  ranked = false,
  viewCounts?: Record<string, number>,
  revision = 0,
) {
  const phase = useSessionPhase(),
    viewer = useLibrary((state) => Boolean(state.previewId || state.activeId));
  const activity=useMemo(()=>viewCounts?{viewCounts,revision}:NO_ACTIVITY,[viewCounts,revision]);
  const cache=caches[ranked?'ranked':viewCounts?'fresh':'mix'];
  const cached=videos.length?cache.get({videos,activity},seed):undefined;
  const [packet, setPacket] = useState<{
    videos: readonly LibraryVideo[];
    seed: number;
    rows: LibraryVideo[];
    ranked: boolean;
    viewCounts?: Record<string, number>; revision: number;
  }>();
  useEffect(() => {
    if (!videos.length) {
      setPacket(undefined);
      return;
    }
    if(cached)return;
    if (
      phase !== "active" ||
      viewer ||
      (packet?.videos === videos &&
        packet.seed === seed &&
        packet.ranked === ranked &&
        packet.viewCounts === viewCounts && packet.revision === revision)
    )
      return;
    const controller = new AbortController();
    void buildTwitchMix(
      videos,
      seed,
      controller.signal,
      ranked,
      96,
      undefined,
      viewCounts ? (video) => viewCounts[video.id] || getRating(video.id) === 1 ? Infinity : 0 : undefined,
    )
      .then((rows) => {
        if (!controller.signal.aborted) {cache.put({videos,activity},seed,rows);setPacket({ videos, seed, rows, ranked, viewCounts, revision });}
      })
      .catch(() => {});
    return () => controller.abort();
  }, [videos, seed, ranked, viewCounts, revision, phase, viewer]);
  return cached??(packet?.videos === videos && packet.seed === seed && packet.ranked === ranked
    && packet.viewCounts === viewCounts && packet.revision === revision ? packet.rows : EMPTY);
}
