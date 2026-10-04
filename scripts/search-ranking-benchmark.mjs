import { registerHooks } from 'node:module';
import { performance } from 'node:perf_hooks';
import assert from 'node:assert/strict';
registerHooks({ resolve(s, c, n) { try { return n(s, c); } catch (e) { if (s.startsWith('.') && !/\.[a-z]+$/i.test(s)) return n(s + '.ts', c); throw e; } } });
const { rankSearchResults } = await import('../src/lib/videos/search-ranking.ts');
const { topicsForVideo } = await import('../src/lib/videos/topics.ts');
const entries = 100_000, query = 'space';
const videos = Array.from({ length: entries }, (_, i) => ({ id: String(i), name: 'Space telescope lecture', path: String(i), folderId: 'public', addedAt: i, size: 0, remote: { kind: 'youtube', channelName: 'Ada' } }));
const input = { videos, ids: new Set(videos.map(v => v.id)), query, sourceId: 'youtube', folders: [], tags: {}, hidden: {}, unavailable: {}, favorites: {}, likes: {}, viewCounts: {}, ratingOf: () => 0, ratingPreference: () => 0 };
// Warm the shared topic cache for both paths; measure ranking rather than an
// accidental cold-topic advantage for whichever algorithm runs first.
for (const video of videos) topicsForVideo(video);
let started = performance.now();
const old = videos.filter(v => input.ids.has(v.id)).map(video => {
  const tags = [...new Set(topicsForVideo(video))];
  const score = (video.name.toLowerCase().includes(query) ? 120 + 28 : 0) + tags.filter(t => t.includes(query)).length * 18;
  return { video, score };
}).filter(row => row.score > 0).sort((a, b) => b.score - a.score || b.video.addedAt - a.video.addedAt || a.video.name.localeCompare(b.video.name));
const legacyBlockingMs = performance.now() - started;
let slices = 0, maxWorkSliceMs = 0, sliceStart = performance.now();
started = sliceStart;
const result = await rankSearchResults(input, undefined, async () => {
  maxWorkSliceMs = Math.max(maxWorkSliceMs, performance.now() - sliceStart); slices++;
  await new Promise(resolve => setImmediate(resolve)); sliceStart = performance.now();
});
maxWorkSliceMs = Math.max(maxWorkSliceMs, performance.now() - sliceStart);
assert.deepEqual(result.ranked.map(v => v.id), old.map(row => row.video.id));
console.log(JSON.stringify({ entries, returned: result.ranked.length, legacySingleBlockingTaskMs: +legacyBlockingMs.toFixed(2), cooperativeTotalMs: +(performance.now() - started).toFixed(2), maxCooperativeWorkSliceMs: +maxWorkSliceMs.toFixed(2), yieldedTasks: slices, note: 'Synthetic warm-cache ranking workload; total throughput and measured slices are not browser input timings or whole-app heap measurements.' }, null, 2));
