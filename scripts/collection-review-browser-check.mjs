import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";

const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/collection-review-dev.json", [
  resolve("screenshots"),
]);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const reports = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      isMobile: mobile,
      hasTouch: mobile,
    });
    const report = { mobile, checks: [], errors: [] },
      page = await context.newPage();
    reports.push(report);
    page.setDefaultTimeout(12000);
    page.on("pageerror", (error) => report.errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && !/net::ERR_ABORTED/.test(message.text()))
        report.errors.push(message.text() + " " + message.location().url);
    });
    await context.addInitScript(() => {
      const profile = sessionStorage.getItem("realhub.active-local-profile.v1") ?? "default";
      const prefix = profile === "default" ? "" : "realhub.profile.v1:" + profile + ":";
      localStorage.setItem(prefix + "reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        prefix + "reelcase.pull-settings.v1",
        JSON.stringify({ automaticPulls: false }),
      );
      localStorage.setItem(
        prefix + "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      const put = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function (value, key) {
        if (key === "bulk-tag-receipt:v1" && this.name === "activity") {
          if (window.__failBulk && value.entries.length > 6)
            throw new DOMException("Fixture quota exhausted", "QuotaExceededError");
          if (window.__cancelBulk && value.entries.length === 6) {
            this.transaction.addEventListener(
              "complete",
              () => {
                [...document.querySelectorAll("button")]
                  .find((button) => button.textContent === "Cancel remaining batches")
                  ?.click();
              },
              { once: true },
            );
          }
        }
        return arguments.length === 1 ? put.call(this, value) : put.call(this, value, key);
      };
    });
    await context.route("http://127.0.0.1:43123/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("https://i.ytimg.com/vi/review*/**", route => route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="#24344b"/></svg>',
    }));
    const ready = () => page.locator('[data-home-ready="true"]').waitFor();
    const capture = (name) =>
      page.screenshot({
        path: output.replace(/\.json$/, `-${mobile ? "mobile" : "desktop"}-${name}.png`),
      });
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).press("Enter");
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .press("Enter");
    };
    const heading = page.getByRole("heading", { name: "Make yourself at Home.", exact: true });
    const arrival = page.locator("[data-profile-arrival]");
    const assertArrival = async (name) => {
      await ready();
      await page.waitForFunction(
        (name) =>
          document.querySelector("[data-profile-arrival]")?.textContent ===
          `Active profile: ${name}. Home is ready.`,
        name,
      );
      assert(await heading.evaluate((el) => document.activeElement === el));
      if (name === "Orchard guest") await capture("profile-focus");
      await page.keyboard.press("Tab");
      assert.equal(
        await page.evaluate(() => document.activeElement?.textContent),
        "Continue watching",
      );
    };
    const switchTo = async (name) => {
      await nav("Accounts");
      await page
        .getByRole("article", { name: "Account " + name, exact: true })
        .getByRole("button", { name: "Use account", exact: true })
        .press("Enter");
      const dialog = page.getByRole("dialog", { name: "Switch to " + name + "?", exact: true });
      await dialog.waitFor();
      await dialog
        .getByRole("button", { name: "Save and switch account", exact: true })
        .press("Enter");
      await assertArrival(name);
    };
    const photos = page.getByRole("region", { name: "Photo duplicate review", exact: true });
    const photoCard = (name) =>
      page.getByRole("button", { name: "Open " + name + " full screen", exact: true });
    const openPhotos = async () => {
      await nav("Photos");
      await page
        .getByRole("heading", { name: "Your photos. Your favorites.", exact: true })
        .waitFor();
      await page.getByRole("button", { name: "Review photo duplicates", exact: true }).click();
    };
    const addPhotos = () =>
      page.evaluate(async () => {
        const png = (size, flat) =>
          new Promise((yes) => {
            const c = document.createElement("canvas");
            c.width = c.height = size;
            const g = c.getContext("2d"),
              square = size / 3;
            for (let y = 0; y < 3; y++)
              for (let x = 0; x < 3; x++) {
                g.fillStyle = flat ?? (x === y ? "#e2c8a0" : (x + y) % 2 ? "#224a83" : "#081015");
                g.fillRect(x * square, y * square, square, square);
              }
            c.toBlob(yes, "image/png");
          });
        const pattern = await png(180),
          files = [
            ["A original.png", pattern],
            ["B exact.png", pattern],
            ["C resized.png", await png(90)],
            ["D similar color.png", await png(60, "#5f6470")],
            ["E similar color.png", await png(60, "#626671")],
          ];
        const transfer = new DataTransfer();
        for (const [name, blob] of files)
          transfer.items.add(
            new File([blob], name, { type: "image/png", lastModified: 1734567800000 }),
          );
        const input = document.querySelector('main input[type="file"][accept="image/*"]');
        input.files = transfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    const seed = () =>
      page.evaluate(async () => {
        const channelId = "UC" + "0".repeat(22), folderId = "yt:" + channelId;
        localStorage.setItem("reelcase.follows.v1", JSON.stringify({
          channels: [{ id: folderId, kind: "youtube", channelId, handle: "orchard", title: "Orchard" }],
          savedAt: Date.now(),
        }));
        const db = await new Promise((yes, no) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => yes(r.result);
          r.onerror = () => no(r.error);
        });
        try {
          await new Promise((yes, no) => {
            const tx = db.transaction(["videos", "remote-cache", "activity"], "readwrite"),
              now = Date.now();
            const remote = tx.objectStore("remote-cache"),
              activity = tx.objectStore("activity");
            remote.put({ folders: [], checkedAt: now }, "meta");
            for (let i = 0; i < 8; i++) {
              const local = i % 2 === 0,
                id = "bulk-fixture-" + i,
                videoId = "review" + String(i).padStart(5, "0");
              const row = {
                id,
                name: "Fixture Orchard " + i,
                folderId: local ? "folder:fixture" : folderId,
                path: "fixture/" + id,
                extension: local ? "mp4" : "yt",
                mime: local ? "video/mp4" : "video/youtube",
                size: local ? 1024 : 0,
                addedAt: now - i,
                duration: 1300,
                remote: local
                  ? undefined
                  : {
                      kind: "youtube",
                      videoId,
                      channelId,
                      channelName: "Orchard",
                      youtubeType: "upload",
                      embedUrl: "https://www.youtube.com/embed/" + videoId,
                    },
              };
              if (local) tx.objectStore("videos").put(row);
              else remote.put(row, "video:" + id);
              activity.put(
                {
                  id,
                  tags: ["existing-" + i],
                  provenance: {
                    tags: { ["existing-" + i]: "legacy" },
                    updatedAt: now - 1000,
                    ...(i === 7 ? { manualTagsAt: now - 1000, lockedFields: ["tags"] } : {}),
                  },
                },
                "metadata-enrichment:" + id,
              );
            }
            tx.oncomplete = yes;
            tx.onabort = () => no(tx.error);
          });
        } finally {
          db.close();
        }
      });
    const readBulk = () =>
      page.evaluate(async () => {
        const db = await new Promise((yes, no) => {
          const request = indexedDB.open("reelcase");
          request.onsuccess = () => yes(request.result);
          request.onerror = () => no(request.error);
        });
        try {
          return await new Promise((yes, no) => {
            const tx = db.transaction("activity"),
              store = tx.objectStore("activity");
            const undo = store.get("bulk-tag-receipt:v1");
            const edits = store.getAll(
              IDBKeyRange.bound(
                "catalog-metadata:bulk-fixture-",
                "catalog-metadata:bulk-fixture-\uffff",
              ),
            );
            tx.oncomplete = () => yes({ undo: undo.result, edits: edits.result });
            tx.onabort = () => no(tx.error);
          });
        } finally {
          db.close();
        }
      });
    const bulk = page.getByRole("region", { name: "Bulk tag editing", exact: true });
    const search = async (needTitle = true) => {
      await page.keyboard.press("Control+k");
      const field = page.getByLabel("Global media search", { exact: true });
      await field.fill("Fixture Orchard");
      await field.press("Enter");
      await page.getByRole("button", { name: "Bulk edit video tags", exact: true }).click();
      if (needTitle) await bulk.getByRole("checkbox", { name: /Fixture Orchard 7/ }).waitFor();
    };
    const prepareBulk = async (tag) => {
      await bulk.getByLabel("Tag", { exact: true }).fill(tag);
      for (let i = 0; i < 8; i++)
        await bulk.getByRole("checkbox", { name: new RegExp("Fixture Orchard " + i) }).check();
      await bulk.getByRole("button", { name: "Review selected tag changes", exact: true }).click();
      assert.equal(
        await bulk.getByRole("list", { name: "Reviewed titles" }).getByRole("listitem").count(),
        7,
      );
      await bulk.getByText(/1 skipped · already up to date/).waitFor();
    };
    try {
      await page.goto(url);
      await ready();
      await openPhotos();
      await addPhotos();
      await photoCard("A original.png").waitFor();
      const favoriteCard = photoCard("A original.png").locator("..");
      await favoriteCard.getByRole("button", { name: "♥", exact: true }).click();
      await page.getByText(/Reading photo dimensions and dates/).waitFor({ state: "hidden" });
      await photos.getByRole("button", { name: "Scan for duplicates", exact: true }).click();
      await photos.getByRole("heading", { name: /Exact match/ }).waitFor();
      assert.equal(await photos.getByRole("heading", { name: /Similar composition/ }).count(), 0);
      await photos.getByLabel("Also compare visual similarity").check();
      await photos.getByRole("button", { name: "Scan for duplicates", exact: true }).click();
      await photos.getByRole("heading", { name: /Similar composition/ }).waitFor();
      await photos.getByText("C resized.png", { exact: true }).waitFor();
      await photos.getByText("Favorite · kept visible", { exact: true }).first().waitFor();
      assert.equal(await photos.getByText(/similar color\.png/).count(), 0);
      await capture("photo-review");
      await photos.getByLabel("Hide B exact.png", { exact: true }).check();
      await photos.getByRole("button", { name: "Hide reviewed selection", exact: true }).click();
      await photoCard("B exact.png").waitFor({ state: "hidden" });
      await photoCard("A original.png").waitFor();
      await page.reload();
      await ready();
      await openPhotos();
      await addPhotos();
      await photoCard("A original.png").waitFor();
      await photoCard("B exact.png").waitFor({ state: "hidden" });
      await photos.getByRole("button", { name: "Undo last duplicate hide", exact: true }).click();
      await photoCard("B exact.png").waitFor();
      await photos.getByRole("button", { name: "Scan for duplicates", exact: true }).click();
      await photos.getByRole("button", { name: "Cancel comparison", exact: true }).click();
      await photos.getByText("Review cancelled. No photos changed.", { exact: true }).waitFor();
      report.checks.push(
        "Exact and resized matches are separate, color alone is not a match, favorites stay visible, cancellation is safe and a saved hide can be undone after reload.",
      );

      await seed();
      await page.reload();
      await ready();
      await search();
      await prepareBulk("Racing Board");
      await capture("bulk-review");
      await page.evaluate(() => {
        window.__cancelBulk = true;
      });
      await bulk.getByRole("button", { name: "Apply reviewed batches", exact: true }).click();
      await bulk.getByText(/Stopped after the last saved batch\. 6 of 7 titles updated/).waitFor();
      let stored = await readBulk();
      assert.equal(stored.undo.entries.length, 6);
      assert.equal(stored.undo.profileId, "default");
      assert(Number.isInteger(stored.undo.collectionRevision));
      assert.equal(stored.edits.length, 6);
      assert(stored.edits.some((edit) => Number(edit.id.at(-1)) % 2 === 0));
      assert(stored.edits.some((edit) => Number(edit.id.at(-1)) % 2 === 1));
      assert(
        stored.edits.every(
          (edit) =>
            edit.tags.includes("racing-board") && edit.tags.includes("existing-" + edit.id.at(-1)),
        ),
      );
      const originalTags = new Map(stored.undo.entries.map(row => [row.id, row.before.tags]));
      await page.reload();
      await ready();
      await search(false);
      await bulk.getByText("6 saved changes can be undone", { exact: true }).waitFor();
      await bulk.getByRole("button", { name: "Undo saved batches", exact: true }).click();
      await bulk.getByText(/6 of 6 titles restored/).waitFor();
      stored = await readBulk();
      assert.equal(stored.undo, undefined);
      assert(stored.edits.every(edit => !edit.tags.includes("racing-board") &&
        originalTags.get(edit.id).every(tag => edit.tags.includes(tag))));

      await prepareBulk("Second Pass");
      await page.evaluate(() => {
        window.__failBulk = true;
      });
      await bulk.getByRole("button", { name: "Apply reviewed batches", exact: true }).click();
      await bulk
        .getByRole("alert")
        .getByText(/Earlier saved batches can still be undone/)
        .waitFor();
      stored = await readBulk();
      assert.equal(stored.undo.entries.length, 6);
      assert.equal(stored.edits.filter((edit) => edit.tags.includes("second-pass")).length, 6);
      await bulk.getByRole("button", { name: "Undo saved batches", exact: true }).click();
      await bulk.getByText(/6 of 6 titles restored/).waitFor();
      await bulk.getByLabel("Change", { exact: true }).selectOption("remove");
      await bulk.getByLabel("Tag", { exact: true }).fill("existing-0");
      await bulk.getByRole("checkbox", { name: /Fixture Orchard 0/ }).check();
      await bulk.getByRole("button", { name: "Review selected tag changes", exact: true }).click();
      await bulk.getByRole("button", { name: "Apply reviewed batches", exact: true }).click();
      await bulk.getByText("1 saved change can be undone", { exact: true }).waitFor();
      assert(!(await readBulk()).edits.find(edit => edit.id === "bulk-fixture-0").tags.includes("existing-0"));
      report.checks.push(
        "Review covers exact mixed local and YouTube targets, preserves existing tags, skips locked titles, and undoes only the saved batch after cancellation, reload or quota failure.",
      );

      await nav("Accounts");
      const name = page.getByRole("textbox", { name: "New account name", exact: true });
      await name.fill("Orchard guest");
      await page.getByRole("button", { name: "Create account", exact: true }).press("Enter");
      await page.getByRole("article", { name: "Account Orchard guest", exact: true }).waitFor();
      await switchTo("Orchard guest");
      assert(!((await arrival.textContent()) ?? "").includes("Default"));
      await search(false);
      await bulk.getByText("No saved titles are available to edit in these results.", { exact: true }).waitFor();
      assert.equal(await bulk.getByRole("button", { name: "Undo saved batches", exact: true }).count(), 0);
      await page.reload();
      await ready();
      assert.equal(await arrival.textContent(), "");
      assert(!(await heading.evaluate((el) => document.activeElement === el)));
      await switchTo("Default");
      assert(!((await arrival.textContent()) ?? "").includes("Orchard guest"));
      await search(false);
      await bulk.getByText("1 saved change can be undone", { exact: true }).waitFor();
      await bulk.getByRole("button", { name: "Undo saved batches", exact: true }).click();
      await bulk.getByText(/1 of 1 title restored/).waitFor();
      assert((await readBulk()).edits.find(edit => edit.id === "bulk-fixture-0").tags.includes("existing-0"));
      await page.evaluate(() =>
        sessionStorage.setItem(
          "realhub.profile-arrival.v1",
          JSON.stringify({
            version: 1,
            destination: "default",
            target: "old-media-id",
            at: Date.now(),
          }),
        ),
      );
      await page.reload();
      await ready();
      assert.equal(await arrival.textContent(), "");
      assert(!(await heading.evaluate((el) => document.activeElement === el)));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(report.errors, []);
      report.checks.push(
        "Keyboard switching focuses the new Home heading, continues in reading order, announces only the destination, and ignores ordinary reloads and obsolete media targets.",
      );
    } catch (error) {
      report.failure = String(error);
      await capture("failure").catch(() => {});
      console.error(error);
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
await writeFile(output, JSON.stringify(reports, null, 2));
console.log(JSON.stringify(reports));
if (reports.some((report) => report.failure)) process.exitCode = 1;
