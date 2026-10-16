import { useEffect, useState } from "react";
import { orderTwitchCatalog, type TwitchCatalogOrder } from "@/lib/videos/twitch-catalog-order";
import type { LibraryVideo } from "@/lib/videos/types";
import { useSessionPhase } from "@/lib/use-session-phase";
import { useLibrary } from "@/lib/videos/store";
const EMPTY: LibraryVideo[] = [];
export function useTwitchCatalogOrder(
  videos: readonly LibraryVideo[],
  active: boolean,
  mode: TwitchCatalogOrder,
  seed: number,
) {
  const phase = useSessionPhase(),
    viewer = useLibrary((state) => Boolean(state.previewId || state.activeId));
  const [packet, setPacket] = useState<{
    videos: readonly LibraryVideo[];
    mode: TwitchCatalogOrder;
    seed: number;
    rows: LibraryVideo[];
  }>();
  useEffect(() => {
    if (!active) {
      setPacket(undefined);
      return;
    }
    if (
      phase !== "active" ||
      viewer ||
      (packet?.videos === videos &&
        packet.mode === mode &&
        (mode !== "mix" || packet.seed === seed))
    )
      return;
    const controller = new AbortController();
    void orderTwitchCatalog(videos, mode, seed, controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setPacket({ videos, mode, seed, rows });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [videos, active, mode, seed, phase, viewer]);
  const matches =
    active &&
    packet?.videos === videos &&
    packet.mode === mode &&
    (mode !== "mix" || packet.seed === seed);
  return { rows: matches ? packet!.rows : EMPTY, pending: active && !matches };
}
