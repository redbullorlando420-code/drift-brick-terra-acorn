import { registerHooks } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
registerHooks({ resolve(s,c,n) { if(s.startsWith('@/')) return n(new URL('../src/'+s.slice(2)+'.ts',import.meta.url).href,c); try{return n(s,c)}catch(e){if(s.startsWith('.')&&!/\.[a-z]+$/i.test(s))return n(s+'.ts',c);throw e} } });
const { runRefreshRemotes } = await import('../src/lib/remote/api.ts');
const { setYoutubeRequestGap } = await import('../src/lib/remote/youtube-transport.ts');
setYoutubeRequestGap(250);
const id = 'UCAbCdEf1234567890123456';
const channel = { id:`yt:${id}`, channelId:id, handle:'Creator', title:'Creator', kind:'youtube' };
const feed = `<feed><title>Creator</title><author><name>Creator</name></author><entry><yt:videoId>healthy0001</yt:videoId><title>New upload</title><published>2026-10-01T12:00:00Z</published></entry></feed>`;
const oldFetch = globalThis.fetch;

test('a healthy routine refresh reads RSS once and clears a stale creator failure', async () => {
  const requests = [];
  globalThis.fetch = async url => { requests.push(String(url)); assert(String(url).includes('/feeds/')); return new Response(feed); };
  try {
    const result = await runRefreshRemotes({ channels:[{...channel, lastProviderFailure:{kind:'rate-limited',message:'old failure',at:1}}] });
    assert.equal(requests.length,1);
    assert.equal(result.videos.length,1);
    assert.equal(result.channels[0].lastProviderFailure,undefined);
    assert.equal(result.channels[0].liveCheckedAt,undefined,'a feed read cannot claim a live observation');
  } finally { globalThis.fetch = oldFetch; }
});

test('a live-only HTTP 429 does not stop a healthy creator archive', async () => {
  const requests = [];
  const rows = Array.from({length:30},(_,i)=>({videoRenderer:{videoId:`video${String(i).padStart(6,'0')}`,title:{simpleText:`Upload ${i}`}}}));
  const html = `<title>Creator - YouTube</title><script>var ytInitialData=${JSON.stringify({metadata:{channelMetadataRenderer:{externalId:id}},contents:{twoColumnBrowseResultsRenderer:{tabs:[{tabRenderer:{selected:true,title:'Videos',content:{richGridRenderer:{contents:rows}}}}]}}})};</script>`;
  globalThis.fetch = async (url, init) => {
    requests.push(String(url));
    if(String(url).includes('/youtubei/') && JSON.parse(init.body).browseId === id) return new Response('rate limit',{status:429});
    if(String(url).includes('/feeds/')) return new Response('<feed><title>Creator</title></feed>');
    if(String(url).includes('/youtubei/')) return Response.json({onResponseReceivedActions:[{appendContinuationItemsAction:{continuationItems:rows}}]});
    assert(String(url).endsWith('/videos'),'archive must not make an inline live/fallback request');
    return new Response(html);
  };
  try {
    const live = await runRefreshRemotes({channels:[channel],youtubeLiveOnly:true});
    assert.equal(live.channels[0].lastProviderFailure.cooldownScope,'live');
    assert.equal(live.channels[0].lastLiveFailure.cooldownScope,'live');
    assert.equal(live.providerRetryAt,undefined,'live-only failure cannot set the archive cooldown');
    const catalog = await runRefreshRemotes({channels:[live.channels[0]],youtubeCatalog:true,youtubeVideoLimit:30});
    assert.equal(catalog.videos.length,30);
    assert.equal(catalog.refreshedIds.length,1);
    assert.equal(catalog.channels[0].lastProviderFailure,undefined);
    assert.equal(catalog.channels[0].lastLiveFailure.cooldownScope,'live', 'a catalog success must not pretend the live check succeeded');
    assert.equal(catalog.providerRetryAt,undefined);
    assert.equal(requests.length,3,'one live request, RSS and a public uploads catalog request');
    assert(!requests.some(url=>url.endsWith('/videos')), 'confirmed archives do not need a channel HTML page');
    assert(!requests.some(url=>url.endsWith('/live')));
  } finally { globalThis.fetch = oldFetch; }
});

