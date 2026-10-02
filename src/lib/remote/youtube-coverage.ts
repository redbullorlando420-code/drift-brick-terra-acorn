import type { FollowedChannel, LibraryVideo } from '../videos/types.ts';
import { verifiedYoutubeSource } from '../videos/follow-import.ts';
import { forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';
import { youtubeVideoKey } from './youtube-sources.ts';

/** Coverage needs counters, not another graph retaining every video card.
 * Bounded numeric positions also keep creator preview picks available. */
export type YoutubeCoverageIndex = {
  bySource: Map<string, number>;
  byChannel: Map<string, number>;
  overlap: Map<string, Map<string, number>>;
  newestBySource: Map<string, number>;
  newestByChannel: Map<string, number>;
  ownerSamples: Map<string, number[]>;
  distinctVideos: number;
  duplicateRows: number;
  duplicateGroups: number;
};
const completed = new WeakMap<LibraryVideo[], YoutubeCoverageIndex>();
const pending = new WeakMap<LibraryVideo[], Promise<YoutubeCoverageIndex>>();
function builder() {
  const index: YoutubeCoverageIndex = { bySource: new Map(), byChannel: new Map(), overlap: new Map(), newestBySource: new Map(), newestByChannel: new Map(), ownerSamples: new Map(), distinctVideos: 0, duplicateRows: 0, duplicateGroups: 0 };
  const seen = new Set<string>(), duplicates = new Set<string>();
  const increment = (map: Map<string, number>, key: string) => map.set(key, (map.get(key) ?? 0) + 1);
  const visit = (video: LibraryVideo, position: number) => {
    if (video.remote?.kind !== 'youtube' || video.isSample) return;
    const key = youtubeVideoKey(video) ?? video.id;
    if (seen.has(key)) { index.duplicateRows++; duplicates.add(key); return; }
    seen.add(key);
    if (video.remote.live) return;
    const channel = video.remote.channelId;
    if (channel) {
      increment(index.byChannel, channel);
      index.newestByChannel.set(channel, Math.max(index.newestByChannel.get(channel) ?? 0, video.addedAt));
      let samples = index.ownerSamples.get(channel);
      if (!samples) index.ownerSamples.set(channel, samples = []);
      const count = index.byChannel.get(channel)!;
      if (samples.length < 64) samples.push(position);
      else {
        // Deterministic reservoir: bounded old/new archive variety, no copies
        // of the full creator archive and no retained video objects.
        const slot = (Math.imul(position + 1, 2654435761) >>> 0) % count;
        if (slot < samples.length) samples[slot] = position;
      }
    }
    const addSource = (source: string) => {
      increment(index.bySource, source);
      index.newestBySource.set(source, Math.max(index.newestBySource.get(source) ?? 0, video.addedAt));
      if (!channel) return;
      let channels = index.overlap.get(source);
      if (!channels) index.overlap.set(source, channels = new Map());
      increment(channels, channel);
    };
    addSource(video.folderId);
    const sources = video.remote.sourceIds;
    if (sources) for (let i = 0; i < sources.length; i++) {
      const source = sources[i]!;
      if (source !== video.folderId && sources.indexOf(source) === i) addSource(source);
    }
  };
  return { visit, finish() { index.distinctVideos = seen.size; index.duplicateGroups = duplicates.size; return index; } };
}
export function youtubeCoverageIndex(videos: LibraryVideo[]) {
  const cached = completed.get(videos);
  if (cached) return cached;
  const work = builder();
  for (let position = 0; position < videos.length; position++) work.visit(videos[position]!, position);
  const index = work.finish(); completed.set(videos, index); return index;
}
/** Disk-sized catalogs yield between short tasks; concurrent readers share work. */
export function youtubeCoverageIndexAsync(videos: LibraryVideo[]): Promise<YoutubeCoverageIndex> {
  const cached = completed.get(videos);
  if (cached) return Promise.resolve(cached);
  const running = pending.get(videos);
  if (running) return running;
  const work = builder();
  const result = forEachCatalogSlice(videos, work.visit, yieldCatalogTask).then(() => {
    const index = work.finish(); completed.set(videos, index); return index;
  }).finally(() => pending.delete(videos));
  pending.set(videos, result); return result;
}
/** Exact union cardinality, including legacy source aliases and playlist edges. */
export function youtubeCoverageCounts(index: YoutubeCoverageIndex, sources: Array<Pick<FollowedChannel, 'id' | 'channelId'>>) {
  return new Map(sources.map(source => {
    const direct = index.bySource.get(source.id) ?? 0;
    const channel = source.channelId || (/^yt:UC[A-Za-z0-9_-]{20,}$/.test(source.id) ? source.id.slice(3) : '');
    const count = source.id.startsWith('ytpl:') || !channel ? direct
      : direct + (index.byChannel.get(channel) ?? 0) - (index.overlap.get(source.id)?.get(channel) ?? 0);
    return [source.id, count];
  }));
}
export function youtubeCatalogCoverage(index: YoutubeCoverageIndex, follows: FollowedChannel[]) {
  const sources = follows.filter(source => source.kind === 'youtube');
  const review = sources.filter(source => source.importNeedsReview).length;
  const verified = sources.filter(verifiedYoutubeSource);
  const counts = youtubeCoverageCounts(index, verified);
  const missing = verified.filter(source => !counts.get(source.id)).map(source => source.id);
  return { total: verified.length, verified: verified.length, ready: verified.length - missing.length, missing, review, pending: sources.length - verified.length - review };
}
export function youtubeSourceNewest(index: YoutubeCoverageIndex, source: Pick<FollowedChannel, 'id' | 'channelId'>) {
  const direct = index.newestBySource.get(source.id) ?? 0;
  if (source.id.startsWith('ytpl:')) return direct;
  const channel = source.channelId || (/^yt:UC[A-Za-z0-9_-]{20,}$/.test(source.id) ? source.id.slice(3) : '');
  return Math.max(direct, index.newestByChannel.get(channel) ?? 0);
}
/** Never builds an index on the preview click path. Samples belong to the
 * exact immutable catalog snapshot and cannot retain obsolete card objects. */
export function peekYoutubeCoverageOwner(videos: LibraryVideo[], video: LibraryVideo): LibraryVideo[] {
  const channel = video.remote?.channelId;
  if (!channel) return [];
  const samples = completed.get(videos)?.ownerSamples.get(channel);
  return samples ? samples.map(position => videos[position]!).filter(row => row.remote?.channelId === channel) : [];
}
