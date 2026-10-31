import assert from "node:assert/strict";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/catalog-recovery-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0catalog-recovery-probe",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "isolated-probe",
        resolveId(id) {
          if (id === entry) return entry;
        },
        load(id) {
          if (id === entry)
            return [
              "src/lib/videos/persist.ts",
              "src/lib/videos/catalog-mutations.ts",
              "src/lib/videos/storage-recovery.ts",
            ]
              .map(
                (file) =>
                  "export * from " + JSON.stringify(resolve(file).replaceAll("\\", "/")) + ";",
              )
              .join("\n");
        },
      },
    ],
  });
const built = await bundle.generate({ format: "esm" });
await bundle.close();
const code = built.output.find((row) => row.type === "chunk").code;
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
        viewport,
        isMobile: viewport.name === "mobile",
        hasTouch: viewport.name === "mobile",
      }),
      page = await context.newPage(),
      errors = [],
      checks = [],
      report = { viewport: viewport.name, errors, checks };
    reports.push(report);
    page.setDefaultTimeout(30000);
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && !/ERR_ABORTED/.test(message.text()))
        errors.push(message.text());
    });
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.pull-settings.v1", JSON.stringify({ automaticPulls: false }));
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
    });
    await context.route("**/__catalog-recovery-probe.mjs", (route) =>
      route.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("http://127.0.0.1:43123/**", (route) =>
      route.fulfill({
        headers: { "access-control-allow-origin": "*" },
        contentType: "application/json",
        body: '{"ok":false}',
      }),
    );
    const nav = async (name) => {
      if (viewport.name === "mobile")
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name, exact: true })
        .click();
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      const result = await page.evaluate(async () => {
        const p = await import("/__catalog-recovery-probe.mjs");
        window.__catalogProbe = p;
        const db = await new Promise((yes, no) => {
          const r = indexedDB.open("reelcase", 8);
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
        const tx = async (names, work) =>
          new Promise((yes, no) => {
            const t = db.transaction(names, "readwrite");
            work(t);
            t.oncomplete = yes;
            t.onerror = t.onabort = () => no(t.error);
          });
        const read = async (store, key) =>
          new Promise((yes, no) => {
            const r = db.transaction(store).objectStore(store).get(key);
            r.onsuccess = () => yes(r.result);
            r.onerror = () => no(r.error);
          });
        const pending = async () =>
          new Promise((yes, no) => {
            const r = db
              .transaction("remote-cache")
              .objectStore("remote-cache")
              .getAll(
                IDBKeyRange.bound(
                  p.CATALOG_OPERATION_PREFIX,
                  p.CATALOG_OPERATION_PREFIX + "\uffff",
                ),
              );
            r.onsuccess = () => yes(r.result);
            r.onerror = () => no(r.error);
          });
        const originalPut = IDBObjectStore.prototype.put,
          originalCursor = IDBObjectStore.prototype.openCursor,
          originalRemove = Storage.prototype.removeItem,
          originalLocal = Storage.prototype.setItem;
        let phase = "",
          prepared = false,
          stagedSizes = [],
          catalogScans = 0;
        const originalAll = IDBObjectStore.prototype.getAll;
        IDBObjectStore.prototype.getAll = function (...args) {
          if (this.name === "videos") catalogScans++;
          return originalAll.apply(this, args);
        };
        IDBObjectStore.prototype.put = function (value, key) {
          if (this.name === "remote-cache" && String(key).startsWith(p.CATALOG_OPERATION_PREFIX)) {
            if (phase === "stage" || phase === "both")
              throw new DOMException("Controlled quota at prepare", "QuotaExceededError");
            prepared = true;
            stagedSizes.push(value.rows?.length ?? 0);
          }
          if (phase === "card" && this.name === "remote-cache" && key === "video:failure-target")
            throw new DOMException("Controlled card failure", "QuotaExceededError");
          if (
            phase === "metadata" &&
            this.name === "activity" &&
            key === "metadata-enrichment:failure-target"
          )
            throw new DOMException("Controlled metadata failure", "QuotaExceededError");
          if (
            phase === "commit" &&
            this.name === "remote-cache" &&
            key === p.CATALOG_CONTROL_KEY &&
            value.lastKind === "remote" &&
            prepared
          )
            throw new DOMException("Controlled commit failure", "QuotaExceededError");
          if (phase === "cleanup" && this.name === "remote-cache" && key === "youtube-cleanup")
            throw new DOMException("Controlled cleanup failure", "QuotaExceededError");
          return arguments.length === 1
            ? originalPut.call(this, value)
            : originalPut.call(this, value, key);
        };
        IDBObjectStore.prototype.openCursor = function (...args) {
          if (phase === "prepared" && prepared && this.name === "remote-cache")
            throw Error("Controlled interruption after durable prepare");
          return originalCursor.apply(this, args);
        };
        Storage.prototype.removeItem = function (key) {
          if (phase === "ack" && key === p.CATALOG_EDIT_MIRROR)
            throw new DOMException(
              "Controlled mirror acknowledgement failure",
              "QuotaExceededError",
            );
          return originalRemove.call(this, key);
        };
        Storage.prototype.setItem = function (key, value) {
          if ((phase === "mirror" || phase === "both") && key === p.CATALOG_EDIT_MIRROR)
            throw new DOMException("Controlled full mirror", "QuotaExceededError");
          return originalLocal.call(this, key, value);
        };
        const video = (id, name = id) => ({
          id,
          folderId: "yt:fixture",
          name,
          path: id,
          extension: "mp4",
          mime: "video/mp4",
          size: 1,
          addedAt: 1,
          remote: {
            kind: "youtube",
            id: "abcdefghijk",
            url: "https://www.youtube.com/watch?v=abcdefghijk",
            channelName: "Fixture",
          },
        });
        const seed = async () => {
          await tx(["remote-cache", "activity"], (t) => {
            t.objectStore("remote-cache").put(
              video("failure-target", "old"),
              "video:failure-target",
            );
            t.objectStore("activity").put(
              {
                id: "failure-target",
                tags: ["old"],
                provenance: { tags: { old: "legacy" }, updatedAt: 1 },
              },
              "metadata-enrichment:failure-target",
            );
          });
        };
        const write = () =>
          p.saveRemoteSnapshot({
            videos: [video("failure-target", "new")],
            folders: [],
            checkedAt: 42,
            metadata: {
              tags: { "failure-target": ["science"] },
              metadataProvenance: {
                "failure-target": { tags: { science: "provider:youtube" }, updatedAt: 2 },
              },
            },
          });
        const boundary = [];
        try {
          for (const point of ["stage", "prepared", "card", "metadata", "commit"]) {
            await seed();
            phase = point;
            prepared = false;
            let failed = false;
            try {
              await write();
            } catch {
              failed = true;
            }
            if (!failed) throw Error("Failure injection did not trigger at " + point);
            phase = "";
            const old = await read("remote-cache", "video:failure-target"),
              metadata = await read("activity", "metadata-enrichment:failure-target");
            if (old.name !== "old" || metadata.tags[0] !== "old")
              throw Error("Partial state leaked at " + point);
            const before = await pending();
            if (before.length !== (point === "stage" ? 0 : 1))
              throw Error("Unexpected pending operation at " + point);
            const beforeScans = catalogScans;
            await p.recoverCatalogMutations();
            if (catalogScans !== beforeScans) throw Error("Recovery scanned the full catalog");
            const after = await read("remote-cache", "video:failure-target");
            if (after.name !== (point === "stage" ? "old" : "new"))
              throw Error("Accepted row was lost at " + point);
            if ((await pending()).length) throw Error("Recovery did not commit marker at " + point);
            await p.recoverCatalogMutations();
            boundary.push(point);
          }
          await write();
          // Manual tags/locks/category share one durable row; a committed mirror can replay safely.
          phase = "ack";
          p.saveCatalogMetadataEdit({
            id: "failure-target",
            tags: ["my-tag"],
            provenance: {
              tags: { "my-tag": "manual" },
              lockedFields: ["tags", "category"],
              updatedAt: 100,
            },
            category: "Racing",
          });
          let ackFailed = false;
          try {
            await p.recoverCatalogMutations();
          } catch {
            ackFailed = true;
          }
          if (!ackFailed) throw Error("Ack failure not observed");
          const committed = await read("activity", p.CATALOG_EDIT_PREFIX + "failure-target");
          if (committed.category !== "Racing" || !localStorage.getItem(p.CATALOG_EDIT_MIRROR))
            throw Error("Manual edit lost across ack failure");
          phase = "";
          await p.recoverCatalogMutations();
          if (localStorage.getItem(p.CATALOG_EDIT_MIRROR))
            throw Error("Mirror was not acknowledged");
          await write();
          const restored = await p.restoreCatalogMetadata({
            tags: { "failure-target": ["old"] },
            metadataProvenance: {},
            categories: {},
          });
          if (
            restored.tags["failure-target"][0] !== "my-tag" ||
            restored.categories["failure-target"] !== "Racing" ||
            !restored.metadataProvenance["failure-target"].lockedFields.includes("tags")
          )
            throw Error("Provider replay overwrote manual metadata");
          phase = "mirror";
          p.saveCatalogMetadataEdit({
            id: "mirror-fallback",
            tags: [],
            provenance: { tags: {}, lockedFields: ["tags"] },
            category: "",
          });
          for (let i = 0; i < 100; i++) {
            if (await read("activity", p.CATALOG_EDIT_PREFIX + "mirror-fallback")) break;
            await new Promise((r) => setTimeout(r, 10));
          }
          if (!(await read("activity", p.CATALOG_EDIT_PREFIX + "mirror-fallback")))
            throw Error("Full localStorage prevented IndexedDB fallback");
          phase = "";
          p.saveCatalogMetadataEdit({
            id: "both-full",
            tags: ["old"],
            provenance: { tags: { old: "manual" }, lockedFields: ["tags"] },
          });
          await p.recoverCatalogMutations();
          phase = "both";
          p.saveCatalogMetadataEdit({
            id: "both-full",
            tags: ["new"],
            provenance: {
              tags: { new: "manual" },
              lockedFields: ["tags"],
              updatedAt: Date.now() + 1000,
            },
          });
          let bothFailed = false;
          try {
            await p.recoverCatalogMutations();
          } catch {
            bothFailed = true;
          }
          if (
            !bothFailed ||
            (await read("activity", p.CATALOG_EDIT_PREFIX + "both-full")).tags[0] !== "old"
          )
            throw Error("Full stores corrupted the prior manual save");
          phase = "";
          await p.recoverCatalogMutations();
          if ((await read("activity", p.CATALOG_EDIT_PREFIX + "both-full")).tags[0] !== "new")
            throw Error("Explicit retry lost the in-visit pending manual edit");
          const priorClock=await read("activity",p.CATALOG_EDIT_PREFIX+"both-full");p.saveCatalogMetadataEdit({id:"both-full",tags:["after-clock"],provenance:{...priorClock.provenance,tags:{"after-clock":"manual"},updatedAt:Date.now()}});await p.recoverCatalogMutations();if((await read("activity",p.CATALOG_EDIT_PREFIX+"both-full")).tags[0]!=="after-clock")throw Error("An older wall clock displaced a later manual edit");
          // Cleanup retains its original all-or-nothing transaction rather than replaying deletion later.
          phase = "cleanup";
          let cleanupFailed = false;
          try {
            await p.saveYoutubeCleanup([video("failure-target")], {
              version: 1,
              recentKeys: ["youtube:abcdefghijk"],
              removedCount: 1,
              lastAt: 2,
            });
          } catch {
            cleanupFailed = true;
          }
          phase = "";
          if (
            !cleanupFailed ||
            !(await read("remote-cache", "video:failure-target")) ||
            (await pending()).length
          )
            throw Error("Interrupted cleanup did not roll back safely");
          await p.recoverCatalogMutations();
          if (!(await read("remote-cache", "video:failure-target")))
            throw Error("A failed cleanup replayed later");
          // Future versions block new conflicting writes and remain untouched.
          const futureKey = p.CATALOG_OPERATION_PREFIX + "9999999999999999";
          await tx(["remote-cache"], (t) =>
            t.objectStore("remote-cache").put({ version: 2, kind: "remote", rows: [] }, futureKey),
          );
          let blocked = false;
          try {
            await p.appendCatalogVideos([video("must-not-save")]);
          } catch {
            blocked = true;
          }
          if (
            !blocked ||
            (await read("remote-cache", futureKey)).version !== 2 ||
            (await read("videos", "must-not-save"))
          )
            throw Error("Unknown recovery data was overwritten");
          await tx(["remote-cache"], (t) => t.objectStore("remote-cache").delete(futureKey));
          await p.recoverCatalogMutations();
          const many = Array.from({ length: 155 }, (_, i) => video("batch:" + i));
          await p.saveRemoteSnapshot({ videos: many, folders: [], checkedAt: 99 });
          if (stagedSizes.some((count) => count > 64)) throw Error("Unbounded journal chunk");
          // A later automatic tag update must not erase a category-only manual save.
          p.saveCatalogMetadataEdit({
            id: "category-only",
            field: "category",
            tags: ["old-auto"],
            provenance: {
              tags: { "old-auto": "legacy" },
              category: "manual",
              lockedFields: ["category"],
            },
            category: "Racing",
          });
          await p.recoverCatalogMutations();
          const categorySaved = await read("activity", p.CATALOG_EDIT_PREFIX + "category-only");
          const automatic = await p.restoreCatalogMetadata({
            tags: { "category-only": ["new-auto"] },
            metadataProvenance: {
              "category-only": {
                tags: { "new-auto": "provider:youtube" },
                category: "manual",
                lockedFields: ["category"],
                manualCategoryAt: categorySaved.at,
                updatedAt: categorySaved.at + 100,
              },
            },
            categories: { "category-only": "old snapshot" },
          });
          if (
            automatic.tags["category-only"][0] !== "new-auto" ||
            automatic.categories["category-only"] !== "Racing"
          )
            throw Error("Automatic tag clock displaced the independent category");
          const allSeed = 100000;
          for (let offset = 0; offset < allSeed; offset += 1000) {
            await tx(["videos"], (t) => {
              for (let index = offset; index < offset + 1000; index++)
                t.objectStore("videos").put({
                  id: "local:" + String(index).padStart(6, "0"),
                  folderId: "scale",
                  name: "Local " + index,
                  path: "fixture/" + index,
                  extension: "mp4",
                  mime: "video/mp4",
                  size: 1,
                  addedAt: 1,
                });
            });
            await new Promise((r) => setTimeout(r, 0));
          }
          // Leave a real prepared delta, then resume while 100k saved records exist.
          phase = "prepared";
          prepared = false;
          try {
            await p.appendCatalogVideos([
              {
                id: "recovered-local",
                folderId: "scale",
                name: "Recovered",
                path: "fixture/recovered",
                extension: "mp4",
                mime: "video/mp4",
                size: 1,
                addedAt: 1,
              },
            ]);
          } catch {}
          phase = "";
          const scansBefore = catalogScans;
          let ticks = 0,
            maxGap = 0,
            last = performance.now();
          const timer = setInterval(() => {
            const now = performance.now();
            maxGap = Math.max(maxGap, now - last);
            last = now;
            ticks++;
          }, 10);
          await p.recoverCatalogMutations();
          const recoveryScans = catalogScans - scansBefore;
          const all = await p.loadCatalogVideos();
          clearInterval(timer);
          if (all.length !== 100001 || recoveryScans !== 0 || ticks === 0 || maxGap > 500)
            throw Error(
              "100k recovery responsiveness budget failed: " +
                JSON.stringify({ rows: all.length, recoveryScans, ticks, maxGap }),
            );
          // Stable personal records are protected by artwork cleanup.
          await tx(["activity", "thumb-cache"], (t) => {
            t.objectStore("activity").put(
              { rating: 5, history: ["keep"], follows: ["keep"], draft: "private fixture" },
              "fixture-personal-record",
            );
            for (let i = 0; i < 300; i++)
              t.objectStore("thumb-cache").put({
                id: "fixture-art:" + String(i).padStart(3, "0"),
                at: 1,
                thumb: new Blob([new Uint8Array(4096)], { type: "image/png" }),
              });
          });
          const personal = JSON.stringify(await read("activity", "fixture-personal-record"));
          const openForRecovery = () =>
            new Promise((yes, no) => {
              const request = indexedDB.open("reelcase", 8);
              request.onsuccess = () => yes(request.result);
              request.onerror = () => no(request.error);
            });
          let clock = Date.now();
          const expiring = p.createStorageRecovery(openForRecovery, () => clock),
            expired = await expiring.preview();
          clock += 301000;
          let expiredDenied = false;
          try {
            await expiring.clean(expired.id);
          } catch {
            expiredDenied = true;
          }
          if (!expiredDenied) throw Error("Expired cleanup was accepted");
          const interrupted = p.createStorageRecovery(openForRecovery),
            cleanupPreview = await interrupted.preview(),
            originalDelete = IDBObjectStore.prototype.delete;
          let deleteCalls = 0,
            partial;
          IDBObjectStore.prototype.delete = function (key) {
            if (this.name === "thumb-cache" && ++deleteCalls === 17)
              throw new DOMException("Controlled cleanup quota", "QuotaExceededError");
            return originalDelete.call(this, key);
          };
          try {
            await interrupted.clean(cleanupPreview.id);
            throw Error("Expected interrupted artwork cleanup");
          } catch (error) {
            partial = error.removed;
          } finally {
            IDBObjectStore.prototype.delete = originalDelete;
          }
          if (
            partial !== 16 ||
            JSON.stringify(await read("activity", "fixture-personal-record")) !== personal
          )
            throw Error("Partial artwork cleanup was misreported or touched protected data");
          await tx(["thumb-cache"], (t) => {
            for (let i = 0; i < 300; i++)
              t.objectStore("thumb-cache").put({
                id: "fixture-art:" + String(i).padStart(3, "0"),
                at: 1,
                thumb: new Blob([new Uint8Array(4096)], { type: "image/png" }),
              });
          });
          const plan = await p.previewStorageCleanup();
          p.cancelStorageCleanup(plan.id);
          let cancelled = false;
          try {
            await p.confirmStorageCleanup(plan.id);
          } catch {
            cancelled = true;
          }
          if (!cancelled) throw Error("Cancelled preview reused");
          if (JSON.stringify(await read("activity", "fixture-personal-record")) !== personal)
            throw Error("Preview touched personal state");
          return {
            boundaries: boundary,
            stagedChunkLimit: Math.max(...stagedSizes),
            rows: all.length,
            recoveryScans,
            ticks,
            maxGapMs: Math.round(maxGap),
            personal,
          };
        } finally {
          phase = "";
          IDBObjectStore.prototype.put = originalPut;
          IDBObjectStore.prototype.openCursor = originalCursor;
          IDBObjectStore.prototype.getAll = originalAll;
          Storage.prototype.removeItem = originalRemove;
          Storage.prototype.setItem = originalLocal;
          db.close();
        }
      });
      checks.push(
        "Actual IndexedDB failures before prepare, after durable prepare, card apply, metadata apply and commit preserve the prior state; accepted deltas replay once with no full catalog scan.",
      );
      checks.push(
        "Manual tags, locks and category survive lost acknowledgement; stale provider metadata cannot replace them and a full localStorage mirror falls back to IndexedDB.",
      );
      checks.push(
        "Interrupted cleanup rolls back without later deletion; future journals remain preserved and block conflicting catalog writes.",
      );
      report.scale = {
        rows: result.rows,
        maxGapMs: result.maxGapMs,
        ticks: result.ticks,
        recoveryCatalogScans: result.recoveryScans,
        maxStagedRows: result.stagedChunkLimit,
      };
      await page.evaluate(() => {
        window.__scaleReading = window.__catalogProbe.loadCatalogVideos().then((rows) => {
          window.__scaleRows = rows.length;
        });
      });
      const controlsStart = Date.now();
      await nav("Settings");
      const panel = page.getByRole("region", { name: "Storage and save recovery", exact: true });
      await panel.getByRole("button", { name: "Review storage recovery", exact: true }).click();
      report.scale.controlsReadyMs = Date.now() - controlsStart;
      assert(
        report.scale.controlsReadyMs < 2000,
        "Settings controls stayed responsive during a 100k read",
      );
      await page.waitForFunction(() => window.__scaleRows === 100001);
      await page.evaluate(() => {
        Object.defineProperty(navigator.storage, "estimate", {
          configurable: true,
          value: async () => {
            throw Error("Measurement unavailable");
          },
        });
      });
      await panel.getByRole("button", { name: "Preview artwork cleanup", exact: true }).click();
      await panel
        .getByRole("heading", { name: "256 artwork cache entries selected", exact: true })
        .waitFor();
      await panel.getByText(/origin usage: Unavailable/).waitFor();
      await page.locator("[data-sonner-toast]").last().waitFor({ state: "hidden", timeout: 10000 });
      await panel.evaluate((node) => node.scrollIntoView({ block: "start" }));
      await page.screenshot({ path: output.replace(".json", "-" + viewport.name + ".png") });
      await panel.getByRole("button", { name: "Cancel cleanup preview", exact: true }).click();
      await panel
        .getByRole("status")
        .filter({ hasText: "No cache or personal records were removed" })
        .waitFor();
      assert.equal(
        await page.evaluate(async () => {
          const db = await new Promise((r) => {
            const q = indexedDB.open("reelcase", 8);
            q.onsuccess = () => r(q.result);
          });
          try {
            return await new Promise((r) => {
              const q = db.transaction("thumb-cache").objectStore("thumb-cache").count();
              q.onsuccess = () => r(q.result);
            });
          } finally {
            db.close();
          }
        }),
        300,
      );
      await panel.getByRole("button", { name: "Preview artwork cleanup", exact: true }).click();
      await panel
        .getByRole("heading", { name: "256 artwork cache entries selected", exact: true })
        .waitFor();
      await page.evaluate(async () => {
        const db = await new Promise((r) => {
          const q = indexedDB.open("reelcase", 8);
          q.onsuccess = () => r(q.result);
        });
        try {
          await new Promise((r, no) => {
            const tx = db.transaction("thumb-cache", "readwrite");
            tx.objectStore("thumb-cache").put({
              id: "fixture-art:000",
              at: 2,
              thumb: new Blob([new Uint8Array(4096)], { type: "image/png" }),
            });
            tx.oncomplete = r;
            tx.onabort = () => no(tx.error);
          });
        } finally {
          db.close();
        }
      });
      await panel.getByRole("button", { name: "Clear previewed artwork", exact: true }).click();
      await panel
        .getByRole("status")
        .filter({ hasText: "255 artwork cache entries removed" })
        .waitFor();
      const final = await page.evaluate(async () => {
        const db = await new Promise((r) => {
          const q = indexedDB.open("reelcase", 8);
          q.onsuccess = () => r(q.result);
        });
        try {
          return await new Promise((r) => {
            const tx = db.transaction(["thumb-cache", "activity"]),
              count = tx.objectStore("thumb-cache").count(),
              personal = tx.objectStore("activity").get("fixture-personal-record");
            tx.oncomplete = () =>
              r({ count: count.result, personal: JSON.stringify(personal.result) });
          });
        } finally {
          db.close();
        }
      });
      assert.equal(final.count, 45);
      assert.equal(final.personal, result.personal);
      checks.push(
        "Desktop/touch-mobile UI previews a bounded artwork-only cleanup; cancel deletes nothing, confirmation skips changed artwork and preserves personal records with approximate byte reporting.",
      );
      // The current in-memory app remains its original empty fixture; the separate
      // stored 100k scale catalog must survive an explicit current-snapshot retry.
      await panel.getByRole("button", { name: "Retry pending saves", exact: true }).click();
      await panel
        .getByRole("status")
        .filter({ hasText: "library preferences were saved" })
        .waitFor();
      await page.evaluate(async () => {
        const p = window.__catalogProbe,
          originalPut = IDBObjectStore.prototype.put,
          originalCursor = IDBObjectStore.prototype.openCursor;
        let prepared = false;
        IDBObjectStore.prototype.put = function (value, key) {
          if (this.name === "remote-cache" && String(key).startsWith(p.CATALOG_OPERATION_PREFIX))
            prepared = true;
          return arguments.length === 1
            ? originalPut.call(this, value)
            : originalPut.call(this, value, key);
        };
        IDBObjectStore.prototype.openCursor = function (...args) {
          if (prepared && this.name === "remote-cache")
            throw Error("Controlled tab interruption after prepare");
          return originalCursor.apply(this, args);
        };
        try {
          await p.appendCatalogVideos([
            {
              id: "reload-recovery",
              folderId: "scale",
              name: "Recovered after reload",
              path: "fixture/reload",
              extension: "mp4",
              mime: "video/mp4",
              size: 1,
              addedAt: 1,
            },
          ]);
        } catch {
        } finally {
          IDBObjectStore.prototype.put = originalPut;
          IDBObjectStore.prototype.openCursor = originalCursor;
        }
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.waitForFunction(
        async () => {
          const db = await new Promise((r) => {
            const q = indexedDB.open("reelcase", 8);
            q.onsuccess = () => r(q.result);
          });
          try {
            return await new Promise((r) => {
              const tx = db.transaction(["remote-cache", "videos"]),
                pending = tx
                  .objectStore("remote-cache")
                  .count(IDBKeyRange.bound("catalog-operation:", "catalog-operation:\uffff")),
                row = tx.objectStore("videos").get("reload-recovery");
              tx.oncomplete = () =>
                r(pending.result === 0 && row.result?.name === "Recovered after reload");
            });
          } finally {
            db.close();
          }
        },
        { timeout: 30000 },
      );
      await nav("Settings");
      const restoredPanel = page.getByRole("region", {
        name: "Storage and save recovery",
        exact: true,
      });
      await restoredPanel
        .getByRole("button", { name: "Review storage recovery", exact: true })
        .click();
      await restoredPanel.getByRole("button", { name: "Retry pending saves", exact: true }).click();
      await restoredPanel
        .getByRole("status")
        .filter({ hasText: "library preferences were saved" })
        .waitFor();
      checks.push(
        "A real page reload recovers the prepared accepted row before new writers; independent category clocks, expired previews, unavailable estimates and partial cleanup quota reporting also pass.",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.ok = true;
    } catch (error) {
      report.ok = false;
      report.error = error.stack;
      await page.screenshot({
        path: output.replace(".json", "-failure-" + viewport.name + ".png"),
      });
      console.error(error.stack);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
const result = {
  ok: reports.every((r) => r.ok),
  reports,
  limitations:
    "Isolated Chrome profiles, actual IndexedDB and compiled source modules; injected storage failures and synthetic 100k catalogs. No real user library, provider or physical device was changed.",
};
await writeFile(output, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
