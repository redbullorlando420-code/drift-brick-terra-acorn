import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  if (specifier === '@/lib/companion') return { url: 'data:text/javascript,export const companionGetThumb=async()=>null;export const companionPutThumb=async()=>false;', shortCircuit: true };
  if (specifier.startsWith('@/')) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  try { return next(specifier, context); } catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context); throw error; }
} });
const { walkTwitchArchive } = await import('../src/lib/remote/twitch-archive-walk.ts');
const { mergeFollowRecovery, normalizeFollowCheckpoints } = await import('../src/lib/videos/follow-checkpoints.ts');
const { encodeTwitchArchiveCursor } = await import('../src/lib/videos/twitch-archive-cursor.ts');
const archive = after => encodeTwitchArchiveCursor({ stage: 'ARCHIVE', after });
const clip = after => JSON.stringify({ v: 1, after });
const page = (ids, hasNextPage = true, endCursor = 'next') => ({ id: 'creator', videos: { edges: ids.map(id => ({ node: { id } })), pageInfo: { hasNextPage, endCursor } } });
const walk = options => walkTwitchArchive({ limit: 100, maxPages: 10, pageSize: 100, gap: async () => {}, ...options });

test('archive checkpoints advance only after whole accepted pages, with bounded duplicates and last VOD', async () => {
  const requests = []; const pages = [page(['1','2'], true, 'after-2'), page(['2','3'], true, 'after-3')];
  const result = await walk({ limit: 3, savedCursor: archive('resume'), read: async (cursor, first) => { requests.push({ cursor, first }); return pages.shift(); } });
  assert.deepEqual(requests.map(row => row.cursor.after), ['resume','after-2']);
  assert(requests.every(row => row.first <= 100));
  assert.deepEqual(result.edges.map(row => row.node.id), ['1','2','3']);
  assert.equal(result.cursor, archive('after-3'));
  assert.deepEqual([result.diagnostics.pages, result.diagnostics.duplicates, result.diagnostics.lastVideoId, result.diagnostics.resumed, result.diagnostics.stopReason], [2,1,'3',true,'entry-budget']);
});

test('a later integrity challenge keeps accepted VODs and the safe retry cursor', async () => {
  let n = 0;
  const result = await walk({ read: async () => { if (n++) throw Error('failed integrity check'); return page(['1','2'], true, 'safe'); } });
  assert.equal(result.cursor, archive('safe')); assert.equal(result.edges.length, 2);
  assert.equal(result.diagnostics.stopReason, 'challenge'); assert.equal(result.diagnostics.pages, 1); assert.equal(result.exhaustedAt, undefined);
});

test('missing connections and first-page failures never masquerade as exhausted archives', async () => {
  await assert.rejects(walk({ read: async () => ({ id: 'creator' }) }), /malformed/);
  await assert.rejects(walk({ read: async () => ({ id: 'creator', videos: { providerError: 'integrity challenge' } }) }), /integrity/);
  let n = 0;
  const result = await walk({ read: async () => n++ ? ({ id: 'creator' }) : page(['a'], true, 'safe') });
  assert.equal(result.cursor, archive('safe')); assert.equal(result.diagnostics.stopReason, 'provider-error');
});

test('repeated or empty advancing pages stop immediately without losing the prior position', async () => {
  for (const ids of [[], ['a']]) {
    let reads = 0;
    const result = await walk({ savedCursor: archive('same'), read: async () => { reads++; return page(ids, true, 'same'); } });
    assert.equal(reads, 1); assert.equal(result.cursor, archive('same')); assert.equal(result.diagnostics.stopReason, 'stalled'); assert.equal(result.exhaustedAt, undefined);
  }
});

test('overflowing or invalid rows hold the page checkpoint while retaining usable VODs', async () => {
  const result = await walk({ limit: 2, savedCursor: archive('before'), read: async () => page(['a','b','c']) });
  assert.equal(result.edges.length, 2); assert.equal(result.cursor, archive('before')); assert.equal(result.diagnostics.stopReason, 'incomplete-page');
});

test('valid terminal shelves exhaust only after archive, highlight and upload are checked', async () => {
  const stages = [];
  const result = await walk({ read: async cursor => { stages.push(cursor.stage); return page([], false, null); } });
  assert.deepEqual(stages, ['ARCHIVE','HIGHLIGHT','UPLOAD']); assert.equal(result.cursor, undefined); assert(result.exhaustedAt > 0); assert.equal(result.diagnostics.stopReason, 'exhausted');
});

test('duplicate-only forward pages may advance but the page budget stays bounded', async () => {
  let n = 0;
  const result = await walk({ maxPages: 3, read: async () => page(['same'], true, `cursor-${++n}`) });
  assert.equal(n, 3); assert.equal(result.edges.length, 1); assert.equal(result.diagnostics.duplicates, 2); assert.equal(result.diagnostics.stopReason, 'page-budget');
});

const diagnostics = { at: 1000, pages: 2, received: 3, accepted: 2, duplicates: 1, resumed: true, stage: 'HIGHLIGHT', stopReason: 'challenge', lastVideoId: 'last', error: 'integrity challenge' };
const checkpoints = { twitchArchiveCursor: encodeTwitchArchiveCursor({ stage: 'HIGHLIGHT', after: 'position' }), twitchClipCursor: clip('clip-position'), twitchArchiveLastVideoId: 'last', twitchArchiveDiagnostics: diagnostics,
  twitchArchiveRetry: { attempts: 2, retryAt: 31000 }, twitchLiveRetry: { attempts: 1, retryAt: 16000 } };
