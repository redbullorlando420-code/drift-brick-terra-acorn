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
const { runFollowRemote } = await import("../src/lib/remote/api.ts");
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/twitch-policy-ui.json", [
    resolve("screenshots"),
  ]);

const original = globalThis.fetch;
let upstream = [];
globalThis.fetch = async (_u, init) => {
  const q = JSON.parse(init.body);
  upstream.push(q);
  const type = q.query.match(/type:(ARCHIVE|HIGHLIGHT|UPLOAD)/)?.[1];
  return Response.json({
    data: {
      user: {
        id: "policy-owner",
        displayName: "Policy creator",
        stream: null,
        ...(type
          ? {
              videos: {
                edges: [
                  {
                    node: {
                      id: { ARCHIVE: "701", HIGHLIGHT: "702", UPLOAD: "703" }[type],
                      title: "Saved " + type,
                      lengthSeconds: 3000,
                      publishedAt: "2025-01-01T00:00:00Z",
                    },
                  },
                ],
                pageInfo: { hasNextPage: false },
              },
            }
          : {
              clips: {
                edges: [
                  { node: { slug: "PolicyPublicClip", title: "Manual clip", durationSeconds: 20 } },
                ],
                pageInfo: { hasNextPage: false },
              },
            }),
      },
    },
  });
};
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
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport }),
      page = await context.newPage(),
      checks = [],
      errors = [],
      requests = [];
    const report = { viewport: viewport.name, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(45000);
    upstream = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) errors.push(m.text());
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
    await page.route("**/_serverFn/**", async (route) => {
      const input = fromJSON(JSON.parse(route.request().postData() ?? "{}")),
        data = find(input, (v) => v.kind === "twitch" && typeof v.query === "string");
      let result = null;
      if (data) {
        requests.push(data);
        result = await runFollowRemote(data);
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
        .getByRole("button", { name: /^Twitch(?:\s+\d+)?$/ })
        .click();
    };
    const manage = async () => {
      await page.getByRole("button", { name: "Manage Policy creator", exact: true }).click();
      await page.getByRole("group", { name: "Automatic Twitch pull policy" }).waitFor();
    };
    const saved = () =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels.find(
          (c) => c.title === "Policy creator",
        ),
      );
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate((name) => {
        const now = Date.now(),
          c = {
            id: "tw:policy_" + name,
            kind: "twitch",
            handle: "policy_" + name,
            title: "Policy creator",
            channelId: "policy-owner",
          };
        localStorage.setItem(
          "reelcase.follows.v1",
          JSON.stringify({ channels: [c], savedAt: now }),
        );
      }, viewport.name);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await manage();
      const controls = page.getByRole("group", { name: "Automatic Twitch pull policy" }),
        clips = controls.getByRole("checkbox", { name: "Include clips", exact: true }),
        vods = controls.getByRole("checkbox", { name: "Include VODs", exact: true }),
        priority = controls.getByRole("combobox", { name: "Automatic Twitch priority" });
      assert(await clips.isChecked());
      assert(await vods.isChecked());
      assert.equal(await priority.inputValue(), "normal");
      assert.equal((await saved()).twitchPullPolicy, undefined);
      assert.equal(requests.length, 0);
      await clips.uncheck();
      await vods.uncheck();
      await priority.selectOption("low");
      await controls.getByText(/Skipped by policy for automatic content/).waitFor();
      await page
        .locator('[aria-label="Twitch automatic policy coverage"]')
        .getByText(/1 clip sources · 1 VOD sources · 1 creators skip all content/)
        .waitFor();
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels[0]?.twitchPullPolicy
            ?.priority === "low",
      );
      assert.deepEqual((await saved()).twitchPullPolicy, {
        version: 1,
        clips: false,
        vods: false,
        priority: "low",
      });
      assert.equal(requests.length, 0);
      checks.push(
        "Legacy defaults stay unchanged; independent clip/VOD choices and bounded priority save without provider reads and show deliberate policy exclusions",
      );
      await controls.scrollIntoViewIfNeeded();
      await page.screenshot({ path: output.replace(".json", "-" + viewport.name + ".png") });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await manage();
      assert.equal(await clips.isChecked(), false);
      assert.equal(await vods.isChecked(), false);
      assert.equal(await priority.inputValue(), "low");
      checks.push(
        "Both exclusions and priority survive real follow storage reload on desktop and mobile",
      );
      await page.getByText("Quick creator refresh", { exact: true }).click();
      await page.getByRole("button", { name: "Refresh Policy creator", exact: true }).click();
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels[0]?.lastCheckedAt > 0,
      );
      assert.equal(requests.length, 1);
      assert(upstream.some((q) => /videos\(/.test(q.query)));
      assert(upstream.some((q) => /clips\(/.test(q.query)));
      assert.deepEqual((await saved()).twitchPullPolicy, {
        version: 1,
        clips: false,
        vods: false,
        priority: "low",
      });
      checks.push(
        "Explicit creator refresh still reads VODs and clips through the actual adapter while preserving saved automatic policy",
      );
      await controls
        .getByRole("button", { name: "Restore default pull policy", exact: true })
        .click();
      await page.waitForFunction(() => {
        const p = JSON.parse(localStorage.getItem("reelcase.follows.v1")).channels[0]
          ?.twitchPullPolicy;
        return p?.clips && p?.vods && p?.priority === "normal";
      });
      assert(await clips.isChecked());
      assert(await vods.isChecked());
      assert.equal(await priority.inputValue(), "normal");
      assert.equal(requests.length, 1);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await manage();
      assert(await clips.isChecked());
      assert(await vods.isChecked());
      assert.equal(await priority.inputValue(), "normal");
      assert.deepEqual(errors, []);
      checks.push(
        "Default recovery persists without extra requests; no horizontal overflow or uncaught browser errors",
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
              "Isolated Chrome profiles, real app/store/follow storage and controlled public Twitch adapter responses. Automatic 600-creator fairness is verified separately with deterministic scheduling/store tests; no real-provider soak is claimed.",
          },
          null,
          2,
        ),
      );
    }
  }
} finally {
  globalThis.fetch = original;
  await browser.close();
}
console.log(JSON.stringify({ ok: true, reports }, null, 2));
