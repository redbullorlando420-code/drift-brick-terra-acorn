import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/search-evidence-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0search-evidence-probe";
const path = (file) => JSON.stringify(resolve(file).replaceAll("\\", "/"));
const bundle = await rolldown({
  input: entry,
  resolve: { alias: { "@": resolve("src") } },
  plugins: [
    {
      name: "search-evidence-probe",
      resolveId: (id) => (id === entry ? entry : undefined),
      load: (id) =>
        id === entry
          ? `
export * from ${path("src/lib/videos/persist.ts")};
import React from 'react';import {createRoot} from 'react-dom/client';
import {CountEvidenceLabel} from ${path("src/components/library/search-count-status.tsx")};
import {RoomVideoSummary} from ${path("src/components/library/room-video-summary.tsx")};

export function mountCountFixture(){
const row={id:'count-fixture',name:'Count fixture result',path:'count-fixture',folderId:'local',extension:'mp4',mime:'video/mp4',size:0,addedAt:1};

const root=createRoot(document.getElementById('fixture'));const grid=React.createElement('ul',null,React.createElement('li',{'data-room-result-id':'count-fixture'},React.createElement(RoomVideoSummary,{video:row},React.createElement('button',null,row.name))));
const render=evidence=>root.render(React.createElement(React.Fragment,null,React.createElement(CountEvidenceLabel,{evidence}),grid));
render({version:1,kind:'page',value:1,scope:'YouTube',hasMore:true});return render;}
`
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
        timezoneId: mobile ? "Pacific/Kiritimati" : "America/Los_Angeles",
      }),
      page = await context.newPage(),
      report = { mobile, checks: [], errors: [] };
    reports.push(report);
    page.setDefaultTimeout(45000);
    page.on("pageerror", (e) => report.errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) report.errors.push(m.text());
    });
    await context.route("**/__search-evidence-probe.mjs", (route) =>
      route.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__search-evidence-blank.html", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: '<!doctype html><title>Disposable search count fixture</title><div id="fixture"></div>',
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
      const Native = Worker;
      window.__heldPackets = [];
      window.__holdSearch = false;
      window.Worker = class extends Native {
        postMessage(data, ...args) {
          if (window.__holdSearch && data?.type === "batch" && data.done) {
            window.__heldPackets.push({ worker: this, data, args });
            return;
          }
          return super.postMessage(data, ...args);
        }
      };
      window.__releaseSearch = () => {
        window.__holdSearch = false;
        for (const row of window.__heldPackets)
          Native.prototype.postMessage.call(row.worker, row.data, ...row.args);
        window.__heldPackets = [];
      };
    });
    const dialog = page.getByRole("dialog"),
      datePanel = dialog.getByLabel("Date search filters", { exact: true }),
      counter = page.getByLabel("Search count evidence", { exact: true });
    const open = async () => {
      await page.getByRole("button", { name: "Saved searches and filters", exact: true }).click();
      await dialog.waitFor();
      await datePanel.locator("summary").click();
    };
    const execute = () => dialog.getByRole("button", { name: "Open search", exact: true }).click();
    const results = async (n) => {
      await page
        .getByRole("region", { name: "Search ranking and matching tags" })
        .getByText(`${n} ranked results`, { exact: true })
        .waitFor();
      await counter.getByText(`${n} matches in the loaded catalog`, { exact: true }).waitFor();
    };
    const dates = async (
      from,
      to,
      unknown = "exclude",
      partial = "overlap",
      field = "published",
    ) => {
      await dialog.getByLabel("Use date filter", { exact: true }).check();
      await dialog.getByLabel("Search date field", { exact: true }).selectOption(field);
      await dialog.getByLabel("Search date from", { exact: true }).fill(from);
      await dialog.getByLabel("Search date through", { exact: true }).fill(to);
      await dialog.getByLabel("Unknown search dates", { exact: true }).selectOption(unknown);
      await dialog.getByLabel("Partial search dates", { exact: true }).selectOption(partial);
    };
    try {
      await page.goto(new URL("/__search-evidence-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__search-evidence-probe.mjs");
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem(
          "reelcase.pull-settings.v1",
          JSON.stringify({ automaticPulls: false }),
        );
        localStorage.setItem("reelcase.artwork-mode", "text");
        const row = (id, name, precision, date, stamp = "2026-11-03T12:00:00Z") => ({
          id,
          name,
          folderId: "qa",
          path: id,
          extension: "mp4",
          mime: "video/mp4",
          size: 0,
          addedAt: Date.parse(stamp),
          remote: {
            kind: "youtube",
            videoId: id,
            publishedSource: precision ? "provider" : "unknown",
            publishedPrecision: precision ?? "unknown",
            publishedDate: date,
          },
        });
        const rows = [
          row("old", "Feature old", "day", "2012-04-06", "2012-04-06T00:00:00Z"),
          row("new", "Feature new", "day", "2026-11-03"),
          row("unknown", "Feature unknown"),
          row("relative", "Feature relative", "relative"),
          row("year", "Feature year", "year", "2020"),
          row("month", "Feature month", "month", "2020-06"),
          row("instant", "Feature instant", "instant", undefined, "2020-06-15T23:30:00-05:00"),
          row("day", "Feature stated day", "day", "2020-06-15"),
        ];
        rows.push({...row("legacy", "Feature legacy ISO"),remote:{kind:"youtube",videoId:"legacy",publishedSource:"provider",publishedDate:"2018-07-04T23:30:00-05:00"}});
    const local = { ...row("local", "Feature local"), remote: undefined };
        rows.push(local);
        rows.push({
          ...row("private", "Feature private", "day", "2020-06-15"),
          privateRetention: true,
        });
        for (let i = 0; i < 1500; i++) rows.push(row("bulk-" + i, "Unrelated " + i));
        await p.appendCatalogVideos(rows);
        p.savePrefs({ ...p.loadPrefs(), sourceId: "home", follows: [] });
      });
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(() => (window.__holdSearch = true));
      await page.getByRole("button", { name: "Open search", exact: true }).click();
      const input = page.getByRole("searchbox", { name: "Global media search", exact: true });
      await input.fill("feature");
      await input.press("Enter");
      await page.waitForFunction(() => window.__heldPackets.length > 0);
      await counter
        .locator('[role="status"]')
        .getByText("Search count pending", { exact: true })
        .waitFor();
      assert.equal(await counter.getAttribute("data-count-kind"), "pending");
      assert(!(await counter.innerText()).includes("matches in the loaded catalog"));
      await page.getByRole("button", { name: "Open search", exact: true }).focus();
      await page.evaluate(() => {
        window.__focusBefore = document.activeElement;
        window.__releaseSearch();
      });
      await results(10);
      assert(await page.evaluate(() => document.activeElement === window.__focusBefore));
      report.checks.push(
        "Held final worker batch keeps count pending; completing the snapshot publishes an exact loaded-catalog count without moving focus",
      );
      await open();
      await dates("2020-06-15", "2020-06-15");
      await dialog.getByLabel("Workspace name", { exact: true }).fill("Publication June");
      await dialog.getByRole("button", { name: "Save as new", exact: true }).click();
      await execute();
      await results(3);
      assert(!(await page.locator("main").innerText()).includes("Feature private"));
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile-results.png" : "-desktop-results.png"),
      });
      await open();
      await dates("2020-06-15", "2020-06-15", "exclude", "exclude");
      await execute();
      await results(1);
      await page
        .getByRole("region", { name: "Search ranking and matching tags" })
        .getByText("Feature stated day", { exact: true })
        .waitFor();
      await open();
      await dates("2020-06-16", "2020-06-16", "exclude", "exclude");
      await execute();
      await results(1);
      await page
        .getByRole("region", { name: "Search ranking and matching tags" })
        .getByText("Feature instant", { exact: true })
        .waitFor();
      report.checks.push(
        "UTC day evidence stays on its stated day across opposite timezones; an offset instant uses its actual UTC day, with explicit partial-period overlap/exclusion",
      );
      await open();
      await dates("2020-06-15", "2020-06-15", "only");
      await execute();
      await results(3);
      await open();
      await dates("2020-06-15", "2020-06-15", "include");
      await execute();
      await results(6);
      await open();
      await dates("2026-11-03", "2026-11-03", "exclude", "overlap", "added");
      await execute();
      await results(1);
      await page
        .getByRole("region", { name: "Search ranking and matching tags" })
        .getByText("Feature local", { exact: true })
        .waitFor();
      await open();
      await dates("2012-01-01", "2012-12-31");
      await execute();
      await results(1);
      await page
        .getByRole("region", { name: "Search ranking and matching tags" })
        .getByText("Feature old", { exact: true })
        .waitFor();
      report.checks.push(
        "Unknown-only/include modes and local import time stay distinct from older publication evidence; private rows never affect the public count",
      );
      await open();
      const before = await page.evaluate(() =>
        localStorage.getItem("reelcase.search-workspaces.v1"),
      );
      await dates("2021-01-01", "2020-01-01");
      await dialog.getByLabel("Workspace name", { exact: true }).fill("Invalid");
      await dialog.getByRole("button", { name: "Save as new", exact: true }).click();
      await dialog.getByRole("alert").waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.search-workspaces.v1")),
        before,
      );
      await dialog
        .getByRole("region", { name: "Saved search workspaces" })
        .getByRole("button", { name: "Publication June", exact: true })
        .click();
      await datePanel.evaluate((el) => (el.open = true));
      await dialog.evaluate((el) => (el.scrollTop = 250));
      await dialog.screenshot({
        path: output.replace(".json", mobile ? "-mobile-editor.png" : "-desktop-editor.png"),
      });
      await dialog
        .getByRole("button", { name: "Open saved search Publication June", exact: true })
        .click();
      await results(3);
      await page.reload();
      await page.getByRole("button", { name: "Saved searches and filters", exact: true }).waitFor();
      await open();
      await dialog
        .getByRole("button", { name: "Open saved search Publication June", exact: true })
        .click();
      await results(3);
      await page
        .getByLabel("Active search filters", { exact: true })
        .getByRole("button")
        .filter({ hasText: "Published:" })
        .click();
      await results(10);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      report.checks.push(
        "Saved date filters reopen after reload, invalid ranges preserve prior bytes, and removing the date chip preserves the text search",
      );
      // Actual count component alongside an actual room video summary: changing
      // only an estimate must preserve the focused card DOM and paging owner.
      await page.goto(new URL("/__search-evidence-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__search-evidence-probe.mjs");
        window.__countRender = p.mountCountFixture();
      });
      await counter.getByText("1 results loaded on this page", { exact: true }).waitFor();
      const card = page.locator("[data-room-result-id]").first();
      const focus = page.locator("button").filter({ hasText: "Count fixture result" }).first();
      await focus.focus();
      await page.evaluate(() => {
        window.__cardFocus = document.activeElement;
        window.__cardNode = document.querySelector("[data-room-result-id]");
        window.__countRender({ version: 1, kind: "estimate", value: 9000, scope: "YouTube" });
      });
      await counter.getByText("About 9,000 matches", { exact: true }).waitFor();
      assert(
        await page.evaluate(
          () =>
            document.activeElement === window.__cardFocus &&
            document.querySelector("[data-room-result-id]") === window.__cardNode,
        ),
      );
      report.checks.push(
        "Updating a provider estimate is labelled approximate and preserves the focused real room-result node",
      );
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
            ok: reports.every((r) => !r.error),
            reports,
            limitation:
              "Disposable metadata, held real worker completion and isolated real-component count/room-card focus fixture; no upstream provider or physical phone is exercised.",
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
