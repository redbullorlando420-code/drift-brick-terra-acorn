import { test } from "node:test";
import assert from "node:assert/strict";
import { memoizeSelector } from "./selector-cache.ts";
test('peek reuses only current inputs without computing a catalog', () => {
  let calls = 0;
  const select = memoizeSelector((state: { rows: number[] }) => { calls++; return state.rows; }, ['rows']);
  const state = { rows: [1, 2] };
  assert.equal(select.peek(state), undefined); assert.equal(calls, 0);
  assert.equal(select(state), state.rows); assert.equal(select.peek(state), state.rows);
  assert.equal(select.peek({ rows: [1, 2] }), undefined); assert.equal(calls, 1);
});
test("dynamic dependencies retain large catalog results across irrelevant playback updates", () => {
  const videos = Array.from({ length: 10_000 }, (_, id) => ({ id }));
  let calls = 0;
  const select = memoizeSelector((state: { videos: typeof videos; recent: boolean; progress: object; history: object }, adult) => { calls++; return { videos: [...state.videos], adult }; }, s => s.recent ? ["videos", "recent", "progress"] : ["videos", "recent"]);
  const state = { videos, recent: false, progress: {}, history: {} };
  const initial = select(state);
  for (let i = 0; i < 100; i++) assert.equal(select({ ...state, progress: { i }, history: { i } }), initial);
  assert.equal(calls, 1);
  const recent = { ...state, recent: true };
  assert.notEqual(select(recent), initial);
  assert.notEqual(select({ ...recent, progress: {} }), select(recent));
  assert.equal(select(state), select({ ...state, history: {} }));
  assert.notEqual(select(state, true), select(state));
});
test("changing dependency keys invalidates equal-valued selections", () => {
  const select = memoizeSelector((s: { a: number; b: number; choice: boolean }) => s.choice, s => s.choice ? ["a"] : ["b"]);
  assert.equal(select({ a: 1, b: 1, choice: true }), true);
  assert.equal(select({ a: 1, b: 1, choice: false }), false);
});
test("shortening a dynamic dependency list cannot reuse a longer cached selection", () => {
  const select = memoizeSelector((s: { a: number; b: number; more: boolean }) => s.more, s => s.more ? ["a", "b"] : ["a"]);
  assert.equal(select({ a: 1, b: 1, more: true }), true);
  assert.equal(select({ a: 1, b: 1, more: false }), false);
});
