import assert from "node:assert/strict";
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import jsQR from "jsqr";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const origin = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const existingGuestCatalog = process.argv.includes("--existing-guest");
const output = checkedOutputPath(
  process.argv[3] ?? resolve("screenshots/watch-room-collaboration-dev.json"),
  [resolve("screenshots")],
  "Watch Room report",
);
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--disable-features=WebRtcHideLocalIpsWithMdns"],
});
const errors = [],
  checks = [];
let pages = [];
const shot = (name) => output.replace(/\.json$/, `-${name}.png`);
const progress = (stage) => console.log(JSON.stringify({ stage }));
try {
  const contexts = await Promise.all(
    [
      { width: 1280, height: 800 },
      { width: 390, height: 844 },
      { width: 1100, height: 800 },
    ].map((viewport) => browser.newContext({ viewport })),
  );
  for (const context of contexts) {
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: false }),
      );
      window.__roomPackets = [];
      window.__roomLocalUrls = new Set();
      const createUrl = URL.createObjectURL.bind(URL), revokeUrl = URL.revokeObjectURL.bind(URL);
      URL.createObjectURL = function (value) {
        const url = createUrl(value);
        if (value instanceof File && value.type.startsWith("video/")) window.__roomLocalUrls.add(url);
        return url;
      };
      URL.revokeObjectURL = function (url) {
        window.__roomLocalUrls.delete(url);
        return revokeUrl(url);
      };
      const send = RTCDataChannel.prototype.send;
      RTCDataChannel.prototype.send = function (value) {
        try {
          const packet = JSON.parse(value);
          if (packet.t === "d") {
            window.__roomPackets.push(packet.d);
            if (window.__roomPackets.length > 128) window.__roomPackets.shift();
            if (window.__blockRoomPacket === packet.d.type) return;
            if (window.__dropRoomPacket === packet.d.type) {
              window.__dropRoomPacket = "";
              return;
            }
          }
        } catch {}
        return send.call(this, value);
      };
      window.Twitch = {
        Player: class {
          static READY = "ready";
          static PLAY = "play";
          static PAUSE = "pause";
          static PLAYING = "playing";
          static ENDED = "ended";
          static SEEK = "seek";
          constructor(target, options) {
            this.events = {};
            this.time = 0;
            window.__roomTwitch = this;
            window.__twitchOptions = options;
            const frame = document.createElement("iframe");
            frame.title = "Twitch fixture player";
            frame.src = `https://player.twitch.tv/?video=${options.video ?? ""}&channel=${options.channel ?? ""}`;
            document.getElementById(target)?.append(frame);
            setTimeout(() => this.emit("ready"), 20);
          }
          addEventListener(name, callback) {
            (this.events[name] ??= []).push(callback);
          }
          emit(name) {
            (this.events[name] ?? []).forEach((fn) => fn());
          }
          getCurrentTime() {
            return this.time;
          }
          getDuration() {
            return 30;
          }
          setMuted() {}
          seek(value) {
            this.time = value;
            (window.__twitchSeeks ??= []).push(value);
            this.emit("seek");
          }
          play() {
            this.emit("play");
            this.emit("playing");
          }
          pause() {
            this.emit("pause");
          }
        },
      };
    });
    await context.route("**/api/lan-origin", (route) =>
      route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({ origins: ["http://192.168.1.68:8080"] }),
      }),
    );
    await context.route("http://127.0.0.1:43123/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route(
      /https:\/\/(?:www.youtube.com|player.twitch.tv|clips.twitch.tv)\//,
      (route) =>
        route.fulfill({ contentType: "text/html", body: '<p>Public provider fixture</p><script>window.__roomCommands=[];addEventListener("message",e=>{try{const data=typeof e.data==="string"?JSON.parse(e.data):e.data;if(data?.event==="command")window.__roomCommands.push(data);}catch{}});</script>' }),
    );
    await context.route(/https:\/\/.*(?:ytimg.com|jtvnw.net)\//, (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="#263342"/></svg>',
      }),
    );
  }
  const [host, phone, other] = await Promise.all(contexts.map((context) => context.newPage()));
  pages = [host, phone, other];
  for (const [index, page] of [host, phone, other].entries()) {
    page.setDefaultTimeout(30_000);
    page.on("pageerror", (error) => errors.push(`${index}: ${error.message}`));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${index}: ${message.text()}`);
    });
  }
  progress("seed host provider card without an embed URL");
  await host.goto(origin);
  await host.locator('[data-home-ready="true"]').waitFor();
  await host.waitForFunction(async () =>
    (await indexedDB.databases()).some((db) => db.name === "reelcase"),
  );
  await host.evaluate(async () => {
    localStorage.setItem(
      "reelcase.follows.v1",
      JSON.stringify({
        channels: [{ id: "yt:qa", kind: "youtube", handle: "host-creator", title: "Host creator" }],
        savedAt: Date.now(),
      }),
    );
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open("reelcase");
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction("remote-cache", "readwrite"),
        store = tx.objectStore("remote-cache");
      store.put({ folders: [], checkedAt: Date.now() }, "meta");
      store.put(
        {
          id: "qa-host-youtube",
          name: "Host YouTube title",
          folderId: "yt:qa",
          path: "private host catalog path",
          extension: "yt",
          mime: "video/youtube",
          size: 0,
          duration: 30,
          addedAt: Date.now(),
          remote: { kind: "youtube", videoId: "dQw4w9WgXcQ", channelName: "Host creator" },
        },
        "video:qa-host-youtube",
      );
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
  await host.reload();
  await host.getByText("1 indexed", { exact: true }).waitFor();
  await host.getByRole("button", { name: "Watch room", exact: true }).click();
  await host.getByRole("button", { name: "Start room", exact: true }).click();
  const room = (await host.getByRole("heading", { name: /^Room RC/ }).innerText())
    .replace("Room ", "")
    .trim();
  const invitation = host.getByRole("region", { name: "Join room by QR" });
  const qr = invitation.getByRole("img", { name: "Scan to join this Watch Room" });
  await qr.waitFor();
  const pixels = await qr.evaluate(async (image) => {
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 512, 512);
    ctx.drawImage(image, 0, 0, 512, 512);
    return Array.from(ctx.getImageData(0, 0, 512, 512).data);
  });
  const decoded = jsQR(Uint8ClampedArray.from(pixels), 512, 512)?.data;
  assert.ok(decoded, "QR must decode");
  const link = new URL(decoded);
  assert.equal(link.origin, "http://192.168.1.68:8080");
  assert.equal(link.searchParams.get("room"), room);
  assert.equal(link.searchParams.get("theater"), "1");
  assert.equal(await invitation.locator("[data-room-invite-url]").getAttribute("href"), decoded);
  await invitation.scrollIntoViewIfNeeded();
  await invitation.screenshot({ path: shot("qr-desktop") });
  checks.push("QR image decodes to the exact phone-reachable room invitation, not loopback");
  if (existingGuestCatalog) {
    await other.goto(origin);
    await other.locator('[data-home-ready="true"]').waitFor();
    await other.waitForFunction(async()=>(await indexedDB.databases()).some(db=>db.name==="reelcase"));
    await other.evaluate(async()=>{
      localStorage.setItem("reelcase.follows.v1",JSON.stringify({channels:[{id:"yt:guest",kind:"youtube",handle:"guest-creator",title:"Guest creator"}],savedAt:Date.now()}));
      const db=await new Promise((resolve,reject)=>{const request=indexedDB.open("reelcase");request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
      await new Promise((resolve,reject)=>{
        const tx=db.transaction("remote-cache","readwrite"),store=tx.objectStore("remote-cache");
        store.put({folders:[],checkedAt:Date.now()},"meta");
        store.put({id:"qa-host-youtube",name:"Guest personal title",folderId:"yt:guest",path:"guest-owned",extension:"yt",mime:"video/youtube",size:0,addedAt:Date.now(),remote:{kind:"youtube",videoId:"aqz-KE-bpKQ",channelName:"Guest creator"}},"video:qa-host-youtube");
        tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);
      });
      db.close();
    });
  }
  progress(existingGuestCatalog ? "empty phone and independent guest catalog join the host" : "two empty guest libraries join using decoded room parameters");
  const join = new URL(`${link.pathname}${link.search}`, origin).href;
  await Promise.all([phone.goto(join), other.goto(join)]);
  await Promise.all(
    [phone, other].map((page) =>
      page.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').waitFor({ timeout: 45_000 }),
    ),
  );
  const panel = (page) => page.getByRole("region", { name: "Room query and queue" });
  const order = (page) =>
    panel(page)
      .locator("[data-room-queue-id]")
      .evaluateAll((rows) => rows.map((row) => row.dataset.roomQueueId));
  const addLink = async (page, url) => {
    await panel(page).getByRole("textbox", { name: "Public video link", exact: true }).fill(url);
    await panel(page).getByRole("button", { name: "Add link to queue", exact: true }).click();
  };
  const timing = page => page.getByRole("region",{name:"My playback timing",exact:true});
  const setTiming = async (page, seconds) => {
    await timing(page).getByRole("spinbutton",{name:"My timing offset in seconds",exact:true}).fill(String(seconds));
    await timing(page).getByRole("button",{name:"Apply timing",exact:true}).click();
    await timing(page).locator(`[data-guest-offset="${seconds}"]`).waitFor();
  };
  const syncRequests = page => page.evaluate(()=>window.__roomPackets.filter(packet=>packet.type==="sync-request").length);
  const waitOrder = async (page, ids) =>
    page.waitForFunction(
      (ids) =>
        JSON.stringify(
          [...document.querySelectorAll("[data-room-queue-id]")].map(
            (row) => row.dataset.roomQueueId,
          ),
        ) === JSON.stringify(ids),
      ids,
    );
  if (existingGuestCatalog) {
    await panel(other).getByRole("textbox",{name:"Search room videos",exact:true}).fill("Guest personal title");
    await panel(other).getByRole("button",{name:"Guest personal title",exact:true}).locator("..").getByRole("button",{name:"Queue",exact:true}).click();
    await waitOrder(phone,["room:youtube:aqz-KE-bpKQ"]);
    await panel(phone).getByRole("button",{name:"Request playback of Guest personal title",exact:true}).click();
    await Promise.all([host,phone,other].map(page=>page.locator('iframe[src*="youtube.com/embed/aqz-KE-bpKQ"]').waitFor()));
    await panel(host).getByRole("textbox",{name:"Search room videos",exact:true}).fill("Host YouTube title");
    await panel(host).getByRole("button",{name:"Host YouTube title",exact:true}).click();
    await Promise.all([phone,other].map(page=>page.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').waitFor()));
    await panel(other).getByRole("textbox",{name:"Search room videos",exact:true}).fill("");
    checks.push("a guest can queue and play its own title despite a colliding host catalog ID, while both saved titles remain intact");
  }
  await phone.evaluate(() => { window.__dropRoomPacket = "queue-batch"; });
  await Promise.all([
    addLink(phone, "https://www.twitch.tv/videos/1234"),
    addLink(other, "https://clips.twitch.tv/PublicRoomClip"),
  ]);
  await host.waitForFunction(() => document.querySelectorAll("[data-room-queue-id]").length === 2);
  const initial = await order(host);
  assert.equal(new Set(initial).size, 2);
  await Promise.all([waitOrder(phone, initial), waitOrder(other, initial)]);
  await phone.waitForFunction(() => {
    const packets = window.__roomPackets.filter(packet => packet.type === "queue-batch");
    return packets.length >= 2 && packets.at(-1).requestId === packets.at(-2).requestId;
  });
  await panel(phone).getByText(/1 queued/).waitFor();
  checks.push("a dropped guest batch retries with the same request ID and receives a targeted host receipt");
  const clip = "room:twitch:PublicRoomClip",
    vod = "room:twitch:1234";
  if (initial[0] !== clip)
    await panel(phone)
      .getByRole("button", { name: "Move Twitch · PublicRoomClip up", exact: true })
      .click();
  await Promise.all([
    waitOrder(host, [clip, vod]),
    waitOrder(phone, [clip, vod]),
    waitOrder(other, [clip, vod]),
  ]);
  await phone.reload();
  await waitOrder(phone, [clip, vod]);
  await panel(phone).getByRole("button", {name:"Request playback of Twitch · PublicRoomClip",exact:true}).waitFor();
  checks.push("rejoining an empty guest restores queue order and playable title details");
  await panel(phone).locator("[data-room-queue-id]").first().scrollIntoViewIfNeeded();
  await phone.screenshot({ path: shot("queue-mobile") });
  await panel(host).scrollIntoViewIfNeeded();
  await host.screenshot({ path: shot("queue-desktop") });
  checks.push(
    "simultaneous guest additions retain both titles and guest reorder reaches all clients",
  );
  await panel(phone)
    .getByRole("button", { name: "Request playback of Twitch · PublicRoomClip", exact: true })
    .click();
  await Promise.all(
    [host, phone, other].map((page) =>
      page.locator('iframe[src*="clips.twitch.tv/embed?clip=PublicRoomClip"]').waitFor(),
    ),
  );
  await Promise.all([waitOrder(host, [vod]), waitOrder(phone, [vod])]);
  await panel(phone)
    .getByRole("button", { name: "Request playback of Twitch · 1234", exact: true })
    .click();
  await Promise.all(
    [host, phone, other].map((page) =>
      page.waitForFunction(() => window.__twitchOptions?.video === "v1234"),
    ),
  );
  assert.deepEqual(await order(host), []);
  checks.push("guest-origin Twitch clips and VODs play on a host with no saved channel or title");
  await host.getByRole("button",{name:"Pause",exact:true}).first().click();
  await host.getByRole("button",{name:"+15 sec",exact:true}).click();
  await host.waitForFunction(()=>window.__roomTwitch.time>=15);
  const hostClock=await host.evaluate(()=>window.__roomTwitch.time);
  const beforeTiming=await syncRequests(phone);
  await setTiming(phone,2.5);
  await phone.waitForFunction(expected=>Math.abs(window.__roomTwitch.time-expected)<0.1,hostClock+2.5);
  assert.equal(await syncRequests(phone),beforeTiming,"device timing must not send a host seek");
  assert.equal(await host.evaluate(()=>window.__roomTwitch.time),hostClock);
  await timing(phone).getByRole("button",{name:"Ahead 0.25s",exact:true}).click();
  await phone.waitForFunction(expected=>Math.abs(window.__roomTwitch.time-expected)<0.1,hostClock+2.75);
  await timing(phone).getByRole("button",{name:"Behind 0.25s",exact:true}).click();
  await phone.waitForFunction(expected=>Math.abs(window.__roomTwitch.time-expected)<0.1,hostClock+2.5);
  await other.waitForFunction(expected=>Math.abs(window.__roomTwitch.time-expected)<0.1,hostClock);
  await setTiming(phone,-1.25);
  await phone.waitForFunction(expected=>Math.abs(window.__roomTwitch.time-expected)<0.1,hostClock-1.25);
  await setTiming(phone,2.5);
  await timing(phone).scrollIntoViewIfNeeded();
  await phone.screenshot({path:shot("timing-mobile")});
  await timing(other).scrollIntoViewIfNeeded();
  await other.screenshot({path:shot("timing-desktop")});
  await phone.reload();
  await phone.waitForFunction(expected=>Math.abs(window.__roomTwitch?.time-expected)<0.1,hostClock+2.5);
  await timing(phone).locator('[data-guest-offset="2.5"]').waitFor();
  await phone.evaluate(()=>{window.__timingCheckAt=Date.now();});
  await phone.waitForFunction(()=>Date.now()-window.__timingCheckAt>1400);
  await phone.evaluate(()=>{window.__roomTwitch.time=20.25;window.__roomTwitch.emit("seek");});
  await host.waitForFunction(()=>window.__twitchSeeks?.some(value=>Math.abs(value-17.75)<0.01));
  assert.equal(await phone.evaluate(()=>window.__roomPackets.some(packet=>packet.type==="sync-request"&&packet.seek&&Math.abs(packet.position-17.75)<0.01)),true);
  await host.getByRole("button",{name:"Pause",exact:true}).first().click();
  checks.push("positive and negative guest timing seeks only that Twitch device, survives reload, and translates native seek requests back to the host clock");
  await panel(host).getByRole("textbox",{name:"Search room videos",exact:true}).fill("Host YouTube title");
  await panel(host).getByRole("button",{name:"Host YouTube title",exact:true}).locator("..").getByRole("button",{name:"Queue",exact:true}).click();
  await waitOrder(phone,["qa-host-youtube"]);
  if (existingGuestCatalog) {
    await addLink(phone,"https://twitch.tv/videos/6789");
    await waitOrder(other,["qa-host-youtube","room:twitch:6789"]);
    await panel(other).getByRole("button",{name:"Queue Twitch · 6789 next",exact:true}).click();
    await waitOrder(other,["room:twitch:6789","qa-host-youtube"]);
    await panel(other).getByRole("button",{name:"Queue Host YouTube title next",exact:true}).click();
    await waitOrder(host,["qa-host-youtube","room:twitch:6789"]);
    await panel(other).getByRole("button",{name:"Remove Twitch · 6789 from queue",exact:true}).click();
    await waitOrder(phone,["qa-host-youtube"]);
    checks.push("guest next priority uses shared title metadata rather than the different title saved under the same ID");
  }
  await addLink(phone,"https://youtu.be/dQw4w9WgXcQ?t=12");
  await panel(phone).getByText(/1 already playing\/queued/).waitFor();
  await addLink(other,"https://m.youtube.com/shorts/dQw4w9WgXcQ");
  await panel(other).getByText(/1 already playing\/queued/).waitFor();
  assert.deepEqual(await order(host),["qa-host-youtube"]);
  await panel(phone).getByRole("button",{name:"Request next",exact:true}).click();
  await Promise.all([host,phone,other].map(page=>page.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').waitFor()));
  await waitOrder(phone,[]);
  checks.push("saved titles and alternate public URLs share one queue entry, and guest next requests advance once");
  await timing(phone).locator('[data-guest-offset="2.5"]').waitFor();
  await phone.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').contentFrame().locator("body").waitFor();
  await host.getByRole("button",{name:"Pause",exact:true}).first().click();
  await host.getByRole("button",{name:"+15 sec",exact:true}).click();
  const ytClock=await host.evaluate(()=>[...window.__roomPackets].reverse().find(packet=>packet.type==="sync")?.position);
  await setTiming(phone,1);
  await phone.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').contentFrame().locator("body").evaluate(async(body,expected)=>{
    await new Promise((resolve,reject)=>{const until=Date.now()+10000;const check=()=>{if(window.__roomCommands.some(command=>command.func==="seekTo"&&Math.abs(command.args[0]-expected)<0.1))resolve();else if(Date.now()>until)reject(new Error("guest YouTube seek did not use offset: "+JSON.stringify({expected,commands:window.__roomCommands.slice(-10)})));else setTimeout(check,25);};check();});
  },ytClock+1);
  await timing(phone).getByRole("button",{name:"Reset timing",exact:true}).click();
  await timing(phone).locator('[data-guest-offset="0"]').waitFor();
  checks.push("guest timing carries through queue source changes and YouTube receives a device-only offset seek");
  await addLink(phone,["https://youtu.be/aqz-KE-bpKQ","https://youtube.com/shorts/aqz-KE-bpKQ","https://twitch.tv/videos/3456","https://evil.example/file"].join("\n"));
  await waitOrder(host,["room:youtube:aqz-KE-bpKQ","room:twitch:3456"]);
  await panel(phone).getByText(/2 queued · 1 already playing\/queued · 1 invalid or unavailable/).waitFor();
  await panel(other).getByRole("button",{name:"Queue Twitch · 3456 next",exact:true}).click();
  await waitOrder(host,["room:twitch:3456","room:youtube:aqz-KE-bpKQ"]);
  assert.equal(await host.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').count(),1,"queue priority keeps current playback intact");
  await panel(host).getByRole("button",{name:"Clear queue",exact:true}).click();
  await waitOrder(phone,[]);
  const fullQueue=Array.from({length:48},(_,i)=>`room:twitch:${20000+i}`);
  await addLink(host,fullQueue.map(id=>`https://twitch.tv/videos/${id.split(":").pop()}`).join("\n"));
  await waitOrder(phone,fullQueue);
  await panel(phone).getByRole("textbox",{name:"Public video link",exact:true}).fill("https://twitch.tv/videos/99999");
  assert.equal(await panel(phone).getByRole("button",{name:"Add link to queue",exact:true}).isDisabled(),true);
  await panel(phone).getByRole("button",{name:"Queue Twitch · 20047 next",exact:true}).click();
  const fullReordered=[fullQueue[47],...fullQueue.slice(0,47)];
  await waitOrder(host,fullReordered);
  await phone.reload();
  await waitOrder(phone,fullReordered);
  await panel(phone).getByRole("button",{name:"Request playback of Twitch · 20047",exact:true}).waitFor();
  await host.evaluate(() => { window.__dropRoomPacket = "queue-result"; });
  await panel(phone).getByRole("button",{name:"Request queue shuffle",exact:true}).click();
  await host.waitForFunction(before=>JSON.stringify([...document.querySelectorAll("[data-room-queue-id]")].map(row=>row.dataset.roomQueueId))!==JSON.stringify(before),fullReordered);
  const shuffled=await order(host);
  assert.deepEqual([...shuffled].sort(),[...fullQueue].sort());
  await Promise.all([waitOrder(phone,shuffled),waitOrder(other,shuffled)]);
  await phone.waitForFunction(() => {
    const packets = window.__roomPackets.filter(packet => packet.type === "queue-shuffle");
    return packets.length >= 2 && packets.at(-1).requestId === packets.at(-2).requestId;
  });
  await panel(phone).getByText("Queue shuffle confirmed by the host.", { exact: true }).waitFor();
  await waitOrder(host, shuffled);
  assert.equal(await panel(phone).getByText(/awaiting host confirmation · retrying automatically/).count(), 0);
  checks.push("a lost shuffle receipt is replayed after retry without shuffling again or leaving a pending action");
  assert.equal(await host.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').count(),1);
  await panel(phone).getByRole("button",{name:"Request queue shuffle",exact:true}).scrollIntoViewIfNeeded();
  await phone.screenshot({path:shot("queue-controls-mobile")});
  await panel(host).getByRole("button",{name:"Shuffle queue",exact:true}).scrollIntoViewIfNeeded();
  await host.screenshot({path:shot("queue-controls-desktop")});
  await phone.reload();
  await waitOrder(phone,shuffled);
  checks.push("guest shuffle preserves all 48 titles and current playback, confirms one shared order, and survives reconnect");
  await panel(host).getByRole("button",{name:"Clear queue",exact:true}).click();
  await waitOrder(phone,[]);
  checks.push("batch pastes report invalid and duplicate links, respect the full queue cap, and play-next priority survives guest reload");
  await phone.evaluate(() => { window.__blockRoomPacket = "queue-batch"; });
  await addLink(phone, "https://twitch.tv/videos/987654");
  await panel(phone).getByText(/1 change awaiting host confirmation/).waitFor();
  await panel(phone).getByRole("textbox", { name: "Public video link", exact: true }).scrollIntoViewIfNeeded();
  await phone.screenshot({ path: shot("pending-mobile") });
  await panel(phone).getByText(/The host did not confirm a queue change/).waitFor({ timeout: 20_000 });
  assert.deepEqual(await order(host), []);
  assert.equal(await panel(phone).getByRole("textbox", { name: "Public video link", exact: true }).inputValue(), "https://twitch.tv/videos/987654");
  assert.equal(await panel(phone).getByText(/awaiting host confirmation · retrying automatically/).count(), 0);
  await phone.evaluate(() => { window.__blockRoomPacket = ""; });
  await panel(phone).getByRole("button", { name: "Add link to queue", exact: true }).click();
  await waitOrder(host, ["room:twitch:987654"]);
  await panel(phone).getByText(/1 queued/).waitFor();
  await panel(host).getByRole("button", { name: "Clear queue", exact: true }).click();
  await waitOrder(phone, []);
  checks.push("unconfirmed requests stop after twelve seconds, resync without an optimistic queue, retain pasted links and can be submitted after recovery");
  await Promise.all([
    addLink(phone, "https://youtu.be/aqz-KE-bpKQ"),
    addLink(other, "https://www.twitch.tv/videos/5678"),
  ]);
  await host.waitForFunction(() => document.querySelectorAll("[data-room-queue-id]").length === 2);
  await panel(phone)
    .getByRole("button", { name: "Remove YouTube · aqz-KE-bpKQ from queue", exact: true })
    .click();
  await Promise.all([
    waitOrder(host, ["room:twitch:5678"]),
    waitOrder(other, ["room:twitch:5678"]),
  ]);
  checks.push("guest removal does not overwrite another guest’s addition");
  await panel(host).getByRole("button", { name: "Clear queue", exact: true }).click();
  await waitOrder(phone, []);
  await panel(host)
    .getByRole("textbox", { name: "Search room videos", exact: true })
    .fill("Host YouTube title");
  await panel(host).getByRole("button", { name: "Host YouTube title", exact: true }).click();
  await phone.locator('iframe[src*="youtube.com/embed/dQw4w9WgXcQ"]').waitFor();
  await addLink(phone, "https://www.twitch.tv/videos/5678");
  await waitOrder(host, ["room:twitch:5678"]);
  await host
    .frameLocator('iframe[title="Host YouTube title"]')
    .locator("body")
    .evaluate(() =>
      window.parent.postMessage(JSON.stringify({ event: "onStateChange", info: 0 }), "*"),
    );
  await Promise.all(
    [host, phone].map((page) =>
      page.waitForFunction(() => window.__twitchOptions?.video === "v5678"),
    ),
  );
  await waitOrder(phone, []);
  checks.push("YouTube completion advances the canonical shared queue");
  await addLink(phone, "https://youtu.be/aqz-KE-bpKQ");
  await waitOrder(host, ["room:youtube:aqz-KE-bpKQ"]);
  await host.evaluate(() => window.__roomTwitch.emit("ended"));
  await Promise.all(
    [host, phone].map((page) =>
      page.locator('iframe[src*="youtube.com/embed/aqz-KE-bpKQ"]').waitFor(),
    ),
  );
  checks.push("Twitch VOD completion advances the shared queue");
  progress("local files share the playable queue without interrupting selection");
  await host.getByText("Local sharing, games & TV", {exact:true}).click();
  const localPicker=host.locator('input[type="file"][accept="video/*"]').first();
  const localSample=readFileSync("public/samples/tungsten-reel.mp4");
  await host.getByRole("checkbox",{name:/I confirm guests have access/}).check();
  await localPicker.setInputFiles({name:"First room file.mp4",mimeType:"video/mp4",buffer:localSample});
  assert.equal(await host.locator('iframe[src*="youtube.com/embed/aqz-KE-bpKQ"]').count(),1);
  await host.getByRole("heading",{name:"Playing together",exact:true}).waitFor();
  await host.getByRole("button",{name:"Queue selected local file",exact:true}).click();
  await host.waitForFunction(()=>document.querySelectorAll('[data-room-queue-id]').length===1);
  const firstLocal=(await order(host))[0];
  await addLink(other,"https://twitch.tv/videos/2468");
  await waitOrder(host,[firstLocal,"room:twitch:2468"]);
  await localPicker.setInputFiles({name:"Second room file.mp4",mimeType:"video/mp4",buffer:localSample});
  await host.getByRole("heading",{name:"Playing together",exact:true}).waitFor();
  await host.getByRole("button",{name:"Queue selected local file",exact:true}).click();
  await host.waitForFunction(()=>document.querySelectorAll('[data-room-queue-id]').length===3);
  const secondLocal=(await order(host))[2];
  assert.equal(await host.evaluate(()=>window.__roomLocalUrls.size),0,"queued files allocate no playback URLs");
  await waitOrder(phone,[firstLocal,"room:twitch:2468",secondLocal]);
  await panel(phone).getByRole("button",{name:"Queue Second room file.mp4 next",exact:true}).click();
  await waitOrder(phone,[secondLocal,firstLocal,"room:twitch:2468"]);
  await panel(phone).getByRole("button",{name:"Move Second room file.mp4 down",exact:true}).click();
  await waitOrder(host,[firstLocal,secondLocal,"room:twitch:2468"]);
  await panel(phone).locator('[data-room-queue-id]').first().scrollIntoViewIfNeeded();
  await phone.screenshot({path:shot("local-queue-mobile")});
  await panel(host).scrollIntoViewIfNeeded();
  await host.screenshot({path:shot("local-queue-desktop")});
  await panel(phone).getByRole("button",{name:"Request next",exact:true}).click();
  await host.locator("video").waitFor();
  await host.locator("video").evaluate(video=>{video.loop=true;});
  await phone.getByRole("button",{name:"Request next",exact:true}).waitFor();
  await phone.waitForFunction(()=>document.querySelector('video[data-room-stream]')?.getVideoPlaybackQuality().totalVideoFrames>3);
  assert.equal(await phone.getByLabel("Shared local video: First room file.mp4",{exact:true}).count(),1);
  const firstStream=await phone.locator('video[data-room-stream]').evaluate(video=>video.srcObject.id);
  assert.equal(await host.evaluate(()=>window.__roomLocalUrls.size),1);
  await host.locator("video").evaluate(video=>video.dispatchEvent(new Event("ended")));
  await phone.getByLabel("Shared local video: Second room file.mp4",{exact:true}).waitFor();
  await host.locator("video").evaluate(video=>{video.loop=true;});
  await phone.waitForFunction(()=>document.querySelector('video[data-room-stream]')?.getVideoPlaybackQuality().totalVideoFrames>3);
  await phone.waitForFunction(first=>document.querySelector('video[data-room-stream]')?.srcObject?.id!==first,firstStream);
  assert.equal(await host.evaluate(()=>window.__roomLocalUrls.size),1,"replacing a file revokes its previous playback URL");
  await waitOrder(phone,["room:twitch:2468"]);
  await host.locator("video").evaluate(video=>video.dispatchEvent(new Event("ended")));
  await Promise.all([host,phone].map(page=>page.waitForFunction(()=>window.__twitchOptions?.video==="v2468")));
  await phone.locator('video[data-room-stream]').waitFor({state:"detached"});
  assert.equal(await host.evaluate(()=>window.__roomLocalUrls.size),0,"online playback releases the local file URL");
  await waitOrder(phone,[]);
  checks.push("two queued local files stream to empty guests, advance in order, and release RTC playback on the next online title");
  progress("real local RTC stream, phone playback and late rejoin");
  await host
    .locator('input[type="file"][accept="video/*"]')
    .first()
    .setInputFiles("public/samples/tungsten-reel.mp4");
  await host.getByRole("checkbox", { name: /I confirm guests have access/ }).check();
  await host.getByRole("button", { name: "Send sharing request", exact: true }).click();
  await host.locator("video").evaluate((video) => (video.loop = true));
  await host.evaluate(() => {
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      HTMLMediaElement.prototype.play = original;
      return Promise.reject(new DOMException("QA autoplay restriction", "NotAllowedError"));
    };
  });
  await host.getByRole("button", { name: "Play", exact: true }).first().click();
  await host.getByText("This browser needs a Play press to start the local video.", { exact: true }).waitFor();
  assert.equal(await host.locator("video").evaluate((video) => video.paused), true);
  await host.getByRole("button", { name: "Play", exact: true }).first().click();
  checks.push("blocked local autoplay returns the host to usable Play controls");
  const incoming = phone.locator("video[data-room-stream]");
  await incoming.waitFor({ timeout: 45_000 });
  if (await phone.getByRole("button", { name: "Play on this device", exact: true }).isVisible())
    await phone.getByRole("button", { name: "Play on this device", exact: true }).click();
  await phone.waitForFunction(
    () =>
      document.querySelector("video[data-room-stream]")?.getVideoPlaybackQuality()
        .totalVideoFrames > 10,
    null,
    { timeout: 30_000 },
  );
  const decodedFrames = await incoming.evaluate(
    (video) => video.getVideoPlaybackQuality().totalVideoFrames,
  );
  await incoming.scrollIntoViewIfNeeded();
  const localControls=phone.getByRole("region",{name:"Shared local playback",exact:true});
  await localControls.getByRole("button",{name:"Pause together",exact:true}).click();
  await host.waitForFunction(()=>document.querySelector("video")?.paused===true);
  await phone.waitForFunction(()=>document.querySelector('video[data-room-stream]')?.paused===true);
  const streamBeforeTiming=await incoming.evaluate(video=>video.srcObject.id);
  const pausedHostTime=await host.locator("video").evaluate(video=>video.currentTime);
  const requestsBeforeStreamTiming=await syncRequests(phone);
  await setTiming(phone,2);
  await timing(phone).getByText(/Timer correction only/).waitFor();
  assert.equal(await syncRequests(phone),requestsBeforeStreamTiming);
  assert.equal(await incoming.evaluate(video=>video.srcObject.id),streamBeforeTiming);
  assert.equal(await host.locator("video").evaluate(video=>video.currentTime),pausedHostTime);
  await timing(phone).scrollIntoViewIfNeeded();
  await phone.screenshot({path:shot("stream-timing-mobile")});
  await setTiming(phone,0);
  const slider=localControls.getByRole("slider",{name:"Seek shared video",exact:true});
  await slider.waitFor();
  await slider.focus();
  await phone.keyboard.press("Home");
  await host.waitForFunction(()=>document.querySelector("video")?.currentTime<0.1);
  await phone.keyboard.press("ArrowRight");
  await host.waitForFunction(()=>document.querySelector("video")?.currentTime>=0.2);
  await localControls.getByRole("button",{name:"Mute this device",exact:true}).click();
  assert.equal(await incoming.evaluate(video=>video.muted),true);
  assert.equal(await host.locator("video").evaluate(video=>video.muted),false);
  await localControls.getByRole("button",{name:"Resume together",exact:true}).click();
  await host.waitForFunction(()=>document.querySelector("video")?.paused===false);
  await phone.waitForFunction(()=>document.querySelector('video[data-room-stream]')?.paused===false);
  await localControls.getByRole("button",{name:"Fullscreen shared video",exact:true}).click();
  await phone.waitForFunction(()=>document.fullscreenElement?.getAttribute("aria-label")==="Shared local playback");
  assert.equal(await localControls.getByRole("button",{name:"Pause together",exact:true}).isVisible(),true);
  await phone.evaluate(()=>document.exitFullscreen());
  await localControls.getByRole("button",{name:"Resync video",exact:true}).click();
  checks.push("guest stream controls pause and seek the host, resume both clients, keep sound local, and retain controls in fullscreen");
  await phone.screenshot({ path: shot("local-mobile") });
  await phone.getByRole("button", { name: "Pause", exact: true }).first().click();
  await host.waitForFunction(() => document.querySelector("video")?.paused);
  await phone.getByRole("button", { name: "Play", exact: true }).first().click();
  await host.waitForFunction(() => document.querySelector("video")?.paused === false);
  await phone.reload();
  await phone.locator("video[data-room-stream]").waitFor({ timeout: 45_000 });
  await phone.waitForFunction(
    () => document.querySelector("video[data-room-stream]")?.readyState >= 2,
    null,
    { timeout: 30_000 },
  );
  checks.push(
    "local bytes stream over RTC without a guest file, guest controls reach host, and reload rejoins",
  );
  await phone.getByRole("button",{name:"Pause",exact:true}).first().click();
  await host.waitForFunction(()=>document.querySelector("video")?.paused);
  const localMeta=await host.evaluate(()=>[...window.__roomPackets].reverse().find(packet=>packet.type==="room-state"&&packet.media?.local)?.media.local);
  assert.ok(localMeta);
  await phone.evaluate(({bytes,meta})=>{
    const file=new File([new Uint8Array(bytes)],meta.name,{type:"video/mp4",lastModified:meta.modified});
    const transfer=new DataTransfer();transfer.items.add(file);
    const input=document.querySelector('input[type="file"][accept="video/*"]');input.files=transfer.files;input.dispatchEvent(new Event("change",{bubbles:true}));
  },{bytes:[...localSample],meta:localMeta});
  const matched=phone.locator("video:not([data-room-stream])");
  await matched.waitFor();
  await host.locator("video").evaluate(video=>{video.currentTime=1;});
  await phone.waitForFunction(()=>Math.abs(document.querySelector("video")?.currentTime-1)<0.1);
  await setTiming(phone,1.5);
  await phone.waitForFunction(()=>Math.abs(document.querySelector("video")?.currentTime-2.5)<0.1);
  assert.equal(await host.locator("video").evaluate(video=>video.currentTime),1);
  await phone.evaluate(()=>{window.__timingCheckAt=Date.now();});
  await phone.waitForFunction(()=>Date.now()-window.__timingCheckAt>1400);
  await matched.evaluate(video=>{video.currentTime=4;});
  await host.waitForFunction(()=>Math.abs(document.querySelector("video")?.currentTime-2.5)<0.1);
  await setTiming(phone,0);
  checks.push("RTC timer correction never seeks the host; an optional matching copy gets independent video timing and translates shared seeks correctly");
  for (const page of [phone, other]) {
    const saved = await page.evaluate(async () => {
      const db = await new Promise((resolve) => {
        const request = indexedDB.open("reelcase");
        request.onsuccess = () => resolve(request.result);
      });
      const keys = await new Promise((resolve) => {
        const request = db.transaction("remote-cache").objectStore("remote-cache").getAllKeys();
        request.onsuccess = () => resolve(request.result);
      });
      db.close();
      return {
        videos: keys.filter((key) => String(key).startsWith("video:")).length,
        follows: JSON.parse(localStorage.getItem("reelcase.follows.v1") ?? '{"channels":[]}')
          .channels.length,
      };
    });
    const expected=existingGuestCatalog&&page===other?1:0;
    assert.deepEqual(saved, { videos: expected, follows: expected });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
  }
  if (existingGuestCatalog) {
    const personalId=await other.evaluate(async()=>{
      const db=await new Promise(resolve=>{const request=indexedDB.open("reelcase");request.onsuccess=()=>resolve(request.result);});
      const row=await new Promise(resolve=>{const request=db.transaction("remote-cache").objectStore("remote-cache").get("video:qa-host-youtube");request.onsuccess=()=>resolve(request.result);});
      db.close();return row?.remote?.videoId;
    });
    assert.equal(personalId,"aqz-KE-bpKQ");
    checks.push("host playback metadata overrides a colliding guest catalog ID without changing the guest's saved video");
  }
  const packets = await host.evaluate(() => JSON.stringify(window.__roomPackets));
  assert.equal(/private host catalog path|blob:|C:\\/.test(packets), false);
  checks.push(
    "guest saved libraries and follows stay unchanged; host file paths and blob URLs stay private",
  );
  await invitation.scrollIntoViewIfNeeded();
  await host.screenshot({ path: shot("room-desktop") });
  await phone.getByRole("button", { name: "Leave room", exact: true }).click();
  assert.equal(await phone.locator("video[data-room-stream]").count(), 0);
  await host.getByRole("button", {name:"Leave room",exact:true}).click();
  await host.waitForFunction(()=>window.__roomLocalUrls.size===0);
  checks.push("queued files allocate no playback URLs; switching files, switching providers and leaving release prior URLs");
  assert.deepEqual(errors, []);
  const report = {
    ok: true,
    origin,
    existingGuestCatalog,
    room,
    decodedQr: decoded,
    decodedFrames,
    checks,
    errors,
    limitation:
      "Three isolated Chromium clients and real RTC local-media decoding; provider embeds and network-address discovery are fixtures. Physical phone scanning, provider availability and cross-network TURN remain separate checks.",
  };
  writeFileSync(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  for (const [index, page] of pages.entries()) {
    await page.screenshot({ path: shot(`failure-${index}`) }).catch(() => {});
    console.log(
      JSON.stringify({
        index,
        body: (
          await page
            .locator("body")
            .innerText()
            .catch(() => "")
        ).slice(0, 1200),
      }),
    );
  }
  writeFileSync(output, JSON.stringify({ ok: false, errors, checks, error: error.stack }, null, 2));
  throw error;
} finally {
  await browser.close();
}
