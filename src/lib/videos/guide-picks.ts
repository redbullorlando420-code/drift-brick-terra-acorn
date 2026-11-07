import {createGuideContinuity} from './guide-continuity.ts';
import {createGuideDiversity,publicationAge,diversityCreator,type GuideDiversity} from './guide-diversity.ts';
import {reasonProvenance} from './guide-provenance.ts';
import {createNoveltyEvidence,noveltyNotice,noveltySummary} from './recommendation-novelty.ts';

import {guideWeights,guidePositive,guidePersonalScore,guideTieRank,type GuideWeights} from './guide-preset.ts';
import {createExposurePenalty,type ExposureLedger} from './recommendation-exposure.ts';
import {createRejectionPenalty,type RejectionLedger} from './recommendation-rejections.ts';
import {forEachCatalogSlice,sortCatalogRows} from '../catalog-work.ts';
import {createDistributionCollector,type Distribution} from './recommendation-report.ts';
import {createGuideOrigins,addGuideOrigins,createGuideAffinity} from './guide-affinity.ts';
import type {BridgeLedger} from './topic-bridges.ts';
import {normalizeRecommendationSession,sessionAllows,sessionPreferenceAdjustment,type RecommendationSession} from './recommendation-session.ts';
import {createBoundedPicks} from './bounded-picks.ts';
import {hasFreshViewerCount,type LibraryVideo} from './types.ts';
import {publicVideoBoundary} from './public-visibility.ts';
import {LIBRARY_LIMITS} from '../library-limits.ts';
import {canonicalTopic,hasTopicForScan,topicEvidenceForScan} from './topics.ts';
import {guideContentTags,guideChoice,guideClip,guideNotices,personalGuideExplanation,topicGuideReason,type GuideReason,type GuideExplanation} from './guide-evidence.ts';

