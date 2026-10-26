import type {LibraryVideo} from './types.ts';
import {guideWeights,type GuideWeights} from './guide-preset.ts';
import {normalizeRecommendationSession,type RecommendationSession} from './recommendation-session.ts';
import {normalizeExposure,exposureKey,type ExposureLedger} from './recommendation-exposure.ts';

export const REPORT_CREATOR_LIMIT=4096,REPORT_OUTPUT_LIMIT=12;
export const REPORT_SOURCES=['local','youtube','twitch','other'] as const;
export type ReportSource=typeof REPORT_SOURCES[number];
export type Distribution={
 version:1;at:number;session:RecommendationSession;weights?:GuideWeights;eligible:number;creatorLimited:boolean;
 sources:Array<{source:ReportSource;available:number;shown:number}>;
 creators:Array<{bucket:number;source:ReportSource;shown:number;available:number|null}>;
 unknownCreators:number;unknownCandidateCreators:number;selections:Array<{key:string;recorded:boolean;exposed:boolean}>;
};
const sourceOf=(video:LibraryVideo):ReportSource=>!video.remote?'local':video.remote.kind==='youtube'?'youtube':video.remote.kind==='twitch'?'twitch':'other';
/** Provider-scoped actual creator evidence. A local folder is not a creator. */
function creatorOf(video:LibraryVideo){
 if(!video.remote)return undefined;
 const id=video.remote.channelId?.trim()||video.remote.channelName?.trim().normalize('NFKC').toLowerCase();
 return id?video.remote.kind+':'+id.slice(0,500):undefined;
}
/** O(1) source counters and at most 4096 creator counters; no title graph. */
export function createDistributionCollector(session?:RecommendationSession,weights?:GuideWeights){
 const tuning=normalizeRecommendationSession(session),sources=new Map(REPORT_SOURCES.map(source=>[source,0])),creators=new Map<string,number>();
 let eligible=0,unknownCandidateCreators=0,creatorLimited=false;
 return {
  add(video:LibraryVideo){
   eligible++;const source=sourceOf(video);sources.set(source,sources.get(source)!+1);
   const key=creatorOf(video);if(!key){unknownCandidateCreators++;return;}
   if(creators.has(key))creators.set(key,creators.get(key)!+1);
   else if(creators.size<REPORT_CREATOR_LIMIT)creators.set(key,1);else creatorLimited=true;
  },
  finish(picks:readonly LibraryVideo[],at:number,historyHas:(id:string)=>boolean,exposure?:ExposureLedger):Distribution{
   const selected=picks.slice(0,REPORT_OUTPUT_LIMIT),groups=new Map<string,{bucket:number;source:ReportSource;shown:number;available:number|null}>(),exposed=new Set(normalizeExposure(exposure,at).entries.map(row=>row.key));
   let unknownCreators=0;
   for(const video of selected){const key=creatorOf(video);if(!key){unknownCreators++;continue;}const previous=groups.get(key);
    if(previous)previous.shown++;else groups.set(key,{bucket:groups.size+1,source:sourceOf(video),shown:1,available:creators.get(key)??null});
   }
   return {version:1,at,session:tuning,weights:guideWeights(weights),eligible,creatorLimited,sources:REPORT_SOURCES.map(source=>({source,available:sources.get(source)!,shown:selected.filter(video=>sourceOf(video)===source).length})),creators:[...groups.values()].sort((a,b)=>b.shown-a.shown||a.bucket-b.bucket),unknownCreators,unknownCandidateCreators,selections:selected.map(video=>({key:exposureKey(video),recorded:historyHas(video.id),exposed:exposed.has(exposureKey(video))}))};
  },
  get trackedCreators(){return creators.size;},
 };
}
export type ReportFinding={kind:'policy'|'concentration'|'coverage';status:'ok'|'review'|'constrained'|'unknown';text:string};
export function summarizeDistribution(data:Distribution,previous:readonly string[]|undefined,threshold=50){
 const cutoff=Number.isFinite(threshold)?Math.max(25,Math.min(100,Math.round(threshold))):50,n=data.selections.length,unique=new Set(data.selections.map(row=>row.key)),prior=previous?new Set(previous):undefined;
 const findings:ReportFinding[]=[];
 const available=data.sources.filter(row=>row.available>0);
 if(!n)findings.push({kind:'policy',status:'unknown',text:'No output to assess. Empty results do not establish a diversity problem.'});
 else if(data.session.sources==='balanced'){
  const violation=data.sources.some(a=>data.sources.some(b=>a.shown>b.shown+1&&b.available>b.shown));
  const constrained=available.length<2||available.some(row=>row.available<Math.ceil(n/Math.max(1,available.length)));
  findings.push({kind:'policy',status:violation?'review':constrained?'constrained':'ok',text:violation?'The output does not match the balanced-source policy; an eligible source had unused capacity.':available.length<2?'Only one source has eligible candidates. Balanced mode cannot add an unavailable provider.':constrained?'Balanced sources fill shortages from available pools; smaller pools limit an equal split.':'The actual output follows the balanced-source policy within one slot per available source.'});
 }else findings.push({kind:'policy',status:available.length<2?'constrained':'ok',text:data.session.sources!=='all'?'This session deliberately restricts the source. Provider diversity is not an active ranking target.':available.length<2?'Only one source has eligible candidates. This is a library constraint, not a provider-diversity failure.':'Standard ranking has no equal-provider quota. Provider shares describe the output; they do not declare a policy failure.'});
 const dominant=data.creators[0];
 if(n&&dominant&&dominant.shown/n*100>cutoff){
  const alternatives=dominant.available===null?null:Math.max(0,data.eligible-dominant.available),needed=n-Math.floor(n*cutoff/100);
  const missingCredits=alternatives!==null&&alternatives>=needed&&alternatives-data.unknownCandidateCreators<needed;
  findings.push({kind:'concentration',status:alternatives===null||missingCredits?'unknown':alternatives<needed?'constrained':'review',text:alternatives===null?'The leading creator exceeds the diagnostic threshold. Creator availability hit the counting limit, so avoidability is unknown.':missingCredits?'The leading creator exceeds the diagnostic threshold, but missing creator credits prevent confirming enough distinct-creator alternatives.':alternatives<needed?'The leading creator exceeds the diagnostic threshold, but too few eligible alternatives can fill this output below it.':'The leading creator exceeds the diagnostic threshold and eligible alternatives with other creator credits exist. Review the mix or session settings; no creator cap is currently enforced.'});
 }else if(n)findings.push({kind:'concentration',status:'ok',text:'No identified creator exceeds the diagnostic threshold. Missing creator credits are reported separately.'});
 if(data.creatorLimited)findings.push({kind:'coverage',status:'unknown',text:'Creator availability is counted for at most 4,096 identities. Untracked selected creators have unknown availability, not zero.'});
 return {threshold:cutoff,shown:n,uniqueTitles:unique.size,repeatedWithin:n-unique.size,recorded:data.selections.filter(row=>row.recorded).length,recentlyExposed:data.selections.filter(row=>row.exposed).length,novel:data.selections.filter(row=>!row.recorded&&!row.exposed).length,previousShown:prior?.size??null,repeatedFromPrevious:prior?[...unique].filter(key=>prior.has(key)).length:null,findings};
}
/** Export counts and anonymous creator buckets only, never titles, IDs, paths or prompts. */
export function distributionExport(data:Distribution,previous?:readonly string[],threshold=50){
 return {version:1,scope:'Actual generated public AI Guide output only; aggregate snapshot, not demographic fairness or a watch-completion claim.',at:data.at,session:data.session,weights:guideWeights(data.weights),eligible:data.eligible,sources:data.sources.map(row=>({source:row.source,available:row.available,shown:row.shown})),creators:data.creators.map(row=>({bucket:row.bucket,source:row.source,shown:row.shown,available:row.available})),unknownCreators:data.unknownCreators,unknownCandidateCreators:data.unknownCandidateCreators,creatorLimited:data.creatorLimited,...summarizeDistribution(data,previous,threshold)};
}
