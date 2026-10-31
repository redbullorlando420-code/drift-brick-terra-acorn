import { memo, useEffect, useRef, useState } from 'react';
import { Search, Play, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { roomSearchPage, ROOM_SEARCH_PAGE_SIZE } from '@/lib/multiplayer/room-search';
import { roomMediaKey } from '@/lib/multiplayer/room-media';
import { catalogTurn } from '@/lib/catalog-turn';
import { searchRoomYoutube } from '@/lib/remote/room-search-functions';
import type { LibraryVideo } from '@/lib/videos/types';
import { RoomVideoSummary } from './room-video-summary';
import type { RoomHostCatalog } from '@/lib/multiplayer/room-host-catalog';
type Page={videos:LibraryVideo[];cursor?:string};
export const RoomVideoSearch=memo(function RoomVideoSearch({candidates,catalogPending,writable,canAdd,suggestMode,pending,full,queuedKeys,currentKey,onPlay,onAdd,hostCatalog,preferHost=false}:{
  candidates:LibraryVideo[];catalogPending:boolean;writable:boolean;canAdd:boolean;suggestMode:boolean;pending:boolean;full:boolean;queuedKeys:Set<string>;currentKey?:string;
  onPlay:(video:LibraryVideo)=>void;onAdd:(video:LibraryVideo)=>void;
  hostCatalog?:RoomHostCatalog;preferHost?:boolean;
}){
  const [query,setQuery]=useState(''),[source,setSource]=useState<'library'|'youtube'|'host'>(preferHost?'host':'library');
  const [offset,setOffset]=useState(0),[local,setLocal]=useState<{videos:LibraryVideo[];hasMore:boolean;nextOffset?:number;catalogRevision?:number}>({videos:[],hasMore:false});
  const [hostOffsets,setHostOffsets]=useState([0]);
  const [searching,setSearching]=useState(false),[online,setOnline]=useState<Page>(),[error,setError]=useState('');
  const [cursors,setCursors]=useState<Array<string|undefined>>([undefined]),[page,setPage]=useState(0);
  const [hostRetry,setHostRetry]=useState(0);
  useEffect(()=>{setOffset(0);setHostOffsets([0]);},[hostCatalog?.revision]);
  const request=useRef<AbortController | undefined>(undefined);
  useEffect(()=>()=>request.current?.abort(),[]);
  useEffect(()=>{
    if(source!=='host')return;
    setLocal({videos:[],hasMore:false});
    if(!hostCatalog?.connected){setSearching(false);setError('Host browsing is unavailable. Wait for the host to connect or enable library browsing.');return;}
    const controller=new AbortController();request.current?.abort();request.current=controller;setSearching(true);setError('');
    const timer=window.setTimeout(()=>{void hostCatalog.search(query,offset,controller.signal).then(page=>{if(!controller.signal.aborted)setLocal(page);}).catch(cause=>{if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:'Host search failed.');}).finally(()=>{if(!controller.signal.aborted)setSearching(false);});},300);
    return()=>{window.clearTimeout(timer);controller.abort();};
  },[source,hostCatalog,query,offset,hostRetry]);
  useEffect(()=>{
    if(source!=='library'||catalogPending)return;
    const controller=new AbortController();setSearching(true);
    const timer=window.setTimeout(()=>{void roomSearchPage(candidates,query,offset,catalogTurn(controller.signal)).then(result=>{if(!controller.signal.aborted){setLocal(result);setSearching(false);}}).catch(()=>{if(!controller.signal.aborted){setError('Library search could not finish. Try a shorter search.');setSearching(false);}});},160);
    return()=>{window.clearTimeout(timer);controller.abort();};
  },[source,candidates,catalogPending,query,offset]);
  const reset=(value:string)=>{request.current?.abort();setQuery(value);setOffset(0);setHostOffsets([0]);setOnline(undefined);setCursors([undefined]);setPage(0);setError('');setSearching(source!=='youtube');};
  const runOnline=async(cursor?:string,nextPage=0)=>{
    request.current?.abort();const controller=new AbortController();request.current=controller;setSearching(true);setError('');
    try{
      const result=await searchRoomYoutube({data:{query:query.trim(),cursor},signal:controller.signal});
      if(controller.signal.aborted)return;
      setOnline(result);setPage(nextPage);setCursors(values=>[...values.slice(0,nextPage),cursor]);
    }catch(cause){if(!controller.signal.aborted)setError(cause instanceof Error?cause.message:'YouTube search is unavailable. Try again or paste a video link.');}
    finally{if(!controller.signal.aborted)setSearching(false);}
  };
  const videos=source==='host'?(hostCatalog?.connected&&local.catalogRevision===hostCatalog.revision?local.videos:[]):source==='library'?local.videos:online?.videos??[];
  const busy=searching||source==='library'&&catalogPending;
  return <section aria-label="Find room videos" className="mt-4 border-t border-border pt-4">
    <h4 className="flex items-center gap-2 font-medium text-fg"><Search className="size-4 text-accent"/>Find videos</h4>
    <div className="mt-3 flex flex-wrap gap-2" aria-label="Video search source">
      {hostCatalog&&<Button size="sm" variant={source==='host'?'default':'secondary'} className="min-h-11" aria-pressed={source==='host'} onClick={()=>{request.current?.abort();setSearching(false);setError('');setOffset(0);setHostOffsets([0]);setSource('host');}}>Host library</Button>}
      <Button size="sm" variant={source==='library'?'default':'secondary'} className="min-h-11" aria-pressed={source==='library'} onClick={()=>{request.current?.abort();setSearching(false);setError('');setOffset(0);setSource('library');}}>My library</Button>
      <Button size="sm" variant={source==='youtube'?'default':'secondary'} className="min-h-11" aria-pressed={source==='youtube'} onClick={()=>{request.current?.abort();setSearching(false);setError('');setSource('youtube');}}>YouTube search</Button>
    </div>
    <form className="mt-3 flex flex-wrap gap-2" onSubmit={event=>{event.preventDefault();if(source==='youtube'&&query.trim()&&!busy)void runOnline();}}>
      <Input className="min-w-0 flex-1 basis-48" value={query} onChange={event=>reset(event.target.value)} maxLength={160} placeholder={source!=='youtube'?'Title, creator, topic or video tags':'Search public YouTube videos'} aria-label="Search room videos"/>
      {source==='youtube'&&<Button size="sm" className="min-h-11" disabled={!query.trim()||busy} type="submit"><Search className="size-4"/>Search YouTube</Button>}
    </form>
    <p className="mt-2 text-xs leading-5 text-muted">{source==='host'?'Find videos in the host’s library even when your own library is empty. Search shared titles and creators. Only this result page is sent to your device; private sources, descriptions and saved tags are excluded. Queue a title for everyone; the host confirms the order.':source==='library'?`Search all ${candidates.length.toLocaleString()} playable library videos by title, creator, description or tags. Results update as you type.`:'Search public YouTube without following a channel. Results stay in this room until you queue or play one. Press Search YouTube to send your query.'}</p>
    <div role="status" aria-live="polite" className="mt-2 text-xs text-accent">{busy?(catalogPending&&source==='library'?'Preparing playable videos…':'Searching videos…'):error||`${videos.length} result${videos.length===1?'':'s'}${source==='host'?` · page ${hostOffsets.length}`:source==='library'?` · page ${Math.floor(offset/ROOM_SEARCH_PAGE_SIZE)+1}`:online?` · page ${page+1}`:''}`}</div>
    {source==='host'&&error&&<Button size="sm" variant="secondary" className="mt-2 min-h-11" disabled={!hostCatalog?.connected||busy} onClick={()=>setHostRetry(value=>value+1)}>Retry host search</Button>}
    {source==='youtube'&&!!query.trim()&&<a className="mt-2 inline-flex min-h-11 items-center gap-1 text-xs text-accent" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query.trim())}`} target="_blank" rel="noreferrer"><ExternalLink className="size-3"/>Open this search on YouTube</a>}
    <ul aria-label="Room video search results" aria-busy={busy} className="mt-3 max-h-128 space-y-3 overflow-y-auto">
      {videos.map(video=>{const key=roomMediaKey(video),queued=queuedKeys.has(key),current=currentKey===key;return <li key={key} data-room-result-id={video.id} className="rounded-md bg-bg/50 p-3">
        <RoomVideoSummary video={video} description><div className="flex min-w-0 items-start gap-2"><button type="button" className="min-h-11 min-w-0 flex-1 text-left text-sm font-medium text-fg hover:text-accent disabled:opacity-60" aria-label={video.name} title={video.name} onClick={()=>onPlay(video)} disabled={!writable||busy||pending}><span className="line-clamp-3 break-words"><Play aria-hidden="true" className="mr-1 inline size-3"/>{video.name}</span></button><Button size="sm" variant="secondary" className="min-h-11 shrink-0" aria-label={suggestMode?`Suggest ${video.name}`:undefined} disabled={!canAdd||busy||pending||suggestMode&&!video.remote||queued||current||!suggestMode&&full} onClick={()=>onAdd(video)}>{suggestMode?'Suggest':'Queue'}</Button></div></RoomVideoSummary>
        {(queued||current)&&<p className="mt-2 text-xs text-accent">{current?'Playing now':'Already in the queue'}</p>}
      </li>;})}
    </ul>
    {!videos.length&&!busy&&!error&&<p className="mt-3 text-xs text-muted">{source==='youtube'&&!online?'Type a title, creator or topic, then search YouTube.':'No playable videos match. Try fewer words or another creator.'}</p>}
    <div className="mt-3 flex flex-wrap justify-between gap-2" aria-label="Search result pages">
      <Button size="sm" variant="secondary" className="min-h-11" disabled={busy||(source!=='youtube'?offset===0:page===0)} onClick={()=>{if(source==='host'){const previous=hostOffsets.slice(0,-1);setHostOffsets(previous.length?previous:[0]);setOffset(previous.at(-1)??0);}else if(source==='library')setOffset(value=>Math.max(0,value-ROOM_SEARCH_PAGE_SIZE));else void runOnline(cursors[page-1],page-1);}}><ChevronLeft className="size-4"/>Previous results</Button>
      <Button size="sm" variant="secondary" className="min-h-11" disabled={busy||(source!=='youtube'?!local.hasMore:!online?.cursor||cursors.includes(online.cursor)||page>=19)} onClick={()=>{if(source==='host'){const next=local.nextOffset??offset+local.videos.length;if(next<=offset)return;setHostOffsets(values=>[...values,next]);setOffset(next);}else if(source==='library')setOffset(value=>value+ROOM_SEARCH_PAGE_SIZE);else void runOnline(online?.cursor,page+1);}}>More results<ChevronRight className="size-4"/></Button>
    </div>
  </section>;
});
