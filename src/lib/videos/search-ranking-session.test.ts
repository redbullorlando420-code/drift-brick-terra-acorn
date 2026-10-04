import test from 'node:test';
import assert from 'node:assert/strict';
import { createSearchRankingSession, EMPTY_SEARCH_RANKING, matchesSearchScope } from './search-ranking-session.ts';
import { rankSearchResults, type SearchRankingInput, type SearchRankingResult } from './search-ranking.ts';
import type { LibraryVideo } from './types';

const card: LibraryVideo = { id: 'one', name: 'Needle', addedAt: 1, folderId: 'public', path: 'one', extension: 'mp4', mime: 'video/mp4', size: 0 };
const input = (): SearchRankingInput => ({ videos: [card], ids: new Set(['one']), query: 'needle', sourceId: 'home',
  folders: [], hidden: {}, unavailable: {}, tags: {}, favorites: {}, likes: {}, viewCounts: {}, ratingOf: () => 0, ratingPreference: n => n });
const tick = async () => { await new Promise(resolve => setImmediate(resolve)); };
function harness() {
  const jobs: Array<{ input: SearchRankingInput; signal: AbortSignal; resolve: (result: SearchRankingResult) => void; reject: (error: Error) => void }> = [];
  const session = createSearchRankingSession((input, signal) => new Promise((resolve, reject) => { jobs.push({ input, signal, resolve, reject }); }));
  return { session, jobs };
}
const result = { ranked: [card], tags: [] };

test('feedback bursts preserve the published million-row array without scanning or reranking it', async () => {
  const { session, jobs } = harness();
  const guarded = new Proxy(Array<LibraryVideo>(1_000_000), { get(target, key, receiver) {
    if (key === Symbol.iterator || /^\d+$/.test(String(key))) throw Error('Catalog scanned on feedback');
    return Reflect.get(target, key, receiver);
  } });
  const first = { ...input(), videos: guarded };
  const published = { ranked: Array<LibraryVideo>(1_000_000).fill(card), tags: [] };
  session.setInput(first); jobs[0].resolve(published); await tick();
  let notifications = 0; const stop = session.subscribe(() => { notifications++; });
  for (let i = 0; i < 10_000; i++) session.setInput({ ...first, viewCounts: { one: i }, likes: { one: true } });
  assert.equal(jobs.length, 1); assert.equal(notifications, 1);
  assert.equal(session.getSnapshot().result, published); assert.equal(session.getSnapshot().pending, false);
  assert.equal(session.getSnapshot().updated, true);
  session.release(); assert.equal(session.getSnapshot().scope, null); assert.equal(session.getSnapshot().result, EMPTY_SEARCH_RANKING);
  stop();
});

test('explicit refresh uses the newest feedback and intentionally starts a fresh page order', async () => {
  const { session, jobs } = harness(); const first = input();
  session.setInput(first); jobs[0].resolve(result); await tick();
  const latest = { ...first, favorites: { one: true as const } };
  session.setInput(latest); session.refresh();
  assert.equal(jobs.length, 2); assert.equal(jobs[1].input, latest); assert.equal(session.getSnapshot().revision, 1);
  assert.equal(session.getSnapshot().result, EMPTY_SEARCH_RANKING);
  jobs[1].resolve(result); await tick(); assert.equal(session.getSnapshot().updated, false);
});

