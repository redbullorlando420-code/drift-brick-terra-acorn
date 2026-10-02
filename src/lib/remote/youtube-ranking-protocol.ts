import { createYoutubeRecommendationRanker, type YoutubeTaste } from './youtube-recommendations.ts';
import type { LibraryVideo } from '../videos/types';

export type YoutubeRankingRow = { video: LibraryVideo & { catalogOffset?: number }; tags: string[]; rating: number; favorite: boolean; liked: boolean; marks: number; watch: number; plays: number };
export type YoutubeRankingMessage =
  | { type: 'reset'; creatorLikes: Record<string, true>; creatorFavorites: Record<string, true>; creatorRatings: Record<string, number>; heartedTags: string[]; historicTags: string[] }
  | { type: 'append'; rows: YoutubeRankingRow[] }
  | { type: 'history'; entries: YoutubeTaste['history'] }
  | { type: 'candidates'; ids: string[] }
  | { type: 'ready' }
  | { type: 'mix'; seed: number };

const shuffle = (id: string, seed: number) => {
  let value = seed >>> 0;
  for (const character of `${id}:${seed}`) value = Math.imul(value ^ character.charCodeAt(0), 0x45d9f3b);
  return value >>> 0;
};
export function createYoutubeRankingProcessor(emit: (ids: string[], offsets: number[]) => void) {
  let videos: LibraryVideo[] = [], candidates: string[] = [], history: YoutubeTaste['history'] = [];
  let rows = new Map<string, YoutubeRankingRow>();
  let hearts = new Set<string>(), historic = new Set<string>();
  let creatorLikes: Record<string, true> = {}, creatorFavorites: Record<string, true> = {}, creatorRatings: Record<string, number> = {};
  let rank: ReturnType<typeof createYoutubeRecommendationRanker> | undefined, seed = 0;
  const mix = () => {
    if (!rank) return;
    const result = rank(id => shuffle(id, seed));
    emit(result.map(video => video.id), result.map(video => (video as YoutubeRankingRow['video']).catalogOffset ?? -1));
  };
  return (message: YoutubeRankingMessage) => {
    if (message.type === 'reset') {
      videos = []; candidates = []; history = []; rows = new Map(); rank = undefined;
      hearts = new Set(message.heartedTags); historic = new Set(message.historicTags);
      creatorLikes = message.creatorLikes; creatorFavorites = message.creatorFavorites; creatorRatings = message.creatorRatings;
    } else if (message.type === 'append') {
      if (rank) return;
      for (const row of message.rows) { if (rows.has(row.video.id)) continue; rows.set(row.video.id, row); videos.push(row.video); }
    } else if (message.type === 'history') history.push(...message.entries);
    else if (message.type === 'candidates') candidates.push(...message.ids);
    else if (message.type === 'ready') {
      if (rank) return;
      const tags: Record<string, string[]> = Object.create(null), favorites: Record<string, true> = Object.create(null), likes: Record<string, true> = Object.create(null), viewCounts: Record<string, number> = Object.create(null);
      for (const [id, row] of rows) { tags[id] = row.tags; if (row.favorite) favorites[id] = true; if (row.liked) likes[id] = true; if (row.plays) viewCounts[id] = row.plays; }
      rank = createYoutubeRecommendationRanker(videos, { tags, favorites, likes, viewCounts, history, limit: 48,
        ratingOf: id => rows.get(id)?.rating ?? 0, marksOf: id => rows.get(id)?.marks ?? 0, watchScore: id => rows.get(id)?.watch ?? 0,
        tagIsLiked: tag => hearts.has(tag), tagHasHeartHistory: tag => historic.has(tag), ratingPreference: rating => rating === 1 ? -3 : rating >= 3 ? rating - 2 : 0,
        creatorIsLiked: name => Boolean(creatorLikes[name.trim().toLowerCase()]), creatorIsFavorited: name => Boolean(creatorFavorites[name.trim().toLowerCase()]), creatorRating: name => creatorRatings[name.trim().toLowerCase()] ?? 0,
      }, candidates.map(id => rows.get(id)?.video).filter((video): video is LibraryVideo => Boolean(video)));
      videos = []; candidates = []; history = []; rows.clear(); hearts.clear(); historic.clear();
      creatorLikes = {}; creatorFavorites = {}; creatorRatings = {};
      mix();
    } else if (message.type === 'mix') {
      seed = message.seed;
      mix();
    }
  };
}
