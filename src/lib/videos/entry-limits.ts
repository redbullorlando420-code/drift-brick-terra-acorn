import type { LibraryVideo, FollowedChannel } from './types';
import type { PullSettings } from '../pull-settings.ts';
import { forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';
import { catalogIdentityKeys, catalogIdentityKey, lookupCatalogIdentity } from './catalog-identity.ts';
import { remoteVideoIndexAsync } from './remote-merge.ts';

export type EntryGroup = 'youtube' | 'twitch' | 'adult' | 'other';
export type EntryCounts = Record<EntryGroup | 'total', number>;
export const EMPTY_ENTRY_COUNTS: EntryCounts = { total: 0, youtube: 0, twitch: 0, adult: 0, other: 0 };
const adultKinds = new Set(['eporner', 'redtube', 'chaturbate', 'myfreecams', 'reddit', 'booru', 'redgifs']);
export function entryGroup(video: LibraryVideo): EntryGroup | null {
  if (!video.remote || video.isSample) return null;
  const kind = video.remote.kind;
  return kind === 'youtube' || kind === 'twitch' ? kind : adultKinds.has(kind) ? 'adult' : 'other';
}
const completed = new WeakMap<LibraryVideo[], EntryCounts>();
const pending = new WeakMap<LibraryVideo[], Promise<EntryCounts>>();
/** Counts include hidden/saved/live cards: each retained record uses memory. */
export function remoteEntryCounts(videos: LibraryVideo[]): Promise<EntryCounts> {
  const cached = completed.get(videos);
  if (cached) return Promise.resolve(cached);
  const running = pending.get(videos);
  if (running) return running;
  const counts = { ...EMPTY_ENTRY_COUNTS };
  const work = forEachCatalogSlice(videos, video => {
    const group = entryGroup(video);
    if (group) { counts[group]++; counts.total++; }
  }, yieldCatalogTask).then(() => { completed.set(videos, counts); return counts; }).finally(() => pending.delete(videos));
  pending.set(videos, work);
  return work;
}
export function remainingEntrySlots(counts: EntryCounts, settings: Readonly<PullSettings>, group: EntryGroup) {
  const limit = settings[`${group}MaxEntries`];
  return Math.max(0, Math.min(settings.remoteMaxEntries - counts.total, limit - counts[group]));
}
/** Admission precedes metadata, merging and disk writes. Existing identities
 * can refresh at/over a cap; rejected new rows never acquire tags or storage. */
export async function admitRemoteEntries(existing: LibraryVideo[], incoming: LibraryVideo[], settings: Readonly<PullSettings>, known?: ReadonlyMap<string, unknown>) {
  const counts = { ...await remoteEntryCounts(existing) };
  const index = known ?? await remoteVideoIndexAsync(existing);
  const admitted: LibraryVideo[] = [], newIds = new Map<string, string>(), skippedSources = new Set<string>();
  let skipped = 0, added = 0;
  await forEachCatalogSlice(incoming, video => {
    const key = catalogIdentityKey(video) ?? video.id;
    const group = entryGroup(video);
    if (!group || lookupCatalogIdentity(index,video) !== undefined || lookupCatalogIdentity(newIds,video) !== undefined) {
      const found = lookupCatalogIdentity(index,video);
      const previous = typeof found === 'number' ? existing[found] : found as LibraryVideo | undefined;
      const canonical = previous?.id ?? lookupCatalogIdentity(newIds,video) ?? video.id;
      admitted.push(canonical !== video.id ? { ...video, id: canonical } : video);
      return;
    }
    if (!remainingEntrySlots(counts, settings, group)) {
      skipped++; skippedSources.add(video.folderId);
      for (const source of video.remote?.sourceIds ?? []) skippedSources.add(source);
      return;
    }
    newIds.set(video.id,video.id); for(const alias of catalogIdentityKeys(video)) newIds.set(alias,video.id); added++; counts[group]++; counts.total++; admitted.push(video);
  }, yieldCatalogTask);
  return { videos: admitted, skipped, skippedSources, added, counts, settings };
}
/** Additive merges can carry forward their five counters without a rescan. */
export function rememberEntryCounts(videos: LibraryVideo[], counts: EntryCounts) { completed.set(videos, counts); }

/** Revisit partially admitted pages after a limit is raised; do not skip the
 * rejected tail by publishing the provider's already-advanced continuation. */
export function holdEntryLimitCursors(previous: FollowedChannel[], incoming: FollowedChannel[], skippedSources: ReadonlySet<string>) {
  const saved = new Map(previous.map(channel => [channel.id, channel]));
  return incoming.map(channel => skippedSources.has(channel.id) ? { ...channel,
    playlistWalk: saved.get(channel.id)?.playlistWalk ? {...saved.get(channel.id)!.playlistWalk!,membership:'provisional' as const,completed:false} : undefined,
    catalogCursor: saved.get(channel.id)?.catalogCursor,
    catalogExhaustedAt: saved.get(channel.id)?.catalogExhaustedAt,
    twitchArchiveCursor: saved.get(channel.id)?.twitchArchiveCursor,
    twitchArchiveExhaustedAt: saved.get(channel.id)?.twitchArchiveExhaustedAt,
    twitchArchiveLastVideoId: saved.get(channel.id)?.twitchArchiveLastVideoId,
    ...(channel.twitchArchiveDiagnostics ? { twitchArchiveDiagnostics: { ...channel.twitchArchiveDiagnostics, stopReason: 'entry-limit' as const } } : {}),
    twitchClipCursor: saved.get(channel.id)?.twitchClipCursor,
    twitchClipExhaustedAt: saved.get(channel.id)?.twitchClipExhaustedAt,
    newestVideoId: saved.get(channel.id)?.newestVideoId,
  } : channel);
}
