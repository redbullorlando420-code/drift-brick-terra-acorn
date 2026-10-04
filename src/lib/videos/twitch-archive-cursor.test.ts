import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advanceTwitchArchiveCursor, decodeTwitchArchiveCursor, encodeTwitchArchiveCursor } from './twitch-archive-cursor.ts';

test('Twitch archive cursor survives a page and resumes on its broadcast shelf', () => {
  const cursor = { stage: 'ARCHIVE' as const, after: 'saved-after' };
  assert.deepEqual(decodeTwitchArchiveCursor(encodeTwitchArchiveCursor(cursor)), cursor);
  assert.deepEqual(advanceTwitchArchiveCursor(cursor, true, 'next-page'), { stage: 'ARCHIVE', after: 'next-page' });
});

test('Twitch archive cursor advances through archive, highlights, uploads, then exhausts', () => {
  const archive = { stage: 'ARCHIVE' as const, after: null };
  const highlight = advanceTwitchArchiveCursor(archive, false, null);
  assert.deepEqual(highlight, { stage: 'HIGHLIGHT', after: null });
  const upload = advanceTwitchArchiveCursor(highlight!, false, null);
  assert.deepEqual(upload, { stage: 'UPLOAD', after: null });
  assert.equal(advanceTwitchArchiveCursor(upload!, false, null), null);
});

test('invalid and non-advancing Twitch cursors are bounded and safe', () => {
  assert.deepEqual(decodeTwitchArchiveCursor('{broken'), { stage: 'ARCHIVE', after: null });
  const cursor = { stage: 'ARCHIVE' as const, after: 'same' };
  assert.deepEqual(advanceTwitchArchiveCursor(cursor, true, 'same'), cursor);
});
