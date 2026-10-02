import { registerHooks } from 'node:module';
registerHooks({ resolve(s, c, n) {
  if (s.startsWith('@/')) return n(new URL('../src/' + s.slice(2) + '.ts', import.meta.url).href, c);
  try { return n(s, c); } catch (error) { if (s.startsWith('.') && !/\.[a-z]+$/i.test(s)) return n(s + '.ts', c); throw error; }
} });
const { runRefreshRemotes } = await import('../src/lib/remote/api.ts');
const channelId = process.argv[2] ?? 'UCpVm7bg6pXKo1Pr6k5kxG9A';
let source = { id: `yt:${channelId}`, channelId, kind: 'youtube', title: 'National Geographic', handle: `https://www.youtube.com/channel/${channelId}` };
const originalFetch = globalThis.fetch, paths = [];
globalThis.fetch = async (url, init) => { const response = await originalFetch(url, init); paths.push({ path: new URL(url).pathname, status: response.status }); return response; };
const seen = new Set();
for (let turn = 0; turn < 2; turn++) {
  const result = await runRefreshRemotes({ channels: [source], youtubeCatalog: true, youtubeVideoLimit: 100, youtubeRequestGapMs: 1500 });
  let unique = 0;
  for (const row of result.videos) if (!seen.has(row.remote.videoId)) { seen.add(row.remote.videoId); unique++; }
  console.log(JSON.stringify({ turn, returned: result.videos.length, unique, totalUnique: seen.size, refreshed: result.refreshedIds.length, cursorSaved: Boolean(result.channels[0]?.catalogCursor), failure: result.channels[0]?.lastProviderFailure, retryAt: result.providerRetryAt }));
  if (!result.refreshedIds.length || result.providerRetryAt) break;
  source = result.channels[0];
}
console.log(JSON.stringify({ requests: paths }));
