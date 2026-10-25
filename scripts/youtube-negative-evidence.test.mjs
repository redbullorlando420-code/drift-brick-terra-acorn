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
const {
  youtubeCatalogLiveEvidence,
  youtubeWatchLiveEvidence,
  completeKnownYoutubeEvidence,
  normalizeYoutubeLiveEvidence,
} = await import("../src/lib/remote/youtube-live-evidence.ts");
const { createYoutubeLiveReader } = await import("../src/lib/remote/youtube-live-browse.ts");
const { runRefreshRemotes } = await import("../src/lib/remote/api.ts");
const { retainYoutubeLiveFollow, YOUTUBE_LIVE_HOLD_MS } =
  await import("../src/lib/videos/live-retention.ts");
const { mergeRemoteRefresh } = await import("../src/lib/videos/remote-merge.ts");
const id = "UC0000000000000000000000",
  vid = "abcdefghijk";
const continuation = {
  continuationItemRenderer: {
    continuationEndpoint: { continuationCommand: { token: "next-unread" } },
  },
};
const live = {
  videoRenderer: {
    videoId: vid,
    title: { simpleText: "Live fixture" },
    viewCountText: { simpleText: "22 watching" },
  },
};
const page = (source = "streams", rows = []) => ({
  metadata: { channelMetadataRenderer: { externalId: id } },
  contents: {
    twoColumnBrowseResultsRenderer: {
      tabs: [
        {
          tabRenderer: {
            selected: true,
            title: source === "streams" ? "Live" : "Home",
            endpoint: {
              commandMetadata: { webCommandMetadata: { url: "/channel/" + id + "/" + source } },
            },
            content: { richGridRenderer: { contents: rows } },
          },
        },
      ],
    },
  },
});
const watch = (patch = {}) =>
  "<script>var ytInitialPlayerResponse = " +
  JSON.stringify({
    playabilityStatus: { status: "OK" },
    videoDetails: { videoId: vid, channelId: id, title: "Known broadcast" },
    microformat: { playerMicroformatRenderer: { liveBroadcastDetails: { isLiveNow: false } } },
    ...patch,
  }) +
  ";</script>";
