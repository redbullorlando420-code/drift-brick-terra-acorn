import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

// Exercise the real store actions with deterministic provider and disk boundaries.
const fixture = { writes: [], requests: 0, response: null, beforeResponse: null };
globalThis.__entryLimitFixture = fixture;
const persistence = readFileSync(new URL('../src/lib/videos/persist.ts', import.meta.url), 'utf8');
const names = [...persistence.matchAll(/export (?:async )?function (\w+)/g)].map(match => match[1]);
const mockPersist = names.map(name => {
  if (name === 'loadPrefs') return 'export function loadPrefs() { return null; }';
  if (name === 'loadFollows') return 'export function loadFollows() { return []; }';
  if (name === 'saveRemoteSnapshot') return 'export async function saveRemoteSnapshot(value) { globalThis.__entryLimitFixture.writes.push(...value.videos); }';
  if (name === 'appendCatalogVideos') return 'export async function appendCatalogVideos(rows) { globalThis.__entryLimitFixture.writes.push(...rows); }';
  return `export async function ${name}() { return []; }`;
}).join('\n') + '\nexport const PHOTO_META_LS_KEY = "test-photos";';
const mockRemote = ['followRemote', 'importChannels', 'refreshRemotes', 'searchAdultVideos'].map(name => `export async function ${name}() {
  const fixture = globalThis.__entryLimitFixture; fixture.requests++;
  fixture.beforeResponse?.(); return structuredClone(fixture.response);
}`).join('\n');
const asModule = source => `data:text/javascript,${encodeURIComponent(source)}`;
registerHooks({ resolve(specifier, context, next) {
  if (specifier === '@/lib/remote/functions') return { url: asModule(mockRemote), shortCircuit: true };
  if (specifier === './persist' && context.parentURL?.endsWith('/videos/store.ts')) return { url: asModule(mockPersist), shortCircuit: true };
  if (specifier.startsWith('@/')) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  try { return next(specifier, context); }
  catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context); throw error; }
} });
const { useLibrary } = await import('../src/lib/videos/store.ts');
const { updatePullSettings, DEFAULT_PULL_SETTINGS } = await import('../src/lib/pull-settings.ts');
const channel = { id: 'yt:test', kind: 'youtube', handle: 'Test', title: 'Test', catalogCursor: 'before' };
const card = (id, kind = 'youtube', folderId = channel.id) => ({ id, folderId, name: 'Space documentary', path: id, extension: 'yt', mime: 'video/youtube', size: 0, addedAt: 1, remote: { kind, videoId: id, channelId: 'test' } });
function reset(videos = []) {
  fixture.writes = []; fixture.requests = 0; fixture.beforeResponse = null;
  updatePullSettings({ ...DEFAULT_PULL_SETTINGS, youtubeMaxEntries: 2 });
  useLibrary.setState({ videos, tags: {}, metadataProvenance: {}, folders: [], follows: [channel], remoteBusy: false, refreshing: false, activeId: null, previewId: null, favorites: {}, likes: {}, history: [] });
}
const flush = () => new Promise(resolve => setTimeout(resolve, 80));

test('focused pulls cap memory, metadata and disk together, preserving the rejected page resume point', async () => {
  reset([card('old')]);
  fixture.response = { channel: { ...channel, catalogCursor: 'after' }, videos: [card('new'), card('blocked')] };
  await useLibrary.getState().followRemoteQuery('Test', 'youtube'); await flush();
  const state = useLibrary.getState();
  assert.deepEqual(state.videos.map(video => video.id), ['old', 'new']);
  assert.equal(state.tags.blocked, undefined);
  assert.equal(state.metadataProvenance.blocked, undefined);
  assert.deepEqual(fixture.writes.map(video => video.id), ['new']);
  assert.equal(state.follows[0].catalogCursor, 'before');
  assert.equal(state.folders[0].videoCount, 2);
  await assert.rejects(state.followRemoteQuery('Test', 'youtube'), /limit reached/);
  assert.equal(fixture.requests, 1, 'full source does not start another archive request');
});

