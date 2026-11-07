import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/recommendation-continuity-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0continuity-fixture",
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
                  (f) => "export * from " + JSON.stringify(resolve(f).replaceAll("\\", "/")) + ";",
                )
                .join("\n")
            : undefined,
      },
    ],
  });
const code = (await bundle.generate({ format: "esm" })).output.find((r) => r.type === "chunk").code;
await bundle.close();
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
    await context.route("**/__continuity.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__continuity.html", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: "<!doctype html><p>Disposable continuity fixture</p>",
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
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      const put = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (v, k) {
        if (window.__undoQuota && this.name === "activity" && k === "feedback")
          throw new DOMException("Controlled undo quota", "QuotaExceededError");
        return put.call(this, v, k);
      };
    });
    const nav = async () => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      const scope = page.getByRole("navigation", { name: "Library navigation" }),
        group = scope.locator('button[aria-controls$="-tools"]');
      if ((await group.getAttribute("aria-expanded")) === "false") await group.click();
      await scope.getByRole("button", { name: /^AI guide(?:\s+\d+)?$/ }).click();
      await page.locator("[data-guide-catalog]").waitFor();
    };
    const ready = () => page.locator('[data-guide-catalog][data-guide-pending="false"]').waitFor();
    const feedback = () =>
      page.evaluate(async () => {
        const p = await import("/__continuity.mjs");
        return p.restoreDurableFeedback(true);
      });
    try {
      await page.goto(new URL("/__continuity.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__continuity.mjs"),
          now = Date.now(),
          channel = "UCabcdefghijklmnopqrstuv",
          other = "UCzzzzzzzzzzzzzzzzzzzzzz";
        const row = (i, c = other) => ({
          id: "yt:" + i,
          name: "Racing " + i,
          folderId: "youtube-qa",
          path: i,
          extension: "yt",
          mime: "video/youtube",
          size: 0,
          duration: 1200,
          addedAt: now - 86400000,
          remote: {
            kind: "youtube",
            videoId: i,
            channelId: c,
            channelName: c === channel ? "Fresh verified creator" : "Established creator",
            publishedSource: "provider",
            publishedPrecision: "instant",
            watchUrl: "https://www.youtube.com/watch?v=" + i,
            embedUrl: "https://www.youtube.com/embed/" + i,
          },
        });
        const videos = [
          ...Array.from({ length: 16 }, (_, i) => row("est" + i)),
          row("cold", channel),
          row("repeat"),
        ];
        await p.appendCatalogVideos(videos);
        p.savePrefs({
          ...p.loadPrefs(),
          sourceId: "home",
          follows: [
            {
              id: "yt:" + channel,
              kind: "youtube",
              channelId: channel,
              title: "Fresh verified creator",
              handle: "new",
            },
          ],
        });
        await p.waitForPrefsWrites();
        await p.saveRemoteSnapshot({
          videos: [],
          folders: [
            {
              id: "youtube-qa",
              name: "YouTube fixture",
              kind: "youtube",
              videoCount: videos.length,
            },
          ],
          checkedAt: now,
        });
        await p.saveDurableShelves(["yt:est1"], []);
        await p.saveDurableFeedback({
          ratings: { "yt:est0": 5 },
          ratingHistory: { "yt:est0": { rating: 5, updatedAt: 2 } },
          creatorRatings: {},
          creatorLikes: {},
          creatorFavorites: {},
          tagLikes: {},
          tagHeartHistory: {},
          notes: {},
          watchTime: { "yt:repeat": { preview: 12, fullscreen: 0 } },
          recommendationRejections: { version: 1, updatedAt: 0, entries: [] },
          manualTimeline: {
            version: 1,
            updatedAt: 2,
            entries: [
              {
                id: "qa-old",
                kind: "rating",
                target: "yt:est0",
                label: "Seeded prior rating",
                before: 2,
                after: 5,
                at: 2,
              },
            ],
          },
        });
        await p.saveRecommendationExposure({
          version: 1,
          updatedAt: now,
          entries: [
            { key: "youtube:repeat", count: 2, at: now - 60000 },
            { key: "youtube:est1", count: 2, at: now - 60000 },
          ],
        });
        sessionStorage.setItem(
          "qa-continuity-profile",
          (await p.createLocalProfile("Continuity alternate")).id,
        );
      });
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await ready();
      const mix = page.locator("[data-guide-picks]"),
        tuning = page.locator("[data-guide-continuity]"),
        timeline = page.locator("[data-feedback-timeline]");
      assert.equal(await mix.locator('[data-guide-suggestion="yt:repeat"]').count(), 0);
      assert.equal(await mix.locator('[data-guide-suggestion="yt:est1"]').count(), 1);
      await mix
        .getByText(/^Exploration slot:/)
        .first()
        .waitFor();
      await tuning.locator(":scope > summary").click();
      await tuning.getByRole("button", { name: "Show cooled-down picks", exact: true }).click();
      await ready();
      await mix.locator('[data-guide-suggestion="yt:repeat"]').waitFor();
      assert.equal(await mix.locator("[data-guide-suggestion]").count(), 1);
      await page.getByLabel("Library guide question", { exact: true }).fill("repeat");
      await page.getByRole("button", { name: "Ask guide", exact: true }).click();
      await page.locator('[data-guide-answer] [data-guide-suggestion="yt:repeat"]').waitFor();
      await tuning.getByRole("button", { name: "Return to regular picks", exact: true }).click();
      await ready();
      report.checks.push(
        "Confirmed cold creator has an explained bounded slot; repeat cooldown protects favorites and explicit title search; temporary cooldown review remains reachable",
      );
      await tuning.getByLabel("New creator exploration slots").selectOption("0");
      await tuning.getByLabel("Guide repeat cooldown").selectOption("6");
      await tuning.getByRole("button", { name: "Save recommendation tuning", exact: true }).click();
      await ready();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await ready();
      await tuning.locator(":scope > summary").click();
      assert.equal(await tuning.getByLabel("New creator exploration slots").inputValue(), "0");
      assert.equal(await tuning.getByLabel("Guide repeat cooldown").inputValue(), "6");
      await tuning.scrollIntoViewIfNeeded();
      await page.screenshot({path:output.replace('.json',mobile?'-mobile-controls.png':'-desktop-controls.png')});
      await timeline.locator(":scope > summary").click();
      await timeline.locator('[data-feedback-operation="qa-old"]').waitFor();
      await page.evaluate(() => (window.__undoQuota = true));
      await timeline
        .getByRole("button", { name: "Undo feedback Seeded prior rating", exact: true })
        .click();
      await timeline
        .getByRole("status")
        .filter({ hasText: /quota|save|full/i })
        .waitFor();
      assert.equal((await feedback()).ratings["yt:est0"], 5);
      await page.evaluate(() => (window.__undoQuota = false));
      await timeline
        .getByRole("button", { name: "Undo feedback Seeded prior rating", exact: true })
        .click();
      await timeline
        .getByRole("status")
        .filter({ hasText: "Feedback edit undone and saved." })
        .waitFor();
      assert.equal((await feedback()).ratings["yt:est0"], 2);
      report.checks.push(
        "Saved tuning survives reload; quota rejection preserves active/saved rating; a retry commits undo and records its durable inverse status",
      );
      await page.getByRole("button", { name: "New recommendations", exact: true }).click();
      await ready();
      const candidate = mix.locator("[data-guide-suggestion]").first();
      await candidate.locator("[data-guide-evidence] > summary").click();
      await candidate
        .getByRole("button", { name: /^Reduce / })
        .first()
        .click();
      await timeline
        .locator("[data-feedback-operation]")
        .first()
        .getByText(/^rejection ·/)
        .waitFor();
      await page.waitForTimeout(300);
      const before = await feedback();
      assert.equal(before.recommendationRejections.entries.length, 1);
      assert.equal(before.manualTimeline.entries[0].kind, "rejection");
      const latest = before.manualTimeline.entries[0].id;
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await ready();
      await timeline.locator(":scope > summary").click();
      await timeline
        .locator('[data-feedback-operation="' + latest + '"]')
        .getByRole("button", { name: /^Undo feedback / })
        .click();
      await timeline
        .getByRole("status")
        .filter({ hasText: "Feedback edit undone and saved." })
        .waitFor();
      const after = await feedback();
      assert.equal(after.recommendationRejections.entries.length, 0);
      assert.equal(after.ratings["yt:est0"], 2);
      assert.equal(after.watchTime["yt:repeat"].preview, 12);
      // A newer persistent decision from another document must block the old inverse.
      const stillOpen = after.manualTimeline.entries.find((e) => e.undoneAt === undefined);
      if (stillOpen) throw Error("Fixture expected both operations undone.");
      await page.getByRole("button", { name: "New recommendations", exact: true }).click();
      await ready();
      const fresh = mix.locator("[data-guide-suggestion]").first();
      await fresh.locator("[data-guide-evidence] > summary").click();
      await fresh
        .getByRole("button", { name: /^Reduce / })
        .first()
        .click();
      await page.waitForTimeout(350);
      const op = (await feedback()).manualTimeline.entries[0];
      await page.evaluate(async () => {
        const p = await import("/__continuity.mjs"),
          f = await p.restoreDurableFeedback(true);
        f.ratings["yt:est0"] = 4;
        f.ratingHistory["yt:est0"] = { rating: 4, updatedAt: Date.now() };
        await p.saveDurableFeedback(f);
      });
      await timeline
        .locator('[data-feedback-operation="' + op.id + '"]')
        .getByRole("button", { name: /^Undo feedback / })
        .click();
      await timeline
        .getByRole("status")
        .filter({ hasText: "Saved feedback changed in another tab." })
        .waitFor();
      assert.equal((await feedback()).ratings["yt:est0"], 4);
      assert.equal((await feedback()).recommendationRejections.entries.length, 1);
      report.checks.push(
        "A newer saved decision from another document blocks an older undo without overwriting it",
      );

      await timeline.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      await page.evaluate(() =>
        sessionStorage.setItem(
          "realhub.active-local-profile.v1",
          sessionStorage.getItem("qa-continuity-profile"),
        ),
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await ready();
      await tuning.locator(":scope > summary").click();
      assert.equal(await tuning.getByLabel("New creator exploration slots").inputValue(), "1");
      assert.equal(await timeline.locator("[data-feedback-operation]").count(), 0);
      await page.evaluate(() =>
        sessionStorage.setItem("realhub.active-local-profile.v1", "default"),
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await ready();
      await timeline.locator(":scope > summary").click();
      assert.equal(await timeline.locator("[data-feedback-operation]").count(), 3);
      report.checks.push(
        "Actual Guide rejection edits enter the timeline, survive reload and undo without changing ratings/watch observations; alternate local profiles have separate tuning and histories",
      );
      const second=await context.newPage();second.setDefaultTimeout(30000);second.on('pageerror',e=>report.errors.push(e.message));
      await second.goto(url);await second.locator('[data-home-ready="true"]').waitFor();
      if(mobile)await second.getByRole('button',{name:'Open menu',exact:true}).click();
      const scope=second.getByRole('navigation',{name:'Library navigation'}),group=scope.locator('button[aria-controls$="-tools"]');if(await group.getAttribute('aria-expanded')==='false')await group.click();await scope.getByRole('button',{name:/^AI guide(?:\s+\d+)?$/}).click();await second.locator('[data-guide-catalog][data-guide-pending="false"]').waitFor();
      assert.equal(await second.locator('[data-guide-picks] [data-guide-suggestion="yt:repeat"]').count(),0);
      const exposure=second.locator('[data-exposure-control]');await exposure.locator(':scope > summary').click();await exposure.getByRole('button',{name:'Reset recent exposure',exact:true}).click();await second.close();await page.bringToFront();
      await page.getByRole('button',{name:'New recommendations',exact:true}).click();await ready();await page.locator('[data-guide-continuity-summary]').filter({hasText:'0 titles in a 6-hour cooldown'}).waitFor();
      assert.equal((await feedback()).ratings['yt:est0'],4);assert.equal((await feedback()).watchTime['yt:repeat'].preview,12);
      report.checks.push('A second tab honors the saved repeat cooldown; its reset propagates to the first tab without erasing ratings or watch time');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(report.errors, []);
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
            limitation:
              "Disposable local catalog and feedback fixtures; no provider playback or physical-device certification.",
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
