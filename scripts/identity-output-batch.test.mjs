import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, next) {
    if (s.startsWith("@/"))
      return next(new URL("../src/" + s.slice(2) + ".ts", import.meta.url).href, c);
    try {
      return next(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return next(s + ".ts", c);
      throw e;
    }
  },
});
const { twitchUrlIdentity, twitchIdentity, twitchIdentityKeys } =
  await import("../src/lib/videos/twitch-identity.ts");
const {
  mergeRemoteCatalogAsync,
  mergeRemoteCatalog,
  prepareIndexedRemoteCatalog,
  remoteVideoIndex,
} = await import("../src/lib/videos/remote-merge.ts");
const { admitRemoteEntries } = await import("../src/lib/videos/entry-limits.ts");
const { DEFAULT_PULL_SETTINGS } = await import("../src/lib/pull-settings.ts");
const { roomVideoFromUrl, roomMediaKey } = await import("../src/lib/multiplayer/room-media.ts");
const { StudioSession } = await import("../src/lib/studio-session.ts");
const { DEFAULT_STUDIO_SETTINGS } = await import("../src/lib/studio-settings.ts");
const settings = { ...DEFAULT_STUDIO_SETTINGS, prompt: "Saved forest", seed: 42 };
const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jD5sAAAAASUVORK5CYII=";
const urls = [
  "https://clips.twitch.tv/SomeClip-ABC?tt_content=tracking",
  "https://www.twitch.tv/creator/clip/SomeClip-ABC?filter=clips",
  "https://m.twitch.tv/other/clip/SomeClip-ABC",
  "https://clips.twitch.tv/embed?clip=SomeClip-ABC&parent=localhost",
];
const card = (url, id = "kept", folder = "tw:creator") => ({
  id,
  folderId: folder,
  name: "Similar title",
  path: "clip",
  extension: "clip",
  mime: "video/twitch",
  size: 0,
  addedAt: 10,
  remote: { kind: "twitch", watchUrl: url, videoId: "SomeClip-ABC", live: false, observedAt: 20 },
});
test("official clip forms and VOD routes derive typed case-sensitive identities", () => {
  for (const url of urls)
    assert.deepEqual(twitchUrlIdentity(url), { kind: "clip", value: "SomeClip-ABC" });
  for (const url of [
    "https://twitch.tv/videos/123",
    "https://m.twitch.tv/videos/123?t=1h",
    "https://player.twitch.tv/?video=v123",
  ])
    assert.deepEqual(twitchUrlIdentity(url), { kind: "vod", value: "123" });
  assert.deepEqual(twitchUrlIdentity("https://twitch.tv/Creator"), {
    kind: "live",
    value: "creator",
  });
  for (const url of [
    "https://evil.test/creator/clip/SomeClip-ABC",
    "https://twitch.tv.evil.test/videos/123",
    "https://user:pass@clips.twitch.tv/SomeClip-ABC",
    "https://clips.twitch.tv/one/more",
    "https://twitch.tv/directory",
    "https://player.twitch.tv/?video=oops",
    "javascript:alert(1)",
  ])
    assert.equal(twitchUrlIdentity(url), undefined);
  assert.equal(
    twitchIdentity({ watchUrl: urls[0], embedUrl: "https://clips.twitch.tv/Different" }),
    undefined,
  );
});
test("a numeric provider ID aliases a slug only with the explicit response pair", async () => {
  const numeric = { ...card(undefined, "old-numeric"), remote: { kind: "twitch", videoId: "999" } };
  const incoming = card(urls[0], "new-slug");
  incoming.remote.twitchClipIdentity = { version: 1, slug: "SomeClip-ABC", id: "999" };
  assert.deepEqual(twitchIdentityKeys(numeric), ["twitch:clip-id:999"]);
  const restoredLegacy = await mergeRemoteCatalogAsync([], [numeric]);
  assert.equal(restoredLegacy[0].remote.watchUrl, undefined);
  const merged = await mergeRemoteCatalogAsync(restoredLegacy, [incoming]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].id, "old-numeric");
  assert.equal(merged[0].remote.twitchClipIdentity.id, "999");
  const unrelated = {
    ...incoming,
    remote: { ...incoming.remote, twitchClipIdentity: { version: 1, slug: "wrong", id: "999" } },
  };
  assert.equal((await mergeRemoteCatalogAsync([numeric], [unrelated])).length, 2);
});
test("all admission merges retain the saved ID and union source edges, never title-match", async () => {
  const saved = card(urls[0]),
    incoming = card(urls[1], "alias", "tw:other");
  const result = await mergeRemoteCatalogAsync([saved], [incoming]);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "kept");
  assert.equal(result[0].folderId, "tw:creator");
  assert.deepEqual(result[0].remote.sourceIds, ["tw:creator", "tw:other"]);
  const index = remoteVideoIndex([saved]),
    positions = new Map([...index].map(([key]) => [key, 0]));
  const sync = mergeRemoteCatalog([saved], [incoming], new Map(positions), []);
  assert.equal(sync.length, 1);
  const indexed = await prepareIndexedRemoteCatalog([saved], [incoming], positions);
  assert.equal(indexed.videos.length, 1);
  assert.equal(indexed.rows[0].id, "kept");
  const distinct = card("https://clips.twitch.tv/SomeClip-Abc", "case-different");
  assert.equal((await mergeRemoteCatalogAsync(result, [distinct])).length, 2);
  const vod = {
    ...card("https://twitch.tv/videos/999", "vod"),
    extension: "vod",
    remote: { kind: "twitch", videoId: "999", watchUrl: "https://twitch.tv/videos/999" },
  };
  assert.equal((await mergeRemoteCatalogAsync(result, [vod])).length, 2);
});
test("aliases consume one entry slot, refresh at the cap and share one room identity", async () => {
  const rows = urls.map((url, i) => card(url, "alias" + i, "tw:source" + i));
  const admitted = await admitRemoteEntries([], rows, {
    ...DEFAULT_PULL_SETTINGS,
    remoteMaxEntries: 1,
    twitchMaxEntries: 1,
  });
  assert.equal(admitted.added, 1);
  assert.equal(admitted.skipped, 0);
  assert.equal(new Set(admitted.videos.map((v) => v.id)).size, 1);
  assert.equal((await mergeRemoteCatalogAsync([], admitted.videos)).length, 1);
  const refresh = await admitRemoteEntries([rows[0]], [rows[1]], {
    ...DEFAULT_PULL_SETTINGS,
    remoteMaxEntries: 0,
    twitchMaxEntries: 0,
  });
  assert.equal(refresh.skipped, 0);
  assert.equal(refresh.videos[0].id, "alias0");
  assert.equal(new Set(urls.map((url) => roomMediaKey(roomVideoFromUrl(url)))).size, 1);
});
test("one temporary result survives a long run without retaining prior blobs or writing their bytes into job receipts", async () => {
  let receipt;
  const session = new StudioSession(async () => ({ image: png }), {
    load: async () => [],
    save: async (jobs) => {
      receipt = structuredClone(jobs);
    },
  });
  await session.hydrate();
  for (let i = 0; i < 100; i++) await session.generate({ ...settings, prompt: "Image " + i });
  const state = session.getSnapshot();
  assert.equal(state.jobs.length, 8);
  assert.equal(state.image.settings.prompt, "Image 99");
  assert.equal(state.image.blob.size, 68);
  assert(!JSON.stringify(receipt).includes(png));
  assert.equal(Object.values(state).filter((v) => v?.blob instanceof Blob).length, 1);
});
test("preview cleanup is reviewable, cancellable and cannot clear a newer result", async () => {
  const session = new StudioSession(async () => ({ image: png }));
  await session.generate(settings);
  const first = session.getSnapshot().image;
  session.previewCleanup();
  const token = session.getSnapshot().cleanup.token;
  session.cancelCleanup();
  assert.equal(session.getSnapshot().image, first);
  session.confirmCleanup(token);
  assert.equal(session.getSnapshot().image, first);
  session.previewCleanup();
  const stale = session.getSnapshot().cleanup.token;
  await session.generate({ ...settings, prompt: "Newer" });
  session.confirmCleanup(stale);
  assert.equal(session.getSnapshot().image.settings.prompt, "Newer");
  session.previewCleanup();
  session.confirmCleanup(session.getSnapshot().cleanup.token);
  assert.equal(session.getSnapshot().image, null);
  assert.equal(session.getSnapshot().jobs[0].status, "completed");
});
test("explicit clear-on-navigation releases the buffer including a result completed after navigation", async () => {
  let release;
  const session = new StudioSession(() => new Promise((r) => (release = r)));
  session.setRetainAcrossNavigation(false);
  const leave = session.connectView();
  const pending = session.generate(settings);
  leave();
  release({ image: png });
  await pending;
  assert.equal(session.getSnapshot().image, null);
  assert.equal(session.getSnapshot().jobs[0].status, "completed");
  const second = new StudioSession(async () => ({ image: png }));
  const detach = second.connectView();
  await second.generate(settings);
  detach();
  assert(second.getSnapshot().image);
});

