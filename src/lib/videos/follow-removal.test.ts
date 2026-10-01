import assert from "node:assert/strict";
import test from "node:test";
import { planFollowRemoval, retainVideosAfterUnfollow, shouldRestoreRemoteVideo } from "./follow-removal.ts";
import type { FollowedChannel, LibraryVideo } from "./types.ts";

const follows: FollowedChannel[] = [
  { id: "yt:one", kind: "youtube", handle: "one", title: "One" },
  { id: "tw:two", kind: "twitch", handle: "two", title: "Two" },
];

function video(id: string, folderId = "yt:one"): LibraryVideo {
  return { id, folderId, name: id, path: `https://example.test/${id}`, extension: "remote", mime: "video/*", size: 0, addedAt: 1 };
}

test("bulk follow removal retains every locally saved or watched video while pruning untouched rows", () => {
  const state = {
    follows,
    videos: [video("favorite"), video("liked"), video("watched"), video("resume"), video("rated"), video("noted"), video("untouched"), video("other", "tw:two")],
    favorites: { favorite: true as const },
    likes: { liked: true as const },
    history: [{ id: "watched", at: 1 }],
    progress: { resume: { t: 12, d: 100, at: 1 } },
    resumeProgress: {},
  };
  const plan = planFollowRemoval(state, ["yt:one", "missing"], { ratings: { rated: 4 }, notes: { noted: "Keep this" } });
  assert.deepEqual([...plan.followIds], ["yt:one"]);
  assert.equal(plan.keptRows, 6);
  assert.equal(plan.removedRows, 1);
  assert.equal(plan.channels[0]?.catalogRows, 7);
  assert.equal(plan.retainedVideoIds.has("untouched"), false);
  assert.equal(plan.retainedVideoIds.has("other"), false);
});

test("a multi-provider preview counts each affected channel separately", () => {
  const plan = planFollowRemoval({ follows, videos: [video("one"), video("two", "tw:two")], favorites: {}, likes: {}, progress: {}, resumeProgress: {}, history: [] }, follows.map((follow) => follow.id));
  assert.deepEqual(plan.channels.map(({ follow, removedRows }) => [follow.id, removedRows]), [["yt:one", 1], ["tw:two", 1]]);
});

test("retained cards survive remote snapshot restore after the follow disappears", () => {
  const state = { follows, videos: [video("watched"), video("untouched")], favorites: {}, likes: {}, progress: {}, resumeProgress: {}, history: [{ id: "watched", at: 1 }] };
  const plan = planFollowRemoval(state, ["yt:one"]);
  const kept = retainVideosAfterUnfollow(state.videos, plan);
  assert.deepEqual(kept.map((row) => row.id), ["watched"]);
  assert.equal(kept[0]?.retainedAfterUnfollow, true);
  assert.equal(shouldRestoreRemoteVideo(kept[0]!, new Set(), {}, {}), true);
  assert.equal(shouldRestoreRemoteVideo(video("untouched"), new Set(), {}, {}), false);
});
test("channel aliases and playlist memberships survive restore without duplicate rows", () => {
  const row = {...video("shared", "yt:old-handle"),remote:{kind:"youtube" as const,channelId:"UCexact",sourceIds:["yt:old-handle","ytpl:saved"]}};
  assert.equal(shouldRestoreRemoteVideo(row, new Set(["yt:resolved"]), {}, {}, new Set(["UCexact"])), true);
  assert.equal(shouldRestoreRemoteVideo(row, new Set(["ytpl:saved"]), {}, {}), true);
  assert.equal(shouldRestoreRemoteVideo(row, new Set(["yt:unrelated"]), {}, {}, new Set(["UCother"])), false);
});
test("unfollowing one source retains a shared video under its remaining membership", () => {
  const row = {...video("shared"),remote:{kind:"youtube" as const,sourceIds:["yt:one","ytpl:remaining"]}};
  const state = {follows:[...follows,{id:"ytpl:remaining",kind:"youtube" as const,handle:"playlist",title:"Playlist"}],videos:[row],favorites:{},likes:{},history:[],progress:{},resumeProgress:{}};
  const plan = planFollowRemoval(state,["yt:one"]);
  const kept = retainVideosAfterUnfollow(state.videos,plan);
  assert.equal(plan.removedRows,0);
  assert.equal(kept[0]!.id,"shared");
  assert.equal(kept[0]!.folderId,"ytpl:remaining");
  assert.deepEqual(kept[0]!.remote!.sourceIds,["ytpl:remaining"]);
  const lastPlan = planFollowRemoval({...state,follows:state.follows.filter(follow => follow.id !== "yt:one"),videos:kept},["ytpl:remaining"]);
  assert.deepEqual(retainVideosAfterUnfollow(kept,lastPlan),[]);
});

test("legacy rating and note keys still protect older saved cards", () => {
  const values = new Map([["reelcase.rating.rated-legacy", "5"], ["reelcase.note.noted-legacy", "A note"]]);
  const previous = globalThis.localStorage;
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    get length() { return values.size; },
    key: (index: number) => [...values.keys()][index] ?? null,
    getItem: (key: string) => values.get(key) ?? null,
  } });
  try {
    const plan = planFollowRemoval({ follows, videos: [video("rated-legacy"), video("noted-legacy")], favorites: {}, likes: {}, progress: {}, resumeProgress: {}, history: [] }, ["yt:one"]);
    assert.equal(plan.keptRows, 2);
    assert.equal(plan.removedRows, 0);
  } finally {
    if (previous === undefined) delete (globalThis as { localStorage?: unknown }).localStorage;
    else Object.defineProperty(globalThis, "localStorage", { configurable: true, value: previous });
  }
});
