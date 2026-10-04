import test from 'node:test';
import assert from 'node:assert/strict';
import { enrichmentCursor, metadataEnrichmentStep } from './metadata-enrichment.ts';
import { restoreEnrichmentRow, type EnrichmentRow } from './enrichment-batch.ts';
import type { Folder, LibraryVideo, VideoMetadataProvenance } from './types.ts';

function fixture(length: number) {
  let reads = 0, saves = 0, notifications = 0, turns = 0;
  const videos = new Proxy({ length } as LibraryVideo[], { get(target, key) {
    if (typeof key === 'string' && /^\d+$/.test(key)) { reads++; return { id: key, remote: { kind: 'youtube' } } as LibraryVideo; }
    return Reflect.get(target, key);
  } });
  let state = { videos, folders: [] as Folder[], tags: {} as Record<string, string[]>, metadataProvenance: {} as Record<string, VideoMetadataProvenance> };
  const disk = new Map<string, EnrichmentRow>();
  const options = { get: () => state, publish(next: Pick<typeof state, 'tags' | 'metadataProvenance'>) { notifications++; state = { ...state, ...next }; },
    async save(rows: readonly EnrichmentRow[]) { saves++; rows.forEach(row => disk.set(row.id, row)); },
    patch(video: LibraryVideo, current: typeof state) {
      if (current.tags[video.id]?.length || current.metadataProvenance[video.id]?.lockedFields?.includes('tags')) return;
      return { beforeTags: current.tags[video.id], beforeProvenance: current.metadataProvenance[video.id],
        tags: ['science'], provenance: { tags: { science: 'provider:youtube' as const }, updatedAt: 2 } };
    },
  };
  return { options, disk, get: () => state, set: (next: Partial<typeof state>) => { state = { ...state, ...next }; },
    turn: async () => { turns++; }, counts: () => ({ reads, saves, notifications, turns }) };
}
test('a million-entry metadata action stops at 48 changes, saves before publication, and resumes the next batch', async () => {
  const f = fixture(1_000_000), cursor = enrichmentCursor(), signal = new AbortController().signal;
  const first = metadataEnrichmentStep({ ...f.options, cursor, maxChanges: 48 });
  assert.equal(f.counts().reads, 0, 'creating a job does no catalog scan');
  const result = await first(signal, f.turn); assert.equal(result.done, true);
  assert.equal(f.counts().reads, 48); assert.equal(f.disk.size, 48); assert.equal(f.counts().notifications, 1);
  assert.equal(cursor.offset, 48);
  const second = await metadataEnrichmentStep({ ...f.options, cursor, maxChanges: 48 })(signal, f.turn);
  assert.equal(second.done, true); assert.equal(f.counts().reads, 96); assert.equal(f.disk.size, 96); assert.equal(cursor.offset, 96);
});
test('empty metadata scans are bounded, and catalog replacement restarts safely without retaining the old array', async () => {
  const f = fixture(1_000_000), cursor = enrichmentCursor();
  const step = metadataEnrichmentStep({ ...f.options, cursor, patch: () => undefined, maxChanges: 48 });
  const first = await step(new AbortController().signal, f.turn);
  assert.equal(first.done, false); assert.equal(f.counts().reads, 2048); assert.ok(f.counts().turns >= 4);
  assert.equal(f.counts().saves, 0); assert.equal(f.counts().notifications, 0);
  const replacement = [{ id: 'new' } as LibraryVideo]; f.set({ videos: replacement });
  const next = await step(new AbortController().signal, f.turn);
  assert.equal(next.done, true); assert.equal(cursor.catalog?.deref(), replacement); assert.equal(cursor.offset, 1);
});
test('input cancellation releases partial scan/copy work and leaves the checkpoint unchanged', async () => {
  const f = fixture(10_000), cursor = enrichmentCursor(), controller = new AbortController();
  const step = metadataEnrichmentStep({ ...f.options, cursor });
  await assert.rejects(step(controller.signal, async () => { controller.abort(); controller.signal.throwIfAborted(); }), { name: 'AbortError' });
  assert.equal(cursor.offset, 0); assert.equal(f.counts().saves, 0); assert.equal(f.counts().notifications, 0);
  await step(new AbortController().signal, f.turn); assert.equal(cursor.offset, 2048); assert.equal(f.disk.size, 2048);
});
test('manual edits and locks made during sparse preparation invalidate it before storage or publication', async () => {
  const f = fixture(48), cursor = enrichmentCursor(); let edited = false;
  const step = metadataEnrichmentStep({ ...f.options, cursor, maxChanges: 48 });
  const result = await step(new AbortController().signal, async () => {
    if (!edited) { edited = true; f.set({ tags: { '0': ['manual'] }, metadataProvenance: { '0': { tags: { manual: 'manual' }, lockedFields: ['tags'], updatedAt: 3 } } }); }
  });
  assert.equal(result.done, false); assert.equal(cursor.offset, 0); assert.equal(f.counts().saves, 0);
  await step(new AbortController().signal, f.turn);
  assert.deepEqual(f.get().tags['0'], ['manual']); assert.equal(f.disk.has('0'), false); assert.equal(f.disk.size, 47);
});
test('a 48-title batch with million-entry base ledgers never enumerates or copies those ledgers', async () => {
  const f = fixture(1_000_000), baseTags = new Proxy({} as Record<string, string[]>, {
    ownKeys() { throw Error('million-entry tag enumeration'); },
    get: (_target, key) => key === 'unrelated' ? ['keep'] : undefined,
  });
  const baseMetadata = new Proxy({} as Record<string, VideoMetadataProvenance>, { ownKeys() { throw Error('million-entry provenance enumeration'); } });
  f.set({ tags: baseTags, metadataProvenance: baseMetadata });
  await metadataEnrichmentStep({ ...f.options, maxChanges: 48 })(new AbortController().signal, f.turn);
  assert.equal(f.counts().reads, 48); assert.equal(f.counts().notifications, 1);
  assert.deepEqual(f.get().tags['47'], ['science']); assert.deepEqual(f.get().tags.unrelated, ['keep']);
  assert.equal(baseTags['47'], undefined);
});
test('failed or interrupted writes never advance the cursor; successful disk rows survive an older snapshot', async () => {
  const f = fixture(48), cursor = enrichmentCursor(), controller = new AbortController();
  const failed = metadataEnrichmentStep({ ...f.options, cursor, maxChanges: 48, save: async () => { throw Error('quota'); } });
  await assert.rejects(failed(controller.signal, f.turn), /quota/); assert.equal(cursor.offset, 0); assert.equal(f.counts().notifications, 0);
  const interrupted = metadataEnrichmentStep({ ...f.options, cursor, maxChanges: 48, save: async rows => { await f.options.save(rows); controller.abort(); } });
  await assert.rejects(interrupted(controller.signal, f.turn), { name: 'AbortError' });
  assert.equal(cursor.offset, 0); assert.equal(f.counts().notifications, 0); assert.equal(f.disk.size, 48);
  const restored = { tags: {} as Record<string, string[]>, metadataProvenance: {} as Record<string, VideoMetadataProvenance> };
  f.disk.forEach(row => restoreEnrichmentRow(restored, row)); assert.equal(Object.keys(restored.tags).length, 48);
  restored.tags['0'] = ['manual']; restored.metadataProvenance['0'] = { tags: { manual: 'manual' }, lockedFields: ['tags'], updatedAt: 1 };
  restoreEnrichmentRow(restored, f.disk.get('0')!); assert.deepEqual(restored.tags['0'], ['manual']);
  restored.metadataProvenance['1'] = { tags: { newer: 'legacy' }, updatedAt: 5 }; restored.tags['1'] = ['newer'];
  restoreEnrichmentRow(restored, f.disk.get('1')!); assert.deepEqual(restored.tags['1'], ['newer']);
  restored.tags['2'] = ['science']; restored.metadataProvenance['2'] = { tags: {}, category: 'manual', lockedFields: ['category'], updatedAt: 2 };
  restoreEnrichmentRow(restored, f.disk.get('2')!);
  assert.equal(restored.metadataProvenance['2'].tags.science, 'provider:youtube');
  assert.equal(restored.metadataProvenance['2'].category, 'manual'); assert.deepEqual(restored.metadataProvenance['2'].lockedFields, ['category']);
});
