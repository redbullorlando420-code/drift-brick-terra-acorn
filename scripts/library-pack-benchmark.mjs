import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, n) {
    if (s.startsWith("@/"))
      return n(new URL("../src/" + s.slice(2) + ".ts", import.meta.url).href, c);
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});

import { writeFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
const { buildLibraryPackFiles } = await import("../src/lib/videos/library-pack.ts");
const { libraryPackSections, exportStreamingPack } =
  await import("../src/lib/videos/library-pack-stream.ts");
const ids = Array.from({ length: 25000 }, (_, i) => "yt:video" + String(i).padStart(6, "0"));
const input = {
  follows: [],
  history: ids.map((id, i) => ({ id, at: 1000 + i, title: "Library fixture " + i })),
  links: [],
  favorites: ids,
  likes: [],
  viewCounts: {},
  cameCounts: {},
  progress: Object.fromEntries(ids.map((id, i) => [id, { t: i % 90, d: 100, at: 1000 + i }])),
  resumeProgress: {},
};
// The old builder obtains its feedback globally; use no-window memory feedback
// to compare the same 100,000 personal/source metadata records.
const { importFeedback, exportFeedback } = await import("../src/lib/media-feedback.ts");
importFeedback({ ratings: Object.fromEntries(ids.map((id, i) => [id, (i % 5) + 1])) });
const before = performance.now(),
  legacy = buildLibraryPackFiles(input),
  legacyMs = performance.now() - before;
const legacyTextBytes = Object.values(legacy).reduce((n, v) => n + Buffer.byteLength(v), 0),
  largestLegacyDocument = Math.max(...Object.values(legacy).map((v) => Buffer.byteLength(v)));
const chunks = [],
  begin = performance.now();
let finalBytes = 0;
const stats = await exportStreamingPack(
  libraryPackSections(input, { ratings: exportFeedback().ratings }),
  {
    async write(b) {
      finalBytes += b.length;
      chunks.push(b.length);
    },
    async close() {},
    async abort() {},
  },
  { turn: async () => {} },
);
assert.equal(stats.records, 100000);
assert.equal(stats.maxPendingWrites, 1);
assert(stats.maxChunkBytes <= 128 * 1024);
const report = {
  ok: true,
  records: stats.records,
  legacy: {
    retainedTextBytesBeforeZip: legacyTextBytes,
    largestDocumentBytes: largestLegacyDocument,
    ms: Math.round(legacyMs),
  },
  streaming: {
    fileBytes: finalBytes,
    largestWriteBytes: stats.maxChunkBytes,
    maxPendingWrites: stats.maxPendingWrites,
    writes: chunks.length,
    ms: Math.round(performance.now() - begin),
  },
  scope:
    "Synthetic personal/source metadata, not media files or a full catalog. Counts exact encoded allocations and write bounds, not sampled peak process heap or real-device timings. Streaming destination discards bytes after acknowledgement; browser Blob fallback retains final file bytes.",
};
await writeFile("screenshots/pack-transfer-benchmark.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
