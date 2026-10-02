import { registerHooks } from 'node:module';
import { performance } from 'node:perf_hooks';
import assert from 'node:assert/strict';
registerHooks({ resolve(s,c,n) { try { return n(s,c); } catch(e) { if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s)) return n(s+'.ts',c); throw e; } } });
const { youtubeCoverageIndexAsync, youtubeCoverageCounts } = await import('../src/lib/remote/youtube-coverage.ts');
const { youtubeSourceIndex, youtubeVideosForSource } = await import('../src/lib/remote/youtube-sources.ts');
const { updateYoutubeShelf } = await import('../src/lib/videos/youtube-shelf.ts');
// Node lacks browser scheduler.postTask. Model task scheduling with setImmediate
// so this measures CPU work rather than Windows' timer resolution.
globalThis.scheduler = { postTask: fn => new Promise(resolve => setImmediate(() => resolve(fn()))) };
const total = Number(process.argv[2] ?? 1_000_000), creators = 2500;
const channels = Array.from({length:creators}, (_,i)=>`UC${String(i).padStart(22,'0')}`);
const sources = channels.map(channelId=>({id:`yt:${channelId}`,channelId}));
const rows = Array.from({length:total},(_,i)=>({id:`yt:${String(i).padStart(11,'0')}`,folderId:sources[i%creators].id,addedAt:i,name:'Upload',path:'youtube',mime:'video/youtube',extension:'yt',size:0,remote:{kind:'youtube',videoId:String(i).padStart(11,'0'),channelId:channels[i%creators]}}));
let heartbeats=0; const timer=setInterval(()=>heartbeats++,1);
const start=performance.now(), compact=await youtubeCoverageIndexAsync(rows), buildMs=performance.now()-start;
clearInterval(timer);
assert.equal(compact.distinctVideos,total); assert(heartbeats>0);
const compactStart=performance.now();
for(let i=0;i<20;i++) assert.equal(youtubeCoverageCounts(compact,sources).get(sources[0].id),Math.ceil(total/creators));
const compact20Ms=performance.now()-compactStart;
const full=youtubeSourceIndex(rows), legacyStart=performance.now();
for(let i=0;i<20;i++) for(const source of sources) assert.equal(youtubeVideosForSource(full,source).length, Math.ceil(total/creators));
const legacy20Ms=performance.now()-legacyStart;
const ordered=[...rows].reverse(), next=[...rows,{...rows[0],id:'yt:new00000001',addedAt:total+1,remote:{...rows[0].remote,videoId:'new00000001'}}];
const shelfStart=performance.now(), shelf=updateYoutubeShelf(rows,next,ordered,()=>true), shelfMs=performance.now()-shelfStart;
assert.equal(shelf.length,total+1); assert.equal(shelf[0],next.at(-1));
assert.equal(shelf.at(-1),rows[0]);
console.log(JSON.stringify({entries:total,creators,compactBuildMs:Math.round(buildMs),backgroundHeartbeats:heartbeats,compact20CoverageUpdatesMs:Math.round(compact20Ms),legacy20CoverageUpdatesMs:Math.round(legacy20Ms),coverageSpeedup:Number((legacy20Ms/compact20Ms).toFixed(1)),appendShelfMs:Math.round(shelfMs),compactCounterKeys:compact.bySource.size+compact.byChannel.size+compact.overlap.size,retainedVideoReferencesInCompactIndex:0},null,2));
