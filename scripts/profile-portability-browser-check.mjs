import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { registerHooks } from "node:module";
import { chromium } from "playwright";
import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
registerHooks({
  resolve(s, c, n) {
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});
const { readPackStream } = await import("../src/lib/videos/pack-stream.ts");
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  out = checkedOutputPath(process.argv[3] ?? "screenshots/milestone86-portability-dev.json", [
    resolve("screenshots"),
  ]);
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        hasTouch: mobile,
        isMobile: mobile,
        acceptDownloads: true,
      }),
      page = await context.newPage(),
      errors = [],
      checks = [],
      report = { mobile, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(30000);
    const record = (text) => {
      checks.push(text);
      console.log(JSON.stringify({ mobile, check: text }));
    };
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) errors.push(m.text());
    });
    await context.addInitScript(() => {
      const id = sessionStorage.getItem("realhub.active-local-profile.v1") ?? "default",
        prefix = id === "default" ? "" : "realhub.profile.v1:" + id + ":";
      localStorage.setItem(prefix + "reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        prefix + "reelcase.sidebar.groups.v1",
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
    const ready = () => page.locator('[data-home-ready="true"]').waitFor(),
      profiles = () => page.getByRole("region", { name: "Local profiles", exact: true }),
      settings = () => page.getByRole("region", { name: "Portable profile settings", exact: true }),
      review = () => page.getByRole("region", { name: "Settings pack review", exact: true }),
      transfer = () => page.getByRole("region", { name: "Library pack transfer", exact: true });
    const open = async () => {
      await page.locator("header [data-profile-identity]").click();
      await page.getByRole("region", {name:"Accounts",exact:true}).getByRole("button", {name:"Open library and device settings",exact:true}).click();
      await profiles().waitFor();
    };
    const id = () =>
      page.evaluate(() => sessionStorage.getItem("realhub.active-local-profile.v1") ?? "default");
    const download = async (button, region = page) => {
      const pending = page.waitForEvent("download");
      await region.getByRole("button", { name: button, exact: true }).click();
      const d = await pending;
      return {
        name: d.suggestedFilename(),
        path: await d.path(),
        bytes: await readFile(await d.path()),
      };
    };
    const upload = async (pack) =>
      settings()
        .getByLabel("Profile settings pack file", { exact: true })
        .setInputFiles({
          name: "settings.json",
          mimeType: "application/json",
          buffer: Buffer.from(typeof pack === "string" ? pack : JSON.stringify(pack)),
        });
    const configure = async (name) => {
      await review()
        .getByRole("textbox", { name: "New settings profile name", exact: true })
        .fill(name);
      await review()
        .getByRole("checkbox", {
          name: "I reviewed the selected settings and new destination",
          exact: true,
        })
        .check();
      await review()
        .getByRole("button", { name: "Create profile with selected settings", exact: true })
        .click();
    };
    const switchTo = async (target) => {
      await open();
      await profiles().getByLabel("Local profile to open", { exact: true }).selectOption(target);
      await profiles().getByRole("button", { name: "Review profile switch", exact: true }).click();
      await page
        .getByRole("dialog", { name: "Switch local profile?", exact: true })
        .getByRole("button", { name: "Save and switch profile", exact: true })
        .click();
      await page.waitForFunction(
        (target) => sessionStorage.getItem("realhub.active-local-profile.v1") === target,
        target,
      );
      await page.waitForLoadState("domcontentloaded");
      await ready();
    };
    const newPlain = async (name) => {
      await profiles().getByLabel("New local profile name", { exact: true }).fill(name);
      await profiles().getByRole("button", { name: "Create empty profile", exact: true }).click();
      await profiles().getByRole("status").filter({ hasText: "Empty profile created" }).waitFor();
      await profiles()
        .getByLabel("Local profile to open", { exact: true })
        .getByRole("option", { name, exact: true })
        .waitFor({ state: "attached" });
      return profiles().getByLabel("Local profile to open", { exact: true }).inputValue();
    };
    try {
      await page.goto(url);
      await ready();
      await open();
      await page.evaluate(() => {
        localStorage.setItem("reelcase.portability-private-fixture", "default-private-sentinel");
      });
      await settings()
        .getByRole("button", { name: "Review settings to export", exact: true })
        .click();
      await review().waitFor();
      assert.equal(await review().getByRole("checkbox").count(), 4);
      const exported = await download("Download selected settings", settings()),
        pack = JSON.parse(exported.bytes.toString("utf8"));
      assert.equal(pack.format, "realhub-profile-settings");
      assert.equal(pack.version, 1);
      assert.equal(pack.sourceProfile.name, "Default");
      assert.equal(Object.keys(pack.settings).length, 4);
      assert(!exported.bytes.toString().includes("default-private-sentinel"));
      await review().getByRole("button", { name: "Discard settings review", exact: true }).click();
      const incoming = {
        ...pack,
        settings: {
          view: "list",
          sort: "name",
          hardwareAccel: false,
          performanceMode: "low-memory",
        },
      };
      await upload(incoming);
      await review().waitFor();
      assert.equal(
        await review()
          .getByRole("button", { name: "Create profile with selected settings", exact: true })
          .isDisabled(),
        true,
      );
      await review().getByRole("checkbox", { name: "Library sort: name", exact: true }).uncheck();
      await review()
        .getByRole("checkbox", { name: "Hardware playback preference: false", exact: true })
        .uncheck();
      await review()
        .getByRole("checkbox", { name: "Performance preset: low-memory", exact: true })
        .uncheck();
      await configure("Alpha");
      await settings()
        .getByRole("status")
        .filter({ hasText: "Created Alpha with the reviewed settings" })
        .waitFor();
      const alpha = await profiles()
        .getByLabel("Local profile to open", { exact: true })
        .inputValue();
      assert.match(alpha, /^p-/);
      assert.equal(await id(), "default");
      const seeded = await page.evaluate(
        (alpha) =>
          JSON.parse(localStorage.getItem("realhub.profile.v1:" + alpha + ":reelcase.prefs.v4")),
        alpha,
      );
      assert.deepEqual(seeded, { view: "list", sourceId: "home" });
      await switchTo(alpha);
      await page.waitForFunction(() =>
        document.querySelector('button[aria-label="List view"]')?.classList.contains("bg-surface"),
      );
      await open();
      record(
        "Actual settings export contains only allowlisted fields; reviewed import creates a new profile with checked fields only and no automatic switch; the chosen view is applied on activation",
      );
      const stream = await download("Export streaming library pack", transfer()),
        parsed = await readPackStream(new File([stream.bytes], "alpha.reelpack"));
      assert.deepEqual(parsed.files.get("profile/source.json"), {
        version: 1,
        id: alpha,
        name: "Alpha",
      });
      const disclosure = transfer().getByText("Legacy ZIP and Companion-folder export", {
        exact: true,
      });
      if (!(await disclosure.evaluate((node) => node.closest("details")?.open)))
        await disclosure.click();
      const legacy = await download("Download legacy ZIP", transfer()),
        zip = unzipSync(legacy.bytes),
        manifestKey = Object.keys(zip).find((name) => name.endsWith("/manifest.json"));
      assert.deepEqual(JSON.parse(strFromU8(zip[manifestKey])).sourceProfile, {
        version: 1,
        id: alpha,
        name: "Alpha",
      });
      const beta = await newPlain("Beta");
      await switchTo(beta);
      await open();
      await transfer().getByLabel("Backup file to inspect", { exact: true }).setInputFiles({
        name: "alpha.reelpack",
        mimeType: "application/octet-stream",
        buffer: stream.bytes,
      });
      const contextBox = transfer().locator("[data-backup-profile-context]");
      await contextBox
        .getByText("Source profile:", { exact: false })
        .filter({ hasText: "Alpha" })
        .waitFor();
      await contextBox
        .getByText("Restore destination:", { exact: false })
        .filter({ hasText: "Beta" })
        .waitFor();
      assert.equal(await id(), beta);
      assert.equal(
        await transfer()
          .getByRole("button", { name: "Prepare reviewed restore", exact: true })
          .isDisabled(),
        true,
      );
      const contextText = await contextBox.innerText();
      assert(contextText.includes(alpha) && contextText.includes("never selects"));
      await contextBox.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: out.replace(".json", mobile ? "-backup-mobile.png" : "-backup-desktop.png"),
      });
      record(
        "Real streaming and ZIP downloads identify Alpha; inspection in Beta names the current destination and cannot prepare a restore before explicit review",
      );
      const oldZip = { ...zip },
        oldManifest = JSON.parse(strFromU8(oldZip[manifestKey]));
      delete oldManifest.sourceProfile;
      oldZip[manifestKey] = strToU8(JSON.stringify(oldManifest));
      await transfer()
        .getByLabel("Backup file to inspect", { exact: true })
        .setInputFiles({
          name: "legacy-unlabelled.zip",
          mimeType: "application/zip",
          buffer: Buffer.from(zipSync(oldZip)),
        });
      await contextBox
        .getByText("Unknown · legacy backup without a profile label", { exact: false })
        .waitFor();
      await transfer().getByRole("heading", { name: "Ready for review", exact: true }).waitFor();
      assert.equal(await id(), beta);
      const futureZip = { ...zip };
      futureZip[manifestKey] = strToU8(
        JSON.stringify({
          ...JSON.parse(strFromU8(zip[manifestKey])),
          sourceProfile: { version: 2, id: alpha, name: "Alpha" },
        }),
      );
      await transfer()
        .getByLabel("Backup file to inspect", { exact: true })
        .setInputFiles({
          name: "future-label.zip",
          mimeType: "application/zip",
          buffer: Buffer.from(zipSync(futureZip)),
        });
      await transfer().getByRole("heading", { name: "Import blocked", exact: true }).waitFor();
      assert.equal(await id(), beta);
      record(
        "Unlabelled legacy backups retain their existing inspection path; future source-profile metadata is blocked without selecting or changing a destination",
      );
      await upload({ ...incoming, settings: { view: "list", token: "forbidden" } });
      await settings().getByRole("alert").filter({ hasText: "unsupported settings" }).waitFor();
      assert.equal(await review().count(), 0);
      await upload({ ...incoming, version: 2 });
      await settings()
        .getByRole("alert")
        .filter({ hasText: "Unsupported profile settings pack" })
        .waitFor();
      await settings()
        .getByLabel("Profile settings pack file", { exact: true })
        .setInputFiles({
          name: "too-big.json",
          mimeType: "application/json",
          buffer: Buffer.alloc(32769, 32),
        });
      await settings().getByRole("alert").filter({ hasText: "32 KiB" }).waitFor();
      await upload(incoming);
      await configure("Beta");
      await settings().getByRole("alert").filter({ hasText: "already uses that name" }).waitFor();
      assert.equal(await id(), beta);
      await page.evaluate(() => {
        window.__originalSet = Storage.prototype.setItem;
        Storage.prototype.setItem = function (key, value) {
          if (key.startsWith("realhub.profile.v1:") && key.endsWith(":reelcase.prefs.v4"))
            throw new DOMException("Controlled portability quota", "QuotaExceededError");
          return window.__originalSet.call(this, key, value);
        };
      });
      try {
        await configure("Quota copy");
        await settings()
          .getByRole("alert")
          .filter({ hasText: "Controlled portability quota" })
          .waitFor();
        assert.equal(await id(), beta);
      } finally {
        await page.evaluate(() => {
          Storage.prototype.setItem = window.__originalSet;
        });
      }
      await configure("Gamma");
      await settings()
        .getByRole("status")
        .filter({ hasText: "Created Gamma with the reviewed settings" })
        .waitFor();
      const gamma = await profiles()
        .getByLabel("Local profile to open", { exact: true })
        .inputValue();
      assert.notEqual(gamma, beta);
      assert.equal(await id(), beta);
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.portability-private-fixture")),
        "default-private-sentinel",
      );
      record(
        "Malformed/future/oversized settings, duplicate destination and storage quota fail safely; retry creates a distinct profile without touching the current profile or Default sentinel",
      );
      await switchTo(gamma);
      await page.reload();
      await ready();
      await open();
      assert.equal(await id(), gamma);
      assert.equal(
        await page
          .getByRole("button", { name: "Low memory", exact: true })
          .getAttribute("aria-pressed"),
        "true",
      );
      await settings()
        .getByRole("button", { name: "Review settings to export", exact: true })
        .click();
      await review().getByRole("checkbox", { name: "Library layout: list", exact: true }).waitFor();
      await review().getByRole("checkbox", { name: "Library sort: name", exact: true }).waitFor();
      await review()
        .getByRole("checkbox", { name: "Hardware playback preference: false", exact: true })
        .waitFor();
      await review()
        .getByRole("checkbox", { name: "Performance preset: low-memory", exact: true })
        .waitFor();
      assert.equal(
        await page.evaluate(
          (id) => localStorage.getItem("realhub.profile.v1:" + id + ":reelcase.performance-mode"),
          gamma,
        ),
        "low-memory",
      );
      await upload(incoming);
      await review()
        .getByRole("textbox", { name: "New settings profile name", exact: true })
        .fill("Reviewed destination");
      await review().scrollIntoViewIfNeeded();
      assert.equal(
        await review().evaluate((node) => {
          const box = node.getBoundingClientRect();
          return [...node.querySelectorAll("button,input")].every((el) => {
            const r = el.getBoundingClientRect();
            return r.left >= box.left - 1 && r.right <= box.right + 1;
          });
        }),
        true,
        "Review controls must stay inside their panel",
      );
      await page.screenshot({
        path: out.replace(".json", mobile ? "-review-mobile.png" : "-review-desktop.png"),
      });
      await review().getByRole("button", { name: "Discard settings review", exact: true }).click();
      assert.equal(await review().count(), 0);
      assert.equal(await id(), gamma);
      await settings().scrollIntoViewIfNeeded();
      await page.screenshot({
        path: out.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      record(
        "Imported settings and selected profile survive reload; discard is read-only; desktop/mobile layouts have no overflow or uncaught errors",
      );
    } catch (error) {
      report.error = error.stack;
      await page
        .screenshot({
          path: out.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
      throw error;
    } finally {
      await context.unrouteAll({ behavior: "ignoreErrors" });
      await context.close();
      await writeFile(
        out,
        JSON.stringify(
          {
            ok: reports.every((report) => !report.error),
            reports,
            limitation:
              "Disposable profiles, controlled failures and real local downloads only; actual user profiles, native grants and accounts were not modified.",
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
