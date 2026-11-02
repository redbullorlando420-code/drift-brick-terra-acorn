import assert from "node:assert/strict";
import { chromium } from "playwright";
import { rolldown } from "rolldown";
import { resolve } from "node:path";
import { writeFile } from "node:fs/promises";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  out = checkedOutputPath(process.argv[3] ?? "screenshots/milestone83-panel-preview.json", [
    resolve("screenshots"),
  ]);
const entry = "\0profile-panel-preview",
  bundle = await rolldown({
    input: entry,
    resolve: { alias: { "@": resolve("src") } },
    plugins: [
      {
        name: "fixture",
        resolveId: (id) => (id === entry ? entry : undefined),
        load: (id) =>
          id === entry
            ? `import React from 'react';import{createRoot}from'react-dom/client';import{LocalProfilesPanel}from ${JSON.stringify(resolve("src/components/library/local-profiles-panel.tsx").replaceAll("\\", "/"))};createRoot(document.getElementById('app')).render(React.createElement(LocalProfilesPanel,{onSwitch:async target=>{window.__requestedProfile=target;}}));`
            : undefined,
      },
    ],
  }),
  built = await bundle.generate({ format: "esm" });
await bundle.close();
const code = built.output.find((o) => o.type === "chunk").code,
  browser = await chromium.launch({ channel: "chrome", headless: true }),
  reports = [];
try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({
        viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 },
      }),
      page = await context.newPage(),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.history.v1", "default fixture history");
      localStorage.setItem("reelcase.private-tags", "default fixture tags");
    });
    await context.route("**/__profile-panel.html", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: '<!doctype html><html><head><title>Profile control preview</title><link rel="stylesheet" href="/src/styles.css?direct"></head><body class="bg-bg text-fg"><main id="app" class="mx-auto max-w-4xl p-4"></main><script type="module" src="/__profile-panel.mjs"></script></body></html>',
      }),
    );
    await context.route("**/__profile-panel.mjs", (r) =>
      r.fulfill({ contentType: "text/javascript", body: code }),
    );
    try {
      await page.goto(new URL("/__profile-panel.html", url).href);
      const panel = page.getByRole("region", { name: "Local profiles" });
      await panel
        .getByRole("button", { name: "Review existing profile setup", exact: true })
        .click();
      await panel.getByRole("region", { name: "Profile setup preview" }).waitFor();
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.history.v1")),
        "default fixture history",
      );
      await panel.getByLabel("New local profile name", { exact: true }).fill("Empty studio");
      await panel.getByRole("button", { name: "Create empty profile", exact: true }).click();
      await panel.getByRole("status").filter({ hasText: "Empty profile created" }).waitFor();
      await panel.getByRole("button", { name: "Review profile switch", exact: true }).click();
      const dialog = page.getByRole("dialog", { name: "Switch local profile?" });
      await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
      assert.equal(await page.evaluate(() => window.__requestedProfile), undefined);
      await panel.getByRole("button", { name: "Review profile switch", exact: true }).click();
      await dialog.getByRole("button", { name: "Save and switch profile", exact: true }).click();
      await page.waitForFunction(() => !!window.__requestedProfile);
      assert.equal(
        await page.evaluate(() => localStorage.getItem("reelcase.private-tags")),
        "default fixture tags",
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
        false,
      );
      assert.deepEqual(errors, []);
      await page.screenshot({
        path: out.replace(".json", mobile ? "-mobile.png" : "-desktop.png"),
      });
      reports.push({
        mobile,
        ok: true,
        checks: [
          "Counts-only preview leaves Default unchanged",
          "Empty profile metadata creation",
          "Consequence preview cancellation",
          "Confirmation calls the injected switch handler",
          "No overflow or uncaught errors",
        ],
      });
    } finally {
      await context.close();
    }
  }
  await writeFile(
    out,
    JSON.stringify(
      {
        ok: true,
        reports,
        limitation:
          "Isolated preview of the new panel only. Switch handler is a test callback; blocked application migration remains unapplied.",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ ok: true, reports }));
} finally {
  await browser.close();
}
