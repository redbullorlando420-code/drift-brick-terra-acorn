import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
import { NEXT_LEVEL_MISSIONS } from "../src/lib/mission-next-level.ts";

const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/mission200-browser.json", [
  resolve("screenshots"),
]);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const reports = [];
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    const page = await context.newPage(),
      errors = [],
      checks = [];
    const report = { viewport: viewport.name, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (message) => {
      if (message.type() === "error" && !/ERR_ABORTED/.test(message.text()))
        errors.push(message.text());
    });
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            if (window.__denyCopy) throw Error("Denied");
            window.__copiedBrief = text;
          },
        },
      });
    });
    await context.route("http://127.0.0.1:43123/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    const nav = async () => {
      if (viewport.name === "mobile")
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: /^Mission plan(?:\s+\d+)?$/ })
        .click();
      await page.getByRole("region", { name: "Mission delivery queue" }).waitFor();
    };
    const readPlan = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem("reelcase.mission-plan.v1")));
    const downloadText = async (name) => {
      const pending = page.waitForEvent("download");
      await page.getByRole("button", { name, exact: true }).click();
      const result = await pending;
      return {
        filename: result.suggestedFilename(),
        text: await readFile(await result.path(), "utf8"),
      };
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      const fixture = NEXT_LEVEL_MISSIONS.map((m) =>
        m.id === "next-010" ? { ...m, done: false, status: "blocked" } : m,
      );
      fixture.push({
        id: "custom-preserved",
        title: "My custom milestone",
        detail: "Keep my exact custom words",
        done: false,
        status: "in-progress",
      });
      await page.evaluate((rows) => {
        localStorage.setItem("reelcase.mission-plan.revision", "83");
        localStorage.setItem("reelcase.mission-plan.v1", JSON.stringify(rows));
      }, fixture);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      let saved = await readPlan();
      assert.equal(saved.length, 410);
      assert.equal(saved.filter((m) => /^next-\d{3}$/.test(m.id)).length, 200);
      assert.equal(saved.find((m) => m.id === "next-010").status, "blocked");
      assert.equal(saved.find((m) => m.id === "next-010").done, false);
      assert.equal(
        saved.find((m) => m.id === "custom-preserved").detail,
        "Keep my exact custom words",
      );
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.mission-plan.revision")),
        "101",
      );
      assert(
        saved
          .filter((m) => Number(m.id.slice(5)) >= 101 && /^next-/.test(m.id))
          .every((m) => ['next-101','next-105','next-106','next-108','next-111','next-112','next-113','next-116','next-117','next-121','next-122','next-123','next-124','next-125','next-126','next-127','next-128','next-131','next-132','next-133','next-134','next-135','next-137','next-138','next-139','next-141','next-142','next-143','next-151','next-153','next-154','next-155','next-158','next-160','next-171','next-176','next-180'].includes(m.id) ? m.done && m.status === 'complete' : !m.done && m.status === "planned"),
      );
      checks.push(
        "Revision-83 plan gains exactly 100 entries with only thirty-seven evidenced new-batch completions; old manual decisions remain intact",
      );
      await page.getByRole('button', { name: 'Show completed work', exact: true }).click();
      await page.getByRole('button', { name: 'Restore Profile rename lifecycle to planned work', exact: true }).click();
      await page.getByRole('button', { name: 'Hide completed work', exact: true }).click();
      const queue = page.getByRole("region", { name: "Mission delivery queue" });
      await queue
        .getByRole("combobox", { name: "Milestone batch", exact: true })
        .selectOption("new");
      await queue.getByText("64 matching active milestones", { exact: false }).waitFor();
      assert.equal(await queue.locator("[data-mission-id]").count(), 20);
      assert.equal(
        await queue.locator("[data-mission-id]").first().getAttribute("data-mission-id"),
        "next-101",
      );
      await queue.getByRole("button", { name: "Next milestones", exact: true }).click();
      assert.equal(
        await queue.locator("[data-mission-id]").first().getAttribute("data-mission-id"),
        "next-148",
      );
      await queue
        .getByRole("combobox", { name: "Milestone workstream" })
        .selectOption("Archive continuity and growth");
      assert.equal(await queue.locator("[data-mission-id]").count(), 5);
      assert.equal(
        await queue.locator("[data-mission-page]").getAttribute("data-mission-page"),
        "1",
      );
      await queue.getByRole("combobox", { name: "Milestone priority" }).selectOption("P0");
      assert.equal(await queue.locator("[data-mission-id]").count(), 2);
      await queue.getByRole("button", { name: "Clear filters", exact: true }).click();
      assert.equal(
        await queue.getByRole("combobox", { name: "Milestone batch" }).inputValue(),
        "all",
      );
      await queue.getByRole("combobox", { name: "Milestone batch" }).selectOption("first");
      assert.equal(await queue.locator("[data-mission-id]").count(), 5);
      await queue.getByRole("button", { name: "Clear filters", exact: true }).click();
      await queue.getByRole("combobox", { name: "Milestone batch" }).selectOption("new");
      await queue.getByRole("textbox", { name: "Search milestones", exact: true }).fill("next-101");
      const card = queue.locator('[data-mission-id="next-101"]');
      assert.equal(await queue.locator("[data-mission-id]").count(), 1);
      await card.getByText("Implementation brief", { exact: true }).click();
      await card.getByText("Acceptance checks", { exact: true }).waitFor();
      await card.locator('p').filter({ hasText: /Dependencies:.*next-010.*Blocked/ }).waitFor();
      await card
        .getByRole("button", { name: "Copy model brief for Profile rename lifecycle", exact: true })
        .click();
      await queue.getByRole("status").filter({ hasText: "Copied next-101" }).waitFor();
      const copied = await page.evaluate(() => window.__copiedBrief);
      assert(copied.includes("next-010 — Portable profile boundaries [blocked]"));
      assert(
        copied.includes("## Execution contract") &&
          copied.includes("src/lib/local-profiles.ts") &&
          copied.includes("## Required handoff"),
      );
      await page.evaluate(() => (window.__denyCopy = true));
      await card
        .getByRole("button", { name: "Copy model brief for Profile rename lifecycle", exact: true })
        .click();
      const fallback = queue.getByRole("textbox", { name: "Model brief to copy", exact: true });
      await fallback.waitFor();
      assert.equal(await fallback.inputValue(), copied);
      await page.evaluate(() => (window.__denyCopy = false));
      await card
        .getByRole("button", { name: "Copy model brief for Profile rename lifecycle", exact: true })
        .click();
      await fallback.waitFor({ state: "detached" });
      checks.push(
        "Batch, track, priority, paging and search keep 20 cards mounted; expanded/copy/fallback briefs resolve current old-batch prerequisite state",
      );
      await card
        .getByRole("button", { name: "Start Profile rename lifecycle", exact: true })
        .click();
      await card
        .getByRole("button", { name: "Mark Profile rename lifecycle blocked", exact: true })
        .click();
      await queue
        .getByRole("combobox", { name: "Milestone status filter" })
        .selectOption("blocked");
      assert.equal(await queue.locator("[data-mission-id]").count(), 1);
      await card
        .getByRole("button", { name: "Resume Profile rename lifecycle", exact: true })
        .click();
      assert.equal(await queue.locator("[data-mission-id]").count(), 0);
      await queue.getByRole("combobox", { name: "Milestone status filter" }).selectOption("all");
      const newExport = await downloadText("Download new 100 briefs");
      assert.equal(newExport.filename, "realhub-new-100-model-briefs.md");
      assert.equal((newExport.text.match(/^# next-\d{3} — /gm) ?? []).length, 100);
      assert(newExport.text.includes("# next-101 — Profile rename lifecycle\nStatus: in-progress"));
      assert(newExport.text.includes("next-010 — Portable profile boundaries [blocked]"));
      assert(!newExport.text.includes("# next-001 —"));
      assert(
        newExport.text.includes("# next-200 —") &&
          newExport.text.includes("## External requirement"),
      );
      const allExport = await downloadText("Download 200 model briefs");
      assert.equal((allExport.text.match(/^# next-\d{3} — /gm) ?? []).length, 200);
      const csv = await downloadText("Export mission plan");
      for (const text of [
        "next-200",
        "custom-preserved",
        "Keep my exact custom words",
        "entry_points",
        "acceptance",
      ])
        assert(csv.text.includes(text));
      checks.push(
        "New-only and full Markdown downloads contain 100/200 briefs with saved statuses and dependency context; full CSV retains custom notes",
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      saved = await readPlan();
      assert.equal(saved.length, 410);
      assert.equal(saved.find((m) => m.id === "next-101").status, "in-progress");
      assert.equal(saved.find((m) => m.id === "next-010").status, "blocked");
      assert.equal(
        saved.find((m) => m.id === "custom-preserved").detail,
        "Keep my exact custom words",
      );
      await queue.getByRole("combobox", { name: "Milestone batch" }).selectOption("new");
      await queue.getByRole("textbox", { name: "Search milestones", exact: true }).fill("next-101");
      await queue
        .locator('[data-mission-id="next-101"]')
        .getByText("Implementation brief", { exact: true })
        .click();
      await queue.scrollIntoViewIfNeeded();
      await page.screenshot({ path: output.replace(".json", "-" + viewport.name + ".png") });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      checks.push(
        "New statuses persist after reload with no duplicate rows, console errors or horizontal overflow",
      );
    } catch (error) {
      report.error = error.stack;
      await page
        .screenshot({ path: output.replace(".json", "-" + viewport.name + "-failure.png") })
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
              "Disposable browser contexts and synthetic plan fixtures only; real user profiles and media were not modified.",
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
