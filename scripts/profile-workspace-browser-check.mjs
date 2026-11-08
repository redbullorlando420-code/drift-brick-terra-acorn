import assert from "node:assert/strict";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";

const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/profile-workspace-dev.json", [
  resolve("screenshots"),
]);
const entry = "\0profile-workspace-fixture";
const bundle = await rolldown({
  input: entry,
  resolve: { alias: { "@": resolve("src") } },
  plugins: [
    {
      name: "profile-fixture",
      resolveId: (id) => (id === entry ? id : undefined),
      load: (id) =>
        id === entry
          ? ["src/lib/videos/persist.ts", "src/lib/local-profiles.ts", "src/lib/prints-blobs.ts"]
              .map((p) => "export * from " + JSON.stringify(resolve(p).replaceAll("\\", "/")) + ";")
              .join("\n")
          : undefined,
    },
  ],
});
const code = (await bundle.generate({ format: "esm" })).output.find(
  (row) => row.type === "chunk",
).code;
await bundle.close();
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-swiftshader"],
});
const reports = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      isMobile: mobile,
      hasTouch: mobile,
    });
    const page = await context.newPage(),
      report = { mobile, checks: [], errors: [] };
    reports.push(report);
    page.setDefaultTimeout(20000);
    page.on("pageerror", (e) => report.errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/net::ERR_ABORTED/.test(m.text())) report.errors.push(m.text());
    });
    await context.addInitScript(() => {
      const selected = sessionStorage.getItem("realhub.active-local-profile.v1") ?? "default";
      const prefix = selected === "default" ? "" : "realhub.profile.v1:" + selected + ":";
      for (const [key, value] of Object.entries({
        "reelcase.pulls-paused.v1": "true",
        "reelcase.pull-settings.v1": JSON.stringify({ automaticPulls: false }),
        "reelcase.sidebar.groups.v1": JSON.stringify({
          library: true,
          workspace: true,
          tools: true,
        }),
      }))
        localStorage.setItem(prefix + key, value);
      window.__permissionRequests = [];
      const proto = FileSystemDirectoryHandle.prototype;
      const query = proto.queryPermission,
        request = proto.requestPermission;
      Object.defineProperty(proto, "queryPermission", {
        configurable: true,
        value: function (options) {
          if (this.name.startsWith("profile-fixture-")) return Promise.resolve("denied");
          return query?.call(this, options) ?? Promise.resolve("granted");
        },
      });
      Object.defineProperty(proto, "requestPermission", {
        configurable: true,
        value: function (options) {
          if (this.name.startsWith("profile-fixture-")) {
            window.__permissionRequests.push(options.mode);
            return Promise.resolve("denied");
          }
          return request?.call(this, options) ?? Promise.resolve("denied");
        },
      });
      const put = IDBObjectStore.prototype.put,
        set = Storage.prototype.setItem;
      IDBObjectStore.prototype.put = function (value, key) {
        if (
          window.__failDraft &&
          typeof key === "string" &&
          key.startsWith("stream-signal:") &&
          key.endsWith(":profile")
        )
          throw Error("Fixture announcement write failure");
        return arguments.length === 1 ? put.call(this, value) : put.call(this, value, key);
      };
      Storage.prototype.setItem = function (key, value) {
        if (window.__failDraft && key.includes("stream-signal") && key.includes(":pending:"))
          throw Error("Fixture recovery mirror failure");
        return set.call(this, key, value);
      };
    });
    await context.route("**/__profile-workspace-fixture.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("**/__profile-workspace-blank.html", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: "<!doctype html><title>Disposable fixture</title>",
      }),
    );
    let releasePrint,
      receipt,
      commits = 0;
    await context.route("http://127.0.0.1:43123/**", async (route) => {
      const request = route.request(),
        path = new URL(request.url()).pathname;
      const headers = {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "content-type",
      };
      if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
      let body = { ok: true };
      if (path === "/health")
        body = {
          ok: true,
          service: "reelcase-companion",
          version: 20,
          platform: {
            schema: 1,
            os: "linux",
            pathStyle: "posix",
            windowsDesktop: false,
            note: "Disposable fixture.",
          },
          capabilities: ["platform-contract", "print-save-transaction", "prints-bridge"],
          protocol: { major: 1, minor: 0 },
        };
      if (path === "/prints/save-folders") body = { ok: true, folders: ["/disposable-models"] };
      if (path === "/prints/transactions/review") {
        const input = request.postDataJSON();
        receipt = {
          id: "00000000-0000-0000-0000-000000000103",
          path: "/disposable-models/" + input.name,
          name: input.name,
          bytes: input.bytes,
          sha256: input.sha256,
          status: "review",
          at: Date.now(),
          persistent: true,
          detail: "Reviewed fixture.",
        };
        body = { ok: true, receipt };
      }
      if (path.endsWith("/commit")) {
        commits++;
        await new Promise((resolve) => {
          releasePrint = resolve;
        });
        receipt = { ...receipt, status: "done", detail: "Fixture print save complete." };
        body = { ok: true, receipt };
      }
      return route.fulfill({
        headers,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });
    const blank = new URL("/__profile-workspace-blank.html", url).href;
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    };
    const ready = () => page.locator('[data-home-ready="true"]').waitFor();
    const capture = async (name) =>
      page.screenshot({
        path: output.replace(
          /\.json$/,
          "-" + (mobile ? "mobile" : "desktop") + "-" + name + ".png",
        ),
      });
    const openSwitch = async (name) => {
      await page
        .getByRole("article", { name: "Account " + name, exact: true })
        .getByRole("button", { name: "Use account", exact: true })
        .click();
      const dialog = page.getByRole("dialog", { name: "Switch to " + name + "?", exact: true });
      await dialog.waitFor();
      return dialog;
    };
    const seed = async (label) =>
      page.evaluate(async (label) => {
        const p = await import("/__profile-workspace-fixture.mjs");
        const root = await navigator.storage.getDirectory(),
          handle = await root.getDirectoryHandle("profile-fixture-" + label, { create: true });
        await p.saveDirHandle({ id: "folder:fixture:shared", name: label + " folder", handle });
        await p.saveFolderVideos("folder:fixture:shared", [
          {
            id: "secret-title-" + label,
            folderId: "folder:fixture:shared",
            name: label + " private title.mp4",
            path: "private.mp4",
            extension: "mp4",
            mime: "video/mp4",
            size: 10,
            addedAt: 1,
          },
        ]);
        await p.savePrintBlob(
          new File([new Uint8Array(label === "Default" ? 2048 : 5120)], label + ".stl"),
          "budget-print",
        );
        const bound = sessionStorage.getItem("realhub.active-local-profile.v1") ?? "default",
          dbName = bound === "default" ? "reelcase" : "reelcase.profile." + bound;
        const db = await new Promise((resolve, reject) => {
          const r = indexedDB.open(dbName);
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        });
        await new Promise((resolve, reject) => {
          const tx = db.transaction("thumb-cache", "readwrite");
          tx.objectStore("thumb-cache").put({
            id: "private-artwork-" + label,
            thumb: new Blob([new Uint8Array(label === "Default" ? 1024 : 3072)], {
              type: "image/png",
            }),
            at: 1,
          });
          tx.oncomplete = resolve;
          tx.onabort = () => reject(tx.error);
        });
        db.close();
      }, label);
    try {
      await page.goto(blank);
      await seed("Default");
      const beta = await page.evaluate(
        async () =>
          (
            await (
              await import("/__profile-workspace-fixture.mjs")
            ).createLocalProfile("Budget Beta")
          ).id,
      );
      const empty = await page.evaluate(
        async () =>
          (
            await (
              await import("/__profile-workspace-fixture.mjs")
            ).createLocalProfile("Budget Empty")
          ).id,
      );
      await page.evaluate(
        (id) => sessionStorage.setItem("realhub.active-local-profile.v1", id),
        beta,
      );
      await page.reload();
      await seed("Beta");
      await page.evaluate(() => sessionStorage.removeItem("realhub.active-local-profile.v1"));
      await page.goto(url);
      await ready();
      await nav("Accounts");
      await page.getByRole("button", { name: "Storage by profile", exact: true }).click();
      const budget = page.getByRole("region", { name: "Profile storage budget" });
      const select = budget.getByLabel("Profile to measure"),
        measure = budget.getByRole("button", { name: "Measure selected profile" });
      await measure.click();
      await budget.getByText("1 records · 2.0 KiB", { exact: true }).waitFor();
      await select.selectOption(beta);
      await measure.click();
      await budget.getByText("1 records · 5.0 KiB", { exact: true }).waitFor();
      await budget.getByText("1 records · 3.0 KiB", { exact: true }).waitFor();
      assert(!/private title|private-artwork|Beta folder/.test(await budget.innerText()));
      assert.equal(
        await budget.getByRole("button", { name: "Review current profile cleanup" }).count(),
        0,
      );
      await capture("storage");
      await select.selectOption(empty);
      await measure.click();
      await budget.getByText("0 records · 0 B", { exact: true }).first().waitFor();
      assert(
        !(await page.evaluate(() => indexedDB.databases())).some((db) => db.name.includes(empty)),
      );
      await page.evaluate(() => {
        Object.defineProperty(navigator.storage, "estimate", {
          configurable: true,
          value: undefined,
        });
      });
      await select.selectOption(beta);
      await measure.click();
      await budget.getByText(/Whole site estimate: Unavailable used · Unavailable quota/).waitFor();
      assert.equal(await select.inputValue(), beta);
      report.checks.push(
        "Storage compares exact profile namespaces, never opens missing databases or displays private values, and labels missing quota evidence.",
      );

      await page.getByRole("button", { name: "Profile permissions", exact: true }).click();
      const inventory = page.getByRole("region", { name: "Profile permission inventory" });
      const defaultFolder = inventory.getByRole("listitem").filter({ hasText: "Default folder" });
      await defaultFolder.getByText("Permission needed · denied", { exact: true }).waitFor();
      assert.equal(await inventory.getByText("Beta folder", { exact: true }).count(), 0);
      assert.deepEqual(await page.evaluate(() => window.__permissionRequests), []);
      await defaultFolder.getByRole("button", { name: "Renew read access" }).click();
      await inventory.getByText(/Permission was not granted/).waitFor();
      assert.deepEqual(await page.evaluate(() => window.__permissionRequests), ["read"]);
      await inventory.getByRole("button", { name: "Allow draft composers" }).click();
      await defaultFolder.getByRole("button", { name: "Forget folder access" }).click();
      const forget = page.getByRole("dialog", { name: "Forget access to Default folder?" });
      await forget.getByRole("button", { name: "Cancel" }).click();
      await defaultFolder.getByText("Permission needed · denied", { exact: true }).waitFor();
      await defaultFolder.getByRole("button", { name: "Forget folder access" }).click();
      await forget.getByRole("button", { name: "Forget saved access" }).click();
      await defaultFolder.getByText("Folder access forgotten", { exact: true }).waitFor();
      const record = await page.evaluate(async () => {
        const db = await new Promise((resolve, reject) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        });
        const get = (store, key) =>
          new Promise((resolve) => {
            const r = db.transaction(store).objectStore(store).get(key);
            r.onsuccess = () => resolve(r.result);
          });
        const [dir, video] = await Promise.all([
          get("dirs", "folder:fixture:shared"),
          get("videos", "secret-title-Default"),
        ]);
        db.close();
        return { forgotten: dir.forgotten, hasHandle: "handle" in dir, hasVideo: !!video };
      });
      assert.deepEqual(record, { forgotten: true, hasHandle: false, hasVideo: true });
      await capture("permissions");
      report.checks.push(
        "Denial is read-only, cancel leaves the grant, explicit forget removes only the active profile's handle, and optional browser consent remains profile scoped.",
      );

      await nav("Stable Diffusion");
      await page.getByLabel("Image prompt",{exact:true}).fill("Prompt retained in Default");
      await page.getByLabel("Recipe name",{exact:true}).fill("Recipe name retained in Default");
      await nav("3D prints");
      await page
        .getByLabel(/Add print files/)
        .setInputFiles({
          name: "Switch cube.stl",
          mimeType: "model/stl",
          buffer: await readFile("public/samples/prints/calibration-cube.stl"),
        });
      await page
        .locator('[data-print-name="Switch cube.stl"]')
        .getByRole("button", { name: "View / Edit", exact: true })
        .click();
      const viewer = page.getByRole("dialog", { name: "View Switch cube.stl", exact: true });
      await viewer
        .locator('[data-print-ready="ready"]')
        .or(page.locator('[data-print-ready="ready"]'))
        .first()
        .waitFor();
      const save = viewer.getByRole("region", { name: "Save edited print copy" });
      await save.getByRole("button", { name: "Choose save destination", exact: true }).click();
      await save
        .getByRole("checkbox", { name: "I reviewed GLB format limits", exact: true })
        .check();
      await save.getByRole("button", { name: "Review new copy", exact: true }).click();
      await save.getByRole("button", { name: "Save reviewed copy", exact: true }).click();
      for (let i = 0; i < 100 && !releasePrint; i++)
        await new Promise((resolve) => setTimeout(resolve, 25));
      assert.equal(commits, 1);
      await viewer.getByRole("button", { name: "Close viewer", exact: true }).click();
      await nav("Stream Signal");
      const title = page.getByLabel("Stream title", { exact: true });
      await title.waitFor();
      await page.evaluate(() => {
        window.__failDraft = true;
      });
      await title.fill("Draft retained in Default");
      await page.getByText(/Could not save Stream Signal/).waitFor();
      await nav("Accounts");
      const dialog = await openSwitch("Budget Beta");
      const pending = dialog.getByRole("region", { name: "Pending profile work" });
      await pending.getByText("Print copy save:", { exact: true }).waitFor();
      await pending.getByText("Stream Signal drafts:", { exact: true }).waitFor();
      const confirm = dialog.getByRole("button", { name: "Save and switch account", exact: true });
      await confirm.click();
      await dialog.getByRole("alert").filter({ hasText: "Print copy save" }).waitFor();
      assert.equal(
        await page.evaluate(() => sessionStorage.getItem("realhub.active-local-profile.v1")),
        null,
      );
      await capture("switch");
      releasePrint();
      await pending.getByText("Print copy save:", { exact: true }).waitFor({ state: "detached" });
      await confirm.click();
      await dialog
        .getByRole("alert")
        .filter({ hasText: "Stream Signal drafts could not be saved" })
        .waitFor();
      await page.evaluate(() => {
        window.__failDraft = false;
      });
      await confirm.click();
      await page.waitForFunction(
        (id) => sessionStorage.getItem("realhub.active-local-profile.v1") === id,
        beta,
      );
      await ready();
      assert.equal(commits, 1);
      await nav("Accounts");
      await page.getByRole("button", { name: "Profile permissions", exact: true }).click();
      const betaInventory = page.getByRole("region", { name: "Profile permission inventory" });
      await betaInventory.getByText("Beta folder", { exact: true }).waitFor();
      assert.equal(await betaInventory.getByText("Default folder", { exact: true }).count(), 0);
      assert(
        await betaInventory.getByRole("button", { name: "Allow draft composers" }).isVisible(),
      );
      const back = await openSwitch("Default");
      await back.getByRole("button", { name: "Save and switch account", exact: true }).click();
      await page.waitForFunction(
        () => sessionStorage.getItem("realhub.active-local-profile.v1") === "default",
      );
      await ready();
      await nav("Stream Signal");
      await page.waitForFunction(
        () =>
          document.querySelector('[aria-label="Stream title"]')?.value ===
          "Draft retained in Default",
      );
      await nav("Stable Diffusion");
      assert.equal(await page.getByLabel("Image prompt",{exact:true}).inputValue(),"Prompt retained in Default");
      assert.equal(await page.getByLabel("Recipe name",{exact:true}).inputValue(),"Recipe name retained in Default");
      report.checks.push(
        "A held print save and unsaved announcement are named; failed checks keep Default, retry does not resubmit the print, and the announcement, prompt and recipe-name draft remain after switching back.",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(report.errors, []);
      report.ok = true;
    } catch (error) {
      report.error = error.stack;
      console.error(error.stack);
      await capture("failure").catch(() => {});
    } finally {
      releasePrint?.();
      await context.unrouteAll({ behavior: "ignoreErrors" });
      await context.close();
      await writeFile(output, JSON.stringify({ ok: reports.every((r) => r.ok), reports }, null, 2));
    }
  }
} finally {
  await browser.close();
}
const verdict = { ok: reports.every((r) => r.ok), reports };
console.log(JSON.stringify(verdict, null, 2));
process.exitCode = verdict.ok ? 0 : 1;
