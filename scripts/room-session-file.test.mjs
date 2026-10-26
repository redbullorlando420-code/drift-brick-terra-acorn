import test from "node:test";
import assert from "node:assert/strict";
import {
  buildRoomSessionFile,
  readRoomSessionFile,
  writeRoomSessionFile,
  publicSessionItem,
  sessionItemMedia,
  previewRoomSessionImport,
  ROOM_SESSION_FILE_BYTES,
} from "../src/lib/multiplayer/room-session-file.ts";
const desc = (id = "session0001", patch = {}) => ({
  id: "private-catalog-id",
  kind: "youtube",
  name: "Public video " + id,
  videoId: id,
  watchUrl: "https://youtu.be/" + id + "?si=tracking",
  duration: 123,
  ...patch,
});
const item = (id = "session0001", patch = {}) => ({
  provider: "youtube",
  url: "https://www.youtube.com/watch?v=" + id,
  title: "Public video " + id,
  ...patch,
});
const file = (upcoming = []) => ({
  format: "realhub-watch-session",
  version: 1,
  played: [],
  current: null,
  upcoming,
});
test("session exports whitelist public played/current/upcoming identity and known runtime without room or local state", () => {
  const privateFields = {
    peer: "PEER_SECRET",
    path: "C:/PRIVATE_PATH",
    streamId: "STREAM_SECRET",
    token: "INVITE_SECRET",
    description: "PRIVATE_DESCRIPTION",
    poster: "https://i.ytimg.com/private.jpg",
    channelId: "PRIVATE_CATALOG_OWNER",
  };
  const out = buildRoomSessionFile({
    played: [
      desc("played00001", privateFields),
      {
        id: "local:PRIVATE_FINGERPRINT",
        kind: "local",
        name: "PRIVATE_FILE_NAME",
        local: {
          name: "PRIVATE_FILE_NAME",
          fingerprint: "PRIVATE_FINGERPRINT",
          size: 12,
          modified: 123,
        },
      },
    ],
    current: desc("current0001", privateFields),
    upcoming: [desc("next0000001", privateFields)],
  });
  assert.equal(out.omitted, 1);
  assert.equal(out.file.played.length, 1);
  assert.equal(out.file.current.provider, "youtube");
  assert.equal(out.file.upcoming[0].duration, 123);
  const raw = writeRoomSessionFile({
    ...out.file,
    peer: "PEER_SECRET",
    room: "ROOM_SECRET",
    autoplay: true,
  });
  assert.doesNotMatch(
    raw,
    /PRIVATE_|SECRET|private-catalog|tracking|channelId|poster|description|autoplay|peer|streamId|fingerprint/,
  );
  assert.deepEqual(readRoomSessionFile(raw).file, out.file);
});
test("exports canonicalize YouTube variants and Twitch VOD, clip and live routes, removing tracking and credentials", () => {
  const live = {
    id: "secret",
    kind: "twitch",
    name: "Public Twitch",
    watchUrl: "https://secret:password@www.twitch.tv/NotYoda?token=SECRET",
    live: true,
    duration: 500,
  };
  assert.deepEqual(publicSessionItem(live), {
    provider: "twitch",
    url: "https://www.twitch.tv/notyoda",
    title: "Public Twitch",
    live: true,
  });
  assert.equal(
    publicSessionItem({
      id: "a",
      name: "VOD",
      kind: "twitch",
      watchUrl: "https://player.twitch.tv/?video=v123&parent=secret",
    }).url,
    "https://www.twitch.tv/videos/123",
  );
  assert.equal(
    publicSessionItem({
      id: "b",
      name: "Clip",
      kind: "twitch",
      watchUrl: "https://www.twitch.tv/notyoda/clip/SlugHere?si=secret",
    }).url,
    "https://clips.twitch.tv/SlugHere",
  );
  const shorts = desc("session0001", {
    watchUrl: "https://www.youtube.com/shorts/session0001?feature=secret",
  });
  assert.equal(publicSessionItem(shorts).url, item().url);
  assert.equal(publicSessionItem(desc("short")), undefined);
  assert.equal(publicSessionItem({ kind: "reddit", id: "private", name: "Private" }), undefined);
});
test("export stages are bounded and deduplicate public entries while keeping played context separate from upcoming", () => {
  const rows = Array.from({ length: 100 }, (_, i) => desc(String(i).padStart(11, "0"))),
    out = buildRoomSessionFile({
      played: rows,
      current: rows[0],
      upcoming: [rows[0], rows[1], rows[1], ...rows.slice(2)],
    });
  assert(out.file.played.length <= 12);
  assert(!out.file.played.some((item) => item.url === out.file.current.url));
  assert(out.file.upcoming.length <= 48);
  assert(!out.file.upcoming.some((i) => i.url === out.file.current.url));
  assert.equal(out.file.upcoming.filter((i) => i.url === publicSessionItem(rows[1]).url).length, 1);
  assert.equal(publicSessionItem(desc("session0001", { duration: Infinity })).duration, undefined);
  assert.equal(
    publicSessionItem(desc("session0001", { live: true, duration: 100 })).duration,
    undefined,
  );
});
test("invalid format, excessive stages, corrupt JSON and UTF-8 byte limits reject the whole import without mutations", () => {
  for (const raw of [
    "{broken",
    "null",
    "{}",
    JSON.stringify({ ...file(), version: 2 }),
    JSON.stringify({ ...file(), upcoming: {} }),
    JSON.stringify({ ...file(), current: [] }),
    JSON.stringify({ ...file(), upcoming: Array(193).fill(item()) }),
    JSON.stringify({ ...file(), played: Array(81).fill(item()) }),
    "x".repeat(ROOM_SESSION_FILE_BYTES + 1),
    JSON.stringify({ ...file(), ignored: "森".repeat(90000) }),
  ])
    assert.throws(() => readRoomSessionFile(raw));
});
test("file preview separates unsupported/invalid entries and strips unknown fields without starting provider reads", () => {
  const raw = JSON.stringify({
    ...file([
      item("session0001", { path: "SECRET", embedUrl: "https://evil.example", peer: "SECRET" }),
      { provider: "netflix", url: "https://netflix.com", title: "Other" },
      { provider: "local", title: "PRIVATE" },
      { ...item(), url: "javascript:alert(1)" },
      { ...item(), url: "https://evil.example/watch?v=session0001" },
    ]),
    played: [item("played00001")],
    current: item("current0001"),
    room: "SECRET",
    autoplay: true,
  });
  const parsed = readRoomSessionFile(raw);
  assert.equal(parsed.unsupported, 2);
  assert.equal(parsed.invalid, 2);
  assert.equal(parsed.file.upcoming.length, 1);
  assert.equal(parsed.file.current.title, "Public video current0001");
  assert.doesNotMatch(writeRoomSessionFile(parsed.file), /SECRET|autoplay|embedUrl|PRIVATE/);
});
test("import plan appends only canonical new upcoming titles and counts current, queued and file duplicates", () => {
  const f = file([
    item("current0001"),
    item("queued00001"),
    item("next0000001"),
    item("next0000001"),
    { ...item("next0000002"), url: "https://youtu.be/next0000002?si=tracking" },
  ]);
  f.played = [item("played00001")];
  f.current = item("prior000001");
  const clean = readRoomSessionFile(JSON.stringify(f)).file,
    plan = previewRoomSessionImport(clean, desc("current0001"), [desc("queued00001")]);
  assert.equal(plan.duplicates, 3);
  assert.equal(plan.slots, 47);
  assert.deepEqual(
    plan.media.map((m) => m.videoId),
    ["next0000001", "next0000002"],
  );
  assert(!plan.media.some((m) => ["played00001", "prior000001"].includes(m.videoId)));
});
test("capacity and unavailable identities are recomputed on every apply plan; the file and room inputs stay immutable", () => {
  const f = file([item("next0000001"), item("next0000002"), item("next0000003")]),
    queue = Array.from({ length: 47 }, (_, i) => desc("q" + String(i).padStart(10, "0"))),
    snapshot = JSON.stringify({ f, queue });
  const plan = previewRoomSessionImport(
    f,
    desc("current0001"),
    queue,
    new Set(["youtube:next0000001"]),
  );
  assert.equal(plan.unavailable, 1);
  assert.equal(plan.full, 1);
  assert.equal(plan.media.length, 1);
  assert.equal(plan.media[0].videoId, "next0000002");
  assert.equal(JSON.stringify({ f, queue }), snapshot);
  const changed = previewRoomSessionImport(f, desc("next0000002"), [...queue, desc("next0000003")]);
  assert.equal(changed.media.length, 0);
  assert.equal(changed.duplicates, 2);
  assert.equal(changed.full, 1);
  const localSlots = previewRoomSessionImport(f, null, Array(48).fill(null));
  assert.equal(localSlots.slots, 0);
  assert.equal(localSlots.full, 3);
  assert.equal(localSlots.media.length, 0);
});
test("re-importing an exported session plans no duplicate queue changes and never restores playback settings", () => {
  const original = buildRoomSessionFile({
    played: [desc("played00001")],
    current: desc("current0001"),
    upcoming: [desc("next0000001"), desc("next0000002")],
  }).file;
  const loaded = readRoomSessionFile(writeRoomSessionFile(original)).file,
    first = previewRoomSessionImport(loaded, desc("current0001"), []);
  assert.equal(first.media.length, 2);
  const second = previewRoomSessionImport(loaded, desc("current0001"), first.media);
  assert.equal(second.media.length, 0);
  assert.equal(second.duplicates, 2);
  assert.equal(sessionItemMedia({ ...item(), live: true }).duration, undefined);
  assert(!("playing" in loaded));
  assert(!("position" in loaded));
  assert(!("autoAdvance" in loaded));
});
