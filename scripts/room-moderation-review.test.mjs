import test from "node:test";
import assert from "node:assert/strict";
import { mergeMissionPlan } from "../src/lib/mission-plan.ts";
import { ALL_NEXT_LEVEL_MISSIONS } from "../src/lib/mission-roadmap.ts";
import {
  delegatedQueueOperation,
  readRoomDelegation,
  roomDelegationAllows,
} from "../src/lib/multiplayer/room-delegation.ts";
import { groupRoomQueue, holdRoomDuplicate } from "../src/lib/multiplayer/room-duplicates.ts";
import {
  describeRoomMedia,
  parseRoomLinks,
  resolveRoomMedia,
  roomMediaKey,
} from "../src/lib/multiplayer/room-media.ts";
import {
  describeCatalogMedia,
  roomCatalogLocalId,
} from "../src/lib/multiplayer/room-catalog-policy.ts";
import { roomSearchEvidenceAllows } from "../src/lib/multiplayer/room-search-evidence.ts";
import { readRoomQueueDraft, roomQueueDraft } from "../src/lib/multiplayer/room-queue-session.ts";
import { addRoomSuggestions } from "../src/lib/multiplayer/room-suggestions.ts";

test("revision 102 promotes only the verified Watch Room trio and preserves later manual reopens", () => {
  const ids = ["next-144", "next-145", "next-146"];
  const saved = ALL_NEXT_LEVEL_MISSIONS.map(m => ids.includes(m.id) || m.id === "next-141"
    ? {...m, done:false, status:"blocked"} : {...m});
  saved.push({id:"custom", title:"Local note", detail:"Do not reset", done:false, status:"in-progress"});
  const migrated=mergeMissionPlan(saved,ALL_NEXT_LEVEL_MISSIONS,101);
  assert.deepEqual(migrated.filter((row,index)=>row.done&&!saved[index]?.done).map(row=>row.id),ids);
  assert.equal(migrated.find(row=>row.id==="next-141").status,"blocked");
  assert.equal(migrated.find(row=>row.id==="custom").detail,"Do not reset");
  const manuallyReopened=migrated.map(row=>row.id==="next-145"?{...row,done:false,status:"planned"}:row);
  assert.equal(mergeMissionPlan(manuallyReopened,ALL_NEXT_LEVEL_MISSIONS,102).find(row=>row.id==="next-145").status,"planned");
});

