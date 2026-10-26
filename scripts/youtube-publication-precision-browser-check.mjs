import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { registerHooks } from "node:module";
import { fromJSON } from "seroval";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
registerHooks({
  resolve(s, c, n) {
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});
const { youtubeWatchPublication } = await import("../src/lib/remote/youtube-publication.ts");
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/publication-ui.json", [
    resolve("screenshots"),
  ]);
const find = (v, p) => {
  if (!v || typeof v !== "object") return;
  if (p(v)) return v;
  for (const c of Object.values(v)) {
    const r = find(c, p);
    if (r) return r;
  }
};
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000, timezoneId: "America/Los_Angeles" },
    { name: "mobile", width: 390, height: 844, timezoneId: "Asia/Tokyo" },
  ]) {
    const context = await browser.newContext({
        viewport,
        timezoneId: viewport.timezoneId,
        acceptDownloads: true,
      }),
      page = await context.newPage(),
      checks = [],
      errors = [],
      requests = [];
    const report = { viewport: viewport.name, timezone: viewport.timezoneId, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(45000);
    let failNext = true;
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text()))
        errors.push(m.text() + " [" + m.location().url + "]");
    });
    await context.addInitScript(() => {
      localStorage.setItem(
        "reelcase.pull-settings.v1",
        JSON.stringify({ automaticPulls: false, requestGapMs: 250 }),
      );
      localStorage.setItem("reelcase.pulls-paused.v1", "false");
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
    await context.route("https://i.ytimg.com/**", (r) =>
      r.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/></svg>',
      }),
    );
    await page.route("**/_serverFn/**", async (route) => {
      const input = fromJSON(JSON.parse(route.request().postData() ?? "{}")),
        data = find(input, (v) => Array.isArray(v.ids));
      let result = { comments: [], note: "No fixture comments" };
      if (data) {
        requests.push(data);
        result = data.ids.map((id) => {
          if (failNext) {
            failNext = false;
            return { id, error: "Synthetic HTTP 503 · saved date unchanged" };
          }
          const date = id === "pubdate0003" ? "2026-10-02" : "2026-10-01",
            html =
              "var ytInitialPlayerResponse = " +
              JSON.stringify({
                videoDetails: { videoId: id },
                microformat: { playerMicroformatRenderer: { publishDate: date } },
              }) +
              ";";
          return { id, date: youtubeWatchPublication(html, id) };
        });
      }
      await route
        .fulfill({ contentType: "application/json", body: JSON.stringify({ result, context: {} }) })
        .catch(() => {});
    });
    const nav = async () => {
      if (viewport.name === "mobile")
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: /^YouTube(?:\s+\d+)?$/ })
        .click();
      const explore = page.getByRole("button", {
        name: "Explore recommendations and full catalog",
        exact: true,
      });
      if (await explore.isVisible()) await explore.click();
    };
    const open = async (title) => {
      const card = page
        .locator("[data-video-card]")
        .filter({ has: page.getByRole("heading", { name: title, exact: true }) })
        .first();
      await card.scrollIntoViewIfNeeded();
      await card.locator("[data-video-card-open]").click();
      await page.getByRole("region", { name: "YouTube publication evidence" }).waitFor();
    };
    const evidence = page.getByRole("region", { name: "YouTube publication evidence" }),
      verify = page.getByRole("button", { name: "Verify publication date", exact: true });
    const download = async () => {
      const wait = page.waitForEvent("download");
      await evidence.getByRole("button", { name: "Export date evidence", exact: true }).click();
      return JSON.parse(await readFile(await (await wait).path(), "utf8"));
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(async () => {
        const now = Date.now(),
          channelId = "UC" + "0".repeat(22),
          folderId = "yt:" + channelId,
          base = {
            folderId,
            path: "youtube/publication",
            extension: "yt",
            mime: "video/youtube",
            size: 0,
          };
        const rows = [
          {
            ...base,
            id: "yt:pubdate0001",
            name: "Relative date fixture",
            addedAt: 0,
            remote: {
              kind: "youtube",
              videoId: "pubdate0001",
              channelId,
              channelName: "Publication creator",
              publishedSource: "unknown",
              publishedPrecision: "relative",
              publishedLabel: "2 days ago",
              publishedLabelAt: now,
            },
          },
          {
            ...base,
            id: "yt:pubdate0003",
            name: "Precise time fixture",
            addedAt: Date.parse("2026-10-01T13:14:15Z"),
            remote: {
              kind: "youtube",
              videoId: "pubdate0003",
              channelId,
              channelName: "Publication creator",
              publishedSource: "rss",
              publishedPrecision: "instant",
            },
          },
          {
            ...base,
            id: "yt:pubdate0004",
            name: "Unknown date fixture",
            addedAt: 0,
            remote: {
              kind: "youtube",
              videoId: "pubdate0004",
              channelId,
              channelName: "Publication creator",
              publishedSource: "unknown",
            },
          },
          {
            ...base,
            id: "yt:pubdate0005",
            name: "Upcoming date fixture",
            addedAt: 0,
            remote: {
              kind: "youtube",
              videoId: "pubdate0005",
              channelId,
              channelName: "Publication creator",
              youtubeType: "upcoming",
              publishedSource: "unknown",
            },
          },
        ];
        for (const row of rows) {
          row.remote.watchUrl = "https://www.youtube.com/watch?v=" + row.remote.videoId;
          row.remote.embedUrl = "https://www.youtube.com/embed/" + row.remote.videoId;
        }
        localStorage.setItem(
          "reelcase.follows.v1",
          JSON.stringify({
            channels: [
              {
                id: folderId,
                kind: "youtube",
                handle: "https://www.youtube.com/channel/" + channelId,
                title: "Publication creator",
                channelId,
              },
            ],
            savedAt: now,
          }),
        );
        const db = await new Promise((res, rej) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
        });
        try {
          await new Promise((res, rej) => {
            const tx = db.transaction("remote-cache", "readwrite"),
              s = tx.objectStore("remote-cache");
            s.put({ folders: [], checkedAt: now }, "meta");
            for (const row of rows) s.put(row, "video:" + row.id);
            tx.oncomplete = res;
            tx.onerror = () => rej(tx.error);
          });
        } finally {
          db.close();
        }
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await open("Relative date fixture");
      await evidence.getByText("Approximate publication label", { exact: true }).waitFor();
      await evidence.getByText(/YouTube reported “2 days ago”/).waitFor();
      const relative = await download();
      assert.equal(relative.precision, "relative");
      assert.equal(relative.label, "2 days ago");
      assert.equal(relative.timestamp, undefined);
      assert.equal(requests.length, 0);
      await evidence.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", "-" + viewport.name + "-relative.png"),
      });
      checks.push(
        "Relative listing evidence stays approximate with no invented timestamp or automatic request; selected evidence exports correctly",
      );
      await verify.click();
      await page
        .getByRole("alert")
        .filter({ hasText: /Synthetic HTTP 503/ })
        .waitFor();
      await evidence.getByText("Approximate publication label", { exact: true }).waitFor();
      await verify.click();
      await evidence.getByText("Publication calendar date", { exact: true }).waitFor();
      await evidence
        .getByText("Oct 1, 2026 · day precision, time unavailable", { exact: true })
        .waitFor();
      const day = await download();
      assert.equal(day.precision, "day");
      assert.equal(day.date, "2026-10-01");
      assert.equal(day.timestamp, undefined);
      assert.equal(day.source, "watch");
      await evidence.scrollIntoViewIfNeeded();
      await page.screenshot({ path: output.replace(".json", "-" + viewport.name + ".png") });
      checks.push(
        "Provider failure preserves previous evidence and explicit retry repairs only the matching video to day precision",
      );
      await page.getByRole("button", { name: "Close preview", exact: true }).click();
      await open("Precise time fixture");
      await evidence.getByText("Exact publication time", { exact: true }).waitFor();
      await evidence.getByText(/13:14:15 UTC/).waitFor();
      await verify.click();
      await page
        .getByRole("list", { name: "Publication date results" })
        .getByText(/saved publication evidence kept/)
        .waitFor();
      const exact = await download();
      assert.equal(exact.precision, "instant");
      assert.equal(exact.timestamp, "2026-10-01T13:14:15.000Z");
      assert.equal(exact.source, "rss");
      assert.equal(requests.length, 3);
      checks.push(
        "A day-only watch response cannot overwrite a saved exact RSS timestamp; UTC display and export agree in different device time zones",
      );
      await page.getByRole("button", { name: "Close preview", exact: true }).click();
      await open("Unknown date fixture");
      await evidence.getByText("Publication date unknown", { exact: true }).waitFor();
      assert.equal((await download()).precision, "unknown");
      assert.equal(requests.length, 3);
      await page.getByRole("button", { name: "Close preview", exact: true }).click();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await open("Relative date fixture");
      await evidence.getByText("Publication calendar date", { exact: true }).waitFor();
      await evidence
        .getByText("Oct 1, 2026 · day precision, time unavailable", { exact: true })
        .waitFor();
      assert.deepEqual(await download(), day);
      assert.equal(requests.length, 3);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      checks.push(
        "Unknown remains visibly unknown; day precision and source survive real IndexedDB reload with stable UTC display, no console errors or overflow",
      );
    } catch (e) {
      report.error = e.stack;
      await page
        .screenshot({ path: output.replace(".json", "-" + viewport.name + "-failure.png") })
        .catch(() => {});
      throw e;
    } finally {
      await page.unrouteAll({ behavior: "ignoreErrors" });
      await context.unrouteAll({ behavior: "ignoreErrors" });
      await context.close();
      writeFileSync(
        output,
        JSON.stringify(
          {
            ok: reports.every((r) => !r.error),
            reports,
            limitation:
              "Controlled matching public watch payloads and isolated Chrome storage; no real-provider soak or physical-device check is claimed.",
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
