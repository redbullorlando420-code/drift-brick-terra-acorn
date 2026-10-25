import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createYoutubeTransport, youtubeRequestScope } from '../src/lib/remote/youtube-transport.ts';

test('upstream starts honor the shared gap across independent feed and archive lanes', async () => {
  let now = 0, active = 0, peak = 0;
  const starts = [];
  const transport = createYoutubeTransport({ now: () => now, sleep: async ms => { now += ms; }, gapMs: () => 1500,
    fetch: async () => {
      starts.push(now); peak = Math.max(peak, ++active);
      let pulled = false;
      return new Response(new ReadableStream({ async pull(controller) {
        if (pulled) return; pulled = true; await Promise.resolve(); now += 200; active--;
        controller.enqueue(new TextEncoder().encode('metadata')); controller.close();
      } }));
    },
  });
  const responses = await Promise.all(['/feeds/videos.xml', '/channel/UCtest/videos', '/youtubei/v1/browse'].map(path => transport.request(`https://www.youtube.com${path}`)));
  assert.equal(starts.length, 3); assert(starts.every((at,i)=>i===0 || at-starts[i-1]>=1500), 'independent slots retain shared request pacing');
  assert.equal(peak, 1, 'body transfers, not just fetch promises, are serialized');
  assert.deepEqual(await Promise.all(responses.map(response => response.text())), ['metadata', 'metadata', 'metadata']);
});

test('an endpoint live limit does not freeze catalog or feed requests', async () => {
  let now = 1000;
  const requests = [];
  const transport = createYoutubeTransport({ now: () => now, sleep: async ms => { now += ms; }, gapMs: () => 500,
    fetch: async url => { requests.push(url); return new Response('', { status: url.includes('/streams') ? 429 : 200 }); },
  });
  await assert.rejects(transport.request('https://www.youtube.com/channel/UCtest/streams'), error => error.cooldownScope === 'live');
  assert(transport.retryAt('live') > now);
  assert.equal(transport.retryAt('catalog'), undefined);
  await transport.request('https://www.youtube.com/channel/UCtest/videos');
  await transport.request('https://www.youtube.com/feeds/videos.xml');
  assert.equal(requests.length, 3);
  assert(transport.retryAt('live') > now, 'a healthy archive does not erase a live-only cooldown');
});

test('a confirmed Google network block holds queued requests and backs off between probes', async () => {
  let now = 1000, requests = 0;
  const transport = createYoutubeTransport({ now: () => now, sleep: async ms => { now += ms; }, gapMs: () => 500,
    fetch: async () => { requests++; return new Response('Our systems have detected unusual traffic from your computer network.', { status: 429 }); },
  });
  const results = await Promise.allSettled(['/youtubei/v1/browse', '/videos', '/feeds/videos.xml', '/watch?v=test', '/youtubei/v1/live_chat/get_live_chat'].map(path => transport.request(`https://www.youtube.com${path}`)));
  assert(results.every(row => row.status === 'rejected'));
  assert.equal(requests, 1);
  assert.equal(transport.cooldownScope(), 'all');
  assert.equal(transport.retryAt('catalog'), now + 15 * 60_000);
  now = transport.retryAt() + 1;
  await assert.rejects(transport.request('https://www.youtube.com/youtubei/v1/browse'), /unusual traffic/);
  assert.equal(transport.retryAt() - now, 30 * 60_000);
  now = transport.retryAt() + 1;
  await assert.rejects(transport.request('https://www.youtube.com/youtubei/v1/browse'));
  assert.equal(transport.retryAt() - now, 60 * 60_000);
  assert.equal(requests, 3);
});

test('Retry-After is respected without conflating feeds and catalogs', () => {
  const transport = createYoutubeTransport({ now: () => 1000 });
  assert.throws(() => transport.accept(new Response('', { status: 503, headers: { 'retry-after': '3600' } }), 1000, 'feed'));
  assert.equal(transport.retryAt('feed'), 3_601_000);
  assert.equal(transport.retryAt('catalog'), undefined);
  assert.equal(youtubeRequestScope('https://www.youtube.com/channel/UCtest/live'), 'live');
  assert.equal(youtubeRequestScope('https://www.youtube.com/watch?v=test'), 'details');
  assert.equal(youtubeRequestScope('https://www.youtube.com/youtubei/v1/next'), 'details');
  assert.equal(youtubeRequestScope('https://www.youtube.com/youtubei/v1/live_chat/get_live_chat'), 'details');
});

