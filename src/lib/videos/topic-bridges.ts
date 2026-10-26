import type {LibraryVideo} from './types.ts';
import {canonicalTopic} from './topics.ts';
import {TOPIC_RULES} from './topic-rules.ts';
export const BRIDGE_SOURCES=['local','youtube','twitch','photo'] as const;
export type BridgeSource=typeof BRIDGE_SOURCES[number];
export type VideoBridgeSource=Exclude<BridgeSource,'photo'>;
export const BRIDGE_LIMIT=256;
export type BridgePause={topic:string;a:BridgeSource;b:BridgeSource;at:number};
export type BridgeLedger={version:1;updatedAt:number;entries:BridgePause[]};
export const EMPTY_BRIDGES:BridgeLedger={version:1,updatedAt:0,entries:[]};
export const bridgeText=(value:string)=>value.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,160);
export function videoBridgeSource(video:LibraryVideo):VideoBridgeSource|undefined{return !video.remote?'local':video.remote.kind==='youtube'||video.remote.kind==='twitch'?video.remote.kind:undefined;}
/** Operational labels must not become topics even through an approved alias. */
export function bridgeTopic(raw:string){
 const value=raw.trim().toLowerCase().replace(/^keyword-/,'');
 if(!/^[\p{L}\p{N}][\p{L}\p{N} -]{1,63}$/u.test(value)||/^(?:provider|creator|source|format|auto|sub|fetish|genre|meta|vision|file|filetype|extension|year|date|published|added|downloaded|resolution|codec)[ -]/.test(value)||/^(?:\d[\d -]*|youtube|twitch|photo|photos|video|videos|shorts?|clips?|vod|live|upload|mp4|mkv|webm|mov|avi|png|jpe?g|gif|webp|heic|camera|screenshot|download)$/i.test(value))return;
 return canonicalTopic(value);
}
export const bridgePair=(a:BridgeSource,b:BridgeSource)=>BRIDGE_SOURCES.indexOf(a)<BRIDGE_SOURCES.indexOf(b)?[a,b] as const:[b,a] as const;
export const bridgeKey=(row:Pick<BridgePause,'topic'|'a'|'b'>)=>{const [a,b]=bridgePair(row.a,row.b);return row.topic+'|'+a+'|'+b;};
export function isBridgeLedger(raw:unknown):raw is BridgeLedger{const v=raw as Partial<BridgeLedger>|null;return Boolean(v&&v.version===1&&Number.isSafeInteger(v.updatedAt)&&v.updatedAt!>=0&&Array.isArray(v.entries));}
export function normalizeBridgeLedger(raw:unknown):BridgeLedger{
 if(!isBridgeLedger(raw))return EMPTY_BRIDGES;const rows=new Map<string,BridgePause>();
 for(const row of raw.entries.slice(0,BRIDGE_LIMIT*2)){
  if(!row||!BRIDGE_SOURCES.includes(row.a)||!BRIDGE_SOURCES.includes(row.b)||row.a===row.b||typeof row.topic!=='string'||bridgeTopic(row.topic)!==row.topic||!Number.isSafeInteger(row.at)||row.at<0)continue;
  const [a,b]=bridgePair(row.a,row.b),next={topic:row.topic,a,b,at:row.at},key=bridgeKey(next);if(!rows.has(key)||rows.get(key)!.at<=row.at)rows.set(key,next);
 }
 return {version:1,updatedAt:raw.updatedAt,entries:[...rows.values()].sort((a,b)=>b.at-a.at||bridgeKey(a).localeCompare(bridgeKey(b))).slice(0,BRIDGE_LIMIT)};
}
export function newestBridges(a:unknown,b:unknown){const left=normalizeBridgeLedger(a),right=normalizeBridgeLedger(b);return right.updatedAt>=left.updatedAt?right:left;}
export function changeBridge(ledger:BridgeLedger,row:BridgePause,remove=false,now=Date.now()){
 const clean=normalizeBridgeLedger({version:1,updatedAt:now,entries:[row]}).entries[0];if(!clean)throw Error('Choose a supported content topic and two different public sources.');
 const key=bridgeKey(clean),present=ledger.entries.some(entry=>bridgeKey(entry)===key);if(remove&&!present||!remove&&present)return ledger;
 if(!remove&&ledger.entries.length>=BRIDGE_LIMIT)throw Error('The 256-bridge limit is reached. Undo a pause before adding another.');
 return {version:1 as const,updatedAt:Math.max(now,ledger.updatedAt+1),entries:remove?ledger.entries.filter(entry=>bridgeKey(entry)!==key):[{...clean,at:now},...ledger.entries]};
}
export function bridgePolicy(raw?:BridgeLedger){const paused=new Set(normalizeBridgeLedger(raw).entries.map(bridgeKey));return (topic:string,a:BridgeSource,b:BridgeSource)=>a!==b&&paused.has(bridgeKey({topic,a,b}));}
export type BridgeField={topic:string;field:'saved tag'|'provider title'|'provider category';quote:string};
export function bridgeFields(video:LibraryVideo,tags:readonly string[]=[]):BridgeField[]{
 const source=videoBridgeSource(video);if(!source)return [];const fields=new Map<string,BridgeField>();
 for(const raw of tags.slice(0,80)){const topic=bridgeTopic(raw);if(topic&&!fields.has(topic))fields.set(topic,{topic,field:'saved tag',quote:bridgeText(raw)});}
 if(source!=='local')for(const [field,raw]of [['provider title',video.name],['provider category',video.genre??'']] as const){
  const value=raw.slice(0,500).replace(/#[\p{L}\p{N}_-]+/gu,'');
  if(/^https?:/i.test(value)||/\.(?:mp4|mkv|webm|mov|avi|png|jpe?g|gif|webp|heic)(?:\s|$)/i.test(value))continue;
  for(const [topic,pattern]of TOPIC_RULES)if(!fields.has(topic)&&pattern.test(value))fields.set(topic,{topic,field,quote:bridgeText(value)});
 }
 return [...fields.values()];
}
