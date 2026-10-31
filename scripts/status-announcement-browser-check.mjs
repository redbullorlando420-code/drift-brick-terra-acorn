import assert from "node:assert/strict";
import { chromium } from "playwright";
import { fromJSON } from "seroval";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/status-announcements-dev.json", [
    resolve("screenshots"),
  ]);
const find = (value, predicate) => {
  if (!value || typeof value !== "object") return;
  if (predicate(value)) return value;
  for (const child of Object.values(value)) {
    const result = find(child, predicate);
    if (result) return result;
  }
};
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        isMobile: mobile,
        hasTouch: mobile,
        reducedMotion: "reduce",
      }),
      page = await context.newPage(),
      errors = [],
      checks = [],
      report = { mobile, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(90000);
    let requests = 0;
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await context.addInitScript(() => {
      localStorage.setItem(
        "reelcase.pull-settings.v1",
        JSON.stringify({ automaticPulls: false, requestGapMs: 250 }),
      );
      localStorage.setItem("reelcase.pulls-paused.v1", "false");
      localStorage.setItem("reelcase.artwork-mode", "text");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: false }),
      );
    });
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("**/_serverFn/**", async (route) => {
      const input = fromJSON(JSON.parse(route.request().postData() ?? "{}")),
        clip = find(input, (v) => v.kind === "twitch" && v.twitchClipMode),
        refresh = find(input, (v) => Array.isArray(v.channels));
      let result = null;
      if (clip) {
        requests++;
        const now = Date.now(),
          failed = clip.query === "access099";
        result = {
          channel: {
            id: "tw:" + clip.query,
            kind: "twitch",
            handle: clip.query,
            title: clip.query,
            lastResponseCount: 0,
            twitchClipRecentCheckedAt: now,
            ...(failed
              ? {
                  lastClipFailure: {
                    kind: "network-offline",
                    at: now,
                    message: "Fixture clip service unavailable",
                    recovery: "Retry later",
                  },
                }
              : {}),
          },
          videos: [],
        };
      } else if (refresh) {
        const now = Date.now(),
          channels = refresh.channels.map((c) => ({ ...c, live: false, liveCheckedAt: now })),
          ids = channels.map((c) => c.id);
        result = { channels, videos: [], refreshedIds: ids, liveCheckedIds: ids, retryAt: {} };
      }
      await route
        .fulfill({ contentType: "application/json", body: JSON.stringify({ result, context: {} }) })
        .catch(() => {});
    });
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(() => {
        const channels = Array.from({ length: 100 }, (_, i) => ({
          id: "tw:access" + String(i).padStart(3, "0"),
          kind: "twitch",
          handle: "access" + String(i).padStart(3, "0"),
          channelId: "access" + i,
          title: "Accessibility creator " + i,
          liveCheckedAt: 1,
        }));
        localStorage.setItem(
          "reelcase.follows.v1",
          JSON.stringify({ channels, savedAt: Date.now() }),
        );
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: /^Twitch(?:\s+\d+)?$/ })
        .click();
      const clips = page.getByRole("region", { name: "Twitch clip updates", exact: true });
      await clips.waitFor();
      await page.evaluate(() => {
        window.__spoken = {};
        window.__last = {};
        window.__observeStatus = new MutationObserver(() => {
          for (const node of document.querySelectorAll("[data-batch-announcement]")) {
            const key = node.getAttribute("data-batch-announcement"),
              text = node.textContent;
            if (text && text !== window.__last[key]) {
              window.__last[key] = text;
              (window.__spoken[key] ??= []).push(text);
            }
          }
        });
        window.__observeStatus.observe(document.body, {
          subtree: true,
          childList: true,
          characterData: true,
        });
      });
      await clips.getByRole("combobox", { name: "Clip creator batch size" }).selectOption("100");
      await clips.getByRole("button", { name: "Refresh recent clips", exact: true }).click();
      await clips
        .getByRole("status")
        .filter({ hasText: /100 \/ 100 creators checked/ })
        .waitFor();
      assert.equal(requests, 100);
      const spoken = await page.evaluate(() => window.__spoken["Twitch clip update"]);
      assert.equal(spoken.length, 2, JSON.stringify(spoken));
      assert.match(spoken[0], /started.*100 creators/);
      assert.match(spoken[1], /100 \/ 100 creators checked/);
      assert.match(spoken[1], /1 need attention/);
      assert(!spoken.some((text) => text.includes("Checking Accessibility creator")));
      checks.push(
        "100 creator clip updates produce two polite announcements, with one completion/error summary and detailed visible results retained",
      );
      await clips
        .getByRole("combobox", { name: "Clip update creators" })
        .selectOption("tw:access099");
      assert(
        await clips.getByRole("button", { name: "Continue older clips", exact: true }).isEnabled(),
      );
      checks.push(
        "Partial failure leaves a reachable retry control; progress is inspectable without announcing every internal counter",
      );
      await page
        .getByRole("button", { name: "Check all Twitch live channels", exact: true })
        .click();
      await page
        .getByRole("region", { name: "Twitch quick live checks", exact: true })
        .getByRole("status")
        .filter({ hasText: /live check complete/ })
        .waitFor();
      const live = await page.evaluate(() => window.__spoken["Twitch live check"]);
      assert.equal(live.length, 2, JSON.stringify(live));
      assert.match(live[0], /started/);
      assert.match(live[1], /100 of 100/);
      checks.push(
        "100 creator live checks retain detailed progress while announcing only start and completion",
      );
      await page.emulateMedia({ forcedColors: "active", reducedMotion: "reduce" });
      await page.keyboard.press("Tab");
      await clips.getByRole("button", { name: "Continue older clips", exact: true }).focus();
      await clips.scrollIntoViewIfNeeded();
      assert.equal(
        await clips
          .getByRole("button", { name: "Continue older clips", exact: true })
          .evaluate((node) => getComputedStyle(node).outlineStyle),
        "solid",
      );
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.announcements = { clips: spoken, live };
      report.ok = true;
    } catch (error) {
      report.ok = false;
      report.error = error.stack;
      console.error(error.stack);
      console.error((await page.locator("body").innerText()).slice(-3000));
      await page
        .screenshot({
          path: output.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
    } finally {
      await context.unrouteAll({ behavior: "ignoreErrors" });
      await context.close();
    }
  }
} finally {
  await browser.close();
}
const result = {
  ok: reports.every((r) => r.ok),
  reports,
  limitation:
    "Isolated real UI/store with controlled provider metadata and DOM live-region mutation counts. No screen-reader speech output or physical assistive device was tested.",
};
writeFileSync(output, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
