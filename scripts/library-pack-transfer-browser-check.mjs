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
const { libraryPackSections, exportStreamingPack, packBlobSink } =
  await import("../src/lib/videos/library-pack-stream.ts");
const { preflightPack } = await import("../src/lib/videos/pack-preflight.ts");
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/pack-transfer-browser.json", [
    resolve("screenshots"),
  ]);
const input = {
  follows: [
    {
      id: "yt:UC" + "b".repeat(22),
      kind: "youtube",
      handle: "@imported",
      title: "Imported creator",
      channelId: "UC" + "b".repeat(22),
    },
  ],
  history: [{ id: "saved", at: 1000, title: "Saved fixture" }],
  links: [],
  favorites: ["saved"],
  likes: [],
  viewCounts: { saved: 2 },
  cameCounts: {},
  progress: { saved: { t: 12, d: 120, at: 1000 } },
  resumeProgress: {},
};
const sink = packBlobSink();
await exportStreamingPack(
  libraryPackSections(input, {
    ratings: { saved: 5 },
    notes: { saved: "Imported note" },
    tagLikes: { manual: true },
  }),
  sink.sink,
  { turn: async () => {} },
);
const fixture = Buffer.from(await sink.result().arrayBuffer());
const large = packBlobSink();
await exportStreamingPack(
  libraryPackSections(
    { ...input, follows: [], history: [], favorites: [], viewCounts: {}, progress: {} },
    {
      notes: Object.fromEntries(
        Array.from({ length: 100000 }, (_, i) => [i === 0 ? "saved" : "id:" + i, "note " + i]),
      ),
    },
  ),
  large.sink,
  { turn: async () => {} },
);
const largeFixture = Buffer.from(await large.result().arrayBuffer());
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
        viewport,
        acceptDownloads: true,
        isMobile: viewport.name === "mobile",
        hasTouch: viewport.name === "mobile",
      }),
      page = await context.newPage(),
      errors = [],
      checks = [];
    const report = { viewport: viewport.name, errors, checks };
    reports.push(report);
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
        body: JSON.stringify({ result: null, context: {} }),
      }),
    );
    const nav = async () => {
      if (viewport.name === "mobile")
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: "Settings", exact: true })
        .click();
    };
    const state = () =>
      page.evaluate(() => [
        localStorage.getItem("reelcase.follows.v1"),
        localStorage.getItem("reelcase.media-feedback.v1"),
      ]);
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(() => {
        const id = "UC" + "a".repeat(22);
        localStorage.setItem(
          "reelcase.follows.v1",
          JSON.stringify({
            channels: [
              {
                id: "yt:" + id,
                kind: "youtube",
                channelId: id,
                handle: "@current",
                title: "Current creator",
              },
            ],
            savedAt: Date.now(),
          }),
        );
        localStorage.setItem(
          "reelcase.media-feedback.v1",
          JSON.stringify({
            ratings: { saved: 1 },
            notes: { saved: "Current note" },
            ratingHistory: {},
            creatorRatings: {},
            creatorLikes: {},
            creatorFavorites: {},
            tagLikes: {},
            tagHeartHistory: {},
            watchTime: {},
          }),
        );
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      const region = page.getByRole("region", { name: "Library pack transfer" }),
        upload = region.getByLabel("Backup file to inspect"),
        baseline = await state();
      await upload.setInputFiles({
        name: "future.json",
        mimeType: "application/json",
        buffer: Buffer.from(JSON.stringify({ version: 99, ratings: { saved: 5 } })),
      });
      await region.getByRole("heading", { name: "Import blocked" }).waitFor();
      assert.equal(await region.getByRole("button", { name: "Apply reviewed import" }).count(), 0);
      assert.deepEqual(await state(), baseline);
      checks.push("Future version blocked before storage mutation");
      await region.getByRole("button", { name: "Discard blocked report" }).click();
      await upload.setInputFiles({
        name: "fixture.reelpack",
        mimeType: "application/x-reelcase-library-pack",
        buffer: fixture,
      });
      await region.getByRole("heading", { name: "Ready for review" }).waitFor();
      assert.deepEqual(await state(), baseline);
      assert(await region.getByRole("button", { name: "Apply reviewed import" }).isDisabled());
      await region.getByLabel("Follow import policy").selectOption("replace-follows");
      await region.getByText("The current 1 YouTube/Twitch follows", { exact: false }).waitFor();
      await region.getByLabel("Follow import policy").selectOption("merge");
      await region.getByText("Review differing records · first 20", { exact: true }).click();
      await region.getByText("marks/ratings.json:notes[saved]", { exact: false }).waitFor();
      await region.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", "-" + viewport.name + "-review.png"),
        fullPage: false,
      });
      checks.push(
        "Read-only review lists differing personal records and replace-follows consequences",
      );
      await region.getByRole("button", { name: "Discard review", exact: true }).click();
      assert.deepEqual(await state(), baseline);
      await upload.setInputFiles({
        name: "large.reelpack",
        mimeType: "application/x-reelcase-library-pack",
        buffer: largeFixture,
      });
      await region.getByRole("button", { name: "Cancel backup operation" }).click();
      await region.getByRole("status").filter({ hasText: "Cancelled." }).waitFor();
      assert.deepEqual(await state(), baseline);
      assert.equal(await region.getByRole("heading", { name: "Ready for review" }).count(), 0);
      checks.push(
        "100,000-record inspection remains cancellable and leaves saved preferences unchanged",
      );

      await upload.setInputFiles({
        name: "large.reelpack",
        mimeType: "application/x-reelcase-library-pack",
        buffer: largeFixture,
      });
      await region.getByRole("heading", { name: "Ready for review" }).waitFor();
      const preflight = region.getByLabel("Backup preflight report");
      assert.equal(
        await preflight
          .locator("dl > div")
          .filter({ has: page.locator("dt", { hasText: "Records" }) })
          .locator("dd")
          .textContent(),
        "100,000",
      );
      assert.equal(
        await preflight
          .locator("dl > div")
          .filter({ has: page.locator("dt", { hasText: "Differing existing values" }) })
          .locator("dd")
          .textContent(),
        "1",
      );
      await preflight.getByText("Review differing records · first 20", { exact: true }).click();
      await preflight.getByText("marks/ratings.json:notes[saved]", { exact: false }).waitFor();
      assert.deepEqual(await state(), baseline);
      await preflight.getByRole("button", { name: "Discard review", exact: true }).click();
      checks.push(
        "Complete 100,000-record preflight identifies the existing note conflict without applying it",
      );
      await upload.setInputFiles({
        name: "fixture.reelpack",
        mimeType: "application/x-reelcase-library-pack",
        buffer: fixture,
      });
      await region.getByRole("heading", { name: "Ready for review" }).waitFor();
      await region.getByLabel("I reviewed the differing records and import policy").check();
      await region.getByRole("button", { name: "Apply reviewed import", exact: true }).click();
      await region.getByRole("status").filter({ hasText: "Import applied" }).waitFor();
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("reelcase.follows.v1") ?? "{}").channels?.length === 2 &&
          JSON.parse(localStorage.getItem("reelcase.media-feedback.v1") ?? "{}").ratings?.saved ===
            5,
      );
      checks.push("Explicit reviewed import merges follows and replaces matching ratings");
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      assert.equal(JSON.parse((await state())[0]).channels.length, 2);
      assert.equal(JSON.parse((await state())[1]).notes.saved, "Imported note");
      checks.push("Imported creator and personal preferences survive reload");
      const event = page.waitForEvent("download");
      await region
        .getByRole("button", { name: "Export streaming library pack", exact: true })
        .click();
      const download = await event;
      assert(download.suggestedFilename().endsWith(".reelpack"));
      const bytes = await readFile(await download.path());
      const restored = await preflightPack(
        new File([bytes], download.suggestedFilename()),
        {},
        { turn: async () => {} },
      );
      assert(restored.report.ok, JSON.stringify(restored.report.issues));
      assert.equal(restored.files.get("marks/ratings.json").ratings.saved, 5);
      assert.equal(restored.files.get("follows/youtube.json").channels.length, 2);
      report.export = { bytes: bytes.length, records: restored.report.records };
      checks.push(
        "Downloaded streaming backup passes integrity and schema preflight with exact saved values",
      );
      await region.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", "-" + viewport.name + "-complete.png"),
        fullPage: false,
      });
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(errors, []);
    } catch (e) {
      report.failure = e.stack;
      await page
        .screenshot({ path: output.replace(".json", "-" + viewport.name + "-failure.png") })
        .catch(() => {});
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
        url,
        reports,
        scope:
          "Isolated browser storage with synthetic personal metadata; no real Companion writes or provider account calls.",
      },
      null,
      2,
    ),
  );
}
console.log(JSON.stringify({ ok: true, output, reports }, null, 2));
