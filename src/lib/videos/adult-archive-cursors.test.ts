import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadAdultArchiveCursors, saveAdultArchiveCursors, recordAdultArchiveFailure } from './adult-archive-cursors.ts';
const values = new Map<string, string>();
let quota = false;
Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => {if(quota)throw Error('QuotaExceeded');values.set(key, value);}, removeItem: (key: string) => values.delete(key) } });
test('single-provider writes preserve other resume points and failures preserve partial offsets', () => {
  saveAdultArchiveCursors('all', 'latest', { eporner: 8, redtube: 100 }, { eporner: 320 });
  saveAdultArchiveCursors('all', 'latest', { redtube: 101 });
  assert.equal(loadAdultArchiveCursors('all', 'latest').eporner?.offset, 320);
  saveAdultArchiveCursors('all', 'latest', {});
  assert.equal(loadAdultArchiveCursors('all', 'latest').redtube?.page, 101);
  saveAdultArchiveCursors('all', 'latest', { eporner: null });
  const cursor = loadAdultArchiveCursors('all', 'latest').eporner!;
  assert.equal(cursor.page, 1); assert.equal(cursor.offset, 0); assert.ok(cursor.retryAt! > Date.now());
  saveAdultArchiveCursors('all', 'latest', {eporner:8},{eporner:320});
  recordAdultArchiveFailure('all', 'latest', 'eporner');
  const failed = loadAdultArchiveCursors('all', 'latest').eporner!;
  assert.equal(failed.page, 8); assert.equal(failed.offset, 320);
  assert.ok(failed.retryAt! > Date.now());
});
test('quota failure still returns the accepted in-session cursor without overwriting another provider from a stale mirror',()=>{
 quota=true;
 try{const next=saveAdultArchiveCursors('quota-query','latest',{eporner:9},{eporner:320});assert.equal(next.eporner?.page,9);assert.equal(next.eporner?.offset,320);assert.equal(next.redtube,undefined);assert.equal(loadAdultArchiveCursors('quota-query','latest').eporner,undefined);}
 finally{quota=false;}
});
