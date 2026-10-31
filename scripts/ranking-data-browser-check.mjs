import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/ranking-data-dev.json", [
    resolve("screenshots"),
  ]);
// The latency probe executes the production slice implementation against a
// controlled 100k-row workload, without adding a test route to the product.
const source = (await readFile("src/lib/ranking-budget.ts", "utf8"))
  .replace(/^import .*;\r?\n/gm, "")
  .replace(/^export /gm, "");
const probe = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None },
}).outputText;
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        isMobile: mobile,
        hasTouch: mobile,
        acceptDownloads: true,
      }),
      page = await context.newPage(),
      errors = [],
      checks = [],
      report = { mobile, errors, checks };
    reports.push(report);
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) errors.push(m.text());
    });
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.debug-panel", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
    });
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("**/_serverFn/accounting-fixture", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ fixture: true, padding: "a".repeat(1000) }),
      }),
    );
    await context.route("https://artwork.invalid/**", (r) =>
      r.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"><rect width="2" height="2" fill="green"/></svg>',
      }),
    );
    const nav = async (label) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + label + "(?:\\s+\\d+)?$") })
        .click();
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(async () => {
        const now = Date.now();
        localStorage.setItem(
          "reelcase.follows.v1",
          JSON.stringify({
            channels: [
              {
                id: "tw:budget",
                kind: "twitch",
                handle: "budget",
                title: "Budget fixture",
                channelId: "1",
              },
            ],
            savedAt: now,
          }),
        );
        const db = await new Promise((r, j) => {
          const q = indexedDB.open("reelcase");
          q.onsuccess = () => r(q.result);
          q.onerror = () => j(q.error);
        });
        await new Promise((r, j) => {
          const tx = db.transaction("remote-cache", "readwrite"),
            s = tx.objectStore("remote-cache");
          s.put({ folders: [], checkedAt: now }, "meta");
          for (let i = 0; i < 1200; i++) {
            const v = {
              id: "tw:v:" + i,
              folderId: "tw:budget",
              name: "Racing session " + i,
              path: "twitch/" + i,
              extension: "vod",
              mime: "video/twitch",
              size: 0,
              addedAt: now - i * 60000,
              genre: "Racing",
              remote: {
                kind: "twitch",
                videoId: String(i),
                channelId: "1",
                channelName: "Budget fixture",
                live: false,
              },
            };
            s.put(v, "video:" + v.id);
          }
          tx.oncomplete = r;
          tx.onerror = () => j(tx.error);
        });
        db.close();
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Twitch");
      await page
        .getByRole("button", { name: "Explore Twitch recommendations", exact: true })
        .click();
      await page.getByRole("heading", { name: "Recommended Twitch VODs", exact: true }).waitFor();
      await page.waitForTimeout(800);
      await nav("Settings");
      const panel = page.getByRole("region", { name: "Save Data and transfers", exact: true });
      await panel.waitFor();
      await panel.getByRole("button", { name: "Save Data", exact: true }).click();
      await panel.getByText("Optional prefetch paused", { exact: true }).waitFor();
      assert.equal(
        await panel
          .getByRole("button", { name: "Save Data", exact: true })
          .getAttribute("aria-pressed"),
        "true",
      );
      checks.push("Save Data controls pause optional work and have accessible selected state");
      await page.evaluate(async () => {
        await fetch("/_serverFn/accounting-fixture");
        await new Promise((r) => {
          const image = new Image();
          image.onload = r;
          image.onerror = r;
          image.src = "https://artwork.invalid/accounting-secret-token.svg";
          document.body.append(image);
        });
      });
      await page.waitForTimeout(100);
      await panel.getByRole("button", { name: "Refresh transfer summary", exact: true }).click();
      const summary = await panel.innerText();
      assert(summary.includes("App metadata"));
      assert(summary.includes("Artwork"));
      assert(summary.includes("unmeasured"));
      assert(!summary.includes("accounting-secret-token"));
      checks.push(
        "Observed transfer summary separates measured and unknown totals without recording resource URLs",
      );
      const score = page.getByRole("region", { name: "Performance scorecard", exact: true });
      await score.getByRole("button", { name: "Refresh scorecard", exact: true }).click();
      const dw = page.waitForEvent("download");
      await score.getByRole("button", { name: "Export measurements", exact: true }).click();
      const download = await dw,
        data = JSON.parse(await readFile(await download.path(), "utf8"));
      assert(
        data.ranking.samples.some(
          (s) => s.kind === "twitch" && s.outcome === "complete" && s.rows >= 2400,
        ),
      );
      assert.equal(data.ranking.active, 0);
      assert(data.ranking.samples.length <= 32);
      checks.push(
        "Real Twitch recommendation path completes with bounded preparation timings in diagnostic export",
      );
      report.ranking = data.ranking;
      await panel.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Settings");
      await panel.getByText("Optional prefetch paused", { exact: true }).waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.data-saver.v1")),
        "save-data",
      );
      await panel.getByRole("button", { name: "Follow device", exact: true }).click();
      await panel.getByText("Optional prefetch allowed", { exact: true }).waitFor();
      checks.push("Saved mode survives reload and optional work can be enabled again");
      await page.evaluate((code) => {
        const harness = new Function(
          "yieldCatalogTask",
          code + ";return {createRankingPass,rankingBudgetSnapshot};",
        )(() => new Promise((r) => setTimeout(r, 0)));
        const rows = Array.from({ length: 100000 }, (_, i) => i),
          pass = harness.createRankingPass("youtube", new AbortController().signal);
        let checksum = 0,
          finished = false,
          beats = 0,
          worst = 0,
          last = performance.now();
        const timer = setInterval(() => {
          const n = performance.now();
          worst = Math.max(worst, n - last);
          last = n;
          beats++;
        }, 16);
        const work = pass
          .visit(rows, (row) => {
            let value = row;
            for (let n = 0; n < 150; n++) value = Math.imul(value ^ n, 31);
            checksum = (checksum + value) | 0;
          })
          .then(() => {
            finished = true;
            pass.finish();
          });
        const button = document.createElement("button");
        button.textContent = "Ranking input probe";
        Object.assign(button.style, {
          position: "fixed",
          top: "12px",
          right: "12px",
          zIndex: "99999",
          minHeight: "44px",
          background: "white",
          color: "black",
        });
        document.body.append(button);
        let responded = false;
        button.onclick = () => {
          responded = true;
        };
        window.__packingProbe = work.then(() => {
          clearInterval(timer);
          button.remove();
          return {
            finished,
            responded,
            beats,
            worstHeartbeatMs: worst,
            checksum,
            sample: harness.rankingBudgetSnapshot().samples.at(-1),
          };
        });
      }, probe);
      await page.getByRole("button", { name: "Ranking input probe", exact: true }).click();
      report.latency = await page.evaluate(() => window.__packingProbe);
      assert.equal(report.latency.sample.rows, 100000);
      assert(report.latency.responded && report.latency.finished);
      assert(report.latency.beats > 0);
      assert(
        report.latency.worstHeartbeatMs < 100,
        "100k packing heartbeat exceeded declared 100ms desktop-emulation bound",
      );
      checks.push(
        "100k instrumented packing keeps a 16ms input heartbeat below the declared 100ms gap limit",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
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
              "Isolated 1,200-row Twitch UI fixture plus 100k packing workload using the production slice helper. Desktop/mobile Chromium emulation; not a physical phone, full-library heap or real provider-throughput benchmark.",
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
console.log(JSON.stringify({ ok: true, reports }, null, 2));
