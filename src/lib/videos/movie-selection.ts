import { forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import type { LibraryVideo } from './types';
import type { MovieCatalog } from './movie-catalog';
export type MovieFilters = { query: string; runtime: 'all'|'feature'|'short'; source: 'all'|'local'|'youtube'; genre: string; decade: string; saved: 'all'|'favorites'|'unwatched'; order: 'title'|'year'|'runtime'|'newest' };
export const DEFAULT_MOVIE_FILTERS: MovieFilters = { query:'',runtime:'all',source:'all',genre:'all',decade:'all',saved:'all',order:'title' };
export const movieReleaseYear = (video: LibraryVideo) => {
  const limit=new Date().getFullYear()+1;
  if(Number.isInteger(video.year)&&video.year!>=1888&&video.year!<=limit)return video.year!;
  const title=video.name.replace(/\.(?:mkv|mp4|avi|mov|m4v|webm)$/i,'');
  const match=/\((18[89]\d|19\d{2}|20\d{2})\)/.exec(title)??/\b(18[89]\d|19\d{2}|20\d{2})(?=(?:[._ -](?:1080p|720p|2160p|bluray|webrip|brrip|x26[45]|h26[45]))|$)/i.exec(title);
  const year=match?Number(match[1]):undefined;return year&&year<=limit?year:undefined;
};
export async function selectMovies(catalog: MovieCatalog, filters: MovieFilters, favorites: Record<string, unknown>, watched: Record<string, unknown>, turn: () => Promise<void>) {
  const needle = filters.query.trim().toLocaleLowerCase(), rows: LibraryVideo[] = [];
  const genreRows = filters.genre === 'all' ? undefined : new Set(catalog.genres.find(row => row.genre === filters.genre)?.videos ?? []);
  await forEachCatalogSlice(catalog.videos, video => {
    const year = movieReleaseYear(video);
    if (needle && !video.name.toLocaleLowerCase().includes(needle)) return;
    if (filters.runtime === 'feature' && video.duration! < 2400 || filters.runtime === 'short' && video.duration! >= 2400) return;
    if (filters.source === 'local' && video.remote || filters.source === 'youtube' && video.remote?.kind !== 'youtube') return;
    if (genreRows && !genreRows.has(video)) return;
    if (filters.decade === 'unknown' ? year !== undefined : filters.decade !== 'all' && (!year || Math.floor(year/10)*10 !== Number(filters.decade))) return;
    if (filters.saved === 'favorites' && !favorites[video.id] || filters.saved === 'unwatched' && watched[video.id]) return;
    rows.push(video);
  },turn);
  const collator=new Intl.Collator(undefined,{numeric:true,sensitivity:'base'});
  return sortCatalogRows(rows,(a,b)=> {
    if (filters.order==='year') { const ay=movieReleaseYear(a),by=movieReleaseYear(b); if(ay===undefined&&by!==undefined)return 1;if(by===undefined&&ay!==undefined)return -1;const diff=(by??0)-(ay??0);if(diff)return diff; }
    if (filters.order==='runtime') { const diff=b.duration!-a.duration!;if(diff)return diff; }
    if (filters.order==='newest') { const diff=b.addedAt-a.addedAt;if(diff)return diff; }
    return collator.compare(a.name,b.name);
  },turn);
}
