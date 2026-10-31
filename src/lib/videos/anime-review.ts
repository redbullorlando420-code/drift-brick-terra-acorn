import { videoIsPrivate } from './public-visibility.ts';
import {animeTitleInfo} from './anime-title.ts';
import type {LibraryVideo,ResumeMark} from './types.ts';

export const ANIME_SERIES_LIMIT=512,ANIME_EPISODE_LIMIT=4096,ANIME_MAP_LIMIT=200;
export type AnimeNumbering='season'|'absolute';
export type AnimeEpisodeKind='episode'|'special'|'ova'|'unresolved';
export type AnimeRange={numbering:AnimeNumbering;season:number;start:number;end:number};
export type AnimeSeriesReview={id:string;title:string;release:string;aliases:string[];ranges:AnimeRange[];policy:{numbering:AnimeNumbering;threshold:number;specials:boolean};at:number};
export type AnimeEpisodeReview={seriesId:string;numbering:AnimeNumbering;season:number;episode?:number;kind:AnimeEpisodeKind;preferred:boolean;at:number};
type AnimePatch={series:Record<string,AnimeSeriesReview|null>;episodes:Record<string,AnimeEpisodeReview|null>};
export type AnimeReviewLedger={version:1;updatedAt:number;series:Record<string,AnimeSeriesReview>;episodes:Record<string,AnimeEpisodeReview>;undo?:AnimePatch;action?:string};
export const EMPTY_ANIME_REVIEWS:AnimeReviewLedger={version:1,updatedAt:0,series:{},episodes:{}};
const clean=(v:unknown,max=160)=>typeof v==='string'?v.replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim().slice(0,max):'';
const key=(v:unknown)=>typeof v==='string'&&v.length>0&&v.length<=500&&!/[\u0000-\u001f]/.test(v)&&!['__proto__','prototype','constructor'].includes(v);
const stamp=(v:unknown):v is number=>Number.isSafeInteger(v)&&Number(v)>=0;
const number=(v:unknown,min:number,max:number):v is number=>Number.isInteger(v)&&Number(v)>=min&&Number(v)<=max;
const mode=(v:unknown):v is AnimeNumbering=>v==='season'||v==='absolute';
const identity=(v:string)=>/^anime:[a-z0-9-]{1,80}$/i.test(v);
const lane=(v:{numbering:AnimeNumbering;season:number})=>v.numbering==='absolute'?'absolute':'season:'+v.season;
export const animeSlotKey=(v:AnimeEpisodeReview)=>lane(v)+':'+v.kind+':'+(v.episode??'?');
function readRange(r:AnimeRange):AnimeRange{
 if(!r||!mode(r.numbering)||!number(r.season,r.numbering==='absolute'?0:1,r.numbering==='absolute'?0:100)||!number(r.start,1,10000)||!number(r.end,r.start,10000)||r.end-r.start+1>ANIME_MAP_LIMIT)throw Error('Choose a range of at most 200 episodes within one numbering lane.');
 return {numbering:r.numbering,season:r.season,start:r.start,end:r.end};
}
function readSeries(r:AnimeSeriesReview,id:string):AnimeSeriesReview{
 if(!identity(id)||!r||!clean(r.title)||!clean(r.release,80)||!stamp(r.at)||!Array.isArray(r.aliases)||r.aliases.length>12||r.aliases.some(a=>typeof a!=='string'||!clean(a))||!Array.isArray(r.ranges)||r.ranges.length>24||!r.policy||!mode(r.policy.numbering)||![0.9,0.95,0.992,1].includes(r.policy.threshold)||typeof r.policy.specials!=='boolean')throw Error('Invalid reviewed anime series. Enter a title and release/version label.');
 const ranges=r.ranges.map(readRange);if(new Set(ranges.map(lane)).size!==ranges.length)throw Error('Each season/absolute lane can have only one reviewed range.');
 return {id,title:clean(r.title),release:clean(r.release,80),aliases:[...new Set(r.aliases.map(a=>clean(a)))],ranges,policy:{numbering:r.policy.numbering,threshold:r.policy.threshold,specials:r.policy.specials},at:r.at};
}
function readEpisode(r:AnimeEpisodeReview):AnimeEpisodeReview{
 if(!r||!identity(r.seriesId)||!mode(r.numbering)||!number(r.season,r.numbering==='absolute'?0:1,r.numbering==='absolute'?0:100)||!['episode','special','ova','unresolved'].includes(r.kind)||!stamp(r.at)||typeof r.preferred!=='boolean'||r.episode!==undefined&&!number(r.episode,1,10000)||r.kind==='episode'&&r.episode===undefined||r.kind==='unresolved'&&r.episode!==undefined)throw Error('Confirm a valid episode number, or keep this source unresolved.');
 return {seriesId:r.seriesId,numbering:r.numbering,season:r.season,...(r.episode!==undefined?{episode:r.episode}:{}),kind:r.kind,preferred:r.preferred,at:r.at};
}
export function parseAnimeReviews(raw:unknown):AnimeReviewLedger{
 const r=raw as AnimeReviewLedger;
 if(!r||r.version!==1||!stamp(r.updatedAt)||!r.series||!r.episodes||typeof r.series!=='object'||typeof r.episodes!=='object'||Array.isArray(r.series)||Array.isArray(r.episodes)||Object.keys(r.series).length>ANIME_SERIES_LIMIT||Object.keys(r.episodes).length>ANIME_EPISODE_LIMIT)throw Error('Unsupported or invalid anime review ledger.');
 const series:AnimeReviewLedger['series']=Object.create(null),episodes:AnimeReviewLedger['episodes']=Object.create(null),preferred=new Set<string>();
 for(const [id,value]of Object.entries(r.series))series[id]=readSeries(value,id);
 for(const [id,value]of Object.entries(r.episodes)){if(!key(id))throw Error('Invalid anime source key.');const e=readEpisode(value);if(!series[e.seriesId])throw Error('Episode has no reviewed series.');if(e.preferred){const slot=e.seriesId+':'+animeSlotKey(e);if(preferred.has(slot))throw Error('Only one preferred version is allowed for each episode.');preferred.add(slot);}episodes[id]=e;}
 let undo:AnimePatch|undefined;
 if(r.undo){if(!r.undo.series||!r.undo.episodes||Object.keys(r.undo.series).length>1||Object.keys(r.undo.episodes).length>48)throw Error('Invalid anime review Undo.');undo={series:Object.create(null),episodes:Object.create(null)};for(const [id,v]of Object.entries(r.undo.series)){if(!identity(id))throw Error('Invalid Undo series.');undo.series[id]=v===null?null:readSeries(v,id);}for(const [id,v]of Object.entries(r.undo.episodes)){if(!key(id))throw Error('Invalid Undo source.');undo.episodes[id]=v===null?null:readEpisode(v);}}
 return {version:1,updatedAt:r.updatedAt,series,episodes,...(undo?{undo}:{}),...(clean(r.action,120)?{action:clean(r.action,120)}:{})};
}
export function normalizeAnimeReviews(raw:unknown){try{return parseAnimeReviews(raw);}catch{return EMPTY_ANIME_REVIEWS;}}
export function newestAnimeReviews(a:unknown,b:unknown){const left=normalizeAnimeReviews(a),right=normalizeAnimeReviews(b);return right.updatedAt>=left.updatedAt?right:left;}
function commit(ledger:AnimeReviewLedger,patch:AnimePatch,action:string,now:number):AnimeReviewLedger{
 const series={...ledger.series},episodes={...ledger.episodes},undo:AnimePatch={series:{},episodes:{}};
 for(const [id,v]of Object.entries(patch.series)){undo.series[id]=series[id]??null;if(v)series[id]=v;else delete series[id];}
 for(const [id,v]of Object.entries(patch.episodes)){undo.episodes[id]=episodes[id]??null;if(v)episodes[id]=v;else delete episodes[id];}
 if(Object.keys(series).length>ANIME_SERIES_LIMIT||Object.keys(episodes).length>ANIME_EPISODE_LIMIT)throw Error('Anime review holds at most 512 identities and 4,096 source versions. Undo a recent addition before adding another.');
 return parseAnimeReviews({version:1,updatedAt:Math.max(now,ledger.updatedAt+1),series,episodes,undo,action});
}
export function confirmAnimeEpisode(ledger:AnimeReviewLedger,videoId:string,choice:{seriesId:string;title:string;release:string;aliases:string[];existing:boolean;numbering:AnimeNumbering;season:number;episode?:number;kind:AnimeEpisodeKind},now=Date.now()){
 if(!key(videoId))throw Error('Invalid source.');const old=ledger.episodes[videoId],existing=ledger.series[choice.seriesId];if(choice.existing&&!existing)throw Error('Choose an existing reviewed series.');if(!choice.existing&&existing)throw Error('Use the existing identity control to avoid replacing a reviewed series.');
 const series=choice.existing?existing:readSeries({id:choice.seriesId,title:choice.title,release:choice.release,aliases:choice.aliases,ranges:[],policy:{numbering:choice.numbering,threshold:0.95,specials:false},at:now},choice.seriesId);
 const episode=readEpisode({...choice,preferred:false,at:now});
 episode.preferred=old?.seriesId===episode.seriesId&&animeSlotKey(old)===animeSlotKey(episode)?old.preferred:false;
 return commit(ledger,{series:choice.existing?{}:{[series.id]:series},episodes:{[videoId]:episode}},'Confirmed anime identity and episode mapping',now);
}
export function editAnimeSeries(ledger:AnimeReviewLedger,id:string,values:Pick<AnimeSeriesReview,'title'|'release'|'aliases'>,now=Date.now()){
 const current=ledger.series[id];if(!current)throw Error('Review the series first.');const next=readSeries({...current,...values,at:now},id);return commit(ledger,{series:{[id]:next},episodes:{}},'Updated reviewed series labels and aliases',now);
}
export function removeAnimeMapping(ledger:AnimeReviewLedger,videoId:string,now=Date.now()){if(!ledger.episodes[videoId])return ledger;return commit(ledger,{series:{},episodes:{[videoId]:null}},'Removed episode mapping; source and progress retained',now);}
export function setAnimeRange(ledger:AnimeReviewLedger,id:string,range:AnimeRange,remove=false,now=Date.now()){
 const current=ledger.series[id];if(!current)throw Error('Review the series first.');const valid=readRange(range),ranges=current.ranges.filter(r=>lane(r)!==lane(valid));if(!remove)ranges.push(valid);
 return commit(ledger,{series:{[id]:{...current,ranges,at:now}},episodes:{}},remove?'Removed entered episode range':'Saved entered episode range; release schedule unverified',now);
}
export function setAnimePolicy(ledger:AnimeReviewLedger,id:string,policy:AnimeSeriesReview['policy'],now=Date.now()){
 const current=ledger.series[id];if(!current)throw Error('Review the series first.');if(JSON.stringify(current.policy)===JSON.stringify(policy))return ledger;return commit(ledger,{series:{[id]:{...current,policy,at:now}},episodes:{}},'Saved explicit next-episode policy',now);
}
export function preferAnimeVersion(ledger:AnimeReviewLedger,videoId:string,available:readonly string[],now=Date.now()){
 const e=ledger.episodes[videoId];if(!e||!available.includes(videoId))throw Error('Choose an available reviewed source version.');if(e.preferred)return ledger;
 const episodes:AnimePatch['episodes']={};for(const [id,row]of Object.entries(ledger.episodes))if(row.preferred&&row.seriesId===e.seriesId&&animeSlotKey(row)===animeSlotKey(e))episodes[id]={...row,preferred:false,at:now};episodes[videoId]={...e,preferred:true,at:now};
 return commit(ledger,{series:{},episodes},'Changed preferred episode version',now);
}
export function undoAnimeReview(ledger:AnimeReviewLedger,now=Date.now()){return ledger.undo?commit(ledger,ledger.undo,'Undid last anime review change',now):ledger;}
export function animeReviewVisibility(scope:{folders:readonly {id:string;adult?:boolean}[];hidden:Record<string,unknown>;unavailable:Record<string,unknown>}){
 const publicIds=new Set(scope.folders.filter(f=>!f.adult).map(f=>f.id)),privateIds=new Set(scope.folders.filter(f=>f.adult).map(f=>f.id));
 return (v:LibraryVideo)=>!scope.hidden[v.id]&&!scope.unavailable[v.id]&&!videoIsPrivate(privateIds,v)&&!v.isSample&&!v.remote?.live&&(!v.remote?publicIds.has(v.folderId):v.remote.kind==='youtube'&&v.remote.youtubeType!=='short'&&v.remote.youtubeType!=='upcoming');
}
export function reviewedAnimeInfo(video:LibraryVideo,ledger?:AnimeReviewLedger){
 const e=ledger?.episodes[video.id],s=e&&ledger?.series[e.seriesId];return s&&e?{series:s.title+' · '+s.release,key:s.id,season:e.season,episode:e.episode,format:e.kind==='episode'?'episode' as const:e.kind==='unresolved'?'title' as const:'special' as const}:animeTitleInfo(video.name);
}
export type AnimeOwnedVersion={video:LibraryVideo;review:AnimeEpisodeReview;available:boolean;resume?:ResumeMark};
export type AnimeSlot={key:string;numbering:AnimeNumbering;season:number;episode:number;kind:AnimeEpisodeKind;versions:AnimeOwnedVersion[]};
export type AnimeGapLane={key:string;numbering:AnimeNumbering;season:number;start:number;end:number;origin:'observed'|'entered';unverified:boolean;slots:Array<{episode:number;versions:AnimeOwnedVersion[]}>};
export type AnimeEpisodeMap={lanes:AnimeGapLane[];numbered:AnimeSlot[];specials:AnimeSlot[];unresolved:AnimeOwnedVersion[]};
/** Input is the current eligible reviewed catalog. No tail beyond the observed
 * maximum is invented, and large/absolute lanes never allocate a huge gap grid. */
