import assert from "node:assert/strict";
import { chromium } from "playwright";

const origin = process.argv[2] ?? "http://127.0.0.1:8081/";
const browser = await chromium.launch({ channel: "chrome", headless: true, args: ["--no-sandbox", "--disable-features=WebRtcHideLocalIpsWithMdns"] });
const errors = [];
try {
  const hostContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await hostContext.addInitScript(() => localStorage.setItem("reelcase.sidebar.groups.v1", JSON.stringify({ library: true, workspace: true, tools: false })));
  const guestContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  for(const context of [hostContext,guestContext])await context.addInitScript(()=>{
    window.__seekPackets=[];const send=RTCDataChannel.prototype.send;
    RTCDataChannel.prototype.send=function(value){try{const packet=JSON.parse(value);if(['sync-request','sync'].includes(packet.d?.type)){window.__seekPackets.push(packet.d);if(window.__seekPackets.length>16)window.__seekPackets.shift();}}catch{}return send.call(this,value);};
  });
  const host = await hostContext.newPage();
  const guest = await guestContext.newPage();
  for (const page of [host, guest]) page.on("pageerror", (error) => errors.push(error.message));
  await host.goto(origin, { waitUntil: "domcontentloaded" });
  await host.getByRole("button", { name: "Watch room", exact: true }).click();
  await host.getByRole("button", { name: "Start room", exact: true }).click();
  const room = (await host.getByRole("heading", { name: /^Room RC/ }).innerText()).replace("Room ", "").trim();
  await guest.goto(new URL(`?room=${room}&theater=1`, origin).href, { waitUntil: "domcontentloaded" });
  await host.getByText(/1\/1 connected/).first().waitFor({ timeout: 45000 });
  await host.getByText("Local sharing, games & TV", { exact: true }).click();
  await host.locator('input[type="file"][accept="video/*"]').first().setInputFiles("public/samples/tungsten-reel.mp4");
  assert.equal(await host.getByRole("button", { name: "Send sharing request" }).isDisabled(), true);
  await host.getByRole("checkbox", { name: /I confirm guests have access/ }).check();
  await host.getByRole("button", { name: "Send sharing request" }).click();
  await host.locator("video").evaluate((video) => { video.loop = true; });
  await host.getByRole("button", { name: "Play", exact: true }).first().click();
  const incoming = guest.locator("video[data-room-stream]");
  await incoming.waitFor({ timeout: 45000 });
  if (await guest.getByRole("button", { name: "Play on this device" }).count()) await guest.getByRole("button", { name: "Play on this device" }).click();
  await guest.waitForFunction(() => document.querySelector("video[data-room-stream]")?.getVideoPlaybackQuality().totalVideoFrames > 10, null, { timeout: 30000 });
  const decodedFrames = await incoming.evaluate((video) => video.getVideoPlaybackQuality().totalVideoFrames);
  await guest.getByRole("button", { name: "Pause", exact: true }).first().click();
  await host.waitForFunction(() => document.querySelector("video")?.paused);
  for(const seconds of [2,0]){
    await guest.getByRole('spinbutton',{name:'My timing offset in seconds',exact:true}).fill(String(seconds));
    await guest.getByRole('button',{name:'Apply timing',exact:true}).click();
    await guest.locator(`[data-guest-offset="${seconds}"]`).waitFor();
  }
  const slider=guest.getByRole('slider',{name:'Seek shared video',exact:true});
  await slider.press('Home');await host.waitForFunction(()=>document.querySelector('video')?.currentTime<0.1);
  await slider.press('ArrowRight');
  try{await host.waitForFunction(()=>document.querySelector('video')?.currentTime>=0.2,null,{timeout:6000});}
  catch(error){for(const page of [host,guest])console.log(JSON.stringify(await page.evaluate(()=>({packets:window.__seekPackets,slider:document.querySelector('input[type="range"]')?.value,focused:document.activeElement?.outerHTML,video:document.querySelector('video')?.currentTime}))));throw error;}
  await guest.getByRole("button", { name: "Play", exact: true }).first().click();
  await host.waitForFunction(() => document.querySelector("video")?.paused === false);
  await host.screenshot({ path: "screenshots/watch-room-built-host.png", fullPage: true });
  await incoming.scrollIntoViewIfNeeded();
  await guest.screenshot({ path: "screenshots/watch-room-built-mobile.png" });
  assert.equal(await guest.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await guest.getByRole("button", { name: "Leave room", exact: true }).click();
  assert.equal(await guest.locator("video[data-room-stream]").count(), 0);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ production: true, decodedFrames, guestSelectedFiles: 0, checks: ["consent gate", "local playback reaches empty phone without file copy", "guest pause and resume", "keyboard range seeks reach the host", "mobile no overflow", "leave releases stream player"], errors }, null, 2));
} finally { await browser.close(); }
