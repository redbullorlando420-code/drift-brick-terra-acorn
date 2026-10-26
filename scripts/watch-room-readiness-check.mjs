import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const origin = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/player-readiness-ui.json", [
    resolve("screenshots"),
  ]);
const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: ["--disable-features=WebRtcHideLocalIpsWithMdns"],
  }),
  checks = [],
  errors = [];
let pages = [];
try {
  const contexts = await Promise.all(
    [
      { width: 1440, height: 1000 },
      { width: 390, height: 844 },
    ].map((viewport, i) => browser.newContext({ viewport, isMobile: !!i, hasTouch: !!i })),
  );
  for (const context of contexts) {
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.watch-room.auto-advance", "false");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: false }),
      );
      window.__readinessWire = [];
      window.__wireCounts = {};
      window.__roomChannels = new Set();
      const send = RTCDataChannel.prototype.send;
      RTCDataChannel.prototype.send = function (value) {
        try {
          const p = JSON.parse(value);
          if (p.t === "d") {
            window.__readinessWire.push(p.d);
            if (window.__readinessWire.length > 512) window.__readinessWire.shift();
            window.__wireCounts[p.d.type] = (window.__wireCounts[p.d.type] ?? 0) + 1;
            if (this.label === "reliable") window.__roomChannels.add(this);
          }
        } catch {}
        return send.call(this, value);
      };
      window.__sendRoomPacket = (value) => {
        for (const transport of window.__roomChannels)
          if (transport.readyState === "open")
            send.call(transport, JSON.stringify({ t: "d", d: value }));
      };
    });
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("**/api/lan-origin", (r) =>
      r.fulfill({ contentType: "application/json", body: '{"origins":[]}' }),
    );
    await context.route(/https:\/\/.*(?:ytimg.com|jtvnw.net)\//, (r) =>
      r.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"/>',
      }),
    );
    await context.route("https://www.youtube.com/embed/**", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: '<p>Controlled player readiness fixture</p><script>window.commands=[];addEventListener("message",e=>{try{commands.push(JSON.parse(e.data));if(commands.length>128)commands.shift();}catch{}});</script>',
      }),
    );
    await context.route("https://clips.twitch.tv/**", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: "<p>Controlled clip fixture: no playback status API</p>",
      }),
    );
    await context.route("https://player.twitch.tv/js/embed/v1.js", (r) =>
      r.fulfill({
        contentType: "application/javascript",
        body: 'window.Twitch={Player:class {constructor(target){window.__twitchPlayer=this;this.events={};this.time=0;document.getElementById(target).textContent="Controlled Twitch readiness fixture";}addEventListener(event,fn){(this.events[event]??=[]).push(fn);}emit(event){for(const fn of this.events[event]??[])fn();}getCurrentTime(){return this.time;}getDuration(){return 600;}seek(value){this.time=value;}setMuted(){}play(){}pause(){}}};',
      }),
    );
  }
  const [host, guest] = await Promise.all(contexts.map((c) => c.newPage()));
  pages = [host, guest];
  for (const page of pages) {
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text() + " " + m.location().url);
    });
  }
  const queue = (p) => p.getByRole("region", { name: "Room query and queue", exact: true }),
    group = (p) => p.getByRole("region", { name: "Room guest controls", exact: true });
  const add = async (p, links) => {
    await queue(p).getByRole("textbox", { name: "Public video link", exact: true }).fill(links);
    await queue(p).getByRole("button", { name: "Add link to queue", exact: true }).click();
  };
  const yt = (p) => p.frameLocator('iframe[src*="www.youtube.com/embed/"]');
  const signal = (p, event, info) =>
    yt(p)
      .locator("body")
      .evaluate((_, data) => parent.postMessage(JSON.stringify(data), "*"), { event, info });
  await host.goto(origin);
  await host.locator('[data-home-ready="true"]').waitFor();
  await host
    .getByRole("navigation", { name: "Library navigation" })
    .getByRole("button", { name: "Watch room", exact: true })
    .click();
  await host.getByRole("button", { name: "Start room", exact: true }).click();
  const room = (await host.getByRole("heading", { name: /^Room RC/ }).innerText())
    .replace("Room ", "")
    .trim();
  await add(
    host,
    [
      "https://youtu.be/ready000001",
      "https://youtu.be/ready000002",
      "https://twitch.tv/videos/987654",
      "https://clips.twitch.tv/ReadinessPublicClip",
    ].join("\n"),
  );
  await queue(host).getByRole("button", { name: "Play next", exact: true }).click();
  await guest.goto(new URL("/?room=" + room + "&theater=1", origin).href);
  await guest.locator('iframe[src*="ready000001"]').waitFor();
  await host.getByText(/Connection details · 1\/1 connected/).waitFor();
  const guestId = await group(guest)
      .locator("[data-player-person]")
      .filter({ hasText: /^You ·/ })
      .getAttribute("data-player-person"),
    hostGuest = group(host).locator('[data-player-person="' + guestId + '"]'),
    guestSelf = group(guest).locator('[data-player-person="' + guestId + '"]');
  const status = async (value) => {
    await hostGuest.locator(":scope").evaluate(
      (e, value) =>
        new Promise((resolve, reject) => {
          const start = performance.now(),
            check = () =>
              e.dataset.playerState === value
                ? resolve()
                : performance.now() - start > 8000
                  ? reject(Error("Expected " + value + ", got " + e.dataset.playerState))
                  : setTimeout(check, 20);
          check();
        }),
      value,
    );
  };
  await status("loading");
  await group(guest).getByRole("button", { name: "I’m ready", exact: true }).click();
  await group(host).getByText("Ready check · 1 / 2", { exact: true }).waitFor();
  await signal(guest, "onAutoplayBlocked");
  await status("blocked");
  await hostGuest.getByText(/Ready \(manual\)/).waitFor();
  await host.getByRole("heading", { name: "Playing together", exact: true }).waitFor();
  assert.equal(
    await guest.getByRole("button", { name: "Start on this device", exact: true }).count(),
    1,
  );
  assert.equal(await queue(host).locator("[data-room-queue-id]").count(), 3);
  checks.push(
    "A manually Ready phone remains visibly blocked on autoplay while the host continues playing and the queue stays intact",
  );
  await signal(guest, "onReady");
  await signal(guest, "infoDelivery", { playerState: 3, currentTime: 0 });
  await status("blocked");
  const wireBefore = await guest.evaluate(() => window.__wireCounts["participation-player"]);
  await yt(guest)
    .locator("body")
    .evaluate(() => {
      for (let i = 0; i < 200; i++)
        parent.postMessage(JSON.stringify({ event: "onAutoplayBlocked" }), "*");
    });
  await guest.waitForTimeout(1200);
  assert.equal(await guest.evaluate(() => window.__wireCounts["participation-player"]), wireBefore);
  checks.push(
    "Repeated blocked/ready/buffering events do not clear the tap requirement or generate repeated readiness traffic",
  );
  await group(host).getByRole("button", { name: "Pause room to wait", exact: true }).click();
  await host.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  await guest.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  assert.equal(
    await group(guest).getByRole("button", { name: "Pause room to wait", exact: true }).count(),
    0,
  );
  await host
    .getByRole("checkbox", { name: "Allow guests to play and pause", exact: true })
    .uncheck();
  await host.getByRole("checkbox", { name: "Allow guests to seek videos", exact: true }).uncheck();
  await guest.waitForFunction(() =>
    [...document.querySelectorAll("button")].some(
      (b) => b.textContent.trim() === "Play" && b.disabled,
    ),
  );
  await signal(guest, "onStateChange", 1);
  await status("playing");
  await host.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  await signal(guest, "onStateChange", 3);
  await status("buffering");
  await signal(guest, "onStateChange", 2);
  await status("paused");
  await hostGuest.getByText(/Ready \(manual\)/).waitFor();
  checks.push(
    "Only the host explicitly pauses to wait; observed guest playback and buffering cannot bypass locked playback or seeking permissions",
  );
  await signal(guest, "onError", 101);
  await status("error");
  await guest.getByRole("button", { name: "Reload this player", exact: true }).click();
  await status("loading");
  await signal(guest, "onReady");
  await status("ready");
  await signal(guest, "onAutoplayBlocked");
  await status("blocked");
  await hostGuest.scrollIntoViewIfNeeded();
  await host.screenshot({ path: output.replace(".json", "-desktop.png") });
  await guestSelf.scrollIntoViewIfNeeded();
  await guest.screenshot({ path: output.replace(".json", "-mobile.png") });
  const oldSelection = await host.evaluate(
    () =>
      window.__readinessWire.filter((p) => p.type === "participation-state").at(-1).state.selection,
  );
  await queue(host).getByRole("button", { name: "Play next", exact: true }).click();
  await guest.locator('iframe[src*="ready000002"]').waitFor();
  await status("loading");
  await guest.evaluate(
    (selection) =>
      window.__sendRoomPacket({
        type: "participation-player",
        value: { selection, status: "playing", capability: "youtube" },
      }),
    oldSelection,
  );
  await guest.waitForTimeout(400);
  await status("loading");
  await signal(guest, "onReady");
  await status("ready");
  await guest.waitForTimeout(800);
  const quiet = await guest.evaluate(() => window.__wireCounts["participation-player"]);
  await signal(guest, "infoDelivery", { currentTime: 42, playerState: 5 });
  await guest.waitForTimeout(2200);
  assert.equal(await guest.evaluate(() => window.__wireCounts["participation-player"]), quiet);
  checks.push(
    "Reload resets device observations, a new title drops the old status, stale title reports are rejected and clock-only updates send no readiness packet",
  );
  await queue(host).getByRole("button", { name: "Play next", exact: true }).click();
  for (const p of pages) await p.waitForFunction(() => Boolean(window.__twitchPlayer));
  await status("loading");
  await guest.evaluate(() => window.__twitchPlayer.emit("ready"));
  await status("ready");
  await guest.evaluate(() => window.__twitchPlayer.emit("playback-blocked"));
  await status("blocked");
  await guest.evaluate(() => window.__twitchPlayer.emit("playing"));
  await status("playing");
  await queue(host).getByRole("button", { name: "Play next", exact: true }).click();
  await guest.locator('iframe[src*="clips.twitch.tv"]').waitFor();
  await status("unsupported");
  await hostGuest.getByText(/cannot report playback status/).waitFor();
  checks.push(
    "Twitch ready, blocked and actual playing signals are distinct; clips honestly report that playback status is unavailable",
  );
  await host.getByText("Local sharing, games & TV", { exact: true }).click();
  await host
    .locator('input[type="file"][accept="video/*"]')
    .first()
    .setInputFiles("public/samples/tungsten-reel.mp4");
  await host.getByRole("checkbox", { name: /I confirm guests have access/ }).check();
  await host.getByRole("button", { name: "Send sharing request", exact: true }).click();
  await host.locator("video").evaluate((v) => {
    v.loop = true;
  });
  await status("waiting");
  const play = host.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.click();
  await guest.locator("video[data-room-stream]").waitFor();
  const start = guest.getByRole("button", { name: "Play on this device", exact: true });
  if (await start.isVisible()) await start.click();
  await guest.waitForFunction(
    () =>
      document.querySelector("video[data-room-stream]")?.getVideoPlaybackQuality()
        .totalVideoFrames > 5,
  );
  await status("playing");
  checks.push(
    "A real local MP4 goes from waiting for the host stream to observed playback on an empty phone library over WebRTC",
  );
  const reports = await guest.evaluate(() =>
    window.__readinessWire.filter((p) => p.type === "participation-player"),
  );
  assert(reports.length < 50);
  for (const packet of reports)
    assert.deepEqual(Object.keys(packet.value).sort(), ["capability", "selection", "status"]);
  assert.doesNotMatch(
    JSON.stringify(reports),
    /ready000|987654|tungsten|fingerprint|token|position|path/,
  );
  await guest.getByRole("button", { name: "Leave room", exact: true }).click();
  await hostGuest.waitFor({ state: "detached" });
  assert.equal(await group(host).locator("[data-player-person]").count(), 1);
  for (const p of pages)
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  checks.push(
    "Departure clears the status; compact readiness reports contain no video identities, paths, clocks, tokens or device details",
  );
  writeFileSync(
    output,
    JSON.stringify(
      {
        ok: true,
        checks,
        errors,
        limitation:
          "Isolated desktop/touch-phone Chrome uses real room transport and real decoded local media; YouTube/Twitch player signals are controlled fixtures. Physical browser policies and real provider embeds remain separate checks.",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ ok: true, checks, errors }, null, 2));
} catch (error) {
  for (const [i, p] of pages.entries())
    await p.screenshot({ path: output.replace(".json", "-failure-" + i + ".png") }).catch(() => {});
  writeFileSync(output, JSON.stringify({ ok: false, checks, errors, error: error.stack }, null, 2));
  throw error;
} finally {
  await browser.close();
}
