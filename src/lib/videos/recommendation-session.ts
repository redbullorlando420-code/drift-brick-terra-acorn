import type {LibraryVideo} from './types.ts';
import {createBoundedPicks} from './bounded-picks.ts';

export type RecommendationSession = Readonly<{
  familiarity: 'balanced'|'familiar'|'explore';
  length: 'any'|'short'|'medium'|'long';
  sources: 'all'|'balanced'|'youtube'|'twitch'|'local';
}>;
export const DEFAULT_RECOMMENDATION_SESSION:RecommendationSession=Object.freeze({familiarity:'balanced',length:'any',sources:'all'});
export function normalizeRecommendationSession(raw?:Partial<RecommendationSession>|null):RecommendationSession {
  const familiarity=['balanced','familiar','explore'].includes(raw?.familiarity??'')?raw!.familiarity!:'balanced';
  const length=['any','short','medium','long'].includes(raw?.length??'')?raw!.length!:'any';
  const sources=['all','balanced','youtube','twitch','local'].includes(raw?.sources??'')?raw!.sources!:'all';
  return familiarity==='balanced'&&length==='any'&&sources==='all'?DEFAULT_RECOMMENDATION_SESSION:Object.freeze({familiarity,length,sources});
}
export const sameRecommendationSession=(a:RecommendationSession,b:RecommendationSession)=>a.familiarity===b.familiarity&&a.length===b.length&&a.sources===b.sources;
export function recommendationSource(video:LibraryVideo){return video.remote?.kind??'local';}
/** Length is a strict recording filter. Live observations have no promised end time. */
export function sessionAllows(video:LibraryVideo,tuning:RecommendationSession,live=false){
  if(tuning.sources!=='all'&&tuning.sources!=='balanced'&&recommendationSource(video)!==tuning.sources)return false;
  if(live||tuning.length==='any')return true;
  const seconds=video.duration;if(typeof seconds!=='number'||!Number.isFinite(seconds)||seconds<=0)return false;
  return tuning.length==='short'?seconds<=600:tuning.length==='medium'?seconds>600&&seconds<=3600:seconds>3600;
}
/** A temporary score modifier never edits or cancels explicit feedback penalties. */
export function sessionPreferenceAdjustment(preference:number,tuning:RecommendationSession){
  const weight=Math.max(0,Math.min(96,Number.isFinite(preference)?preference:0))*2;
  return tuning.familiarity==='familiar'?Math.min(24,weight):tuning.familiarity==='explore'?-weight:0;
}
/** Balanced sources retains at most twelve rows per source, never a second full ranking. */
export function createSessionPicks<R>(limit:number,compare:(a:R,b:R)=>number,videoOf:(row:R)=>LibraryVideo,tuning:RecommendationSession){
  return createSourcePicks(limit,compare,row=>recommendationSource(videoOf(row)),tuning);
}
export function createSourcePicks<R>(limit:number,compare:(a:R,b:R)=>number,sourceOf:(row:R)=>string,tuning:RecommendationSession){
  if(tuning.sources!=='balanced')return createBoundedPicks(limit,compare);
  const buckets=new Map(['youtube','twitch','local','other'].map(source=>[source,createBoundedPicks<R>(limit,compare)]));
  return {add(row:R){const source=sourceOf(row);buckets.get(buckets.has(source)?source:'other')!.add(row);},finish(){
    const queues=[...buckets.values()].map(bucket=>bucket.finish()).filter(queue=>queue.length).sort((a,b)=>compare(a[0]!,b[0]!));
    const selected:R[]=[];for(let offset=0;selected.length<limit;offset++){
      let added=false;for(const queue of queues){if(queue[offset]!==undefined){selected.push(queue[offset]!);added=true;if(selected.length===limit)break;}}
      if(!added)break;
    }
    return selected;
  }};
}
