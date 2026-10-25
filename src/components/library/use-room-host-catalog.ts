import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createLocalId } from '@/lib/local-id';
import { catalogTurn } from '@/lib/catalog-turn';
import { roomSearchPage } from '@/lib/multiplayer/room-search';
import { hostCatalogPayload, readHostCatalogPage, readHostCatalogQuery, type HostCatalogPage } from '@/lib/multiplayer/room-host-catalog';
import type { LibraryVideo } from '@/lib/videos/types';
type RoomTransport={send:(data:unknown,to?:string)=>void;onMessage:(listener:(from:string,data:unknown,channel:unknown)=>void)=>()=>void;peers:Array<{id:string;connectionState:string}>;readyRevision:number};
export function useRoomHostCatalog({transport,room,guest,hostId,candidates,preparing,shared,localTitles}:{transport:RoomTransport;room:string;guest:boolean;hostId:string;candidates:LibraryVideo[];preparing:boolean;shared:boolean;localTitles:boolean}){
  const {send,onMessage}=transport,peers=useRef(transport.peers);peers.current=transport.peers;
  const waiting=useRef(new Map<string,{resolve:(page:HostCatalogPage)=>void;reject:(error:Error)=>void;cleanup:()=>void}>());
  const [enabled,setEnabled]=useState(true),[version,setVersion]=useState(0);
  useEffect(()=>{
    if(guest||!room)return;
    send({type:'host-catalog-status',enabled:shared,localTitles});
  },[guest,room,shared,localTitles,candidates,preparing,transport.readyRevision,send]);
  useEffect(()=>{
    if(guest||!room)return;
    const jobs=new Map<string,{id:string;controller:AbortController}>(),receipts=new Map<string,unknown>();
    const off=onMessage((from,raw)=>{
      const packet=raw as any;if(!peers.current.some(peer=>peer.id===from&&peer.connectionState==='connected'))return;
      if(packet?.type==='host-catalog-cancel'&&jobs.get(from)?.id===packet.requestId){jobs.get(from)?.controller.abort();jobs.delete(from);return;}
      if(packet?.type!=='host-catalog-search')return;
      const request=readHostCatalogQuery(packet);if(!request)return;
      const key=`${from}:${request.requestId}`;
      if(receipts.has(key)){send(receipts.get(key),from);return;}
      if(jobs.get(from)?.id===request.requestId)return;
      jobs.get(from)?.controller.abort();
      const controller=new AbortController();jobs.set(from,{id:request.requestId,controller});
      const reply=(data:object)=>{
        if(controller.signal.aborted)return;
        const packet={type:'host-catalog-result',requestId:request.requestId,...data};
        receipts.set(key,packet);while(receipts.size>16)receipts.delete(receipts.keys().next().value!);
        send(packet,from);jobs.delete(from);
      };
      if(!shared){reply({error:'The host has turned off library browsing.'});return;}
      if(preparing){reply({error:'The host is preparing its playable library. Try this search again in a moment.'});return;}
      void roomSearchPage(candidates,request.query,request.offset,catalogTurn(controller.signal),video=>Boolean(video.remote)||localTitles)
        .then(page=>reply(hostCatalogPayload(page.videos,request.offset,page.hasMore)))
        .catch(()=>{if(!controller.signal.aborted)reply({error:'The host could not finish this search. Try again.'});});
    });
    return()=>{off();for(const job of jobs.values())job.controller.abort();};
  },[guest,room,candidates,preparing,shared,localTitles,onMessage,send]);
  useEffect(()=>{
    setEnabled(true);
    const off=onMessage((from,raw)=>{
      if(!guest||!hostId||from!==hostId)return;
      const packet=raw as any;
      if(packet?.type==='host-catalog-status'){setEnabled(packet.enabled!==false);setVersion(value=>value+1);}
      if(packet?.type!=='host-catalog-result'||typeof packet.requestId!=='string')return;
      const entry=waiting.current.get(packet.requestId);if(!entry)return;
      entry.cleanup();
      if(typeof packet.error==='string'){entry.reject(Error(packet.error.slice(0,240)));return;}
      const page=readHostCatalogPage(packet);if(!page){entry.reject(Error('The host returned an unreadable result page.'));return;}
      entry.resolve(page);
    });
    return()=>{off();for(const entry of [...waiting.current.values()]){entry.cleanup();entry.reject(Error('The host connection changed. Search again when it reconnects.'));}};
  },[guest,hostId,room,onMessage]);
  const connected=Boolean(guest&&hostId&&transport.peers.some(peer=>peer.id===hostId&&peer.connectionState==='connected'));
  const search=useCallback((query:string,offset:number,signal:AbortSignal)=>new Promise<HostCatalogPage>((resolve,reject)=>{
    if(signal.aborted){reject(Error('Search cancelled.'));return;}
    if(!connected||!enabled){reject(Error(enabled?'Waiting for the host connection.':'The host has turned off library browsing.'));return;}
    if(waiting.current.size>=4){reject(Error('Wait for the current host search to finish.'));return;}
    const requestId=createLocalId('catalog-');
    const cleanup=()=>{window.clearTimeout(timer);signal.removeEventListener('abort',cancel);waiting.current.delete(requestId);};
    const cancel=()=>{cleanup();send({type:'host-catalog-cancel',requestId},hostId);reject(Error('Search cancelled.'));};
    const timer=window.setTimeout(()=>{cleanup();send({type:'host-catalog-cancel',requestId},hostId);reject(Error('The host did not answer. Check the connection and try again.'));},8000);
    waiting.current.set(requestId,{resolve,reject,cleanup});signal.addEventListener('abort',cancel,{once:true});
    send({type:'host-catalog-search',requestId,query:query.slice(0,160),offset},hostId);
  }),[connected,enabled,hostId,send,version]);
  return useMemo(()=>({connected:connected&&enabled,search}),[connected,enabled,search]);
}
