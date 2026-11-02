import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/accounts-providers-dev.json", [
  resolve("screenshots"),
]);
const entry = "\0accounts-fixture";
const bundle = await rolldown({
  input: entry,
  resolve: { alias: { "@": resolve("src") } },
  plugins: [
    {
      name: "accounts-fixture",
      resolveId: (id) => (id === entry ? entry : undefined),
      load: (id) =>
        id === entry
          ? [
              "src/lib/videos/persist.ts",
              "src/lib/local-profiles.ts",
              "src/lib/local-profile-storage.ts",
            ]
              .map(
                (path) =>
                  "export * from " + JSON.stringify(resolve(path).replaceAll("\\", "/")) + ";",
              )
              .join("\n")
          : undefined,
    },
  ],
});
const generated = await bundle.generate({ format: "esm" });
await bundle.close();
const code = generated.output.find((row) => row.type === "chunk").code;
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      isMobile: mobile,
      hasTouch: mobile,
      acceptDownloads: true,
    });
    const page = await context.newPage(),
      errors = [],
      checks = [],
      report = { mobile, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(30000);
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("ERR_ABORTED"))
        errors.push(message.text());
    });
    const record = (text) => {
      checks.push(text);
      console.log(JSON.stringify({ mobile, check: text }));
    };
    await context.route("**/__accounts-probe.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__accounts-blank.html", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Isolated fixture</title><p>Disposable account data</p>",
      }),
    );
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.addInitScript(() => {
      const id = sessionStorage.getItem("realhub.active-local-profile.v1") ?? "default",
        prefix = id === "default" ? "" : "realhub.profile.v1:" + id + ":";
      localStorage.setItem(prefix + "reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        prefix + "reelcase.pull-settings.v1",
        JSON.stringify({ automaticPulls: false }),
      );
      localStorage.setItem(prefix + "reelcase.artwork-mode", "text");
      localStorage.setItem(
        prefix + "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
    });
    const probe = () =>
      page.evaluate(async () => {
        window.__accounts = await import("/__accounts-probe.mjs");
      });
    const ready = () => page.locator('[data-home-ready="true"]').waitFor();
    const accounts = () => page.getByRole("region", { name: "Accounts", exact: true });
    const open = async () => {
      await page.locator("header [data-profile-identity]").click();
      await accounts().waitFor();
      await accounts().getByRole("button", { name: "Create account", exact: true }).waitFor();
    };
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
      await page.locator('main[aria-busy="false"]').waitFor();
    };
    const card = (name) =>
      accounts().getByRole("article", { name: "Account " + name, exact: true });
    const choose = async (name, cancel = false) => {
      await card(name).getByRole("button", { name: "Use account", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Switch to " + name + "?", exact: true });
      if (cancel) {
        await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
        return;
      }
      await dialog.getByRole("button", { name: "Save and switch account", exact: true }).click();
      await page.locator("header [data-profile-identity]").filter({ hasText: name }).waitFor();
      await ready();
    };
    const disclosure = (title) =>
      page
        .locator("[data-desk-disclosure]")
        .filter({ has: page.getByRole("button", { name: title, exact: true }) });
    try {
      await page.goto(new URL("/__accounts-blank.html", url).href);
      await probe();
      await page.evaluate(async () => {
        const p = window.__accounts,
          now = Date.now();
        p.profileLocalStorage.setItem(
          "reelcase.prefs.v4",
          JSON.stringify({
            view: "grid",
            sort: "added",
            hardwareAccel: true,
            tags: { "private-sentinel": ["private-default"] },
            sourceId: "home",
          }),
        );
        localStorage.setItem("better-auth.fixture", "keep-auth");
        localStorage.setItem("account-fixture-default", "keep-default");
        p.savePrefs(p.loadPrefs());
        const follows = [
          {
            id: "yt:UCabcdefghijklmnopqrstuv",
            kind: "youtube",
            handle: "https://www.youtube.com/channel/UCabcdefghijklmnopqrstuv",
            channelId: "UCabcdefghijklmnopqrstuv",
            title: "Fixture YouTube",
          },
          { id: "twitch:fixture", kind: "twitch", handle: "fixture", title: "Fixture Twitch" },
        ];
        p.saveFollows(follows);
        const videos = Array.from({ length: 16 }, (_, i) => {
          const kind = i < 8 ? "youtube" : "twitch",
            videoId =
              kind === "youtube" ? "a" + String(i).padStart(10, "0") : String(900000000 + i),
            folderId = kind === "youtube" ? "youtube:fixture" : "twitch:fixture";
          return {
            id: kind + ":" + videoId,
            folderId,
            name: "QA " + kind + " video " + i,
            path: "QA " + kind + " video " + i,
            extension: "mp4",
            mime: "video/mp4",
            size: 0,
            addedAt: now - i * 60000,
            duration: 1200,
            remote: {
              kind,
              videoId,
              channelId: kind === "youtube" ? "UCabcdefghijklmnopqrstuv" : "fixture",
              channelName: kind === "youtube" ? "Fixture YouTube" : "Fixture Twitch",
              watchUrl:
                kind === "youtube"
                  ? "https://www.youtube.com/watch?v=" + videoId
                  : "https://www.twitch.tv/videos/" + videoId,
              live: false,
              youtubeType: kind === "youtube" ? "upload" : undefined,
              publishedSource: kind === "youtube" ? "watch" : "provider",
              publishedPrecision: "instant",
              publishedDate: new Date(now - i * 60000).toISOString().slice(0, 10),
            },
          };
        });
        await p.saveRemoteSnapshot({
          videos,
          folders: follows.map((f, i) => ({
            id: i ? "twitch:fixture" : "youtube:fixture",
            name: f.title,
            kind: f.kind,
            path: f.handle,
            addedAt: now,
            videoCount: 8,
          })),
          checkedAt: now,
        });
        p.saveDurableHistory([
          {
            id: videos[0].id,
            title: "Default fixture history",
            at: now,
            url: videos[0].remote.watchUrl,
          },
        ]);
        await Promise.all([
          p.waitForPrefsWrites(),
          p.waitForFollowsWrites(),
          p.waitForDurableWrites(),
        ]);
      });
      await page.goto(url);
      await ready();
      await open();
      await card("Default").locator('[aria-label="Current account"]').waitFor();
      await accounts().getByLabel("Account library layout", { exact: true }).selectOption("list");
      await accounts().getByLabel("Account library sort", { exact: true }).selectOption("name");
      await accounts()
        .getByLabel("Account performance preset", { exact: true })
        .selectOption("low-memory");
      await accounts()
        .getByRole("checkbox", { name: "Prefer hardware playback", exact: true })
        .uncheck();
      await accounts().getByLabel("New account name", { exact: true }).fill("Studio");
      await accounts().getByRole("button", { name: "Create account", exact: true }).click();
      await card("Studio").waitFor();
      await choose("Studio", true);
      await card("Default").locator('[aria-label="Current account"]').waitFor();
      await choose("Studio");
      await open();
      await card("Studio").locator('[aria-label="Current account"]').waitFor();
      assert.equal(
        await accounts().getByLabel("Account library layout", { exact: true }).inputValue(),
        "grid",
      );
      assert.equal(
        await accounts().getByLabel("Account performance preset", { exact: true }).inputValue(),
        "adaptive",
      );
      assert.equal(
        await accounts()
          .getByRole("checkbox", { name: "Prefer hardware playback", exact: true })
          .isChecked(),
        true,
      );
      await probe();
      const empty = await page.evaluate(async () => ({
        follows: (await window.__accounts.restoreDurableFollows()).length,
        history: (await window.__accounts.restoreDurableHistory()).length,
        catalog: (await window.__accounts.loadCatalogVideos()).length,
        tags: window.__accounts.loadPrefs()?.tags ?? {},
      }));
      assert.deepEqual(empty, { follows: 0, history: 0, catalog: 0, tags: {} });
      await accounts().getByLabel("Account display name", { exact: true }).fill("Personal");
      await accounts().getByRole("button", { name: "Save account name", exact: true }).click();
      await card("Personal").waitFor();
      await page
        .locator("header [data-profile-identity]")
        .filter({ hasText: "Personal" })
        .waitFor();
      await accounts().getByLabel("New account name", { exact: true }).fill("Personal");
      await accounts().getByRole("button", { name: "Create account", exact: true }).click();
      await accounts().getByRole("alert").filter({ hasText: "already uses that name" }).waitFor();
      await page.evaluate(() => {
        window.__originalPut = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (value, key) {
          if (
            this.transaction.db.name === window.__accounts.PROFILE_REGISTRY_DB &&
            key === "registry"
          )
            throw new DOMException("Controlled account quota", "QuotaExceededError");
          return window.__originalPut.apply(this, arguments);
        };
      });
      try {
        await accounts().getByLabel("New account name", { exact: true }).fill("Quota account");
        await accounts().getByRole("button", { name: "Create account", exact: true }).click();
        await accounts()
          .getByRole("alert")
          .filter({ hasText: "Controlled account quota" })
          .waitFor();
        assert.equal(await card("Quota account").count(), 0);
      } finally {
        await page.evaluate(() => {
          IDBObjectStore.prototype.put = window.__originalPut;
        });
      }
      await page.reload();
      await ready();
      await open();
      await card("Personal").locator('[aria-label="Current account"]').waitFor();
      await accounts().scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", mobile ? "-accounts-mobile.png" : "-accounts-desktop.png"),
      });
      record(
        "Accounts navigation, create/cancel/switch, rename, duplicate/quota recovery and reload work; a new account has no foreign history, follows, catalog or tags",
      );
      await choose("Default");
      await open();
      assert.equal(
        await accounts().getByLabel("Account library layout", { exact: true }).inputValue(),
        "list",
      );
      assert.equal(
        await accounts().getByLabel("Account library sort", { exact: true }).inputValue(),
        "name",
      );
      assert.equal(
        await accounts().getByLabel("Account performance preset", { exact: true }).inputValue(),
        "low-memory",
      );
      assert.equal(
        await accounts()
          .getByRole("checkbox", { name: "Prefer hardware playback", exact: true })
          .isChecked(),
        false,
      );
      assert.equal(
        await page.evaluate(() => localStorage.getItem("account-fixture-default")),
        "keep-default",
      );
      assert.equal(
        await page.evaluate(() => localStorage.getItem("better-auth.fixture")),
        "keep-auth",
      );
      record(
        "Account preferences persist independently; returning to Default preserves its settings, existing library and authentication sentinel",
      );
      for (const kind of ["YouTube", "Twitch"]) {
        await nav(kind);
        await page
          .getByRole("heading", {
            name: kind === "YouTube" ? "More of what you watch." : "Twitch, live first.",
            exact: true,
          })
          .waitFor();
        const titles =
          kind === "YouTube"
            ? ["YouTube diagnostics", "YouTube creators and imports", "YouTube pull controls"]
            : [
                "Twitch live check details",
                "Twitch creators and imports",
                "Twitch pull controls",
                "Twitch library filters",
              ];
        for (const title of titles) {
          assert.equal(
            await page
              .getByRole("button", { name: title, exact: true })
              .getAttribute("aria-expanded"),
            "false",
          );
          assert.equal(await disclosure(title).locator("input,textarea,select").count(), 0);
        }
        if (kind === "Twitch")
          await page
            .getByRole("heading", { name: "Your Twitch mix", exact: true })
            .scrollIntoViewIfNeeded();
        await page.locator("main").locator("[data-video-card-id]").first().waitFor();
        assert.equal(
          await page
            .getByRole("button", { name: "Repair next 5 YouTube dates", exact: true })
            .count(),
          0,
        );
        await page.screenshot({
          path: output.replace(
            ".json",
            "-" + kind.toLowerCase() + (mobile ? "-mobile.png" : "-desktop.png"),
          ),
        });
        const title = kind + " creators and imports",
          toggle = page.getByRole("button", { name: title, exact: true });
        await toggle.click();
        const field = disclosure(title).getByLabel(
          kind === "YouTube" ? "YouTube channel, playlist, or video" : "Twitch channels",
          { exact: true },
        );
        await field.fill("draft-kept-on-collapse");
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"Expanded import panel must fit");
        await toggle.click();
        assert.equal(await field.isVisible(), false);
        await toggle.click();
        assert.equal(await field.inputValue(), "draft-kept-on-collapse");
        await toggle.click();
        const pull = page.getByRole("button", { name: kind + " pull controls", exact: true });
        await pull.click();
        await disclosure(kind + " pull controls")
          .getByRole("button", { name: "Check recent uploads", exact: true })
          .waitFor();
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"Expanded pull controls must fit");
        await pull.click();
        const diagnostic = page.getByRole("button", { name: titles[0], exact: true });
        await diagnostic.click();
        if (kind === "YouTube")
          await page
            .getByRole("button", { name: "Repair next 5 YouTube dates", exact: true })
            .waitFor();
        else await page.getByText("Twitch quick live checks", { exact: true }).waitFor();
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"Expanded diagnostics must fit");
        await diagnostic.click();
        assert.equal(
          await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
          false,
        );
        if (kind === "YouTube") {
          await page
            .getByRole("button", { name: "Explore recommendations and full catalog", exact: true })
            .click();
          await page
            .getByRole("button", {
              name: "Hide YouTube recommendations and full catalog",
              exact: true,
            })
            .click();
          await page
            .getByRole("button", { name: "Explore recommendations and full catalog", exact: true })
            .waitFor();
        } else {
          await page
            .getByRole("button", { name: "Explore Twitch recommendations", exact: true })
            .click();
          await page
            .getByRole("button", { name: "Hide Twitch recommendations", exact: true })
            .click();
          await page.getByRole("button", { name: "Open full Twitch catalog", exact: true }).click();
          await page.getByRole("region", { name: "Full Twitch catalog", exact: true }).waitFor();
          await page
            .getByRole("button", { name: "Close full Twitch catalog", exact: true })
            .click();
          assert.equal(
            await page.getByRole("region", { name: "Full Twitch catalog", exact: true }).count(),
            0,
          );
        }
        record(
          kind +
            " begins collapsed without mounting tools; saved video shelves remain visible, management/pulls/diagnostics open on demand and closing retains input drafts",
        );
      }
      assert.deepEqual(errors, []);
      report.ok = true;
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
            ok: reports.every((r) => r.ok),
            reports,
            limitation:
              "Disposable contexts and synthetic local data. External provider playback and separate sign-ins are outside this change.",
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
