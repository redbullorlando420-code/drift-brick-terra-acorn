#!/usr/bin/env node
import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ ...(process.platform === "win32" ? { channel: "chrome" } : {}), headless: true, args: ["--no-sandbox"] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.route("https://player.twitch.tv/js/embed/v1.js", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    window.__twitchCalls = { play: 0, pause: 0, seek: [] };
    window.Twitch = { Player: class {
      static READY = "ready"; static PLAY = "play"; static PAUSE = "pause"; static SEEK = "seek"; static PLAYING = "playing";
      constructor() { window.__twitchPlayer = this; this.listeners = {}; this.position = 1; this.playing = false; setTimeout(() => this.emit("ready"), 20); }
      addEventListener(name, handler) { (this.listeners[name] ??= []).push(handler); }
      emit(name) { for (const handler of this.listeners[name] ?? []) handler(); }
      getCurrentTime() { return this.position + (this.playing ? (Date.now() - this.started) / 1000 : 0); }
      getDuration() { return 40; }
      setMuted() {}
      play() { window.__twitchCalls.play++; if (!this.playing) { this.started = Date.now(); this.playing = true; this.emit("play"); this.emit("playing"); } }
      pause() { window.__twitchCalls.pause++; if (this.playing) { this.position = this.getCurrentTime(); this.playing = false; this.emit("pause"); } }
      seek(seconds) { window.__twitchCalls.seek.push(seconds); this.position = seconds; this.started = Date.now(); this.emit("seek"); }
    } };
  });
  await page.goto("http://127.0.0.1:8080/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1_000);
  const seedProviders = async () => page.evaluate(async () => {
    const source = await (await fetch("/src/components/library/hub-sections.tsx")).text();
    const moduleUrl = source.match(/from "(\/src\/lib\/videos\/store\.ts(?:\?t=\d+)?)"/)?.[1];
    if (!moduleUrl) throw new Error("Could not find the active library store module");
    const { useLibrary } = await import(/* @vite-ignore */ moduleUrl);
    const youtube = Array.from({ length: 35 }, (_, index) => ({ id: `qa-youtube-${index}`, folderId: "qa", name: `QA YouTube ${index}`, path: "", extension: "", mime: "video/mp4", size: 0, duration: 120, addedAt: Date.now(), remote: { kind: "youtube", videoId: `test${index}`, embedUrl: `https://www.youtube.com/embed/test${index}`, watchUrl: `https://www.youtube.com/watch?v=test${index}` } }));
    const twitch = { id: "qa-twitch", folderId: "qa", name: "QA Twitch VOD", path: "", extension: "", mime: "video/mp4", size: 0, duration: 40, addedAt: Date.now(), remote: { kind: "twitch", videoId: "1234", embedUrl: "https://player.twitch.tv/?video=v1234", watchUrl: "https://www.twitch.tv/videos/1234" } };
    const clip = { id: "qa-twitch-clip", folderId: "qa", name: "QA Twitch Clip", path: "", extension: "clip", mime: "video/mp4", size: 0, duration: 20, addedAt: Date.now(), remote: { kind: "twitch", videoId: "ClipSlug", embedUrl: "https://clips.twitch.tv/embed?clip=ClipSlug", watchUrl: "https://www.twitch.tv/example/clip/ClipSlug" } };
    useLibrary.setState({ videos: [twitch, clip, ...youtube] });
  });
  await page.getByRole("button", { name: "Watch room" }).click();
  await page.getByRole("button", { name: "Start room" }).click();
  await seedProviders();
  await page.getByText("Explore more videos and advanced queue controls").click();
  await page.getByRole("heading", { name: "More from YouTube" }).waitFor({ timeout: 10000 });
  assert.equal(await page.getByRole("region", { name: "YouTube recommendations" }).locator("button").count(), 25);
  await page.getByRole("button", { name: "Show 24 more YouTube videos" }).click();
  assert.equal(await page.getByRole("region", { name: "YouTube recommendations" }).locator("button").count(), 35);
  await page.getByRole("button", { name: /QA Twitch VOD/ }).first().click();
  if (await page.getByRole("button", { name: "Play now" }).count()) await page.getByRole("button", { name: "Play now" }).first().click();
  await page.getByRole("button", { name: "Favorite", exact: true }).click();
  await page.getByRole("button", { name: "Favorited", exact: true }).waitFor();
  await page.getByRole("button", { name: "Rate QA Twitch VOD 1 stars" }).click();
  assert.equal(await page.getByRole("button", { name: "Rate QA Twitch VOD 1 stars" }).getAttribute("aria-pressed"), "true");
  await page.getByRole("textbox", { name: "Search room videos" }).fill("QA YouTube 34");
  await page.getByRole("button", { name: "Queue", exact: true }).first().click();
  await page.getByText("QA YouTube 34").first().waitFor();
  await page.getByText(/Twitch player ready/).waitFor({ timeout: 10000 }).catch(async (error) => { console.log((await page.locator("body").innerText()).slice(0, 4500)); console.log(errors); throw error; });
  await page.getByRole("button", { name: "Play", exact: true }).first().click();
  await page.waitForTimeout(2_300);
  assert.equal(await page.evaluate(() => window.__twitchCalls.play), 1, "heartbeat must not call Twitch play again");
  await page.evaluate(() => window.__twitchPlayer.emit("playback-blocked"));
  await page.getByRole("heading", { name: "Twitch waiting for playback" }).waitFor();
  await page.evaluate(() => window.__twitchPlayer.emit("playing"));
  await page.getByRole("heading", { name: "Playing together" }).waitFor();
  await page.getByRole("button", { name: "+15 sec" }).click();
  await page.getByText(/Timeline 0:1[6-9]/).first().waitFor();
  await page.getByRole("button", { name: "−15 sec" }).click();
  await page.getByText(/Timeline 0:0[1-4]/).first().waitFor();
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await page.getByRole("button", { name: "+15 sec" }).click();
  await page.getByRole("button", { name: "+15 sec" }).click();
  await page.getByRole("button", { name: "+15 sec" }).click();
  await page.getByText(/Timeline 0:40/).first().waitFor();
  await page.getByRole("textbox", { name: "Search room videos" }).fill("QA Twitch Clip");
  await page.getByRole("region", { name: "Room query and queue" }).getByRole("button", { name: "QA Twitch Clip" }).click();
  await page.locator('iframe[src*="clips.twitch.tv/embed"]').waitFor();
  assert.deepEqual(errors, []);
  await page.screenshot({ path: "screenshots/watch-room-providers-desktop.png", fullPage: true });
  console.log(JSON.stringify({ youtubeRecommendations: 35, twitchPlayCallsAfterHeartbeat: 1, twitchSeekClampedAtSeconds: 40, twitchClipUsesClipEmbed: true, errors }, null, 2));
} finally {
  await browser.close();
}
