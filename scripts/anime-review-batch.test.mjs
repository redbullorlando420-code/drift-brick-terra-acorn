import assert from 'node:assert/strict';
import test from 'node:test';
import {animeTitleInfo} from '../src/lib/videos/anime-title.ts';
import {EMPTY_ANIME_REVIEWS,confirmAnimeEpisode,editAnimeSeries,removeAnimeMapping,setAnimeRange,setAnimePolicy,preferAnimeVersion,undoAnimeReview,parseAnimeReviews,newestAnimeReviews,animeReviewVisibility,buildAnimeEpisodeMap,nextAnimeEpisode,ANIME_MAP_LIMIT} from '../src/lib/videos/anime-review.ts';
import {prepareAnimeCatalog,selectAnimeTitles} from '../src/lib/videos/anime-catalog.ts';
const turn=async()=>{},video=(id,patch={})=>({id,name:'Unclassified '+id,folderId:'public',path:id,extension:'mp4',mime:'video/mp4',size:0,addedAt:0,...patch});
const choice=(patch={})=>({seriesId:'anime:original',title:'Moon Runner',release:'1998 original',aliases:['Lunar Runner'],existing:false,numbering:'season',season:1,kind:'episode',episode:1,...patch});
const add=(l,id,episode,patch={})=>confirmAnimeEpisode(l,id,choice({episode,existing:!!l.series['anime:original'],...patch}),100);
const initial=()=>add(add(add(EMPTY_ANIME_REVIEWS,'one',1),'two',2),'four',4);
const owned=(l,marks={},patch={})=>Object.entries(l.episodes).map(([id,review])=>({video:video(id),review,available:true,resume:marks[id],...patch[id]}));
const makeMap=(l,marks={},patch={})=>buildAnimeEpisodeMap(l.series['anime:original'],owned(l,marks,patch));
const scope=videos=>({videos,folders:[{id:'public'}],hiddenVideos:{},unavailable:{},hideDemo:true,tags:{}});
const mark=(t=96,at=100)=>({t,d:100,at});

