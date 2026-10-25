import assert from "node:assert/strict";
import test from "node:test";
import { resolveCreatorCoverage, prepareCreatorCoverageResolver } from "./creator-coverage.ts";
import type { FollowedChannel, LibraryVideo } from "./types.ts";

function remoteVideo(overrides: Partial<LibraryVideo> = {}): LibraryVideo {
  return {
    id: "video-1",
    folderId: "yt:UCexact",
    name: "A catalog title",
    path: "https://www.youtube.com/watch?v=video-1",
    extension: "remote",
    mime: "video/*",
    size: 0,
    addedAt: 1,
    remote: { kind: "youtube", channelId: "UCexact" },
    ...overrides,
  };
}

function youtubeFollow(overrides: Partial<FollowedChannel> = {}): FollowedChannel {
  return { id: "yt:UCexact", kind: "youtube", handle: "exact", title: "Exact Creator", channelId: "UCexact", ...overrides };
}

test("creator coverage resolves an exact public channel id", () => {
  assert.deepEqual(resolveCreatorCoverage(remoteVideo(), [youtubeFollow()]), {
    status: "resolved",
    channelName: "Exact Creator",
    evidence: "channel-id",
  });
});

test("creator coverage resolves the exact saved source id when channel id is absent", () => {
  const video = remoteVideo({ remote: { kind: "youtube" } });
  assert.deepEqual(resolveCreatorCoverage(video, [youtubeFollow({ channelId: undefined })]), {
    status: "resolved",
    channelName: "Exact Creator",
    evidence: "source-id",
  });
});

test("creator coverage keeps conflicting exact evidence visible for review", () => {
  const follows = [youtubeFollow(), youtubeFollow({ id: "yt:other", title: "Different Creator", channelId: "UCexact" })];
  assert.deepEqual(resolveCreatorCoverage(remoteVideo(), follows), {
    status: "ambiguous",
    candidates: ["Different Creator", "Exact Creator"],
  });
});

test("creator coverage never guesses from a similar follow title", () => {
  assert.deepEqual(resolveCreatorCoverage(remoteVideo(), [youtubeFollow({ id: "yt:unrelated", channelId: "UCanother", title: "A Catalog Title" })]), { status: "unresolved" });
});

test('indexed evidence preserves follow-order precedence, whitespace grouping and provider isolation', async () => {
  const follows = [youtubeFollow({ id: 'source', title: '  SAME  Creator ', channelId: 'other' }),
    youtubeFollow({ id: 'later', title: 'same creator', channelId: 'channel' }),
    youtubeFollow({ kind: 'twitch', id: 'source', channelId: 'channel', title: 'Twitch identity' }),
    youtubeFollow({ id: 'blank', channelId: 'channel', title: '  ' })];
  const resolve = await prepareCreatorCoverageResolver(follows, async () => {});
  assert.deepEqual(resolve(remoteVideo({ folderId: 'source', remote: { kind: 'youtube', channelId: 'channel' } })),
    { status: 'resolved', channelName: 'SAME  Creator', evidence: 'source-id' });
  assert.deepEqual(resolve(remoteVideo({ folderId: 'source', remote: { kind: 'twitch', channelId: 'channel' } })),
    { status: 'resolved', channelName: 'Twitch identity', evidence: 'channel-id' });
  const changed = follows.map(follow => follow.kind === 'youtube' ? { ...follow, title: 'New name' } : follow);
  const updated = await prepareCreatorCoverageResolver(changed, async () => {});
  assert.equal(updated(remoteVideo({ folderId: 'source' })).status, 'resolved');
  assert.equal(resolve(remoteVideo({ folderId: 'source' })).status, 'resolved');
  assert.deepEqual(resolve(remoteVideo({ remote: { kind: 'youtube', channelName: ' Verified ' } })), { status: 'present', channelName: 'Verified' });
});

test('large indexed resolution reads each follow once, reuses completed snapshots and discards aborted builds', async () => {
  let reads = 0, turns = 0;
  const follows = Array.from({ length: 4000 }, (_, index) => ({ ...youtubeFollow({ id: `yt:${index}`, channelId: `UC${index}` }),
    get title() { reads++; return `Creator ${index}`; } }));
  const resolver = await prepareCreatorCoverageResolver(follows, async () => { turns++; });
  assert.equal(reads, 4000); assert.ok(turns >= 10);
  for (let i = 0; i < 80_000; i++) assert.deepEqual(resolver(remoteVideo({ folderId: `yt:${i % 4000}`, remote: { kind: 'youtube', channelId: `UC${i % 4000}` } })),
    { status: 'resolved', channelName: `Creator ${i % 4000}`, evidence: 'channel-id' });
  await prepareCreatorCoverageResolver(follows, async () => {});
  assert.equal(reads, 4000, 'video count and repeat audits do not multiply follow reads');
  const fresh = follows.slice(); let aborted = 0;
  await assert.rejects(prepareCreatorCoverageResolver(fresh, async () => { if (++aborted === 3) throw Error('replaced'); }), /replaced/);
  const afterAbort = reads;
  await prepareCreatorCoverageResolver(fresh, async () => {});
  assert.equal(reads - afterAbort, 4000, 'an incomplete index was never cached');
});

test('playlist aliases collapse equivalent creator evidence while preserving earlier source precedence', async () => {
  const follows = [youtubeFollow({ id: 'early-source', channelId: 'different', title: '  Creator  Name  ' }),
    ...Array.from({ length: 4000 }, (_, index) => youtubeFollow({ id: `ytpl:${index}`, channelId: 'UCshared', title: index % 2 ? 'creator name' : 'Creator  Name' }))];
  const resolve = await prepareCreatorCoverageResolver(follows, async () => {});
  assert.deepEqual(resolve(remoteVideo({ folderId: 'early-source', remote: { kind: 'youtube', channelId: 'UCshared' } })),
    { status: 'resolved', channelName: 'Creator  Name', evidence: 'source-id' });
  assert.deepEqual(resolve(remoteVideo({ folderId: 'ytpl:3999', remote: { kind: 'youtube', channelId: 'UCshared' } })),
    { status: 'resolved', channelName: 'Creator  Name', evidence: 'channel-id' });
});
