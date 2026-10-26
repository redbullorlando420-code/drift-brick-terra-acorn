import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c)}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {movieEvidence,animeEvidence}=await import('../src/lib/videos/content-classification.ts');
const {answerGuideQuery}=await import('../src/lib/videos/guide-picks.ts');
const {selectTopicCatalog}=await import('../src/lib/videos/topic-catalog.ts');
const {readTwitchLiveBatch}=await import('../src/lib/remote/twitch-live-batch.ts');
const {mergeRemoteRefresh}=await import('../src/lib/videos/remote-merge.ts');
const video=(id,name=id,extra={})=>({id,name,folderId:'public',path:id,mime:'video/mp4',extension:'mp4',duration:5400,size:0,addedAt:1,...extra});
const base=videos=>({videos,tags:{},favorites:{},likes:{},history:[],folders:[{id:'public'},{id:'private',adult:true}],hidden:{},unavailable:{}});
test('Movies requires duration over ten minutes and actual film evidence',()=>{
 for(const row of [video('short','Full movie',{duration:600}),video('unknown','Full movie',{duration:undefined}),video('game','Full movie gameplay'),video('trailer','Movie trailer',{duration:900}),video('generic','Unrelated long video'),video('ep','A series S01E02',{year:2020}),video('vlog','Travel vlog 2025',{year:2025}),video('live','Full movie',{remote:{kind:'twitch',live:true}})])assert.equal(movieEvidence(row),undefined,row.name);
 assert.ok(movieEvidence(video('film','A film (2020)',{year:2020})));
 assert.ok(movieEvidence(video('saved','Unusual title',{duration:601}),['movie']));
 assert.ok(movieEvidence(video('yt','A complete full movie',{remote:{kind:'youtube'}})));
});
test('Anime requires content evidence and rejects topic mentions, games and commentary',()=>{
 for(const row of [video('1','Naruto gameplay'),video('2','Anime reaction review'),video('3','Unrelated vlog',{description:'Anime discussion'}),video('4','Manga chapter review'),video('5','Anime soundtrack')])assert.equal(animeEvidence(row,['anime']),undefined,row.name);
 assert.ok(animeEvidence(video('a','Naruto S01E03')));assert.ok(animeEvidence(video('b','Frieren episode 1')));assert.ok(animeEvidence(video('c','Anime movie')));
 assert.equal(animeEvidence(video('d','Daily life'),['anime'],{tags:{anime:'provider:youtube'}}),undefined);
 assert.ok(animeEvidence(video('d','Daily life'),['anime'],{tags:{anime:'manual'},lockedFields:['tags']}));
});
test('Guide searches the full catalog tail by title and saved tags with explicit evidence',async()=>{
 const rows=Array.from({length:6000},(_,i)=>video('v'+i,'Ordinary '+i));rows.push(video('tail','Retro arcade racing'));
 const input={...base(rows),tags:{tail:['keyword-strategy']}};
 const reply=await answerGuideQuery(input,'Show me retro racing strategy',1,Date.now(),async()=>{});
 assert.deepEqual(reply.picks.map(v=>v.id),['tail']);assert.deepEqual(reply.explanations.tail.reasons.map(reason=>[reason.kind,reason.quote]),[['title','Retro arcade racing'],['title','Retro arcade racing'],['saved-tag','keyword-strategy']]);assert.match(reply.reasons.tail,/keyword-strategy/);
 const empty=await answerGuideQuery(input,'completelymissing',1,Date.now(),async()=>{});assert.equal(empty.picks.length,0);assert.match(empty.text,/No eligible public titles or saved tags/);
});
test('Guide isolates private, hidden, unavailable and Adult titles and supports racing topics',async()=>{
 const rows=[video('yes','iRacing Arcade setup'),video('private','iRacing Arcade',{folderId:'private'}),video('hidden','iRacing'),video('gone','iRacing'),video('adult','iRacing',{remote:{kind:'eporner'}})];
 const input={...base(rows),hidden:{hidden:true},unavailable:{gone:true}};
 assert.deepEqual((await answerGuideQuery(input,'racing',1,Date.now(),async()=>{})).picks.map(v=>v.id),['yes']);
});
test('Guide live questions honor provider, freshness and cancellation',async()=>{
 const now=Date.now(),rows=[video('fresh','Racing',{remote:{kind:'twitch',live:true,observedAt:now}}),video('stale','Racing',{remote:{kind:'twitch',live:true,observedAt:1}}),video('youtube','Racing',{remote:{kind:'youtube',live:true,observedAt:now}})];
 assert.deepEqual((await answerGuideQuery(base(rows),'Who is live on Twitch?',1,now,async()=>{})).picks.map(v=>v.id),['fresh']);
 await assert.rejects(answerGuideQuery(base(rows),'racing',1,now,async()=>{throw Error('cancelled');}),/cancelled/);
});
test('Topic Explorer combines text, selected topic, evidence, provider and stable sort',async()=>{
 const rows=[video('b','Physics café',{remote:{kind:'youtube',channelName:'Ada'}}),video('a','Physics lesson',{remote:{kind:'youtube',channelName:'Ada'}}),video('local','Physics lesson')];
 const input={...base(rows),hiddenVideos:{},hideDemo:true,tags:{a:['science','custom-mark']}};
 const taste={score:()=>0,liked:()=>false};
 assert.deepEqual((await selectTopicCatalog(input,'science',undefined,'youtube',taste,async()=>{},{text:'ada',sort:'title',evidence:'saved'})).videos.map(v=>v.id),['a']);
 assert.deepEqual((await selectTopicCatalog(input,'science',undefined,'youtube',taste,async()=>{},{text:'cafe',evidence:'inferred'})).videos.map(v=>v.id),['b']);
 assert.deepEqual((await selectTopicCatalog(input,undefined,undefined,'all',taste,async()=>{},{text:'custom mark'})).videos.map(v=>v.id),['a']);
});
test('Twitch live batches make at most twelve aliases per request and isolate field failures',async()=>{
 let calls=0;const found=await readTwitchLiveBatch(Array.from({length:30},(_,i)=>'creator_'+i),async(query,variables)=>{calls++;assert.ok(Object.keys(variables).length<=12);assert.ok(!query.includes('videos('));return {data:Object.fromEntries(Object.keys(variables).map((key,i)=>['c'+i,{id:key,stream:null}])),...(calls===1?{errors:[{message:'One field failed',path:['c3','stream']}]}:{})};});
 assert.equal(calls,3);assert.equal(found.size,30);assert.ok(found.get('creator_3').error);assert.ok(found.get('creator_4').user);assert.ok(found.get('creator_29').user);
});
test('older offline responses cannot retire a newer live observation',()=>{
 const old=video('tw:live','Still streaming',{folderId:'tw:channel',remote:{kind:'twitch',live:true,observedAt:5000}});
 const retained=mergeRemoteRefresh([old],[],['tw:channel'],new Set(),{liveCheckedIds:['tw:channel'],liveCheckedAt:{'tw:channel':4000}});assert.equal(retained[0].remote.live,true);
 const ended=mergeRemoteRefresh([old],[],['tw:channel'],new Set(),{liveCheckedIds:['tw:channel'],liveCheckedAt:{'tw:channel':6000}});assert.equal(ended[0].remote.live,false);
});
