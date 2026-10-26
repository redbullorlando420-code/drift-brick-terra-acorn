
import type {LibraryVideo,VideoMetadataProvenance} from './types.ts';
import {youtubeTextTags,youtubeTagEvidence,youtubeTagTitleHash,YOUTUBE_TEXT_TAG_VERSION} from './youtube-text-tags.ts';
export type YoutubeReviewBase={tags:string[]|undefined;provenance:VideoMetadataProvenance|undefined;summary:NonNullable<LibraryVideo['remote']>['youtubeTagSummary'];checkedAt:number|undefined};
export function prepareYoutubeTagReview(video:LibraryVideo|undefined,tags:string[]|undefined,provenance:VideoMetadataProvenance|undefined,base:YoutubeReviewBase,selected:readonly string[],now=Date.now()){
 if(!video||video.remote?.kind!=='youtube'||video.remote.live||video.remote.youtubeType==='upcoming')throw Error('Review tags on a saved video after the stream ends.');
 if(provenance?.lockedFields?.includes('tags'))throw Error('Your tags are locked. Edit them manually or unlock the tag field before accepting suggestions.');
 if(tags!==base.tags||provenance!==base.provenance||video.remote.youtubeTagSummary!==base.summary||video.remote.youtubeTagsCheckedAt!==base.checkedAt)throw Error('Tags or metadata changed during review. Review the updated suggestions again.');
 const summary=video.remote.youtubeTagSummary;
 if(!video.remote.youtubeTagsCheckedAt||summary?.version!==YOUTUBE_TEXT_TAG_VERSION||!summary.scores||!summary.signals||summary.titleHash!==youtubeTagTitleHash(video.name))throw Error('Pull this video’s tags first to prepare current confidence evidence.');
 const wanted=[...new Set(selected)].slice(0,28),keys=Object.keys(summary.sources),existing=tags??[];
 if(!wanted.length)throw Error('Select at least one suggestion.');
 if(wanted.some(tag=>!keys.includes(tag)))throw Error('A selected suggestion is no longer available. Review again.');
 const next=[...new Set([...existing,...wanted])];if(next.length>Math.max(32,existing.length))throw Error('This video has reached its tag limit. Remove a tag before adding more.');
 const sources={...provenance?.tags},reviews:NonNullable<VideoMetadataProvenance['youtubeReviews']>={};for(const tag of existing.slice(0,32)){const row=provenance?.youtubeReviews?.[tag];if(row)reviews[tag]=row;}let reviewed=0;
 for(const tag of wanted){if(sources[tag]==='manual'||sources[tag]==='youtube-review'||existing.includes(tag)&&!sources[tag])continue;const i=keys.indexOf(tag),score=summary.scores[i],signals=summary.signals[i];
  if(!Number.isFinite(score)||!Number.isSafeInteger(signals)||score!<0||score!>100||signals!<=0||signals!>31)throw Error('Suggestion evidence is invalid. Pull this video’s metadata again.');
  sources[tag]='youtube-review';reviews[tag]={version:1,score:score!,signals:signals!,at:now};reviewed++;
 }
 return {tags:next,reviewed,provenance:{...provenance,tags:sources,youtubeReviews:Object.fromEntries(Object.entries(reviews).sort((a,b)=>b[1].at-a[1].at).slice(0,32)),updatedAt:now} as VideoMetadataProvenance};
}

/** One selected public video only; bounded evidence export is not a restorable library backup. */
export function youtubeTagConfidenceReport(video:LibraryVideo,provenance?:VideoMetadataProvenance){
 const data=youtubeTextTags(video);return {version:1,policyVersion:1,videoId:video.remote?.videoId,title:video.name.slice(0,500),checkedAt:video.remote?.youtubeTagsCheckedAt??null,
 suggestions:data.tags.map((tag,i)=>({tag,score:data.scores[i]??0,signals:data.signals[i]??0,automatic:(data.scores[i]??0)>=80,evidence:youtubeTagEvidence(video,tag),accepted:provenance?.tags[tag]==='youtube-review'?provenance.youtubeReviews?.[tag]??null:null})),
 note:'Evidence strength, not a probability. Snapshot for review; saved tag edits are managed by the library.'};
}
