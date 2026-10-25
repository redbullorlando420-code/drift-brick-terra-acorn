import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(s,c,n) { if(s.startsWith('@/')) return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c); try{return n(s,c)}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e} } });
const { readProviderBody, createProviderMetadataTransport } = await import('../src/lib/remote/provider-body.ts');
const { createProviderMetadataCache } = await import('../src/lib/remote/provider-metadata-cache.ts');
const { PROVIDER_BUDGETS, ProviderBudgetError } = await import('../src/lib/provider-budgets.ts');
const { createYoutubeTransport, setYoutubeRequestGap } = await import('../src/lib/remote/youtube-transport.ts');
setYoutubeRequestGap(0);
const encode = text => new TextEncoder().encode(text);

test('metadata reader counts decompressed bytes across multibyte/chunked responses', async () => {
  const expected = encode('{"title":"温泉 café"}');
  const response = new Response(new ReadableStream({ start(c) { for (let i=0;i<expected.length;i+=2) c.enqueue(expected.slice(i,i+2)); c.close(); } }), {headers:{'content-length':'2','content-encoding':'gzip'}});
  const actual = await readProviderBody(response, {maxBytes:expected.length});
  assert.deepEqual(actual, expected);
  assert.equal(JSON.parse(new TextDecoder().decode(actual)).title,'温泉 café');
});
test('unknown-length oversized success cancels before publishing a truncated page', async () => {
  let cancelled = false;
  const response = new Response(new ReadableStream({ start(c) { c.enqueue(new Uint8Array(4)); c.enqueue(new Uint8Array(5)); }, cancel() { cancelled=true; } }));
  await assert.rejects(readProviderBody(response,{maxBytes:8}), error => error instanceof ProviderBudgetError && error.budget==='bytes');
  assert(cancelled); assert.equal(response.body.locked,false);
});
test('bounded error prefix cancels large error bodies without treating them as valid JSON', async () => {
  let cancelled=false;
  const response=new Response(new ReadableStream({start(c){c.enqueue(encode('unusual traffic from your computer network'+'x'.repeat(500)));},cancel(){cancelled=true;}}),{status:429});
  const prefix=await readProviderBody(response,{maxBytes:64,prefix:true});
  assert.equal(prefix.length,64); assert.match(new TextDecoder().decode(prefix),/unusual traffic/); assert(cancelled);
});
test('stalled bodies and aborted reads release their stream instead of retaining an active slot', async () => {
  for(const external of [false,true]) {
    let cancelled=false;
    const response=new Response(new ReadableStream({cancel(){cancelled=true;}}));
    const controller=new AbortController();
    const pending=readProviderBody(response,{timeoutMs:30,signal:controller.signal});
    if(external) controller.abort(new Error('user cancelled'));
    await assert.rejects(pending,external?/user cancelled/:/timed out/);
    assert(cancelled); assert.equal(response.body.locked,false);
  }
});
test('shared transport holds its slot until the complete body finishes, skips aborted queued work', async () => {
  const controllers=[], starts=[]; let active=0,peak=0;
  const transport=createProviderMetadataTransport(1,async url=>{starts.push(url);peak=Math.max(peak,++active);return new Response(new ReadableStream({start(c){controllers.push(c);}}));});
  const first=transport.request('https://fixture.invalid/first'); await Promise.resolve();
  const signal=new AbortController(); const cancelled=transport.request('https://fixture.invalid/cancel',{signal:signal.signal});
  const next=transport.request('https://fixture.invalid/next'); signal.abort(new Error('cancelled'));
  await assert.rejects(cancelled,/cancelled/); assert.deepEqual(transport.snapshot(),{active:1,queued:1,concurrency:1,maxQueued:80});
  controllers[0].enqueue(encode('first'));active--;controllers[0].close();assert.equal(await(await first).text(),'first');
  await new Promise(resolve=>setImmediate(resolve)); assert.deepEqual(starts,['https://fixture.invalid/first','https://fixture.invalid/next']);
  controllers[1].enqueue(encode('next'));active--;controllers[1].close(); assert.equal(await(await next).text(),'next');assert.equal(peak,1);
});
test('shared queue rejects excess jobs and cancellation immediately frees waiting capacity', async () => {
  let body;
  const transport=createProviderMetadataTransport(1,async()=>new Response(new ReadableStream({start(c){body=c;}})));
  const active=transport.request('https://fixture.invalid/active'); await Promise.resolve();
  const aborters=Array.from({length:PROVIDER_BUDGETS.queuedRequests},()=>new AbortController());
  const waiting=aborters.map((controller,i)=>transport.request(`https://fixture.invalid/${i}`,{signal:controller.signal}).catch(error=>error));
  await assert.rejects(transport.request('https://fixture.invalid/excess'),error=>error instanceof ProviderBudgetError && error.budget==='queue');
  for(const controller of aborters) controller.abort(new Error('cancelled'));
  await Promise.all(waiting); assert.equal(transport.snapshot().queued,0); body.close(); await active;
});
test('transport reconstruction removes compressed length headers and preserves JSON/status', async () => {
  const transport=createProviderMetadataTransport(1,async()=>new Response('{"ok":true}',{status:201,headers:{'content-type':'application/json','content-encoding':'gzip','content-length':'200'}}));
  const response=await transport.request('https://fixture.invalid/json'); assert.equal(response.status,201);assert.equal(response.headers.get('content-length'),null);assert.equal(response.headers.get('content-encoding'),null);assert.deepEqual(await response.json(),{ok:true});
});
test('YouTube oversized pages release serial transfer and do not impose a rate cooldown', async () => {
  let cancelled=false,n=0;
  const transport=createYoutubeTransport({gapMs:()=>0,fetch:async()=>++n===1?new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(PROVIDER_BUDGETS.responseBytes+1));},cancel(){cancelled=true;}})):Response.json({healthy:true})});
  await assert.rejects(transport.request('https://www.youtube.com/youtubei/v1/browse'),ProviderBudgetError);
  assert(cancelled);assert.equal(transport.retryAt(),undefined);
  assert.deepEqual(await(await transport.request('https://www.youtube.com/feeds/videos.xml')).json(),{healthy:true});
});
test('large YouTube HTTP errors retain real cooldown/challenge classification with a bounded prefix', async () => {
  let cancelled=false;
  const transport=createYoutubeTransport({gapMs:()=>0,fetch:async()=>new Response(new ReadableStream({start(c){c.enqueue(encode('unusual traffic from your computer network'));c.enqueue(new Uint8Array(PROVIDER_BUDGETS.errorPrefixBytes+1));},cancel(){cancelled=true;}}),{status:429})});
  await assert.rejects(transport.request('https://www.youtube.com/youtubei/v1/browse'),error=>error.status===429 && error.cooldownScope==='all');assert(cancelled);
});
test('a stalled YouTube rate-limit body still records the HTTP cooldown', async () => {
  let cancelled=false;
  const transport=createYoutubeTransport({gapMs:()=>0,fetch:async()=>new Response(new ReadableStream({cancel(){cancelled=true;}}),{status:429})});
  await assert.rejects(transport.request('https://www.youtube.com/youtubei/v1/browse',{timeoutMs:30}),error=>error.status===429);
  assert(cancelled);assert(transport.retryAt()>Date.now());
});
test('many tiny chunks are assembled across fixed blocks without changing bytes', async () => {
  const expected=new Uint8Array(70_001).fill(42);let offset=0;
  const response=new Response(new ReadableStream({pull(c){if(offset===expected.length)c.close();else c.enqueue(expected.subarray(offset,++offset));}}));
  assert.deepEqual(await readProviderBody(response,{maxBytes:expected.length}),expected);
});
test('warm metadata cache enforces byte and entry limits, LRU, expiry and unretained large entries', () => {
  let now=0;const cache=createProviderMetadataCache({maxEntries:3,maxBytes:10,maxEntryBytes:6,ttlMs:100,now:()=>now});
  const a={id:'a'};assert(cache.set('a',a,4));assert(cache.set('b',{id:'b'},4));assert.equal(cache.get('a'),a);
  assert(cache.set('c',{id:'c'},4));assert.equal(cache.get('b'),undefined);assert.equal(cache.snapshot().estimatedBytes,8);
  assert.equal(cache.set('a',{id:'too big'},7),false);assert.equal(cache.get('a'),undefined);assert.equal(cache.snapshot().estimatedBytes,4);
  now=100;assert.equal(cache.get('c'),undefined);assert.equal(cache.snapshot().estimatedBytes,0);
  for(let i=0;i<100;i++){cache.set(String(i),{id:i},1);assert(cache.snapshot().entries<=3);assert(cache.snapshot().estimatedBytes<=10);}
});

