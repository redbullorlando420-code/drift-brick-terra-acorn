import { describeRoomMedia, resolveRoomMedia, type RoomMediaDescriptor } from './room-media.ts';
import type { LibraryVideo } from '../videos/types.ts';
export type HostCatalogPage={videos:LibraryVideo[];hasMore:boolean;nextOffset?:number};
export function hostCatalogPayload(videos:LibraryVideo[],offset:number,hasMore:boolean){
 const media:RoomMediaDescriptor[]=[];let bytes=0;
 for(const video of videos.slice(0,24)){const descriptor=describeRoomMedia(video);if(!descriptor)break;const size=new TextEncoder().encode(JSON.stringify(descriptor)).length;if(bytes+size>24000)break;bytes+=size;media.push(descriptor);}
 return {media,nextOffset:offset+media.length,hasMore:hasMore||media.length<videos.length};
}
export type RoomHostCatalog={connected:boolean;search:(query:string,offset:number,signal:AbortSignal)=>Promise<HostCatalogPage>};
export function readHostCatalogQuery(value:unknown){
  if(!value||typeof value!=='object')return;
  const row=value as {requestId?:unknown;query?:unknown;offset?:unknown};
  if(typeof row.requestId!=='string'||!row.requestId||row.requestId.length>100||typeof row.query!=='string'||row.query.length>160||typeof row.offset!=='number'||!Number.isSafeInteger(row.offset)||row.offset<0||row.offset>10_000_000)return;
  return {requestId:row.requestId,query:row.query.trim(),offset:row.offset};
}
export function readHostCatalogPage(value:unknown):HostCatalogPage|undefined{
  if(!value||typeof value!=='object')return;
  const row=value as {media?:unknown;hasMore?:unknown;nextOffset?:unknown};
  if(!Array.isArray(row.media)||row.media.length>24||typeof row.hasMore!=='boolean')return;
  const videos:LibraryVideo[]=[];const seen=new Set<string>();
  for(const media of row.media){const video=resolveRoomMedia(media)?.video;if(!video||seen.has(video.id))return;seen.add(video.id);videos.push(video);}
  if(row.nextOffset!==undefined&&(typeof row.nextOffset!=='number'||!Number.isSafeInteger(row.nextOffset)||row.nextOffset<0||row.nextOffset>10_000_000))return;
  return {videos,hasMore:row.hasMore,nextOffset:row.nextOffset as number|undefined};
}