const grant = {
  id: "moderation-first",
  issuer: "p-host",
  recipient: "p-guest",
  scope: "queue-order",
  expiresAt: 61000,
  durationMs: 60000,
};
const identity = { from: "p-guest", host: "p-host", generation: 7 };
const lease = { grant, generation: 7, deadline: 60100 };
const packet = {
  type: "queue-action",
  operation: { kind: "next", id: "b" },
  delegationId: grant.id,
  permissionRevision: 3,
};
test("temporary moderation is bound to the host, guest, channel, revision, nonce and host monotonic deadline", () => {
  assert.deepEqual(readRoomDelegation(grant), grant);
  assert.equal(readRoomDelegation({ ...grant, durationMs: 86400000 }), undefined);
  assert(roomDelegationAllows(lease, identity, packet, 3, ["a", "b"], 60099));
  assert(!roomDelegationAllows(lease, identity, packet, 3, ["a", "b"], 60100));
  assert(!roomDelegationAllows(undefined, identity, packet, 3, ["a", "b"], 10));
  for (const who of [
    { ...identity, from: "p-other" },
    { ...identity, host: "p-other" },
    { ...identity, generation: 8 },
  ]) {
    assert(!roomDelegationAllows(lease, who, packet, 3, ["a", "b"], 10));
  }
  assert(
    !roomDelegationAllows(lease, identity, { ...packet, delegationId: "old" }, 3, ["a", "b"], 10),
  );
  assert(!roomDelegationAllows(lease, identity, packet, 4, ["a", "b"], 10));
});
test("moderation cannot select media, replay a removed title, add media, or grant privileges", () => {
  const queue = ["a", "b"];
  assert(delegatedQueueOperation("queue-edit", { kind: "remove", ids: ["a", "b"] }, queue));
  assert(delegatedQueueOperation("queue-shuffle", null, queue));
  for (const type of [
    "sync-request",
    "video-request",
    "next-request",
    "room-queue-delegation",
    "local-stage-request",
    "queue-batch",
  ]) {
    assert(!delegatedQueueOperation(type, packet.operation, queue));
  }
  for (const operation of [
    { kind: "add", id: "a" },
    { kind: "next", id: "gone" },
    { kind: "move", id: "a", before: "gone" },
  ]) {
    assert(!delegatedQueueOperation("queue-action", operation, queue));
  }
});
test("duplicate requests group by verified provider identity, preserve provenance, and do not merge similar titles", () => {
  const { videos, repeated } = parseRoomLinks(
    "https://youtu.be/abc12345678\nhttps://www.youtube.com/watch?v=abc12345678\nhttps://youtu.be/def12345678",
  );
  const original = describeRoomMedia(videos[0]),
    alias = describeRoomMedia(repeated[0]),
    different = describeRoomMedia(videos[1]);
  const key = roomMediaKey(videos[0]);
  let held = holdRoomDuplicate(
    {},
    { id: "original-request", media: alias, source: "Guest A", peer: "p-a" },
  );
  const initial = held;
  held = holdRoomDuplicate(held, { id: "original-request", media: original, source: "Guest A" });
  assert.equal(held, initial);
  held = holdRoomDuplicate(held, {
    id: "other-request",
    media: { ...different, name: original.name },
    source: "Guest B",
  });
  assert.equal(Object.keys(held).length, 2);
  const groups = groupRoomQueue(
    [
      { id: "first", key },
      { id: "separate", key },
      { id: "unrelated", key: "youtube:unrelated" },
    ],
    held,
  );
  assert.deepEqual(
    groups[0].slots.map((row) => row.id),
    ["first", "separate"],
  );
  assert.equal(groups[0].requests[0].peer, "p-a");
  assert.equal(groups[0].requests[0].media.watchUrl, original.watchUrl);
  const repeat = { ...alias, id: "room-repeat-approved123" };
  const recovered = readRoomQueueDraft(
    JSON.stringify(roomQueueDraft([original, repeat, alias], 10, true)),
  );
  assert.deepEqual(
    recovered.media.map((row) => row.id),
    [original.id, repeat.id],
  );
  assert.equal(roomQueueDraft([original, repeat]).media.length, 1);
});
test("host evidence must match current sharing, exact identity and allowed collection even for active media", () => {
  const video = parseRoomLinks("https://youtu.be/abc12345678").videos[0],
    key = roomMediaKey(video);
  const local = {
    id: "disk:C:/private/show.mp4",
    name: "C:/private/show.mp4",
    path: "C:/private/show.mp4",
    folderId: "files",
    size: 77,
    mime: "video/mp4",
    extension: "mp4",
    addedAt: 3,
  };
  const alias = describeCatalogMedia(local);
  assert.equal(alias.id, roomCatalogLocalId(local));
  assert.equal(alias.name, "show.mp4");
  assert(!JSON.stringify(alias).includes("private"));
  const localWire = resolveRoomMedia(alias).video;
  const index = {
    known: new Map([
      [key, video],
      [roomMediaKey(localWire), local],
    ]),
    blocked: new Set(),
    collections: [],
    publicTitle: () => true,
  };
  const policy = { enabled: true, localTitles: true, folders: [video.folderId, local.folderId] };
  const state = { index, policy, revision: 4, pending: false },
    evidence = { source: "host", revision: 4 };
  assert(roomSearchEvidenceAllows(state, video, evidence, 4, []));
  assert(roomSearchEvidenceAllows(state, localWire, evidence, 4, []));
  assert(!roomSearchEvidenceAllows(state, localWire, { source: "public" }, 4, []));
  assert(!roomSearchEvidenceAllows(state, video, { source: "host", revision: 3 }, 4, [key]));
  assert(
    !roomSearchEvidenceAllows(
      { ...state, policy: { ...policy, enabled: false } },
      video,
      evidence,
      4,
      [key],
    ),
  );
  assert(
    !roomSearchEvidenceAllows(
      { ...state, index: { ...index, blocked: new Set([key]) } },
      video,
      { source: "public" },
      4,
      [],
    ),
  );
  assert(
    !roomSearchEvidenceAllows(
      state,
      parseRoomLinks("https://youtu.be/unknown1234").videos[0],
      evidence,
      4,
      [],
    ),
  );
  const reviewed = addRoomSuggestions([], [alias], "p-guest", "Guest", [], () => ({
    evidence,
    catalogRevision: 4,
  }));
  assert.equal(reviewed.added, 1);
  assert.equal(reviewed.items[0].media.id, alias.id);
  assert(!JSON.stringify(reviewed).includes("private"));
});
