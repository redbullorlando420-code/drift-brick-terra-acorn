import { test } from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { registerHooks } from 'node:module';
registerHooks({ resolve(s,c,n) { if(s.startsWith('@/'))return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c);try{return n(s,c)}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e} } });
const { createTwitchPullQueue } = await import('../src/lib/twitch-pull-queue.ts');
const { twitchRetryPatch, normalizeTwitchRetry, classifyTwitchFailure } = await import('../src/lib/videos/twitch-retry.ts');
const { selectTwitchRefreshBatch } = await import('../src/lib/videos/twitch-refresh-selection.ts');
const { runRefreshRemotes, runFollowRemote } = await import('../src/lib/remote/api.ts');
const { waitForCatalogCommit, setPullsPaused } = await import('../src/lib/pull-control.ts');
const job = id => ({id,handle:id,name:id,vodLimit:500,clipLimit:0});
const channel = handle => ({id:`tw:${handle}`,kind:'twitch',handle,title:handle});
const flush = async () => { for(let i=0;i<5;i++)await setImmediate(); };

test('focused queue is bounded, deduplicated and removable while paused', async () => {
  setPullsPaused(true); let pulls=0;
  const queue=createTwitchPullQueue({revision:()=>0,wait:signal=>waitForCatalogCommit(undefined,signal),live:async()=>{},pull:async()=>{pulls++;return 'saved';}});
  for(let i=0;i<8;i++)assert(queue.enqueue(job(String(i))));
  assert(!queue.enqueue(job('8'))); assert(!queue.enqueue(job('0')));
  queue.remove('3'); assert(queue.enqueue(job('8'))); assert.equal(queue.snapshot().waiting.length,8);
  await flush(); assert.equal(pulls,0);queue.stop();await flush();
  assert.equal(queue.snapshot().waiting.length,0);assert.equal(queue.snapshot().stopping,false);setPullsPaused(false);
});

test('each queued creator runs exactly once, serially, with live priority and captured budgets',async()=>{
  const order=[];let active=0,peak=0;
  const queue=createTwitchPullQueue({revision:()=>1,wait:async()=>{},live:async()=>{order.push('live');},pull:async value=>{peak=Math.max(peak,++active);order.push(`pull:${value.id}:${value.vodLimit}:${value.clipLimit}`);await setImmediate();active--;return 'saved';}});
  const first=job('a');queue.enqueue(first);first.vodLimit=2000;queue.enqueue({...job('b'),clipLimit:250});await flush();
  assert.equal(peak,1);assert.deepEqual(order,['live','pull:a:500:0','live','pull:b:500:250']);assert.equal(queue.snapshot().active,null);
});

test('removing the last paused job releases its owner before accepting a new job',async()=>{
  setPullsPaused(true);
  const queue=createTwitchPullQueue({revision:()=>0,wait:signal=>waitForCatalogCommit(undefined,signal),live:async()=>{},pull:async()=> 'saved'});
  queue.enqueue(job('a'));queue.remove('a');assert(!queue.enqueue(job('b')));await flush();assert.equal(queue.snapshot().stopping,false);
  assert(queue.enqueue(job('b')));queue.stop();await flush();setPullsPaused(false);
});

test('stop preserves the in-flight batch and prevents later creators; a fresh queue still works',async()=>{
  let finish;const pulls=[];
  const queue=createTwitchPullQueue({revision:()=>0,wait:async()=>{},live:async()=>{},pull:async value=>{pulls.push(value.id);if(value.id==='a')await new Promise(resolve=>{finish=resolve});return 'saved';}});
  queue.enqueue(job('a'));queue.enqueue(job('b'));await flush();queue.stop();assert(queue.snapshot().stopping);assert(!queue.enqueue(job('c')));
  finish();await flush();assert.deepEqual(pulls,['a']);assert.equal(queue.snapshot().waiting.length,0);assert(queue.enqueue(job('c')));await flush();assert.deepEqual(pulls,['a','c']);
});

