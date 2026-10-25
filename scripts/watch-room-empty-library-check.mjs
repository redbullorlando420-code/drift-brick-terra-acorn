import assert from "node:assert/strict";
import { chromium } from "playwright";

const origin = process.argv[2] ?? "http://127.0.0.1:8080/";
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox", "--disable-features=WebRtcHideLocalIpsWithMdns"] });
const errors = [];
async function store(page, seed = false) {
  return page.evaluate(async (seed) => {
    const source = await (await fetch("/src/components/library/watch-room-section.tsx")).text();
    const url = source.match(/from "(\/src\/lib\/videos\/store\.ts(?:\?t=\d+)?)"/)?.[1];
    if (!url) throw Error("Active store module unavailable");
    const { useLibrary } = await import(/* @vite-ignore */ url);
    if (seed) {
      const sourceUrl = source.match(/from "(\/src\/lib\/videos\/sources\.ts(?:\?t=\d+)?)"/)?.[1];
      if (!sourceUrl) throw Error("Active local sources module unavailable");
      const { rememberFile } = await import(/* @vite-ignore */ sourceUrl);
      const sample = await (await fetch("/samples/tungsten-reel.mp4")).blob();
      rememberFile("qa-local", new File([sample], "host-record.mp4", { type: "video/mp4" }));
      const base = { folderId: "qa", path: "private host path", mime: "video/mp4", size: 0, duration: 30, addedAt: Date.now() };
      useLibrary.setState({ videos: [
        { ...base, id: "qa-youtube", name: "QA YouTube host video", extension: "yt", remote: { kind: "youtube", videoId: "dQw4w9WgXcQ", channelName: "Host creator", embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ" } },
        { ...base, id: "qa-twitch", name: "QA Twitch host VOD", extension: "twitch", remote: { kind: "twitch", videoId: "1234", embedUrl: "https://player.twitch.tv/?video=v1234", watchUrl: "https://www.twitch.tv/videos/1234" } },
        { ...base, id: "qa-clip", name: "QA Twitch host clip", extension: "clip", remote: { kind: "twitch", videoId: "ClipSlug", embedUrl: "https://clips.twitch.tv/embed?clip=ClipSlug" } },
        { ...base, id: "qa-local", name: "QA local host video", extension: "mp4" },
      ] });
      useLibrary.getState().setSource("watch-room");
    }
    return { videos: useLibrary.getState().videos.length, follows: useLibrary.getState().follows?.length ?? 0 };
  }, seed);
}
try {
  const hostContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  for (const context of [hostContext, guestContext]) {
    await context.route(/https:\/\/(www\.youtube\.com|clips\.twitch\.tv|player\.twitch\.tv)\//, (route) => route.fulfill({ contentType: route.request().url().endsWith(".js") ? "application/javascript" : "text/html", body: "" }));
    await context.route(/https:\/\/.*(ytimg\.com|jtvnw\.net)\//, (route) => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"/>' }));
    await context.addInitScript(() => {
      window.Twitch = { Player: class {
        static READY = "ready"; static PLAY = "play"; static PAUSE = "pause"; static SEEK = "seek"; static PLAYING = "playing";
        constructor(target, options) { this.events = {}; this.time = 0; window.__twitchOptions = options; const host = typeof target === "string" ? document.getElementById(target) : target; const frame = document.createElement("iframe"); frame.title = "Twitch test player"; frame.src = `https://player.twitch.tv/?video=v${options.video ?? ""}`; host?.append(frame); setTimeout(() => this.emit("ready"), 10); }
        addEventListener(name, callback) { (this.events[name] ??= []).push(callback); }
        emit(name) { (this.events[name] ?? []).forEach((callback) => callback()); }
        getCurrentTime() { return this.time; } getDuration() { return 30; }
        play() { this.emit("play"); this.emit("playing"); } pause() { this.emit("pause"); }
        seek(value) { this.time = value; } setMuted() {} destroy() {}
      } };
    });
  }
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  for (const [page, role] of [[host, "host"], [guest, "guest"]]) page.on("pageerror", (error) => errors.push(`${role}: ${error.message}`));
  await host.goto(origin);
  await store(host, true);
  await host.getByRole("button", { name: "Start room", exact: true }).click();
  const room = (await host.getByRole("heading", { name: /^Room RC/ }).innerText()).replace("Room ", "").trim();
  await guest.goto(new URL(`?room=${room}&theater=1`, origin).href);
  await guest.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').waitFor({ timeout: 45000 });
  assert.deepEqual(await store(guest), { videos: 0, follows: 0 });

  const hostFind = host.getByRole("region", { name: "Room query and queue" });
  const guestQueue = guest.getByRole("region", { name: "Room query and queue" });
  const queuedTitle = (name) => guestQueue.locator("span").filter({ hasText: new RegExp(`^${name}$`) });
  for (const name of ["QA Twitch host VOD", "QA Twitch host clip", "QA local host video"]) {
    await hostFind.getByRole("textbox", {name:'Search room videos',exact:true}).fill(name);
    await hostFind.getByRole("button", { name, exact: true }).locator("..").getByRole("button", { name: "Queue", exact: true }).click();
    await queuedTitle(name).waitFor();
    await guestQueue.getByRole("button", { name, exact: true }).waitFor();
  }
  await guestQueue.getByRole("button", { name: "Remove QA Twitch host clip from queue", exact: true }).click();
  await queuedTitle("QA Twitch host clip").waitFor({ state: "detached" });
  assert.equal(await queuedTitle("QA Twitch host VOD").count(), 1);
  assert.equal(await queuedTitle("QA local host video").count(), 1);

  const select = async (name) => { await hostFind.getByRole("textbox", {name:'Search room videos',exact:true}).fill(name); await hostFind.getByRole("button", { name, exact: true }).click(); };
  await select("QA Twitch host VOD");
  await guest.waitForFunction(() => window.__twitchOptions?.video === "v1234");
  await select("QA Twitch host clip");
  await guest.locator('iframe[src*="clips.twitch.tv/embed"]').waitFor();

  await select("QA local host video");
  await host.locator("video").waitFor();
  await host.locator("video").evaluate((video) => { video.loop = true; });
  await host.waitForFunction(() => document.querySelector("video")?.paused === false, null, { timeout: 5000 }).catch(() => {});
  if (await host.locator("video").evaluate((video) => video.paused))
    await host.getByRole("button", { name: "Play", exact: true }).first().click();
  await host.waitForFunction(() => document.querySelector("video")?.paused === false);
  const incoming = guest.locator("video[data-room-stream]");
  await incoming.waitFor({ timeout: 45000 });
  if (await guest.getByRole("button", { name: "Play on this device" }).count()) await guest.getByRole("button", { name: "Play on this device" }).click();
  await guest.waitForFunction(() => { const video = document.querySelector("video[data-room-stream]"); return video?.readyState >= 2 && video.getVideoPlaybackQuality().totalVideoFrames > 10; }, null, { timeout: 30000 });
  const decodedFrames = await incoming.evaluate((video) => video.getVideoPlaybackQuality().totalVideoFrames);
  assert.deepEqual(await store(guest), { videos: 0, follows: 0 });
  await host.screenshot({ path: "screenshots/watch-room-empty-host.png", fullPage: true });
  await incoming.scrollIntoViewIfNeeded();
  await guest.screenshot({ path: "screenshots/watch-room-empty-mobile.png" });

  await guest.reload();
  await guest.locator("video[data-room-stream]").waitFor({ timeout: 45000 });
  await guest.waitForFunction(() => document.querySelector("video[data-room-stream]")?.readyState >= 2, null, { timeout: 30000 });
  await select("QA YouTube host video");
  await guest.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').waitFor();
  assert.equal(await guest.locator("video[data-room-stream]").count(), 0);

  await host.getByText("Local sharing, games & TV", { exact: true }).click();
  await host.locator('input[type="file"][accept="video/*"]').first().setInputFiles("public/samples/tungsten-reel.mp4");
  assert.equal(await host.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').count(), 1, "choosing an unstaged file must not replace the current video");
  await host.getByRole("checkbox", { name: /I confirm guests have access/ }).check();
  await host.getByRole("button", { name: "Send sharing request" }).click();
  await host.locator("video").evaluate((video) => { video.loop = true; });
  await host.waitForFunction(() => document.querySelector("video")?.paused === false, null, { timeout: 5000 }).catch(() => {});
  if (await host.locator("video").evaluate((video) => video.paused))
    await host.getByRole("button", { name: "Play", exact: true }).first().click();
  await host.waitForFunction(() => document.querySelector("video")?.paused === false);
  await guest.locator("video[data-room-stream]").waitFor({ timeout: 45000 });
  if (await guest.getByRole("button", { name: "Play on this device" }).count()) await guest.getByRole("button", { name: "Play on this device" }).click();
  await guest.waitForFunction(() => document.querySelector("video[data-room-stream]")?.getVideoPlaybackQuality().totalVideoFrames > 10, null, { timeout: 30000 });
  await guest.getByRole("button", { name: "Pause", exact: true }).first().click();
  await host.waitForFunction(() => document.querySelector("video")?.paused === true);
  await guest.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  await guest.getByRole("button", { name: "Play", exact: true }).first().click();
  await host.waitForFunction(() => document.querySelector("video")?.paused === false);
  assert.deepEqual(await store(guest), { videos: 0, follows: 0 });
  assert.equal(await guest.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ room, guestLibrary: 0, guestFollows: 0, decodedFrames, checks: ["YouTube without subscription", "Twitch VOD without subscription", "Twitch clip", "queue titles and guest removal preserve other titles", "local stream without guest file", "late guest rejoin receives local stream", "source change releases guest player", "file picker preserves current video until shared", "browser-picked file stream", "guest pause and resume reach host", "mobile no overflow"], errors }, null, 2));
} finally { await browser.close(); }
