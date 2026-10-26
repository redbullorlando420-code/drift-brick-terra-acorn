import { test } from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
registerHooks({
  resolve(s, c, n) {
    if (s.startsWith("@/"))
      return n(new URL("../src/" + s.slice(2) + ".ts", import.meta.url).href, c);
    try {
      return n(s, c);
    } catch (e) {
      if (s.startsWith(".") && !/\.[a-z]+$/i.test(s)) return n(s + ".ts", c);
      throw e;
    }
  },
});

const meta = await import("../src/lib/videos/youtube-metadata.ts");
const { youtubeWatchPublication } = await import("../src/lib/remote/youtube-publication.ts");
const { catalogCard, withCatalogDetails } = await import("../src/lib/videos/catalog-card.ts");
const { mergeRemoteCatalogAsync } = await import("../src/lib/videos/remote-merge.ts");
const { youtubeCatalogSelection } = await import("../src/lib/videos/youtube-catalog-selection.ts");
const id = "precise0001",
  day = "2026-10-01",
  instant = "2026-10-01T13:14:15Z";
const card = (patch = {}) => ({
  id: "yt:" + id,
  folderId: "yt:creator",
  name: "Date evidence",
  path: "youtube",
  size: 0,
  addedAt: Date.parse(instant),
  mime: "video/youtube",
  extension: "yt",
  remote: {
    kind: "youtube",
    videoId: id,
    publishedSource: "rss",
    publishedPrecision: "instant",
    ...patch,
  },
});
test("listing relative labels are bounded evidence, never inferred epochs; live and upcoming fields do not supply publication", () => {
  assert.deepEqual(
    meta.youtubeRendererMetadata({ publishedTimeText: { simpleText: "2 days ago" } }),
    { publishedLabel: "2 days ago" },
  );
  for (const fields of [{ isLive: true }, { upcomingEventData: { startTime: "1800000000" } }])
    assert.equal(
      meta.youtubeRendererMetadata({
        ...fields,
        publishDate: day,
        publishedTimeText: { simpleText: day },
      }).published,
      undefined,
    );
  assert.equal(meta.cleanYoutubePublishedLabel(" x\n y "), "x y");
  assert.equal(meta.cleanYoutubePublishedLabel("x".repeat(500)).length, 120);
  const relative = {
    ...card({
      publishedPrecision: "relative",
      publishedSource: "unknown",
      publishedLabel: "2 days ago",
    }),
    addedAt: Date.now(),
  };
  assert.equal(meta.youtubePublicationTime(relative), 0);
  assert.equal(meta.youtubePublicationPrecision(relative), "relative");
  assert.equal(
    meta.youtubePublicationPrecision(
      card({ publishedPrecision: "unknown", publishedSource: "unknown" }),
    ),
    "unknown",
  );
});
test("exact day and timestamp precision remain distinct and UTC anchored; malformed instants are rejected", () => {
  const d = {
    ...card({ publishedPrecision: "day", publishedDate: day, publishedSource: "watch" }),
    addedAt: Date.parse(instant),
  };
  assert.equal(meta.youtubePublicationTime(d), Date.parse(day));
  assert.equal(meta.youtubePublicationPrecision(d), "day");
  assert.equal(meta.youtubePublicationPrecision(card()), "instant");
  for (const invalid of [
    "2026-02-30",
    "2026-10-01T24:00:00Z",
    "2026-10-01T12:61:00Z",
    "2 days ago",
  ])
    assert.equal(meta.exactYoutubePublished(invalid), undefined);
});
test("relative, unknown, scheduled and weaker day-only repairs cannot overwrite a known precise publication", () => {
  const old = card();
  for (const patch of [
    { publishedSource: "unknown", publishedPrecision: "relative", publishedLabel: "2 days ago" },
    { publishedSource: "watch", publishedPrecision: "day", publishedDate: day },
    { publishedSource: "watch", youtubeType: "upcoming" },
  ]) {
    const n = meta.retainYoutubeMetadata(old, {
      ...card(patch),
      addedAt: Date.parse("2026-10-25"),
    });
    assert.equal(n.addedAt, old.addedAt);
    assert.equal(n.remote.publishedPrecision, "instant");
    assert.equal(n.remote.publishedDate, undefined);
    assert.equal(n.remote.publishedLabel, undefined);
  }
  const other = meta.retainYoutubeMetadata(old, {
    ...card({ videoId: "another0001", publishedSource: "unknown" }),
    addedAt: 0,
  });
  assert.equal(other.addedAt, 0);
});
test("selected watch repairs require matching canonical identity and can upgrade a day or relative label", () => {
  const old = {
    ...card({
      publishedSource: "unknown",
      publishedPrecision: "relative",
      publishedLabel: "last week",
      publishedLabelAt: 100,
    }),
    addedAt: 0,
  };
  const d = meta.withYoutubePublication(old, id, day);
  assert.equal(d.remote.publishedPrecision, "day");
  assert.equal(d.addedAt, Date.parse(day));
  assert.equal(d.remote.publishedLabel, undefined);
  assert.equal(d.remote.publishedLabelAt, undefined);
  const next = meta.withYoutubePublication(d, id, instant);
  assert.equal(next.remote.publishedPrecision, "instant");
  assert.equal(next.addedAt, Date.parse(instant));
  assert.equal(meta.withYoutubePublication(next, id, day).addedAt, next.addedAt);
  for (const [row, identity, date] of [
    [old, "other000001", day],
    [old, id, "2026-02-30"],
    [card({ youtubeType: "upcoming" }), id, day],
  ])
    assert.throws(() => meta.withYoutubePublication(row, identity, date));
});
test("HTML-only dates require the matching official canonical page, never a recommended watch link or blocked player", () => {
  const value = '<meta itemprop="datePublished" content="' + day + '">',
    canonical = '<link href="https://www.youtube.com/watch?v=' + id + '" rel="canonical">';
  assert.equal(youtubeWatchPublication(canonical + value, id), day);
  for (const html of [
    '<a href="https://www.youtube.com/watch?v=' + id + '">recommended</a>' + value,
    '<link rel="canonical" href="https://example.org/watch?v=' + id + '">' + value,
    '<link rel="canonical" href="https://www.youtube.com/watch?v=other000001">' + value,
  ])
    assert.equal(youtubeWatchPublication(html, id), undefined);
  const response = {
    videoDetails: { videoId: id },
    playabilityStatus: { status: "LOGIN_REQUIRED" },
    microformat: { playerMicroformatRenderer: { publishDate: day } },
  };
  assert.equal(
    youtubeWatchPublication(
      "var ytInitialPlayerResponse = " + JSON.stringify(response) + ";" + canonical + value,
      id,
    ),
    undefined,
  );
});
test("compact/disk/JSON export retain precision, source and label evidence, and sparse refreshes preserve approximate evidence", async () => {
  const relative = {
    ...card({
      publishedSource: "unknown",
      publishedPrecision: "relative",
      publishedLabel: "3 weeks ago",
      publishedLabelAt: 12345,
    }),
    addedAt: 0,
    description: "Saved full description",
  };
  const restored = withCatalogDetails(JSON.parse(JSON.stringify(catalogCard(relative))), relative);
  assert.equal(restored.remote.publishedLabel, "3 weeks ago");
  assert.equal(restored.remote.publishedLabelAt, 12345);
  assert.equal(restored.description, relative.description);
  const sparse = {
    ...card({ publishedSource: "unknown", publishedPrecision: "unknown" }),
    addedAt: 0,
  };
  const merged = (await mergeRemoteCatalogAsync([relative], [sparse]))[0];
  assert.equal(merged.remote.publishedPrecision, "relative");
  assert.equal(merged.remote.publishedLabel, "3 weeks ago");
  const changed = {
    ...relative,
    remote: { ...relative.remote, publishedLabel: "4 weeks ago", publishedLabelAt: 67890 },
  };
  assert.equal(
    (await mergeRemoteCatalogAsync([relative], [changed]))[0].remote.publishedLabel,
    "4 weeks ago",
  );
});
test("overlapping days and unknown labels have stable identity ties across JSON reload and later clocks", async () => {
  const rows = [
    {
      ...card({
        publishedSource: "unknown",
        publishedPrecision: "relative",
        publishedLabel: "2 days ago",
      }),
      id: "relative",
      addedAt: 0,
    },
    {
      ...card({ publishedPrecision: "day", publishedDate: day }),
      id: "day",
      addedAt: Date.parse("2026-10-01T23:00:00Z"),
    },
    { ...card(), id: "instant" },
    {
      ...card({ publishedPrecision: "day", publishedDate: day }),
      id: "day-2",
      addedAt: Date.parse(day),
    },
    {
      ...card({ publishedSource: "unknown", publishedPrecision: "unknown" }),
      id: "unknown",
      addedAt: 0,
    },
  ];
  const select = (rows) =>
    youtubeCatalogSelection(
      {
        videos: rows,
        privateFolders: new Set(),
        hiddenVideos: {},
        unavailable: {},
        hideDemo: false,
      },
      undefined,
      async () => {},
    );
  const ids = (await select(rows)).map((v) => v.id);
  assert.deepEqual((await select([...rows].reverse())).map(v=>v.id),ids,'disk key order cannot change publication ties');
  assert.deepEqual(ids, ["instant", "day", "day-2", "relative", "unknown"]);
  assert.deepEqual(
    (await select(JSON.parse(JSON.stringify(rows)))).map((v) => v.id),
    ids,
  );
  const before = Date.now;
  Date.now = () => before() + 90 * 86400000;
  try {
    assert.deepEqual(
      (await select(rows)).map((v) => v.id),
      ids,
    );
  } finally {
    Date.now = before;
  }
});

test("day precision and stable ordering use identical epochs under opposite device time zones", async () => {
  const { execFileSync } = await import("node:child_process");
  const moduleUrl = new URL("../src/lib/videos/youtube-metadata.ts", import.meta.url).href;
  const code =
    "import {youtubePublicationTime} from " +
    JSON.stringify(moduleUrl) +
    ";const row=" +
    JSON.stringify({
      ...card({ publishedPrecision: "day", publishedDate: day, publishedSource: "watch" }),
      addedAt: Date.parse(instant),
    }) +
    ";process.stdout.write(String(youtubePublicationTime(row)));";
  const values = ["Pacific/Kiritimati", "America/Los_Angeles"].map((TZ) =>
    execFileSync(process.execPath, ["--input-type=module", "-e", code], {
      env: { ...process.env, TZ },
      encoding: "utf8",
    }),
  );
  assert.deepEqual(values, [String(Date.parse(day)), String(Date.parse(day))]);
});
