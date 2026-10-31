import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const origin = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/room-roles-dev.json", [
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
  for (const c of contexts) {
    await c.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.watch-room.auto-advance", "false");
      localStorage.setItem("reelcase.artwork-mode", "text");
      localStorage.setItem("reelcase.profile-name", "CANARY-PRIVATE-NAME");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: false }),
      );
      const Original = RTCPeerConnection;
      window.__pcs = [];
      window.RTCPeerConnection = class extends Original {
        constructor(config) {
          super(config);
          window.__pcs.push(this);
        }
      };
      const send = RTCDataChannel.prototype.send;
      window.__channels = new Set();
      window.__packets = [];
      RTCDataChannel.prototype.send = function (value) {
        if (this.label === "reliable") window.__channels.add(this);
        try {
          const p = JSON.parse(value);
          if (p.t === "d") {
            window.__packets.push(p.d);
            if (window.__packets.length > 256) window.__packets.shift();
            if (window.__holdState && p.d.type === "room-state") return;
          }
        } catch {}
        return send.call(this, value);
      };
      window.__raw = (data) => {
        const proof=document.querySelector('[data-room-delivery-epoch]');
        data={intentAt:Date.now(),deliveryEpoch:proof?.getAttribute('data-room-delivery-epoch'),queueRevision:Number(proof?.getAttribute('data-room-queue-revision')),selectionRevision:Number(proof?.getAttribute('data-room-selection-revision')),...data};
        for (const channel of window.__channels)
          if (channel.readyState === "open")
            send.call(channel, JSON.stringify({ t: "d", d: data }));
      };
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text) => {
            if (window.__denyCopy) throw Error("Denied");
            window.__copied = text;
          },
        },
      });
    });
    await c.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await c.route("**/api/lan-origin", (r) =>
      r.fulfill({ contentType: "application/json", body: '{"origins":[]}' }),
    );
    await c.route(
      (url) => ["i.ytimg.com", "img.youtube.com", "static-cdn.jtvnw.net"].includes(url.hostname),
      (r) =>
        r.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"/>',
        }),
    );
    await c.route("https://www.youtube.com/embed/**", (r) =>
      r.fulfill({ contentType: "text/html", body: "<p>Controlled local player fixture</p>" }),
    );
  }
  const [host, guest] = await Promise.all(contexts.map((c) => c.newPage()));
  pages = [host, guest];
  let signalingFails = false;
  await guest.route("**/api/rtc?**", (r) =>
    signalingFails
      ? r.fulfill({ contentType: "application/json", body: '{"peers":null,"signals":[]}' })
      : r.continue(),
  );
  for (const p of pages) {
    p.setDefaultTimeout(30000);
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text() + " " + m.location().url);
    });
  }
  const q = (p) => p.getByRole("region", { name: "Room query and queue", exact: true }),
    role = (p) => p.getByRole("region", { name: "Guest role presets" }),
    timeline = (p) => p.locator('details[aria-label="Room connection timeline"]');
  const order = (p) =>
    q(p)
      .locator("[data-room-queue-id]")
      .evaluateAll((rows) => rows.map((row) => row.dataset.roomQueueId));
  const revision = () => role(guest).getAttribute("data-room-permission-revision").then(Number);
  const waitStage = (p, stage, state) =>
    p
      .locator('[data-connection-stage="' + stage + '"][data-connection-state="' + state + '"]')
      .waitFor();
  const add = async (p, id, suggest = false) => {
    await q(p)
      .getByRole("textbox", { name: "Public video link", exact: true })
      .fill("https://youtu.be/" + id);
    await q(p)
      .getByRole("button", { name: suggest ? "Suggest links" : "Add link to queue", exact: true })
      .click();
  };
  const apply = async (which) => {
    await role(host).getByRole("combobox", { name: "Preview guest role" }).selectOption(which);
    await role(host)
      .getByRole("button", {
        name:
          "Apply " +
          { viewer: "Viewer", contributor: "Contributor", controller: "Co-controller" }[which] +
          " role",
        exact: true,
      })
      .click();
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
  for (const id of ["roles000001", "roles000002", "roles000003"]) await add(host, id);
  await q(host).getByRole("button", { name: "Play next", exact: true }).click();
  await host.getByRole("button", { name: "Pause", exact: true }).click();
  await host.getByText("Guest library browsing", { exact: true }).click();
  await host.getByRole("checkbox", { name: "Let guests search my library", exact: true }).uncheck();
  await host.evaluate(() => (window.__holdState = true));
  await guest.goto(new URL("/?room=" + room + "&theater=1", origin).href);
  await timeline(guest)
    .getByText(/Connection timeline/)
    .click();
  await waitStage(guest, "transport", "ready");
  await waitStage(guest, "handshake", "working");
  checks.push("an open reliable channel is distinct from a pending room handshake");
  await host.evaluate(() => (window.__holdState = false));
  await timeline(guest).getByRole("button", { name: "Request room state", exact: true }).click();
  await guest.locator('iframe[src*="roles000001"]').waitFor();
  await waitStage(guest, "handshake", "ready");
  await waitStage(guest, "signaling", "ready");
  await waitStage(guest, "ice", "ready");
  const before = await order(host);
  assert.deepEqual(await order(guest), before);
  const staleRevision = await revision();
  await role(host).getByRole("combobox", { name: "Preview guest role" }).selectOption("viewer");
  await role(host).getByRole("region", { name: "Role change preview" }).waitFor();
  assert((await role(guest).innerText()).includes("Co-controller"));
  await role(host).getByRole("button", { name: "Cancel role preview" }).click();
  assert((await role(guest).innerText()).includes("Co-controller"));
  assert(await role(host).getByRole("combobox",{name:"Preview guest role"}).evaluate(node=>document.activeElement===node));
  checks.push("preview and cancel never change current guest privileges or the queue");
  await apply("viewer");
  await role(guest).getByText("Your room role · Viewer", { exact: true }).waitFor();
  assert(await guest.getByRole("button", { name: "Play", exact: true }).isDisabled());
  assert(await guest.getByRole("button", { name: "+15 sec", exact: true }).isDisabled());
  await role(host).getByRole("combobox", { name: "Preview guest role" }).selectOption("controller");
  await host.getByRole("checkbox", { name: "Allow guests to seek videos", exact: true }).check();
  await role(host)
    .getByText(/Controls changed while/)
    .waitFor();
  assert(await role(host).getByRole("button", { name: "Apply Co-controller role" }).isDisabled());
  await role(host).getByRole("button", { name: "Cancel role preview" }).click();
  await apply("controller");
  await role(guest).getByText("Your room role · Co-controller", { exact: true }).waitFor();
  assert.equal(
    await host
      .getByRole("checkbox", { name: "Let guests search my library", exact: true })
      .isChecked(),
    false,
  );
  assert.equal(
    await host
      .getByRole("checkbox", { name: "Include local video titles for guests", exact: true })
      .isChecked(),
    false,
  );
  await guest.evaluate(
    ({ revision, id }) =>
      window.__raw({
        type: "queue-action",
        operation: { kind: "remove", id },
        requestId: "stale-role-queue",
        permissionRevision: revision,
        sentAt: Date.now(),
      }),
    { revision: staleRevision, id: before[0] },
  );
  await host.waitForFunction(() =>
    window.__packets.some(
      (p) =>
        p.type === "queue-result" &&
        p.requestId === "stale-role-queue" &&
        p.text.includes("Room controls changed"),
    ),
  );
  assert.deepEqual(await order(host), before);
  await guest.evaluate(
    (rev) =>
      window.__raw({
        type: "sync-request",
        playing: true,
        position: 9999,
        seek: false,
        permissionRevision: rev,
        sentAt: Date.now(),
      }),
    staleRevision,
  );
  await guest
    .getByText("Room controls changed. Refresh the host state and send a new request.", {
      exact: true,
    })
    .first()
    .waitFor();
  await host.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  checks.push(
    "revoked and regranted roles reject older queue and playback packets; custom changes invalidate a stale role preview and never grant library access",
  );
  await add(guest, "roles000004");
  await host.waitForFunction(() => document.querySelectorAll("[data-room-queue-id]").length === 3);
  await guest.getByRole("button", { name: "+15 sec", exact: true }).click();
  await host.waitForFunction(
    () => Number(document.querySelector("[data-room-clock]").dataset.roomClock) >= 14,
  );
  await host.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  checks.push(
    "current co-controller requests still edit the queue and seek without changing paused playback",
  );
  await apply("contributor");
  await role(guest).getByText("Your room role · Contributor", { exact: true }).waitFor();
  const count = (await order(host)).length;
  await add(guest, "roles000005", true);
  await host.locator('[data-room-suggestion-id="youtube:roles000005"]').waitFor();
  assert.equal((await order(host)).length, count);
  assert(await guest.getByRole("button", { name: "Play", exact: true }).isDisabled());
  checks.push("Contributor sends reviewed suggestions without editing canonical queue or playback");
  await guest
    .frameLocator('iframe[src*="youtube.com/embed/"]')
    .locator("body")
    .evaluate(() => parent.postMessage(JSON.stringify({ event: "onAutoplayBlocked" }), "*"));
  await waitStage(guest, "player", "attention");
  for (const stage of ["signaling", "ice", "transport", "handshake"])
    await waitStage(guest, stage, "ready");
  await guest
    .getByRole("region", { name: "Room guest controls", exact: true })
    .getByRole("button", { name: "I’m ready", exact: true })
    .click();
  await guest.getByRole("textbox", { name: "Room chat message" }).fill("Role and timeline check");
  await guest.getByRole("button", { name: "Send", exact: true }).click();
  await host.getByText(/Role and timeline check/).waitFor();
  checks.push("autoplay block is device-local; room connectivity, Ready and chat remain available");
  const queueBeforeRetry = await order(guest),
    pcBefore = await guest.evaluate(() => window.__pcs.length);
  signalingFails = true;
  await waitStage(guest, "signaling", "attention");
  await waitStage(guest, "transport", "ready");
  signalingFails = false;
  await timeline(guest).getByRole("button", { name: "Retry signaling only" }).click();
  await waitStage(guest, "signaling", "ready");
  assert(await timeline(guest).locator('[data-connection-stage="signaling"] [data-room-list-heading]').evaluate(node=>document.activeElement===node));
  checks.push('Successful reconnect keeps keyboard focus on the signaling stage after its retry button disappears');
  assert.equal(await guest.evaluate(() => window.__pcs.length), pcBefore);
  assert.deepEqual(await order(guest), queueBeforeRetry);
  checks.push(
    "malformed signaling produces a separate retry state; signaling-only recovery preserves healthy channels and queue",
  );
  await timeline(guest).getByRole("button", { name: "Copy room diagnostic", exact: true }).click();
  const text = await guest.evaluate(() => window.__copied),
    diagnostic = JSON.parse(text);
  assert.equal(diagnostic.version, 1);
  assert(diagnostic.events.length <= 24);
  for (const secret of [
    room,
    "CANARY-PRIVATE-NAME",
    "roles000001",
    "http",
    "fingerprint",
    "invitation=",
  ])
    assert(!text.includes(secret), "diagnostic must exclude " + secret);
  checks.push(
    "diagnostic copy exports only bounded stage evidence and queue counts, without room IDs, invitations, names or media",
  );
  await guest.evaluate(() => (window.__denyCopy = true));
  await timeline(guest).getByRole("button", { name: "Copy room diagnostic", exact: true }).click();
  await timeline(guest)
    .getByRole("textbox", { name: "Redacted room diagnostic to copy" })
    .waitFor();
  await guest.reload();
  await timeline(guest)
    .getByText(/Connection timeline/)
    .click();
  await waitStage(guest, "handshake", "ready");
  await role(guest).getByText("Your room role · Contributor", { exact: true }).waitFor();
  assert.deepEqual(await order(guest), queueBeforeRetry);
  checks.push(
    "clipboard denial has selectable fallback; guest reload restores effective role and host queue",
  );
  await timeline(host)
    .getByText(/Connection timeline/)
    .click();
  await role(host).scrollIntoViewIfNeeded();
  await host.screenshot({ path: output.replace(".json", "-roles-desktop.png") });
  await role(guest).scrollIntoViewIfNeeded();
  await guest.screenshot({ path: output.replace(".json", "-roles-mobile.png") });
  await timeline(host).scrollIntoViewIfNeeded();
  await host.screenshot({ path: output.replace(".json", "-desktop.png") });
  await timeline(guest).scrollIntoViewIfNeeded();
  await guest.screenshot({ path: output.replace(".json", "-mobile.png") });
  // A replacement host owns a fresh permission revision, not the old peer's clock.
  await host.reload();
  await host.locator('[data-home-ready="true"]').waitFor();
  await host
    .getByRole("navigation", { name: "Library navigation" })
    .getByRole("button", { name: "Watch room", exact: true })
    .click();
  await host.getByRole("button", { name: "Resume last room · " + room, exact: true }).click();
  await guest.waitForFunction(
    () =>
      document
        .querySelector("[data-room-permission-revision]")
        ?.getAttribute("data-room-permission-revision") === "0",
  );
  await role(guest).getByText("Your room role · Contributor", { exact: true }).waitFor();
  await apply("viewer");
  await role(guest).getByText("Your room role · Viewer", { exact: true }).waitFor();
  checks.push(
    "a reloaded replacement host establishes a fresh permission revision and subsequent role changes still reach the guest",
  );
  // Keyboard audit after the replacement-host checks: no dependency on the real library.
  await apply('contributor');
  await role(guest).getByText('Your room role · Contributor',{exact:true}).waitFor();
  for(const id of ['audit000001','audit000002','audit000003'])await add(guest,id,true);
  const suggestions=host.getByRole('region',{name:'Guest video suggestions',exact:true});
  await suggestions.locator('[data-room-suggestion-id]').nth(2).waitFor();
  const firstSuggestion=suggestions.locator('[data-room-suggestion-id]').first();
  await firstSuggestion.getByRole('button',{name:'Approve to end',exact:true}).focus();
  await host.keyboard.press('Enter');
  await host.waitForFunction(()=>document.querySelectorAll('[data-room-suggestion-id]').length===2);
  assert(await suggestions.locator('[data-room-suggestion-id]').first().getByRole('button',{name:'Approve to end',exact:true}).evaluate(node=>document.activeElement===node));
  for(let i=0;i<2;i++){await suggestions.locator('[data-room-suggestion-id]').first().getByRole('button',{name:'Dismiss',exact:true}).focus();await host.keyboard.press('Enter');await host.waitForFunction(n=>document.querySelectorAll('[data-room-suggestion-id]').length===n,1-i);}
  assert(await suggestions.locator('[data-room-list-heading]').evaluate(node=>document.activeElement===node));
  checks.push('Keyboard approval/dismissal restores the same action in the next suggestion or its heading when empty');
  await apply('controller');
  const queueRows=q(host).locator('[data-room-queue-id]');
  while(await queueRows.count()<3)await add(host,'audit'+String(await queueRows.count()+10).padStart(6,'0'));
  const move=queueRows.first().getByRole('button',{name:/^Change position/});await move.focus();await host.keyboard.press('Enter');
  await q(host).getByRole('button',{name:'Cancel move',exact:true}).focus();await host.keyboard.press('Enter');assert(await move.evaluate(node=>document.activeElement===node));
  const consumed=await queueRows.first().getAttribute('data-room-queue-id');await queueRows.first().locator('[data-room-focus-action="play"]').focus();await host.keyboard.press('Enter');await host.waitForFunction(id=>![...document.querySelectorAll('[data-room-queue-id]')].some(row=>row.getAttribute('data-room-queue-id')===id),consumed);
  assert(await queueRows.first().locator('[data-room-focus-action="play"]').evaluate(node=>document.activeElement===node));
  const chat=guest.getByRole('textbox',{name:'Room chat message'});await chat.fill('Keep my draft and focus');await chat.focus();
  await q(host).getByRole('button',{name:'Play next',exact:true}).click();await guest.waitForTimeout(500);assert(await chat.evaluate(node=>document.activeElement===node));assert.equal(await chat.inputValue(),'Keep my draft and focus');
  while(await queueRows.count()){const n=await queueRows.count();await queueRows.first().locator('[data-room-focus-action="remove"]').focus();await host.keyboard.press('Enter');await host.waitForFunction(n=>document.querySelectorAll('[data-room-queue-id]').length===n,n-1);}
  assert(await q(host).locator('[data-room-list-heading]').evaluate(node=>document.activeElement===node));
  assert((await q(host).locator('[data-room-list-heading]').boundingBox()).y>=100,'Recovered queue heading is visible below the sticky toolbar');
  checks.push('Consumed/removed queue rows recover focus; cancel move restores its opener; remote queue changes do not steal an unsent chat draft');
  const help=guest.getByRole('button',{name:'Keyboard shortcuts',exact:true}).first();await help.focus();await guest.keyboard.press('Enter');await guest.getByRole('dialog',{name:'Keyboard shortcuts'}).waitFor();await guest.keyboard.press('Escape');await guest.getByRole('dialog',{name:'Keyboard shortcuts'}).waitFor({state:'hidden'});assert(await help.evaluate(node=>document.activeElement===node));
  const reload=guest.getByRole('button',{name:'Reload this player',exact:true});await reload.focus();await guest.keyboard.press('Enter');assert(await reload.evaluate(node=>document.activeElement===node));
  const summary=await q(guest).locator('[data-room-queue-summary]').textContent();await guest.waitForTimeout(2200);assert.equal(await q(guest).locator('[data-room-queue-summary]').textContent(),summary);
  checks.push('Modal Escape returns to its opener; player reload keeps focus; timing heartbeats do not repeat the queue summary');
  for(const p of pages){await p.emulateMedia({forcedColors:'active',reducedMotion:'reduce'});await q(p).locator('[data-room-list-heading]').focus();await q(p).locator('[data-room-list-heading]').evaluate(node=>node.scrollIntoView({block:'start'}));await p.screenshot({path:output.replace('.json',p===host?'-access-desktop.png':'-access-mobile.png')});}
  const semantics=await q(guest).ariaSnapshot();assert(semantics.includes('Shared upcoming titles'));assert(semantics.includes('Up next for everyone'));checks.push('Browser accessibility-tree snapshot exposes named queue controls; forced colors and reduced motion have desktop/mobile evidence (no screen-reader speech claim)');
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
          "Real WebRTC between isolated desktop/touch-phone Chrome contexts with controlled provider documents and a malformed signaling response; physical phone and external TURN are unmeasured.",
      },
      null,
      2,
    ),
  );
} catch (error) {
  for (const [i, p] of pages.entries()) {
    console.error(
      (
        await p
          .locator("body")
          .innerText()
          .catch(() => "")
      ).slice(-2500),
    );
    await p.screenshot({ path: output.replace(".json", "-failure-" + i + ".png") }).catch(() => {});
  }
  writeFileSync(output, JSON.stringify({ ok: false, checks, errors, error: error.stack }, null, 2));
  throw error;
} finally {
  await browser.close();
}
