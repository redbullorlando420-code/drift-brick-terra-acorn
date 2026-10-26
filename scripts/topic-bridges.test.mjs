import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {bridgeFields,bridgeTopic,bridgeKey,bridgePolicy,changeBridge,normalizeBridgeLedger,newestBridges,EMPTY_BRIDGES,BRIDGE_LIMIT,bridgeText} from '../src/lib/videos/topic-bridges.ts';
import {auditTopicBridges} from '../src/lib/videos/topic-bridge-audit.ts';
import {prepareGuide,answerGuideQuery} from '../src/lib/videos/guide-picks.ts';
import {createGuideOrigins,addGuideOrigins} from '../src/lib/videos/guide-affinity.ts';
import {installTopicAliases,EMPTY_TOPIC_ALIASES} from '../src/lib/videos/topic-aliases.ts';
import {getReviewedPhotos,setReviewedPhotos,clearReviewedPhotos} from '../src/lib/reviewed-photo-bridges.ts';
const now=1800000000000,turn=async()=>{},video=(id,source='local',extra={})=>({id,name:'Neutral '+id,folderId:'public',path:id,extension:'mp4',mime:'video/mp4',size:0,addedAt:now,...(source==='local'?{}:{remote:{kind:source,videoId:id,channelName:'Creator '+id}}),...extra});
const input=(videos,extra={})=>({videos,tags:{},favorites:{},likes:{},history:[],folders:[{id:'public'},{id:'private',adult:true}],...extra});
test('reviewed fixture content fields create bridges while creator/source/date/file evidence cannot',()=>{
 const fixture=JSON.parse(readFileSync(new URL('./fixtures/topic-bridges.json',import.meta.url),'utf8'));assert.equal(fixture.version,1);
 for(const row of fixture.cases){const item=video(row.id,row.source,{name:row.title,genre:row.genre,description:row.description});if(item.remote)item.remote.channelName=row.creator??'Neutral';const fields=bridgeFields(item,row.tags);if(row.empty)assert.deepEqual(fields,[],row.id);else for(const topic of row.want)assert(fields.some(f=>f.topic===topic),row.id);}
 assert.equal(bridgeText('  science\n\t clip  '),'science clip');
});
test('aliases preserve supported spelling but cannot reclassify formats or operational labels as content',()=>{
 installTopicAliases({version:1,updatedAt:now,entries:['sience','mp4','date-2026'].map(alias=>({alias,topic:'science',at:now,method:'manual-review',titleCount:1,sources:['youtube']}))});
 try{assert.equal(bridgeTopic('sience'),'science');assert.equal(bridgeTopic('mp4'),undefined);assert.equal(bridgeTopic('date-2026'),undefined);assert.equal(bridgeTopic('creator-science'),undefined);}finally{installTopicAliases(EMPTY_TOPIC_ALIASES);}
});
test('pair pauses normalize symmetrically, reject invalid/private pairs, retain Undo timestamps and never silently evict',()=>{
 const row={topic:'science',a:'youtube',b:'local',at:now},saved=changeBridge(EMPTY_BRIDGES,row,false,now);assert.equal(bridgeKey(saved.entries[0]),'science|local|youtube');assert(bridgePolicy(saved)('science','local','youtube'));assert(!bridgePolicy(saved)('gaming','local','youtube'));assert(!bridgePolicy(saved)('science','local','local'));assert.equal(changeBridge(saved,row),saved);
 const undone=changeBridge(saved,row,true,now+1);assert.equal(undone.entries.length,0);assert.deepEqual(newestBridges(saved,undone),undone);assert.deepEqual(normalizeBridgeLedger({...saved,version:2}),EMPTY_BRIDGES);
 for(const entry of [{...row,a:'redtube'},{...row,b:'youtube'},{...row,topic:'mp4'},{...row,at:-1}])assert.equal(normalizeBridgeLedger({version:1,updatedAt:now,entries:[entry]}).entries.length,0);
 assert.throws(()=>changeBridge({version:1,updatedAt:now,entries:Array.from({length:BRIDGE_LIMIT},(_,i)=>({...row,topic:'other'+i}))},row),/256-bridge limit/);assert.equal(undone.updatedAt,now+1);const stripped=changeBridge(EMPTY_BRIDGES,{...row,samples:[{title:'Do not persist sample',id:'private path'}]},false,now);assert.deepEqual(Object.keys(stripped.entries[0]).sort(),['a','at','b','topic']);
});
test('audit retains real field samples and counts for local, provider and explicitly reviewed photo candidates',async()=>{
 const rows=[video('local'),video('youtube','youtube',{name:'Physics laboratory'}),video('twitch','twitch')],data=input(rows,{tags:{local:['science'],twitch:['keyword-science']},photos:[{id:'p',name:'chosen.png',tags:['science'],reviewed:true,direct:true}]});const before=JSON.stringify(data),report=await auditTopicBridges(data,turn);
 assert.equal(report.publicTitles,3);assert.equal(report.reviewedPhotos,1);assert.equal(report.bridges.filter(b=>b.topic==='science').length,6);
 const pair=report.bridges.find(b=>b.topic==='science'&&b.a==='local'&&b.b==='youtube');assert.equal(pair.samples[0].field,'saved tag');assert.equal(pair.samples[1].field,'provider title');assert.equal(pair.samples[1].quote,'Physics laboratory');assert.equal(JSON.stringify(data),before);
});
test('private, unknown local, hidden, unavailable, sample and unreviewed/imported/hidden photo evidence is absent',async()=>{
 const rows=[video('public','youtube'),video('secret','local',{folderId:'private',name:'Private secret'}),video('missing','local',{folderId:'missing'}),video('hidden','twitch'),video('gone','twitch'),video('sample','twitch',{isSample:true}),video('adult','redtube')],data=input(rows,{tags:Object.fromEntries(rows.map(v=>[v.id,['science']])),hidden:{hidden:true},unavailable:{gone:true},photos:[{id:'p1',name:'Private photo',tags:['science'],reviewed:false,direct:true},{id:'p2',name:'Imported photo',tags:['science'],reviewed:true,direct:false},{id:'p3',name:'Hidden photo',tags:['science'],reviewed:true,direct:true,hidden:true}]});
 const report=await auditTopicBridges(data,turn);assert.equal(report.publicTitles,1);assert.equal(report.reviewedPhotos,0);assert.deepEqual(report.bridges,[]);assert(!JSON.stringify(report).includes('Private'));
});
test('pausing a Guide bridge removes its preference boost without deleting content or affecting same-source/direct favorites',async()=>{
 const rows=[video('origin','youtube'),video('same','youtube'),video('cross','twitch')],base=input(rows,{favorites:{origin:true},tags:{origin:['science'],same:['science'],cross:['science']},history:[{id:'origin'}]}),before=JSON.stringify(base),saved=changeBridge(EMPTY_BRIDGES,{topic:'science',a:'youtube',b:'twitch',at:now},false,now);
 const old=await prepareGuide(base,1,now,turn);assert(old.explanations.cross.reasons.some(r=>r.bridge?.topic==='science'));const next=await prepareGuide({...base,bridgeSuppressions:saved},1,now,turn);assert.equal(next.explanations.cross.basis,'discovery');assert.equal(next.explanations.same.basis,'preference');assert.equal(next.picks.length,2);
 const favorite=await prepareGuide({...base,bridgeSuppressions:saved,favorites:{...base.favorites,cross:true}},1,now,turn);assert.equal(favorite.explanations.cross.reasons[0].kind,'favorite');assert.equal((await answerGuideQuery({...base,bridgeSuppressions:saved},'science',1,now,turn)).picks.length,3);assert.equal(JSON.stringify(base),before);
});
test('an alternate unpaused origin remains usable and unknown shared labels do not form cross-source affinity',async()=>{
 const rows=[video('yt','youtube'),video('local'),video('tw','twitch'),video('unknown','twitch')],base=input(rows,{favorites:{yt:true,local:true},tags:{yt:['science','unreviewed-label'],local:['science'],tw:['science'],unknown:['unreviewed-label']},bridgeSuppressions:changeBridge(EMPTY_BRIDGES,{topic:'science',a:'youtube',b:'twitch',at:now},false,now)}),result=await prepareGuide(base,1,now,turn);
 assert.equal(result.explanations.tw.reasons.find(r=>r.kind==='shared-tag').origin.id,'local');assert.equal(result.explanations.unknown.basis,'discovery');
});
test('a forged format alias cannot provide cross-source preference evidence or misleading reason quotes',async()=>{
 installTopicAliases({version:1,updatedAt:now,entries:[{alias:'mp4',topic:'science',at:now,method:'manual-review',titleCount:1,sources:['youtube']}]});
 try{const rows=[video('origin','youtube'),video('bad','twitch'),video('valid','twitch')],result=await prepareGuide(input(rows,{favorites:{origin:true},tags:{origin:['mp4','science'],bad:['mp4'],valid:['mp4','science']}}),1,now,turn);assert.equal(result.explanations.bad.basis,'discovery');const reason=result.explanations.valid.reasons.find(r=>r.bridge);assert.equal(reason.quote,'science');assert.equal(reason.origin.tag,'science');}finally{installTopicAliases(EMPTY_TOPIC_ALIASES);}
});
test('photo review is bounded, immutable and explicitly cleared without persisting a library setting',()=>{
 clearReviewedPhotos();const row={id:'reviewed-photo:0',name:'chosen.png',tags:['science'],reviewed:true,direct:true};setReviewedPhotos(Array.from({length:70},(_,i)=>({...row,id:'p'+i})));assert.equal(getReviewedPhotos().length,48);assert(Object.isFrozen(getReviewedPhotos()));assert(Object.isFrozen(getReviewedPhotos()[0].tags));setReviewedPhotos([{...row,path:'private path',people:['Private person'],file:{bytes:'image bytes'}}]);assert.deepEqual(Object.keys(getReviewedPhotos()[0]).sort(),['direct','hidden','id','name','reviewed','tags']);assert.equal(getReviewedPhotos()[0].id,'reviewed-photo:0');row.tags.push('gaming');assert.deepEqual(getReviewedPhotos()[0].tags,['science']);clearReviewedPhotos();assert.equal(getReviewedPhotos().length,0);
});
test('100k audit rows yield cooperatively and retain only bounded topic/source samples; cancellation precedes reads',async()=>{
 const rows=Array.from({length:100000},(_,i)=>video('row'+i,i%3===0?'local':i%3===1?'youtube':'twitch')),data=input(rows,{tags:Object.fromEntries(rows.map(row=>[row.id,['science']]))});let turns=0;const report=await auditTopicBridges(data,async()=>{turns++;});assert.equal(report.bridges.length,3);assert(report.bridges.every(b=>b.samples.length===2));assert.ok(turns>190);assert.equal(report.publicTitles,100000);
 let reads=0;await assert.rejects(auditTopicBridges(input([{...video('cancel'),get id(){reads++;return 'cancel';}}]),async()=>{throw Error('cancelled');}),/cancelled/);assert.equal(reads,0);
 const origins=createGuideOrigins();for(let i=0;i<5000;i++){const row=video('affinity'+i);addGuideOrigins(input([row],{tags:{[row.id]:['custom '+i]},favorites:{[row.id]:true}}),row,i,origins);}assert.equal(origins.same.size,4096);assert.equal(origins.cross.size,0);
});
