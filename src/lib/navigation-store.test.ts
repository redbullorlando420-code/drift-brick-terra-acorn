import test from 'node:test';
import assert from 'node:assert/strict';
import { createNavigationStore } from './navigation-store.ts';

type State = { source: string; viewer: boolean; revision: number; catalog: readonly number[] };
function fixture(preparation: { prepare?: (state: State, signal: AbortSignal) => Promise<void>; prepared?: (before: State, after: State) => boolean } = {}) {
  const initial: State = { source: 'home', viewer: false, revision: 0, catalog: [] };
  let state = initial;
  const upstream = new Set<(next: State, previous: State) => void>();
  const jobs: Array<{ work: () => void; cancelled: boolean }> = [];
  const source = { getState: () => state, getInitialState: () => initial,
    subscribe(fn: (next: State, previous: State) => void) { upstream.add(fn); return () => { upstream.delete(fn); }; } };
  const browse = createNavigationStore(source, { key: s => s.source, held: s => s.viewer,
    ...preparation,
    defer: s => s.source !== 'home' && s.source !== 'settings',
    schedule(work) { const job = { work, cancelled: false }; jobs.push(job); return () => { job.cancelled = true; }; } });
  const update = (patch: Partial<State>) => {
    const previous = state; state = { ...state, ...patch };
    for (const notify of upstream) notify(state, previous);
  };
  return { source, browse, update, jobs, upstream, flush() { for (const job of jobs.splice(0)) if (!job.cancelled) job.work(); } };
}

test('navigation controls update immediately while million-entry selectors wait outside the event', () => {
  const f = fixture(), catalog = Array.from({ length: 1_000_000 }, (_, i) => i);
  f.update({ catalog });
  let reads = 0, visibleSource = 'home';
  const off = f.browse.subscribe(next => { for (const row of next.catalog) reads += row === 0 ? 1 : 0; });
  const offControls = f.source.subscribe(next => { visibleSource = next.source; });
  const before = f.browse.getState();
  f.update({ source: 'youtube' });
  assert.equal(visibleSource, 'youtube'); assert.equal(reads, 0);
  assert.equal(f.browse.getState(), before, 'stable snapshot throughout a render');
  assert.equal(f.browse.getInitialState(), f.source.getInitialState());
  f.flush();
  assert.equal(reads, 1); assert.equal(f.browse.getState().catalog, catalog, 'no catalog copy or truncation');
  assert.equal(f.browse.getState().source, 'youtube'); off(); offControls();
});

test('cooperative preparation cancels on navigation and publishes only current catalog inputs', async () => {
  const gates: Array<{ state: State; signal: AbortSignal; resolve: () => void }> = [];
  const f = fixture({ prepare: (state, signal) => new Promise<void>(resolve => gates.push({ state, signal, resolve })),
    prepared: (before, after) => before.catalog === after.catalog });
  const seen: State[] = [], off = f.browse.subscribe(next => seen.push(next));
  f.update({ source: 'youtube', catalog: [1] }); f.flush();
  assert.equal(seen.length, 0); assert.equal(gates.length, 1);
  f.update({ catalog: [2], revision: 2 }); assert.equal(gates[0].signal.aborted, true); f.flush();
  gates[0].resolve(); await Promise.resolve();
  assert.equal(gates.length, 2, 'prepare the new immutable catalog before publication');
  f.update({ revision: 3 }); gates[1].resolve(); await Promise.resolve();
  assert.equal(seen.length, 1); assert.deepEqual(seen[0].catalog, [2]); assert.equal(seen[0].revision, 3);
  f.update({ source: 'twitch' }); f.flush(); f.update({ source: 'settings' });
  assert.equal(gates[2].signal.aborted, true); gates[2].resolve(); await Promise.resolve();
  assert.deepEqual(seen.map(s => s.source), ['youtube', 'settings']); off();
});

test('preparation failure does not strand a page and unmount aborts work already running', async () => {
  const f = fixture({ prepare: async () => { throw new Error('optional preparation failed'); } });
  const off = f.browse.subscribe(() => {}); f.update({ source: 'youtube' }); f.flush(); await Promise.resolve();
  assert.equal(f.browse.getState().source, 'youtube'); off();
  let signal: AbortSignal | undefined, release: (() => void) | undefined;
  const running = fixture({ prepare: async (_, currentSignal) => { signal = currentSignal; await new Promise<void>(resolve => { release = resolve; }); } });
  const disconnect = running.browse.subscribe(() => assert.fail('unmounted route must not publish'));
  running.update({ source: 'youtube' }); running.flush(); disconnect();
  assert.equal(signal?.aborted, true); release!(); await Promise.resolve(); assert.equal(running.upstream.size, 0);
});

