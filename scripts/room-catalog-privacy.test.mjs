import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRoomCatalogIndex,
  roomCatalogAllows,
  roomCatalogSearchText,
  roomCatalogRequestAllowed,
  describeCatalogMedia,
  roomCatalogLocalId,
  CLOSED_ROOM_CATALOG,
} from "../src/lib/multiplayer/room-catalog-policy.ts";
import { roomSearchPage } from "../src/lib/multiplayer/room-search.ts";
import { hostCatalogPayload } from "../src/lib/multiplayer/room-host-catalog.ts";
import { roomMediaKey } from "../src/lib/multiplayer/room-media.ts";
import { prepareRoomCandidates } from "../src/lib/multiplayer/room-candidates.ts";
const turn = async () => {},
  folders = [
    { id: "public", name: "Shared archive", kind: "youtube" },
    { id: "other", name: "Other", kind: "twitch" },
    { id: "private", name: "CANARY PRIVATE COLLECTION", kind: "youtube", adult: true },
    { id: "files", name: "My files", kind: "files" },
  ];
const video = (i, extra = {}) => ({
  id: "yt:" + i,
  folderId: "public",
  name: "Public recording " + i,
  path: "C:/CANARY/private/path",
  size: 123456,
  extension: "yt",
  mime: "video/youtube",
  addedAt: 0,
  description: "CANARY PRIVATE DESCRIPTION",
  genre: "CANARY PRIVATE LABEL",
  remote: {
    kind: "youtube",
    videoId: "v" + String(i).padStart(10, "0"),
    channelName: "Public creator",
    youtubeKeywords: ["CANARY PRIVATE LABEL"],
  },
  ...extra,
});
const policy = { enabled: true, localTitles: false, folders: ["public", "other", "files"] };
test("scopes exclude private/adult/merged/hidden/orphan titles and provider aliases before pagination", async () => {
  const privateVideo = video(100, { folderId: "private", name: "CANARY PRIVATE TITLE" }),
    alias = { ...privateVideo, id: "alias", folderId: "public", name: "CANARY ALIAS" };
  const merged = video(101);
  merged.remote = { ...merged.remote, sourceIds: ["public", "private"] };
  const rows = [
    ...Array.from({ length: 65 }, (_, i) => video(i)),
    privateVideo,
    alias,
    merged,
    video(102, { folderId: "missing", remote: undefined }),
    video(103, { remote: { kind: "redtube" } }),
    video(104),
    video(105),
  ];
  const index = await buildRoomCatalogIndex(
      rows,
      folders,
      { "yt:104": true },
      { "yt:105": true },
      turn,
    ),
    allows = roomCatalogAllows(index, policy);
  const first = await roomSearchPage(rows, "Public", 0, turn, allows, roomCatalogSearchText),
    last = await roomSearchPage(rows, "Public", 48, turn, allows, roomCatalogSearchText);
  assert.equal(first.videos.length, 24);
  assert.equal(first.hasMore, true);
  assert.equal(last.videos.length, 17);
  assert.equal(last.hasMore, false);
  for (const row of rows.slice(65)) assert.equal(allows(row), false, row.id);
  assert.ok(!JSON.stringify(index.collections).includes("CANARY"));
  assert.ok(!JSON.stringify(hostCatalogPayload(first.videos, 0, true)).includes("CANARY"));
  assert.equal(
    (await roomSearchPage(rows, "CANARY", 0, turn, allows, roomCatalogSearchText)).videos.length,
    0,
    "hidden fields cannot be used as a search oracle",
  );
});
test("revocation blocks stale IDs, public aliases, regrant retries and unpublished suggestions while active playback survives", async () => {
  const row = video(1),
    index = await buildRoomCatalogIndex([row], folders, {}, {}, turn),
    alias = { ...row, id: "guest:alias", folderId: "room:youtube", name: "guessed" };
  const state = { revision: 7, policy, index, pending: false };
  assert.equal(roomCatalogRequestAllowed(state, alias, 7, []), true);
  for (const changed of [
    { ...state, policy: CLOSED_ROOM_CATALOG, revision: 8 },
    { ...state, revision: 9 },
    { ...state, policy: { ...policy, folders: ["other"] }, revision: 8 },
    { ...state, pending: true, revision: 8 },
  ]) {
    assert.equal(roomCatalogRequestAllowed(changed, alias, 7, []), false);
    assert.equal(roomCatalogRequestAllowed(changed, alias, 7, [roomMediaKey(row)]), true);
  }
  assert.equal(roomCatalogRequestAllowed({ ...state, revision: 9 }, alias, 9, []), true);
  assert.equal(
    roomCatalogRequestAllowed(state, video(999), -1, []),
    true,
    "unrelated guest public links are still usable",
  );
});
test("local title opt-in sends only a filename and playback duration, never directory or filesystem metadata", async () => {
  const row = video(1, {
      id: "file:one",
      folderId: "files",
      name: "C:/private/Selected movie.mp4",
      remote: undefined,
      duration: 7200,
    }),
    index = await buildRoomCatalogIndex([row], folders, {}, {}, turn);
  assert.equal(roomCatalogAllows(index, policy)(row), false);
  assert.equal(roomCatalogAllows(index, { ...policy, localTitles: true })(row), true);
  const media = describeCatalogMedia(row);
  assert.deepEqual(media, {
    id: roomCatalogLocalId(row),
    name: "Selected movie.mp4",
    kind: "local",
    duration: 7200,
  });
  assert.ok(!JSON.stringify(media).includes("private"));
  assert.ok(!JSON.stringify(media).includes("123456"));
});
test("100k catalog builds and denied searches yield, retain only page data and support cancellation", async () => {
  const rows = Array.from({ length: 100000 }, (_, i) => video(i)),
    count = { value: 0 };
  const index = await buildRoomCatalogIndex(rows, folders, {}, {}, async () => {
    count.value++;
  });
  assert.ok(count.value > 300);
  assert.equal(index.collections[0].count, 100000);
  const page = await roomSearchPage(
    rows,
    "recording",
    99984,
    turn,
    roomCatalogAllows(index, policy),
    roomCatalogSearchText,
  );
  assert.equal(page.videos.length, 16);
  assert.equal(page.hasMore, false);
  await assert.rejects(
    buildRoomCatalogIndex(rows, folders, {}, {}, async () => {
      throw Error("revoked");
    }),
    /revoked/,
  );
});
test("room recommendation preparation excludes private signals and canonical aliases regardless of private desk state", async () => {
  const secret = video(7, { folderId: "private", name: "CANARY TITLE" }),
    merged = video(8);
  merged.remote = { ...merged.remote, sourceIds: ["private"] };
  const rows = [video(1), secret, { ...secret, id: "alias", folderId: "public" }, merged];
  const options = {
    videos: rows,
    folders,
    shared: {},
    guest: false,
    favorites: { [secret.id]: true },
    hidden: {},
    unavailable: {},
    history: [],
    seed: 1,
    canStage: () => true,
    rank: () => 1,
  };
  for (const adultsUnlocked of [false, true])
    assert.deepEqual(
      (await prepareRoomCandidates({ ...options, adultsUnlocked }, turn)).map((row) => row.id),
      ["yt:1"],
    );
});
