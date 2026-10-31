import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/model-remote-dev.json", [
    resolve("screenshots"),
  ]);
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
        viewport,
        isMobile: viewport.name === "mobile",
        hasTouch: viewport.name === "mobile",
      }),
      page = await context.newPage(),
      errors = [],
      checks = [],
      requests = [],
      report = { viewport: viewport.name, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(25000);
    let transfer = {
        id: "11111111-2222-3333-4444-555555555555",
        name: "fixture.safetensors",
        role: "checkpoints",
        repo: "fixture/model",
        revision: "a".repeat(40),
        state: "interrupted",
        received: 4 * 1024 ** 2,
        bytes: 18 * 1024 ** 2,
        note: "Controlled lost connection; saved partial retained.",
      },
      job = null,
      changed = false,
      approval = null,
      launcher = false,
      launch = null,
      loseResponse = true,
      launches = 0,
      nativeReads = 0;
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (
        m.type() === "error" &&
        !/ERR_ABORTED|ERR_FAILED|Failed to load resource.*(400|503)/.test(m.text())
      )
        errors.push(m.text());
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
      const input = request.postData() ? request.postDataJSON() : {};
      requests.push({ path, input });
      let body = { ok: true },
        status = 200;
      if (path === "/health")
        body = {
          ok: true,
          service: "reelcase-companion",
          version: 19,
          protocol: { major: 1, minor: 0 },
          capabilities: [
            "studio-models",
            "capability-consent",
            "model-transfer-recovery",
            "remote-launch-safeguards",
          ],
        };
      if (path === "/permissions")
        body = {
          ok: true,
          version: 1,
          revision: 1,
          scopes: {
            "model-transfers": { allowed: true, generation: 1 },
            "provider-session": { allowed: false, generation: 0 },
          },
        };
      if (path === "/studio/models")
        body = {
          ok: true,
          models:
            transfer.state === "done"
              ? [{ name: transfer.name, role: "checkpoints", engine: "a1111" }]
              : [],
          job,
          modelTransferRecovery: { version: 1, maxEntries: 8, entries: [transfer] },
        };
      if (["/studio/status", "/studio/qwen/status"].includes(path))
        body = { ok: true, connected: false, ready: false, models: [] };
      if (path.endsWith("/review") && path.includes("/transfers/")) {
        if (changed) transfer = { ...transfer, state: "restart-required" };
        body = {
          ok: true,
          review: {
            ...transfer,
            canResume: !changed,
            restartRequired: changed,
            ...(changed
              ? { issue: "Remote file identity changed. The saved partial was kept." }
              : {}),
          },
        };
      }
      if (path.endsWith("/resume") && path.includes("/transfers/")) {
        assert(!changed);
        job = {
          id: "resumed",
          label: "Fixture model",
          state: "running",
          received: transfer.received,
          total: transfer.bytes,
          note: "Resuming verified fixture",
          transferId: transfer.id,
        };
        transfer = { ...transfer, state: "downloading" };
        body = { ok: true, job };
      }
      if (path === "/studio/models/pause") {
        job = { ...job, state: "paused", note: "Paused fixture" };
        transfer = { ...transfer, state: "paused", received: 8 * 1024 ** 2 };
      }
      if (path.endsWith("/fresh-review"))
        body = {
          ok: true,
          source: {
            repo: "fixture/model",
            revision: "b".repeat(40),
            file: transfer.name,
            bytes: transfer.bytes,
          },
          fingerprint: "f".repeat(64),
          note: "Old partial retained; existing models never replaced.",
        };
      if (path.endsWith("/fresh") && path.includes("/transfers/")) {
        assert.equal(input.confirmation, "START FRESH");
        assert.equal(input.fingerprint, "f".repeat(64));
        job = {
          id: "fresh",
          label: "Fresh fixture",
          state: "done",
          received: transfer.bytes,
          total: transfer.bytes,
          note: "Verified fixture installed.",
        };
        transfer = { ...transfer, state: "done" };
        body = { ok: true, job };
      }
      if (path === "/remote/status") {
        nativeReads++;
        body = {
          ok: true,
          safeguards: 2,
          installed: true,
          launcherRunning: launcher,
          sessionVerified: false,
          unattendedSupported: false,
          launch,
          audit: launch ? [{ event: "User requested a native connection", at: Date.now() }] : [],
        };
      }
      if (path === "/remote/arm") {
        assert.match(input.requester, /^[a-f0-9-]{36}$/);
        approval = {
          token: "a".repeat(48),
          requester: input.requester,
          peer: input.peer,
          expires: Date.now() + 1000,
        };
        body = { ok: true, ...approval, ttlMs: 1000 };
      }
      if (path === "/remote/revoke") {
        approval = null;
      }
      if (path === "/remote/connect") {
        assert.equal(input.requester, approval.requester);
        assert.equal(input.token, approval.token);
        assert.equal(input.confirmation, "CONNECT " + approval.peer);
        approval = null;
        launches++;
        launcher = true;
        launch = {
          id: "66666666-7777-8888-9999-000000000000",
          state: "launch-requested",
          requestedAt: Date.now(),
          sessionVerified: false,
        };
        if (loseResponse) {
          loseResponse = false;
          await route.abort("failed");
          return;
        }
        body = {
          ok: true,
          launch,
          note: "Fixture native request; authentication remains in RustDesk.",
        };
      }
      if (path === "/remote/lock") {
        approval = null;
        if (launch) {
          launch = { ...launch, state: "stop-requested" };
        }
        body = { ok: true, note: "Stop requested; native disconnection remains unverified." };
      }
      await route.fulfill({
        status,
        headers,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });
    const nav = async (name) => {
      if (viewport.name === "mobile")
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name, exact: true })
        .click();
    };
    const shot = async (name, target) => {
      await target.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", "-" + name + "-" + viewport.name + ".png"),
      });
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Stable Diffusion");
      const recovery = page.getByRole("region", { name: "Saved model transfers", exact: true });
      await recovery.waitFor();
      assert(!requests.some((r) => r.path.includes("/transfers/")));
      await recovery
        .getByRole("button", { name: "Review transfer fixture.safetensors", exact: true })
        .click();
      await recovery
        .getByRole("status")
        .filter({ hasText: "Partial and publisher identity verified" })
        .waitFor();
      await recovery
        .getByRole("button", { name: "Resume verified transfer fixture.safetensors", exact: true })
        .click();
      await page.getByRole("button", { name: "Pause model transfer", exact: true }).click();
      await recovery.getByText("paused", { exact: true }).waitFor();
      assert.equal(requests.filter((r) => r.path.endsWith("/resume")).length, 1);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Stable Diffusion");
      await recovery.waitFor();
      assert.equal(requests.filter((r) => r.path.endsWith("/resume")).length, 1);
      changed = true;
      await recovery
        .getByRole("button", { name: "Review transfer fixture.safetensors", exact: true })
        .click();
      await recovery.getByRole("status").filter({ hasText: "identity changed" }).waitFor();
      assert.equal(
        await recovery
          .getByRole("button", {
            name: "Resume verified transfer fixture.safetensors",
            exact: true,
          })
          .count(),
        0,
      );
      await recovery
        .getByRole("button", {
          name: "Review separate fresh transfer fixture.safetensors",
          exact: true,
        })
        .click();
      const fresh = recovery.getByRole("button", {
        name: "Start separate fresh transfer fixture.safetensors",
        exact: true,
      });
      assert(await fresh.isDisabled());
      for (const button of await recovery.getByRole("button").all()) {
        const bounds = await button.boundingBox();
        assert(
          !bounds || (bounds.x >= 0 && bounds.x + bounds.width <= viewport.width),
          "model controls stay inside viewport",
        );
      }
      await shot("model-review", recovery);
      await recovery
        .getByRole("checkbox", {
          name: "Start a separate download and retain the earlier partial",
          exact: true,
        })
        .check();
      await fresh.click();
      await recovery.getByText("done", { exact: true }).waitFor();
      checks.push(
        "Saved receipt loads without resuming; explicit identity review gates resume, pause/reload retains progress, changed identity blocks append, and reviewed fresh download requires its own acknowledgement.",
      );
      await nav("Remote desktop");
      await page
        .getByRole("region", { name: "Remote session verification", exact: true })
        .waitFor();
      const reads = nativeReads;
      await page.waitForTimeout(600);
      assert.equal(nativeReads, reads);
      assert.equal(launches, 0);
      await page.getByRole("button", { name: "Check RustDesk", exact: true }).click();
      await page.getByLabel("RustDesk peer ID", { exact: true }).fill("123456789");
      await page
        .getByRole("checkbox", {
          name: "I own this device or have permission to connect",
          exact: true,
        })
        .check();
      await page.getByRole("button", { name: "Prepare connection", exact: true }).click();
      await page.getByLabel("Connection confirmation", { exact: true }).fill("CONNECT 123456789");
      await page
        .getByText("Connection approval expired. Prepare a new request.", { exact: true })
        .waitFor();
      assert.equal(launches, 0);
      await page.getByRole("button", { name: "Prepare connection", exact: true }).click();
      await page.getByLabel("Connection confirmation", { exact: true }).fill("CONNECT 123456789");
      await page.getByRole("button", { name: "Launch RustDesk connection", exact: true }).click();
      await page
        .getByRole("heading", { name: "Latest native launch request", exact: true })
        .waitFor();
      await page.getByText("launch-requested", { exact: true }).waitFor();
      assert.equal(launches, 1);
      await page.getByRole("button", { name: "Lock launch controls", exact: true }).click();
      await page.getByText("stop-requested", { exact: true }).waitFor();
      await page
        .getByRole("heading", { name: "Remote session: unverified", exact: true })
        .waitFor();
      await shot(
        "remote-status",
        page.getByRole("heading", { name: "Latest native launch request", exact: true }),
      );
      await page.waitForTimeout(500);
      assert.equal(launches, 1);
      checks.push(
        "Remote page starts no probe or launch; expiry denies stale approval, missing launch response is resolved through explicit status without retry, stop remains a request, and native session permissions stay unverified.",
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
      console.error(error.stack);
      await page.screenshot({
        path: output.replace(".json", "-failure-" + viewport.name + ".png"),
      });
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
  limitations:
    "Isolated desktop/touch-mobile Chrome profiles and controlled Companion/provider responses. No real model transfer, RustDesk peer, native login or user data was used. Actual transfer bytes are separately verified by filesystem and copied-service tests.",
};
await writeFile(output, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
