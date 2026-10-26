import type {LibraryVideo} from './types.ts';
import {forEachCatalogSlice} from '../catalog-work.ts';
import {BRIDGE_SOURCES,bridgeFields,bridgeText,bridgeTopic,videoBridgeSource,type BridgeSource,type BridgeField} from './topic-bridges.ts';
export type ReviewedPhoto={id:string;name:string;tags:readonly string[];reviewed:boolean;direct:boolean;hidden?:boolean};
export type BridgeAuditInput={videos:readonly LibraryVideo[];tags:Record<string,string[]>;folders:readonly {id:string;adult?:boolean}[];hidden?:Record<string,unknown>;unavailable?:Record<string,unknown>;photos?:readonly ReviewedPhoto[]};
export type BridgeSample={id:string;title:string;source:BridgeSource;field:BridgeField['field'];quote:string};
export type AuditBridge={topic:string;a:BridgeSource;b:BridgeSource;counts:[number,number];samples:[BridgeSample,BridgeSample]};
export async function auditTopicBridges(input:BridgeAuditInput,turn:()=>Promise<void>){
 await turn();const known=new Set(input.folders.map(f=>f.id)),privateIds=new Set(input.folders.filter(f=>f.adult).map(f=>f.id));
 const topics=new Map<string,Map<BridgeSource,{count:number;sample:BridgeSample}>>();const sourceCounts={local:0,youtube:0,twitch:0,photo:0};let publicTitles=0,reviewedPhotos=0;
 const add=(source:BridgeSource,id:string,title:string,fields:BridgeField[])=>{sourceCounts[source]++;for(const entry of fields){let group=topics.get(entry.topic);if(!group){group=new Map();topics.set(entry.topic,group);}const saved=group.get(source);if(saved)saved.count++;else group.set(source,{count:1,sample:{source,id,title:bridgeText(title),field:entry.field,quote:entry.quote}});}};
 await forEachCatalogSlice(input.videos,video=>{const source=videoBridgeSource(video);if(!source||video.isSample||privateIds.has(video.folderId)||input.hidden?.[video.id]||input.unavailable?.[video.id]||source==='local'&&!known.has(video.folderId))return;publicTitles++;add(source,video.id,video.name,bridgeFields(video,input.tags[video.id]));},turn);
 await forEachCatalogSlice((input.photos??[]).slice(0,48),photo=>{if(!photo.reviewed||!photo.direct||photo.hidden)return;reviewedPhotos++;const fields=new Map<string,BridgeField>();for(const tag of photo.tags.slice(0,80)){const topic=bridgeTopic(tag);if(topic&&!fields.has(topic))fields.set(topic,{topic,field:'saved tag',quote:bridgeText(tag)});}add('photo',photo.id,photo.name,[...fields.values()]);},turn);
 await turn();const bridges:AuditBridge[]=[];for(const [topic,groups]of topics)for(let i=0;i<BRIDGE_SOURCES.length;i++)for(let j=i+1;j<BRIDGE_SOURCES.length;j++){const a=BRIDGE_SOURCES[i]!,b=BRIDGE_SOURCES[j]!,left=groups.get(a),right=groups.get(b);if(left&&right)bridges.push({topic,a,b,counts:[left.count,right.count],samples:[left.sample,right.sample]});}
 bridges.sort((a,b)=>a.topic.localeCompare(b.topic)||BRIDGE_SOURCES.indexOf(a.a)-BRIDGE_SOURCES.indexOf(b.a)||BRIDGE_SOURCES.indexOf(a.b)-BRIDGE_SOURCES.indexOf(b.b));
 return {bridges,publicTitles,reviewedPhotos,sourceCounts};
}
export type BridgeAudit=Awaited<ReturnType<typeof auditTopicBridges>>;
