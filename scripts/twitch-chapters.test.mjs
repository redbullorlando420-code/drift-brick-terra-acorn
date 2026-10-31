import test from "node:test";
import assert from "node:assert/strict";
import {
  createTwitchChapterReader,
  parseTwitchChapters,
  twitchVodChapterId,
  twitchChapterEmbed,
  twitchChapterUrl,
  readTwitchChapterReport,
} from "../src/lib/remote/twitch-chapters.ts";
const payload = (id = "42", edges = []) => ({
  data: {
    video: { id, lengthSeconds: 10000, moments: { edges: edges.map((node) => ({ node })) } },
  },
});
const marker = (start, length, label) => ({
  positionMilliseconds: start,
  durationMilliseconds: length,
  description: label,
});
test('untrusted browser reports cannot supply malformed labels, timestamps or unbounded rows',()=>{
  const valid=parseTwitchChapters('42',payload('42',[marker(0,1000,'Game')]),1);
  assert.deepEqual(readTwitchChapterReport('42',valid),valid);
  for(const r of [{...valid,videoId:'other'},{...valid,note:{}},{...valid,chapters:[{start:0,end:1,label:{bad:true}}]},{...valid,chapters:Array(201).fill(valid.chapters[0])}])assert.throws(()=>readTwitchChapterReport('42',r));
});
test("only VOD identities expose chapter navigation; clips and live are excluded", () => {
  const vod = {
    id: "tw:v:42",
    extension: "vod",
    remote: { kind: "twitch", videoId: "42", live: false },
  };
  assert.equal(twitchVodChapterId(vod), "42");
  for (const v of [
    { ...vod, extension: "clip" },
    { ...vod, id: "tw:c:42" },
    { ...vod, remote: { ...vod.remote, live: true } },
    { ...vod, remote: { ...vod.remote, videoId: "slug" } },
    { ...vod, remote: { ...vod.remote, kind: "youtube" } },
  ])
    assert.equal(twitchVodChapterId(v), null);
});
test("real marker bounds, ordering, labels and overlaps are validated without invented fallback chapters", () => {
  const report = parseTwitchChapters(
    "42",
    payload("42", [
      marker(60000, 10000, "Game B"),
      marker(0, 60000, "Game A"),
      marker(0, 1000, "duplicate"),
      marker(-1, 10, "invalid"),
      marker(80000, 1, ""),
      marker(12000000, 10, "outside"),
    ]),
    1,
  );
  assert.deepEqual(
    report.chapters.map((c) => c.label),
    ["Game A", "Game B"],
  );
  assert.equal(report.rejected, 4);
  assert.equal(parseTwitchChapters("42", payload()).state, "empty");
  for (const raw of [
    { errors: [{ message: "denied" }] },
    payload("other"),
    payload("42", [marker(0, -1, "bad")]),
    payload(
      "42",
      Array.from({ length: 201 }, () => marker(0, 1, "too many")),
    ),
  ])
    assert.throws(() => parseTwitchChapters("42", raw));
});
test("selected public detail reads coalesce and retain at most eight cache entries, with bounded in-flight work and expiry", async () => {
  let calls = 0,
    time = 1,
    release;
  const gate = new Promise((r) => (release = r));
  const read = createTwitchChapterReader(
    async (id) => {
      calls++;
      await gate;
      return payload(id);
    },
    () => time,
  );
  const first = read("1"),
    same = read("1");
  const held = Array.from({ length: 7 }, (_, i) => read(String(i + 2)));
  assert.equal((await read("9")).state, "unavailable");
  release();
  await Promise.all([first, same, ...held]);
  assert.equal(calls, 8);
  await read("1");
  assert.equal(calls, 8);
  await read("9");
  await read("1");
  assert.equal(calls, 10);
  time += 600001;
  await read("1");
  assert.equal(calls, 11);
  await assert.rejects(read("invalid"));
});
test("provider errors remain explicit, never return arbitrary provider text and can be retried deliberately", async () => {
  let calls = 0;
  const read = createTwitchChapterReader(async (id) => {
    if (++calls === 1) throw Error("SECRET_COOKIE");
    return payload(id);
  });
  assert.equal((await read("42")).state, "unavailable");
  assert.equal((await read("42")).state, "empty");
  assert.equal(calls, 2);
});
test("timestamp navigation changes only numeric VOD embed start time and uses a canonical external fallback", () => {
  assert.equal(twitchChapterUrl("42", 3661), "https://www.twitch.tv/videos/42?t=1h1m1s");
  const embed = "https://player.twitch.tv/?video=v42&parent=example.test&autoplay=true";
  const next = new URL(twitchChapterEmbed(embed, 65));
  assert.equal(next.searchParams.get("time"), "0h1m5s");
  assert.equal(next.searchParams.get("parent"), "example.test");
  for (const value of [
    "https://player.twitch.tv/?channel=test",
    "https://clips.twitch.tv/embed?clip=a",
    "https://evil.test/?video=v42",
  ])
    assert.equal(twitchChapterEmbed(value, 5), value);
  assert.throws(() => twitchChapterUrl("42", Infinity));
  assert.throws(() => twitchChapterUrl("slug", 1));
});
