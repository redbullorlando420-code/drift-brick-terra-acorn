import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/page-recovery-dev.json", [
  resolve("screenshots"),
]);
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const mobile of [false, true])
    for (const stored of [
      null,
      {
        games: {},
        prints: [
          null,
          { name: "Kept sample.stl", path: "Samples/kept.stl", size: 100, addedAt: 1 },
        ],
      },
    ]) {
      const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        isMobile: mobile,
        hasTouch: mobile,
      });
      await context.addInitScript((value) => {
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem(
          "reelcase.sidebar.groups.v1",
          JSON.stringify({ library: true, workspace: true, tools: true }),
        );
        if (!localStorage.getItem("qa-hub-seeded")) {
          localStorage.setItem("reelcase.hub.v1", JSON.stringify(value));
          localStorage.setItem("qa-hub-seeded", "true");
        }
      }, stored);
      await context.route("http://127.0.0.1:43123/**", (r) =>
        r.fulfill({
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: '{"ok":false}',
        }),
      );
      const page = await context.newPage(),
        errors = [];
      page.setDefaultTimeout(10000);
      page.on("pageerror", (e) => errors.push(e.message));
      for (const name of ["Games", "3D prints", "Settings"]) {
        const report = { mobile, stored, name, errors: [], ok: false };
        reports.push(report);
        try {
          errors.length = 0;
          await page.goto(url);
          await page.locator('[data-home-ready="true"]').waitFor();
          if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
          await page
            .getByRole("navigation", { name: "Library navigation" })
            .getByRole("button", { name, exact: true })
            .click();
          await page
            .getByText("Loading this library workspace…", { exact: true })
            .waitFor({ state: "hidden" });
          await page.waitForTimeout(500);
          const body = await page.locator("main").innerText();
          assert.ok(
            !/Something went wrong|Cannot read properties|\.map is not a function|\.filter is not a function/.test(
              body,
            ),
            body.slice(0, 450),
          );
          assert.ok(body.length > 100);
          assert.deepEqual(errors, []);
          if (name === "3D prints" && stored !== null)
            await page.getByText("Kept sample.stl", { exact: true }).waitFor();
          assert.equal(
            await page.evaluate(() => localStorage.getItem("reelcase.hub.v1")),
            JSON.stringify(stored),
            "reading must never overwrite original saved data",
          );
          report.ok = true;
        } catch (error) {
          report.error = error.message;
          report.errors = [...errors];
          await page.screenshot({
            path: output.replace(
              /\.json$/,
              "-" +
                (mobile ? "mobile" : "desktop") +
                "-" +
                (stored === null ? "null" : "partial") +
                "-" +
                name.replace(/\s/g, "-") +
                ".png",
            ),
          });
        }
        console.log(
          JSON.stringify({ mobile, name, ok: report.ok, error: report.error?.slice(0, 180) }),
        );
        writeFileSync(output, JSON.stringify({ ok: reports.every((r) => r.ok), reports }, null, 2));
      }
      await context.close();
    }
} finally {
  await browser.close();
}
if (reports.some((r) => !r.ok)) process.exitCode = 1;