test('global cancellation clears all remaining creators instead of restarting with a fresh revision',async()=>{
  let revision=1;const pulls=[];
  const queue=createTwitchPullQueue({revision:()=>revision,wait:async(_,started)=>{if(started!==revision)throw Error('cancelled');},live:async()=>{},pull:async value=>{pulls.push(value.id);revision++;return 'saved';}});
  queue.enqueue(job('a'));queue.enqueue(job('b'));await flush();assert.deepEqual(pulls,['a']);assert.equal(queue.snapshot().waiting.length,0);
});

test('failed creator is not retried automatically or allowed to pin healthy waiting creators',async()=>{
  const pulls=[];const queue=createTwitchPullQueue({revision:()=>0,wait:async()=>{},live:async()=>{throw Error('live offline');},pull:async value=>{pulls.push(value.id);if(value.id==='a')throw Error('integrity challenge');return 'saved';}});
  queue.enqueue(job('a'));queue.enqueue(job('b'));await flush();assert.deepEqual(pulls,['a','b']);assert.equal(queue.snapshot().waiting.length,0);
});

test('retry budgets are exponential, bounded and independently reset by scope',()=>{
  let value=channel('retry');const failure=classifyTwitchFailure('HTTP 429',1000);
  for(let i=1;i<=10;i++){value={...value,...twitchRetryPatch(value,'archive',failure,1000)};assert.equal(value.twitchArchiveRetry.attempts,Math.min(8,i));assert.equal(value.twitchArchiveRetry.retryAt,1000+Math.min(300000,15000*2**(Math.min(8,i)-1)));}
  value={...value,...twitchRetryPatch(value,'live',failure,2000)};const archive=value.twitchArchiveRetry;
  value={...value,...twitchRetryPatch(value,'live')};assert.equal(value.twitchArchiveRetry,archive);assert.equal(value.twitchLiveRetry,undefined);
  value={...value,...twitchRetryPatch(value,'archive')};assert.equal(value.twitchArchiveRetry,undefined);assert.equal(value.lastProviderFailure,undefined);
  for(const invalid of [{attempts:99,retryAt:1},{attempts:1,retryAt:Infinity},{attempts:1.5,retryAt:1}])assert.equal(normalizeTwitchRetry(invalid),undefined);
});

test('fair rotation skips only the failing scope and resumes eligible creators after reload',()=>{
  const a={...channel('a'),twitchArchiveRetry:{attempts:1,retryAt:2000}},b={...channel('b'),twitchLiveRetry:{attempts:1,retryAt:2000}},c=channel('c');
  assert.deepEqual(selectTwitchRefreshBatch([a,b,c],3,0,'archive',1000).channels.map(c=>c.handle),['b','c']);
  assert.deepEqual(selectTwitchRefreshBatch([a,b,c],3,0,'live',1000).channels.map(c=>c.handle),['a','c']);
  assert.equal(selectTwitchRefreshBatch([a,b,c],3,0,'archive',2001).channels.length,3);
});

test('Twitch failure taxonomy provides actionable recovery with bounded messages',()=>{
  for(const [message,kind] of [['HTTP 429','rate-limited'],['failed integrity check','integrity-challenge'],['first exceeds 100','public-page-limit'],['404 not found','unavailable'],['malformed JSON','malformed'],['network timed out','network-offline'],['metadata response budget exceeded','response-budget']]){
    const result=classifyTwitchFailure(message,123);assert.equal(result.kind,kind);assert(result.recovery.length>30);assert.equal(result.at,123);
  }
  assert.equal(classifyTwitchFailure('x'.repeat(1000)).message.length,240);
});

