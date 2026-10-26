
export const YOUTUBE_CONFIDENCE_VERSION=1;
export const YOUTUBE_TAG_SOURCES=['video-tag','hashtag','chapter','title','description'] as const;
export type YoutubeTagSource=typeof YOUTUBE_TAG_SOURCES[number];
export const sourceBit=(source:YoutubeTagSource)=>{const index=YOUTUBE_TAG_SOURCES.indexOf(source);return index<0?0:1<<index;};
export function confidenceBand(score:number){return score>=80?'high':score>=50?'medium':'low';}
/** Evidence strength, not a probability. Repetition within one field adds no strength. */
export function scoreYoutubeTag(mask:number,specific:boolean){
 const has=(source:YoutubeTagSource)=>Boolean(mask&sourceBit(source));
 if(has('title'))return has('video-tag')?96:has('chapter')||has('description')?90:specific?85:60;
 if(has('chapter'))return has('video-tag')?88:has('description')?82:75;
 if(has('video-tag'))return has('description')?70:55;
 if(has('description'))return specific?60:35;
 return has('hashtag')?40:0;
}
export const sourcesInMask=(mask:number)=>YOUTUBE_TAG_SOURCES.filter(source=>mask&sourceBit(source));
