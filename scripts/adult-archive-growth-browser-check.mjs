import assert from "node:assert/strict";
import { chromium } from "playwright";
import { fromJSON } from "seroval";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  out = checkedOutputPath(process.argv[3] ?? "screenshots/adult-growth-dev.json", [
    resolve("screenshots"),
  ]);
const find = (v, p) => {
  if (!v || typeof v !== "object") return;
  if (p(v)) return v;
  for (const child of Object.values(v)) {
    const match = find(child, p);
    if (match) return match;
  }
};
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
      requests = [],
      checks = [];
    const report = { mobile, checks, errors, requests };
    reports.push(report);
    page.on("pageerror", (e) => errors.push(e.message));
    let fail = false;
    await context.addInitScript(() => {
      if (!localStorage.getItem("adult-growth-seeded")) {
        localStorage.setItem("reelcase.pulls-paused.v1", "false");
        localStorage.setItem("reelcase.artwork-mode", "text");
        localStorage.setItem(
          "reelcase.pull-settings.v1",
          JSON.stringify({
            automaticPulls: false,
            adultBatchVideos: 600,
            adultCatalogTarget: 10000,
            adultMaxEntries: 10000,
            remoteMaxEntries: 200000,
            requestGapMs: 250,
            adultAutoCleanup: false,
          }),
        );
        localStorage.setItem(
          "reelcase.adult-archive-cursors.v1",
          JSON.stringify({
            "eporner::all::latest": {
              paging: 2,
              page: 11,
              offset: 50,
              query: "all",
              order: "latest",
              updatedAt: 1,
            },
            "eporner::all::most-popular": {
              paging: 2,
              page: 99,
              offset: 0,
              query: "all",
              order: "most-popular",
              updatedAt: 1,
            },
          }),
        );
        localStorage.setItem("adult-growth-seeded", "true");
      }
    });
    await context.route("**/_serverFn/**", async (route) => {
      let payload;
      try {
        payload = fromJSON(JSON.parse(route.request().postData() ?? "{}"));
      } catch {}
      const data = find(
        payload,
        (v) => v.query === "all" && Array.isArray(v.providers) && typeof v.maxVideos === "number",
      );
      let result = {};
      if (data) {
        const start = data.providerPages?.eporner ?? data.page ?? 1,
          offset = data.providerOffsets?.eporner ?? 0;
        requests.push({ page: start, offset, limit: data.maxVideos, order: data.order, fail });
        const next = offset + data.maxVideos;
        result = {
          videos: fail
            ? []
            : Array.from({ length: data.maxVideos }, (_, i) => {
                const id = String((start - 1) * 1000 + offset + i);
                return {
                  id: "eporner:" + id,
                  folderId: "eporner:discover",
                  name: "Archive fixture " + id,
                  path: "fixture/" + id,
                  extension: "eporner",
                  mime: "video/eporner",
                  size: 0,
                  addedAt: 0,
                  duration: 900,
                  remote: {
                    kind: "eporner",
                    videoId: id,
                    channelName: "Fixture source",
                    embedUrl: "https://www.eporner.com/embed/" + id + "/",
                    watchUrl: "https://www.eporner.com/video-" + id + "/",
                  },
                };
              }),
          source: "eporner",
          note: "Controlled metadata only",
          page: start,
          nextPage: start,
          totalCount: 100000,
          providers: ["eporner"],
          providerNextPages: fail ? {} : { eporner: next >= 1000 ? start + 1 : start },
          providerNextOffsets: fail ? {} : { eporner: next >= 1000 ? 0 : next },
          providerDiagnostics: [
            {
              provider: "eporner",
              status: fail ? "failed" : "loaded",
              titles: fail ? 0 : data.maxVideos,
              detail: fail ? "Fixture unavailable" : "Controlled archive window",
            },
          ],
          partial: fail,
        };
      }
      return route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ result, context: {} }),
      });
    });
    const ready = () => page.locator('[data-home-ready="true"]').waitFor();
    async function nav(name) {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    }
    async function open() {
      await nav("Adults");
      await page.getByRole("button", { name: /^(Expand|Minimize) Adult discovery$/ }).waitFor();
      const expand = page.getByRole("button", { name: "Expand Adult discovery", exact: true });
      if (await expand.isVisible()) await expand.click();
      const progress = page.locator('details[aria-label="Adult archive progress"]');
      await progress.locator("summary").click();
      return progress;
    }
    try {
      await page.goto(url);
      await ready();
      await page.evaluate(async () => {
        const db = await new Promise((yes, no) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
        try {
          for (let first = 0; first < 10050; first += 500)
            await new Promise((yes, no) => {
              const tx = db.transaction("videos", "readwrite");
              for (let i = first; i < Math.min(first + 500, 10050); i++)
                tx.objectStore("videos").put({
                  id: "eporner:" + i,
                  folderId: "eporner:discover",
                  name: "Saved fixture " + i,
                  path: "fixture/" + i,
                  extension: "eporner",
                  mime: "video/eporner",
                  size: 0,
                  addedAt: 0,
                  remote: { kind: "eporner", videoId: String(i), channelName: "Fixture source" },
                });
              tx.oncomplete = yes;
              tx.onerror = () => no(tx.error);
            });
        } finally {
          db.close();
        }
      });
      await page.reload();
      await ready();
      await page.getByText("10,050 indexed", { exact: true }).waitFor();
      let progress = await open();
      await progress.getByText(/Automatic goal:/).waitFor();
      await page.evaluate(() => {
        window.__nativeSetItem = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
          if (key === "reelcase.pull-settings.v1")
            throw new DOMException("Controlled settings quota", "QuotaExceededError");
          return window.__nativeSetItem.call(this, key, value);
        };
      });
      await progress
        .getByRole("button", { name: "Allow up to 100,000 Adults entries", exact: true })
        .click();
      await progress.getByRole("status").filter({ hasText: "could not save" }).waitFor();
      assert.equal(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("reelcase.pull-settings.v1")).adultCatalogTarget,
        ),
        10000,
      );
      await page.evaluate(() => {
        Storage.prototype.setItem = window.__nativeSetItem;
      });
      await page.reload();
      await ready();
      progress = await open();
      checks.push(
        "Quota failure preserves saved limits and clearly labels the higher goal as tab-only",
      );
      await progress
        .getByRole("button", { name: "Allow up to 100,000 Adults entries", exact: true })
        .click();
      await progress.getByRole("status").filter({ hasText: "at least 100,000" }).waitFor();
      const settings = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("reelcase.pull-settings.v1")),
      );
      assert.equal(settings.adultCatalogTarget, 100000);
      assert.equal(settings.adultMaxEntries, 100000);
      assert.equal(settings.requestGapMs, 250);
      assert.equal(settings.remoteMaxEntries, 200000);
      assert.equal(settings.automaticPulls, false);
      checks.push(
        "10k saved goal/cap are visible; explicit growth action retains shared limit, pace and disabled automatic pulls",
      );
      await page.getByRole("button", { name: "Eporner only", exact: true }).click();
      await page.getByRole("button", { name: "Latest", exact: true }).click();
      await page.getByRole("button", { name: "Continue archive", exact: true }).click();
      await progress.locator("summary").filter({ hasText: "10,650 saved entries" }).waitFor();
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("reelcase.adult-archive-cursors.v1"))[
            "eporner::all::latest"
          ].offset === 650,
      );
      assert.deepEqual(
        requests.map((r) => [r.page, r.offset, r.limit, r.order]),
        [
          [11, 50, 400, "latest"],
          [11, 450, 200, "latest"],
        ],
      );
      let cursors = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("reelcase.adult-archive-cursors.v1")),
      );
      assert.equal(cursors["eporner::all::most-popular"].page, 99);
      assert.equal(cursors["eporner::all::latest"].added, 200);
      checks.push(
        "Real store adds 600 distinct records above 10k in 400/200 windows and preserves other sort positions",
      );
      await page.reload();
      await ready();
      progress = await open();
      await progress.locator("summary").filter({ hasText: "10,650 saved entries" }).waitFor();
      await page.getByRole("button", { name: "Eporner only", exact: true }).click();
      await page.getByRole("button", { name: "Latest", exact: true }).click();
      fail = true;
      await page.getByRole("button", { name: "Continue archive", exact: true }).click();
      await progress.getByText(/last request failed; cursor kept/).waitFor();
      const failureNotice=page.getByText('Some providers could not finish. Saved titles and resume positions were kept.',{exact:true});
      await failureNotice.waitFor();
      cursors = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("reelcase.adult-archive-cursors.v1")),
      );
      assert.equal(cursors["eporner::all::latest"].page, 11);
      assert.equal(cursors["eporner::all::latest"].offset, 650);
      assert.equal(cursors["eporner::all::latest"].state, "failed");
      await progress.locator("summary").filter({ hasText: "10,650 saved entries" }).waitFor();
      checks.push(
        "Reload retains accepted records/cursors; failed continuation retains depth and shows retry state",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      await failureNotice.waitFor({state:'hidden'});
      await progress.scrollIntoViewIfNeeded();
      await progress.screenshot({
        path: out.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      report.ok = true;
    } catch (e) {
      report.error = String(e);
      await page
        .screenshot({
          path: out.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
      throw e;
    } finally {
      await context.close();
      await writeFile(
        out,
        JSON.stringify(
          {
            ok: reports.every((r) => r.ok),
            reports,
            limitation:
              "Disposable profiles with synthetic metadata and controlled provider responses. No live provider depth or eight-hour soak is claimed.",
          },
          null,
          2,
        ),
      );
    }
  }
  console.log(JSON.stringify({ ok: true, reports }));
} finally {
  await browser.close();
}
