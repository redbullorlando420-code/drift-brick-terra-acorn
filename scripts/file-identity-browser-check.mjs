import assert from "node:assert/strict";
import { identityStorageFixture } from "./identity-storage-fixture.mjs";
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
const entry = "\0identity-probe",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "isolated-identity-probe",
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
    });
    await context.route("**/__identity-probe.mjs", (r) =>
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
    await context.route("**/_serverFn/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ result: { comments: [], note: "Fixture" } }),
      }),
    );
    page.on("pageerror", (e) => errors.push(e.message));
    const probe = () =>
      page.evaluate(async () => {
        window.__probe = await import("/__identity-probe.mjs");
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
      console.log("start", mobile);
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await page.evaluate(async () => {
        const p = window.__probe,
          root = await navigator.storage.getDirectory(),
          dir = await root.getDirectoryHandle("identity-fixture", { create: true }),
          bytes = new Uint8Array(await (await fetch("/samples/tungsten-reel.mp4")).arrayBuffer());
        for (const name of ["original.mp4", "destination.mp4", "different.mp4"]) {
          const handle = await dir.getFileHandle(name, { create: true }),
            writer = await handle.createWritable();
          const data = bytes.slice();
          if (name === "different.mp4") data[data.length - 1] ^= 1;
          await writer.write(data);
          await writer.close();
        }
        console.log("opfs created");
        await p.saveDirHandle({ id: "identity-folder", name: "Identity fixture", handle: dir });
        const rows = ["original.mp4", "destination.mp4", "different.mp4"].map((name) => ({
          id: "identity-folder:" + name,
          folderId: "identity-folder",
          name,
          path: name,
          size: bytes.length,
          mime: "video/mp4",
          extension: "mp4",
          addedAt: Date.now(),
        }));
        await p.appendCatalogVideos(rows);
        await p.saveActivitySnapshot({
          history: [
            {
              id: "identity-folder:original.mp4",
              at: Date.now() - 1000,
              eventId: "identity-history",
            },
          ],
          progress: { "identity-folder:original.mp4": { t: 3, d: 30, at: Date.now() - 1000 } },
          resumeProgress: {
            "id:identity-folder:original.mp4": { t: 3, d: 30, at: Date.now() - 1000 },
          },
          viewCounts: { "identity-folder:original.mp4": 2, unrelated: 3 },
          savedAt: Date.now(),
        });
        console.log("seed done");
        const prefs = JSON.parse(localStorage.getItem("reelcase.prefs.v4") ?? "{}");
        prefs.favorites = ["identity-folder:original.mp4"];
        prefs.tags = { "identity-folder:original.mp4": ["owner-kept"] };
        delete prefs.resumeProgress;
        localStorage.setItem("reelcase.prefs.v4", JSON.stringify(prefs));
        localStorage.setItem(
          "reelcase.media-feedback.v1",
          JSON.stringify({
            ratings: { "identity-folder:original.mp4": 5, unrelated: 4 },
            watchTime: {},
            creatorFavorites: {},
            tagLikes: {},
            recommendationRejections: { version: 1, updatedAt: 0, entries: [] },
          }),
        );
      });
      console.log("reload");
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      await search("original.mp4");
      await page
        .locator('[data-video-card-open][data-video-card-id="identity-folder:original.mp4"]')
        .first()
        .click();
      await page.getByText("Verify or repair this file’s identity", { exact: true }).click();
      let review = page.getByRole("region", { name: "File identity review for original.mp4" });
      await review
        .getByRole("button", { name: "Record original fingerprint", exact: true })
        .click();
      await review
        .getByText("Original fingerprint recorded. No files or saved marks changed.", {
          exact: true,
        })
        .waitFor();
      const find = async (name) => {
        await review.getByLabel("Find a moved file in the library").fill(name);
        await review.getByRole("button", { name: "Find destinations", exact: true }).click();
        await review
          .getByRole("button", { name: "Choose destination " + name, exact: true })
          .click();
        await review
          .getByRole("button", { name: "Verify destination contents", exact: true })
          .click();
      };
      await find("different.mp4");
      await review
        .getByRole("alert")
        .filter({ hasText: "different complete fingerprints" })
        .waitFor();
      assert.equal(
        await review.getByRole("button", { name: "Apply verified file move", exact: true }).count(),
        0,
      );
      checks.push(
        "Same-size files with different complete hashes are rejected by the real worker and UI",
      );
      await find("destination.mp4");
      await review
        .getByText("Complete fingerprints match. Review the mapping before applying.", {
          exact: true,
        })
        .waitFor();
      assert.equal(
        await review
          .getByRole("button", { name: "Apply verified file move", exact: true })
          .isEnabled(),
        false,
      );
      await review.getByLabel("I reviewed this verified file move").check();
      await review.getByRole("button", { name: "Apply verified file move", exact: true }).click();
      await review.waitFor({ state: "hidden" });
      const moved = await page.evaluate(async () => {
        await window.__probe.hydrateFileIdentities();
        const l = window.__probe.fileIdentitySnapshot(),
          videos = await window.__probe.loadCatalogVideos();
        return { ledger: l, videos };
      });
      assert.equal(
        moved.ledger.fingerprints["identity-folder:original.mp4"].proof.digest,
        createHash("sha256")
          .update(readFileSync(resolve("public/samples/tungsten-reel.mp4")))
          .digest("hex"),
      );
      assert.equal(moved.ledger.moves[0].active, true);
      assert.equal(
        moved.videos.find((v) => v.id === "identity-folder:original.mp4").path,
        "destination.mp4",
      );
      assert(!moved.videos.some((v) => v.id === "identity-folder:destination.mp4"));
      checks.push(
        "Full-content verification and explicit review move the location while retaining the original ID in one durable transaction",
      );
      const scan = await page.evaluate(async () => {
        const p = window.__probe,
          root = await navigator.storage.getDirectory(),
          dir = await root.getDirectoryHandle("identity-fixture"),
          files = [];
        for (const name of ["original.mp4", "destination.mp4", "different.mp4"])
          files.push(await (await dir.getFileHandle(name)).getFile());
        return await p.ingestFileList(files, "identity-folder", "Identity fixture");
      });
      assert(
        scan.some((v) => v.id === "identity-folder:original.mp4" && v.path === "destination.mp4"),
      );
      assert(!scan.some((v) => v.id === "identity-folder:destination.mp4"));
      assert.equal(scan.filter((v) => v.id === "identity-folder:original.mp4").length, 1);
      checks.push(
        "Source rescans verify the approved alias, skip the old duplicate and retain exactly one canonical row",
      );
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await probe();
      const restoredActivity = await page.evaluate(() => window.__probe.loadActivitySnapshot());
      assert(restoredActivity.history.some((row) => row.id === "identity-folder:original.mp4"));
      assert(restoredActivity.progress["identity-folder:original.mp4"].t>=3);
      assert(restoredActivity.resumeProgress["id:identity-folder:original.mp4"].t>=3);
      await search("original.mp4");
      await page
        .locator('[data-video-card-open][data-video-card-id="identity-folder:original.mp4"]')
        .first()
        .click();
      await page.getByRole("button", { name: "Watch now", exact: true }).click();
      await page.locator("[data-media-viewer] video").waitFor();
      await page.waitForFunction(() => {
        const v = document.querySelector("[data-media-viewer] video");
        return v && v.readyState >= 1;
      });
      const saved = await page.evaluate(() => ({
        feedback: JSON.parse(localStorage.getItem("reelcase.media-feedback.v1")),
        prefs: JSON.parse(localStorage.getItem("reelcase.prefs.v4")),
      }));
      assert.equal(saved.feedback.ratings["identity-folder:original.mp4"], 5);
      assert.equal(saved.feedback.ratings.unrelated, 4);
      assert(saved.prefs.tags["identity-folder:original.mp4"].includes("owner-kept"));
      assert(saved.prefs.favorites.includes("identity-folder:original.mp4"));
      checks.push(
        "Reload preserves original ratings, manual tags and favorites; the moved file plays from its granted directory",
      );
      await page.getByRole("button", { name: "Close", exact: true }).click();
      await nav("Settings");
      const panel = page.getByRole("region", { name: "File identity history" });
      await panel
        .getByRole("button", { name: "Undo file move for original.mp4", exact: true })
        .click();
      await panel.getByRole("status").filter({ hasText: "Previous location restored" }).waitFor();
      const undone = await page.evaluate(async () => {
        await window.__probe.hydrateFileIdentities();
        return {
          ledger: window.__probe.fileIdentitySnapshot(),
          videos: await window.__probe.loadCatalogVideos(),
        };
      });
      assert.equal(undone.ledger.moves[0].active, false);
      assert.equal(
        undone.videos.find((v) => v.id === "identity-folder:original.mp4").path,
        "original.mp4",
      );
      assert(undone.videos.some((v) => v.id === "identity-folder:destination.mp4"));
      checks.push(
        "Explicit Undo restores both previous metadata mappings without erasing subsequent saved marks",
      );
      const fork = await page.evaluate(async () => {
        const p = window.__probe,
          root = await navigator.storage.getDirectory(),
          dir = await root.getDirectoryHandle("identity-fixture"),
          handle = await dir.getFileHandle("original.mp4"),
          data = new Uint8Array(await (await handle.getFile()).arrayBuffer());
        data[data.length - 1] ^= 1;
        const writer = await handle.createWritable();
        await writer.write(data);
        await writer.close();
        const rows = await p.ingestFileList(
          [await handle.getFile()],
          "identity-folder",
          "Identity fixture",
        );
        return rows;
      });
      assert.equal(fork.length, 1);
      assert(fork[0].id.startsWith("identity-folder:original.mp4:content:"));
      assert.notEqual(fork[0].id, "identity-folder:original.mp4");
      checks.push(
        "After Undo, different bytes reused at the original path receive a new ID without inherited saved marks",
      );
      checks.push(
        ...(await page.evaluate("(" + identityStorageFixture.toString() + ")(window.__probe)")),
      );
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
