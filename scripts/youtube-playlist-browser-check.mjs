#!/usr/bin/env node
import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ ...(process.platform === "win32" ? { channel: "chrome" } : {}), headless: true, args: ["--no-sandbox"] });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.getByRole("textbox", { name: "YouTube channel, playlist, or video" }).first().fill("https://www.youtube.com/playlist?list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj");
  await page.getByRole("button", { name: "Follow", exact: true }).first().click();
  await page.getByText(/YouTube playlist added/).waitFor({ timeout: 45000 });
  await page.getByRole("button", { name: /^YouTube/ }).first().click();
  await page.getByText(/Playlist · Pop Music Playlist/).waitFor({ timeout: 10000 });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ imported: "public YouTube playlist", shelf: "visible", errors }, null, 2));
} finally { await browser.close(); }
