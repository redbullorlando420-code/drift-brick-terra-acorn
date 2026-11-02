import assert from "node:assert/strict";
import { mediaRecoveryStorageFixture } from "./media-recovery-storage-fixture.mjs";
import { fromJSON } from "seroval";
import { zipSync, strToU8, unzipSync, strFromU8 } from "fflate";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/deletions-identity-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0media-health-probe",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "isolated-media-health-probe",
        resolveId(id) {
          if (id === entry) return entry;
        },
        load(id) {
          if (id === entry)
            return [
              "src/lib/videos/persist.ts",
              "src/lib/videos/deletion-tombstones.ts",
              "src/lib/videos/catalog-mutations.ts",
              "src/lib/videos/local-identity.ts",
              "src/lib/videos/identity-repository.ts",
              "src/lib/videos/media-health.ts",
              "src/lib/videos/media-health-repository.ts",
              "src/lib/writer-lease.ts",
              "src/lib/videos/scan.ts",
            ]
              .map(
                (file) =>
                  "export * from " + JSON.stringify(resolve(file).replaceAll("\\", "/")) + ";",
              )
              .join("\n");
        },
      },
    ],
  });
const built = await bundle.generate({ format: "esm" });
await bundle.close();
const find = (value, test) => {
  if (!value || typeof value !== "object") return;
  if (test(value)) return value;
  for (const child of Object.values(value)) {
    const found = find(child, test);
    if (found) return found;
  }
};
const code = built.output.find((row) => row.type === "chunk").code;
const workerBundle = await rolldown({
    input: resolve("src/lib/videos/file-fingerprint.worker.ts"),
  }),
  workerOutput = await workerBundle.generate({ format: "esm" });
