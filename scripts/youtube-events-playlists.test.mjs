import { test } from "node:test";
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

const { advanceYoutubeEvents, normalizeYoutubeEvents, youtubeEventNotices, youtubeNearStart } =
  await import("../src/lib/videos/youtube-events.ts");
const { markPlaylistWalk, reconcilePlaylistWalks, normalizePlaylistWalk } =
  await import("../src/lib/videos/youtube-playlist-walk.ts");
const { mergeRemoteCatalogAsync, remoteVideoIndex } =
  await import("../src/lib/videos/remote-merge.ts");
const { normalizeFollowCheckpoints } = await import("../src/lib/videos/follow-checkpoints.ts");
const { holdEntryLimitCursors } = await import("../src/lib/videos/entry-limits.ts");
const { youtubeCatalogLiveEvidence, completeKnownYoutubeEvidence } =
  await import("../src/lib/remote/youtube-live-evidence.ts");
const { allocateYoutubeLive } = await import("../src/lib/videos/youtube-live-allocation.ts");
const { orderCreatorVideos } = await import("../src/lib/videos/creator-video-catalog.ts");
const { runRefreshRemotes, runFollowRemote } = await import("../src/lib/remote/api.ts");
const now = Date.now(),
  cid = "UC" + "a".repeat(22),
  vid = "event000001";