const {runRefreshRemotes,runFollowRemote,classifyProviderFailure}=await import('../src/lib/remote/api.ts');
const {cachedAdultFetch,adultPullCacheSnapshot}=await import('../src/lib/remote/adult-pull-cache.ts');
test('adult metadata budget rejects an oversized replacement and preserves a still-valid cached page', async () => {
  const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>++calls===1?Response.json({videos:['accepted']}):new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(PROVIDER_BUDGETS.responseBytes+1));}}),{headers:{'content-type':'application/json'}});
  const url='https://fixture.invalid/adult-budget';
  try {
    assert.deepEqual(await(await cachedAdultFetch(url)).json(),{videos:['accepted']});
    const before=adultPullCacheSnapshot();
    await assert.rejects(cachedAdultFetch(url,{cacheTtlMs:-1}),ProviderBudgetError);
    assert.deepEqual(adultPullCacheSnapshot(),before);
    assert.deepEqual(await(await cachedAdultFetch(url)).json(),{videos:['accepted']});assert.equal(calls,2);
  }finally{globalThis.fetch=original;}
});
test('actual Twitch refresh rejects oversized metadata without losing a saved cursor or claiming exhaustion', async () => {
  const original=globalThis.fetch;let cancelled=false;
  globalThis.fetch=async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(PROVIDER_BUDGETS.responseBytes+1));},cancel(){cancelled=true;}}));
  const cursor=JSON.stringify({v:1,stage:'ARCHIVE',after:'safe-position'});
  const saved={id:'tw:budget-refresh',kind:'twitch',handle:'budget-refresh',title:'Budget creator',twitchArchiveCursor:cursor};
  try {
    const result=await runRefreshRemotes({channels:[saved],twitchRoutine:true});
    assert(cancelled);assert.equal(result.videos.length,0);assert.equal(result.channels[0].twitchArchiveCursor,cursor);assert.equal(result.channels[0].twitchArchiveExhaustedAt,undefined);assert.equal(result.channels[0].recentPull.failure.kind,'response-budget');assert.equal(result.channels[0].lastProviderFailure,undefined);assert.deepEqual(result.refreshedIds,[]);
    assert.equal(classifyProviderFailure('youtube',new ProviderBudgetError('queue','full')).kind,'response-budget');
  }finally{globalThis.fetch=original;}
});
test('YouTube accepts complete earlier pages but holds the rejected byte-budget page for retry', async () => {
  const original=globalThis.fetch;let calls=0;
  const id='UCBudget1234567890123456';
  globalThis.fetch=async()=>++calls===1?Response.json({onResponseReceivedActions:[{appendContinuationItemsAction:{continuationItems:[
    {videoRenderer:{videoId:'budget00001',title:{simpleText:'Accepted upload'}}},
    {continuationItemRenderer:{continuationEndpoint:{continuationCommand:{token:'accepted-page-position'}}}},
  ]}}]}):new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(PROVIDER_BUDGETS.responseBytes+1));}}));
  try {
    const channel={id:`yt:${id}`,channelId:id,kind:'youtube',handle:`https://www.youtube.com/channel/${id}`,title:'Budget creator',catalogCursor:'resume-position'};
    const result=await runRefreshRemotes({channels:[channel],youtubeCatalog:true,youtubeVideoLimit:100});
    assert.equal(result.videos.length,1);assert.equal(result.channels[0].catalogCursor,'accepted-page-position');
    assert.equal(result.channels[0].catalogExhaustedAt,undefined);assert.equal(result.channels[0].lastProviderFailure.kind,'response-budget');assert.equal(calls,2);
  }finally{globalThis.fetch=original;}
});
test('Twitch byte-budget failure after a complete page retains its VODs and next-page checkpoint', async () => {
  const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>++calls===1?Response.json({data:{user:{id:'budget-partial',displayName:'Budget partial',videos:{
    edges:Array.from({length:100},(_,i)=>({node:{id:String(1000+i),title:'Accepted VOD',lengthSeconds:60}})),
    pageInfo:{hasNextPage:true,endCursor:'accepted-twitch-position'},
  }}}}):new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array(PROVIDER_BUDGETS.responseBytes+1));}}));
  try {
    const result=await runFollowRemote({query:'budget-partial',kind:'twitch',twitchArchiveCursor:JSON.stringify({v:1,stage:'ARCHIVE',after:'resume'})});
    assert.equal(result.videos.length,100);assert.equal(JSON.parse(result.channel.twitchArchiveCursor).after,'accepted-twitch-position');
    assert.equal(result.channel.twitchArchiveExhaustedAt,undefined);assert.equal(result.channel.lastProviderFailure.kind,'response-budget');assert.equal(calls,2);
  }finally{globalThis.fetch=original;}
});
test('a focused Twitch result above the warm row limit is delivered whole and never retained as a second graph', async()=>{
  const original=globalThis.fetch;let calls=0;
  globalThis.fetch=async(_url,init)=>{
    calls++;const {variables,query}=JSON.parse(init.body);
    const shelf=/type:(ARCHIVE|HIGHLIGHT|UPLOAD)/.exec(query)?.[1];
    const start=Number(variables.after||0);
    const edges=shelf==='ARCHIVE'?Array.from({length:100},(_,i)=>({node:{id:String(start+i+1),title:'Archive VOD',lengthSeconds:3600}})):[];
    return Response.json({data:{user:{id:'budget-focused',displayName:'Budget focused',videos:{edges,pageInfo:{hasNextPage:shelf==='ARCHIVE'&&start<200,endCursor:String(start+100)}}}}});
  };
  try {
    const cursor=JSON.stringify({v:1,stage:'ARCHIVE',after:null});
    const first=await runFollowRemote({query:'budget-focused',kind:'twitch',twitchArchiveCursor:cursor});
    assert.equal(first.videos.length,300);assert.equal(first.channel.cache.scope,'uncached');
    const before=calls; const second=await runFollowRemote({query:'budget-focused',kind:'twitch',twitchArchiveCursor:cursor});
    assert.equal(second.videos.length,300);assert(calls>before,'focused history was not served from a retained graph');
  }finally{globalThis.fetch=original;}
});
