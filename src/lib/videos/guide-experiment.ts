import {forEachCatalogSlice} from '../catalog-work.ts';
import {createBoundedPicks} from './bounded-picks.ts';
import {createGuideOrigins,addGuideOrigins,createGuideAffinity} from './guide-affinity.ts';
import {guideVisibility,guidePenalties,type GuideInput} from './guide-picks.ts';
import {guidePersonalScore,guidePositive,guideWeights,guideTieRank,isGuideWeights,type GuideWeights} from './guide-preset.ts';
import {createSourcePicks,normalizeRecommendationSession,sessionAllows,sessionPreferenceAdjustment,type RecommendationSession} from './recommendation-session.ts';
import {normalizeExposure,exposureKey} from './recommendation-exposure.ts';
import {REPORT_SOURCES,summarizeDistribution,type Distribution,type ReportSource} from './recommendation-report.ts';
export const REPLAY_LIMIT=512,REPLAY_FILE_LIMIT=256*1024;
export type ReplayCandidate=Readonly<{key:number;media:number;source:ReportSource;creator:number;favorite:boolean;like:boolean;topics:number;penalty:number;exposure:number;exposed:boolean;rank:number}>;
export type GuideReplay=Readonly<{format:'realhub-guide-replay';version:1;at:number;seed:number;eligible:number;affinityLimited:boolean;session:RecommendationSession;baseline:GuideWeights;candidates:readonly ReplayCandidate[]}>;
const integer=(n:unknown,min:number,max:number):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=min&&n<=max;
/** Strict bounded numeric allowlist. Imported capsules cannot carry titles, paths or arbitrary fields. */
export function normalizeGuideReplay(raw:unknown):GuideReplay{
 const r=raw as GuideReplay|undefined;
 if(!r||r.format!=='realhub-guide-replay'||r.version!==1||!integer(r.at,1,Number.MAX_SAFE_INTEGER)||!integer(r.seed,0,0xffffffff)||!integer(r.eligible,0,100_000_000)||typeof r.affinityLimited!=='boolean'||!isGuideWeights(r.baseline)||!Array.isArray(r.candidates)||r.candidates.length>REPLAY_LIMIT||r.eligible<r.candidates.length)throw Error('Unsupported or invalid Guide replay capsule.');
 const session=normalizeRecommendationSession(r.session);if(!r.session||session.familiarity!==r.session.familiarity||session.length!==r.session.length||session.sources!==r.session.sources)throw Error('Invalid replay session.');
 const keys=new Set<number>(),candidates=r.candidates.map((c:ReplayCandidate)=>{
  if(!c||!integer(c.key,1,REPLAY_LIMIT)||keys.has(c.key)||!integer(c.media,1,REPLAY_LIMIT)||!REPORT_SOURCES.includes(c.source)||!integer(c.creator,0,REPLAY_LIMIT)||typeof c.favorite!=='boolean'||typeof c.like!=='boolean'||typeof c.exposed!=='boolean'||!integer(c.topics,0,80)||!integer(c.penalty,0,64)||!Number.isFinite(c.exposure)||c.exposure<0||c.exposure>18||!integer(c.rank,0,0xffffffff))throw Error('Invalid anonymous replay candidate.');
  keys.add(c.key);return Object.freeze({key:c.key,media:c.media,source:c.source,creator:c.creator,favorite:c.favorite,like:c.like,topics:c.topics,penalty:c.penalty,exposure:c.exposure,exposed:c.exposed,rank:c.rank});
 });
 return Object.freeze({format:'realhub-guide-replay',version:1,at:r.at,seed:r.seed,eligible:r.eligible,affinityLimited:r.affinityLimited,session,baseline:guideWeights(r.baseline),candidates:Object.freeze(candidates)});
}
export async function captureGuideReplay(input:GuideInput,seed:number,now:number,turn:()=>Promise<void>):Promise<GuideReplay>{
 await turn();const tuning=normalizeRecommendationSession(input.session),weights=guideWeights(input.weights),allowed=guideVisibility(input),watched=new Set<string>(),origins=createGuideOrigins(),exposed=new Set(normalizeExposure(input.recommendationExposure,now).entries.map(row=>row.key));let eligible=0,affinityLimited=false;
 await forEachCatalogSlice(input.history,row=>watched.add(row.id),turn);
 await forEachCatalogSlice(input.videos,(video,index)=>{if(allowed(video))affinityLimited=addGuideOrigins(input,video,index,origins)||affinityLimited;},turn);
 const affinity=createGuideAffinity(input,origins),penalties=guidePenalties(input,now);
 type Scratch={index:number;sampleRank:number;creatorKey?:string;mediaKey:string;source:ReportSource;favorite:boolean;like:boolean;topics:number;penalty:number;exposure:number;exposed:boolean;rank:number;score:number};
 const compare=(a:Scratch,b:Scratch)=>b.score-a.score||a.rank-b.rank||a.index-b.index,best=createSourcePicks<Scratch>(12,compare,row=>row.source,tuning),sample=createBoundedPicks<Scratch>(500,(a,b)=>a.sampleRank-b.sampleRank||a.index-b.index);
 await forEachCatalogSlice(input.videos,(video,index)=>{
  if(!allowed(video)||video.remote?.live||watched.has(video.id)||!sessionAllows(video,tuning))return;eligible++;
  const source:ReportSource=!video.remote?'local':video.remote.kind==='youtube'?'youtube':video.remote.kind==='twitch'?'twitch':'other',creator=video.remote&&(video.remote.channelId?.trim()||video.remote.channelName?.trim().normalize('NFKC').toLowerCase());
  const bits={favorite:Boolean(input.favorites[video.id]),like:Boolean(input.likes[video.id]),topics:affinity(video),...penalties(video)};
  const row:Scratch={index,source,creatorKey:creator?video.remote!.kind+':'+creator.slice(0,500):undefined,mediaKey:exposureKey(video),...bits,exposed:exposed.has(exposureKey(video)),rank:guideTieRank(video.id,seed),sampleRank:guideTieRank(video.id,(seed^0x9e3779b9)>>>0),score:guidePersonalScore(bits,weights,tuning)};
  best.add(row);sample.add(row);
 },turn);await turn();
 const retained=[...new Map([...best.finish(),...sample.finish()].map(row=>[row.index,row])).values()].sort((a,b)=>a.index-b.index),creators=new Map<string,number>(),media=new Map<string,number>();
 const candidates=retained.map((row,index)=>{if(row.creatorKey&&!creators.has(row.creatorKey))creators.set(row.creatorKey,creators.size+1);if(!media.has(row.mediaKey))media.set(row.mediaKey,media.size+1);return {key:index+1,media:media.get(row.mediaKey)!,source:row.source,creator:row.creatorKey?creators.get(row.creatorKey)!:0,favorite:row.favorite,like:row.like,topics:row.topics,penalty:row.penalty,exposure:row.exposure,exposed:row.exposed,rank:row.rank};});
 return normalizeGuideReplay({format:'realhub-guide-replay',version:1,at:now,seed:seed>>>0,eligible,affinityLimited,session:tuning,baseline:weights,candidates});
}
function rankReplay(data:GuideReplay,weights:GuideWeights){
 const best=createSourcePicks<{row:ReplayCandidate;score:number}>(12,(a,b)=>b.score-a.score||a.row.rank-b.row.rank||a.row.key-b.row.key,item=>item.row.source,data.session);
 for(const row of data.candidates)best.add({row,score:guidePersonalScore(row,weights,data.session)});return best.finish();
}
function replayDistribution(data:GuideReplay,selected:ReturnType<typeof rankReplay>,weights:GuideWeights):Distribution{
 const groups=new Map<number,{bucket:number;source:ReportSource;shown:number;available:number|null}>();let unknownCreators=0;
 for(const {row} of selected){if(!row.creator){unknownCreators++;continue;}const old=groups.get(row.creator);if(old)old.shown++;else groups.set(row.creator,{bucket:row.creator,source:row.source,shown:1,available:data.candidates.filter(c=>c.creator===row.creator).length});}
 return {version:1,at:data.at,session:data.session,weights,eligible:data.candidates.length,creatorLimited:false,sources:REPORT_SOURCES.map(source=>({source,available:data.candidates.filter(row=>row.source===source).length,shown:selected.filter(item=>item.row.source===source).length})),creators:[...groups.values()].sort((a,b)=>b.shown-a.shown||a.bucket-b.bucket),unknownCreators,unknownCandidateCreators:data.candidates.filter(row=>!row.creator).length,selections:selected.map(({row})=>({key:'sample:'+row.media,recorded:false,exposed:row.exposed}))};
}
export function compareGuideReplay(raw:GuideReplay,proposed:GuideWeights){
 if(!isGuideWeights(proposed))throw Error('Invalid proposed weights.');const data=normalizeGuideReplay(raw),weights=guideWeights(proposed),current=rankReplay(data,data.baseline),next=rankReplay(data,weights),currentRanks=new Map(current.map((item,i)=>[item.row.key,i+1])),nextRanks=new Map(next.map((item,i)=>[item.row.key,i+1]));
 const distributionBefore=replayDistribution(data,current,data.baseline),distributionAfter=replayDistribution(data,next,weights),metricsBefore=summarizeDistribution(distributionBefore,undefined),metricsAfter=summarizeDistribution(distributionAfter,distributionBefore.selections.map(row=>row.key));
 const changes=[...new Set([...next.map(item=>item.row.key),...current.map(item=>item.row.key)])].map(key=>{const row=data.candidates.find(row=>row.key===key)!,before=guidePersonalScore(row,data.baseline,data.session),after=guidePersonalScore(row,weights,data.session),oldPositive=guidePositive(row.favorite,row.like,row.topics,data.baseline),newPositive=guidePositive(row.favorite,row.like,row.topics,weights);return {candidate:key,source:row.source,from:currentRanks.get(key)??null,to:nextRanks.get(key)??null,before,after,favoriteDelta:Number(row.favorite)*(weights.favorite-data.baseline.favorite),likeDelta:Number(row.like)*(weights.like-data.baseline.like),topicDelta:row.topics*(weights.topic-data.baseline.topic),sessionDelta:sessionPreferenceAdjustment(newPositive,data.session)-sessionPreferenceAdjustment(oldPositive,data.session)};}).filter(row=>row.from!==row.to||row.before!==row.after).slice(0,8);
 return {proposed:weights,current:current.map(item=>({candidate:item.row.key,score:item.score,source:item.row.source})),next:next.map(item=>({candidate:item.row.key,score:item.score,source:item.row.source})),metricsBefore,metricsAfter,distributionBefore,distributionAfter,changes};
}
