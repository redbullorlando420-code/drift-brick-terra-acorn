import { forEachCatalogEntry, forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import { sparseRecordScan } from '../sparse-record.ts';
import { createBoundedPicks } from './bounded-picks.ts';
import { hasFreshViewerCount, type LibraryVideo } from './types.ts';
import { ADULT_PULL_PROVIDERS } from './adult-providers.ts';
const adultProviders=new Set<string>(ADULT_PULL_PROVIDERS);
const isAdultPullKind=(kind:string|undefined)=>adultProviders.has(kind??'');
import { hasFreshRemoteLiveState } from './live-desk.ts';
import { LIBRARY_LIMITS } from '../library-limits.ts';
import { canonicalTopic, hasTopicForScan } from './topics.ts';

export type GuideInput = {
  videos: readonly LibraryVideo[];
  tags: Record<string, string[]>;
  favorites: Record<string, true>;
  likes: Record<string, true>;
  history: readonly { id: string }[];
  folders?: readonly {id:string;adult?:boolean}[];
  hidden?: Record<string, unknown>;
  unavailable?: Record<string, unknown>;
  hideDemo?: boolean;
  provider?: string;
};
export type GuideSnapshot = {
  picks: LibraryVideo[]; live: LibraryVideo[];
  historyCount: number; favoriteCount: number; tagCount: number;
};
function shuffleRank(id: string, seed: number) {
  let value = seed >>> 0;
  // Preserve the guide's code-point traversal, including emoji IDs.
  for (const char of id) value = Math.imul(value ^ char.charCodeAt(0), 0x45d9f3b);
  return value >>> 0;
}
export function guideVisibility(input:GuideInput){
  const privateIds=new Set(input.folders?.filter(folder=>folder.adult).map(folder=>folder.id));
  return (video:LibraryVideo)=>(!input.provider||video.remote?.kind===input.provider)&&!privateIds.has(video.folderId)&&!isAdultPullKind(video.remote?.kind)&&!input.hidden?.[video.id]&&!input.unavailable?.[video.id]&&!video.isSample;
}

/** Retain twelve scored candidates rather than sorting/cloning the catalog.
 * All scans (including saved signals and live sorting) yield to current input. */
export async function prepareGuide(input: GuideInput, seed: number, now: number, turn: () => Promise<void>): Promise<GuideSnapshot> {
  const { videos, favorites, likes, tags, history } = input;
  const allowed=guideVisibility(input);
  const favoredTags = new Set<string>(), watched = new Set<string>(), live: LibraryVideo[] = [];
  let favoriteCount = 0, tagCount = 0;
  await forEachCatalogSlice(history, entry => { watched.add(entry.id); }, turn);
  await forEachCatalogEntry(sparseRecordScan(favorites, false), row => { if (row) favoriteCount++; }, turn);
  await forEachCatalogEntry(sparseRecordScan(tags), row => { if (row) tagCount += row[1].length; }, turn);
  await forEachCatalogSlice(videos, video => {
    if(!allowed(video))return;
    if (favorites[video.id] || likes[video.id]) for (const tag of tags[video.id] ?? []) favoredTags.add(tag);
    if (video.remote?.kind==='twitch' && video.remote.live && hasFreshRemoteLiveState(video,now,LIBRARY_LIMITS.twitchLiveStateFreshnessMs,LIBRARY_LIMITS.youtubeLiveStateFreshnessMs)) live.push(video);
  }, turn);
  const best = createBoundedPicks<{ video: LibraryVideo; score: number; rank: number; index: number }>(12,
    (a, b) => b.score - a.score || a.rank - b.rank || a.index - b.index);
  await forEachCatalogSlice(videos, (video, index) => {
    if (!allowed(video) || video.remote?.live || watched.has(video.id)) return;
    let score = (favorites[video.id] ? 3 : 0) + (likes[video.id] ? 2 : 0);
    for (const tag of tags[video.id] ?? []) if (favoredTags.has(tag)) score++;
    best.add({ video, score, rank: shuffleRank(video.id, seed), index });
  }, turn);
  const viewers = (video: LibraryVideo) => hasFreshViewerCount(video.remote, now) ? video.remote!.viewers! : 0;
  const orderedLive = await sortCatalogRows(live, (a, b) => viewers(b) - viewers(a), turn);
  return { picks: best.finish().map(row => row.video), live: orderedLive, historyCount: history.length, favoriteCount, tagCount };
}

/** Asking reads only prepared short lists and never rescans the library. */
export function guideAnswer(prompt: string, snapshot: GuideSnapshot, tags: GuideInput['tags']) {
  if (/live|twitch|stream/i.test(prompt) && snapshot.live.length)
    return `Live on your followed Twitch channels:\n${snapshot.live.slice(0, 4).map((video, index) => `${index + 1}. ${video.remote?.channelName ?? video.name}${hasFreshViewerCount(video.remote) ? ` · ${video.remote?.viewers?.toLocaleString()} viewers` : ''}`).join('\n')}\n\nLive status comes from the latest refresh in Realhub. Open a card to watch it.`;
  return snapshot.picks.length ? `Local recommendation${snapshot.picks.length === 1 ? '' : 's'} for “${prompt}”:\n${snapshot.picks.slice(0, 3).map((video, index) => `${index + 1}. ${video.name} — ${video.genre ?? 'a library pick'}${(tags[video.id] ?? []).length ? ` · ${(tags[video.id] ?? []).slice(0, 2).join(', ')}` : ''}`).join('\n')}\n\nRanked privately from your saved library signals.` : 'Add a few titles, tags, likes, or favorites and the local guide will start making picks.';
}

const normalize=(value:string)=>value.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^(?:keyword|topic|genre|creator)-/,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const stop=new Set('who surprise random a an the i me my you your we our is are was were be been to of and or for on in at by with about some something anything find show give suggest recommend recommendations please want watch watching video videos title titles tag tags tonight next should could can would what which based fits favorites favorite liked likes library from more'.split(' '));
export type GuideReply={text:string;picks:LibraryVideo[];reasons:Record<string,string>};
/** Questions scan the visible library cooperatively, not the twelve home picks.
 * Retain only twelve matches and their evidence; never a second text index. */
export async function answerGuideQuery(input:GuideInput,prompt:string,seed:number,now:number,turn:()=>Promise<void>):Promise<GuideReply>{
  const question=normalize(prompt.slice(0,500)),liveIntent=/\b(live|on air|streaming)\b/.test(question);
  const provider=/\byoutube\b/.test(question)?'youtube':/\btwitch\b/.test(question)?'twitch':undefined;
  const tokens=[...new Set(question.split(' ').filter(word=>!stop.has(word)&&!['youtube','twitch','live','streams','streaming','air'].includes(word)))].slice(0,12);
  const terms=tokens.map(word=>word==='funny'?'comedy':canonicalTopic(word)??word);
  if(!terms.length&&!liveIntent){const snapshot=await prepareGuide({...input,provider},seed,now,turn);return {text:guideAnswer(prompt,snapshot,input.tags),picks:snapshot.picks,reasons:Object.fromEntries(snapshot.picks.map(video=>[video.id,'Based on saved tags, likes and favorites']))};}
  const allowed=guideVisibility(input),seen=new Set<string>();
  const best=createBoundedPicks<{video:LibraryVideo;score:number;index:number;rank:number;reason:string}>(12,(a,b)=>b.score-a.score||a.rank-b.rank||a.index-b.index);
  await forEachCatalogSlice(input.videos,(video,index)=>{
    if(!allowed(video)||provider&&video.remote?.kind!==provider)return;
    if(liveIntent ? !video.remote?.live||!hasFreshRemoteLiveState(video,now,LIBRARY_LIMITS.twitchLiveStateFreshnessMs,LIBRARY_LIMITS.youtubeLiveStateFreshnessMs) : video.remote?.live)return;
    const key=video.remote?.videoId?`${video.remote.kind}:${video.remote.videoId}`:video.id;if(seen.has(key))return;
    const title=normalize(video.name.slice(0,1000)),creator=normalize(video.remote?.channelName??''),tags=(input.tags[video.id]??[]).slice(0,80).map(normalize),genre=normalize(video.genre??'');
    let matched=0,score=0;const evidence:string[]=[];
    for(const term of terms){
      if(title.includes(term)){matched++;score+=8;evidence.push('title: '+term);}
      else if(tags.some(tag=>tag===term||tag.split(' ').includes(term))){matched++;score+=10;evidence.push('tag: '+term);}
      else if(creator.includes(term)||genre.includes(term)){matched++;score+=5;evidence.push('creator/category: '+term);}
      else {const topic=canonicalTopic(term);if(topic&&hasTopicForScan(video,topic,input.tags[video.id])){matched++;score+=4;evidence.push('topic: '+topic);}}
    }
    if(terms.length&&matched<terms.length)return;
    seen.add(key);score+=(input.favorites[video.id]?3:0)+(input.likes[video.id]?2:0);
    best.add({video,index,score,rank:shuffleRank(video.id,seed),reason:liveIntent?'Recently confirmed live':evidence.length?[...new Set(evidence)].join(' · '):'Saved library interests'});
  },turn);
  const matches=best.finish();
  const reasons=Object.fromEntries(matches.map(row=>[row.video.id,row.reason]));
  return {picks:matches.map(row=>row.video),reasons,text:matches.length?`${liveIntent?'Recently confirmed live matches':'Library matches'} for “${prompt.slice(0,500)}” · ${matches.length} shown. Select a title to open it.`:liveIntent?'No recent live confirmation matches that question. Refresh live channels to check their current status.':'No saved titles or tags match that question. Try fewer words, a title, creator, or a topic such as racing, comedy, or technology.'};
}
