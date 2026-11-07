import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/desk-taste-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0desk-taste-fixture",
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
    await context.route("**/__taste-fixture.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__taste-blank.html", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: "<!doctype html><p>Disposable taste fixture</p>",
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
        if (k === "reelcase.desk-taste.v1" && sessionStorage.getItem("qa-taste-quota") === "true")
          throw new DOMException("Controlled quota", "QuotaExceededError");
        return set.call(this, k, v);
      };
    });
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await (mobile ? page.getByRole("dialog") : page.locator("aside"))
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s|$)") })
        .click();
    };
    const editor = (desk) => page.locator(`[data-desk-taste="${desk}"]`);
    const open = async (desk) => {
      const area = editor(desk);
      await area.locator("summary").click();
      await area.getByRole("button", { name: "Preview desk mix", exact: true }).waitFor();
      await page.waitForTimeout(1500);
      return area;
    };
    const preview = async (area) => {
      await area.getByRole("button", { name: "Preview desk mix", exact: true }).click();
      await area.getByRole("button", { name: "Save desk overlay", exact: true }).waitFor();
      await page.waitForFunction(() => {
        const b = [...document.querySelectorAll("button")].find(
          (e) => e.textContent === "Save desk overlay",
        );
        return b && !b.disabled;
      });
    };
    try {
      await page.goto(new URL("/__taste-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__taste-fixture.mjs");
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem("reelcase.sidebar.groups.v1",JSON.stringify({library:true,workspace:true,tools:true}));
        localStorage.setItem("reelcase.pull-settings.v1", '{"automaticPulls":false}');
        localStorage.setItem("reelcase.artwork-mode", "text");
        const row = (id, creator, kind) => ({
          id,
          name: "Taste Racing " + id,
          folderId: kind === "twitch" ? "qa-twitch" : "qa-youtube",
          path: id,
          extension: "mp4",
          mime: "video/mp4",
          size: 1,
          duration: 1800,
          addedAt: 1,
          remote: { kind, videoId: id, channelName: creator },
        });
        const rows = [
          row("recorded", "Known", "twitch"),
          ...Array.from({ length: 36 }, (_, i) =>
            row("twitch-" + i, i < 18 ? "Known" : "New " + i, "twitch"),
          ),
          ...Array.from({ length: 8 }, (_, i) => row("youtube-" + i, "YT " + i, "youtube")),
          {
            ...row("private", "Private", "twitch"),
            name: "PRIVATE TASTE SENTINEL",
            privateRetention: true,
          },
        ];
        await p.appendCatalogVideos(rows);
        p.savePrefs({ ...p.loadPrefs(), sourceId: "home", follows: [] });
        await p.waitForPrefsWrites();
        await p.saveRemoteSnapshot({
          videos: [],
          folders: [
            { id: "qa-twitch", name: "Twitch fixture", kind: "twitch", videoCount: 37 },
            { id: "qa-youtube", name: "YouTube fixture", kind: "youtube", videoCount: 8 },
          ],
          checkedAt: 1,
        });
        sessionStorage.setItem(
          "qa-other-profile",
          (await p.createLocalProfile("Taste alternate")).id,
        );
      });
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Twitch");
      assert.equal(
        await editor("twitch").getByRole("button", { name: "Preview desk mix" }).count(),
        0,
      );
      let area = await open("twitch");
      assert(
        await area.getByRole("button", { name: "Save desk overlay", exact: true }).isDisabled(),
      );
      await area.getByLabel("Twitch favorite weight", { exact: true }).fill("8");
      await area.getByLabel("Twitch novelty balance", { exact: true }).selectOption("2");
      await preview(area);
      assert(
        (await area.getByLabel("Desk mix comparison").textContent()).includes(
          "neutral novelty default",
        ),
      );
      assert(!(await area.textContent()).includes("PRIVATE TASTE SENTINEL"));
      await area.getByRole("button", { name: "Use for this session", exact: true }).click();
      await area
        .locator("[data-desk-effective]")
        .filter({ hasText: "temporary desk mix" })
        .waitFor();
      assert.equal(await page.evaluate(() => localStorage.getItem("reelcase.desk-taste.v1")), null);
      await page.reload();
      await nav("Twitch");
      area = await open("twitch");
      assert(
        (await area.locator("[data-desk-effective]").textContent()).includes("shared Guide preset"),
      );
      assert.equal(
        await area.getByLabel("Twitch favorite weight", { exact: true }).inputValue(),
        "3",
      );
      await area.getByLabel("Twitch favorite weight", { exact: true }).fill("8");
      await area.getByLabel("Twitch novelty balance", { exact: true }).selectOption("2");
      await preview(area);
      await area.getByLabel("Twitch like weight", { exact: true }).fill("1");
      assert(
        await area.getByRole("button", { name: "Save desk overlay", exact: true }).isDisabled(),
      );
      await preview(area);
      await page.evaluate(() => sessionStorage.setItem("qa-taste-quota", "true"));
      await area.getByRole("button", { name: "Save desk overlay", exact: true }).click();
      await area.getByRole("alert").waitFor();
      assert.equal(await page.evaluate(() => localStorage.getItem("reelcase.desk-taste.v1")), null);
      await page.evaluate(() => sessionStorage.removeItem("qa-taste-quota"));
      await area.getByRole("button", { name: "Save desk overlay", exact: true }).click();
      await area
        .locator("[data-desk-effective]")
        .filter({ hasText: "saved desk overlay" })
        .waitFor();
      const bytes = await page.evaluate(() => localStorage.getItem("reelcase.desk-taste.v1"));
      await page.reload();
      await nav("Twitch");
      area = await open("twitch");
      assert.equal(
        await area.getByLabel("Twitch favorite weight", { exact: true }).inputValue(),
        "8",
      );
      assert(
        (await area.locator("[data-desk-effective]").textContent()).includes("saved desk overlay"),
      );
      await preview(area);
      await area.locator("[data-desk-pick-id]").first().click();
      await page.getByRole("dialog").waitFor();
      await page.keyboard.press("Escape");
      report.checks.push(
        "Collapsed controls, bounded comparison, stale draft guard, neutral no-history evidence, temporary/reload, quota rollback, durable overlay and pick preview",
      );
      await nav("Movies");
      area = await open("movies");
      assert.equal(
        await area.getByLabel("Movies favorite weight", { exact: true }).inputValue(),
        "3",
      );
      await preview(area);
      await area.getByRole("button", { name: "Save desk overlay", exact: true }).click();
      await nav("YouTube");
      area = await open("youtube");
      assert.equal(
        await area.getByLabel("YouTube novelty balance", { exact: true }).inputValue(),
        "0",
      );
      await nav("AI guide");
      await page.locator("[data-recommendation-session] summary").click();
      await page.getByLabel("Guide source mix", { exact: true }).selectOption("twitch");
      await page.getByRole("button", { name: "Apply session mix", exact: true }).click();
      await page
        .locator("[data-guide-active-weights]")
        .filter({ hasText: "saved desk overlay (twitch)" })
        .waitFor();
      assert(
        (await page.locator("[data-guide-active-weights]").textContent()).includes("favorites 8"),
      );
      await page.getByLabel("Library guide question", { exact: true }).fill("Racing");
      await page.getByRole("button", { name: "Ask guide", exact: true }).click();
      await page.locator("[data-guide-answer]").waitFor();
      assert(
        !(await page.locator("[data-guide-answer]").textContent()).includes(
          "PRIVATE TASTE SENTINEL",
        ),
      );
      report.checks.push(
        "YouTube and Movies retain shared defaults; selected-source Guide uses overlay in real picks/questions; private content excluded",
      );
      await nav("Twitch");
      area = await open("twitch");
      await area.getByRole("button", { name: "Reset this desk", exact: true }).click();
      await area
        .locator("[data-desk-effective]")
        .filter({ hasText: "shared Guide preset" })
        .waitFor();
      assert(
        await page.evaluate(() =>
          Boolean(JSON.parse(localStorage.getItem("reelcase.desk-taste.v1")).desks.movies),
        ),
      );
      await area.getByLabel("Twitch favorite weight", { exact: true }).fill("8");
      await preview(area);
      await area.getByRole("button", { name: "Save desk overlay", exact: true }).click();
      await page.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}.png`),
        fullPage: false,
      });
      await page.evaluate(() => {
        localStorage.setItem("reelcase.desk-taste.v1", '{"version":9,"desks":{}}');
      });
      await page.reload();
      await nav("Twitch");
      area = await open("twitch");
      await area.getByRole("button", { name: "Preview desk mix", exact: true }).click();
      await area.getByLabel("Desk mix comparison").waitFor();
      assert(
        await area.getByRole("button", { name: "Save desk overlay", exact: true }).isDisabled(),
      );
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.desk-taste.v1")),
        '{"version":9,"desks":{}}',
      );
      await page.evaluate(() => {
        localStorage.setItem(
          "reelcase.desk-taste.v1",
          JSON.stringify({
            version: 1,
            desks: { twitch: { weights: { favorite: 8, like: 1, topic: 1 }, novelty: 2 } },
          }),
        );
        sessionStorage.setItem(
          "realhub.active-local-profile.v1",
          sessionStorage.getItem("qa-other-profile"),
        );
      });
      await page.reload();
      await nav("Twitch");
      area = await open("twitch");
      assert.equal(
        await area.getByLabel("Twitch favorite weight", { exact: true }).inputValue(),
        "3",
      );
      assert.equal(
        await page.evaluate(() =>
          localStorage.getItem(
            "realhub.profile.v1:" +
              sessionStorage.getItem("qa-other-profile") +
              ":reelcase.desk-taste.v1",
          ),
        ),
        null,
      );
      report.checks.push(
        "Reset one desk keeps another overlay; future schema preserves exact bytes; alternate local profile starts with shared defaults",
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
          "Disposable local profiles and saved fixtures. Real provider playback, physical phones and a long-running large-library soak are not exercised.",
      },
      null,
      2,
    ),
  );
}
console.log(JSON.stringify({ ok: true, output }));