const channel = {
  id: "yt:" + cid,
  channelId: cid,
  kind: "youtube",
  title: "Event creator",
  handle: "@events",
};
const playlist = {
  id: "ytpl:PLfixture000001",
  kind: "youtube",
  title: "Playlist fixture",
  handle: "https://www.youtube.com/playlist?list=PLfixture000001",
};
const card = (id, source = playlist.id) => ({
  id: "yt:" + id,
  folderId: source,
  name: id,
  path: "youtube/" + id,
  size: 0,
  mime: "video/youtube",
  extension: "yt",
  addedAt: 0,
  remote: { kind: "youtube", videoId: id, channelId: cid, channelName: "Event creator" },
});
const page = (items, partial = false) => ({
  metadata: { channelMetadataRenderer: { externalId: cid } },
  contents: {
    twoColumnBrowseResultsRenderer: {
      tabs: [
        {
          tabRenderer: {
            selected: true,
            title: "Live",
            endpoint: {
              commandMetadata: { webCommandMetadata: { url: "/channel/" + cid + "/streams" } },
            },
            content: {
              richGridRenderer: {
                contents: [
                  ...items,
                  ...(partial
                    ? [
                        {
                          continuationItemRenderer: {
                            continuationEndpoint: { continuationCommand: { token: "next" } },
                          },
                        },
                      ]
                    : []),
                ],
              },
            },
          },
        },
      ],
    },
  },
});
const scheduled = (time = now) => ({
  videoRenderer: {
    videoId: vid,
    title: { simpleText: "Scheduled fixture" },
    upcomingEventData: { startTime: String(Math.floor(time / 1000)) },
    viewCountText: { simpleText: "999 watching now" },
    thumbnailOverlays: [{ thumbnailOverlayTimeStatusRenderer: { style: "LIVE" } }],
  },
});
const live = {
  videoRenderer: {
    videoId: vid,
    title: { simpleText: "Live fixture" },
    viewCountText: { simpleText: "77 watching now" },
    thumbnailOverlays: [{ thumbnailOverlayTimeStatusRenderer: { style: "LIVE" } }],
  },
};
test("explicit upcoming evidence owns schedule, excludes waiting audience and cannot become live by clock", () => {
  const result = youtubeCatalogLiveEvidence(page([scheduled(now - 3600000)]), cid, now);
  assert.deepEqual(result.observations, []);
  assert.equal(result.upcoming[0].scheduledAt, Math.floor((now - 3600000) / 1000) * 1000);
  assert.equal(result.upcoming[0].viewers, undefined);
  const events = advanceYoutubeEvents([], result.upcoming, [], true, now + 86400000);
  assert.equal(events[0].state, "upcoming");
  assert.equal(events[0].wasLiveAt, undefined);
  const invalid = scheduled();
  invalid.videoRenderer.upcomingEventData.startTime = "in 5 minutes";
  assert.equal(
    youtubeCatalogLiveEvidence(page([invalid]), cid, now).upcoming[0].scheduledAt,
    undefined,
  );
});
test("postponements, partial disappearance, ten-minute completion and flaps keep one identity and announcement receipt", async () => {
  let events = advanceYoutubeEvents(
    [],
    [{ id: vid, title: "One", scheduledAt: now }],
    [],
    true,
    now,
  );
  events = advanceYoutubeEvents(
    events,
    [{ id: vid, title: "Moved", scheduledAt: now + 3600000 }],
    [],
    true,
    now + 1,
  );
  assert.equal(events[0].previousScheduledAt, now);
  assert.equal(events[0].state, "upcoming");
  events = advanceYoutubeEvents(events, [], [], false, now + 2);
  assert.equal(events[0].state, "uncertain");
  assert.equal(events[0].missingSince, undefined);
  events = advanceYoutubeEvents(events, [], [{ id: vid, title: "Live" }], true, now + 3);
  const first = {
    ...card(vid),
    remote: {
      ...card(vid).remote,
      live: true,
      youtubeType: "live",
      youtubeEvent: events[0],
      observedAt: now + 3,
    },
  };
  let notices = youtubeEventNotices(() => undefined, [first], [], true);
  assert.equal(notices.length, 1);
  let videos = await mergeRemoteCatalogAsync([card(vid, "yt:" + cid)], [first]);
  assert.equal(videos.length, 1);
  const stable = videos[0].id;
  events = advanceYoutubeEvents(events, [], [], true, now + 4);
  assert.equal(events[0].state, "uncertain");
  events = advanceYoutubeEvents(events, [], [], true, now + 600003);
  assert.notEqual(events[0].state, "completed");
  events = advanceYoutubeEvents(events, [], [], true, now + 600004);
  assert.equal(events[0].state, "completed");
  events = advanceYoutubeEvents(events, [], [{ id: vid }], true, now + 700000);
  assert.equal(events[0].announcedAt, now + 3);
  const next = {
    ...first,
    remote: { ...first.remote, youtubeEvent: events[0], observedAt: now + 700000 },
  };
  assert.equal(
    youtubeEventNotices((v) => remoteVideoIndex(videos).get(v.id), [next], [], true).length,
    0,
  );
  videos = await mergeRemoteCatalogAsync(videos, [next]);
  assert.equal(videos.length, 1);
  assert.equal(videos[0].id, stable);
  assert.equal(youtubeEventNotices(() => undefined, [first], [], false).length, 0);
});
test("near-start work stays inside existing slots and reserves oldest-first discovery across 2k creators", () => {
  const channels = Array.from({ length: 2000 }, (_, i) => ({
    ...channel,
    id: "yt:UC" + String(i).padStart(22, "0"),
    channelId: "UC" + String(i).padStart(22, "0"),
    live: i < 100,
    liveCheckedAt: i < 100 ? now - 120000 : now - 600000 - i,
    ...(i >= 100 && i < 400
      ? {
          youtubeEvents: [
            {
              id: vid,
              title: "Soon",
              state: "upcoming",
              scheduledAt: now + 1000,
              observedAt: now - 60000,
            },
          ],
        }
      : {}),
  }));
  const r = allocateYoutubeLive(channels, 24, now, 60000, 300000);
  assert.equal(r.channels.length, 24);
  assert(r.allocation.discoverySlots >= 18);
  const near = r.channels.filter((c) => !c.live && youtubeNearStart(c, now));
  assert(near.length <= Math.floor(r.allocation.discoverySlots / 4));
  assert(r.channels.some((c) => c.id === channels.at(-1).id));
  const soon = {
    ...channel,
    liveCheckedAt: now - 61000,
    youtubeEvents: [
      {
        id: vid,
        title: "Soon",
        state: "upcoming",
        scheduledAt: now + 1000,
        observedAt: now - 60000,
      },
    ],
  };
  assert.equal(allocateYoutubeLive([soon], 1, now, 60000, 300000).channels.length, 1);
  assert.equal(
    allocateYoutubeLive(
      [
        {
          ...soon,
          lastLiveFailure: {
            at: now,
            retryAt: now + 60000,
            kind: "network-offline",
            message: "wait",
          },
        },
      ],
      1,
      now,
      60000,
      300000,
    ).channels.length,
    0,
  );
});
test("event checkpoints survive reload, reject invalid states and retain upcoming metadata after supplemental evidence", async () => {
  const events = advanceYoutubeEvents(
    [],
    [{ id: vid, title: "Soon", scheduledAt: now }],
    [],
    true,
    now,
  );
  const result = normalizeFollowCheckpoints(
    JSON.parse(JSON.stringify({ ...channel, youtubeEvents: events })),
  );
  assert.deepEqual(result.youtubeEvents, JSON.parse(JSON.stringify(events)));
  assert.equal(normalizeYoutubeEvents([{ ...events[0], state: "invented" }]).length, 0);
  const partial = youtubeCatalogLiveEvidence(page([scheduled()], true), cid, now);
  const done = await completeKnownYoutubeEvidence(
    partial,
    ["known000001"],
    cid,
    async () =>
      "<script>var ytInitialPlayerResponse = " +
      JSON.stringify({
        playabilityStatus: { status: "OK" },
        videoDetails: { channelId: cid, videoId: "known000001" },
        microformat: { playerMicroformatRenderer: { liveBroadcastDetails: { isLiveNow: false } } },
      }) +
      "</script>",
    () => now + 1,
  );
  assert.deepEqual(done.upcoming, partial.upcoming);
});
test("partial/resumed playlist walks preserve unseen tail; complete walk removes only one membership with canonical id and feedback stable", async () => {
  const a = card("video000001"),
    b = {
      ...card("video000002"),
      remote: { ...card("video000002").remote, sourceIds: [playlist.id, "yt:other"] },
    };
  const feedback = {
    favorites: { [b.id]: true },
    history: [{ id: b.id, at: now }],
    tags: { [b.id]: ["manual"] },
  };
  let p = markPlaylistWalk(playlist, [a], "cursor-a", false, undefined, undefined, now);
  let rows = await mergeRemoteCatalogAsync([a, b], p.videos),
    result = await reconcilePlaylistWalks(rows, [p.channel]);
  assert.equal(result.channels[0].playlistWalk.membership, "provisional");
  assert(result.videos.find((v) => v.id === b.id).remote.sourceIds.includes(playlist.id));
  const reloaded = normalizeFollowCheckpoints(JSON.parse(JSON.stringify(p.channel))).playlistWalk;
  p = markPlaylistWalk(
    playlist,
    [card("video000003")],
    undefined,
    true,
    reloaded,
    "cursor-a",
    now + 1,
  );
  rows = await mergeRemoteCatalogAsync(rows, p.videos);
  result = await reconcilePlaylistWalks(rows, [p.channel]);
  assert.equal(result.channels[0].playlistWalk.membership, "confirmed");
  assert.equal(result.videos.length, 3);
  const kept = result.videos.find((v) => v.id === b.id);
  assert.equal(kept.folderId, "yt:other");
  assert.deepEqual(kept.remote.sourceIds, ["yt:other"]);
  assert.equal(kept.id, b.id);
  assert.equal(feedback.favorites[kept.id], true);
  assert.deepEqual(feedback.tags[kept.id], ["manual"]);
  assert.equal(feedback.history[0].id, kept.id);
  assert.equal(
    result.videos.find((v) => v.remote.videoId === "video000003").remote.playlistMemberships[
      playlist.id
    ].order,
    1,
  );
});
test("interrupted suffix, duplicate traversal, mismatched checkpoint and admission limits never prune unseen members", async () => {
  const a = card("video000001"),
    tail = card("video000002");
  const root = markPlaylistWalk(playlist, [a], "c", false, undefined, undefined, now);
  for (const pull of [
    markPlaylistWalk(playlist, [a], undefined, true, undefined, "legacy", now + 1),
    markPlaylistWalk(playlist, [a], undefined, true, root.channel.playlistWalk, "wrong", now + 1),
    markPlaylistWalk(playlist, [a], undefined, true, root.channel.playlistWalk, "c", now + 1),
  ]) {
    const rows = await mergeRemoteCatalogAsync([a, tail], pull.videos);
    const result = await reconcilePlaylistWalks(rows, [pull.channel]);
    assert.equal(result.channels[0].playlistWalk.membership, "provisional");
    assert.equal(result.changed.length, 0);
  }
  const full = markPlaylistWalk(playlist, [a], undefined, true, undefined, undefined, now + 2);
  const held = holdEntryLimitCursors([root.channel], [full.channel], new Set([playlist.id]));
  assert.equal(held[0].playlistWalk.completed, false);
  assert.equal((await reconcilePlaylistWalks([a, tail], held)).changed.length, 0);
});
test("empty confirmed playlist retains cards and all other source edges; new order sorts without rewriting video ids", async () => {
  const first = card("video000001"),
    second = card("video000002");
  const p = markPlaylistWalk(playlist, [second, first], undefined, true, undefined, undefined, now);
  let rows = await mergeRemoteCatalogAsync([first, second], p.videos);
  const ordered = await orderCreatorVideos(rows, "playlist", async () => {}, playlist.id);
  assert.deepEqual(
    ordered.map((v) => v.id),
    [second.id, first.id],
  );
  const empty = markPlaylistWalk(playlist, [], undefined, true, undefined, undefined, now + 1);
  const result = await reconcilePlaylistWalks(rows, [empty.channel]);
  assert.equal(result.videos.length, 2);
  assert.equal(result.channels[0].playlistWalk.membership, "confirmed");
  assert(
    result.videos.every(
      (v) => v.folderId === "youtube:retained" && !v.remote.sourceIds.includes(playlist.id),
    ),
  );
  assert.equal(
    normalizePlaylistWalk({ ...empty.channel.playlistWalk, count: Infinity }),
    undefined,
  );
});
test("partial upcoming snapshots supply schedules but cannot retire an existing broadcast or create viewer counts", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json(page([scheduled()], true));
  try {
    const result = await runRefreshRemotes({
      channels: [{ ...channel, live: true }],
      youtubeLiveOnly: true,
    });
    assert.equal(result.refreshedIds.length, 1);
    assert.deepEqual(result.liveCheckedIds, []);
    assert.equal(result.channels[0].live, true);
    assert.equal(result.channels[0].youtubeLiveEvidence.state, "unknown");
    assert.equal(result.videos[0].remote.youtubeType, "upcoming");
    assert.equal(result.videos[0].remote.viewers, undefined);
  } finally {
    globalThis.fetch = original;
  }
});
test("2k rotation still checks every ordinary creator while near-start events become due repeatedly", () => {
  const channels = Array.from({ length: 2000 }, (_, i) => ({
    ...channel,
    id: "yt:UC" + String(i).padStart(22, "0"),
    channelId: "UC" + String(i).padStart(22, "0"),
    liveCheckedAt: now - 600000 - i,
    ...(i < 300
      ? {
          youtubeEvents: [
            {
              id: vid,
              title: "Starting",
              state: "upcoming",
              scheduledAt: now + 1000,
              observedAt: now,
            },
          ],
        }
      : {}),
  }));
  const touched = new Set();
  for (let sweep = 0; sweep < 180; sweep++) {
    const at = now + sweep * 2000,
      result = allocateYoutubeLive(channels, 24, at, 60000, 300000);
    assert(result.channels.length <= 24);
    for (const channel of result.channels) {
      channel.liveCheckedAt = at;
      touched.add(channel.id);
    }
  }
  assert.equal(touched.size, 2000);
});
test("ordinary archive refresh preserves live evidence, announcement receipt and creator ownership across playlist merges", async () => {
  const event = advanceYoutubeEvents([], [], [{ id: vid, title: "Live" }], true, now)[0];
  const original = {
    ...card(vid, "yt:" + cid),
    remote: {
      ...card(vid).remote,
      youtubeEvent: event,
      live: true,
      youtubeType: "live",
      observedAt: now,
    },
  };
  const incoming = { ...card(vid), remote: { ...card(vid).remote, channelId: "playlist" } };
  const merged = (await mergeRemoteCatalogAsync([original], [incoming]))[0];
  assert.equal(merged.remote.live, true);
  assert.equal(merged.remote.channelId, cid);
  assert.equal(merged.remote.youtubeEvent.announcedAt, now);
  assert.equal(youtubeEventNotices(() => merged, [original], [], true).length, 0);
});