test("only complete creator-owned Streams catalogs supply negative evidence; Home and continuations remain unknown", () => {
  for (const source of ["home", "streams"])
    for (const partial of [false, true]) {
      const r = youtubeCatalogLiveEvidence(page(source, partial ? [continuation] : []), id, 1000);
      assert.equal(r.evidence.complete, source === "streams" && !partial);
      assert.equal(r.evidence.state, r.evidence.complete ? "absent" : "unknown");
      assert.equal(r.evidence.at, 1000);
    }
  const r = youtubeCatalogLiveEvidence(page("streams", [live, continuation]), id, 1000);
  assert.equal(r.observations[0].viewers, 22);
  assert.equal(r.evidence.state, "live");
  assert.equal(r.evidence.complete, false);
  assert.throws(() =>
    youtubeCatalogLiveEvidence(
      { ...page(), metadata: { channelMetadataRenderer: { externalId: "other" } } },
      id,
    ),
  );
  assert.throws(() => youtubeCatalogLiveEvidence(page("streams", [{ renamedRenderer: {} }]), id));
});
test("fast endpoint navigation preserves evidence completeness on initial and cached checks", async () => {
  let calls = 0;
  const read = createYoutubeLiveReader(
    async () => {
      calls++;
      return page("home", []);
    },
    () => 1000,
  );
  for (let n = 0; n < 2; n++) {
    const r = await read.inspect(id);
    assert.equal(r.evidence.state, "unknown");
    assert.equal(r.evidence.reason, "home-only");
  }
  assert.equal(calls, 2);
  const stream = createYoutubeLiveReader(
    async () => page("streams", [continuation]),
    () => 2000,
  );
  assert.equal((await stream.inspect(id)).evidence.reason, "partial-streams");
});
test("only exact playable known broadcasts with explicit ended metadata confirm absence", () => {
  assert.equal(youtubeWatchLiveEvidence(watch(), id, vid, 1000).evidence.state, "absent");
  const positive = youtubeWatchLiveEvidence(
    watch({
      microformat: { playerMicroformatRenderer: { liveBroadcastDetails: { isLiveNow: true } } },
    }),
    id,
    vid,
    1000,
  );
  assert.equal(positive.observations[0].id, vid);
  for (const html of [
    "consent page",
    watch({ playabilityStatus: { status: "LOGIN_REQUIRED" } }),
    watch({ videoDetails: { videoId: "other000001", channelId: id } }),
    watch({ videoDetails: { videoId: vid, channelId: "wrong" } }),
    watch({ microformat: {} }),
    watch({
      microformat: {
        playerMicroformatRenderer: {
          liveBroadcastDetails: { endTimestamp: "2100-01-01T00:00:00Z" },
        },
      },
    }),
  ]) {
    const r = youtubeWatchLiveEvidence(html, id, vid, 1000);
    assert.equal(r.evidence.state, "unknown");
    assert.equal(r.evidence.complete, false);
  }
});
test("supplemental checks stay bounded and cannot turn failed or unowned watch pages into negative evidence", async () => {
  const partial = youtubeCatalogLiveEvidence(page("streams", [continuation]), id, 1000);
  let calls = 0;
  const read = async () => {
    calls++;
    return watch();
  };
  assert.equal(
    (await completeKnownYoutubeEvidence(partial, [vid], id, read, () => 2000)).evidence.state,
    "absent",
  );
  assert.equal(calls, 1);
  await completeKnownYoutubeEvidence(partial, [], id, read);
  await completeKnownYoutubeEvidence(partial, [vid, "video000002", "video000003"], id, read);
  assert.equal(calls, 1);
  const unknown = await completeKnownYoutubeEvidence(partial, [vid], id, async () =>
    watch({ playabilityStatus: { status: "LOGIN_REQUIRED" } }),
  );
  assert.equal(unknown, partial);
  assert.equal(
    await completeKnownYoutubeEvidence(partial, [vid], id, async () => {
      throw Error("timeout");
    }),
    partial,
  );
  const mixed = await completeKnownYoutubeEvidence(
    { ...partial, observations: [{ id: "video000002" }] },
    [vid, "video000002"],
    id,
    read,
    () => 3000,
  );
  assert.equal(mixed.evidence.complete, true);
  assert.equal(mixed.evidence.state, "live");
  assert.equal(mixed.observations.length, 1);
});
test("actual API preserves live clock and archive state for Home, partial, consent and malformed replies", async () => {
  const original = globalThis.fetch;
  let fixture,
    html,
    watchReads = 0;
  globalThis.fetch = async (url) => {
    if (String(url).includes("/watch")) {
      watchReads++;
      return new Response(watch());
    }
    if (String(url).includes("/youtubei/")) return Response.json(fixture);
    return new Response(html ?? "<html>consent required</html>");
  };
  const previous = {
    id: "yt:" + id,
    channelId: id,
    kind: "youtube",
    handle: "fixture",
    title: "Fixture",
    live: true,
    liveCheckedAt: 1000,
    catalogCursor: "saved-cursor",
  };
  try {
    for (const p of [
      page("home"),
      page("streams", [continuation]),
      page("streams", [{ renamedRenderer: {} }]),
      { consent: true },
    ]) {
      fixture = p;
      const r = await runRefreshRemotes({ channels: [previous], youtubeLiveOnly: true });
      assert.equal(r.channels[0].live, true);
      assert.equal(r.channels[0].liveCheckedAt, 1000);
      assert.equal(r.channels[0].liveOfflineSince, undefined);
      assert.equal(r.channels[0].catalogCursor, "saved-cursor");
      assert.equal(r.channels[0].youtubeLiveEvidence.state, "unknown");
      assert.equal(r.liveCheckedIds.length, 0);
      assert.equal(r.refreshedIds.length, 0);
    }
    fixture = page("streams", [continuation]);
    const exact = await runRefreshRemotes({
      channels: [{ ...previous, youtubeLiveVideoIds: [vid] }],
      youtubeLiveOnly: true,
    });
    assert.equal(watchReads, 1);
    assert.equal(exact.channels[0].youtubeLiveEvidence.source, "watch");
    assert.deepEqual(exact.liveCheckedIds, [previous.id]);
    fixture = page("streams");
    const absent = await runRefreshRemotes({ channels: [previous], youtubeLiveOnly: true });
    assert.equal(absent.channels[0].youtubeLiveEvidence.state, "absent");
    assert.equal(absent.channels[0].youtubeLiveEvidence.complete, true);
    assert.deepEqual(absent.liveCheckedIds, [previous.id]);
  } finally {
    globalThis.fetch = original;
  }
});
test("complete absence ages through the hold, uncertainty never starts it, and positive evidence clears it immediately", () => {
  const previous = {
    id: "yt:" + id,
    channelId: id,
    kind: "youtube",
    handle: "fixture",
    title: "Fixture",
    live: true,
    liveCheckedAt: 100,
  };
  const unknown = {
    ...previous,
    live: false,
    liveCheckedAt: 1000,
    youtubeLiveEvidence: {
      at: 1000,
      state: "unknown",
      source: "home",
      complete: false,
      reason: "home-only",
    },
  };
  assert.equal(retainYoutubeLiveFollow(previous, unknown, false).live, true);
  assert.equal(retainYoutubeLiveFollow(previous, unknown, true).liveOfflineSince, undefined);
  const absent = {
    ...unknown,
    youtubeLiveEvidence: {
      at: 1000,
      state: "absent",
      source: "streams",
      complete: true,
      reason: "complete-streams",
    },
  };
  const held = retainYoutubeLiveFollow(previous, absent, true);
  assert.equal(held.live, true);
  assert.equal(held.liveOfflineSince, 1000);
  assert.equal(
    retainYoutubeLiveFollow(
      held,
      { ...absent, liveCheckedAt: 1000 + YOUTUBE_LIVE_HOLD_MS - 1 },
      true,
    ).live,
    true,
  );
  assert.equal(
    retainYoutubeLiveFollow(held, { ...absent, liveCheckedAt: 1000 + YOUTUBE_LIVE_HOLD_MS }, true)
      .live,
    false,
  );
  const positive = retainYoutubeLiveFollow(
    held,
    { ...held, live: true, liveCheckedAt: 2000 },
    false,
  );
  assert.equal(positive.liveOfflineSince, undefined);
  const card = {
    id: "yt:v:" + vid,
    folderId: previous.id,
    name: "Live",
    path: "fixture",
    extension: "live",
    size: 0,
    addedAt: 1,
    remote: { kind: "youtube", channelId: id, videoId: vid, live: true, observedAt: 100 },
  };
  assert.equal(
    mergeRemoteRefresh([card], [], [], new Set(), {
      liveCheckedIds: [],
      liveCheckedAt: { [previous.id]: 1000 },
      youtubeOfflineGraceMs: YOUTUBE_LIVE_HOLD_MS,
    })[0],
    card,
  );
  const pending = mergeRemoteRefresh([card], [], [previous.id], new Set(), {
    liveCheckedIds: [previous.id],
    liveCheckedAt: { [previous.id]: 1000 },
    youtubeOfflineGraceMs: YOUTUBE_LIVE_HOLD_MS,
  })[0];
  assert.equal(pending.remote.liveOfflineSince, 1000);
});
test("durable evidence accepts bounded valid metadata and rejects fabricated negative sources or malformed timestamps", () => {
  const valid = {
    at: 1000,
    state: "absent",
    source: "streams",
    complete: true,
    reason: "complete-streams",
  };
  assert.deepEqual(normalizeYoutubeLiveEvidence(valid), valid);
  for (const v of [
    null,
    { ...valid, at: NaN },
    { ...valid, at: -1 },
    { ...valid, source: "home" },
    { ...valid, complete: false },
    { ...valid, reason: "injected text" },
  ])
    assert.equal(normalizeYoutubeLiveEvidence(v), undefined);
});