test('checkpoint recovery bounds malformed data and retains exhausted timestamps', () => {
  assert.deepEqual(normalizeFollowCheckpoints(checkpoints), checkpoints);
  const bad = normalizeFollowCheckpoints({ twitchArchiveCursor: '{broken', twitchClipCursor: clip('x'.repeat(5000)), catalogCursor: 'x'.repeat(20000), twitchArchiveDiagnostics: { ...diagnostics, pages: Infinity }, twitchArchiveExhaustedAt: 2000 });
  assert.equal(bad.twitchArchiveCursor, undefined); assert.equal(bad.twitchClipCursor, undefined); assert.equal(bad.twitchArchiveDiagnostics, undefined); assert.equal(bad.catalogCursor, undefined); assert.equal(bad.twitchArchiveExhaustedAt, 2000);
});

test('a newer local mirror wins over a longer stale disk list, including a completed cursor', () => {
  const old = { id: 'tw:test', kind: 'twitch', handle: 'test', title: 'Test', ...checkpoints };
  const extra = { ...old, id: 'tw:extra', handle: 'extra' };
  const completed = { id: old.id, kind: old.kind, handle: old.handle, title: old.title, twitchArchiveExhaustedAt: 9000 };
  assert.deepEqual(mergeFollowRecovery({ channels: [old, extra], savedAt: 1000 }, { channels: [completed], savedAt: 2000 }), [completed, extra]);
  const distinctYoutube = [{ id: 'yt:one', channelId: 'one', kind: 'youtube', handle: 'same', title: 'Same' }, { id: 'yt:two', channelId: 'two', kind: 'youtube', handle: 'same', title: 'Same' }];
  assert.equal(mergeFollowRecovery({ channels: distinctYoutube, savedAt: 1 }, { channels: [], savedAt: 0 }).length, 2);
});

test('actual reload normalization and library-pack import retain YouTube and Twitch positions', async () => {
  const rows = [{ id: 'tw:test', kind: 'twitch', handle: 'test', title: 'Test', ...checkpoints }, { id: 'yt:test', kind: 'youtube', handle: 'test', title: 'Test', catalogCursor: 'youtube-after', catalogCheckedAt: 3000 }];
  globalThis.window = {}; globalThis.localStorage = { getItem: key => key === 'reelcase.follows.v1' ? JSON.stringify({ channels: rows }) : null, setItem() {} };
  const { loadFollows } = await import('../src/lib/videos/persist.ts');
  assert.deepEqual(loadFollows(), rows);
  delete globalThis.window;
  const { applyLibraryPackFiles } = await import('../src/lib/videos/library-pack.ts');
  let restored;
  const hooks = { getFollows: () => [], setFollows: rows => { restored = rows; }, getViewCounts: () => ({}), getCameCounts: () => ({}), getFavorites: () => [], getLikes: () => [], getLinks: () => [], getHistory: () => [] };
  const result = applyLibraryPackFiles({ 'follows/twitch.json': JSON.stringify({ channels: rows }) }, hooks);
  assert.deepEqual(restored, rows); assert.equal(result.followsAdded, 2); assert.deepEqual(result.warnings, []);
});

test('real provider path returns partial pages, diagnoses challenges and bypasses partial-result caching', async () => {
  const { runFollowRemote } = await import('../src/lib/remote/api.ts');
  let requests = 0;
  const prior = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    requests++; const { variables } = JSON.parse(init.body);
    return Response.json(variables.after === 'safe' ? { data: { user: { id: 'creator' } }, errors: [{ message: 'failed integrity check' }] } : { data: { user: { ...page(['101'], true, 'safe'), displayName: 'Test', stream: null } } });
  };
  try {
    const input = { kind: 'twitch', query: 'qa_checkpoint', twitchArchiveCursor: archive('start') };
    for (let i = 0; i < 2; i++) {
      const result = await runFollowRemote(input);
      assert.equal(result.videos.length, 1); assert.equal(result.channel.twitchArchiveCursor, archive('safe'));
      assert.equal(result.channel.lastProviderFailure.kind, 'integrity-challenge'); assert.equal(result.channel.twitchArchiveLastVideoId, '101');
    }
    assert.equal(requests, 4, 'a manual partial retry reaches the provider');
  } finally { globalThis.fetch = prior; }
});

test('clip-page failure preserves the accepted VODs and clip continuation', async () => {
  const { runFollowRemote } = await import('../src/lib/remote/api.ts');
  const prior = globalThis.fetch; let clipCalls = 0;
  globalThis.fetch = async (_url, init) => {
    const { query, variables } = JSON.parse(init.body);
    if (!query.includes('clips(')) return Response.json({ data: { user: { ...page(['102'], false, null), stream: null } } });
    clipCalls++;
    return Response.json(variables.after === 'clip-next' ? { data: { user: null }, errors: [{ message: 'clip integrity challenge' }] } : { data: { user: { clips: { edges: [{ node: { id: 'clip-id', slug: 'clip-slug', title: 'Clip', durationSeconds: 20 } }], pageInfo: { hasNextPage: true, endCursor: 'clip-next' } } } } });
  };
  try {
    const result = await runFollowRemote({ kind: 'twitch', query: 'qa_clips_checkpoint', clipLimit: 100, twitchArchiveCursor: archive('before'), twitchClipCursor: clip('old') });
    assert.equal(clipCalls, 2); assert.equal(result.videos.length, 2); assert(result.videos.some(video => video.id === 'tw:v:102')); assert.equal(result.channel.twitchClipCursor, clip('clip-next')); assert.equal(result.channel.twitchClipExhaustedAt, undefined); assert.equal(result.channel.lastProviderFailure.kind, 'integrity-challenge');
  } finally { globalThis.fetch = prior; }
});
