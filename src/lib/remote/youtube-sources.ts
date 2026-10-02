import type { FollowedChannel, LibraryVideo } from "../videos/types";
import { peekYoutubeCoverageOwner, youtubeCoverageCounts, youtubeCoverageIndex } from './youtube-coverage.ts';

/** Provider IDs are case-sensitive. Titles and thumbnail URLs are never identity. */
export function youtubeVideoKey(video: LibraryVideo): string | undefined {
  if (video.remote?.kind !== "youtube") return undefined;
  const id = video.remote.videoId?.trim() || (/^yt:[A-Za-z0-9_-]{11}$/.test(video.id) ? video.id.slice(3) : "");
  return id ? `yt:${id}` : undefined;
}

type Index = {
  bySource: Map<string, LibraryVideo[]>;
  byChannel: Map<string, LibraryVideo[]>;
  distinctVideos: number;
  duplicateRows: number;
  duplicateGroups: number;
};
const indexes = new WeakMap<LibraryVideo[], Index>();
let latestIndex: WeakRef<Index> | undefined;
export const peekYoutubeSourceIndex = (videos: LibraryVideo[]) => indexes.get(videos);
/** Reuse an already-built creator index even when the caller holds the full
 * catalog and the shelf indexed its YouTube slice. Never retain an old index. */
export function peekYoutubeOwner(videos: LibraryVideo[], video: LibraryVideo): LibraryVideo[] {
  const index = indexes.get(videos) ?? latestIndex?.deref();
  if (video.remote?.kind !== 'youtube') return [];
  if (!index) return peekYoutubeCoverageOwner(videos, video);
  const rows = index.byChannel.get(video.remote.channelId ?? '') ?? index.bySource.get(video.folderId) ?? [];
  return rows.some(row => row === video) ? rows : peekYoutubeCoverageOwner(videos, video);
}

/** Shared by coverage, creator panels, scheduling and diagnostics. A repeated
 * video imported through a playlist keeps an edge to every saved source. */
export function youtubeSourceIndex(videos: LibraryVideo[]): Index {
  const cached = indexes.get(videos);
  if (cached) { latestIndex = new WeakRef(cached); return cached; }
  const bySource = new Map<string, LibraryVideo[]>(), byChannel = new Map<string, LibraryVideo[]>();
  const seen = new Set<string>(), duplicates = new Set<string>();
  let duplicateRows = 0;
  const add = (map: Map<string, LibraryVideo[]>, key: string, video: LibraryVideo) => {
    const rows = map.get(key);
    if (rows) rows.push(video); else map.set(key, [video]);
  };
  for (const video of videos) {
    if (video.remote?.kind !== "youtube" || video.isSample) continue;
    const key = youtubeVideoKey(video) ?? video.id;
    if (seen.has(key)) { duplicateRows++; duplicates.add(key); continue; }
    seen.add(key);
    // Live checks do not count as upload coverage.
    if (video.remote.live) continue;
    for (const source of new Set([video.folderId, ...(video.remote.sourceIds ?? [])])) add(bySource, source, video);
    if (video.remote.channelId) add(byChannel, video.remote.channelId, video);
  }
  const result = { bySource, byChannel, distinctVideos: seen.size, duplicateRows, duplicateGroups: duplicates.size };
  indexes.set(videos, result);
  latestIndex = new WeakRef(result);
  return result;
}

export function youtubeVideosForSource(index: Index, source: Pick<FollowedChannel, "id" | "channelId">): LibraryVideo[] {
  const direct = index.bySource.get(source.id) ?? [];
  if (source.id.startsWith("ytpl:")) return direct;
  const channelId = source.channelId || (/^yt:UC[A-Za-z0-9_-]{20,}$/.test(source.id) ? source.id.slice(3) : "");
  const channel = channelId ? index.byChannel.get(channelId) ?? [] : [];
  if (!channel.length || channel === direct) return direct;
  if (!direct.length) return channel;
  const rows = new Map(direct.map(video => [youtubeVideoKey(video) ?? video.id, video]));
  for (const video of channel) rows.set(youtubeVideoKey(video) ?? video.id, video);
  return [...rows.values()];
}

export function youtubeSourceCounts(videos: LibraryVideo[], sources: Array<Pick<FollowedChannel, "id" | "channelId">>) {
  return youtubeCoverageCounts(youtubeCoverageIndex(videos), sources);
}

/** One stored card, multiple source edges. Keep its primary folder stable so
 * refreshes of overlapping playlists cannot steal a creator's whole archive. */
export function retainYoutubeSources(previous: LibraryVideo | undefined, incoming: LibraryVideo): LibraryVideo {
  if (previous?.remote?.kind !== "youtube" || incoming.remote?.kind !== "youtube") return incoming;
  const oldSources = previous.remote.sourceIds ?? [previous.folderId];
  const nextSources = new Set([...oldSources, previous.folderId, incoming.folderId, ...(incoming.remote.sourceIds ?? [])]);
  const sourcesUnchanged = oldSources.length === nextSources.size && oldSources.every(id => nextSources.has(id));
  if (sourcesUnchanged && incoming.folderId === previous.folderId && incoming.id === previous.id) {
    return previous.remote.sourceIds && incoming.remote.sourceIds !== previous.remote.sourceIds
      ? { ...incoming, remote: { ...incoming.remote, sourceIds: previous.remote.sourceIds } } : incoming;
  }
  return { ...incoming, id: previous.id, folderId: previous.folderId, remote: { ...incoming.remote, sourceIds: sourcesUnchanged ? previous.remote.sourceIds : [...nextSources] } };
}
