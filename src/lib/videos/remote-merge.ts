import { repairLegacyYoutubeDate } from "../remote/youtube-page.ts";
import { retainYoutubeSources, youtubeVideoKey } from "../remote/youtube-sources.ts";
import type { LibraryVideo } from "./types";
import { copyCatalogArray, forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';

function sameList(left?: readonly string[], right?: readonly string[]) {
  return left === right || (left?.length === right?.length && left?.every((value, index) => value === right?.[index]));
}

/** Avoid allocating two JSON strings for every card in a large refresh. */
function sameRemote(left: LibraryVideo["remote"], right: LibraryVideo["remote"]) {
  if (left === right) return true;
  if (!left || !right) return left === right;
  return left.kind === right.kind
    && left.videoId === right.videoId
    && left.channelId === right.channelId
    && left.channelName === right.channelName
    && left.live === right.live
    && left.viewers === right.viewers
    && left.observedAt === right.observedAt
    && left.views === right.views
    && left.embedUrl === right.embedUrl
    && left.watchUrl === right.watchUrl
    && left.previewUrl === right.previewUrl
    && sameList(left.sourceKinds, right.sourceKinds)
    && sameList(left.sourceIds, right.sourceIds)
    && sameList(left.thumbFallbacks, right.thumbFallbacks)
    // Provider comments are intentionally not part of routine YouTube/Twitch
    // refresh payloads. If supplied, retain the fresh object safely.
    && left.comments === right.comments;
}

function sameVideo(left: LibraryVideo, right: LibraryVideo) {
  return left === right || (
    left.id === right.id
    && left.folderId === right.folderId
    && left.name === right.name
    && left.path === right.path
    && left.extension === right.extension
    && left.mime === right.mime
    && left.size === right.size
    && left.duration === right.duration
    && left.addedAt === right.addedAt
    && left.isSample === right.isSample
    && left.src === right.src
    && left.year === right.year
    && left.genre === right.genre
    && left.tagline === right.tagline
    && left.description === right.description
    && left.collection === right.collection
    && left.poster === right.poster
    && sameRemote(left.remote, right.remote)
  );
}

/**
 * Routine catalog responses are intentionally shallow and omit on-demand
 * details. Carry forward only durable card fields that they cannot author so
 * a metadata repair or fetched comments do not disappear on the next live
 * check. A newer non-empty provider name still wins (channel renames remain
 * possible), and no object is allocated when there is nothing to preserve.
 */
function retainDurableRemoteFields(previous: LibraryVideo | undefined, incoming: LibraryVideo) {
  incoming = retainYoutubeSources(previous, incoming);
  if (!previous?.remote || !incoming.remote) return incoming;
  const channelName = incoming.remote.channelName?.trim() || previous.remote.channelName?.trim();
  const comments = incoming.remote.comments?.length ? incoming.remote.comments : previous.remote.comments;
  const keepsName = Boolean(channelName && channelName !== incoming.remote.channelName);
  const keepsComments = Boolean(comments?.length && comments !== incoming.remote.comments);
  const keepsPublished = incoming.remote.kind === "youtube" && incoming.addedAt === 0 && repairLegacyYoutubeDate(previous).addedAt > 0;
  if (!keepsName && !keepsComments && !keepsPublished) return incoming;
  return {
    ...incoming,
    ...(keepsPublished ? { addedAt: previous.addedAt } : {}),
    remote: {
      ...incoming.remote,
      ...(keepsName ? { channelName } : {}),
      ...(keepsComments ? { comments } : {}),
    },
  };
}

function sameOrder(left: LibraryVideo[], right: LibraryVideo[]) {
  return left.length === right.length && left.every((video, index) => video === right[index]);
}

const remoteVideoIndexes = new WeakMap<LibraryVideo[], Map<string, LibraryVideo>>();

/** Share one id index among accounting, merging, and offline cleanup for a snapshot. */
export function remoteVideoIndex(videos: LibraryVideo[]) {
  const cached = remoteVideoIndexes.get(videos);
  if (cached) return cached;
  const index = new Map<string, LibraryVideo>();
  for (const video of videos) {
    index.set(video.id, video);
    const key = youtubeVideoKey(video);
    if (key && !index.has(key)) index.set(key, video);
  }
  remoteVideoIndexes.set(videos, index);
  return index;
}

const pendingIndexes = new WeakMap<LibraryVideo[], Promise<Map<string, LibraryVideo>>>();
/** Prepare the shared lookup without monopolizing input on large libraries. */
export function remoteVideoIndexAsync(videos: LibraryVideo[]): Promise<Map<string, LibraryVideo>> {
  const cached = remoteVideoIndexes.get(videos);
  if (cached) return Promise.resolve(cached);
  const pending = pendingIndexes.get(videos);
  if (pending) return pending;
  const index = new Map<string, LibraryVideo>();
  const work = forEachCatalogSlice(videos, video => {
    index.set(video.id, video);
    const key = youtubeVideoKey(video);
    if (key && !index.has(key)) index.set(key, video);
  }, yieldCatalogTask).then(() => { remoteVideoIndexes.set(videos, index); return index; }).finally(() => pendingIndexes.delete(videos));
  pendingIndexes.set(videos, work);
  return work;
}

/** Focused/bulk imports scan once per batch; transient positions cover only incoming IDs. */
export async function mergeRemoteCatalogAsync(existing: LibraryVideo[], incoming: LibraryVideo[]) {
  if (!incoming.length) return existing;
  const wanted = new Set(incoming.flatMap(video => [video.id, youtubeVideoKey(video) ?? video.id]));
  const positions = new Map<string, number>();
  await forEachCatalogSlice(existing, (video, index) => {
    const key = youtubeVideoKey(video);
    if (wanted.has(video.id)) positions.set(video.id, index);
    if (key && wanted.has(key) && !positions.has(key)) positions.set(key, index);
  }, yieldCatalogTask);
  const merged = await copyCatalogArray(existing, yieldCatalogTask);
  let changed = false;
  await forEachCatalogSlice(incoming, video => {
    const key = youtubeVideoKey(video);
    const index = positions.get(video.id) ?? (key ? positions.get(key) : undefined);
    const previous = index === undefined ? undefined : merged[index];
    let next = retainDurableRemoteFields(previous, video);
    if (previous?.remote?.live && next.remote?.live && (next.remote.observedAt ?? 0) < (previous.remote.observedAt ?? 0)) next = previous;
    else if (previous && sameVideo(previous, next)) next = previous;
    if (index === undefined) {
      positions.set(next.id, merged.length);
      if (key) positions.set(key, merged.length);
      merged.push(next); changed = true;
    } else if (next !== previous) { merged[index] = next; changed = true; }
  }, yieldCatalogTask);
  return changed ? merged : existing;
}

/** Additive archive merge using an index shared across a multi-creator sweep. */
export function mergeRemoteCatalog(existing: LibraryVideo[], incoming: LibraryVideo[], positions: Map<string, number>, mergedIncoming: LibraryVideo[]): LibraryVideo[] {
  let merged = existing;
  for (const video of incoming) {
    const key = youtubeVideoKey(video);
    const index = positions.get(video.id) ?? (key ? positions.get(key) : undefined);
    const previous = index === undefined ? undefined : merged[index];
    let next = retainDurableRemoteFields(previous, video);
    if (previous?.remote?.live && next.remote?.live && (next.remote.observedAt ?? 0) < (previous.remote.observedAt ?? 0)) next = previous;
    else if (previous && sameVideo(previous, next)) next = previous;
    if (index === undefined) {
      if (merged === existing) merged = existing.slice();
      positions.set(next.id, merged.length);
      if (key) positions.set(key, merged.length);
      merged.push(next);
    } else if (next !== previous) {
      if (merged === existing) merged = existing.slice();
      merged[index] = next;
    }
    mergedIncoming.push(next);
  }
  return merged;
}

/**
 * Merge a provider refresh without letting a shallow public response erase a
 * known remote archive. Twitch's public archive endpoint can legitimately
 * return a partial window (or no rows while it is rate-limited), and routine
 * YouTube refreshes intentionally return only uploads newer than the saved
 * feed cursor. Archive rows are therefore additive per channel. Fresh rows
 * still win by id, and stale live cards are turned offline when their channel
 * has checked successfully.
 *
 * The original catalog order is retained for every existing card. This is
 * more than cosmetic: Zustand shallow selectors can now skip a shelf render
 * when a response repeats its prior rows, while a single changed card keeps
 * its neighbours' artwork and focus identity intact.
 */
function remoteRefreshPlan(existing: LibraryVideo[], incoming: LibraryVideo[], refreshedIds: string[], savedIds: Set<string>,
  options?: { index?: Map<string, LibraryVideo>; staleLiveIds?: string[] }) {
  const refreshed = new Set(refreshedIds), existingById = options?.index ?? remoteVideoIndex(existing);
  const fresh = new Map<string, LibraryVideo>();
  for (const video of incoming) {
    const previous = existingById.get(video.id) ?? existingById.get(youtubeVideoKey(video) ?? video.id);
    let next = retainDurableRemoteFields(previous, video);
    if (previous?.remote?.live && next.remote?.live && (next.remote.observedAt ?? 0) < (previous.remote.observedAt ?? 0)) next = previous;
    else if (previous && sameVideo(previous, next)) next = previous;
    fresh.set(next.id, next);
  }
  const visit = (video: LibraryVideo): LibraryVideo | undefined => {
    const next = fresh.get(video.id);
    if (next) { fresh.delete(video.id); return next; }
    if (!video.remote || !refreshed.has(video.folderId)) return video;
    if (video.remote.live) {
      // A successful check without a live card records one offline transition.
      options?.staleLiveIds?.push(video.id);
      return { ...video, tagline: 'Offline · saved channel', remote: { ...video.remote, live: false } };
    }
    // Partial routine pages cannot erase historical archives or saved cards.
    if (savedIds.has(video.id) || video.remote.kind === 'twitch' || video.remote.kind === 'youtube' || video.folderId.startsWith('ytpl:')) return video;
  };
  return { fresh, visit };
}
export function mergeRemoteRefresh(existing: LibraryVideo[], incoming: LibraryVideo[], refreshedIds: string[], savedIds: Set<string>,
  options?: { index?: Map<string, LibraryVideo>; staleLiveIds?: string[] }): LibraryVideo[] {
  const plan = remoteRefreshPlan(existing, incoming, refreshedIds, savedIds, options);
  const merged: LibraryVideo[] = [];
  for (const video of existing) { const next = plan.visit(video); if (next) merged.push(next); }
  merged.push(...plan.fresh.values());
  return sameOrder(existing, merged) ? existing : merged;
}
/** Routine refreshes share the same merge contract while yielding the catalog traversal. */
export async function mergeRemoteRefreshAsync(existing: LibraryVideo[], incoming: LibraryVideo[], refreshedIds: string[], savedIds: Set<string>,
  options?: { index?: Map<string, LibraryVideo>; staleLiveIds?: string[] }): Promise<LibraryVideo[]> {
  const index = options?.index ?? await remoteVideoIndexAsync(existing);
  const plan = remoteRefreshPlan(existing, incoming, refreshedIds, savedIds, { ...options, index });
  const merged: LibraryVideo[] = [];
  let unchanged = true;
  await forEachCatalogSlice(existing, video => {
    const next = plan.visit(video);
    if (next !== video) unchanged = false;
    if (next) merged.push(next);
  }, yieldCatalogTask);
  if (plan.fresh.size) { unchanged = false; merged.push(...plan.fresh.values()); }
  return unchanged ? existing : merged;
}
