import { videoIsPrivate } from './public-visibility.ts';
import { forEachCatalogEntry, forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import { isClassicVideo } from './types.ts';
import type { Folder, LibraryVideo, VideoMetadataProvenance } from './types';
import { movieEvidence, movieIdentityEvidence } from './content-classification.ts';
import {projectFilmVideo,type FilmLedger} from './film-review.ts';

const GENRES = ['Comedy', 'Action', 'Horror', 'Drama', 'Documentary', 'Science Fiction', 'Thriller', 'Romance', 'Animation'];
const GENRE_PATTERNS = new Map(GENRES.map(genre => [genre.toLowerCase(), new RegExp('\\b' + genre + '\\b', 'i')]));
export type MovieCatalogScope = {
  videos: LibraryVideo[];
  folders: Folder[];
  hidden: Record<string, true>;
  unavailable: Record<string, true>;
  tags?: Record<string, string[]>;
  metadataProvenance?: Record<string, VideoMetadataProvenance>;
  progress?: Record<string, { d: number }>;
  filmLedger?:FilmLedger;
};
export type MovieCatalog = {
  videos: LibraryVideo[];
  classics: LibraryVideo[];
  classicSet: Set<LibraryVideo>;
  genres: { genre: string; videos: LibraryVideo[] }[];
  types: { type: string; videos: LibraryVideo[] }[];
  candidates: LibraryVideo[];
  awaitingRuntime: number;
  features: LibraryVideo[]; shorts: LibraryVideo[]; documentaries: LibraryVideo[];
  filmGroups?:Array<{filmId:string;versions:LibraryVideo[]}>;
};

/** Visibility and shelf membership are prepared once per immutable snapshot.
 * Random picks only reorder references; they never regroup the source catalog. */
export async function prepareMovieCatalog(scope: MovieCatalogScope, turn: () => Promise<void>): Promise<MovieCatalog> {
  const privateFolders = new Set<string>();
  const folderNames = new Map<string, string>();
  await forEachCatalogSlice(scope.folders, folder => { folderNames.set(folder.id, folder.name); if (folder.adult) privateFolders.add(folder.id); }, turn);
  const videos: LibraryVideo[] = [], classics: LibraryVideo[] = [], classicSet = new Set<LibraryVideo>();
  const genres = new Map(GENRES.map(genre => [genre.toLowerCase(), { genre, videos: [] as LibraryVideo[] }]));
  const types = new Map<string, LibraryVideo[]>();
  const candidates: LibraryVideo[] = [], features: LibraryVideo[] = [], shorts: LibraryVideo[] = [], documentaries: LibraryVideo[] = []; let awaitingRuntime = 0;
  const filmGroups=new Map<string,LibraryVideo[]>();
  await forEachCatalogSlice(scope.videos, video => {
    if (videoIsPrivate(privateFolders,video) || scope.hidden[video.id] || scope.unavailable[video.id]) return;
    const observed = scope.progress?.[video.id]?.d;
    if (!(Number.isFinite(video.duration) && video.duration! > 0) && Number.isFinite(observed) && observed! > 0 && observed! <= 31_536_000) video = { ...video, duration: observed };
    const version=scope.filmLedger?.versions[video.id],reviewed=version&&scope.filmLedger?.films[version.filmId]&&!video.isSample&&!video.remote?.live&&(!video.remote?folderNames.has(video.folderId):video.remote.kind==='youtube'&&!['short','upcoming'].includes(video.remote.youtubeType??''));
    if(reviewed)video=projectFilmVideo(video,scope.filmLedger!,scope.metadataProvenance?.[video.id]);
    const folder = folderNames.get(video.folderId);
    if (!reviewed&&!movieEvidence(video,scope.tags?.[video.id],folder,scope.metadataProvenance?.[video.id])) {
      if (!(Number.isFinite(video.duration) && video.duration! > 0) && movieIdentityEvidence(video,scope.tags?.[video.id],folder,scope.metadataProvenance?.[video.id])) { awaitingRuntime++; if (candidates.length < 96) candidates.push(video); }
      return;
    }
    videos.push(video);
    if(reviewed&&version.grouped){const rows=filmGroups.get(version.filmId);if(rows)rows.push(video);else filmGroups.set(version.filmId,[video]);}
    if (isClassicVideo(video)) { classics.push(video); classicSet.add(video); }
    (video.duration! >= 2400 ? features : shorts).push(video);
    const labels = (scope.tags?.[video.id] ?? []).map(tag => tag.toLowerCase().replace(/^#|^genre-/g,'').replace(/[-_]+/g,' '));
    for (const [key,shelf] of genres) if (video.genre?.toLowerCase().split(/\s*[,/|]\s*/).includes(key) || labels.includes(key)
      || /\bfull (?:movie|film|documentary)\b/i.test(video.name) && GENRE_PATTERNS.get(key)!.test(video.name)) shelf.videos.push(video);
    if (genres.get('documentary')!.videos.at(-1) === video) documentaries.push(video);
    const type = (video.extension || 'file').replace(/^\./, '').toUpperCase();
    const rows = types.get(type);
    if (rows) rows.push(video); else types.set(type, [video]);
  }, turn, 4096);
  // Usually just a few file types, but imported metadata need not be bounded.
  const typeRows: MovieCatalog['types'] = [];
  await forEachCatalogEntry(types, ([type, videos]) => { typeRows.push({ type, videos }); }, turn);
  const sortedTypes = await sortCatalogRows(typeRows, (a, b) => b.videos.length - a.videos.length || a.type.localeCompare(b.type), turn);
  return { videos, classics, classicSet, genres: [...genres.values()].filter(shelf => shelf.videos.length), types: sortedTypes.slice(0, 10), candidates, awaitingRuntime, features, shorts, documentaries,filmGroups:[...filmGroups].map(([filmId,versions])=>({filmId,versions})) };
}

export function movieShuffleRank(id: string, seed: number) {
  let rank = seed >>> 0;
  for (let index = 0; index < id.length; index++) rank = Math.imul(rank ^ id.charCodeAt(index), 0x45d9f3b);
  return rank >>> 0;
}

export async function shuffleMovieCatalog(catalog: MovieCatalog, seed: number, turn: () => Promise<void>) {
  const ranks = new Uint32Array(catalog.videos.length), positions: number[] = [];
  await forEachCatalogSlice(catalog.videos, (video, index) => {
    ranks[index] = movieShuffleRank(video.id, seed); positions.push(index);
  }, turn, 4096);
  // Numeric comparisons are cheap: retain the sorter's 4 ms time ceiling and
  // 256-row native runs, but avoid hundreds of tiny scheduling round trips.
  const ordered = await sortCatalogRows(positions, (a, b) => ranks[a]! - ranks[b]!, turn, 16_384);
  const videos: LibraryVideo[] = [], modern: LibraryVideo[] = [];
  await forEachCatalogSlice(ordered, position => {
    const video = catalog.videos[position]!;
    videos.push(video);
    if (!catalog.classicSet.has(video)) modern.push(video);
  }, turn, 4096);
  return { videos, modern };
}
