import type { TopicCatalogInput } from './topic-catalog';
import { forEachCatalogSlice } from '../catalog-work.ts';
import { isAdultPullKind } from './adult-sites.ts';
import { canonicalTopic,hasTopicForScan,topicEvidenceForScan } from './topics.ts';
import { getTopicAliases,type TopicAliasLedger } from './topic-aliases.ts';
export type TopicPosting={all:Uint32Array;saved:Uint32Array};
export type TopicPostings={eligible:Uint32Array;topics:Map<string,TopicPosting>;linked:Uint8Array;saved:Uint8Array;aliases:TopicAliasLedger;patchedTopics:string[];baseBuilds:number};
type Slot={input:TopicCatalogInput;pending:Promise<TopicPostings>;owner:()=>Promise<void>};
const slots=new WeakMap<readonly object[],Slot>();
function same(a:TopicCatalogInput,b:TopicCatalogInput){return a.tags===b.tags&&a.folders===b.folders&&a.hiddenVideos===b.hiddenVideos&&a.unavailable===b.unavailable&&a.hideDemo===b.hideDemo;}
export function publicTopicTitle(input:TopicCatalogInput){const privateIds=new Set(input.folders.filter(row=>row.adult).map(row=>row.id)),known=new Set(input.folders.map(row=>row.id));return (video:TopicCatalogInput['videos'][number])=>!privateIds.has(video.folderId)&&!isAdultPullKind(video.remote?.kind)&&!input.hiddenVideos[video.id]&&!input.unavailable[video.id]&&!(input.hideDemo&&video.isSample)&&Boolean(known.has(video.folderId)||video.remote||video.isSample);}
async function build(input:TopicCatalogInput,turn:()=>Promise<void>):Promise<TopicPostings>{
 const allowed=publicTopicTitle(input),eligible:number[]=[],topics=new Map<string,{all:number[];saved:number[]}>(),linked=new Uint8Array(input.videos.length),saved=new Uint8Array(input.videos.length),aliases=getTopicAliases();
 await forEachCatalogSlice(input.videos,(video,index)=>{if(!allowed(video))return;eligible.push(index);for(const link of topicEvidenceForScan(video,input.tags[video.id])){let row=topics.get(link.topic);if(!row){row={all:[],saved:[]};topics.set(link.topic,row);}row.all.push(index);linked[index]++;if(link.saved){row.saved.push(index);saved[index]++;}}},turn,256);
 return {eligible:Uint32Array.from(eligible),topics:new Map([...topics].map(([topic,row])=>[topic,{all:Uint32Array.from(row.all),saved:Uint32Array.from(row.saved)}])),linked,saved,aliases,patchedTopics:[],baseBuilds:1};
}
async function patch(index:TopicPostings,input:TopicCatalogInput,turn:()=>Promise<void>){
 const next=getTopicAliases(),oldMap=new Map(index.aliases.entries.map(row=>[row.alias,row.topic])),newMap=new Map(next.entries.map(row=>[row.alias,row.topic]));
 const affected=new Set<string>();for(const key of new Set([...oldMap.keys(),...newMap.keys()])){if(oldMap.get(key)===newMap.get(key))continue;const old=oldMap.get(key),current=newMap.get(key);if(old)affected.add(old);if(current)affected.add(current);}
 if(!affected.size){index.aliases=next;index.patchedTopics=[];return index;}
 const replacements=new Map([...affected].map(topic=>[topic,{all:[] as number[],saved:[] as number[]}])),linked=index.linked.slice(),saved=index.saved.slice();
 // Stage affected arrays completely before swapping; an interrupted patch cannot leave partial postings.
 for(const topic of affected){const prior=index.topics.get(topic);if(prior){await forEachCatalogSlice(prior.all,ordinal=>{linked[ordinal]--;},turn);await forEachCatalogSlice(prior.saved,ordinal=>{saved[ordinal]--;},turn);}}
 await forEachCatalogSlice(index.eligible,ordinal=>{const video=input.videos[ordinal]!,tags=input.tags[video.id]??[];for(const [topic,row]of replacements){if(!hasTopicForScan(video,topic,tags))continue;row.all.push(ordinal);linked[ordinal]++;if(tags.some(tag=>canonicalTopic(tag)===topic)){row.saved.push(ordinal);saved[ordinal]++;}}},turn,256);
 await turn();if(getTopicAliases()!==next)return patch(index,input,turn);
 const topics=new Map(index.topics);for(const [topic,row]of replacements){if(row.all.length)topics.set(topic,{all:Uint32Array.from(row.all),saved:Uint32Array.from(row.saved)});else topics.delete(topic);}
 index.topics=topics;index.linked=linked;index.saved=saved;index.aliases=next;index.patchedTopics=[...affected];return index;
}
/** Reuse all unrelated topic arrays on alias approval/Undo. Catalog/visibility edits still rebuild safely. */
export async function topicPostings(input:TopicCatalogInput,turn:()=>Promise<void>,recovered=false):Promise<TopicPostings>{
 let slot=slots.get(input.videos);if(!slot||!same(slot.input,input)){slot={input,pending:build(input,turn),owner:turn};slots.set(input.videos,slot);}
 try{const observed=slot.pending,index=await observed;await turn();if(slot.pending!==observed)return topicPostings(input,turn,recovered);if(index.aliases===getTopicAliases())return index;const pending=patch(index,input,turn);slot.pending=pending;slot.owner=turn;return await pending;}
 catch(error){if(slots.get(input.videos)===slot)slots.delete(input.videos);if(slot.owner!==turn&&!recovered){await turn();return topicPostings(input,turn,true);}throw error;}
}