test('parsed evidence remains a proposal; explicit remakes and sequels have separate opaque identities',()=>{
 const parsed=animeTitleInfo('[Group] Moon Runner - 01 [1080p].mkv');assert.equal(parsed.episode,1);assert.deepEqual(EMPTY_ANIME_REVIEWS.episodes,{});
 let l=add(EMPTY_ANIME_REVIEWS,'old',1);l=add(l,'remake',1,{seriesId:'anime:remake',release:'2024 remake',existing:false});l=add(l,'sequel',1,{seriesId:'anime:sequel',release:'Second story',existing:false});
 assert.equal(Object.keys(l.series).length,3);assert.notEqual(l.episodes.old.seriesId,l.episodes.remake.seriesId);assert.throws(()=>add(l,'collision',2,{existing:false}),/existing identity/);
});
test('explicit identity and aliases survive filename variation without mutating source marks or tags',async()=>{
 const l=add(EMPTY_ANIME_REVIEWS,'one',1),v=video('one',{name:'Different fansub filename 001',duration:1400}),before=structuredClone(v),tags={one:['manual']},progress={one:mark(50)};
 const index=await prepareAnimeCatalog({...scope([v]),animeLedger:l,tags},turn);assert.equal(index.anime[0],v);assert.equal(index.series[0].key,'anime:original');
 assert.deepEqual((await selectAnimeTitles(index,[],'series','lunar runner',tags,turn,{episodeOrder:true})).map(v=>v.id),['one']);assert.deepEqual(v,before);assert.deepEqual(tags,{one:['manual']});assert.equal(progress.one.t,50);
 const renamed=await prepareAnimeCatalog({...scope([{...v,name:'Renamed again'}]),animeLedger:l},turn);assert.equal(renamed.series[0].key,'anime:original');assert.equal(parseAnimeReviews(JSON.parse(JSON.stringify(l))).episodes.one.episode,1);
});
test('reviewed catalogs separate remakes, absolute lanes, regular episodes and specials',async()=>{
 let l=initial();l=add(l,'special',99,{kind:'special'});l=add(l,'ova',1,{kind:'ova'});l=add(l,'absolute',700,{numbering:'absolute',season:0});l=add(l,'remake',1,{seriesId:'anime:remake',release:'2024 remake',existing:false});
 const index=await prepareAnimeCatalog({...scope(Object.keys(l.episodes).map(id=>video(id))),animeLedger:l},turn);assert.equal(index.reviewedGroups.length,2);assert.equal(index.specialCount,2);
 assert.deepEqual((await selectAnimeTitles(index,[],'series','',{},turn,{series:'anime:remake',episodeOrder:true})).map(v=>v.id),['remake']);assert.equal((await selectAnimeTitles(index,[],'specials','',{},turn)).length,2);
});
test('public review eligibility excludes private/hidden/unavailable/live/sample/orphan/unsupported records',async()=>{
 const rows=[video('safe'),video('youtube',{folderId:'yt:missing',remote:{kind:'youtube',youtubeType:'upload'}}),video('private',{folderId:'private'}),video('hidden'),video('unavailable'),video('sample',{isSample:true}),video('orphan',{folderId:'missing'}),video('twitch',{remote:{kind:'twitch'}}),video('live',{remote:{kind:'youtube',live:true}}),video('short',{remote:{kind:'youtube',youtubeType:'short'}})];
 const s={folders:[{id:'public'},{id:'private',adult:true}],hidden:{hidden:true},unavailable:{unavailable:true}},visible=animeReviewVisibility(s);assert.deepEqual(rows.filter(visible).map(v=>v.id),['safe','youtube']);
 let l=EMPTY_ANIME_REVIEWS;for(const v of rows)l=add(l,v.id,1);const index=await prepareAnimeCatalog({...scope(rows),folders:s.folders,hiddenVideos:s.hidden,unavailable:s.unavailable,animeLedger:l},turn);assert.deepEqual(index.reviewedGroups[0].videos.map(v=>v.id),['safe','youtube']);assert.deepEqual(Object.keys(index.animeLedger.episodes),['safe','youtube']);
});
test('episodes 1,2,4 show only the observed gap at 3 and keep duplicate versions in one slot',()=>{
 const l=add(initial(),'two-alt',2),map=makeMap(l),lane=map.lanes[0];assert.equal(lane.start,1);assert.equal(lane.end,4);assert.deepEqual(lane.slots.filter(s=>!s.versions.length).map(s=>s.episode),[3]);assert.equal(lane.slots.find(s=>s.episode===2).versions.length,2);assert.equal(map.numbered.length,3);assert(!lane.slots.some(s=>s.episode===5));
});
test('specials, unnumbered sources and wide absolute numbering do not invent gaps',()=>{
 let l=initial();l=add(l,'special',9999,{kind:'special'});l=add(l,'unresolved',undefined,{kind:'unresolved'});l=add(l,'abs1',1,{numbering:'absolute',season:0});l=add(l,'abs900',900,{numbering:'absolute',season:0});
 const map=makeMap(l),absolute=map.lanes.find(s=>s.numbering==='absolute');assert.equal(map.specials.length,1);assert.equal(map.unresolved.length,1);assert.equal(map.lanes.find(s=>s.numbering==='season').end,4);assert.equal(absolute.unverified,true);assert.equal(absolute.slots.length,0);assert.equal(map.numbered.length,5);
 l=setAnimeRange(l,'anime:original',{numbering:'absolute',season:0,start:895,end:900});const range=makeMap(l).lanes.find(s=>s.numbering==='absolute');assert.equal(range.origin,'entered');assert.equal(range.slots.length,6);assert.equal(range.slots.at(-1).versions.length,1);
});
test('entered ranges are bounded, reversible and never mix season with absolute numbers',()=>{
 let l=initial();const previous=structuredClone(l);l=setAnimeRange(l,'anime:original',{numbering:'season',season:1,start:1,end:6});assert.equal(makeMap(l).lanes[0].end,6);l=undoAnimeReview(l,1);assert.deepEqual(JSON.parse(JSON.stringify(l.series)),previous.series);assert(l.updatedAt>previous.updatedAt);
 assert.throws(()=>setAnimeRange(l,'anime:original',{numbering:'season',season:1,start:1,end:201}),/at most 200/);assert.throws(()=>add(l,'bad',4,{numbering:'absolute',season:1}),/valid episode/);assert.throws(()=>add(l,'bad',undefined),/valid episode/);
 l=setAnimeRange(l,'anime:original',{numbering:'season',season:2,start:1,end:12});assert.equal(makeMap(l).lanes.find(r=>r.season===2).slots.length,12);assert.equal(ANIME_MAP_LIMIT,200);
});
test('completed episode 2 recommends 3 when present; missing 3 explains the explicit skip to 4',()=>{
 let l=initial(),map=makeMap(l,{two:mark()});let next=nextAnimeEpisode(l.series['anime:original'],map);assert.equal(next.version.video.id,'four');assert.equal(next.skip,1);assert.match(next.reason,/1 intervening episode/);assert.equal(next.resume,false);
 l=add(l,'three',3);next=nextAnimeEpisode(l.series['anime:original'],makeMap(l,{two:mark()}));assert.equal(next.version.video.id,'three');assert.equal(next.skip,0);
});
test('incomplete progress resumes its exact version and completion of one cut never advances to an alternate cut',()=>{
 let l=add(initial(),'two-alt',2),marks={two:mark(96,10),'two-alt':mark(50,20)};l=preferAnimeVersion(l,'two',['two','two-alt']);let next=nextAnimeEpisode(l.series['anime:original'],makeMap(l,marks));assert.equal(next.version.video.id,'two-alt');assert.equal(next.resume,true);assert.equal(marks.two.t,96);assert.equal(marks['two-alt'].t,50);
 next=nextAnimeEpisode(l.series['anime:original'],makeMap(l,{two:mark(96,20),'two-alt':mark(50,10)}));assert.equal(next.version.video.id,'four');assert.equal(next.slot.episode,4);
});
test('threshold and next numbering lane are saved choices; specials are opt-in tails and unresolved stays manual',()=>{
 let l=initial();l=add(l,'special',1,{kind:'special'});l=add(l,'ova',2,{kind:'ova'});l=add(l,'unknown',undefined,{kind:'unresolved'});l=add(l,'absolute',800,{numbering:'absolute',season:0});const marks={one:mark(96,1),two:mark(96,2),four:mark(96,3)};
 assert.equal(nextAnimeEpisode(l.series['anime:original'],makeMap(l,marks)).version,undefined);
 l=setAnimePolicy(l,'anime:original',{numbering:'season',threshold:0.95,specials:true});assert.equal(nextAnimeEpisode(l.series['anime:original'],makeMap(l,marks)).version.video.id,'special');
 l=setAnimePolicy(l,'anime:original',{numbering:'season',threshold:1,specials:false});assert.equal(nextAnimeEpisode(l.series['anime:original'],makeMap(l,marks)).version.video.id,'four');assert.equal(nextAnimeEpisode(l.series['anime:original'],makeMap(l,marks)).resume,true);
 l=setAnimePolicy(l,'anime:original',{numbering:'absolute',threshold:0.95,specials:false});assert.equal(nextAnimeEpisode(l.series['anime:original'],makeMap(l,marks)).version.video.id,'absolute');assert.throws(()=>setAnimePolicy(l,'anime:original',{numbering:'season',threshold:0.2,specials:false}),/Invalid reviewed/);
});
test('preferred versions require current availability, remain per-slot and can be undone durably',()=>{
 let l=add(initial(),'four-alt',4);assert.throws(()=>preferAnimeVersion(l,'four-alt',['four']),/available/);l=preferAnimeVersion(l,'four-alt',['four','four-alt']);assert.equal(nextAnimeEpisode(l.series['anime:original'],makeMap(l,{two:mark()})).version.video.id,'four-alt');
 const before=l;l=preferAnimeVersion(l,'four',['four','four-alt']);assert.equal(l.episodes['four-alt'].preferred,false);assert.equal(l.episodes.four.preferred,true);l=undoAnimeReview(l,1);assert.equal(l.episodes['four-alt'].preferred,true);assert.deepEqual(l.episodes,before.episodes);assert.equal(newestAnimeReviews(l,before).updatedAt,l.updatedAt);
 const next=nextAnimeEpisode(l.series['anime:original'],makeMap(l,{two:mark()},{'four-alt':{available:false}}));assert.equal(next.version.video.id,'four');assert.equal(l.episodes['four-alt'].preferred,true,'fallback never rewrites preference');
});
test('unavailable in-progress source asks for reconnection and never silently switches resume to another version',()=>{
 const l=add(initial(),'two-alt',2),next=nextAnimeEpisode(l.series['anime:original'],makeMap(l,{two:mark(50)},{two:{available:false}}));assert.equal(next.version,undefined);assert.match(next.reason,/reconnected/);assert.equal(next.resume,true);
});
test('alias edits and mapping removal are reversible and never merge series or erase progress',()=>{
 let l=initial();l=editAnimeSeries(l,'anime:original',{title:'Moon Runner',release:'1998 original',aliases:['Tsuki Runner','Moonrunner']});assert.equal(l.series['anime:original'].aliases.length,2);const before=l;l=removeAnimeMapping(l,'two');assert(!l.episodes.two);assert(l.series['anime:original']);l=undoAnimeReview(l);assert.deepEqual(l.episodes,before.episodes);assert.equal(removeAnimeMapping(l,'missing'),l);
});
test('strict imports strip unknown private fields and reject bad keys, graphs, limits and unsupported versions',()=>{
 const l=initial(),copy=JSON.parse(JSON.stringify(l));copy.secret='not retained';copy.series['anime:original'].privateLabel='not retained';copy.episodes.one.filename='not retained';const valid=parseAnimeReviews(copy);assert(!('secret'in valid));assert(!('privateLabel'in valid.series['anime:original']));assert(!('filename'in valid.episodes.one));
 for(const patch of [{version:2},{updatedAt:NaN},{series:[]},{episodes:{bad:{...l.episodes.one,seriesId:'anime:missing'}}},{episodes:{bad:{...l.episodes.one,episode:0}}},{episodes:{bad:{...l.episodes.one,numbering:'unknown'}}},{episodes:{['__proto__']:l.episodes.one}},{episodes:Object.fromEntries(Array.from({length:4097},(_,i)=>[String(i),l.episodes.one]))}])assert.throws(()=>parseAnimeReviews({...l,...patch}));
 assert.throws(()=>editAnimeSeries(l,'anime:original',{title:'Valid',release:'Valid',aliases:Array(13).fill('x')}),/Invalid reviewed/);assert.throws(()=>parseAnimeReviews({...l,episodes:{one:{...l.episodes.one,preferred:true},other:{...l.episodes.one,preferred:true}}}),/one preferred/);
});
test('large library review preparation remains cooperative, bounded and cancelable before source reads',async t=>{
 const l=initial(),rows=Array.from({length:100000},(_,i)=>video(String(i))),reviewed=Object.keys(l.episodes).map(id=>video(id));let turns=0;const index=await prepareAnimeCatalog({...scope([...rows,...reviewed]),animeLedger:l},async()=>{turns++;});assert.equal(index.anime.length,3);assert.equal(index.reviewedGroups.length,1);assert(turns>100);assert.equal(index.reviewedGroups[0].videos.length,3);t.diagnostic(`100,003 source rows prepared across ${turns} boundaries with 3 reviewed bindings`);
 let reads=0;const proxy=new Proxy(rows,{get(target,prop){if(/^\d+$/.test(String(prop)))reads++;return Reflect.get(target,prop);}});await assert.rejects(()=>prepareAnimeCatalog({...scope(proxy),animeLedger:l},async()=>{throw Error('cancelled');}),/cancelled/);assert.equal(reads,0);
});
