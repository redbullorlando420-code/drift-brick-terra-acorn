import assert from "node:assert/strict";
import test from "node:test";
import { resolveCreatorCoverage } from "./creator-coverage.ts";
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
