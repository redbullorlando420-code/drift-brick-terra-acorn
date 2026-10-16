import { useEffect, useState } from "react";
import { buildTwitchMix } from "@/lib/videos/twitch-mix";
import type { LibraryVideo } from "@/lib/videos/types";
import { useSessionPhase } from "@/lib/use-session-phase";
import { useLibrary } from "@/lib/videos/store";
const EMPTY: LibraryVideo[] = [];
export function useTwitchMix(
  videos: readonly LibraryVideo[],
  seed: number,
  ranked = false,
  viewCounts?: Record<string, number>,
) {
  const phase = useSessionPhase(),
    viewer = useLibrary((state) => Boolean(state.previewId || state.activeId));
  const [packet, setPacket] = useState<{
    videos: readonly LibraryVideo[];
    seed: number;
    rows: LibraryVideo[];
    ranked: boolean;
    viewCounts?: Record<string, number>;
  }>();
  useEffect(() => {
    if (!videos.length) {
      setPacket(undefined);
      return;
    }
    if (
      phase !== "active" ||
      viewer ||
      (packet?.videos === videos &&
        packet.seed === seed &&
        packet.ranked === ranked &&
        packet.viewCounts === viewCounts)
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
      viewCounts ? (video) => viewCounts[video.id] ?? 0 : undefined,
    )
      .then((rows) => {
        if (!controller.signal.aborted) setPacket({ videos, seed, rows, ranked, viewCounts });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [videos, seed, ranked, viewCounts, phase, viewer]);
  return packet?.videos === videos && packet.seed === seed && packet.ranked === ranked
    && packet.viewCounts === viewCounts ? packet.rows : EMPTY;
}
