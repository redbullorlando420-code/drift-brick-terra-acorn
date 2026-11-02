import assert from "node:assert/strict";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { writeFile, readFile } from "node:fs/promises";
import { unzipSync, strFromU8 } from "fflate";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const out = checkedOutputPath(process.argv[3] ?? "screenshots/milestone83-profiles-dev.json", [
  resolve("screenshots"),
]);
const entry = "\0integrated-profiles";
const bundle = await rolldown({
  input: entry,
  resolve: { alias: { "@": resolve("src") } },
  plugins: [
    {
      name: "probe",
      resolveId: (id) => (id === entry ? entry : undefined),
      load: (id) =>
        id === entry
          ? [
              "src/lib/videos/persist.ts",
              "src/lib/prints-blobs.ts",
              "src/lib/local-profile-storage.ts",
              "src/lib/local-profiles.ts",
              "src/lib/stream-signal.ts",
            ]
              .map((p) => "export * from " + JSON.stringify(resolve(p).replaceAll("\\", "/")) + ";")
              .join("\n")
          : undefined,
    },
  ],
});
const built = await bundle.generate({ format: "esm" });
await bundle.close();
const code = built.output.find((row) => row.type === "chunk").code;
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        hasTouch: mobile,
        isMobile: mobile,
      }),
      page = await context.newPage(),
      errors = [],
      checks = [];
    reports.push({ mobile, checks, errors });
    page.on("pageerror", (e) => errors.push(e.message));
    await context.route("**/__profiles-probe.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__profiles-blank.html", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Disposable profile fixture</title><p>Isolated storage fixture</p>",
      }),
    );
    // Prevent automatic provider work from obscuring the local storage checks.
    await context.addInitScript(() => {
      const id = sessionStorage.getItem("realhub.active-local-profile.v1") ?? "default",
        prefix = id === "default" ? "" : "realhub.profile.v1:" + id + ":";
      localStorage.setItem(prefix + "reelcase.pulls-paused.v1", "true");
      localStorage.setItem(prefix + "reelcase.artwork-mode", "text");
      localStorage.setItem(
        prefix + "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
    });
    const probe = () =>
      page.evaluate(async () => {
        window.__p = await import("/__profiles-probe.mjs");
      });
    const ready = () => page.locator('[data-home-ready="true"]').waitFor();
    async function nav(name) {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    }
    async function seed(label) {
      await page.goto(new URL("/__profiles-blank.html", url).href);
      await probe();
      await page.evaluate(async (label) => {
        const p = window.__p,
          id = "fixture-" + label,
          folder = "fixture-folder-" + label;
        p.profileLocalStorage.setItem(
          "reelcase.prefs.v4",
          JSON.stringify({
            tags: { [id]: ["private-" + label] },
            privateFolderIds: [folder],
            sourceId: "home",
            view: "grid",
            sort: "added",
            sortDir: "desc",
          }),
        );
        const prefs = p.loadPrefs();
        p.savePrefs(prefs);
        p.saveFollows([
          { id: "yt:" + label, kind: "youtube", handle: label, title: label + " creator" },
        ]);
        p.saveDurableHistory([
          {
            id,
            at: Date.now(),
            title: label + " history",
            url: "https://www.youtube.com/watch?v=abcdefghijk",
          },
        ]);
        await p.saveFolderVideos(folder, [
          {
            id,
            folderId: folder,
            name: label + " movie.mp4",
            path: label + ".mp4",
            extension: "mp4",
            mime: "video/mp4",
            size: 12,
            addedAt: 1,
            duration: 900,
          },
        ]);
        await p.savePrintBlob(
          new File(["solid " + label + "\nendsolid " + label], label + ".stl"),
          "same-print-id",
        );
        const signal = p.signalRevisions("fixture-owner");
        await signal.save(
          "stream-signal:v1:fixture-owner:profile",
          { ...p.DEFAULT_SIGNAL_PROFILE, title: label + " draft" },
          0,
        );
        signal.writer.close();
        p.profileLocalStorage.setItem("reelcase.profile-fixture", label);
        await Promise.all([
          p.waitForPrefsWrites(),
          p.waitForFollowsWrites(),
          p.waitForDurableWrites(),
        ]);
      }, label);
      await page.goto(url);
      await ready();
    }
    async function inspect(label) {
      await probe();
      const state = await page.evaluate(async () => {
        const p = window.__p;
        await p.restoreDurablePrefs();
        const prefs = p.loadPrefs(),
          history = await p.restoreDurableHistory(),
          follows = await p.restoreDurableFollows(),
          catalog = await p.loadCatalogVideos(),
          print = await p.loadPrintBlob("same-print-id"),
          signal = p.signalRevisions("fixture-owner"),
          draft = await signal.profile();
        signal.writer.close();
        return {
          profile: p.currentProfileId(),
          tags: prefs?.tags,
          privateIds: prefs?.privateFolderIds,
          history: history.map((h) => h.title),
          follows: follows.map((f) => f.title),
          catalog: catalog.map((v) => v.name),
          print: print?.name,
          printText: await print?.blob.text(),
          draft: draft.profile.title,
          fixture: p.profileLocalStorage.getItem("reelcase.profile-fixture"),
        };
      });
      assert.equal(state.fixture, label);
      assert.deepEqual(state.history, [label + " history"]);
      assert.deepEqual(state.follows, [label + " creator"]);
      assert.deepEqual(state.catalog, [label + " movie.mp4"]);
      assert.equal(state.print, label + ".stl");
      assert.equal(state.printText, "solid " + label + "\nendsolid " + label);
      assert.equal(state.draft, label + " draft");
      assert.deepEqual(state.tags["fixture-" + label], ["private-" + label]);
      assert(state.privateIds.includes("fixture-folder-" + label));
      await nav("Settings");
      const transfer = page.getByRole("region", { name: "Library pack transfer" });
      const legacyExport = transfer.getByText("Legacy ZIP and Companion-folder export", { exact: true });
      if (!(await legacyExport.evaluate(node => node.closest('details')?.open))) await legacyExport.click();
      const downloading = page.waitForEvent("download");
      await transfer.getByRole("button", { name: "Download legacy ZIP", exact: true }).click();
      const download = await downloading,
        files = unzipSync(new Uint8Array(await readFile(await download.path())));
      const exported = Object.values(files)
        .map((bytes) => strFromU8(bytes))
        .join("\n");
      assert(
        exported.includes(label + " history"),
        "Current profile is represented in the real ZIP",
      );
      for (const other of ["DefaultSeed", "AlphaSeed", "BetaSeed"].filter((x) => x !== label))
        assert(!exported.includes(other), "Foreign profile in export: " + other);
      return state;
    }
    async function switchTo(id) {
      await nav("Settings");
      const panel = page.getByRole("region", { name: "Local profiles" });
      await panel.getByLabel("Local profile to open", { exact: true }).selectOption(id);
      await panel.getByRole("button", { name: "Review profile switch", exact: true }).click();
      await page
        .getByRole("dialog", { name: "Switch local profile?" })
        .getByRole("button", { name: "Save and switch profile", exact: true })
        .click();
      await page.waitForFunction(
        (id) => sessionStorage.getItem("realhub.active-local-profile.v1") === id,
        id,
      );
      await page.waitForLoadState("domcontentloaded");
      await ready();
      await probe();
      assert.equal(await page.evaluate(() => window.__p.currentProfileId()), id);
    }
    async function create(name) {
      const panel = page.getByRole("region", { name: "Local profiles" });
      await panel.getByLabel("New local profile name", { exact: true }).fill(name);
      await panel.getByRole("button", { name: "Create empty profile", exact: true }).click();
      await panel.getByRole("status").filter({ hasText: "Empty profile created" }).waitFor();
      return panel.getByLabel("Local profile to open", { exact: true }).inputValue();
    }
    try {
      await seed("DefaultSeed");
      await inspect("DefaultSeed");
      checks.push("Existing Default keys and databases restore without relocation");
      await nav("Settings");
      const panel = page.getByRole("region", { name: "Local profiles" });
      await panel
        .getByRole("button", { name: "Review existing profile setup", exact: true })
        .click();
      await panel.getByRole("region", { name: "Profile setup preview" }).waitFor();
      const alpha = await create("Alpha");
      await panel.getByRole("button", { name: "Review profile switch", exact: true }).click();
      await page.getByRole("dialog").getByRole("button", { name: "Cancel", exact: true }).click();
      assert.equal(
        await page.evaluate(() => sessionStorage.getItem("realhub.active-local-profile.v1")),
        null,
      );
      checks.push(
        "Read-only counts preview, profile creation and cancelled switch preserve Default",
      );
      await nav("Home");
      await switchTo(alpha);
      assert.equal(
        await page.evaluate(() =>
          window.__p.profileLocalStorage.getItem("reelcase.profile-fixture"),
        ),
        null,
      );
      await seed("AlphaSeed");
      await inspect("AlphaSeed");
      checks.push(
        "Alpha starts empty and persists independent library, private tags, history, follows, draft and print bytes",
      );
      await nav("Settings");
      const beta = await create("Beta");
      await nav("Home");
      await switchTo(beta);
      await seed("BetaSeed");
      await inspect("BetaSeed");
      await page.reload();
      await ready();
      await inspect("BetaSeed");
      checks.push("Beta remains isolated after reload and its export excludes Default and Alpha");
      await switchTo(alpha);
      await inspect("AlphaSeed");
      const renamePanel = page.getByRole('region', { name: 'Local profiles' });
      await renamePanel.getByLabel('Profile to rename', { exact: true }).selectOption(alpha);
      await renamePanel.getByLabel('New profile label', { exact: true }).fill('Alpha renamed');
      await renamePanel.getByRole('button', { name: 'Save profile label', exact: true }).click();
      await page.locator('header').getByRole('button', { name: 'Local profile: Alpha renamed. Open profile controls', exact: true }).waitFor();
      await inspect('AlphaSeed');
      // Keep the original private fixture intact; use a distinct public local
      // record for exercising viewer controls without changing its privacy.
      await page.evaluate(async () => {
        await window.__p.saveFolderVideos('profile-overlay', [{id:'profile-overlay',folderId:'profile-overlay',name:'Overlay identity fixture.mp4',path:'overlay.mp4',extension:'mp4',mime:'video/mp4',size:12,addedAt:1,duration:90}]);
      });
      await page.reload(); await ready();
      await nav('Home');
      await page.getByRole('button', { name: 'Open search', exact: true }).click();
      await page.getByRole('searchbox', { name: 'Global media search', exact: true }).fill('Overlay identity fixture');
      await page.getByRole('searchbox', { name: 'Global media search', exact: true }).press('Enter');
      await page.locator('[data-video-card-id="profile-overlay"]').first().click();
      const preview = page.locator('[data-media-viewer]');
      await preview.getByRole('button', { name: 'Local profile: Alpha renamed. Open profile controls', exact: true }).waitFor();
      await page.screenshot({path:out.replace('.json', mobile ? '-preview-mobile.png' : '-preview-desktop.png')});
      await preview.getByRole('button', { name: 'Watch now', exact: true }).click();
      const playerProfile = page.locator('[data-player-controls]').getByRole('button', { name: 'Local profile: Alpha renamed. Open profile controls', exact: true });
      await playerProfile.waitFor();
      await page.screenshot({path:out.replace('.json', mobile ? '-player-mobile.png' : '-player-desktop.png')});
      assert(await playerProfile.evaluate(button => { const rect=button.getBoundingClientRect(); return rect.width >= 44 && rect.height >= 44 && rect.left >= 0 && rect.right <= innerWidth + 1; }), 'Player profile identity fits the visible viewport');
      await playerProfile.click();
      await preview.waitFor({ state: 'detached' }); await page.getByRole('region',{name:'Accounts',exact:true}).waitFor(); await nav('Settings'); await renamePanel.waitFor();
      await nav('3D prints');
      await page.locator('[data-print-name="Calibration cube.stl"]').getByRole('button', { name: 'View / Edit', exact: true }).click();
      const printViewer = page.getByRole('dialog', { name: 'View Calibration cube.stl', exact: true });
      await printViewer.getByRole('button', { name: 'Local profile: Alpha renamed. Open profile controls', exact: true }).waitFor();
      await page.screenshot({path:out.replace('.json', mobile ? '-print-mobile.png' : '-print-desktop.png')});
      await printViewer.getByRole('button', { name: 'Local profile: Alpha renamed. Open profile controls', exact: true }).click();
      await printViewer.waitFor({ state: 'detached' }); await page.getByRole('region',{name:'Accounts',exact:true}).waitFor(); await nav('Settings'); await renamePanel.waitFor();
      checks.push('Preview, local player and print editor show the active profile; their controls close the viewer and open existing profile settings');
      await renamePanel.getByLabel('New profile label', { exact: true }).fill('Alpha');
      await renamePanel.getByRole('button', { name: 'Save profile label', exact: true }).click();
      await page.locator('header').getByRole('button', { name: 'Local profile: Alpha. Open profile controls', exact: true }).waitFor();
      checks.push('Renaming a populated profile preserves actual catalog, private tags, history, follows, announcement draft, print bytes and ZIP export');
      await switchTo("default");
      await inspect("DefaultSeed");
      checks.push("Round-trip switches preserve both profiles and original Default");
      await nav("Settings");
      const profilePanel = page.getByRole("region", { name: "Local profiles" });
      await profilePanel.getByLabel("New local profile name", { exact: true }).fill("Alpha");
      await profilePanel.getByRole("button", { name: "Create empty profile", exact: true }).click();
      await profilePanel.getByRole("alert").filter({ hasText: "already uses that name" }).waitFor();
      await page.evaluate(() => {
        window.__originalPut = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (value, key) {
          if (this.transaction.db.name === "realhub-local-profiles" && key === "registry")
            throw new DOMException("Controlled profile quota", "QuotaExceededError");
          return window.__originalPut.apply(this, arguments);
        };
      });
      try {
        await profilePanel
          .getByLabel("New local profile name", { exact: true })
          .fill("Quota fixture");
        await profilePanel
          .getByRole("button", { name: "Create empty profile", exact: true })
          .click();
        await profilePanel
          .getByRole("alert")
          .filter({ hasText: "Controlled profile quota" })
          .waitFor();
        assert.equal(
          await profilePanel.getByRole("option", { name: "Quota fixture", exact: true }).count(),
          0,
        );
      } finally {
        await page.evaluate(() => {
          IDBObjectStore.prototype.put = window.__originalPut;
        });
      }
      checks.push(
        "Duplicate name and registry quota failures show errors and retain existing profiles",
      );
      const missing = "p-99999999-9999-4999-8999-999999999999";
      await page.evaluate(
        (id) => sessionStorage.setItem("realhub.active-local-profile.v1", id),
        missing,
      );
      await page.reload();
      await page
        .getByRole("heading", { name: "Local profile needs attention", exact: true })
        .waitFor();
      assert.equal(await page.locator('[data-home-ready="true"]').count(), 0);
      assert.equal(
        await page.evaluate(async (id) =>
          (await indexedDB.databases()).some((db) => db.name === "reelcase.profile." + id),
        ),
        false,
      );
      await page.getByRole("button", { name: "Return to Default profile", exact: true }).click();
      await ready();
      await inspect("DefaultSeed");
      checks.push(
        "Missing selection cannot mount writable library; Return to Default preserves saved data",
      );
      await page.getByRole("region", { name: "Local profiles" }).scrollIntoViewIfNeeded();
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      await page.screenshot({
        path: out.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
    } catch (e) {
      await page
        .screenshot({
          path: out.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
      throw e;
    } finally {
      await context.close();
    }
  }
  await writeFile(out, JSON.stringify({ ok: true, reports }, null, 2));
  console.log(JSON.stringify({ ok: true, reports }));
} catch (e) {
  await writeFile(out, JSON.stringify({ ok: false, reports, error: String(e) }, null, 2));
  throw e;
} finally {
  await browser.close();
}
