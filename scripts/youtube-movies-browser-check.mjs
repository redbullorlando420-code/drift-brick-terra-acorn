import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/movie-connection-dev.json", [
    resolve("screenshots"),
  ]),
  live = process.argv.includes("--live");
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
const film = (id, title, offer = "Buy or rent") => ({
  id,
  title,
  poster: "https://i.ytimg.com/vi/" + id + "/movieposter.jpg",
  seconds: 7200,
  year: 2024,
  metadata: "Drama • 2024",
  description: "A dedicated provider movie card.",
  offer,
  rating: "PG-13",
  region: "US",
  observedAt: 1794000000000,
});
try {
  for (const mobile of live ? [false] : [false, true]) {
    const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        isMobile: mobile,
        hasTouch: mobile,
        acceptDownloads: true,
      }),
      page = await context.newPage(),
      report = { mobile, live, checks: [], errors: [] };
    reports.push(report);
    page.setDefaultTimeout(live ? 60000 : 25000);
    page.on("pageerror", (e) => report.errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text()))
        report.errors.push(m.text() + " " + m.location().url);
    });
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (window.__movieQuota && k.endsWith("reelcase.youtube-movies.v1"))
          throw Error("Controlled shelf quota");
        return set.call(this, k, v);
      };
    });
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("**/api/network-presence", (r) =>
      r.fulfill({ contentType: "application/json", body: '{"devices":[]}' }),
    );
    let requests = 0,
      deny = false,
      delay = 0;
    if (!live) {
      await context.route("https://i.ytimg.com/**", (r) =>
        r.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="300"><rect width="200" height="300" fill="#263044"/></svg>',
        }),
      );
      await context.route("**/_serverFn/**", async (r) => {
        const body = r.request().postData() ?? "",
          movie = body.includes('"mode"');
        if (!movie)
          return r.fulfill({
            contentType: "application/json",
            body: '{"result":{"channels":[],"profiles":[]},"context":{}}',
          });
        requests++;
        if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
        let response;
        if (deny) response = { error: { message: "Controlled movie outage" } };
        else
          response = {
            result: {
              movies: body.includes('"page"')
                ? [film("abcdefghij2", "Next page film")]
                : body.includes('"search"')
                  ? [film("abcdefghij3", "Dune search film")]
                  : [
                      film("abcdefghij1", "Catalog feature"),
                      film("abcdefghij4", "Free catalog film", "Free with ads"),
                    ],
              next: body.includes('"page"') ? null : "fixture-page",
              shelves: [],
              observedAt: 1794000000000,
            },
            context: {},
          };
        await r
          .fulfill({ contentType: "application/json", body: JSON.stringify(response) })
          .catch(() => {});
      });
    }
    const nav = async () => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: /^Movies(?:\s+\d+)?$/ })
        .click();
      await page.locator("[data-youtube-movies]").waitFor();
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      const desk = page.locator("[data-youtube-movies]");
      if (!live) assert.equal(requests, 0, "no automatic movie polling");
      await desk.getByRole("button", { name: "Load YouTube Movies", exact: true }).click();
      await desk.locator("[data-youtube-movie]").first().waitFor();
      if (live) {
        report.catalog = await desk
          .locator("[data-youtube-movie]")
          .evaluateAll((nodes) =>
            nodes
              .slice(0, 4)
              .map((n) => ({ id: n.getAttribute("data-youtube-movie"), text: n.innerText })),
          );
        report.checks.push(
          "Actual anonymous YouTube catalog returns dedicated films through the running app",
        );
        const more = desk.getByRole("button", { name: /^More:/ }).first();
        if (await more.count()) {
          await more.click();
          await desk.getByRole("button", { name: "Previous movie page", exact: true }).waitFor();
          assert((await desk.locator("[data-youtube-movie]").count()) > 0);
          report.shelfCount = await desk.locator("[data-youtube-movie]").count();
          report.checks.push("Actual movie-only shelf expansion returns further films");
        }
      } else {
        assert.equal(await desk.locator("[data-youtube-movie]").count(), 2);
        await desk.getByLabel("Filter YouTube movies").selectOption("free");
        assert.equal(await desk.locator("[data-youtube-movie]").count(), 1);
        await desk.getByLabel("Filter YouTube movies").selectOption("all");
        const first = desk.locator('[data-youtube-movie="abcdefghij1"]');
        await first.getByRole("button", { name: "Save movie", exact: true }).click();
        await first.getByRole("button", { name: "Remove saved movie", exact: true }).waitFor();
        const stored = await page.evaluate(() =>
          JSON.parse(localStorage.getItem("reelcase.youtube-movies.v1")),
        );
        assert.equal(stored.movies[0].watchedAt, undefined);
        assert.equal(
          await first.getByRole("link", { name: "Open on YouTube" }).getAttribute("href"),
          "https://www.youtube.com/watch?v=abcdefghij1",
        );
        // Exercise the actual anchor without navigating to an account or purchase flow.
        await context.route("https://www.youtube.com/watch**", (r) =>
          r.fulfill({ contentType: "text/html", body: "<p>Official external watch handoff</p>" }),
        );
        const popupPromise = context.waitForEvent("page");
        await first.getByRole("link", { name: "Open on YouTube" }).click();
        const popup = await popupPromise;
        await popup.waitForLoadState();
        await popup.close();
        assert.equal(
          await page.evaluate(
            () =>
              JSON.parse(localStorage.getItem("reelcase.youtube-movies.v1")).movies[0].watchedAt,
          ),
          undefined,
        );
        await desk.getByRole("button", { name: "Next movie page", exact: true }).click();
        await desk.getByRole("heading", { name: "Next page film", exact: true }).waitFor();
        await desk.getByRole("button", { name: "Previous movie page", exact: true }).click();
        await desk.getByRole("heading", { name: "Catalog feature", exact: true }).waitFor();
        report.checks.push(
          "Catalog loads explicitly, film/offer filters work, next/previous preserve pages, external opening leaves watched state alone",
        );
      }
      await desk.getByRole("button", { name: "Search films", exact: true }).click();
      await desk.getByLabel("YouTube film title", { exact: true }).fill("Dune");
      await desk.getByRole("button", { name: "Find films", exact: true }).click();
      await desk.locator("[data-youtube-movie]").first().waitFor();
      if (live) {
        report.search = await desk.locator("[data-youtube-movie]").count();
        assert(report.search > 0);
        report.checks.push("Actual Movies-filter search returns film cards for Dune");
        await desk.locator("[data-youtube-movie]").first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: output.replace(".json", "-live.png") });
      } else {
        await desk.getByRole("heading", { name: "Dune search film", exact: true }).waitFor();
        deny = true;
        await desk.getByLabel("YouTube film title", { exact: true }).fill("Provider failure");
        await desk.getByRole("button", { name: "Find films", exact: true }).click();
        await desk.getByRole("alert").waitFor();
        await desk.getByRole("heading", { name: "Dune search film", exact: true }).waitFor();
        deny = false;
        await desk.getByRole("button", { name: "Retry movie request", exact: true }).click();
        await desk.getByRole("button", { name: "Find films", exact: true }).waitFor();
        delay = 500;
        await desk.getByLabel("YouTube film title", { exact: true }).fill("Slow query");
        await desk.getByRole("button", { name: "Find films", exact: true }).click();
        await desk.getByRole("button", { name: "Cancel movie request", exact: true }).click();
        await page.waitForTimeout(650);
        await desk.getByRole("heading", { name: "Dune search film", exact: true }).waitFor();
        delay = 0;
        await page.evaluate(() => (window.__movieQuota = true));
        await desk.getByRole("button", { name: "Save movie", exact: true }).click();
        await desk.getByText("Controlled shelf quota", { exact: true }).waitFor();
        assert.equal(
          await page.evaluate(
            () => JSON.parse(localStorage.getItem("reelcase.youtube-movies.v1")).movies.length,
          ),
          1,
        );
        await page.evaluate(() => (window.__movieQuota = false));
        await desk.getByRole("button", { name: "Save movie", exact: true }).click();
        await desk.getByRole("button", { name: "Remove saved movie", exact: true }).waitFor();
        await desk.getByRole("button", { name: /^Saved movies/ }).click();
        await desk.getByLabel("Search saved movies").fill("Catalog");
        await desk.getByRole("heading", { name: "Catalog feature", exact: true }).waitFor();
        assert.equal(await desk.locator("[data-youtube-movie]").count(), 1);
        await desk.getByLabel("Search saved movies").fill("");
        await desk
          .locator('[data-youtube-movie="abcdefghij1"]')
          .getByRole("button", { name: "Mark watched manually", exact: true })
          .click();
        await page.reload();
        await page.locator('[data-home-ready="true"]').waitFor();
        await nav();
        await desk.getByRole("button", { name: /^Saved movies/ }).click();
        await desk
          .locator('[data-youtube-movie="abcdefghij1"]')
          .getByRole("button", { name: "Undo watched mark", exact: true })
          .waitFor();
        const downloadPromise = page.waitForEvent("download");
        await desk.getByRole("button", { name: "Export movie shelf", exact: true }).click();
        const download = await downloadPromise;
        assert.equal(download.suggestedFilename(), "youtube-movie-shelf.txt");
        const stream = await download.createReadStream();
        let exported = "";
        for await (const c of stream) exported += c;
        assert(exported.includes("https://www.youtube.com/watch?v=abcdefghij1"));
        assert(exported.includes("Manually marked watched"));
        await desk
          .locator('[data-youtube-movie="abcdefghij1"]')
          .getByRole("button", { name: "Remove saved movie", exact: true })
          .click();
        await page.reload();
        await page.locator('[data-home-ready="true"]').waitFor();
        await nav();
        await desk.getByRole("button", { name: /^Saved movies/ }).click();
        assert.equal(await desk.locator('[data-youtube-movie="abcdefghij1"]').count(), 0);
        await desk.getByRole("button", { name: "Undo shelf change", exact: true }).click();
        await desk.locator('[data-youtube-movie="abcdefghij1"]').waitFor();
        report.checks.push(
          "Search, provider failure/retry, stale cancellation, quota rollback/recovery, saved search, watch marks, export, reload and persistent undo work",
        );
        // Separate document binds storage to another profile; Default data must not leak.
        await page.evaluate(async () => {
          const id = "p-12345678-1234-1234-1234-123456789012";
          await new Promise((yes, no) => {
            const r = indexedDB.open("realhub-local-profiles", 1);
            r.onupgradeneeded = () => r.result.createObjectStore("control");
            r.onerror = () => no(r.error);
            r.onsuccess = () => {
              const db = r.result,
                tx = db.transaction("control", "readwrite");
              tx.objectStore("control").put(
                {
                  version: 1,
                  revision: 1,
                  profiles: [{ id, name: "Movie alternate", createdAt: 1 }],
                },
                "registry",
              );
              tx.oncomplete = () => {
                db.close();
                yes();
              };
              tx.onerror = () => no(tx.error);
            };
          });
          sessionStorage.setItem("realhub.active-local-profile.v1", id);
        });
        await page.reload();
        await page.locator('[data-home-ready="true"]').waitFor();
        await nav();
        await desk.getByRole("button", { name: /^Saved movies/ }).click();
        assert.equal(await desk.locator("[data-youtube-movie]").count(), 0);
        await page.evaluate(() =>
          sessionStorage.setItem("realhub.active-local-profile.v1", "default"),
        );
        await page.reload();
        await page.locator('[data-home-ready="true"]').waitFor();
        await nav();
        await desk.getByRole("button", { name: /^Saved movies/ }).click();
        await desk.locator('[data-youtube-movie="abcdefghij1"]').waitFor();
        report.checks.push(
          "Alternate profile cannot read Default movie shelf; returning retains saved state",
        );
        const originalShelf = await page.evaluate(() =>
          localStorage.getItem("reelcase.youtube-movies.v1"),
        );
        await page.evaluate(() => {
          const key = "reelcase.youtube-movies.v1",
            value = JSON.parse(localStorage.getItem(key));
          value.movies[0].title = "Other tab movie edit";
          localStorage.setItem(key, JSON.stringify(value));
        });
        await desk
          .locator('[data-youtube-movie="abcdefghij1"]')
          .getByRole("button", { name: "Remove saved movie", exact: true })
          .click();
        await desk
          .getByText("Settings changed in another tab. Reload before saving.", { exact: true })
          .waitFor();
        await desk.getByRole("button", { name: "Reload saved movies", exact: true }).click();
        await desk.getByRole("heading", { name: "Other tab movie edit", exact: true }).waitFor();
        await page.evaluate(() => {
          const key = "reelcase.youtube-movies.v1",
            value = JSON.parse(localStorage.getItem(key));
          value.version = 2;
          localStorage.setItem(key, JSON.stringify(value));
        });
        await desk.getByRole("button", { name: "Reload saved movies", exact: true }).click();
        await desk
          .getByRole("alert")
          .filter({ hasText: "Unsupported saved movie shelf" })
          .waitFor();
        assert(
          await desk
            .getByRole("button", { name: "Remove saved movie", exact: true })
            .first()
            .isDisabled(),
        );
        await page.evaluate(
          (value) => localStorage.setItem("reelcase.youtube-movies.v1", value),
          originalShelf,
        );
        await desk.getByRole("button", { name: "Reload saved movies", exact: true }).click();
        await desk.getByRole("heading", { name: "Catalog feature", exact: true }).waitFor();
        assert.equal(await desk.getByRole("alert").count(), 0);
        report.checks.push(
          "Concurrent edits and future schemas preserve prior data; explicit reload recovers without overwriting another tab",
        );
        await desk.scrollIntoViewIfNeeded();
        await page.screenshot({
          path: output.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
        });
      }
      assert.equal(await page.locator("[data-youtube-movies] iframe").count(), 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(report.errors, []);
      report.checks.push("No hidden players, uncaught console errors or horizontal overflow");
    } catch (e) {
      report.error = e.stack;
      await page
        .screenshot({
          path: output.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
      throw e;
    } finally {
      await context.unrouteAll({ behavior: "ignoreErrors" });
      await context.close();
      await writeFile(
        output,
        JSON.stringify(
          {
            ok: reports.every((r) => !r.error),
            reports,
            limitation: live
              ? "Anonymous catalog/search observations only. No purchases, entitlement verification or film playback."
              : "Disposable profile fixtures; real provider availability checked separately.",
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
