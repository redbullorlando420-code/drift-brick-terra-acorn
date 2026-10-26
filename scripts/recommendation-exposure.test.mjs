import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const e=await import('../src/lib/videos/recommendation-exposure.ts');
const {createExposureDwell}=await import('../src/lib/recommendation-exposure-dwell.ts');
const {createMeaningfulVisibility}=await import('../src/lib/card-visibility.ts');
const {rankYoutubeRecommendations}=await import('../src/lib/remote/youtube-recommendations.ts');
const {createYoutubeRankingProcessor}=await import('../src/lib/remote/youtube-ranking-protocol.ts');
const {prepareTwitchRecommendationScore}=await import('../src/lib/videos/twitch-recommendations.ts');
const {prepareGuide,answerGuideQuery}=await import('../src/lib/videos/guide-picks.ts');
const {rankPreview}=await import('../src/lib/videos/preview-ranking.ts');
const {describeRoomMedia}=await import('../src/lib/multiplayer/room-media.ts');
const {buildRoomSessionFile}=await import('../src/lib/multiplayer/room-session-file.ts');
const now=1768478400000,day=86400000,turn=async()=>{};
const video=id=>({id,name:'Racing lesson '+id,path:'',extension:'yt',mime:'video/youtube',size:0,folderId:'yt:creator',genre:'racing',addedAt:now-day,remote:{kind:'youtube',videoId:id,channelId:'creator',channelName:'Creator',youtubeType:'upload',publishedSource:'provider',publishedPrecision:'instant'}});
const a=video('aaaaaaaaaaa'),b=video('bbbbbbbbbbb'),c=video('ccccccccccc');
const ledger=(count=4,at=now)=>({version:1,updatedAt:at,entries:[{key:e.exposureKey(a),count,at}]});
const taste=exposure=>({recommendationExposure:exposure,tags:{},favorites:{},likes:{},history:[],viewCounts:{},ratingOf:()=>0,tagIsLiked:()=>false,tagHasHeartHistory:()=>false,ratingPreference:()=>0,watchScore:()=>0,creatorIsLiked:()=>false,creatorRating:()=>0,now,limit:10,shuffle:()=>0});
test('exposure imports reject unsupported/malformed/future rows, cap counts and expire old observations',()=>{
 for(const value of [null,{}, {version:2,updatedAt:now,entries:[]},{version:1,updatedAt:NaN,entries:[]}])assert.deepEqual(e.normalizeExposure(value,now),e.EMPTY_EXPOSURE);
 assert.equal(e.normalizeExposure(ledger(900),now).entries[0].count,8);
 assert.equal(e.normalizeExposure(ledger(2,now+1),now).entries.length,0);
 assert.equal(e.normalizeExposure(ledger(2,now-e.EXPOSURE_TTL_MS),now).entries.length,0);
 assert.equal(e.normalizeExposure({...ledger(),entries:[{key:'',count:1,at:now},{key:'x',count:1.5,at:now}]},now).entries.length,0);
});
test('repeated shelves count at most once per 30 minutes, with bounded count and transparent seven-day half life',()=>{
 const initial=e.applyExposureEvents(e.EMPTY_EXPOSURE,[{key:e.exposureKey(a),at:now}],now);
 assert.equal(initial.entries[0].count,1);assert.equal(e.applyExposureEvents(initial,[{key:e.exposureKey(a),at:now+1999}],now+1999),initial);
 const second=e.applyExposureEvents(initial,[{key:e.exposureKey(a),at:now+e.EXPOSURE_COOLDOWN_MS}],now+e.EXPOSURE_COOLDOWN_MS);assert.equal(second.entries[0].count,2);
 assert.equal(e.createExposurePenalty(ledger(),now)(a),12);assert.equal(e.createExposurePenalty(ledger(),now+7*day)(a),6);assert.equal(e.createExposurePenalty(ledger(),now+30*day)(a),0);
 assert.equal(e.createExposurePenalty(ledger(8),now)(a),18);
});
test('long browsing retains only 2,048 recent identities and never builds a catalog-sized impression graph',()=>{
 let state=e.EMPTY_EXPOSURE;
 for(let start=0;start<10000;start+=256){const time=now+start;state=e.applyExposureEvents(state,Array.from({length:256},(_,i)=>({key:'local:'+String(start+i),at:time})),time);assert(state.entries.length<=2048);}
 assert.equal(state.entries.length,2048);assert(!state.entries.some(row=>row.key==='local:0'));assert(state.entries.some(row=>row.key==='local:10000'));
});
test('canonical identity matches aliases; favorite, like, creator favorite and new high rating all bypass novelty reduction',()=>{
 const penalty=e.createExposurePenalty(ledger(),now);assert.equal(penalty({...a,id:'alias'}),12);assert.equal(penalty(b),0);
 for(const positive of [{favorite:true},{liked:true},{creatorFavorite:true},{rating:4},{rating:5}])assert.equal(penalty(a,positive),0);
 assert.equal(penalty(a,{rating:3}),12);
});
test('opening and reset recover original ranking inputs and whole-ledger timestamps prevent stale mirror resurrection',()=>{
 const cleared=e.clearExposure(ledger(),e.exposureKey(a),now);assert.deepEqual(cleared.entries,[]);assert(cleared.updatedAt>ledger().updatedAt);
 assert.deepEqual(e.newestExposure(ledger(),cleared,now),cleared);assert.deepEqual(e.newestExposure(cleared,ledger(),now),cleared);
 assert.deepEqual(rankYoutubeRecommendations([a,b,c],taste(cleared)),rankYoutubeRecommendations([a,b,c],taste(e.EMPTY_EXPOSURE)));
});
test('real YouTube ranking and its worker reduce unopened repeats without removing them or overriding favorites',()=>{
 const before=rankYoutubeRecommendations([a,b,c],taste(e.EMPTY_EXPOSURE)),after=rankYoutubeRecommendations([a,b,c],taste(ledger()));assert.equal(before[0].id,a.id);assert.equal(after.at(-1).id,a.id);assert.equal(after.length,3);
 const liked=taste(ledger());liked.favorites[a.id]=true;assert.equal(rankYoutubeRecommendations([a,b,c],liked)[0].id,a.id);
 const outputs=[],process=createYoutubeRankingProcessor(ids=>outputs.push(ids));process({type:'reset',recommendationExposure:ledger(),now,creatorLikes:{},creatorFavorites:{},creatorRatings:{},heartedTags:[],historicTags:[]});process({type:'append',rows:[a,b,c].map(video=>({video,tags:[],rating:0,favorite:false,liked:false,marks:0,watch:0,plays:0}))});process({type:'candidates',ids:[a.id,b.id,c.id]});process({type:'ready'});assert.equal(outputs.at(-1).at(-1),a.id);
});
test('Twitch VOD and Guide scores apply exposure independently from title ratings and explicit rejection evidence',async()=>{
 const rows=[a,b,c].map(v=>({...v,remote:{...v.remote,kind:'twitch'}})),exposure={...ledger(),entries:[{...ledger().entries[0],key:e.exposureKey(rows[0])}]};
 const input={tags:{},favorites:{},likes:{},viewCounts:{},rating:()=>0,watchScore:()=>0,now};const baseline=await prepareTwitchRecommendationScore(rows,input,undefined,turn),changed=await prepareTwitchRecommendationScore(rows,{...input,recommendationExposure:exposure},undefined,turn);assert.equal(changed(rows[0]),baseline(rows[0])-12);assert.equal(changed(rows[1]),baseline(rows[1]));
 const guide={videos:[a,b,c],tags:{},favorites:{},likes:{},history:[],recommendationExposure:ledger()};assert.equal((await prepareGuide(guide,417,now,turn)).picks.at(-1).id,a.id);assert.equal((await answerGuideQuery(guide,'racing',417,now,turn)).picks.at(-1).id,a.id);assert.equal((await prepareGuide({...guide,favorites:{[a.id]:true}},417,now,turn)).picks[0].id,a.id);
});
test('preview penalties stay soft and public; private/adult recommendation order and taste training remain unchanged',()=>{
 const row=(id,exposurePenalty=0)=>({id,folderId:'same',kind:'youtube',creator:'same',tags:['racing'],rating:0,creatorRating:0,creatorLiked:false,live:false,eligible:true,exposurePenalty});
 const rows=[row('target'),row('candidate-a'),row('candidate-b')],before=rankPreview(rows,'target',0,[]),after=rankPreview([rows[0],row('candidate-a',18),rows[2]],'target',0,[]);assert(after.related.indexOf('candidate-b')<before.related.indexOf('candidate-b'));assert.deepEqual(before.tagScores,after.tagScores);
 const privateRows=rows.map(row=>({...row,adult:true}));assert.deepEqual(rankPreview(privateRows,'target',0,[]),rankPreview(privateRows.map(row=>({...row,exposurePenalty:18})),'target',0,[]));
});
function clock(){let at=0;const tasks=new Map();return {schedule(fn,delay){const key={};tasks.set(key,{fn,at:at+delay});return ()=>tasks.delete(key);},advance(ms){at+=ms;for(const [key,task]of [...tasks])if(task.at<=at){tasks.delete(key);task.fn();}},get size(){return tasks.size;}};}
test('offscreen and quickly skipped cards never count; blur/context changes require a fresh continuous two seconds',()=>{
 const timer=clock(),seen=[],engine=createExposureDwell({schedule:timer.schedule,record:key=>seen.push(key),eligible:()=>true}),element={};const item=engine.observe(element,'one','browse');engine.state(true,'browse');timer.advance(5000);assert.deepEqual(seen,[]);
 item.visible(true);timer.advance(1999);item.visible(false);timer.advance(5000);assert.deepEqual(seen,[]);item.visible(true);timer.advance(1000);engine.state(false,'browse');timer.advance(5000);engine.state(true,'browse');timer.advance(1999);assert.deepEqual(seen,[]);timer.advance(1);assert.deepEqual(seen,['one']);
 const preview=engine.observe({},'preview','preview');preview.visible(true);timer.advance(3000);assert.deepEqual(seen,['one']);engine.state(true,'preview');timer.advance(2000);assert.deepEqual(seen,['one','preview']);engine.dispose();assert.equal(timer.size,0);
});
test('occlusion, unmount and stale callbacks cannot create impressions; dwell rows and timers are bounded',()=>{
 const timer=clock(),seen=[],engine=createExposureDwell({schedule:timer.schedule,record:key=>seen.push(key),eligible:()=>false});engine.state(true,'browse');const item=engine.observe({},'covered','browse');item.visible(true);timer.advance(2000);assert.equal(seen.length,0);item.stop();item.visible(true);timer.advance(3000);assert.equal(seen.length,0);
 for(let i=0;i<3000;i++)engine.observe({},'key:'+i,'browse');assert.equal(engine.snapshot().observed,1024);engine.dispose();assert.equal(engine.snapshot().observed,0);
});
test('one shared meaningful-visibility observer requires half of each card, releases nodes and rejects stale generations',()=>{
 const observers=[],tracker=createMeaningfulVisibility((notify,options)=>{const observer={notify,options,nodes:new Set(),observe(el){this.nodes.add(el);},unobserve(el){this.nodes.delete(el);},disconnect(){this.nodes.clear();}};observers.push(observer);return observer;}),a={},b={},values=[];const stop=tracker.observe(a,v=>values.push(v)),stopB=tracker.observe(b,v=>values.push(v));assert.equal(observers.length,1);assert.deepEqual(observers[0].options.threshold,[0,0.5]);
 observers[0].notify([{target:a,isIntersecting:true,intersectionRatio:0.49}]);assert.deepEqual(values,[]);observers[0].notify([{target:a,isIntersecting:true,intersectionRatio:0.5}]);assert.deepEqual(values,[true]);observers[0].notify([{target:a,isIntersecting:false,intersectionRatio:0}]);assert.deepEqual(values,[true,false]);stop();stopB();assert.equal(tracker.snapshot().observed,0);tracker.observe(a,v=>values.push(v));observers[0].notify([{target:a,isIntersecting:true,intersectionRatio:1}]);assert.deepEqual(values,[true,false]);tracker.dispose();
});
test('public room descriptors and session files omit all exposure evidence',()=>{
 const polluted={...a,recommendationExposure:ledger(),remote:{...a.remote,recommendationExposure:ledger()}};
 for(const value of [describeRoomMedia(polluted),buildRoomSessionFile({played:[],current:polluted,upcoming:[]})]){const json=JSON.stringify(value);assert(!json.includes('recommendationExposure'));assert(!json.includes('updatedAt'));assert(!json.includes('count'));}
});
