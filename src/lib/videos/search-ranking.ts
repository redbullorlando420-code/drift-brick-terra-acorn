import { visitSearchCandidates } from './search-candidates.ts';
import { forEachCatalogSlice, sortCatalogRows, yieldCatalogTask } from '../catalog-work.ts';
import { adultFolderIds, ADULT_PULL_PROVIDERS } from './adult-providers.ts';
import { topicsForVideo } from './topics.ts';
import type { Folder, LibraryVideo, SourceId } from './types';

export type SearchRankingInput = {
  videos: readonly LibraryVideo[]; positions?: Uint32Array; ids: ReadonlySet<string>; query: string; sourceId: SourceId;
  folders: readonly Folder[]; hidden: Record<string, true>; unavailable: Record<string, true>;
  tags: Record<string, string[]>; favorites: Record<string, true>; likes: Record<string, true>;
  viewCounts: Record<string, number>; ratingOf: (id: string) => number; ratingPreference: (rating: number) => number;
};
export type SearchRankingResult = { ranked: LibraryVideo[]; tags: Array<{ tag: string; count: number; score: number }> };
const privateKinds = new Set<string>(ADULT_PULL_PROVIDERS);

/** Preserve full search results and the existing taste formula while scanning,
 * scoring, sorting, and resolving cards in cancelable four-millisecond slices. */
export async function rankSearchResults(input: SearchRankingInput, signal?: AbortSignal, yieldTask = yieldCatalogTask): Promise<SearchRankingResult> {
  const turn = async () => {
    signal?.throwIfAborted(); await yieldTask(); signal?.throwIfAborted();
  };
  await turn();
  const needle = input.query.trim().toLowerCase().replace(/^#/, '');
  if (!needle || !input.ids.size) return { ranked: [], tags: [] };
  const terms = needle.split(/[^a-z0-9]+/).filter(Boolean);
  const bare = needle.replace(/^(?:fetish|genre|meta|creator|sub|source)-/, '');
  const privateFolders = adultFolderIds(input.folders);
  const inAdults = input.sourceId === 'adults' || input.sourceId === 'adult-fetishes';
  const rows: Array<{ video: LibraryVideo; score: number }> = [];
  await visitSearchCandidates(input.videos, input.ids, input.positions, video => {
    if (!input.ids.has(video.id) || video.isSample || input.hidden[video.id] || input.unavailable[video.id]) return;
    const isPrivate = privateFolders.has(video.folderId) || privateKinds.has(video.remote?.kind ?? '');
    if (inAdults !== isPrivate) return;
    if (input.sourceId === 'youtube' && video.remote?.kind !== 'youtube') return;
    if (input.sourceId === 'twitch' && video.remote?.kind !== 'twitch') return;
    const title = video.name.toLowerCase(), creator = (video.remote?.channelName ?? '').toLowerCase();
    const tags = [...new Set([...topicsForVideo(video, input.tags[video.id]), ...(input.tags[video.id] ?? [])].map(tag => tag.toLowerCase()))];
    const exactTag = tags.some(tag => tag === needle || tag === bare || tag === `fetish-${bare}` || tag === `genre-${bare}`) ? 220 : 0;
    const tagHits = tags.filter(tag => terms.some(term => tag === term || tag.includes(term))).length;
    const score = exactTag + (title.includes(needle) ? 120 : 0) + (creator.includes(needle) ? 95 : 0)
      + terms.filter(term => title.includes(term)).length * 28 + terms.filter(term => creator.includes(term)).length * 22
      + tagHits * 18 + input.ratingPreference(input.ratingOf(video.id)) * 7 + (input.favorites[video.id] ? 12 : 0)
      + (input.likes[video.id] ? 6 : 0) + Math.min(8, input.viewCounts[video.id] ?? 0);
    // Worker matches also include descriptions, paths and categories. Retain
    // those valid matches even when they have no title/taste score.
    rows.push({ video, score });
  }, turn);
  const sorted = await sortCatalogRows(rows, (a, b) => b.score - a.score || b.video.addedAt - a.video.addedAt || a.video.name.localeCompare(b.video.name), turn);
  const tagRows = new Map<string, { count: number; score: number }>();
  await forEachCatalogSlice(sorted.slice(0, 240), row => {
    for (const tag of new Set([...topicsForVideo(row.video, input.tags[row.video.id]), ...(input.tags[row.video.id] ?? [])].map(tag => tag.toLowerCase()))) {
      if (tag.length < 2 || /^(?:year|month|day|type|format|provider)-/.test(tag)) continue;
      const previous = tagRows.get(tag) ?? { count: 0, score: 0 };
      tagRows.set(tag, { count: previous.count + 1, score: previous.score + row.score });
    }
  }, turn);
  const ranked: LibraryVideo[] = [];
  await forEachCatalogSlice(sorted, row => { ranked.push(row.video); }, turn);
  // Tag choices are bounded by only the first 240 matches, never the catalog.
  const tags = [...tagRows].map(([tag, value]) => ({ tag, ...value })).sort((a, b) => b.score - a.score || b.count - a.count || a.tag.localeCompare(b.tag)).slice(0, 12);
  signal?.throwIfAborted();
  return { ranked, tags };
}
