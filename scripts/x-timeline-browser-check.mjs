#!/usr/bin/env node
import assert from "node:assert/strict";
import { chromium } from "playwright";

const origin = process.argv[2] ?? "http://127.0.0.1:8080/";
const browser = await chromium.launch({ ...(process.platform === "win32" ? { channel: "chrome" } : {}), headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  for (const [mode, viewport] of [["loaded", { width: 1280, height: 800 }], ["blocked", { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport });
    await context.addInitScript((blocked) => {
      localStorage.setItem("reelcase.x-accounts", JSON.stringify(["zomblerz69"]));
      localStorage.setItem("reelcase.x-active", "zomblerz69");
      localStorage.setItem("reelcase.x-adult-seeded", "1");
      window.__allowEmbed = !blocked;
      window.twttr = { widgets: { load: () => {}, createTimeline: async (_source, element) => {
        if (!window.__allowEmbed) throw new Error("Embed unavailable");
        const frame = document.createElement("iframe");
        element.append(frame);
        await new Promise((resolve) => setTimeout(resolve, 100));
        frame.srcdoc = "<p>Public posts loaded</p>";
        return frame;
      } } };
    }, mode === "blocked");
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(origin, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    if (mode === "blocked") await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "X accounts" }).click();
    await page.getByRole("heading", { name: "@zomblerz69" }).waitFor({ timeout: 10000 });
    if (mode === "loaded") {
      await page.getByText("X embed loaded.", { exact: false }).waitFor({ timeout: 10000 }).catch(async (error) => { console.log((await page.locator("body").innerText()).slice(-1800), errors); throw error; });
      assert.equal(await page.getByText("Public-reader fallback").count(), 0);
      await page.getByText(/Embed last loaded/).waitFor();
    } else {
      await page.getByText("Public-reader fallback").waitFor({ timeout: 10000 });
      assert.equal(await page.getByRole("link", { name: "Open official view" }).getAttribute("href"), "https://x.com/zomblerz69");
      await page.screenshot({ path: "screenshots/x-timeline-blocked.png", fullPage: true });
      await page.evaluate(() => { window.__allowEmbed = true; });
      await page.getByRole("button", { name: "Retry" }).click();
      await page.getByText("X embed loaded.", { exact: false }).waitFor({ timeout: 10000 });
      assert.equal(await page.getByText("Public-reader fallback").count(), 0);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    assert.deepEqual(errors, []);
    if (mode === "loaded") await page.screenshot({ path: "screenshots/x-timeline-loaded.png", fullPage: true });
    console.log(`${mode}: X reader status, retry, and responsive layout passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
