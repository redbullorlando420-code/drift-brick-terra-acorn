import { videoIsPrivate } from './public-visibility.ts';
import type { TopicCatalogInput } from './topic-catalog';
import { forEachCatalogSlice } from '../catalog-work.ts';
import { TOPICS,baseCanonicalTopic } from './topic-taxonomy.ts';
import { aliasLabel,validAliasLabel,type TopicAliasLedger } from './topic-aliases.ts';
import { isAdultPullKind } from './adult-sites.ts';
export type AliasCandidate={alias:string;count:number;sources:string[];samples:string[];suggested?:string;ambiguous:boolean};
function distance(a:string,b:string){if(Math.abs(a.length-b.length)>2)return 3;let prior=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const row=[i];for(let j=1;j<=b.length;j++)row[j]=Math.min(row[j-1]!+1,prior[j]!+1,prior[j-1]!+Number(a[i-1]!==b[j-1]));prior=row;}return prior[b.length]!;}
export function suggestAliasTopic(alias:string){
 if(alias.length<=3)return {ambiguous:true};
 const choices=[...TOPICS].map(topic=>({topic,distance:distance(alias,topic)})).filter(row=>row.distance<=(alias.length>=8?2:1)).sort((a,b)=>a.distance-b.distance||a.topic.localeCompare(b.topic));
 if(!choices.length)return undefined;const tied=choices.length>1&&choices[0]!.distance===choices[1]!.distance;
 return {suggested:tied?undefined:choices[0]!.topic,ambiguous:tied};
}
/** Bounded taxonomy review; samples contain public display titles only. No descriptions/paths or private evidence. */
export async function inspectAliasCandidates(input:TopicCatalogInput,ledger:TopicAliasLedger,turn:()=>Promise<void>,requested?:string){
 const privateFolders=new Set(input.folders.filter(row=>row.adult).map(row=>row.id)),known=new Set(input.folders.map(row=>row.id)),approved=new Set(ledger.entries.map(row=>row.alias));
 const candidates=new Map<string,{count:number;sources:Set<string>;samples:string[];suggested?:string;ambiguous:boolean}>(),memo=new Map<string,ReturnType<typeof suggestAliasTopic>>();
 const exact=requested?aliasLabel(requested):undefined;let examined=0,truncated=false;
 await forEachCatalogSlice(input.videos,video=>{
  if(videoIsPrivate(privateFolders,video)||isAdultPullKind(video.remote?.kind)||video.remote&&!['youtube','twitch'].includes(video.remote.kind)||input.hiddenVideos[video.id]||input.unavailable[video.id]||video.isSample||!known.has(video.folderId)&&!video.remote)return;
  const labels=new Set((input.tags[video.id]??[]).slice(0,128).map(aliasLabel));
  for(const alias of labels){
   if(exact&&alias!==exact||approved.has(alias)||baseCanonicalTopic(alias)||!validAliasLabel(alias))continue;
   let suggestion=memo.get(alias);
   if(!memo.has(alias)){if(memo.size>=4096){truncated=true;continue;}suggestion=suggestAliasTopic(alias);memo.set(alias,suggestion);examined++;}
   if(!exact&&!suggestion)continue;
   let row=candidates.get(alias);if(!row){if(candidates.size>=256){truncated=true;continue;}row={count:0,sources:new Set(),samples:[],...suggestion,ambiguous:suggestion?.ambiguous??true};candidates.set(alias,row);}
   row.count++;row.sources.add(video.remote?.kind??'local');if(row.samples.length<3)row.samples.push(video.name.slice(0,180));
  }
 },turn,256);
 return {candidates:[...candidates].map(([alias,row]):AliasCandidate=>({alias,...row,sources:[...row.sources]})).sort((a,b)=>b.count-a.count||a.alias.localeCompare(b.alias)).slice(0,128),examined,truncated};
}
