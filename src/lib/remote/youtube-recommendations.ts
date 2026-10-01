import type { LibraryVideo } from "@/lib/videos/types";

export type YoutubeTaste = {
  tags: Record<string, string[]>;
  history: Array<{ id: string; at: number }>;
  viewCounts: Record<string, number>;
  favorites: Record<string, true | undefined>;
  likes: Record<string, true | undefined>;
  ratingOf: (id: string) => number;
  tagIsLiked: (tag: string) => boolean;
  tagHasHeartHistory: (tag: string) => boolean;
  ratingPreference: (rating: number) => number;
  watchScore: (id: string) => number;
  creatorIsLiked: (creator: string) => boolean;
  creatorRating: (creator: string) => number;
  shuffle?: (id: string) => number;
  now?: number;
  limit?: number;
};

type RankedVideo = { video: LibraryVideo; score: number; creator: string; shuffle: number };
const catalogIndexes = new WeakMap<LibraryVideo[], Map<string, LibraryVideo>>();

/** Sort order used by the shelf: a negative value means left ranks first. */
function compareRanked(left: RankedVideo, right: RankedVideo) {
  return right.score - left.score || left.shuffle - right.shuffle || right.video.addedAt - left.video.addedAt;
}

/** Keep only the requested best items per creator in a worst-first heap. */
function keepCreatorCandidate(bucket: RankedVideo[], row: RankedVideo, max: number) {
  if (bucket.length < max) {
    bucket.push(row);
    let child = bucket.length - 1;
    while (child > 0) {
      const parent = Math.floor((child - 1) / 2);
      if (compareRanked(bucket[parent], bucket[child]) >= 0) break;
      [bucket[parent], bucket[child]] = [bucket[child], bucket[parent]];
      child = parent;
    }
    return;
  }
  if (compareRanked(row, bucket[0]) >= 0) return;
  bucket[0] = row;
  let parent = 0;
  while (true) {
    const left = parent * 2 + 1;
    if (left >= bucket.length) break;
    const right = left + 1;
    const worseChild = right < bucket.length && compareRanked(bucket[left], bucket[right]) < 0 ? right : left;
    if (compareRanked(bucket[parent], bucket[worseChild]) >= 0) break;
    [bucket[parent], bucket[worseChild]] = [bucket[worseChild], bucket[parent]];
    parent = worseChild;
  }
}

/** Personalizes from explicit feedback and observed viewing, then interleaves
 * creators so a deep archive from one prolific channel cannot fill the shelf. */
