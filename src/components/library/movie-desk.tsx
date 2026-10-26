import {FilmReviewDesk} from './film-review';
import { useEffect, useMemo, useState } from 'react';
import { Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { catalogTurn } from '@/lib/catalog-turn';
import { useSessionPhase } from '@/lib/use-session-phase';
import { useLibrary } from '@/lib/videos/store';
import { DEFAULT_MOVIE_FILTERS, selectMovies, type MovieFilters } from '@/lib/videos/movie-selection';
import type { MovieCatalog } from '@/lib/videos/movie-catalog';
import { MovieRuntimeRepair } from './movie-runtime-repair';
import { TitleRail } from './browse';
import { VirtualVideoGrid } from './virtual-video-grid';

export function MovieDesk({ catalog, pending, onShuffle, onReload }: { catalog: MovieCatalog; pending: boolean; onShuffle: () => void; onReload: () => void }) {
  const [filters,setFilters]=useState(DEFAULT_MOVIE_FILTERS),[query,setQuery]=useState(''),[browse,setBrowse]=useState(false),[attempt,setAttempt]=useState(0);
  const [result,setResult]=useState<{scope:object;rows:MovieCatalog['videos']}>(),[failed,setFailed]=useState(false);
  const phase=useSessionPhase(),viewer=useLibrary(s=>Boolean(s.activeId||s.previewId));
  const favorites=useLibrary(s=>s.favorites),watched=useLibrary(s=>s.viewCounts);
  useEffect(()=>{const timer=setTimeout(()=>setFilters(value=>value.query===query?value:{...value,query}),160);return()=>clearTimeout(timer);},[query]);
  const scope=useMemo(()=>({catalog,filters,favorites,watched}),[catalog,filters,favorites,watched]);
  const filtered=Boolean(query||Object.entries(filters).some(([key,value])=>key!=='order'&&key!=='query'&&value!=='all'));
  const showGrid=browse||filtered;
  useEffect(()=>{if(!showGrid||pending||viewer||phase!=='active')return;const controller=new AbortController();setFailed(false);
    void selectMovies(catalog,filters,favorites,watched,catalogTurn(controller.signal)).then(rows=>{if(!controller.signal.aborted)setResult({scope,rows});}).catch(()=>{if(!controller.signal.aborted)setFailed(true);});return()=>controller.abort();
  },[scope,showGrid,pending,viewer,phase,attempt]);
  const ready=!pending&&result?.scope===scope&&query===filters.query;
  const change=<K extends keyof MovieFilters>(key:K,value:MovieFilters[K])=>setFilters(previous=>({...previous,[key]:value}));
  const reset=()=>{setFilters(DEFAULT_MOVIE_FILTERS);setQuery('');};
  return <section data-movie-catalog={catalog.videos.length} aria-label="Movie library" aria-busy={pending}>
    <div className="mb-5 rounded-xl border border-border bg-surface p-5 sm:p-6"><p className="text-xs tracking-widest text-accent uppercase">Your film collection</p><div className="mt-2 flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-4xl text-fg">Movie night.</h1><div className="flex flex-wrap gap-2"><Button variant="secondary" className="min-h-11" disabled={pending} onClick={onShuffle}><Shuffle className="size-4"/>Random pick</Button><Button variant="secondary" className="min-h-11" onClick={onReload}>Reload local files</Button></div></div><p className="mt-2 text-sm leading-6 text-muted">Full-film evidence and a verified runtime over 10 minutes are required. Trailers, reviews, gameplay and series episodes stay in the general library. A long video alone is not a movie.</p><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{[['Films',catalog.videos.length],['Feature length · 40m+',catalog.features.length],['Short films · 10–40m',catalog.shorts.length],['Documentaries',catalog.documentaries.length]].map(([label,value])=><div key={label} className="rounded-md bg-bg/45 p-3"><p className="text-xs text-muted">{label}</p><p className="mt-1 text-xl text-fg">{pending?'…':Number(value).toLocaleString()}</p></div>)}</div></div>
    <FilmReviewDesk catalog={catalog}/><div className="mb-5 rounded-lg border border-border bg-elevated p-4" aria-label="Find a movie"><Input aria-label="Search movies" placeholder="Find a film in your collection" value={query} onChange={event=>setQuery(event.target.value)} className="min-h-11"/><div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
      <MovieSelect label="Movie length" value={filters.runtime} onChange={value=>change('runtime',value as MovieFilters['runtime'])} options={[["all","Any film length"],["feature","Feature · 40m+"],["short","Short · 10–40m"]]}/>
      <MovieSelect label="Movie genre" value={filters.genre} onChange={value=>change('genre',value)} options={[["all","All genres"],...catalog.genres.map(row=>[row.genre,row.genre] as [string,string])]}/>
      <MovieSelect label="Movie decade" value={filters.decade} onChange={value=>change('decade',value)} options={[["all","All release years"],["unknown","Year unknown"],...[2020,2010,2000,1990,1980,1970,1960,1950,1940,1930,1920,1910,1900,1890,1880].map(year=>[String(year),year+'s'] as [string,string])]}/>
      <MovieSelect label="Movie source" value={filters.source} onChange={value=>change('source',value as MovieFilters['source'])} options={[["all","All sources"],["local","Local films"],["youtube","YouTube films"]]}/>
      <MovieSelect label="Movie watch filter" value={filters.saved} onChange={value=>change('saved',value as MovieFilters['saved'])} options={[["all","All films"],["unwatched","Unwatched"],["favorites","Favorites"]]}/>
      <MovieSelect label="Movie order" value={filters.order} onChange={value=>{change('order',value as MovieFilters['order']);setBrowse(true);}} options={[["title","Title A–Z"],["year","Release year"],["runtime","Longest first"],["newest","Recently added"]]}/>
    </div><div className="mt-3 flex flex-wrap gap-2"><Button variant="secondary" className="min-h-11" aria-expanded={showGrid} onClick={()=>{if(showGrid){reset();setBrowse(false);}else setBrowse(true);}}>{showGrid?'Hide full film browser':'Browse all films'}</Button>{(filtered||query)&&<Button variant="ghost" className="min-h-11" onClick={reset}>Reset movie filters</Button>}</div><p className="mt-2 text-xs leading-5 text-muted">Release-year filters use saved metadata or clear filename years; missing years stay unknown. Browsing never changes your tags or watch history.</p></div>
    {showGrid?<div aria-label="Filtered movie catalog" aria-busy={!ready&&!failed}>{failed?<div role="alert"><p>Could not prepare the film browser.</p><Button onClick={()=>setAttempt(value=>value+1)}>Retry movies</Button></div>:!ready?<p role="status" className="mb-5 text-sm text-muted">Finding films…</p>:<><p className="mb-3 text-sm text-muted" role="status">{result.rows.length.toLocaleString()} matching films</p><VirtualVideoGrid key={JSON.stringify(filters)} videos={result.rows} variant="poster" pageSize={24}/>{!result.rows.length&&<p className="rounded-lg bg-surface p-5 text-sm text-muted">No films match these choices. Reset a filter or check the unverified runtimes below.</p>}</>}</div>:<><TitleRail title="Feature films" reason="At least 40 minutes, with film evidence." videos={catalog.features} variant="poster"/><TitleRail title="Short films" reason="Film evidence and a runtime over 10, under 40 minutes." videos={catalog.shorts} variant="poster"/><TitleRail title="Documentary films" videos={catalog.documentaries} variant="poster"/>{catalog.genres.filter(row=>row.genre!=='Documentary').map(row=><TitleRail key={row.genre} title={row.genre+' films'} videos={row.videos} variant="poster"/>)}<TitleRail title="Classic movies" videos={catalog.classics} variant="poster"/></>}
    <MovieRuntimeRepair candidates={catalog.candidates} total={catalog.awaitingRuntime}/>{catalog.candidates.length>0&&<TitleRail title="Likely movies · runtime unverified" videos={catalog.candidates} variant="poster"/>}
    {!pending&&!catalog.videos.length&&<p className="rounded-lg bg-surface p-5 text-sm text-muted">No movies with verified runtimes yet. Movie folders, full-film titles and saved movie tags identify candidates; runtime checks recover missing lengths.</p>}
  </section>;
}
function MovieSelect({label,value,onChange,options}:{label:string;value:string;onChange:(value:string)=>void;options:[string,string][]}){return <label className="min-w-0 text-xs text-muted">{label}<select aria-label={label} value={value} onChange={event=>onChange(event.target.value)} className="mt-1 block min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-2 text-sm text-fg">{options.map(([id,text])=><option key={id} value={id}>{text}</option>)}</select></label>;}
