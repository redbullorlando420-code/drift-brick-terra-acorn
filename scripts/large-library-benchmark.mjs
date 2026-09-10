#!/usr/bin/env node
/**
 * Repeatable browser budget gate for a populated Reelcase profile.
 * It measures the real hydrated library (including saved provider catalogs),
 * not a synthetic DOM, so shelves and selector work stay accountable.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";

const [url = "http://127.0.0.1:8080/", output = "screenshots/large-library-benchmark.json"] = process.argv.slice(2);
const started = performance.now();
const browser = await chromium.launch({ ...(process.platform === "win32" ? { channel: "chrome" } : {}), headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await page.waitForTimeout(1_200); // allow IndexedDB hydration and the first virtual page
  const beforeScroll = performance.now();
  await page.mouse.wheel(0, 2_400);
  await page.waitForTimeout(250);
  const result = {
    url,
    totalMs: Math.round(performance.now() - started),
    scrollSettleMs: Math.round(performance.now() - beforeScroll),
    bodyTextLength: (await page.locator("body").innerText()).length,
    cardsMounted: await page.locator("[data-video-card]").count(),
    horizontalOverflow: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1),
    consoleErrors: errors,
    recordedAt: new Date().toISOString(),
  };
  const target = resolve(output);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
  if (result.consoleErrors.length || result.horizontalOverflow) process.exitCode = 1;
} finally {
  await browser.close();
}
