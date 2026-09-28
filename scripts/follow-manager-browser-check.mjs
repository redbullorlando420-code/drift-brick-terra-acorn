#!/usr/bin/env node
import assert from "node:assert/strict";
import { chromium } from "playwright";

const url = process.argv[2] ?? "http://127.0.0.1:8080/";
const browser = await chromium.launch({ ...(process.platform === "win32" ? { channel: "chrome" } : {}), headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
try {
  for (const viewport of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.follows.v1", JSON.stringify({ savedAt: Date.now(), channels: [
        { id: "yt:qa-one", kind: "youtube", handle: "qa-one", title: "QA One" },
        { id: "yt:qa-two", kind: "youtube", handle: "qa-two", title: "QA Two" },
      ] }));
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);
    if (viewport.width === 390) await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: /YouTube/ }).first().click();
    await page.getByRole("heading", { name: "YouTube creator control" }).waitFor({ timeout: 10_000 }).catch(async (error) => {
      console.error((await page.locator("body").innerText()).slice(0, 800));
      throw error;
    });
    await page.getByRole("button", { name: "Select creators" }).click();
    await page.getByRole("button", { name: /Select all 2 matching/ }).click();
    await page.getByRole("button", { name: /Review removal/ }).click();
    const preview = page.getByLabel("Affected creator preview");
    assert.match(await preview.innerText(), /QA One/);
    assert.match(await preview.innerText(), /QA Two/);
    assert.equal(await page.getByRole("button", { name: /Remove 2 reviewed follows/ }).isEnabled(), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
    assert.deepEqual(errors, []);
    await page.screenshot({ path: `screenshots/following-milestone-${viewport.width === 390 ? "mobile" : "desktop"}.png` });
    await page.getByRole("button", { name: "Close removal review" }).click();
    await page.getByRole("textbox", { name: "Collection name" }).fill("QA collection");
    await page.getByRole("button", { name: "Save collection" }).click();
    assert.equal(await page.getByRole("button", { name: /QA collection · 2/ }).count(), 1);
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("reelcase.follow-collections.v1") ?? "[]")[0]?.followIds.length), 2);
    await page.getByRole("button", { name: /Review removal/ }).click();
    await page.getByRole("button", { name: /Remove 2 reviewed follows/ }).click();
    await page.getByText("No creators are followed here yet.", { exact: false }).waitFor();
    assert.deepEqual(errors, []);
    console.log(`${viewport.width}x${viewport.height}: selection, preview, collection save, removal, and layout passed`);
    await context.close();
  }
} finally {
  await browser.close();
}
