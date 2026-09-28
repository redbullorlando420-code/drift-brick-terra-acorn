#!/usr/bin/env node
import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ ...(process.platform === "win32" ? { channel: "chrome" } : {}), headless: true, args: ["--no-sandbox"] });
const errors = [];
try {
  for (const viewport of [{ width: 1280, height: 800, name: "desktop" }, { width: 390, height: 844, name: "mobile" }]) {
    const page = await browser.newPage({ viewport });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    if (viewport.name === "mobile") await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("button", { name: "Connection guide" }).click();
    await page.getByRole("heading", { name: "Temporary public address" }).waitFor({ timeout: 5000 }).catch(async (error) => { console.log(viewport.name, (await page.locator("body").innerText()).slice(0, 2200)); throw error; });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    if (viewport.name === "desktop") {
      await page.getByRole("button", { name: "Start trial tunnel" }).click();
      await page.getByText(/Install cloudflared on this computer/).waitFor({ timeout: 8000 });
    }
    await page.screenshot({ path: `screenshots/connection-${viewport.name}.png`, fullPage: true });
    await page.close();
  }
  assert.deepEqual(errors, []);
  const denied = await fetch("http://127.0.0.1:8080/api/quick-tunnel", { headers: { origin: "https://example.trycloudflare.com", "cf-connecting-ip": "203.0.113.1" } });
  assert.equal(denied.status, 403);
  console.log(JSON.stringify({ trialStartWithoutBinary: "install guidance", publicHostControl: "denied", desktop: "rendered", mobile: "rendered without overflow", errors }, null, 2));
} finally { await browser.close(); }
