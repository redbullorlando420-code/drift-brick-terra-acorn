#!/usr/bin/env node
/**
 * Measures the actual IndexedDB snapshot + journal recovery path in an
 * isolated browser profile. This never reads or changes a person's library.
 *
 * Usage: node scripts/history-restore-benchmark.mjs [url] [events] [journal]
 */
import assert from "node:assert/strict";
import { chromium } from "playwright";

const [url = "http://127.0.0.1:8080/", requestedEvents = "2400", requestedJournal = "320"] = process.argv.slice(2);
const eventCount = Math.max(100, Math.min(10_000, Number.parseInt(requestedEvents, 10) || 2400));
const journalCount = Math.max(1, Math.min(eventCount - 1, Number.parseInt(requestedJournal, 10) || 320));
const snapshotCount = eventCount - journalCount;

const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32" ? { channel: "chrome" } : {}),
});

try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const origin = new URL(url).origin;

  // Seed through the same public persistence helpers the app uses, but before
  // React mounts. The context is new, so no personal IndexedDB or localStorage
  // record can enter this benchmark.
  await page.route(`${origin}/`, (route) => route.fulfill({ contentType: "text/html", body: "<html><body>benchmark seed</body></html>" }));
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.evaluate(async ({ count, snapshotRows }) => {
    const persist = await import("/src/lib/videos/persist.ts");
    const now = Date.now();
    const rows = Array.from({ length: count }, (_, index) => ({
      eventId: `benchmark:${index}`,
      id: `benchmark-video:${index}`,
      at: now - index * 1_000,
      title: `Benchmark title ${index}`,
      source: (["open", "progress", "watch-room"])[index % 3],
      position: 90 + index,
      duration: 1_200,
    }));
    await persist.saveActivitySnapshot({
      history: rows.slice(0, snapshotRows),
      progress: {},
      resumeProgress: {},
      viewCounts: {},
      cameCounts: {},
      savedAt: now,
    });
    await Promise.all(rows.slice(snapshotRows).map((entry) => persist.appendActivityJournal(entry)));
  }, { count: eventCount, snapshotRows: snapshotCount });

  await page.unroute(`${origin}/`);
  const navigationStartedAt = performance.now();
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  const result = await page.evaluate(async (expected) => {
    const { useLibrary } = await import("/src/lib/videos/store.ts");
    const startedAt = performance.now();
    const deadline = startedAt + 15_000;
    while (useLibrary.getState().history.length < expected && performance.now() < deadline) {
      await new Promise((resolve) => window.setTimeout(resolve, 25));
    }
    const history = useLibrary.getState().history;
    return {
      restoreMs: Math.round(performance.now() - startedAt),
      hydrated: useLibrary.getState().hydrated,
      restoredEvents: history.length,
      uniqueEventIds: new Set(history.map((entry) => entry.eventId)).size,
      sources: Object.fromEntries(["open", "progress", "watch-room"].map((source) => [source, history.filter((entry) => entry.source === source).length])),
    };
  }, eventCount);
  const totalMs = Math.round(performance.now() - navigationStartedAt);

  assert.equal(result.hydrated, true, "library did not report hydrated");
  assert.equal(result.restoredEvents, eventCount, "snapshot and journal rows did not reconcile");
  assert.equal(result.uniqueEventIds, eventCount, "replay produced duplicate journal events");
  assert.ok(Object.values(result.sources).every((count) => count > 0), "source provenance was not retained");
  console.log(JSON.stringify({
    scenario: "isolated IndexedDB snapshot + append-only journal recovery",
    eventCount,
    snapshotCount,
    journalCount,
    totalMs,
    ...result,
  }, null, 2));
} finally {
  await browser.close();
}
