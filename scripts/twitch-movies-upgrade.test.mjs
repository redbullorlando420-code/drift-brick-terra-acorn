import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {youtubeRuntime,youtubeRendererMetadata,retainYoutubeMetadata}=await import('../src/lib/videos/youtube-metadata.ts');
const {youtubeVideoRenderers}=await import('../src/lib/remote/youtube-page-data.ts');
const {youtubeWatchMetadata}=await import('../src/lib/remote/youtube-video-metadata.ts');
const {prepareMovieCatalog}=await import('../src/lib/videos/movie-catalog.ts');
const {prepareTwitchRecommendationScore}=await import('../src/lib/videos/twitch-recommendations.ts');
const {rankTwitchVods}=await import('../src/lib/videos/twitch-vod-ranking.ts');
const {buildTwitchMix}=await import('../src/lib/videos/twitch-mix.ts');
const {prepareTwitchDeskIndex,prepareTwitchCoverage}=await import('../src/lib/videos/twitch-desk-catalog.ts');
const {selectTwitchRefreshBatch}=await import('../src/lib/videos/twitch-refresh-selection.ts');
const tick=async()=>{};
const local=(id,patch={})=>({id,folderId:'files',name:'Ordinary title',path:id+'.mkv',extension:'mkv',mime:'video/x-matroska',size:0,addedAt:1,...patch});
const tw=(id,creator,genre='Elden Ring',patch={})=>({...local(id),extension:'vod',name:'Elden Ring exploration',genre,remote:{kind:'twitch',videoId:id,channelId:creator,channelName:creator},...patch});
test('YouTube runtime labels survive legacy/modern imports, watch metadata and sparse refreshes',()=>{
 assert.equal(youtubeRuntime('1:42:35'),6155);assert.equal(youtubeRuntime('124:00'),7440);for(const value of ['LIVE','1:99','-5:00','1:00:99',Infinity,0])assert.equal(youtubeRuntime(value),undefined);
 assert.equal(youtubeRendererMetadata({lengthText:{simpleText:'1:42:35'}}).duration,6155);assert.equal(youtubeRendererMetadata({isLive:true,lengthText:{simpleText:'1:42:35'}}).duration,undefined);
 const [row]=youtubeVideoRenderers({lockupViewModel:{contentId:'movie000001',contentType:'LOCKUP_CONTENT_TYPE_VIDEO',contentImage:{thumbnailViewModel:{overlays:[{thumbnailBottomOverlayViewModel:{badges:[{thumbnailBadgeViewModel:{text:'1:42:35'}}]}}]}}}},10);assert.equal(youtubeRendererMetadata(row).duration,6155);
 const html='var ytInitialPlayerResponse = '+JSON.stringify({videoDetails:{videoId:'movie000001',lengthSeconds:'6155',shortDescription:'A full film'},playabilityStatus:{status:'OK'}})+';';assert.equal(youtubeWatchMetadata(html,'movie000001').duration,6155);
 const old={...local('yt'),duration:6155,remote:{kind:'youtube',publishedSource:'unknown'}};assert.equal(retainYoutubeMetadata(old,{...old,duration:undefined}).duration,6155);
});
test('movie shelves recover connected folder/year evidence and observed runtimes while separating unknowns and exclusions',async()=>{
 const rows=[local('folder',{duration:5400}),local('year',{name:'Rear.Window.1954.1080p.mkv',duration:6700,folderId:'other'}),local('seen',{name:'Known Full Movie',remote:{kind:'youtube',videoId:'movie000001'}}),local('pending',{name:'Another Full Movie',remote:{kind:'youtube',videoId:'movie000002'}}),local('short',{name:'Full Movie',duration:600}),local('review',{name:'Full Movie review',duration:5400}),local('episode',{name:'Series S01E02',duration:5400}),local('hidden',{duration:5400}),local('private',{duration:5400,folderId:'private'})];
 const result=await prepareMovieCatalog({videos:rows,folders:[{id:'files',name:'Movies'},{id:'private',name:'Movies',adult:true}],hidden:{hidden:true},unavailable:{},progress:{seen:{d:6500}}},tick);
 assert.deepEqual(result.videos.map(v=>v.id),['folder','year','seen']);assert.equal(result.awaitingRuntime,1);assert.deepEqual(result.candidates.map(v=>v.id),['pending']);assert.equal(rows[2].duration,undefined,'observed evidence does not mutate the source record');
});
test('unknown movie previews stay bounded while all eligible candidates are counted',async()=>{
 const result=await prepareMovieCatalog({videos:Array.from({length:10000},(_,i)=>local('f'+i,{name:'Full Movie '+i})),folders:[],hidden:{},unavailable:{}},tick);assert.equal(result.videos.length,0);assert.equal(result.awaitingRuntime,10000);assert.equal(result.candidates.length,96);
});
test('Twitch recommendations learn creator/game/title taste, prefer unwatched related VODs and reject one-star or live placeholders',async()=>{
 const rows=[tw('seed','liked'),tw('next','liked'),tw('related','other'),tw('unrelated','other','Cooking',{name:'Cooking bread'}),tw('bad','liked'),{...tw('offline','liked'),extension:'live'},{...tw('live','liked'),remote:{kind:'twitch',live:true}},{...tw('clip','liked'),extension:'clip'}];
 const score=await prepareTwitchRecommendationScore(rows,{tags:{},favorites:{seed:true},likes:{seed:true},viewCounts:{seed:10},rating:id=>id==='seed'?5:id==='bad'?1:0,watchScore:id=>id==='seed'?12:0,now:100000},undefined,tick);
 assert(score(rows[1])>score(rows[0]),'recommend the unwatched match ahead of its watched seed');assert(score(rows[2])>score(rows[3]),'related game/title evidence beats unrelated content');const ranked=await rankTwitchVods(rows,score,undefined,tick);assert(!ranked.some(v=>['bad','offline','live','clip'].includes(v.id)));
});
test('ranked creator rotation retains the best matching creators even with thousands of followed archives',async()=>{
 const rows=Array.from({length:5000},(_,i)=>tw('v'+i,'creator'+i));let stats;const mixed=await buildTwitchMix(rows,7,undefined,true,96,tick,undefined,value=>stats=value);assert.deepEqual(mixed.map(v=>v.id),rows.slice(0,96).map(v=>v.id));assert(stats.peakRetained<=96*12);
 const fresh=await buildTwitchMix(rows,7,undefined,false,96,tick,video=>video.id==='v0'?Infinity:0);assert(!fresh.some(v=>v.id==='v0'));
});
test('Twitch coverage uses provider identities rather than renamed or colliding display names',async()=>{
 const rows=[tw('a','123','Racing',{folderId:'tw:old',remote:{kind:'twitch',channelId:'123',channelName:'OldName'}}),tw('b','456','Cooking',{folderId:'tw:other',remote:{kind:'twitch',channelId:'456',channelName:'SameName'}})];
 const index=await prepareTwitchDeskIndex(rows,tick);const result=await prepareTwitchCoverage(index,[{id:'tw:new',kind:'twitch',channelId:'123',handle:'new',title:'NewName'},{id:'tw:wrong',kind:'twitch',channelId:'789',handle:'wrong',title:'SameName'}],tick);assert.equal(result.channels.find(c=>c.id==='tw:new').count,1);assert.equal(result.channels.find(c=>c.id==='tw:wrong').count,0);
});
test('Twitch archive priority survives reload and ignores a frequently refreshed live clock',()=>{
 const rows=[{id:'tw:a',kind:'twitch',channelId:'a',handle:'a',title:'A',twitchArchiveCheckedAt:200,lastCheckedAt:1},{id:'tw:b',kind:'twitch',channelId:'b',handle:'b',title:'B',twitchArchiveCheckedAt:100,lastCheckedAt:999999}];assert.equal(selectTwitchRefreshBatch(JSON.parse(JSON.stringify(rows)),1,0).channels[0].id,'tw:b');
});
test('actual Twitch continuation requests resume older pages, skip clips, retain checkpoints on failure and cap first at 100',async()=>{
 const {runRefreshRemotes}=await import('../src/lib/remote/api.ts');const {encodeTwitchArchiveCursor}=await import('../src/lib/videos/twitch-archive-cursor.ts');const original=globalThis.fetch,calls=[];let fail=false;
 globalThis.fetch=async(url,init)=>{const request=JSON.parse(init.body);calls.push(request);assert(request.query.includes('videos('));assert(request.variables.first<=100);if(fail)return new Response('unavailable',{status:503});const next=request.variables.after==='old-a'?'old-b':'old-c';return Response.json({data:{user:{id:'123',displayName:'Creator',stream:null,videos:{edges:Array.from({length:100},(_,i)=>({cursor:next+'-'+i,node:{id:next+i,title:'Older VOD '+i,lengthSeconds:3600,viewCount:1234,publishedAt:'2025-01-01T00:00:00Z'}})),pageInfo:{hasNextPage:true,endCursor:next}}}}});};
 try{let channels=[{id:'tw:continuation',kind:'twitch',handle:'continuation',title:'Creator',twitchArchiveCursor:encodeTwitchArchiveCursor({stage:'ARCHIVE',after:'old-a'}),twitchClipCursor:'saved-clips'}];const first=await runRefreshRemotes({channels,twitchRoutine:true,twitchContinueArchive:true});assert.equal(calls[0].variables.after,'old-a');assert.equal(first.videos.filter(v=>!v.remote.live).length,100);assert.equal(first.videos[0].remote.views,1234);assert.equal(first.videos[0].remote.channelId,'123');assert(first.channels[0].twitchArchiveCheckedAt>0);assert.equal(first.channels[0].twitchClipCursor,'saved-clips');channels=first.channels;const second=await runRefreshRemotes({channels,twitchRoutine:true,twitchContinueArchive:true});assert.equal(calls[1].variables.after,'old-b');assert.notEqual(second.videos[0].id,first.videos[0].id);fail=true;const failed=await runRefreshRemotes({channels:second.channels,twitchRoutine:true,twitchContinueArchive:true});assert.equal(failed.channels[0].twitchArchiveCursor,second.channels[0].twitchArchiveCursor);assert(failed.channels[0].lastProviderFailure);assert.equal(failed.refreshedIds.length,0);}finally{globalThis.fetch=original;}
});


test('local metadata-only runtime probe releases the element on success and abort without playing media',async()=>{
 const {readLocalRuntime}=await import('../src/lib/videos/local-runtime.ts');const original=globalThis.document,elements=[];
 globalThis.document={createElement:()=>{const row={duration:6700,removed:0,loads:0,removeAttribute(){this.removed++;},load(){this.loads++;}};elements.push(row);return row;}};
 try{const controller=new AbortController(),first=readLocalRuntime(local('probe',{src:'blob:fixture'}),controller.signal);await Promise.resolve();await Promise.resolve();assert.equal(elements[0].preload,'metadata');elements[0].onloadedmetadata();assert.equal(await first,6700);assert.equal(elements[0].onloadedmetadata,null);assert.equal(elements[0].removed,1);const next=new AbortController(),job=readLocalRuntime(local('cancel',{src:'blob:fixture'}),next.signal);await Promise.resolve();await Promise.resolve();next.abort();await assert.rejects(job,/cancelled/);assert.equal(elements[1].onerror,null);assert.equal(elements[1].loads,1);}finally{globalThis.document=original;}
});
