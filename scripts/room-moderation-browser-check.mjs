import assert from "node:assert/strict";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { checkedOutputPath, checkedUrl } from "./browser-guard.mjs";

const origin = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/");
const output = checkedOutputPath(process.argv[3] ?? "screenshots/room-moderation-dev.json", [
  resolve("screenshots"),
]);
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--disable-features=WebRtcHideLocalIpsWithMdns"],
});
const report = { ok: false, checks: [], errors: [] };
const hostContext = await browser.newContext({ viewport: { width: 1440, height: 960 } });
const guestContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
});
const host = await hostContext.newPage(),
  guest = await guestContext.newPage();
const shot = (page, name) =>
  page.screenshot({ path: output.replace(/\.json$/, "-" + name + ".png") });
const queue = (page) => page.getByRole("region", { name: "Room query and queue" });
const rows = (page) => queue(page).locator("[data-room-queue-id]");
const order = (page) =>
  rows(page).evaluateAll((elements) => elements.map((e) => e.dataset.roomQueueId));
const stage = (page) =>
  queue(page).getByLabel("Room current video").locator("p").nth(1).innerText();
const setRole = async (role) => {
  await host.getByLabel("Preview guest role").selectOption(role.toLowerCase());
  await host.getByRole("button", { name: "Apply " + role + " role" }).click();
};
const waitOrder = async (page, id) =>
  page.waitForFunction(
    (id) => document.querySelector("[data-room-queue-id]")?.dataset.roomQueueId === id,
    id,
  );
const connect = async (room) => {
  await guest.goto(new URL("?room=" + room + "&theater=1", origin).href);
  for (const page of [host, guest])
    await page
      .getByText(/1\/1 connected/)
      .first()
      .waitFor();
};
const grant = async () => {
  const details = host
    .locator("details")
    .filter({ has: host.getByText(/^Temporary queue moderators/) });
  if (!(await details.evaluate((e) => e.open))) await details.locator("summary").click();
  const picker = details.getByLabel("Connected guest");
  await picker.locator("option").nth(1).waitFor({ state: "attached" });
  await picker.selectOption({ index: 1 });
  await details.getByLabel("Duration").selectOption("1");
  await details.getByRole("button", { name: "Grant queue moderation" }).click();
  await guest.getByText(/^Temporary queue moderator ·/).waitFor();
};
const hold = (type) =>
  guest.evaluate((type) => {
    window.__heldRoom = null;
    window.__holdRoom = type;
  }, type);
const release = () =>
  guest.evaluate(() => {
    const held = window.__heldRoom;
    if (!held) throw Error("No held packet");
    window.__holdRoom = null;
    window.__sendRoom.call(held.channel, held.wire);
    return JSON.parse(held.wire).d;
  });
