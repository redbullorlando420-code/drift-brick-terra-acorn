import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advanceTwitchClipCursor, decodeTwitchClipCursor, encodeTwitchClipCursor } from './twitch-clip-cursor.ts';

test('Twitch clip cursor resumes a distinct page and exhausts safely', () => {
  const first = advanceTwitchClipCursor(true, 'clip-page-2');
  assert.deepEqual(first, { after: 'clip-page-2' });
  assert.deepEqual(decodeTwitchClipCursor(encodeTwitchClipCursor(first)), first);
  assert.equal(advanceTwitchClipCursor(true, 'clip-page-2', first), undefined);
  assert.equal(advanceTwitchClipCursor(false, null, first), undefined);
});

test('malformed Twitch clip cursors restart from the first page', () => {
  assert.equal(decodeTwitchClipCursor('invalid'), undefined);
  assert.equal(decodeTwitchClipCursor(JSON.stringify({ v: 2, after: 'cursor' })), undefined);
  assert.equal(decodeTwitchClipCursor(JSON.stringify({ v: 1, after: 'x'.repeat(4_097) })), undefined);
});
