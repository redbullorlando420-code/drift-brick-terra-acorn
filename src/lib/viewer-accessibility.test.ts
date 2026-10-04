import test from 'node:test';
import assert from 'node:assert/strict';
import { createShelfRelease, playerShortcutAllowed, viewerReturnTarget } from './viewer-accessibility.ts';

test('playback keys yield to controls, modifiers, nested menus and the viewer Escape handler', () => {
  const base = { interactive: false, modified: false, prevented: false, provider: false };
  assert.equal(playerShortcutAllowed({ ...base, key: ' ' }), true);
  for (const key of [' ', 'ArrowLeft', 'ArrowRight', 'n', 'p', 'm']) {
    assert.equal(playerShortcutAllowed({ ...base, key, interactive: true }), false);
    assert.equal(playerShortcutAllowed({ ...base, key, prevented: true }), false);
    assert.equal(playerShortcutAllowed({ ...base, key, modified: true }), false);
  }
  assert.equal(playerShortcutAllowed({ ...base, key: 'Escape' }), false);
  for (const key of [' ', 'ArrowLeft', 'f', 'm', 'Escape']) assert.equal(playerShortcutAllowed({ ...base, key, provider: true }), false);
  assert.equal(playerShortcutAllowed({ ...base, key: 'N', provider: true }), true);
});

test('return focus survives preview/player handoffs, virtualization and source navigation without stealing restored focus', () => {
  const opener = {}, replacement = {}, fallback = {};
  const base = { viewerOpen: false, sameScope: true, currentOutside: false, opener, replacement, fallback };
  assert.equal(viewerReturnTarget(base), opener);
  assert.equal(viewerReturnTarget({ ...base, viewerOpen: true }), null);
  assert.equal(viewerReturnTarget({ ...base, currentOutside: true }), null);
  assert.equal(viewerReturnTarget({ ...base, opener: null }), replacement);
  assert.equal(viewerReturnTarget({ ...base, opener: null, replacement: null }), fallback);
  assert.equal(viewerReturnTarget({ ...base, sameScope: false }), fallback);
});

test('a deferred shelf never unmounts keyboard focus and canceled queued releases cannot remove a remounted shelf', () => {
  const callbacks: Array<() => void> = []; const delays: number[] = []; let clears = 0; let released = 0; let focused = false;
  const controller = createShelfRelease((callback, delay) => { callbacks.push(callback); delays.push(delay); return () => { clears++; }; });
  controller.defer(() => focused, () => { released++; });
  focused = true; callbacks[0](); assert.equal(released, 0);
  controller.defer(() => focused, () => { released++; });
  controller.cancel(); focused = false; callbacks[1](); assert.equal(released, 0);
  controller.defer(() => focused, () => { released++; });
  controller.defer(() => focused, () => { released++; });
  callbacks[2](); assert.equal(released, 0);
  callbacks[3](); assert.equal(released, 1);
  assert.deepEqual(delays, [900, 900, 900, 900]); assert.equal(clears, 2);
});
