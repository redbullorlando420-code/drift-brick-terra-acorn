import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){try{return n(s,c);}catch(e){if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e;}}});
const {createYoutubeLiveReader,canRecoverYoutubeLiveLayout}=await import('../src/lib/remote/youtube-live-browse.ts');
const {createYoutubeTransport,YoutubeRequestError}=await import('../src/lib/remote/youtube-transport.ts');
const {ProviderBudgetError,PROVIDER_BUDGETS}=await import('../src/lib/provider-budgets.ts');
const {youtubeLiveCoverage,youtubeLiveFailure}=await import('../src/lib/videos/youtube-live-health.ts');
const id=n=>'UC'+String(n).padStart(22,'0');
const channel=n=>({id:'yt:'+id(n),kind:'youtube',channelId:id(n),handle:'creator'+n,title:'Creator '+n});
const page=(channel,streams=true,params='streams')=>({metadata:{channelMetadataRenderer:{externalId:channel}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:!streams,title:'Home',content:{sectionListRenderer:{contents:[]}}}},...(params?[{tabRenderer:{selected:streams,title:'Live',endpoint:{commandMetadata:{webCommandMetadata:{url:'/channel/'+channel+'/streams'}},browseEndpoint:{browseId:channel,params}},content:{richGridRenderer:{contents:[]}}}}]:[])]}}});
const defer=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve};};
const drain=async()=>{for(let i=0;i<200;i++)await Promise.resolve();};
test('timeouts, server failures, network errors and body budgets never fan out into Home and HTML retries',async()=>{
 for(const error of [new DOMException('slow response','TimeoutError'),new TypeError('fetch failed'),new YoutubeRequestError('server unavailable',503),new ProviderBudgetError('bytes','body too big')]){
  let calls=0,failing=false;const read=createYoutubeLiveReader(async target=>{calls++;if(failing)throw error;return page(target.browseId,Boolean(target.params));});
  await read(id(1));const before=calls;failing=true;await assert.rejects(read(id(1)),e=>e===error);assert.equal(calls,before+1);assert.equal(canRecoverYoutubeLiveLayout(error),false);
 }
});
test('changed Streams params recover from the same validated page; missing tabs stay one request on later checks',async()=>{
 let calls=0,changed=false;
 const read=createYoutubeLiveReader(async target=>{calls++;return page(target.browseId,Boolean(target.params)&&(!changed||target.params==='new-streams'),changed?'new-streams':'streams');});
 await read(id(1));assert.equal(calls,2);changed=true;await read(id(1));assert.equal(calls,4,'returned Home plus fresh Streams, without fetching Home again');await read(id(1));assert.equal(calls,5);
 let noStreams=false,total=0;const without=createYoutubeLiveReader(async target=>{total++;return page(target.browseId,!noStreams&&Boolean(target.params),noStreams?null:'streams');});
 await without(id(1));noStreams=true;await without(id(2));assert.equal(total,3,'a validated Home without Streams is reused');await without(id(2));assert.equal(total,4);
});
test('an incomplete selected tab cannot confirm that an existing stream is offline',async()=>{
 const broken=page(id(1));delete broken.contents.twoColumnBrowseResultsRenderer.tabs[1].tabRenderer.content;
 const read=createYoutubeLiveReader(async()=>broken);
 await assert.rejects(read(id(1)),/incomplete/);
});
test('cancelled waiting YouTube reads reject immediately and free bounded capacity behind a stalled body',async()=>{
 const gate=defer();let calls=0;
 const transport=createYoutubeTransport({gapMs:()=>0,fetch:async()=>{calls++;await gate.promise;return new Response('ok');}});
 const active=Array.from({length:PROVIDER_BUDGETS.youtubeLiveTransfers},()=>transport.request('https://www.youtube.com/channel/x/streams',{scope:'live'}));
 await drain();
 const controllers=Array.from({length:PROVIDER_BUDGETS.queuedRequests-PROVIDER_BUDGETS.youtubeLiveTransfers},()=>new AbortController());
 const waiting=controllers.map(controller=>transport.request('https://www.youtube.com/channel/x/streams',{scope:'live',signal:controller.signal}).catch(error=>error));
 for(const controller of controllers)controller.abort(new Error('cancelled before start'));
 await Promise.all(waiting);assert.equal(calls,8);
 const next=transport.request('https://www.youtube.com/channel/x/streams',{scope:'live'});
 gate.resolve();await Promise.all([...active,next]);assert.equal(calls,9);
});
test('durable per-creator live retry increases, caps, preserves provider deadlines and resets after recovery',()=>{
 let row=channel(1),last=0;
 for(let i=0;i<10;i++){const failure=youtubeLiveFailure(row,{kind:'network-offline',message:'timeout',at:1000,recovery:''});assert(failure.retryAt>=last);last=failure.retryAt;row={...row,lastLiveFailure:failure};}
 assert.equal(last,901000);assert.equal(row.lastLiveFailure.attempts,8);
 const limited=youtubeLiveFailure(row,{kind:'rate-limited',message:'wait',at:1000,retryAt:2000000,cooldownScope:'live',recovery:''});assert.equal(limited.retryAt,2000000);
 assert.equal(youtubeLiveFailure(row,{kind:'rate-limited',message:'wait',at:1000,retryAt:11000,cooldownScope:'live',recovery:''}).retryAt,11000,'a provider deadline is not inflated by per-creator backoff');
 assert.equal(youtubeLiveFailure({...row,lastLiveFailure:undefined},{kind:'network-offline',message:'retry',at:1000,recovery:''}).retryAt,31000);
});
test('coverage separates successful observations, latest failures, retry waits and due-only IDs',()=>{
 const now=1000000;
 const rows=[{...channel(1),liveCheckedAt:now-10000},{...channel(2),liveCheckedAt:now-400000,lastLiveFailure:{at:now-5000,retryAt:now+30000,message:'timeout'}},{...channel(3),liveCheckedAt:now-5000,lastLiveFailure:{at:now-5000,retryAt:now+30000,message:'legacy failed timestamp'}},channel(4),{...channel(5),liveCheckedAt:now-400000}];
 const coverage=youtubeLiveCoverage(rows,now);assert.equal(coverage.total,5);assert.equal(coverage.recent,1);assert.equal(coverage.failed,2);assert.equal(coverage.cooling,2);assert.equal(coverage.unchecked,2);assert.deepEqual(new Set(coverage.dueIds),new Set([rows[3].id,rows[4].id]));assert.equal(coverage.nextRetryAt,now+30000);
});

test('live provider cooldown restores from durable follows without confusing individual or archive retry holds',async()=>{
 const {youtubeLiveCooldown}=await import('../src/lib/videos/youtube-live-health.ts');
 const now=1000000,rows=[{...channel(1),lastLiveFailure:{at:now,retryAt:now+10000,cooldownScope:'live'}},{...channel(2),lastLiveFailure:{at:now,retryAt:now+20000,cooldownScope:'all'}},{...channel(3),lastLiveFailure:{at:now,retryAt:now+90000}},{...channel(4),lastProviderFailure:{at:now,retryAt:now+100000,cooldownScope:'catalog'}}];
 assert.equal(youtubeLiveCooldown(rows,now).retryAt,now+20000);assert.equal(youtubeLiveCooldown(rows,now+20000),undefined);
});
