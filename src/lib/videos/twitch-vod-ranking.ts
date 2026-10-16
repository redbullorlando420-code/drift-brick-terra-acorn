import { forEachCatalogSlice, sortCatalogRows, yieldCatalogTask } from "../catalog-work.ts";
import { isTwitchClip } from "./twitch-clips.ts";
import { isOfflineTwitchCatalogCard } from "./twitch-catalog-order.ts";
import type { LibraryVideo } from "./types";
export async function rankTwitchVods(
  videos: readonly LibraryVideo[],
  score: (video: LibraryVideo) => number,
  signal?: AbortSignal,
  yieldTask = yieldCatalogTask,
) {
  const turn = async () => {
    signal?.throwIfAborted();
    await yieldTask();
    signal?.throwIfAborted();
  };
  const rows: Array<{ video: LibraryVideo; score: number }> = [];
  await forEachCatalogSlice(
    videos,
    (video) => {
      if (
        video.remote?.kind === "twitch" &&
        !video.remote.live &&
        !isTwitchClip(video) &&
        !isOfflineTwitchCatalogCard(video)
      )
        rows.push({ video, score: score(video) });
    },
    turn,
  );
  const sorted = await sortCatalogRows(
    rows,
    (a, b) => b.score - a.score || b.video.addedAt - a.video.addedAt,
    turn,
  );
  const result: LibraryVideo[] = [];
  await forEachCatalogSlice(
    sorted,
    (row) => {
      result.push(row.video);
    },
    turn,
  );
  return result;
}
