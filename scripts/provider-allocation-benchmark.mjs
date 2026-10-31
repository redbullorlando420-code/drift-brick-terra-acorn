import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { checkedOutputPath } from "./browser-guard.mjs";
registerHooks({
  resolve(s, c, n) {
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});
const { parseProviderJson, providerJsonSamples } =
  await import("../src/lib/remote/provider-json.ts");
const { projectTwitchArchiveUser } = await import("../src/lib/remote/provider-projection.ts");
const { youtubeVideoRenderers } = await import("../src/lib/remote/youtube-page-data.ts");
const output = checkedOutputPath(process.argv[2] ?? "screenshots/provider-allocation.json", [
  resolve("screenshots"),
]);
const junk = () => ({
  menu: {
    commands: Array.from({ length: 20 }, (_, i) => ({
      tracking: "x".repeat(256),
      click: { unused: "opaque-" + i },
    })),
  },
});
const yt = Array.from({ length: 100 }, (_, i) => ({
  videoRenderer: {
    videoId: "fixture" + String(i).padStart(4, "0"),
    title: { runs: [{ text: "Fixture upload " + i, navigationEndpoint: junk() }] },
    lengthText: { simpleText: "1:02:03" },
    publishedTimeText: { simpleText: "2026-10-28" },
    thumbnail: { thumbnails: [{ url: "https://i.ytimg.com/vi/fixture0001/hqdefault.jpg" }] },
    ...junk(),
  },
}));
const tw = {
  id: "1",
  displayName: "Fixture",
  videos: {
    pageInfo: { hasNextPage: true, endCursor: "redacted-cursor" },
    edges: Array.from({ length: 100 }, (_, i) => ({
      cursor: "page-" + i,
      node: {
        id: String(i),
        title: "Fixture VOD " + i,
        lengthSeconds: 3723,
        publishedAt: "2026-10-28T00:00:00Z",
        ...junk(),
      },
    })),
  },
};
const reports = [];
for (const [provider, value] of [
  ["youtube", yt],
  ["twitch", tw],
]) {
  const text = JSON.stringify(value),
    wire = Buffer.from(text);
  globalThis.gc?.();
  const base = process.memoryUsage().heapUsed;
  const parsed = parseProviderJson(text, provider),
    afterParse = process.memoryUsage().heapUsed;
  const normalized =
      provider === "youtube"
        ? youtubeVideoRenderers(parsed, 100)
        : projectTwitchArchiveUser(parsed).videos.edges,
    afterProjection = process.memoryUsage().heapUsed;
  const legacy =
    provider === "youtube" ? parsed.map((row) => row.videoRenderer) : parsed.videos.edges;
  const sample = providerJsonSamples().at(-1),
    legacyRetainedBytes = Buffer.byteLength(JSON.stringify(legacy)),
    retainedPayloadBytes = Buffer.byteLength(JSON.stringify(normalized));
  assert.equal(normalized.length, 100);
  assert(
    sample.estimatedScratchBytes < 6 * 1048576,
    "representative page exceeds the declared 6 MiB scratch estimate baseline",
  );
  assert(
    retainedPayloadBytes < 128 * 1024,
    "compact 100-row page exceeds 128 KiB retained payload",
  );
  assert(
    retainedPayloadBytes < legacyRetainedBytes / 4,
    "unused provider trees returned to retained rows",
  );
  reports.push({
    provider,
    fixture: { rows: 100, unusedCommandsPerMenu: 20, trackingUnits: 256 },
    rawBytes: wire.byteLength,
    parsed: sample,
    legacyRetainedBytes,
    retainedPayloadBytes,
    observedHeapGrowthAtCheckpoints: Math.max(0, afterParse - base, afterProjection - base),
    heapCheckpointMeasurement: globalThis.gc
      ? "GC before parse; samples before/after parse/projection"
      : "GC unavailable; noisy checkpoint samples",
  });
}
const report = {
  version: 1,
  ok: true,
  reports,
  limits: { representativeScratchEstimateBytes: 6 * 1048576, retainedPageBytes: 128 * 1024 },
  limitations:
    "Synthetic public metadata shapes, no real provider requests. Scratch estimates are conservative payload accounting, not exact engine heap limits. Heap checkpoints can miss transient peaks and GC activity; they are reported, not used as a portable heap gate. Runtime structural ceilings reject oversized graphs before JSON.parse.",
};
await writeFile(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
