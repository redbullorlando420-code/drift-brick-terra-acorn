import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { fromJSON } from "seroval";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
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
const { runFetchTwitchChapters } = await import("../src/lib/remote/api.ts");
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/twitch-chapters-dev.json", [
    resolve("screenshots"),
  ]);
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [],
  original = globalThis.fetch;
const find = (value, p) => {
  if (!value || typeof value !== "object") return;
  if (p(value)) return value;
  for (const child of Object.values(value)) {
    const r = find(child, p);
    if (r) return r;
  }
};
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        isMobile: mobile,
        hasTouch: mobile,
      }),
      page = await context.newPage(),
      errors = [],
      requests = [],
      upstream = [],
      checks = [],
      report = { mobile, errors, checks };
    reports.push(report);
    page.setDefaultTimeout(30000);
    const base = mobile ? 5210 : 5200;
    let fixed = false,
      release;
    const gate = new Promise((r) => (release = r));
    let hold = true;
    globalThis.fetch = async (_url, init) => {
      const p = JSON.parse(init.body);
      assert(p.query.includes("moments(momentRequestType:VIDEO_CHAPTER_MARKERS)"));
      upstream.push(p.variables.id);
      if (hold) {
        hold = false;
        await gate;
      }
      const id = p.variables.id,
        empty = id === String(base + 2),
        bad = id === String(base + 1) && !fixed;
      return Response.json({
        data: {
          video: {
            id,
            lengthSeconds: 10000,
            moments: {
              edges: empty
                ? []
                : Array.from({ length: bad ? 1 : 25 }, (_, i) => ({
                    node: {
                      positionMilliseconds: i * 60000,
                      durationMilliseconds: 60000,
                      description: bad ? { invalid: "bad" } : "Game chapter " + i,
                    },
                  })),
            },
          },
        },
      });
    };
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) errors.push(m.text());
    });
    await context.addInitScript(() => {
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
    await context.route("https://player.twitch.tv/**", (r) =>
      r.fulfill({ contentType: "text/html", body: "<p>Controlled official player fixture</p>" }),
    );
    await context.route("**/_serverFn/**", async (route) => {
      const input = fromJSON(JSON.parse(route.request().postData() ?? "{}")),
        data = find(input, (v) => typeof v.videoId === "string" && !v.kind);
      let result = { comments: [], note: "No chat fixture" };
      if (data) {
        requests.push(data.videoId);
        result = await runFetchTwitchChapters(data);
      }
      await route
        .fulfill({ contentType: "application/json", body: JSON.stringify({ result, context: {} }) })
        .catch(() => {});
    });
    const nav = async () => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: /^Twitch(?:\s+\d+)?$/ })
        .click();
      const full = page.getByRole("button", { name: "Open full Twitch catalog", exact: true });
      if (await full.isVisible()) await full.click();
    };
    const preview = () => page.getByRole("dialog", { name: /^Preview: / }),
      chapters = () => page.getByRole("region", { name: "Twitch VOD chapters", exact: true });
    const open = async (name) => {
      const catalog=page.getByRole("region",{name:"Full Twitch catalog",exact:true});
      await catalog.getByRole("combobox",{name:"Twitch content type"}).scrollIntoViewIfNeeded();
      await catalog.locator("[data-video-card-id]").filter({hasText:name}).first().click();
      await preview().waitFor();
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(async (base) => {
        const now = Date.now(),
          channel = {
            id: "tw:chapters",
            kind: "twitch",
            handle: "chapters",
            title: "Chapter fixtures",
            channelId: "1",
          };
        localStorage.setItem(
          "reelcase.follows.v1",
          JSON.stringify({ channels: [channel], savedAt: now }),
        );
        const db = await new Promise((yes, no) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
        await new Promise((yes, no) => {
          const tx = db.transaction("remote-cache", "readwrite"),
            s = tx.objectStore("remote-cache");
          s.put({ folders: [], checkedAt: now }, "meta");
          for (let i = 0; i < 4; i++) {
            const id = String(base + i),
              clip = i === 3,
              v = {
                id: (clip ? "tw:c:" : "tw:v:") + id,
                folderId: "tw:chapters",
                name: [
                  "Chapter fixture VOD",
                  "Malformed chapter VOD",
                  "Empty chapter VOD",
                  "Chapterless clip",
                ][i],
                path: "twitch/" + id,
                extension: clip ? "clip" : "vod",
                mime: "video/twitch",
                size: 0,
                duration: 10000,
                addedAt: now,
                remote: {
                  kind: "twitch",
                  videoId: id,
                  channelId: "1",
                  channelName: "Chapter fixtures",
                  live: false,
                  embedUrl: "https://player.twitch.tv/?video=" + id,
                  watchUrl: "https://www.twitch.tv/videos/" + id,
                  observedAt: now,
                },
              };
            s.put(v, "video:" + v.id);
          }
          tx.oncomplete = yes;
          tx.onerror = () => no(tx.error);
        });
        db.close();
      }, base);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await open("Chapter fixture VOD");
      assert.equal(requests.length, 0);
      await chapters().getByRole("button", { name: "Show VOD chapters", exact: true }).click();
      await chapters().getByText("Loading public VOD chapters…", { exact: true }).waitFor();
      await chapters().getByRole("button", { name: "Hide VOD chapters", exact: true }).click();
      release();
      await page.waitForTimeout(200);
      assert.equal(await chapters().getByRole("listitem").count(), 0);
      await chapters().getByRole("button", { name: "Show VOD chapters", exact: true }).click();
      await chapters()
        .getByRole("button", { name: "0:00 · Game chapter 0", exact: true })
        .waitFor();
      assert.equal(await chapters().getByRole("listitem").count(), 12);
      assert.equal(upstream.length, 1);
      checks.push(
        "No automatic chapter query; collapse ignores late completion; selected VOD read coalesces and caches",
      );
      await chapters().getByRole("button", { name: "Next chapters", exact: true }).click();
      await chapters()
        .getByRole("button", { name: "12:00 · Game chapter 12", exact: true })
        .waitFor();
      await chapters().getByRole("button", { name: "Previous chapters", exact: true }).click();
      const seek = chapters().getByRole("button", { name: "1:00 · Game chapter 1", exact: true });
      await seek.click();
      const frame = preview().locator("iframe");
      await page.waitForFunction(() =>
        document.querySelector('iframe[src*="player.twitch.tv"]')?.src.includes("time=0h1m0s"),
      );
      const oldFrame=await frame.elementHandle();await seek.click();await page.waitForFunction(element=>!element.isConnected,oldFrame);
      assert.equal(
        new URL(await frame.getAttribute("src")).searchParams.get("parent"),
        new URL(url).hostname,
      );
      assert.equal(
        await chapters()
          .getByRole("link", { name: "Open on Twitch", exact: true })
          .nth(1)
          .getAttribute("href"),
        "https://www.twitch.tv/videos/" + base + "?t=0h1m0s",
      );
      checks.push(
        "Twelve mounted rows per chapter page; timestamp navigation retains embed parent and canonical external fallback",
      );
      await chapters().scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      await preview().getByRole("button", { name: "Close preview", exact: true }).click();
      await open("Chapter fixture VOD");
      const before = requests.length;
      await chapters().getByRole("button", { name: "Show VOD chapters", exact: true }).click();
      await chapters()
        .getByRole("button", { name: "0:00 · Game chapter 0", exact: true })
        .waitFor();
      assert.equal(requests.length, before);
      await preview().getByRole("button", { name: "Watch now", exact: true }).click();
      const player = page.getByRole("dialog", { name: "Player: Chapter fixture VOD", exact: true });
      await player.waitFor();
      await chapters().getByRole("button", { name: "Show VOD chapters", exact: true }).click();
      await chapters().getByRole("button", { name: "2:00 · Game chapter 2", exact: true }).click();
      assert.equal(
        new URL(await player.locator("iframe").getAttribute("src")).searchParams.get("time"),
        "0h2m0s",
      );
      assert.equal(requests.length, before);
      await player.getByRole("button", { name: "Close", exact: true }).click();
      checks.push(
        "Preview reopen and full player reuse selected detail without refetching; full-player controls remain scrollable",
      );
      await open("Malformed chapter VOD");
      await chapters().getByRole("button", { name: "Show VOD chapters", exact: true }).click();
      await chapters()
        .getByText(/metadata is unavailable or unreadable/)
        .waitFor();
      assert.equal(await chapters().getByRole("listitem").count(), 0);
      fixed = true;
      await chapters().getByRole("button", { name: "Retry chapter load", exact: true }).click();
      await chapters()
        .getByRole("button", { name: "0:00 · Game chapter 0", exact: true })
        .waitFor();
      await preview().getByRole("button", { name: "Close preview", exact: true }).click();
      await open("Empty chapter VOD");
      await chapters().getByRole("button", { name: "Show VOD chapters", exact: true }).click();
      await chapters()
        .getByText(/returned no public chapter markers/)
        .waitFor();
      assert.equal(await chapters().getByRole("listitem").count(), 0);
      assert(await preview().locator("iframe").isVisible());
      await preview().getByRole("button", { name: "Close preview", exact: true }).click();
      await open("Chapterless clip");
      assert.equal(await chapters().count(), 0);
      checks.push(
        "Malformed data has an explicit manual retry; empty markers invent no chapters, playback remains available, clips expose no chapter controls",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.ok = true;
    } catch (error) {
      report.ok = false;
      report.error = error.stack;
      release();
      await page
        .screenshot({
          path: output.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
    }
    await context.unrouteAll({ behavior: "ignoreErrors" });
    await context.close();
  }
} finally {
  globalThis.fetch = original;
  await browser.close();
}
const result = {
  ok: reports.every((r) => r.ok),
  reports,
  limitation:
    "Isolated desktop/touch-phone Chrome with real chapter parser/cache and controlled Twitch payloads/iframe. Real marker-source and canary observations are recorded separately; provider playback and physical phones remain unverified.",
};
writeFileSync(output, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
