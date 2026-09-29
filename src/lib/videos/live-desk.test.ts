import { test } from "node:test";
import assert from "node:assert/strict";
import { hasFreshRemoteLiveState } from "./live-desk.ts";
import type { LibraryVideo } from "./types.ts";

function liveVideo(kind: "youtube" | "twitch", observedAt?: number): LibraryVideo {
  return {
    id: `${kind}:live`, folderId: `${kind}:channel`, name: "Live stream", path: "", extension: "yt", mime: "video/youtube", size: 0, addedAt: 1,
    remote: { kind, live: true, observedAt },
  };
}

test("YouTube live rows require a recent provider observation", () => {
  const now = 400_000;
  assert.equal(hasFreshRemoteLiveState(liveVideo("youtube", now - 30_000), now, 120_000, 180_000), true);
  assert.equal(hasFreshRemoteLiveState(liveVideo("youtube", now - 181_000), now, 120_000, 180_000), false);
  assert.equal(hasFreshRemoteLiveState(liveVideo("youtube"), now, 120_000, 180_000), false);
});

test("Twitch freshness keeps its own shorter window", () => {
  const now = 400_000;
  assert.equal(hasFreshRemoteLiveState(liveVideo("twitch", now - 121_000), now, 120_000, 180_000), false);
  assert.equal(hasFreshRemoteLiveState({ ...liveVideo("youtube"), remote: { kind: "youtube", live: false } }, now, 120_000, 180_000), true);
});
