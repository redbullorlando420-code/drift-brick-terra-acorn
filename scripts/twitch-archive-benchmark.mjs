import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { writeFileSync } from 'node:fs';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context); throw error; } } });
const { walkTwitchArchive } = await import('../src/lib/remote/twitch-archive-walk.ts');
const { searchTwitchArchive } = await import('../src/lib/videos/twitch-archive-search.ts');
const { mergeRemoteCatalogAsync } = await import('../src/lib/videos/remote-merge.ts');
const turn = () => new Promise(resolve => setImmediate(resolve));
const base = { folderId: 'tw:benchmark', name: 'Space exploration archive', path: 'twitch/archive', extension: 'vod', mime: 'video/twitch', size: 0, duration: 3600, remote: { kind: 'twitch', channelName: 'Benchmark creator' } };
const reports = [];
for (const count of [100_000, 1_000_000]) {
  let rows = Array.from({ length: count }, (_, i) => ({ ...base, id: `tw:v:${i}`, addedAt: i + 1 }));
  global.gc?.(); const heapBeforeMiB = process.memoryUsage().heapUsed / 1048576;
  let pages = 0;
  const started = performance.now();
  const walked = await walkTwitchArchive({ limit: 2000, pageSize: 100, maxPages: 25, gap: turn, read: async (cursor, first) => {
    const offset = Number(cursor.after ?? count); pages++;
    return { id: 'benchmark', videos: { edges: Array.from({ length: first }, (_, i) => ({ node: { id: String(offset + i) } })), pageInfo: { hasNextPage: true, endCursor: String(offset + first) } } };
  } });
  const cursorMs = performance.now() - started;
  assert.equal(pages,20); assert.equal(walked.edges.length,2000); assert.equal(walked.diagnostics.stopReason,'entry-budget');
  const incoming = walked.edges.map(edge => ({ ...base, id: `tw:v:${edge.node.id}`, addedAt: Number(edge.node.id) + 1 }));
  const serializedNewEntryBytes = Buffer.byteLength(JSON.stringify(incoming));
  const mergeAt = performance.now();
  const merged = await mergeRemoteCatalogAsync(rows, incoming, { turn });
  const mergeMs = performance.now() - mergeAt;
  assert.equal(merged.length,count + 2000);
  assert.equal(merged[0],rows[0]); assert.equal(merged[count - 1],rows[count - 1]);
  const repeatAt = performance.now();
  const repeated = await mergeRemoteCatalogAsync(merged, incoming, { turn });
  const repeatMergeMs = performance.now() - repeatAt;
  assert.equal(repeated,merged);
  rows = merged;
  const searched = await searchTwitchArchive(rows, { query: 'space exploration', kind: 'vod', order: 'newest', after: { date: Math.floor(count / 2), id: `tw:v:${Math.floor(count / 2) - 1}` } }, { signal: new AbortController().signal, pageSize: 24, turn });
  assert.equal(searched.matched,count + 2000); assert(searched.maxCandidates <= 25); assert.equal(searched.videos.length,24);
  global.gc?.();
  reports.push({ entries: count, cursorPages: pages, cursorMs: +cursorMs.toFixed(1), mergeMs: +mergeMs.toFixed(1), repeatMergeMs: +repeatMergeMs.toFixed(1), repeatReusesArray: true, addedEntries: 2000,
    serializedNewEntryBytes, searchMs: +searched.elapsedMs.toFixed(1), searchMaxCandidates: searched.maxCandidates, heapBeforeMiB: +heapBeforeMiB.toFixed(1), heapAfterMiB: +(process.memoryUsage().heapUsed / 1048576).toFixed(1) });
}
const report = { ok: true, nodeHeapLimitMiB: 384, fixture: '100k and million-entry compact Twitch catalogs plus a mocked 2,000-VOD/20-page pull',
  limitations: 'Network, artwork and transcripts are omitted. Serialized bytes estimate logical new-entry storage, not filesystem or IndexedDB overhead. Browser first paint and scrolling require the desktop/mobile gate. This does not prove provider throughput or long-session memory stability.', results: reports };
writeFileSync(new URL('../screenshots/twitch-archive-benchmark.json', import.meta.url), JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2));
