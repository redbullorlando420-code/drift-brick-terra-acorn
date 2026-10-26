import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const origin = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? "screenshots/session-file-ui.json", [
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
      { width: 390, height: 844 },
    ].map((viewport) => browser.newContext({ viewport, acceptDownloads: true })),
  );
  for (const context of contexts) {
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      window.__sessionPackets = [];
      const send = RTCDataChannel.prototype.send;
      RTCDataChannel.prototype.send = function (value) {
        try {
          const packet = JSON.parse(value);
          if (packet.t === "d") {
            window.__sessionPackets.push(packet.d);
            if (window.__sessionPackets.length > 512) window.__sessionPackets.shift();
          }
        } catch {}
        return send.call(this, value);
      };
    });
    await context.route("**/api/lan-origin", (r) =>
      r.fulfill({ contentType: "application/json", body: '{"origins":[]}' }),
    );
    await context.route("http://127.0.0.1:43123/**", (r) =>
      r.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route(/https:\/\/(?:www.youtube.com|player.twitch.tv|clips.twitch.tv)\//, (r) =>
      r.fulfill({ contentType: "text/html", body: "<p>Controlled public player fixture</p>" }),
    );
    await context.route(/https:\/\/.*(?:ytimg.com|jtvnw.net)\//, (r) =>
      r.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="#263342"/></svg>',
      }),
    );
  }
  const [host, phone, mobileHost] = await Promise.all(contexts.map((c) => c.newPage()));
  pages = [host, phone, mobileHost];
  for (const page of pages) {
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text() + " [" + m.location().url + "]");
    });
  }
  const panel = (p) => p.getByRole("region", { name: "Room query and queue", exact: true }),
    handoff = (p) => p.getByRole("group", { name: "Session handoff file", exact: true }),
    preview = (p) => p.getByRole("region", { name: "Session import preview", exact: true });
  const openFile = async (p) => {
    const group = handoff(p);
    if (!(await group.evaluate((e) => e.open))) await group.locator(":scope > summary").click();
    return group;
  };
  const add = async (p, links) => {
    await panel(p).getByRole("textbox", { name: "Public video link", exact: true }).fill(links);
    await panel(p).getByRole("button", { name: "Add link to queue", exact: true }).click();
  };
  const order = (p) =>
    panel(p)
      .locator("[data-room-queue-id]")
      .evaluateAll((rows) => rows.map((r) => r.dataset.roomQueueId));
  const waitOrder = (p, ids) =>
    p.waitForFunction(
      (ids) =>
        JSON.stringify(
          [...document.querySelectorAll("[data-room-queue-id]")].map((r) => r.dataset.roomQueueId),
        ) === JSON.stringify(ids),
      ids,
    );
  const importFile = async (p, value, name = "session.json") => {
    await openFile(p);
    await handoff(p)
      .getByLabel("Import session file", { exact: true })
      .setInputFiles({
        name,
        mimeType: "application/json",
        buffer: Buffer.from(typeof value === "string" ? value : JSON.stringify(value)),
      });
  };
  const download = async (p) => {
    await openFile(p);
    const wait = p.waitForEvent("download");
    await handoff(p).getByRole("button", { name: "Download session file", exact: true }).click();
    const raw = await readFile(await (await wait).path(), "utf8");
    return { raw, file: JSON.parse(raw) };
  };
  const start = async (p) => {
    await p.goto(origin);
    await p.locator('[data-home-ready="true"]').waitFor();
    const menu = p.getByRole("button", { name: "Open menu", exact: true });
    if (await menu.isVisible()) await menu.click();
    await p
      .getByRole("navigation", { name: "Library navigation" })
      .getByRole("button", { name: "Watch room", exact: true })
      .click();
    await p.getByRole("button", { name: "Start room", exact: true }).click();
    return (await p.getByRole("heading", { name: /^Room RC/ }).innerText())
      .replace("Room ", "")
      .trim();
  };
  const A = "played00001",
    B = "current0001",
    C = "next0000001",
    D = "next0000002",
    E = "PublicSessionClip";
  const room = await start(host);
  await panel(host)
    .getByRole("checkbox", { name: "Automatically play next queued title", exact: true })
    .uncheck();
  await add(host, [A, B, C].map((id) => "https://youtu.be/" + id).join("\n"));
  await panel(host).getByRole("button", { name: "Play next", exact: true }).click();
  await host.locator('iframe[src*="' + A + '"]').waitFor();
  await panel(host).getByRole("button", { name: "Play next", exact: true }).click();
  await host.locator('iframe[src*="' + B + '"]').waitFor();
  await host.getByRole("button", { name: "Pause", exact: true }).click();
  await host.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  await phone.goto(new URL("/?room=" + room + "&theater=1", origin).href);
  await phone.locator('iframe[src*="' + B + '"]').waitFor({ timeout: 45000 });
  await host.getByText(/Connection details · 1\/1 connected/).waitFor({ timeout: 30000 });
  await waitOrder(phone, ["room:youtube:" + C]);
  const exported = await download(host);
  assert.equal(exported.file.format, "realhub-watch-session");
  assert.equal(exported.file.version, 1);
  assert.deepEqual(
    exported.file.played.map((v) => v.url),
    ["https://www.youtube.com/watch?v=" + A],
  );
  assert.equal(exported.file.current.url, "https://www.youtube.com/watch?v=" + B);
  assert.deepEqual(
    exported.file.upcoming.map((v) => v.url),
    ["https://www.youtube.com/watch?v=" + C],
  );
  assert(!exported.raw.includes(room));
  assert.doesNotMatch(
    exported.raw,
    /invitation|peer|fingerprint|streamId|embedUrl|playing|position|autoAdvance|path|folderId/,
  );
  checks.push(
    "Desktop host exports real room played/current/upcoming context with public canonical links and no room access or playback state",
  );
  const imported = {
    ...exported.file,
    autoplay: true,
    peer: "PRIVATE_PEER",
    room: "PRIVATE_ROOM",
    upcoming: [
      exported.file.current,
      ...exported.file.upcoming,
      {
        provider: "youtube",
        url: "https://youtu.be/" + D + "?si=PRIVATE_TOKEN",
        title: "New handoff video",
        duration: 300,
      },
      {
        provider: "youtube",
        url: "https://www.youtube.com/watch?v=" + D,
        title: "Duplicate handoff video",
      },
      {
        provider: "twitch",
        url: "https://clips.twitch.tv/" + E + "?token=PRIVATE_TOKEN",
        title: "Public handoff clip",
        duration: 30,
      },
      { provider: "netflix", url: "https://netflix.com/private", title: "Unsupported provider" },
      { provider: "youtube", url: "javascript:alert(1)", title: "Invalid URL" },
    ],
  };
  await importFile(host, imported);
  await preview(host)
    .getByText(/2 ready to append · 3 duplicates.*1 unsupported provider entries · 1 invalid/)
    .waitFor();
  const before = await order(host);
  assert.deepEqual(before, ["room:youtube:" + C]);
  assert.equal(
    await panel(host)
      .getByRole("checkbox", { name: "Automatically play next queued title", exact: true })
      .isChecked(),
    false,
  );
  await importFile(phone, imported);
  assert(
    await preview(phone)
      .getByRole("button", { name: "Append upcoming titles", exact: true })
      .isDisabled(),
  );
  await preview(phone)
    .getByText(/Only the host can apply/)
    .waitFor();
  const guestExport = await download(phone);
  assert(!guestExport.raw.includes(room));
  assert.doesNotMatch(guestExport.raw, /PRIVATE_|peer|invitation|autoplay/);
  checks.push(
    "Phone guest previews and exports without gaining host import authority; preview alone leaves the live queue untouched",
  );
  await add(phone, "https://youtu.be/" + D);
  await waitOrder(host, ["room:youtube:" + C, "room:youtube:" + D]);
  await preview(host)
    .getByText(/1 ready to append · 4 duplicates/)
    .waitFor();
  const packetsBefore = await host.evaluate(
      () => window.__sessionPackets.filter((p) => p.type === "queue").length,
    ),
    clock = Number(
      await host.getByLabel("Room playback time", { exact: true }).getAttribute("data-room-clock"),
    );
  await preview(host).getByRole("button", { name: "Append upcoming titles", exact: true }).click();
  const applied = ["room:youtube:" + C, "room:youtube:" + D, "room:twitch:clip:" + E];
  await waitOrder(host, applied);
  await waitOrder(phone, applied);
  assert.equal(
    await host.evaluate(() => window.__sessionPackets.filter((p) => p.type === "queue").length),
    packetsBefore + 1,
  );
  assert.equal(await host.locator('iframe[src*="' + B + '"]').count(), 1);
  await host.getByRole("heading", { name: "Paused together", exact: true }).waitFor();
  assert(
    Math.abs(
      Number(
        await host
          .getByLabel("Room playback time", { exact: true })
          .getAttribute("data-room-clock"),
      ) - clock,
    ) < 1,
  );
  assert.equal(
    await panel(host)
      .getByRole("checkbox", { name: "Automatically play next queued title", exact: true })
      .isChecked(),
    false,
  );
  await panel(host).getByRole("button", { name: "Undo queue change", exact: true }).click();
  await waitOrder(phone, ["room:youtube:" + C, "room:youtube:" + D]);
  await preview(host).getByRole("button", { name: "Append upcoming titles", exact: true }).click();
  await waitOrder(phone, applied);
  await importFile(host, imported);
  await preview(host)
    .getByText(/0 ready to append/)
    .waitFor();
  assert(
    await preview(host)
      .getByRole("button", { name: "Append upcoming titles", exact: true })
      .isDisabled(),
  );
  checks.push(
    "Preview reacts to a concurrent guest queue edit; host applies one undoable batch, deduplicates re-import and preserves the paused title, clock and automatic-next setting",
  );
  await panel(host).getByRole("button", { name: "Clear queue", exact: true }).click();
  await add(
    host,
    Array.from({ length: 47 }, (_, i) => "https://youtu.be/fill" + String(i).padStart(7, "0")).join(
      "\n",
    ),
  );
  await host.waitForFunction(() => document.querySelectorAll("[data-room-queue-id]").length === 47);
  await importFile(host, imported);
  await preview(host)
    .getByText(/1 ready to append.*2 held back by capacity · 1 queue slots free/)
    .waitFor();
  await preview(host).getByRole("button", { name: "Append upcoming titles", exact: true }).click();
  await host.waitForFunction(() => document.querySelectorAll("[data-room-queue-id]").length === 48);
  await panel(host).getByRole("button", { name: "Undo queue change", exact: true }).click();
  await host.waitForFunction(() => document.querySelectorAll("[data-room-queue-id]").length === 47);
  const capacityOrder = await order(host);
  await importFile(host, "{broken");
  await handoff(host)
    .getByRole("alert")
    .filter({ hasText: /not readable JSON/ })
    .waitFor();
  assert.deepEqual(await order(host), capacityOrder);
  await importFile(host, "x".repeat(256001));
  await handoff(host)
    .getByRole("alert")
    .filter({ hasText: /too large/ })
    .waitFor();
  assert.deepEqual(await order(host), capacityOrder);
  await importFile(host, imported);
  await preview(host).getByRole("button", { name: "Cancel session import", exact: true }).click();
  assert.equal(await preview(host).count(), 0);
  assert.deepEqual(await order(host), capacityOrder);
  checks.push(
    "Queue capacity is previewed and enforced; corrupt/oversized files and cancellation preserve the room and Undo restores the complete batch",
  );
  await start(mobileHost);
  await openFile(mobileHost);
  await importFile(mobileHost, exported.file);
  await preview(mobileHost)
    .getByText(/1 ready to append/)
    .waitFor();
  await preview(mobileHost)
    .getByRole("button", { name: "Append upcoming titles", exact: true })
    .click();
  await waitOrder(mobileHost, ["room:youtube:" + C]);
  assert.equal(await mobileHost.locator('iframe[src*="youtube.com/embed"]').count(), 0);
  assert.equal(
    await panel(mobileHost)
      .getByRole("checkbox", { name: "Automatically play next queued title", exact: true })
      .isChecked(),
    true,
  );
  await panel(mobileHost).getByRole("button", { name: "Undo queue change", exact: true }).click();
  await waitOrder(mobileHost, []);
  await preview(mobileHost)
    .getByRole("button", { name: "Append upcoming titles", exact: true })
    .click();
  await waitOrder(mobileHost, ["room:youtube:" + C]);
  await mobileHost.reload();
  await mobileHost.locator('[data-home-ready="true"]').waitFor();
  const menu = mobileHost.getByRole("button", { name: "Open menu", exact: true });
  if (await menu.isVisible()) await menu.click();
  await mobileHost
    .getByRole("navigation", { name: "Library navigation" })
    .getByRole("button", { name: "Watch room", exact: true })
    .click();
  const resume = mobileHost.getByRole("button", { name: /^Resume last room/ });
  await resume.click();
  assert.deepEqual(await order(mobileHost), []);
  await importFile(mobileHost, exported.file);
  await preview(mobileHost)
    .getByRole("button", { name: "Append upcoming titles", exact: true })
    .click();
  await waitOrder(mobileHost, ["room:youtube:" + C]);
  assert.equal(await mobileHost.locator('iframe[src*="youtube.com/embed"]').count(), 0);
  checks.push(
    "Mobile host imports and undoes a public session in a fresh room, never stages its previous current title, and reload requires explicit re-import without restoring autoplay",
  );
  await importFile(host, exported.file);
  await handoff(host).scrollIntoViewIfNeeded();
  await host.screenshot({ path: output.replace(".json", "-desktop.png") });
  await preview(mobileHost).scrollIntoViewIfNeeded();
  await mobileHost.screenshot({ path: output.replace(".json", "-mobile.png") });
  await handoff(phone).scrollIntoViewIfNeeded();
  await phone.screenshot({ path: output.replace(".json", "-guest-mobile.png") });
  for (const p of pages)
    assert.equal(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  const packets = await host.evaluate(() => JSON.stringify(window.__sessionPackets));
  assert.doesNotMatch(packets, /PRIVATE_|realhub-watch-session|Unsupported provider|Invalid URL/);
  assert.deepEqual(errors, []);
  writeFileSync(
    output,
    JSON.stringify(
      {
        ok: true,
        checks,
        errors,
        limitation:
          "Three isolated browser clients use actual room state, WebRTC and disk persistence; public provider players are controlled fixtures. Physical devices and cross-network relay remain separate checks.",
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
