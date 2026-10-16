import { forEachCatalogSlice, sortCatalogRows, yieldCatalogTask } from "../catalog-work.ts";
import type { LibraryVideo } from "../videos/types.ts";
import { roomMediaKey } from "./room-media.ts";

const DEMO_TITLE = /\b(blender|big buck bunny|cosmos laundromat|tears of steel|elephants dream|sintel|night rain|empty house|golden coast|tungsten reel)\b/i;

export type RoomCandidateOptions = {
  videos: readonly LibraryVideo[];
  shared: Record<string, LibraryVideo>;
  guest: boolean;
  favorites: Record<string, unknown>;
  hidden: Record<string, unknown>;
  unavailable: Record<string, unknown>;
  history: readonly { id: string }[];
  seed: number;
  canStage: (video: LibraryVideo) => boolean;
  rank: (id: string, seed: number) => number;
};

/** Prepare the room's randomized catalog in interruptible slices. A million
 * item room should not hold the main thread while the queue panel opens. */
export async function prepareRoomCandidates(options: RoomCandidateOptions, turn = yieldCatalogTask) {
  let catalog: readonly LibraryVideo[];
  if (options.guest) catalog = await roomCatalogCandidatesAsync(options.videos, options.shared, turn);
  else {
    const ids = new Set<string>();
    await forEachCatalogSlice(options.videos, video => ids.add(video.id), turn);
    const sharedOnly: LibraryVideo[] = [];
    await forEachCatalogSlice(Object.values(options.shared), video => { if (!ids.has(video.id)) sharedOnly.push(video); }, turn);
    catalog = sharedOnly.length ? options.videos.concat(sharedOnly) : options.videos;
  }
  const played = new Set<string>();
  await forEachCatalogSlice(options.history, entry => played.add(entry.id), turn);

  const videos: LibraryVideo[] = [];
  const ranks: number[] = [];
  const order: number[] = [];
  await forEachCatalogSlice(catalog, video => {
    if (video.isSample || DEMO_TITLE.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`) ||
      options.unavailable[video.id] || options.hidden[video.id] || !options.canStage(video)) return;
    const index = videos.length;
    videos.push(video);
    ranks.push(options.rank(`${video.id}:${options.seed}`, options.seed) / 0xffffffff +
      (options.favorites[video.id] ? 0.18 : 0) - (played.has(video.id) ? 0.32 : 0));
    order.push(index);
  }, turn);
  const sorted = await sortCatalogRows(order, (a, b) => ranks[b]! - ranks[a]!, turn);
  const result = new Array<LibraryVideo>(videos.length);
  await forEachCatalogSlice(sorted, (index, position) => { result[position] = videos[index]!; }, turn);
  return result;
}

/** Queue search stops as soon as the visible result budget is full. Long or
 * rare queries yield between slices so keyboard input stays responsive. */
export async function searchRoomCandidates(
  videos: readonly LibraryVideo[], query: string, limit = 20, turn = yieldCatalogTask,
) {
  const needle = query.trim().toLowerCase();
  const result: LibraryVideo[] = [];
  if (!needle) return videos.slice(0, Math.min(limit, videos.length));
  for (let offset = 0; offset < videos.length && result.length < limit;) {
    await turn();
    const started = performance.now();
    const end = Math.min(videos.length, offset + 512);
    for (; offset < end && result.length < limit; offset++) {
      const video = videos[offset]!;
      if (`${video.name} ${video.remote?.channelName ?? ""}`.toLowerCase().includes(needle)) result.push(video);
      if (performance.now() - started >= 4) { offset++; break; }
    }
  }
  return result;
}

async function roomCatalogCandidatesAsync(
  videos: readonly LibraryVideo[], shared: Record<string, LibraryVideo>, turn: () => Promise<void>,
) {
  const output: LibraryVideo[] = [];
  const seenKeys = new Set<string>();
  const seenIds = new Set<string>();
  const append = (video: LibraryVideo) => {
    let item = video;
    const key = roomMediaKey(video);
    if (seenKeys.has(key)) return;
    if (seenIds.has(video.id)) item = { ...video, id: `room:${key}:candidate-${output.length}` };
    seenKeys.add(key);
    seenIds.add(item.id);
    output.push(item);
  };
  await forEachCatalogSlice(videos, video => {
    const session = shared[video.id];
    if (!session) { append(video); return; }
    if (roomMediaKey(session) !== roomMediaKey(video)) append({ ...video, id: `room:${roomMediaKey(video)}` });
    else append(session);
  }, turn);
  const sessions = Object.values(shared);
  await forEachCatalogSlice(sessions, append, turn);
  return output;
}
