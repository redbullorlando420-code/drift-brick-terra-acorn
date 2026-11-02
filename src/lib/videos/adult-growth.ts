import { forEachCatalogSlice, yieldCatalogTask } from "../catalog-work.ts";
import { ADULT_PULL_PROVIDERS } from "./adult-providers.ts";
import type { LibraryVideo } from "./types";

export type AdultGrowthCounts = {
  archivedVideos: number;
  photos: number;
  liveRooms: number;
  unknown: number;
};
const empty = (): AdultGrowthCounts => ({ archivedVideos: 0, photos: 0, liveRooms: 0, unknown: 0 });
const complete = new WeakMap<LibraryVideo[], AdultGrowthCounts>();
const pending = new WeakMap<LibraryVideo[], Promise<AdultGrowthCounts>>();
export function rememberAdultGrowthCounts(videos: LibraryVideo[], counts: AdultGrowthCounts) { complete.set(videos, counts); }
export function adultMediaClass(video: LibraryVideo): keyof AdultGrowthCounts | undefined {
  const remote = video.remote;
  if (
    !remote ||
    video.isSample ||
    !(ADULT_PULL_PROVIDERS as readonly string[]).includes(remote.kind)
  )
    return;
  // An offline directory card is still a room, never an archived recording.
  if (remote.live || remote.kind === "chaturbate" || remote.kind === "myfreecams")
    return "liveRooms";
  if (
    /^image\//i.test(video.mime ?? "") ||
    /^(image|jpe?g|png|webp|gif|avif)$/i.test(video.extension ?? "")
  )
    return "photos";
  if (
    /^video\//i.test(video.mime ?? "") ||
    /^(mp4|webm|mkv|mov|m4v|eporner|redtube|redgifs)$/i.test(video.extension ?? "") ||
    ["eporner", "redtube", "redgifs"].includes(remote.kind)
  )
    return "archivedVideos";
  return "unknown";
}
/** One yielded scan per immutable catalog; weak keys cannot retain old catalogs. */
export function adultGrowthCounts(videos: LibraryVideo[]): Promise<AdultGrowthCounts> {
  const saved = complete.get(videos);
  if (saved) return Promise.resolve(saved);
  const running = pending.get(videos);
  if (running) return running;
  const counts = empty();
  const work = forEachCatalogSlice(
    videos,
    (video) => {
      const kind = adultMediaClass(video);
      if (kind) counts[kind]++;
    },
    yieldCatalogTask,
  )
    .then(() => {
      complete.set(videos, counts);
      return counts;
    })
    .finally(() => pending.delete(videos));
  pending.set(videos, work);
  return work;
}
/** The ingest already has the old rows in its bounded positions map. Count
 * accepted replacements once, including media-class changes, without a scan. */
export function rememberAdultGrowthChanges(
  base: LibraryVideo[],
  next: LibraryVideo[],
  changes: Iterable<{ before?: LibraryVideo; after: LibraryVideo }>,
) {
  const previous = complete.get(base);
  if (!previous) return;
  const counts = { ...previous };
  for (const { before, after } of changes) {
    const oldKind = before && adultMediaClass(before),
      newKind = adultMediaClass(after);
    if (oldKind) counts[oldKind]--;
    if (newKind) counts[newKind]++;
  }
  complete.set(next, counts);
}
/** Photos and rooms do not consume the archive-video goal. Retention limits
 * still count every row, so mixed libraries cannot silently overrun memory. */
export const adultVideoGoalRemaining = (counts: AdultGrowthCounts, target: number) =>
  Math.max(0, target - counts.archivedVideos);