test('actual live API respects durable cooldown and retains independent archive failures on success',async()=>{
  const original=globalThis.fetch;let requests=0;const archiveFailure=classifyTwitchFailure('integrity challenge');
  globalThis.fetch=async()=>{requests++;return Response.json({data:{user:{id:'provider',stream:null}}});};
  try{
    const saved={...channel('livebudget'),lastProviderFailure:archiveFailure,twitchArchiveRetry:{attempts:2,retryAt:Date.now()+30000},twitchLiveRetry:{attempts:1,retryAt:Date.now()+15000}};
    let result=await runRefreshRemotes({channels:[saved],twitchLiveOnly:true});assert.equal(requests,0);assert.deepEqual(result.liveCheckedIds,[]);assert.equal(result.channels[0].lastProviderFailure,archiveFailure);
    result=await runRefreshRemotes({channels:[{...saved,twitchLiveRetry:undefined}],twitchLiveOnly:true});assert.equal(requests,1);assert.equal(result.channels[0].twitchArchiveRetry.attempts,2);assert.equal(result.channels[0].lastProviderFailure.kind,'integrity-challenge');assert.equal(result.channels[0].twitchLiveRetry,undefined);assert.deepEqual(result.liveCheckedIds,[saved.id]);
  }finally{globalThis.fetch=original;}
});

test('actual live API rejects a global integrity error instead of retiring cached live cards',async()=>{
  const original=globalThis.fetch;globalThis.fetch=async()=>Response.json({data:{user:{id:'provider',stream:null}},errors:[{message:'failed integrity check'}]});
  try{const result=await runRefreshRemotes({channels:[channel('challenge_live')],twitchLiveOnly:true});assert.deepEqual(result.liveCheckedIds,[]);assert.equal(result.channels[0].lastLiveFailure.kind,'integrity-challenge');assert.equal(result.channels[0].twitchLiveRetry.attempts,1);assert.equal(result.channels[0].lastProviderFailure,undefined);}finally{globalThis.fetch=original;}
});

test('actual focused API applies finite VOD budget, legal page sizes and explicit skip-clips',async()=>{
  const original=globalThis.fetch;const requests=[];
  globalThis.fetch=async(_,options)=>{const body=JSON.parse(options.body);requests.push(body);assert(body.query.includes('videos('));assert(body.variables.first<=100);const start=requests.length*100;return Response.json({data:{user:{id:'focused',displayName:'Focused',stream:null,videos:{edges:Array.from({length:body.variables.first},(_,i)=>({node:{id:String(start+i),title:'VOD',publishedAt:'2026-09-01T00:00:00Z'}})),pageInfo:{hasNextPage:true,endCursor:`after-${start}`}}}}});};
  try{const result=await runFollowRemote({query:'focused_budget',kind:'twitch',clipLimit:0,twitchVodLimit:500});assert.equal(requests.length,5);assert.equal(result.videos.length,500);assert.equal(result.channel.twitchArchiveDiagnostics.stopReason,'entry-budget');assert(result.channel.twitchArchiveCursor);}finally{globalThis.fetch=original;}
});

test('actual routine API saves partial clip failure in recent scope while archive and live scopes stay healthy',async()=>{
  const original=globalThis.fetch;
  globalThis.fetch=async(_,options)=>{const body=JSON.parse(options.body);return Response.json(body.query.includes('clips(')?{errors:[{message:'HTTP 429 too many requests'}]}:{data:{user:{id:'partial',stream:null,videos:{edges:Array.from({length:100},(_,i)=>({node:{id:String(i),title:'VOD'}})),pageInfo:{hasNextPage:true,endCursor:'accepted'}}}}});};
  try{const result=await runRefreshRemotes({channels:[channel('partial_budget')],twitchRoutine:true});assert.equal(result.videos.length,100);assert.equal(result.channels[0].recentPull.failure.kind,'rate-limited');assert.equal(result.channels[0].recentPull.failures,1);assert.equal(result.channels[0].twitchArchiveRetry,undefined);assert.equal(result.channels[0].lastProviderFailure,undefined);assert.equal(result.refreshedIds.length,0);assert.equal(result.channels[0].twitchLiveRetry,undefined);assert.deepEqual(result.liveCheckedIds,['tw:partial_budget']);assert(result.retryAt['tw:partial_budget']>Date.now());}finally{globalThis.fetch=original;}
});