export function createYoutubeRecommendationRanker(videos: LibraryVideo[], taste: YoutubeTaste, candidates = videos) {
  const requested = taste.limit ?? videos.length;
  const max = Number.isFinite(requested) ? Math.max(0, Math.floor(requested)) : 0;
  if (!max || !videos.length) return (_shuffle?: (id: string) => number) => [] as LibraryVideo[];
  const now = taste.now ?? Date.now();
  const watchedAt = new Map<string, number>();
  for (const entry of taste.history) watchedAt.set(entry.id, Math.max(watchedAt.get(entry.id) ?? 0, entry.at));
  const activeCreatorWatch = new Map<string, number>();
  const latestWatchedPublishAt = new Map<string, number>();
  const tagEvidence = new Map<string, { total: number; count: number }>();
  const creatorAffinity = new Map<string, number>();
  const creatorEvidenceCount = new Map<string, number>();
  const creatorKey = (video: LibraryVideo) => video.remote?.channelId || video.remote?.channelName?.trim().toLowerCase() || video.folderId;
  let byId = catalogIndexes.get(videos);
  if (!byId) {
    byId = new Map();
    for (const video of videos) if (video.remote?.kind === "youtube" && !video.remote.live) byId.set(video.id, video);
    catalogIndexes.set(videos, byId);
  }
  const ratings = new Map<string, number>();

  for (const [id, at] of watchedAt) {
    const video = byId.get(id);
    const creator = video ? creatorKey(video) : undefined;
    if (creator && now - at < 180 * 86_400_000) {
      activeCreatorWatch.set(creator, (activeCreatorWatch.get(creator) ?? 0) + (now - at < 30 * 86_400_000 ? 2 : 1));
      latestWatchedPublishAt.set(creator, Math.max(latestWatchedPublishAt.get(creator) ?? 0, video?.addedAt ?? 0));
    }
  }
  for (const video of byId.values()) {
    const rating = taste.ratingOf(video.id);
    ratings.set(video.id, rating);
    const feedback = rating === 1 ? -3 : Math.max(taste.ratingPreference(rating), taste.favorites[video.id] ? 2 : 0, taste.likes[video.id] ? 1 : 0);
    const watch = Math.min(2, taste.watchScore(video.id) / 4 + Math.log2(1 + (taste.viewCounts[video.id] ?? 0)) * 0.35);
    const evidence = feedback + watch;
    for (const tag of new Set((taste.tags[video.id] ?? []).map((raw) => raw.trim().toLowerCase()))) {
      if (!tag || tag.length < 3) continue;
      if (evidence) {
        const row = tagEvidence.get(tag) ?? { total: 0, count: 0 };
        row.total += evidence;
        row.count += 1;
        tagEvidence.set(tag, row);
      }
    }
    const creator = creatorKey(video);
    if (creator && evidence) {
      creatorAffinity.set(creator, (creatorAffinity.get(creator) ?? 0) + evidence / 5);
      creatorEvidenceCount.set(creator, (creatorEvidenceCount.get(creator) ?? 0) + 1);
    }
  }

  const scored: Omit<RankedVideo, "shuffle">[] = [];
  const creatorFeedback = new Map<string, number>();
  const tagScores = new Map<string, { inferred: number; explicit: number }>();
  const candidateIds = new Set<string>();
  for (const video of candidates) {
    if (!byId.has(video.id) || candidateIds.has(video.id)) continue;
    candidateIds.add(video.id);
    const creatorLabel = video.remote?.channelName?.trim() ?? "";
    const creator = creatorKey(video);
    const rating = ratings.get(video.id) ?? 0;
    const watched = watchedAt.has(video.id) || (taste.viewCounts[video.id] ?? 0) > 0;
    const tags = [...new Set((taste.tags[video.id] ?? []).map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length >= 3))];
    for (const tag of tags) if (!tagScores.has(tag)) {
      const row = tagEvidence.get(tag);
      tagScores.set(tag, { inferred: row ? row.total / (row.count + 2) : 0,
        explicit: taste.tagIsLiked(tag) ? 12 : taste.tagHasHeartHistory(tag) ? -5 : 0 });
    }
    const tagScore = tags.reduce((sum, tag) => {
      return sum + (tagScores.get(tag)?.inferred ?? 0);
    }, 0) / Math.max(tags.length, 1);
    const explicitTagScore = tags.reduce((sum, tag) => sum + (tagScores.get(tag)?.explicit ?? 0), 0);
    const creatorWatch = activeCreatorWatch.get(creator) ?? 0;
    if (!creatorFeedback.has(creatorLabel)) creatorFeedback.set(creatorLabel,
      (taste.creatorIsLiked(creatorLabel) ? 14 : 0) + taste.ratingPreference(taste.creatorRating(creatorLabel)) * 3);
    const creatorScore = (creatorAffinity.get(creator) ?? 0) / Math.max(1, creatorEvidenceCount.get(creator) ?? 0);
    const score = tagScore * 10
      + creatorScore * 2.5
      + Math.min(24, creatorWatch * 7)
      + (creatorFeedback.get(creatorLabel) ?? 0)
      + explicitTagScore
      + (watched ? -28 : 10)
      + (creatorWatch && video.addedAt < (latestWatchedPublishAt.get(creator) ?? 0) ? Math.min(10, Math.log2(1 + ((latestWatchedPublishAt.get(creator) ?? 0) - video.addedAt) / 86_400_000) * 2) : 0)
      + (rating === 1 ? -50 : 0)
      + (taste.favorites[video.id] ? -8 : 0)
      + (taste.likes[video.id] ? -5 : 0)
      + (video.addedAt > now - 90 * 86_400_000 ? 2 : 0);
    scored.push({ video, score, creator: creator || `unknown:${video.id}` });
  }
  // Feedback/evidence is stable between reshuffles. Compute it once, then
  // change only the seeded tie-breaker when the user asks for another mix.
  return (shuffle = taste.shuffle) => {
    const buckets = new Map<string, RankedVideo[]>();
    for (const candidate of scored) {
      const row = { ...candidate, shuffle: shuffle?.(candidate.video.id) ?? 0 };
      const bucket = buckets.get(row.creator) ?? [];
      keepCreatorCandidate(bucket, row, max);
      if (!buckets.has(row.creator)) buckets.set(row.creator, bucket);
    }
    // The final shelf can never show more than `max` videos. Retain at most that
    // many candidates per creator, then sort only the bounded creator buckets
    // instead of sorting every row in a large historical archive globally.
    for (const bucket of buckets.values()) bucket.sort(compareRanked);
    const orderedCreators = [...buckets.entries()].sort((a, b) => (b[1][0]?.score ?? 0) - (a[1][0]?.score ?? 0) || (a[1][0]?.shuffle ?? 0) - (b[1][0]?.shuffle ?? 0) || a[0].localeCompare(b[0])).map(([creator]) => creator);
    const result: LibraryVideo[] = [];
    while (result.length < max && orderedCreators.length) {
      const remaining: string[] = [];
      for (const creator of orderedCreators) {
        const item = buckets.get(creator)?.shift();
        if (item) result.push(item.video);
        if (buckets.get(creator)?.length) remaining.push(creator);
        if (result.length >= max) break;
      }
      orderedCreators.splice(0, orderedCreators.length, ...remaining);
    }
    return result;
  };
}

export function rankYoutubeRecommendations(videos: LibraryVideo[], taste: YoutubeTaste, candidates = videos) {
  return createYoutubeRecommendationRanker(videos, taste, candidates)();
}
