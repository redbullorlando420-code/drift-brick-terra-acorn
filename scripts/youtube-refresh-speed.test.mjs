import {registerHooks} from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';
registerHooks({resolve(s,c,n){try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {updateYoutubeShelfAsync}=await import('../src/lib/videos/youtube-shelf.ts');
const {youtubeCatalogSelection}=await import('../src/lib/videos/youtube-catalog-selection.ts');
const {prepareYoutubeCreatorIndex,mixYoutubeCreators,mixYoutubeCreatorsAsync}=await import('../src/lib/remote/youtube-mix.ts');
const tick=async()=>{};
const base=Date.UTC(2026,9,1),row=(i,patch={})=>({id:'yt:'+i,folderId:'public',name:'Upload '+i,path:'',size:0,addedAt:base-i*1000,extension:'yt',mime:'video/youtube',remote:{kind:'youtube',channelId:'creator'+i%180,publishedSource:'provider',views:i},...patch});
const select=rows=>youtubeCatalogSelection({videos:rows,privateFolders:new Set(['private']),unavailable:{},hiddenVideos:{},hideDemo:true},undefined,tick);
const visible=v=>v.folderId!=='private'&&!v.isSample;
test('cold selection preserves exact provenance, stable ties and the unknown-date tail',async()=>{
 const rows=Array.from({length:15000},(_,i)=>row(i,{addedAt:i%5?base-(i%127)*1000:base+i,remote:{kind:'youtube',publishedSource:i%5?'provider':'unknown'}}));
 rows.push(row('private',{folderId:'private'}),row('demo',{isSample:true}),row('nan',{addedAt:NaN}),row('inf',{addedAt:Infinity}),row('old',{addedAt:1}),row('missing',{remote:{kind:'youtube'}}),row('tw',{remote:{kind:'twitch'}}));
 const {youtubePublicationTime}=await import('../src/lib/videos/youtube-metadata.ts');
 const expected=rows.filter(v=>v.remote.kind==='youtube'&&visible(v)).sort((a,b)=>youtubePublicationTime(b)-youtubePublicationTime(a));
 assert.deepEqual(await select(rows),expected);assert.equal(rows[0].id,'yt:0');
});
test('small status/metadata updates and appended uploads match a full rebuild across mixed dates and ties',async()=>{
 for(let seed=0;seed<12;seed++){
  const rows=Array.from({length:5000},(_,i)=>row(i,{addedAt:base-(i%37)*1000,remote:{kind:'youtube',publishedSource:i%7?'provider':'unknown'}}));
  const ordered=await select(rows),next=[...rows];for(let i=seed;i<100;i+=13)next[i]={...rows[i],name:'Updated '+i,remote:{...rows[i].remote,viewers:42,live:!!(i%2)}};
  for(let i=0;i<8;i++)next.push(row('new'+i,{addedAt:base-(i%3)*1000,remote:{kind:'youtube',publishedSource:i%3?'provider':'unknown'}}));
  assert.deepEqual(await updateYoutubeShelfAsync(rows,next,ordered,visible,undefined,tick),await select(next));
 }
});
test('Twitch-only refresh retains the exact YouTube array without rereading or sorting unchanged metadata',async()=>{
 let metadataReads=0;const rows=Array.from({length:80000},(_,i)=>{const v=row(i),remote=v.remote;return {...v,get remote(){metadataReads++;return remote;}};});
 const ordered=await select(rows),before=[...rows,...Array.from({length:20000},(_,i)=>row('tw'+i,{remote:{kind:'twitch'}}))],next=[...before];for(let i=80000;i<80100;i++)next[i]={...before[i],name:'Changed Twitch'};
 metadataReads=0;let turns=0;assert.equal(await updateYoutubeShelfAsync(before,next,ordered,visible,undefined,async()=>{turns++;}),ordered);assert.equal(metadataReads,0);assert(turns>0);
});
test('shrinks, reorders, changed dates, interior admissions and large replacements request a full stable rebuild',async()=>{
 const rows=Array.from({length:5000},(_,i)=>row(i)),ordered=await select(rows);
 for(const next of [rows.slice(1),[rows[1],rows[0],...rows.slice(2)],[{...rows[0],addedAt:base-999999},...rows.slice(1)],rows.map(v=>({...v,name:'Changed'}))])assert.equal(await updateYoutubeShelfAsync(rows,next,ordered,visible,undefined,tick),undefined);
 const hidden=[row('hidden',{folderId:'private'}),...rows],shown=[{...hidden[0],folderId:'public'},...rows];assert.equal(await updateYoutubeShelfAsync(hidden,shown,ordered,visible,undefined,tick),undefined);
});
test('refresh comparison and publication cancel between slices without changing either catalog',async()=>{
 const rows=Array.from({length:40000},(_,i)=>row(i)),ordered=await select(rows),next=[...rows];next[0]={...rows[0],name:'Changed'};
 for(const phase of ['compare','merge']){const controller=new AbortController();let compared=0,merged=0;const trackedNext=new Proxy(next,{get(t,k,r){if(/^\d+$/.test(String(k)))compared++;return Reflect.get(t,k,r);}}),trackedOrder=new Proxy(ordered,{get(t,k,r){if(/^\d+$/.test(String(k)))merged++;return Reflect.get(t,k,r);}});await assert.rejects(updateYoutubeShelfAsync(rows,trackedNext,trackedOrder,visible,controller.signal,async()=>{if(phase==='compare'?compared>0:merged>0)controller.abort();}),{name:'AbortError'});assert(phase==='compare'?merged===0:merged>0);assert.equal(rows[0].name,'Upload 0');assert.equal(ordered[0],rows[0]);}
});
test('unique latest/trending winners avoid archive scans but equal-date/view ties keep seeded results',async()=>{
 for(const mode of ['latest','trending']){
  const rows=Array.from({length:90000},(_,i)=>row(i));await prepareYoutubeCreatorIndex(rows,undefined,tick);let turns=0;
  const result=await mixYoutubeCreatorsAsync(rows,7,48,mode,undefined,async()=>{turns++;});assert.equal(result.length,48);assert(turns<=2,'unique per-creator winners should not rescan historical rows');
  const ids=new Set(result.map(v=>v.remote.channelId));assert.equal(ids.size,48);
 }
 for(const unknown of [false,true])for(const seed of [0,7,999]){
  const rows=Array.from({length:600},(_,i)=>row(i,{addedAt:base,remote:{kind:'youtube',channelId:'same',publishedSource:unknown?'unknown':'provider',views:10}}));
  const first=mixYoutubeCreators(rows,seed,1,'latest'),many=mixYoutubeCreators(rows,seed,48,'latest');assert.equal(first[0],many[0],'quota-one ties use the same seeded best candidate as the heap');
  assert.equal(mixYoutubeCreators(rows,seed,1,'trending')[0],mixYoutubeCreators(rows,seed,48,'trending')[0]);
 }
});
test('winner shortcuts preserve shuffled results, quotas and invalid-view fallback',async()=>{
 const rows=Array.from({length:3000},(_,i)=>row(i,{remote:{kind:'youtube',channelId:'c'+i%17,publishedSource:i%2?'provider':'unknown',views:i%19===0?NaN:i%7}}));
 for(const mode of ['mix','latest','trending'])for(const limit of [1,17,48,500]){const a=mixYoutubeCreators(rows,123,limit,mode),b=await mixYoutubeCreatorsAsync(rows,123,limit,mode,undefined,tick);assert.deepEqual(b,a);assert.equal(a.length,limit);assert.equal(new Set(a.map(v=>v.id)).size,limit);}
});
