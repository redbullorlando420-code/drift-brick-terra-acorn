
import type {GuideInput} from './guide-picks.ts';
import type {LibraryVideo} from './types.ts';
import {canonicalTopic,topicEvidenceForScan} from './topics.ts';
import {creatorRejectionTarget,titleRejectionTarget,normalizeRejections,type RecommendationRejection} from './recommendation-rejections.ts';
import {bridgeTopic,videoBridgeSource,type VideoBridgeSource} from './topic-bridges.ts';
import {reviewedRankingTag} from './topic-aliases.ts';
export type GuideReason={id:string;kind:'favorite'|'like'|'shared-tag'|'title'|'saved-tag'|'creator'|'category'|'topic'|'live'|'discovery';text:string;field?:string;quote?:string;origin?:{id:string;title:string;tag:string;signal:'favorite'|'like'};bridge?:{topic:string;a:VideoBridgeSource;b:VideoBridgeSource};feedback:Omit<RecommendationRejection,'at'>};
export type GuideExplanation={basis:'preference'|'query'|'live'|'discovery';reasons:GuideReason[];notices:string[]};
export const guideClip=(value:string)=>value.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,160);
export function guideContentKey(raw:string){
 const tag=raw.trim().toLowerCase().replace(/^keyword-/,'');
 if(!/^[\p{L}\p{N}][\p{L}\p{N} -]{1,63}$/u.test(tag)||/^(?:provider|creator|source|format|auto|sub|fetish|genre|meta|vision)-/.test(tag)||['adult','video','videos','youtube','twitch','shorts','live','clip','clips','vod','upload'].includes(tag)||/^\d[\d -]+$/.test(tag))return;
 return canonicalTopic(tag)??reviewedRankingTag(tag);
}
export function guideContentTags(tags:readonly string[]=[]){return [...new Set(tags.slice(0,80).map(guideContentKey).filter((tag):tag is string=>Boolean(tag)))];}
export function guideChoice(video:LibraryVideo,topic?:string,creator=false):Omit<RecommendationRejection,'at'>{
 if(topic&&canonicalTopic(topic)===topic)return {scope:'topic',target:topic,label:topic};
 const target=creator&&creatorRejectionTarget(video);if(target)return {scope:'creator',target,label:guideClip(video.remote?.channelName??'This local source')};
 return {scope:'title',target:titleRejectionTarget(video),label:guideClip(video.name)};
}
export function guideNotices(input:GuideInput,video:LibraryVideo,penalty:number,exposure:number){
 const notices:string[]=[];const rating=input.ratingOf?.(video.id),favorite=Boolean(input.favorites[video.id]),liked=Boolean(input.likes[video.id]);
 if(rating===1)notices.push(favorite||liked?'Your 1-star rating conflicts with a saved favorite or like. Review those choices if your taste changed.':'You recorded a 1-star rating for this title. This is not a positive preference signal.');
 const creatorFavorite=input.creatorIsFavorited?.(video.remote?.channelName??'');
 const choices=normalizeRejections(input.recommendationRejections).entries;
 const matched=choices.some(row=>row.scope==='title'?row.target===titleRejectionTarget(video):row.scope==='creator'?row.target===creatorRejectionTarget(video):topicEvidenceForScan(video,input.tags[video.id]).some(link=>link.topic===row.target));
 if(penalty>0)notices.push('A saved “less of this” choice lowers this title’s rank. It stays searchable.');
 else if(matched&&(favorite||creatorFavorite))notices.push('A saved favorite protects this title from your “less of this” choice. That choice applies when the favorite is removed.');
 else if(matched)notices.push('A matching topic choice is protected by your topic heart.');
 if(exposure>0)notices.push('Recent recommendation exposure reduces repetition; it does not mean you watched this title.');
 return notices.slice(0,3);
}
export function personalGuideExplanation(input:GuideInput,video:LibraryVideo,matches:ReadonlyArray<readonly [string,number]>,penalty:number,exposure:number):GuideExplanation{
 const reasons:GuideReason[]=[];
 if(input.favorites[video.id])reasons.push({id:'favorite',kind:'favorite',text:'You saved this title as a favorite.',feedback:guideChoice(video)});
 if(input.likes[video.id])reasons.push({id:'like',kind:'like',text:'You liked this title.',feedback:guideChoice(video)});
 for(const [tag,encoded] of matches){const origin=input.videos[Math.abs(encoded)-1];if(!origin||origin.id===video.id)continue;
  const a=videoBridgeSource(origin),b=videoBridgeSource(video),bridge=a&&b&&a!==b?{topic:tag,a,b}:undefined,keyOf=bridge?bridgeTopic:guideContentKey,raw=(input.tags[video.id]??[]).find(value=>keyOf(value)===tag)??tag,originTag=(input.tags[origin.id]??[]).find(value=>keyOf(value)===tag)??tag,signal=encoded>0?'favorite':'like';
  reasons.push({id:'shared-tag:'+tag,kind:'shared-tag',bridge,text:'Shared saved content label “'+guideClip(raw)+'” with a title you '+(signal==='favorite'?'saved':'liked')+'.',field:'saved tag',quote:guideClip(raw),origin:{id:origin.id,title:guideClip(origin.name),tag:guideClip(originTag),signal},feedback:guideChoice(video,canonicalTopic(tag))});if(reasons.length>=4)break;
 }
 if(!reasons.length)reasons.push({id:'discovery',kind:'discovery',text:'Available in your public library; no saved content preference matched.',field:'title',quote:guideClip(video.name),feedback:guideChoice(video)});
 return {basis:reasons[0]?.kind==='discovery'?'discovery':'preference',reasons,notices:guideNotices(input,video,penalty,exposure)};
}
export function topicGuideReason(video:LibraryVideo,topic:string,tags?:readonly string[]):GuideReason|undefined{
 const evidence=topicEvidenceForScan(video,tags).find(link=>link.topic===topic);if(!evidence)return;
 return {id:'topic:'+topic,kind:'topic',text:'Topic “'+topic+'” matches recorded content evidence.',field:evidence.saved?'saved tag':'content topic evidence',quote:guideClip(evidence.reason),feedback:guideChoice(video,topic)};
}