test('on-demand details use the paced queue without freezing archive on a details-only limit', async () => {
  let now = 1000;
  const transport = createYoutubeTransport({ now: () => now, sleep: async ms => { now += ms; }, gapMs: () => 1500,
    fetch: async url => new Response('', { status: url.includes('/next') ? 429 : 200 }),
  });
  await assert.rejects(transport.request('https://www.youtube.com/youtubei/v1/next'), error => error.cooldownScope === 'details');
  await transport.request('https://www.youtube.com/channel/UCtest/videos');
  assert.equal(transport.retryAt('catalog'), undefined);
  assert(transport.retryAt('details') > now);
});

test('an aborted queued request never starts an upstream transfer', async () => {
  let requests = 0;
  const controller = new AbortController();
  const transport = createYoutubeTransport({ gapMs: () => 0, fetch: async () => { requests++; return new Response('ok'); } });
  const first = transport.request('https://www.youtube.com/channel/UCtest/videos');
  const cancelled = transport.request('https://www.youtube.com/feeds/videos.xml', { signal: controller.signal });
  controller.abort();
  await first; await assert.rejects(cancelled);
  assert.equal(requests, 1);
});

test('request timeout starts after queue and pacing waits', async () => {
  const transport = createYoutubeTransport({ gapMs: () => 40,
    fetch: async (_url, init) => { init.signal?.throwIfAborted(); return new Response('ok'); },
  });
  await transport.request('https://www.youtube.com/channel/UCtest/videos');
  const response = await transport.request('https://www.youtube.com/feeds/videos.xml', { timeoutMs: 10 });
  assert.equal(await response.text(), 'ok');
});

test('a manual retry makes a paced fresh request without releasing cooled automatic jobs', async () => {
  let now = 1000, requests = 0;
  const starts = [];
  const transport = createYoutubeTransport({ now: () => now, sleep: async ms => { now += ms; }, gapMs: () => 1500,
    fetch: async (_url, init) => {
      assert.equal(init.manualRetry, undefined, 'local retry context never reaches fetch');
      starts.push(now);
      return ++requests === 1 ? new Response('unusual traffic from your computer network', { status: 429 }) : new Response('healthy');
    },
  });
  const url = 'https://www.youtube.com/channel/UCtest/videos';
  await assert.rejects(transport.request(url));
  const retry = transport.manualRetry();
  await assert.rejects(transport.request(url), /HTTP 429/);
  assert.equal(requests, 1);
  const response = await transport.request(url, { manualRetry: retry });
  assert.equal(await response.text(), 'healthy');
  assert.deepEqual(starts, [1000, 2500]);
  assert.equal(transport.retryAt(), undefined);
  await transport.request(url);
  assert.equal(requests, 3, 'healthy retry lets the normal archive continue');
});

test('a fresh rejection stops the manual operation until another explicit retry', async () => {
  let now = 1000, requests = 0;
  const transport = createYoutubeTransport({ now: () => now, sleep: async ms => { now += ms; }, gapMs: () => 500,
    fetch: async () => { requests++; return new Response('unusual traffic from your computer network', { status: 429 }); },
  });
  const url = 'https://www.youtube.com/youtubei/v1/browse';
  await assert.rejects(transport.request(url));
  const retry = transport.manualRetry();
  await assert.rejects(transport.request(url, { manualRetry: retry }));
  await assert.rejects(transport.request('https://www.youtube.com/feeds/videos.xml', { manualRetry: retry }));
  await assert.rejects(transport.request(url));
  assert.equal(requests, 2, 'one fresh probe, not repeated overrides for each page');
  await assert.rejects(transport.request(url, { manualRetry: transport.manualRetry() }));
  assert.equal(requests, 3, 'the user can make a separate explicit retry during the new wait');
});