test('manual force crosses server guards, recovers from RSS 404, and continues the catalog', async () => {
  const requests = [];
  let healthy = false;
  const rows = Array.from({ length: 30 }, (_, i) => ({ videoRenderer: { videoId: `first${String(i).padStart(6, '0')}`, title: { simpleText: `Upload ${i}` } } }));
  const root = { contents: { twoColumnBrowseResultsRenderer: { tabs: [{ tabRenderer: { selected: true, title: 'Videos', content: { richGridRenderer: { contents: [...rows, { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: 'next-page' } } } }] } } } }] } } };
  const html = `<title>Creator - YouTube</title><script>var ytInitialData=${JSON.stringify(root)};</script><script>ytcfg.set({"INNERTUBE_API_KEY":"test-key","INNERTUBE_CLIENT_VERSION":"test-version"});</script>`;
  globalThis.fetch = async (url, init) => {
    requests.push(String(url));
    if (!healthy) return new Response('unusual traffic from your computer network', { status: 429 });
    if (String(url).includes('/feeds/')) return new Response('', { status: 404 });
    if (String(url).includes('/youtubei/')) {
      if (JSON.parse(init.body).browseId) {
        assert.equal(JSON.parse(init.body).browseId, `VLUU${id.slice(2)}`);
        return Response.json(root);
      }
      assert.equal(JSON.parse(init.body).continuation, 'next-page');
      return Response.json({ onResponseReceivedActions: [{ appendContinuationItemsAction: { continuationItems: Array.from({ length: 30 }, (_, i) => ({ videoRenderer: { videoId: `older${String(i).padStart(6, '0')}`, title: { simpleText: `Older ${i}` } } })) } }] });
    }
    assert(String(url).endsWith('/videos'));
    return new Response(html);
  };
  try {
    const blocked = await runRefreshRemotes({ channels: [channel], youtubeCatalog: true });
    assert(blocked.providerRetryAt > Date.now());
    assert.equal(requests.length, 1);
    await runRefreshRemotes({ channels: [channel], youtubeCatalog: true });
    await runRefreshRemotes({ channels: [channel], youtubeCatalog: true, forceYoutube: true, youtubeBackground: true });
    assert.equal(requests.length, 1, 'automatic work cannot acquire a manual override');
    healthy = true;
    const recovered = await runRefreshRemotes({ channels: [channel], youtubeCatalog: true, forceYoutube: true, youtubeVideoLimit: 60 });
    assert.equal(recovered.refreshedIds.length, 1);
    assert.equal(recovered.videos.length, 60);
    assert.equal(new Set(recovered.videos.map(video => video.remote.videoId)).size, 60);
    assert.equal(recovered.providerRetryAt, undefined);
    assert.equal(requests.length, 4, 'fresh RSS, uploads catalog, and continuation requests reach the provider');
  } finally { globalThis.fetch = oldFetch; }
});

test('a newly rejected forced catalog does not re-probe RSS and every following creator', async () => {
  let requests = 0;
  globalThis.fetch = async () => { requests++; return new Response('unusual traffic from your computer network', { status: 429 }); };
  try {
    await runRefreshRemotes({ channels: [channel], youtubeCatalog: true });
    assert.equal(requests, 1);
    const result = await runRefreshRemotes({ channels: [channel, { ...channel, id: 'yt:second', channelId: 'UCSecond1234567890123456' }], youtubeCatalog: true, forceYoutube: true });
    assert.equal(requests, 2, 'one fresh upstream probe in this manual operation');
    assert.equal(result.videos.length, 0);
    assert(result.providerRetryAt > Date.now());
    assert.equal(result.channels[0].lastProviderFailure.cooldownScope, 'all');
  } finally { globalThis.fetch = oldFetch; }
});

test('a forced playlist retry resumes older public pages during the old cooldown', async () => {
  const requests = [];
  const playlist = { id: 'ytpl:PLManualRetry123', kind: 'youtube', handle: 'https://www.youtube.com/playlist?list=PLManualRetry123', title: 'Playlist', catalogCursor: 'older-page' };
  const entry = { playlistVideoRenderer: { videoId: 'playlist001', title: { simpleText: 'Older saved upload' } } };
  globalThis.fetch = async (url, init) => {
    requests.push(String(url));
    if (init?.method === 'POST') {
      assert.equal(JSON.parse(init.body).continuation, 'older-page');
      return Response.json({ onResponseReceivedActions: [{ appendContinuationItemsAction: { continuationItems: [entry] } }] });
    }
    return new Response('<script>var ytInitialData={"contents":[]};</script><script>ytcfg.set({"INNERTUBE_API_KEY":"test-key"});</script>');
  };
  try {
    const result = await runRefreshRemotes({ channels: [playlist], youtubeCatalog: true, forceYoutube: true });
    assert.equal(requests.length, 1, 'saved playlists resume without fetching their HTML page');
    assert.equal(result.videos.length, 1);
    assert.equal(result.videos[0].remote.videoId, 'playlist001');
    assert.equal(result.channels[0].catalogCursor, undefined);
    assert.equal(result.providerRetryAt, undefined);
  } finally { globalThis.fetch = oldFetch; }
});
