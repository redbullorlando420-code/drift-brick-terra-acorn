import type { FollowedChannel, LibraryVideo } from "../videos/types";
import { topicsForVideo } from "../videos/topics.ts";

type Tags = Record<string, string[]>;
const topicIndexes = new WeakMap<LibraryVideo[], { tags: Tags; index: Map<string, LibraryVideo[]> }>();

/** Build on exploration, then share the exact same rows between filters,
 * topic counts and shelves. Immutable catalog/tag replacements invalidate it. */
export function youtubeTopicIndex(videos: LibraryVideo[], tags: Tags) {
  const cached = topicIndexes.get(videos);
  if (cached?.tags === tags) return cached.index;
  const index = new Map<string, LibraryVideo[]>();
  const seen = new Set<string>();
  for (const video of videos) {
    if (video.remote?.kind !== "youtube" || video.remote.live || video.isSample || seen.has(video.id)) continue;
    seen.add(video.id);
    for (const tag of topicsForVideo(video, tags[video.id])) {
      const rows = index.get(tag);
      if (rows) rows.push(video);
      else index.set(tag, [video]);
    }
  }
  topicIndexes.set(videos, { tags, index });
  return index;
}

/** Saved creator identity survives display-name changes and playlist imports. */
export function youtubeOutsideFollows(videos: LibraryVideo[], follows: FollowedChannel[]) {
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
  return videos.filter(video => video.remote?.kind === "youtube" && !video.remote.live && !video.isSample
    && !ids.has(video.folderId) && !(video.remote.channelId && ids.has(video.remote.channelId))
    && !(video.remote.channelId ? legacyNames : names).has(video.remote.channelName?.trim().toLowerCase() ?? ""));
}
