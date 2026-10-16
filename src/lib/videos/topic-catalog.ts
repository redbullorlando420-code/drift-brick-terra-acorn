import type { Folder, LibraryVideo } from './types.ts';
import { forEachCatalogEntry, forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import { isAdultPullKind } from './adult-sites.ts';
import { topicEvidenceForScan } from './topics.ts';

export type TopicCatalogInput = {
  videos: readonly LibraryVideo[]; folders: readonly Folder[];
  tags: Record<string, string[]>; unavailable: Record<string, unknown>;
  hiddenVideos: Record<string, unknown>; hideDemo: boolean;
};
export type TopicTaste = { score: (id: string) => number; liked: (topic: string) => boolean };
export type TopicCount = { count: number; providers: Set<string>; ratingTotal: number; saved: number };

function publicTitle(input: TopicCatalogInput) {
  const privateFolders = new Set(input.folders.filter(folder => folder.adult).map(folder => folder.id));
  const knownFolders = new Set(input.folders.map(folder => folder.id));
  return (video: LibraryVideo) => !privateFolders.has(video.folderId) && !isAdultPullKind(video.remote?.kind)
    && !input.unavailable[video.id] && !input.hiddenVideos[video.id] && !(input.hideDemo && video.isSample)
    && Boolean(knownFolders.has(video.folderId) || video.remote || video.isSample);
}

/** Only small aggregates survive the scan; no second catalog of row/topic objects. */
export async function summarizeTopicCatalog(input: TopicCatalogInput, taste: TopicTaste, turn: () => Promise<void>) {
  const allowed = publicTitle(input), counts = new Map<string, TopicCount>();
  const sources = new Map<string, { total: number; linked: number }>(), genres = new Set<string>();
  let total = 0, saved = 0, linked = 0;
  await forEachCatalogSlice(input.videos, video => {
    if (!allowed(video)) return;
    total++;
    const links = topicEvidenceForScan(video, input.tags[video.id]);
    const source = sources.get(video.folderId) ?? { total: 0, linked: 0 };
    source.total++; source.linked += Number(links.length > 0); sources.set(video.folderId, source);
    if (links.length) linked++;
    if (links.some(link => link.saved)) saved++;
    if (video.genre) genres.add(video.genre);
    const score = links.length ? taste.score(video.id) : 0;
    for (const link of links) {
      const entry = counts.get(link.topic) ?? { count: 0, providers: new Set<string>(), ratingTotal: 0, saved: 0 };
      entry.count++; entry.ratingTotal += score; entry.saved += Number(link.saved);
      entry.providers.add(video.remote?.kind ?? 'local'); counts.set(link.topic, entry);
    }
  }, turn, 256);
  const gaps: Array<{ id: string; total: number; linked: number }> = [];
  // Retain the eight largest gaps without sorting or copying the full source list.
  await forEachCatalogEntry(sources, ([id, source]) => {
    gaps.push({ id, ...source });
    gaps.sort((a, b) => (b.total - b.linked) - (a.total - a.linked));
    if (gaps.length > 8) gaps.pop();
  }, turn);
  const genreRows: string[] = [];
  await forEachCatalogEntry(genres, genre => { genreRows.push(genre); }, turn);
  const sortedGenres = await sortCatalogRows(genreRows, (a, b) => a.localeCompare(b), turn);
  await turn();
  return { total, saved, linked, gaps, genres: sortedGenres,
    counts: [...counts].sort((a, b) => Number(taste.liked(b[0])) - Number(taste.liked(a[0]))
      || b[1].ratingTotal / b[1].count - a[1].ratingTotal / a[1].count
      || b[1].count - a[1].count || a[0].localeCompare(b[0])) };
}
export type TopicSummary = Awaited<ReturnType<typeof summarizeTopicCatalog>>;

/** Preserve catalog order and complete results; only the visible grid mounts cards. */
export async function selectTopicCatalog(input: TopicCatalogInput, selected: string | undefined,
  genre: string | undefined, provider: string, taste: TopicTaste, turn: () => Promise<void>) {
  const allowed = publicTitle(input), videos: LibraryVideo[] = [];
  const related = new Map<string, { shared: number; ratingTotal: number }>();
  await forEachCatalogSlice(input.videos, video => {
    if (!allowed(video) || (genre && video.genre !== genre)
      || (provider !== 'all' && (video.remote?.kind ?? 'local') !== provider)) return;
    const links = selected ? topicEvidenceForScan(video, input.tags[video.id]) : [];
    if (selected && !links.some(link => link.topic === selected)) return;
    videos.push(video);
    if (!selected) return;
    const score = taste.score(video.id);
    for (const { topic } of links) if (topic !== selected) {
      const entry = related.get(topic) ?? { shared: 0, ratingTotal: 0 };
      entry.shared++; entry.ratingTotal += score; related.set(topic, entry);
    }
  }, turn, 256);
  await turn();
  return { videos, related: [...related].sort((a, b) => b[1].ratingTotal / b[1].shared - a[1].ratingTotal / a[1].shared
    || b[1].shared - a[1].shared || a[0].localeCompare(b[0])).slice(0, 12) };
}
export type TopicSelection = Awaited<ReturnType<typeof selectTopicCatalog>>;

/** Saved/inferred counts were accumulated once, so export is independent of library size. */
export function topicConnectionsCsv(summary: TopicSummary) {
  const rows = [['topic', 'public_titles', 'taste_score_points', 'taste_total', 'providers', 'saved_tag_titles', 'inferred_only_titles'],
    ...summary.counts.map(([topic, data]) => [topic, data.count, Math.round(data.ratingTotal / data.count * 1000),
      data.ratingTotal.toFixed(1), [...data.providers].join(' + '), data.saved, data.count - data.saved])];
  return rows.map(row => row.map(cell => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n');
}
