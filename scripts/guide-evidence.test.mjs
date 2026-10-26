import {test} from 'node:test';
import assert from 'node:assert/strict';
import {prepareGuide,answerGuideQuery,guideConfirmedLive} from '../src/lib/videos/guide-picks.ts';
import {guideContentTags,guideNotices} from '../src/lib/videos/guide-evidence.ts';
import {installTopicAliases,EMPTY_TOPIC_ALIASES} from '../src/lib/videos/topic-aliases.ts';
import {LIBRARY_LIMITS} from '../src/lib/library-limits.ts';
const now=1800000000000,turn=async()=>{},video=(id,extra={})=>({id,name:'Title '+id,folderId:'public',extension:'yt',path:id,size:0,mime:'video/youtube',addedAt:now,remote:{kind:'youtube',videoId:id,channelId:'creator-'+id,channelName:'Creator '+id},...extra});
const input=(videos,extra={})=>({videos,tags:{},favorites:{},likes:{},history:[],...extra});
test('personal reasons cite real public positive signals and raw shared labels without mutating source fields',async()=>{
 const rows=[video('origin',{name:'Saved Science reference'}),video('candidate'),video('other')],data=input(rows,{favorites:{origin:true},likes:{candidate:true},tags:{origin:['Science'],candidate:['keyword-science'],other:['provider-youtube']},history:[{id:'origin'}]});
 const before=JSON.stringify(data),result=await prepareGuide(data,1,now,turn),explanation=result.explanations.candidate;
 assert.equal(explanation.basis,'preference');assert.equal(explanation.reasons[0].kind,'like');
 const reason=explanation.reasons.find(r=>r.kind==='shared-tag');assert.deepEqual(reason.origin,{id:'origin',title:'Saved Science reference',tag:'Science',signal:'favorite'});assert.equal(reason.quote,'keyword-science');assert.equal(reason.feedback.target,'science');
 assert.equal(result.explanations.other.basis,'discovery');assert.equal(result.historyCount,1);assert.equal(JSON.stringify(data),before);
 assert.ok(!JSON.stringify(result.explanations).includes('watched Science'));
});
test('empty, private-only and orphan signals do not become public counts, evidence or topic choices',async()=>{
 const rows=[video('secret',{remote:undefined,folderId:'private',name:'Secret private science'}),video('hidden'),video('gone'),video('sample',{isSample:true}),video('adult',{remote:{kind:'redtube'}}),video('unknown',{remote:undefined,folderId:'missing'})];
 const data=input(rows,{folders:[{id:'public'},{id:'private',adult:true}],hidden:{hidden:true},unavailable:{gone:true},favorites:Object.fromEntries([...rows.map(v=>[v.id,true]),['orphan',true]]),likes:{secret:true},tags:Object.fromEntries(rows.map(v=>[v.id,['science']])),history:rows.map(v=>({id:v.id}))});
 for(const result of [await prepareGuide(data,1,now,turn),await prepareGuide(input([]),1,now,turn)]){assert.equal(result.mode,'empty');for(const key of ['publicCount','favoriteCount','likeCount','historyCount','tagCount'])assert.equal(result[key],0);assert.deepEqual(result.topics,[]);assert.deepEqual(result.explanations,{});}
 const query=await answerGuideQuery(data,'science',1,now,turn);assert.deepEqual(query.picks,[]);assert.ok(!JSON.stringify(query).includes('Secret private'));
});
test('history-only input is honest discovery and operational facets cannot train affinity',async()=>{
 assert.deepEqual(guideContentTags(['provider-youtube','creator-science','format-upload','source-browser','2026-10-25','tag:17','live','keyword-science','Science']),['science']);
 const result=await prepareGuide(input([video('seen'),video('next')],{history:[{id:'seen'},{id:'seen'},{id:'removed'}],tags:{seen:['provider-youtube'],next:['provider-youtube']},favorites:{seen:true}}),1,now,turn);
 assert.equal(result.mode,'discovery');assert.equal(result.historyCount,1);assert.deepEqual(result.picks.map(v=>v.id),['next']);assert.equal(result.explanations.next.reasons[0].kind,'discovery');
});
test('query reasons distinguish saved title, tag, creator and category with exact field quotes',async()=>{
 const rows=[video('title',{name:'Quantum science workshop'}),video('tag'),video('creator',{remote:{kind:'youtube',videoId:'creator',channelName:'Science Academy',channelId:'academy'}}),video('category',{genre:'Science'})],data=input(rows,{tags:{tag:['keyword-science']}}),before=JSON.stringify(data);
 const result=await answerGuideQuery(data,'science',1,now,turn);assert.equal(result.picks.length,4);
 for(const [id,kind,quote]of [['title','title','Quantum science workshop'],['tag','saved-tag','keyword-science'],['creator','creator','Science Academy'],['category','category','Science']]){const reason=result.explanations[id].reasons[0];assert.equal(reason.kind,kind);assert.equal(reason.quote,quote);assert.equal(result.explanations[id].basis,'query');}
 assert.equal(result.explanations.creator.reasons[0].feedback.target,'youtube:academy');assert.equal(JSON.stringify(data),before);
 const missing=await answerGuideQuery(data,'unfindablefixture',1,now,turn);assert.deepEqual(missing.picks,[]);assert.match(missing.text,/available topics/);
});
test('contradictory feedback, favorite protection and exposure notices state actual evidence',async()=>{
 const row=video('one'),base=input([row],{favorites:{one:true},tags:{one:['science']},ratingOf:()=>1,recommendationRejections:{version:1,updatedAt:now,entries:[{scope:'topic',target:'science',label:'science',at:now}]}});
 const result=await prepareGuide(base,1,now,turn);assert.match(result.explanations.one.notices.join(' '),/1-star rating conflicts/);assert.match(result.explanations.one.notices.join(' '),/favorite protects/);
 assert.match(guideNotices({...base,favorites:{},tagIsLiked:()=>true},row,0,1).join(' '),/topic heart/);assert.match(guideNotices({...base,favorites:{}},row,16,1).join(' '),/lowers this title/);assert.match(guideNotices({...base,favorites:{}},row,16,1).join(' '),/does not mean you watched/);
 assert.deepEqual(guideNotices({...base,favorites:{},ratingOf:()=>0,recommendationRejections:{version:2,updatedAt:now,entries:base.recommendationRejections.entries}},row,0,0),[]);
});
test('live explanations require actual fresh confirmations rather than grace holds or viewer counts',async()=>{
 const live=(id,extra={})=>video(id,{remote:{kind:'youtube',videoId:id,live:true,observedAt:now,...extra}}),fresh=live('fresh'),rows=[fresh,live('unconfirmed',{liveUnconfirmed:true}),live('held',{liveOfflineSince:now-1000}),live('stale',{observedAt:now-LIBRARY_LIMITS.youtubeLiveStateFreshnessMs-1}),live('missing',{observedAt:undefined,viewers:5000}),live('future',{observedAt:now+10000})];
 assert.deepEqual(rows.map(v=>guideConfirmedLive(v,now)),[true,false,false,false,false,false]);const result=await answerGuideQuery(input(rows),'YouTube live',1,now,turn);assert.deepEqual(result.picks.map(v=>v.id),['fresh']);assert.equal(result.explanations.fresh.basis,'live');assert.equal(result.explanations.fresh.reasons[0].quote,new Date(now).toISOString());
});
test('artifact bounds limit affinity vocabulary, candidate explanations and chooser rows',async()=>{
 const rows=Array.from({length:4200},(_,i)=>video('bounded'+i)),data=input(rows,{favorites:Object.fromEntries(rows.map(v=>[v.id,true])),tags:Object.fromEntries(rows.map((v,i)=>[v.id,['subject '+i,'science','gaming','technology','comedy','sports']]))});let turns=0;
 const result=await prepareGuide(data,1,now,async()=>{turns++;});assert.equal(result.affinityLimited,true);assert.equal(result.picks.length,12);assert.equal(Object.keys(result.explanations).length,12);assert.ok(result.topics.length<=8);assert.ok(Object.values(result.explanations).every(e=>e.reasons.length<=4));assert.ok(turns>2);
});
test('empty and explicit queries honor cancellation before reading input',async()=>{
 for(const run of [()=>prepareGuide(input([]),1,now,async()=>{throw Error('cancel');}),()=>answerGuideQuery(input([]),'science',1,now,async()=>{throw Error('cancel');})])await assert.rejects(run,/cancel/);
});

test('reviewed aliases preserve the raw supporting fields in personal explanations',async()=>{
 installTopicAliases({version:1,updatedAt:now,entries:[{alias:'sience',topic:'science',at:now,method:'spelling-review',titleCount:1,sources:['youtube']}]});
 try{const result=await prepareGuide(input([video('reference'),video('spelling')],{favorites:{reference:true},tags:{reference:['science'],spelling:['sience']}}),1,now,turn),reason=result.explanations.spelling.reasons.find(r=>r.kind==='shared-tag');assert.equal(reason.quote,'sience');assert.equal(reason.origin.tag,'science');assert.equal(reason.feedback.target,'science');assert.equal(result.mode,'personalized');}
 finally{installTopicAliases(EMPTY_TOPIC_ALIASES);}
});