try {
  for (const context of [hostContext, guestContext]) {
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem("reelcase.pull-settings.v1", JSON.stringify({ automaticPulls: false }));
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: true }),
      );
      const original = RTCDataChannel.prototype.send;
      window.__sendRoom = original;
      RTCDataChannel.prototype.send = function (wire) {
        if (typeof wire === "string" && window.__holdRoom) {
          try {
            const d = JSON.parse(wire).d;
            if (d?.type === window.__holdRoom) {
              window.__heldRoom = { channel: this, wire };
              return;
            }
          } catch {}
        }
        return original.call(this, wire);
      };
    });
    await context.route("https://www.youtube.com/embed/**", (r) =>
      r.fulfill({ contentType: "text/html", body: "<p>Controlled player</p>" }),
    );
    await context.route("https://i.ytimg.com/**", (r) =>
      r.fulfill({
        status: 200,
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 9"><rect width="16" height="9" fill="#465579"/></svg>',
      }),
    );
  }
  for (const [page, role] of [
    [host, "host"],
    [guest, "guest"],
  ]) {
    page.setDefaultTimeout(30000);
    page.on("pageerror", (e) => report.errors.push(role + ": " + e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && !/net::ERR_ABORTED/.test(m.text()))
        report.errors.push(role + ": " + m.text());
    });
  }
  await host.goto(origin);
  await host.locator('[data-home-ready="true"]').waitFor();
  const localName = "Host catalog evidence.mp4";
  await host
    .locator('input[type="file"][accept="video/*"]')
    .first()
    .setInputFiles({
      name: localName,
      mimeType: "video/mp4",
      buffer: await readFile("public/samples/tungsten-reel.mp4"),
    });
  await host.getByText("Found 1 video in Added files", { exact: true }).waitFor();
  await host.getByRole("button", { name: "Watch room", exact: true }).click();
  await host.getByRole("button", { name: "Start room", exact: true }).click();
  const room = (await host.getByRole("heading", { name: /^Room RC/ }).innerText())
    .replace(/^Room /, "")
    .trim();
  await connect(room);
  const initialStage = await stage(host);
  const link = queue(host).getByRole("textbox", { name: "Public video link" });
  await link.fill(
    "https://youtu.be/aaa12345678\nhttps://www.youtube.com/watch?v=aaa12345678\nhttps://youtu.be/bbb12345678",
  );
  await queue(host).getByRole("button", { name: "Add link to queue" }).click();
  await queue(host).getByText("Duplicate review · 1").click();
  await queue(host).getByText("Host pasted link · YouTube · aaa12345678").waitFor();
  assert.equal((await order(host)).length, 2);
  await queue(host).getByRole("button", { name: "Keep both", exact: true }).scrollIntoViewIfNeeded();
  await shot(host, "desktop-duplicate-review");
  await queue(host).getByRole("button", { name: "Keep both", exact: true }).click();
  await rows(guest).nth(2).waitFor();
  const repeated = await order(host);
  assert.equal(repeated.length, 3);
  assert.match(repeated[2], /^room-repeat-/);
  assert.equal(await stage(host), initialStage);
  await guest.reload();
  await rows(guest).nth(2).waitFor();
  assert.deepEqual(await order(guest), repeated);
  await queue(host).getByRole("button", { name: "Consolidate matches", exact: true }).click();
  await rows(guest).nth(2).waitFor({ state: "detached" });
  assert.deepEqual(await order(host), repeated.slice(0, 2));
  assert.equal(await stage(host), initialStage);
  report.checks.push(
    "Equivalent URL aliases await a host decision, kept slots survive a guest rejoin, and consolidation preserves current playback and unrelated IDs.",
  );

  await setRole("Viewer");
  await guest.getByText("Your room role · Viewer").waitFor();
  const remove = () =>
    queue(guest)
      .getByRole("button", { name: /Remove YouTube .*aaa12345678 from queue/ })
      .first();
  assert(await remove().isDisabled());
  await grant();
  assert(!(await remove().isDisabled()));
  assert(
    await queue(guest).getByRole("button", { name: "Request next", exact: true }).isDisabled(),
  );
  assert(await queue(guest).getByRole("button", { name: "Add link to queue" }).isDisabled());
  await shot(host, "desktop-delegation");
  await queue(guest)
    .getByRole("button", { name: /Queue YouTube .*bbb12345678 next/ })
    .click();
  await waitOrder(host, repeated[1]);
  await hold("queue-action");
  await remove().click();
  await guest.waitForFunction(() => !!window.__heldRoom);
  await host.getByRole("button", { name: "Revoke moderation" }).click();
  await guest.getByText(/^Temporary queue moderator ·/).waitFor({ state: "detached" });
  const staleGrant = await release();
  assert(staleGrant.delegationId);
  await queue(guest)
    .getByText(/Temporary queue moderation expired, changed or does not cover/)
    .waitFor();
  assert.deepEqual(await order(host), [repeated[1], repeated[0]]);
  await grant();
  await host.evaluate(() => {
    const original = performance.now.bind(performance);
    window.__roomRealNow = original;
    performance.now = () => original() + 61000;
  });
  await remove().click();
  await queue(guest)
    .getByText(/Temporary queue moderation expired, changed or does not cover/)
    .waitFor();
  await host.evaluate(() => {
    performance.now = window.__roomRealNow;
  });
  assert.deepEqual(await order(host), [repeated[1], repeated[0]]);
  await guest.reload();
  await rows(guest).nth(1).waitFor();
  assert.equal(await guest.getByText(/^Temporary queue moderator ·/).count(), 0);
  report.checks.push(
    "A viewer can reorder only with a live per-connection grant; delayed revoked and expired edits are refused and guest reload has no grant.",
  );

  await queue(host).getByRole("button", { name: "Play next", exact: true }).click();
  await setRole("Contributor");
  await guest.getByText("Your room role · Contributor").waitFor();
  const privacy = host.getByLabel("Guest catalog privacy");
  await privacy.locator("summary").click();
  const sharing = privacy.getByLabel("Let guests search my library");
  const enable = async () => {
    await sharing.check();
    await privacy.getByLabel("Include local video titles for guests").check();
    await privacy.getByLabel("Share collection Added files").check();
    await privacy.getByRole("button", { name: /Apply|Share selected/ }).click();
  };
  await enable();
  const search = guest.getByRole("region", { name: "Find room videos" });
  await search.getByRole("button", { name: "Host library", exact: true }).click();
  await search.getByRole("textbox", { name: "Search room videos" }).fill("Host catalog evidence");
  const result = search.locator('[data-room-result-source="host"]');
  const suggest = () => result.getByRole("button", { name: "Suggest " + localName });
  await suggest().waitFor();
  await result.getByText("Host-shared library", { exact: true }).waitFor();
  assert.match(await result.getAttribute("data-room-result-id"), /^room-file:/);
  assert(!/files:|[A-Z]:\\/.test(await result.innerText()));
  await result.scrollIntoViewIfNeeded();
  await shot(guest, "mobile-search-provenance");
  await hold("queue-suggest");
  await suggest().click();
  await guest.waitForFunction(() => !!window.__heldRoom);
  await sharing.uncheck();
  await result.waitFor({ state: "detached" });
  const staleSearch = await release();
  assert.equal(staleSearch.searchEvidence.source, "host");
  await queue(guest)
    .getByText(/unavailable or sharing changed/)
    .waitFor();
  const hostReview = host.getByRole("region", { name: "Guest video suggestions" });
  assert.equal(await hostReview.getByText(localName, { exact: true }).count(), 0);
  await enable();
  await suggest().click();
  await hostReview.getByText(localName, { exact: true }).waitFor();
  await hostReview.getByRole("button", { name: "Approve to end" }).click();
  await queue(guest).getByRole("button", { name: localName, exact: true }).waitFor();
  assert((await order(guest)).some((id) => id.startsWith("room-file:")));
  assert(!String(await order(guest)).includes("files:"));
  await queue(host).getByRole("button", { name: localName, exact: true }).click();
  await host.waitForFunction(
    () => Array.from(document.querySelectorAll("video")).some(v => v.currentSrc.startsWith("blob:") && v.readyState >= 2),
  );
  await queue(guest).getByLabel("Room current video").getByText(localName, {exact:true}).waitFor();
  await search.getByRole("button", { name: "My library", exact: true }).click();
  await search.getByText("No playable videos match.", { exact: false }).waitFor();
  report.checks.push(
    "An empty-library guest can identify and suggest an opaque host file; a delayed request after sharing revocation is rejected, and approval preserves the opaque ID.",
  );
  for (const page of [host, guest])
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
  assert.deepEqual(report.errors, []);
  report.ok = true;
} catch (e) {
  report.error = e.stack;
  await Promise.allSettled([shot(host, "host-failure"), shot(guest, "guest-failure")]);
  console.error(e.stack);
} finally {
  await browser.close();
  await writeFile(output, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exitCode = report.ok ? 0 : 1;
}
