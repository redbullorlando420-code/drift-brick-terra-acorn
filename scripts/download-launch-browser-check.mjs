import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/download-launch-dev.json", [
    resolve("screenshots"),
  ]);
await mkdir(resolve("screenshots"), { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({ viewport,isMobile:viewport.name==="mobile",hasTouch:viewport.name==="mobile",acceptDownloads: true }),
      page = await context.newPage(),
      errors = [],
      checks = [],
      report = { viewport: viewport.name, errors, checks };
    reports.push(report);
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED|Failed to load resource.*400/.test(m.text()))
        errors.push(m.text());
    });
    const gamePath = "C:\\Approved Games\\Orbit & Stars.lnk",
      otherPath = "C:\\Approved Games\\Another.exe";
    await context.addInitScript(
      ({ gamePath, otherPath }) => {
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem(
          "reelcase.sidebar.groups.v1",
          JSON.stringify({ library: true, workspace: true, tools: true }),
        );
        localStorage.setItem(
          "reelcase.hub.v1",
          JSON.stringify({
            prints: [],
            games: [
              { name: "Orbit & Stars.lnk", path: gamePath, size: 0, addedAt: 1 },
              { name: "Another.exe", path: otherPath, size: 0, addedAt: 2 },
            ],
          }),
        );
      },
      { gamePath, otherPath },
    );
    for (const host of ["i.ytimg.com", "www.youtube.com", "www.youtube-nocookie.com"])
      await context.route("https://" + host + "/**", (r) =>
        r.fulfill({
          status: 200,
          contentType: host === "i.ytimg.com" ? "image/png" : "text/html",
          body:
            host === "i.ytimg.com"
              ? Buffer.from(
                  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK0cAAAAASUVORK5CYII=",
                  "base64",
                )
              : "<p>Provider fixture</p>",
        }),
      );
    const GiB = 1024 ** 3;
    let mode = "paused",
      downloadRequests = 0,
      downloadReads = 0,
      launchRequests = 0,
      historyReads = 0,
      lastDownload,
      failLaunch = false,
      receipts = [];
    const job = {
      id: "qa-disk-job",
      key: "BaW_jenozKc",
      title: "Disk budget QA",
      status: "paused",
      detail:
        "Not enough disk space for the estimate and safety margin. Free space, then resume explicitly.",
      progress: 0,
      path: "C:\\Approved Downloads",
      updatedAt: Date.now(),
      source: "youtube",
      preflight: {
        state: "low-space",
        freeBytes: GiB / 8,
        estimateBytes: null,
        unknownAllowanceBytes: 2 * GiB,
        partialBytes: GiB / 16,
        marginBytes: GiB / 2,
        requiredBytes: 2.5 * GiB,
        checkedAt: Date.now(),
      },
    };
    await context.route("http://127.0.0.1:43123/**", async (route) => {
      const req = route.request(),
        pathname = new URL(req.url()).pathname,
        headers = {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
          "cache-control": "no-store",
        };
      if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
      let body = { ok: true },
        status = 200;
      if (pathname === "/health")
        body = {
          ok: true,
          service: "reelcase-companion",
          version: 16,
          protocol: { major: 1, minor: 0 },
          capabilities: [
            "youtube-downloads",
            "download-preflight",
            "launch",
            "launch-receipts",
            "task-receipts",
          ],
        };
      else if (pathname === "/youtube/downloads" && req.method() === "GET") {
        downloadReads++;
        body = {
          ok: true,
          configured: true,
          engine: "yt-dlp",
          version: "2026.10.01",
          browserAuth: true,
          diskPreflight: true,
          downloadBudget: { marginBytes: GiB / 2, unknownBytes: 2 * GiB },
          taskRecovery: true,
          recovery: { persistent: true, maxEntries: 40, retained: 1 },
          jobs: [job],
          path: "C:\\Approved Downloads",
        };
      } else if (pathname.startsWith("/youtube/downloads") && req.method() === "POST") {
        downloadRequests++;
        lastDownload = req.postDataJSON();
        if (pathname.endsWith("/cancel"))
          Object.assign(job, { status: "cancelled", detail: "Cancelled; partial files retained." });
        else
          Object.assign(job, {
            status: "running",
            detail: pathname.endsWith("/resume")
              ? "Verified partial download resumed."
              : "Fresh copy uses a separate folder.",
            preflight: { ...job.preflight, state: "ready", freeBytes: 8 * GiB },
            ...(pathname === "/youtube/downloads"
              ? { id: "qa-fresh-job", path: "C:\\Approved Downloads\\qa-fresh-job" }
              : {}),
          });
        body = { ok: true, job };
      } else if (pathname === "/launch") {
        launchRequests++;
        const input = req.postDataJSON();
        await new Promise((r) => setTimeout(r, 150));
        let row = receipts.find((r) => r.path === input.path && r.status === "accepted");
        const reused = Boolean(row);
        if (!row) {
          row = {
            id: "receipt-" + launchRequests,
            path: input.path,
            name: input.path.endsWith(".lnk") ? "Orbit & Stars.lnk" : "Another.exe",
            at: Date.now(),
            updatedAt: Date.now(),
            status: failLaunch ? "failed" : "accepted",
            detail: failLaunch
              ? "The shortcut is missing, unsupported or no longer approved. Refresh approved shortcuts."
              : "Launch request accepted. Game readiness is unverified.",
            readiness: "unverified",
            launcherExit: null,
            persistent: true,
            retryable: failLaunch,
          };
          receipts.unshift(row);
        }
        body = {
          ok: !failLaunch,
          receipt: { ...row, reused },
          error: failLaunch ? row.detail : undefined,
        };
        status = failLaunch ? 400 : 200;
      } else if (pathname === "/launch-receipts") {
        historyReads++;
        body = { ok: true, receipts, persistent: true, windowMs: 8000 };
      }
      return route.fulfill({
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
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
      const explore = page.getByRole("button", {
        name: "Explore recommendations and full catalog",
        exact: true,
      });
      if (await explore.isVisible()) await explore.click();
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(async () => {
        const db = await new Promise((yes, no) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
        localStorage.setItem(
          "reelcase.follows.v1",
          JSON.stringify({
            channels: [
              { id: "yt:disk-qa", kind: "youtube", handle: "disk-qa", title: "Disk QA creator" },
            ],
            savedAt: Date.now(),
          }),
        );
        await new Promise((yes, no) => {
          const tx = db.transaction("remote-cache", "readwrite"),
            store = tx.objectStore("remote-cache");
          store.put({ folders: [], checkedAt: Date.now() }, "meta");
          store.put(
            {
              id: "yt:v:BaW_jenozKc",
              folderId: "yt:disk-qa",
              name: "Disk budget QA",
              path: "youtube/BaW_jenozKc",
              extension: "youtube",
              mime: "video/youtube",
              size: 0,
              duration: 10,
              addedAt: Date.now(),
              remote: {
                kind: "youtube",
                videoId: "BaW_jenozKc",
                channelName: "Disk QA creator",
                watchUrl: "https://www.youtube.com/watch?v=BaW_jenozKc",
                youtubeType: "upload",
                publishedSource: "rss",
              },
            },
            "video:yt:v:BaW_jenozKc",
          );
          tx.oncomplete = yes;
          tx.onerror = () => no(tx.error);
        });
        db.close();
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("YouTube");
      const open = () =>
        page
          .getByRole("button", { name: "Download YouTube video: Disk budget QA", exact: true })
          .first();
      await open().click();
      const dialog = page.getByRole("dialog", { name: "YouTube download", exact: true }),
        disk = dialog.getByRole("region", { name: "Download disk budget" });
      await disk.getByText(/Video size is unknown/).waitFor();
      await dialog.getByText("Paused · check destination", { exact: true }).waitFor();
      assert.equal(downloadRequests, 0);
      assert.match(await disk.innerText(), /0.5 GiB/);
      assert.match(await disk.innerText(), /2 GiB/);
      report.diskScreenshot = output.replace(".json", "-disk-" + viewport.name + ".png");
      await page.screenshot({ path: report.diskScreenshot });
      await dialog.getByRole("button", { name: "Resume download", exact: true }).click();
      await dialog.getByText("Verified partial download resumed.", { exact: true }).waitFor();
      assert.equal(downloadRequests, 1);
      assert.equal(lastDownload.useBrowserSession, undefined);
      await dialog.getByRole("button", { name: "Cancel download", exact: true }).click();
      await dialog.getByText("Cancelled", { exact: true }).waitFor();
      await dialog.getByRole("button", { name: "Start fresh copy", exact: true }).click();
      await dialog.getByText("Fresh copy uses a separate folder.", { exact: true }).waitFor();
      assert.equal(lastDownload.forceNew, true);
      assert.equal(job.id, "qa-fresh-job");
      await dialog.getByRole("button", { name: "Close YouTube download", exact: true }).click();
      const closedReads = downloadReads;
      await page.waitForTimeout(2200);
      assert.equal(downloadReads, closedReads);
      checks.push(
        "Unknown-size allowance and margin are clear; paused resume is explicit and fresh copies are separate; closed dialogs do not poll.",
      );
      await nav("Games");
      const panel = page.getByRole("region", { name: "Game launch receipts" }),
        launch = page.getByRole("button", { name: "Launch Orbit & Stars.lnk", exact: true });
      await panel.waitFor();
      assert.equal(historyReads, 0);
      assert.equal(launchRequests, 0);
      await launch.evaluate((button) => {
        button.click();
        button.click();
      });
      await panel.getByText("Request accepted", { exact: true }).waitFor();
      assert.equal(launchRequests, 1);
      assert.match(await panel.innerText(), /Game readiness is unverified/);
      await launch.click();
      await page.getByRole("status").filter({ hasText: "Reused recent launch request." }).waitFor();
      assert.equal(await panel.getByText("Request accepted", { exact: true }).count(), 1);
      await page.getByRole("button", { name: "Launch Another.exe", exact: true }).click();
      await page.waitForFunction(
        () =>
          [...document.querySelectorAll('section[aria-label="Game launch receipts"] li')].length ===
          2,
      );
      report.gamesScreenshot = output.replace(".json", "-games-" + viewport.name + ".png");
      await panel.scrollIntoViewIfNeeded();
      await page.screenshot({ path: report.gamesScreenshot });
      const before = launchRequests;
      await panel.getByRole("button", { name: "Review launch receipts", exact: true }).click();
      await page.getByRole("status").filter({ hasText: "Launch receipts refreshed." }).waitFor();
      assert.equal(historyReads, 1);
      assert.equal(launchRequests, before);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Games");
      await panel.getByRole("button", { name: "Review launch receipts", exact: true }).click();
      await panel.getByText("Request accepted", { exact: true }).first().waitFor();
      assert.equal(launchRequests, before);
      assert.equal(historyReads, 2);
      receipts = [];
      failLaunch = true;
      await launch.click();
      await panel.getByText("Launch failed", { exact: true }).waitFor();
      assert.match(await panel.innerText(), /no longer approved/);
      checks.push(
        "Double clicks send one request, accepted launches stay unverified, another game is independent, history survives reload without launching, and denied shortcuts show recovery guidance.",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.ok = true;
    } catch (e) {
      report.ok = false;
      report.error = e.stack;
      await page
        .screenshot({ path: output.replace(".json", "-failure-" + viewport.name + ".png") })
        .catch(() => {});
    }
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(output, JSON.stringify({ ok: reports.every((r) => r.ok), reports }, null, 2));
}
console.log(JSON.stringify({ output, reports }, null, 2));
if (reports.some((r) => !r.ok)) process.exitCode = 1;
