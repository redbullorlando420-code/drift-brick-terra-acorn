import { forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';
import type { FollowedChannel, LibraryVideo } from './types';
import type { SavedVideoLink } from './recovery-links';

export type OfflineArtwork = { at: number; bytes: number };
export type OfflineStorage = { artwork: Map<string, OfflineArtwork>; links: SavedVideoLink[]; savedAt?: number };
export const youtubeRecoveryUrl = (value: string) => {
  try { const url = new URL(value); return url.protocol === 'https:' && /^(?:www\.|m\.)?youtube\.com$|^youtu\.be$/i.test(url.hostname) ? url.href : undefined; } catch { return; }
};
const timestamp = (at: number | undefined, now: number) => typeof at === 'number' && Number.isFinite(at) && at > 0 && at <= now ? at : undefined;
/** On-demand scalar audit; upload dates are never used as cache timestamps.
 * Retains at most twelve recovery previews, no media blobs or second catalog. */
export async function prepareOfflineCacheAudit(videos: readonly LibraryVideo[], follows: readonly FollowedChannel[], storage: OfflineStorage, now: number, turn = yieldCatalogTask) {
  const channels = follows.filter(row => row.kind === 'youtube' && !row.id.startsWith('ytpl:') && !row.importNeedsReview);
  const bySource = new Map(channels.map(row => [row.id, row.id])), byChannel = new Map(channels.filter(row => row.channelId).map(row => [row.channelId!, row.id]));
  const covered = new Set<string>(); let cachedVideos = 0, posters = 0, offlineArtwork = 0, artworkBytes = 0, oldestArtworkAt: number | undefined;
  await forEachCatalogSlice(videos, video => {
    if (video.remote?.kind !== 'youtube') return;
    cachedVideos++;
    const channel = byChannel.get(video.remote.channelId ?? '') ?? bySource.get(video.folderId);
    if (channel) covered.add(channel);
    if (video.poster) posters++;
    const artwork = storage.artwork.get(video.id);
    if (artwork) { offlineArtwork++; artworkBytes += artwork.bytes;
      const at = timestamp(artwork.at, now); if (at) oldestArtworkAt = Math.min(oldestArtworkAt ?? at, at); }
  }, turn);
  let oldestObservationAt: number | undefined, observedChannels = 0, failedChannels = 0;
  for (const channel of channels) {
    const at = timestamp(channel.lastCheckedAt, now);
    if (at) { observedChannels++; oldestObservationAt = Math.min(oldestObservationAt ?? at, at); }
    if (channel.lastProviderFailure) failedChannels++;
  }
  let recoverableLinks = 0; const recoveryPreview: SavedVideoLink[] = [], urls = new Set<string>();
  await forEachCatalogSlice(storage.links, row => {
    const url = youtubeRecoveryUrl(row.url); if (!url || urls.has(url)) return; urls.add(url); recoverableLinks++;
    if (recoveryPreview.length < 12) recoveryPreview.push({ ...row, url });
  }, turn);
  await turn();
  return { at: now, channels: channels.length, coveredChannels: covered.size, cachedVideos, posters, offlineArtwork, artworkBytes,
    oldestArtworkAt, observedChannels, oldestObservationAt, failedChannels, catalogSavedAt: timestamp(storage.savedAt, now), recoverableLinks, recoveryPreview };
}
export type OfflineCacheAudit = Awaited<ReturnType<typeof prepareOfflineCacheAudit>>;
