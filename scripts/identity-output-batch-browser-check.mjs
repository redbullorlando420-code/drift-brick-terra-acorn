import assert from "node:assert/strict";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/identity-output-dev.json", [
    resolve("screenshots"),
  ]);
const entry = "\0identity-output-probe";
const bundle = await rolldown({
  input: entry,
  resolve: { alias: { "@": resolve("src") } },
  plugins: [
    {
      name: "isolated-probe",
      resolveId(id) {
        if (id === entry) return entry;
      },
      load(id) {
        if (id === entry)
          return [
            "src/lib/studio-outputs.ts",
            "src/lib/studio-session.ts",
            "src/lib/studio-settings.ts",
            "src/lib/videos/remote-merge.ts",
            "src/lib/videos/catalog-identity.ts",
            "src/lib/multiplayer/room-media.ts",
            "src/lib/videos/persist.ts",
          ]
            .map(
              (file) =>
                "export * from " + JSON.stringify(resolve(file).replaceAll("\\", "/")) + ";",
            )
            .join("\n");
      },
    },
  ],
});
const built = await bundle.generate({ format: "esm" });
await bundle.close();
const code = built.output.find((row) => row.type === "chunk").code;
const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jD5sAAAAASUVORK5CYII=";
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const viewport of [
    { name: "desktop", width: 1440, height: 1000 },
    { name: "mobile", width: 390, height: 844 },
  ]) {
    const context = await browser.newContext({
        viewport,
        isMobile: viewport.name === "mobile",
        hasTouch: viewport.name === "mobile",
        acceptDownloads: true,
      }),
      page = await context.newPage(),
      errors = [],
      checks = [],
      report = { viewport: viewport.name, errors, checks };
    reports.push(report);
    page.setDefaultTimeout(25000);
    let generations = 0;
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/net::ERR_|favicon/.test(m.text())) errors.push(m.text());
    });
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.pull-settings.v1", JSON.stringify({ automaticPulls: false }));
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      window.__urls = new Set();
      const create = URL.createObjectURL.bind(URL),
        revoke = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = (blob) => {
        const url = create(blob);
        window.__urls.add(url);
        return url;
      };
      URL.revokeObjectURL = (url) => {
        window.__urls.delete(url);
        revoke(url);
      };
    });
    await context.route("**/__identity-output-probe.mjs", (route) =>
      route.fulfill({ contentType: "text/javascript", body: code }),
    );
    await context.route("http://127.0.0.1:43123/**", async (route) => {
      const request = route.request(),
        p = new URL(request.url()).pathname,
        headers = {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
        };
      if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
      const input = request.postData() ? request.postDataJSON() : {};
      let body = { ok: true };
      if (p === "/health")
        body = {
          ok: true,
          service: "reelcase-companion",
          version: 19,
          protocol: { major: 1, minor: 0 },
          capabilities: ["studio-models"],
        };
      if (p === "/studio/models") body = { ok: true, models: [], job: null };
      if (p === "/studio/status")
        body = {
          ok: true,
          connected: true,
          ready: true,
          modelPreflight: true,
          busy: false,
          models: ["good.safetensors"],
        };
      if (p === "/studio/models/preflight")
        body = {
          ok: true,
          version: 1,
          engine: "a1111",
          name: input.model,
          ready: true,
          family: "sd1",
          role: "checkpoint",
          bytes: 100,
          checks: [{ label: "Structure", state: "pass", detail: "Fixture model header" }],
          hardware: { weightsGiB: 0, note: "Fixture only" },
        };
      if (p === "/studio/generate") {
        generations++;
        body = { ok: true, image: png, info: JSON.stringify({ seed: 42, sd_model_name: "good" }) };
      }
      await route.fulfill({ headers, contentType: "application/json", body: JSON.stringify(body) });
    });
    const nav = async (name) => {
      if (viewport.name === "mobile")
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    };
    const screenshot = async (name) => {
      await page.screenshot({
        path: output.replace(/\.json$/, "-" + viewport.name + "-" + name + ".png"),
      });
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      report.storage = await page.evaluate(
        async ({ png }) => {
          const m = await import("/__identity-output-probe.mjs");
          window.__probe = m;
          const open = () =>
            new Promise((resolve, reject) => {
              const request = indexedDB.open("milestone76-output-fixtures", 1);
              request.onupgradeneeded = () => request.result.createObjectStore("activity");
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
            });
          const bytes = Uint8Array.from(atob(png), (c) => c.charCodeAt(0)),
            image = {
              id: "fixture:1",
              blob: new Blob([bytes], { type: "image/png" }),
              settings: { ...m.DEFAULT_STUDIO_SETTINGS, prompt: "Storage fixture" },
              seconds: 1,
              seed: 42,
            };
          const repo = m.createStudioOutputs(open, "fixture-owner"),
            other = m.createStudioOutputs(open, "other-owner"),
            assert = (condition, detail) => {
              if (!condition) throw Error(detail);
            };
          await repo.save(image);
          await repo.save(image);
          assert((await repo.list()).length === 1, "duplicate saved image");
          assert((await other.list()).length === 0, "owner isolation");
          const put = IDBObjectStore.prototype.put;
          IDBObjectStore.prototype.put = function (value, key) {
            if (String(key).endsWith(":index"))
              throw new DOMException("Controlled index quota", "QuotaExceededError");
            return put.call(this, value, key);
          };
          let failed = false;
          try {
            await repo.save({ ...image, id: "fixture:quota" });
          } catch {
            failed = true;
          } finally {
            IDBObjectStore.prototype.put = put;
          }
          assert(failed, "quota accepted");
          assert((await repo.list()).length === 1, "quota changed prior images");
          assert(!(await repo.load("fixture:quota")), "orphan PNG after index abort");
          for (let i = 2; i <= 31; i++) await repo.save({ ...image, id: "fixture:" + i });
          const concurrent = m.createStudioOutputs(open, "fixture-owner");
          const finalSaves = await Promise.allSettled([
            repo.save({ ...image, id: "fixture:32" }),
            concurrent.save({ ...image, id: "fixture:33" }),
          ]);
          assert(
            finalSaves.filter((result) => result.status === "fulfilled").length === 1 &&
              (await repo.list()).length === 32,
            "concurrent count budget",
          );
          const db = await open();
          await new Promise((resolve, reject) => {
            const tx = db.transaction("activity", "readwrite");
            tx.objectStore("activity").delete("studio-outputs:v1:fixture-owner:png:fixture:1");
            tx.oncomplete = resolve;
            tx.onabort = () => reject(tx.error);
          });
          db.close();
          assert(
            !(await repo.load("fixture:1")) &&
              (await repo.list()).some((row) => row.id === "fixture:1"),
            "missing PNG lost receipt",
          );
          const budget = m.createStudioOutputs(open, "budget-owner");
          await budget.save(image);
          const db2 = await open();
          await new Promise((resolve, reject) => {
            const tx = db2.transaction("activity", "readwrite"),
              store = tx.objectStore("activity"),
              request = store.get("studio-outputs:v1:budget-owner:index");
            request.onsuccess = () => {
              const row = request.result.rows[0];
              store.put(
                {
                  version: 1,
                  rows: Array.from({ length: 12 }, (_, i) => ({
                    ...row,
                    id: "budget:" + i,
                    bytes: 10 * 1024 ** 2,
                  })),
                },
                "studio-outputs:v1:budget-owner:index",
              );
            };
            tx.oncomplete = resolve;
            tx.onabort = () => reject(tx.error);
          });
          db2.close();
          failed = false;
          try {
            await budget.save({
              ...image,
              id: "over:bytes",
              blob: new Blob([bytes, new Uint8Array(9 * 1024 ** 2)], { type: "image/png" }),
            });
          } catch {
            failed = true;
          }
          assert(failed && (await budget.list()).length === 12, "byte budget exceeded");
          await repo.remove("fixture:2");
          assert((await repo.list()).length === 31, "explicit remove");
          await other.save({ ...image, id: "other:1" });
          assert(
            (await repo.list()).length === 31 && (await other.list()).length === 1,
            "remove crossed owners",
          );
          const future = m.createStudioOutputs(open, "future");
          const db3 = await open();
          await new Promise((resolve, reject) => {
            const tx = db3.transaction("activity", "readwrite");
            tx.objectStore("activity").put(
              { version: 999, rows: [] },
              "studio-outputs:v1:future:index",
            );
            tx.oncomplete = resolve;
            tx.onabort = () => reject(tx.error);
          });
          db3.close();
          failed = false;
          try {
            await future.save(image);
          } catch {
            failed = true;
          }
          assert(failed, "future document overwritten");
          const session = new m.StudioSession(async () => ({ image: png }));
          for (let i = 0; i < 100; i++)
            await session.generate({ ...image.settings, prompt: "Long fixture " + i });
          assert(
            session.getSnapshot().jobs.length === 8 &&
              session.getSnapshot().image.blob.size === bytes.length,
            "preview budget",
          );
          const routes = [
            "https://clips.twitch.tv/OneSlug",
            "https://www.twitch.tv/creator/clip/OneSlug",
            "https://clips.twitch.tv/embed?clip=OneSlug",
          ];
          const rows = routes.map((url, i) => ({
            ...m.roomVideoFromUrl(url),
            id: "import:" + i,
            folderId: "tw:source" + i,
          }));
          let merged = [];
          for (const row of rows) merged = await m.mergeRemoteCatalogAsync(merged, [row]);
          assert(
            merged.length === 1 &&
              merged[0].id === "import:0" &&
              merged[0].remote.sourceIds.length === 3,
            "catalog aliases",
          );
          assert(new Set(rows.map(m.roomMediaKey)).size === 1, "room aliases");
          await m.saveRemoteSnapshot({ videos: merged, folders: [], checkedAt: 0 });
          const restored = await m.loadRemoteSnapshot();
          assert(
            restored.videos.filter((row) => row.id === "import:0").length === 1,
            "durable canonical card",
          );
          return {
            countLimit: 32,
            byteLimit: 128 * 1024 ** 2,
            syntheticBudgetReceipts: true,
            longGenerations: 100,
            previewBytes: bytes.length,
            ownerIsolation: true,
            quotaRollback: true,
            missingReceiptRetained: true,
            twitchSources: merged[0].remote.sourceIds.length,
          };
        },
        { png },
      );
      checks.push(
        "Actual IndexedDB: atomic PNG/index quota rollback, owner isolation, duplicate saves, 32 image limit, synthetic 128 MiB index budget, missing-byte receipt retention, future-version refusal, explicit scoped remove; 100 sequential generation fixture retains one preview; Twitch aliases persist one card and one room key",
      );
      await nav("Stable Diffusion");
      await page.getByLabel("Image prompt", { exact: true }).fill("First saved image");
      await page.getByRole("button", { name: "Check local engine", exact: true }).click();
      await page.getByRole("button", { name: "Use reviewed model", exact: true }).click();
      await page.getByRole("button", { name: "Generate image", exact: true }).click();
      await page.getByRole("heading", { name: "Generated image", exact: true }).waitFor();
      const panel = page.locator("[data-studio-outputs]");
      await panel.getByRole("button", { name: "Save image in app", exact: true }).click();
      await panel.getByRole("button", { name: "Image saved", exact: true }).waitFor();
      await page.getByLabel("Recipe name", { exact: true }).fill("Protected recipe");
      await page.getByRole("button", { name: "Save image recipe", exact: true }).click();
      await panel.getByRole("button", { name: "Preview temporary cleanup", exact: true }).click();
      await panel.getByRole("button", { name: "Cancel image cleanup", exact: true }).click();
      await page.getByRole("heading", { name: "Generated image", exact: true }).waitFor();
      await panel.getByRole("button", { name: "Preview temporary cleanup", exact: true }).click();
      await panel.getByRole("button", { name: "Clear previewed image", exact: true }).click();
      await page.getByRole("heading", { name: "Your next image", exact: true }).waitFor();
      await panel.getByText("Saved images (1)", { exact: true }).click();
      await panel.getByRole("button", { name: "Open saved image", exact: true }).click();
      await panel.getByRole("link", { name: "Download saved PNG", exact: true }).waitFor();
      const downloadPromise = page.waitForEvent("download");
      await panel.getByRole("link", { name: "Download saved PNG", exact: true }).click();
      const download = await downloadPromise;
      await download.saveAs(output.replace(/\.json$/, "-" + viewport.name + "-saved.png"));
      await panel.getByRole("button", { name: "Close saved image", exact: true }).click();
      await page.getByLabel("Image prompt", { exact: true }).fill("Second output after quota");
      await page.getByRole("button", { name: "Generate image", exact: true }).click();
      await page.getByRole("heading", { name: "Generated image", exact: true }).waitFor();
      await page.evaluate(() => {
        window.__put = IDBObjectStore.prototype.put;
        IDBObjectStore.prototype.put = function (value, key) {
          if (String(key).includes("studio-outputs:") && String(key).endsWith(":index"))
            throw new DOMException("Controlled output quota fixture", "QuotaExceededError");
          return window.__put.call(this, value, key);
        };
      });
      await panel.getByRole("button", { name: "Save image in app", exact: true }).click();
      await panel
        .getByRole("alert")
        .filter({ hasText: "Controlled output quota fixture" })
        .waitFor();
      await page.evaluate(() => (IDBObjectStore.prototype.put = window.__put));
      await panel.getByRole("button", { name: "Save image in app", exact: true }).click();
      await panel.getByRole("button", { name: "Image saved", exact: true }).waitFor();
      await panel.getByRole("checkbox").check();
      await panel.scrollIntoViewIfNeeded();
      await screenshot("storage");
      await nav("Home");
      assert.equal(await page.evaluate(() => window.__urls.size), 0);
      await nav("Stable Diffusion");
      await page.getByRole("heading", { name: "Your next image", exact: true }).waitFor();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Stable Diffusion");
      await page
        .locator("[data-studio-outputs]")
        .getByText("Saved images (2)", { exact: true })
        .click();
      await page.getByRole("heading", { name: "Protected recipe", exact: true }).waitFor();
      assert(await page.locator("[data-studio-outputs]").getByRole("checkbox").isChecked());
      assert.equal(generations, 2);
      const rowsUI = page.locator("[data-studio-outputs] li");
      await rowsUI.first().getByRole("button", { name: "Open saved image", exact: true }).click();
      await page
        .locator("[data-studio-outputs]")
        .getByRole("link", { name: "Download saved PNG", exact: true })
        .waitFor();
      await rowsUI
        .first()
        .getByRole("button", { name: "Reuse saved settings", exact: true })
        .click();
      assert.equal(
        await page.getByLabel("Image prompt", { exact: true }).inputValue(),
        "Second output after quota",
      );
      await page.evaluate(async () => {
        const db = await new Promise((resolve, reject) => {
          const r = indexedDB.open("reelcase");
          r.onsuccess = () => resolve(r.result);
          r.onerror = () => reject(r.error);
        });
        await new Promise((resolve, reject) => {
          const tx = db.transaction("activity", "readwrite"),
            store = tx.objectStore("activity"),
            r = store.openCursor();
          r.onsuccess = () => {
            const c = r.result;
            if (!c) return;
            if (String(c.key).startsWith("studio-outputs:") && String(c.key).includes(":png:"))
              c.delete();
            c.continue();
          };
          tx.oncomplete = resolve;
          tx.onabort = () => reject(tx.error);
        });
        db.close();
      });
      await rowsUI.last().getByRole("button", { name: "Open saved image", exact: true }).click();
      await page
        .locator("[data-studio-outputs]")
        .getByRole("alert")
        .filter({ hasText: "Its saved receipt and settings are retained" })
        .waitFor();
      assert.equal(await rowsUI.count(), 2);
      await page.locator("[data-studio-outputs]").scrollIntoViewIfNeeded();
      await screenshot("recovered");
      checks.push(
        "Rendered controls: generate, save PNG+settings, save separate recipe, preview/cancel/confirm cleanup, download saved PNG, quota failure and retry, clear-on-navigation and object URL release, reload without resubmission, reuse settings and missing-byte receipt",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.ok = true;
    } catch (e) {
      report.ok = false;
      report.error = e.stack;
      console.error(e.stack);
      await screenshot("failure");
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
  await writeFile(
    output,
    JSON.stringify({ ok: reports.every((r) => r.ok), url, reports }, null, 2),
  );
}
console.log(JSON.stringify({ ok: reports.every((r) => r.ok), reports }, null, 2));
if (reports.some((r) => !r.ok)) process.exitCode = 1;
