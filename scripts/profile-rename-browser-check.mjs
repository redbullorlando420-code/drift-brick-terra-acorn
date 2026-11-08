import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/milestone85-profiles-dev.json", [
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
    });
    const page = await context.newPage(),
      other = await context.newPage(),
      errors = [],
      checks = [];
    const report = { mobile, checks, errors };
    reports.push(report);
    checks.push = function (...items) {
      console.log(JSON.stringify({ mobile, checks: items }));
      return Array.prototype.push.apply(this, items);
    };
    for (const tab of [page, other]) {
      tab.setDefaultTimeout(30000);
      tab.setDefaultNavigationTimeout(30000);
      tab.on("pageerror", (e) => errors.push(e.message));
      tab.on("console", (m) => {
        if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) errors.push(m.text());
      });
    }
    await context.addInitScript(() => {
      const id = sessionStorage.getItem("realhub.active-local-profile.v1") ?? "default";
      const prefix = id === "default" ? "" : "realhub.profile.v1:" + id + ":";
      localStorage.setItem(prefix + "reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        prefix + "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
    });
    await context.route("http://127.0.0.1:43123/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    const ready = (tab) => tab.locator('[data-home-ready="true"]').waitFor();
    const headerIdentity = (tab, label) =>
      tab
        .locator("header")
        .getByRole("button", {
          name: "Local profile: " + label + ". Open profile controls",
          exact: true,
        });
    const panel = (tab) => tab.getByRole("region", { name: "Local profiles", exact: true });
    const open = async (tab) => {
      await tab.locator("header [data-profile-identity]").click();
      await tab.getByRole("region",{name:"Accounts",exact:true}).getByRole("button",{name:"Open library and device settings",exact:true}).click();
      await panel(tab).waitFor();
    };
    const create = async (name) => {
      await panel(page)
        .getByRole("textbox", { name: "New local profile name", exact: true })
        .fill(name);
      await panel(page).getByRole("button", { name: "Create empty profile", exact: true }).click();
      await panel(page).getByRole("status").filter({ hasText: "Empty profile created" }).waitFor();
      const id = await panel(page)
        .getByRole("combobox", { name: "Local profile to open", exact: true })
        .inputValue();
      await panel(page)
        .getByRole("combobox", { name: "Local profile to open", exact: true })
        .getByRole("option", { name, exact: true })
        .waitFor({ state: "attached" });
      return id;
    };
    const rename = async (tab, id, name) => {
      await panel(tab)
        .getByRole("combobox", { name: "Profile to rename", exact: true })
        .selectOption(id);
      await panel(tab).getByRole("textbox", { name: "New profile label", exact: true }).fill(name);
      await panel(tab).getByRole("button", { name: "Save profile label", exact: true }).click();
    };
    try {
      console.log(JSON.stringify({ mobile, stage: "opening" }));
      await page.goto(url);
      await ready(page);
      await headerIdentity(page, "Default").waitFor();
      await open(page);
      console.log(JSON.stringify({ mobile, stage: "creating profiles" }));
      await panel(page).getByRole("heading",{name:"Local profiles",exact:true}).waitFor();
      const alpha = await create("Alpha"),
        beta = await create("Beta");
      console.log(JSON.stringify({ mobile, stage: "opening second tab" }));
      await other.goto(url);
      await ready(other);
      await open(other);
      await panel(other)
        .getByRole("combobox", { name: "Profile to rename", exact: true })
        .getByRole("option", { name: "Alpha", exact: true })
        .waitFor({ state: "attached" });
      await page.evaluate(
        ({ alpha, beta }) => {
          localStorage.setItem("reelcase.profile-name-fixture", "Default private sentinel");
          for (const [id, value] of [
            [alpha, "Alpha private sentinel"],
            [beta, "Beta private sentinel"],
          ]) {
            localStorage.setItem(
              "realhub.profile.v1:" + id + ":reelcase.profile-name-fixture",
              value,
            );
            localStorage.setItem(
              "realhub.profile.v1:" + id + ":reelcase.profile-draft-fixture",
              value + " draft",
            );
          }
        },
        { alpha, beta },
      );
      await panel(page)
        .getByRole("combobox", { name: "Local profile to open", exact: true })
        .selectOption(alpha);
      console.log(JSON.stringify({ mobile, stage: "switching to Alpha" }));
      await panel(page).getByRole("button", { name: "Review profile switch", exact: true }).click();
      await page
        .getByRole("dialog", { name: "Switch local profile?", exact: true })
        .getByRole("button", { name: "Save and switch profile", exact: true })
        .click();
      await page.waitForFunction(
        (id) => sessionStorage.getItem("realhub.active-local-profile.v1") === id,
        alpha,
      );
      await page.waitForLoadState("domcontentloaded");
      await ready(page);
      await headerIdentity(page, "Alpha").waitFor();
      await headerIdentity(other, "Default").waitFor();
      await open(page);
      await panel(page)
        .getByRole("textbox", { name: "New profile label", exact: true })
        .fill("Unsaved local label");
      await page.evaluate(() => {
        window.__profileDocument = crypto.randomUUID();
      });
      const documentMarker = await page.evaluate(() => window.__profileDocument);
      await rename(other, alpha, "Alpha room");
      await panel(other)
        .getByRole("status")
        .filter({ hasText: "Profile renamed to Alpha room" })
        .waitFor();
      await headerIdentity(page, "Alpha room").waitFor();
      assert.equal(
        await panel(page)
          .getByRole("textbox", { name: "New profile label", exact: true })
          .inputValue(),
        "Unsaved local label",
      );
      assert.equal(await page.evaluate(() => window.__profileDocument), documentMarker);
      assert.equal(
        await page.evaluate(() => sessionStorage.getItem("realhub.active-local-profile.v1")),
        alpha,
      );
      await panel(other)
        .getByRole("combobox", { name: "Local profile to open", exact: true })
        .getByRole("option", { name: "Alpha room", exact: true })
        .waitFor({ state: "attached" });
      checks.push(
        "Cross-tab rename refreshes active identity and profile pickers without reload, namespace switch or loss of an in-progress label draft",
      );
      await rename(other, alpha, " beta ");
      await panel(other).getByRole("alert").filter({ hasText: "already uses that name" }).waitFor();
      await headerIdentity(page, "Alpha room").waitFor();
      await rename(other, alpha, "Default");
      await panel(other).getByRole("alert").filter({ hasText: "reserved" }).waitFor();
      await other.evaluate(() => {
        window.__originalPut = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (value, key) {
          if (this.transaction.db.name === "realhub-local-profiles" && key === "registry")
            throw new DOMException("Controlled rename quota", "QuotaExceededError");
          return window.__originalPut.apply(this, arguments);
        };
      });
      try {
        await rename(other, alpha, "Quota attempt");
        await panel(other)
          .getByRole("alert")
          .filter({ hasText: "Controlled rename quota" })
          .waitFor();
        assert.equal(
          await panel(other)
            .getByRole("textbox", { name: "New profile label", exact: true })
            .inputValue(),
          "Quota attempt",
        );
        await headerIdentity(page, "Alpha room").waitFor();
      } finally {
        await other.evaluate(() => {
          IDBObjectStore.prototype.put = window.__originalPut;
        });
      }
      await rename(other, alpha, "A".repeat(48));
      await headerIdentity(page, "A".repeat(48)).waitFor();
      await panel(other)
        .getByRole("status")
        .filter({ hasText: "Profile renamed to " + "A".repeat(48) })
        .waitFor();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      checks.push(
        "Duplicate/reserved labels and quota errors preserve the previous durable name and editable input; maximum-length labels stay within the mobile layout",
      );
      await other.evaluate(() => {
        window.__originalBroadcast = window.BroadcastChannel;
        window.BroadcastChannel = class {
          constructor() {
            throw Error("Controlled unsupported transport");
          }
        };
      });
      try {
        await rename(other, alpha, "Family room");
        await panel(other)
          .getByRole("status")
          .filter({ hasText: "Profile renamed to Family room" })
          .waitFor();
        await page.evaluate(() => window.dispatchEvent(new Event("focus")));
        await headerIdentity(page, "Family room").waitFor();
      } finally {
        await other.evaluate(() => {
          window.BroadcastChannel = window.__originalBroadcast;
        });
      }
      await page.reload();
      await ready(page);
      await headerIdentity(page, "Family room").waitFor();
      assert.equal(
        await page.evaluate(() => sessionStorage.getItem("realhub.active-local-profile.v1")),
        alpha,
      );
      const sentinels = await page.evaluate(
        ({ alpha, beta }) => [
          localStorage.getItem("reelcase.profile-name-fixture"),
          localStorage.getItem("realhub.profile.v1:" + alpha + ":reelcase.profile-name-fixture"),
          localStorage.getItem("realhub.profile.v1:" + beta + ":reelcase.profile-name-fixture"),
          localStorage.getItem("realhub.profile.v1:" + alpha + ":reelcase.profile-draft-fixture"),
        ],
        { alpha, beta },
      );
      assert.deepEqual(sentinels, [
        "Default private sentinel",
        "Alpha private sentinel",
        "Beta private sentinel",
        "Alpha private sentinel draft",
      ]);
      checks.push(
        "Focus refresh works when cross-tab transport is unavailable; rename persists across reload and Default/Alpha/Beta personal sentinels remain unchanged",
      );
      const navNames = [
        "Home",
        "YouTube",
        "Twitch",
        "Movies",
        "Anime",
        "Watch room",
        "Stream Signal",
      ];
      for (const name of navNames) {
        if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
        const nav = page.getByRole("navigation", { name: "Library navigation" });
        if (mobile)
          await page
            .getByRole("dialog")
            .getByRole("button", {
              name: "Local profile: Family room. Open profile controls",
              exact: true,
            })
            .waitFor();
        await nav.getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") }).click();
        await headerIdentity(page, "Family room").waitFor();
      }
      if (mobile) {
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
        await page
          .getByRole("dialog")
          .getByRole("button", {
            name: "Local profile: Family room. Open profile controls",
            exact: true,
          })
          .click();
        await page.getByRole("dialog").waitFor({ state: "hidden" });
        await page.getByRole("region", { name: "Accounts", exact: true }).waitFor();
      } else await open(page);
      await (mobile ? page.getByRole("region", { name: "Accounts", exact: true }) : panel(page)).scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      checks.push(
        "Header identity stays visible across media and editing desks; navigation indicator opens the existing profile controls on desktop/mobile",
      );
      await page.evaluate(() =>
        sessionStorage.setItem(
          "realhub.active-local-profile.v1",
          "p-99999999-9999-4999-8999-999999999999",
        ),
      );
      await page.reload();
      await page
        .getByRole("heading", { name: "Local profile needs attention", exact: true })
        .waitFor();
      await page.getByText("Selected local profile:", { exact: false }).waitFor();
      assert.equal(await page.locator('[data-home-ready="true"]').count(), 0);
      await page.getByRole("button", { name: "Return to Default profile", exact: true }).click();
      await ready(page);
      await headerIdentity(page, "Default").waitFor();
      assert.deepEqual(errors, []);
      checks.push(
        "Missing profile recovery identifies the selected immutable ID, keeps the library unmounted and returns safely to Default",
      );
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
              "Disposable browser contexts only. Registry failures and sentinel data are synthetic; real user profiles were not modified.",
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
