#!/usr/bin/env node
import assert from "node:assert/strict";
import { chromium } from "playwright";

const origin = process.argv[2] ?? "http://127.0.0.1:8080/";
const browser = await chromium.launch({ ...(process.platform === "win32" ? { channel: "chrome" } : {}), headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-features=WebRtcHideLocalIpsWithMdns"] });
const errors = [];
const rtcTrace = [];
try {
  const hostContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  for (const context of [hostContext, guestContext]) await context.addInitScript(() => { const Original = RTCPeerConnection; window.__pcs = []; window.__copiedText = ""; Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value) => { window.__copiedText = value; } } }); window.RTCPeerConnection = class extends Original { constructor(config) { super(config); window.__pcs.push(this); } }; });
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  for (const [page, role] of [[host, "host"], [guest, "guest"]]) {
    page.on("pageerror", (error) => errors.push(`${role}: ${error.message}`));
    page.on("console", (message) => { if (message.type() === "error") errors.push(`${role}: ${message.text()}`); });
    page.on("request", (request) => { if (request.url().includes("/api/rtc") && request.method() === "POST") { const data = request.postDataJSON(); if (data?.op === "signal") rtcTrace.push(`${role} sent ${data.kind} to ${data.to?.slice(-6)}`); } });
    page.on("response", async (response) => { if (response.url().includes("/api/rtc") && response.request().method() === "GET") { const data = await response.json().catch(() => null); if (data?.signals?.length) rtcTrace.push(`${role} received ${data.signals.map((s) => s.kind).join(",")}`); } });
  }
  await host.goto(origin, { waitUntil: "domcontentloaded" });
  await host.waitForTimeout(1500);
  await host.getByRole("button", { name: "Watch room" }).click();
  await host.getByRole("button", { name: "Copy theater invitation link" }).click();
  const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(new URL(origin).hostname);
  if (loopback) {
    await host.getByText(/localhost works only on this computer/).waitFor();
    assert.equal(await host.evaluate(() => window.__copiedText), "");
    await host.getByRole("button", { name: "Open Connection guide" }).click();
    await host.getByRole("link", { name: /^http:\/\/\d/ }).first().waitFor({ timeout: 10000 });
    await host.getByRole("button", { name: "Watch room" }).click();
  } else {
    await host.getByText("Theater invitation link copied.").waitFor();
    assert.match(await host.evaluate(() => window.__copiedText), new RegExp(`^${new URL(origin).origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/\\?room=RC[A-Z0-9]+&theater=1$`));
  }
  await host.getByRole("button", { name: "Start room" }).click({ timeout: 12000 }).catch(async (error) => { console.log((await host.locator("body").innerText()).slice(-2500)); console.log(errors); throw error; });
  const room = (await host.getByRole("heading", { name: /^Room RC/ }).innerText()).replace(/^Room /, "").trim();
  await guest.goto(new URL(`?room=${room}&theater=1`, origin).href, { waitUntil: "domcontentloaded" });
  await host.getByText(/1\/1 connected/).first().waitFor({ timeout: 30000 }).catch(async (error) => { console.log("HOST", (await host.locator("body").innerText()).slice(0, 1500)); console.log("GUEST", (await guest.locator("body").innerText()).slice(0, 1500)); for (const [page, role] of [[host,"host"],[guest,"guest"]]) console.log(role, await page.evaluate(() => window.__pcs.map((pc) => ({ connection: pc.connectionState, ice: pc.iceConnectionState, gathering: pc.iceGatheringState, signaling: pc.signalingState, local: pc.localDescription?.type, remote: pc.remoteDescription?.type })))); console.log(errors, rtcTrace); throw error; });
  await guest.getByText(/1\/1 connected/).first().waitFor({ timeout: 30000 });
  await host.getByText(/Connection details · 1\/1 connected/).click();
  await host.getByText(/Room reliability · r/).click();
  await host.getByText(/direct path connected/i).waitFor({ timeout: 10000 });
  await host.getByRole("button", { name: "Test chat transport" }).click();
  await host.getByText(/transport confirmed/i).waitFor({ timeout: 10000 });
  await guest.getByRole("textbox", { name: "Room chat message" }).fill("Guest matrix ping");
  await guest.getByRole("button", { name: "Send", exact: true }).click();
  await host.getByText(/Guest matrix ping/).waitFor({ timeout: 10000 });
  let commandAt = Date.now();
  await host.getByRole("button", { name: "Play", exact: true }).click();
  await guest.getByRole("heading", { name: "Playing together" }).waitFor({ timeout: 10000 });
  const playDelayMs = Date.now() - commandAt;
  await guest.getByRole("button", { name: "+15 sec" }).click();
  await host.getByText(/Timeline 0:15/).first().waitFor({ timeout: 10000 });
  commandAt = Date.now();
  await host.getByRole("button", { name: "Pause", exact: true }).click();
  await guest.getByRole("heading", { name: "Paused together" }).waitFor({ timeout: 10000 });
  const pauseDelayMs = Date.now() - commandAt;
  await host.getByText("Local sharing, games & TV").click();
  await guest.getByText("Local sharing, games & TV").click();
  const localFile = "public/samples/tungsten-reel.mp4";
  await host.locator('input[type="file"][accept="video/*"]').first().setInputFiles(localFile);
  assert.equal(await host.getByRole("button", { name: "Send sharing request" }).isDisabled(), true);
  await guest.waitForTimeout(500);
  assert.equal(await guest.getByText(/Guest match requested:/).count(), 0);
  await host.getByRole("checkbox", { name: /I confirm guests have access/ }).check();
  await host.getByRole("button", { name: "Send sharing request" }).click();
  await guest.getByText(/Guest match requested: tungsten-reel.mp4/).waitFor({ timeout: 10000 });
  await guest.locator('input[type="file"][accept="video/*"]').first().setInputFiles(localFile);
  await host.getByText(/Compatibility matrix · 1\/1 guests matched/).waitFor({ timeout: 10000 });
  await host.getByRole("button", { name: "Add to local queue" }).click();
  await guest.getByText("Explore more videos and advanced queue controls").click();
  await guest.getByText("Approved local handoffs").waitFor({ timeout: 10000 });
  await guest.getByRole("button", { name: "Remove", exact: true }).click();
  await host.getByText("Approved local handoffs").waitFor({ state: "detached", timeout: 10000 });
  await host.locator("video").evaluate((media) => { media.pause(); media.currentTime = 3; });
  await host.getByText(/Timeline 0:03/).first().waitFor({ timeout: 10000 });
  await guest.reload({ waitUntil: "domcontentloaded" });
  await guest.getByText(/Timeline 0:03/).first().waitFor({ timeout: 15000 }).catch(async (error) => { console.log("REJOIN HOST", (await host.locator("body").innerText()).slice(0, 3500)); console.log("REJOIN GUEST", (await guest.locator("body").innerText()).slice(0, 3500)); throw error; });
  await host.locator("video").evaluate((media) => { media.pause(); media.currentTime = 5; });
  await host.getByText(/Timeline 0:05/).first().waitFor({ timeout: 10000 });
  await host.getByRole("button", { name: "Resync guests" }).click();
  await guest.getByText(/Timeline 0:05/).first().waitFor({ timeout: 10000 });
  await guest.getByRole("button", { name: "−15 sec" }).click();
  await host.getByText(/Timeline 0:00/).first().waitFor({ timeout: 10000 });
  assert.equal(await guest.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  await host.screenshot({ path: "screenshots/watch-room-host-desktop.png", fullPage: true });
  await guest.screenshot({ path: "screenshots/watch-room-guest-mobile.png", fullPage: true });
  await guest.getByRole("button", { name: "Leave room" }).click();
  await host.getByText(/0\/0 connected/).first().waitFor({ timeout: 10000 });
  console.log(JSON.stringify({ room, mode: "isolated browser contexts", host: "desktop", guest: "mobile", playDelayMs, pauseDelayMs, checks: [loopback ? "localhost invite blocked" : "LAN invitation copied", "WebRTC direct path connected", "pulse ack", "guest chat", "host play", "guest seek", "guest reload reconciles host time", "host resync at current media time", "guest seek to zero", "host pause", "local-file consent gate", "local-file fingerprint match", "local queue add and guest removal", "guest leave", "mobile no overflow"], errors }, null, 2));
  await hostContext.close();
  await guestContext.close();
} finally {
  await browser.close();
}
