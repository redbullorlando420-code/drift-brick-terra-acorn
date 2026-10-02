import { registerHooks } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';
registerHooks({ resolve(s, c, n) {
  if (s.startsWith('@/')) return n(new URL('../src/' + s.slice(2) + '.ts', import.meta.url).href, c);
  try { return n(s, c); } catch (error) { if (s.startsWith('.') && !/\.[a-z]+$/i.test(s)) return n(s + '.ts', c); throw error; }
} });
const { runRefreshRemotes } = await import('../src/lib/remote/api.ts');
const originalFetch = globalThis.fetch;
const id = 'UCThroughput123456789012';
const row = i => ({ videoRenderer: { videoId: `speed${String(i).padStart(6, '0')}`, title: { simpleText: `Upload ${i}` } } });
const next = page => ({ continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: `page-${page}` } } } });
const pageRows = page => Array.from({ length: 30 }, (_, i) => row(page * 30 + i));
const feed = '<feed><title>Creator</title><author><name>Creator</name></author><entry><yt:videoId>speed000000</yt:videoId><title>Recent upload</title><published>2026-10-01T12:00:00Z</published></entry></feed>';
const root = { contents: { twoColumnBrowseResultsRenderer: { tabs: [{ tabRenderer: { selected: true, title: 'Videos', content: { richGridRenderer: { contents: [...pageRows(0), next(1)] } } } }] } } };
const html = `<title>Creator - YouTube</title><script>var ytInitialData=${JSON.stringify(root)};</script><script>ytcfg.set({"INNERTUBE_API_KEY":"test-key","INNERTUBE_CLIENT_VERSION":"test-version"});</script>`;

test('a healthy 3000-entry archive grows through small resumable responses without rereading RSS or losing pages', async t => {
  let rss = 0, requests = 0;
  const tokens = [];
  globalThis.fetch = async (url, init) => {
    requests++;
    if (String(url).includes('/feeds/')) { rss++; return new Response(feed); }
    if (init?.method === 'POST') {
      if (JSON.parse(init.body).browseId) return Response.json(root);
      const token = JSON.parse(init.body).continuation;
      tokens.push(token);
      const page = Number(token.split('-')[1]);
      assert(page >= 1 && page < 100);
      return Response.json({ onResponseReceivedActions: [{ appendContinuationItemsAction: { continuationItems: [...pageRows(page), ...(page < 99 ? [next(page + 1)] : [])] } }] });
    }
    assert(String(url).endsWith('/videos'));
    return new Response(html);
  };
  try {
    let source = { id: `yt:${id}`, channelId: id, handle: 'Creator', title: 'Creator', kind: 'youtube' };
    const all = new Set(), sizes = [];
    for (let turn = 0; turn < 6; turn++) {
      const result = await runRefreshRemotes({ channels: [source], youtubeCatalog: true, youtubeVideoLimit: 500, youtubeRequestGapMs: 0 });
      assert.equal(result.refreshedIds.length, 1);
      assert.equal(result.providerRetryAt, undefined);
      sizes.push(result.videos.length);
      for (const video of result.videos) { assert(!all.has(video.remote.videoId), 'resuming an archive must not return the same recent RSS rows'); all.add(video.remote.videoId); }
      source = result.channels[0];
      assert.equal(source.newestVideoId, 'speed000000');
      assert.equal(source.newestPublishedAt, Date.parse('2026-10-01T12:00:00Z'));
    }
    assert.equal(all.size, 3000);
    assert.deepEqual(sizes, [510, 510, 510, 510, 510, 450]);
    assert.equal(new Set(tokens).size, 99, 'each continuation is consumed once');
    assert.equal(rss, 1, 'five repeat feed requests and their duplicate rows are avoided');
    assert.equal(requests, 101);
    assert.equal(source.catalogCursor, undefined);
    assert(source.catalogExhaustedAt);
    // Old archive batches must not populate the recent-feed cache with an
    // empty feed and suppress the next real new-upload check.
    const recent = await runRefreshRemotes({ channels: [{ ...source, newestVideoId: undefined }], youtubeRequestGapMs: 0 });
    assert.equal(rss, 2);
    assert.equal(recent.videos.length, 1);
    t.diagnostic(`3000 unique entries; largest response ${Math.max(...sizes)}; 101 requests; one RSS read across six archive turns.`);
  } finally { globalThis.fetch = originalFetch; }
});
