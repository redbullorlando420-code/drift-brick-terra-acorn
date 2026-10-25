import { forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import { adultFolderIds, ADULT_PULL_PROVIDERS } from './adult-providers.ts';
import { animeTitleInfo } from './anime-title.ts';
import { animeEvidence } from './content-classification.ts';
import type { Folder, LibraryVideo, ResumeMark, VideoMetadataProvenance } from './types.ts';

export type AnimeFilter = 'all' | 'continue' | 'series' | 'films' | 'specials';
export type AnimeCatalogInput = {
  videos: LibraryVideo[]; folders: Folder[]; tags: Record<string, string[]>;
  unavailable: Record<string, unknown>; hiddenVideos: Record<string, unknown>; hideDemo: boolean;
  metadataProvenance?:Record<string,VideoMetadataProvenance>;
};
export type AnimeCatalog = {
  catalog: LibraryVideo[]; anime: LibraryVideo[]; films: Uint8Array;
  localCount: number; filmCount: number; specials: Uint8Array; specialCount: number;
  series: Array<{ key: string; title: string; count: number }>; seriesOverflow: boolean;
};
const EMPTY_TAGS: readonly string[] = [];
const adultProviders = new Set<string>(ADULT_PULL_PROVIDERS);
function film(video: LibraryVideo, tags: readonly string[]) {
  return /\b(anime[- ]?(?:movie|film)|movie|film|theatrical)\b/.test(
    `${video.name} ${video.genre ?? ''} ${tags.join(' ')}`.toLowerCase());
}
function matches(video: LibraryVideo, tags: readonly string[], needle: string) {
  return `${video.name} ${video.genre ?? ''} ${video.description ?? ''} ${tags.join(' ')}`.toLowerCase().includes(needle);
}

/** Prepare membership/order/counts once per immutable catalog/tag snapshot.
 * Typing and watch progress never restart topic detection or the date sort. */
export async function prepareAnimeCatalog(input: AnimeCatalogInput, turn: () => Promise<void>): Promise<AnimeCatalog> {
  await turn();
  const adult = adultFolderIds(input.folders);
  const catalog: LibraryVideo[] = [], found: LibraryVideo[] = [];
  await forEachCatalogSlice(input.videos, video => {
    if (adult.has(video.folderId) || adultProviders.has(video.remote?.kind ?? '') || input.unavailable[video.id]
      || input.hiddenVideos[video.id] || input.hideDemo && video.isSample) return;
    catalog.push(video);
    if (animeEvidence(video, input.tags[video.id] ?? EMPTY_TAGS,input.metadataProvenance?.[video.id])) found.push(video);
  }, turn);
  const anime = await sortCatalogRows(found, (a, b) => b.addedAt - a.addedAt, turn);
  const films = new Uint8Array(anime.length), specials = new Uint8Array(anime.length);
  const series = new Map<string, { key: string; title: string; count: number }>(); let seriesOverflow = false;
  let localCount = 0, filmCount = 0, specialCount = 0;
  await forEachCatalogSlice(anime, (video, index) => {
    if (!video.remote) localCount++;
    const info = animeTitleInfo(video.name);
    if (film(video, input.tags[video.id] ?? EMPTY_TAGS)) { films[index] = 1; filmCount++; }
    else if (info.format === 'special' || (input.tags[video.id] ?? EMPTY_TAGS).some(tag => /(?:^|[- ])(?:ova|ona|special)$/i.test(tag))) { specials[index] = 1; specialCount++; }
    else if (info.episode !== undefined) {
      const group = series.get(info.key);
      if (group) group.count++;
      else if (series.size < 512) series.set(info.key, { key: info.key, title: info.series, count: 1 });
      else seriesOverflow = true;
    }
  }, turn);
  await turn();
  return { catalog, anime, films, specials, localCount, filmCount, specialCount, series: [...series.values()], seriesOverflow };
}

/** Resolve each resume mark once. Stable ties keep the newest-title order. */
export async function prepareAnimeContinue(anime: LibraryVideo[], resume: (video: LibraryVideo) => ResumeMark | undefined,
  turn: () => Promise<void>): Promise<LibraryVideo[]> {
  const rows: Array<{ video: LibraryVideo; at: number }> = [];
  await forEachCatalogSlice(anime, video => {
    const mark = resume(video);
    if (mark && mark.d > 0 && mark.t >= 2 && mark.t / mark.d < 0.992) rows.push({ video, at: mark.at });
  }, turn);
  const sorted = await sortCatalogRows(rows, (a, b) => b.at - a.at, turn);
  const result = new Array<LibraryVideo>(sorted.length);
  await forEachCatalogSlice(sorted, (row, index) => { result[index] = row.video; }, turn);
  await turn();
  return result;
}

export async function selectAnimeTitles(index: AnimeCatalog, continuing: LibraryVideo[], filter: AnimeFilter,
  query: string, tags: Record<string, string[]>, turn: () => Promise<void>, options: { series?: string; episodeOrder?: boolean } = {}): Promise<LibraryVideo[]> {
  await turn();
  const needle = query.trim().toLowerCase();
  const base = filter === 'continue' ? continuing : index.anime;
  if (!needle && !options.series && !options.episodeOrder && (filter === 'all' || filter === 'continue')) return base;
  const result: LibraryVideo[] = [];
  await forEachCatalogSlice(base, (video, position) => {
    if (filter === 'films' && !index.films[position] || filter === 'specials' && !index.specials[position] || filter === 'series' && (index.films[position] || index.specials[position])) return;
    if (options.series && animeTitleInfo(video.name).key !== options.series) return;
    if (!needle || matches(video, tags[video.id] ?? EMPTY_TAGS, needle)) result.push(video);
  }, turn);
  if (options.episodeOrder) {
    const decorated: Array<{ video: LibraryVideo; info: ReturnType<typeof animeTitleInfo> }> = [];
    await forEachCatalogSlice(result, video => { decorated.push({ video, info: animeTitleInfo(video.name) }); }, turn);
    const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
    const sorted = await sortCatalogRows(decorated, (a,b) => collator.compare(a.info.key,b.info.key) || a.info.season - b.info.season || (a.info.episode ?? Infinity) - (b.info.episode ?? Infinity) || collator.compare(a.video.name,b.video.name), turn);
    const ordered: LibraryVideo[] = []; await forEachCatalogSlice(sorted, row => { ordered.push(row.video); }, turn); return ordered;
  }
  await turn();
  return result;
}

/** The title finder displays eight matches. Stop at eight rather than scanning
 * and allocating every matching library title before discarding the rest. */
export async function findAnimeTagTitles(catalog: LibraryVideo[], query: string, tags: Record<string, string[]>,
  turn: () => Promise<void>): Promise<LibraryVideo[]> {
  await turn();
  const needle = query.trim().toLowerCase(), result: LibraryVideo[] = [];
  if (!needle) return result;
  for (let offset = 0; offset < catalog.length && result.length < 8;) {
    await turn();
    const end = Math.min(catalog.length, offset + 512), started = performance.now();
    for (; offset < end && result.length < 8; offset++) {
      const video = catalog[offset]!;
      if (matches(video, tags[video.id] ?? EMPTY_TAGS, needle)) result.push(video);
      if (performance.now() - started >= 4) { offset++; break; }
    }
  }
  await turn();
  return result;
}
