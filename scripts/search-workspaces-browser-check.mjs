import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/search-workspaces-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0search-workspace-fixture";
const build = await rolldown({
  input: entry,
  resolve: { alias: { "@": resolve("src") } },
  plugins: [
    {
      name: "search-fixture",
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
const generated = await build.generate({ format: "esm" });
await build.close();
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
      page = await context.newPage();
    const report = { mobile, checks: [], errors: [] };
    reports.push(report);
    page.setDefaultTimeout(45000);
    page.on("pageerror", (error) => report.errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && !/ERR_ABORTED/.test(message.text()))
        report.errors.push(message.text());
    });
    await context.route("**/__search-fixture.mjs", (route) =>
      route.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__search-blank.html", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Disposable search fixture</title><p>Preparing saved metadata</p>",
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
          key === "reelcase.search-workspaces.v1" &&
          sessionStorage.getItem("qa-search-quota") === "true"
        )
          throw new DOMException("Controlled storage quota", "QuotaExceededError");
        return set.call(this, key, value);
      };
    });
    const open = async () => {
      await page.getByRole("button", { name: "Saved searches and filters", exact: true }).click();
      await page
        .getByRole("dialog")
        .getByRole("heading", { name: "Search workspaces", exact: true })
        .waitFor();
    };
    const dialog = page.getByRole("dialog"),
      saved = dialog.getByRole("region", { name: "Saved search workspaces" }),
      chips = page.getByLabel("Active search filters", { exact: true });
    const results = async (count, title = 'Racing feature') => {
      await page
        .getByRole("region", { name: "Search ranking and matching tags" })
        .getByText(`${count} ranked results`, { exact: true })
        .waitFor();
      if (count === 1) await page.getByRole('region', { name: 'Search ranking and matching tags' }).getByText(title, { exact: true }).waitFor();
    };
    const bytes = () => page.evaluate(() => localStorage.getItem("reelcase.search-workspaces.v1"));
    const close = () => dialog.getByRole("button", { name: "Close", exact: true }).click();
    try {
      await page.goto(new URL("/__search-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__search-fixture.mjs");
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem(
          "reelcase.pull-settings.v1",
          JSON.stringify({ automaticPulls: false }),
        );
        localStorage.setItem("reelcase.artwork-mode", "text");
        const row = (id, name, kind, duration) => ({
          id,
          name,
          folderId: kind === "eporner" ? "eporner:discover" : "search-qa",
          path: id,
          addedAt: 1,
          size: 0,
          mime: "video/mp4",
          extension: "mp4",
          duration,
          ...(kind ? { remote: { kind, videoId: id, channelName: "Fixture creator" } } : {}),
        });
        const videos = [
          row("youtube:feature", "Racing feature", "youtube", 1800),
          row("youtube:short", "Racing short", "youtube", 300),
          row("twitch:feature", "Racing Twitch", "twitch", 1800),
          row("local:feature", "Racing local", undefined, 1800),
          row("eporner:private", "Racing private sentinel", "eporner", 1800),
          row("youtube:unknown", "Racing unknown duration", "youtube", undefined),
        ];
        for (let i = 0; i < 3000; i++)
          videos.push(row("youtube:other-" + i, "Unrelated recording " + i, "youtube", 120));
        await p.appendCatalogVideos(videos);
        p.savePrefs({
          ...p.loadPrefs(),
          sourceId: "home",
          follows: [],
          tags: Object.fromEntries(videos.slice(0, 6).map((v) => [v.id, ["racing"]])),
          categories: Object.fromEntries(videos.slice(0, 6).map((v) => [v.id, "Film"])),
        });
        window.__profileForQA = (await p.createLocalProfile("Search QA alternate")).id;
        sessionStorage.setItem("qa-search-profile", window.__profileForQA);
      });
      // Await a resolved native read, never an async waitForFunction predicate.
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
              r.onsuccess = () => yes(JSON.stringify(r.result ?? {}).includes("racing"));
              r.onerror = () => yes(false);
            });
          } finally {
            db.close();
          }
        });
        if (ready) break;
        if (attempt === 99) throw Error("Fixture preferences did not persist");
        await page.waitForTimeout(100);
      }
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await open();
      await dialog.getByLabel("Workspace search text", { exact: true }).fill("racing");
      await dialog.getByLabel("Search source", { exact: true }).selectOption("youtube");
      await dialog.getByLabel("Minimum minutes", { exact: true }).fill("10");
      await dialog.getByLabel("Maximum minutes", { exact: true }).fill("60");
      await dialog.getByLabel("Exact search category", { exact: true }).fill("Film");
      await dialog.getByLabel("Add search tag", { exact: true }).fill("racing");
      await dialog.getByLabel("Add search tag", { exact: true }).press("Enter");
      await dialog.getByLabel("Workspace name", { exact: true }).fill("Racing features");
      await dialog.getByRole("button", { name: "Save as new", exact: true }).click();
      await dialog.getByText("New search saved in this profile.", { exact: true }).waitFor();
      await dialog.getByRole("button", { name: "Open search", exact: true }).click();
      await results(1);
      assert.equal(await chips.getByRole("button").count(), 4);
      assert(!(await page.locator("main").innerText()).includes("Racing private sentinel"));
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile-results.png" : "-desktop-results.png"),
        fullPage: false,
      });
      report.checks.push(
        "Form and keyboard tag entry produce one exact YouTube result; unknown durations and private rows stay excluded",
      );
      const firstBytes = await bytes();
      await page.reload();
      await page.getByRole("button", { name: "Saved searches and filters", exact: true }).waitFor();
      await open();
      await saved
        .getByRole("button", { name: "Open saved search Racing features", exact: true })
        .click();
      await results(1);
      assert.equal(await bytes(), firstBytes);
      report.checks.push(
        "Reload and reopen retain identical query, constraints and result identity without autosaving",
      );
      await chips
        .getByRole("button", { name: "Remove Duration: 600–3600 seconds", exact: true })
        .focus();
      await page.keyboard.press("Enter");
      await results(3);
      assert.equal(await chips.getByRole("button").count(), 3);
      await chips.getByRole("button", { name: "Remove Source: youtube", exact: true }).click();
      await results(5);
      assert.equal(await chips.getByRole("button").count(), 2);
      report.checks.push(
        "Keyboard and mouse remove one chip while preserving the remaining category and tag constraints",
      );
      await open();
      await saved.getByRole("button", { name: "Racing features", exact: true }).click();
      await dialog.getByLabel("Workspace name", { exact: true }).fill("Evening racing");
      await dialog.getByRole("button", { name: "Update selected", exact: true }).click();
      await saved.getByRole("button", { name: "Evening racing", exact: true }).waitFor();
      await dialog.getByLabel("Workspace name", { exact: true }).fill("Second search");
      await dialog.getByRole("button", { name: "Save as new", exact: true }).click();
      await saved.getByRole("button", { name: "Move Second search up", exact: true }).click();
      assert.equal(JSON.parse(await bytes()).entries[0].name, "Second search");
      const before = await bytes();
      await page.evaluate(() => sessionStorage.setItem("qa-search-quota", "true"));
      await dialog.getByLabel("Workspace name", { exact: true }).fill("Must not persist");
      await dialog.getByRole("button", { name: "Update selected", exact: true }).click();
      await dialog.getByRole("alert").waitFor();
      assert.equal(await bytes(), before);
      await page.evaluate(() => sessionStorage.removeItem("qa-search-quota"));
      await dialog.getByRole("button", { name: "Reload saved searches", exact: true }).click();
      await dialog.getByLabel("Minimum minutes", { exact: true }).fill("90");
      await dialog.getByLabel("Maximum minutes", { exact: true }).fill("10");
      await dialog.getByRole("button", { name: "Update selected", exact: true }).click();
      await dialog.getByRole("alert").waitFor();
      assert.equal(await bytes(), before);
      await saved.getByRole("button", { name: "Second search", exact: true }).click();
      await saved
        .getByRole("button", { name: "Remove saved search Second search", exact: true })
        .click();
      assert.equal(JSON.parse(await bytes()).entries.length, 1);
      report.checks.push(
        "Rename, reorder, delete and explicit save work; quota and invalid duration keep prior saved bytes",
      );
      await dialog.getByLabel("Search desk", { exact: true }).selectOption("private");
      assert.equal(
        await saved.getByRole("button", { name: "Evening racing", exact: true }).count(),
        0,
      );
      await dialog
        .getByLabel("Workspace search text", { exact: true })
        .fill("Racing private sentinel");
      await dialog.getByLabel("Workspace name", { exact: true }).fill("Private workspace sentinel");
      await dialog.getByRole("button", { name: "Save as new", exact: true }).click();
      await saved.getByRole('button', { name: 'Open saved search Private workspace sentinel', exact: true }).click();
      await results(1, 'Racing private sentinel');
      assert.equal(await page.getByRole('region', { name: 'Search ranking and matching tags' }).getByText('Racing feature', { exact: true }).count(), 0);
      await open();
      await dialog.getByLabel("Search desk", { exact: true }).selectOption("public");
      assert(!(await dialog.innerText()).includes("Private workspace sentinel"));
      await saved.getByRole("button", { name: "Evening racing", exact: true }).click();
      await dialog.getByLabel('Workspace name', { exact: true }).fill('Visible second');
      await dialog.getByRole('button', { name: 'Save as new', exact: true }).click();
      await saved.getByRole('button', { name: 'Move Visible second up', exact: true }).click();
      assert.deepEqual(JSON.parse(await bytes()).entries.map(row => row.name), ['Visible second', 'Private workspace sentinel', 'Evening racing']);
      assert.equal(await saved.getByRole('button', { name: 'Move Visible second up', exact: true }).isDisabled(), true);
      assert.equal(await saved.getByRole('button', { name: 'Move Evening racing down', exact: true }).isDisabled(), true);
      await saved.getByRole('button', { name: 'Remove saved search Visible second', exact: true }).click();
      await saved.getByRole('button', { name: 'Evening racing', exact: true }).click();
      report.checks.push('Reorder arrows skip hidden private entries and stop at the visible list boundaries');
      await dialog.evaluate(element => { element.scrollTop = 0; });
      await dialog.screenshot({
        path: output.replace(".json", mobile ? "-mobile-editor.png" : "-desktop-editor.png"),
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      await close();
      // New document binding, registered alternate profile, no Default query leakage.
      const defaultBytes = await bytes();
      await page.evaluate(() =>
        sessionStorage.setItem(
          "realhub.active-local-profile.v1",
          sessionStorage.getItem("qa-search-profile"),
        ),
      );
      await page.reload();
      await page.getByRole("button", { name: "Saved searches and filters", exact: true }).waitFor();
      await open();
      assert(!(await saved.innerText()).includes("Evening racing"));
      await dialog.getByLabel("Workspace search text", { exact: true }).fill("alternate");
      await dialog.getByLabel("Workspace name", { exact: true }).fill("Alternate only");
      await dialog.getByRole("button", { name: "Save as new", exact: true }).click();
      assert.equal(await bytes(), defaultBytes);
      await close();
      await page.evaluate(() =>
        sessionStorage.setItem("realhub.active-local-profile.v1", "default"),
      );
      await page.reload();
      await page.getByRole("button", { name: "Saved searches and filters", exact: true }).waitFor();
      await open();
      assert.equal(
        await saved.getByRole("button", { name: "Alternate only", exact: true }).count(),
        0,
      );
      await saved
        .getByRole("button", { name: "Open saved search Evening racing", exact: true })
        .click();
      await results(1);
      report.checks.push(
        "Registered alternate profile saves independently; private names and query text stay off public lists",
      );
      await open();
      await dialog.getByLabel('Workspace search text', { exact: true }).fill('');
      await dialog.getByRole('button', { name: 'Open search', exact: true }).click();
      await results(1);
      report.checks.push('Filter-only searches work without words; private searches return only the exact private result');
      // Replace a live query twice; the last selection remains authoritative.
      await page.getByRole("button", { name: "Open search", exact: true }).click();
      const input = page.getByRole("searchbox", { name: "Global media search", exact: true });
      await input.fill("unrelated");
      await input.press("Enter");
      await page.getByRole("button", { name: "Saved searches and filters", exact: true }).click();
      await saved
        .getByRole("button", { name: "Open saved search Evening racing", exact: true })
        .click();
      await results(1);
      await page.waitForTimeout(500);
      await results(1);
      await page.getByRole("button", { name: "Open search", exact: true }).click();
      await input.fill("unsupported:operator");
      await input.press("Enter");
      await page.getByRole("alert").filter({ hasText: "Unsupported filter" }).waitFor();
      await results(0);
      report.checks.push(
        "Rapid text-to-workspace replacement cannot publish stale results; unsupported operators explain the error and return no matches",
      );
      // Future data is never silently replaced by an empty list.
      await page.evaluate(() =>
        localStorage.setItem("reelcase.search-workspaces.v1", '{"version":99,"entries":[]}'),
      );
      await open();
      await dialog.getByRole("alert").filter({ hasText: "Unsupported saved searches" }).waitFor();
      assert.equal(
        await dialog.getByRole("button", { name: "Save as new", exact: true }).isDisabled(),
        true,
      );
      assert.equal(await bytes(), '{"version":99,"entries":[]}');
      report.checks.push("Future storage schemas disable saves and preserve original bytes");
      assert.deepEqual(report.errors, []);
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
            ok: reports.every((row) => !row.error),
            reports,
            limitation:
              "Disposable profiles and deterministic saved metadata; no provider or media download is performed.",
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
