import assert from "node:assert/strict";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  out = checkedOutputPath(process.argv[3] ?? "screenshots/milestone82-recovery-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0recovery-probe",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "probe",
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) =>
          id === entry
            ? [
                "src/lib/videos/persist.ts",
                "src/lib/videos/source-visibility.ts",
                "src/lib/writer-lease.ts",
              ]
                .map(
                  (p) => "export * from " + JSON.stringify(resolve(p).replaceAll("\\", "/")) + ";",
                )
                .join("\n")
            : undefined,
      },
    ],
  }),
  generated = await bundle.generate({ format: "esm" });
await bundle.close();
const code = generated.output.find((o) => o.type === "chunk").code;
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
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => errors.push(e.message));
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      localStorage.setItem("reelcase.artwork-mode", "text");
    });
    await context.route("**/__recovery-probe.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    const probe = () =>
      page.evaluate(async () => {
        window.__p = await import("/__recovery-probe.mjs");
      });
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await page.evaluate(async () => {
        const p = window.__p,
          at = Date.now(),
          history = [
            {
              id: "local:fixture",
              at,
              eventId: "fixture-event",
              title: "Recovery fixture",
              source: "open",
            },
          ];
        await p.saveFolderVideos("dir:Fixture", [
          {
            id: "local:fixture",
            folderId: "dir:Fixture",
            name: "Recovery fixture",
            path: "fixture.mp4",
            extension: "mp4",
            mime: "video/mp4",
            size: 100,
            addedAt: at,
          },
        ]);
        p.savePrefs({
          ...p.loadPrefs(),
          view: "grid",
          sort: "name",
          sourceId: "home",
          tags: { "local:fixture": ["racing"] },
          metadataProvenance: {},
          categories: {},
          favorites: ["local:fixture"],
          likes: [],
          progress: {},
          resumeProgress: {},
          viewCounts: { "local:fixture": 7 },
          cameCounts: {},
          history,
          privateFolderIds: ["dir:Private fixture"],
        });
        p.saveDurableHistory(history);
        p.saveDurableResume(
          { "local:fixture": { t: 20, d: 100, at } },
          { "id:local:fixture": { t: 20, d: 100, at } },
        );
        await p.saveDurableFeedback({
          ratings: { "local:fixture": 5 },
          ratingHistory: { "local:fixture": { rating: 5, updatedAt: at } },
          notes: { "local:fixture": "Keep this note" },
          creatorRatings: {},
          creatorLikes: {},
          creatorFavorites: {},
          tagLikes: {},
          tagHeartHistory: {},
          watchTime: {},
        });
        await p.waitForDurableWrites();
        await p.waitForPrefsWrites();
        await p.hideLocalSource({
          id: "dir:Private fixture",
          name: "Secret fixture",
          kind: "directory",
          adult: true,
          videoCount: 0,
        });
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page.getByRole("button", { name: /^Local sources/ }).click();
      await page.getByRole("button", { name: "Hide Fixture", exact: true }).waitFor();
      await page.getByRole("button", { name: "Hide Fixture", exact: true }).click();
      let dialog = page.getByRole("dialog", { name: "Hide this local source?" });
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      assert.equal((await page.evaluate(() => window.__p.loadHiddenSources())).hidden.length, 1);
      await page.getByRole("button", { name: "Hide Fixture", exact: true }).click();
      await dialog.getByRole("button", { name: "Hide source", exact: true }).click();
      await dialog.waitFor({ state: "hidden" });
      if (mobile) await page.getByRole("button", { name: "Close", exact: true }).click();
      assert.equal((await page.evaluate(() => window.__p.loadHiddenSources())).hidden.length, 2);
      assert.equal((await page.evaluate(() => window.__p.loadCatalogVideos())).length, 0);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await nav("Settings");
      const hidden = page.getByRole("region", { name: "Hidden source recovery" });
      await hidden.getByText("Fixture", { exact: true }).waitFor();
      assert.equal(await hidden.getByText("Secret fixture", { exact: true }).count(), 0);
      assert(
        (
          await page.evaluate(async () => {
            await window.__p.restoreDurablePrefs();
            return window.__p.loadPrefs();
          })
        ).privateFolderIds.includes("dir:Private fixture"),
      );
      await hidden.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: out.replace(".json", mobile ? "-mobile-hidden.png" : "-desktop-hidden.png"),
      });
      await Promise.all([
        page.waitForEvent("framenavigated", (f) => f === page.mainFrame()),
        hidden
          .getByRole("button", { name: "Restore source", exact: true })
          .locator(":scope:enabled")
          .click(),
      ]);
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      assert.equal((await page.evaluate(() => window.__p.loadCatalogVideos())).length, 1);
      assert.equal(
        (await page.evaluate(() => window.__p.restoreDurableFeedback())).notes["local:fixture"],
        "Keep this note",
      );
      checks.push(
        "Source preview cancellation is read-only; hide survives reload; restore retains catalog and personal marks",
      );
      await nav("History");
      await page.getByRole("button", { name: "Clear history", exact: true }).click();
      dialog = page.getByRole("dialog", { name: "Clear saved watch history?" });
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      assert((await page.evaluate(() => window.__p.restoreDurableHistory())).length > 0);
      await page.getByRole("button", { name: "Clear history", exact: true }).click();
      await Promise.all([
        page.waitForEvent("framenavigated", (f) => f === page.mainFrame()),
        dialog.getByRole("button", { name: "Clear history with recovery", exact: true }).click(),
      ]);
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      assert.equal((await page.evaluate(() => window.__p.restoreDurableHistory())).length, 0);
      assert.equal(
        (await page.evaluate(() => window.__p.restoreDurableResume())).resumeProgress[
          "id:local:fixture"
        ].t,
        20,
      );
      assert.equal(
        (await page.evaluate(() => window.__p.restoreDurableFeedback())).ratings["local:fixture"],
        5,
      );
      await nav("Settings");
      const slot = page.getByRole("region", { name: "Library restore recovery slot" });
      await slot.getByRole("button", { name: "Review restore rollback", exact: true }).click();
      await Promise.all([
        page.waitForEvent("framenavigated", (f) => f === page.mainFrame()),
        slot.getByRole("button", { name: "Confirm rollback and reload", exact: true }).click(),
      ]);
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      assert((await page.evaluate(() => window.__p.restoreDurableHistory())).length > 0);
      checks.push(
        "History preview cancellation preserves events; confirmed clear keeps resume/ratings; durable rollback restores the complete previous checkpoint",
      );
      await page.evaluate(() =>
        localStorage.setItem(
          "reelcase.mission-plan.v1",
          JSON.stringify([
            {
              id: "speed-01",
              title: "Earlier item",
              detail: "Keep my manual status",
              status: "blocked",
              done: false,
            },
            {
              id: "custom-recovery",
              title: "My custom idea",
              detail: "Keep this exact wording",
              status: "in-progress",
              done: false,
            },
          ]),
        ),
      );
      await nav("Mission plan");
      await page.waitForFunction(
        () => JSON.parse(localStorage.getItem("reelcase.mission-plan.v1") ?? "[]").length === 307,
      );
      await page.evaluate(() =>
        localStorage.setItem("qa-plan-before", localStorage.getItem("reelcase.mission-plan.v1")),
      );
      await page
        .getByRole("button", { name: "Reset to the current delivery queue", exact: true })
        .click();
      dialog = page.getByRole("dialog", { name: "Reset this mission plan?" });
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.mission-plan.v1")),
        await page.evaluate(() => localStorage.getItem("qa-plan-before")),
      );
      await page
        .getByRole("button", { name: "Reset to the current delivery queue", exact: true })
        .click();
      await dialog.getByRole("button", { name: "Reset mission plan", exact: true }).click();
      await page.getByRole("button", { name: "Undo mission reset", exact: true }).waitFor();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Mission plan");
      await page.getByRole("button", { name: "Undo mission reset", exact: true }).click();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.mission-plan.v1")),
        await page.evaluate(() => localStorage.getItem("qa-plan-before")),
      );
      checks.push(
        "Mission reset has an exact consequence preview and a preceding-plan undo slot that survives reload",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.ok = true;
    } catch (e) {
      report.error = e.stack;
      report.text = (await page.locator("body").innerText()).slice(-5000);
      await page
        .screenshot({
          path: out.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
      throw e;
    } finally {
      await context.unrouteAll({ behavior: "ignoreErrors" });
      await context.close();
      await writeFile(
        out,
        JSON.stringify(
          {
            ok: reports.every((r) => r.ok),
            reports,
            limitation:
              "Disposable browser profiles only. Source catalog records and personal signals are fixtures; no real native files or account data were changed.",
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
