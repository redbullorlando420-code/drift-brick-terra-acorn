import test from "node:test";
import assert from "node:assert/strict";
import { guestArrival } from "../src/lib/multiplayer/guest-arrival.ts";
import { transitionIntent, acceptsRoomTransition } from "../src/lib/multiplayer/room-transition.ts";
import {
  readGuestDrafts,
  stageGuestDraft,
  claimGuestDrafts,
  draftIdentity,
} from "../src/lib/multiplayer/room-guest-drafts.ts";
import { parseRoomLinks, describeRoomMedia } from "../src/lib/multiplayer/room-media.ts";
import { reviewedPreferences } from "../src/lib/reviewed-preferences.ts";
import { createProfileStorage } from "../src/lib/local-profile-storage.ts";
const arrival = (status, extra = {}) =>
  guestArrival({
    connected: true,
    handshake: true,
    selected: true,
    roomPlaying: true,
    player: { selection: 2, status, capability: "youtube" },
    ...extra,
  });
test("arrival derives actual transport, host state, media and player observations separately", () => {
  assert.equal(arrival("playing", { connected: false }).stage, "connection");
  assert.equal(arrival("playing", { handshake: false }).stage, "handshake");
  assert.equal(arrival("ready", { selected: false }).stage, "selection");
  assert.equal(arrival("waiting").stage, "local");
  assert.equal(arrival("blocked").action, "start");
  assert.equal(arrival("ready").action, "start");
  assert.equal(arrival("error").action, "reload");
  assert.equal(arrival("buffering").stage, "loading");
  assert.equal(arrival("unsupported").action, "external");
  assert.equal(arrival("playing", { external: true }).stage, "unsupported");
  assert.equal(arrival("playing").action, "none");
  assert.equal(arrival("paused", { roomPlaying: false }).stage, "paused");
  assert.equal(arrival("blocked", { roomPlaying: false }).action, "start");
});
test("only authoritative selection packets establish or advance an item transition", () => {
  let current = transitionIntent(0, "");
  const state = (id, rev, type = "room-state") => ({ type, videoId: id, selectionRevision: rev });
  assert(acceptsRoomTransition(current, state("", 0)));
  assert(!acceptsRoomTransition(current, state("A", 1, "sync")));
  assert(acceptsRoomTransition(current, state("A", 1, "video")));
  current = transitionIntent(1, "A");
  for (const packet of [
    state("A", 2, "sync"),
    state("B", 2, "sync"),
    state("B", 1),
    state("A", 0),
    state("B", 0, "video"),
    { type: "sync" },
  ])
    assert(!acceptsRoomTransition(current, packet));
  assert(acceptsRoomTransition(current, state("A", 1, "sync")));
  assert(acceptsRoomTransition(current, state("B", 2)));
  current = transitionIntent(2, "B");
  assert(!acceptsRoomTransition(current, state("A", 1, "video")));
  assert(acceptsRoomTransition(current, state("A", 3, "video")));
  current = transitionIntent(3, "A");
  assert(!acceptsRoomTransition(current, state("A", 1, "sync")));
  for (const rev of [-1, Infinity, NaN, null, 1.5, "3", Number.MAX_SAFE_INTEGER + 1])
    assert(!acceptsRoomTransition(current, state("A", rev)));
  assert(!acceptsRoomTransition(undefined, state("A", 1, "sync")));
  assert(!acceptsRoomTransition(current, state("", 3, "video")));
  assert(acceptsRoomTransition(transitionIntent(0, "A"), { type: "video", videoId: "B" }));
  assert(acceptsRoomTransition(transitionIntent(0, "A"), { type: "sync" }));
  assert(!acceptsRoomTransition(current, { type: "unknown", selectionRevision: 3, videoId: "A" }));
});
const empty = () => ({ version: 1, room: "", rows: [] });
const row = (i, origin = "public", catalogRevision) => ({
  media: describeRoomMedia(
    parseRoomLinks("https://youtu.be/draft" + String(i).padStart(6, "0")).videos[0],
  ),
  origin,
  status: "draft",
  ...(catalogRevision === undefined ? {} : { catalogRevision }),
});
test("draft schema retains public descriptors only and bounds stored rows and explicit batches", () => {
  let state = empty();
  for (let i = 0; i < 16; i++) state = stageGuestDraft(state, "RCtest", row(i));
  assert.equal(state.rows.length, 16);
  assert.throws(() => stageGuestDraft(state, "RCtest", row(16)), /Unsupported/);
  assert.throws(() => readGuestDrafts({ ...state, version: 2 }));
  assert.throws(() => readGuestDrafts({ ...state, rows: [{ ...row(1), privatePath: "secret" }] }));
  assert.throws(() =>
    readGuestDrafts({
      ...state,
      rows: [
        {
          ...row(1),
          media: {
            id: "local:private",
            kind: "local",
            name: "secret.mp4",
            local: { name: "secret.mp4", fingerprint: "secret", size: 4, modified: 1 },
          },
        },
      ],
    }),
  );
  const dirty = row(1);
  dirty.media.description = "PRIVATE DESCRIPTION";
  dirty.media.poster = "https://i.ytimg.com/vi/draft000001/default.jpg";
  dirty.media.path = "C:/secret";
  assert.doesNotMatch(
    JSON.stringify(readGuestDrafts({ version: 1, room: "RCtest", rows: [dirty] })),
    /PRIVATE|secret|poster|description|path/,
  );
  assert.throws(
    () => claimGuestDrafts(state, "RCtest", state.rows.slice(0, 9).map(draftIdentity)),
    /one to eight/,
  );
  const id = draftIdentity(state.rows[0]);
  assert.throws(() => claimGuestDrafts(state, "RCtest", [id, id]));
  assert.equal(stageGuestDraft(state, "RCtest", row(0)).rows.length, 16);
  const alias = row(0);
  alias.media.id = "another-cache-id";
  assert.equal(stageGuestDraft(state, "RCtest", alias).rows.length, 16);
});
test("guest drafts use distinct profile namespaces and failed future-schema reads preserve saved bytes", () => {
  const entries = new Map(),
    native = { getItem: (k) => entries.get(k) ?? null, setItem: (k, v) => entries.set(k, v) };
  const a = reviewedPreferences(
    "reelcase.room-guest-drafts.v1",
    empty,
    readGuestDrafts,
    createProfileStorage(() => native, "p-11111111-1111-1111-1111-111111111111"),
  );
  const b = reviewedPreferences(
    "reelcase.room-guest-drafts.v1",
    empty,
    readGuestDrafts,
    createProfileStorage(() => native, "p-22222222-2222-2222-2222-222222222222"),
  );
  a.read();
  a.write(stageGuestDraft(empty(), "RCtest", row(1)));
  assert.deepEqual(b.read(), empty());
  b.write(stageGuestDraft(empty(), "RCtest", row(2)));
  assert.notEqual(draftIdentity(a.get().rows[0]), draftIdentity(b.get().rows[0]));
  const key = [...entries.keys()][0],
    future = JSON.stringify({ version: 2, room: "RCtest", rows: [] });
  entries.set(key, future);
  a.read();
  assert.throws(() => a.write(empty()), /Unsupported/);
  assert.equal(entries.get(key), future);
});
test("drafts remain room scoped, retain unsent on disconnect and reject changed host sharing", () => {
  const state = stageGuestDraft(
    stageGuestDraft(empty(), "RCtest", row(1)),
    "RCtest",
    row(2, "host", 4),
  );
  const ids = state.rows.map(draftIdentity),
    snapshot = JSON.stringify(state);
  assert.throws(() => stageGuestDraft(state, "RCother", row(3)), /another room/);
  assert.throws(() => claimGuestDrafts(state, "RCtest", ids, 4, false), /connection/);
  assert.throws(() => claimGuestDrafts(state, "RCtest", ids, 5), /sharing changed/);
  assert.throws(() => claimGuestDrafts(state, "RCtest", ids, undefined), /sharing changed/);
  assert.equal(JSON.stringify(state), snapshot);
  const restaged = stageGuestDraft(state, "RCtest", row(2, "host", 5));
  const claimed = claimGuestDrafts(restaged, "RCtest", ids, 5);
  assert(claimed.rows.every((r) => r.status === "submitted"));
  assert.throws(() => claimGuestDrafts(claimed, "RCtest", ids, 5), /already submitted/);
  assert.throws(() => stageGuestDraft(claimed, "RCtest", row(1)), /already submitted/);
  assert.deepEqual(readGuestDrafts(JSON.parse(JSON.stringify(claimed))), claimed);
});
test("write-before-send preserves unsent drafts on quota failure and detects another tab", () => {
  let bytes = null,
    fail = false;
  const storage = {
    getItem: () => bytes,
    setItem: (_, value) => {
      if (fail) throw Error("quota");
      bytes = value;
    },
  };
  const store = reviewedPreferences("drafts", empty, readGuestDrafts, storage);
  store.read();
  const state = store.write(stageGuestDraft(empty(), "RCtest", row(1))),
    ids = state.rows.map(draftIdentity);
  let sends = 0;
  const submit = () => {
    store.write(claimGuestDrafts(store.get(), "RCtest", ids));
    sends++;
  };
  fail = true;
  assert.throws(submit, /quota/);
  assert.equal(sends, 0);
  assert.equal(store.get().rows[0].status, "draft");
  fail = false;
  submit();
  assert.equal(sends, 1);
  assert.throws(submit, /already submitted/);
  const reload = reviewedPreferences("drafts", empty, readGuestDrafts, storage);
  assert.equal(reload.read().rows[0].status, "submitted");
  bytes = JSON.stringify(empty());
  assert.throws(() => store.write(empty()), /another tab/);
});
