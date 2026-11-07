import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { fromJSON } from "seroval";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/archive-planning-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0archive-planning-probe",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "archive-planning",
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) =>
          id === entry
            ? ["src/lib/videos/persist.ts", "src/lib/pull-settings.ts", "src/lib/pull-control.ts"]
                .map(
                  (file) =>
                    "export * from " + JSON.stringify(resolve(file).replaceAll("\\", "/")) + ";",
                )
                .join("\n")
            : undefined,
      },
    ],
  });
const built = await bundle.generate({ format: "esm" });
await bundle.close();
const code = built.output.find((row) => row.type === "chunk").code;
const find = (value, test) => {
  if (!value || typeof value !== "object") return;
  if (test(value)) return value;
  for (const child of Object.values(value)) {
    const match = find(child, test);
    if (match) return match;
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
      }),
      page = await context.newPage(),
      report = { mobile, checks: [], errors: [], requests: 0 };
    reports.push(report);
    page.setDefaultTimeout(30000);
    page.on("pageerror", (error) => report.errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && !/ERR_ABORTED/.test(message.text()))
        report.errors.push(message.text());
    });
    await context.route("**/__archive-planning-probe.mjs", (route) =>
      route.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__archive-planning-blank.html", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Isolated archive planning fixture</title><p>Fixture preparation</p>",
      }),
    );
    await context.route("http://127.0.0.1:43123/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.addInitScript(() => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (
          key === "reelcase.pull-settings.v1" &&
          sessionStorage.getItem("qa-block-pull-settings") === "true"
        )
          throw new DOMException("Controlled settings quota", "QuotaExceededError");
        return original.call(this, key, value);
      };
    });
    await context.route("**/_serverFn/**", async (route) => {
      let input;
      try {
        input = fromJSON(JSON.parse(route.request().postData() ?? "null"));
      } catch {}
      const data = find(input, (v) => Array.isArray(v.providers) && v.providerPages);
      let result = { channels: [], profiles: [] };
      if (data) {
        report.requests++;
        assert.equal(data.automatic, false);
        result = {
          videos: [
            {
              id: "eporner:planning-manual",
              folderId: "eporner:discover",
              name: "QA manual archive recording",
              path: "QA",
              extension: "mp4",
              mime: "video/mp4",
              addedAt: 1,
              remote: { kind: "eporner", videoId: "planning-manual" },
            },
          ],
          providerNextPages: { eporner: null },
          providerNextOffsets: { eporner: 0 },
          providerDiagnostics: [
            { provider: "eporner", status: "loaded", titles: 1, detail: "Fixture public metadata" },
          ],
        };
      }
      await route
        .fulfill({ contentType: "application/json", body: JSON.stringify({ result, context: {} }) })
        .catch(() => {});
    });
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    };
    const panel = page.getByRole("region", { name: "Automatic archive work window", exact: true });
    const fill = async (start, end, zone) => {
      await panel.getByRole("textbox", { name: "Archive time zone" }).fill(zone);
      await panel.getByLabel("Archive start time", { exact: true }).fill(start);
      await panel.getByLabel("Archive end time", { exact: true }).fill(end);
    };
    try {
      await page.goto(new URL("/__archive-planning-blank.html", url).href);
      await page.evaluate(async () => {
        const p = await import("/__archive-planning-probe.mjs");
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem(
          "reelcase.sidebar.groups.v1",
          JSON.stringify({ library: true, workspace: true, tools: true }),
        );
        localStorage.setItem("reelcase.artwork-mode", "text");
        p.updatePullSettings({ automaticPulls: false });
        p.savePrefs({ ...p.loadPrefs(), sourceId: "home", hideDemo: true });
        await p.waitForDurableWrites();
        const values = {};
        for (const provider of [
          "eporner",
          "redtube",
          "chaturbate",
          "myfreecams",
          "reddit",
          "booru",
          "redgifs",
        ]) {
          values[provider + "::all::top-weekly"] = {
            page: 2,
            offset: 10,
            query: "all",
            order: "top-weekly",
            paging: 2,
            updatedAt: provider === "reddit" ? 1 : 100,
            yield: {
              version: 1,
              windows: provider === "eporner" ? 2 : 8,
              score: provider === "redgifs" ? 900 : 0,
              recovery: provider === "eporner" ? 2 : 4,
            },
          };
          if (provider === "eporner" || provider === "redtube")
            for (const order of ["latest", "most-popular", "top-rated", "top-monthly"])
              values[provider + "::all::" + order] = {
                page: 1,
                query: "all",
                order,
                paging: 2,
                updatedAt: 1,
                state: "exhausted",
                retryAt: Date.now() + 3600000,
              };
        }
        localStorage.setItem("reelcase.adult-archive-cursors.v1", JSON.stringify(values));
      });
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Settings");
      await panel.waitFor();
      await panel.getByText("Automatic archive hours: unrestricted.", { exact: true }).waitFor();
      await panel.getByLabel("Use a daily archive window", { exact: true }).check();
      await fill("23:00", "01:00", "UTC");
      await panel.getByRole("button", { name: "Save archive hours", exact: true }).click();
      await panel.getByText("Archive hours saved in this profile.", { exact: true }).waitFor();
      await panel.getByRole("status").filter({ hasText: "(overnight)" }).waitFor();
      let original = await page.evaluate(() => localStorage.getItem("reelcase.pull-settings.v1"));
      await fill("23:00", "23:00", "UTC");
      await panel.getByRole("button", { name: "Save archive hours", exact: true }).click();
      await panel.getByRole("alert").waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.pull-settings.v1")),
        original,
      );
      await fill("23:00", "01:00", "Not/AZone");
      await panel.getByRole("button", { name: "Save archive hours", exact: true }).click();
      await panel.getByRole("alert").waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.pull-settings.v1")),
        original,
      );
      report.checks.push(
        "Daily overnight hours save explicitly; equal times and invalid zones preserve the saved schedule",
      );
      await panel.getByLabel("Use a daily archive window", { exact: true }).uncheck();
      await panel.getByRole("button", { name: "Save archive hours", exact: true }).click();
      await panel.getByText("Automatic archive hours: unrestricted.", { exact: true }).waitFor();
      original = await page.evaluate(() => localStorage.getItem("reelcase.pull-settings.v1"));
      await panel.getByLabel("Use a daily archive window", { exact: true }).check();
      report.checks.push(
        "Disabling a damaged draft restores unrestricted hours without requiring a valid timezone",
      );
      const closed = await page.evaluate(() => {
        const d = new Date(),
          minute = d.getUTCHours() * 60 + d.getUTCMinutes(),
          clock = (n) =>
            String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0");
        return { start: clock((minute + 60) % 1440), end: clock((minute + 120) % 1440) };
      });
      await fill(closed.start, closed.end, "UTC");
      await page.evaluate(() => sessionStorage.setItem("qa-block-pull-settings", "true"));
      await panel.getByRole("button", { name: "Save archive hours", exact: true }).click();
      await panel.getByRole("status").filter({ hasText: "apply to this session" }).waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.pull-settings.v1")),
        original,
      );
      await page.evaluate(() => sessionStorage.removeItem("qa-block-pull-settings"));
      await panel.getByRole("button", { name: "Save archive hours", exact: true }).click();
      await panel.getByRole("status").filter({ hasText: "Paused by archive schedule" }).waitFor();
      await panel.screenshot({
        path: output.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Settings");
      await panel.getByRole("status").filter({ hasText: "Paused by archive schedule" }).waitFor();
      report.checks.push(
        "Quota failure keeps prior disk settings and shows the session-only result; retry and reload retain the chosen timezone/hours",
      );
      const transport = await page.evaluate(async () => {
        const p = await import("/__archive-planning-probe.mjs"),
          saved = p.getPullSettings().archiveWorkWindow;
        p.setActivePullPage("adults");
        p.setPullsPaused(false);
        let started = 0,
          deferred = false;
        try {
          await p.runPausablePull(async () => ++started, { automatic: true, provider: "adults" });
        } catch (e) {
          deferred = e.name === "PullPriorityDeferredError";
        }
        const manual = await p.runPausablePull(async () => "manual"),
          live = await p.runPausablePull(async () => "live", {
            automatic: true,
            live: true,
            provider: "youtube",
          });
        p.updatePullSettings({ archiveWorkWindow: p.DEFAULT_PULL_SETTINGS.archiveWorkWindow });
        let done;
        const accepted = p.runPausablePull(
          () => {
            started++;
            return new Promise((resolve) => (done = resolve));
          },
          { automatic: true, provider: "adults" },
        );
        for (let i = 0; i < 500 && !done; i++)
          await new Promise((resolve) => setTimeout(resolve, 10));
        if (!done) throw Error("Accepted request did not start");
        p.updatePullSettings({ archiveWorkWindow: saved });
        done(42);
        const result = await accepted;
        p.setPullsPaused(true);
        return { deferred, manual, live, started, result };
      });
      assert.deepEqual(transport, {
        deferred: true,
        manual: "manual",
        live: "live",
        started: 1,
        result: 42,
      });
      report.checks.push(
        "Actual browser transport holds automatic dispatch outside hours, allows manual/live requests and accepts an in-flight result after closure",
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      for (const name of ["YouTube", "Twitch"]) {
        await nav(name);
        await page
          .getByRole("region", { name: "Archive hours notice", exact: true })
          .getByRole("status")
          .filter({ hasText: "Paused by archive schedule" })
          .waitFor();
      }
      await nav("Adults");
      const notice = page.getByRole("region", { name: "Archive hours notice", exact: true });
      await notice.getByRole("status").filter({ hasText: "Paused by archive schedule" }).waitFor();
      await notice.getByRole("button", { name: "Change archive hours", exact: true }).click();
      await panel.waitFor();
      await nav("Adults");
      const progress = page.locator('details[aria-label="Adult archive progress"]');
      await progress.locator(":scope > summary").click();
      await progress
        .getByText("Resume positions saved with accepted catalog windows in this profile.", {
          exact: true,
        })
        .waitFor();
      const planning = progress.locator('[aria-label="Automatic source planning"]');
      await planning
        .locator('[data-yield-provider="reddit"]')
        .getByText(/guaranteed exploration/)
        .waitFor();
      await planning
        .locator('[data-yield-provider="redgifs"]')
        .getByText(/Useful yield within existing turn/)
        .waitFor();
      assert((await planning.locator("[data-yield-provider]").count()) <= 7);
      assert.equal(report.requests, 0);
      const provider = progress.locator('[data-archive-lanes="eporner"]');
      await provider.locator("summary").click();
      await provider
        .getByRole("button", { name: "Continue Eporner Top this week", exact: true })
        .click();
      await page.getByRole("button", { name: "Resume pulls", exact: true }).click();
      await progress.getByRole("status").filter({ hasText: "Archive turn finished" }).waitFor();
      assert.equal(report.requests, 1);
      const receipt = await page.evaluate(async () => {
        const db = await new Promise((resolve) => {
          const r = indexedDB.open("reelcase", 8);
          r.onsuccess = () => resolve(r.result);
        });
        try {
          return await new Promise((resolve) => {
            const r = db
              .transaction("activity")
              .objectStore("activity")
              .get("adult-archive-cursors:v1");
            r.onsuccess = () =>
              resolve(r.result.positions["eporner::all::top-weekly"].cursor.yield);
          });
        } finally {
          db.close();
        }
      });
      assert.equal(receipt.windows, 3);
      assert.equal(receipt.recovery, 3);
      assert(receipt.score > 0);
      await planning.screenshot({
        path: output.replace(".json", mobile ? "-planning-mobile.png" : "-planning-desktop.png"),
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      report.checks.push(
        "Bounded source preview explains fair/productive slots; manual selected-sort pull works outside hours and updates a durable yield observation",
      );
      assert.deepEqual(report.errors, []);
    } catch (error) {
      report.error = error.stack;
      await page
        .screenshot({
          path: output.replace(".json", mobile ? "-failure-mobile.png" : "-failure-desktop.png"),
        })
        .catch(() => {});
      console.error(error.stack);
    } finally {
      await context.unrouteAll({ behavior: "ignoreErrors" });
      await context.close();
      await writeFile(
        output,
        JSON.stringify(
          {
            ok: reports.every((row) => !row.error),
            reports,
            limitations:
              "Disposable profiles and deterministic provider metadata; physical-device behavior and live provider yield remain unverified.",
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
process.exitCode = reports.every((report) => !report.error) ? 0 : 1;
