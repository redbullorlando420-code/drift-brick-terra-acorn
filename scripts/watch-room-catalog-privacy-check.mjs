import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { checkedUrl, checkedOutputPath } from "./browser-guard.mjs";
const origin = checkedUrl(process.argv[2] ?? "http://127.0.0.1:8080/"),
  output = checkedOutputPath(process.argv[3] ?? resolve("screenshots/catalog-privacy.json"), [
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
      window.__release = () => {
        for (const [channel, value] of window.__held.splice(0))
          if (channel.readyState === "open") send.call(channel, value);
      };
      window.__raw = (data) => {
        const proof=document.querySelector('[data-room-delivery-epoch]');
        data={intentAt:Date.now(),deliveryEpoch:proof?.getAttribute('data-room-delivery-epoch'),queueRevision:Number(proof?.getAttribute('data-room-queue-revision')),selectionRevision:Number(proof?.getAttribute('data-room-selection-revision')),...data};
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
  const [host, guest] = await Promise.all(contexts.map((context) => context.newPage()));
  pages = [host, guest];
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
  await search(guest).fill("Host archive");
  await guest.waitForFunction(
    () => document.querySelectorAll("[data-room-result-id]").length === 24,
  );
  const first = await results(guest).evaluateAll((rows) =>
    rows.map((row) => row.dataset.roomResultId),
  );
  await panel(guest).getByRole("button", { name: "More results", exact: true }).click();
  await guest.waitForFunction((first) => {
    const ids = [...document.querySelectorAll("[data-room-result-id]")].map(
      (row) => row.dataset.roomResultId,
    );
    return ids.length === 24 && !ids.some((id) => first.includes(id));
  }, first);
  await panel(guest).getByRole("button", { name: "Previous results", exact: true }).click();
  await guest.waitForFunction(
    (expected) =>
      document.querySelector("[data-room-result-id]")?.getAttribute("data-room-result-id") ===
      expected,
    first[0],
  );
  checks.push(
    "empty guest library defaults to host search; browse and next/previous pages reach unqueued titles beyond the current video without copying the catalog",
  );
  for (const index of [89, 90]) {
    await search(guest).fill(`Host archive ${String(index).padStart(3, "0")}`);
    await results(guest)
      .getByRole("button", { name: `Host archive ${String(index).padStart(3, "0")}`, exact: true })
      .waitFor();
    await results(guest).getByRole("button", { name: "Queue", exact: true }).click();
    await queue(host)
      .getByText(`Host archive ${String(index).padStart(3, "0")}`, { exact: true })
      .waitFor();
  }
  assert.equal(await queue(host).count(), 2);
  await queue(guest)
    .filter({ hasText: "Host archive 090" })
    .getByRole("button", { name: "Queue Host archive 090 next", exact: true })
    .click();
  await host.waitForFunction(
    () =>
      document.querySelector("[data-room-queue-id]")?.getAttribute("data-room-queue-id") ===
      "yt:host:90",
  );
  await queue(guest)
    .filter({ hasText: "Host archive 089" })
    .getByRole("button", { name: "Remove Host archive 089 from queue", exact: true })
    .click();
  await host.waitForFunction(() => document.querySelectorAll("[data-room-queue-id]").length === 1);
  checks.push(
    "guests queue previously unshared host titles; the host confirms their identities and order, including next priority and removal",
  );
  await settings
    .getByRole("checkbox", { name: "Let guests search my library", exact: true })
    .uncheck();
  await panel(guest)
    .getByText(/Host browsing is unavailable/)
    .waitFor();
  assert.equal(await results(guest).count(), 0);
  await settings
    .getByRole("checkbox", { name: "Let guests search my library", exact: true })
    .check();
  await settings.getByRole("button", { name: "Apply catalog sharing", exact: true }).click();
  await results(guest).getByRole("button", { name: "Host archive 090", exact: true }).waitFor();
  await search(guest).fill("Host local movie");
  await panel(guest)
    .getByText("No playable videos match. Try fewer words or another creator.", { exact: true })
    .waitFor();
  await settings
    .getByRole("checkbox", { name: "Include local video titles for guests", exact: true })
    .check();
  var localLabels = await settings
    .getByRole("checkbox")
    .evaluateAll((rows) => rows.map((row) => row.getAttribute("aria-label")));
  var localLabel = localLabels.find(
    (name) => name?.startsWith("Share collection ") && name !== "Share collection host-search",
  );
  assert.ok(localLabel);
  await settings.getByRole("checkbox", { name: localLabel, exact: true }).check();
  await settings.getByRole("button", { name: "Apply catalog sharing", exact: true }).click();
  await results(guest).getByRole("button", { name: "Host local movie", exact: true }).waitFor();
  await results(guest).getByRole("button", { name: "Queue", exact: true }).click();
  await queue(host).getByText("Host local movie", { exact: true }).waitFor();
  await queue(guest)
    .filter({ hasText: "Host local movie" })
    .getByRole("button", { name: "Remove Host local movie from queue", exact: true })
    .click();
  await host.waitForFunction(() => document.querySelectorAll("[data-room-queue-id]").length === 1);
  await settings
    .getByRole("checkbox", { name: "Include local video titles for guests", exact: true })
    .uncheck();
  await panel(guest)
    .getByText("No playable videos match. Try fewer words or another creator.", { exact: true })
    .waitFor();
  await search(guest).fill("Host archive 090");
  await results(guest).getByRole("button", { name: "Host archive 090", exact: true }).waitFor();
  checks.push(
    "local titles stay hidden by default, appear only after host opt-in, queue through host validation and are withdrawn when sharing is disabled",
  );

  await panel(host)
    .getByRole("checkbox", { name: "Allow guests to edit queue and select videos", exact: true })
    .uncheck();
  await results(guest).getByRole("button", { name: "Queue", exact: true }).waitFor();
  assert.equal(
    await results(guest).getByRole("button", { name: "Queue", exact: true }).isDisabled(),
    true,
  );
  assert.equal(
    await results(guest)
      .getByRole("button", { name: "Host archive 090", exact: true })
      .isDisabled(),
    true,
  );
  await panel(host)
    .getByRole("checkbox", { name: "Allow guests to edit queue and select videos", exact: true })
    .check();
  checks.push(
    "host can revoke and restore browsing; guest queue/selection locks remain enforced while titles stay discoverable",
  );
  await queue(guest)
    .getByRole("button", { name: "Request playback of Host archive 090", exact: true })
    .click();
  await Promise.all(pages.map((page) => page.locator('iframe[src*="v0000000090"]').waitFor()));
  await guest.waitForTimeout(2400);
  const before = await host.evaluate(
    () => window.__catalogPackets.filter((packet) => packet.type === "host-catalog-result").length,
  );
  await guest.waitForTimeout(2500);
  assert.equal(
    await host.evaluate(
      () =>
        window.__catalogPackets.filter((packet) => packet.type === "host-catalog-result").length,
    ),
    before,
    "steady playback never republishes the host library",
  );
  // A result already sent can arrive after revocation; guests must discard it.
  await host.evaluate(() => {
    window.__holdCatalog = true;
    window.__held = [];
  });
  await search(guest).fill("Host archive 088");
  await host.waitForFunction(() => window.__held.length > 0);
  const oldRevision = Number(await settings.getAttribute("data-catalog-revision"));
  const cached = await host.evaluate(
    () =>
      window.__catalogPackets.findLast((p) => p.type === "host-catalog-result" && p.media?.length)
        ?.media[0],
  );
  await settings
    .getByRole("checkbox", { name: "Let guests search my library", exact: true })
    .uncheck();
  await panel(guest)
    .getByText(/Host browsing is unavailable/)
    .waitFor();
  await host.evaluate(() => {
    window.__holdCatalog = false;
    window.__release();
  });
  assert.equal(await results(guest).count(), 0);
  await settings
    .getByRole("checkbox", { name: "Let guests search my library", exact: true })
    .check();
  await settings.getByRole("button", { name: "Apply catalog sharing", exact: true }).click();
  await results(guest).getByRole("button", { name: "Host archive 088", exact: true }).waitFor();
  const beforeStale = await queue(host).count();
  await guest.evaluate(
    ({ cached, oldRevision }) =>
      window.__raw({
        type: "queue-action",
        requestId: "stale-catalog-add",
        permissionRevision: Number(
          document
            .querySelector("[data-room-permission-revision]")
            ?.getAttribute("data-room-permission-revision"),
        ),
        catalogRevision: oldRevision,
        operation: { kind: "add", id: cached.id },
        media: cached,
        sentAt: Date.now(),
      }),
    { cached, oldRevision },
  );
  await host.waitForFunction(() =>
    window.__catalogPackets.some(
      (p) => p.type === "queue-result" && p.requestId === "stale-catalog-add",
    ),
  );
  assert.equal(await queue(host).count(), beforeStale);
  await settings.getByRole('checkbox',{name:'Share collection host-search',exact:true}).uncheck();
  await panel(guest).getByText('No playable videos match. Try fewer words or another creator.',{exact:true}).waitFor();
  assert.equal(await results(guest).count(),0);assert.equal(await host.locator('iframe[src*="v0000000090"]').count(),1);
  await settings.getByRole('checkbox',{name:'Share collection host-search',exact:true}).check();
  await settings.getByRole('button',{name:'Apply catalog sharing',exact:true}).click();
  await results(guest).getByRole('button',{name:'Host archive 088',exact:true}).waitFor();
  const deniedMedia={...cached,id:'guessed-private-id',name:'Guessed title',videoId:'secret00001',watchUrl:'https://www.youtube.com/watch?v=secret00001',embedUrl:'https://www.youtube.com/embed/secret00001'};
  await guest.evaluate(({deniedMedia,catalogRevision})=>window.__raw({type:'queue-batch',requestId:'private-alias-batch',permissionRevision:Number(document.querySelector('[data-room-permission-revision]').getAttribute('data-room-permission-revision')),catalogRevision,queueMedia:[deniedMedia],sentAt:Date.now()}),{deniedMedia,catalogRevision:Number(await settings.getAttribute('data-catalog-revision'))});
  await host.waitForFunction(()=>window.__catalogPackets.some(p=>p.type==='queue-result'&&p.requestId==='private-alias-batch'));
  assert.equal(await queue(host).count(),beforeStale);
  checks.push('removing a single collection revokes discovery immediately without stopping current playback; a private provider identity cannot bypass access with a forged guest ID');
  await search(guest).fill("CANARY");
  await panel(guest)
    .getByText("No playable videos match. Try fewer words or another creator.", { exact: true })
    .waitFor();
  assert.equal(await results(guest).count(), 0);
  checks.push(
    "revocation discards held pages; regrant rejects old catalog queue requests; private descriptions, labels and merged sources cannot be searched",
  );
  const wire = await host.evaluate(() =>
    JSON.stringify(
      window.__catalogPackets.filter((packet) => packet.type === "host-catalog-result"),
    ),
  );
  assert.equal(wire.includes("C:/private"), false);
  assert.equal(wire.includes("CANARY"), false);
  assert.ok(
    await host.evaluate(() =>
      window.__catalogPackets
        .filter((packet) => packet.type === "host-catalog-result")
        .every((packet) => packet.media === undefined || packet.media.length <= 24),
    ),
  );
  assert.equal(
    await guest.evaluate(
      () =>
        JSON.parse(localStorage.getItem("reelcase.follows.v1") ?? '{"channels":[]}').channels
          .length,
    ),
    0,
  );
  await guest.reload();
  await panel(guest).waitFor();
  await guest
    .getByRole("navigation", { name: "Watch room shortcuts" })
    .getByRole("button", { name: "Find videos", exact: true })
    .click();
  await search(guest).fill("Host archive 089");
  await results(guest).getByRole("button", { name: "Host archive 089", exact: true }).waitFor();
  checks.push(
    "selected host media plays on the empty guest, reconnect restores discovery, no host paths/follows are copied and clock heartbeats do not resend catalog pages",
  );
  await guest.screenshot({ path: output.replace(/\.json$/, "-mobile.png") });
  await settings.scrollIntoViewIfNeeded();
  await host.screenshot({ path: output.replace(/\.json$/, "-desktop.png") });
  await host.setViewportSize({width:390,height:844});
  await settings.getByRole('textbox',{name:'Filter shareable collections'}).fill('host-search');
  await settings.getByRole('checkbox',{name:'Include local video titles for guests',exact:true}).check();
  await settings.getByRole('region',{name:'Guest catalog preview'}).getByRole('button',{name:'Cancel catalog preview'}).click();
  assert.equal(await settings.getByRole('checkbox',{name:'Include local video titles for guests',exact:true}).isChecked(),false);
  await settings.scrollIntoViewIfNeeded();await host.screenshot({path:output.replace(/.json$/,'-host-mobile.png')});
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
          "Real WebRTC desktop host and mobile guest with 120 public titles, local file, private source, merged private membership, held result and forged stale queue request. Provider playback is a fixture.",
      },
      null,
      2,
    ),
  );
} catch (error) {
  for (const [i, page] of pages.entries()) {
    await page.screenshot({ path: output.replace(/\.json$/, `-failure-${i}.png`) }).catch(() => {});
    console.log(
      (
        await page
          .locator("body")
          .innerText()
          .catch(() => "")
      ).slice(-2200),
    );
  }
  writeFileSync(output, JSON.stringify({ ok: false, checks, errors, error: error.stack }, null, 2));
  throw error;
} finally {
  await browser.close();
}
