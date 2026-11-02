import assert from "node:assert/strict";
import { resolve } from "node:path";
import { writeFile, readFile } from "node:fs/promises";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { fromJSON } from "seroval";
import { zipSync, strToU8, unzipSync, strFromU8 } from "fflate";
import { identityReviewStorageFixture } from "./identity-review-storage-fixture.mjs";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/milestone80-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0identity-review-probe",
  build = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "probe",
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) =>
          id === entry
            ? [
                "persist",
                "twitch-channel-identity",
                "twitch-alias-repository",
                "pack-review-repository",
              ]
                .map(
                  (n) =>
                    "export * from " +
                    JSON.stringify(resolve("src/lib/videos/" + n + ".ts").replaceAll("\\", "/")) +
                    ";",
                )
                .join("\n") +
              "\nexport * from " +
              JSON.stringify(resolve("src/lib/writer-lease.ts").replaceAll("\\", "/")) +
              ";"
            : undefined,
      },
    ],
  }),
  generated = await build.generate({ format: "esm" });
await build.close();
const code = generated.output.find((o) => o.type === "chunk").code;
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
const find = (v, test) => {
  if (!v || typeof v !== "object") return;
  if (test(v)) return v;
  for (const child of Object.values(v)) {
    const r = find(child, test);
    if (r) return r;
  }
};
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
      checks = [],
      report = { mobile, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => errors.push(e.message));
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.pull-settings.v1", JSON.stringify({ automaticPulls: false }));
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      localStorage.setItem("reelcase.artwork-mode", "text");
    });
    await context.route("**/__identity-review-probe.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    let aliasMode = "rename";
    await context.route("**/_serverFn/**", async (r) => {
      let raw;
      try {
        raw = fromJSON(JSON.parse(r.request().postData() ?? "{}"));
      } catch {}
      const data = find(raw, (v) => v.userId === "123");
      let result = {};
      if (data) {
        if (aliasMode === "error") return r.fulfill({ status: 503, body: "Provider unavailable" });
        result = {
          alias:
            aliasMode === "same"
              ? undefined
              : { version: 1, userId: "123", from: "old", to: "renamed", checkedAt: Date.now() },
        };
      }
      return r.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ result, context: {} }),
      });
    });
    const probe = () =>
      page.evaluate(async () => {
        window.__probe = await import("/__identity-review-probe.mjs");
      });
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    };
    const openCreator = async () => {
      await nav("Twitch");
      await page.getByRole("button", { name: "Manage Old creator", exact: true }).first().click();
      await page.getByRole("region", { name: "Twitch login identity" }).waitFor();
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await page.evaluate(async () => {
        const p = window.__probe,
          now = Date.now();
        p.saveFollows([
          {
            id: "tw:old",
            kind: "twitch",
            handle: "old",
            title: "Old creator",
            channelId: "123",
            lastCheckedAt: now,
            twitchPullPolicy: { version: 1, clips: false, vods: true, priority: "high" },
          },
        ]);
        await p.saveRemoteSnapshot({
          videos: [
            {
              id: "tw:v:55",
              folderId: "tw:old",
              name: "Identity fixture VOD",
              path: "twitch/old/55",
              extension: "vod",
              mime: "video/twitch",
              size: 0,
              addedAt: now - 10000,
              remote: {
                kind: "twitch",
                videoId: "55",
                channelId: "123",
                channelName: "Old creator",
                watchUrl: "https://www.twitch.tv/videos/55",
              },
            },
          ],
          folders: [{ id: "tw:old", name: "Old creator", kind: "twitch", videoCount: 1 }],
          checkedAt: now,
        });
        await p.saveDurableFeedback({
          ratings: { "tw:v:55": 5 },
          ratingHistory: { "tw:v:55": { rating: 5, updatedAt: 200 } },
          notes: { "tw:v:55": "Keep my note" },
          creatorRatings: { "old creator": 4 },
          creatorLikes: {},
          creatorFavorites: {},
          tagLikes: {},
          tagHeartHistory: {},
          watchTime: {},
        });
        p.saveDurableResume(
          { "tw:v:55": { t: 20, d: 100, at: 200 } },
          { "id:tw:v:55": { t: 20, d: 100, at: 200 } },
        );
        p.savePrefs({
          ...p.loadPrefs(),
          tags: { "tw:v:55": ["racing"] },
          metadataProvenance: {
            "tw:v:55": { tags: { racing: "manual" }, lockedFields: ["tags"], manualTagsAt: 200 },
          },
          categories: { "tw:v:55": "Sports" },
          progress: {},
          resumeProgress: {},
          viewCounts: {},
          cameCounts: {},
          favorites: [],
          likes: [],
          history: [],
          sourceId: "home",
          view: "grid",
          sort: "name",
        });
        await p.waitForDurableWrites();
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await openCreator();
      let panel = page.getByRole("region", { name: "Twitch login identity" });
      await panel.getByRole("button", { name: "Check current Twitch login", exact: true }).click();
      await panel
        .getByRole("button", { name: "Apply verified login change", exact: true })
        .waitFor();
      await panel.getByRole("button", { name: "Keep saved login", exact: true }).click();
      assert.equal((await page.evaluate(() => window.__probe.loadFollows()))[0].handle, "old");
      aliasMode = "error";
      await panel.getByRole("button", { name: "Check current Twitch login", exact: true }).click();
      await panel
        .getByRole("button", { name: "Check current Twitch login", exact: true })
        .waitFor({ state: "visible" });
      await page.waitForFunction(
        () => !document.querySelector('[aria-label="Twitch login identity"] button')?.disabled,
      );
      assert.equal((await page.evaluate(() => window.__probe.loadFollows()))[0].handle, "old");
      aliasMode = "rename";
      await panel.getByRole("button", { name: "Check current Twitch login", exact: true }).click();
      await panel.getByRole("button", { name: "Apply verified login change", exact: true }).click();
      await panel.getByText(/Previous logins · old/).waitFor();
      assert.equal((await page.evaluate(() => window.__probe.loadFollows()))[0].handle, "renamed");
      await panel.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile-alias.png" : "-desktop-alias.png"),
      });
      checks.push(
        "Twitch identity check, cancellation, provider failure and verified rename retain canonical source, policy and original alias",
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await openCreator();
      assert.equal(
        (await page.evaluate(() => window.__probe.loadFollows()))[0].twitchAliasRevision,
        1,
      );
      await page.getByText("4 of 5 stars", { exact: true }).waitFor();
      checks.push("Alias journal, creator rating and pull policy survive reload");
      await nav("Settings");
      let transfer = page.getByRole("region", { name: "Library pack transfer" });
      await transfer.waitFor();
      const files = {
        "reelcase-library-pack/marks/ratings.json": {
          ratings: { "tw:v:55": 1 },
          ratingHistory: { "tw:v:55": { rating: 1, updatedAt: 100 } },
          notes: { "tw:v:55": "Imported note" },
        },
        "reelcase-library-pack/resume/resume.json": {
          progress: { "tw:v:55": { t: 80, d: 100, at: 100 } },
          resumeProgress: { "id:tw:v:55": { t: 80, d: 100, at: 100 } },
        },
        "reelcase-library-pack/marks/metadata.json": {
          tags: { "tw:v:55": ["cars"] },
          categories: { "tw:v:55": "Sports" },
          metadataProvenance: {
            "tw:v:55": { tags: { cars: "provider:twitch" }, lockedFields: ["category"] },
          },
        },
      };
      await transfer.getByLabel("Backup file to inspect", { exact: true }).setInputFiles({
        name: "review-fixture.zip",
        mimeType: "application/zip",
        buffer: Buffer.from(
          zipSync(
            Object.fromEntries(
              Object.entries(files).map(([k, v]) => [k, strToU8(JSON.stringify(v))]),
            ),
          ),
        ),
      });
      let fields = transfer.getByRole("region", { name: "Backup field choices" });
      await fields.waitFor();
      assert.equal(
        await transfer
          .getByRole("button", { name: "Apply reviewed import", exact: true })
          .isEnabled(),
        false,
      );
      await fields.getByRole("button", { name: "Keep all current fields", exact: true }).click();
      await fields
        .getByLabel("Backup choice notes tw:v:55", { exact: true })
        .selectOption("imported");
      await transfer.getByRole("button", { name: "Save review for later", exact: true }).click();
      await transfer.getByText(/Backup review saved locally/).waitFor();
      await fields.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile-fields.png" : "-desktop-fields.png"),
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await nav("Settings");
      transfer = page.getByRole("region", { name: "Library pack transfer" });
      await transfer.getByRole("button", { name: "Resume saved review", exact: true }).click();
      await transfer
        .getByText("Saved review resumed. Choices were preserved.", { exact: true })
        .waitFor();
      fields = transfer.getByRole("region", { name: "Backup field choices" });
      assert.equal(
        await fields.getByLabel("Backup choice notes tw:v:55", { exact: true }).inputValue(),
        "imported",
      );
      checks.push(
        "Backup inspection blocks unresolved fields; explicit choices and private draft resume across reload",
      );
      await page.evaluate(async () => {
        const p = window.__probe,
          current = await p.restoreDurableFeedback();
        await p.saveDurableFeedback({
          ...current,
          notes: { ...current.notes, "tw:v:55": "A newer current note" },
        });
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await nav("Settings");
      transfer = page.getByRole("region", { name: "Library pack transfer" });
      await transfer.getByRole("button", { name: "Resume saved review", exact: true }).click();
      await transfer
        .getByText("Library data changed. The backup is retained; review choices again.", {
          exact: true,
        })
        .waitFor();
      fields = transfer.getByRole("region", { name: "Backup field choices" });
      assert.equal(
        await fields.getByLabel("Backup choice notes tw:v:55", { exact: true }).inputValue(),
        "",
      );
      checks.push(
        "A relevant edit invalidates saved choices; the backup remains available for a fresh review",
      );
      await fields
        .getByRole("button", { name: "Merge safe fields; keep other current fields", exact: true })
        .click();
      await fields
        .getByLabel("Backup choice notes tw:v:55", { exact: true })
        .selectOption("imported");
      await transfer
        .getByLabel("I reviewed the source, current destination, differing records and import policy", { exact: true })
        .check();
      await transfer.getByRole("button", { name: "Apply reviewed import", exact: true }).click();
      await transfer.getByText(/Import applied ·/).waitFor();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await nav("Settings");
      transfer = page.getByRole("region", { name: "Library pack transfer" });
      await transfer.getByText("Legacy ZIP and Companion-folder export", { exact: true }).click();
      const downloading = page.waitForEvent("download");
      await transfer.getByRole("button", { name: "Download legacy ZIP", exact: true }).click();
      const downloaded = await downloading,
        zip = unzipSync(new Uint8Array(await readFile(await downloaded.path())));
      const json = (suffix) =>
        JSON.parse(strFromU8(zip[Object.keys(zip).find((k) => k.endsWith(suffix))]));
      assert.equal(json("marks/ratings.json").ratings["tw:v:55"], 5);
      assert.equal(json("marks/ratings.json").notes["tw:v:55"], "Imported note");
      assert.equal(json("resume/resume.json").resumeProgress["id:tw:v:55"].t, 20);
      assert.deepEqual(json("marks/metadata.json").tags["tw:v:55"], ["racing", "cars"]);
      assert.deepEqual(
        new Set(json("marks/metadata.json").metadataProvenance["tw:v:55"].lockedFields),
        new Set(["tags", "category"]),
      );
      assert.equal(json("follows/twitch.json").channels[0].handle, "renamed");
      assert.equal(
        await page.evaluate(async () => await window.__probe.loadPackReview()),
        undefined,
      );
      checks.push(
        "Reviewed import and real ZIP export preserve chosen rating, imported note, newer resume, tag union, locks and alias after reload",
      );
      // Pass exports explicitly in page scope; functions cannot cross the browser transport.
      report.storage = await page.evaluate(async (source) => {
        const run = (0, eval)("(" + source + ")");
        return run(window.__probe);
      }, identityReviewStorageFixture.toString());
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.ok = true;
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
            ok: reports.every((r) => r.ok),
            reports,
            limitations:
              "Isolated desktop/mobile Chrome profiles, controlled Twitch responses and native browser IndexedDB. No real provider account or user library was changed. Whole-library atomic restore remains open.",
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
