import assert from "node:assert/strict";
import { writeFileSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import jsQR from "jsqr";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const origin = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const existingGuestCatalog = process.argv.includes("--existing-guest");
const refined = process.argv.includes('--refined');
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
      window.__roomConnectionCount = 0;
      const PeerConnection = window.RTCPeerConnection;
      window.RTCPeerConnection = class extends PeerConnection { constructor(config) { super(config); window.__roomConnectionCount++; } };
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
            if (['queue-batch', 'queue-action', 'queue-edit', 'video-request', 'next-request'].includes(packet.d.type)) window.__hostRequestChannel = this;
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
      window.__sendHostTestPacket = packet => send.call(window.__hostRequestChannel, JSON.stringify({ t: 'd', d: packet }));
      window.Twitch = {
        Player: class {
          static READY = "ready";
          static PLAY = "play";
          static PAUSE = "pause";
          static PLAYING = "playing";
          static ENDED = "ended";
          static SEEK = "seek";
          constructor(target, options) {
            window.__twitchInstances = (window.__twitchInstances ?? 0) + 1;
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
        route.fulfill({ contentType: "text/html", body: '<p>Public provider fixture</p><script>window.__roomCommands=[];let ready=false;addEventListener("message",e=>{try{const data=typeof e.data==="string"?JSON.parse(e.data):e.data;if(data?.event==="listening"&&!ready){ready=true;parent.postMessage(JSON.stringify({event:"infoDelivery",info:{duration:30,videoData:{isLive:false}}}),"*");parent.postMessage(JSON.stringify({event:"onReady"}),"*");}if(data?.event==="command")window.__roomCommands.push(data);}catch{}});</script>' }),
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
  // Device recovery deliberately suppresses player echoes for up to 1500ms.
  // Emit the simulated user seek after that guard, rather than racing it.
  await phone.waitForFunction(()=>Date.now()-window.__timingCheckAt>1800);
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
  // A paused/staged player must not advance on a stale ended event.
  if (await host.getByRole('button', { name: 'Pause', exact: true }).first().isVisible()) await host.getByRole('button', { name: 'Pause', exact: true }).first().click();
  await host.getByRole('heading', { name: 'Paused together', exact: true }).waitFor();
  await host.frameLocator('iframe[title="Host YouTube title"]').locator('body').evaluate(() => window.parent.postMessage(JSON.stringify({ event: 'onStateChange', info: 0 }), '*'));
  await waitOrder(host, ['room:twitch:5678']);
  await host.getByRole('button', { name: 'Play', exact: true }).first().click();
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
  if (refined) {
    const connections=await phone.evaluate(()=>window.__roomConnectionCount);
    const hostPosition=await host.locator('video').evaluate(video=>video.currentTime);
    await phone.getByRole('button',{name:'Reload this player',exact:true}).click();
    await phone.waitForFunction(id=>document.querySelector('video[data-room-stream]')?.srcObject?.id===id&&document.querySelector('video[data-room-stream]').getVideoPlaybackQuality().totalVideoFrames>3,firstStream);
    assert.equal(await phone.evaluate(()=>window.__roomConnectionCount),connections);
    assert.ok(await host.locator('video').evaluate(video=>!video.paused&&video.currentTime>0));
    assert.ok(await host.locator('video').evaluate(video=>video.currentTime)>=hostPosition);
    checks.push('a guest reloads its incoming local decoder without a new peer connection, host pause or queue mutation');
  }
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
  await slider.press("Home");
  await host.waitForFunction(()=>document.querySelector("video")?.currentTime<0.1);
  await slider.press("ArrowRight");
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
  if (refined) {
    progress('queue undo, reliable playback requests, host permissions and recovery');
    if ((await order(host)).length) { await panel(host).getByRole('button', { name: 'Clear queue', exact: true }).click(); await waitOrder(phone, []); }
    await addLink(host, 'https://youtu.be/aqz-KE-bpKQ\nhttps://twitch.tv/videos/777777\nhttps://twitch.tv/videos/888888');
    const queued = await order(host); await waitOrder(phone, queued);
    await host.evaluate(() => { window.__dropRoomPacket = 'queue-result'; });
    await panel(phone).getByRole('button', { name: 'Request playback of YouTube · aqz-KE-bpKQ', exact: true }).click();
    await host.locator('iframe[src*="youtube.com/embed/aqz-KE-bpKQ"]').waitFor();
    await panel(phone).getByText('Video selection confirmed by the host.', { exact: true }).waitFor({ timeout: 10000 });
    await phone.waitForFunction(() => { const packets = window.__roomPackets.filter(packet => packet.type === 'video-request'); return packets.length >= 2 && packets.at(-1).requestId === packets.at(-2).requestId; });
    assert.equal(await host.evaluate(() => new Set(window.__roomPackets.filter(packet => packet.type === 'video' && packet.videoId === 'room:youtube:aqz-KE-bpKQ').map(packet => packet.selectionRevision)).size), 1);
    await phone.evaluate(() => { window.__dropRoomPacket = 'next-request'; });
    await panel(phone).getByRole('button', { name: 'Request next', exact: true }).click();
    await host.waitForFunction(() => window.__twitchOptions?.video === 'v777777');
    await panel(phone).getByText('Next-title request confirmed by the host.', { exact: true }).waitFor({ timeout: 10000 });
    await waitOrder(host, ['room:twitch:888888']); await waitOrder(phone, ['room:twitch:888888']);
    checks.push('lost video-selection receipts and lost next requests retry with one identity, without repeated selection or double-skipping');

    const permission = panel(host).getByRole('checkbox', { name: 'Allow guests to edit queue and select videos', exact: true });
    await permission.uncheck(); await panel(phone).getByText(/The host has locked queue edits and video selection/).waitFor();
    assert.equal(await panel(phone).getByRole('button', { name: 'Request next', exact: true }).isDisabled(), true);
    await phone.evaluate(() => window.__sendHostTestPacket({ type: 'queue-action', requestId: 'qa-locked-remove', operation: { kind: 'remove', id: 'room:twitch:888888' } }));
    await host.waitForFunction(() => window.__roomPackets.some(packet => packet.type === 'queue-result' && packet.requestId === 'qa-locked-remove' && packet.text.includes('locked')));
    await waitOrder(host, ['room:twitch:888888']);
    await phone.evaluate(() => window.__sendHostTestPacket({ type: 'queue-edit', requestId: 'qa-locked-batch', operation: { kind: 'remove', ids: ['room:twitch:888888'] } }));
    await host.waitForFunction(() => window.__roomPackets.some(packet => packet.type === 'queue-result' && packet.requestId === 'qa-locked-batch' && packet.text.includes('locked')));
    await waitOrder(host, ['room:twitch:888888']);
    await phone.getByRole('textbox', { name: 'Room chat message', exact: true }).fill('Queue locked, chat still works');
    await phone.getByRole('button', { name: 'Send', exact: true }).click(); await host.getByText(/Queue locked, chat still works/).waitFor();
    await permission.check(); await panel(phone).getByRole('button', { name: 'Request next', exact: true }).waitFor();
    await panel(host).getByRole('button', { name: 'Remove Twitch · 888888 from queue', exact: true }).click(); await waitOrder(phone, []);
    await panel(host).getByRole('button', { name: 'Undo queue change', exact: true }).click(); await waitOrder(phone, ['room:twitch:888888']);
    await panel(host).getByRole('button', { name: 'Clear queue', exact: true }).click(); await waitOrder(phone, []);
    await panel(host).getByRole('button', { name: 'Undo queue change', exact: true }).click(); await waitOrder(phone, ['room:twitch:888888']);
    checks.push('host queue lock disables guest editing and rejects direct stale intentions while chat works; undo restores removals and cleared order');

    const extra = Array.from({ length: 6 }, (_, i) => `https://youtu.be/queueQA000${i}`);
    await addLink(host, extra.join('\n')); let recoveryOrder = await order(host); await waitOrder(phone, recoveryOrder);
    progress('exact positions, selected-title batches and reusable link exports');
    const lastRow = panel(phone).locator('[data-room-queue-id]').last();
    await lastRow.getByRole('button', { name: /^Change position of/ }).click();
    await lastRow.getByRole('combobox', { name: /^New position for/ }).selectOption(recoveryOrder[0]);
    await lastRow.getByRole('button', { name: 'Apply position', exact: true }).click();
    const repositioned = [recoveryOrder.at(-1), ...recoveryOrder.slice(0,-1)];
    await Promise.all([waitOrder(host,repositioned), waitOrder(phone,repositioned), waitOrder(other,repositioned)]);
    await panel(phone).getByText('Queue change confirmed by the host.', {exact:true}).waitFor();
    await panel(host).getByRole('button',{name:'Undo queue change',exact:true}).click(); await waitOrder(phone,recoveryOrder);
    checks.push('a phone guest moves a title directly to an exact position and host Undo restores the order across all clients');

    await panel(phone).getByRole('button',{name:'Select titles',exact:true}).click();
    await panel(phone).getByRole('textbox',{name:'Find a queued title',exact:true}).fill('queueQA0002');
    await panel(phone).getByRole('button',{name:'Select visible titles',exact:true}).click();
    await panel(phone).getByRole('textbox',{name:'Find a queued title',exact:true}).fill('queueQA0004');
    await panel(phone).getByRole('button',{name:'Select visible titles',exact:true}).click();
    await panel(phone).getByText('2 selected · includes filtered titles',{exact:true}).waitFor();
    await panel(phone).getByRole('textbox',{name:'Find a queued title',exact:true}).fill('');
    await addLink(host,'https://youtu.be/queueBatchNew'); recoveryOrder = await order(host); await waitOrder(phone,recoveryOrder);
    const selectedIds = ['room:youtube:queueQA0002','room:youtube:queueQA0004'];
    const prioritized = [...recoveryOrder.filter(id=>selectedIds.includes(id)),...recoveryOrder.filter(id=>!selectedIds.includes(id))];
    await host.evaluate(()=>{window.__dropRoomPacket='queue-result';});
    await panel(phone).getByRole('button',{name:'Queue selected next',exact:true}).click();
    await Promise.all([waitOrder(host,prioritized),waitOrder(phone,prioritized),waitOrder(other,prioritized)]);
    await panel(phone).getByText('Selected-title change confirmed by the host.',{exact:true}).waitFor({timeout:10000});
    await phone.waitForFunction(()=>{const packets=window.__roomPackets.filter(packet=>packet.type==='queue-edit');return packets.length>=2&&packets.at(-1).requestId===packets.at(-2).requestId;});
    await panel(host).getByRole('button',{name:'Undo queue change',exact:true}).click(); await waitOrder(phone,recoveryOrder);
    checks.push('filtered selections preserve unrelated concurrent additions; one guest batch retries a dropped receipt without reapplying, and one Undo restores the complete edit');

    const selectTwo = async()=>{for(const id of selectedIds)await panel(phone).locator(`[data-room-queue-id="${id}"]`).getByRole('checkbox').check();};
    await selectTwo(); await panel(phone).getByRole('button',{name:'Move selected to end',exact:true}).click();
    const appended = [...recoveryOrder.filter(id=>!selectedIds.includes(id)),...recoveryOrder.filter(id=>selectedIds.includes(id))];
    await waitOrder(host,appended); await panel(phone).getByText('Selected-title change confirmed by the host.',{exact:true}).waitFor();
    await panel(host).getByRole('button',{name:'Undo queue change',exact:true}).click();await waitOrder(phone,recoveryOrder);
    await selectTwo(); await panel(phone).getByRole('button',{name:'Remove selected',exact:true}).click();
    await waitOrder(host,recoveryOrder.filter(id=>!selectedIds.includes(id))); await panel(phone).getByText('Selected-title change confirmed by the host.',{exact:true}).waitFor();
    await panel(host).getByRole('button',{name:'Undo queue change',exact:true}).click();await waitOrder(phone,recoveryOrder);
    await selectTwo();
    await permission.uncheck();await panel(phone).getByText(/The host has locked queue edits and video selection/).waitFor();
    await panel(phone).getByRole('button',{name:'Done selecting',exact:true}).click();
    assert.equal(await panel(phone).getByLabel('Selected queue controls',{exact:true}).count(),0);
    await permission.check();await panel(phone).getByRole('button',{name:'Select titles',exact:true}).click();await selectTwo();
    checks.push('guests can dismiss selection mode when the host locks editing, without sending a queue mutation');
    await panel(phone).getByLabel('Selected queue controls',{exact:true}).evaluate(element=>element.scrollIntoView({block:'start'}));await phone.screenshot({path:shot('bulk-queue-mobile')});
    await panel(phone).getByRole('button',{name:'Done selecting',exact:true}).click();
    checks.push('selected titles can move to the end or be removed as one undoable batch without interrupting current playback');

    await panel(host).getByText(/^Save or share queue links/).click();
    const exported = await panel(host).getByRole('textbox',{name:'Exported queue links',exact:true}).inputValue();
    assert.equal(exported.split('\n').length,recoveryOrder.length);assert.doesNotMatch(exported,/blob:|fingerprint|RC-|Private|First room file/);
    await contexts[0].grantPermissions(['clipboard-read','clipboard-write']);
    await panel(host).getByRole('button',{name:'Copy queue links',exact:true}).click();
    await panel(host).getByText(`${recoveryOrder.length} public links copied in queue order.`,{exact:true}).waitFor();
    assert.equal((await host.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g,'\n'),exported);
    const downloadPromise=host.waitForEvent('download');await panel(host).getByRole('button',{name:'Download queue',exact:true}).click();const download=await downloadPromise;
    assert.equal(download.suggestedFilename(),'watch-together-queue.txt');assert.equal(readFileSync(await download.path(),'utf8'),exported+'\n');
    await addLink(host,exported);await waitOrder(host,recoveryOrder);
    await panel(host).getByRole('button',{name:'Clear queue',exact:true}).click();await waitOrder(phone,[]);
    await addLink(host,exported);await Promise.all([waitOrder(host,recoveryOrder),waitOrder(phone,recoveryOrder),waitOrder(other,recoveryOrder)]);
    await panel(phone).getByText(/^Save or share queue links/).click();
    await phone.evaluate(()=>{navigator.clipboard.writeText=async()=>{throw Error('Fixture clipboard unavailable');};});
    await panel(phone).getByRole('button',{name:'Copy queue links',exact:true}).click();
    await panel(phone).getByText(/Copy is unavailable here/).waitFor();
    assert.equal(await panel(phone).getByRole('textbox',{name:'Exported queue links',exact:true}).inputValue(),exported);
    checks.push('public queue links copy to the clipboard, download as plain text and paste back without duplicates; failed clipboard access leaves selectable links and a clear fallback');
    await panel(phone).getByRole('textbox', { name: 'Find a queued title', exact: true }).fill('queueQA0003');
    assert.equal(await panel(phone).locator('[data-room-queue-id]:visible').count(), 1);
    assert.deepEqual(await order(phone), recoveryOrder); await panel(phone).getByRole('textbox', { name: 'Find a queued title', exact: true }).fill('');
    await host.waitForFunction(count => JSON.parse(localStorage.getItem('reelcase.watch-room.queue.v1') ?? '{}').media?.length === count, recoveryOrder.length);
    assert.equal(await host.evaluate(() => /local:|fingerprint|blob:|private host catalog path|First room file|Second room file/.test(localStorage.getItem('reelcase.watch-room.queue.v1'))), false);
    await panel(host).scrollIntoViewIfNeeded(); await host.screenshot({ path: shot('refined-queue-desktop') });
    await panel(phone).getByRole('textbox', { name: 'Find a queued title', exact: true }).scrollIntoViewIfNeeded(); await phone.screenshot({ path: shot('refined-queue-mobile') });
    const lastQueued = panel(host).locator('[data-room-queue-id]').last();
    const lastId = recoveryOrder.at(-1);
    await lastQueued.getByRole('button', { name: /^Queue .* next$/ }).click();
    recoveryOrder = [lastId, ...recoveryOrder.filter(id => id !== lastId)];
    // No sleep/storage wait: pagehide must flush the newest debounced edit.
    await host.reload(); await host.locator('[data-home-ready="true"]').waitFor();
    if (!await host.getByRole('button', { name: `Resume last room · ${room}`, exact: true }).isVisible()) await host.getByRole('navigation', { name: 'Library navigation' }).getByRole('button', { name: 'Watch room', exact: true }).click();
    await host.getByRole('button', { name: `Resume last room · ${room}`, exact: true }).click();
    await panel(host).getByRole('button', { name: `Restore saved queue · ${recoveryOrder.length}`, exact: true }).click();
    await Promise.all([waitOrder(host, recoveryOrder), waitOrder(phone, recoveryOrder), waitOrder(other, recoveryOrder)]);
    await host.getByRole('heading', { name: 'Paused together', exact: true }).waitFor();
    checks.push('queue filter leaves the canonical order unchanged; immediate reload flushes the newest reorder, recovers public links, reconnects guests and restores without autoplay or local-file persistence');

    await host.getByText(/Connection details · 2\/2 connected/).waitFor({ timeout: 15000 });
    const connections = await host.evaluate(() => window.__roomConnectionCount);
    await host.getByRole('textbox', { name: 'Display name', exact: true }).fill('Refined room host');
    await phone.getByText(/Refined room host · connected/).last().waitFor({ timeout: 15000 });
    assert.equal(await host.evaluate(() => window.__roomConnectionCount), connections);
    await waitOrder(phone, recoveryOrder);
    await host.getByRole('button', { name: 'Play', exact: true }).first().click();
    await host.evaluate(() => { window.__roomTrafficSince = Date.now(); });
    await host.waitForTimeout(3500);
    const traffic = await host.evaluate(() => ({ full: window.__roomPackets.filter(packet => packet.type === 'room-state' && packet.sentAt > window.__roomTrafficSince).length, sync: window.__roomPackets.filter(packet => packet.type === 'sync' && packet.sentAt > window.__roomTrafficSince).length }));
    assert.ok(traffic.full <= 2, `steady playback sent ${traffic.full} full queue snapshots`); assert.ok(traffic.sync >= 2);
    await host.getByRole('button', { name: 'Pause', exact: true }).first().click();
    checks.push(`display-name edits preserve peer channels; steady playback sends small timing packets instead of repeated queue snapshots (${traffic.full} full, ${traffic.sync} sync observed)`);
    await panel(host).getByRole('checkbox', { name: 'Automatically play next queued title', exact: true }).uncheck();
    await host.getByRole('button', { name: 'Play', exact: true }).first().click();
    const endFrame = () => host.frameLocator('iframe[title="Host YouTube title"]').locator('body').evaluate(() => window.parent.postMessage(JSON.stringify({ event: 'onStateChange', info: 0 }), '*'));
    await endFrame(); await host.getByRole('heading', { name: 'Paused together', exact: true }).waitFor(); await waitOrder(phone, recoveryOrder);
    await panel(host).getByText('Video finished. Automatic next is off; choose Play next when ready.', { exact: true }).waitFor();
    await panel(host).getByRole('button', { name: 'Clear queue', exact: true }).click(); await waitOrder(phone, []);
    await host.getByRole('button', { name: 'Play', exact: true }).first().click();
    await host.getByText(/Timeline 0:00/).first().waitFor();
    await endFrame(); await host.getByRole('heading', { name: 'Paused together', exact: true }).waitFor();
    await panel(host).getByText('Queue finished. Add more videos or press Play to replay this video.', { exact: true }).waitFor();
    await panel(host).getByRole('checkbox', { name: 'Automatically play next queued title', exact: true }).check();
    checks.push('auto-next off pauses on completion without consuming the queue; an exhausted queue pauses cleanly and replay restarts the room clock');
    progress('mobile shortcuts, session history and device-only player recovery');
    const shortcuts=phone.getByRole('navigation',{name:'Watch room shortcuts',exact:true});
    await shortcuts.getByRole('button',{name:/^Queue ·/}).click();
    assert.equal(await phone.evaluate(()=>document.activeElement?.textContent),'Up next for everyone');
    const headingBox=await panel(phone).getByRole('heading',{name:'Up next for everyone',exact:true}).boundingBox();
    assert.ok(headingBox.y>=0&&headingBox.y<500);
    await shortcuts.getByRole('button',{name:'Chat',exact:true}).click();
    assert.equal(await phone.getByRole('textbox',{name:'Room chat message',exact:true}).evaluate(element=>element===document.activeElement),true);
    await shortcuts.getByRole('button',{name:'Player',exact:true}).click();
    const playerBox=await phone.locator('iframe[title="Host YouTube title"]').boundingBox();
    assert.ok(playerBox.y>=0&&playerBox.y<600);
    await phone.screenshot({path:shot('shortcuts-mobile')});
    checks.push('phone shortcuts keep Player, Queue and Chat reachable and move keyboard focus without changing the shared queue');

    await addLink(host,'https://youtu.be/recoverYT01\nhttps://twitch.tv/videos/919191');
    await panel(host).getByRole('button',{name:'Play next',exact:true}).click();
    await host.locator('iframe[src*="youtube.com/embed/recoverYT01"]').waitFor();
    await phone.locator('iframe[src*="youtube.com/embed/recoverYT01"]').waitFor();
    const recent=page=>page.getByRole('region',{name:'Recently played in this room',exact:true});
    await recent(phone).getByRole('button',{name:'Request replay of Host YouTube title',exact:true}).waitFor();
    await recent(phone).getByRole('button',{name:'Requeue Host YouTube title',exact:true}).click();
    await waitOrder(host,['room:twitch:919191','qa-host-youtube']);await waitOrder(phone,['room:twitch:919191','qa-host-youtube']);
    assert.equal(await recent(phone).getByRole('button',{name:'Requeue Host YouTube title',exact:true}).isDisabled(),true);
    const permissionAfterReload=panel(host).getByRole('checkbox',{name:'Allow guests to edit queue and select videos',exact:true});
    await permissionAfterReload.uncheck();
    await recent(phone).getByRole('button',{name:'Request replay of Host YouTube title',exact:true}).waitFor();
    await phone.waitForFunction(()=>Array.from(document.querySelectorAll('button')).some(button=>button.getAttribute('aria-label')==='Request replay of Host YouTube title'&&button.disabled));
    await permissionAfterReload.check();
    await recent(phone).getByRole('button',{name:'Request replay of Host YouTube title',exact:true}).click();
    await host.locator('iframe[title="Host YouTube title"]').waitFor();
    await waitOrder(phone,['room:twitch:919191']);
    await phone.reload();await phone.locator('iframe[title="Host YouTube title"]').waitFor();
    await recent(phone).getByRole('button',{name:'Request replay of YouTube · recoverYT01',exact:true}).waitFor();
    assert.doesNotMatch(await recent(phone).innerText(),/First room file|Second room file|fingerprint|tungsten/);
    checks.push('session history requeues once without interrupting playback, supports acknowledged guest replay, respects host locks, reaches rejoining guests and excludes local media');

    const queueBeforeRetry=await order(host);
    const connectionsBefore=await phone.evaluate(()=>window.__roomConnectionCount);
    await phone.evaluate(()=>window.postMessage(JSON.stringify({event:'onError',info:100}),'*'));
    assert.equal(await phone.getByText(/YouTube reports that this video is unavailable or private/).count(),0);
    const sendYoutubeEvent=(event,info)=>phone.frameLocator('iframe[title="Host YouTube title"]').locator('body').evaluate((_element,{event,info})=>window.parent.postMessage(JSON.stringify({event,info}),'*'),{event,info});
    await sendYoutubeEvent('onError',101);await phone.getByText(/This creator does not allow embedded playback/).waitFor();
    await waitOrder(host,queueBeforeRetry);
    await phone.getByRole('link',{name:'Open on YouTube',exact:true}).waitFor();
    await phone.getByRole('button',{name:'Reload this player',exact:true}).click();
    await phone.getByText(/Reloading this player only/).waitFor();
    await phone.frameLocator('iframe[title="Host YouTube title"]').locator('body').waitFor();
    await sendYoutubeEvent('onAutoplayBlocked');await phone.getByText(/Your browser blocked autoplay/).waitFor();
    assert.equal(await phone.evaluate(()=>window.__roomConnectionCount),connectionsBefore);
    await waitOrder(host,queueBeforeRetry);await waitOrder(phone,queueBeforeRetry);
    await recent(host).scrollIntoViewIfNeeded();await host.screenshot({path:shot('recent-desktop')});
    await phone.getByRole('button',{name:'Reload this player',exact:true}).scrollIntoViewIfNeeded();await phone.screenshot({path:shot('recovery-mobile')});
    await panel(phone).getByRole('button',{name:'Request next',exact:true}).click();await phone.waitForFunction(()=>window.__twitchOptions?.video==='v919191');
    const twitchConnections=await phone.evaluate(()=>window.__roomConnectionCount);
    const twitchInstances=await phone.evaluate(()=>window.__twitchInstances);
    await phone.getByRole('button',{name:'Reload this player',exact:true}).click();
    await phone.waitForFunction(count=>window.__twitchInstances>count&&window.__twitchOptions?.video==='v919191',twitchInstances);
    assert.equal(await phone.evaluate(()=>window.__roomConnectionCount),twitchConnections);
    checks.push('only the active YouTube frame may report player failures; blocked embeds/autoplay keep the queue intact and local YouTube/Twitch reloads preserve peer connections');
  }
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
    refined,
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
        seekState: await page.evaluate(()=>({packets:window.__roomPackets?.filter(packet=>["sync", "sync-request"].includes(packet.type)).slice(-8),slider:document.querySelector('input[type="range"]')?.value,position:document.querySelector("video")?.currentTime,focused:document.activeElement?.tagName})).catch(()=>null),
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
