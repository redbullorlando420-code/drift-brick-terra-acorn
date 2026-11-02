import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  out = checkedOutputPath(process.argv[3] ?? "screenshots/milestone83-cursor-native.json", [
    resolve("screenshots"),
  ]);
const bundle = await rolldown({ input: resolve("src/lib/videos/catalog-page-reader.ts") }),
  built = await bundle.generate({ format: "esm" });
await bundle.close();
const code = built.output.find((o) => o.type === "chunk").code,
  browser = await chromium.launch({ channel: "chrome", headless: true }),
  context = await browser.newContext(),
  page = await context.newPage();
try {
  await context.route("**/__cursor-fixture.html", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Disposable cursor fixture</title><p>Native catalog backpressure check</p>",
    }),
  );
  await context.route("**/__cursor-fixture.mjs", (r) =>
    r.fulfill({ contentType: "text/javascript", body: code }),
  );
  await page.goto(new URL("/__cursor-fixture.html", url).href);
  const report = await page.evaluate(async () => {
    const { consumeCatalogPages } = await import("/__cursor-fixture.mjs"),
      name = "catalog-backpressure-fixture-" + crypto.randomUUID(),
      db = await new Promise((yes, no) => {
        const r = indexedDB.open(name, 1);
        r.onupgradeneeded = () => r.result.createObjectStore("videos");
        r.onsuccess = () => yes(r.result);
        r.onerror = () => no(r.error);
      });
    const check = (ok, message) => {
      if (!ok) throw Error(message);
    };
    try {
      const total = 100000;
      for (let base = 0; base < total; base += 512) {
        await new Promise((yes, no) => {
          const tx = db.transaction("videos", "readwrite"),
            store = tx.objectStore("videos");
          for (let id = base; id < Math.min(base + 512, total); id++)
            store.put({ id, name: "Fixture " + id }, id);
          tx.oncomplete = yes;
          tx.onerror = tx.onabort = () => no(tx.error);
        });
      }
      let reads = 0,
        checkpoint,
        accepted = 0,
        maxPending = 0,
        release,
        firstAccepted;
      const hold = new Promise((r) => (release = r)),
        started = new Promise((r) => (firstAccepted = r)),
        controller = new AbortController(),
        seen = new Set();
      const read = (after, limit) =>
        new Promise((yes, no) => {
          reads++;
          const tx = db.transaction("videos"),
            store = tx.objectStore("videos"),
            range = after === undefined ? undefined : IDBKeyRange.lowerBound(after, true),
            keys = store.getAllKeys(range, limit),
            rows = store.getAll(range, limit);
          tx.oncomplete = () => yes({ keys: keys.result, rows: rows.result });
          tx.onerror = () => no(tx.error);
        });
      const run = consumeCatalogPages(read, {
        signal: controller.signal,
        progress: (p) => {
          maxPending = Math.max(maxPending, p.pending);
          if (!p.pending) checkpoint = p.after;
        },
        accept: async (rows) => {
          if (!accepted) {
            firstAccepted();
            await hold;
          } else {
            controller.abort();
            controller.signal.throwIfAborted();
          }
          for (const row of rows) {
            seen.add(row.id);
            accepted++;
          }
        },
      });
      await started;
      check(reads === 1, "Producer read ahead while consumer was held");
      release();
      let cancelled = false;
      try {
        await run;
      } catch {
        cancelled = controller.signal.aborted;
      }
      check(
        cancelled && accepted === 512 && checkpoint === 511,
        "Cancellation advanced beyond the committed page",
      );
      const beforeResume = reads;
      await consumeCatalogPages(read, {
        after: checkpoint,
        accept: async (rows) => {
          for (const row of rows) {
            check(!seen.has(row.id), "Repeated committed record");
            seen.add(row.id);
            accepted++;
          }
        },
      });
      check(
        accepted === total && seen.size === total && seen.has(0) && seen.has(total - 1),
        "Resume dropped or repeated native records",
      );
      check(maxPending === 1, "Pending-page budget exceeded");
      return {
        ok: true,
        records: total,
        accepted,
        maxPending,
        checkpointBeforeResume: checkpoint,
        readsBeforeResume: beforeResume,
        checks: [
          "Real IndexedDB 100k rows",
          "Consumer pause blocks producer",
          "Mid-page cancellation keeps last acknowledged key",
          "Resume retains every ID exactly once",
          "One pending page maximum",
        ],
      };
    } finally {
      db.close();
    }
  });
  await writeFile(out, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await context.close();
  await browser.close();
}
