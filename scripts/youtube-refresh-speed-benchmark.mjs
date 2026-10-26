import {registerHooks} from 'node:module';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
registerHooks({resolve(s,c,n){try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {forEachCatalogSlice,sortCatalogRows}=await import('../src/lib/catalog-work.ts');
const {youtubePublicationTime}=await import('../src/lib/videos/youtube-metadata.ts');
const {youtubeCatalogSelection}=await import('../src/lib/videos/youtube-catalog-selection.ts');
const {updateYoutubeShelfAsync}=await import('../src/lib/videos/youtube-shelf.ts');
const {prepareYoutubeCreatorIndex,mixYoutubeCreatorsAsync}=await import('../src/lib/remote/youtube-mix.ts');
const tick=async()=>{},base=Date.UTC(2026,9,1),rows=Array.from({length:100000},(_,i)=>({id:'yt:'+i,folderId:'public',name:'Upload '+i,path:'',size:0,addedAt:base-i*1000,extension:'yt',mime:'video/youtube',remote:{kind:'youtube',channelId:'owner'+i%180,publishedSource:i%5?'provider':'unknown',views:i}}));
const input={videos:rows,privateFolders:new Set(),unavailable:{},hiddenVideos:{},hideDemo:true};
// Full-sort baseline with the current identity-tie contract and the same cooperative helpers.
const previous=async()=>{const selected=[];await forEachCatalogSlice(rows,v=>{if(v.remote?.kind==='youtube'&&!input.unavailable[v.id]&&!input.hiddenVideos[v.id]&&!input.privateFolders.has(v.folderId)&&!(input.hideDemo&&v.isSample))selected.push(v);},tick,4096);return sortCatalogRows(selected,(a,b)=>youtubePublicationTime(b)-youtubePublicationTime(a)||(a.id<b.id?-1:a.id>b.id?1:0),tick,16384);};
const improved=()=>youtubeCatalogSelection(input,undefined,tick);
assert.deepEqual(await previous(),await improved());
const samples=[];for(let i=0;i<7;i++)for(const [name,fn] of i%2?[['improved',improved],['previous',previous]]:[['previous',previous],['improved',improved]]){const start=performance.now();await fn();if(i>=2)samples.push({name,ms:performance.now()-start});}
const median=values=>values.sort((a,b)=>a-b)[Math.floor(values.length/2)],before=median(samples.filter(s=>s.name==='previous').map(s=>s.ms)),after=median(samples.filter(s=>s.name==='improved').map(s=>s.ms));
const ordered=await improved(),mixed=[...rows,...Array.from({length:20000},(_,i)=>({...rows[i],id:'tw:'+i,remote:{kind:'twitch'}}))],next=[...mixed];for(let i=100000;i<100100;i++)next[i]={...next[i],name:'Updated'};
let refreshTurns=0;const refreshAt=performance.now();const retained=await updateYoutubeShelfAsync(mixed,next,ordered,()=>true,undefined,async()=>{refreshTurns++;});const refreshMs=performance.now()-refreshAt;assert.equal(retained,ordered);
await prepareYoutubeCreatorIndex(ordered,undefined,tick);let latestTurns=0;const latestAt=performance.now();const latest=await mixYoutubeCreatorsAsync(ordered,0,48,'latest',undefined,async()=>{latestTurns++;});const latestMs=performance.now()-latestAt;assert.equal(latest.length,48);assert(latestTurns<=2);
const report={ok:true,fixture:'100,000 saved YouTube videos, 20% unknown publication dates interleaved with descending known dates; 20,000 Twitch rows; deterministic metadata only',coldSelection:{beforeMedianMs:before,afterMedianMs:after,speedup:before/after,samples},unrelatedTwitchRefresh:{ms:refreshMs,turns:refreshTurns,selectionIdentityRetained:true},latestShelf:{ms:latestMs,turns:latestTurns,count:latest.length},limitation:'CPU benchmark with immediate cooperative boundaries; browser responsiveness and provider latency require separate checks.'};writeFileSync('screenshots/youtube-refresh-speed-benchmark.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
