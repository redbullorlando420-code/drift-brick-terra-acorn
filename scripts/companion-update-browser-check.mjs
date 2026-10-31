import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/companion-update-dev.json", [
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
        acceptDownloads: true,
      }),
      page = await context.newPage(),
      errors = [],
      calls = [],
      checks = [],
      report = { mobile, errors, checks };
    reports.push(report);
    page.setDefaultTimeout(20000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    let mode = "before";
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      localStorage.setItem("reelcase.companion-update.v1:other-user", "keep-other-workspace");
    });
    await context.route("http://127.0.0.1:43123/**", async (route) => {
      const req = route.request(),
        path = new URL(req.url()).pathname,
        headers = {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
        };
      if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
      calls.push({ path, method: req.method() });
      let body = { ok: true };
      if (path === "/health")
        body = {
          ok: true,
          service: "reelcase-companion",
          version: mode === "before" ? 13 : 16,
          protocol: { major: mode === "incompatible" ? 9 : 1, minor: 0 },
          roots: mode === "before" ? 2 : 1,
          downloadRoot: "C:/private-user/secret",
          capabilities:
            mode === "before"
              ? ["file-health", "prints-bridge", "youtube-downloads", "task-receipts"]
              : ["task-receipts"],
          inspection: {
            schema: 1,
            configurationRef: (mode === "before" ? "a" : "b").repeat(64),
            tools: { ytDlp: mode === "before" ? "2026.10.28" : null, youtubeDl: null },
            destinations: {
              downloads: mode === "before",
              artwork: false,
              prints: mode === "before",
              libraryPack: false,
            },
            unknown: "secret-cookie",
          },
        };
      if (path === "/tasks")
        body = {
          ok: true,
          jobs: [
            {
              id: "private-job",
              title: "private-title",
              detail: "Saved receipt",
              key: "BaW_jenozKc",
              status: mode === "before" ? "cancelled" : "interrupted",
              progress: 0,
              source: "youtube",
              browser: "firefox",
              updatedAt: Date.now(),
            },
            ...(mode==='before'?[]:[{id:'paused-job',title:'Private paused title',status:'paused',source:'youtube',key:'12345678901',detail:'Check disk space',progress:0,updatedAt:Date.now()}]),
          ],
          recovery: { persistent: true, retained: 1, maxEntries: 40, maxPending: 8 },
        };
      await route.fulfill({ headers, contentType: "application/json", body: JSON.stringify(body) });
    });
    const nav = async () => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: "Settings", exact: true })
        .click();
    };
    const checklist = () =>
        page.getByRole("region", { name: "Companion update checklist", exact: true }),
      panel = () =>
        page.getByRole("region", { name: "Companion capabilities and job recovery", exact: true });
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await checklist().waitFor();
      assert(
        await checklist().getByRole("button", { name: "Save before-update snapshot" }).isDisabled(),
      );
      assert.equal(calls.filter((c) => c.path === "/tasks").length, 0);
      await panel().getByRole("button", { name: "Check Companion status", exact: true }).click();
      await checklist()
        .getByText(/yt-dlp: 2026.10.28/)
        .waitFor();
      await checklist().getByRole("button", { name: "Save before-update snapshot" }).click();
      await checklist()
        .getByText(/Before-update summary saved/)
        .waitFor();
      const before = await page.evaluate(() =>
        localStorage.getItem("reelcase.companion-update.v1:dev-user"),
      );
      assert(before);
      assert(!before.includes("private"));
      assert(!before.includes("secret"));
      checks.push("Explicit owner-scoped baseline stores redacted summaries only");
      mode = "after";
      await panel().getByRole("button", { name: "Refresh Companion status", exact: true }).click();
      await checklist()
        .getByText(/Missing capabilities/)
        .waitFor();
      await checklist()
        .getByText(/Approved-root count changed/)
        .waitFor();
      await checklist()
        .getByText(/configuration reference changed/)
        .waitFor();
      await checklist()
        .getByText(/1 interrupted download receipt/)
        .waitFor();
      await checklist().getByText(/1 download receipt.*paused/).waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.companion-update.v1:dev-user")),
        before,
      );
      checks.push(
        "Comparison exposes lost features, approvals, tools and interrupted jobs without replacing the baseline",
      );
      const downloadWait = page.waitForEvent("download");
      await checklist().getByRole("button", { name: "Export redacted update report" }).click();
      const download = await downloadWait;
      const stream = await download.createReadStream();
      let text = "";
      for await (const chunk of stream) text += chunk;
      const exported = JSON.parse(text);
      assert.equal(exported.baseline.roots, 2);
      assert.equal(exported.current.roots, 1);
      for (const secret of ["secret", "private-user", "private-job", "private-title", "firefox"])
        assert(!text.includes(secret));
      checks.push(
        "Export contains summaries and rollback reference without paths, job identities or session data",
      );
      await page.evaluate(() => {
        const original = Storage.prototype.setItem;
        window.restoreSnapshotStorage = () => (Storage.prototype.setItem = original);
        Storage.prototype.setItem = function (k, v) {
          if (k.startsWith("reelcase.companion-update.v1:")) throw Error("Quota fixture");
          return original.call(this, k, v);
        };
      });
      await checklist().getByRole("button", { name: "Save before-update snapshot" }).click();
      await checklist()
        .getByText(/baseline could not be saved/)
        .waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.companion-update.v1:dev-user")),
        before,
      );
      await page.evaluate(() => window.restoreSnapshotStorage());
      checks.push("Failed save preserves the previous rollback reference");
      mode = "incompatible";
      await panel().getByRole("button", { name: "Refresh Companion status", exact: true }).click();
      await checklist()
        .getByText(/updated service is unavailable or incompatible/)
        .waitFor();
      assert(
        await checklist().getByRole("button", { name: "Save before-update snapshot" }).isDisabled(),
      );
      await checklist().scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await checklist()
        .getByText(/Saved baseline: Companion v13/)
        .waitFor();
      assert(
        await checklist()
          .getByRole("button", { name: "Export redacted update report" })
          .isDisabled(),
      );
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.companion-update.v1:other-user")),
        "keep-other-workspace",
      );
      const count = calls.length;
      await page.waitForTimeout(1800);
      assert.equal(calls.length, count);
      assert(calls.every((c) => c.method === "GET"));
      checks.push(
        "Reload retains baseline; no automatic polling, install, launch, restart or session read",
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
      await page
        .screenshot({
          path: output.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
    }
    await context.close();
  }
} finally {
  await browser.close();
}
const result = {
  ok: reports.every((r) => r.ok),
  reports,
  limitation:
    "Isolated browser contexts and controlled Companion responses. No actual update, process restart, provider download or cookie extraction.",
};
writeFileSync(output, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
