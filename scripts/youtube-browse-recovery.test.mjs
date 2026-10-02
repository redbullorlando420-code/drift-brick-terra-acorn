import { registerHooks } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
registerHooks({ resolve(s, c, n) { if (s.startsWith('@/')) return n(new URL('../src/' + s.slice(2) + '.ts', import.meta.url).href, c); try { return n(s, c); } catch (e) { if (s.startsWith('.') && !/\.[a-z]+$/i.test(s)) return n(s + '.ts', c); throw e; } } });
const { runRefreshRemotes } = await import('../src/lib/remote/api.ts');
const original = globalThis.fetch;
const id = 'UCVerified12345678901234';
const source = { id: `yt:${id}`, channelId: id, kind: 'youtube', title: 'Saved creator', handle: '@saved' };
const row = i => ({ lockupViewModel: { contentType: 'LOCKUP_CONTENT_TYPE_VIDEO', contentId: `recover${String(i).padStart(4, '0')}`, metadata: { lockupMetadataViewModel: { title: { content: `Video ${i}` } } } } });
const next = token => ({ continuationItemViewModel: { continuationCommand: { innertubeCommand: { continuationCommand: { token } } } } });
const root = items => ({ metadata: { playlistMetadataRenderer: { title: 'Uploads' } }, contents: { twoColumnBrowseResultsRenderer: { tabs: [{ tabRenderer: { selected: true, content: { sectionListRenderer: { contents: [{ itemSectionRenderer: { contents: items } }] } } } }] } } });

test('unavailable creators cannot invoke HTML recovery and block the next healthy catalog', async () => {
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push(String(url));
    if (String(url).includes('/feeds/')) return new Response('', { status: 404 });
    assert(String(url).includes('/youtubei/'), 'HTML would return a network challenge');
    const target = JSON.parse(init.body).browseId;
    return Response.json(target.includes('Missing') ? { alerts: [{ alertRenderer: { type: 'ERROR', text: { runs: [{ text: 'The playlist does not exist.' }] } } }] } : root([row(1)]));
  };
  try {
    const result = await runRefreshRemotes({ channels: [{ ...source, id: 'yt:UCMissing12345678901234', channelId: 'UCMissing12345678901234' }, source], youtubeCatalog: true, youtubeRequestGapMs: 0 });
    assert.equal(result.refreshedIds.length, 1);
    assert.equal(result.videos.length, 1);
    assert.equal(result.providerRetryAt, undefined);
    assert.equal(result.channels[0].lastProviderFailure.kind, 'unavailable');
    assert.equal(result.channels[1].title, 'Saved creator');
    assert.equal(requests.length, 4);
  } finally { globalThis.fetch = original; }
});

test('routine RSS failures remain independent and never trigger a channel HTML or archive scan', async () => {
  const requests = [];
  globalThis.fetch = async url => {
    requests.push(String(url)); assert(String(url).includes('/feeds/'));
    return String(url).includes('Missing') ? new Response('', { status: 404 }) : new Response('<feed><title>Creator</title><entry><yt:videoId>recent00001</yt:videoId><title>Recent</title></entry></feed>');
  };
  try {
    const result = await runRefreshRemotes({ channels: [{ ...source, id: 'yt:UCMissing12345678901234', channelId: 'UCMissing12345678901234' }, source], youtubeRequestGapMs: 0 });
    assert.equal(result.refreshedIds.length, 1);
    assert.equal(result.videos.length, 1);
    assert.equal(result.providerRetryAt, undefined);
    assert.equal(requests.length, 2);
    assert(result.channels.find(channel => channel.lastProviderFailure)?.lastCheckedAt > 0);
  } finally { globalThis.fetch = original; }
});

test('an unresolved handle is checked without HTML and cannot freeze the following confirmed archive', async () => {
  const requests = [];
  globalThis.fetch = async (url, init) => {
    requests.push(String(url));
    assert(!String(url).includes('/@'), 'an unresolved import must never guess a channel webpage');
    if (String(url).includes('/navigation/resolve_url')) return Response.json({});
    if (String(url).includes('/feeds/')) return new Response('', { status: 404 });
    assert.equal(JSON.parse(init.body).browseId, `VLUU${id.slice(2)}`);
    return Response.json(root([row(4)]));
  };
  try {
    const result = await runRefreshRemotes({ channels: [{ kind: 'youtube', id: 'yt:unresolved', handle: '@unresolved', title: 'Unresolved' }, source], youtubeCatalog: true, youtubeRequestGapMs: 0 });
    assert.match(result.channels[0].lastProviderFailure.message, /unique exact/);
    assert.equal(result.providerRetryAt, undefined);
    assert.equal(result.refreshedIds.length, 1);
    assert.equal(result.videos.length, 1);
    assert.equal(requests.length, 3);
  } finally { globalThis.fetch = original; }
});

test('partial catalog rejection retains full pages, the next token, and the saved creator name', async () => {
  let requests = 0;
  globalThis.fetch = async (url, init) => {
    requests++; assert(String(url).includes('/youtubei/'));
    return JSON.parse(init.body).continuation === 'saved-page' ? Response.json({ onResponseReceivedActions: [{ appendContinuationItemsAction: { continuationItems: [row(2), row(3), next('unconsumed-page')] } }] }) : new Response('rate limited', { status: 429 });
  };
  try {
    const result = await runRefreshRemotes({ channels: [{ ...source, catalogCursor: 'saved-page', newestVideoId: 'recent00001', newestPublishedAt: 123 }], youtubeCatalog: true, youtubeVideoLimit: 100, youtubeRequestGapMs: 0 });
    assert.equal(result.videos.length, 2);
    assert.equal(result.channels[0].catalogCursor, 'unconsumed-page');
    assert.equal(result.channels[0].title, 'Saved creator');
    assert.equal(result.channels[0].newestVideoId, 'recent00001');
    assert.equal(result.channels[0].newestPublishedAt, 123);
    assert.equal(result.channels[0].lastProviderFailure.kind, 'rate-limited');
    assert(result.providerRetryAt > Date.now());
    assert.equal(requests, 2);
  } finally { globalThis.fetch = original; }
});

test('a first-page archive rejection still accepts a healthy recent feed without losing the diagnosis', async () => {
  let requests = 0;
  globalThis.fetch = async url => {
    requests++;
    if (String(url).includes('/feeds/')) return new Response('<feed><title>Saved creator</title><entry><yt:videoId>recent00002</yt:videoId><title>Newest upload</title><published>2026-10-02T12:00:00Z</published></entry></feed>');
    assert(String(url).includes('/youtubei/'));
    return new Response('rate limited', { status: 429 });
  };
  try {
    const result = await runRefreshRemotes({ channels: [source], youtubeCatalog: true, forceYoutube: true, youtubeRequestGapMs: 0 });
    assert.equal(result.videos.length, 1);
    assert.equal(result.videos[0].remote.videoId, 'recent00002');
    assert.equal(result.channels[0].lastProviderFailure.kind, 'rate-limited');
    assert.equal(result.channels[0].catalogExhaustedAt, undefined);
    assert(result.providerRetryAt > Date.now());
    assert.equal(requests, 2);
  } finally { globalThis.fetch = original; }
});
