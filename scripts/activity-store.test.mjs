import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
const moduleUrl = source => `data:text/javascript,${encodeURIComponent(source)}`;
const names = [...readFileSync(new URL('../src/lib/videos/persist.ts', import.meta.url), 'utf8').matchAll(/export (?:async )?function (\w+)/g)].map(match => match[1]);
const persistence = names.map(name => name === 'loadPrefs' ? 'export function loadPrefs(){return null;}' : `export async function ${name}(){return [];}`).join('\n') + '\nexport const PHOTO_META_LS_KEY="test-photos";';
registerHooks({ resolve(specifier, context, next) {
  if (specifier === './persist' && context.parentURL?.endsWith('/videos/store.ts')) return { url: moduleUrl(persistence), shortCircuit: true };
  if (specifier === '@/lib/remote/functions') return { url: moduleUrl('export function followRemote(){};export function importChannels(){};export function refreshRemotes(){};export function searchAdultVideos(){};'), shortCircuit: true };
  if (specifier.startsWith('@/')) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  try { return next(specifier, context); } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(specifier + '.ts', context); throw error;
  }
} });
const { useLibrary, selectContinue, selectHistory, selectVisible, selectYoutube, selectTwitch, selectFavorites, selectAdultRemote, prepareContinueSelection, prepareHistorySelection, prepareRecoveryBrowse, clearCatalogSelectorCaches, trimCatalogSelectorCaches } = await import('../src/lib/videos/store.ts');
const { rememberVideo } = await import('../src/lib/videos/video-lookup.ts');
const { LIBRARY_LIMITS } = await import('../src/lib/library-limits.ts');

test('heart and like actions do not enumerate/copy large saved records and preserve old snapshots', () => {
  const base = new Proxy({ kept: true, remove: true }, { ownKeys() { throw Error('Input enumerated entire saved list'); } });
  useLibrary.setState({ favorites: base, likes: base });
  useLibrary.getState().toggleFavorite('remove');
  const removed = useLibrary.getState().favorites;
  assert.equal(removed.remove, undefined); assert.equal(base.remove, true); assert.equal(removed.kept, true);
  useLibrary.getState().toggleFavorite('new'); assert.equal(useLibrary.getState().favorites.new, true);
  assert.equal(removed.new, undefined); assert.equal(useLibrary.getState().likes, base);
  useLibrary.getState().toggleLike('remove'); assert.equal(useLibrary.getState().likes.remove, undefined);
  useLibrary.getState().toggleLike('remove'); assert.equal(useLibrary.getState().likes.remove, true);
});

