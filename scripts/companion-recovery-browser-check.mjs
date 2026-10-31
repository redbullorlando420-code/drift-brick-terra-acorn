import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/companion-recovery-dev.json", [
    resolve("screenshots"),
  ]);
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
      errors = [],
      checks = [],
      calls = [],
      report = { mobile, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(25000);
    let mode = "old";
    const job = (id, status) => ({
      id,
      key: "BaW_jenozKc",
      title: "Saved task " + id,
      status,
      detail: status === "interrupted" ? "Companion stopped. Resume explicitly." : "Saved receipt",
      path: "",
      progress: 0,
      updatedAt: Date.now(),
      attempt: 1,
      source: "youtube",
      browser: "firefox",
    });
    let jobs = [
      job("interrupted", "interrupted"),
      job("complete", "done"),
      job("cancelled", "cancelled"),
      job("paused","paused"),
      ...Array.from({ length: 22 }, (_, i) => job("older-" + i, "done")),
    ];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.pull-settings.v1", JSON.stringify({ automaticPulls: false }));
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
    });
    await context.route("http://127.0.0.1:43123/**", async (route) => {
      const request = route.request(),
        path = new URL(request.url()).pathname,
        headers = {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
        };
      if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
      calls.push({ path, method: request.method() });
      let body = { ok: true };
      if (path === "/health")
        body =
          mode === "old"
            ? {
                ok: true,
                service: "reelcase-companion",
                version: 10,
                capabilities: ["file-health", "shortcut-catalog"],
              }
            : mode === "future"
              ? {
                  ok: true,
                  service: "reelcase-companion",
                  version: 99,
                  protocol: { major: 2, minor: 0 },
                  capabilities: ["task-receipts"],
                }
              : {
                  ok: true,
                  service: "reelcase-companion",
                  version: 16,
                  protocol: { major: 1, minor: 0 },
                  roots: 1,
                  capabilities: [
                    "file-health",
                    "shortcut-catalog",
                    "youtube-downloads",
                    "task-receipts",
                    "future-unknown",
                  ],
                };
      if (path === "/tasks")
        body =
          mode === "malformed"
            ? { ok: true, jobs: [{ id: "bad", title: { invalid: true } }] }
            : {
                ok: true,
                jobs,
                recovery: {
                  persistent: true,
                  retained: jobs.length,
                  maxEntries: 40,
                  maxPending: 8,
                },
              };
      if (path.endsWith("/resume")) {
        const id = path.split("/")[2];
        assert.deepEqual(request.postDataJSON(), {});
        jobs = jobs.map((j) =>
          j.id === id
            ? {
                ...j,
                status: "running",
                browser: "none",
                attempt: j.attempt + 1,
                detail: "Resume requested without saved sign-in.",
              }
            : j,
        );
        body = { ok: true, job: jobs.find((j) => j.id === id) };
      }
      if (path.endsWith("/cancel")) {
        const id = path.split("/")[2];
        jobs = jobs.map((j) =>
          j.id === id
            ? {
                ...j,
                status: "cancelled",
                detail: "Cancellation recorded. Partial files retained.",
              }
            : j,
        );
        body = { ok: true, job: jobs.find((j) => j.id === id) };
      }
      if (path === "/shortcuts")
        body = {
          ok: true,
          shortcuts: [{ name: "Supported old shortcut.lnk", path: "C:\\Fixture\\safe.lnk" }],
        };
      await route.fulfill({ headers, contentType: "application/json", body: JSON.stringify(body) });
    });
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    };
    const panel = () =>
      page.getByRole("region", { name: "Companion capabilities and job recovery", exact: true });
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Settings");
      await panel().waitFor();
      assert.equal(calls.filter((c) => c.path === "/tasks").length, 0);
      await panel().getByRole("button", { name: "Check Companion status", exact: true }).click();
      await panel()
        .getByText("Companion v10 · legacy feature negotiation · 0 approved roots", { exact: true })
        .waitFor();
      assert.equal(
        await panel()
          .locator('[data-companion-feature="file-health"]')
          .getAttribute("data-feature-ready"),
        "true",
      );
      assert.equal(
        await panel()
          .locator('[data-companion-feature="task-receipts"]')
          .getAttribute("data-feature-ready"),
        "false",
      );
      assert.equal(calls.filter((c) => c.path === "/tasks").length, 0);
      await nav("Games");
      await page.getByRole("button", { name: /Load approved desktop shortcuts/ }).click();
      await page.getByText("Supported old shortcut", { exact: true }).waitFor();
      assert.equal(calls.filter((c) => c.path === "/shortcuts").length, 1);
      assert.equal(calls.filter((c) => c.path === "/launch").length, 0);
      checks.push(
        "Older Companion keeps advertised file/shortcut operations usable while newer job controls remain unavailable",
      );
      await nav("Settings");
      mode = "future";
      await panel().getByRole("button", { name: "Check Companion status", exact: true }).click();
      await panel()
        .getByText(/Companion protocol is incompatible/)
        .first()
        .waitFor();
      assert.equal(await panel().locator('[data-feature-ready="true"]').count(), 0);
      assert.equal(calls.filter((c) => c.path === "/tasks").length, 0);
      checks.push(
        "An incompatible protocol fails closed with actionable guidance and preserves existing browser metadata",
      );
      mode = "current";
      await panel().getByRole("button", { name: "Refresh Companion status", exact: true }).click();
      await panel().locator('[data-companion-job="interrupted"]').waitFor();
      assert.equal(await panel().locator("[data-companion-job]").count(), 10);
      assert.equal(
        await panel()
          .locator('[data-companion-job="complete"]')
          .getByRole("button", { name: "Resume job" })
          .count(),
        0,
      );
      const paused=panel().locator('[data-companion-job="paused"]');await paused.getByText('Paused · check destination',{exact:true}).waitFor();assert.equal(calls.filter(c=>c.path==='/tasks/paused/resume').length,0);await paused.getByRole('button',{name:'Resume job',exact:true}).click();await paused.getByText('Resume requested without saved sign-in.',{exact:true}).waitFor();assert.equal(calls.filter(c=>c.path==='/tasks/paused/resume').length,1);await paused.getByRole('button',{name:'Cancel job',exact:true}).click();await paused.getByText('Cancelled',{exact:true}).waitFor();checks.push('Paused jobs remain explicit, can resume without saved sign-in and can be cancelled.');
      const interrupted = panel().locator('[data-companion-job="interrupted"]');
      await interrupted.getByRole("button", { name: "Resume job", exact: true }).focus();
      await page.keyboard.press("Enter");
      await interrupted
        .getByText("Resume requested without saved sign-in.", { exact: true })
        .waitFor();
      assert.equal(calls.filter((c) => c.path === "/tasks/interrupted/resume").length, 1);
      assert.equal(jobs[0].id, "interrupted");
      assert.equal(jobs[0].browser, "none");
      assert.equal(jobs[0].attempt, 2);
      await interrupted.getByRole("button", { name: "Cancel job", exact: true }).click();
      await interrupted.getByText("Cancelled", { exact: true }).waitFor();
      assert.equal(calls.filter((c) => c.path === "/tasks/interrupted/cancel").length, 1);
      checks.push(
        "Explicit resume retains a receipt and increments its attempt without reusing browser consent; cancellation stays distinct from completion",
      );
      await panel().getByRole("button", { name: "Next jobs", exact: true }).click();
      assert.equal(await panel().locator("[data-companion-job]").count(), 10);
      await panel().getByRole("button", { name: "Previous jobs", exact: true }).click();
      const taskReads = calls.filter((c) => c.path === "/tasks").length;
      await page.waitForTimeout(2200);
      assert.equal(calls.filter((c) => c.path === "/tasks").length, taskReads);
      checks.push(
        "Saved history mounts ten rows per page and performs no idle polling or automatic recovery",
      );
      await panel().scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      await panel().getByRole('heading',{name:'Companion & local jobs',exact:true}).scrollIntoViewIfNeeded(); await page.screenshot({path:output.replace('.json',mobile?'-capabilities-mobile.png':'-capabilities-desktop.png')});
      const resumes = calls.filter((c) => c.path.endsWith("/resume")).length;
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Settings");
      await panel().getByRole("button", { name: "Check Companion status", exact: true }).click();
      await panel()
        .locator('[data-companion-job="interrupted"]')
        .getByText("Cancelled", { exact: true })
        .waitFor();
      assert.equal(calls.filter((c) => c.path.endsWith("/resume")).length, resumes);
      checks.push(
        "Reload reads the saved server outcome without re-enqueueing cancelled or completed work",
      );
      mode = "malformed";
      await panel().getByRole("button", { name: "Refresh Companion status", exact: true }).click();
      await panel()
        .getByRole("status")
        .filter({hasText:/unreadable job receipts/})
        .waitFor();
      assert.equal(calls.filter((c) => c.path.endsWith("/resume")).length, resumes);
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.ok = true;
    } catch (error) {
      report.ok = false;
      report.error = error.stack;
      console.error(error.stack);
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
    "Isolated browser profiles and controlled Companion responses. No real native app launch, media download, model install, browser-cookie read or external session was triggered.",
};
writeFileSync(output, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
