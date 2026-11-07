import test from "node:test";
import assert from "node:assert/strict";
import {
  calendarDay,
  defaultSearchDates,
  matchesSearchDates,
  searchDateEvidence,
  validateSearchDates,
} from "./search-dates.ts";
import {
  emptySearchQuery,
  encodeSearchQuery,
  parseSearchQuery,
  removeQueryChip,
} from "./search-query.ts";
import {
  repairYoutubePublication,
  retainYoutubeMetadata,
  youtubePublicationTime,
} from "./youtube-metadata.ts";
import {publicationPeriodLabel} from './search-dates.ts';
import { structuredSearch } from "./structured-search.ts";
import type { LibraryVideo } from "./types";
const video = (extra: Partial<LibraryVideo> = {}): LibraryVideo => ({
  id: "youtube:one",
  name: "Feature",
  folderId: "qa",
  path: "qa",
  mime: "video/mp4",
  extension: "mp4",
  size: 0,
  addedAt: Date.parse("2026-11-03T12:00:00Z"),
  ...extra,
});
const range = { ...defaultSearchDates(), from: "2020-01-01", to: "2020-12-31" };
test("date range round-trips without changing legacy version 1 query fields", () => {
  const q = {
    ...emptySearchQuery(),
    text: "feature",
    tags: ["film"],
    date: { ...range, unknown: "include" as const },
  };
  assert.deepEqual(parseSearchQuery(encodeSearchQuery(q)).query, q);
  assert.deepEqual(removeQueryChip(q, "date"), {
    ...emptySearchQuery(),
    text: "feature",
    tags: ["film"],
  });
  assert.equal(parseSearchQuery("published:.. unknown:only").query.date?.unknown, "only");
  for (const raw of [
    "published:2020-02-30..",
    "published:2021-01-01..2020-01-01",
    "published:.. added:..",
    "published:.. unknown:yes",
    "partial:guess",
    "published:2020..2021",
  ])
    assert(parseSearchQuery(raw).error, raw);
  assert.throws(() => validateSearchDates({ ...range, extra: 1 }));
  assert.throws(() => validateSearchDates({ ...range, field: "download" }));
  assert.equal(calendarDay("2020-02-29"), Date.parse("2020-02-29T00:00:00Z"));
  assert.equal(calendarDay("1900-02-29"), undefined);
});
test("a local video added today and an old provider publication use separate clocks", () => {
  const local = video(),
    old = video({
      addedAt: Date.parse("2012-04-06T00:00:00Z"),
      remote: {
        kind: "youtube",
        publishedSource: "watch",
        publishedPrecision: "day",
        publishedDate: "2012-04-06",
      },
    });
  assert(!matchesSearchDates(local, range));
  assert(!matchesSearchDates(old, range));
  assert(matchesSearchDates(old, { ...range, from: "2012-01-01", to: "2012-12-31" }));
  assert(
    matchesSearchDates(local, { ...range, field: "added", from: "2026-11-03", to: "2026-11-03" }),
  );
  assert.equal(searchDateEvidence(old, "added"), undefined);
  const downloadedToday={...old,addedAt:local.addedAt};
  assert(matchesSearchDates(downloadedToday,{...range,from:'2012-01-01',to:'2012-12-31'}));
  assert(!matchesSearchDates(downloadedToday,{...range,from:'2026-11-03',to:'2026-11-03'}));
  assert.equal(searchDateEvidence(downloadedToday,'added'),undefined);
  const falselyDated = video({ remote: { kind: "youtube" } });
  assert.equal(searchDateEvidence(falselyDated, "published"), undefined);
});
test("unknown, relative, scheduled and unproven clocks remain selectable without fabricated dates", () => {
  for (const row of [
    video(),
    video({ remote: { kind: "youtube", publishedSource: "legacy" } }),
    video({
      remote: {
        kind: "youtube",
        publishedSource: "watch",
        publishedPrecision: "relative",
        publishedLabel: "3 days ago",
      },
    }),
    video({
      remote: {
        kind: "youtube",
        publishedSource: "watch",
        publishedPrecision: "day",
        publishedDate: "2020-02-30",
      },
    }),
    video({ remote: { kind: "youtube", publishedSource: "rss", youtubeType: "upcoming" } }),
  ]) {
    assert(!matchesSearchDates(row, range));
    assert(matchesSearchDates(row, { ...range, unknown: "only" }));
    assert(matchesSearchDates(row, { ...range, unknown: "include" }));
  }
});
test("day and instant precision respect UTC boundaries regardless of viewer timezone", () => {
  const day = video({
    remote: {
      kind: "youtube",
      publishedSource: "watch",
      publishedPrecision: "day",
      publishedDate: "2020-01-01",
    },
  });
  const instant = video({
    addedAt: Date.parse("2020-01-01T23:30:00-05:00"),
    remote: { kind: "youtube", publishedSource: "rss", publishedPrecision: "instant" },
  });
  const first = { ...range, to: "2020-01-01" },
    second = { ...range, from: "2020-01-02", to: "2020-01-02" };
  assert(matchesSearchDates(day, first));
  assert(!matchesSearchDates(day, second));
  assert(!matchesSearchDates(instant, first));
  assert(matchesSearchDates(instant, second));
});

