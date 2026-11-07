import { test } from "node:test";
import assert from "node:assert/strict";
import { movieRequest, parseYoutubeMovies, moviePoster, movieWatchUrl } from "./youtube-movies.ts";
const renderer = (id = "abcdefghijk", extra = {}) => ({
  videoId: id,
  title: { simpleText: "A real film" },
  lengthText: { simpleText: "1:42:03" },
  metadata: { simpleText: "Drama • 2024" },
  thumbnail: { thumbnails: [{ url: "https://i.ytimg.com/vi/" + id + "/movieposter.jpg" }] },
  badges: [{ metadataBadgeRenderer: { style: "BADGE_STYLE_TYPE_YPC", label: "Buy or rent" } }],
  ...extra,
});
test("dedicated film evidence survives projection, excluding long ordinary videos, shows, ads and duplicate cards", () => {
  const r = renderer(),
    result = parseYoutubeMovies(
      {
        contents: {
          items: [
            { gridMovieRenderer: r },
            { movieRenderer: { ...r, videoId: 12345678901 } },
            { movieRenderer: renderer("abcdefghij9", { title: { simpleText: 123 } }) },
            { movieRenderer: r },
            { videoRenderer: renderer("abcdefghij2") },
            { gridShowRenderer: renderer("abcdefghij3") },
            { adSlotRenderer: { movieRenderer: renderer("abcdefghij4") } },
          ],
        },
      },
      "US",
      123,
    );
  assert.equal(result.movies.length, 1);
  assert.deepEqual(result.movies[0], {
    id: "abcdefghijk",
    title: "A real film",
    seconds: 6123,
    year: 2024,
    metadata: "Drama • 2024",
    description: "",
    rating: "",
    offer: "Buy or rent",
    poster: "https://i.ytimg.com/vi/abcdefghijk/movieposter.jpg",
    region: "US",
    observedAt: 123,
  });
});
test("unknown runtime and offers stay unknown, short clips excluded and movie metadata cannot supply entitlement", () => {
  const result = parseYoutubeMovies(
    {
      contents: [
        {
          movieRenderer: renderer("abcdefghij1", {
            lengthText: undefined,
            badges: {},
            thumbnail: { thumbnails: {} },
          }),
        },
        { movieRenderer: renderer("abcdefghij2", { lengthText: { simpleText: "10:00" } }) },
        { movieRenderer: renderer("abcdefghij3", { lengthText: { simpleText: "12:99" } }) },
      ],
    },
    "GB",
  );
  assert.equal(result.movies.length, 2);
  assert.equal(result.movies[0].seconds, null);
  assert.equal(result.movies[0].offer, "Offer not supplied");
  assert.equal(result.movies[1].seconds, null);
});
test("search metadata, rating and explicit free offer use provider evidence only", () => {
  const result = parseYoutubeMovies(
    {
      contents: {
        movieRenderer: renderer("abcdefghij1", {
          metadata: undefined,
          topMetadataItems: [{ simpleText: "Sci-fi • 2021" }],
          badges: [
            { metadataBadgeRenderer: { style: "BADGE_STYLE_TYPE_YPC", label: "Free with ads" } },
            { metadataBadgeRenderer: { label: "PG-13" } },
          ],
        }),
      },
    },
    "AU",
  );
  assert.equal(result.movies[0].year, 2021);
  assert.equal(result.movies[0].rating, "PG-13");
  assert.equal(result.movies[0].offer, "Free with ads");
});
test("only movie shelves are promoted and next pages exclude unrelated sidebar commands", () => {
  const result = parseYoutubeMovies(
    {
      contents: {
        items: [
          {
            shelfRenderer: {
              title: { simpleText: "Films" },
              endpoint: { browseEndpoint: { browseId: "FEstorefront", params: "movie-params" } },
              content: {
                horizontalMovieListRenderer: { items: [{ gridMovieRenderer: renderer() }] },
              },
            },
          },
          {
            shelfRenderer: {
              title: { simpleText: "TV" },
              endpoint: { browseEndpoint: { browseId: "FEstorefront", params: "tv" } },
              content: { horizontalListRenderer: { items: [] } },
            },
          },
          {
            continuationItemRenderer: {
              continuationEndpoint: { continuationCommand: { token: "next" } },
            },
          },
        ],
      },
      sidebar: {
        continuationItemRenderer: {
          continuationEndpoint: { continuationCommand: { token: "wrong" } },
        },
      },
    },
    "US",
  );
  assert.deepEqual(result.shelves, [{ title: "Films", params: "movie-params" }]);
  assert.equal(result.continuation, "next");
});
test("continuation responses parse film-only cards, not raw watch commands", () => {
  const result = parseYoutubeMovies(
    {
      onResponseReceivedCommands: [
        {
          appendContinuationItemsAction: {
            continuationItems: [
              { movieRenderer: renderer() },
              {
                continuationItemRenderer: {
                  continuationEndpoint: { continuationCommand: { token: "next2" } },
                },
              },
            ],
          },
        },
      ],
    },
    "US",
  );
  assert.equal(result.movies.length, 1);
  assert.equal(result.continuation, "next2");
  assert.throws(() => parseYoutubeMovies({ error: {} }, "US"), /unreadable/);
});
test("input and public links reject arbitrary hosts, raw provider tokens and unsupported regions", () => {
  assert.deepEqual(movieRequest({ mode: "search", region: "US", query: " Dune " }), {
    mode: "search",
    region: "US",
    query: "Dune",
  });
  for (const r of [
    { mode: "search", region: "US", query: "" },
    { mode: "catalog", region: "ZZ", query: "" },
    { mode: "search", region: "US", query: "x".repeat(121) },
    { mode: "catalog", region: "US", query: "", page: "https://example.com" },
  ])
    assert.throws(() => movieRequest(r));
  for (const u of [
    "http://i.ytimg.com/a",
    "https://i.ytimg.com.evil.test/a",
    "https://user@i.ytimg.com/a",
    "javascript:alert(1)",
  ])
    assert.equal(moviePoster(u), "");
  assert.equal(movieWatchUrl("abcdefghijk"), "https://www.youtube.com/watch?v=abcdefghijk");
});
test("projection bounds results without retaining tracking or service endpoints", () => {
  const result = parseYoutubeMovies(
    {
      contents: Array.from({ length: 200 }, (_, i) => ({
        movieRenderer: renderer(String(i).padStart(11, "0"), {
          trackingParams: "secret",
          navigationEndpoint: { url: "secret" },
        }),
      })),
    },
    "US",
  );
  assert.equal(result.movies.length, 64);
  assert(!JSON.stringify(result).includes("secret"));
});
