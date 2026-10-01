import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeferredStore } from './deferred-store.ts';

type State = { viewer: string | null; progress: number; saved: number; catalog: readonly number[] };
function fixture() {
  const initial: State = { viewer: null, progress: 0, saved: 0, catalog: [] };
  let state = initial;
  const listeners = new Set<(next: State, previous: State) => void>();
  const source = {
    getState: () => state,
    getInitialState: () => initial,
    subscribe: (listener: (next: State, previous: State) => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
  };
  return { source, listeners, update(patch: Partial<State>) {
    const previous = state;
    state = { ...state, ...patch };
    for (const notify of listeners) notify(state, previous);
  } };
}

test('10,000 watch updates cause no covered browse work and publish the latest save on close', () => {
  const { source, update, listeners } = fixture();
  const browse = createDeferredStore(source, state => Boolean(state.viewer));
  const seen: State[] = [], second: State[] = [];
  const off = browse.subscribe(state => seen.push(state));
  const offSecond = browse.subscribe(state => second.push(state));
  const before = browse.getState();
  assert.equal(listeners.size, 1, 'all selectors share one upstream subscription');
  update({ viewer: 'preview' });
  for (let progress = 1; progress <= 10_000; progress++) update({ progress, saved: progress });
  update({ viewer: 'player' });
  assert.equal(source.getState().saved, 10_000, 'saving and playback remain live');
  assert.equal(browse.getState(), before);
  assert.equal(seen.length, 0);
  update({ viewer: null });
  assert.equal(seen.length, 1);
  assert.equal(second.length, 1);
  assert.equal(seen[0], source.getState());
  assert.equal(browse.getState().progress, 10_000);
  off(); offSecond();
  assert.equal(listeners.size, 0);
});

test('unmounted browse stores release the held catalog and reconnect to current data', () => {
  const { source, update, listeners } = fixture();
  const browse = createDeferredStore(source, state => Boolean(state.viewer));
  const off = browse.subscribe(() => {});
  const catalog = Array.from({ length: 1_000_000 }, (_, index) => index);
  update({ catalog });
  update({ viewer: 'preview', catalog: [] });
  assert.equal(browse.getState().catalog, catalog);
  off();
  assert.equal(listeners.size, 0);
  assert.equal(browse.getState().catalog, source.getState().catalog);
  const offAgain = browse.subscribe(() => {});
  assert.equal(listeners.size, 1);
  offAgain();
});

test('visible updates stay immediate and preview first-mount has a stable snapshot', () => {
  const { source, update } = fixture();
  const browse = createDeferredStore(source, state => Boolean(state.viewer));
  assert.equal(browse.getInitialState(), source.getInitialState());
  update({ viewer: 'preview', progress: 12 });
  const first = browse.getState();
  const seen: State[] = [];
  const off = browse.subscribe(state => seen.push(state));
  update({ progress: 24 });
  assert.equal(browse.getState(), first);
  update({ viewer: null });
  update({ saved: 3 });
  assert.equal(seen.length, 2);
  assert.equal(browse.getState().saved, 3);
  off();
});
