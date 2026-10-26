import { reviewedTopic } from './topic-aliases.ts';
import { topicPostings } from './topic-postings.ts';
import type { Folder, LibraryVideo } from './types.ts';
import { forEachCatalogEntry, forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import { topicEvidenceForScan } from './topics.ts';

export type TopicCatalogInput = {
  videos: readonly LibraryVideo[]; folders: readonly Folder[];
  tags: Record<string, string[]>; unavailable: Record<string, unknown>;
  hiddenVideos: Record<string, unknown>; hideDemo: boolean;
};
export type TopicTaste = { score: (id: string) => number; liked: (topic: string) => boolean };
export type TopicCount = { count: number; providers: Set<string>; ratingTotal: number; saved: number };
export type TopicFilters={text?:string;sort?:'catalog'|'newest'|'title'|'taste';evidence?:'all'|'saved'|'inferred'};
const normalize=(text:string)=>text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[-_#]+/g,' ');

/** Only small aggregates survive the scan; no second catalog of row/topic objects. */
export async function summarizeTopicCatalog(input: TopicCatalogInput, taste: TopicTaste, turn: () => Promise<void>) {
  const postings = await topicPostings(input, turn), counts = new Map<string, TopicCount>();
  const sources = new Map<string, { total: number; linked: number }>(), genres = new Set<string>();
  let total = 0, saved = 0, linked = 0;
  await forEachCatalogSlice(postings.eligible, ordinal => {
    const video = input.videos[ordinal]!;
    total++;
    const source = sources.get(video.folderId) ?? { total: 0, linked: 0 };
    source.total++; source.linked += Number(postings.linked[ordinal]! > 0); sources.set(video.folderId, source);
    if (postings.linked[ordinal]) linked++;
    if (postings.saved[ordinal]) saved++;
    if (video.genre) genres.add(video.genre);
  }, turn, 256);
  for (const [topic, posting] of postings.topics) {
    let ratingTotal = 0; const providers = new Set<string>();
    await forEachCatalogSlice(posting.all, ordinal => { const video = input.videos[ordinal]!; ratingTotal += taste.score(video.id); providers.add(video.remote?.kind ?? 'local'); }, turn, 256);
    counts.set(topic, { count: posting.all.length, providers, ratingTotal, saved: posting.saved.length });
  }
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
  genre: string | undefined, provider: string, taste: TopicTaste, turn: () => Promise<void>, filters:TopicFilters={}) {
  const postings = await topicPostings(input, turn), videos: LibraryVideo[] = [];
  const terms=normalize((filters.text??'').trim().slice(0,200)).split(/\s+/).filter(Boolean).slice(0,12);
  const related = new Map<string, { shared: number; ratingTotal: number }>();
  await forEachCatalogSlice(selected ? postings.topics.get(selected)?.all ?? new Uint32Array() : postings.eligible, ordinal => {
    const video = input.videos[ordinal]!;
    if ((genre && video.genre !== genre)
      || (provider !== 'all' && (video.remote?.kind ?? 'local') !== provider)) return;
    const links = selected || filters.evidence && filters.evidence!=='all' ? topicEvidenceForScan(video, input.tags[video.id]) : [];
    if (selected && !links.some(link => link.topic === selected)) return;
    const relevant=selected?links.filter(link=>link.topic===selected):links;
    if(filters.evidence==='saved'&&!relevant.some(link=>link.saved)||filters.evidence==='inferred'&&(!relevant.length||relevant.some(link=>link.saved)))return;
    if(terms.length){const text=normalize(`${video.name.slice(0,1000)} ${video.genre??''} ${video.remote?.channelName??''} ${(input.tags[video.id]??[]).slice(0,80).join(' ')} ${(input.tags[video.id]??[]).slice(0,80).map(tag=>reviewedTopic(tag)??'').join(' ')}`);if(!terms.every(term=>text.includes(term)))return;}
    videos.push(video);
    if (!selected) return;
    const score = taste.score(video.id);
    for (const { topic } of links) if (topic !== selected) {
      const entry = related.get(topic) ?? { shared: 0, ratingTotal: 0 };
      entry.shared++; entry.ratingTotal += score; related.set(topic, entry);
    }
  }, turn, 256);
  await turn();
  const ordered=filters.sort&&filters.sort!=='catalog'?await sortCatalogRows(videos,(a,b)=>filters.sort==='title'?a.name.localeCompare(b.name):filters.sort==='taste'?taste.score(b.id)-taste.score(a.id)||b.addedAt-a.addedAt:b.addedAt-a.addedAt,turn):videos;
  return { videos:ordered, related: [...related].sort((a, b) => b[1].ratingTotal / b[1].shared - a[1].ratingTotal / a[1].shared
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