test("an already live identity returning as scheduled cannot replace the retained live card with an upcoming card", async () => {
  const original = globalThis.fetch,
    event = advanceYoutubeEvents([], [], [{ id: vid, title: "Was live" }], true, now - 60000)[0];
  globalThis.fetch = async () => Response.json(page([scheduled()]));
  try {
    const result = await runRefreshRemotes({
      channels: [{ ...channel, live: true, youtubeEvents: [event] }],
      youtubeLiveOnly: true,
    });
    assert.equal(
      result.videos.some((v) => v.remote.videoId === vid),
      false,
    );
    assert.equal(result.channels[0].youtubeEvents[0].state, "uncertain");
    assert.equal(result.channels[0].youtubeEvents[0].announcedAt, event.announcedAt);
  } finally {
    globalThis.fetch = original;
  }
});

test("real public API maps upcoming to one canonical live/replay card and carries playlist walk across bounded calls", async () => {
  const original = globalThis.fetch,
    originalNow = Date.now;
  let fixture = page([scheduled()]),
    clock = now;
  Date.now = () => clock;
  globalThis.fetch = async () =>
    new Response(JSON.stringify(fixture), { headers: { "content-type": "application/json" } });
  try {
    let c = channel;
    let library = [];
    for (const [offset, items] of [
      [0, [scheduled()]],
      [1000, [live]],
      [2000, []],
      [603000, []],
    ]) {
      clock = now + offset;
      fixture = page(items);
      const r = await runRefreshRemotes({ channels: [c], youtubeLiveOnly: true });
      assert.equal(r.refreshedIds.length, 1);
      c = r.channels[0];
      library = await mergeRemoteCatalogAsync(library, r.videos);
    }
    assert.equal(library.length, 1);
    assert.equal(library[0].remote.youtubeType, "replay");
    assert.equal(c.youtubeEvents[0].state, "completed");
    const playlistPage = (ids, cursor) => ({
      contents: {
        twoColumnBrowseResultsRenderer: {
          tabs: [
            {
              tabRenderer: {
                selected: true,
                content: {
                  sectionListRenderer: {
                    contents: [
                      {
                        itemSectionRenderer: {
                          contents: [
                            {
                              playlistVideoListRenderer: {
                                contents: [
                                  ...ids.map((id) => ({
                                    playlistVideoRenderer: {
                                      videoId: id,
                                      title: { simpleText: id },
                                    },
                                  })),
                                  ...(cursor
                                    ? [
                                        {
                                          continuationItemRenderer: {
                                            continuationEndpoint: {
                                              continuationCommand: { token: cursor },
                                            },
                                          },
                                        },
                                      ]
                                    : []),
                                ],
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    });
    const ids = Array.from({ length: 8000 }, (_, i) => "p" + String(i).padStart(10, "0"));
    fixture = playlistPage(ids, "resume-real");
    clock += 1000;
    let p = await runFollowRemote({ query: playlist.handle, kind: "youtube" });
    assert.equal(p.channel.playlistWalk.completed, false);
    assert.equal(p.channel.catalogCursor, "resume-real");
    fixture = playlistPage(["tail0000001"]);
    clock += 1000;
    const next = await runFollowRemote({
      query: playlist.handle,
      kind: "youtube",
      catalogCursor: p.channel.catalogCursor,
      playlistWalk: p.channel.playlistWalk,
    });
    assert.equal(next.channel.playlistWalk.id, p.channel.playlistWalk.id);
    assert.equal(next.channel.playlistWalk.count, p.videos.length + 1);
    assert.equal(next.channel.playlistWalk.fromStart, true);
  } finally {
    globalThis.fetch = original;
    Date.now = originalNow;
  }
});