test('bulk imports use one cap across creators and persist only admitted entries', async () => {
  reset();
  fixture.response = { ok: [
    { channel: { ...channel, id: 'yt:a', handle: 'Alpha' }, videos: [card('a', 'youtube', 'yt:a'), card('b', 'youtube', 'yt:a')] },
    { channel: { ...channel, id: 'yt:b', handle: 'Beta' }, videos: [card('c', 'youtube', 'yt:b')] },
  ], failed: 0 };
  await useLibrary.getState().importBatch([{ query: 'Alpha', kind: 'youtube' }, { query: 'Beta', kind: 'youtube' }]); await flush();
  assert.equal(useLibrary.getState().videos.length, 2);
  assert.equal(useLibrary.getState().tags.c, undefined);
  assert.deepEqual(fixture.writes.map(video => video.id), ['a', 'b']);
  assert.equal(useLibrary.getState().folders.find(folder => folder.id === 'yt:b').videoCount, 0);
});

test('routine checks refresh stored titles at a zero cap while excluding new rows from disk and metadata', async () => {
  reset([card('old')]); updatePullSettings({ youtubeMaxEntries: 0 });
  fixture.response = { channels: [{ ...channel, newestVideoId: 'new', catalogCursor: 'after' }], refreshedIds: [channel.id], videos: [{ ...card('old'), name: 'Updated title' }, card('new')] };
  await useLibrary.getState().refreshFollows('youtube'); await flush();
  assert.equal(useLibrary.getState().videos.length, 1);
  assert.equal(useLibrary.getState().videos[0].name, 'Updated title');
  assert.equal(useLibrary.getState().tags.new, undefined);
  assert.deepEqual(fixture.writes.map(video => video.id), ['old']);
  assert.equal(useLibrary.getState().follows[0].newestVideoId, undefined);
});

test('settings changed while a provider is in flight apply before admission', async () => {
  reset(); fixture.beforeResponse = () => updatePullSettings({ youtubeMaxEntries: 0 });
  fixture.response = { channel, videos: [card('blocked')] };
  await useLibrary.getState().followRemoteQuery('Test', 'youtube'); await flush();
  assert.equal(useLibrary.getState().videos.length, 0);
  assert.equal(Object.keys(useLibrary.getState().tags).length, 0);
  assert.equal(fixture.writes.length, 0);
});

test('Adult pulls apply a lowered in-flight cap before tags and append transactions', async () => {
  reset(); updatePullSettings({ adultMaxEntries: 2 });
  fixture.beforeResponse = () => updatePullSettings({ adultMaxEntries: 1 });
  fixture.response = { videos: [card('adult-a', 'eporner', 'eporner:discover'), card('adult-b', 'eporner', 'eporner:discover')], providerNextPages: { eporner: 2 }, providerNextOffsets: { eporner: 0 }, providerDiagnostics: [{ provider: 'eporner', status: 'ok', titles: 2, detail: 'fixture' }] };
  await useLibrary.getState().searchAdultFeed('all', 'top-weekly', { providers: ['eporner'], maxVideos: 2 });
  assert.equal(useLibrary.getState().videos.length, 1);
  assert.equal(useLibrary.getState().tags['adult-b'], undefined);
  assert.deepEqual(fixture.writes.map(video => video.id), ['adult-a']);
});

test('removed cached Reddit images and confirmed unavailable photos leave Adult shelves without deleting saves', async () => {
  reset([{ ...card('removed', 'reddit', 'reddit:discover'), name: '[ Removed by Reddit ]' }, card('valid', 'reddit', 'reddit:discover')]);
  useLibrary.setState({ unavailable: {}, hiddenVideos: {}, showHiddenAdult: true, favorites: { removed: true, valid: true } });
  const { selectAdultRemote } = await import('../src/lib/videos/store.ts');
  assert.deepEqual(selectAdultRemote(useLibrary.getState()).map(video => video.id), ['valid']);
  useLibrary.getState().markUnavailable('valid', 'Removed by Reddit');
  assert.deepEqual(selectAdultRemote(useLibrary.getState()), []);
  assert.equal(useLibrary.getState().videos.length, 2);
  assert.deepEqual(useLibrary.getState().favorites, { removed: true, valid: true });
});