test('an HTML network challenge holds page and live HTML reads without blocking healthy browse or RSS', async () => {
  let now = 1000;
  const requests = [];
  const transport = createYoutubeTransport({ now: () => now, sleep: async ms => { now += ms; }, gapMs: () => 1500,
    fetch: async url => { requests.push(url); return url.endsWith('/videos') ? new Response('unusual traffic from your computer network', { status: 429 }) : new Response('healthy'); },
  });
  await assert.rejects(transport.request('https://www.youtube.com/channel/UCtest/videos'), error => error.cooldownScope === 'page');
  assert.equal(transport.retryAt('catalog'), undefined);
  assert.equal(transport.retryAt('feed'), undefined);
  await assert.rejects(transport.request('https://www.youtube.com/channel/UCother/videos'));
  await assert.rejects(transport.request('https://www.youtube.com/channel/UCtest/streams'), error => error.cooldownScope === 'page');
  assert.equal(requests.length, 1, 'HTML cooldown prevents new page requests');
  await transport.request('https://www.youtube.com/youtubei/v1/browse');
  await transport.request('https://www.youtube.com/feeds/videos.xml');
  assert.equal(requests.length, 3);
  assert(transport.retryAt('page') > now, 'a healthy independent catalog does not clear the HTML cooldown');
});

test('a new endpoint limit cannot hide behind an older longer global cooldown', async () => {
  let now = 1000, requests = 0;
  const transport = createYoutubeTransport({ now: () => now, sleep: async ms => { now += ms; }, gapMs: () => 500,
    fetch: async () => { requests++; return new Response('rate limit', { status: 429 }); },
  });
  assert.throws(() => transport.accept(new Response('', { status: 429 }), now, 'catalog', true));
  const retry = transport.manualRetry();
  await assert.rejects(transport.request('https://www.youtube.com/feeds/videos.xml', { manualRetry: retry }), error => error.cooldownScope === 'feed');
  await assert.rejects(transport.request('https://www.youtube.com/feeds/videos.xml', { manualRetry: retry }), error => error.cooldownScope === 'feed');
  assert.equal(requests, 1);
});

test('archive request pacing supports earlier 80ms throughput and an explicit zero wait', async () => {
  for (const gapMs of [0, 80, 1500]) {
    let now = 0, requests = 0;
    const starts = [];
    const transport = createYoutubeTransport({ now: () => now, sleep: async ms => { now += ms; }, gapMs: () => gapMs,
      fetch: async () => { requests++; starts.push(now); return new Response('page'); },
    });
    for (let page = 0; page < 100; page++) await transport.request('https://www.youtube.com/youtubei/v1/browse');
    assert.equal(requests, 100);
    assert.equal(starts.at(-1), gapMs * 99, 'no hidden 1.5-second delay is applied inside the archive');
  }
});

test('two feed bodies complete while a slow archive remains in flight; extra feeds stay bounded', async()=>{
 let releaseArchive, releaseFeed; const heldArchive=new Promise(r=>releaseArchive=r),heldFeed=new Promise(r=>releaseFeed=r);
 let feedActive=0,peak=0,started=0,archiveDone=false;
 const transport=createYoutubeTransport({gapMs:()=>0,liveGapMs:()=>0,fetch:async url=>{
  const feed=url.includes('/feeds/');if(feed){started++;peak=Math.max(peak,++feedActive);}
  return new Response(new ReadableStream({async start(controller){
   if(!feed)await heldArchive;else if(url.endsWith('hold'))await heldFeed;
   controller.enqueue(new TextEncoder().encode('ok'));controller.close();if(feed)feedActive--;else archiveDone=true;
  }}));
 }});
 const archive=transport.request('https://www.youtube.com/channel/test/videos');
 const feeds=['hold','fast','third','fourth'].map(id=>transport.request('https://www.youtube.com/feeds/videos.xml?'+id));
 try{await feeds[1];await feeds[2];await feeds[3];assert.equal(archiveDone,false);assert.equal(started,4);assert.equal(peak,2);}
 finally{releaseFeed();releaseArchive();await Promise.all([archive,...feeds]);}
});