test('legacy exact ISO and provider epochs retain provenance while malformed clocks stay unknown',()=>{
 const row=video({remote:{kind:'youtube',publishedSource:'provider',publishedDate:'2018-07-04T23:30:00-05:00'}});
 assert(matchesSearchDates(row,{...range,from:'2018-07-05',to:'2018-07-05'}));
 assert(!matchesSearchDates(row,{...range,from:'2026-11-03',to:'2026-11-03'}));
 assert.equal(youtubePublicationTime(row),Date.parse('2018-07-04T23:30:00-05:00'));
 assert(searchDateEvidence(video({addedAt:Date.parse('2018-07-04'),remote:{kind:'twitch',publishedSource:'provider'}}),'published'));
 for(const extra of [{addedAt:1e100,remote:{kind:'youtube' as const,publishedSource:'provider' as const}},{remote:{kind:'youtube' as const,publishedSource:'watch' as const,publishedDate:'2020-02-30T12:00:00Z'}},{remote:{kind:'youtube' as const,publishedSource:'provider' as const,publishedDate:'2020'}}])assert.equal(searchDateEvidence(video(extra),'published'),undefined);
});
test("partial years/months overlap ranges, may be excluded, and survive weaker refreshes without becoming exact", () => {
  for (const [precision, publishedDate] of [
    ["year", "2020"],
    ["month", "2020-06"],
  ] as const) {
    const row = video({
        remote: {
          kind: "youtube",
          publishedSource: "provider",
          publishedPrecision: precision,
          publishedDate,
        },
      }),
      before = JSON.stringify(row);
    assert(matchesSearchDates(row, { ...range, from: "2020-06-15", to: "2020-06-15" }));
    assert(!matchesSearchDates(row, { ...range, partial: "exclude" }));
    assert(!matchesSearchDates(row, { ...range, from: "2021-01-01", to: "2021-12-31" }));
    assert.equal(JSON.stringify(row), before);
    assert.equal(youtubePublicationTime(row), 0);
    assert.equal(publicationPeriodLabel(row),`Published ${publishedDate} · ${precision} only`);
    assert.equal(repairYoutubePublication(row).remote?.publishedPrecision, precision);
    const merged = retainYoutubeMetadata(
      row,
      video({ remote: { kind: "youtube", publishedSource: "unknown" } }),
    );
    assert.equal(merged.remote?.publishedDate, publishedDate);
    assert.equal(merged.remote?.publishedPrecision, precision);
    assert.equal(youtubePublicationTime(merged), 0);
  }
});

test('a month observation survives a weaker year response and yields to an exact day',()=>{
 const month=video({remote:{kind:'youtube',publishedSource:'provider',publishedPrecision:'month',publishedDate:'2020-06'}});
 const year=video({remote:{kind:'youtube',publishedSource:'provider',publishedPrecision:'year',publishedDate:'2020'}});
 assert.equal(retainYoutubeMetadata(month,year).remote?.publishedDate,'2020-06');
 const exact=video({addedAt:Date.parse('2020-06-15'),remote:{kind:'youtube',publishedSource:'watch',publishedPrecision:'day',publishedDate:'2020-06-15'}});
 assert.equal(retainYoutubeMetadata(month,exact).remote?.publishedPrecision,'day');
});
test("sparse structured date matching reads only candidate rows and keeps source identity", async () => {
  const rows = [
    video({
      id: "old",
      addedAt: Date.parse("2020-03-01"),
      remote: { kind: "youtube", publishedSource: "rss", publishedPrecision: "instant" },
    }),
    video({ id: "unknown" }),
  ];
  const result = await structuredSearch(
    rows,
    {},
    {},
    "feature published:2020-01-01..2020-12-31",
    new AbortController().signal,
    true,
    async () => ({ ids: ["old", "unknown"], positions: new Uint32Array([0, 1]), videos: rows }),
    async () => {},
  );
  assert.deepEqual(result.ids, ["old"]);
});