test("expired preview cleanup leaves the completed image intact", async () => {
  const session = new StudioSession(async () => ({ image: png }));
  await session.generate(settings);
  const image = session.getSnapshot().image;
  session.previewCleanup();
  const plan = session.getSnapshot().cleanup,
    original = Date.now;
  try {
    Date.now = () => plan.expiresAt + 1;
    session.confirmCleanup(plan.token);
  } finally {
    Date.now = original;
  }
  assert.equal(session.getSnapshot().image, image);
  assert.equal(session.getSnapshot().cleanup, undefined);
});
test("oversized engine PNG does not replace the last completed preview", async () => {
  let large = false;
  const bytes = Buffer.alloc(10 * 1024 ** 2 + 1);
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(bytes);
  const payload = bytes.toString("base64");
  const session = new StudioSession(async () => ({ image: large ? payload : png }));
  await session.generate(settings);
  const image = session.getSnapshot().image;
  large = true;
  await session.generate(settings);
  assert.equal(session.getSnapshot().image, image);
  assert.equal(session.getSnapshot().jobs[0].status, "failed");
  assert.match(session.getSnapshot().error, /10 MiB/);
});


test('older clip pages may add verified aliases and memberships without replacing fresh observations',async()=>{
 const saved=card(urls[0]);saved.name='Fresh title';saved.remote.observedAt=100;saved.remote.views=900;
 const held=card(urls[1],'held','tw:other');held.name='Stale title';held.remote.observedAt=1;held.remote.views=3;held.remote.twitchClipIdentity={version:1,slug:'SomeClip-ABC',id:'998'};
 const merged=await mergeRemoteCatalogAsync([saved],[held]);assert.equal(merged.length,1);assert.equal(merged[0].name,'Fresh title');assert.equal(merged[0].remote.views,900);assert.equal(merged[0].remote.observedAt,100);assert.equal(merged[0].remote.twitchClipIdentity.id,'998');assert.deepEqual(new Set(merged[0].remote.sourceIds),new Set(['tw:creator','tw:other']));
});