await workerBundle.close();
const workerCode = workerOutput.output.find((row) => row.type === "chunk").code;
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
      report = { mobile, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(20000);
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.pull-settings.v1", JSON.stringify({ automaticPulls: false }));
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      localStorage.setItem("reelcase.artwork-mode", "text");
      FileSystemDirectoryHandle.prototype.queryPermission = async function () {
        return window.__denyFixturePermission ? "denied" : "granted";
      };
      FileSystemDirectoryHandle.prototype.requestPermission = async function () {
        window.__denyFixturePermission = false;
        return "granted";
      };
    });
    await context.route("**/__media-health-probe.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/file-fingerprint.worker.ts", (r) =>
      r.fulfill({ contentType: "text/javascript", body: workerCode }),
    );
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("https://www.youtube.com/embed/**", (r) =>
      r.fulfill({ contentType: "text/html", body: "<!doctype html><p>Fixture player</p>" }),
    );
    let upstream = "null",
      releaseHeld;
    await context.route("https://player.twitch.tv/**", (r) =>
      r.fulfill({ contentType: "text/html", body: "<p>Controlled Twitch player</p>" }),
    );
    await context.route("https://clips.twitch.tv/**", (r) =>
      r.fulfill({ contentType: "text/html", body: "<p>Controlled Twitch clip</p>" }),
    );
    await context.route("**/_serverFn/**", async (r) => {
      let input;
      try {
        input = fromJSON(JSON.parse(r.request().postData() ?? "{}"));
      } catch {}
      const data = find(input, (v) => typeof v.url === "string" && v.url.includes("twitch.tv"));
      let result = { comments: [], note: "Fixture" };
      if (data) {
        const clip = data.url.includes("clips.twitch.tv"),
          identity = { kind: clip ? "clip" : "vod", value: clip ? "MissingClip" : "1234" };
        if (upstream === "hold") await new Promise((resolve) => (releaseHeld = resolve));
        result = {
          version: 1,
          identity,
          checkedAt: Date.now(),
          state:
            upstream === "unknown"
              ? "unknown"
              : upstream === "available"
                ? "available"
                : "publicly-unavailable",
          code:
            upstream === "unknown"
              ? "transport-or-schema"
              : upstream === "available"
                ? "public-record"
                : "public-null",
        };
      }
      await r
        .fulfill({ contentType: "application/json", body: JSON.stringify({ result, context: {} }) })
        .catch(() => {});
    });
    page.on("pageerror", (e) => errors.push(e.message));
    const probe = () =>
      page.evaluate(async () => {
        window.__probe = await import("/__media-health-probe.mjs");
      });
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    };
    const search = async (name) => {
      await page.locator("[data-library-focus]").focus();
      await page.keyboard.press("Control+k");
      await page.getByLabel("Global media search", { exact: true }).fill(name);
      await page.getByLabel("Global media search", { exact: true }).press("Enter");
    };
    const remove = async (id, name) => {
      await search(name);
      await page
        .locator('[data-video-card-open][data-video-card-id="' + id + '"]')
        .first()
        .click();
      await page.getByRole("button", { name: "Watch now", exact: true }).click();
      await page.getByRole("button", { name: "Remove", exact: true }).click();
      await page.getByRole("button", { name: "Confirm remove", exact: true }).click();
      await page.locator("[data-media-viewer]").waitFor({ state: "hidden" });
    };

    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await page.evaluate(async () => {
        const p = window.__probe,
          root = await navigator.storage.getDirectory(),
          dir = await root.getDirectoryHandle("media-health-fixture", { create: true }),
          bytes = new Uint8Array(await (await fetch("/samples/tungsten-reel.mp4")).arrayBuffer());
        const handle = await dir.getFileHandle("recovered.mp4", { create: true }),
          writer = await handle.createWritable();
        await writer.write(bytes);
        await writer.close();
        const changed = await dir.getFileHandle("changed.mp4", { create: true }),
          changedWriter = await changed.createWritable();
        await changedWriter.write(new Uint8Array([1, 2, 3, 4]));
        await changedWriter.close();
        await p.saveDirHandle({ id: "repair-folder", name: "Repair folder", handle: dir });
        const rows = ["recovered.mp4", "missing.mp4", "changed.mp4"].map((name) => ({
          id: "repair-folder:" + name,
          folderId: "repair-folder",
          name,
          path: name,
          size: bytes.length,
          mime: "video/mp4",
          extension: "mp4",
          addedAt: Date.now(),
        }));
        await p.appendCatalogVideos(rows);
        const remote = {
          id: "tw:c:MissingClip",
          folderId: "tw:fixture",
          name: "Missing clip bookmark",
          path: "",
          size: 0,
          mime: "video/twitch",
          extension: "clip",
          addedAt: Date.now(),
          remote: {
            kind: "twitch",
            videoId: "MissingClip",
            watchUrl: "https://clips.twitch.tv/MissingClip",
            embedUrl: "https://clips.twitch.tv/embed?clip=MissingClip",
          },
        };
        await p.saveRemoteSnapshot({ videos: [remote], folders: [], checkedAt: Date.now() });
        await p.saveMediaObservation({
          video: rows[0],
          private: false,
          basis: p.mediaBasis(rows[0]),
          status: "permission-needed",
          at: Date.now(),
          code: "permission",
        });
        await p.saveMediaObservation({
          video: rows[1],
          private: false,
          basis: p.mediaBasis(rows[1]),
          status: "source-disconnected",
          at: Date.now(),
          code: "source-unreadable",
        });
        await p.saveMediaObservation({
          video: rows[2],
          private: false,
          basis: p.mediaBasis(rows[2]),
          status: "source-disconnected",
          at: Date.now(),
          code: "source-unreadable",
        });
        await p.saveActivitySnapshot({
          history: [{ id: rows[0].id, at: Date.now() - 1000, eventId: "repair-history" }],
          progress: { [rows[0].id]: { t: 3, d: 30, at: Date.now() - 1000 } },
          resumeProgress: { ["id:" + rows[0].id]: { t: 3, d: 30, at: Date.now() - 1000 } },
          viewCounts: { [rows[0].id]: 2 },
          savedAt: Date.now(),
        });
        localStorage.setItem(
          "reelcase.follows.v1",
          JSON.stringify({
            channels: [{ id: "tw:fixture", kind: "twitch", handle: "fixture", title: "Fixture" }],
            savedAt: Date.now(),
          }),
        );
        localStorage.setItem(
          "reelcase.media-feedback.v1",
          JSON.stringify({
            ratings: { [remote.id]: 5, unrelated: 4 },
            notes: { [remote.id]: "Keep this note" },
            watchTime: {},
            creatorFavorites: {},
            tagLikes: {},
            recommendationRejections: { version: 1, updatedAt: 0, entries: [] },
          }),
        );
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await search("Missing clip bookmark");
      await page
        .locator('[data-video-card-open][data-video-card-id="tw:c:MissingClip"]')
        .first()
        .click();
      let selected = page.getByRole("region", { name: "Selected media availability" });
      await selected
        .getByRole("button", { name: "Check selected title availability", exact: true })
        .click();
      await selected.getByText(/Not publicly available at last check/).waitFor();
      upstream = "unknown";
      await selected
        .getByRole("button", { name: "Check selected title availability", exact: true })
        .click();
      await selected.getByText(/Temporary error or unreadable response/).waitFor();
      assert((await selected.innerText()).includes("Previous verified observation kept."));
      checks.push(
        "Selected Twitch check records public unavailability; a transient retry preserves its prior verified observation",
      );
      upstream = "hold";
      await selected
        .getByRole("button", { name: "Check selected title availability", exact: true })
        .click();
      await page.waitForTimeout(150);
      await page.getByRole("button", { name: "Close preview", exact: true }).click();
      if (releaseHeld) releaseHeld();
      await page.waitForTimeout(200);
      await probe();
      const kept = await page.evaluate(async () => {
        await window.__probe.hydrateMediaHealth();
        return window.__probe.mediaHealthSnapshot().entries["tw:c:MissingClip"];
      });
      assert.equal(kept.status, "unknown");
      checks.push("Closing a preview cancels a held check without replacing saved evidence");
      upstream = "null";
      await nav("Settings");
      let panel = page.getByRole("region", { name: "Media recovery" });
      await panel.getByRole("button", { name: "Review affected media", exact: true }).click();
      await panel.getByRole("region", { name: "Recovery source Repair folder" }).waitFor();
      let twitch = panel.getByRole("region", { name: "Recovery source Twitch videos & clips" });
      await twitch.getByRole("button", { name: "Hide from browsing", exact: true }).click();
      await twitch.getByText("Hidden by your recovery choice.", { exact: false }).waitFor();
      await twitch.getByRole("button", { name: "Keep bookmark", exact: true }).click();
      await twitch.getByText("Kept as a bookmark.", { exact: false }).waitFor();
      let local = panel.getByRole("region", { name: "Recovery source Repair folder" });
      await page.evaluate(() => {
        window.__denyFixturePermission = true;
      });
      await local.getByRole("button", { name: "Check next 3 entries", exact: true }).click();
      await local
        .getByText(/Folder permission needed/)
        .first()
        .waitFor();
      await local.getByRole("button", { name: "Reconnect permission", exact: true }).click();
      await panel.getByRole("status").filter({ hasText: "Folder access granted" }).waitFor();
      await local.getByRole("button", { name: "Check next 3 entries", exact: true }).click();
      await local.getByText(/File absent from the granted source/).waitFor();
      checks.push(
        "Granted-source checks distinguish a readable file from an absent file and retain both bookmarks",
      );
      await local.getByRole("button", { name: "Rescan this folder", exact: true }).click();
      await panel.getByRole("status").filter({ hasText: "Selected folder rescanned" }).waitFor();
      const after = await page.evaluate(async () => {
        const p = window.__probe;
        return {
          videos: await p.loadCatalogVideos(),
          activity: await p.loadActivitySnapshot(),
          health: (await p.hydrateMediaHealth()).entries,
          feedback: JSON.parse(localStorage.getItem("reelcase.media-feedback.v1")),
        };
      });
      assert(after.videos.some((v) => v.id === "repair-folder:missing.mp4"));
      assert(after.videos.some((v) => v.id === "repair-folder:recovered.mp4"));
      assert(after.activity.history.some((v) => v.id === "repair-folder:recovered.mp4"));
      assert.equal(after.activity.progress["repair-folder:recovered.mp4"].t, 3);
      assert.equal(after.health["repair-folder:recovered.mp4"].status, "available");
      assert.equal(after.health["repair-folder:changed.mp4"].status, "content-mismatch");
      assert(after.videos.find((v) => v.id === "repair-folder:changed.mp4").size > 4);
      assert.equal(after.feedback.ratings["tw:c:MissingClip"], 5);
      assert.equal(after.feedback.notes["tw:c:MissingClip"], "Keep this note");
      checks.push(
        "Rescanning only the selected folder preserves missing bookmarks, history, resume, ratings and notes",
      );
      await search('changed.mp4');await page.locator('[data-video-card-open][data-video-card-id="repair-folder:changed.mp4"]').first().click();await page.getByText('This location contains different contents. Review its verified identity or check the corrected file before playback.',{exact:true}).waitFor();await page.getByRole('button',{name:'Close preview',exact:true}).click();await nav('Settings');panel=page.getByRole('region',{name:'Media recovery'});await panel.getByRole('button',{name:'Review affected media',exact:true}).click();checks.push('Known mismatched source contents cannot autoplay in a preview or replace the original bookmark');
      await panel.getByRole("button", { name: "Include checked bookmarks", exact: true }).click();
      twitch = panel.getByRole("region", { name: "Recovery source Twitch videos & clips" });
      await twitch.getByRole("button", { name: "Remove saved title", exact: true }).click();
      await panel.getByRole("button", { name: "Cancel removal", exact: true }).click();
      assert.equal(await panel.getByRole("group", { name: "Confirm recovery removal" }).count(), 0);
      assert.equal(
        (await page.evaluate(() => window.__probe.catalogDeletionSnapshot())).entries.length,
        0,
      );
      checks.push(
        "Removal consequence preview cancels without changing the catalog or removal records",
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await nav("Settings");
      panel = page.getByRole("region", { name: "Media recovery" });
      await panel.getByRole("button", { name: "Review affected media", exact: true }).click();
      await panel.getByRole("button", { name: "Include checked bookmarks", exact: true }).click();
      await panel.getByText("Kept as a bookmark.", { exact: false }).waitFor();
      await page.getByText("Legacy ZIP and Companion-folder export", { exact: true }).click();
      const downloadWait = page.waitForEvent("download");
      await page.getByRole("button", { name: "Download legacy ZIP", exact: true }).click();
      const download = await downloadWait,
        archive = unzipSync(readFileSync(await download.path())),
        pack = strFromU8(archive["reelcase-library-pack/marks/media-health.json"]);
      assert(pack.includes("MissingClip"));
      assert.equal(JSON.parse(pack).entries["tw:c:MissingClip"].choice, "bookmark");
      checks.push(
        "Recovery evidence and bookmark choice survive reload and are present in validated backup data",
      );
      const transfer = page.getByRole("region", { name: "Library pack transfer" });
      await transfer.getByLabel("Backup file to inspect").setInputFiles({
        name: "recovery-backup.zip",
        mimeType: "application/zip",
        buffer: readFileSync(await download.path()),
      });
      await transfer.getByLabel("Backup preflight report").waitFor();
      await transfer.getByLabel("I reviewed the source, current destination, differing records and import policy").check();
      await transfer.getByRole("button", { name: "Apply reviewed import", exact: true }).click();
      await transfer.getByRole("status").filter({ hasText: "Import applied" }).waitFor();
      checks.push(
        "The actual exported ZIP passes preflight and reviewed import waits for durable recovery choices",
      );
      checks.push(
        ...(await page.evaluate(
          "(" + mediaRecoveryStorageFixture.toString() + ")(window.__probe)",
        )),
      );
      await search("recovered.mp4");
      await page
        .locator('[data-video-card-open][data-video-card-id="repair-folder:recovered.mp4"]')
        .first()
        .click();
      await page.getByRole("button", { name: "Watch now", exact: true }).click();
      await page.waitForFunction(() => {
        const v = document.querySelector("[data-media-viewer] video");
        return v && v.readyState >= 1 && v.currentTime >= 3;
      });
      await page.getByRole("button", { name: "Close", exact: true }).click();
      await nav("Settings");
      checks.push("The reconnected local file plays after reload at its retained resume position");
      await panel.getByRole("button", { name: "Review affected media", exact: true }).click();
      await panel.getByRole("button", { name: "Include checked bookmarks", exact: true }).click();
      const finalTwitch = panel.getByRole("region", {
        name: "Recovery source Twitch videos & clips",
      });
      await finalTwitch.getByRole("button", { name: "Forget check record", exact: true }).click();
      await panel.getByRole("button", { name: "Keep check record", exact: true }).click();
      assert.equal(
        await panel.getByRole("group", { name: "Confirm forget recovery record" }).count(),
        0,
      );
      await finalTwitch.screenshot({
        path: output.replace(/\.json$/, "-" + (mobile ? "mobile" : "desktop") + "-twitch.png"),
      });
      await panel
        .getByRole("region", { name: "Recovery source Repair folder" })
        .screenshot({
          path: output.replace(/\.json$/, "-" + (mobile ? "mobile" : "desktop") + "-local.png"),
        });
      await panel.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(/\.json$/, "-" + (mobile ? "mobile" : "desktop") + ".png"),
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.ok = true;
    } catch (e) {
      report.ok = false;
      report.error = e.stack;
      report.body = (await page.locator("body").innerText()).slice(-3000);
      await page
        .screenshot({
          path: output.replace(/\.json$/, "-" + (mobile ? "mobile" : "desktop") + "-failure.png"),
        })
        .catch(() => {});
    }
    await context.close();
    writeFileSync(output, JSON.stringify({ ok: reports.every((row) => row.ok), reports }, null, 2));
    console.log(JSON.stringify({ mobile, ok: report.ok, error: report.error?.slice(0, 180) }));
  }
} finally {
  await browser.close();
}
if (reports.some((row) => !row.ok)) process.exitCode = 1;
