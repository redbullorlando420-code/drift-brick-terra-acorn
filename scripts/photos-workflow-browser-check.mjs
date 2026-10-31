import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/photos-workflow-dev.json", [
  resolve("screenshots"),
]);
const file = checkedOutputPath("screenshots/page-audit-photo.png", [resolve("screenshots")]);
writeFileSync(
  file,
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jD5sAAAAASUVORK5CYII=",
    "base64",
  ),
);
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
      report = { mobile, checks: [], ok: false };
    reports.push(report);
    page.setDefaultTimeout(10000);
    page.on("pageerror", (e) => errors.push(e.message));
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
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
    const nav = async () => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: "Photos", exact: true })
        .click();
      await page
        .getByRole("heading", { name: "Your photos. Your favorites.", exact: true })
        .waitFor();
    };
    const upload = () =>
      page.locator('main input[type="file"][accept="image/*"]').setInputFiles(file);
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await upload();
      const people = page.getByPlaceholder("People: Alex, Sam", { exact: true });
      await people.pressSequentially("Alex, Sam");
      assert.equal(
        await people.inputValue(),
        "Alex, Sam",
        "Typing a comma must not remove the separator",
      );
      await people.press("Tab");
      const tags = page.getByPlaceholder("Tags: travel, pets, event", { exact: true });
      await tags.pressSequentially("woods, travel");
      assert.equal(await tags.inputValue(), "woods, travel");
      await tags.press("Tab");
      const photo = page.getByRole("button", {
        name: "Open page-audit-photo.png full screen",
        exact: true,
      });
      await photo.click();
      const viewer = page.getByRole("dialog", {
          name: "Viewing page-audit-photo.png",
          exact: true,
        }),
        edit = viewer.getByRole("textbox", { name: "Edit photo tags", exact: true });
      await edit.fill("");
      await edit.pressSequentially("Forest, travel, forest");
      assert.equal(await edit.inputValue(), "Forest, travel, forest");
      await edit.press("Tab");
      assert.equal(await edit.inputValue(), "forest, travel");
      await viewer.getByRole("button", { name: /Favorite/ }).click();
      const download = page.waitForEvent("download");
      await viewer
        .getByRole("button", { name: "Download page-audit-photo.png", exact: true })
        .click();
      assert.equal((await download).suggestedFilename(), "page-audit-photo.png");
      await viewer.getByRole("button", { name: "Close", exact: true }).click();
      await page.getByRole("textbox", { name: "Search photos", exact: true }).fill("forest");
      await photo.waitFor();
      await page.getByRole("textbox", { name: "Search photos", exact: true }).fill("no-photo-here");
      await page.getByText("Showing 0 of 0 matching photos", { exact: true }).waitFor();
      await page.getByRole("textbox", { name: "Search photos", exact: true }).fill("");
      await page.getByRole("button", { name: "Hide page-audit-photo.png", exact: true }).click();
      await photo.waitFor({ state: "hidden" });
      await page.getByRole("button", { name: "Manage hidden photos", exact: true }).click();
      await page.getByRole("button", { name: "Restore page-audit-photo.png", exact: true }).waitFor();
      // Navigation flushes queued metadata; browser file selection is reattached
      // explicitly after reload, using the same fixture file and modification time.
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: "Home", exact: true })
        .click();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await upload();
      await photo.waitFor({state:'hidden'});
      await page.getByRole('button',{name:'Manage hidden photos',exact:true}).click();
      await page.getByRole('button',{name:'Restore page-audit-photo.png',exact:true}).click();
      await photo.waitFor();
      assert.equal(
        await page.getByPlaceholder("People: Alex, Sam", { exact: true }).inputValue(),
        "Alex, Sam",
      );
      assert.equal(
        await page.getByPlaceholder("Tags: travel, pets, event", { exact: true }).inputValue(),
        "forest, travel",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.checks.push(
        "Real sequential typing works in people, gallery tags and full-screen tags; labels normalize and deduplicate on blur",
        "Upload, viewer, download, search/no-match, hide/restore, navigation flush and metadata reload after explicit file reattachment pass",
      );
      report.ok = true;
    } catch (e) {
      report.error = e.message;
      report.errors = errors;
    }
    await page.screenshot({
      path: output.replace(/\.json$/, "-" + (mobile ? "mobile" : "desktop") + ".png"),
    });
    console.log(JSON.stringify(report));
    await context.close();
    writeFileSync(output, JSON.stringify({ ok: reports.every((r) => r.ok), reports }, null, 2));
  }
} finally {
  await browser.close();
}
if (reports.some((r) => !r.ok)) process.exitCode = 1;
