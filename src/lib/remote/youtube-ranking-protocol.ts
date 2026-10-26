import { installTopicAliases,EMPTY_TOPIC_ALIASES,reviewedRankingTag,type TopicAliasLedger } from '../videos/topic-aliases.ts';
import type { ExposureLedger } from '../videos/recommendation-exposure.ts';
import { canonicalTopic } from '../videos/topics.ts';
import type { RejectionLedger } from '../videos/recommendation-rejections';
import { createYoutubeRecommendationRanker, type YoutubeTaste } from './youtube-recommendations.ts';
import type { LibraryVideo } from '../videos/types';

export type YoutubeRankingRow = { video: LibraryVideo & { catalogOffset?: number }; tags: string[]; rating: number; favorite: boolean; liked: boolean; marks: number; watch: number; plays: number };
export type YoutubeRankingMessage =
  | { type: 'reset'; topicAliases?: TopicAliasLedger; recommendationExposure?: ExposureLedger; now?: number; recommendationRejections?: RejectionLedger; creatorLikes: Record<string, true>; creatorFavorites: Record<string, true>; creatorRatings: Record<string, number>; heartedTags: string[]; historicTags: string[] }
  | { type: 'append'; rows: YoutubeRankingRow[] }
  | { type: 'history'; entries: YoutubeTaste['history'] }
  | { type: 'candidates'; ids: string[] }
  | { type: 'ready' }
  | { type: 'mix'; seed: number }
  | { type: 'page'; offset: number; limit: number };

export type YoutubeRankingResult = { ids: string[]; offsets: number[]; kind: 'recommendations' | 'page'; seed: number; offset: number; total: number };

const shuffle = (id: string, seed: number) => {
  let value = seed >>> 0;
  for (const character of `${id}:${seed}`) value = Math.imul(value ^ character.charCodeAt(0), 0x45d9f3b);
  return value >>> 0;
};
export function createYoutubeRankingProcessor(emit: (ids: string[], offsets: number[], detail: Omit<YoutubeRankingResult, 'ids' | 'offsets'>) => void) {
  let videos: LibraryVideo[] = [], candidates: string[] = [], history: YoutubeTaste['history'] = [];
  let rows = new Map<string, YoutubeRankingRow>();
  let hearts = new Set<string>(), historic = new Set<string>(), topicHearts = new Set<string>();
  let creatorLikes: Record<string, true> = {}, creatorFavorites: Record<string, true> = {}, creatorRatings: Record<string, number> = {};
  let recommendationExposure: ExposureLedger | undefined, now: number | undefined;
  let recommendationRejections: RejectionLedger | undefined;
  let rank: ReturnType<typeof createYoutubeRecommendationRanker> | undefined, seed = 0;
  let shuffleForMix = (id: string) => shuffle(id, seed);
  let pendingPage: { offset: number; limit: number } | undefined;
  const mix = () => {
    if (!rank) return;
    const result = rank(shuffleForMix);
    emit(result.map(video => video.id), result.map(video => (video as YoutubeRankingRow['video']).catalogOffset ?? -1), { kind: 'recommendations', seed, offset: 0, total: rank.total });
  };
  const page = () => {
    if (!rank || !pendingPage) return;
    const { offset, limit } = pendingPage;
    pendingPage = undefined;
    const result = rank(shuffleForMix, { offset, limit });
    emit(result.map(video => video.id), result.map(video => (video as YoutubeRankingRow['video']).catalogOffset ?? -1), { kind: 'page', seed, offset, total: rank.total });
  };
  return (message: YoutubeRankingMessage) => {
    if (message.type === 'reset') {
      installTopicAliases(message.topicAliases ?? EMPTY_TOPIC_ALIASES);
      videos = []; candidates = []; history = []; rows = new Map(); rank = undefined;
      pendingPage = undefined;
      topicHearts = new Set(message.heartedTags.map(canonicalTopic).filter((topic): topic is string => Boolean(topic)));
      hearts = new Set(message.heartedTags.flatMap(tag=>[tag,reviewedRankingTag(tag)])); historic = new Set(message.historicTags);
      recommendationExposure = message.recommendationExposure; now = message.now;
      recommendationRejections = message.recommendationRejections;
      creatorLikes = message.creatorLikes; creatorFavorites = message.creatorFavorites; creatorRatings = message.creatorRatings;
    } else if (message.type === 'append') {
      if (rank) return;
      for (const row of message.rows) { if (rows.has(row.video.id)) continue; rows.set(row.video.id, row); videos.push(row.video); }
    } else if (message.type === 'history') history.push(...message.entries);
    else if (message.type === 'candidates') candidates.push(...message.ids);
    else if (message.type === 'ready') {
      if (rank) return;
      const tags: Record<string, string[]> = Object.create(null), favorites: Record<string, true> = Object.create(null), likes: Record<string, true> = Object.create(null), viewCounts: Record<string, number> = Object.create(null);
      for (const [id, row] of rows) { if (row.tags.length) tags[id] = row.tags; if (row.favorite) favorites[id] = true; if (row.liked) likes[id] = true; if (row.plays) viewCounts[id] = row.plays; }
      rank = createYoutubeRecommendationRanker(videos, { recommendationExposure, now, recommendationRejections, tags, favorites, likes, viewCounts, history, limit: 48,
        ratingOf: id => rows.get(id)?.rating ?? 0, marksOf: id => rows.get(id)?.marks ?? 0, watchScore: id => rows.get(id)?.watch ?? 0,
        rejectionTopicIsLiked: topic => topicHearts.has(topic), tagIsLiked: tag => hearts.has(tag), tagHasHeartHistory: tag => historic.has(tag), ratingPreference: rating => rating === 1 ? -3 : rating >= 3 ? rating - 2 : 0,
        creatorIsLiked: name => Boolean(creatorLikes[name.trim().toLowerCase()]), creatorIsFavorited: name => Boolean(creatorFavorites[name.trim().toLowerCase()]), creatorRating: name => creatorRatings[name.trim().toLowerCase()] ?? 0,
      }, candidates.map(id => rows.get(id)?.video).filter((video): video is LibraryVideo => Boolean(video)));
      recommendationRejections = undefined; recommendationExposure = undefined;
      videos = []; candidates = []; history = []; rows.clear(); hearts.clear(); historic.clear(); topicHearts.clear();
      creatorLikes = {}; creatorFavorites = {}; creatorRatings = {};
      mix();
      page();
    } else if (message.type === 'mix') {
      if (seed !== message.seed) {
        seed = message.seed;
        const mixedSeed = seed;
        shuffleForMix = id => shuffle(id, mixedSeed);
      }
      mix();
    } else if (message.type === 'page') {
      if (!Number.isFinite(message.offset) || !Number.isFinite(message.limit)) return;
      pendingPage = { offset: Math.max(0, Math.floor(message.offset)), limit: Math.max(1, Math.min(4096, Math.floor(message.limit))) };
      page();
    }
  };
}