test('idle retirement keeps exact active page rows and releases inactive provider/activity scopes', async () => {
  const videos = Array.from({ length: 2000 }, (_, i) => ({ id: String(i), folderId: 'public', name: String(i), path: String(i), extension: 'yt', mime: 'video/youtube', size: 0, addedAt: i, remote: { kind: i % 2 ? 'youtube' : 'twitch' } }));
  const base = { ...useLibrary.getInitialState(), videos, folders: [], query: '', progress: { '1': { t: 20, d: 100, at: 1 } }, favorites: { '1': true }, likes: {}, history: [] };
  for (const sourceId of ['youtube', 'favorites', 'continue', 'history', 'twitch', 'landing', 'home', 'settings']) {
    clearCatalogSelectorCaches();
    const state = { ...base, sourceId };
    const youtube = selectYoutube(state), twitch = selectTwitch(state), favorites = selectFavorites(state);
    await prepareRecoveryBrowse({ ...state, sourceId: 'continue' }, new AbortController().signal, async () => {});
    const continuing = selectContinue(state), history = selectHistory(state);
    selectAdultRemote(state);
    if (!['home', 'settings'].includes(sourceId)) selectVisible(state);
    const visible = selectVisible.peek(state);
    trimCatalogSelectorCaches(state);
    assert.equal(selectYoutube.peek(state), ['youtube', 'landing'].includes(sourceId) ? youtube : undefined);
    assert.equal(selectTwitch.peek(state), ['twitch', 'landing'].includes(sourceId) ? twitch : undefined);
    assert.equal(selectFavorites.peek(state), ['favorites', 'landing'].includes(sourceId) ? favorites : undefined);
    assert.equal(selectContinue.peek(state), ['continue', 'history', 'landing'].includes(sourceId) ? continuing : undefined);
    assert.equal(selectHistory.peek(state), ['continue', 'history', 'landing'].includes(sourceId) ? history : undefined);
    assert.equal(selectAdultRemote.peek(state), undefined);
    assert.equal(selectVisible.peek(state), ['home', 'settings'].includes(sourceId) ? undefined : visible);
    if (sourceId === 'youtube') assert.equal(selectYoutube({ ...state, searchResult: null }), youtube, 'idle notification cannot build a cold provider catalog');
  }
  const privateState = { ...base, sourceId: 'adults', folders: [{ id: 'private', kind: 'directory', name: 'Private', adult: true }], videos: videos.map((video, i) => i === 1 ? { ...video, folderId: 'private' } : video) };
  const privateFavorites = selectFavorites(privateState, true), privateContinue = selectContinue(privateState, true), privateHistory = selectHistory(privateState, true);
  selectFavorites(privateState); selectContinue(privateState); selectHistory(privateState);
  trimCatalogSelectorCaches(privateState);
  assert.equal(selectFavorites.peek(privateState, true), privateFavorites);
  assert.equal(selectContinue.peek(privateState, true), privateContinue);
  assert.equal(selectHistory.peek(privateState, true), privateHistory);
  assert.equal(selectFavorites.peek(privateState), undefined); assert.equal(selectContinue.peek(privateState), undefined); assert.equal(selectHistory.peek(privateState), undefined);
  clearCatalogSelectorCaches();
});

test('cooperative recovery selectors preserve aliases, privacy, history recovery, stable order and visible sorting', async () => {
  const video = (id, overrides = {}) => ({ id, folderId: 'public', name: id, path: id, extension: 'yt', mime: 'video/youtube', size: 0, addedAt: Number(id) || 0, remote: { kind: 'youtube' }, ...overrides });
  const shared = 'https://www.youtube.com/watch?v=shared';
  const videos = Array.from({ length: 3000 }, (_, i) => video(String(i)));
  videos.push(video('alias-a', { src: shared }), video('alias-b', { src: shared }), video('private', { folderId: 'private' }), video('hidden'), video('demo', { isSample: true }));
  const state = { ...useLibrary.getInitialState(), videos, folders: [{ id: 'private', adult: true, kind: 'directory', name: 'Private' }], sourceId: 'continue', query: '', sort: 'name', hideDemo: true,
    hiddenVideos: { hidden: true }, progress: Object.fromEntries(videos.map(v => [v.id, { t: 20, d: 100, at: 100 }])), resumeProgress: { [shared]: { t: 30, d: 100, at: 200 } },
    history: [{ id: 'evicted', title: 'Recovered public', url: 'https://www.youtube.com/watch?v=evicted', position: 12, duration: 100, at: 300 },
      { id: 'adult-evicted', title: 'Recovered private', url: 'https://www.eporner.com/video/retained/', position: 15, duration: 100, at: 400 },
      { id: 'old-alias', url: shared, position: 10, duration: 100, at: 90 }, { id: 'evicted', url: 'https://youtube.com/watch?v=older', at: 1 }] };
  for (const adult of [false, true]) {
    clearCatalogSelectorCaches();
    const expected = selectContinue(state, adult), expectedHistory = selectHistory(state, adult);
    clearCatalogSelectorCaches();
    let turns = 0; const signal = new AbortController().signal, turn = async () => { turns++; };
    const actual = await prepareContinueSelection(state, signal, turn, adult);
    assert.deepEqual(actual, expected); assert.deepEqual(await prepareHistorySelection(state, signal, turn, adult), expectedHistory);
    assert.equal(selectContinue(state, adult), actual, 'exact prepared snapshot is reused');
    assert.ok(turns > 5); assert.equal(actual[0].id, adult ? 'adult-evicted' : 'evicted');
    assert.ok(!actual.some(v => ['hidden', 'demo'].includes(v.id)));
    assert.equal(actual.some(v => v.id === 'private'), adult);
  }
  clearCatalogSelectorCaches(); const expectedVisible = selectVisible(state); clearCatalogSelectorCaches();
  await prepareRecoveryBrowse(state, new AbortController().signal, async () => {});
  assert.deepEqual(selectVisible(state), expectedVisible);
  const historyState = { ...state, sourceId: 'history' };
  clearCatalogSelectorCaches(); const expectedHistoryVisible = selectVisible(historyState); clearCatalogSelectorCaches();
  await prepareRecoveryBrowse(historyState, new AbortController().signal, async () => {});
  assert.deepEqual(selectVisible(historyState), expectedHistoryVisible);
});

