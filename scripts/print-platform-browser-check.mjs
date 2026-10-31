import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createHash } from "node:crypto";
import { Group, Mesh, MeshStandardMaterial, Box3 } from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/print-platform-dev.json", [
    resolve("screenshots"),
  ]),
  browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--enable-unsafe-swiftshader"],
  }),
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
      }),
      page = await context.newPage(),
      errors = [],
      checks = [],
      report = { viewport: viewport.name, errors, checks };
    reports.push(report);
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED/.test(m.text())) errors.push(m.text());
    });
    let saves = 0,
      reviews = 0,
      nativeActions = 0,
      folderReads = 0,
      mode = "write-failure",
      stored;
    const receipts = new Map();
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
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
          games: [
            { name: "Local game.lnk", path: "C:\\Approved\\Local game.lnk", size: 0, addedAt: 1 },
            {
              name: "Browser game.url",
              path: "Browser game.url",
              launchUrl: "https://browser-game.invalid/play",
              size: 0,
              addedAt: 2,
            },
          ],
        }),
      );
    });
    await context.addInitScript(() => {
      window.__printDraws = 0;
      for (const prototype of [
        window.WebGLRenderingContext?.prototype,
        window.WebGL2RenderingContext?.prototype,
      ].filter(Boolean))
        for (const name of ["drawArrays", "drawElements"]) {
          const original = prototype[name];
          if (typeof original === "function")
            prototype[name] = function (...args) {
              window.__printDraws++;
              return original.apply(this, args);
            };
        }
    });
    await context.route("https://browser-game.invalid/**", (r) =>
      r.fulfill({ contentType: "text/html", body: "<p>Browser game fixture opened</p>" }),
    );
    await context.route("http://127.0.0.1:43123/**", async (route) => {
      const req = route.request(),
        pathname = new URL(req.url()).pathname,
        headers = {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
          "cache-control": "no-store",
        };
      if (req.method() === "OPTIONS") return route.fulfill({ status: 204, headers });
      let body = { ok: true };
      if (pathname === "/health")
        body = {
          ok: true,
          service: "reelcase-companion",
          version: 17,
          protocol: { major: 1, minor: 0 },
          platform: {
            schema: 1,
            os: "linux",
            pathStyle: "posix",
            windowsDesktop: false,
            note: "Linux: Windows desktop actions are unsupported. Portable file features remain available; native Linux behavior is unverified.",
          },
          capabilities: [
            "platform-contract",
            "print-save-transaction",
            "prints-bridge",
            "file-health",
            "launch",
            "launch-receipts",
            "shortcut-catalog",
            "shortcut-icons",
            "steam-epic-catalog",
            "tray-autostart",
          ],
        };
      else if (pathname === "/prints/save-folders") {
        folderReads++;
        body = { ok: true, folders: ["/srv/approved-models"] };
      } else if (pathname === "/prints/transactions/review") {
        reviews++;
        const input = req.postDataJSON();
        assert.equal(input.name, "cube-reviewed.glb");
        assert.equal(input.dir, "/srv/approved-models");
        assert.match(input.sha256, /^[a-f0-9]{64}$/);
        const receipt = {
          id: "00000000-0000-0000-0000-" + String(reviews).padStart(12, "0"),
          path: "/srv/approved-models/" + input.name,
          name: input.name,
          bytes: input.bytes,
          sha256: input.sha256,
          status: "review",
          at: Date.now(),
          persistent: true,
          detail: "Review this new destination before saving.",
        };
        receipts.set(receipt.id, receipt);
        body = { ok: true, receipt };
      } else if (pathname.endsWith("/commit")) {
        saves++;
        const id = pathname.split("/")[3],
          receipt = receipts.get(id),
          bytes = req.postDataBuffer();
        assert.equal(bytes.length, receipt.bytes);
        assert.equal(createHash("sha256").update(bytes).digest("hex"), receipt.sha256);
        if (mode === "write-failure") {
          receipt.status = "error";
          body = { ok: false, error: "Print save failed. The original is unchanged." };
        } else {
          stored = bytes;
          receipt.status = "done";
          receipt.detail = "Saved a verified new copy. The original is unchanged.";
          body = {
            ok: false,
            error: "The save response was interrupted. Check this save status before retrying.",
          };
        }
      } else if (pathname.endsWith("/cancel")) {
        const receipt = receipts.get(pathname.split("/")[3]);
        receipt.status = "cancelled";
        body = { ok: true, receipt };
      } else if (pathname.startsWith("/prints/transactions/"))
        body = { ok: true, receipt: receipts.get(pathname.split("/")[3]) };
      else if (
        [
          "/launch",
          "/launch-receipts",
          "/shortcuts",
          "/shortcut-icons",
          "/tray/autostart",
          "/games/steam-epic",
        ].includes(pathname)
      ) {
        nativeActions++;
        body = { ok: false, error: "Unexpected unsupported native action" };
      }
      return route.fulfill({
        headers,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });
    const nav = async (name) => {
      if (viewport.name === "mobile")
        await page.getByRole("button", { name: "Open menu", exact: true }).click();
      await page
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name: new RegExp("^" + name + "(?:\\s+\\d+)?$") })
        .click();
    };
    const input = async (name, value) => {
      await page.getByLabel(name, { exact: true }).evaluate((element, value) => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set.call(
          element,
          value,
        );
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
      }, String(value));
    };
    const openOriginal = async () => {
      await page
        .locator('[data-print-name="QA cube.stl"]')
        .getByRole("button", { name: "View / Edit", exact: true })
        .click();
      await page.locator('[data-print-ready="ready"]').waitFor();
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("3D prints");
      await openOriginal();
      const viewer = () => page.getByRole("dialog", { name: "View QA cube.stl", exact: true }),
        panel = () => viewer().getByRole("region", { name: "Save edited print copy" });
      await input("Scale", 1.25);
      await input("Move X", 10);
      await input("Move Y", -5);
      await input("Rotate Y", 45);
      await input("Material color", "#559944");
      await viewer()
        .getByText("Unsaved model changes · draft kept locally", { exact: true })
        .waitFor();
      assert.equal(saves, 0);
      await panel().getByRole("button", { name: "Choose save destination", exact: true }).click();
      await panel().getByLabel("New GLB filename").fill("cube-reviewed.glb");
      assert(
        await panel().getByRole("button", { name: "Review new copy", exact: true }).isDisabled(),
      );
      assert.match(await panel().innerText(), /STL and OBJ do not retain these material edits/);
      assert.equal(saves, 0);
      assert.equal(reviews, 0);
      await panel()
        .getByRole("checkbox", { name: "I reviewed GLB format limits", exact: true })
        .check();
      await panel().getByRole("button", { name: "Review new copy", exact: true }).click();
      await panel().getByRole("button", { name: "Save reviewed copy", exact: true }).waitFor();
      assert.equal(reviews, 1);
      assert.equal(saves, 0);
      await panel().getByRole("button", { name: "Save reviewed copy", exact: true }).click();
      await panel().getByRole("status").filter({ hasText: "Print save failed." }).waitFor();
      await viewer()
        .getByText("Unsaved model changes · draft kept locally", { exact: true })
        .waitFor();
      assert.equal(stored, undefined);
      report.failureScreenshot = output.replace(".json", "-failed-" + viewport.name + ".png");
      await panel().scrollIntoViewIfNeeded();
      await page.screenshot({ path: report.failureScreenshot });
      checks.push(
        "GLB limits and new path require explicit review; write failure leaves the draft unsaved and original untouched.",
      );
      await panel().getByRole("button", { name: "Cancel save review", exact: true }).click();
      mode = "lost-response";
      await panel().getByRole("button", { name: "Review new copy", exact: true }).click();
      await panel().getByRole("button", { name: "Save reviewed copy", exact: true }).click();
      await panel().getByRole("status").filter({ hasText: "response was interrupted" }).waitFor();
      assert.equal(saves, 2);
      await viewer()
        .getByText("Unsaved model changes · draft kept locally", { exact: true })
        .waitFor();
      await page.waitForTimeout(220);
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("3D prints");
      await openOriginal();
      assert.equal(await page.getByLabel("Scale", { exact: true }).inputValue(), "1.25");
      assert.equal(await page.getByLabel("Move Y", { exact: true }).inputValue(), "-5");
      await panel().getByRole("button", { name: "Check pending save", exact: true }).click();
      await viewer()
        .getByText("A copy of these edits was saved · original retained", { exact: true })
        .waitFor();
      assert.equal(saves, 2);
      assert.equal(folderReads, 1);
      report.savedScreenshot = output.replace(".json", "-saved-" + viewport.name + ".png");
      await panel().scrollIntoViewIfNeeded();
      await page.screenshot({ path: report.savedScreenshot });
      checks.push(
        "Interrupted response stays unconfirmed; reload preserves edits and explicit status recovery confirms the copy without reuploading.",
      );
      const sample = await readFile(resolve("public/samples/prints/calibration-cube.stl"));
      const geometry = new STLLoader().parse(
          sample.buffer.slice(sample.byteOffset, sample.byteOffset + sample.byteLength),
        ),
        expected = new Group(),
        mesh = new Mesh(geometry, new MeshStandardMaterial());
      mesh.position.y -= new Box3().setFromObject(mesh).min.y;
      expected.add(mesh);
      expected.scale.setScalar(1.25);
      expected.position.set(10, -5, 0);
      expected.rotation.set(0, 0, Math.PI / 4);
      const reopened = await new GLTFLoader().parseAsync(
          stored.buffer.slice(stored.byteOffset, stored.byteOffset + stored.byteLength),
          "",
        ),
        box = new Box3().setFromObject(reopened.scene),
        bounds = new Box3().setFromObject(expected);
      assert(box.min.distanceTo(bounds.min) < 0.001);
      assert(box.max.distanceTo(bounds.max) < 0.001);
      let color;
      reopened.scene.traverse((node) => {
        if (node.isMesh) color = node.material.color.getHexString();
      });
      assert.equal(color, "559944");
      geometry.dispose();
      mesh.material.dispose();
      await viewer().getByRole("button", { name: "Close viewer", exact: true }).click();
      await page
        .locator('input[type="file"][accept*=".glb"]')
        .setInputFiles({
          name: "cube-reviewed.glb",
          mimeType: "model/gltf-binary",
          buffer: stored,
        });
      await page
        .locator('[data-print-name="cube-reviewed.glb"]')
        .getByRole("button", { name: "View / Edit", exact: true })
        .click();
      await page.locator('[data-print-ready="ready"]').waitFor();
      assert.equal(await page.getByLabel("Scale", { exact: true }).inputValue(), "1");
      assert.equal(await page.getByLabel("Move Y", { exact: true }).inputValue(), "0");
      assert.equal(await page.getByLabel("Material color", { exact: true }).inputValue(), "#559944");
      await input("Material color", "#993355");
      await page.getByRole("button", { name: "Reset transform and camera", exact: true }).click();
      assert.equal(await page.getByLabel("Material color", { exact: true }).inputValue(), "#559944");
      const closeBounds = await page
        .getByRole("button", { name: "Close viewer", exact: true })
        .boundingBox();
      assert(
        closeBounds.x >= 0 &&
          closeBounds.x + closeBounds.width <= viewport.width &&
          closeBounds.height >= 44,
      );
      const canvasBounds = await page.locator('canvas[aria-label^="3D preview"]').boundingBox();
      const beforeOrbit = await page.evaluate(() => window.__printDraws);
      await page.mouse.move(canvasBounds.x + canvasBounds.width / 2, canvasBounds.y + canvasBounds.height / 2);
      await page.mouse.down();
      await page.mouse.move(canvasBounds.x + canvasBounds.width / 2 + 60, canvasBounds.y + canvasBounds.height / 2 + 20, {steps: 8});
      await page.mouse.up();
      await page.waitForTimeout(150);
      assert((await page.evaluate(() => window.__printDraws)) > beforeOrbit, 'orbit interaction must render');
      let lastDraw = -1, settled = 0;
      for (let attempt = 0; attempt < 50 && settled < 2; attempt++) {
        await page.waitForTimeout(100);
        const count = await page.evaluate(() => window.__printDraws);
        settled = count === lastDraw ? settled + 1 : 0;
        lastDraw = count;
      }
      assert(settled >= 2, 'orbit damping should settle');
      const idleDraws = await page.evaluate(() => window.__printDraws);
      await page.waitForTimeout(350);
      assert.equal(
        await page.evaluate(() => window.__printDraws),
        idleDraws,
        "an unchanged viewer must not draw continuously",
      );
      checks.push(
        "Orbit interaction renders, damping settles, unchanged WebGL scenes stop drawing, and the mobile Close control remains on screen.",
      );
      await page.getByRole("button", { name: "Fit model", exact: true }).click();
      report.reopenScreenshot = output.replace(".json", "-reopened-" + viewport.name + ".png");
      await page.screenshot({ path: report.reopenScreenshot });
      await page.getByRole("button", { name: "Close viewer", exact: true }).click();
      checks.push(
        "Actual exported GLB reproduces transformed bounds and edited material; reimport opens with neutral draft transforms instead of applying them twice.",
      );
      await nav("Games");
      const support = page.getByRole("region", { name: "Desktop platform support" });
      await support.getByText(/Linux: Windows desktop actions are unsupported/).waitFor();
      for (const name of [
        "Launch Local game.lnk",
        "Load approved desktop shortcuts",
        "Load Steam / Epic from approved roots",
        "Review launch receipts",
      ])
        assert(await page.getByRole("button", { name, exact: true }).isDisabled(), name);
      assert(
        await page
          .getByRole("button", { name: "Launch Browser game.url", exact: true })
          .isEnabled(),
      );
      assert.equal(nativeActions, 0);
      report.platformScreenshot = output.replace(".json", "-platform-" + viewport.name + ".png");
      await page.screenshot({ path: report.platformScreenshot });
      await page.getByRole("button", { name: "Launch Browser game.url", exact: true }).click();
      await page.getByText("Browser game fixture opened", { exact: true }).waitFor();
      assert.equal(nativeActions, 0);
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      await nav("Mission plan");
      assert(
        await page
          .getByRole("button", { name: "Enable Windows auto-start", exact: true })
          .isDisabled(),
      );
      await page.getByRole("button", { name: "Check Companion setup", exact: true }).click();
      assert(
        await page
          .getByRole("button", { name: "Enable Windows auto-start", exact: true })
          .isDisabled(),
      );
      assert.equal(nativeActions, 0);
      checks.push(
        "A non-Windows Companion disables native game/startup controls even if contradictory capabilities are advertised; browser games still open.",
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
      await page
        .screenshot({ path: output.replace(".json", "-failure-" + viewport.name + ".png") })
        .catch(() => {});
    }
    await context.close();
  }
} finally {
  await browser.close();
  await writeFile(
    output,
    JSON.stringify(
      {
        ok: reports.every((r) => r.ok),
        reports,
        limitations:
          "Isolated browser profiles, real WebGL/export/import and synthetic native responses. No actual engine, desktop program or user model file was modified.",
      },
      null,
      2,
    ),
  );
}
console.log(JSON.stringify({ reports }, null, 2));
if (reports.some((r) => !r.ok)) process.exitCode = 1;