export function buildAnimeEpisodeMap(series:AnimeSeriesReview,owned:readonly AnimeOwnedVersion[]):AnimeEpisodeMap{
 const slotMap=new Map<string,AnimeSlot>(),unresolved:AnimeOwnedVersion[]=[];
 for(const v of owned.slice(0,ANIME_EPISODE_LIMIT)){const e=v.review;if(e.seriesId!==series.id)continue;if(e.kind==='unresolved'||e.episode===undefined){unresolved.push(v);continue;}const k=animeSlotKey(e),slot=slotMap.get(k);if(slot)slot.versions.push(v);else slotMap.set(k,{key:k,numbering:e.numbering,season:e.season,episode:e.episode,kind:e.kind,versions:[v]});}
 const order=(a:AnimeSlot,b:AnimeSlot)=>a.numbering.localeCompare(b.numbering)||a.season-b.season||a.episode-b.episode||a.kind.localeCompare(b.kind);
 const numbered=[...slotMap.values()].filter(s=>s.kind==='episode').sort(order),specials=[...slotMap.values()].filter(s=>s.kind!=='episode').sort(order),lanes=new Map<string,{numbering:AnimeNumbering;season:number;episodes:Map<number,AnimeOwnedVersion[]>;range?:AnimeRange}>();
 for(const s of numbered){const k=lane(s),row=lanes.get(k)??{numbering:s.numbering,season:s.season,episodes:new Map()};row.episodes.set(s.episode,s.versions);lanes.set(k,row);}
 for(const r of series.ranges){const k=lane(r),row: {numbering:AnimeNumbering;season:number;episodes:Map<number,AnimeOwnedVersion[]>;range?:AnimeRange}=lanes.get(k)??{numbering:r.numbering,season:r.season,episodes:new Map()};row.range=r;lanes.set(k,row);}
 const result:AnimeGapLane[]=[];for(const [key,row]of lanes){const seen=[...row.episodes.keys()],start=row.range?.start??Math.min(...seen),end=row.range?.end??Math.max(...seen),unverified=!Number.isFinite(start)||end-start+1>ANIME_MAP_LIMIT;
  result.push({key,numbering:row.numbering,season:row.season,start,end,origin:row.range?'entered':'observed',unverified,slots:unverified?[]:Array.from({length:end-start+1},(_,i)=>({episode:start+i,versions:row.episodes.get(start+i)??[]}))});}
 result.sort((a,b)=>a.numbering.localeCompare(b.numbering)||a.season-b.season);return {lanes:result,numbered,specials,unresolved};
}
const progress=(v:AnimeOwnedVersion)=>{const r=v.resume;return r&&Number.isFinite(r.t)&&Number.isFinite(r.d)&&Number.isFinite(r.at)&&r.d>0&&r.t>=2&&r.at>=0?r:undefined;};
export type AnimeNextChoice={version?:AnimeOwnedVersion;slot?:AnimeSlot;reason:string;skip:number;resume:boolean};
/** Each slot is one episode regardless of duplicate cuts. Specials are a
 * separate opt-in tail. Numbering lanes are never inferred or mixed. */
