import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/personal-desks-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0personal-desks-fixture",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "fixture",
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) =>
          id === entry
            ? ["src/lib/videos/persist.ts", "src/lib/local-profiles.ts"]
                .map(
                  (file) =>
                    "export * from " + JSON.stringify(resolve(file).replaceAll("\\", "/")) + ";",
                )
                .join("\n")
            : undefined,
      },
    ],
  });
const generated = await bundle.generate({ format: "esm" });
await bundle.close();
const code = generated.output.find((r) => r.type === "chunk").code;
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
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => report.errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) report.errors.push(m.text());
    });
    await context.route("**/__desks-fixture.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__desks-blank.html", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: "<!doctype html><p>Disposable personal desks fixture</p>",
      }),
    );
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("**/_serverFn/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: '{"result":{"channels":[],"profiles":[]},"context":{}}',
      }),
    );
    await context.addInitScript(() => {
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (k === "reelcase.desk-layouts.v1" && sessionStorage.getItem("qa-layout-quota"))
          throw new DOMException("Controlled quota", "QuotaExceededError");
        return set.call(this, k, v);
      };
    });
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      const scope = mobile ? page.getByRole("dialog") : page.locator("aside");
      if (name === "Stats") {
        const group = scope.locator('button[aria-controls$="-tools"]');
        if ((await group.getAttribute("aria-expanded")) === "false") await group.click();
      }
      await scope.getByRole("button", { name: new RegExp("^" + name + "(?:\\s|$)") }).click();
    };
    const layout = () => page.locator("[data-desk-layout]");
    const openLayout = async () => {
      await layout().locator("summary").click();
      await layout()
        .getByRole("button", { name: "Save current desk layout", exact: true })
        .waitFor();
    };
    try {
      await page.goto(new URL("/__desks-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__desks-fixture.mjs");
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem("reelcase.pull-settings.v1", '{"automaticPulls":false}');
        localStorage.setItem("reelcase.artwork-mode", "text");
        localStorage.setItem(
          "reelcase.sidebar.groups.v1",
          JSON.stringify({ library: true, workspace: true, tools: true }),
        );
        const row = (kind, i) => ({
          id: kind + "-" + i,
          name: "Science video " + kind + " " + i,
          folderId: "qa-" + kind,
          path: kind + "-" + i,
          extension: "mp4",
          mime: "video/mp4",
          size: 100,
          duration: 1800,
          addedAt: 1,
          remote: { kind, videoId: kind + "-" + i, channelName: "Fixture creator" },
        });
        await p.appendCatalogVideos([
          ...Array.from({ length: 8 }, (_, i) => row("youtube", i)),
          ...Array.from({ length: 6 }, (_, i) => row("twitch", i)),
        ]);
        p.savePrefs({ ...p.loadPrefs(), sourceId: "home", follows: [] });
        await p.waitForPrefsWrites();
        await p.saveRemoteSnapshot({
          videos: [],
          folders: [
            { id: "qa-youtube", name: "YouTube fixture", kind: "youtube", videoCount: 8 },
            { id: "qa-twitch", name: "Twitch fixture", kind: "twitch", videoCount: 6 },
          ],
          checkedAt: 1,
        });
        await p.saveAnimeReviews({
          version: 1,
          updatedAt: 1,
          series: {
            "anime:fixture": {
              id: "anime:fixture",
              title: "Fixture anime",
              release: "Owner reviewed edition",
              aliases: [],
              ranges: [],
              policy: { numbering: "season", threshold: 0.95, specials: false },
              at: 1,
            },
          },
          episodes: {
            "youtube-0": {
              seriesId: "anime:fixture",
              numbering: "season",
              season: 1,
              episode: 1,
              kind: "episode",
              preferred: true,
              at: 1,
            },
          },
        });
        sessionStorage.setItem(
          "qa-other-profile",
          (await p.createLocalProfile("Personal desks alternate")).id,
        );
      });
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("YouTube");
      await page.getByRole("button", { name: "List view", exact: true }).click();
      await page
        .getByRole("button", { name: "Explore recommendations and full catalog", exact: true })
        .click();
      await openLayout();
      await layout()
        .getByText(/Current: list · recommendations expanded/)
        .waitFor();
      await layout().getByRole("button", { name: "Save current desk layout", exact: true }).click();
      const saved = await page.evaluate(() => localStorage.getItem("reelcase.desk-layouts.v1"));
      await nav("Movies");
      await page.getByRole("button", { name: "Grid view", exact: true }).click();
      await openLayout();
      await layout().getByRole("button", { name: "Save current desk layout", exact: true }).click();
      await nav("YouTube");
      await openLayout();
      await layout()
        .getByText(/Current: list · recommendations expanded/)
        .waitFor();
      await page.evaluate(() => sessionStorage.setItem("qa-layout-quota", "true"));
      await layout().getByRole("button", { name: "Reset this desk layout", exact: true }).click();
      await layout().getByRole("alert").waitFor();
      await layout()
        .getByText(/Current: list/)
        .waitFor();
      await page.evaluate(() => sessionStorage.removeItem("qa-layout-quota"));
      await layout().getByRole("button", { name: "Reset this desk layout", exact: true }).click();
      await layout()
        .getByText(/Current: grid · recommendations collapsed/)
        .waitFor();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("YouTube");
      await openLayout();
      await layout().getByRole("button", { name: "Undo desk layout change", exact: true }).click();
      await layout()
        .getByText(/Current: list · recommendations expanded/)
        .waitFor();
      assert.equal(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("reelcase.desk-layouts.v1")).desks.movies.view,
        ),
        "grid",
      );
      await layout().scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}-layout.png`),
      });
      report.checks.push(
        "Different saved YouTube/Movies layouts restore on entry; quota rollback preserves UI; desk reset and undo survive reload",
      );
      await nav("Stats");
      const tableButton = page.getByRole("button", {
        name: "Read Provider mix data table",
        exact: true,
      });
      await tableButton.click();
      const dialog = page.getByRole("dialog");
      await dialog
        .getByRole("heading", { name: "Provider mix · data table", exact: true })
        .waitFor();
      assert.equal(
        await dialog.getByRole("row").filter({ hasText: "YouTube" }).getByRole("cell").innerText(),
        "8",
      );
      assert.equal(
        await dialog.getByRole("row").filter({ hasText: "Twitch" }).getByRole("cell").innerText(),
        "6",
      );
      await page.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}-stats.png`),
      });
      await page.keyboard.press("Escape");
      await tableButton.focus();
      await page.keyboard.press("Enter");
      await dialog.waitFor();
      await dialog.getByRole("button", { name: "Close data table", exact: true }).click();
      assert(await tableButton.evaluate((el) => document.activeElement === el));
      report.checks.push(
        "Stats data table matches plotted provider counts, opens by keyboard and returns focus without hover or animation",
      );
      await nav("Anime");
      const watch = page.locator("[data-anime-watchlist]");
      await watch.locator("summary").click();
      await watch.getByLabel("Release series", { exact: true }).selectOption("anime:fixture");
      await watch.getByLabel("Release episode", { exact: true }).fill("2");
      await watch
        .getByLabel("Expected release time", { exact: true })
        .fill("2026-10-01T20:00:00-04:00");
      await watch.getByLabel("Release time zone", { exact: true }).fill("America/New_York");
      await watch.getByText("Remind me here when due", { exact: true }).check();
      await watch.getByRole("button", { name: "Save release observation", exact: true }).click();
      const release = watch.locator("[data-release-id]");
      await release.getByText(/Reminder due here/).waitFor();
      await release.getByText(/Expected only/).waitFor();
      await release.getByRole("button", { name: "Edit release", exact: true }).click();
      await watch.getByText("Postponed (no due reminder)", { exact: true }).check();
      await watch.getByRole("button", { name: "Save release observation", exact: true }).click();
      assert.equal(await release.count(), 1);
      assert.equal(await release.getByText(/Reminder due here/).count(), 0);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Anime");
      await watch.locator("summary").click();
      await release.getByText(/Postponed/).waitFor();
      await release.getByRole("button", { name: "Edit release", exact: true }).click();
      await watch.getByLabel("Release episode", { exact: true }).fill("1");
      await watch.getByText("Postponed (no due reminder)", { exact: true }).uncheck();
      await watch.getByRole("button", { name: "Save release observation", exact: true }).click();
      await release.getByText(/Available: matching reviewed library observation/).waitFor();
      assert.equal(await release.getByText(/Reminder due here/).count(), 0);
      await watch.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}-watchlist.png`),
      });
      await release.getByRole("button", { name: "Edit release", exact: true }).click();
      await watch.getByLabel("Expected release time", { exact: true }).fill("2026-11-01T01:30");
      await watch.getByRole("button", { name: "Save release observation", exact: true }).click();
      await watch.getByRole("alert").waitFor();
      assert.equal(await release.count(), 1);
      report.checks.push(
        "Expected due reminder never implies availability; postponed/edit replaces one identity; reload persists; only reviewed available episode shows available; ambiguous time is rejected",
      );
      await page.evaluate(() => {
        localStorage.setItem("reelcase.desk-layouts.v1", '{"version":9,"desks":{}}');
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("YouTube");
      await openLayout();
      await layout().getByRole("button", { name: "Save current desk layout", exact: true }).click();
      await layout().getByRole("alert").waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.desk-layouts.v1")),
        '{"version":9,"desks":{}}',
      );
      await page.evaluate(() =>
        sessionStorage.setItem(
          "realhub.active-local-profile.v1",
          sessionStorage.getItem("qa-other-profile"),
        ),
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Anime");
      await watch.locator("summary").click();
      assert.equal(await watch.locator("[data-release-id]").count(), 0);
      report.checks.push(
        "Future layout schema retains bytes and usable desk; alternate profile contains no previous watchlist",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),
        false,
      );
      assert.deepEqual(report.errors, []);
    } catch (e) {
      report.failure = e.stack ?? String(e);
      await page.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}-failure.png`),
      });
      throw e;
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(
    output,
    JSON.stringify(
      {
        ok: reports.length === 2 && reports.every((r) => !r.failure && !r.errors.length),
        reports,
        limitation:
          "Disposable saved metadata and browser viewports. No physical screen-reader session, background reminder delivery, or real media playback is claimed.",
      },
      null,
      2,
    ),
  );
}
console.log(JSON.stringify({ ok: true, output }));
