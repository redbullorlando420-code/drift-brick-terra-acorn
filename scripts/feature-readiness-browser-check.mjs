import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/feature-readiness-dev.json", [
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
      requests = [],
      checks = [],
      report = { viewport: viewport.name, checks, errors };
    reports.push(report);
    let mode = "ready";
    page.setDefaultTimeout(25000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) errors.push(m.text());
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
      requests.push({ path, method: request.method() });
      let body = { ok: true };
      if (path === "/health")
        body = {
          ok: true,
          service: "reelcase-companion",
          version: 19,
          protocol: { major: mode === "incompatible" ? 2 : 1, minor: 0 },
          capabilities:
            mode === "unsupported"
              ? []
              : [
                  "studio-models",
                  "youtube-downloads",
                  "remote-launch-safeguards",
                  "root-access",
                  "capability-consent",
                ],
          roots: 1,
          platform: { schema: 1, os: "win32", pathStyle: "windows", windowsDesktop: true },
        };
      if (path === "/youtube/downloads") body = { ok: true, configured: true };
      if (path === "/studio/status")
        body =
          mode === "failed"
            ? { ok: false, error: "Controlled engine status failure" }
            : { ok: true, connected: true, ready: true, models: ["test model"] };
      if (path === "/studio/qwen/status")
        body = {
          ok: true,
          connected: false,
          ready: false,
          models: ["installed model is not generation proof"],
        };
      if (path === "/remote/status")
        body = { ok: true, installed: true, launcherRunning: true, sessionVerified: false };
      await route.fulfill({ headers, contentType: "application/json", body: JSON.stringify(body) });
    });
    const nav = async (name) => {
      if (viewport.name === "mobile")
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: name === "Mission plan" ? /^Mission plan(?:\s+\d+)?$/ : name, exact: true })
        .click();
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Settings");
      let panel = page.getByRole("region", { name: "Feature readiness", exact: true });
      await panel.waitFor();
      assert.equal(await panel.locator("[data-readiness]").count(), 0);
      await panel.getByRole("button", { name: "Review readiness", exact: true }).click();
      assert.equal(await panel.locator("[data-readiness]").count(), 8);
      assert.equal(
        await panel
          .locator('[data-readiness="a1111"] [data-configuration]')
          .getAttribute("data-configuration"),
        "unchecked",
      );
      assert.equal(
        requests.filter((r) =>
          [
            "/studio/status",
            "/studio/qwen/status",
            "/youtube/downloads",
            "/remote/status",
          ].includes(r.path),
        ).length,
        0,
      );
      const missionBefore = await page.evaluate(() =>
        localStorage.getItem("reelcase.mission-plan.v1"),
      );
      checks.push(
        "Opening the inventory reads saved metadata only; native rows remain unchecked and no setup starts.",
      );
      await panel.getByRole("button", { name: "Check local readiness", exact: true }).click();
      await panel.getByRole("status").filter({ hasText: "Snapshot at" }).waitFor();
      for (const id of ["a1111", "downloads", "remote"])
        assert.equal(
          await panel
            .locator('[data-readiness="' + id + '"] [data-configuration]')
            .getAttribute("data-configuration"),
          "ready",
        );
      assert.equal(
        await panel
          .locator('[data-readiness="qwen"] [data-configuration]')
          .getAttribute("data-configuration"),
        "unconfigured",
      );
      await panel
        .getByText("Successful image generation unverified", { exact: true })
        .first()
        .waitFor();
      await panel
        .getByText("Native authentication and session unverified", { exact: true })
        .waitFor();
      await panel
        .getByText("Live chat and installed game control unconnected", { exact: true })
        .waitFor();
      assert(requests.every((r) => r.method === "GET"));
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.mission-plan.v1")),
        missionBefore,
      );
      const evidence = await page.request.get(
        new URL("/feature-readiness-evidence.json", url).href,
      );
      assert.equal(evidence.status(), 200);
      const proof = await evidence.json();
      assert.equal(proof.nativeSessionsVerified, false);
      assert(proof.artifacts.length >= 3);
      checks.push(
        "Explicit bounded GET-only checks distinguish ready prerequisites from generation/session/chat verification; static evidence is linked and milestone state stays untouched.",
      );
      await panel.evaluate(node=>node.scrollIntoView({block:"start"}));
      await page.screenshot({ path: output.replace(".json", "-" + viewport.name + ".png") });
      mode = "failed";
      await panel.getByRole("button", { name: "Check local readiness", exact: true }).click();
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-readiness="a1111"] [data-configuration]')
            ?.getAttribute("data-configuration") === "unavailable",
      );
      mode = "unsupported";
      const before = requests.length;
      await panel.getByRole("button", { name: "Check local readiness", exact: true }).click();
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-readiness="remote"] [data-configuration]')
            ?.getAttribute("data-configuration") === "unsupported",
      );
      assert(requests.slice(before).every((r) => r.path === "/health"));
      mode = "incompatible";
      await panel.getByRole("button", { name: "Check local readiness", exact: true }).click();
      await page.waitForFunction(
        () =>
          document
            .querySelector('[data-readiness="remote"] [data-configuration]')
            ?.getAttribute("data-configuration") === "unavailable",
      );
      checks.push(
        "A failed engine check, absent capabilities and incompatible protocol remain explicit; unsupported actions are never dispatched.",
      );
      mode = "ready";
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Settings");
      await page.getByRole("heading", { name: "Feature readiness", exact: true }).waitFor();
      panel = page.getByRole("region", { name: "Feature readiness", exact: true });
      await panel.getByRole("button", { name: "Review readiness", exact: true }).click();
      assert.equal(
        await panel
          .locator('[data-readiness="a1111"] [data-configuration]')
          .getAttribute("data-configuration"),
        "unchecked",
      );
      const buttons = await panel
        .getByRole("button")
        .evaluateAll((nodes) =>
          nodes.map((n) => ({
            height: n.getBoundingClientRect().height,
            width: n.getBoundingClientRect().width,
          })),
        );
      assert(buttons.every((b) => b.height >= 43 && b.width >= 43));
      await panel.getByRole("button", { name: "Open Stream Signal", exact: true }).click();
      await page.getByRole("button", { name: "Generate announcement pack", exact: true }).waitFor();
      await nav("Mission plan");
      panel = page.getByRole("region", { name: "Feature readiness", exact: true });
      await panel.getByRole("button", { name: "Review readiness", exact: true }).click();
      await panel
        .getByText("Live chat and installed game control unconnected", { exact: true })
        .waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      checks.push(
        "Snapshots reset after reload, actions reach existing sections, Mission plan offers the same inventory, and touch targets/overflow/console checks pass.",
      );
      report.ok = true;
    } catch (error) {
      report.ok = false;
      report.error = error.stack;
      await page.screenshot({
        path: output.replace(".json", "-failure-" + viewport.name + ".png"),
      });
      console.error(error.stack);
    } finally {
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
    "Controlled local status responses and isolated browser profiles. No account, engine, download, chat or native remote session was connected.",
};
await writeFile(output, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
