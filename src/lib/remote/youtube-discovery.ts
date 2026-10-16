import type { FollowedChannel, LibraryVideo } from "../videos/types";
import { topicsForVideo } from "../videos/topics.ts";
import { youtubeContentKind } from '../videos/youtube-metadata.ts';
import { forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';

type Tags = Record<string, string[]>;
const topicIndexes = new WeakMap<LibraryVideo[], { tags: Tags; index: Map<string, LibraryVideo[]> }>();
function topicCollector(tags: Tags) {
  const index = new Map<string, LibraryVideo[]>(), seen = new Set<string>();
  const add = (video: LibraryVideo) => {
    if (video.remote?.kind !== 'youtube' || youtubeContentKind(video) === 'live' || youtubeContentKind(video) === 'upcoming' || video.isSample || seen.has(video.id)) return;
    seen.add(video.id);
    for (const tag of topicsForVideo(video, tags[video.id])) {
      const rows = index.get(tag);
      if (rows) rows.push(video); else index.set(tag, [video]);
    }
  };
  return { index, add };
}

/** Build on exploration, then share the exact same rows between filters,
 * topic counts and shelves. Immutable catalog/tag replacements invalidate it. */
export function youtubeTopicIndex(videos: LibraryVideo[], tags: Tags) {
  const cached = topicIndexes.get(videos);
  if (cached?.tags === tags) return cached.index;
  const { index, add } = topicCollector(tags);
  for (const video of videos) add(video);
  topicIndexes.set(videos, { tags, index });
  return index;
}

/** Complete topic counts, built between paints rather than in React render. */
export async function prepareYoutubeTopics(videos: LibraryVideo[], tags: Tags, signal: AbortSignal, turn = yieldCatalogTask) {
  const cached = topicIndexes.get(videos);
  if (cached?.tags === tags) return cached.index;
  const { index, add } = topicCollector(tags);
  const next = async () => { signal.throwIfAborted(); await turn(); signal.throwIfAborted(); };
  await forEachCatalogSlice(videos, add, next);
  signal.throwIfAborted();
  topicIndexes.set(videos, { tags, index });
  return index;
}

export function releaseYoutubeTopics(videos: LibraryVideo[], tags: Tags) {
  if (topicIndexes.get(videos)?.tags === tags) topicIndexes.delete(videos);
}

/** Saved creator identity survives display-name changes and playlist imports. */
export function youtubeOutsideFollows(videos: LibraryVideo[], follows: FollowedChannel[]) {
  return videos.filter(youtubeOutsideFollowPredicate(follows));
}

export function youtubeOutsideFollowPredicate(follows: FollowedChannel[]) {
  const ids = new Set<string>();
  const names = new Set<string>();
  const legacyNames = new Set<string>();
  for (const follow of follows) if (follow.kind === "youtube") {
    ids.add(follow.id);
    if (follow.channelId) ids.add(follow.channelId);
    if (follow.id.startsWith("yt:")) ids.add(follow.id.slice(3));
    names.add(follow.title.trim().toLowerCase());
    if (!follow.channelId && !follow.id.startsWith("yt:")) legacyNames.add(follow.title.trim().toLowerCase());
  }
  return (video: LibraryVideo) => video.remote?.kind === "youtube" && youtubeContentKind(video) !== 'live' && youtubeContentKind(video) !== 'upcoming' && !video.isSample
    && !ids.has(video.folderId) && !(video.remote.channelId && ids.has(video.remote.channelId))
    && !(video.remote.channelId ? legacyNames : names).has(video.remote.channelName?.trim().toLowerCase() ?? "");
}
