import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/archive-continuity-native.json", [
    resolve("screenshots"),
  ]);
const entry = "\0archive-native",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "archive-native",
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) =>
          id === entry
            ? [
                "src/lib/videos/persist.ts",
                "src/lib/videos/adult-archive-cursors.ts",
                "src/lib/videos/adult-archive-model.ts",
                "src/lib/videos/catalog-mutations.ts",
              ]
                .map(
                  (file) =>
                    "export * from " + JSON.stringify(resolve(file).replaceAll("\\", "/")) + ";",
                )
                .join("\n")
            : undefined,
      },
    ],
  });
const built = await bundle.generate({ format: "esm" });
await bundle.close();
const code = built.output.find((row) => row.type === "chunk").code;
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  context = await browser.newContext(),
  page = await context.newPage(),
  report = { checks: [], errors: [] };
page.on("pageerror", (e) => report.errors.push(e.message));
try {
  await context.route("**/__archive-native.html", (r) =>
    r.fulfill({
      contentType: "text/html",
      body: "<!doctype html><title>Disposable archive recovery fixture</title><p>Native storage recovery</p>",
    }),
  );
  await context.route("**/__archive-native.mjs", (r) =>
    r.fulfill({ contentType: "text/javascript", body: code }),
  );
  await context.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (
        key === "reelcase.adult-archive-cursors.v1" &&
        localStorage.getItem("archive-quota") === "true"
      )
        throw new DOMException("Controlled full preference storage", "QuotaExceededError");
      return original.call(this, key, value);
    };
  });
  await page.goto(new URL("/__archive-native.html", url).href);
  report.checks.push(
    ...(await page.evaluate(async () => {
      const p = await import("/__archive-native.mjs"),
        checks = [],
        check = (ok, message) => {
          if (!ok) throw Error(message);
        },
        key = p.ARCHIVE_LEDGER_KEY;
      const db = await new Promise((yes, no) => {
        const request = indexedDB.open("reelcase", 8);
        request.onupgradeneeded = () => {
          for (const store of ["videos", "remote-cache", "activity", "activity-journal"])
            if (!request.result.objectStoreNames.contains(store))
              request.result.createObjectStore(store);
        };
        request.onsuccess = () => yes(request.result);
        request.onerror = () => no(request.error);
      });
      const read = (store, key) =>
        new Promise((yes, no) => {
          const r = db.transaction(store).objectStore(store).get(key);
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
      const put = (store, key, value) =>
        new Promise((yes, no) => {
          const t = db.transaction(store, "readwrite");
          t.objectStore(store).put(value, key);
          t.oncomplete = yes;
          t.onerror = t.onabort = () => no(t.error);
        });
      const card = (id) => ({
        id,
        folderId: "eporner:discover",
        name: "QA recording " + id,
        path: id,
        mime: "video/mp4",
        extension: "mp4",
        addedAt: 1,
        remote: { kind: "eporner", videoId: id },
      });
      localStorage.setItem(
        "reelcase.adult-archive-cursors.v1",
        JSON.stringify({
          "eporner::all::latest": {
            page: 17,
            query: "all",
            order: "latest",
            paging: 2,
            updatedAt: 1,
            offset: 200,
          },
          "redtube::all::top-rated": {
            page: 8,
            query: "all",
            order: "top-rated",
            paging: 2,
            updatedAt: 2,
          },
        }),
      );
      await p.hydrateAdultArchiveCursors();
      check(
        p.loadAdultArchiveCursors("all", "latest").eporner.page === 17,
        "Legacy depth was lost",
      );
      check(
        p.loadAdultArchiveCursors("all", "top-rated").redtube.page === 8,
        "Independent sort was lost",
      );
      localStorage.setItem("archive-quota", "true");
      const rows = [card("quota-record")],
        point = p.prepareAdultArchiveCheckpoint(
          "all",
          "latest",
          "eporner",
          18,
          300,
          { added: 1 },
          rows.map((r) => r.id),
        );
      await p.commitAdultArchiveWindow(rows, point);
      check(
        (await read("activity", key)).positions["eporner::all::latest"].cursor.page === 18,
        "Quota prevented durable checkpoint",
      );
      checks.push(
        "Legacy sort positions migrate and accepted rows advance in IndexedDB despite a full preference mirror",
      );
      const originalPut = IDBObjectStore.prototype.put,
        originalCursor = IDBObjectStore.prototype.openCursor;
      let fault = "",
        prepared = false,
        target = "";
      IDBObjectStore.prototype.put = function (value, key) {
        if (
          this.name === "remote-cache" &&
          String(key).startsWith(p.CATALOG_OPERATION_PREFIX) &&
          value.archive
        ) {
          prepared = true;
          if (fault === "stage")
            throw new DOMException("Controlled checkpoint prepare failure", "QuotaExceededError");
        }
        if (fault === "row" && this.name === "videos" && key === target)
          throw Error("Controlled final row interruption");
        if (fault === "checkpoint" && this.name === "activity" && key === p.ARCHIVE_LEDGER_KEY)
          throw Error("Controlled checkpoint transaction interruption");
        if (
          fault === "commit" &&
          prepared &&
          this.name === "remote-cache" &&
          key === p.CATALOG_CONTROL_KEY &&
          value.lastKind === "local"
        )
          throw Error("Controlled final acknowledgement interruption");
        return arguments.length === 1
          ? originalPut.call(this, value)
          : originalPut.call(this, value, key);
      };
      IDBObjectStore.prototype.openCursor = function (...args) {
        if (fault === "prepared" && prepared && this.name === "remote-cache")
          throw Error("Controlled stop after durable prepare");
        return originalCursor.apply(this, args);
      };
      try {
        for (const phase of ["stage", "prepared", "row", "checkpoint", "commit"]) {
          const query = "recovery-" + phase,
            base = [card(phase + "-base")];
          await p.hydrateAdultArchiveCursors(true);
          await p.commitAdultArchiveWindow(
            base,
            p.prepareAdultArchiveCheckpoint(
              query,
              "latest",
              "eporner",
              2,
              0,
              { added: 1 },
              base.map((r) => r.id),
            ),
          );
          p.saveCatalogMetadataEdit({
            id: base[0].id,
            field: "tags",
            tags: ["private-manual"],
            provenance: { tags: { "private-manual": "manual" }, lockedFields: ["tags"] },
          });
          await p.recoverCatalogMutations();
          const batch = Array.from({ length: 130 }, (_, i) =>
              i === 0 ? base[0] : card(phase + "-new-" + i),
            ),
            point = p.prepareAdultArchiveCheckpoint(
              query,
              "latest",
              "eporner",
              3,
              40,
              { added: 129 },
              batch.map((r) => r.id),
            );
          target = batch.at(-1).id;
          prepared = false;
          fault = phase;
          let failed = false;
          try {
            await p.commitAdultArchiveWindow(batch, point);
          } catch {
            failed = true;
          }
          check(failed, "Fault did not interrupt " + phase);
          fault = "";
          check(
            (await read("activity", key)).positions["eporner::" + query + "::latest"].cursor
              .page === 2,
            "Failed final transaction advanced " + phase,
          );
          check(!(await read("videos", target)), "Failed tail became visible " + phase);
          await p.hydrateAdultArchiveCursors(true);
          const recovered = p.loadAdultArchiveCursors(query, "latest").eporner;
          check(
            recovered.page === (phase === "stage" ? 2 : 3),
            "Recovery did not agree with the staged boundary " + phase,
          );
          const retry = p.prepareAdultArchiveCheckpoint(
            query,
            "latest",
            "eporner",
            3,
            40,
            { added: 129 },
            batch.map((r) => r.id),
          );
          await p.commitAdultArchiveWindow(batch, retry);
          check(!!(await read("videos", target)), "Replayed tail missing " + phase);
          const edit = await read("activity", p.CATALOG_EDIT_PREFIX + base[0].id);
          check(
            edit.tags[0] === "private-manual" && edit.provenance.lockedFields.includes("tags"),
            "Replay changed a manual edit " + phase,
          );
          checks.push(
            "Interruption at " +
              phase +
              " preserves the accepted prefix and exact old cursor; recovery/replay retains manual metadata",
          );
        }
      } finally {
        fault = "";
        IDBObjectStore.prototype.put = originalPut;
        IDBObjectStore.prototype.openCursor = originalCursor;
      }
      const one = p.prepareAdultArchiveCheckpoint("race", "latest", "eporner", 2, 0, {}, [
          "race-a",
        ]),
        stale = p.prepareAdultArchiveCheckpoint("race", "latest", "eporner", 7, 0, {}, ["race-b"]);
      await p.commitAdultArchiveWindow([card("race-a")], one);
      let blocked = false;
      try {
        await p.commitAdultArchiveWindow([card("race-b")], stale);
      } catch {
        blocked = true;
      }
      check(blocked, "Stale writer was not detected");
      await p.hydrateAdultArchiveCursors(true);
      check(p.loadAdultArchiveCursors("race", "latest").eporner.page === 2, "Stale cursor won");
      check(!!(await read("videos", "race-b")), "Accepted stale-response rows were lost");
      checks.push(
        "A stale checkpoint cannot replace a newer committed position or poison journal recovery",
      );
      const saved = await read("activity", key);
      await put("activity", key, { version: 99, positions: {} });
      let rejected = false;
      try {
        await p.hydrateAdultArchiveCursors(true);
      } catch {
        rejected = true;
      }
      check(rejected && (await read("activity", key)).version === 99, "Future ledger was reset");
      check(!!(await read("videos", "quota-record")), "Rejected ledger changed the catalog");
      await put("activity", key, saved);
      await p.hydrateAdultArchiveCursors(true);
      checks.push(
        "Future ledger versions fail closed while catalog rows and the unsupported document are preserved",
      );
      db.close();
      return checks;
    })),
  );
  await page.reload();
  const restored = await page.evaluate(async () => {
    const p = await import("/__archive-native.mjs");
    await p.hydrateAdultArchiveCursors();
    return {
      page: p.loadAdultArchiveCursors("all", "latest").eporner.page,
      offset: p.loadAdultArchiveCursors("all", "latest").eporner.offset,
      mirror: JSON.parse(localStorage.getItem("reelcase.adult-archive-cursors.v1"))[
        "eporner::all::latest"
      ].page,
    };
  });
  assert.deepEqual(restored, { page: 18, offset: 300, mirror: 17 });
  report.checks.push(
    "Reload restores the durable page/offset over a stale quota-blocked preference mirror",
  );
  assert.deepEqual(report.errors, []);
} catch (error) {
  report.error = error.stack;
  throw error;
} finally {
  await writeFile(output, JSON.stringify({ ok: !report.error, report }, null, 2));
  await context.close();
  await browser.close();
}
