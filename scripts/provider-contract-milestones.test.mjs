import {test} from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c);}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {checkProviderContracts}=await import('./check-provider-contracts.mjs');
const {readTwitchLiveBatch,validateTwitchLiveUser}=await import('../src/lib/remote/twitch-live-batch.ts');
const {createYoutubeLiveReader}=await import('../src/lib/remote/youtube-live-browse.ts');
const {runRefreshRemotes}=await import('../src/lib/remote/api.ts');
const id='UC0000000000000000000000',yt={id:'yt:'+id,channelId:id,kind:'youtube',title:'Fixture creator',handle:'fixture',live:true,liveCheckedAt:100,catalogCursor:'keep-archive',newestVideoId:'video000001'};
test('23 small redacted YouTube contract fixtures recognize supported shapes and reject unreadable replacements',()=>{const r=checkProviderContracts();assert.equal(r.length,23);assert(r.every(c=>c.ok),JSON.stringify(r.filter(c=>!c.ok)));});
test('Twitch live contract rejects malformed stream identities and viewer values, but accepts real zero-viewer and offline observations',()=>{
 for(const v of [null,{}, {id:'1'}, {id:'1',stream:{}},{id:'1',stream:false},{id:'1',stream:{viewersCount:-1}},{id:'1',stream:{viewersCount:NaN}},{id:'1',stream:{viewersCount:'10'}}])assert.throws(()=>validateTwitchLiveUser(v),/malformed/);
 assert.equal(validateTwitchLiveUser({id:'1',stream:null}).stream,null);assert.equal(validateTwitchLiveUser({id:'1',stream:{viewersCount:0}}).stream.viewersCount,0);
});
test('Twitch aliased optional failures preserve verified state while critical and bubbled negatives stay unknown',async()=>{
 const users={c0:{id:'0',stream:{viewersCount:42}},c1:{id:'1',stream:null},c2:{id:'2',stream:{viewersCount:5}},c3:{id:'3',stream:null}};
 const rows=await readTwitchLiveBatch(['zero','one','two','three'],async()=>({data:users,errors:[{message:'artwork unavailable',path:['c0','profileImageURL']},{message:'count unavailable',path:['c2','stream','viewersCount']},{message:'nullable bubble',path:['c3','stream','game','name']}]}));
 assert.equal(rows.get('zero').user.stream.viewersCount,42);assert(rows.get('zero').warning);assert.equal(rows.get('one').user.stream,null);assert(rows.get('two').error);assert(rows.get('three').error);
});
test('Twitch whole-request failures stay within their 12-user chunk and later chunks finish',async()=>{
 let calls=0;const rows=await readTwitchLiveBatch(Array.from({length:25},(_,i)=>'creator'+i),async(_q,v)=>{calls++;if(v.l0==='creator0')throw Error('transport failed');return {data:Object.fromEntries(Object.entries(v).map(([k,login])=>['c'+k.slice(1),{id:login,stream:null}]))};});
 assert.equal(calls,3);assert.equal([...rows.values()].filter(r=>r.error).length,12);assert.equal([...rows.values()].filter(r=>r.user).length,13);
});
test('actual 100-target Twitch refresh commits healthy siblings and retries only six bad observations',async()=>{
 const original=globalThis.fetch;let active=0,peak=0,calls=0;
 globalThis.fetch=async(_url,init)=>{const p=JSON.parse(init.body);calls++;peak=Math.max(peak,++active);await Promise.resolve();const data={},errors=[];
 for(const [key,login]of Object.entries(p.variables)){const alias='c'+key.slice(1),n=Number(login.slice(7));if(n===5)continue;
 data[alias]=n===1?{id:login,stream:{}}:n===3?{stream:null}:n===4?null:{id:login,displayName:login,stream:n===2||n===7?null:{title:'Live',viewersCount:n+100}};
 if(n===0)errors.push({message:'Artwork unavailable',path:[alias,'profileImageURL']});if(n===6)errors.push({message:'Viewers failed',path:[alias,'stream','viewersCount']});if(n===7)errors.push({message:'Bubbled field',path:[alias,'stream','game']});
 }active--;return Response.json({data,errors});};
 try{const follows=Array.from({length:100},(_,i)=>({id:'tw:creator'+i,handle:'creator'+i,title:'Creator '+i,kind:'twitch',live:true,liveCheckedAt:100,twitchArchiveCursor:'keep-'+i}));const r=await runRefreshRemotes({channels:follows,twitchLiveOnly:true});assert.equal(calls,9);assert(peak<=2);assert.equal(r.refreshedIds.length,94);assert.equal(r.liveCheckedIds.length,94);assert.equal(r.videos.length,93);
 for(const n of [1,3,4,5,6,7]){const c=r.channels.find(c=>c.id==='tw:creator'+n);assert.equal(c.live,true);assert.equal(c.liveCheckedAt,100);assert(c.twitchLiveRetry);assert(c.lastLiveFailure);assert.equal(c.twitchArchiveCursor,'keep-'+n);}
 const good=r.channels.find(c=>c.id==='tw:creator0');assert.equal(good.live,true);assert(good.lastLiveWarning);assert.equal(r.videos.find(v=>v.folderId===good.id).remote.viewers,100);
 }finally{globalThis.fetch=original;}
});
test('actual valid empty RSS feed succeeds without a channel or live fallback; malformed RSS retains checkpoints',async()=>{
 const original=globalThis.fetch,calls=[];globalThis.fetch=async url=>{calls.push(String(url));return new Response('<feed><title>Empty fixture</title></feed>');};
 try{const r=await runRefreshRemotes({channels:[yt]});assert.equal(calls.length,1);assert(calls[0].includes('/feeds/'));assert.equal(r.videos.length,0);assert.deepEqual(r.refreshedIds,[yt.id]);assert(r.channels[0].recentPull.checkedAt);assert.equal(r.channels[0].liveCheckedAt,100);assert.equal(r.channels[0].catalogCursor,'keep-archive');
 globalThis.fetch=async()=>new Response('<feed><entry><title>Missing identity</title></entry></feed>');const bad=await runRefreshRemotes({channels:[{...yt,id:'yt:UC1111111111111111111111',channelId:'UC1111111111111111111111'}]});assert.equal(bad.videos.length,0);assert.equal(bad.refreshedIds.length,0);assert.match(bad.channels[0].recentPull.failure.message,/missing-video-identity/);assert.equal(bad.channels[0].catalogCursor,'keep-archive');assert.equal(bad.channels[0].liveCheckedAt,100);
 }finally{globalThis.fetch=original;}
});
test('a renamed live renderer or incomplete Streams container cannot confirm an offline observation',async()=>{
 const shell=content=>({metadata:{channelMetadataRenderer:{externalId:id}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:true,title:'Live',content}}]}}});
 for(const content of [{richGridRenderer:{}},{richGridRenderer:{contents:[{newLiveRenderer:{videoId:'video000001'}}]}},{}]){const read=createYoutubeLiveReader(async()=>shell(content));await assert.rejects(read(id),/malformed|unsupported|unreadable|incomplete/);}
 const read=createYoutubeLiveReader(async()=>shell({richGridRenderer:{contents:[]}}));assert.deepEqual(await read(id),[]);
});
test('a partial malformed archive page retains the previous complete page and its next token',async()=>{
 const original=globalThis.fetch;let calls=0;globalThis.fetch=async()=>Response.json({onResponseReceivedActions:[{appendContinuationItemsAction:{continuationItems:++calls===1?[{videoRenderer:{videoId:'video000001'}},{continuationItemRenderer:{continuationEndpoint:{continuationCommand:{token:'unconsumed'}}}}]:[{videoRenderer:{title:{simpleText:'Lost ID'}}}]}}]});
 try{const r=await runRefreshRemotes({channels:[{...yt,catalogCursor:'start'}],youtubeCatalog:true,youtubeVideoLimit:100});assert.equal(calls,2);assert.equal(r.videos.length,1);assert.equal(r.channels[0].catalogCursor,'unconsumed');assert.equal(r.channels[0].catalogExhaustedAt,undefined);assert.match(r.channels[0].lastProviderFailure.message,/missing-video-identity/);}finally{globalThis.fetch=original;}
});