test('every eligibility change rejects the old result before replacement work finishes', async () => {
  const changed: Array<(base: SearchRankingInput) => SearchRankingInput> = [
    base => ({ ...base, query: 'different' }), base => ({ ...base, sourceId: 'adults' }),
    base => ({ ...base, videos: [] }), base => ({ ...base, ids: new Set() }),
    base => ({ ...base, hidden: { one: true } }), base => ({ ...base, unavailable: { one: true } }),
    base => ({ ...base, folders: [{ id: 'public', name: 'Private', kind: 'files', videoCount: 1, adult: true }] }),
    base => ({ ...base, tags: { one: ['changed'] } }),
  ];
  for (const change of changed) {
    const { session, jobs } = harness(); const base = input();
    session.setInput(base); jobs[0].resolve(result); await tick(); const next = change(base);
    assert.equal(matchesSearchScope(session.getSnapshot().scope, next), false);
    session.setInput(next); assert.equal(session.getSnapshot().result, EMPTY_SEARCH_RANKING);
    assert.equal(session.getSnapshot().pending, true); assert.equal(jobs.length, 2); session.release();
  }
});

test('viewer hold cancels transient work and resumes only the latest input', async () => {
  const { session, jobs } = harness(); const first = input(); session.setInput(first);
  session.setHeld(true); assert.equal(jobs[0].signal.aborted, true);
  const latest = { ...first, likes: { one: true as const } }; session.setInput(latest);
  jobs[0].resolve(result); await tick(); assert.equal(session.getSnapshot().pending, true); assert.equal(jobs.length, 1);
  session.setHeld(false); assert.equal(jobs.length, 2); assert.equal(jobs[1].input, latest);
  jobs[1].resolve(result); await tick();
  session.setHeld(true); session.setInput({ ...latest, viewCounts: { one: 2 } }); session.setHeld(false);
  assert.equal(jobs.length, 2); assert.equal(session.getSnapshot().result, result); assert.equal(session.getSnapshot().updated, true);
});

test('late resolution or rejection cannot publish after navigation, idle release or replacement', async () => {
  for (const reject of [false, true]) {
    const { session, jobs } = harness(); const first = input(); session.setInput(first);
    session.setInput({ ...first, query: 'latest' }); assert.equal(jobs[0].signal.aborted, true);
    if (reject) jobs[0].reject(Error('late')); else jobs[0].resolve(result);
    await tick(); assert.equal(session.getSnapshot().pending, true); assert.equal(session.getSnapshot().error, false);
    session.release(); jobs[1].resolve(result); await tick();
    assert.equal(session.getSnapshot().scope, null); assert.equal(session.getSnapshot().result, EMPTY_SEARCH_RANKING);
  }
});

test('failure can be retried; unmount/remount releases old inputs and can run again', async () => {
  const { session, jobs } = harness(); session.setInput(input()); jobs[0].reject(Error('failure')); await tick();
  assert.equal(session.getSnapshot().error, true); session.refresh(); jobs[1].resolve(result); await tick();
  assert.equal(session.getSnapshot().error, false); session.release(); session.setInput(input());
  assert.equal(jobs.length, 3); jobs[2].resolve(result); await tick(); assert.equal(session.getSnapshot().result, result);
});

test('real rank changes only on refresh, while hidden titles disappear immediately', async () => {
  const first = { ...input(), videos: [card, { ...card, id: 'two' }], ids: new Set(['one', 'two']) };
  const session = createSearchRankingSession((input, signal) => rankSearchResults(input, signal, async () => {}));
  const finished = () => new Promise<void>(resolve => { const stop = session.subscribe(() => { if (!session.getSnapshot().pending) { stop(); resolve(); } }); });
  let done = finished(); session.setInput(first); await done;
  assert.deepEqual(session.getSnapshot().result.ranked.map(row => row.id), ['one', 'two']);
  session.setInput({ ...first, favorites: { two: true } });
  assert.deepEqual(session.getSnapshot().result.ranked.map(row => row.id), ['one', 'two']);
  done = finished(); session.refresh(); await done;
  assert.deepEqual(session.getSnapshot().result.ranked.map(row => row.id), ['two', 'one']);
  done = finished(); session.setInput({ ...first, hidden: { two: true } });
  assert.equal(session.getSnapshot().result, EMPTY_SEARCH_RANKING); await done;
  assert.deepEqual(session.getSnapshot().result.ranked.map(row => row.id), ['one']); session.release();
});
