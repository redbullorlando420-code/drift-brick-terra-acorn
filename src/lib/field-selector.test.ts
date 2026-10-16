import { test } from 'node:test';
import assert from 'node:assert/strict';
import { memoizeFields } from './field-selector.ts';

test('unrelated writes reuse the exact snapshot without enumerating large state', () => {
  const guarded = new Proxy({}, { ownKeys() { throw Error('catalog enumerated'); } });
  const state = { values: { watched: 2 }, catalog: guarded, status: 1 };
  const select = memoizeFields<typeof state>()({ count: s => s.values.watched });
  const first = select(state);
  assert.equal(select({ ...state, status: 2, values: { watched: 2 } }), first);
  assert.equal(select(state), first);
});

test('selected changes publish atomically and preserve previously returned values', () => {
  const action = () => {}, replacementAction = () => {};
  const state = { liked: false, progress: { t: 1 }, action, tag: ['old'] };
  const select = memoizeFields<typeof state>()({ liked: s => s.liked, progress: s => s.progress, action: s => s.action, tag: s => s.tag });
  const first = select(state);
  const replacement = { ...state, liked: true, progress: { t: 10 }, action: replacementAction, tag: ['new'] };
  const second = select(replacement);
  assert.deepEqual(second, replacement);
  assert.notEqual(second, first);
  assert.equal(first.liked, false); assert.equal(first.progress.t, 1); assert.equal(first.action, action);
  assert.equal(select(replacement), second);
  assert.deepEqual({ ...select(state) }, state, 'React can request a previous state again');
});

test('independent consumers and Object.is scalar semantics stay isolated', () => {
  const create = () => memoizeFields<{ value: number }>()({ value: s => s.value });
  const a = create(), b = create();
  const zero = a({ value: 0 });
  assert.notEqual(a({ value: -0 }), zero);
  const nan = a({ value: NaN });
  assert.equal(a({ value: NaN }), nan);
  assert.notEqual(b({ value: NaN }), nan);
});

test('empty selections remain stable and field names cannot alter the result prototype', () => {
  const empty = memoizeFields<unknown>()({});
  assert.equal(empty({}), empty({}));
  const fields = { ['__proto__']: (state: number) => state, value: (state: number) => state + 1 };
  const select = memoizeFields<number>()(fields);
  const first = select(2), second = select(3);
  assert.equal(first['__proto__'], 2); assert.equal(second['__proto__'], 3);
  assert.equal(second.value, 4);
  assert.equal(Object.getPrototypeOf(second), Object.prototype);
});
