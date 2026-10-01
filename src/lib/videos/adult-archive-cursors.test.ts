import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadAdultArchiveCursors, saveAdultArchiveCursors, recordAdultArchiveFailure } from './adult-archive-cursors.ts';
const values = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) } });
test('single-provider writes preserve other resume points and failures preserve partial offsets', () => {
  saveAdultArchiveCursors('all', 'latest', { eporner: 8, redtube: 100 }, { eporner: 320 });
  saveAdultArchiveCursors('all', 'latest', { redtube: 101 });
  assert.equal(loadAdultArchiveCursors('all', 'latest').eporner?.offset, 320);
  saveAdultArchiveCursors('all', 'latest', {});
  assert.equal(loadAdultArchiveCursors('all', 'latest').redtube?.page, 101);
  saveAdultArchiveCursors('all', 'latest', { eporner: null });
  const cursor = loadAdultArchiveCursors('all', 'latest').eporner!;
  assert.equal(cursor.page, 8); assert.equal(cursor.offset, 320); assert.ok(cursor.retryAt! > Date.now());
  recordAdultArchiveFailure('all', 'latest', 'eporner');
  const failed = loadAdultArchiveCursors('all', 'latest').eporner!;
  assert.equal(failed.page, 8); assert.equal(failed.offset, 320);
  assert.ok(failed.retryAt! > Date.now());
});
