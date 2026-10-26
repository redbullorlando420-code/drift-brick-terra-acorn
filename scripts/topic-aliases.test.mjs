import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const a=await import('../src/lib/videos/topic-aliases.ts'),topics=await import('../src/lib/videos/topics.ts');
const {topicPostings}=await import('../src/lib/videos/topic-postings.ts');
const {summarizeTopicCatalog,selectTopicCatalog}=await import('../src/lib/videos/topic-catalog.ts');
const {inspectAliasCandidates}=await import('../src/lib/videos/topic-alias-candidates.ts');
const {searchCatalog}=await import('../src/lib/videos/search-index.ts');
const {rankYoutubeRecommendations}=await import('../src/lib/remote/youtube-recommendations.ts');
const {createYoutubeRankingProcessor}=await import('../src/lib/remote/youtube-ranking-protocol.ts');
const {prepareGuide,answerGuideQuery}=await import('../src/lib/videos/guide-picks.ts');
const {prepareTwitchRecommendationScore}=await import('../src/lib/videos/twitch-recommendations.ts');
const {describeRoomMedia}=await import('../src/lib/multiplayer/room-media.ts');
const {buildRoomSessionFile}=await import('../src/lib/multiplayer/room-session-file.ts');
const turn=async()=>{},now=1768478400000;
const decision=(alias='sience',topic='science')=>({alias,topic,at:now,method:'spelling-review',titleCount:2,sources:['youtube','local']});
const approve=(alias='sience',topic='science')=>{const ledger=a.changeTopicAlias(a.getTopicAliases(),decision(alias,topic),false,now);a.installTopicAliases(ledger);return ledger;};
const reset=()=>a.installTopicAliases(a.EMPTY_TOPIC_ALIASES);
const card=(id,tags,kind='youtube')=>({id,name:'Untitled '+id,path:'',extension:'mp4',mime:'video/mp4',size:0,folderId:kind==='local'?'local':'yt:creator',addedAt:now,tagList:tags,metadataProvenance:{lockedFields:['tags'],tags:Object.fromEntries(tags.map(t=>[t,'manual']))},...(kind==='local'?{}:{remote:{kind,videoId:id,channelId:'creator',channelName:'Creator',youtubeType:'upload',publishedSource:'provider',publishedPrecision:'instant'}})});
const fixture=()=>{const videos=[card('ref',['science']),card('miss',['sience']),card('short',['ai'],'local'),card('other',['gaming'],'local'),card('hidden',['sience']),{...card('private',['sience'],'local'),folderId:'private'}];return {videos,tags:Object.fromEntries(videos.map(v=>[v.id,v.tagList])),folders:[{id:'local',adult:false},{id:'yt:creator',adult:false},{id:'private',adult:true}],hiddenVideos:{hidden:true},unavailable:{},hideDemo:true};};
const taste={score:()=>0,liked:()=>false};
test('review validation protects built-ins and operational labels, rejects unsupported ledgers and bounds retained decisions',()=>{
 reset();for(const label of ['science','tech','provider-youtube','creator-scince','genre-custom','shorts','clips','live','youtube','x','https://bad'])assert.equal(a.validAliasLabel(label),false);
 for(const bad of [null,{}, {version:2,updatedAt:0,entries:[]},{version:1,updatedAt:NaN,entries:[]}])assert.deepEqual(a.normalizeTopicAliases(bad),a.EMPTY_TOPIC_ALIASES);
 assert.throws(()=>approve('science','music'),/Built-in/);const entries=Array.from({length:128},(_,i)=>({...decision('label-'+i),at:now+i}));const ledger=a.normalizeTopicAliases({version:1,updatedAt:now,entries});assert.equal(ledger.entries.length,128);assert.throws(()=>a.changeTopicAlias(ledger,decision('new-label')),/128-alias/);reset();
});
test('candidate evidence counts saved public labels once per title and excludes private, hidden, provider and creator facets',async()=>{
 reset();const input=fixture();input.tags.miss=['sience','keyword-sience','creator-sience','provider-sience'];const result=await inspectAliasCandidates(input,a.EMPTY_TOPIC_ALIASES,turn);const miss=result.candidates.find(row=>row.alias==='sience');assert.equal(miss.count,1);assert.deepEqual(miss.sources,['youtube']);assert.deepEqual(miss.samples,['Untitled miss']);assert.equal(miss.suggested,'science');const short=result.candidates.find(row=>row.alias==='ai');assert.equal(short.ambiguous,true);assert.equal(short.suggested,undefined);assert(!result.candidates.some(row=>/creator|provider/.test(row.alias)));assert.equal(topics.canonicalTopic('ai'),undefined);
 const exact=await inspectAliasCandidates(input,a.EMPTY_TOPIC_ALIASES,turn,'sience');assert.equal(exact.candidates[0].count,1);
});
test('approval, reload and Undo update only affected topic postings and preserve locked/manual labels exactly',async()=>{
 reset();const input=fixture(),tags=structuredClone(input.tags),provenance=structuredClone(input.videos.map(v=>v.metadataProvenance));const before=await topicPostings(input,turn),gaming=before.topics.get('gaming'),science=before.topics.get('science');assert.equal(science.all.length,1);
 const ledger=approve();const after=await topicPostings(input,turn);assert.equal(after.baseBuilds,1);assert.deepEqual(after.patchedTopics,['science']);assert.equal(after.topics.get('gaming'),gaming);assert.equal(after.topics.get('science').all.length,2);assert.equal(after.topics.get('science').saved.length,2);
 a.installTopicAliases(JSON.parse(JSON.stringify(ledger)));assert.equal(topics.canonicalTopic('sience'),'science');const summary=await summarizeTopicCatalog(input,taste,turn);assert.equal(summary.counts.find(([key])=>key==='science')[1].count,2);assert.equal((await selectTopicCatalog(input,'science',undefined,'all',taste,turn)).videos.length,2);
 const undone=a.changeTopicAlias(ledger,ledger.entries[0],true,now);a.installTopicAliases(undone);const restored=await topicPostings(input,turn);assert.equal(restored.topics.get('science').all.length,1);assert.equal(restored.topics.get('gaming'),gaming);assert.deepEqual(input.tags,tags);assert.deepEqual(input.videos.map(v=>v.metadataProvenance),provenance);reset();
});
test('ambiguous short labels remain distinct until explicit manual review; Undo restores distinct topic counts',async()=>{
 reset();const input=fixture();assert.equal((await selectTopicCatalog(input,'technology',undefined,'all',taste,turn)).videos.length,0);assert.equal(topics.canonicalTopic('ai'),undefined);const ledger=a.changeTopicAlias(a.EMPTY_TOPIC_ALIASES,{...decision('ai','technology'),method:'manual-review'},false,now);a.installTopicAliases(ledger);assert.deepEqual((await selectTopicCatalog(input,'technology',undefined,'all',taste,turn)).videos.map(v=>v.id),['short']);a.installTopicAliases(a.changeTopicAlias(ledger,ledger.entries[0],true,now));assert.equal((await selectTopicCatalog(input,'technology',undefined,'all',taste,turn)).videos.length,0);assert.deepEqual(input.tags.short,['ai']);reset();
});
test('unrelated cached topic evidence retains its identity, affected evidence refreshes, and legacy/private interpretation stays separate',()=>{
 reset();const input=fixture(),unrelated=topics.topicEvidence(input.videos[3],input.tags.other),old=topics.topicEvidence(input.videos[1],input.tags.miss);approve();assert.equal(topics.topicEvidence(input.videos[3],input.tags.other),unrelated);assert.notEqual(topics.topicEvidence(input.videos[1],input.tags.miss),old);assert.deepEqual(topics.topicsForVideo(input.videos[1],input.tags.miss,false),[]);assert.deepEqual(topics.topicsForVideo(input.videos[1],input.tags.miss),['science']);reset();
});
test('public fallback search joins reviewed spelling with canonical labels and reverses cleanly',async()=>{
 reset();const input=fixture(),videos=input.videos.slice(0,4);const before=await searchCatalog(videos,input.tags,{},'science');assert.deepEqual([...before],['ref']);approve();assert.deepEqual([...await searchCatalog(videos,input.tags,{},'science')],['ref','miss']);assert.deepEqual([...await searchCatalog(videos,input.tags,{},'sience')],['ref','miss']);assert.deepEqual([...await searchCatalog(videos,input.tags,{},'science',undefined,false)],['ref']);reset();assert.deepEqual([...await searchCatalog(videos,input.tags,{},'science')],['ref']);
});
test('actual search worker adds/removes alias tag postings without another document batch and honors a private/raw request',async()=>{
 reset();const messages=[];globalThis.self={postMessage:message=>messages.push(message)};await import('../src/lib/videos/search.worker.ts');const input=fixture(),batch=input.videos.slice(0,4).map(video=>({video,tags:input.tags[video.id]}));self.onmessage({data:{type:'batch',generation:1,reset:true,done:true,batch}});const query=(text,ledger)=>{self.onmessage({data:{type:'search',generation:1,requestId:messages.length,query:text,topicAliases:ledger}});return messages.at(-1).ids;};assert.deepEqual(query('science',a.EMPTY_TOPIC_ALIASES),['ref']);const ledger=approve();assert.deepEqual(query('science',ledger),['ref','miss']);assert.deepEqual(query('sience',ledger),['ref','miss']);assert.deepEqual(query('science',a.EMPTY_TOPIC_ALIASES),['ref']);assert.equal(messages.filter(m=>m.type==='ready').length,1);reset();
});
test('public YouTube, Guide and Twitch recommendation inputs use approved spelling evidence and recover after Undo',async()=>{
 reset();const seed=card('seed',['science']),control=card('control',['unrelated']),miss=card('miss',['sience']),videos=[seed,control,miss],tags=Object.fromEntries(videos.map(v=>[v.id,v.tagList]));const base={tags,favorites:{},likes:{},history:[],viewCounts:{},ratingOf:()=>0,tagIsLiked:tag=>tag==='science',tagHasHeartHistory:()=>false,ratingPreference:()=>0,watchScore:()=>0,creatorIsLiked:()=>false,creatorRating:()=>0,now,limit:2,shuffle:()=>0};const before=rankYoutubeRecommendations(videos,base,[control,miss]).map(v=>v.id);assert.deepEqual(before,['control','miss']);approve();assert.deepEqual(rankYoutubeRecommendations(videos,base,[control,miss]).map(v=>v.id),['miss','control']);const guide={videos,tags,favorites:{seed:true},likes:{},history:[]};assert((await prepareGuide(guide,417,now,turn)).picks.findIndex(v=>v.id==='miss')<(await prepareGuide(guide,417,now,turn)).picks.findIndex(v=>v.id==='control'));assert((await answerGuideQuery(guide,'science',417,now,turn)).picks.some(v=>v.id==='miss'));
 const tw=videos.map(v=>({...v,remote:{...v.remote,kind:'twitch'}}));reset();const scoreBefore=await prepareTwitchRecommendationScore(tw,{tags,favorites:{seed:true},likes:{},viewCounts:{},rating:()=>0,watchScore:()=>0,now},undefined,turn),old=scoreBefore(tw[2]);approve();const scoreAfter=await prepareTwitchRecommendationScore(tw,{tags,favorites:{seed:true},likes:{},viewCounts:{},rating:()=>0,watchScore:()=>0,now},undefined,turn);assert(scoreAfter(tw[2])>old);reset();assert.deepEqual(rankYoutubeRecommendations(videos,base,[control,miss]).map(v=>v.id),before);
});
test('YouTube worker reset receives alias snapshot and does not retain it after a raw reset',()=>{
 reset();const ledger=approve(),input=fixture(),videos=input.videos.slice(0,2),messages=[],process=createYoutubeRankingProcessor(ids=>messages.push(ids));const run=aliases=>{process({type:'reset',topicAliases:aliases,creatorLikes:{},creatorFavorites:{},creatorRatings:{},heartedTags:['science'],historicTags:[]});process({type:'append',rows:videos.map(video=>({video,tags:input.tags[video.id],rating:0,favorite:false,liked:false,marks:0,watch:0,plays:0}))});process({type:'candidates',ids:videos.map(v=>v.id)});process({type:'ready'});};run(ledger);assert.equal(topics.canonicalTopic('sience'),'science');run(a.EMPTY_TOPIC_ALIASES);assert.equal(topics.canonicalTopic('sience'),undefined);reset();
});
test('interrupted affected-topic patch leaves prior postings complete and can be retried',async()=>{
 reset();const input=fixture(),index=await topicPostings(input,turn),before=index.topics.get('science');approve();let calls=0;await assert.rejects(()=>topicPostings(input,async()=>{if(++calls===3)throw Error('interrupted');}),/interrupted/);assert.equal(index.topics.get('science'),before);const rebuilt=await topicPostings(input,turn);assert.equal(rebuilt.topics.get('science').all.length,2);reset();
});
test('alias provenance never enters public room media or Watch Together session files',()=>{
 const video={...card('abcdefghijk',['sience']),topicAliases:{version:1,updatedAt:now,entries:[decision()]}};for(const output of [describeRoomMedia(video),buildRoomSessionFile({played:[],current:video,upcoming:[]})])assert(!JSON.stringify(output).includes('topicAliases'));reset();
});

test('an active consumer recovers from an earlier cancelled shared preparation',async()=>{
 reset();const input=fixture();let reject;const gate=new Promise((_,r)=>reject=r);const stale=topicPostings(input,async()=>gate);const active=topicPostings(input,turn);reject(Error('cancelled old consumer'));await assert.rejects(stale,/cancelled/);assert.equal((await active).topics.get('science').all.length,1);reset();
});

test('concurrent active consumers share one staged affected-topic patch',async()=>{
 reset();const input=fixture();await topicPostings(input,turn);approve();let first=0,second=0;
 const one=topicPostings(input,async()=>{first++;await new Promise(resolve=>setImmediate(resolve));});
 const two=topicPostings(input,async()=>{second++;await new Promise(resolve=>setImmediate(resolve));});
 const [left,right]=await Promise.all([one,two]);assert.equal(left,right);assert.equal(left.topics.get('science').all.length,2);assert(Math.min(first,second)<Math.max(first,second),'the second consumer waits for the existing patch rather than executing another patch');reset();
});
