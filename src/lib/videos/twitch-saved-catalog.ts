import { matchesTwitchContent, type TwitchContentFilter } from './twitch-content.ts';
import { forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import { isOfflineTwitchCatalogCard } from './twitch-catalog-order.ts';
import { topicEvidenceForScan } from './topics.ts';
import type { LibraryVideo } from './types';

export type TwitchSavedFilter = 'all' | 'favorites' | 'likes';
export type TwitchSavedInput = {
  videos: LibraryVideo[]; favorites: Record<string, true>; likes: Record<string, true>;
  viewCounts: Record<string, number>; rating: (id: string) => number;
};

/** Count once and sort cooperatively. Never truncate saved shelves or clone videos. */
export async function prepareTwitchSaved(input: TwitchSavedInput, turn: () => Promise<void>) {
  const favorites: LibraryVideo[] = [], liked: LibraryVideo[] = [];
  let favoriteCount = 0, likedCount = 0;
  await forEachCatalogSlice(input.videos, video => {
    const favorite = Boolean(input.favorites[video.id]), like = Boolean(input.likes[video.id]);
    favoriteCount += Number(favorite); likedCount += Number(like);
    if (isOfflineTwitchCatalogCard(video)) return;
    if (favorite) favorites.push(video);
    if (like && !favorite) liked.push(video);
  }, turn);
  const favoriteRows = await sortCatalogRows(favorites, (a, b) => (input.viewCounts[b.id] ?? 0) - (input.viewCounts[a.id] ?? 0)
    || b.addedAt - a.addedAt, turn);
  const likedRows = await sortCatalogRows(liked, (a, b) => input.rating(b.id) - input.rating(a.id)
    || (input.viewCounts[a.id] ?? 0) - (input.viewCounts[b.id] ?? 0) || b.addedAt - a.addedAt, turn);
  await turn();
  return { favoriteRows, likedRows, favoriteCount, likedCount };
}
export type TwitchSavedCatalog = Awaited<ReturnType<typeof prepareTwitchSaved>>;

/** No-filter results retain exact identity; filtered rows keep the selected catalog order. */
export async function filterCatalogSelection(videos: LibraryVideo[], saved: Record<string, true> | undefined,
  topic: string, tags: Record<string, string[]>, turn: () => Promise<void>, content:TwitchContentFilter = 'all') {
  await turn();
  if (!saved && topic === 'all' && content === 'all') return videos;
  const rows: LibraryVideo[] = [];
  await forEachCatalogSlice(videos, video => {
    if (saved && !saved[video.id]) return;
    if (!matchesTwitchContent(video,content)) return;
    if (topic !== 'all' && !topicEvidenceForScan(video, tags[video.id]).some(link => link.topic === topic)) return;
    rows.push(video);
  }, turn, 256);
  await turn();
  return rows;
}
// Existing Twitch callers use the same provider-independent selector.
export const filterTwitchCatalog = filterCatalogSelection;

/** Exact topic totals/taste ordering, with only the first 48 eligible creators
 * and 48 entries per creator retained temporarily for each 48-card shelf. */
export async function prepareTwitchTopics(videos: LibraryVideo[], tags: Record<string, string[]>,
  taste: { rating: (id: string) => number; liked: (tag: string) => boolean; score: (id: string, rating: number) => number },
  turn: () => Promise<void>) {
  const preferred = new Set<string>();
  const totals = new Map<string, { count: number; score: number }>();
  // First retain only totals. Candidate graphs for thousands of unselected
  // topics were the largest temporary allocation on deep Twitch archives.
  await forEachCatalogSlice(videos, video => {
    const rating = taste.rating(video.id), links = topicEvidenceForScan(video, tags[video.id]);
    const score = links.length ? taste.score(video.id, rating) : 0;
    for (const { topic } of links) {
      if (rating >= 4 || taste.liked(topic)) preferred.add(topic);
      if (topic.length < 4) continue;
      const entry = totals.get(topic) ?? { count: 0, score: 0 };
      entry.count++; entry.score += score; totals.set(topic, entry);
    }
  }, turn, 256);
  const selected = [...totals].filter(([, entry]) => entry.count >= 2)
    .sort((a,b) => b[1].score-a[1].score || b[1].count-a[1].count || a[0].localeCompare(b[0])).slice(0,40);
  const groups = new Map(selected.map(([tag, entry]) => [tag, { ...entry, creators: new Map<string, LibraryVideo[]>(), seen: new Set<string>() }]));
  totals.clear();
  await forEachCatalogSlice(videos, video => {
    for (const { topic } of topicEvidenceForScan(video, tags[video.id])) {
      const entry = groups.get(topic); if (!entry) continue;
      const creator = video.remote?.channelName?.trim().toLowerCase() || 'local';
      let candidates = entry.creators.get(creator);
      if (!candidates && entry.creators.size < 48) { candidates = []; entry.creators.set(creator,candidates); }
      if (candidates && candidates.length < 48 && !entry.seen.has(video.id)) { candidates.push(video); entry.seen.add(video.id); }
    }
  }, turn, 256);
  const shelves = [...groups].map(([tag, entry]) => {
    const videos: LibraryVideo[] = [], creators = [...entry.creators.values()];
    for (let depth=0; depth<48 && videos.length<48; depth++) {
      for (const rows of creators) { if (rows[depth]) videos.push(rows[depth]!); if (videos.length>=48) break; }
    }
    return { tag, videos, count: entry.count };
  });
  await turn(); return { preferred, shelves };
}
export type TwitchTopicCatalog = Awaited<ReturnType<typeof prepareTwitchTopics>>;
