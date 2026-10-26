import { TOPICS,baseCanonicalTopic } from './topic-taxonomy.ts';
export const TOPIC_ALIAS_LIMIT=128;
export type TopicAliasDecision={alias:string;topic:string;at:number;method:'spelling-review'|'manual-review';titleCount:number;sources:string[]};
export type TopicAliasLedger={version:1;updatedAt:number;entries:TopicAliasDecision[]};
export const EMPTY_TOPIC_ALIASES:TopicAliasLedger={version:1,updatedAt:0,entries:[]};
export const aliasLabel=(raw:string)=>raw.trim().toLowerCase().replace(/^#/,'').replace(/^keyword-/,'').replace(/\s+/g,'-');
export function validAliasLabel(raw:string){const label=aliasLabel(raw);return label.length>=2&&label.length<=64&&/^[\p{L}\p{N}]+(?:-[\p{L}\p{N}]+)*$/u.test(label)&&!baseCanonicalTopic(label)&&!['shorts','vod','clips','live','upload','video','youtube','twitch'].includes(label)&&!/^(?:provider|creator|source|format|auto|sub|fetish|genre|meta)-/.test(label);}
export function isTopicAliasLedger(raw:unknown):raw is TopicAliasLedger{const v=raw as Partial<TopicAliasLedger>|undefined;return Boolean(v&&v.version===1&&Number.isSafeInteger(v.updatedAt)&&v.updatedAt!>=0&&Array.isArray(v.entries));}
export function normalizeTopicAliases(raw:unknown):TopicAliasLedger{
 if(!isTopicAliasLedger(raw))return EMPTY_TOPIC_ALIASES;const entries=new Map<string,TopicAliasDecision>();
 for(const row of raw.entries.slice(0,TOPIC_ALIAS_LIMIT*2)){
  if(!row||typeof row.alias!=='string'||!validAliasLabel(row.alias)||aliasLabel(row.alias)!==row.alias||!TOPICS.has(row.topic)||!Number.isSafeInteger(row.at)||row.at<0||!['spelling-review','manual-review'].includes(row.method))continue;
  const old=entries.get(row.alias);if(old&&old.at>row.at)continue;
  entries.set(row.alias,{alias:row.alias,topic:row.topic,at:row.at,method:row.method,titleCount:Number.isFinite(row.titleCount)?Math.max(0,Math.min(10_000_000,Math.floor(row.titleCount))):0,sources:Array.isArray(row.sources)?[...new Set(row.sources.filter((value):value is string=>typeof value==='string'&&['local','youtube','twitch'].includes(value)))].slice(0,3):[]});
 }
 return {version:1,updatedAt:raw.updatedAt,entries:[...entries.values()].sort((a,b)=>b.at-a.at||a.alias.localeCompare(b.alias)).slice(0,TOPIC_ALIAS_LIMIT)};
}
export function newestTopicAliases(a:unknown,b:unknown){const left=normalizeTopicAliases(a),right=normalizeTopicAliases(b);return right.updatedAt>=left.updatedAt?right:left;}
let current=EMPTY_TOPIC_ALIASES,revision=0,historyFloor=0;const versions=new Map<string,number>();let byAlias=new Map<string,string>();
export function installTopicAliases(raw:unknown){
 const next=normalizeTopicAliases(raw),map=new Map(next.entries.map(row=>[row.alias,row.topic])),changed=[...new Set([...byAlias.keys(),...map.keys()])].filter(key=>byAlias.get(key)!==map.get(key));
 current=next;if(changed.length){revision++;for(const key of changed)versions.set(key,revision);while(versions.size>512){const first=versions.keys().next().value!;historyFloor=Math.max(historyFloor,versions.get(first)!);versions.delete(first);}byAlias=map;}return changed;
}
export const getTopicAliases=()=>current;
export const getTopicAliasRevision=()=>revision;
export const reviewedTopic=(tag:string)=>byAlias.get(aliasLabel(tag));
export function aliasTagsChanged(tags:readonly string[],since:number){return since<historyFloor||tags.some(tag=>(versions.get(aliasLabel(tag))??0)>since);}
export function reviewedRankingTag(tag:string){return reviewedTopic(tag)??tag;}
export function changeTopicAlias(ledger:TopicAliasLedger,entry:TopicAliasDecision,remove=false,now=Date.now()):TopicAliasLedger{
 if(!validAliasLabel(entry.alias)||!TOPICS.has(entry.topic))throw new Error('Choose a new descriptive label and an existing topic. Built-in topics and provider/creator labels cannot be remapped.');
 const existing=ledger.entries.find(row=>row.alias===entry.alias);if(remove&&!existing)return ledger;
 if(!remove&&!existing&&ledger.entries.length>=TOPIC_ALIAS_LIMIT)throw new Error('The 128-alias limit is reached. Undo an existing alias before adding another.');
 return normalizeTopicAliases({version:1,updatedAt:Math.max(now,ledger.updatedAt+1),entries:[...(remove?[]:[entry]),...ledger.entries.filter(row=>row.alias!==entry.alias)]});
}
/** Exact reviewed labels only; short/prefix guesses never expand a query. */
export function aliasSearchTerms(token:string,ledger:TopicAliasLedger){
 const label=aliasLabel(token),entry=ledger.entries.find(row=>row.alias===label),topic=entry?.topic??(TOPICS.has(label)?label:undefined);
 if(!topic||!ledger.entries.some(row=>row.topic===topic))return [];
 return [...new Set([topic,...ledger.entries.filter(row=>row.topic===topic).flatMap(row=>[row.alias,'keyword-'+row.alias,row.alias.replaceAll('-',' '),'keyword-'+row.alias.replaceAll('-',' ')])])];
}
