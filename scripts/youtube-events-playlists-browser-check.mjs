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

const { runRefreshRemotes, runFollowRemote } = await import("../src/lib/remote/api.ts");
const { markPlaylistWalk } = await import("../src/lib/videos/youtube-playlist-walk.ts");
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/youtube-events-dev.json", [
    resolve("screenshots"),
  ]);
const realNow = Date.now,
  originalFetch = globalThis.fetch,
  cid = "UC" + "a".repeat(22),
  vid = "event000001",
  pid = "PLfixture000001",
  source = "ytpl:" + pid;
let offset = 0,
  mode = "postponed",
  reads = [],
  calls = [];
Date.now = () => realNow() + offset;
const continuation = {
  continuationItemRenderer: {
    continuationEndpoint: { continuationCommand: { token: "saved-next" } },
  },
};
const playlistPage = (ids, next = false) => ({
  metadata: { playlistMetadataRenderer: { title: "Playlist fixture" } },
  contents: {
    twoColumnBrowseResultsRenderer: {
      tabs: [
        {
          tabRenderer: {
            selected: true,
            content: {
              sectionListRenderer: {
                contents: [
                  {
                    itemSectionRenderer: {
                      contents: [
                        {
                          playlistVideoListRenderer: {
                            contents: [
                              ...ids.map((id) => ({
                                playlistVideoRenderer: { videoId: id, title: { simpleText: id } },
                              })),
                              ...(next ? [continuation] : []),
                            ],
                          },
                        },
                      ],
                    },
                  },
                ],
              },
            },
          },
        },
      ],
    },
  },
});
globalThis.fetch = async (url, init) => {
  reads.push(String(url));
  const body = JSON.parse(init?.body ?? "{}");
  if (body.browseId === "VL" + pid || body.continuation === "saved-next") {
    if (mode === "partial")
      return Response.json(
        body.continuation ? { renamedShape: {} } : playlistPage(["video000001"], true),
      );
    return Response.json(playlistPage(["video000002"]));
  }
  const rows =
    mode === "positive"
      ? [
          {
            videoRenderer: {
              videoId: vid,
              title: { simpleText: "Scheduled fixture" },
              viewCountText: { simpleText: "77 watching now" },
            },
          },
        ]
      : mode === "postponed"
        ? [
            {
              videoRenderer: {
                videoId: vid,
                title: { simpleText: "Scheduled fixture" },
                upcomingEventData: {
                  startTime: String(Math.floor((Date.now() + 10800000) / 1000)),
                },
                viewCountText: { simpleText: "44 waiting" },
              },
            },
          ]
        : [];
  return Response.json({
    metadata: { channelMetadataRenderer: { externalId: cid } },
    contents: {
      twoColumnBrowseResultsRenderer: {
        tabs: [
          {
            tabRenderer: {
              selected: true,
              title: "Live",
              content: { richGridRenderer: { contents: rows } },
            },
          },
        ],
      },
    },
  });
};
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
const find = (v, p) => {
  if (!v || typeof v !== "object") return;
  if (p(v)) return v;
  for (const c of Object.values(v)) {
    const r = find(c, p);
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
      checks = [];
    const report = { mobile, errors, checks };
    reports.push(report);
    mode = "postponed";
    offset += 1000000;
    calls = [];
    reads = [];
    page.setDefaultTimeout(45000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) errors.push(m.text());
    });
    await context.addInitScript((n) => {
      sessionStorage.setItem(
        "event-qa-offset",
        sessionStorage.getItem("event-qa-offset") ?? String(n),
      );
      const now = Date.now;
      Date.now = () => now() + Number(sessionStorage.getItem("event-qa-offset") ?? 0);
      localStorage.setItem(
        "reelcase.pull-settings.v1",
        JSON.stringify({ automaticPulls: false, requestGapMs: 250 }),
      );
      localStorage.setItem("reelcase.pulls-paused.v1", "false");
      localStorage.setItem(
        "reelcase.settings.v2",
        JSON.stringify({ "alerts-go-live-alerts": true }),
      );
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
    await context.route(new RegExp("https://(?:i[.]ytimg[.]com|fixture[.]invalid)/"), (r) =>
      r.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/></svg>',
      }),
    );
    await context.route("**/_serverFn/**", async (route) => {
      let input;
      try {
        input = fromJSON(JSON.parse(route.request().postData() ?? "{}"));
      } catch {}
      const refresh = find(
          input,
          (v) => Array.isArray(v.channels) && v.channels.some((c) => c?.kind),
        ),
        follow = find(input, (v) => typeof v.query === "string" && v.kind === "youtube");
      if (refresh || follow) calls.push(refresh ?? follow);
      const result = refresh
        ? await runRefreshRemotes(refresh)
        : follow
          ? await runFollowRemote(follow)
          : null;
      await route
        .fulfill({ contentType: "application/json", body: JSON.stringify({ result, context: {} }) })
        .catch(() => {});
    });
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?: +[0-9]+)?$") })
        .click();
    };
    const eventually = async (read, predicate) => {
      let value;
      for (let i = 0; i < 100; i++) {
        value = await read();
        if (predicate(value)) return value;
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      throw Error("Saved state did not settle: " + JSON.stringify(value).slice(0, 1000));
    };
    const preferences = () =>
      page.evaluate(async () => {
        const db = await new Promise((yes, no) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
        try {
          return await new Promise((yes, no) => {
            const r = db.transaction("activity").objectStore("activity").get("preferences");
            r.onsuccess = () => yes(r.result);
            r.onerror = () => no(r.error);
          });
        } finally {
          db.close();
        }
      });
    const saved = () =>
      page.evaluate(() => JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels);
    const cached = () =>
      page.evaluate(async () => {
        const db = await new Promise((yes, no) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
        try {
          return await new Promise((yes, no) => {
            const r = db.transaction("remote-cache").objectStore("remote-cache").getAll();
            r.onsuccess = () => yes(r.result.filter((v) => v?.remote));
            r.onerror = () => no(r.error);
          });
        } finally {
          db.close();
        }
      });
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(
        async ({ cid, vid, pid, source }) => {
          const now = Date.now(),
            events = Array.from({ length: 13 }, (_, i) => ({
              id: i ? "event" + String(i + 1).padStart(6, "0") : vid,
              title: i ? "Future event " + (i + 1) : "Scheduled fixture",
              state: "upcoming",
              scheduledAt: now + (i + 1) * 3600000,
              observedAt: now - 60000,
            }));
          const follows = [
            {
              id: "yt:" + cid,
              channelId: cid,
              kind: "youtube",
              title: "Event creator",
              handle: "@events",
              youtubeEvents: events,
            },
            {
              id: source,
              kind: "youtube",
              title: "Playlist fixture",
              handle: "https://www.youtube.com/playlist?list=" + pid,
            },
          ];
          localStorage.setItem(
            "reelcase.follows.v1",
            JSON.stringify({ channels: follows, savedAt: now }),
          );
          const prefs = JSON.parse(localStorage.getItem("reelcase.prefs.v4") ?? "{}");
          localStorage.setItem(
            "reelcase.prefs.v4",
            JSON.stringify({
              ...prefs,
              follows,
              favorites: ["yt:video000003"],
              likes: [],
              tags: { "yt:video000003": ["manual-fixture"] },
              history: [{ id: "yt:video000003", at: now - 60000 }],
            }),
          );
          const db = await new Promise((yes, no) => {
            const r = indexedDB.open("reelcase");
            r.onsuccess = () => yes(r.result);
            r.onerror = () => no(r.error);
          });
          try {
            await new Promise((yes, no) => {
              const tx = db.transaction("remote-cache", "readwrite"),
                s = tx.objectStore("remote-cache");
              s.put(
                {
                  folders: [
                    { id: source, name: "Playlist fixture", kind: "youtube", videoCount: 3 },
                  ],
                  checkedAt: now,
                },
                "meta",
              );
              for (const id of ["video000001", "video000002", "video000003", vid]) {
                const event = id === vid ? events[0] : undefined;
                const row = {
                  id: "yt:" + id,
                  folderId: event ? "yt:" + cid : source,
                  name: event ? "Scheduled fixture" : id,
                  path: "youtube/" + id,
                  extension: "yt",
                  mime: "video/youtube",
                  size: 0,
                  addedAt: 0,
                  poster: "https://fixture.invalid/thumb.svg",
                  remote: {
                    kind: "youtube",
                    channelId: cid,
                    channelName: "Event creator",
                    videoId: id,
                    watchUrl: "https://www.youtube.com/watch?v=" + id,
                    embedUrl: "https://www.youtube.com/embed/" + id,
                    ...(event
                      ? { youtubeType: "upcoming", youtubeEvent: event }
                      : { sourceIds: [source, "yt:other"] }),
                  },
                };
                s.put(row, "video:" + row.id);
              }
              tx.oncomplete = yes;
              tx.onerror = () => no(tx.error);
            });
          } finally {
            db.close();
          }
        },
        { cid, vid, pid, source },
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Live");
      let upcoming = page.getByRole("region", { name: "Upcoming YouTube broadcasts", exact: true });
      await upcoming.waitFor();
      assert.equal(await upcoming.locator("[data-youtube-event]").count(), 12);
      await upcoming.getByRole("button", { name: "Next events", exact: true }).click();
      assert.equal(await upcoming.locator("[data-youtube-event]").count(), 1);
      await upcoming.getByRole("button", { name: "Previous events", exact: true }).click();
      await upcoming
        .locator('[data-youtube-event="' + vid + '"]')
        .getByRole("button", { name: "Check creator", exact: true })
        .click();
      await upcoming.getByText(/Time changed from/).waitFor();
      assert.equal((await saved())[0].youtubeEvents.find((e) => e.id === vid).state, "upcoming");
      checks.push(
        "Upcoming event pages stay at 12 cards; focused check records postponement without live status or waiting viewers",
      );
      await upcoming.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile-events.png" : "-desktop-events.png"),
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Live");
      upcoming = page.getByRole("region", { name: "Upcoming YouTube broadcasts", exact: true });
      await upcoming.getByText(/Time changed from/).waitFor();
      mode = "positive";
      await upcoming
        .locator('[data-youtube-event="' + vid + '"]')
        .getByRole("button", { name: "Check creator", exact: true })
        .click();
      await page.waitForFunction(() =>
        JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels.some((c) =>
          c.youtubeEvents?.some((e) => e.id === "event000001" && e.state === "live"),
        ),
      );
      await eventually(
        preferences,
        (p) => p.notices?.filter((n) => n.id === "youtube-live:event000001").length === 1,
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("YouTube");
      const quick = page.getByRole("region", { name: "YouTube quick live checks" });
      await quick
        .getByRole("button", { name: "Check all YouTube live channels", exact: true })
        .click();
      await page.waitForFunction(
        () => JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels[0].live === true,
      );
      assert.equal(
        (await preferences()).notices.filter((n) => n.id === "youtube-live:event000001").length,
        1,
      );
      checks.push(
        "Reload preserves postponed schedule; confirmed live and repeated quick check produce one saved alert",
      );
      mode = "partial";
      await page
        .getByRole("button", { name: "Expand YouTube creator control", exact: true })
        .click();
      await page.getByRole("button", { name: "Manage Playlist fixture", exact: true }).click();
      let membership = page.getByRole("region", { name: "Playlist membership", exact: true });
      await membership
        .getByRole("button", { name: "Reconcile playlist from start", exact: true })
        .click();
      await membership.getByText(/1 entries observed/).waitFor();
      assert.equal(
        (await saved()).find((c) => c.id === source).playlistWalk.membership,
        "provisional",
      );
      let rows = await cached();
      assert(rows.find((v) => v.id === "yt:video000003").remote.sourceIds.includes(source));
      checks.push(
        "An interrupted real API traversal saves a resumable provisional checkpoint and keeps unseen tail memberships",
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("YouTube");
      await page
        .getByRole("button", { name: "Expand YouTube creator control", exact: true })
        .click();
      await page.getByRole("button", { name: "Manage Playlist fixture", exact: true }).click();
      mode = "resume";
      await page.getByRole("button", { name: "Pull creator videos", exact: true }).click();
      membership = page.getByRole("region", { name: "Playlist membership", exact: true });
      await membership.getByText("Playlist membership confirmed", { exact: true }).waitFor();
      await page.getByLabel("Sort creator videos", { exact: true }).selectOption("playlist");
      const resultList = page.getByLabel("Creator video results", { exact: true });
      await resultList.locator('[data-creator-video-id="yt:video000002"]').waitFor();
      assert.equal(await resultList.locator("[data-creator-video-id]").count(), 2);
      assert.deepEqual(
        await resultList
          .locator("[data-creator-video-id]")
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-creator-video-id"))),
        ["yt:video000001", "yt:video000002"],
      );
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels.find(
            (c) => c.id === "ytpl:PLfixture000001",
          ).playlistWalk.membership === "confirmed",
      );
      rows = await eventually(
        cached,
        (rows) => rows.find((v) => v.id === "yt:video000003")?.folderId === "yt:other",
      );
      const retained = rows.find((v) => v.id === "yt:video000003");
      assert(retained);
      assert.equal(retained.folderId, "yt:other");
      assert(!retained.remote.sourceIds.includes(source));
      const prefs = await preferences();
      assert(prefs.favorites.includes(retained.id));
      assert(prefs.history.some((h) => h.id === retained.id));
      assert(prefs.tags[retained.id]?.includes("manual-fixture"));
      checks.push(
        "Resuming after reload completes one walk, removes only the departed playlist edge, preserves favorites/history and exposes stable playlist order",
      );
      await membership.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile-playlist.png" : "-desktop-playlist.png"),
      });
      mode = "ended";
      await quick
        .getByRole("button", { name: "Check all YouTube live channels", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("reelcase.follows.v1"))
            .channels.find((c) => c.kind === "youtube" && c.channelId)
            ?.youtubeEvents?.find((e) => e.id === "event000001")?.state === "uncertain",
      );
      offset += 601000;
      await page.evaluate((n) => sessionStorage.setItem("event-qa-offset", String(n)), offset);
      await quick
        .getByRole("button", { name: "Check all YouTube live channels", exact: true })
        .click();
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("reelcase.follows.v1"))
            .channels.find((c) => c.channelId)
            ?.youtubeEvents?.find((e) => e.id === "event000001")?.state === "completed",
      );
      rows = await eventually(
        cached,
        (rows) => rows.find((v) => v.remote.videoId === vid)?.remote.youtubeType === "replay",
      );
      assert.equal(rows.filter((v) => v.remote.videoId === vid).length, 1);
      assert.equal(rows.find((v) => v.remote.videoId === vid).remote.youtubeType, "replay");
      checks.push(
        "Complete negative evidence honors the ten-minute hold, then retains exactly one canonical replay",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.providerReads = reads.length;
      report.appRequests = calls.length;
    } catch (e) {
      report.error = e.stack;
      report.saved = await saved().catch(() => []);
      report.preferences = await preferences().catch(() => ({}));
      report.calls = calls;
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile-error.png" : "-desktop-error.png"),
      });
      throw e;
    } finally {
      await context.close();
      writeFileSync(
        output,
        JSON.stringify(
          {
            ok: reports.every((r) => !r.error),
            reports,
            limitation:
              "Isolated desktop/touch-mobile profiles, real adapter code with controlled provider responses and an accelerated clock; no real follows or network provider soak.",
          },
          null,
          2,
        ),
      );
    }
  }
} finally {
  await browser.close();
  globalThis.fetch = originalFetch;
  Date.now = realNow;
}
console.log(JSON.stringify({ ok: true, reports }, null, 2));
