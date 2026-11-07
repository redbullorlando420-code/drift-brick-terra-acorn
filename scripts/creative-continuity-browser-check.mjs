import assert from "node:assert/strict";
import { writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
import { studioParameterContract } from "../companion/studio-parameter-contract.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/creative-continuity-dev.json", [
    resolve("screenshots"),
  ]),
  browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--enable-unsafe-swiftshader"],
  }),
  reports = [];
const originalFile = await readFile("public/samples/prints/calibration-cube.stl"),
  hash = () => createHash("sha256").update(originalFile).digest("hex");
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
        isMobile: mobile,
        hasTouch: mobile,
        acceptDownloads: true,
      }),
      page = await context.newPage(),
      report = { mobile, checks: [], errors: [] };
    reports.push(report);
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => report.errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) report.errors.push(m.text());
    });
    let generations = 0,
      nativeWrites = 0;
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      if (!localStorage.getItem("reelcase.hub.v1"))
        localStorage.setItem(
          "reelcase.hub.v1",
          JSON.stringify({
            prints: [
              {
                name: "QA cube.stl",
                path: "Original cube",
                sampleSrc: "/samples/prints/calibration-cube.stl",
                size: 2618,
                addedAt: 1,
              },
            ],
          }),
        );
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (window.__creativeQuota && /studio\.recipes|print-edit/.test(k))
          throw new DOMException("Controlled creative storage quota", "QuotaExceededError");
        return set.call(this, k, v);
      };
    });
    await context.route("http://127.0.0.1:43123/**", async (route) => {
      const request = route.request(),
        path = new URL(request.url()).pathname,
        headers = {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
        };
      if (request.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
      const input = request.postData() ? request.postDataJSON() : {};
      let body = { ok: true };
      if (path === "/health")
        body = {
          ok: true,
          service: "reelcase-companion",
          version: 12,
          capabilities: ["studio-models", "print-save-transaction"],
        };
      if (path === "/studio/models") body = { ok: true, models: [], job: null };
      if (path === "/studio/status")
        body = {
          ok: true,
          connected: true,
          ready: true,
          modelPreflight: true,
          models: ["good.safetensors"],
          parameterContract: studioParameterContract("a1111"),
        };
      if (path === "/studio/models/preflight")
        body = {
          ok: true,
          version: 1,
          engine: input.engine,
          name: input.model,
          ready: true,
          family: "sd1",
          role: "checkpoint",
          bytes: 1024,
          checks: [{ label: "Architecture", state: "pass", detail: "Controlled header fixture" }],
          hardware: { weightsGiB: 0.01, note: "Fixture only; generation unverified." },
        };
      if (path.endsWith("/generate")) {
        generations++;
        body = { ok: false, error: "No generation is authorized by this fixture." };
      }
      if (request.method() === "POST" && path.startsWith("/prints/")) nativeWrites++;
      await route.fulfill({ headers, contentType: "application/json", body: JSON.stringify(body) });
    });
    await context.route("**/_serverFn/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        body: '{"result":{"channels":[],"profiles":[]},"context":{}}',
      }),
    );
    const nav = async (name) => {
      if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
      const scope = page.getByRole("navigation", { name: "Library navigation" }),
        group = scope.locator('button[aria-controls$="-workspace"]');
      if ((await group.getAttribute("aria-expanded")) === "false") await group.click();
      await scope.getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") }).click();
    };
    const shot = async (suffix, locator) => {
      await locator.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", (mobile ? "-mobile-" : "-desktop-") + suffix + ".png"),
      });
    };
    const changeRange = async (name, n) => {
      const node = page.getByLabel(name, { exact: true });
      await node.evaluate((el, value) => {
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
        setter.call(el, String(value));
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      }, n);
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Stable Diffusion");
      await page.getByRole("button", { name: "Check local engine", exact: true }).click();
      const source = {
        format: "realhub-studio-recipe",
        version: 2,
        name: "Original migration fixture",
        settings: {
          prompt: "Preserved forest prompt",
          negative: "blur",
          steps: 20,
          seed: 123,
          size: 512,
          model: "good.safetensors",
        },
        checkpoint: "good.safetensors",
        provenance: {
          engine: "a1111",
          width: 512,
          height: 512,
          modelName: "good.safetensors",
          sampler: "DPM++ 2M",
          scheduler: "Karras",
          guidance: 12,
          denoise: 0.7,
        },
      };
      await page
        .getByLabel("Import image recipe file", { exact: true })
        .setInputFiles({
          name: "old-recipe.json",
          mimeType: "application/json",
          buffer: Buffer.from(JSON.stringify(source)),
        });
      const dialog = page.getByRole("dialog", { name: "Review image recipe" });
      await dialog.waitFor();
      assert(
        await dialog
          .getByRole("button", { name: "Load reviewed recipe", exact: true })
          .isDisabled(),
      );
      await dialog
        .getByRole("button", { name: "Review parameter conversion", exact: true })
        .click();
      await dialog
        .getByRole("list", { name: "Recipe parameter conversion changes" })
        .getByText(/Sampler:/)
        .waitFor();
      await dialog
        .getByRole("checkbox", {
          name: "I reviewed the converted parameters and retained original recipe",
          exact: true,
        })
        .check();
      await page.evaluate(() => (window.__creativeQuota = true));
      await dialog
        .getByRole("button", { name: "Save converted recipe revision", exact: true })
        .click();
      await dialog
        .getByRole("alert")
        .filter({ hasText: "Controlled creative storage quota" })
        .waitFor();
      await page.evaluate(() => (window.__creativeQuota = false));
      await dialog
        .getByRole("button", { name: "Save converted recipe revision", exact: true })
        .click();
      await dialog.getByText("Saved schema: a1111-form-v1", { exact: true }).waitFor();
      assert.equal(generations, 0);
      const ack = dialog.getByRole("checkbox", {
        name: "I understand the listed differences and supported parameters",
        exact: true,
      });
      if (await ack.count()) await ack.check();
      await shot(
        "recipe-conversion",
        dialog.getByRole("heading", { name: "Parameter schema conversion" }),
      );
      await dialog.getByRole("button", { name: "Load reviewed recipe", exact: true }).click();
      assert.equal(
        await page.getByLabel("Image prompt", { exact: true }).inputValue(),
        source.settings.prompt,
      );
      assert.equal(generations, 0);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Stable Diffusion");
      await page
        .getByRole("heading", { name: "Original migration fixture", exact: true })
        .waitFor();
      await page
        .getByRole("heading", { name: "Original migration fixture · converted", exact: true })
        .waitFor();
      const recipeRows = await page.evaluate(() => {
        const key = Object.keys(localStorage).find((k) =>
          k.startsWith("reelcase.studio.recipes.v1:"),
        );
        return JSON.parse(localStorage.getItem(key));
      });
      assert.equal(recipeRows.length, 2);
      assert.equal(recipeRows.find((r) => r.name === source.name).provenance.sampler, "DPM++ 2M");
      assert.equal(recipeRows.find((r) => r.conversion).settings.seed, 123);
      report.checks.push(
        "Advertised parameter conversion previews changed values, preserves original prompt/seed/model, creates a separate durable recipe, and rejects quota failure without submitting generation",
      );
      await nav("3D prints");
      await page
        .locator('[data-print-name="QA cube.stl"]')
        .getByRole("button", { name: "View / Edit", exact: true })
        .click();
      await page.locator('[data-print-ready="ready"]').waitFor();
      const comparison = page.locator("[data-print-comparison]");
      await comparison.locator(":scope > summary").click();
      await comparison.getByRole("button", { name: "Review new baseline", exact: true }).click();
      await comparison
        .getByRole("checkbox", { name: "I reviewed this workspace comparison change", exact: true })
        .check();
      await comparison
        .getByRole("button", { name: "Apply reviewed comparison", exact: true })
        .click();
      await changeRange("Scale", 2);
      await comparison
        .getByRole("list", { name: "Print edit differences" })
        .getByText(/scale/)
        .waitFor();
      await page.waitForTimeout(250);
      const before = await page.evaluate(() => localStorage.getItem("reelcase.print-edit.v1"));
      await comparison
        .getByRole("button", { name: "Preview comparison baseline", exact: true })
        .click();
      await comparison.getByText(/Showing the baseline/).waitFor();
      await page.waitForTimeout(250);
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.print-edit.v1")),
        before,
      );
      assert.equal(nativeWrites, 0);
      await comparison.getByRole("button", { name: "Show working model", exact: true }).click();
      await comparison
        .getByRole("button", { name: "Review revert to baseline", exact: true })
        .click();
      await comparison
        .getByRole("checkbox", { name: "I reviewed this workspace comparison change", exact: true })
        .check();
      await page.evaluate(() => (window.__creativeQuota = true));
      await comparison
        .getByRole("button", { name: "Apply reviewed comparison", exact: true })
        .click();
      await comparison
        .getByRole("alert")
        .filter({ hasText: "Controlled creative storage quota" })
        .waitFor();
      assert.equal(await page.getByLabel("Scale", { exact: true }).inputValue(), "2");
      await page.evaluate(() => (window.__creativeQuota = false));
      await comparison
        .getByRole("checkbox", { name: "I reviewed this workspace comparison change", exact: true })
        .check();
      await comparison
        .getByRole("button", { name: "Apply reviewed comparison", exact: true })
        .click();
      assert.equal(await page.getByLabel("Scale", { exact: true }).inputValue(), "1");
      await page.getByRole("button", { name: "Close viewer", exact: true }).click();
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("3D prints");
      await page
        .locator('[data-print-name="QA cube.stl"]')
        .getByRole("button", { name: "View / Edit", exact: true })
        .click();
      await page.locator('[data-print-ready="ready"]').waitFor();
      await comparison.locator(":scope > summary").click();
      await comparison
        .getByRole("button", { name: "Review undo comparison change", exact: true })
        .click();
      await comparison
        .getByRole("checkbox", { name: "I reviewed this workspace comparison change", exact: true })
        .check();
      await comparison
        .getByRole("button", { name: "Apply reviewed comparison", exact: true })
        .click();
      assert.equal(await page.getByLabel("Scale", { exact: true }).inputValue(), "2");
      await shot("print-comparison", comparison);
      assert.equal(nativeWrites, 0);
      await page.getByRole("button", { name: "Close viewer", exact: true }).click();
      assert.equal(
        createHash("sha256")
          .update(await readFile("public/samples/prints/calibration-cube.stl"))
          .digest("hex"),
        hash(),
      );
      report.checks.push(
        "Print numeric/visual comparison preserves the working draft; reviewed revert and undo survive reload, quota failure preserves state, and no native write or source-file mutation occurs",
      );
      await nav("Stream Signal");
      await page.getByRole("tab", { name: "Chat Plays Lab", exact: true }).click();
      const editor = page.locator("[data-conditional-editor]");
      await editor.locator(":scope > summary").click();
      const plan = {
        version: 1,
        steps: [
          { move: "defend", when: {} },
          { move: "attack", when: { guarded: false } },
          { move: "heal", when: {} },
        ],
        maxAgeMs: 30000,
        timeoutMs: 120000,
        onFalse: "stop-sequence",
      };
      await page.getByLabel("Voting window seconds", { exact: true }).fill("120");
      await page.getByRole("button", { name: "Start voting window", exact: true }).click();
      await editor
        .getByLabel("Conditional simulator plan JSON", { exact: true })
        .fill(JSON.stringify(plan, null, 2));
      await editor
        .getByRole("button", { name: "Observe simulator resources", exact: true })
        .click();
      await editor
        .getByRole("button", { name: "Preview conditional sequence", exact: true })
        .click();
      await editor
        .getByRole("button", { name: "Save reviewed simulator plan", exact: true })
        .click();
      await editor
        .getByRole("button", { name: "Preview conditional sequence", exact: true })
        .click();
      await editor
        .getByRole("checkbox", {
          name: "I reviewed the simulated transitions and interruption policy",
          exact: true,
        })
        .check();
      await editor
        .getByRole("button", { name: "Submit reviewed conditional ballot", exact: true })
        .click();
      await page.getByRole("button", { name: "Close window now", exact: true }).click();
      assert.equal(
        await page.getByRole("list", { name: "Pending simulator moves" }).locator("li").count(),
        3,
      );
      await page.getByRole("button", { name: "Execute next move", exact: true }).click();
      await page.getByRole("button", { name: "Execute next move", exact: true }).click();
      await page
        .getByRole("list", { name: "Simulator controller log" })
        .getByText(/Conditional interrupted attack: guard precondition/)
        .waitFor();
      await page
        .getByRole("list", { name: "Pending simulator moves" })
        .getByText("No moves queued.", { exact: true })
        .waitFor();
      await page.getByRole("button", { name: "New message ID", exact: true }).click();
      await page.getByRole("button", { name: "Start voting window", exact: true }).click();
      await page.getByLabel("Simulated command sequence", { exact: true }).fill("attack");
      await page.getByRole("button", { name: "Submit simulated ballot", exact: true }).click();
      await page.getByRole("button", { name: "Close window now", exact: true }).click();
      await page.getByRole("button", { name: "Start voting window", exact: true }).click();
      await page.getByRole("button", { name: "New message ID", exact: true }).click();
      await page.getByRole("button", { name: "Submit simulated ballot", exact: true }).click();
      await page.getByRole("button", { name: "Emergency stop", exact: true }).click();
      await page
        .getByRole("list", { name: "Pending simulator moves" })
        .getByText("No moves queued.", { exact: true })
        .waitFor();
      await page.getByText("0 active ballots", { exact: true }).waitFor();
      assert(
        await page.getByRole("button", { name: "Execute next move", exact: true }).isDisabled(),
      );
      const downloadWait = page.waitForEvent("download");
      await page.getByRole("button", { name: "Export current replay", exact: true }).click();
      const replay = JSON.parse(await readFile(await (await downloadWait).path(), "utf8"));
      assert.equal(replay.version, 2);
      assert(replay.events.some((r) => r.event.type === "plan-ballot"));
      await shot("conditional-plan", editor);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Stream Signal");
      await page.getByRole("tab", { name: "Chat Plays Lab", exact: true }).click();
      await editor.locator(":scope > summary").click();
      assert.deepEqual(
        JSON.parse(
          await editor.getByLabel("Conditional simulator plan JSON", { exact: true }).inputValue(),
        ),
        plan,
      );
      report.checks.push(
        "Conditional plans preview and persist, become whole-sequence ballots, interrupt on a changed guard condition, export battle-v2 replays, and emergency stop clears votes plus queued moves",
      );
      await page.evaluate(async () => {
        const id = "p-12345678-1234-1234-1234-123456789012";
        await new Promise((yes, no) => {
          const r = indexedDB.open("realhub-local-profiles", 1);
          r.onupgradeneeded = () => r.result.createObjectStore("control");
          r.onerror = () => no(r.error);
          r.onsuccess = () => {
            const db = r.result,
              tx = db.transaction("control", "readwrite");
            tx.objectStore("control").put(
              {
                version: 1,
                revision: 1,
                profiles: [{ id, name: "Creative alternate", createdAt: 1 }],
              },
              "registry",
            );
            tx.oncomplete = () => {
              db.close();
              yes();
            };
          };
        });
        sessionStorage.setItem("realhub.active-local-profile.v1", id);
      });
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Stable Diffusion");
      assert.equal(await page.getByRole("heading", { name: source.name, exact: true }).count(), 0);
      await nav("Stream Signal");
      await page.getByRole("tab", { name: "Chat Plays Lab", exact: true }).click();
      await editor.locator(":scope > summary").click();
      assert.equal(
        JSON.parse(
          await editor.getByLabel("Conditional simulator plan JSON", { exact: true }).inputValue(),
        ).steps[1].when.guarded,
        true,
      );
      report.checks.push(
        "A separate local profile cannot read Default recipe conversions or conditional-plan preferences",
      );
      assert.equal(generations, 0);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.deepEqual(report.errors, []);
    } catch (e) {
      report.error = e.stack;
      await page
        .screenshot({
          path: output.replace(".json", mobile ? "-mobile-failure.png" : "-desktop-failure.png"),
        })
        .catch(() => {});
      throw e;
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
              "Disposable profiles and mocked Companion contracts/header responses; no real image generation, native model rewrite, external chat or installed-game control.",
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
