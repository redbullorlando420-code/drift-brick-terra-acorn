import assert from "node:assert/strict";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/deletions-identity-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0deletion-probe",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "isolated-deletion-probe",
        resolveId(id) {
          if (id === entry) return entry;
        },
        load(id) {
          if (id === entry)
            return [
              "src/lib/videos/persist.ts",
              "src/lib/videos/deletion-tombstones.ts",
              "src/lib/videos/catalog-mutations.ts",
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
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        isMobile: mobile,
        hasTouch: mobile,
      }),
      page = await context.newPage(),
      errors = [],
      checks = [],
      report = { mobile, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(20000);
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.pull-settings.v1", JSON.stringify({ automaticPulls: false }));
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      localStorage.setItem("reelcase.artwork-mode", "text");
    });
    await context.route("**/__deletion-probe.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("https://www.youtube.com/embed/**", (r) =>
      r.fulfill({ contentType: "text/html", body: "<!doctype html><p>Fixture player</p>" }),
    );
    await context.route("**/_serverFn/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ result: { comments: [], note: "Fixture" } }),
      }),
    );
    page.on("pageerror", (e) => errors.push(e.message));
    const probe = () =>
      page.evaluate(async () => {
        window.__probe = await import("/__deletion-probe.mjs");
      });
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    };
    const search = async (name) => {
      await page.locator("[data-library-focus]").focus();
      await page.keyboard.press("Control+k");
      await page.getByLabel("Global media search", { exact: true }).fill(name);
      await page.getByLabel("Global media search", { exact: true }).press("Enter");
    };
    const remove = async (id, name) => {
      await search(name);
      await page
        .locator('[data-video-card-open][data-video-card-id="' + id + '"]')
        .first()
        .click();
      await page.getByRole("button", { name: "Watch now", exact: true }).click();
      await page.getByRole("button", { name: "Remove", exact: true }).click();
      await page.getByRole("button", { name: "Confirm remove", exact: true }).click();
      await page.locator("[data-media-viewer]").waitFor({ state: "hidden" });
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await page.evaluate(async () => {
        const now = Date.now(),
          folder = "yt:UC" + "0".repeat(22),
          rows = ["abcdefghijk", "lmnopqrstuv"].map((videoId, i) => ({
            id: "removal-" + (i + 1),
            folderId: folder,
            name: "Removal fixture " + (i + 1),
            path: "youtube/" + videoId,
            mime: "video/youtube",
            extension: "yt",
            size: 0,
            addedAt: now,
            duration: 900,
            remote: {
              kind: "youtube",
              videoId,
              channelId: folder.slice(3),
              channelName: "Removal fixture",
              youtubeType: "upload",
              watchUrl: "https://www.youtube.com/watch?v=" + videoId,
              embedUrl: "https://www.youtube.com/embed/" + videoId,
            },
          }));
        localStorage.setItem(
          "reelcase.follows.v1",
          JSON.stringify({
            channels: [
              {
                id: folder,
                kind: "youtube",
                handle: "fixture",
                channelId: folder.slice(3),
                title: "Removal fixture",
              },
            ],
            savedAt: now,
          }),
        );
        localStorage.setItem(
          "reelcase.media-feedback.v1",
          JSON.stringify({
            ratings: { "removal-1": 5, unrelated: 4 },
            watchTime: {},
            creatorFavorites: {},
            tagLikes: {},
            recommendationRejections: { version: 1, updatedAt: 0, entries: [] },
          }),
        );
        const p = JSON.parse(localStorage.getItem("reelcase.prefs.v4") ?? "{}");
        p.tags = { "removal-1": ["manual-kept"], unrelated: ["unrelated-kept"] };
        localStorage.setItem("reelcase.prefs.v4", JSON.stringify(p));
        const db = await new Promise((yes, no) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
        try {
          await new Promise((yes, no) => {
            const tx = db.transaction("remote-cache", "readwrite"),
              store = tx.objectStore("remote-cache");
            store.put({ folders: [], checkedAt: now }, "meta");
            for (const row of rows) store.put(row, "video:" + row.id);
            tx.oncomplete = yes;
            tx.onerror = () => no(tx.error);
          });
        } finally {
          db.close();
        }
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await page.evaluate(() => {
        window.__heldProvider = new Promise((resolve) => (window.__releaseProvider = resolve)).then(
          (row) =>
            window.__probe.saveRemoteSnapshot(
              { videos: [row], folders: [], checkedAt: Date.now() },
              false,
              true,
            ),
        );
      });
      await remove("removal-1", "Removal fixture 1");
      await page.evaluate(async () => {
        window.__releaseProvider({
          id: "late-alias",
          folderId: "yt:fixture",
          name: "Late provider response",
          path: "",
          mime: "video/youtube",
          extension: "yt",
          size: 0,
          addedAt: Date.now(),
          remote: { kind: "youtube", videoId: "abcdefghijk" },
        });
        await window.__heldProvider;
        const snapshot = await window.__probe.loadRemoteSnapshot();
        if (snapshot.videos.some((row) => row.id === "late-alias" || row.id === "removal-1"))
          throw Error("Late alias revived removed video");
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await search("Removal fixture 1");
      assert.equal(await page.locator('[data-video-card-id="removal-1"]').count(), 0);
      checks.push(
        "A provider response held before removal cannot reinsert the same canonical YouTube video under another row ID; reload keeps it removed",
      );
      await remove("removal-2", "Removal fixture 2");
      await nav("Settings");
      const panel = page.getByRole("region", { name: "Removed titles recovery" });
      await panel
        .getByRole("button", { name: "Restore removed Removal fixture 1", exact: true })
        .click();
      await panel.getByRole("status").waitFor();
      assert.equal(
        await panel
          .getByRole("button", { name: "Restore removed Removal fixture 2", exact: true })
          .count(),
        1,
      );
      const result = await page.evaluate(async () => {
        await window.__probe.hydrateCatalogDeletions();
        const ledger = window.__probe.catalogDeletionSnapshot(),
          snapshot = await window.__probe.loadRemoteSnapshot(),
          feedback = JSON.parse(localStorage.getItem("reelcase.media-feedback.v1"));
        return {
          ids: ledger.entries.map((row) => row.id),
          videos: snapshot.videos.map((row) => row.id),
          ratings: feedback.ratings,
        };
      });
      assert.deepEqual(result.ids, ["removal-2"]);
      assert(result.videos.includes("removal-1"));
      assert(!result.videos.includes("removal-2"));
      assert.equal(result.ratings["removal-1"], 5);
      assert.equal(result.ratings.unrelated, 4);
      checks.push(
        "Explicit restore clears one selected tombstone, reinstates that title and retains unrelated and per-title ratings",
      );
      await panel.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(/\.json$/, "-" + (mobile ? "mobile" : "desktop") + ".png"),
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.ok = true;
    } catch (e) {
      report.ok = false;
      report.error = e.stack;
      report.body = (await page.locator("body").innerText()).slice(-3000);
      await page
        .screenshot({
          path: output.replace(/\.json$/, "-" + (mobile ? "mobile" : "desktop") + "-failure.png"),
        })
        .catch(() => {});
    }
    await context.close();
    writeFileSync(output, JSON.stringify({ ok: reports.every((row) => row.ok), reports }, null, 2));
    console.log(JSON.stringify({ mobile, ok: report.ok, error: report.error?.slice(0, 180) }));
  }
} finally {
  await browser.close();
}
if (reports.some((row) => !row.ok)) process.exitCode = 1;
