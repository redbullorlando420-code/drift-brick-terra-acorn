import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/consent-setup-dev.json", [
    resolve("screenshots"),
  ]);
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
      checks = [],
      errors = [],
      requests = [],
      report = { viewport: viewport.name, checks, errors };
    reports.push(report);
    page.setDefaultTimeout(20000);
    let revision = 0,
      old = false,
      modelJob = null;
    const scopes = {
      "model-transfers": { allowed: false, generation: 0 },
      "provider-session": { allowed: false, generation: 0 },
    };
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/ERR_ABORTED|Failed to load resource.*(400|503)/.test(m.text()))
        errors.push(m.text());
    });
    await context.addInitScript(() => {
      if (!localStorage.getItem("fixture-init")) {
        localStorage.setItem("fixture-init", "true");
        localStorage.setItem("reelcase.pulls-paused.v1", "true");
        localStorage.setItem(
          "reelcase.pull-settings.v1",
          JSON.stringify({ automaticPulls: false }),
        );
        localStorage.setItem(
          "reelcase.sidebar.groups.v1",
          JSON.stringify({ library: true, workspace: true, tools: true }),
        );
      }
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: async () => {} },
      });
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
      requests.push({ path, method: request.method(), input });
      let body = { ok: true };
      if (path === "/health")
        body = {
          ok: true,
          service: "reelcase-companion",
          version: old ? 17 : 18,
          protocol: { major: 1, minor: 0 },
          roots: 2,
          rootAccess: { generation: 1, active: 2 },
          capabilities: ["studio-models", "root-access", ...(!old ? ["capability-consent"] : [])],
        };
      if (path === "/permissions") body = { ok: true, version: 1, revision, scopes };
      if (path === "/permissions/change") {
        assert.equal(input.revision, revision);
        revision++;
        scopes[input.scope] = {
          allowed: input.allowed,
          generation: scopes[input.scope].generation + 1,
        };
        if (input.scope === "model-transfers" && !input.allowed && modelJob)
          modelJob = {
            ...modelJob,
            state: "cancelled",
            note: "Permission revoked. Existing models preserved.",
          };
        body = { ok: true, version: 1, revision, scopes };
      }
      if (path === "/studio/models") body = { ok: true, models: [], job: modelJob };
      if (path === "/studio/models/install") {
        assert(scopes["model-transfers"].allowed);
        modelJob = {
          id: "fixture-transfer",
          state: "running",
          label: "Fixture transfer",
          received: 0,
          total: 100,
          note: "Held test transfer",
        };
        body = { ok: true, job: modelJob };
      }
      if (path === "/studio/models/cancel") {
        modelJob = modelJob ? { ...modelJob, state: "cancelled" } : null;
      }
      if (path === "/studio/status" || path === "/studio/qwen/status")
        body = { ok: true, connected: false, ready: false, models: [] };
      if (path === "/roots/status")
        body = { ok: true, generation: 1, active: 2, pending: 0, persistent: true, roots: [] };
      await route.fulfill({ headers, contentType: "application/json", body: JSON.stringify(body) });
    });
    await context.route("https://x.com/**", (r) =>
      r.fulfill({ contentType: "text/html", body: "<p>Fixture composer only. No post sent.</p>" }),
    );
    const nav = async (p, name) => {
      if (viewport.name === "mobile")
        await p.getByRole("button", { name: "Open menu", exact: true }).click();
      await p
        .getByRole("navigation", { name: "Library navigation" })
        .getByRole("button", { name, exact: true })
        .click();
    };
    const shot = async (name, locator) => {
      await locator.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: output.replace(".json", "-" + name + "-" + viewport.name + ".png"),
      });
    };
    try {
      await page.goto(url);
      await page.locator('[data-home-ready="true"]').waitFor();
      const setup = page.getByRole("region", { name: "Your setup checklist", exact: true });
      await setup.locator("[data-never]").count();
      await page.locator('[data-setup-ready="true"]').waitFor();
      await setup.getByText("No saved titles yet", { exact: true }).waitFor();
      assert(
        await setup.getByRole("button", { name: "Choose local files", exact: true }).isVisible(),
      );
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.setup-checklist.v1")),
        null,
      );
      assert(!requests.some((r) => r.method === "POST"));
      assert(!requests.some((r) => r.path === "/permissions"));
      await setup
        .getByRole("checkbox", { name: "I reviewed this option", exact: true })
        .first()
        .check();
      await setup.getByRole("button", { name: "Dismiss checklist", exact: true }).click();
      await page.reload();
      await page.locator('[data-setup-ready="true"]').waitFor();
      assert(await setup.getByRole("button", { name: "Resume setup", exact: true }).isVisible());
      assert.equal(await setup.getByRole("checkbox").count(), 0);
      await setup.getByRole("button", { name: "Resume setup", exact: true }).click();
      assert(await setup.getByRole("checkbox").first().isChecked());
      await setup.getByRole("button", { name: "Check local Companion", exact: true }).click();
      await setup
        .getByText("Compatible Companion · approved folders available", { exact: true })
        .waitFor();
      assert(!requests.some((r) => r.method === "POST"));
      await shot("setup", setup);
      checks.push(
        "Empty profile gets offline-first choices; review/dismiss/resume persist and neither Home nor explicit readiness checks launch scans, downloads or grants.",
      );
      await nav(page, "Settings");
      const permissions = page.getByRole("region", {
        name: "Optional integration permissions",
        exact: true,
      });
      await permissions.waitFor();
      assert(
        (await permissions
          .getByText("Not checked · Companion v18 required", { exact: true })
          .count()) === 2,
      );
      const model = permissions.locator('[data-native-permission="model-transfers"]');
      await model.getByRole("button", { name: "Check model transfers", exact: true }).click();
      await model.getByText("Not allowed on this Companion", { exact: true }).waitFor();
      await model.getByRole("button", { name: "Allow model transfers", exact: true }).click();
      await model.getByText("Allowed on this Companion", { exact: true }).waitFor();
      assert(!requests.some((r) => r.path === "/studio/models/install"));
      const vision = permissions.locator('[data-browser-permission="local-vision"]');
      await vision.getByRole("button", { name: "Allow local image analysis", exact: true }).click();
      await vision.getByText("Allowed in this browser", { exact: true }).waitFor();
      const sharing = permissions.locator('[data-browser-permission="draft-composer"]');
      await sharing.getByRole("button", { name: "Allow draft composers", exact: true }).click();
      const peer = await context.newPage();
      await peer.goto(url);
      await peer.locator('[data-home-ready="true"]').waitFor();
      await nav(peer, "Settings");
      const peerSharing = peer.locator('[data-browser-permission="draft-composer"]');
      await peerSharing
        .getByRole("button", { name: "Revoke draft composers", exact: true })
        .click();
      await sharing.getByRole("button", { name: "Allow draft composers", exact: true }).waitFor();
      assert(await vision.getByText("Allowed in this browser", { exact: true }).isVisible());
      await peer.close();
      await page.evaluate(() => {
        window.__set = Storage.prototype.setItem;
        Storage.prototype.setItem = function (k, v) {
          if (k === "reelcase.optional-permissions.v1") throw Error("Controlled quota failure");
          return window.__set.call(this, k, v);
        };
      });
      await sharing.getByRole("button", { name: "Allow draft composers", exact: true }).click();
      await sharing.getByRole("alert").filter({ hasText: "could not be saved" }).waitFor();
      await page.evaluate(() => (Storage.prototype.setItem = window.__set));
      await sharing.getByRole("button", { name: "Allow draft composers", exact: true }).click();
      await shot("permissions", permissions);
      checks.push(
        "Native grants require explicit review; browser choices persist, cross-tab revocation updates controls, unrelated permission remains, and failed storage never claims a grant.",
      );
      await nav(page, "Stable Diffusion");
      await page
        .getByRole("button", { name: "Install Qwen 2.1 Turbo bundle", exact: true })
        .click();
      await page.getByText("Held test transfer", { exact: false }).waitFor();
      assert.equal(requests.filter((r) => r.path === "/studio/models/install").length, 1);
      await nav(page, "Settings");
      const model2 = page.locator('[data-native-permission="model-transfers"]');
      await model2.getByRole("button", { name: "Check model transfers", exact: true }).click();
      await model2.getByRole("button", { name: "Revoke model transfers", exact: true }).click();
      assert.equal(modelJob.state, "cancelled");
      assert(
        await page
          .locator('[data-browser-permission="local-vision"]')
          .getByText("Allowed in this browser", { exact: true })
          .isVisible(),
      );
      checks.push(
        "Revoking native model access cancels the held transfer fixture and keeps independent browser permission and library content.",
      );
      await nav(page, "Stream Signal");
      await page.getByLabel("Stream title", { exact: true }).fill("Consent fixture stream");
      await page.getByRole("button", { name: "Generate announcement pack", exact: true }).click();
      await page.getByRole("link", { name: "Compose on X", exact: true }).waitFor();
      await page
        .locator('[data-browser-permission="draft-composer"]')
        .getByRole("button", { name: "Revoke draft composers", exact: true })
        .click();
      let popupCount = 0;
      const onPopup = () => popupCount++;
      page.on("popup", onPopup);
      await page.getByRole("link", { name: "Compose on X", exact: true }).click();
      await page.getByRole("status").filter({ hasText: "Allow draft composers" }).waitFor();
      assert.equal(popupCount, 0);
      await page.getByRole("button", { name: "Copy X", exact: true }).click();
      await page.getByRole("status").filter({ hasText: "draft copied" }).waitFor();
      await page
        .locator('[data-browser-permission="draft-composer"]')
        .getByRole("button", { name: "Allow draft composers", exact: true })
        .click();
      const pop = page.waitForEvent("popup");
      await page.getByRole("link", { name: "Compose on X", exact: true }).click();
      const composer = await pop;
      assert(composer.url().includes("x.com/intent/post"));
      await composer.close();
      page.off("popup", onPopup);
      checks.push(
        "Revoked draft composer opens no popup, Copy still works, explicit grant opens a filled fixture composer without marking published.",
      );
      await page.evaluate(() =>
        localStorage.setItem(
          "reelcase.follows.v1",
          JSON.stringify({
            channels: [
              {
                id: "yt:UC" + "0".repeat(22),
                kind: "youtube",
                channelId: "UC" + "0".repeat(22),
                title: "Saved fixture source",
                lastCheckedAt: Date.now(),
              },
            ],
            savedAt: Date.now(),
          }),
        ),
      );
      await page.evaluate(async()=>{const db=await new Promise((yes,no)=>{const request=indexedDB.open('reelcase');request.onsuccess=()=>yes(request.result);request.onerror=()=>no(request.error);});try{await new Promise((yes,no)=>{const tx=db.transaction('remote-cache','readwrite'),store=tx.objectStore('remote-cache');store.put({folders:[],checkedAt:Date.now()},'meta');store.put({id:'consent-return-video',folderId:'yt:UC'+'0'.repeat(22),name:'Saved fixture video',path:'fixture/video',extension:'yt',mime:'video/youtube',size:0,addedAt:1,duration:100,remote:{kind:'youtube',channelId:'UC'+'0'.repeat(22),channelName:'Saved fixture source',videoId:'BaW_jenozKc'}},'video:consent-return-video');tx.oncomplete=yes;tx.onerror=()=>no(tx.error);});}finally{db.close();}});
      await page.reload();
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.locator('[data-setup-ready="true"]').waitFor();
      assert(await setup.getByRole("button", { name: "Resume setup", exact: true }).isVisible());
      assert.equal(await setup.getByRole("checkbox").count(), 0);
      await setup.getByRole("button",{name:"Resume setup",exact:true}).click();await setup.getByText("Saved titles available",{exact:true}).waitFor();await setup.getByRole("button",{name:"Dismiss checklist",exact:true}).click();
      await nav(page, "Settings");
      old = true;
      await page.waitForTimeout(16000);
      const legacy = page.locator('[data-native-permission="provider-session"]');
      const before = requests.filter((r) => r.path === "/permissions").length;
      await legacy
        .getByRole("button", { name: "Check browser-session access", exact: true })
        .click();
      await legacy.getByRole("alert").filter({ hasText: "v18" }).waitFor();
      assert.equal(requests.filter((r) => r.path === "/permissions").length, before);
      checks.push(
        "Returning populated catalog/source profile stays collapsed; older Companion reports the unsupported permission capability before dispatch.",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      report.ok = true;
    } catch (error) {
      report.ok = false;
      report.error = error.stack;
      await page.screenshot({
        path: output.replace(".json", "-failure-" + viewport.name + ".png"),
      });
      console.error(error.stack);
    } finally {
      await context.unrouteAll({ behavior: "ignoreErrors" });
      await context.close();
    }
  }
} finally {
  await browser.close();
}
const result = {
  ok: reports.every((r) => r.ok),
  reports,
  limitations:
    "Isolated desktop and touch-mobile Chrome profiles; native/provider actions use controlled fixtures. Native revocation is separately checked in copied-service HTTP tests. No real account, download, cookie read or user profile was changed.",
};
await writeFile(output, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.ok ? 0 : 1;
