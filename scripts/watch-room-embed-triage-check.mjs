import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const origin = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/embed-triage-ui.json", [
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

  for (const context of contexts)
    await context.route("https://www.youtube.com/watch?*", (r) =>
      r.fulfill({
        contentType: "text/html",
        body: "<p>Controlled official watch-page fixture</p>",
      }),
    );
  const [host, guest] = await Promise.all(contexts.map((c) => c.newPage()));
  pages = [host, guest];
  for (const page of pages) {
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text() + " " + m.location().url);
    });
  }
  const A = "VV8mzTZ_Hgk",
    B = "triage00001",
    C = "triage00002";
  const queue = (p) => p.getByRole("region", { name: "Room query and queue", exact: true }),
    recovery = (p) => p.getByRole("region", { name: "Player recovery", exact: true });
  const add = async (p, links) => {
    await queue(p).getByRole("textbox", { name: "Public video link", exact: true }).fill(links);
    await queue(p).getByRole("button", { name: "Add link to queue", exact: true }).click();
  };
  const frame = (p) => p.frameLocator('iframe[src*="www.youtube.com/embed/"]');
  const signal = (p, event, info) =>
    frame(p)
      .locator("body")
      .evaluate((_, data) => parent.postMessage(JSON.stringify(data), "*"), { event, info });
  const openDiagnostics = async (p) => {
    const details = recovery(p).locator("details");
    if (!(await details.evaluate((e) => e.open))) await details.locator("summary").click();
  };
  const download = async (p) => {
    await openDiagnostics(p);
    const pending = p.waitForEvent("download");
    await recovery(p)
      .getByRole("button", { name: "Download player diagnostics", exact: true })
      .click();
    const raw = await readFile(await (await pending).path(), "utf8");
    return { raw, data: JSON.parse(raw) };
  };
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
  await add(host, ["https://youtu.be/" + A, "https://youtu.be/" + B].join("\n"));
  await queue(host).getByRole("button", { name: "Play next", exact: true }).click();
  await host.getByRole("button", { name: "Pause", exact: true }).click();
  await guest.goto(new URL("/?room=" + room + "&theater=1", origin).href);
  await guest.locator('iframe[src*="' + A + '"]').waitFor();
  await host.getByText(/Connection details · 1\/1 connected/).waitFor();
  await host
    .getByRole("checkbox", { name: "Allow guests to play and pause", exact: true })
    .uncheck();
  await host.getByRole("checkbox", { name: "Allow guests to seek videos", exact: true }).uncheck();
  for (const p of pages) {
    await signal(p, "onReady");
    await signal(p, "infoDelivery", {
      playerState: 2,
      currentTime: 0,
      duration: 600,
      videoData: { video_id: A, isLive: false },
    });
  }
  await guest.waitForTimeout(1000);
  const originalClock = Number(
    await host.getByLabel("Room playback time", { exact: true }).getAttribute("data-room-clock"),
  );
  await guest.evaluate(() => {
    window.__triageFrame = document.querySelector('iframe[src*="youtube.com/embed"]');
  });
  await signal(guest, "onError", 101);
  await recovery(guest)
    .getByRole("heading", { name: "Embedding disabled by the creator", exact: true })
    .waitFor();
  const blocked = await download(guest);
  const before = await frame(guest)
    .locator("body")
    .evaluate(() => commands.filter((c) => ["seekTo", "playVideo"].includes(c.func)).length);
  await frame(guest)
    .locator("body")
    .evaluate(() => {
      for (let i = 0; i < 100; i++)
        parent.postMessage(JSON.stringify({ event: "onError", info: 101 }), "*");
    });
  await signal(guest, 'infoDelivery', {playerState:1,currentTime:999});
  await recovery(guest).getByRole('heading',{name:'Embedding disabled by the creator',exact:true}).waitFor();
  for (let i = 0; i < 3; i++) {
    await host.getByRole("button", { name: "Resync guests", exact: true }).click();
    await signal(guest, "infoDelivery", { playerState: 2, currentTime: 0 });
  }
  await guest.waitForTimeout(1200);
  assert.equal(
    await frame(guest)
      .locator("body")
      .evaluate(() => commands.filter((c) => ["seekTo", "playVideo"].includes(c.func)).length),
    before,
  );
  assert(
    await guest.evaluate(
      () => window.__triageFrame === document.querySelector('iframe[src*="youtube.com/embed"]'),
    ),
  );
  assert.deepEqual((await download(guest)).data.titles, blocked.data.titles);
  assert(
    Math.abs(
      Number(
        await host
          .getByLabel("Room playback time", { exact: true })
          .getAttribute("data-room-clock"),
      ) - originalClock,
    ) < 0.5,
    "paused provider clock remains within transport-settling tolerance",
  );
  await host.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  checks.push(
    "A non-embeddable guest video preserves the room, iframe and original evidence; repeated errors and host resyncs produce no reload or seek/play loop",
  );
  await guest.evaluate(() =>
    window.dispatchEvent(
      new MessageEvent("message", {
        origin: "https://www.youtube.com",
        source: window,
        data: JSON.stringify({ event: "onError", info: 153 }),
      }),
    ),
  );
  await recovery(guest)
    .getByRole("heading", { name: "Embedding disabled by the creator", exact: true })
    .waitFor();
  await guest
    .getByRole("textbox", { name: "Room chat message", exact: true })
    .fill("Chat still works during an embed failure");
  await guest.getByRole("button", { name: "Send", exact: true }).click();
  await host.getByText(/Chat still works during an embed failure/).waitFor();
  await add(guest, "https://youtu.be/" + C);
  await host.waitForFunction(() => document.querySelectorAll("[data-room-queue-id]").length === 2);
  const popupWait = contexts[1].waitForEvent("page");
  await recovery(guest).getByRole("link", { name: "Open on YouTube", exact: true }).click();
  const popup = await popupWait;
  await popup.waitForLoadState("domcontentloaded");
  assert.equal(popup.url(), "https://www.youtube.com/watch?v=" + A);
  await popup.close();
  await host.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  checks.push(
    "Chat and acknowledged queue additions continue while the guest opens the canonical official watch page; a spoofed parent event cannot change the diagnosis",
  );
  for (const [code, title] of [
    [2, "YouTube rejected this link"],
    [5, "This browser could not play the video"],
    [100, "Video unavailable or private"],
    [150, "Embedding disabled by the creator"],
    [153, "YouTube could not identify this player"],
    [999, "YouTube player error"],
  ]) {
    await signal(guest, "onError", code);
    await recovery(guest).getByRole("heading", { name: title, exact: true }).waitFor();
    await recovery(guest)
      .getByText(
        "Observed YouTube player code " + code + ". This is not a channel-wide availability check.",
        { exact: true },
      )
      .waitFor();
  }
  const exported = await download(guest);
  assert.equal(exported.data.format, "realhub-youtube-player-diagnostics");
  assert.equal(exported.data.titles.length, 1);
  assert(exported.data.titles[0].events.length <= 6);
  assert.equal(exported.data.titles[0].events.at(-1).code, 999);
  assert(!exported.raw.includes(room));
  assert.doesNotMatch(
    exported.raw,
    /invitation|peer|fingerprint|path|position|cookies|catalog|token/,
  );
  checks.push(
    "Observed error codes have distinct recovery guidance; exported diagnostics retain only bounded public title IDs, codes and transitions",
  );
  await recovery(guest).getByRole("button", { name: "Reload this player", exact: true }).click();
  await recovery(guest)
    .getByText("Waiting for this device’s YouTube player.", { exact: true })
    .waitFor();
  assert(
    !(await guest.evaluate(
      () => window.__triageFrame === document.querySelector('iframe[src*="youtube.com/embed"]'),
    )),
  );
  await signal(guest, "onReady");
  await recovery(guest)
    .getByText("No current YouTube player failure reported.", { exact: true })
    .waitFor();
  const retry = await download(guest);
  assert.equal(retry.data.titles[0].loads, 2);
  assert.equal(retry.data.titles[0].events.at(-1).phase, "ready");
  await signal(guest, "onAutoplayBlocked");
  await recovery(guest)
    .getByRole("heading", { name: "This device needs a Play tap", exact: true })
    .waitFor();
  await guest.getByRole("button", { name: "Start on this device", exact: true }).click();
  await signal(guest, "onStateChange", 1);
  await recovery(guest)
    .getByText("No current YouTube player failure reported.", { exact: true })
    .waitFor();
  await host.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  checks.push(
    "Explicit device-only reload records a new attempt, and actual playback clears a separate autoplay block without changing the host pause or access settings",
  );
  await recovery(guest).getByRole("button", { name: "Reload this player", exact: true }).click();
  await recovery(guest)
    .getByRole("heading", { name: "Player connection not confirmed", exact: true })
    .waitFor();
  const timeout = await download(guest);
  assert.equal(timeout.data.titles[0].events.at(-1).phase, "timeout");
  assert.equal(timeout.data.titles[0].events.at(-1).code, undefined);
  await signal(guest, "onReady");
  await recovery(guest)
    .getByText("No current YouTube player failure reported.", { exact: true })
    .waitFor();
  checks.push(
    "An exhausted handshake reports setup uncertainty without inventing a provider restriction; late readiness recovers without an automatic reload",
  );
  await signal(host, "onError", 153);
  await recovery(host)
    .getByRole("heading", { name: "YouTube could not identify this player", exact: true })
    .waitFor();
  await signal(guest, "onError", 101);
  await recovery(guest)
    .getByRole("heading", { name: "Embedding disabled by the creator", exact: true })
    .waitFor();
  await recovery(host).scrollIntoViewIfNeeded();
  await host.screenshot({ path: output.replace(".json", "-desktop.png") });
  const details = recovery(guest).locator("details");
  if (await details.evaluate((e) => e.open)) await details.locator("summary").click();
  await recovery(guest).scrollIntoViewIfNeeded();
  await guest.screenshot({ path: output.replace(".json", "-mobile.png") });
  await queue(host).getByRole("button", { name: "Play next", exact: true }).click();
  await guest.locator('iframe[src*="' + B + '"]').waitFor();
  await signal(guest, "onReady");
  const next = await download(guest);
  assert.equal(next.data.titles.length, 2);
  assert.equal(next.data.titles.find((r) => r.videoId === B).phase, "ready");
  await recovery(guest)
    .getByRole("button", { name: "Clear earlier title diagnostics", exact: true })
    .click();
  assert.deepEqual(
    (await download(guest)).data.titles.map((r) => r.videoId),
    [B],
  );
  await guest.reload();
  await guest.locator('iframe[src*="' + B + '"]').waitFor();
  await signal(guest, "onReady");
  const reloaded = await download(guest);
  assert.deepEqual(
    reloaded.data.titles.map((r) => r.videoId),
    [B],
  );
  assert.equal(reloaded.data.titles[0].loads, 1);
  checks.push(
    "New titles start independent evidence; clearing earlier diagnostics and reloading affect only the browser-local history and do not restore old failures",
  );
  for (const p of pages)
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  writeFileSync(
    output,
    JSON.stringify(
      {
        ok: true,
        checks,
        errors,
        limitation:
          "Isolated desktop and 390px touch-phone clients use actual room signaling and WebRTC. Provider frames and the official watch page are controlled fixtures; real-provider restrictions and physical phone policies remain external verification.",
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
