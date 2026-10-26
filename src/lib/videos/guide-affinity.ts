import {guideContentTags} from './guide-evidence.ts';
import {bridgeTopic,bridgePolicy,videoBridgeSource,type VideoBridgeSource} from './topic-bridges.ts';
import type {GuideInput} from './guide-picks.ts';
import type {LibraryVideo} from './types.ts';
type Slots=Partial<Record<VideoBridgeSource,number>>;
export type GuideOrigins={same:Map<string,Slots>;cross:Map<string,Slots>};
export const createGuideOrigins=():GuideOrigins=>({same:new Map(),cross:new Map()});
function record(map:Map<string,Slots>,key:string,source:VideoBridgeSource,ordinal:number){const slots=map.get(key)??{};if(slots[source]===undefined||ordinal>0&&slots[source]!<0)slots[source]=ordinal;map.set(key,slots);}
export function addGuideOrigins(input:GuideInput,video:LibraryVideo,index:number,origins:GuideOrigins,content=guideContentTags(input.tags[video.id])){
 const source=videoBridgeSource(video);if(!source||!input.favorites[video.id]&&!input.likes[video.id])return false;
 let limited=false;const ordinal=input.favorites[video.id]?index+1:-(index+1);
 for(const key of content){if(!origins.same.has(key)&&origins.same.size>=4096){limited=true;continue;}record(origins.same,key,source,ordinal);}
 for(const raw of (input.tags[video.id]??[]).slice(0,80)){const topic=bridgeTopic(raw);if(topic)record(origins.cross,topic,source,ordinal);}
 return limited;
}
/** Prefer within-source evidence. Only explicit canonical content topics can cross sources. */
export function createGuideAffinity(input:GuideInput,origins:GuideOrigins){
 const paused=bridgePolicy(input.bridgeSuppressions);
 return (video:LibraryVideo,visit?:(key:string,ordinal:number)=>void)=>{
  const source=videoBridgeSource(video);if(!source)return 0;let score=0,crossTags:Set<string>|undefined;
  for(const key of guideContentTags(input.tags[video.id])){
   let ordinal=origins.same.get(key)?.[source];
   if(ordinal===undefined&&origins.cross.has(key)){
    crossTags??=new Set((input.tags[video.id]??[]).slice(0,80).map(bridgeTopic).filter((topic):topic is string=>Boolean(topic)));
    if(!crossTags.has(key))continue;
    for(const candidateSource of ['local','youtube','twitch'] as const){if(source===candidateSource||paused(key,source,candidateSource))continue;const candidate=origins.cross.get(key)?.[candidateSource];if(candidate!==undefined&&(ordinal===undefined||candidate>0&&ordinal<0))ordinal=candidate;}
   }
   if(ordinal!==undefined){score++;visit?.(key,ordinal);}
  }return score;
 };
}
