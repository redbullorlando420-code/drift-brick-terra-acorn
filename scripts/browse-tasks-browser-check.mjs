import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/browse-tasks-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0browse-task-fixture";
const bundle = await rolldown({
  input: entry,
  resolve: { alias: { "@": resolve("src") } },
  plugins: [
    {
      name: "browse-task-fixture",
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
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => report.errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) report.errors.push(m.text());
    });
    await context.route("**/__browse-fixture.mjs", (route) =>
      route.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__browse-blank.html", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Disposable browse fixture</title><p>Fixture</p>",
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
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (
          key === "reelcase.browse-bookmarks.v1" &&
          sessionStorage.getItem("qa-places-quota") === "true"
        )
          throw new DOMException("Controlled quota", "QuotaExceededError");
        return set.call(this, key, value);
      };
    });
    const dialog = page.getByRole("dialog");
    const openPlaces = async () => {
      await page.getByRole("button", { name: "Saved places", exact: true }).click();
      await dialog.getByRole("heading", { name: "Saved places", exact: true }).waitFor();
    };
    const close = () => dialog.getByRole("button", { name: "Close", exact: true }).click();
    const search = async (text) => {
      await page.getByRole("button", { name: "Open search", exact: true }).click();
      const input = page.getByRole("searchbox", { name: "Global media search", exact: true });
      await input.fill(text);
      await input.press("Enter");
      await page
        .getByLabel("Search count evidence", { exact: true })
        .getByText(/matches in the loaded catalog/)
        .waitFor();
    };
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      const scope = mobile ? dialog : page.locator("aside");
      await scope.getByRole("button", { name: new RegExp("^" + name + "(?:\\s|$)") }).click();
    };
    const focused = async (id) => {
      await page.waitForFunction(
        (id) => document.activeElement?.getAttribute("data-video-card-id") === id,
        id,
      );
      const box = await page.locator(`[data-video-card-id="${id}"]`).first().boundingBox();
      assert(box && box.y > -500 && box.y < (mobile ? 844 : 1000));
    };
    try {
      await page.goto(new URL("/__browse-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__browse-fixture.mjs");
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem(
          "reelcase.pull-settings.v1",
          JSON.stringify({ automaticPulls: false }),
        );
        localStorage.setItem("reelcase.artwork-mode", "text");
        const row = (id, name, kind) => ({
          id,
          name,
          folderId:
            kind === "youtube" ? "qa-youtube" : kind === "twitch" ? "qa-twitch" : "qa-local",
          path: id,
          extension: "mp4",
          mime: "video/mp4",
          size: 100,
          duration: 600,
          addedAt: 1000,
          ...(kind ? { remote: { kind, videoId: id, channelName: "Fixture creator" } } : {}),
        });
        const rows = Array.from({ length: 125 }, (_, i) =>
          row("local-" + i, "Waypoint local " + String(i).padStart(3, "0")),
        );
        for (const kind of ["youtube", "twitch"])
          for (let i = 0; i < 8; i++)
            rows.push(row(kind + "-" + i, "Waypoint " + kind + " " + i, kind));
        rows.push({
          ...row("private-sentinel", "Waypoint PRIVATE SENTINEL"),
          privateRetention: true,
        });
        await p.appendCatalogVideos(rows);
        p.savePrefs({
          ...p.loadPrefs(),
          sourceId: "home",
          follows: [],
        });
        await p.waitForPrefsWrites();
        await p.saveRemoteSnapshot({
          videos: [],
          folders: [
            { id: "qa-youtube", name: "YouTube fixture", kind: "youtube", videoCount: 8 },
            { id: "qa-twitch", name: "Twitch fixture", kind: "twitch", videoCount: 8 },
          ],
          checkedAt: 1,
        });
        sessionStorage.setItem(
          "qa-other-profile",
          (await p.createLocalProfile("Places QA alternate")).id,
        );
      });
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await search("Waypoint");
      await page.waitForTimeout(2000);
      await page
        .getByLabel("Search count evidence", { exact: true })
        .getByText(/matches in the loaded catalog/)
        .waitFor();
      // Admit a deeper result through ordinary scrolling, then anchor it by keyboard focus.
      for (
        let turn = 0;
        turn < 100 && !(await page.locator('[data-video-card-id="local-90"]').count());
        turn++
      ) {
        await page.evaluate(() =>
          window.scrollBy({ top: innerHeight * 0.65, behavior: "instant" }),
        );
        await page.waitForTimeout(80);
      }
      const anchor = page.locator('[data-video-card-id="local-90"]').first();
      await anchor.scrollIntoViewIfNeeded();
      await anchor.focus();
      await openPlaces();
      await dialog.getByRole("button", { name: "Save this place", exact: true }).click();
      await dialog.getByText("Place saved. No media was copied.", { exact: true }).waitFor();
      await dialog.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}-saved.png`),
      });
      await close();
      const saved = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("reelcase.browse-bookmarks.v1")),
      );
      assert.equal(saved.entries[0].task.anchor.ids[0], "local-90");
      assert.equal(saved.entries[0].task.query, "Waypoint");
      assert(!JSON.stringify(saved).includes("Waypoint local 090"));
      await nav("YouTube");
      await search("Waypoint youtube");
      await page.locator('[data-video-card-id="youtube-3"]').first().focus();
      await nav("Twitch");
      await search("Waypoint twitch");
      await page.locator('[data-video-card-id="twitch-4"]').first().focus();
      // Query edits are independent tasks; move until reaching each desk boundary.
      const back = page.getByRole("button", { name: "Back to previous browse task", exact: true }),
        forward = page.getByRole("button", { name: "Forward to next browse task", exact: true });
      const settled = () =>
        page.locator('[aria-label="Browse navigation"][data-browse-restoring="false"]').waitFor();
      for (let i = 0; i < 8 && (await back.isEnabled()); i++) {
        await back.click();
        await settled();
        console.log(
          "back",
          i,
          await page.evaluate(() => ({
            title: document.querySelector("header")?.innerText,
            focus: document.activeElement?.getAttribute("data-video-card-id"),
          })),
        );
        const text = await page.locator("header").innerText();
        if (
          text.includes("YouTube") &&
          (await page.locator('[data-video-card-id="youtube-3"]:focus').count())
        )
          break;
      }
      await focused("youtube-3");
      assert((await page.locator("header").innerText()).includes("YouTube"));
      for (let i = 0; i < 8 && (await back.isEnabled()); i++) {
        await back.click();
        await settled();
        console.log(
          "back-home",
          i,
          await page.evaluate(() => ({
            title: document.querySelector("header")?.innerText,
            focus: document.activeElement?.getAttribute("data-video-card-id"),
            notice: document.querySelector("main>p[role=status]")?.textContent,
            scroll: scrollY,
            grid: [...document.querySelectorAll("[data-virtual-video-grid]")].map((el) => ({
              loaded: el.getAttribute("data-grid-loaded"),
              pending: el.getAttribute("data-grid-pending"),
              ids: [...el.querySelectorAll("[data-video-card-id]")].map((card) =>
                card.getAttribute("data-video-card-id"),
              ),
            })),
          })),
        );
        if (await page.locator('[data-video-card-id="local-90"]:focus').count()) break;
      }
      await focused("local-90");
      for (let i = 0; i < 8 && (await forward.isEnabled()); i++) {
        await forward.click();
        await settled();
        if (await page.locator('[data-video-card-id="twitch-4"]:focus').count()) break;
      }
      await focused("twitch-4");
      report.checks.push(
        "Three desks restore their distinct search and logical anchors with back/forward on desktop and mobile; deep result restoration preserves the bounded grid",
      );
      assert((await page.locator("[data-video-card]").count()) < 150);
      // A verified identity move keeps the canonical ID while name/path reorder.
      await page.goto(new URL("/__browse-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__browse-fixture.mjs"),
          rows = await p.loadCatalogVideos(),
          row = rows.find((row) => row.id === "local-90"),
          proof = {
            version: 1,
            algorithm: "sha256",
            digest: "a".repeat(64),
            size: 100,
            lastModified: 1,
            at: Date.now(),
          },
          target = {
            ...row,
            id: "new-location",
            name: "Waypoint 000 renamed",
            path: "Renamed folder/Waypoint.mp4",
          };
        await p.appendCatalogVideos([
          target,
          ...Array.from({ length: 8 }, (_, i) => ({
            ...row,
            id: "inserted-" + i,
            name: "Waypoint 000 inserted " + i,
            path: "inserted-" + i,
          })),
        ]);
        const ledger = await p.recordFileIdentity(row, proof, false);
        await p.applyFileIdentityMove(row.id, target, proof, ledger.revision);
        const updated = (await p.loadCatalogVideos()).find((video) => video.id === row.id);
        if (updated.path !== target.path || updated.localIdentity?.targetId !== target.id)
          throw Error("Verified identity fixture did not commit");
      });
      await page.goto(url);
      await page.getByRole("button", { name: "Saved places", exact: true }).waitFor();
      await openPlaces();
      await dialog.getByRole("button", { name: "Open saved place 1", exact: true }).click();
      await focused("local-90");
      await page.evaluate(
        () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
      );
      // Let the real idle metadata repair/ranking replacement run after focus
      // restoration, then verify both retained focus and an ordinary mouse click.
      await page.waitForTimeout(2000);
      await focused("local-90");
      await page
        .getByRole("button", { name: "Refresh ranking", exact: true })
        .dispatchEvent("click");
      await page
        .getByLabel("Search count evidence", { exact: true })
        .getByText(/matches in the loaded catalog/)
        .waitFor();
      await focused("local-90");
      await page.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}-restored.png`),
      });
      report.checks.push(
        "Saved place survives reload and a real verified local-identity rename/reorder; the canonical media item receives focus without autoplay",
      );
      await page.locator('[data-video-card-id="local-90"]').first().click();
      await page.getByRole("button", { name: "Close preview", exact: true }).waitFor();
      await page.keyboard.press("Alt+ArrowLeft");
      await page
        .getByRole("button", { name: "Close preview", exact: true })
        .waitFor({ state: "hidden" });
      await focused("local-90");
      await page.keyboard.press("Alt+ArrowRight");
      await page.getByRole("button", { name: "Close preview", exact: true }).waitFor();
      await page.keyboard.press("Alt+ArrowLeft");
      await page
        .getByRole("button", { name: "Close preview", exact: true })
        .waitFor({ state: "hidden" });
      await focused("local-90");
      report.checks.push(
        "Keyboard back closes a title preview and restores its logical anchor; forward reopens the preview without playback",
      );
      await openPlaces();
      const old = await page.evaluate(() => localStorage.getItem("reelcase.browse-bookmarks.v1"));
      await page.evaluate(() => sessionStorage.setItem("qa-places-quota", "true"));
      await dialog.getByRole("button", { name: "Remove saved place 1", exact: true }).click();
      await dialog.getByRole("alert").waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.browse-bookmarks.v1")),
        old,
      );
      await page.evaluate(() => sessionStorage.removeItem("qa-places-quota"));
      await dialog.getByRole("button", { name: "Reload saved places", exact: true }).click();
      await close();
      // Delete/privatize the original and neighbors, without exposing old text.
      await page.goto(new URL("/__browse-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__browse-fixture.mjs"),
          saved = JSON.parse(localStorage.getItem("reelcase.browse-bookmarks.v1")),
          ids = saved.entries[0].task.anchor.ids;
        const rows = await p.loadCatalogVideos();
        for (const id of ids) {
          const row = rows.find((row) => row.id === id);
          if (row) await p.appendCatalogVideos([{ ...row, privateRetention: true }]);
        }
      });
      await page.goto(url);
      await openPlaces();
      assert(!(await dialog.innerText()).includes("Waypoint local 090"));
      await dialog.getByRole("button", { name: "Open saved place 1", exact: true }).click();
      await page
        .getByText("The saved title is unavailable in this view. Your browse task is still open.", {
          exact: true,
        })
        .waitFor();
      assert.equal(await page.getByText("Waypoint local 090", { exact: true }).count(), 0);
      await page
        .getByLabel("Search count evidence", { exact: true })
        .getByText(/matches in the loaded catalog/)
        .waitFor();
      report.checks.push(
        "Newly private original and neighborhood reveal no old title; quota failure preserves saved bytes and the remaining query still opens",
      );
      await openPlaces();
      await dialog.getByRole("button", { name: "Remove saved place 1", exact: true }).click();
      await dialog
        .getByText("Place removed. Your saved media is unchanged.", { exact: true })
        .waitFor();
      assert.equal(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("reelcase.browse-bookmarks.v1")).entries.length,
        ),
        0,
      );
      await close();
      // Remove an existing source after capturing its place. Private task text
      // remains unavailable in the locked public picker and next profile.
      await page.goto(new URL("/__browse-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__browse-fixture.mjs"),
          base = {
            source: "qa-youtube",
            query: "Waypoint",
            sort: "name",
            view: "grid",
            private: false,
            scroll: 0,
            options: {},
          };
        localStorage.setItem(
          "reelcase.browse-bookmarks.v1",
          JSON.stringify({
            version: 1,
            entries: [
              { id: "missing-source", task: base },
              {
                id: "private-task",
                task: { ...base, source: "adults", query: "PRIVATE TASK SENTINEL", private: true },
              },
            ],
          }),
        );
        const before = await p.loadRemoteSnapshot();
        if (!before.folders.some((folder) => folder.id === "qa-youtube"))
          throw Error("Missing-source fixture did not start with a saved source");
        await p.clearFolderVideos("qa-youtube");
        await p.removeRemoteSnapshotVideos(Array.from({ length: 8 }, (_, i) => "youtube-" + i));
        await p.saveRemoteSnapshot({
          videos: [],
          folders: before.folders.filter((folder) => folder.id !== "qa-youtube"),
          checkedAt: Date.now(),
        });
      });
      await page.goto(url);
      await openPlaces();
      assert.equal(await dialog.getByRole("button", { name: /Open saved place/ }).count(), 1);
      assert(!(await dialog.innerText()).includes("PRIVATE TASK SENTINEL"));
      await dialog.getByRole("button", { name: "Open saved place 1", exact: true }).click();
      await page
        .getByText(
          /The saved source is unavailable\. The remaining search opened in its library desk\./,
        )
        .waitFor();
      await page
        .getByLabel("Search count evidence", { exact: true })
        .getByText(/matches in the loaded catalog/)
        .waitFor();
      report.checks.push(
        "Removed source drops only its unavailable anchor and keeps the query; private tasks stay out of the public picker",
      );
      await nav("Twitch");
      if (await page.getByRole("button", { name: "Clear search", exact: true }).count())
        await page.getByRole("button", { name: "Clear search", exact: true }).click();
      await page.getByRole("button", { name: "Open full Twitch catalog", exact: true }).click();
      await nav("Home");
      await back.click();
      await page.getByRole("button", { name: "Close full Twitch catalog", exact: true }).waitFor();
      assert.equal(
        await page
          .getByRole("button", { name: "Close full Twitch catalog", exact: true })
          .getAttribute("aria-expanded"),
        "true",
      );
      report.checks.push(
        "Returning to Twitch restores its expanded full-catalog section after the normal route reset",
      );
      await page.evaluate(() =>
        sessionStorage.setItem(
          "realhub.active-local-profile.v1",
          sessionStorage.getItem("qa-other-profile"),
        ),
      );
      await page.reload();
      await openPlaces();
      await dialog.getByText("No saved places available in this scope.", { exact: true }).waitFor();
      await close();
      assert.equal(await back.isEnabled(), false);
      // Unsupported future schemas must remain untouched and block mutations.
      await page.evaluate(() =>
        localStorage.setItem(
          "realhub.profile.v1:" +
            sessionStorage.getItem("qa-other-profile") +
            ":reelcase.browse-bookmarks.v1",
          '{"version":2,"entries":[]}',
        ),
      );
      await openPlaces();
      await dialog.getByRole("alert").waitFor();
      assert.equal(
        await dialog.getByRole("button", { name: "Save this place", exact: true }).isEnabled(),
        false,
      );
      await page.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}-places.png`),
      });
      report.checks.push(
        "Explicit removal preserves media; alternate profile has no previous task stack or places; future storage schemas disable writes and preserve bytes",
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
          "Disposable profiles, saved metadata and deterministic provider responses; no real provider playback, physical phone or local media permission is exercised.",
      },
      null,
      2,
    ),
  );
}
console.log(JSON.stringify({ ok: true, output }));