test('cancelled Continue preparation never primes a partial selection and private results exclude public titles', async () => {
  const videos = Array.from({ length: 4000 }, (_, i) => ({ id: String(i), folderId: 'public', name: String(i), path: String(i), extension: 'yt', mime: 'video/youtube', size: 0, addedAt: 0, remote: { kind: 'youtube' } }));
  const state = { ...useLibrary.getInitialState(), videos, folders: [], progress: Object.fromEntries(videos.map(v => [v.id, { t: 20, d: 100, at: 1 }])), resumeProgress: {}, history: [] };
  clearCatalogSelectorCaches(); const controller = new AbortController(); let turns = 0;
  await assert.rejects(prepareContinueSelection(state, controller.signal, async () => { if (++turns === 4) controller.abort(); }), /abort/i);
  assert.equal(selectContinue.peek(state), undefined);
  assert.equal((await prepareContinueSelection(state, new AbortController().signal, async () => {})).length, 4000);
  assert.deepEqual(await prepareContinueSelection(state, new AbortController().signal, async () => {}, true), []);
});
test('real playback actions do not enumerate full activity maps and progress history stays bounded', () => {
  const guarded = value => new Proxy(value, { ownKeys() { throw Error('large activity map copied'); } });
  const card = { id: 'played', folderId: 'yt:test', name: 'Test', path: 'played', extension: 'yt', mime: 'video/youtube', size: 0, addedAt: 1,
    remote: { kind: 'youtube', videoId: 'played', embedUrl: 'https://www.youtube.com/embed/played' } };
  const videos = Array.from({ length: 60_000 }, (_, i) => ({ ...card, id: `other:${i}` })); videos.push(card); rememberVideo(videos, card);
  const progress = guarded({ old: { t: 2, d: 100, at: 1 } }), counts = guarded({ old: 9 });
  useLibrary.setState({ videos, folders: [], history: [], progress, resumeProgress: guarded({}), viewCounts: counts, cameCounts: counts });
  useLibrary.getState().recordPlay(card.id);
  assert.equal(useLibrary.getState().viewCounts.played, 1); assert.equal(useLibrary.getState().viewCounts.old, 9); assert.equal(counts.played, undefined);
  useLibrary.getState().markProgress(card.id, 10, 100);
  assert.equal(useLibrary.getState().progress.played.t, 10); assert.equal(progress.played, undefined);
  const first = useLibrary.getState().progress;
  useLibrary.getState().markProgress(card.id, 11, 100); assert.equal(useLibrary.getState().progress, first, 'tiny heartbeat is suppressed');
  useLibrary.getState().markProgress(card.id, 30, 100); assert.equal(first.played.t, 10); assert.equal(useLibrary.getState().progress.played.t, 30);
  useLibrary.getState().markCame(card.id); assert.equal(useLibrary.getState().cameCounts.played, 1); assert.equal(useLibrary.getState().cameCounts.old, 9);
  useLibrary.setState({ history: Array.from({ length: LIBRARY_LIMITS.historyMemoryEntries }, (_, i) => ({ id: `past:${i}`, at: 1 })) });
  useLibrary.getState().markProgress(card.id, 50, 100);
  assert.equal(useLibrary.getState().history.length, LIBRARY_LIMITS.historyMemoryEntries);
  assert.equal(useLibrary.getState().history[0].id, card.id);
});