test('a rapid route burst publishes only the final destination, even if canceled callbacks run', () => {
  const f = fixture(), seen: State[] = [];
  const off = f.browse.subscribe(next => seen.push(next));
  for (let i = 0; i < 100; i++) f.update({ source: i % 2 ? 'twitch' : 'youtube' });
  assert.equal(f.jobs.filter(job => !job.cancelled).length, 1);
  for (const job of f.jobs) job.work();
  assert.deepEqual(seen.map(s => s.source), ['twitch']); off();
});

test('10,000 pending updates retain the newest snapshot without postponing the route', () => {
  const f = fixture(), seen: State[] = [];
  const off = f.browse.subscribe(next => seen.push(next));
  f.update({ source: 'youtube' });
  for (let revision = 1; revision <= 10_000; revision++) f.update({ revision });
  assert.equal(f.jobs.length, 1); assert.equal(seen.length, 0);
  f.flush(); assert.equal(seen.length, 1); assert.equal(seen[0].revision, 10_000); off();
});

test('Home and tools escape pending catalogs immediately; stale work cannot restore the old destination', () => {
  for (const destination of ['home', 'settings']) {
    const f = fixture(), seen: string[] = [];
    const off = f.browse.subscribe(next => seen.push(next.source));
    f.update({ source: 'youtube' }); f.update({ source: destination });
    assert.equal(f.browse.getState().source, destination);
    f.jobs[0].work(); assert.deepEqual(seen, [destination]); off();
  }
});

test('same-source filters and saves stay immediate once the destination is ready', () => {
  const f = fixture(), seen: State[] = [];
  const off = f.browse.subscribe(next => seen.push(next));
  f.update({ source: 'youtube' }); f.flush(); f.update({ revision: 9 });
  assert.equal(f.browse.getState().revision, 9); assert.equal(seen.length, 2); assert.equal(f.jobs.length, 0); off();
});

test('viewer updates remain live, covered work sleeps, and close stages the latest navigation once', () => {
  const f = fixture(), seen: State[] = [];
  const off = f.browse.subscribe(next => seen.push(next));
  f.update({ viewer: true, source: 'youtube' });
  for (let revision = 1; revision <= 100; revision++) f.update({ revision });
  assert.equal(f.source.getState().revision, 100); assert.equal(f.jobs.length, 0); assert.equal(seen.length, 0);
  f.update({ viewer: false }); assert.equal(f.jobs.length, 1);
  f.flush(); assert.equal(seen[0].source, 'youtube'); assert.equal(seen[0].revision, 100); off();
});

test('unmount cancels pending work and releases both upstream subscriptions and cached snapshots', () => {
  const f = fixture(), off = f.browse.subscribe(() => assert.fail('unmounted subscriber'));
  f.update({ source: 'youtube' }); assert.equal(f.upstream.size, 1);
  off(); assert.equal(f.upstream.size, 0); assert.equal(f.jobs[0].cancelled, true);
  f.update({ catalog: [99] }); f.jobs[0].work();
  assert.equal(f.browse.getState(), f.source.getState());
  const offAgain = f.browse.subscribe(() => {}); assert.equal(f.upstream.size, 1); offAgain();
});

test('opening a viewer cancels an already queued route and close resumes only the newest state', () => {
  const f = fixture(), seen: State[] = [];
  const off = f.browse.subscribe(next => seen.push(next));
  f.update({ source: 'youtube' }); f.update({ viewer: true });
  f.jobs[0].work(); assert.equal(seen.length, 0);
  f.update({ source: 'twitch', revision: 4 }); assert.equal(f.jobs.length, 1);
  f.update({ viewer: false }); assert.equal(f.jobs.length, 2);
  f.flush(); assert.equal(seen.length, 1); assert.equal(seen[0].source, 'twitch'); assert.equal(seen[0].revision, 4); off();
});

test('every catalog subscriber shares one frame boundary and receives the same immutable snapshot', () => {
  const f = fixture(), a: State[] = [], b: State[] = [];
  const off = f.browse.subscribe(next => a.push(next)), offB = f.browse.subscribe(next => b.push(next));
  f.update({ source: 'youtube' }); assert.equal(f.jobs.length, 1); f.flush();
  assert.equal(a[0], b[0]); off(); assert.equal(f.upstream.size, 1); offB(); assert.equal(f.upstream.size, 0);
});
