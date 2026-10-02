import { test } from "node:test";
import assert from "node:assert/strict";
import {
  INTEREST_MULTIPLIERS, interestMultiplier, rankingTags,
  confidenceAdjustedPreference,
  normalizeRating,
  personalRankBreakdown,
  personalRankScore,
  ratingAdjustedScore,
  ratingMultiplier,
  ratingPreference,
  topicPreferenceScore,
} from "./ranking-core.ts";

test("original rating meanings survive normalization and unrated evidence stays neutral", () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5].map(ratingPreference), [0, -3, 0, 1, 2, 3]);
  assert.equal(ratingMultiplier(0), 1);
  assert.equal(ratingMultiplier(2), 1);
  assert.equal(normalizeRating(NaN), 0);
  assert.equal(normalizeRating(Infinity), 0);
  assert.equal(normalizeRating(90), 5);
  assert.equal(normalizeRating(-1), 0);
});
test("increasing positive ratings always improves positive and negative evidence scores", () => {
  for (const base of [-200, -20, 0, 20, 200])
    for (const weight of [12, 6, 2]) {
      const scores = [1, 2, 3, 4, 5].map((r) => ratingAdjustedScore(base, r, weight));
      assert.ok(
        scores.every((value, index) => index === 0 || value > scores[index - 1]!),
        String(base),
      );
      assert.equal(ratingAdjustedScore(base, 0), base);
    }
});
test("bounded incidental signals cannot overpower an explicit dislike or grow without limit", () => {
  const maximum = {
    favorite: true,
    liked: true,
    watch: 1e9,
    plays: 1e9,
    marks: 1e9,
    topics: 1e9,
    creatorAffinity: 1e9,
    creatorLiked: true,
    creatorRating: 5,
    freshness: 1e9,
  };
  assert.ok(personalRankScore({ ...maximum, rating: 1 }) < personalRankScore({ rating: 0 }));
  assert.equal(
    personalRankScore({ ...maximum, rating: 5 }),
    personalRankScore({
      ...maximum,
      rating: 5,
      watch: 12,
      plays: 1e6,
      marks: 1e6,
      topics: 12,
      creatorAffinity: 8,
      freshness: 1,
    }),
  );
  assert.ok(
    Number.isFinite(personalRankScore({ rating: NaN, watch: NaN, plays: -1, marks: Infinity })),
  );
});
test("fast scoring exactly agrees with the inspectable formula across feedback combinations", () => {
  for (let i = 0; i < 1000; i++) {
    const row = {
      rating: i % 6,
      favorite: i % 2 === 0,
      liked: i % 3 === 0,
      watch: i % 20,
      plays: i % 50,
      marks: i % 17,
      topics: i % 24,
      creatorAffinity: i % 11,
      creatorLiked: i % 4 === 0,
      creatorRating: i % 6,
      freshness: (i % 20) / 10,
    };
    assert.equal(personalRankScore(row), personalRankBreakdown(row).score);
  }
});
test("sparse topics have limited confidence; neutral or negative ratings do not become positive votes", () => {
  assert.equal(confidenceAdjustedPreference(3, 1), 0.75);
  assert.ok(confidenceAdjustedPreference(30, 10) > confidenceAdjustedPreference(3, 1));
  assert.equal(confidenceAdjustedPreference(0, 0), 0);
  assert.ok(topicPreferenceScore(-3, 1, false) < 0);
  assert.equal(topicPreferenceScore(0, 0, true), 12);
  assert.equal(confidenceAdjustedPreference(3, NaN), 1);
});

test("learned dislikes remain negative and bounded in personal scoring", () => {
  const neutral = personalRankScore({ rating: 0 });
  assert.ok(personalRankScore({ rating: 0, topics: -5, creatorAffinity: -4 }) < neutral);
  assert.equal(
    personalRankScore({ rating: 5, topics: -1e9, creatorAffinity: -1e9 }),
    personalRankScore({ rating: 5, topics: -12, creatorAffinity: -8 }),
  );
  const signals = { rating: 5, topics: -9, creatorAffinity: -4 };
  assert.equal(personalRankScore(signals), personalRankBreakdown(signals).score);
});

test('every explicit positive interest family boosts equally rated titles and combined boosts saturate', () => {
  const neutral = personalRankScore({ rating: 4 });
  for (const signals of [{ liked: true }, { favorite: true }, { topics: 6 }, { tagHearts: 1 }, { creatorLiked: true }, { creatorFavorite: true }, { marks: 1 }, { watch: 4 }]) {
    assert.ok(personalRankScore({ rating: 4, ...signals }) > neutral, JSON.stringify(signals));
  }
  assert.equal(interestMultiplier({ liked: true, favorite: true, topics: 12, tagHearts: 3, creatorLiked: true, creatorFavorite: true, marks: 1e9, watch: 12 }), INTEREST_MULTIPLIERS.maximum);
  assert.ok(personalRankScore({ rating: 5, favorite: true }) > personalRankScore({ rating: 2, favorite: true }));
  const tags = ['source-youtube', 'creator-a', 'keyword-technology', ' TECHNOLOGY ', 'science', 'https://example.com'];
  assert.deepEqual(rankingTags(tags), ['technology', 'science']);
  assert.equal(rankingTags(tags), rankingTags(tags));
});