test('legacy saved broadcasts join the bounded identity ledger and uncovered watch negatives cannot start a hold',async()=>{
 const {reconcileYoutubeKnownBroadcasts}=await import('../src/lib/videos/youtube-live-known.ts');
 const old={id:'yt:'+id,kind:'youtube',handle:'fixture',title:'Fixture',live:true,liveCheckedAt:1000,youtubeLiveVideoIds:[vid]};
 const negative={...old,live:false,liveCheckedAt:2000,youtubeLiveEvidence:{at:2000,state:'absent',source:'watch',complete:true,reason:'known-broadcasts'},youtubeLiveVideoIds:[]};
 const unknown=reconcileYoutubeKnownBroadcasts(negative,old,[vid,'video000002'],[],true);assert.equal(unknown.checked,false);assert.equal(unknown.success,false);assert.equal(unknown.channel.live,true);assert.equal(unknown.channel.liveCheckedAt,1000);assert.equal(unknown.channel.youtubeLiveEvidence.state,'unknown');assert.deepEqual(unknown.channel.youtubeLiveVideoIds,[vid,'video000002']);
 assert.equal(reconcileYoutubeKnownBroadcasts(negative,{...old,youtubeLiveVideoIds:[vid,'video000002']},[vid,'video000002'],[],true).checked,true);
 const many=Array.from({length:80},(_,i)=>'v'+String(i).padStart(10,'0'));const bounded=reconcileYoutubeKnownBroadcasts({...negative,youtubeLiveEvidence:{...negative.youtubeLiveEvidence,source:'streams'}},old,many,[],true);assert.equal(bounded.channel.youtubeLiveVideoIds.length,64);assert.equal(bounded.channel.youtubeLiveKnownOverflow,true);assert.equal(bounded.checked,true,'a complete Streams listing can still establish absence');
});
