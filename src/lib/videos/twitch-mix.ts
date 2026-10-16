import { forEachCatalogSlice, yieldCatalogTask } from "../catalog-work.ts";
import type { LibraryVideo } from "./types";
import { twitchCreatorKey } from "./twitch-catalog-order.ts";

function hash(id: string, seed: number) {
  let value = seed ^ 2166136261;
  for (let i = 0; i < id.length; i++) value = Math.imul(value ^ id.charCodeAt(i), 16777619);
  return value >>> 0;
}
/** Channels take turns, independent of archive size. A seeded sample selects
 * older videos too, while the ranked mode retains the caller's taste order. */
export async function buildTwitchMix(
  videos: readonly LibraryVideo[],
  seed: number,
  signal?: AbortSignal,
  ranked = false,
  limit = 96,
  yieldTask = yieldCatalogTask,
  priority?: (video: LibraryVideo) => number,
) {
  const turn = async () => {
    signal?.throwIfAborted();
    await yieldTask();
    signal?.throwIfAborted();
  };
  const groups = new Map<string, Array<{ video: LibraryVideo; order: number }>>();
  const cap = Math.min(limit, 12);
  await forEachCatalogSlice(
    videos,
    (video, index) => {
      if (
        video.remote?.kind !== "twitch" ||
        video.remote.live ||
        video.isSample ||
        video.extension === "channel"
      )
        return;
      const key = twitchCreatorKey(video);
      const rows = groups.get(key) ?? [];
      const weight = priority?.(video) ?? 0;
      const order = ranked
        ? index
        : Math.min(1_000_000, Math.max(0, Number.isFinite(weight) ? Math.floor(weight) : 0)) *
            0x100000000 +
          hash(video.id, seed);
      if (rows.length < cap) rows.push({ video, order });
      else if (!ranked) {
        let worst = 0;
        for (let i = 1; i < rows.length; i++) if (rows[i]!.order > rows[worst]!.order) worst = i;
        if (order < rows[worst]!.order) rows[worst] = { video, order };
      }
      groups.set(key, rows);
    },
    turn,
  );
  const ordered = [...groups]
    .sort(([a], [b]) => hash(a, seed) - hash(b, seed) || a.localeCompare(b))
    .map(([, rows]) => rows.sort((a, b) => a.order - b.order));
  const out: LibraryVideo[] = [];
  for (let depth = 0; depth < cap && out.length < limit; depth++)
    for (const rows of ordered) {
      if (rows[depth]) out.push(rows[depth]!.video);
      if (out.length >= limit) break;
    }
  signal?.throwIfAborted();
  return out;
}
