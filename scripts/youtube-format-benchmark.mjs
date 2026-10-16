import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { writeFileSync } from 'node:fs';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context); throw error; } } });
const { prepareYoutubeBrowse, youtubeBrowseGroups } = await import('../src/lib/videos/youtube-browse.ts');
const { prepareYoutubeCreatorIndex, mixYoutubeCreators } = await import('../src/lib/remote/youtube-mix.ts');
const base = { name: 'Benchmark archive', path: 'youtube/archive', extension: 'yt', mime: 'video/youtube', size: 0, addedAt: Date.UTC(2026, 8, 1) };
const remotes = Array.from({ length: 1000 }, (_, i) => ({ kind: 'youtube', channelId: `creator-${i}`, channelName: 'Benchmark creator',
  youtubeType: ['upload', 'short', 'replay', 'live', 'upcoming'][i % 5], publishedSource: i % 5 ? 'unknown' : 'rss' }));
const results = [];
for (const count of [100_000, 1_000_000]) {
  const rows = Array.from({ length: count }, (_, i) => ({ ...base, id: `yt:v:${i}`, addedAt: i % 5 ? 0 : base.addedAt, folderId: 'yt:benchmark', remote: remotes[i % remotes.length] }));
  global.gc?.(); const heapBeforeMiB = process.memoryUsage().heapUsed / 1048576;
  let yields = 0; const turn = async () => { yields++; await new Promise(resolve => setImmediate(resolve)); };
  const started = performance.now();
  await prepareYoutubeBrowse(rows, undefined, turn);
  const groups = youtubeBrowseGroups(rows);
  for (const kind of ['upload', 'short', 'replay']) await prepareYoutubeCreatorIndex(groups[kind], undefined, turn);
  const prepareMs = performance.now() - started;
  for (const kind of ['upload', 'short', 'replay', 'live', 'upcoming']) assert.equal(groups[kind].length, count / 5);
  assert.equal(groups.all.length, count * 3 / 5); assert(yields > 10);
  assert.equal(groups.short[0], rows[1], 'cohorts share cards, without cloning records');
  const shuffleAt = performance.now();
  const shelves = ['all', 'upload', 'short', 'replay'].map(kind => ({ kind, mix: mixYoutubeCreators(groups[kind], 42, 48) }));
  const shuffleMs = performance.now() - shuffleAt;
  for (const { kind, mix } of shelves) { assert.equal(mix.length, 48); assert(mix.every(card => groups[kind].includes(card))); }
  const repeatAt = performance.now(); await prepareYoutubeBrowse(rows, undefined, turn);
  const repeatPrepareMs = performance.now() - repeatAt;
  assert.equal(youtubeBrowseGroups(rows), groups);
  global.gc?.();
  results.push({ entries: count, prepareMs: +prepareMs.toFixed(1), cooperativeYields: yields, fourShelvesMs: +shuffleMs.toFixed(1),
    repeatPrepareMs: +repeatPrepareMs.toFixed(1), sharedCardReferences: true,
    heapBeforeMiB: +heapBeforeMiB.toFixed(1), heapAfterMiB: +(process.memoryUsage().heapUsed / 1048576).toFixed(1) });
}
const report = { ok: true, nodeHeapLimitMiB: 384, fixture: '100k and million-entry compact YouTube catalogs; five formats and all four prepared creator indexes',
  limitations: 'Metadata is shared across fixture records. Network, artwork and transcripts are omitted. Node heap samples follow explicit GC and do not establish total browser RAM, provider throughput or long-session stability.', results };
writeFileSync(new URL('../screenshots/youtube-format-benchmark.json', import.meta.url), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
