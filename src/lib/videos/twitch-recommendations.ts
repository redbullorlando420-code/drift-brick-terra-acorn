import type { createRankingPass } from '../ranking-budget.ts';
import { createExposurePenalty,type ExposureLedger } from './recommendation-exposure.ts';
import { createRejectionPenalty, type RejectionLedger } from './recommendation-rejections.ts';
import { forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';
import { twitchCreatorKey, isOfflineTwitchCatalogCard } from './twitch-catalog-order.ts';
import { isTwitchClip } from './twitch-clips.ts';
import { topicEvidenceForScan } from './topics.ts';
import type { LibraryVideo } from './types';

const filler = new Set('the and with from this that today tonight stream live vod twitch part day new playing lets play more best first just'.split(' '));
const titleTerms = (video: LibraryVideo) => [...new Set(video.name.toLowerCase().match(/[\p{L}][\p{L}\p{N}]{2,}/gu) ?? [])].filter(word => !filler.has(word)).slice(0, 12);
const game = (video: LibraryVideo) => video.genre?.trim().toLowerCase() ?? '';
const creator = (video: LibraryVideo) => video.folderId.startsWith('tw:') ? video.folderId.toLowerCase() : twitchCreatorKey(video);
const vod = (video: LibraryVideo) => video.remote?.kind === 'twitch' && !video.remote.live && !video.isSample && !isTwitchClip(video) && !isOfflineTwitchCatalogCard(video);
type Taste = {
  recommendationExposure?: ExposureLedger; recommendationRejections?: RejectionLedger; creatorIsFavorited?: (name: string) => boolean; tagIsLiked?: (topic: string) => boolean;
  tags: Record<string, string[]>; favorites: Record<string, true>; likes: Record<string, true>; viewCounts: Record<string, number>;
  rating: (id: string) => number; watchScore: (id: string) => number; now?: number;
};

/** Learn from bounded explicit/meaningful signals, then score unseen candidates.
 * No per-video feature graph or transcript is retained for a deep archive. */
export async function prepareTwitchRecommendationScore(videos: readonly LibraryVideo[], taste: Taste, signal?: AbortSignal, yieldTask = yieldCatalogTask, pass?: ReturnType<typeof createRankingPass>) {
  const creators = new Map<string, number>(), games = new Map<string, number>(), topics = new Map<string, number>(), terms = new Map<string, number>();
  const turn = async () => { signal?.throwIfAborted(); await yieldTask(); signal?.throwIfAborted(); };
  const add = (map: Map<string, number>, key: string, weight: number) => {
    if (!key || !map.has(key) && map.size >= 4096) return;
    map.set(key, Math.max(-16, Math.min(24, (map.get(key) ?? 0) + weight)));
  };
  await (pass?.visit ?? forEachCatalogSlice)(videos, video => {
    if (!vod(video)) return;
    const rating = taste.rating(video.id), watched = Math.max(0, Math.min(12, taste.watchScore(video.id)));
    const weight = rating === 1 ? -12 : rating === 2 ? -5 : (rating >= 4 ? (rating - 3) * 4 : 0)
      + (taste.favorites[video.id] ? 6 : 0) + (taste.likes[video.id] ? 4 : 0) + (watched >= 2 ? Math.min(4, watched / 2) : 0);
    if (!weight) return;
    add(creators, creator(video), weight); add(games, game(video), weight);
    for (const link of topicEvidenceForScan(video, taste.tags[video.id])) add(topics, link.topic, weight / 2);
    for (const word of titleTerms(video)) add(terms, word, weight / 4);
  }, turn);
  const now = taste.now ?? Date.now();
  const rejectionPenalty = taste.recommendationRejections?.entries.length ? createRejectionPenalty(taste.recommendationRejections) : undefined;
  const exposurePenalty = taste.recommendationExposure?.entries.length ? createExposurePenalty(taste.recommendationExposure, now) : undefined;
  return (video: LibraryVideo) => {
    const rating = taste.rating(video.id);
    if (rating === 1 || !vod(video)) return -Infinity;
    const watched = Math.max(0, Math.min(12, taste.watchScore(video.id))), opens = Math.max(0, taste.viewCounts[video.id] ?? 0);
    const topicScore = topicEvidenceForScan(video, taste.tags[video.id]).reduce((sum, link) => sum + (topics.get(link.topic) ?? 0), 0);
    const titleScore = titleTerms(video).reduce((sum, word) => sum + (terms.get(word) ?? 0), 0);
    const age = video.addedAt > 0 ? Math.max(0, (now - video.addedAt) / 86_400_000) : Infinity;
    return (creators.get(creator(video)) ?? 0) + (games.get(game(video)) ?? 0) * 1.2
      + Math.max(-12, Math.min(18, topicScore)) + Math.max(-8, Math.min(12, titleScore))
      + (rating >= 4 ? (rating - 3) * 2 : rating === 2 ? -18 : 0)
      + (opens || watched ? -Math.min(24, 12 + watched + Math.log2(opens + 1)) : 12)
      + Math.max(0, 6 - age / 14) + Math.min(5, Math.log10(Math.max(0, video.remote?.views ?? 0) + 1))
       - (rejectionPenalty?.(video, taste.tags[video.id], { favorite: Boolean(taste.favorites[video.id]), creatorFavorite: taste.creatorIsFavorited?.(video.remote?.channelName ?? ""), tagIsLiked: taste.tagIsLiked }) ?? 0)
       - (exposurePenalty?.(video, { favorite: Boolean(taste.favorites[video.id]), liked: Boolean(taste.likes[video.id]), creatorFavorite: taste.creatorIsFavorited?.(video.remote?.channelName ?? ""), rating }) ?? 0);
  };
}
