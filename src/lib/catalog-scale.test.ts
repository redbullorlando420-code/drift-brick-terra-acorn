import { test } from 'node:test';
import assert from 'node:assert/strict';
import { previewCandidates, MAX_PREVIEW_CANDIDATES } from './videos/preview-candidates.ts';
import { catalogCard, withCatalogDetails } from './videos/catalog-card.ts';
import { archivePageWindow } from './remote/archive-page.ts';
import { normalizePullSettings } from './pull-settings.ts';
import { createPullScheduler } from './pull-scheduler.ts';
import { playbackWindow } from './videos/playback-queue.ts';
import { adultFolderIds } from './videos/adult-providers.ts';
import { folderIsPrivate } from './videos/folder-privacy.ts';
import type { LibraryVideo } from './videos/types';
const video = (id: string): LibraryVideo => ({ id, folderId: 'creator', name: id, path: id, addedAt: 0, mime: 'video/youtube', extension: 'youtube', size: 0, remote: { kind: 'youtube', videoId: id, channelName: 'Creator', embedUrl: 'https://youtube.com/embed/example', watchUrl: 'https://youtube.com/watch?v=example' } });
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

test('mounted card privacy checks reuse folder flags while reacting to a new source snapshot', () => {
  let reads = 0;
  const folders = Array.from({ length: 1000 }, (_, index) => ({ id: String(index), get adult() { reads++; return index === 999; } }));
  for (let tick = 0; tick < 100; tick++) for (let card = 0; card < 108; card++) {
    assert.equal(folderIsPrivate(folders, String(card)), false);
  }
  assert.equal(reads, 1000, 'folder flags are inspected once, not once per mounted card and store update');
  assert.equal(folderIsPrivate(folders, '999'), true);
  assert.equal(folderIsPrivate([...folders.slice(0, 999), { id: '999', adult: false }], '999'), false);
});

test('restored provider archives stay private even when a legacy folder omitted its flag', () => {
  const ids = adultFolderIds([{ id: 'redtube:discover' }, { id: 'private-local', adult: true }, { id: 'public-local' }]);
  assert.ok(ids.has('redtube:discover')); assert.ok(ids.has('eporner:discover'));
  assert.ok(ids.has('private-local')); assert.ok(!ids.has('public-local'));
});

test('bounded playback preserves ordered previous and next neighbors', () => {
  const rows = Array.from({ length: 10_000 }, (_, i) => video(String(i)));
  const window = playbackWindow(rows, rows[7000]);
  assert.equal(window.length, 512);
  const selected = window.indexOf(rows[7000]);
  assert.equal(window[selected - 1], rows[6999]);
  assert.equal(window[selected + 1], rows[7001]);
  assert.deepEqual(playbackWindow(rows, video('missing')), [video('missing')]);
});
test('million-entry preview path reads a bounded sample and always keeps the selected card', () => {
  let reads = 0;
  const catalog = new Proxy({ length: 1_000_000 }, { get: (target, key) => key === 'length' ? target.length : (++reads, video(String(key))) }) as unknown as LibraryVideo[];
  const selected = video('selected');
  const candidates = previewCandidates(catalog, selected, Array.from({ length: 100_000 }, (_, i) => video(`owner-${i}`)));
  assert.equal(candidates[0], selected);
  assert.ok(candidates.length <= MAX_PREVIEW_CANDIDATES);
  assert.ok(reads <= MAX_PREVIEW_CANDIDATES);
  assert.equal(new Set(candidates.map(row => row.id)).size, candidates.length);
  assert.ok(candidates.some(row => row.id.startsWith('owner-')));
  assert.ok(candidates.some(row => Number(row.id) > 900_000));
});
test('listing cards shed transcripts without losing playback or durable full details', () => {
  const original = { ...video('target'), description: 'full description'.repeat(1000), remote: { ...video('target').remote!, comments: [{ id: 'comment', body: 'transcript'.repeat(10_000) }], thumbFallbacks: ['1', '2', '3', '4', '5'] } };
  const card = catalogCard(original);
  assert.equal(card.description, undefined); assert.equal(card.remote?.comments, undefined);
  assert.equal(card.remote?.embedUrl, original.remote.embedUrl);
  assert.equal(card.remote?.thumbFallbacks?.length, 4);
  const restored = withCatalogDetails({ ...card, name: 'renamed' }, original);
  assert.equal(restored.name, 'renamed'); assert.equal(restored.description, original.description);
  assert.equal(restored.remote?.comments, original.remote.comments);
  assert.ok(!restored.detailsOnDisk); assert.equal(original.remote.comments.length, 1);
  const previouslyOpened = catalogCard({ ...original, detailsOnDisk: true });
  assert.equal(previouslyOpened.remote?.comments, undefined);
  assert.equal(previouslyOpened.description, undefined);
});
test('partial archive pages resume without gaps even when the batch limit changes', () => {
  const rows = Array.from({ length: 1000 }, (_, i) => i);
  const first = archivePageWindow(rows, 8, 0, 160, 9);
  assert.equal(first.nextPage, 8); assert.equal(first.nextOffset, 160);
  const second = archivePageWindow(rows, first.nextPage!, first.nextOffset, 400, 9);
  const third = archivePageWindow(rows, second.nextPage!, second.nextOffset, 1000, 9);
  assert.deepEqual([...first.rows, ...second.rows, ...third.rows], rows);
  assert.equal(third.nextPage, 9); assert.equal(third.nextOffset, 0);
  assert.equal(archivePageWindow([1], 8, 0, 20, null).nextPage, null);
});
test('pull policy clamps corrupt settings and caps a million-entry target without deleting rows', () => {
  const settings = normalizePullSettings({ concurrentRequests: 500, requestGapMs: -1, adultBatchVideos: 6000, adultCatalogTarget: 9e12, youtubeBatchVideos: NaN, automaticPulls: false });
  assert.equal(settings.concurrentRequests, 3); assert.equal(settings.requestGapMs, 250);
  assert.equal(settings.adultBatchVideos, 6000); assert.equal(settings.adultCatalogTarget, 1_000_000);
  assert.equal(settings.youtubeBatchVideos, 100); assert.equal(settings.automaticPulls, false);
});
test('pull queue spaces requests, holds responses, and discards cancelled work', async () => {
  let available = true, complete!: (value: number) => void;
  const started: number[] = [];
  const queue = createPullScheduler(() => ({ concurrency: 1, gapMs: 30 }), () => available, 2);
  const first = queue.run(() => { started.push(Date.now()); return new Promise<number>(resolve => { complete = resolve; }); });
  available = false; complete(5); await sleep(10);
  assert.equal(queue.snapshot().active, 1); assert.ok(queue.snapshot().held);
  const second = queue.run(async () => { started.push(Date.now()); return 6; });
  queue.cancel();
  await assert.rejects(second, /cancelled/); await assert.rejects(first, /cancelled/);
  assert.equal(started.length, 1);
  available = true;
  assert.equal(await queue.run(async () => { started.push(Date.now()); return 7; }), 7);
  assert.ok(started[1] - started[0] >= 25);
});
