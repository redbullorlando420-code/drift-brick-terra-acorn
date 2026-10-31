import assert from "node:assert/strict";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/writer-signal-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0writer-signal-probe",
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
              "src/lib/writer-lease.ts",
              "src/lib/stream-signal-revisions.ts",
              "src/lib/stream-signal.ts",
              "src/lib/videos/persist.ts",
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
        acceptDownloads: true,
      }),
      errors = [],
      checks = [],
      report = { viewport: viewport.name, errors, checks };
    reports.push(report);
    let tabA, tabB, crash;
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.pull-settings.v1", JSON.stringify({ automaticPulls: false }));
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      const timer = window.setTimeout.bind(window);
      window.setTimeout = (handler, delay, ...args) => {
        if (window.__holdSignalAutosave && delay === 450) return timer(() => {}, 60000);
        return timer(handler, delay, ...args);
      };
    });
    await context.route("**/__writer-signal-probe.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        headers: { "access-control-allow-origin": "*" },
        contentType: "application/json",
        body: '{"ok":false}',
      }),
    );
    const newPage = async () => {
      const page = await context.newPage();
      page.setDefaultTimeout(25000);
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error" && !/net::ERR_|favicon/.test(m.text())) errors.push(m.text());
      });
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(async () => {
        window.__probe = await import("/__writer-signal-probe.mjs");
        window.__fixtureOpen = () =>
          new Promise((resolve, reject) => {
            const r = indexedDB.open("writer-signal-fixtures", 1);
            r.onupgradeneeded = () => {
              r.result.createObjectStore("remote-cache");
              r.result.createObjectStore("activity");
            };
            r.onsuccess = () => resolve(r.result);
            r.onerror = () => reject(r.error);
          });
      });
      return page;
    };
    const nav = async (page, name) => {
      if (viewport.name === "mobile")
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    };
    const saved = (page) =>
      page
        .locator("[data-signal-save-status]")
        .filter({ hasText: "Saved in this browser" })
        .waitFor();
    const shot = async (page, label) =>
      page.screenshot({
        path: output.replace(/\.json$/, "-" + viewport.name + "-" + label + ".png"),
      });
    try {
      tabA = await newPage();
      tabB = await newPage();
      await tabA.evaluate(() => {
        window.__lease = window.__probe.createWriterLease(window.__fixtureOpen, "delayed", {
          owner: "old-owner",
          ttl: 600,
        });
        window.__held = window.__lease
          .run(async (token) => {
            window.__oldToken = token;
            await new Promise((resolve) => (window.__resume = resolve));
            return await new Promise((resolve, reject) => {
              window.__fixtureOpen().then((db) => {
                const tx = db.transaction(["activity", "remote-cache"], "readwrite");
                tx.oncomplete = () => {
                  db.close();
                  resolve("committed");
                };
                tx.onabort = () => {
                  db.close();
                  reject(Error("Old owner fenced"));
                };
                window.__lease.guard(tx, token, () =>
                  tx.objectStore("activity").put("stale", "delayed-write"),
                );
              });
            });
          })
          .then(
            (value) => (window.__heldOutcome = value),
            (error) => (window.__heldOutcome = error.message),
          );
      });
      await tabA.waitForFunction(() => !!window.__oldToken);
      const busy = await tabB.evaluate(async () => {
        window.__lease = window.__probe.createWriterLease(window.__fixtureOpen, "delayed", {
          owner: "new-owner",
          ttl: 600,
        });
        try {
          await window.__lease.run(async () => {});
          return false;
        } catch (e) {
          return e.name === "WriterBusyError";
        }
      });
      assert(busy);
      await tabA.evaluate(() => window.__lease.close());
      await new Promise((resolve) => setTimeout(resolve, 850));
      await tabB.evaluate(() => {
        window.__held = window.__lease.run(async (token) => {
          window.__newToken = token;
          await new Promise((resolve) => (window.__resume = resolve));
        });
      });
      await tabB.waitForFunction(() => !!window.__newToken);
      await tabA.evaluate(() => window.__resume());
      await tabA.waitForFunction(() => window.__heldOutcome === "Old owner fenced");
      const fenced = await tabB.evaluate(async () => {
        const db = await window.__fixtureOpen();
        const result = await new Promise((resolve) => {
          const r = db.transaction("activity").objectStore("activity").get("delayed-write");
          r.onsuccess = () => resolve(r.result);
        });
        db.close();
        const current = await window.__lease.inspect();
        return {
          absent: result === undefined,
          generation: current.generation,
          owner: current.owner,
        };
      });
      assert(fenced.absent);
      assert.equal(fenced.owner, "new-owner");
      assert.equal(fenced.generation, 2);
      await tabB.evaluate(() => window.__resume());
      await tabB.evaluate(() => window.__held);
      crash = await newPage();
      await crash.evaluate(() => {
        window.__lease = window.__probe.createWriterLease(window.__fixtureOpen, "crash", {
          owner: "closed-owner",
          ttl: 600,
        });
        window.__held = window.__lease.run(async (token) => {
          await new Promise((resolve, reject) =>
            window.__fixtureOpen().then((db) => {
              const tx = db.transaction(["activity", "remote-cache"], "readwrite");
              tx.oncomplete = () => {
                db.close();
                resolve();
              };
              tx.onabort = () => {
                db.close();
                reject(tx.error);
              };
              window.__lease.guard(tx, token, () =>
                tx.objectStore("activity").put("committed-before-close", "crash-data"),
              );
            }),
          );
          window.__token = token;
          await new Promise(() => {});
        });
      });
      await crash.waitForFunction(() => !!window.__token);
      await crash.close();
      await new Promise((resolve) => setTimeout(resolve, 850));
      const recovered = await tabB.evaluate(async () => {
        const lease = window.__probe.createWriterLease(window.__fixtureOpen, "crash", {
          owner: "recovered-owner",
          ttl: 600,
        });
        const value = await lease.run(async (token) => token.generation, false);
        const record = await lease.inspect();
        if (record.revision !== 1 || record.dirty)
          throw Error("Crashed committed work did not advance the catch-up revision");
        lease.close();
        return value;
      });
      assert.equal(recovered, 2);
      const idle = await tabB.evaluate(async () => {
        let writes = 0;
        const open = async () => {
          writes++;
          return window.__fixtureOpen();
        };
        const lease = window.__probe.createWriterLease(open, "idle", {
          owner: "idle-owner",
          ttl: 300,
          transport: false,
        });
        await lease.run(async () => {}, false);
        const before = writes;
        await new Promise((resolve) => setTimeout(resolve, 450));
        lease.close();
        return { before, after: writes };
      });
      assert.equal(idle.after, idle.before);
      checks.push(
        "Actual same-origin tabs: second writer refused; stopped renewal expires; delayed old owner cannot commit or release the newer generation; closing an owner permits generation-2 recovery after expiry",
      );
      // Actual production catalog mutation APIs and mounted reader invalidation.
      await tabA.evaluate(() => {
        window.__catalog = window.__probe.catalogWriter;
        const run = window.__catalog.run;
        let first = true;
        window.__catalog.run = (work, mutates) =>
          run(async (token) => {
            if (first) {
              first = false;
              window.__catalogReady = true;
              await new Promise((resolve) => (window.__releaseCatalog = resolve));
            }
            return work(token);
          }, mutates);
        window.__catalogHeld = window.__probe
          .saveRemoteSnapshot({ videos: [], folders: [], checkedAt: 0 })
          .finally(() => {
            window.__catalog.run = run;
          });
      });
      await tabA.waitForFunction(() => window.__catalogReady === true);
      const refused = await tabB.evaluate(async () => {
        const m = window.__probe;
        try {
          await m.saveYoutubeCleanup([], {
            recentKeys: [],
            removedCount: 0,
            lastRemoved: 0,
            lastAt: 0,
          });
          return false;
        } catch (e) {
          return e.name === "WriterBusyError";
        }
      });
      assert(refused);
      await nav(tabB, "Settings");
      await tabB.getByRole("button", { name: "Review storage recovery", exact: true }).click();
      await tabB.getByRole("button", { name: "Retry pending saves", exact: true }).click();
      await tabB
        .getByRole("complementary", { name: "Catalog writer status", exact: true })
        .getByText(/Another app tab is updating/)
        .waitFor();
      await tabB.getByRole("complementary",{name:"Catalog writer status",exact:true}).scrollIntoViewIfNeeded();
      await shot(tabB, "writer");
      await tabA.evaluate(() => window.__releaseCatalog());
      await tabA.evaluate(() => window.__catalogHeld);
      await tabA.evaluate(async () => {
        const m = window.__probe;
        await m.saveRemoteSnapshot({
          videos: [
            {
              id: "yt:writer-fixture",
              folderId: "yt:fixture",
              name: "Committed cross-tab catalog fixture",
              path: "writer-fixture",
              extension: "yt",
              mime: "video/youtube",
              size: 0,
              addedAt: 1,
              remote: {
                kind: "youtube",
                videoId: "writer-fixture",
                watchUrl: "https://www.youtube.com/watch?v=writer-fixture",
              },
            },
          ],
          folders: [
            { id: "yt:fixture", name: "Cross-tab fixture", kind: "youtube", videoCount: 1 },
          ],
          checkedAt: 1,
        });
      });
      await tabB
        .getByRole("complementary", { name: "Catalog writer status", exact: true })
        .getByText("Catalog changes from another tab loaded.", { exact: true })
        .waitFor();
      await nav(tabB, "YouTube");
      await tabB.getByRole("button", { name: /^Cross-tab fixture/ }).count();
      await tabB.waitForFunction(() =>
        [...document.querySelectorAll("p")].some(
          (node) =>
            node.textContent === "Cached videos" && node.nextElementSibling?.textContent === "1",
        ),
      );
      // No whole catalog travels through the notice channel.
      const notice = await tabA.evaluate(async () => {
        const m = window.__probe;
        const writer = m.createWriterLease(window.__fixtureOpen, "notice", {
          owner: "notice-owner",
          ttl: 600,
        });
        const seen = [];
        const receiver = new BroadcastChannel("reelcase-writers.v1");
        receiver.onmessage = (e) => {
          if (e.data.scope === "notice") seen.push(e.data);
        };
        await writer.run(async () => {});
        await new Promise((resolve) => setTimeout(resolve, 60));
        writer.close();
        receiver.close();
        return seen;
      });
      assert(notice.some((row) => row.type === "commit"));
      assert(notice.every((row) => JSON.stringify(row).length < 256 && !("videos" in row)));
      checks.push(
        "Catalog cleanup/import APIs share the lease; mounted status surfaces second-tab ownership; compact notices trigger paged reader rebase without catalog payloads",
      );
      await nav(tabA, "Stream Signal");
      await saved(tabA);
      await tabA.getByRole("button", { name: "Generate announcement pack", exact: true }).click();
      await saved(tabA);
      await nav(tabB, "Stream Signal");
      await saved(tabB);
      const packId = await tabA
        .locator("[data-signal-pack-id]")
        .getAttribute("data-signal-pack-id");
      assert.equal(
        await tabB.locator("[data-signal-pack-id]").getAttribute("data-signal-pack-id"),
        packId,
      );
      const links = "\nhttps://www.twitch.tv/notyoda\nhttps://www.youtube.com/@astronauta2706",
        x = (page) => page.getByLabel("X announcement draft", { exact: true });
      await tabB.evaluate(() => (window.__holdSignalAutosave = true));
      await x(tabB).fill("Local edit to discard" + links);
      await x(tabA).fill("New saved text from A" + links);
      await tabA.getByRole("button", { name: "Save X", exact: true }).click();
      await saved(tabA);
      await tabB.getByRole("button", { name: "Save X", exact: true }).click();
      const conflict = tabB.getByRole("region", {
        name: "Announcement revision conflict",
        exact: true,
      });
      await conflict.waitFor();
      assert.equal(await x(tabB).inputValue(), "Local edit to discard" + links);
      assert.equal(await x(tabA).inputValue(), "New saved text from A" + links);
      await tabB.reload();
      await tabB.locator('[data-home-ready="true"]').waitFor();
      await nav(tabB, "Stream Signal");
      await conflict.waitFor();
      assert.equal(await x(tabB).inputValue(), "Local edit to discard" + links);
      await tabB.evaluate(() => (window.__holdSignalAutosave = true));
      await conflict
        .getByRole("button", { name: "Keep current saved version", exact: true })
        .click();
      await saved(tabB);
      assert.equal(await x(tabB).inputValue(), "New saved text from A" + links);
      await x(tabB).fill("Recovered local X" + links);
      await x(tabA).fill("Latest saved X from A" + links);
      await tabA
        .getByLabel("Facebook announcement draft", { exact: true })
        .fill("Keep newer Facebook" + links);
      await tabA.getByRole("button", { name: "Save X", exact: true }).click();
      await saved(tabA);
      await tabA.getByRole("button", { name: "Mark Facebook shared", exact: true }).click();
      await saved(tabA);
      await tabB.getByRole("button", { name: "Save X", exact: true }).click();
      await conflict.waitFor();
      await conflict.getByText("Compare saved and local drafts", { exact: true }).click();
      await shot(tabB, "conflict");
      await conflict
        .getByRole("button", { name: "Restore my changes as a new revision", exact: true })
        .click();
      await saved(tabB);
      assert.equal(await x(tabB).inputValue(), "Recovered local X" + links);
      assert.equal(
        await tabB.getByLabel("Facebook announcement draft", { exact: true }).inputValue(),
        "Keep newer Facebook" + links,
      );
      await tabB.getByRole("button", { name: "Undo Facebook shared mark", exact: true }).waitFor();
      await tabA.waitForFunction(
        (text) =>
          document.querySelector('textarea[aria-label="X announcement draft"]')?.value === text,
        "Recovered local X" + links,
      );
      await tabB.getByRole("button", { name: "Mark X shared", exact: true }).click();
      await tabB.getByRole("button", { name: "Save X", exact: true }).click();
      await saved(tabB);
      await tabB.getByRole("button", { name: "Undo X shared mark", exact: true }).click();
      await tabB.getByRole("button", { name: "Save X", exact: true }).click();
      await saved(tabB);
      await tabB.reload();
      await tabB.locator('[data-home-ready="true"]').waitFor();
      await nav(tabB, "Stream Signal");
      await saved(tabB);
      await tabB.getByText(/^Announcement edit history/).click();
      const prior = tabB.locator('[data-signal-history-platform="x"]').first();
      await prior.getByRole("button", { name: /^Restore X before revision/ }).click();
      await saved(tabB);
      await tabB.getByRole("button", { name: "Undo X shared mark", exact: true }).waitFor();
      await tabB.getByRole("button", { name: "Undo X shared mark", exact: true }).click();
      await saved(tabB);
      await tabB.getByRole("button", { name: "Mark X shared", exact: true }).waitFor();
      await tabB.locator("[data-signal-history-platform]").first().scrollIntoViewIfNeeded();
      await shot(tabB, "history");
      checks.push(
        "Two editors retain conflicting local text; keep-current and restore-mine create explicit outcomes; only changed fields are rebased, newer Facebook text/manual mark survive, clean readers refresh, and reload/history restore text and manual-only sharing state",
      );
      if (process.argv.includes("--scale")) {
        await tabB.evaluate(() => {
          window.__scale = { reads: 0, maxBatch: 0, unbounded: 0, maxGap: 0 };
          window.__scaleLast = performance.now();
          window.__scaleTimer = setInterval(() => {
            const now = performance.now();
            window.__scale.maxGap = Math.max(window.__scale.maxGap, now - window.__scaleLast);
            window.__scaleLast = now;
          }, 16);
          const getAll = IDBObjectStore.prototype.getAll;
          IDBObjectStore.prototype.getAll = function (query, count) {
            if (
              this.name === "videos" ||
              (this.name === "remote-cache" && query?.lower?.startsWith?.("video:"))
            ) {
              window.__scale.reads++;
              window.__scale.maxBatch = Math.max(window.__scale.maxBatch, count ?? Infinity);
              if (!count || count > 512) window.__scale.unbounded++;
            }
            return getAll.call(this, query, count);
          };
        });
        await tabA.evaluate(async () => {
          const writer = window.__probe.catalogWriter;
          await writer.run(async (token) => {
            const db = await new Promise((resolve, reject) => {
              const request = indexedDB.open("reelcase");
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            });
            try {
              for (let start = 0; start < 100000; start += 1000) {
                await new Promise((resolve, reject) => {
                  const tx = db.transaction("remote-cache", "readwrite");
                  tx.oncomplete = resolve;
                  tx.onabort = () => reject(tx.error);
                  writer.guard(tx, token, () => {
                    const store = tx.objectStore("remote-cache");
                    for (let i = start; i < start + 1000; i++) {
                      const id = "S" + String(i).padStart(10, "0");
                      store.put(
                        {
                          id: "yt:" + id,
                          folderId: "yt:fixture",
                          name: "Catalog scale fixture " + i,
                          path: id,
                          extension: "yt",
                          mime: "video/youtube",
                          size: 0,
                          addedAt: 1,
                          remote: { kind: "youtube", videoId: id, channelId: "fixture" },
                        },
                        "video:yt:" + id,
                      );
                    }
                  });
                });
                await new Promise((resolve) => setTimeout(resolve, 0));
              }
            } finally {
              db.close();
            }
          });
        });
        await tabB.waitForFunction(() => window.__scale.reads > 1);
        const clickStarted = Date.now();
        await nav(tabB, "Home");
        await tabB.locator('[data-home-ready="true"]').waitFor();
        const inputMs = Date.now() - clickStarted;
        await tabB.waitForFunction(
          () => document.querySelector("header")?.innerText.includes("100,001"),
          { timeout: 30000 },
        );
        report.scale = await tabB.evaluate(() => {
          clearInterval(window.__scaleTimer);
          return { ...window.__scale };
        });
        report.scale.inputMs = inputMs;
        report.scale.rows = 100001;
        assert.equal(report.scale.unbounded, 0);
        assert(report.scale.maxBatch <= 512);
        assert(inputMs < 2500);
        assert(report.scale.maxGap < 500);
        checks.push(
          "100,001-row actual reader rebase uses <=512-row disk pages; Home navigation stays below 2.5 seconds, sampled timer gaps below 500ms, and no unbounded catalog getAll is used",
        );
      }
      await tabA.evaluate(async () => {
        const p = window.__probe;
        await p.appendCatalogVideos([
          {
            id: "new-private-local",
            folderId: "unreviewed-private-root",
            name: "Do not expose this local source",
            path: "personal/new-file.mp4",
            extension: "mp4",
            mime: "video/mp4",
            size: 1,
            addedAt: 1,
          },
        ]);
      });
      await tabB
        .getByRole("complementary", { name: "Catalog writer status", exact: true })
        .getByText(
          "Catalog changes loaded. Reload to include newly imported local files with their saved privacy settings.",
          { exact: true },
        )
        .waitFor();
      assert(!(await tabB.locator("body").innerText()).includes("Do not expose this local source"));
      checks.push(
        "Previously unseen local files stay deferred until reload restores their saved privacy and permission metadata; existing shared remote catalogs continue to update",
      );
      assert.equal(
        await tabB.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.ok = true;
    } catch (e) {
      report.ok = false;
      report.error = e.stack;
      console.error(e.stack);
      if (tabB && !tabB.isClosed()) await shot(tabB, "failure");
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(
    output,
    JSON.stringify({ ok: reports.every((row) => row.ok), url, reports }, null, 2),
  );
}
console.log(JSON.stringify({ ok: reports.every((row) => row.ok), reports }, null, 2));
if (reports.some((row) => !row.ok)) process.exitCode = 1;
