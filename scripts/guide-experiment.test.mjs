import {test} from 'node:test';
import assert from 'node:assert/strict';
import {captureGuideReplay,compareGuideReplay,normalizeGuideReplay,REPLAY_LIMIT} from '../src/lib/videos/guide-experiment.ts';
import {DEFAULT_GUIDE_WEIGHTS,EMPTY_GUIDE_PRESET,changeGuidePreset,rollbackGuidePreset,newestGuidePreset,normalizeGuidePreset,guideWeights,guidePersonalScore,isGuideWeights} from '../src/lib/videos/guide-preset.ts';
import {prepareGuide,answerGuideQuery} from '../src/lib/videos/guide-picks.ts';
const now=1800000000000,turn=async()=>{},video=(id,source='youtube',extra={})=>({id,name:'Science SECRET-TITLE '+id,folderId:'public',path:'SECRET-PATH/'+id,extension:'mp4',mime:'video/mp4',size:0,duration:1200,addedAt:now,...(source==='local'?{}:{remote:{kind:source,videoId:id,channelId:'SECRET-CREATOR-'+id,channelName:'Secret creator'}}),...extra});
const input=(videos,extra={})=>({videos,tags:{},favorites:{},likes:{},history:[],folders:[{id:'public'},{id:'private',adult:true}],...extra});
const weights={favorite:8,like:0,topic:0};
test('preset bounds are strict and normalized ledgers strip extra fields and retain frozen previous choices',()=>{
 for(const w of [{favorite:-1,like:2,topic:1},{favorite:9,like:2,topic:1},{favorite:3,like:2,topic:4},{favorite:NaN,like:2,topic:1},{favorite:3.5,like:2,topic:1}]){assert(!isGuideWeights(w));assert.throws(()=>changeGuidePreset(EMPTY_GUIDE_PRESET,w),/Invalid/);}
 const saved=changeGuidePreset(EMPTY_GUIDE_PRESET,{...weights,title:'SECRET'},now);assert.deepEqual(saved.current,weights);assert.deepEqual(saved.previous,DEFAULT_GUIDE_WEIGHTS);assert(Object.isFrozen(saved.current));assert.equal(changeGuidePreset(saved,weights),saved);assert.deepEqual(normalizeGuidePreset({...saved,version:2}),EMPTY_GUIDE_PRESET);assert.deepEqual(guideWeights(null),DEFAULT_GUIDE_WEIGHTS);
});
test('rollback swaps presets durably and newer timestamps prevent old recovery from resurrecting acceptance',()=>{
 const a=changeGuidePreset(EMPTY_GUIDE_PRESET,weights,now),b=rollbackGuidePreset(a,now+1);assert.deepEqual(b.current,DEFAULT_GUIDE_WEIGHTS);assert.deepEqual(b.previous,weights);assert.deepEqual(newestGuidePreset(a,b),b);assert.deepEqual(newestGuidePreset(b,a),b);assert.equal(rollbackGuidePreset(EMPTY_GUIDE_PRESET),EMPTY_GUIDE_PRESET);assert.deepEqual(rollbackGuidePreset(b,now+2).current,weights);
});
test('shared scoring preserves rejection and exposure deductions under every positive preset and session style',()=>{
 const bits={favorite:true,like:true,topics:3,penalty:40,exposure:12};for(const familiarity of ['balanced','familiar','explore']){const session={familiarity,length:'any',sources:'all'},plain=guidePersonalScore({...bits,penalty:0,exposure:0},weights,session);assert.equal(guidePersonalScore(bits,weights,session),plain-52);}
});
test('a complete small snapshot reproduces the actual default Guide order and retained signals are immutable',async()=>{
 const rows=Array.from({length:30},(_,i)=>video('v'+i,i%2?'youtube':'twitch')),base=input(rows,{favorites:{v1:true},likes:{v2:true},tags:{v1:['science'],v2:['science'],v3:['science']},history:[{id:'v0'}]}),before=JSON.stringify(base),snap=await captureGuideReplay(base,123,now,turn),actual=await prepareGuide(base,123,now,turn),replay=compareGuideReplay(snap,DEFAULT_GUIDE_WEIGHTS);
 assert.equal(snap.candidates.length,29);const keyed=rows.filter(row=>row.id!=='v0');assert.deepEqual(replay.current.map(r=>keyed[r.candidate-1].id),actual.picks.map(v=>v.id));assert.equal(JSON.stringify(base),before);assert(Object.isFrozen(snap)&&Object.isFrozen(snap.candidates)&&Object.isFrozen(snap.candidates[0]));assert.throws(()=>{snap.candidates[0].topics=50;},TypeError);
});
test('current versus proposed weights change actual runtime ordering and explain exact score deltas',async()=>{
 const rows=Array.from({length:20},(_,i)=>video('v'+i)),base=input(rows,{favorites:{v0:true},likes:{v1:true,v2:true},tags:{v1:['science'],v2:['science'],v3:['science'],v4:['science']}}),snap=await captureGuideReplay(base,5,now,turn),result=compareGuideReplay(snap,weights),actual=await prepareGuide({...base,weights},5,now,turn);
 assert.deepEqual(result.next.map(r=>rows[r.candidate-1].id),actual.picks.map(v=>v.id));assert.equal(actual.picks[0].id,'v0');assert(result.changes.length);for(const row of result.changes)assert.equal(row.after-row.before,row.favoriteDelta+row.likeDelta+row.topicDelta+row.sessionDelta);assert.deepEqual(compareGuideReplay(normalizeGuideReplay(JSON.parse(JSON.stringify(snap))),weights),result);
});
test('positive weights also apply to query preferences while explicit relevance and source/length rules stay active',async()=>{
 const rows=[video('favorite'),video('liked'),video('other','twitch'),video('short','youtube',{duration:30})],base=input(rows,{favorites:{favorite:true},likes:{liked:true},weights,session:{length:'medium',sources:'youtube'}}),result=await answerGuideQuery(base,'science',1,now,turn);assert.deepEqual(new Set(result.picks.map(v=>v.id)),new Set(['favorite','liked']));assert.equal(result.picks[0].id,'favorite');
});
test('capture excludes adult/private/hidden/unavailable/orphan/sample/live/history and applies actual session eligibility',async()=>{
 const rows=[video('ok'),video('private','local',{folderId:'private'}),video('adult','redtube'),video('hidden'),video('gone'),video('sample','youtube',{isSample:true}),video('orphan','local',{folderId:'unknown'}),video('live','youtube',{remote:{kind:'youtube',videoId:'live',live:true}}),video('watched'),video('short','youtube',{duration:10})],snap=await captureGuideReplay(input(rows,{hidden:{hidden:true},unavailable:{gone:true},history:[{id:'watched'}],session:{length:'medium'}}),1,now,turn);assert.equal(snap.eligible,1);assert.equal(snap.candidates.length,1);assert(!JSON.stringify(snap).includes('SECRET'));
});
test('anonymous capsules allowlist numeric evidence and reject bad versions, huge pools, duplicates and nonfinite signals',async()=>{
 const snap=await captureGuideReplay(input([video('v')]),1,now,turn),parsed=normalizeGuideReplay({...snap,title:'SECRET',candidates:snap.candidates.map(row=>({...row,path:'SECRET',tags:['SECRET']}))});assert(!JSON.stringify(parsed).includes('SECRET'));
 for(const bad of [{...snap,version:2},{...snap,candidates:Array(513).fill(snap.candidates[0]),eligible:600},{...snap,candidates:[snap.candidates[0],snap.candidates[0]],eligible:2},{...snap,candidates:[{...snap.candidates[0],exposure:Infinity}]},{...snap,candidates:[{...snap.candidates[0],source:'redtube'}]},{...snap,session:{sources:'private'}}])assert.throws(()=>normalizeGuideReplay(bad),/Invalid|invalid|Unsupported/);
});
test('protected exposure remains measured in novelty while its ranking deduction stays protected',async()=>{
 const base=input([video('v')],{favorites:{v:true},recommendationExposure:{version:1,updatedAt:now,entries:[{key:'youtube:v',count:8,at:now}]}}),snap=await captureGuideReplay(base,1,now,turn),result=compareGuideReplay(snap,weights);assert.equal(snap.candidates[0].exposure,0);assert.equal(snap.candidates[0].exposed,true);assert.equal(result.metricsBefore.novel,0);assert.equal(result.metricsAfter.novel,0);
});
test('100k capture stays bounded, includes every actual current winner and remains cooperatively cancellable',async()=>{
 const rows=Array.from({length:100000},(_,i)=>video('z'+i,i%2?'youtube':'twitch')),base=input(rows,{favorites:{z99999:true},session:{sources:'balanced'}});let turns=0;const snap=await captureGuideReplay(base,42,now,async()=>{turns++;}),actual=await prepareGuide(base,42,now,turn);assert.equal(snap.eligible,100000);assert(snap.candidates.length<=REPLAY_LIMIT);assert(turns>10);assert(snap.candidates.some(row=>row.favorite));const result=compareGuideReplay(snap,snap.baseline);assert.equal(result.current.length,12);assert.deepEqual(result.current.map(row=>snap.candidates.find(c=>c.key===row.candidate).rank),actual.picks.map(v=>{let value=42;for(const char of v.id)value=Math.imul(value^char.charCodeAt(0),0x45d9f3b);return value>>>0;}));assert.equal(JSON.stringify(snap).length<100000, true);
 await assert.rejects(captureGuideReplay(input(new Proxy([],{get(){throw Error('should not read');}})),1,now,async()=>{throw Error('cancelled');}),/cancelled/);
});
test('empty replay and identical weights remain deterministic and create no invented changes',async()=>{
 const snap=await captureGuideReplay(input([]),1,now,turn),result=compareGuideReplay(snap,DEFAULT_GUIDE_WEIGHTS);assert.deepEqual(result.current,[]);assert.deepEqual(result.changes,[]);assert.equal(result.metricsBefore.findings[0].status,'unknown');
});
