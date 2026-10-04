import test from 'node:test';
import assert from 'node:assert/strict';
import { createViewerDetails } from './viewer-details.ts';
import type { LibraryVideo } from './types.ts';
const card = (id: string, description = 'Details'): LibraryVideo => ({ id, name: id, folderId: 'yt:channel', path: id, size: 0, mime: 'video/youtube', extension: 'yt', addedAt: 0, description, remote: { kind: 'youtube' } });

test('preview to player shares disk work and keeps the latest twelve opened detail records', async () => {
  const details = createViewerDetails(); let reads = 0;
  const first = details.load('one', async () => { reads++; return card('one'); });
  assert.equal(details.load('one', async () => { throw new Error('duplicate read'); }), first);
  await first; await details.load('one', async () => { throw new Error('cache miss'); });
  assert.equal(reads, 1);
  for (let i = 0; i < 100; i++) await details.load(String(i), async () => card(String(i)));
  assert.equal(details.diagnostics().entries, 12);
  assert.equal(details.diagnostics().pending, 0);
});
test('detail reuse obeys a total byte budget and excludes giant or numerous short transcripts', async () => {
  const details = createViewerDetails();
  for (let i = 0; i < 30; i++) await details.load(String(i), async () => card(String(i), 'x'.repeat(50_000)));
  assert.equal(details.diagnostics().entries, 5);
  assert.ok(details.diagnostics().estimatedBytes <= details.diagnostics().maxBytes);
  const huge = card('huge', 'x'.repeat(128_000));
  await details.load('huge', async () => huge);
  let reads = 0; await details.load('huge', async () => { reads++; return huge; }); assert.equal(reads, 1);
  const tinyRows = { ...card('short-rows'), remote: { kind: 'youtube' as const, comments: Array.from({ length: 2000 }, (_, i) => ({ id: String(i), body: '' })) } };
  await details.load(tinyRows.id, async () => tinyRows);
  await details.load(tinyRows.id, async () => { reads++; return tinyRows; }); assert.equal(reads, 2);
  const largePoster = { ...card('poster'), poster: 'data:image/png;base64,' + 'x'.repeat(100_000) };
  await details.load(largePoster.id, async () => largePoster);
  await details.load(largePoster.id, async () => { reads++; return largePoster; }); assert.equal(reads, 3);
});
test('a cleared or invalidated disk read cannot resurrect old cached details', async () => {
  const details = createViewerDetails(); let resolve!: (video: LibraryVideo) => void;
  const pending = details.load('one', () => new Promise(done => { resolve = done; }));
  await Promise.resolve(); details.clear(); resolve(card('one')); await pending;
  assert.equal(details.diagnostics().entries, 0);
  const old = details.load('two', () => new Promise(done => { resolve = done; }));
  await Promise.resolve(); details.invalidate('two');
  await details.load('two', async () => card('two', 'New')); resolve(card('two', 'Old')); await old;
  assert.equal((await details.load('two', async () => undefined))?.description, 'New');
});
test('comment notifications are isolated to the selected viewer and released on title changes', () => {
  const details = createViewerDetails(); let first = 0, other = 0;
  const stop = details.subscribe('one', () => { first++; });
  const stopOther = details.subscribe('two', () => { other++; });
  const comments = [{ id: 'c', body: 'Hello' }]; details.setComments('one', comments);
  assert.equal(details.commentsFor('one'), comments); assert.equal(first, 1); assert.equal(other, 0);
  details.releaseCommentsExcept('one'); assert.equal(first, 1);
  details.setComments('two', comments); assert.equal(first, 2); assert.equal(other, 1);
  assert.equal(details.commentsFor('one'), undefined);
  details.releaseCommentsExcept(null); assert.equal(details.diagnostics().activeTranscripts, 0);
  stop(); stopOther(); assert.equal(details.diagnostics().subscribers, 0);
});
test('repeated load, comment, close cycles do not grow viewer caches or subscriptions', async () => {
  const details = createViewerDetails();
  for (let i = 0; i < 2000; i++) {
    const id = String(i), stop = details.subscribe(id, () => {});
    await details.load(id, async () => card(id, 'x'.repeat(1000)));
    details.setComments(id, [{ id: 'chat', body: 'x'.repeat(200_000) }]);
    details.releaseComments(); stop();
  }
  assert.deepEqual(details.diagnostics(), { entries: 0, estimatedBytes: 0, maxEntries: 12, maxBytes: 512_000, pending: 0, activeTranscripts: 0, subscribers: 0 });
});
