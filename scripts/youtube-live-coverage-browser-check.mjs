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
  output = checkedOutputPath(process.argv[3] ?? "screenshots/live-coverage.json", [
    resolve("screenshots"),
  ]);
const original = globalThis.fetch;
let phase = "queue",
  rateLimited = false,
  release,
  gate,
  requests = [];
const find = (v, p) => {
  if (!v || typeof v !== "object") return;
  if (p(v)) return v;
  for (const child of Object.values(v)) {
    const r = find(child, p);
    if (r) return r;
  }
};
globalThis.fetch = async (url, init) => {
  if (String(url).includes("/youtubei/")) {
    const id = JSON.parse(init.body).browseId;
    if (rateLimited && Number(id.slice(2)) >= 16)
      return new Response("Rate limited", { status: 429, headers: { "retry-after": "60" } });
    return Response.json({
      metadata: { channelMetadataRenderer: { externalId: id } },
      contents: {
        twoColumnBrowseResultsRenderer: {
          tabs: [
            {
              tabRenderer: {
                selected: true,
                title: "Live",
                content: { richGridRenderer: { contents: [] } },
              },
            },
          ],
        },
      },
    });
  }
  throw Error("Unexpected provider " + String(url));
};
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const viewport of [
    { name: "desktop", phase:"queue", width: 1440, height: 1000 },
    { name: "mobile", phase:"queue", width: 390, height: 844 },
    { name: "desktop", phase:"rate", width: 1440, height: 1000 },
    { name: "mobile", phase:"rate", width: 390, height: 844 },
  ]) {
    offset += 600000;
    phase = viewport.phase;
    rateLimited = false;
    requests = [];
    gate = new Promise((r) => (release = r));
    const context = await browser.newContext({ viewport }),
      page = await context.newPage(),
      checks = [],
      errors = [],
      report = { viewport: viewport.name, phase, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(45000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) errors.push(m.text());
    });
    await context.addInitScript((baseOffset) => {
      const real = Date.now;
      window.__coverageClockShift = 0;
      Date.now = () => real() + baseOffset + window.__coverageClockShift;
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
    await page.route("**/_serverFn/**", async (route) => {
      const input = fromJSON(JSON.parse(route.request().postData() ?? "{}")),
        data = find(input, (v) => Array.isArray(v.channels) && v.channels.some((c) => c?.kind));
      if (data) {
        requests.push(data.channels.map((c) => c.id));
        if (phase === "rate") {
          const first = Number(data.channels[0].channelId.slice(2));
          if (first >= 16) await gate;
          else if (first >= 8) await new Promise((r) => setTimeout(r, 1700));
        }
      }
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
    const seed = async (count, mixed) =>
      page.evaluate(
        ({ count, mixed }) => {
          const now = Date.now(),
            channels = Array.from({ length: count }, (_, i) => ({
              id: "yt:UC" + String(i).padStart(22, "0"),
              channelId: "UC" + String(i).padStart(22, "0"),
              kind: "youtube",
              handle: "creator" + i,
              title: "Creator " + String(i).padStart(4, "0"),
              live: false,
              ...(mixed
                ? i < 500
                  ? { liveCheckedAt: now - 10000 }
                  : i < 1000
                    ? { liveCheckedAt: now - 600000 }
                    : i < 1300
                      ? {
                          liveCheckedAt: now - 10000,
                          lastLiveFailure: {
                            at: now - 1000,
                            retryAt: now + 300000,
                            kind: "unavailable",
                            message: "Fixture retry wait",
                            recovery: "Retry later",
                          },
                        }
                      : i < 1500
                        ? {
                            lastLiveFailure: {
                              at: now - 1000,
                              retryAt: now + 300000,
                              kind: "unavailable",
                              message: "Fixture not verified",
                              recovery: "Retry later",
                            },
                          }
                        : {}
                : { liveCheckedAt: now - 600000 }),
            }));
          localStorage.setItem("reelcase.follows.v1", JSON.stringify({ channels, savedAt: now }));
        },
        { count, mixed },
      );
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      let yt;
      if(phase==='queue'){
      await seed(2000, true);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      yt = page.getByRole("region", { name: "YouTube quick live checks" });
      await yt.getByText(/500 \/ 2,000 creators checked successfully/).waitFor();
      await yt
        .getByText("YouTube creator check queue · 1,000 ready · 500 waiting", { exact: true })
        .click();
      let queue = yt.getByRole("region", { name: "YouTube creator check queue" });
      assert.equal(await queue.locator("[data-live-queue-row]").count(), 20);
      assert.equal(requests.length, 0);
      const first = await queue
        .locator("[data-live-queue-row]")
        .first()
        .getAttribute("data-live-queue-row");
      await queue.getByRole("button", { name: "Next creators", exact: true }).click();
      assert.notEqual(
        await queue.locator("[data-live-queue-row]").first().getAttribute("data-live-queue-row"),
        first,
      );
      checks.push(
        "Mixed 2,000-creator ledger excludes latest failures from successful freshness, partitions ready/retry waits, and mounts only 20 queue rows; opening/paging starts no requests",
      );
      await queue
        .getByRole("combobox", { name: "Live check queue filter" })
        .selectOption("waiting");
      await queue.getByRole("textbox", { name: "Search live check creators" }).fill("Creator 1001");
      await page.waitForFunction(
        () => document.querySelectorAll("[data-live-queue-row]").length === 1,
      );
      assert.equal(await queue.locator("[data-live-queue-row]").count(), 1);
      assert.equal(
        await queue.getByRole("button", { name: "Check Creator 1001", exact: true }).isDisabled(),
        true,
      );
      await queue.getByRole("combobox", { name: "Live check queue filter" }).selectOption("due");
      await queue.getByRole("textbox", { name: "Search live check creators" }).fill("Creator 0500");
      await queue.getByRole("button", { name: "Check Creator 0500", exact: true }).click();
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels.find(
            (c) => c.handle === "creator500",
          ).liveCheckedAt >
          Date.now() - 300000,
      );
      assert.equal(requests.length, 1);
      assert.equal(requests[0].length, 1);
      checks.push(
        "Search/filter finds a creator, waiting rows cannot bypass retry, and a focused check sends exactly one creator through the real API/store",
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      yt = page.getByRole("region", { name: "YouTube quick live checks" });
      await yt.getByText(/501 \/ 2,000 creators checked successfully/).waitFor();
      checks.push("A successful focused observation survives reload and updates distinct coverage");
      await yt.scrollIntoViewIfNeeded();
      await yt.getByText(/YouTube creator check queue · 999 ready · 500 waiting/).click();
      await page.screenshot({ path: output.replace(".json", "-queue-" + viewport.name + ".png") });
      } else {
      requests = [];
      await seed(32, false);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      yt = page.getByRole("region", { name: "YouTube quick live checks" });
      await yt
        .getByRole("button", { name: "Check all YouTube live channels", exact: true })
        .click();
      await yt.locator('[data-throughput-state="active"]').waitFor();
      await yt.getByText(/Ready queue estimate:/).waitFor();
      await yt.scrollIntoViewIfNeeded();
      await page.screenshot({ path: output.replace(".json", "-rate-" + viewport.name + ".png") });
      checks.push(
        "Two real completed successful batches over one second produce a bounded ready-queue range while other batches are held",
      );
      await page.evaluate(() => (window.__coverageClockShift = 31000));
      await page.waitForTimeout(16000);
      await yt.locator('[data-throughput-state="stalled"]').waitFor();
      assert.equal(await yt.getByText(/Ready queue estimate:/).count(), 0);
      checks.push(
        "When successful results stall, the displayed estimate disappears instead of counting down",
      );
      rateLimited = true;
      release();
      await yt.locator('[data-throughput-state="waiting"]').waitFor();
      assert.equal(await yt.getByText(/Ready queue estimate:/).count(), 0);
      await yt.getByText(/YouTube asked to wait/).waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      checks.push(
        "A real adapter 429 cooldown replaces the ETA with a provider wait; no console errors or mobile overflow",
      );
      }
    } catch (e) {
      report.error = e.stack;
      await page
        .screenshot({ path: output.replace(".json", "-" + phase + "-" + viewport.name + "-failure.png") })
        .catch(() => {});
      throw e;
    } finally {
      release();
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
              "Isolated Chrome desktop/mobile with actual API/store and controlled public responses; adjusted clock and the existing visible-page timer for stalled state, not a real-provider load or physical-device test.",
          },
          null,
          2,
        ),
      );
    }
  }
} finally {
  Date.now = realNow;
  globalThis.fetch = original;
  await browser.close();
}
console.log(JSON.stringify({ ok: true, reports }, null, 2));