export type GuideInput={
 continuity?:import('../recommendation-tuning').RecommendationTuning;showSuppressed?:boolean;follows?:readonly import('./types').FollowedChannel[];creatorHasFeedback?:(name:string)=>boolean;
 metadataProvenance?:Record<string,import('./types').VideoMetadataProvenance>;diversity?:GuideDiversity;novelty?:number;weights?:GuideWeights;bridgeSuppressions?:BridgeLedger;session?:RecommendationSession;recommendationExposure?:ExposureLedger;ratingOf?:(id:string)=>number;
 recommendationRejections?:RejectionLedger;creatorIsFavorited?:(name:string)=>boolean;tagIsLiked?:(topic:string)=>boolean;
 videos:readonly LibraryVideo[];tags:Record<string,string[]>;favorites:Record<string,true>;likes:Record<string,true>;history:readonly {id:string}[];
 folders?:readonly {id:string;adult?:boolean}[];hidden?:Record<string,unknown>;unavailable?:Record<string,unknown>;hideDemo?:boolean;provider?:string;
};
export type GuideSnapshot={
 continuity?:{suppressed:number;explored:number;limited:boolean;cooldownHours:number;showSuppressed:boolean};
 picks:LibraryVideo[];live:LibraryVideo[];historyCount:number;favoriteCount:number;likeCount:number;tagCount:number;publicCount:number;candidateCount:number;preparedAt:number;
 novelty?:ReturnType<typeof noveltySummary>;distribution:Distribution;mode:'empty'|'discovery'|'personalized';topics:Array<{topic:string;count:number}>;affinityLimited:boolean;explanations:Record<string,GuideExplanation>;
};
export type GuideReply={distribution:Distribution;text:string;picks:LibraryVideo[];reasons:Record<string,string>;explanations:Record<string,GuideExplanation>};
export function guideVisibility(input:GuideInput){
 const publicTitle=publicVideoBoundary(input.folders),known=input.folders?new Set(input.folders.map(folder=>folder.id)):undefined;
 return (video:LibraryVideo)=>(!input.provider||video.remote?.kind===input.provider)&&publicTitle(video)&&!input.hidden?.[video.id]&&!input.unavailable?.[video.id]&&!video.isSample&&Boolean(video.remote||!known||known.has(video.folderId));
}
export function guideConfirmedLive(video:LibraryVideo,now:number){
 const remote=video.remote;if(!remote?.live||!['youtube','twitch'].includes(remote.kind)||remote.liveUnconfirmed||remote.liveOfflineSince)return false;
 const observed=remote.observedAt??0,maxAge=remote.kind==='twitch'?LIBRARY_LIMITS.twitchLiveStateFreshnessMs:LIBRARY_LIMITS.youtubeLiveStateFreshnessMs;
 return observed>0&&observed<=now+5000&&now-observed<=maxAge;
}
export function guidePenalties(input:GuideInput,now:number){
 const rejection=input.recommendationRejections?.entries.length?createRejectionPenalty(input.recommendationRejections):undefined,exposure=input.recommendationExposure?.entries.length?createExposurePenalty(input.recommendationExposure,now):undefined;
 return (video:LibraryVideo)=>({penalty:rejection?.(video,input.tags[video.id],{favorite:Boolean(input.favorites[video.id]),creatorFavorite:input.creatorIsFavorited?.(video.remote?.channelName??''),tagIsLiked:input.tagIsLiked})??0,exposure:exposure?.(video,{favorite:Boolean(input.favorites[video.id]),liked:Boolean(input.likes[video.id]),creatorFavorite:input.creatorIsFavorited?.(video.remote?.channelName??''),rating:input.ratingOf?.(video.id)})??0});
}
/** Twelve selected candidates, bounded source pools and 4,096 compact affinity ordinals. */
export async function prepareGuide(input:GuideInput,seed:number,now:number,turn:()=>Promise<void>):Promise<GuideSnapshot>{
 await turn();
 const continuity=createGuideContinuity(input,now);let suppressedCount=0;
 const weights=guideWeights(input.weights),distribution=createDistributionCollector(input.session,weights),tuning=normalizeRecommendationSession(input.session),allowed=guideVisibility(input),origins=createGuideOrigins(),watched=new Map<string,boolean>(),live:LibraryVideo[]=[],topicCounts=new Map<string,number>(),adjustments=guidePenalties(input,now);
 const novelty=input.novelty===undefined?undefined:createNoveltyEvidence(input.recommendationExposure,now);
 let favoriteCount=0,likeCount=0,tagCount=0,publicCount=0,candidateCount=0,historyCount=0,affinityLimited=false;
 await forEachCatalogSlice(input.history,entry=>watched.set(entry.id,false),turn);
 await forEachCatalogSlice(input.videos,(video,index)=>{
  if(!allowed(video))return;continuity.observe(video,watched.has(video.id));novelty?.observe(video,watched.has(video.id));publicCount++;if(watched.get(video.id)===false){watched.set(video.id,true);historyCount++;}
  const content=guideContentTags(input.tags[video.id]);tagCount+=content.length;
  if(input.favorites[video.id])favoriteCount++;if(input.likes[video.id])likeCount++;
  affinityLimited=addGuideOrigins(input,video,index,origins,content)||affinityLimited;
  if(!video.remote?.live&&sessionAllows(video,tuning))for(const link of topicEvidenceForScan(video,input.tags[video.id]))topicCounts.set(link.topic,(topicCounts.get(link.topic)??0)+1);
  if(video.remote?.kind==='twitch'&&sessionAllows(video,tuning,true)&&guideConfirmedLive(video,now))live.push(video);
 },turn);
 const affinity=createGuideAffinity(input,origins);
 const best=createGuideDiversity<{video:LibraryVideo;score:number;rank:number;index:number;penalty:number;exposure:number}>((a,b)=>b.score-a.score||a.rank-b.rank||a.index-b.index,row=>row.video,tuning,input.diversity,now);
 await forEachCatalogSlice(input.videos,(video,index)=>{
  if(!allowed(video)||video.remote?.live||watched.has(video.id)||!sessionAllows(video,tuning))return;
   const reduced=adjustments(video);if(best.active&&reduced.penalty>0)return;candidateCount++;const cooled=continuity.cooling(video);if(cooled)suppressedCount++;if(input.showSuppressed?!cooled:cooled)return;distribution.add(video);const score=guidePersonalScore({favorite:Boolean(input.favorites[video.id]),like:Boolean(input.likes[video.id]),topics:affinity(video),...reduced},weights,tuning)+(novelty?.inspect(video,input.novelty??0).adjustment??0);
   const row={video,score,rank:guideTieRank(video.id,seed),index,...reduced};best.add(row);continuity.add(row);
 },turn);
 await turn();
 const selection=continuity.finish(await best.finish(turn)),matches=selection.rows,explanations=Object.fromEntries(matches.map(row=>[row.video.id,personalGuideExplanation(input,row.video,(()=>{const matches:Array<[string,number]>=[];affinity(row.video,(key,ordinal)=>matches.push([key,ordinal]));return matches;})(),row.penalty,row.exposure)]));
 for(const row of matches){if(selection.explored.has(row.video.id)){const e=explanations[row.video.id]!;e.basis='discovery';e.reasons.unshift({id:'follow-exploration',kind:'creator',text:'Exploration slot: a confirmed followed creator with no recorded watch or explicit feedback; published within 30 days.',field:'confirmed creator ID',quote:row.video.remote?.channelId,feedback:guideChoice(row.video,undefined,true)});e.reasons=e.reasons.slice(0,4);}if(continuity.cooling(row.video))explanations[row.video.id]!.notices.push('Shown only in the temporary cooldown review. This does not change ratings or reset watch progress.');}
 const report=best.getReport();if(report&&selection.explored.size){const counts=new Map<string,number>(),ages={older:0,recent:0,unknown:0};let unknown=0;for(const row of matches){const k=diversityCreator(row.video);if(k)counts.set(k,(counts.get(k)??0)+1);else unknown++;ages[publicationAge(row.video,now)]++;}report.sources=new Set(matches.map(r=>r.video.remote?.kind??'local')).size;report.shown=matches.length;report.unknownCreators=unknown;report.older=ages.older;report.selectedAge=ages;report.met=matches.length>0&&report.sources>=report.config.minSources&&ages.older>=report.config.olderSlots&&(report.config.creatorPercent===100||unknown===0&&[...counts.values()].every(n=>n<=report.creatorCap));report.notices=[...report.notices.filter(n=>!n.startsWith('This output meets')), 'Follow exploration was applied within the selected source, age and creator constraints.'];}
 if(novelty)for(const row of matches)explanations[row.video.id]!.notices.push(noveltyNotice(novelty,row.video,input.novelty??0));
 const choices=createBoundedPicks<{topic:string;count:number}>(8,(a,b)=>b.count-a.count||a.topic.localeCompare(b.topic));for(const [topic,count]of topicCounts)choices.add({topic,count});
 const viewers=(video:LibraryVideo)=>hasFreshViewerCount(video.remote,now)?video.remote!.viewers!:0;
 const orderedLive=await sortCatalogRows(live,(a,b)=>viewers(b)-viewers(a),turn);
 for(const row of matches)for(const reason of explanations[row.video.id]!.reasons)reason.provenance=reasonProvenance(reason,row.video.id,input.metadataProvenance);
 return {continuity:{suppressed:suppressedCount,explored:selection.explored.size,limited:selection.limited||(input.follows?.length??0)>4096,cooldownHours:input.continuity?.cooldownHours??0,showSuppressed:Boolean(input.showSuppressed)},...(novelty?{novelty:noveltySummary(novelty,matches.map(row=>row.video),input.novelty??0)}:{}),distribution:{...distribution.finish(matches.map(row=>row.video),now,id=>watched.has(id),input.recommendationExposure),...(best.getReport()?{diversity:best.getReport()}: {})},picks:matches.map(row=>row.video),explanations,live:orderedLive,historyCount,favoriteCount,likeCount,tagCount,publicCount,candidateCount,preparedAt:now,topics:choices.finish(),affinityLimited,mode:!publicCount?'empty':matches.some(row=>explanations[row.video.id]?.basis==='preference')?'personalized':'discovery'};
}
/** Uses only the prepared short list. History exclusions never imply a completed watch. */
export function guideAnswer(prompt:string,snapshot:GuideSnapshot,_tags:GuideInput['tags']){
 if(/\b(live|on air|streaming)\b/i.test(prompt)&&snapshot.live.length)return 'Live on your followed Twitch channels:\n'+snapshot.live.slice(0,4).map((video,i)=>(i+1)+'. '+(video.remote?.channelName??video.name)+(hasFreshViewerCount(video.remote,snapshot.preparedAt)?' · '+video.remote?.viewers?.toLocaleString()+' viewers':'')).join('\n')+'\n\nLive observations belong to this prepared snapshot. Open a card to watch.';
 return snapshot.picks.length?'Local recommendations for “'+guideClip(prompt)+'”:\n'+snapshot.picks.slice(0,3).map((video,i)=>(i+1)+'. '+video.name+' — '+snapshot.explanations[video.id]!.reasons[0]!.text).join('\n')+'\n\nPrepared locally from eligible public fields; discovery picks are labeled separately.':snapshot.publicCount?'No unrecorded recordings match this Guide session. Try a topic question, reset the Guide session, or change its source/length choices. Titles already in history are skipped.':'Add a few public titles, tags, likes, or favorites to prepare new picks. Titles already in history are skipped.';
}
const normalize=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^(?:keyword|topic|genre|creator)-/,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const stop=new Set('who surprise random a an the i me my you your we our is are was were be been to of and or for on in at by with about some something anything find show give suggest recommend recommendations please want watch watching video videos title titles tag tags tonight next should could can would what which based fits favorites favorite liked likes library from more'.split(' '));
export async function answerGuideQuery(input:GuideInput,prompt:string,seed:number,now:number,turn:()=>Promise<void>):Promise<GuideReply>{
 await turn();
 const weights=guideWeights(input.weights),tuning=normalizeRecommendationSession(input.session),question=normalize(prompt.slice(0,500)),liveIntent=/\b(live|on air|streaming)\b/.test(question),provider=/\byoutube\b/.test(question)?'youtube':/\btwitch\b/.test(question)?'twitch':input.provider;
 const scoped={...input,provider},tokens=[...new Set(question.split(' ').filter(word=>!stop.has(word)&&!['youtube','twitch','live','streams','streaming','air'].includes(word)))].slice(0,12),terms=[...new Set(tokens.map(word=>word==='funny'?'comedy':canonicalTopic(word)??word))];
 if(!terms.length&&!liveIntent){const snapshot=await prepareGuide(scoped,seed,now,turn);return {distribution:snapshot.distribution,text:guideAnswer(prompt,snapshot,input.tags),picks:snapshot.picks,explanations:snapshot.explanations,reasons:Object.fromEntries(snapshot.picks.map(video=>[video.id,snapshot.explanations[video.id]!.reasons.map(reason=>reason.text).join(' · ')]))};}
 const distribution=createDistributionCollector(input.session,weights),origins=createGuideOrigins();
 const novelty=input.novelty===undefined?undefined:createNoveltyEvidence(input.recommendationExposure,now);
 if(novelty){const history=new Set<string>();await forEachCatalogSlice(input.history,entry=>{if(history.size<8192)history.add(entry.id);else if(!history.has(entry.id))novelty.markLimited();},turn);const allowed=guideVisibility(scoped);await forEachCatalogSlice(input.videos,video=>{if(allowed(video))novelty.observe(video,history.has(video.id));},turn);}
  if(tuning.familiarity!=='balanced'){const signalAllowed=guideVisibility(input);await forEachCatalogSlice(input.videos,(video,index)=>{if(signalAllowed(video))addGuideOrigins(input,video,index,origins);},turn);}
  const affinity=createGuideAffinity(input,origins),allowed=guideVisibility(scoped),seen=new Set<string>(),adjustments=guidePenalties(scoped,now),best=createGuideDiversity<{video:LibraryVideo;score:number;index:number;rank:number;evidence:GuideReason[];penalty:number;exposure:number}>((a,b)=>b.score-a.score||a.rank-b.rank||a.index-b.index,row=>row.video,tuning,input.diversity,now);
 await forEachCatalogSlice(input.videos,(video,index)=>{
  if(!allowed(video)||!sessionAllows(video,tuning,liveIntent)||(liveIntent?!guideConfirmedLive(video,now):video.remote?.live))return;
  const key=video.remote?.videoId?video.remote.kind+':'+video.remote.videoId:video.id;if(seen.has(key))return;
  const title=normalize(video.name.slice(0,1000)),creator=normalize(video.remote?.channelName??''),tags=(input.tags[video.id]??[]).slice(0,80),genre=normalize(video.genre??'');
  let matched=0,score=0;const evidence:GuideReason[]=[];
  for(const term of terms){
   let reason:GuideReason|undefined;
   if(title.includes(term)){matched++;score+=8;reason={id:'title:'+term,kind:'title',text:'Title matches “'+term+'”.',field:'title',quote:guideClip(video.name),feedback:guideChoice(video)};}
   else {const raw=tags.find(tag=>normalize(tag)===term||normalize(tag).split(' ').includes(term));
    if(raw){matched++;score+=10;reason={id:'tag:'+term,kind:'saved-tag',text:'Saved tag matches “'+term+'”.',field:'saved tag',quote:guideClip(raw),feedback:guideChoice(video,canonicalTopic(raw))};}
    else if(creator.includes(term)){matched++;score+=5;reason={id:'creator:'+term,kind:'creator',text:'Saved creator field matches “'+term+'”.',field:'creator',quote:guideClip(video.remote?.channelName??''),feedback:guideChoice(video,undefined,true)};}
    else if(genre.includes(term)){matched++;score+=5;reason={id:'category:'+term,kind:'category',text:'Saved category matches “'+term+'”.',field:'category',quote:guideClip(video.genre??''),feedback:guideChoice(video,canonicalTopic(video.genre??''))};}
    else{const topic=canonicalTopic(term);if(topic&&hasTopicForScan(video,topic,input.tags[video.id])){matched++;score+=4;reason=topicGuideReason(video,topic,input.tags[video.id]);}}
   }
   if(reason&&evidence.length<4)evidence.push(reason);
  }
  if(terms.length&&matched<terms.length)return;const reduced=adjustments(video);if(best.active&&reduced.penalty>0)return;seen.add(key);distribution.add(video);
  if(liveIntent){if(evidence.length===4)evidence.pop();evidence.push({id:'live',kind:'live',text:'A recent provider observation confirms live status in this snapshot.',field:'live observation',quote:new Date(video.remote!.observedAt!).toISOString(),feedback:guideChoice(video)});}
   const direct=guidePositive(Boolean(input.favorites[video.id]),Boolean(input.likes[video.id]),0,weights);
    const preference=direct+(tuning.familiarity==='balanced'?0:affinity(video)*weights.topic);
   score+=direct+sessionPreferenceAdjustment(preference,tuning)+(novelty?.inspect(video,input.novelty??0).adjustment??0);
   best.add({video,index,score:score-reduced.penalty-reduced.exposure,rank:guideTieRank(video.id,seed),evidence,...reduced});
 },turn);
 const matches=await best.finish(turn),explanations=Object.fromEntries(matches.map(row=>[row.video.id,{basis:liveIntent?'live' as const:'query' as const,reasons:row.evidence,notices:[...guideNotices(scoped,row.video,row.penalty,row.exposure),...(novelty?[noveltyNotice(novelty,row.video,input.novelty??0)]:[])]}]));
 for(const row of matches)for(const reason of explanations[row.video.id]!.reasons)reason.provenance=reasonProvenance(reason,row.video.id,input.metadataProvenance);
 const selectedIds=new Set(matches.map(row=>row.video.id)),recorded=new Set<string>();await forEachCatalogSlice(input.history,row=>{if(selectedIds.has(row.id))recorded.add(row.id);},turn);
  return {distribution:{...distribution.finish(matches.map(row=>row.video),now,id=>recorded.has(id),input.recommendationExposure),...(best.getReport()?{diversity:best.getReport()}: {})},picks:matches.map(row=>row.video),explanations,reasons:Object.fromEntries(matches.map(row=>[row.video.id,row.evidence.map(reason=>reason.text+(reason.quote?' '+reason.quote:'')).join(' · ')])),text:matches.length?(liveIntent?'Recently confirmed live matches':'Library matches')+' for “'+guideClip(prompt)+'” · '+matches.length+' shown. These match saved fields; no model wording is used.':liveIntent?'No fresh live observation matches that question and this session’s source choices. Reset the Guide session or use the Live page to check current status.':'No eligible public titles or saved tags match that question and this session’s source/length choices. Try a title, creator, one of the available topics, or reset the Guide session.'};
}
