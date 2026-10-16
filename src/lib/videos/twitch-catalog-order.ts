import {
  forEachCatalogEntry,
  forEachCatalogSlice,
  sortCatalogRows,
  yieldCatalogTask,
} from "../catalog-work.ts";
import { hasFreshViewerCount } from "./types.ts";
import type { LibraryVideo } from "./types";
export type TwitchCatalogOrder = "mix" | "live" | "viewers" | "name";
export function twitchCreatorKey(video: LibraryVideo) {
  return (video.remote?.channelId || video.remote?.channelName || video.folderId)
    .trim()
    .toLowerCase()
    .replace(/^@/, "");
}
export function twitchShuffleHash(id: string, seed: number) {
  let value = seed ^ 2166136261;
  for (let i = 0; i < id.length; i++) value = Math.imul(value ^ id.charCodeAt(i), 16777619);
  return value >>> 0;
}
export function isOfflineTwitchCatalogCard(video: LibraryVideo) {
  return (
    !video.remote?.live &&
    (/^offline\b/i.test(video.tagline ?? "") ||
      video.extension === "live" ||
      /\/(?:live|channel)$/i.test(video.path) ||
      /:(?:live|channel)$/i.test(video.id))
  );
}

/** Full-grid ordering yields while scanning and sorting. Numeric offsets keep
 * every archived title available, with creators taking turns at every depth. */
export async function orderTwitchCatalog(
  videos: readonly LibraryVideo[],
  mode: TwitchCatalogOrder,
  seed: number,
  signal?: AbortSignal,
  yieldTask = yieldCatalogTask,
) {
  const turn = async () => {
    signal?.throwIfAborted();
    await yieldTask();
    signal?.throwIfAborted();
  };
  const candidates: LibraryVideo[] = [];
  await forEachCatalogSlice(
    videos,
    (video) => {
      if (video.remote?.kind !== "twitch") return;
      if (!isOfflineTwitchCatalogCard(video)) candidates.push(video);
    },
    turn,
  );
  const now = Date.now();
  const viewers = (video: LibraryVideo) =>
    hasFreshViewerCount(video.remote, now) ? (video.remote?.viewers ?? 0) : 0;
  if (mode !== "mix")
    return sortCatalogRows(
      candidates,
      (a, b) =>
        mode === "name"
          ? a.name.localeCompare(b.name)
          : mode === "viewers"
            ? viewers(b) - viewers(a) || a.name.localeCompare(b.name)
            : Number(Boolean(b.remote?.live)) - Number(Boolean(a.remote?.live)) ||
              viewers(b) - viewers(a) ||
              b.addedAt - a.addedAt,
      turn,
    );
  const hashes = new Uint32Array(candidates.length),
    groups = new Map<string, number[]>();
  await forEachCatalogSlice(
    candidates,
    (video, index) => {
      hashes[index] = twitchShuffleHash(video.id, seed);
      const key = twitchCreatorKey(video),
        rows = groups.get(key) ?? [];
      rows.push(index);
      groups.set(key, rows);
    },
    turn,
  );
  const keys = await sortCatalogRows(
    [...groups.keys()],
    (a, b) => twitchShuffleHash(a, seed) - twitchShuffleHash(b, seed) || a.localeCompare(b),
    turn,
  );
  let started = performance.now();
  for (const key of keys) {
    const rows = groups.get(key)!;
    groups.set(key, await sortCatalogRows(rows, (a, b) => hashes[a]! - hashes[b]! || a - b, turn));
    if (performance.now() - started >= 4) {
      await turn();
      started = performance.now();
    }
  }
  const result: LibraryVideo[] = [],
    cursors = new Map<string, number>();
  function* interleaved() {
    let active = keys;
    while (active.length) {
      const remaining: string[] = [];
      for (const key of active) {
        const rows = groups.get(key)!,
          cursor = cursors.get(key) ?? 0;
        yield candidates[rows[cursor]!]!;
        cursors.set(key, cursor + 1);
        if (cursor + 1 < rows.length) remaining.push(key);
      }
      active = remaining;
    }
  }
  await forEachCatalogEntry(
    interleaved(),
    (video) => {
      result.push(video);
    },
    turn,
  );
  signal?.throwIfAborted();
  return result;
}
