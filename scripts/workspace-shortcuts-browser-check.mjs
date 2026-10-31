import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/workspace-shortcuts-dev.json", [
  resolve("screenshots"),
]);
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const mobile of [false, true])
    for (const target of ["Spotify", "Shop"]) {
      const context = await browser.newContext({
          viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
          isMobile: mobile,
          hasTouch: mobile,
        }),
        page = await context.newPage(),
        errors = [];
      page.setDefaultTimeout(7000);
      page.on("pageerror", (e) => errors.push(e.message));
      await context.addInitScript(() => {
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem(
          "reelcase.sidebar.groups.v1",
          JSON.stringify({ library: true, workspace: true, tools: true }),
        );
        if (!localStorage.getItem("qa-shortcuts-seeded")) {
          localStorage.setItem(
            "reelcase.package-tracking.v1",
            JSON.stringify([
              null,
              {
                id: "kept",
                title: "Kept order",
                carrier: "UPS",
                tracking: "OLD",
                status: "Shipped",
              },
            ]),
          );
          localStorage.setItem(
            "reelcase.spotify.imports.v1",
            JSON.stringify(["https://wrong.example/playlist/nope"]),
          );
          localStorage.setItem("reelcase.spotify.playlist", "https://wrong.example/playlist/nope");
          localStorage.setItem("qa-shortcuts-seeded", "true");
        }
        const set = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) {
          if (window.__denyShortcutSave && /reelcase\.(spotify|package-tracking)/.test(k))
            throw new DOMException("Controlled storage full", "QuotaExceededError");
          return set.call(this, k, v);
        };
      });
      await context.route("http://127.0.0.1:43123/**", (r) =>
        r.fulfill({
          contentType: "application/json",
          headers: { "access-control-allow-origin": "*" },
          body: '{"ok":false}',
        }),
      );
      const report = { mobile, target, checks: [], ok: false };
      reports.push(report);
      const nav = async () => {
        if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
        await page
          .getByRole("navigation", { name: "Library navigation" })
          .getByRole("button", { name: target, exact: true })
          .click();
      };
      try {
        await page.goto(url);
        await page.locator('[data-home-ready="true"]').waitFor();
        await nav();
        await page
          .getByText("Loading this library workspace…", { exact: true })
          .waitFor({ state: "hidden" });
        if (target === "Spotify") {
          assert.equal(
            await page.getByRole("link", { name: "Open saved playlist", exact: true }).count(),
            0,
            "Invalid saved links must not become launch links",
          );
          const input = page.getByRole("textbox", { name: "Spotify playlist link", exact: true });
          await input.fill("https://open.spotify.com.evil.test/playlist/0123456789ABCDEFGHIJKL");
          await page.getByRole("button", { name: "Import link", exact: true }).click();
          await page
            .getByRole("alert")
            .filter({ hasText: /valid Spotify/ })
            .waitFor();
          await input.fill(
            "https://open.spotify.com/intl-de/playlist/0123456789ABCDEFGHIJKL?si=fixture",
          );
          await page.getByRole("button", { name: "Import link", exact: true }).click();
          await page.getByRole("link", { name: "Open saved playlist", exact: true }).waitFor();
          assert.equal(
            await page
              .getByRole("link", { name: "Open saved playlist", exact: true })
              .getAttribute("href"),
            "https://open.spotify.com/playlist/0123456789ABCDEFGHIJKL",
          );
          report.checks.push(
            "Invalid saved/typed URLs rejected; official localized Spotify link normalized",
          );
          await page.evaluate(() => (window.__denyShortcutSave = true));
          await input.fill("https://open.spotify.com/album/1123456789ABCDEFGHIJKL");
          await page.getByRole("button", { name: "Import link", exact: true }).click();
          await page
            .getByRole("alert")
            .filter({ hasText: /could not save/i })
            .waitFor();
          await page.evaluate(() => (window.__denyShortcutSave = false));
          await page.getByRole("button", { name: "Import link", exact: true }).click();
        } else {
          await page.getByText("Kept order", { exact: true }).waitFor();
          assert.equal(
            await page.evaluate(
              () => JSON.parse(localStorage.getItem("reelcase.package-tracking.v1")).length,
            ),
            2,
            "Opening Shop must not silently rewrite damaged storage",
          );
          await page.getByRole("textbox", { name: "Package name", exact: true }).fill("Test order");
          await page.getByRole("textbox", { name: "Tracking number", exact: true }).fill("12345");
          await page.getByRole("button", { name: "Add package", exact: true }).click();
          await page.getByText("Test order", { exact: true }).waitFor();
          await page
            .getByRole("combobox", { name: "Delivery status for Test order", exact: true })
            .selectOption("Shipped");
          await page.evaluate(() => (window.__denyShortcutSave = true));
          await page
            .getByRole("combobox", { name: "Delivery status for Test order", exact: true })
            .selectOption("Delivered");
          await page
            .getByRole("alert")
            .filter({ hasText: /could not save/i })
            .waitFor();
          await page.evaluate(() => (window.__denyShortcutSave = false));
          await page.getByRole("button", { name: "Retry saving packages", exact: true }).click();
          report.checks.push(
            "Damaged entries do not crash Shop or overwrite stored data on mount; adding and changing status work",
          );
        }
        await page.reload();
        await page.locator('[data-home-ready="true"]').waitFor();
        await nav();
        if (target === "Spotify")
          assert.equal(
            await page
              .getByRole("link", { name: "Open saved playlist", exact: true })
              .getAttribute("href"),
            "https://open.spotify.com/album/1123456789ABCDEFGHIJKL",
          );
        else {
          await page.getByText("Test order", { exact: true }).waitFor();
          assert.equal(
            await page
              .getByRole("combobox", { name: "Delivery status for Test order", exact: true })
              .inputValue(),
            "Delivered",
          );
          await page.getByText("Kept order", { exact: true }).waitFor();
        }
        report.checks.push(
          "Storage failure is visible and recoverable; retry persists across reload",
        );
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
        );
        assert.deepEqual(errors, []);
        report.ok = true;
      } catch (e) {
        report.error = e.message;
        report.errors = errors;
      }
      await page.screenshot({
        path: output.replace(
          /\.json$/,
          "-" + (mobile ? "mobile" : "desktop") + "-" + target + ".png",
        ),
      });
      console.log(JSON.stringify(report));
      await context.close();
      writeFileSync(output, JSON.stringify({ ok: reports.every((r) => r.ok), reports }, null, 2));
    }
} finally {
  await browser.close();
}
if (reports.some((r) => !r.ok)) process.exitCode = 1;
