import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/unicode-search-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0unicode-search-probe",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "unicode-probe",
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) =>
          id === entry
            ? "export * from " +
              JSON.stringify(resolve("src/lib/videos/persist.ts").replaceAll("\\", "/")) +
              ";"
            : undefined,
      },
    ],
  });
const generated = await bundle.generate({ format: "esm" });
await bundle.close();
const code = generated.output.find((row) => row.type === "chunk").code;
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
      report = { mobile, checks: [], errors: [] };
    reports.push(report);
    page.setDefaultTimeout(60000);
    page.on("pageerror", (error) => report.errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && !/ERR_ABORTED/.test(message.text()))
        report.errors.push(message.text());
    });
    await context.route("**/__unicode-search-probe.mjs", (route) =>
      route.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__unicode-search-blank.html", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Disposable Unicode search fixture</title><p>Fixture preparation</p>",
      }),
    );
    await context.route("http://127.0.0.1:43123/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("**/_serverFn/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: '{"result":{"channels":[],"profiles":[]},"context":{}}',
      }),
    );
    await context.addInitScript(() => {
      window.__workerStats = { rows: 0, batches: 0, maxBatch: 0, ready: 0, keys: [] };
      const NativeWorker = window.Worker;
      window.Worker = class extends NativeWorker {
        constructor(...args) {
          super(...args);
          this.addEventListener("message", (event) => {
            if (event.data?.type === "ready") window.__workerStats.ready++;
          });
        }
        postMessage(data, ...args) {
          if (data?.type === "batch") {
            window.__workerStats.rows += data.batch.length;
            window.__workerStats.batches++;
            window.__workerStats.maxBatch = Math.max(
              window.__workerStats.maxBatch,
              data.batch.length,
            );
          }
          return super.postMessage(data, ...args);
        }
      };
      window.addEventListener("keydown", (event) => {
        if (event.target instanceof HTMLInputElement) window.__workerStats.keys.push(event.key);
      });
    });
    const search = async (text) => {
      await page.getByRole("button", { name: "Open search", exact: true }).click();
      const input = page.getByRole("searchbox", { name: "Global media search", exact: true });
      await input.fill(text);
      await input.press("Enter");
    };
    const results = async (count) => {
      await page
        .getByRole("region", { name: "Search ranking and matching tags" })
        .getByText(`${count} ranked results`, { exact: true })
        .waitFor();
    };
    const spelling = page.getByRole("region", { name: "Local spelling suggestions" });
    try {
      await page.goto(new URL("/__unicode-search-blank.html", url).href);
      await page.evaluate(async (mobile) => {
        const p = await import("/__unicode-search-probe.mjs");
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem(
          "reelcase.pull-settings.v1",
          JSON.stringify({ automaticPulls: false }),
        );
        localStorage.setItem("reelcase.artwork-mode", "text");
        const row = (id, name, kind = "youtube") => ({
          id,
          name,
          folderId: kind + ":qa",
          path: id,
          extension: "mp4",
          mime: "video/mp4",
          size: 0,
          addedAt: 1,
          duration: 1800,
          remote: { kind, channelName: "QA creator", videoId: id },
        });
        const rows = [
          row("youtube:composed", "Café soirée"),
          row("youtube:decomposed", "Cafe\u0301 soire\u0301e"),
          row("youtube:plain", "Cafe soiree"),
          row("youtube:ru", "Привет мир"),
          row("youtube:jp", "日本語の映画"),
          row("youtube:ar", "مرحبا بالعالم"),
          row("youtube:ko", "한국어 영화"),
          row("youtube:race1", "Racing evening"),
          row("youtube:race2", "Racing feature"),
          row("youtube:race3", "Racing classic"),
          row("eporner:secret1", "Privatesecret sample", "eporner"),
          row("eporner:secret2", "Privatesecret other", "eporner"),
        ];
        await p.appendCatalogVideos(rows);
        const db = await new Promise((yes, no) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
        try {
          const total = mobile ? 10000 : 100000,
            labels = [
              "Unrelated запись",
              "Unrelated 日本語",
              "Unrelated العربية",
              "Unrelated 한국어",
            ];
          for (let start = 0; start < total; start += 2000)
            await new Promise((yes, no) => {
              const tx = db.transaction("videos", "readwrite"),
                store = tx.objectStore("videos");
              for (let i = start; i < Math.min(total, start + 2000); i++)
                store.put(row("youtube:bulk-" + i, labels[i % labels.length]));
              tx.oncomplete = yes;
              tx.onerror = tx.onabort = () => no(tx.error);
            });
        } finally {
          db.close();
        }
        p.savePrefs({
          ...p.loadPrefs(),
          sourceId: "home",
          follows: [],
          tags: { "youtube:composed": ["Cafe\u0301"], "youtube:decomposed": ["Café"] },
          categories: { "youtube:composed": "Soire\u0301e", "youtube:decomposed": "Soirée" },
        });
      }, mobile);
      for (let attempt = 0; attempt < 100; attempt++) {
        const ready = await page.evaluate(async () => {
          const db = await new Promise((yes, no) => {
            const r = indexedDB.open("reelcase");
            r.onsuccess = () => yes(r.result);
            r.onerror = () => no(r.error);
          });
          try {
            return await new Promise((yes) => {
              const r = db.transaction("activity").objectStore("activity").get("preferences");
              r.onsuccess = () => yes(JSON.stringify(r.result ?? {}).includes("Soirée"));
              r.onerror = () => yes(false);
            });
          } finally {
            db.close();
          }
        });
        if (ready) break;
        if (attempt === 99) throw Error("Preference fixture did not settle");
        await page.waitForTimeout(100);
      }
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await search("cafe\u0301");
      // Keyboard input can replace a query while the real worker rebuilds its 100k index.
      await page.getByRole("button", { name: "Open search", exact: true }).click();
      const input = page.getByRole("searchbox", { name: "Global media search", exact: true });
      await input.fill("Привет");
      await input.press("Enter");
      await results(1);
      await page
        .getByRole("region", { name: "Search ranking and matching tags" })
        .getByText("Привет мир", { exact: true })
        .waitFor();
      const stats = await page.evaluate(() => window.__workerStats);
      report.worker = stats;
      assert(stats.rows >= (mobile ? 10000 : 100000));
      assert(stats.maxBatch <= 512);
      assert(stats.batches >= (mobile ? 20 : 196));
      assert(stats.ready > 0);
      report.worker = stats;
      report.checks.push(
        "Real worker rebuilds a mixed-script 100k/10k index in acknowledged batches, accepts replacement keyboard input, and publishes only the final query",
      );
      await search("CAFÉ");
      await results(2);
      const ranked = page.getByRole("region", { name: "Search ranking and matching tags" });
      assert.equal(await ranked.getByText("Cafe soiree", { exact: true }).count(), 0);
      await search("cafe\u0301");
      await results(2);
      for (const text of ["日本語の映画", "مرحبا", "한국어 영화"]) {
        await search(text);
        await results(1);
      }
      await search('tag:"café" category:"soirée"');
      await results(2);
      report.checks.push(
        "Composed/decomposed accents, Cyrillic, CJK, Arabic and Korean match; unaccented names stay distinct and exact Unicode fields round-trip",
      );
      await search("racign source:youtube duration:600..3600");
      await results(0);
      const correction = spelling.getByRole("button", {
        name: "Try racing instead of racign",
        exact: true,
      });
      await correction.waitFor();
      assert.equal(await spelling.getByRole("button").count(), 1);
      await page.waitForTimeout(300);
      await results(0);
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      await correction.focus();
      await page.keyboard.press("Enter");
      await results(3);
      assert.equal(
        await page.getByLabel("Active search filters", { exact: true }).getByRole("button").count(),
        2,
      );
      report.checks.push(
        "A grounded repeated-title correction is explicit, keyboard accessible, and preserves source/duration filters without silently changing zero results",
      );
      await search("privatesecrex");
      await results(0);
      await page.waitForTimeout(1500);
      assert.equal(await spelling.count(), 0);
      assert(!(await page.locator("main").innerText()).includes("Privatesecret"));
      await search("racign");
      await results(0);
      await spelling.waitFor();
      await search("café");
      await results(2);
      await page.waitForTimeout(700);
      assert.equal(await spelling.count(), 0);
      report.checks.push(
        "Private-only vocabulary never surfaces in the public desk; a replacement Unicode query immediately retires stale correction controls",
      );
      const saved = await page.evaluate(async () => {
        const db = await new Promise((yes, no) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
        try {
          return await new Promise((yes) => {
            const r = db.transaction("videos").objectStore("videos").get("youtube:decomposed");
            r.onsuccess = () => yes(r.result);
          });
        } finally {
          db.close();
        }
      });
      assert.equal(saved.name, "Cafe\u0301 soire\u0301e");
      await page.reload();
      await page.getByRole("button", { name: "Open search", exact: true }).waitFor();
      await search("cafe\u0301");
      await results(2);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(report.errors, []);
      report.checks.push(
        "Reload rebuilds disposable keys while preserving original decomposed catalog spelling, with clean consoles and no horizontal overflow",
      );
    } catch (error) {
      report.error = error.stack;
      await page
        .screenshot({
          path: output.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
      throw error;
    } finally {
      await context.unrouteAll({ behavior: "ignoreErrors" });
      await context.close();
      await writeFile(
        output,
        JSON.stringify(
          {
            ok: reports.every((r) => !r.error),
            reports,
            limitation:
              "Disposable saved metadata and simulated companion/provider responses; no real user library or upstream download.",
          },
          null,
          2,
        ),
      );
    }
  }
} finally {
  await browser.close();
}
