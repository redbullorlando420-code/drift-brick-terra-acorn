import { previewCandidates } from '../src/lib/videos/preview-candidates.ts';
import { performance } from 'node:perf_hooks';
import { writeFileSync } from 'node:fs';
const count = 1_000_000;
global.gc?.();
const before = process.memoryUsage().heapUsed;
const started = performance.now();
// Actual lightweight records, with independent IDs and provider metadata.
// This is an algorithm/heap benchmark, not a browser soak or disk capacity test.
const records = Array.from({ length: count }, (_, index) => ({
  id: `yt:${index}`, name: `Video ${index}`, folderId: `yt:creator-${index % 1000}`,
  path: `youtube/${index}`, mime: 'video/youtube', extension: 'youtube', size: 0,
  addedAt: index, detailsOnDisk: true,
  remote: { kind: 'youtube', videoId: String(index), channelId: `creator-${index % 1000}`, channelName: `Creator ${index % 1000}` },
}));
const fixtureBuildMs = Math.round(performance.now() - started);
global.gc?.();
const resident = process.memoryUsage().heapUsed;
const timings = [];
for (let turn = 0; turn < 20; turn++) {
  const at = performance.now();
  const candidates = previewCandidates(records, records[(turn * 47999) % count]);
  if (candidates.length > 4096) throw new Error('Preview candidate limit exceeded');
  timings.push(performance.now() - at);
}
timings.sort((a, b) => a - b);
global.gc?.();
const report = { entries: count, fixture: 'Actual lightweight metadata objects; no transcripts, tags, IndexedDB or browser UI', allocatedMiB: Math.round((resident - before) / 1048576), fixtureBuildMs, sampleLimit: 4096, samplingMedianMs: +timings[10].toFixed(2), samplingWorstMs: +timings.at(-1).toFixed(2), retainedAfterSamplingMiB: Math.round((process.memoryUsage().heapUsed - resident) / 1048576), limitation: 'This does not establish a million-entry browser catalog or long-session memory stability.' };
writeFileSync(new URL('../screenshots/catalog-scale-benchmark.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
