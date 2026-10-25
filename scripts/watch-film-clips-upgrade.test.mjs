import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {animeTitleInfo}=await import('../src/lib/videos/anime-title.ts');
const {animeEvidence,movieEvidence}=await import('../src/lib/videos/content-classification.ts');
const {prepareAnimeCatalog,selectAnimeTitles}=await import('../src/lib/videos/anime-catalog.ts');
const {prepareMovieCatalog}=await import('../src/lib/videos/movie-catalog.ts');
const {selectMovies,DEFAULT_MOVIE_FILTERS}=await import('../src/lib/videos/movie-selection.ts');
const {RoomParticipation,readParticipationAction,readParticipationState,participationVotes}=await import('../src/lib/multiplayer/room-participation.ts');
const {guestPlaybackRequest}=await import('../src/lib/multiplayer/room-playback-access.ts');
const {selectClipRefreshCreators}=await import('../src/lib/videos/twitch-clip-refresh.ts');
const {rankTwitchClipsAsync}=await import('../src/lib/videos/twitch-clips.ts');
const {normalizeFollowCheckpoints}=await import('../src/lib/videos/follow-checkpoints.ts');
const {twitchRetryPatch}=await import('../src/lib/videos/twitch-retry.ts');
const tick=async()=>{},row=(id,patch={})=>({id,folderId:'files',name:id,path:id+'.mkv',extension:'mkv',mime:'video/mp4',size:0,addedAt:1,...patch});
test('anime scene notation preserves season/episode numbers and ignores release years and quality codes',()=>{
 for(const [name,season,episode]of [['Frieren.S02E03.1080p.mkv',2,3],['[SubsPlease] Frieren - 03 [1080p][ABC123].mkv',1,3],['Frieren 2x10.mkv',2,10],['Frieren Season 2 Episode 3',2,3],['Frieren 第3話',1,3],['Frieren.E03',1,3]]){const info=animeTitleInfo(name);assert.equal(info.season,season,name);assert.equal(info.episode,episode,name);assert.equal(info.series,'Frieren',name);}
 assert.equal(animeTitleInfo('Your Name (2016) [1080p]').episode,undefined);assert.equal(animeTitleInfo('Frieren special').format,'special');assert.equal(animeTitleInfo('Anime movie').format,'film');
});
test('anime shelf excludes commentary/music/merch/games and description-only mentions while accepting numbered series and manual choices',()=>{
 for(const name of ['Best anime to watch','Anime recommendations','Anime edit 4k','Anime music to study','Anime figures unboxing','Naruto ultimate ninja S01E03','Anime news','Anime OST'])assert.equal(animeEvidence(row(name,{duration:3600})),undefined,name);
 assert(animeEvidence(row('Frieren - 03')));assert(animeEvidence(row('Naruto.S01E02')));assert(animeEvidence(row('Unknown title'),['anime']));
 assert.equal(animeEvidence(row('Unrelated tutorial',{description:'Anime episodes and manga',duration:1200})),undefined);
 assert.equal(animeEvidence(row('Anime film',{remote:{kind:'youtube',youtubeType:'upcoming'}})),undefined);
});
test('anime films, OVAs and numbered series have separate filters and natural episode order',async()=>{
 const videos=[row('e10',{name:'Frieren - 10'}),row('e2',{name:'[Group] Frieren - 02 [1080p].mkv'}),row('s2',{name:'Frieren S02E01'}),row('film',{name:'Anime movie'}),row('ova',{name:'Manga OVA'}),row('noise',{name:'Anime edit'})];
 const input={videos,folders:[],tags:{},unavailable:{},hiddenVideos:{},hideDemo:false},index=await prepareAnimeCatalog(input,tick);
 assert.equal(index.anime.length,5);assert.equal(index.filmCount,1);assert.equal(index.specialCount,1);assert.equal(index.series.length,1);assert.equal(index.series[0].count,3);
 assert.deepEqual((await selectAnimeTitles(index,[],'films','',{},tick)).map(v=>v.id),['film']);assert.deepEqual((await selectAnimeTitles(index,[],'specials','',{},tick)).map(v=>v.id),['ova']);
 assert.deepEqual((await selectAnimeTitles(index,[],'series','',{},tick,{series:'frieren',episodeOrder:true})).map(v=>v.id),['e2','e10','s2']);assert.equal(videos[0].id,'e10');
});
test('movie-specific filters retain strict film membership, real runtimes and unknown release years',async()=>{
 const videos=[row('feature',{name:'Feature Full Movie',duration:6000,year:1999,genre:'Action'}),row('short',{name:'Short Full Film',duration:1200,year:2020}),row('doc',{name:'Full Documentary',duration:3600,remote:{kind:'youtube'}}),row('unknown',{name:'Unknown Year Full Movie',duration:5500}),row('trailer',{name:'Movie trailer',duration:3600}),row('episode',{name:'Show S01E01',duration:3600}),row('too-short',{name:'Full Movie',duration:600})];
 const index=await prepareMovieCatalog({videos,folders:[],hidden:{},unavailable:{},tags:{}},tick);assert.equal(index.videos.length,4);assert.equal(index.features.length,3);assert.equal(index.shorts.length,1);assert.equal(index.documentaries.length,1);
 const select=filters=>selectMovies(index,{...DEFAULT_MOVIE_FILTERS,...filters},{feature:true},{feature:1},tick);
 assert.deepEqual((await select({runtime:'short'})).map(v=>v.id),['short']);assert.deepEqual((await select({source:'youtube'})).map(v=>v.id),['doc']);assert.deepEqual((await select({decade:'1990',genre:'Action'})).map(v=>v.id),['feature']);assert.equal((await select({saved:'unwatched'})).length,3);assert.deepEqual((await select({saved:'favorites'})).map(v=>v.id),['feature']);assert.deepEqual((await select({order:'year'})).slice(0,2).map(v=>v.id),['short','feature']);assert.equal((await select({decade:'unknown'})).length,2);assert.equal(movieEvidence(videos.at(-1)),undefined);
});
test('movie membership trusts manual choices but not automatically inferred generic film tags',async()=>{
 const video=row('talk',{name:'A conversation about filming',duration:3600,remote:{kind:'youtube'}});
 assert.equal(movieEvidence(video,['film'],'',{tags:{film:'provider:youtube'}}),undefined);
 assert(movieEvidence(video,['film'],'',{tags:{film:'manual'}}));
 assert(movieEvidence(row('anime',{name:'Anime theatrical film',duration:5400,remote:{kind:'youtube'}})));
 const catalog=await prepareMovieCatalog({videos:[video],folders:[],hidden:{},unavailable:{},tags:{talk:['film']},metadataProvenance:{talk:{tags:{film:'provider:youtube'}}}},tick);assert.equal(catalog.videos.length,0);
});
test('movie and anime selection yield and cancel instead of publishing obsolete filter results',async()=>{
 const videos=Array.from({length:15000},(_,i)=>row('f'+i,{name:'Full Movie '+i,duration:5400,year:2000})),index=await prepareMovieCatalog({videos,folders:[],hidden:{},unavailable:{}},tick);let turns=0;
 await assert.rejects(selectMovies(index,DEFAULT_MOVIE_FILTERS,{}, {},async()=>{if(++turns===3)throw Error('obsolete');}),/obsolete/);assert.equal(videos.length,15000);
});
test('host-owned readiness and votes are one per transport identity, bounded, and pruned after departures or title consumption',()=>{
 const model=new RoomParticipation();model.reconcile(['host','a','b'],['one','two']);assert(model.apply('a',{kind:'ready',value:true},['one','two']));assert(!model.apply('spoof',{kind:'ready',value:true},['one','two']));
 model.apply('a',{kind:'vote',value:'two'},['one','two']);model.apply('a',{kind:'vote',value:'two'},['one','two']);assert.equal(participationVotes(model.snapshot(),['one','two'])[0].votes,1);
 model.apply('b',{kind:'vote',value:'one'},['one','two']);assert.equal(participationVotes(model.snapshot(),['one','two'])[0].id,'one');model.apply('a',{kind:'vote',value:'one'},['one','two']);assert.equal(participationVotes(model.snapshot(),['one','two'])[0].votes,2);
 assert(!model.apply('a',{kind:'vote',value:'missing'},['one','two']));model.reconcile(['host','a'],['two']);assert.equal(model.snapshot().people.length,2);assert.equal(model.snapshot().people.find(p=>p.id==='a').vote,undefined);assert.equal(model.snapshot().people.find(p=>p.id==='a').ready,true);
 assert.equal(readParticipationAction({kind:'ready',value:'true'}),undefined);assert.equal(readParticipationState({revision:1,people:[{id:'same',ready:true},{id:'same',ready:false}]}),undefined);assert.equal(readParticipationState({revision:NaN,people:[]}),undefined);model.reconcile(Array.from({length:1000},(_,i)=>'p'+i),[]);assert.equal(model.snapshot().people.length,65);
});
test('guest playback and seek permissions are independent and cannot smuggle another action',()=>{
 const current={playing:true,position:30};assert.equal(guestPlaybackRequest(current,{playing:false,position:999,seek:false},{playback:false,seeking:true,live:false}).allowed,false);
 const seek=guestPlaybackRequest(current,{playing:false,position:60,seek:true},{playback:false,seeking:true,live:false});assert(seek.allowed&&seek.playing&&seek.position===60);
 const pause=guestPlaybackRequest(current,{playing:false,position:999999,seek:false},{playback:true,seeking:false,live:false});assert(pause.allowed&&!pause.playing&&pause.position===30);
 assert(!guestPlaybackRequest(current,{seek:true,position:1},{playback:true,seeking:true,live:true}).allowed);assert(!guestPlaybackRequest(current,{seek:true,position:NaN},{playback:true,seeking:true,live:false}).allowed);
});
test('clip refresh rotates across the full follow list with independent clocks, retries and exhaustion',()=>{
 const channels=Array.from({length:600},(_,i)=>({id:'tw:'+String(i).padStart(3,'0'),kind:'twitch',handle:'c'+i,title:'Creator '+i,lastCheckedAt:999999,twitchArchiveCheckedAt:999999}));
 const first=selectClipRefreshCreators(channels,'recent',1000);assert.equal(first.length,8);first.forEach(row=>row.twitchClipRecentCheckedAt=1000);const next=selectClipRefreshCreators(JSON.parse(JSON.stringify(channels)),'recent',1001);assert.equal(next[0].id,'tw:008');assert(!next.some(row=>first.some(before=>before.id===row.id)));
 channels[8].twitchClipRetry={attempts:1,retryAt:2000};channels[9].twitchClipExhaustedAt=1;assert(!selectClipRefreshCreators(channels,'archive',1001).some(row=>row.id==='tw:009'));
 const patch=twitchRetryPatch(channels[0],'clips',{kind:'network-offline',message:'Fail',at:1000,recovery:'Retry'},1000);assert(patch.twitchClipRetry);assert.equal(patch.twitchArchiveRetry,undefined);assert.equal(patch.lastProviderFailure,undefined);assert.equal(normalizeFollowCheckpoints({...patch,twitchClipCheckedAt:100,twitchClipRecentCheckedAt:90}).twitchClipRecentCheckedAt,90);
});
test('newest/most-viewed clip windows stay bounded and never boost missing/future creation dates',async()=>{
 const now=100000,clips=Array.from({length:10000},(_,i)=>row('tw:c:'+i,{extension:'clip',addedAt:i,remote:{kind:'twitch',channelName:'Creator',views:10000-i}}));clips.push(row('future',{extension:'clip',addedAt:now+1,remote:{kind:'twitch',channelName:'Creator'}}));
 const offsets=Uint32Array.from(clips,(_,i)=>i);const fresh=await rankTwitchClipsAsync(clips,offsets,'all','newest',tick,48,now);assert.equal(fresh.length,48);assert.equal(fresh[0].id,'tw:c:9999');assert(!fresh.some(row=>row.id==='future'));const popular=await rankTwitchClipsAsync(clips,offsets,'all','views',tick,48,now);assert.equal(popular[0].id,'tw:c:0');
});
test('actual clip-only recent requests skip VOD/live fields, ignore old cursors, deduplicate periods and retain original cache observation',async()=>{
 const {runFollowRemote}=await import('../src/lib/remote/api.ts');const original=globalThis.fetch,calls=[];
 globalThis.fetch=async(url,init)=>{const packet=JSON.parse(init.body);calls.push(packet);assert(!packet.query.includes('videos(')&&!packet.query.includes(' stream'));if(!packet.query.includes('clips('))return Response.json({data:{user:{id:'creator',displayName:'Clip creator'}}});const period=/period:(\w+)/.exec(packet.query)?.[1]??'current';assert.notEqual(period,'ALL_TIME');assert.equal(packet.variables.after,null);return Response.json({data:{user:{clips:{edges:[0,1].map(i=>({node:{id:period+i,slug:period+i,title:period+' '+i,createdAt:i?'2026-01-01T00:00:00Z':undefined,viewCount:5}})),pageInfo:{hasNextPage:false}}}}});};
 try{const result=await runFollowRemote({query:'clip_recent_fixture',kind:'twitch',twitchClipMode:'recent',clipLimit:6,twitchClipCursor:JSON.stringify({v:1,after:'old'})});assert.equal(result.videos.length,6);assert(result.channel.twitchClipRecentCheckedAt>0);assert(!Object.hasOwn(result.channel,'live'));assert(!Object.hasOwn(result.channel,'twitchArchiveCheckedAt'));assert(!Object.hasOwn(result.channel,'twitchClipCursor'));assert(result.videos.some(v=>v.addedAt===0));const reads=calls.length,again=await runFollowRemote({query:'clip_recent_fixture',kind:'twitch',twitchClipMode:'recent',clipLimit:6});assert.equal(calls.length,reads);assert.equal(again.channel.twitchClipRecentCheckedAt,result.channel.twitchClipRecentCheckedAt);}finally{globalThis.fetch=original;}
});
test('actual older clip partial failure retains accepted clips and its safe cursor, with a clip-specific failure',async()=>{
 const {runFollowRemote}=await import('../src/lib/remote/api.ts');const original=globalThis.fetch;let pages=0;
 globalThis.fetch=async(url,init)=>{const packet=JSON.parse(init.body);if(!packet.query.includes('clips('))return Response.json({data:{user:{id:'creator',displayName:'Creator'}}});assert(!packet.query.includes('videos('));if(pages++)return new Response('Provider failure',{status:503});assert.equal(packet.variables.after,'old');return Response.json({data:{user:{clips:{edges:[0,1].map(i=>({node:{slug:'OldClip'+i,title:'Older clip'}})),pageInfo:{hasNextPage:true,endCursor:'safe'}}}}});};
 try{const result=await runFollowRemote({query:'clip_archive_fixture',kind:'twitch',twitchClipMode:'archive',clipLimit:4,twitchClipCursor:JSON.stringify({v:1,after:'old'})});assert.equal(result.videos.length,2);assert.equal(JSON.parse(result.channel.twitchClipCursor).after,'safe');assert(result.channel.lastClipFailure);assert(!result.channel.lastProviderFailure);assert.equal(result.channel.twitchClipCheckedAt,undefined);}finally{globalThis.fetch=original;}
});
