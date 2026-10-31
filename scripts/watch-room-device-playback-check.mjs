import assert from "node:assert/strict";
import { chromium } from "playwright";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const url = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/room-device-dev.json", [
    resolve("screenshots"),
  ]);
const browser = await chromium.launch({ channel: "chrome", headless: true }),
  checks = [],
  errors = [];
let pages = [];
const youtubeFixture =
  '<script>window.commands=[];window.emit=info=>parent.postMessage(JSON.stringify(info),"*");addEventListener("message",event=>{let p;try{p=JSON.parse(event.data)}catch{return}if(p.event==="listening"){emit({event:"onReady"});emit({event:"infoDelivery",info:{playerState:1,currentTime:100,duration:12000,videoData:{video_id:location.pathname.split("/").pop(),isLive:location.pathname.includes("live")}}});}if(p.event==="command")commands.push(p);});</script><p>Controlled YouTube playback fixture</p>';
const twitchFixture = `window.__twitchPlayers=[];class Player{constructor(id){this.events={};this.time=100;this.commands=[];window.__twitchPlayers.push(this);document.getElementById(id).textContent='Controlled Twitch playback fixture';setTimeout(()=>this.emit('ready'),100);}addEventListener(e,f){(this.events[e]??=[]).push(f);}emit(e){for(const f of this.events[e]??[])f();}getCurrentTime(){return this.time;}getDuration(){return 10000;}play(){this.commands.push('play');}pause(){this.commands.push('pause');}seek(s){this.commands.push('seek');this.time=s;}setMuted(){}}window.Twitch={Player};`;
try {
  const contexts = await Promise.all(
    [
      { width: 1440, height: 1000 },
      { width: 390, height: 844 },
    ].map((viewport, i) => browser.newContext({ viewport, isMobile: !!i, hasTouch: !!i })),
  );
  for (const context of contexts) {
    await context.addInitScript(() => {
      window.__captionWrites = 0;
      const store = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === "reelcase.watch-room.captions.v1") window.__captionWrites++;
        return store.call(this, key, value);
      };
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.artwork-mode", "text");
      localStorage.setItem("reelcase.watch-room.auto-advance", "false");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: false }),
      );
      const send = RTCDataChannel.prototype.send;
      window.__wire = [];
      window.__channels = new Set();
      RTCDataChannel.prototype.send = function (value) {
        if (this.label === "reliable") window.__channels.add(this);
        try {
          const p = JSON.parse(value);
          if (p.t === "d") {
            window.__wire.push(p.d);
            if (window.__wire.length > 500) window.__wire.shift();
          }
        } catch {}
        return send.call(this, value);
      };
      window.__raw = (data) => {
        for (const c of window.__channels)
          if (c.readyState === "open") send.call(c, JSON.stringify({ t: "d", d: data }));
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
    await context.route("https://www.youtube.com/embed/**", (r) =>
      r.fulfill({ contentType: "text/html", body: youtubeFixture }),
    );
    await context.route("https://player.twitch.tv/js/embed/v1.js", (r) =>
      r.fulfill({ contentType: "application/javascript", body: twitchFixture }),
    );
    await context.route("https://i.ytimg.com/**", (r) =>
      r.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="9"/>',
      }),
    );
  }
  const [host, guest] = await Promise.all(contexts.map((c) => c.newPage()));
  pages = [host, guest];
  for (const page of pages) {
    page.setDefaultTimeout(20000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text() + " " + m.location().url);
    });
  }
  const queue = (p) => p.getByRole("region", { name: "Room query and queue", exact: true }),
    captions = (p) => p.getByLabel("Captions on this device", { exact: true }),
    live = (p) => p.getByRole("region", { name: "Live playback on this device", exact: true });
  const add = async (link) => {
    await queue(host).getByRole("textbox", { name: "Public video link", exact: true }).fill(link);
    await queue(host).getByRole("button", { name: "Add link to queue", exact: true }).click();
    await queue(host).getByRole("button", { name: "Play next", exact: true }).click();
  };
  const frame = async (p) => {
    const element = await p.locator('iframe[src*="youtube.com/embed/"]').elementHandle();
    return element.contentFrame();
  };
  const emit = async (p, info) => (await frame(p)).evaluate((info) => window.emit(info), info);
  const count = async (p, type) =>
    p.evaluate((type) => window.__wire.filter((x) => x.type === type).length, type);
  await host.goto(url);
  await host.locator('[data-home-ready="true"]').waitFor();
  await host
    .getByRole("navigation", { name: "Library navigation" })
    .getByRole("button", { name: "Watch room", exact: true })
    .click();
  await host.getByRole("button", { name: "Start room", exact: true }).click();
  const room = (await host.getByRole("heading", { name: /^Room RC/ }).innerText())
    .replace("Room ", "")
    .trim();
  await add("https://youtu.be/liveShow001");
  await live(host).waitFor();
  await guest.goto(new URL("/?room=" + room + "&theater=1", url).href);
  await live(guest).waitFor();
  await guest.getByRole("button", { name: "Pause", exact: true }).waitFor();
  const initialSeek = await (
    await frame(guest)
  ).evaluate(() => commands.filter((p) => p.func === "seekTo").length);
  await emit(host, {
    event: "infoDelivery",
    info: {
      playerState: 3,
      currentTime: 100,
      videoData: { video_id: "liveShow001", isLive: true },
    },
  });
  await guest.waitForTimeout(2400);
  assert.equal(
    await (
      await frame(guest)
    ).evaluate(() => commands.filter((p) => p.func === "pauseVideo").length),
    0,
  );
  assert.equal(
    await (await frame(guest)).evaluate(() => commands.filter((p) => p.func === "seekTo").length),
    initialSeek,
  );
  await emit(guest, { event: "onStateChange", info: 2 });
  await host.getByRole("button", { name: "Pause", exact: true }).waitFor();
  checks.push(
    "YouTube live buffering and guest-local pause never send shared pause or repeated corrective seeks; elapsed duration is not treated as DVR",
  );
  await emit(host, { event: "onStateChange", info: 2 });
  await host.getByRole("button", { name: "Pause", exact: true }).waitFor();
  await emit(host, { event: "onStateChange", info: 1 });
  await captions(guest).locator("summary").click();
  const originalSrc = await guest.locator('iframe[src*="youtube.com/embed/"]').getAttribute("src");
  const priorRequests = await count(guest, "sync-request");
  await captions(guest).getByRole("checkbox", { name: "Prefer captions when available" }).check();
  await captions(guest)
    .getByRole("textbox", { name: "Preferred caption language" })
    .fill("bad_language");
  await captions(guest)
    .getByRole("button", { name: "Save caption preference", exact: true })
    .click();
  await captions(guest)
    .getByText("Use a language code such as en, es or pt-BR, or leave it blank for automatic.", {
      exact: true,
    })
    .waitFor();
  await captions(guest).getByRole("textbox", { name: "Preferred caption language" }).fill("es");
  await captions(guest)
    .getByRole("button", { name: "Save caption preference", exact: true })
    .click();
  assert.equal(
    await guest.locator('iframe[src*="youtube.com/embed/"]').getAttribute("src"),
    originalSrc,
  );
  assert.equal(await count(guest, "sync-request"), priorRequests);
  assert.equal(await guest.evaluate(() => window.__captionWrites), 1);
  await captions(guest)
    .getByRole("button", { name: "Save caption preference", exact: true })
    .click();
  await guest.waitForTimeout(1200);
  assert.equal(await guest.evaluate(() => window.__captionWrites), 1);
  assert(
    await captions(guest)
      .getByRole("button", { name: "Save caption preference", exact: true })
      .evaluate((button) => document.activeElement === button),
  );
  assert.equal(
    await host.evaluate(() => localStorage.getItem("reelcase.watch-room.captions.v1")),
    null,
  );
  await captions(guest)
    .getByRole("button", { name: "Reload with saved captions", exact: true })
    .click();
  await guest.waitForFunction(() =>
    document.querySelector('iframe[src*="youtube.com/embed/"]')?.src.includes("cc_lang_pref=es"),
  );
  assert.equal(await count(guest, "sync-request"), priorRequests);
  await host.getByRole("button", { name: "Pause", exact: true }).waitFor();
  checks.push(
    "Caption validation, save and deliberate YouTube reload preserve room playback; preferred language stays isolated to the guest browser",
  );
  await guest.reload();
  await live(guest).waitFor();
  assert(
    (await guest.locator('iframe[src*="youtube.com/embed/"]').getAttribute("src")).includes(
      "cc_lang_pref=es",
    ),
  );
  checks.push("Guest reload preserves device-local captions and independent live classification");
  await live(guest).getByRole("button", { name: "Reload live player on this device" }).click();
  await live(guest)
    .getByText(
      "Requested a fresh player on this device. No live seek or shared pause was sent. A Play tap may be needed after loading.",
      { exact: true },
    )
    .waitFor();
  await host.getByRole("button", { name: "Pause", exact: true }).waitFor();
  await host.getByRole("button", { name: "Pause", exact: true }).click();
  await guest.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  await live(guest)
    .getByText("The room is paused. Reloading this player will not resume everyone.", {
      exact: true,
    })
    .waitFor();
  await host.getByRole("button", { name: "Play", exact: true }).click();
  await add("https://youtu.be/vodShow0001");
  await guest.locator('iframe[src*="vodShow0001"]').waitFor();
  assert.equal(await live(guest).count(), 0);
  checks.push(
    "Explicit shared pause still works for live; selecting a VOD clears the live-only guidance",
  );
  await add("https://www.twitch.tv/notyoda");
  await guest.waitForFunction(() => window.__twitchPlayers?.length > 0);
  await live(guest).waitFor();
  await host.evaluate(() => window.__twitchPlayers.at(-1).emit("playing"));
  await guest.evaluate(() => window.__twitchPlayers.at(-1).emit("playing"));
  await guest.waitForTimeout(1700);
  await guest.evaluate(() => (window.__twitchPlayers.at(-1).commands = []));
  await host.evaluate(() => {
    const videoId = window.__wire.findLast((p) => p.type === "video")?.videoId;
    window.__raw({
      type: "sync",
      playing: true,
      position: 100,
      live: true,
      clockRunning: false,
      observed: true,
      videoId,
      sentAt: Date.now(),
    });
  });
  await guest.waitForTimeout(1400);
  assert.equal(
    await guest.evaluate(
      () =>
        window.__twitchPlayers.at(-1).commands.filter((c) => c === "pause" || c === "seek").length,
    ),
    0,
  );
  const beforePause = await count(guest, "sync-request");
  await guest.evaluate(() => window.__twitchPlayers.at(-1).emit("pause"));
  await guest.waitForTimeout(300);
  assert.equal(await count(guest, "sync-request"), beforePause);
  await host.getByRole("button", { name: "Pause", exact: true }).waitFor();
  await guest.getByRole("button", { name: "Start on this device", exact: true }).click();
  assert.equal(await guest.evaluate(() => window.__twitchPlayers.at(-1).commands.at(-1)), "play");
  checks.push(
    "Twitch host-buffering clocks do not pause a live guest; local player pause/ad events cannot change the room; device start still plays",
  );
  await captions(guest).locator("summary").click();
  await captions(guest)
    .getByText(/This embed does not expose caption selection/)
    .waitFor();
  assert(
    await captions(guest).getByRole("textbox", { name: "Preferred caption language" }).isVisible(),
  );
  await live(guest).scrollIntoViewIfNeeded();
  await guest.screenshot({ path: output.replace(/\.json$/, "-mobile.png") });
  await captions(host).locator("summary").click();
  await live(host).scrollIntoViewIfNeeded();
  await host.screenshot({ path: output.replace(/\.json$/, "-desktop.png") });
  await host.getByText("Local sharing, games & TV", { exact: true }).click();
  const data = await host.evaluate(async () => {
    const c = document.createElement("canvas");
    c.width = 16;
    c.height = 16;
    const stream = c.captureStream(1);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" }),
      chunks = [];
    recorder.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise(
      (resolve) =>
        (recorder.onstop = async () =>
          resolve(Array.from(new Uint8Array(await new Blob(chunks).arrayBuffer())))),
    );
    recorder.start();
    c.getContext("2d").fillRect(0, 0, 16, 16);
    await new Promise((r) => setTimeout(r, 150));
    recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
    return done;
  });
  await host.locator('input[type="file"][accept="video/*"]:not([multiple])').setInputFiles({
    name: "Caption fixture.webm",
    mimeType: "video/webm",
    buffer: Buffer.from(data),
  });
  await host
    .getByRole("checkbox", {
      name: "I confirm guests have access to this video and may receive this direct share.",
    })
    .check();
  await host.getByRole("button", { name: "Queue selected local file", exact: true }).click();
  await queue(host).getByRole("button", { name: "Play next", exact: true }).click();
  await host.locator("video:not([data-room-stream])").waitFor();
  await captions(host).locator("summary").click();
  await captions(host)
    .getByText(
      "No subtitle or caption tracks are available in this video. Realhub does not generate or download missing subtitles.",
      { exact: true },
    )
    .waitFor();
  await host.evaluate(() => {
    const video = document.querySelector("video:not([data-room-stream])");
    video.addTextTrack("subtitles", "English", "en");
    video.addTextTrack("captions", "Español", "es");
  });
  await captions(host).getByRole("list", { name: "Available caption tracks" }).waitFor();
  await captions(host).getByRole("checkbox", { name: "Prefer captions when available" }).check();
  await captions(host).getByRole("textbox", { name: "Preferred caption language" }).fill("es");
  await captions(host)
    .getByRole("button", { name: "Save caption preference", exact: true })
    .click();
  assert.deepEqual(
    await host.evaluate(() =>
      Array.from(document.querySelector("video").textTracks).map((t) => t.mode),
    ),
    ["disabled", "showing"],
  );
  await captions(host).getByRole("checkbox", { name: "Prefer captions when available" }).uncheck();
  await captions(host)
    .getByRole("button", { name: "Save caption preference", exact: true })
    .click();
  assert.deepEqual(
    await host.evaluate(() =>
      Array.from(document.querySelector("video").textTracks).map((t) => t.mode),
    ),
    ["disabled", "disabled"],
  );
  checks.push(
    "Native TextTrack inventory, language selection and disable apply locally through real browser APIs; missing tracks have honest fallback",
  );
  for (const page of pages)
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
  assert.deepEqual(errors, []);
  writeFileSync(
    output,
    JSON.stringify(
      {
        ok: true,
        checks,
        errors,
        limitation:
          "Real WebRTC between isolated desktop/mobile emulation; controlled YouTube/Twitch bridges, not real provider playback, ads or physical phones. No verified DVR window is exposed, so no live seek is attempted.",
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify({ ok: true, checks }, null, 2));
} catch (error) {
  for (const [i, p] of pages.entries()) {
    console.error(
      (
        await p
          .locator("body")
          .innerText()
          .catch(() => "")
      ).slice(-3500),
    );
    await p
      .screenshot({ path: output.replace(/\.json$/, "-failure-" + i + ".png") })
      .catch(() => {});
  }
  writeFileSync(output, JSON.stringify({ ok: false, checks, errors, error: error.stack }, null, 2));
  throw error;
} finally {
  await browser.close();
}
