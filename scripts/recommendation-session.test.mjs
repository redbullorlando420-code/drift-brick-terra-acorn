import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_RECOMMENDATION_SESSION as defaults,normalizeRecommendationSession,sessionAllows,sessionPreferenceAdjustment,createSessionPicks} from '../src/lib/videos/recommendation-session.ts';
import {createRecommendationSessionStore} from '../src/lib/recommendation-session.ts';
import {prepareGuide,answerGuideQuery} from '../src/lib/videos/guide-picks.ts';
const now=1800000000000,turn=async()=>{},tune=extra=>({...defaults,...extra});
const video=(id,source='youtube',extra={})=>({id,name:'Common lesson '+id,folderId:'public',path:id,mime:'video/mp4',extension:'mp4',size:0,addedAt:now,duration:1200,...(source==='local'?{}:{remote:{kind:source,videoId:id,channelName:'Creator '+id,observedAt:now}}),...extra});
const input=(videos,extra={})=>({videos,tags:{},favorites:{},likes:{},history:[],folders:[{id:'public'},{id:'private',adult:true}],...extra});
test('session defaults are immutable, normalized and isolated from all saved taste fields',()=>{
 assert.equal(normalizeRecommendationSession({familiarity:'bad',length:'bad',sources:'bad'}),defaults);assert(Object.isFrozen(defaults));
 const store=createRecommendationSessionStore();let events=0;const stop=store.subscribe(()=>events++);const before=store.getSnapshot();assert.equal(store.apply({...defaults}),false);assert.equal(events,0);
 assert.equal(store.apply(tune({familiarity:'explore',length:'short',sources:'balanced'})),true);assert.equal(events,1);assert(Object.isFrozen(store.getSnapshot()));assert.notEqual(store.getSnapshot(),before);
 assert.equal(store.apply({...store.getSnapshot()}),false);assert.equal(events,1);assert.equal(createRecommendationSessionStore().getSnapshot(),defaults);assert.equal(store.reset(),true);assert.equal(store.getSnapshot(),defaults);assert.equal(events,2);stop();store.apply(tune({length:'long'}));assert.equal(events,2);
 assert.deepEqual(Object.keys(store.getSnapshot()).sort(),['familiarity','length','sources']);
});
test('recording length boundaries, unknown duration and exact sources have explicit semantics',()=>{
 const rows=[0,undefined,NaN,Infinity,-1,1,600,600.01,3600,3600.01].map((duration,i)=>video('length'+i,'youtube',{duration}));
 assert.equal(rows.filter(v=>sessionAllows(v,defaults)).length,10);
 assert.deepEqual(rows.filter(v=>sessionAllows(v,tune({length:'short'}))).map(v=>v.duration),[1,600]);
 assert.deepEqual(rows.filter(v=>sessionAllows(v,tune({length:'medium'}))).map(v=>v.duration),[600.01,3600]);
 assert.deepEqual(rows.filter(v=>sessionAllows(v,tune({length:'long'}))).map(v=>v.duration),[3600.01]);
 assert(sessionAllows(video('live','twitch',{duration:undefined}),tune({length:'long',sources:'twitch'}),true));assert(!sessionAllows(video('live','twitch'),tune({sources:'local'}),true));
 for(const source of ['youtube','twitch','local'])assert.deepEqual(['youtube','twitch','local'].filter(s=>sessionAllows(video(s,s),tune({sources:source}))),[source]);
});
test('familiar/explore change preference ordering without changing favorites, history, tags or explicit feedback',async()=>{
 const rows=[video('origin','youtube',{name:'Saved reference'}),video('familiar','twitch'),video('outside','local')],base=input(rows,{favorites:{origin:true},tags:{origin:['science'],familiar:['science'],outside:['gaming']},history:[{id:'origin'}],recommendationRejections:{version:1,updatedAt:0,entries:[]}}),before=JSON.stringify(base);
 for(const familiarity of ['familiar','explore']){
  const session=tune({familiarity}),result=await prepareGuide({...base,session},1,now,turn);assert.equal(result.picks[0].id,familiarity==='familiar'?'familiar':'outside');assert.equal(result.candidateCount,2);
  const query=await answerGuideQuery({...base,session},'common',1,now,turn);assert.equal(query.picks[0].id,familiarity==='familiar'?'familiar':'outside');
 }
 for(const familiarity of ['familiar','explore']){
  const rejected={...base,session:tune({familiarity}),recommendationRejections:{version:1,updatedAt:now,entries:[{scope:'title',target:'twitch:familiar',label:'Familiar',at:now}]}};
  const reduced=await prepareGuide(rejected,1,now,turn);assert.equal(reduced.picks[0].id,'outside');assert.match(reduced.explanations.familiar.notices.join(' '),/lowers this title/);
  const protectedResult=await prepareGuide({...rejected,favorites:{...base.favorites,familiar:true}},1,now,turn);assert.match(protectedResult.explanations.familiar.notices.join(' '),/favorite protects/);
 }
 assert.equal(JSON.stringify(base),before);assert.equal(sessionPreferenceAdjustment(80,tune({familiarity:'explore'})),-160);assert.equal(sessionPreferenceAdjustment(80,tune({familiarity:'familiar'})),24);
});
test('filtering to Twitch retains legitimate cross-source saved-content affinity',async()=>{
 const result=await prepareGuide(input([video('reference','youtube'),video('related','twitch'),video('outsider','twitch')],{favorites:{reference:true},tags:{reference:['science'],related:['science']},session:tune({sources:'twitch',familiarity:'familiar'})}),1,now,turn);
 assert.deepEqual(result.picks.map(v=>v.id),['related','outsider']);assert.equal(result.publicCount,3);assert.equal(result.candidateCount,2);assert.equal(result.explanations.related.reasons[0].origin.id,'reference');
});
test('balanced selection scans the full corpus, retains bounded source pools and fills missing source slots',async()=>{
 const rows=[...Array.from({length:100000},(_,i)=>video('dominant'+i)),...Array.from({length:12},(_,i)=>video('local'+i,'local')),...Array.from({length:12},(_,i)=>video('twitch'+i,'twitch'))],base=input(rows,{session:tune({sources:'balanced'})});
 const original=Array.prototype.sort;Array.prototype.sort=function(compare){assert(this.length<=12,'unbounded native sort');return original.call(this,compare);};let result,turns=0;
 try{result=await prepareGuide(base,1,now,async()=>{turns++;});}finally{Array.prototype.sort=original;}
 assert.equal(result.picks.length,12);assert.equal(Object.keys(result.explanations).length,12);assert.equal(result.candidateCount,100024);assert.ok(turns>300);for(const source of ['youtube','twitch','local'])assert.equal(result.picks.filter(v=>(v.remote?.kind??'local')===source).length,4);
 for(const count of [0,1,12]){const select=createSessionPicks(12,(a,b)=>a.score-b.score,row=>row.video,tune({sources:'balanced'}));for(let i=0;i<20;i++)select.add({video:video('y'+i),score:i});for(let i=0;i<count;i++)select.add({video:video('t'+i,'twitch'),score:i});const selected=select.finish();assert.equal(selected.length,12);assert.equal(selected.filter(r=>r.video.remote.kind==='twitch').length,Math.min(count,6));}
});
test('queries honor length/source constraints and never silently override a contradictory provider request',async()=>{
 const base=input([video('youtube'),video('twitch','twitch'),video('long','youtube',{duration:4000}),video('unknown','youtube',{duration:undefined})],{session:tune({sources:'twitch',length:'medium'})});
 assert.deepEqual((await answerGuideQuery(base,'common',1,now,turn)).picks.map(v=>v.id),['twitch']);const conflict=await answerGuideQuery(base,'YouTube common',1,now,turn);assert.deepEqual(conflict.picks,[]);assert.match(conflict.text,/reset the Guide session/);
 assert.deepEqual((await answerGuideQuery({...base,session:tune({length:'long'})},'common',1,now,turn)).picks.map(v=>v.id),['long']);
});
test('private/hidden/orphan signals stay excluded in every mode; live questions retain strict freshness',async()=>{
 const rows=[video('public'),video('secret','local',{folderId:'private'}),video('hidden'),video('stale','twitch',{remote:{kind:'twitch',live:true,observedAt:1}}),video('live','twitch',{duration:undefined,remote:{kind:'twitch',live:true,observedAt:now}})],base=input(rows,{favorites:{secret:true,hidden:true,orphan:true},tags:{secret:['science'],public:['science']},hidden:{hidden:true}});
 for(const familiarity of ['balanced','familiar','explore']){const result=await prepareGuide({...base,session:tune({familiarity})},1,now,turn);assert.deepEqual(result.picks.map(v=>v.id),['public']);assert.equal(result.explanations.public.basis,'discovery');}
 const live=await answerGuideQuery({...base,session:tune({sources:'twitch',length:'long'})},'live',1,now,turn);assert.deepEqual(live.picks.map(v=>v.id),['live']);assert.deepEqual((await answerGuideQuery({...base,session:tune({sources:'local'})},'live',1,now,turn)).picks,[]);
});
test('a cancelled session replacement reads no discarded catalog and cancellation also stops affinity preparation',async()=>{
 let reads=0;const row={...video('cancel'),get id(){reads++;return 'cancel';}},base=input([row],{session:tune({sources:'balanced',familiarity:'explore'})});
 for(const run of [()=>prepareGuide(base,1,now,async()=>{throw Error('replaced');}),()=>answerGuideQuery(base,'common',1,now,async()=>{throw Error('replaced');})])await assert.rejects(run,/replaced/);assert.equal(reads,0);
 let turns=0;await assert.rejects(answerGuideQuery(input(Array.from({length:5000},(_,i)=>video('cancel'+i)),{session:tune({familiarity:'familiar'})}),'common',1,now,async()=>{if(++turns===3)throw Error('cancel affinity');}),/cancel affinity/);assert.equal(turns,3);
});

test('prepared topic alternatives and live lists respect the selected source; empty filtered mixes explain recovery',async()=>{
 const base=input([video('yt','youtube'),video('local','local'),video('live','twitch',{remote:{kind:'twitch',live:true,observedAt:now}})],{tags:{yt:['science'],local:['gaming']},session:tune({sources:'local'})});
 const result=await prepareGuide(base,1,now,turn);assert.equal(result.live.length,0);assert(result.topics.some(r=>r.topic==='gaming'));assert(!result.topics.some(r=>r.topic==='science'));
 const empty=await answerGuideQuery({...base,session:tune({sources:'local',length:'long'})},'What should I watch?',1,now,turn);assert.deepEqual(empty.picks,[]);assert.match(empty.text,/reset the Guide session/);assert(!empty.text.includes('Add a few public titles'));
});
