import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const origin = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? resolve("screenshots/room-reconnect.json"), [
    resolve("screenshots"),
  ]);
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--disable-features=WebRtcHideLocalIpsWithMdns"],
});
const checks = [],
  errors = [];
let pages = [];
try {
  const contexts = await Promise.all(
    [
      { width: 1440, height: 950 },
      { width: 390, height: 844 },
      { width: 1280, height: 900 },
    ].map((viewport) => browser.newContext({ viewport })),
  );
  for (const context of contexts) {
    await context.addInitScript(() => {
      localStorage.setItem("reelcase.pulls-paused.v1", "true");
      localStorage.setItem(
        "reelcase.sidebar.groups.v1",
        JSON.stringify({ library: true, workspace: true, tools: false }),
      );
      window.__catalogPackets = [];
      window.__channels = new Set();
      window.__held = [];
      const send = RTCDataChannel.prototype.send;
      const PC = RTCPeerConnection;
      window.__pcs = [];
      window.RTCPeerConnection = class extends PC {
        constructor(config) {
          super(config);
          window.__pcs.push(this);
        }
      };
      const get = Object.getOwnPropertyDescriptor(RTCDataChannel.prototype, "bufferedAmount").get;
      Object.defineProperty(RTCDataChannel.prototype, "bufferedAmount", {
        configurable: true,
        get() {
          return window.__saturate && this.label === "reliable" ? 12000 : get.call(this);
        },
      });
      const now = Date.now;
      Date.now = () => now() + Number(window.__advance ?? 0);
      window.__release = () => {
        for (const [channel, value] of window.__held.splice(0))
          if (channel.readyState === "open") send.call(channel, value);
      };
      window.__raw = (data) => {
        const proof = document.querySelector("[data-room-delivery-epoch]");
        data = {
          deliveryEpoch: proof?.getAttribute("data-room-delivery-epoch"),
          queueRevision: Number(proof?.getAttribute("data-room-queue-revision")),
          selectionRevision: Number(proof?.getAttribute("data-room-selection-revision")),
          ...data,
        };
        for (const channel of window.__channels)
          if (channel.readyState === "open")
            send.call(channel, JSON.stringify({ t: "d", d: data }));
      };
      RTCDataChannel.prototype.send = function (value) {
        if (this.label === "reliable") window.__channels.add(this);
        try {
          const packet = JSON.parse(value);
          if (packet.t === "d") {
            window.__catalogPackets.push(packet.d);
            if (window.__catalogPackets.length > 300) window.__catalogPackets.shift();
            if (window.__dropReceipts && ["queue-result", "queue-receipts"].includes(packet.d.type))
              return;
            if (
              window.__holdIntents &&
              [
                "queue-action",
                "queue-edit",
                "queue-batch",
                "video-request",
                "next-request",
                "queue-shuffle",
                "queue-suggest",
              ].includes(packet.d.type) &&
              !packet.d.reconciled
            ) {
              window.__held.push([this, value]);
              return;
            }
            if (window.__dropQueries && packet.d.type === "queue-receipt-query") return;
            if (window.__holdCatalog && packet.d.type === "host-catalog-result") {
              window.__held.push([this, value]);
              return;
            }
          }
        } catch {}
        return send.call(this, value);
      };
    });
    await context.route("**/api/lan-origin", (route) =>
      route.fulfill({ contentType: "application/json", body: '{"origins":[]}' }),
    );
    await context.route("http://127.0.0.1:43123/**", (route) =>
      route.fulfill({
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: '{"ok":false}',
      }),
    );
    await context.route("https://www.youtube.com/embed/**", (route) =>
      route.fulfill({ contentType: "text/html", body: "<p>Room provider fixture</p>" }),
    );
    await context.route("https://i.ytimg.com/**", (route) =>
      route.fulfill({
        contentType: "image/svg+xml",
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"><rect width="160" height="90" fill="#345168"/></svg>',
      }),
    );
  }
  const [host, guest, other] = await Promise.all(contexts.map((context) => context.newPage()));
  pages = [host, guest, other];
  for (const page of pages) {
    page.setDefaultTimeout(25000);
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
  }
  const panel = (page) => page.getByRole("region", { name: "Room query and queue", exact: true }),
    results = (page) => panel(page).locator("[data-room-result-id]"),
    search = (page) =>
      panel(page).getByRole("textbox", { name: "Search room videos", exact: true }),
    queue = (page) => panel(page).locator("[data-room-queue-id]");
  await host.goto(origin);
  await host.locator('[data-home-ready="true"]').waitFor();
  await host.waitForFunction(async () =>
    (await indexedDB.databases()).some((db) => db.name === "reelcase"),
  );
  await host.evaluate(async () => {
    localStorage.setItem(
      "reelcase.follows.v1",
      JSON.stringify({
        channels: [
          { id: "yt:host-search", kind: "youtube", handle: "host", title: "Host creator" },
          {
            id: "yt:secret",
            kind: "youtube",
            handle: "hidden",
            title: "CANARY PRIVATE COLLECTION",
          },
        ],
        savedAt: Date.now(),
      }),
    );
    localStorage.setItem(
      "reelcase.prefs.v4",
      JSON.stringify({ privateFolderIds: ["yt:secret"], hideDemo: true }),
    );
    const db = await new Promise((resolve, reject) => {
      const req = indexedDB.open("reelcase");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    await new Promise((resolve, reject) => {
      const tx = db.transaction(["remote-cache", "videos"], "readwrite"),
        store = tx.objectStore("remote-cache");
      store.put({ folders: [], checkedAt: Date.now() }, "meta");
      for (let i = 0; i < 120; i++) {
        const id = `v${String(i).padStart(10, "0")}`;
        store.put(
          {
            id: `yt:host:${i}`,
            folderId: "yt:host-search",
            name: `Host archive ${String(i).padStart(3, "0")}`,
            path: "C:/private/host-only",
            extension: "yt",
            mime: "video/youtube",
            size: 0,
            addedAt: 0,
            duration: 600,
            description: "CANARY PRIVATE DESCRIPTION Racing strategy host collection",
            remote: {
              kind: "youtube",
              videoId: id,
              channelName: "Host creator",
              watchUrl: `https://www.youtube.com/watch?v=${id}`,
              embedUrl: `https://www.youtube.com/embed/${id}`,
            },
          },
          `video:yt:host:${i}`,
        );
      }
      for (const [id, folderId, sourceIds] of [
        ["secret", "yt:secret", undefined],
        ["merged", "yt:host-search", ["yt:secret"]],
      ])
        store.put(
          {
            id: "yt:" + id,
            folderId,
            name: "CANARY PRIVATE " + id,
            path: "C:/CANARY/private",
            extension: "yt",
            mime: "video/youtube",
            size: 0,
            addedAt: 0,
            duration: 600,
            remote: {
              kind: "youtube",
              videoId: id === "secret" ? "secret00001" : "merged00001",
              channelName: "CANARY PRIVATE CREATOR",
              sourceIds,
            },
          },
          "video:yt:" + id,
        );
      tx.objectStore("videos").put({
        id: "file:host-private",
        folderId: "files:host",
        name: "Host local movie",
        path: "C:/private/host-local.mp4",
        extension: "mp4",
        mime: "video/mp4",
        size: 1000,
        duration: 30,
        addedAt: 1,
      });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
  await host.reload();
  await host.getByText("123 indexed", { exact: true }).waitFor();
  await host
    .getByRole("navigation", { name: "Library navigation" })
    .getByRole("button", { name: "Watch room", exact: true })
    .click();
  await host.getByRole("button", { name: "Start room", exact: true }).click();
  const room = (await host.getByRole("heading", { name: /^Room RC/ }).innerText()).replace(
    "Room ",
    "",
  );
  const settings = host.locator('details[aria-label="Guest catalog privacy"]');
  await settings.locator("summary").click();
  assert.equal(
    await settings
      .getByRole("checkbox", { name: "Let guests search my library", exact: true })
      .isChecked(),
    false,
  );
  await settings
    .getByRole("checkbox", { name: "Share collection host-search", exact: true })
    .check();
  await settings
    .getByRole("checkbox", { name: "Let guests search my library", exact: true })
    .check();
  await settings
    .getByRole("region", { name: "Guest catalog preview" })
    .getByText(/24 titles on the first page/)
    .waitFor();
  assert.ok(!(await settings.innerText()).includes("CANARY"));
  await settings.getByRole("button", { name: "Apply catalog sharing", exact: true }).click();
  checks.push(
    "host previews a selected public collection before enabling discovery; private collection names and merged private titles are absent",
  );
  await guest.goto(new URL(`/?room=${room}&theater=1`, origin).href);
  await panel(guest).waitFor();
  await guest
    .getByRole("navigation", { name: "Watch room shortcuts" })
    .getByRole("button", { name: "Find videos", exact: true })
    .click();
  await panel(guest).getByRole("button", { name: "Host library", exact: true }).waitFor();

  const delivery = (page) => page.locator('details[aria-label="Queue delivery status"]');
  const receipts = (page) => delivery(page).locator("[data-queue-intent-status]");
  const add = async (page, id) => {
    await panel(page)
      .getByRole("textbox", { name: "Public video link", exact: true })
      .fill("https://youtu.be/" + id);
    await panel(page).getByRole("button", { name: "Add link to queue", exact: true }).click();
  };
  await other.goto(new URL("/?room=" + room + "&theater=1", origin).href);
  await delivery(other).waitFor();
  await Promise.all(
    [guest, other].map((page) =>
      page.waitForFunction(() =>
        Boolean(
          document
            .querySelector("[data-room-delivery-epoch]")
            ?.getAttribute("data-room-delivery-epoch"),
        ),
      ),
    ),
  );
  await delivery(guest).locator("summary").click();
  const play = host.getByRole("button", { name: "Play", exact: true });
  if (await play.count()) await play.click();
  await Promise.all(
    [guest, other].map((page) =>
      page.waitForFunction(() => document.querySelectorAll("[data-room-result-id]").length === 24),
    ),
  );
  await host.evaluate(() => (window.__saturate = true));
  await search(guest).fill("Host archive");
  await other
    .getByRole("navigation", { name: "Watch room shortcuts" })
    .getByRole("button", { name: "Find videos", exact: true })
    .click();
  await search(other).fill("Host archive");
  await delivery(host).locator("summary").click();
  await delivery(host)
    .getByText(/Waiting for transport space/)
    .waitFor();
  const pressureStart = Date.now();
  await host
    .getByRole("textbox", { name: "Room chat message" })
    .fill("Control lane during catalog transfer");
  await host.getByRole("textbox", { name: "Room chat message" }).press("Enter");
  await Promise.all(
    [guest, other].map((page) =>
      page
        .getByRole("log", { name: "Room messages" })
        .getByText(/Control lane during catalog transfer/)
        .waitFor({ timeout: 2000 }),
    ),
  );
  const pause = host.getByRole("button", { name: "Pause", exact: true });
  if (await pause.count()) await pause.click();
  await Promise.all(
    [guest, other].map((page) =>
      page
        .getByRole("heading", { name: "Paused together", exact: true })
        .waitFor({ timeout: 2000 }),
    ),
  );
  assert.ok(Date.now() - pressureStart < 5000);
  assert.equal(await results(guest).count(), 0);
  assert.equal(await results(other).count(), 0);
  // A search interrupted by backpressure gets one bounded retry with the same identity.
  await guest.waitForFunction(
    () =>
      window.__catalogPackets.filter(
        (p) => p.type === "host-catalog-search" && p.query === "Host archive",
      ).length >= 2,
  );
  const searchIds = await guest.evaluate(() =>
    window.__catalogPackets
      .filter((p) => p.type === "host-catalog-search" && p.query === "Host archive")
      .map((p) => p.requestId),
  );
  assert.equal(new Set(searchIds).size, 1);
  await host.evaluate(() => (window.__saturate = false));
  await Promise.all(
    [guest, other].map((page) =>
      page.waitForFunction(() => document.querySelectorAll("[data-room-result-id]").length === 24),
    ),
  );
  checks.push(
    "three real WebRTC clients keep chat and pause responsive while both catalog searches are held by measured buffer backpressure; a bounded search retry keeps its request ID",
  );
  await guest.evaluate(() => {
    window.__holdIntents = true;
    window.__held = [];
  });
  await add(guest, "retryOnce01");
  await receipts(guest).filter({ hasText: "Waiting for host" }).waitFor();
  await queue(host).getByText("YouTube · retryOnce01", { exact: true }).waitFor();
  await receipts(guest).filter({ hasText: "Applied" }).waitFor();
  const retryPackets = await guest.evaluate(() =>
    window.__catalogPackets.filter(
      (p) => p.type === "queue-batch" && p.queueMedia?.some((m) => m.videoId === "retryOnce01"),
    ),
  );
  assert.equal(retryPackets.length, 2);
  assert.equal(retryPackets[0].requestId, retryPackets[1].requestId);
  assert.equal(retryPackets[1].reconciled, true);
  await guest.evaluate(() => (window.__holdIntents = false));
  checks.push(
    "a missing request is checked with the host, then retried once with the original operation ID only while queue/selection revisions still match",
  );
  // Apply, lose the acknowledgement, consume the title, and rebuild the guest peer paths.
  await host.evaluate(() => (window.__dropReceipts = true));
  await add(guest, "consume0001");
  await queue(host).getByText("YouTube · consume0001", { exact: true }).waitFor();
  const beforeRetryCount = await guest.evaluate(
    () =>
      window.__catalogPackets.filter(
        (p) => p.type === "queue-batch" && p.queueMedia?.some((m) => m.videoId === "consume0001"),
      ).length,
  );
  await guest.evaluate(() => {
    for (const pc of window.__pcs) if (pc.connectionState !== "closed") pc.close();
  });
  // Host consumes both items while the acknowledgement path is interrupted.
  await panel(host).getByRole("button", { name: "Play next", exact: true }).click();
  await panel(host).getByRole("button", { name: "Play next", exact: true }).click();
  assert.equal(await queue(host).count(), 0);
  const timeline = guest.locator('details[aria-label="Room connection timeline"]');
  await timeline.locator("summary").first().click();
  await timeline
    .getByRole("button", { name: "Retry failed peer paths", exact: true })
    .first()
    .click();
  await host.evaluate(() => (window.__dropReceipts = false));
  await guest.locator('iframe[src*="consume0001"]').waitFor();
  await receipts(guest).filter({ hasText: "Applied" }).nth(1).waitFor();
  assert.equal(await queue(host).count(), 0);
  assert.equal(
    await guest.evaluate(
      () =>
        window.__catalogPackets.filter(
          (p) => p.type === "queue-batch" && p.queueMedia?.some((m) => m.videoId === "consume0001"),
        ).length,
    ),
    beforeRetryCount,
  );
  checks.push(
    "disconnect after host apply but before receipt reconciles as applied after peer recovery; a consumed title is not reinserted and the original mutation is not resent",
  );
  // An absent intent becomes superseded when the host changes the canonical queue.
  await guest.evaluate(() => {
    window.__holdIntents = true;
    window.__held = [];
  });
  await add(guest, "obsolete001");
  await add(host, "hostChange1");
  await receipts(guest).filter({ hasText: "Superseded" }).waitFor();
  await guest.evaluate(() => {
    window.__holdIntents = false;
    window.__release();
  });
  await host.waitForFunction(() =>
    window.__catalogPackets.some((p) => p.type === "queue-result" && p.outcome === "superseded"),
  );
  assert.equal(await queue(host).filter({ hasText: "obsolete001" }).count(), 0);
  checks.push(
    "a missing receipt with a newer queue revision becomes superseded; even a delayed old original cannot resurrect the excluded title after its receipt query",
  );
  await guest.evaluate(() => {
    window.__holdIntents = true;
    window.__held = [];
  });
  await add(guest, "reject00001");
  await panel(host)
    .getByRole("checkbox", { name: "Allow guests to edit queue and select videos", exact: true })
    .uncheck();
  await guest.evaluate(() => {
    window.__holdIntents = false;
    window.__release();
  });
  await receipts(guest).filter({ hasText: "Rejected" }).waitFor();
  assert.equal(await queue(host).filter({ hasText: "reject00001" }).count(), 0);
  await panel(host)
    .getByRole("checkbox", { name: "Allow guests to edit queue and select videos", exact: true })
    .check();
  await guest.waitForFunction(
    () =>
      document
        .querySelector("[data-room-permission-revision]")
        ?.getAttribute("data-room-permission-revision") === "2",
  );
  checks.push(
    "permission revocation during a held intention produces an explicit rejected receipt with no queue mutation",
  );
  await guest.evaluate(() => {
    window.__holdIntents = true;
    window.__dropQueries = true;
    window.__held = [];
  });
  await add(guest, "expires0001");
  await guest.evaluate(() => (window.__advance = 46000));
  await receipts(guest).filter({ hasText: "Expired" }).waitFor();
  await guest.evaluate(() => {
    window.__advance = 0;
    window.__holdIntents = false;
    window.__dropQueries = false;
    window.__held = [];
  });
  assert.equal(await queue(host).filter({ hasText: "expires0001" }).count(), 0);
  // An unrelated draft is not part of the confirmed queue or receipt ledger.
  const draft = panel(guest).getByRole("textbox", { name: "Public video link", exact: true });
  await draft.fill("https://youtu.be/unsent00001");
  await host.getByRole("textbox", { name: "Room chat message" }).fill("Unrelated room update");
  await host.getByRole("textbox", { name: "Room chat message" }).press("Enter");
  assert.equal(await draft.inputValue(), "https://youtu.be/unsent00001");
  checks.push(
    "orphaned edits expire without replay and ordinary room updates leave unsent draft text intact",
  );
  await delivery(guest).scrollIntoViewIfNeeded();
  await guest.screenshot({ path: output.replace(/.json$/, "-mobile.png") });
  await delivery(host).scrollIntoViewIfNeeded();
  await host.screenshot({ path: output.replace(/.json$/, "-desktop.png") });
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
        fixture:
          "Three isolated clients with real WebRTC; controlled bufferedAmount, dropped receipts, held mutations, actual guest PC close/recreate and a deterministic local clock step. Provider player documents are fixtures.",
        limitations: [
          "No physical-device or real-network bandwidth benchmark. Native SCTP bytes already sent cannot be preempted.",
        ],
      },
      null,
      2,
    ),
  );
} catch (error) {
  for (const [i, page] of pages.entries()) {
    console.log(
      (
        await page
          .locator("body")
          .innerText()
          .catch(() => "")
      ).slice(-3000),
    );
    console.log(await page.evaluate(() => window.__catalogPackets?.slice(-12)).catch(() => []));
    await page
      .screenshot({ path: output.replace(/.json$/, "-failure-" + i + ".png") })
      .catch(() => {});
  }
  writeFileSync(output, JSON.stringify({ ok: false, checks, errors, error: error.stack }, null, 2));
  throw error;
} finally {
  await browser.close();
}
