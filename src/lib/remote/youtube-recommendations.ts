import { createCreatorRankedPages, type CreatorRankedRow } from './creator-ranked-pages.ts';
import type { LibraryVideo } from "@/lib/videos/types";
import { youtubeContentKind, youtubePublicationTime } from '../videos/youtube-metadata.ts';
import { youtubeTagWeight } from '../videos/youtube-text-tags.ts';
import { applyInterestMultipliers, rankingTags, confidenceAdjustedPreference, normalizeRating, ratingAdjustedScore, ratingPreference, RATING_STAR_WEIGHTS } from '../videos/ranking-core.ts';

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
  creatorIsFavorited?: (creator: string) => boolean;
  marksOf?: (id: string) => number;
  shuffle?: (id: string) => number;
  now?: number;
  limit?: number;
};

const catalogIndexes = new WeakMap<LibraryVideo[], Map<string, LibraryVideo>>();
const EMPTY_TAGS: string[] = [];
const NO_INTERACTION = { watch: 0, marks: 0, tags: EMPTY_TAGS };

/** Personalizes from explicit feedback and observed viewing, then interleaves
 * creators so a deep archive from one prolific channel cannot fill the shelf. */
export function createYoutubeRecommendationRanker(videos: LibraryVideo[], taste: YoutubeTaste, candidates = videos) {
  const requested = taste.limit ?? videos.length;
  const max = Number.isFinite(requested) ? Math.max(0, Math.floor(requested)) : 0;
  if (!max || !videos.length) return Object.assign((_shuffle?: (id: string) => number, _page?: { offset: number; limit: number }) => [] as LibraryVideo[], { total: 0 });
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
    for (const video of videos) if (video.remote?.kind === "youtube" && youtubeContentKind(video) !== 'live' && youtubeContentKind(video) !== 'upcoming') byId.set(video.id, video);
    catalogIndexes.set(videos, byId);
  }
  const ratings = new Map<string, number>();
  const interactions = new Map<string, { watch: number; marks: number; tags: string[] }>();

  for (const [id, at] of watchedAt) {
    const video = byId.get(id);
    const creator = video ? creatorKey(video) : undefined;
    if (creator && now - at < 180 * 86_400_000) {
      activeCreatorWatch.set(creator, (activeCreatorWatch.get(creator) ?? 0) + (now - at < 30 * 86_400_000 ? 2 : 1));
      latestWatchedPublishAt.set(creator, Math.max(latestWatchedPublishAt.get(creator) ?? 0, video ? youtubePublicationTime(video) : 0));
    }
  }
  for (const video of byId.values()) {
    const rating = normalizeRating(taste.ratingOf(video.id));
    if (rating) ratings.set(video.id, rating);
    const feedback = rating === 1 ? -3 : Math.max(ratingPreference(rating), taste.favorites[video.id] ? 2 : 0, taste.likes[video.id] ? 1 : 0);
    const time = Math.max(0, Math.min(12, taste.watchScore(video.id) || 0));
    const marks = Math.max(0, Math.min(1_000_000, taste.marksOf?.(video.id) || 0));
    const tags = rankingTags(taste.tags[video.id] ?? EMPTY_TAGS);
    if (time || marks || tags.length) interactions.set(video.id, { watch: time, marks, tags });
    const watch = Math.min(2, time / 4 + Math.log2(1 + (taste.viewCounts[video.id] ?? 0)) * 0.35);
    const evidence = feedback + watch + (rating === 1 ? 0 : Math.min(2, Math.log2(1 + marks)));
    for (const tag of tags) {
      if (!tag || tag.length < 3) continue;
      if (rating > 0 || evidence) {
        const row = tagEvidence.get(tag) ?? { total: 0, count: 0 };
        const weight = youtubeTagWeight(video, tag);
        row.total += evidence * weight;
        row.count += weight;
        tagEvidence.set(tag, row);
      }
    }
    const creator = creatorKey(video);
    if (creator && (rating > 0 || evidence)) {
      creatorAffinity.set(creator, (creatorAffinity.get(creator) ?? 0) + evidence / 5);
      creatorEvidenceCount.set(creator, (creatorEvidenceCount.get(creator) ?? 0) + 1);
    }
  }

  const scored: CreatorRankedRow<LibraryVideo>[] = [];
  const creatorFeedback = new Map<string, { points: number; liked: boolean; favorite: boolean }>();
  const tagScores = new Map<string, { inferred: number; explicit: number }>();
  const candidateIds = new Set<string>();
  for (const video of candidates) {
    if (!byId.has(video.id) || candidateIds.has(video.id) || youtubeContentKind(video) === 'live' || youtubeContentKind(video) === 'upcoming') continue;
    candidateIds.add(video.id);
    const creatorLabel = video.remote?.channelName?.trim() ?? "";
    const creator = creatorKey(video);
    const rating = normalizeRating(ratings.get(video.id) ?? 0);
    if (rating === 1) continue;
    const watched = watchedAt.has(video.id) || (taste.viewCounts[video.id] ?? 0) > 0;
    const interaction = interactions.get(video.id) ?? NO_INTERACTION;
    const tags = interaction.tags;
    for (const tag of tags) if (!tagScores.has(tag)) {
      const row = tagEvidence.get(tag);
      tagScores.set(tag, { inferred: row ? confidenceAdjustedPreference(row.total, row.count) : 0,
        explicit: taste.tagIsLiked(tag) ? 12 : taste.tagHasHeartHistory(tag) ? -5 : 0 });
    }
    const tagScore = tags.reduce((sum, tag) => {
      return sum + (tagScores.get(tag)?.inferred ?? 0) * youtubeTagWeight(video, tag);
    }, 0) / Math.max(tags.length, 1);
    const explicitTagScore = Math.max(-15, Math.min(24, tags.reduce((sum, tag) => sum + (tagScores.get(tag)?.explicit ?? 0), 0)));
    const creatorWatch = activeCreatorWatch.get(creator) ?? 0;
    const publishedAt = youtubePublicationTime(video);
    if (!creatorFeedback.has(creatorLabel)) {
      const liked = taste.creatorIsLiked(creatorLabel), favorite = Boolean(taste.creatorIsFavorited?.(creatorLabel));
      creatorFeedback.set(creatorLabel, { liked, favorite, points: (liked ? 14 : 0) + (favorite ? 18 : 0) + ratingPreference(taste.creatorRating(creatorLabel)) * 3 });
    }
    const channel = creatorFeedback.get(creatorLabel)!;
    const creatorScore = (creatorAffinity.get(creator) ?? 0) / Math.max(1, creatorEvidenceCount.get(creator) ?? 0);
    const baseScore = tagScore * 10
      + creatorScore * 2.5
      + Math.min(24, creatorWatch * 7)
      + channel.points
      + explicitTagScore
      + (watched ? -28 : 10)
      + (creatorWatch && publishedAt > 0 && publishedAt < (latestWatchedPublishAt.get(creator) ?? 0) ? Math.min(10, Math.log2(1 + ((latestWatchedPublishAt.get(creator) ?? 0) - publishedAt) / 86_400_000) * 2) : 0)
      + (taste.favorites[video.id] ? 12 : 0)
      + (taste.likes[video.id] ? 6 : 0)
      + (publishedAt > 0 && publishedAt > now - 90 * 86_400_000 ? 2 : 0);
    scored.push({ video, score: applyInterestMultipliers(ratingAdjustedScore(baseScore, rating, RATING_STAR_WEIGHTS.youtube), {
      favorite: Boolean(taste.favorites[video.id]), liked: Boolean(taste.likes[video.id]), topics: tagScore * 10,
      tagHearts: tags.reduce((count, tag) => count + Number((tagScores.get(tag)?.explicit ?? 0) > 0), 0),
      creatorLiked: channel.liked, creatorFavorite: channel.favorite, watch: interaction.watch, marks: interaction.marks,
    }), creator: creator || `unknown:${video.id}`, publishedAt });
  }
  // Feedback/evidence is stable between reshuffles. Compute it once, then
  // change only the seeded tie-breaker when the user asks for another mix.
  const defaultShuffle = taste.shuffle;
  const pages = createCreatorRankedPages(scored);
  return Object.assign((shuffle = defaultShuffle, page?: { offset: number; limit: number }) => {
    const offset = page && Number.isFinite(page.offset) ? Math.max(0, Math.floor(page.offset)) : 0;
    const limit = page && Number.isFinite(page.limit) ? Math.max(0, Math.floor(page.limit)) : max;
    return pages(shuffle, offset, limit);
  }, { total: scored.length });
}

export function rankYoutubeRecommendations(videos: LibraryVideo[], taste: YoutubeTaste, candidates = videos) {
  return createYoutubeRecommendationRanker(videos, taste, candidates)();
}