export function nextAnimeEpisode(series:AnimeSeriesReview,map:AnimeEpisodeMap):AnimeNextChoice{
 const numbered=map.numbered.filter(s=>s.numbering===series.policy.numbering),specials=series.policy.specials?map.specials.filter(s=>s.numbering===series.policy.numbering):[],slots=[...numbered,...specials];
 const playable=(s:AnimeSlot)=>s.versions.filter(v=>v.available),pick=(s:AnimeSlot)=>{const all=playable(s);return all.find(v=>v.review.preferred)??all.find(v=>!v.video.remote)??all.slice().sort((a,b)=>a.video.id.localeCompare(b.video.id))[0];};
 let anchor=-1,last:AnimeOwnedVersion|undefined;
 for(let i=0;i<slots.length;i++)for(const v of slots[i]!.versions){const r=progress(v),old=last&&progress(last);if(r&&(!old||r.at>old.at||r.at===old.at&&v.video.id.localeCompare(last!.video.id)<0)){anchor=i;last=v;}}
 if(last&&progress(last)!.t/progress(last)!.d<series.policy.threshold){if(last.available)return {version:last,slot:slots[anchor],reason:'Resume the exact version most recently watched; other versions keep their own progress.',skip:0,resume:true};return {reason:'The most recently watched version needs its source reconnected. Choose a version in the episode map.',skip:0,resume:true};}
 let unavailable=0;
 for(let i=anchor+1;i<slots.length;i++){const s=slots[i]!;if(s.versions.some(v=>{const r=progress(v);return r&&r.t/r.d>=series.policy.threshold;}))continue;const version=pick(s);if(!version){unavailable++;continue;}
  let skip=0;const previous=slots[anchor];if(previous&&s.kind==='episode'&&previous.kind==='episode'&&s.numbering===previous.numbering&&s.season===previous.season){const existing=new Set(numbered.filter(r=>r.season===s.season).map(r=>r.episode));skip=Math.max(0,s.episode-previous.episode-1)-[...existing].filter(n=>n>previous.episode&&n<s.episode).length;}
  return {version,slot:s,reason:(s.kind!=='episode'?'Specials/OVAs are explicitly enabled and follow the numbered episodes. ':anchor<0?'Start with the first confirmed available episode. ':'Next confirmed episode after the most recent completed episode. ')+(skip?`${skip} intervening episode slot${skip===1?' is':'s are'} absent from the eligible reviewed library. `:'')+(unavailable?`${unavailable} saved slot${unavailable===1?' needs':'s need'} a reconnected source. `:'')+'Opening requires your action; no autoplay is added.',skip,resume:false};
 }
 return {reason:slots.length?'No later incomplete confirmed episode is available in the chosen numbering lane. Specials stay excluded unless enabled.':'Review numbered episodes in this numbering lane first. Unresolved sources never become automatic next choices.',skip:0,resume:false};
}
