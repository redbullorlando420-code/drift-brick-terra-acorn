import { test } from "node:test";
import assert from "node:assert/strict";
import { canonicalFollowHandle, dedupeFollows } from "./follow-identity.ts";
import type { FollowedChannel } from "./types";
const channel = (id: string, handle: string, kind: "youtube" | "twitch" = "youtube"): FollowedChannel => ({ id, handle, kind, title: handle });

test("resolved channel IDs collapse creator aliases without collapsing playlists", () => {
  const one = {...channel("yt:one", "first"),channelId:"UCsame"};
  const alias = {...channel("yt:two", "renamed"),channelId:"UCsame"};
  const playlist = {...channel("ytpl:list", "https://youtube.com/playlist?list=PL12345678901"),channelId:"UCsame"};
  assert.deepEqual(dedupeFollows([one, alias, playlist]), [one, playlist]);
});

test("refreshed creators cannot duplicate a saved ID after resolving or renaming a handle", () => {
  const fresh = { ...channel("yt:natgeo", "UCfresh"), title: "National Geographic", catalogCursor: "continued" };
  const saved = channel("yt:natgeo", "@natgeo");
  const distinct = channel("yt:other", "other");
  assert.deepEqual(dedupeFollows([fresh, saved, distinct]), [fresh, distinct]);
  assert.equal(fresh.catalogCursor, "continued");
});

test("handle aliases deduplicate within a provider without merging different providers or playlists", () => {
  const first = channel("yt:first", "https://youtube.com/@Creator");
  const alias = channel("yt:alias", "@creator");
  const twitch = channel("tw:first", "creator", "twitch");
  const playlist = channel("yt:playlist", "https://youtube.com/playlist?list=PL1234567890");
  const otherPlaylist = channel("yt:playlist2", "https://youtube.com/playlist?list=PL0987654321");
  assert.deepEqual(dedupeFollows([first, alias, twitch, playlist, otherPlaylist]), [first, twitch, playlist, otherPlaylist]);
  assert.equal(canonicalFollowHandle("twitch", "https://twitch.tv/Creator_Name"), "creator_name");
});

test("unique follow snapshots retain identity and incomplete handles do not collapse separate saved IDs", () => {
  const rows = [channel("yt:first", ""), channel("yt:second", "")];
  assert.equal(dedupeFollows(rows), rows);
});
