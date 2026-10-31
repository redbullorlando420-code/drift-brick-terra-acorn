import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { registerHooks } from "node:module";
import { fromJSON } from "seroval";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
registerHooks({
  resolve(s, c, n) {
    if (s.startsWith("@/"))
      return n(new URL("../src/" + s.slice(2) + ".ts", import.meta.url).href, c);
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});

import { readFile, writeFile } from "node:fs/promises";
const { preflightPack } = await import("../src/lib/videos/pack-preflight.ts");
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/root-diagnostics-dev.json", [
    resolve("screenshots"),
  ]);
const secret = "PRIVATE_CANARY_owner_731",
  privatePath = "C:\\private\\" + secret,
  rootId = "a".repeat(24);
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
      checks = [];
    const report = { viewport: mobile ? "mobile" : "desktop", errors, checks };
    reports.push(report);
    let generation = 1,
      revision = 1,
      enabled = true,
      statusReads = 0,
      changes = 0,
      old = false,
      stale = false;
    page.setDefaultTimeout(45000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !m.text().includes("ERR_ABORTED")) errors.push(m.text());
    });
    await context.addInitScript(() => {
      localStorage.setItem(
        "reelcase.pull-settings.v1",
        JSON.stringify({ automaticPulls: false, requestGapMs: 250 }),
      );
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
    });
    const access = () => ({
      ok: true,
      generation,
      active: enabled ? 1 : 0,
      pending: 0,
      persistent: true,
      roots: [
        {
          id: rootId,
          path: privatePath,
          state: enabled ? "approved" : "revoked",
          revision,
          enabled,
          token: secret,
        },
      ],
      unexpected: { privateTitle: secret },
    });
    await context.route("http://127.0.0.1:43123/**", async (route) => {
      const path = new URL(route.request().url()).pathname;
      let data;
      if (path === "/health")
        data = {
          ok: true,
          service: "reelcase-companion",
          version: old ? 14 : 15,
          protocol: { major: 1, minor: 0 },
          capabilities: old
            ? []
            : ["root-access", "task-receipts", "thumb-disk-cache", "library-pack-disk"],
          roots: enabled ? 1 : 0,
        };
      else if (path === "/roots/status") {
        statusReads++;
        data = access();
      } else if (path === "/roots/change") {
        changes++;
        const body = route.request().postDataJSON();
        if (stale) {
          stale = false;
          revision++;
          generation++;
          data = { ok: false, error: "Folder access changed. Refresh before choosing again." };
        } else {
          assert.equal(body.id, rootId);
          assert.equal(body.revision, revision);
          enabled = body.enabled;
          revision++;
          generation++;
          data = access();
        }
      } else data = { ok: false };
      await route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify(data),
      });
    });
    await context.route("**/_serverFn/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ result: null, context: {} }),
      }),
    );
    const nav = async () => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: "Settings", exact: true })
        .click();
    };
    const saved = () => page.evaluate(() => localStorage.getItem("reelcase.media-feedback.v1"));
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(
        (secret) =>
          localStorage.setItem(
            "reelcase.media-feedback.v1",
            JSON.stringify({
              ratings: { saved: 5 },
              notes: { saved: secret },
              ratingHistory: {},
              creatorRatings: {},
              creatorLikes: {},
              creatorFavorites: {},
              tagLikes: {},
              tagHeartHistory: {},
              watchTime: {},
            }),
          ),
        secret,
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      const rootPanel = page.getByRole("region", { name: "Companion folder access" }),
        baseline = await saved();
      assert.equal(statusReads, 0);
      assert.equal(changes, 0);
      await rootPanel.getByRole("button", { name: "Review approved folders", exact: true }).click();
      await rootPanel.getByText("Configured folder 1 · Approved", { exact: true }).waitFor();
      assert.equal(statusReads, 1);
      await rootPanel.getByRole("button", { name: "Revoke folder access", exact: true }).click();
      await rootPanel.getByRole("region", { name: "Folder access consequence review" }).waitFor();
      await rootPanel.getByRole("button", { name: "Cancel access change", exact: true }).click();
      assert.equal(changes, 0);
      assert.equal(await saved(), baseline);
      checks.push(
        "Folder review is explicit and cancelling consequence review changes no permission or personal record",
      );
      const preview = rootPanel.getByLabel("Diagnostic privacy preview");
      await preview.locator("summary").click();
      await preview.getByRole("button", { name: "Preview diagnostic JSON", exact: true }).click();
      const text = await preview.getByLabel("Shareable diagnostic JSON").inputValue();
      assert(!text.includes(secret));
      assert(!text.includes(rootId));
      assert.equal(JSON.parse(text).roots[0].state, "approved");
      let wait = page.waitForEvent("download");
      await rootPanel
        .getByRole("button", { name: "Export folder status diagnostic", exact: true })
        .click();
      let downloaded = await wait;
      const rootData = await readFile(await downloaded.path(), "utf8");
      assert.equal(rootData, text);
      checks.push(
        "Root diagnostic preview and download omit paths, root IDs, tokens and unexpected nested values",
      );
      await rootPanel.getByRole("button", { name: "Revoke folder access", exact: true }).click();
      await rootPanel.getByRole("button", { name: "Confirm revoke access", exact: true }).click();
      await rootPanel.getByText("Configured folder 1 · Revoked", { exact: true }).waitFor();
      assert.equal(changes, 1);
      assert.equal(await saved(), baseline);
      await rootPanel.getByLabel("Shareable diagnostic JSON").waitFor({ state: "detached" });
      await rootPanel.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", "-" + report.viewport + "-revoked.png"),
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      assert.equal(statusReads, 1);
      await rootPanel.getByRole("button", { name: "Review approved folders", exact: true }).click();
      await rootPanel.getByText("Configured folder 1 · Revoked", { exact: true }).waitFor();
      stale = true;
      await rootPanel
        .getByRole("button", { name: "Restore configured access", exact: true })
        .click();
      await rootPanel.getByRole("button", { name: "Confirm restore access", exact: true }).click();
      await rootPanel
        .getByRole("status")
        .filter({ hasText: "Refresh before choosing again" })
        .waitFor();
      assert.equal(enabled, false);
      assert.equal(changes, 2);
      await rootPanel.getByRole("button", { name: "Review approved folders", exact: true }).click();
      await rootPanel
        .getByRole("button", { name: "Restore configured access", exact: true })
        .click();
      await rootPanel.getByRole("button", { name: "Confirm restore access", exact: true }).click();
      await rootPanel.getByText("Configured folder 1 · Approved", { exact: true }).waitFor();
      assert.equal(changes, 3);
      assert.equal(await saved(), baseline);
      checks.push(
        "Revocation survives reload; stale generations fail visibly and explicit refreshed reapproval starts no jobs",
      );
      const enable = page.getByRole("button", { name: "Enable diagnostics", exact: true });
      if (await enable.count()) await enable.click();
      const score = page.getByRole("region", { name: "Performance scorecard", exact: true });
      await score.getByRole("button", { name: "Refresh scorecard", exact: true }).click();
      const sp = score.getByLabel("Diagnostic privacy preview");
      await sp.locator("summary").click();
      await sp.getByRole("button", { name: "Preview diagnostic JSON", exact: true }).click();
      const performance = await sp.getByLabel("Shareable diagnostic JSON").inputValue();
      assert(!performance.includes(secret));
      assert.equal(JSON.parse(performance).diagnostic.kind, "performance");
      wait = page.waitForEvent("download");
      await score.getByRole("button", { name: "Export measurements", exact: true }).click();
      downloaded = await wait;
      const measurements = await readFile(await downloaded.path(), "utf8");
      assert.equal(measurements, performance);
      assert(!measurements.includes(privatePath));
      checks.push(
        "Performance privacy preview matches downloaded measurements without personal library data",
      );
      const pack = page.getByRole("region", { name: "Library pack transfer" });
      await pack.getByText("Private backup · contains personal data.", { exact: false }).waitFor();
      wait = page.waitForEvent("download");
      await pack
        .getByRole("button", { name: "Export streaming library pack", exact: true })
        .click();
      downloaded = await wait;
      const bytes = await readFile(await downloaded.path());
      const checked = await preflightPack(
        new File([bytes], downloaded.suggestedFilename()),
        {},
        { turn: async () => {} },
      );
      assert(checked.report.ok, JSON.stringify(checked.report.issues));
      assert.equal(checked.files.get("marks/ratings.json").notes.saved, secret);
      assert.equal(checked.files.get("marks/ratings.json").ratings.saved, 5);
      checks.push(
        "Deliberately private backup keeps exact personal notes and ratings and remains valid for import",
      );
      await score.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", "-" + report.viewport + "-privacy.png"),
      });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
      old = true;
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      const count = statusReads;
      await rootPanel.getByRole("button", { name: "Review approved folders", exact: true }).click();
      await rootPanel.getByRole("status").filter({ hasText: "v15+" }).waitFor();
      assert.equal(statusReads, count);
      checks.push(
        "Older Companion is clearly unsupported for permission changes and dispatches no root operation",
      );
      assert.deepEqual(errors, []);
    } catch (error) {
      report.failure = error.stack;
      await page
        .screenshot({ path: output.replace(".json", "-" + report.viewport + "-failure.png") })
        .catch(() => {});
      throw error;
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
        url,
        reports,
        scope:
          "Isolated desktop/mobile storage and synthetic Companion responses. Real HTTP enforcement is verified separately in root-access-http-check.mjs; no user permissions or service were changed.",
      },
      null,
      2,
    ),
  );
}
console.log(JSON.stringify({ ok: true, output, reports }, null, 2));
