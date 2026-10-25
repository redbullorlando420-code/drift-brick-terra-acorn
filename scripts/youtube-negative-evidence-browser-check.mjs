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
const realNow = Date.now;
let offset = 0;
Date.now = () => realNow() + offset;
const { runRefreshRemotes } = await import("../src/lib/remote/api.ts");
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/negative-evidence.json", [
    resolve("screenshots"),
  ]),
  original = globalThis.fetch;
const id = "UC0000000000000000000000",
  vid = "video000001",
  find = (v, p) => {
    if (!v || typeof v !== "object") return;
    if (p(v)) return v;
    for (const child of Object.values(v)) {
      const r = find(child, p);
      if (r) return r;
    }
  };
let mode = "partial",
  requests = [];
globalThis.fetch = async (url, init) => {
  requests.push(String(url));
  if (String(url).includes("/watch"))
    return new Response(
      "<script>var ytInitialPlayerResponse=" +
        JSON.stringify({
          playabilityStatus: { status: "LOGIN_REQUIRED" },
          videoDetails: { videoId: vid, channelId: id },
          microformat: {
            playerMicroformatRenderer: { liveBroadcastDetails: { isLiveNow: false } },
          },
        }) +
        ";</script>",
    );
  if (String(url).includes("/youtubei/")) {
    const rows =
      mode === "positive"
        ? [
            {
              videoRenderer: {
                videoId: vid,
                title: { simpleText: "Evidence fixture live" },
                viewCountText: { simpleText: "99 watching" },
              },
            },
          ]
        : mode === "partial"
          ? [
              {
                continuationItemRenderer: {
                  continuationEndpoint: { continuationCommand: { token: "unread" } },
                },
              },
            ]
          : [];
    return Response.json({
      metadata: { channelMetadataRenderer: { externalId: id } },
      contents: {
        twoColumnBrowseResultsRenderer: {
          tabs: [
            {
              tabRenderer: {
                selected: true,
                title: mode === "home" ? "Home" : "Live",
                content: { richGridRenderer: { contents: rows } },
              },
            },
          ],
        },
      },
    });
  }
  throw Error("Unexpected provider request " + String(url));
};
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    offset += 601000;
    mode = "partial";
    requests = [];
    const context = await browser.newContext({ viewport }),
      page = await context.newPage(),
      errors = [],
      checks = [];
    const report = { viewport: viewport.name, errors, checks };
    reports.push(report);
    page.setDefaultTimeout(45000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) errors.push(m.text());
    });
    await context.addInitScript((initialOffset) => {
      sessionStorage.setItem("test-evidence-offset", sessionStorage.getItem("test-evidence-offset") ?? String(initialOffset));
      const now = Date.now;
      Date.now = () => now() + Number(sessionStorage.getItem("test-evidence-offset") ?? 0);
      localStorage.setItem(
        "reelcase.pull-settings.v1",
        JSON.stringify({ automaticPulls: false, requestGapMs: 250 }),
      );
      localStorage.setItem("reelcase.pulls-paused.v1", "false");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
    }, offset);
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("https://fixture.invalid/**", (r) =>
      r.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/></svg>',
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
        data = find(input, (v) => Array.isArray(v.channels) && v.channels.some((c) => c?.kind));
      if (data)
        assert.equal(data.channels.length, 1, "focused recheck cannot fan out to other follows");
      const result = data ? await runRefreshRemotes(data) : null;
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
    };
    const follows = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels);
    const advance = async () => {
      offset += 601000;
      await page.evaluate((n) => sessionStorage.setItem("test-evidence-offset", String(n)), offset);
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(
        async ({ id, vid }) => {
          const old = Date.now() - 600000,
            channels = [
              {
                id: "yt:" + id,
                channelId: id,
                kind: "youtube",
                handle: "fixture",
                title: "Evidence fixture",
                live: true,
                liveCheckedAt: old,
                youtubeLiveVideoIds: [vid],
                catalogCursor: "keep-archive",
              },
            ];
          localStorage.setItem(
            "reelcase.follows.v1",
            JSON.stringify({ channels, savedAt: Date.now() }),
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
              s.put({ folders: [], checkedAt: Date.now() }, "meta");
              const row = {
                id: "yt:v:" + vid,
                folderId: "yt:" + id,
                name: "Evidence fixture live",
                path: "youtube/live",
                extension: "live",
                mime: "video/youtube",
                size: 0,
                addedAt: 1,
                poster: "https://fixture.invalid/live.svg",
                remote: {
                  kind: "youtube",
                  channelId: id,
                  channelName: "Evidence fixture",
                  videoId: vid,
                  live: true,
                  viewers: 15,
                  observedAt: old,
                },
              };
              s.put(row, "video:" + row.id);
              tx.oncomplete = res;
              tx.onerror = () => rej(tx.error);
            });
          } finally {
            db.close();
          }
        },
        { id, vid },
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      let yt = page.getByRole("region", { name: "YouTube quick live checks" });
      await yt
        .getByRole("button", { name: "Check all YouTube live channels", exact: true })
        .click();
      await yt.getByText("1 YouTube creator remains provisionally live", { exact: true }).click();
      await yt.getByText(/only part of the Streams catalog/).waitFor();
      assert.equal(requests.filter((r) => r.includes("/watch")).length, 1);
      let row = (await follows())[0];
      assert(row.live);
      assert.equal(row.liveOfflineSince, undefined);
      assert.equal(row.youtubeLiveEvidence.state, "unknown");
      assert.equal(row.youtubeLiveEvidence.reason, "partial-streams");
      assert.equal(
        await yt
          .getByRole("button", { name: "Recheck Evidence fixture", exact: true })
          .isDisabled(),
        true,
      );
      checks.push(
        "Partial Streams plus an ineligible watch response preserves the old live clock, starts no offline hold and exposes evidence and retry deadline",
      );
      await yt.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", "-unknown-" + viewport.name + ".png"),
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      yt = page.getByRole("region", { name: "YouTube quick live checks" });
      row = (await follows())[0];
      assert.equal(row.youtubeLiveEvidence.reason, "partial-streams");
      assert.deepEqual(row.youtubeLiveVideoIds, [vid]);
      assert.equal(row.catalogCursor, "keep-archive");
      checks.push(
        "Evidence, known broadcast identity, archive checkpoint and prior live observation survive reload",
      );
      await yt.getByText("1 YouTube creator remains provisionally live", { exact: true }).click();
      await advance();
      mode = "complete";
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      yt = page.getByRole("region", { name: "YouTube quick live checks" });
      await yt.getByText("1 YouTube creator remains provisionally live", { exact: true }).click();
      await yt.getByRole("button", { name: "Recheck Evidence fixture", exact: true }).click();
      await yt.getByText(/complete Streams listing/).waitFor();
      row = (await follows())[0];
      assert(row.live);
      await page.waitForFunction(() => JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels[0].liveOfflineSince > 0);
      row = (await follows())[0];
      assert(row.liveOfflineSince);
      const since = row.liveOfflineSince;
      checks.push(
        "Focused recheck reads one creator; genuine complete absence starts the ten-minute hold",
      );
      mode = "home";
      await advance();
      await yt.getByRole("button", { name: "Recheck Evidence fixture", exact: true }).click();
      await yt.getByText(/Only the Home shelf was readable/).waitFor();
      await page.waitForFunction(() => JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels[0].youtubeLiveEvidence?.reason === "home-only");
      row = (await follows())[0];
      assert(row.live);
      assert.equal(row.liveOfflineSince, since);
      assert.equal(row.youtubeLiveEvidence.state, "unknown");
      checks.push(
        "A later Home-only reply cannot expire an existing hold or mark a retained stream offline",
      );
      mode = "positive";
      await advance();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      yt = page.getByRole("region", { name: "YouTube quick live checks" });
      await yt
        .getByRole("button", { name: "Check all YouTube live channels", exact: true })
        .click();
      await yt.getByText(/1 \/ 1 creators checked successfully/).waitFor();
      row = (await follows())[0];
      assert(row.live);
      await page.waitForFunction(() => JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels[0].youtubeLiveEvidence?.state === "live");
      row = (await follows())[0];
      assert.equal(row.liveOfflineSince, undefined);
      assert.equal(row.lastLiveFailure, undefined);
      assert.equal(row.youtubeLiveEvidence.state, "live");
      checks.push("Fresh positive evidence immediately clears the offline hold and failure state");
      mode = "complete";
      await advance();
      await yt
        .getByRole("button", { name: "Check all YouTube live channels", exact: true })
        .click();
      await yt.getByText("1 YouTube creator remains provisionally live", { exact: true }).waitFor();
      await advance();
      await yt
        .getByRole("button", { name: "Check all YouTube live channels", exact: true })
        .click();
      await page.waitForFunction(
        () => JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels[0].live === false,
      );
      row = (await follows())[0];
      assert.equal(row.catalogCursor, "keep-archive");
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      checks.push(
        "Two complete negative checks spanning the hold confirm offline without deleting saved archive state; clean console and mobile layout",
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
              "Isolated browser profiles, controlled public response fixtures and an accelerated clock; not native playback or a provider soak.",
          },
          null,
          2,
        ),
      );
    }
  }
} finally {
  globalThis.fetch = original;
  Date.now = realNow;
  await browser.close();
}
console.log(JSON.stringify({ ok: true, reports }, null, 2));
