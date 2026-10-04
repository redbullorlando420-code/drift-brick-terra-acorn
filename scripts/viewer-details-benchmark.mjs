import { registerHooks } from 'node:module';
import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
registerHooks({ resolve(s, c, n) { try { return n(s, c); } catch (e) { if (s.startsWith('.') && !/\.[a-z]+$/i.test(s)) return n(s + '.ts', c); throw e; } } });
const { createViewerDetails } = await import('../src/lib/videos/viewer-details.ts');
const entries = Number(process.argv[2] ?? 1_000_000), selectedId = String(entries - 1);
let metadataReads = 0;
const remote = { kind: 'youtube' }, rows = Array.from({ length: entries }, (_, i) => ({ id: String(i), get remote() { metadataReads++; return remote; } }));
const comments = [{ id: 'one', body: 'On-demand public comment' }];
const before = performance.now();
for (let i = 0; i < 20; i++) {
  const updated = rows.map(video => video.id === selectedId ? { ...video, remote: { ...video.remote, comments } } : video.remote.comments ? { ...video } : video);
  assert.equal(updated.at(-1).remote.comments, comments);
  assert.equal(rows.some(video => video.remote.comments), false);
}
const legacy20Ms = performance.now() - before, legacyMetadataReads = metadataReads;
metadataReads = 0; const details = createViewerDetails(), isolatedStarted = performance.now();
for (let i = 0; i < 20; i++) { details.setComments(selectedId, comments); details.releaseComments(); }
const isolated20Ms = performance.now() - isolatedStarted;
assert.equal(metadataReads, 0);
for (let i = 0; i < 5000; i++) {
  const id = `viewer:${i}`, stop = details.subscribe(id, () => {});
  await details.load(id, async () => ({ id, name: id, description: 'x'.repeat(1000) + i, remote: { kind: 'youtube' } }));
  if (i % 2) details.setComments(id, [{ id: `c:${i}`, body: 'x'.repeat(200_000) + i }]);
  details.releaseComments(); stop();
}
const retainedAfterCycles = details.diagnostics();
assert.ok(retainedAfterCycles.entries <= 12 && retainedAfterCycles.estimatedBytes <= 512_000);
assert.equal(retainedAfterCycles.activeTranscripts, 0); assert.equal(retainedAfterCycles.subscribers, 0);
details.clear();
assert.equal(rows.length, entries); assert.equal(rows.at(-1).id, selectedId);
console.log(JSON.stringify({ entries, legacy20CommentCyclesMs: +legacy20Ms.toFixed(1), legacyMetadataReads, isolated20CommentCyclesMs: +isolated20Ms.toFixed(2), isolatedCatalogMetadataReads: metadataReads, copiedCatalogArrays: 0, soakCycles: 5000, retainedAfterCycles, afterClear: details.diagnostics(), note: 'Isolated Node cache lifecycle test; not a browser or provider idle soak.' }, null, 2));
