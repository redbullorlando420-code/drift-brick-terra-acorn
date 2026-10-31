import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fromJSON } from "seroval";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/import-review-dev.json", [
    resolve("screenshots"),
  ]);
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
const find = (value, p) => {
  if (!value || typeof value !== "object") return;
  if (p(value)) return value;
  for (const child of Object.values(value)) {
    const result = find(child, p);
    if (result) return result;
  }
};
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
      requests = [],
      report = { mobile, errors, checks };
    reports.push(report);
    page.setDefaultTimeout(45000);
    let accept = false;
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) errors.push(m.text());
    });
    await context.addInitScript(() => {
      const auto = localStorage.getItem("import-qa-autocheck") === "true";
      localStorage.setItem("reelcase.pulls-paused.v1", auto ? "false" : "true");
      localStorage.setItem("reelcase.pull-settings.v1", JSON.stringify({ automaticPulls: auto }));
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      if (!localStorage.getItem("import-qa-seeded")) {
        localStorage.setItem("import-qa-seeded", "yes");
        localStorage.setItem(
          "reelcase.import-draft.youtube",
          Array.from({ length: 10000 }, (_, i) => "Creator Name " + i).join("\n"),
        );
        localStorage.setItem("reelcase.import-updated.youtube", String(Date.now()));
      }
    });
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("**/_serverFn/**", async (route) => {
      const raw = route.request().postData();
      let input;
      try {
        input = raw ? fromJSON(JSON.parse(raw)) : undefined;
      } catch {}
      const data = find(input, (value) => Array.isArray(value.items));
      let result = { profiles: [], channels: [] };
      if (data) {
        requests.push(...data.items);
        assert(data.items.length <= 50);
        const source = {
          id: "yt:UC0000000000000000000001",
          channelId: "UC0000000000000000000001",
          kind: "youtube",
          handle: "@reviewfixture",
          title: data.items[0].query,
          importQuery: data.items[0].query,
          lastCheckedAt: Date.now(),
        };
        result = accept
          ? { ok: [{ channel: source, videos: [] }], failed: 0, failedQueries: [] }
          : {
              ok: [],
              failed: data.items.length,
              failedQueries: data.items.map((item) => item.query),
              failedReasons: Object.fromEntries(
                data.items.map((item) => [
                  item.query,
                  "Several public channels match. Supply an exact channel link.",
                ]),
              ),
            };
      }
      await route
        .fulfill({ contentType: "application/json", body: JSON.stringify({ result, context: {} }) })
        .catch(() => {});
    });
    const nav = async () => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: /^YouTube(?:\s+\d+)?$/ })
        .click();
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      const review = page.getByRole("region", { name: "Creator import review", exact: true }),
        list = review.getByRole("listbox", { name: "Import review entries", exact: true });
      await review.waitFor();
      await review.getByText(/10,000 unique entries/).waitFor();
      assert.equal(requests.length, 0);
      assert((await review.locator("[data-import-review-row]").count()) <= 10);
      assert.equal(
        await review
          .getByRole("button", { name: "Import next reviewed batch", exact: true })
          .isEnabled(),
        false,
      );
      checks.push(
        "10k held names mount at most 10 review rows and trigger no automatic identity lookups",
      );
      await list.focus();
      await list.press("End");
      const last = review.locator('[data-query="Creator Name 9999"]');
      await last.waitFor();
      assert.equal(await last.getAttribute("aria-selected"), "false");
      await list.press(" ");
      await page.waitForFunction(
        () =>
          JSON.parse(localStorage.getItem("reelcase.import-review.youtube") ?? "null")?.choices?.[
            "creator name 9999"
          ] === "include",
      );
      assert.equal(await last.getAttribute("aria-selected"), "true");
      assert((await review.locator("[data-import-review-row]").count()) <= 10);
      await review
        .getByRole("textbox", { name: "Search import review", exact: true })
        .fill("Name 9999");
      await page.waitForFunction(() =>
        document.querySelector("[data-import-review]")?.innerText.includes("1 matching"),
      );
      await review.getByRole("button", { name: "Save draft", exact: true }).count();
      // Saving uses the existing enclosing draft control and durable session writer.
      await page.getByRole("button", { name: "Save draft", exact: true }).click();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await review.getByRole("textbox", { name: "Search import review", exact: true }).waitFor();
      assert.equal(
        await review
          .getByRole("textbox", { name: "Search import review", exact: true })
          .inputValue(),
        "Name 9999",
      );
      await last.waitFor();
      assert.equal(await last.getAttribute("aria-selected"), "true");
      checks.push(
        "End/Space selection, filter and logical anchor survive reload through the existing import session",
      );
      await review.getByRole("button", { name: "Import next reviewed batch", exact: true }).click();
      await review.getByText(/Import waiting: pulls are paused/).waitFor();
      await page.getByRole("button", { name: "Resume pulls", exact: true }).click();
      await review.getByText(/Batch finished/).waitFor();
      assert.equal(requests.length, 1);
      assert.equal(requests[0].query, "Creator Name 9999");
      await review
        .getByRole("combobox", { name: "Import review status", exact: true })
        .selectOption("failed");
      await review
        .getByText("Several public channels match. Supply an exact channel link.", { exact: true })
        .waitFor();
      assert.equal(await last.getAttribute("aria-selected"), "true");
      await page.getByRole("button", { name: "Save draft", exact: true }).click();
      await page.evaluate(() => localStorage.setItem("import-qa-autocheck", "true"));
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav();
      await review
        .getByText("Several public channels match. Supply an exact channel link.", { exact: true })
        .waitFor();
      await page.waitForTimeout(600);
      assert.equal(requests.length, 1);
      const pending = await page.evaluate(
        () => JSON.parse(localStorage.getItem("reelcase.follows.v1") ?? "{}").channels ?? [],
      );
      assert(pending.length <= 1);
      await page.evaluate(() => {
        localStorage.removeItem("import-qa-autocheck");
        const value = JSON.stringify({ automaticPulls: false });
        localStorage.setItem("reelcase.pull-settings.v1", value);
        window.dispatchEvent(
          new StorageEvent("storage", { key: "reelcase.pull-settings.v1", newValue: value }),
        );
      });
      await page.getByRole("button", { name: "Pause pulls", exact: true }).click();
      checks.push(
        "Ambiguous identity failure stays visible and saved without an automatic retry or verified follow",
      );
      accept = true;
      await review.getByRole("button", { name: "Retry reviewed failures", exact: true }).click();
      await page.getByRole("button", { name: "Resume pulls", exact: true }).click();
      await review.getByText(/Batch finished/).waitFor();
      assert.equal(requests.length, 2);
      await review
        .getByRole("combobox", { name: "Import review status", exact: true })
        .selectOption("saved");
      await last.getByText("Already verified", { exact: true }).waitFor();
      assert.equal(await last.getAttribute("aria-disabled"), "true");
      checks.push(
        "Explicit retry can admit a verified identity; saved rows are disabled and not re-submitted",
      );
      await review.getByRole("textbox", { name: "Search import review", exact: true }).fill("");
      await review
        .getByRole("combobox", { name: "Import review status", exact: true })
        .selectOption("held");
      await page.waitForFunction(() =>
        document.querySelector("[data-import-review]")?.innerText.includes("9,999 matching"),
      );
      await list.focus();
      await list.press("End");
      assert((await review.locator("[data-import-review-row]").count()) <= 10);
      await review.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.requests = requests.length;
    } catch (error) {
      report.error = error.stack;
      await page
        .screenshot({
          path: output.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
      throw error;
    } finally {
      await context.unrouteAll({ behavior: "ignoreErrors" });
      await context.close();
      await writeFile(
        output,
        JSON.stringify(
          {
            ok: reports.every((r) => !r.error),
            reports,
            limitation:
              "Isolated 10k-name session fixtures and controlled provider responses. Desktop/mobile Chromium emulation; no real follows, account cookies or provider requests.",
          },
          null,
          2,
        ),
      );
    }
  }
} finally {
  await browser.close();
}
console.log(JSON.stringify({ ok: true, reports }, null, 2));
