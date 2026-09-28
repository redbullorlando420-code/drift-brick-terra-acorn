#!/usr/bin/env node
import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ ...(process.platform === "win32" ? { channel: "chrome" } : {}), headless: true });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_000);
  await page.evaluate(async () => {
    const source = await (await fetch("/src/components/library/hub-sections.tsx")).text();
    const moduleUrl = source.match(/from "(\/src\/lib\/videos\/store\.ts(?:\?t=\d+)?)"/)?.[1];
    if (!moduleUrl) throw new Error("Could not find the active library store module");
    const { useLibrary } = await import(/* @vite-ignore */ moduleUrl);
    useLibrary.setState({ videos: [{ id: "qa-hidden-title", folderId: "qa", name: "QA Hidden Title", path: "", extension: "", mime: "video/mp4", size: 0, duration: 120, addedAt: Date.now(), remote: { kind: "youtube", videoId: "example", embedUrl: "https://www.youtube.com/embed/example", watchUrl: "https://www.youtube.com/watch?v=example" } }] });
    useLibrary.getState().setSource("youtube");
  });
  const hide = page.getByRole("button", { name: "Hide QA Hidden Title from your library" });
  await hide.waitFor();
  await hide.click({ force: true });
  await hide.waitFor({ state: "detached" });
  assert.equal(await page.evaluate(async () => {
    const source = await (await fetch("/src/components/library/hub-sections.tsx")).text();
    const moduleUrl = source.match(/from "(\/src\/lib\/videos\/store\.ts(?:\?t=\d+)?)"/)?.[1];
    const { useLibrary, selectYoutube } = await import(/* @vite-ignore */ moduleUrl);
    return Boolean(useLibrary.getState().hiddenVideos["qa-hidden-title"]) && !selectYoutube(useLibrary.getState()).some((video) => video.id === "qa-hidden-title");
  }), true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: "Settings" }).click();
  await page.getByText("Hidden titles · 1").click();
  await page.getByRole("button", { name: "Restore", exact: true }).click();
  await page.getByText("Hidden titles · 0").waitFor();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ hiddenTitleRemovedFromYouTube: true, persistedAcrossReload: true, restoredInSettings: true, errors }, null, 2));
} finally {
  await browser.close();
}
