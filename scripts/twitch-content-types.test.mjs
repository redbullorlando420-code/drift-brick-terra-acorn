import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, n) {
    if (s.startsWith("@/"))
      return n(new URL("../src/" + s.slice(2) + ".ts", import.meta.url).href, c);
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});
const content = await import("../src/lib/videos/twitch-content.ts");
const { isTwitchClip } = await import("../src/lib/videos/twitch-clips.ts");
const { walkTwitchArchive } = await import("../src/lib/remote/twitch-archive-walk.ts");
const merges = await import("../src/lib/videos/remote-merge.ts");
const { catalogCard, withCatalogDetails } = await import("../src/lib/videos/catalog-card.ts");
const { filterCatalogSelection } = await import("../src/lib/videos/twitch-saved-catalog.ts");
const { searchTwitchArchive } = await import("../src/lib/videos/twitch-archive-search.ts");
const { rankTwitchVods } = await import("../src/lib/videos/twitch-vod-ranking.ts");
const video = (id, source, at = 1000) => ({
  id: "tw:v:" + id,
  folderId: "tw:test",
  name: "A misleading clip highlight upload title",
  path: "twitch/test/" + id,
  extension: "vod",
  mime: "video/twitch",
  size: 0,
  addedAt: 100,
  duration: 10,
  remote: {
    kind: "twitch",
    videoId: id,
    watchUrl: "https://www.twitch.tv/videos/" + id,
    ...(source ? { twitchContent: content.twitchContentEvidence(source, id, at) } : {}),
  },
});
const clip = (id = "LongClip") => ({
  ...video(id, "CLIPS"),
  id: "tw:c:" + id,
  extension: "clip",
  duration: 1800,
  remote: { ...video(id, "CLIPS").remote, watchUrl: "https://clips.twitch.tv/" + id },
});
test("short VODs and unknown legacy items are never clips by duration or title; long clips keep their identity", () => {
  const short = video("101", "ARCHIVE");
  assert.equal(isTwitchClip(short), false);
  assert.equal(content.twitchContentKind(short), "past-broadcast");
  assert.equal(isTwitchClip({...video("legacy-clip"),extension:"clip"}),true);
  const long = clip();
  assert.equal(isTwitchClip(long), true);
  assert.equal(content.twitchContentKind(long), "clip");
  const unknown = {
    ...video("102"),
    id: "legacy:short",
    extension: "mp4",
    remote: { kind: "twitch" },
  };
  assert.equal(isTwitchClip(unknown), false);
  assert.equal(content.twitchContentKind(unknown), "unknown");
  assert.equal(content.twitchContentKind(video("103")), "unknown");
  assert.equal(
    isTwitchClip({
      ...unknown,
      remote: { kind: "twitch", watchUrl: "https://evil.twitch.tv/a/clip/fake" },
    }),
    false,
  );
  assert.equal(
    isTwitchClip({
      ...unknown,
      remote: { kind: "twitch", watchUrl: "https://www.twitch.tv/a/clip/RealClip" },
    }),
    true,
  );
});
test("only a matching canonical identity, shelf and bounded observation can author a subtype", () => {
  const v = video("201", "HIGHLIGHT");
  assert.equal(content.twitchContentKind(v), "highlight");
  for (const proof of [
    { ...v.remote.twitchContent, videoId: "another" },
    { ...v.remote.twitchContent, source: "UPLOAD" },
    { ...v.remote.twitchContent, at: NaN },
    { ...v.remote.twitchContent, at: 1e100 },
  ])
    assert.equal(
      content.twitchContentKind({ ...v, remote: { ...v.remote, twitchContent: proof } }),
      "unknown",
    );
  assert.equal(content.twitchContentKind({ ...v, id: "tw:v:different" }), "unknown");
  assert.equal(
    content.twitchContentKind({
      ...clip(),
      remote: {
        ...clip().remote,
        twitchContent: content.twitchContentEvidence("ARCHIVE", "LongClip", 1000),
      },
    }),
    "clip",
  );
  assert.equal(content.twitchContentEvidence("ARCHIVE", undefined, 1000), undefined);
});
test("archive walk records each accepted page shelf without mutating provider edges or cursor budgets", async () => {
  const sources = [],
    raw = { cursor: "one", node: { id: "1" } },
    r = await walkTwitchArchive({
      limit: 100,
      maxPages: 3,
      pageSize: 100,
      gap: async () => {},
      read: async (cursor) => {
        sources.push(cursor.stage);
        return {
          id: "owner",
          videos: {
            edges: [cursor.stage === "ARCHIVE" ? raw : { node: { id: cursor.stage } }],
            pageInfo: { hasNextPage: false },
          },
        };
      },
    });
  assert.deepEqual(sources, ["ARCHIVE", "HIGHLIGHT", "UPLOAD"]);
  assert.deepEqual(
    r.edges.map((e) => e.broadcastType),
    sources,
  );
  assert(r.edges.every((e) => e.observedAt > 0));
  assert.equal(raw.broadcastType, undefined);
  assert.equal(r.diagnostics.pages, 3);
  assert.equal(r.cursor, undefined);
});
test("actual Twitch API maps mixed archive shelves and a long clip to separate provider-backed types", async () => {
  const { runFollowRemote } = await import("../src/lib/remote/api.ts");
  const original = globalThis.fetch,
    reads = [];
  try {
    globalThis.fetch = async (_u, init) => {
      const p = JSON.parse(init.body);
      reads.push(p);
      const source = p.query.match(/type:(ARCHIVE|HIGHLIGHT|UPLOAD)/)?.[1];
      return Response.json({
        data: {
          user: {
            id: "owner",
            displayName: "Type creator",
            stream: null,
            ...(source
              ? {
                  videos: {
                    edges: [
                      {
                        node: {
                          id: { ARCHIVE: "301", HIGHLIGHT: "302", UPLOAD: "303" }[source],
                          title: source,
                          lengthSeconds: 10,
                          publishedAt: "2025-01-01T00:00:00Z",
                        },
                      },
                    ],
                    pageInfo: { hasNextPage: false },
                  },
                }
              : {
                  clips: {
                    edges: [
                      { node: { id: "clip-id", slug: "LongPublicClip", durationSeconds: 1800 } },
                    ],
                    pageInfo: { hasNextPage: false },
                  },
                }),
          },
        },
      });
    };
    const r = await runFollowRemote({
      query: "type_fixture_creator",
      kind: "twitch",
      clipLimit: 1,
      twitchVodLimit: 300,
    });
    assert.deepEqual(r.videos.map(content.twitchContentKind), [
      "past-broadcast",
      "highlight",
      "upload",
      "clip",
    ]);
    assert(r.videos.every((v) => content.knownTwitchContent(v)?.videoId === v.remote.videoId));
    assert.equal(reads.length, 4);
    assert(reads.filter((p) => p.variables.first).every((p) => p.variables.first <= 100));
    const roundtrip = JSON.parse(JSON.stringify(r.videos.map(catalogCard)));
    assert.deepEqual(roundtrip.map(content.twitchContentKind), [
      "past-broadcast",
      "highlight",
      "upload",
      "clip",
    ]);
    assert.deepEqual(
      withCatalogDetails(roundtrip[1], r.videos[1]).remote.twitchContent,
      r.videos[1].remote.twitchContent,
    );
  } finally {
    globalThis.fetch = original;
  }
});
test("all merge paths retain source proof through sparse observations, reject unrelated proof and admit exact upgrades", async () => {
  const current = video("401", "HIGHLIGHT", 2000),
    sparse = { ...current, remote: { kind: "twitch", videoId: "401", observedAt: 3000 } },
    turn = async () => {};
  const rows = await merges.mergeRemoteCatalogAsync([current], [sparse], { turn });
  assert.equal(content.twitchContentKind(rows[0]), "highlight");
  assert.equal(rows[0].remote.twitchContent, current.remote.twitchContent);
  const sparseIdentity = { ...sparse, remote: { kind: "twitch" } };
  assert.equal(
    content.twitchContentKind(content.retainTwitchContent(current, sparseIdentity)),
    "highlight",
  );
  const newer = video("401", "UPLOAD", 4000),
    updated = await merges.mergeRemoteCatalogAsync(rows, [newer], { turn });
  assert.equal(content.twitchContentKind(updated[0]), "upload");
  assert.equal(
    content.twitchContentKind(
      (await merges.mergeRemoteCatalogAsync(updated, [current], { turn }))[0],
    ),
    "upload",
  );
  const unknown = video("402"),
    proof = video("402", "ARCHIVE", 3000);
  assert.equal(
    content.twitchContentKind(
      (
        await merges.prepareIndexedRemoteCatalog(
          [unknown],
          [proof],
          new Map([[unknown.id, 0]]),
          turn,
        )
      ).videos[0],
    ),
    "past-broadcast",
  );
  assert.equal(
    content.twitchContentKind(
      merges.mergeRemoteRefresh([current], [sparse], ["tw:test"], new Set())[0],
    ),
    "highlight",
  );
  assert.equal(
    content.twitchContentKind(content.retainTwitchContent(current, video("999"))),
    "unknown",
  );
});
test("type filters combine with saved selections and bounded archive pages without changing catalog order", async () => {
  const rows = [
      video("501", "ARCHIVE"),
      video("502", "HIGHLIGHT"),
      video("503", "UPLOAD"),
      clip("L"),
      video("504"),
    ],
    turn = async () => {};
  assert.equal(await filterCatalogSelection(rows, undefined, "all", {}, turn), rows);
  assert.deepEqual(
    (await filterCatalogSelection(rows, { "tw:v:502": true }, "all", {}, turn, "highlight")).map(
      (v) => v.id,
    ),
    ["tw:v:502"],
  );
  const result = await searchTwitchArchive(
    rows,
    { query: "", kind: "upload", order: "newest" },
    { signal: new AbortController().signal, turn },
  );
  assert.deepEqual(
    result.videos.map((v) => v.id),
    ["tw:v:503"],
  );
  assert(result.maxCandidates <= 25);
  const unknown = await searchTwitchArchive(
    rows,
    { query: "", kind: "unknown", order: "newest" },
    { signal: new AbortController().signal, turn },
  );
  assert.deepEqual(
    unknown.videos.map((v) => v.id),
    ["tw:v:504"],
  );
  const ranked = await rankTwitchVods(rows, () => 1, undefined, turn);
  assert.equal(ranked.length, 4);
  assert(ranked.every((v) => !isTwitchClip(v)));
  assert(ranked.some((v) => v.id === "tw:v:501"));
});
test("explicit type report retains provider evidence and uncertainty through CSV serialization", async () => {
  const rows = [
      video("601", "ARCHIVE"),
      video("602", "HIGHLIGHT"),
      video("603", "UPLOAD"),
      clip("LongExport"),
      video("604"),
    ],
    turns = [];
  const report = await content.twitchContentReport(rows, async () => turns.push(1)),
    text = await report.text();
  assert(text.includes("evidence_source,evidence_observed_at"));
  for (const source of ["ARCHIVE", "HIGHLIGHT", "UPLOAD", "CLIPS"])
    assert(text.includes('"' + source + '"'));
  assert(text.includes('"unknown","unrecorded",""'));
  assert(text.includes("1970-01-01T00:00:01.000Z"));
  assert.equal(text.split("\r\n").filter(Boolean).length, 6);
  assert(turns.length > 0);
});
