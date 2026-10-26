import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { execFileSync } from "node:child_process";
import {
  validateCorpus,
  evaluateRanking,
  evaluateCorpus,
  evaluateSentinels,
  compareEvaluation,
  corpusHash,
} from "./lib/recommendation-evaluation.mjs";
import { productionRecommendationRanking } from "./lib/recommendation-rankers.mjs";
import { parseEvaluationArgs, runEvaluation } from "./recommendation-evaluation.mjs";
const corpus = JSON.parse(
  await readFile(new URL("../benchmarks/recommendations/corpus.v1.json", import.meta.url), "utf8"),
);
const baseline = JSON.parse(
  await readFile(
    new URL("../benchmarks/recommendations/baseline.v1.json", import.meta.url),
    "utf8",
  ),
);
const entry = (id) => corpus.cases.find((row) => row.id === id);
const fixture = () => structuredClone(corpus);
const freeze = (value) => {
  if (value && typeof value === "object") {
    Object.freeze(value);
    for (const child of Object.values(value)) freeze(child);
  }
  return value;
};
test("synthetic corpus has explicit reasoned judgments and rejects invalid versions, bounds, references and canonical cycles", () => {
  assert.equal(validateCorpus(corpus), corpus);
  assert.equal(corpus.items.length, 62);
  assert.equal(corpus.cases.length, 16);
  assert(corpus.cases.every((row) => row.intent.length > 20));
  for (const mutate of [
    (c) => (c.version = 2),
    (c) => (c.seed = NaN),
    (c) => c.items.push(c.items[0]),
    (c) => c.cases[0].eligibleIds.push("missing"),
    (c) => (c.cases[0].judgments["missing"] = { relevance: 3, reason: "Invalid identity" }),
    (c) => (c.cases[0].judgments["yt-race-new"].relevance = 4),
    (c) => (c.items[0].canonicalId = c.items[0].id),
    (c) => (c.cases[0].k = 100000),
    (c) => (c.cases[0].policy.minNdcg = -1),
  ]) {
    const copy = fixture();
    mutate(copy);
    assert.throws(() => validateCorpus(copy), /Recommendation corpus/);
  }
  assert.equal(corpusHash(corpus), baseline.corpus.sha256);
});
test("graded NDCG and precision match an independently calculated two-title example, including empty wrong output", () => {
  const c = {
    ...entry("youtube-topic-negative"),
    k: 2,
    candidateIds: ["yt-race-new", "yt-race-other"],
    eligibleIds: ["yt-race-new", "yt-race-other"],
    judgments: { "yt-race-new": { relevance: 3 }, "yt-race-other": { relevance: 2 } },
    policy: { minNdcg: 0.9 },
  };
  const reversed = evaluateRanking(corpus, c, ["yt-race-other", "yt-race-new"]);
  assert.equal(reversed.metrics.ndcgAtK, 0.833991);
  assert.equal(reversed.metrics.precisionAtK, 1);
  assert.equal(reversed.metrics.fillRate, 1);
  assert(reversed.checks.some((row) => row.metric === "ndcgAtK" && row.status === "fail"));
  const empty = evaluateRanking(corpus, c, []);
  assert.equal(empty.metrics.ndcgAtK, 0);
  assert.equal(empty.metrics.fillRate, 0);
  assert.equal(empty.metrics.precisionAtK, null);
  assert(empty.checks.some((row) => row.metric === "fillRate" && row.status === "fail"));
});
test("missing judgments and publication dates remain unknown, while ingestion cannot create publication freshness", () => {
  const partial = evaluateRanking(corpus, entry("partial-judgments"), [
    "yt-race-new",
    "yt-date-unknown",
  ]);
  assert.equal(partial.metrics.ndcgAtK, null);
  assert.equal(partial.metrics.unjudgedReturned, 1);
  assert.deepEqual(partial.metrics.missingJudgmentIds, ["yt-date-unknown"]);
  assert.equal(partial.metrics.precisionAtK, 1);
  assert.equal(partial.metrics.unknownPublicationReturned, 1);
  assert(partial.checks.some((row) => row.status === "unmeasured"));
  const freshness = evaluateRanking(corpus, entry("twitch-publication-freshness"), [
    "tw-old-new-import",
    "tw-unknown-date",
  ]);
  assert.equal(freshness.metrics.knownPublicationReturned, 1);
  assert.equal(freshness.metrics.unknownPublicationReturned, 1);
  assert.equal(freshness.metrics.freshShareOfKnown, 0);
  assert.equal(freshness.metrics.meanKnownPublicationAgeDays, 500);
});
test("canonical aliases cannot inflate relevance and are distinct from previous-shelf exposure and negative evidence", () => {
  const row = evaluateRanking(corpus, entry("guide-query-canonical"), [
    "yt-race-new",
    "yt-racing-alias",
    "local-racing",
  ]);
  assert.equal(row.metrics.canonicalRepeatShare, 0.333333);
  assert(row.metrics.ndcgAtK < 1);
  assert(row.checks.some((c) => c.metric === "canonicalRepeatShare" && c.status === "fail"));
  const repeat = evaluateRanking(
    corpus,
    entry("youtube-repeat-exposure"),
    entry("youtube-repeat-exposure").previousShelf,
  );
  assert.equal(repeat.metrics.previousExposureShare, 1);
  assert.equal(repeat.metrics.canonicalRepeatShare, 0);
  assert.equal(repeat.metrics.negativeShare, 0);
  const negative = { ...entry("guide-query-canonical"), negativeIds: ["yt-race-new"] };
  assert.equal(evaluateRanking(corpus, negative, ["yt-racing-alias"]).metrics.negativeShare, 1);
});
test("creator concentration is conditional on actual relevant availability and empty libraries are inapplicable, never perfect relevance", () => {
  const only = entry("single-creator-availability"),
    single = evaluateRanking(corpus, only, only.eligibleIds.slice(0, only.k));
  assert.equal(single.metrics.maxCreatorShare, 1);
  assert.equal(single.metrics.availableRelevantCreators, 1);
  assert.equal(
    single.checks.find((row) => row.metric === "maxCreatorShare").status,
    "not-applicable",
  );
  const empty = evaluateRanking(corpus, entry("empty-eligible-guide"), []);
  assert.equal(empty.metrics.ndcgAtK, null);
  assert.equal(empty.metrics.precisionAtK, null);
  assert(empty.checks.every((row) => row.status === "not-applicable"));
});
test("adversarial rankings independently trip operational-tag, creator, exposure, duplicate and explicit-negative detectors", () => {
  const sentinels = evaluateSentinels(corpus);
  assert.equal(sentinels.length, 5);
  assert(sentinels.every((row) => row.detected));
  const weakened = fixture();
  delete weakened.cases.find((row) => row.id === "guide-operational-facets").policy
    .maxOperationalShare;
  assert.equal(
    evaluateSentinels(weakened).find((row) => row.id === "operational-tags").detected,
    false,
  );
  const invalid = evaluateRanking(corpus, entry("youtube-topic-negative"), [
    "invented",
    "private-racing",
    "yt-rejected",
  ]);
  assert.equal(invalid.violations.length, 3);
  assert.equal(invalid.metrics.ndcgAtK, null);
});
test("production rankers are deterministic, offline and read-only; current artifacts match the reviewed versioned baseline", async () => {
  const input = freeze(fixture()),
    snapshot = JSON.stringify(input),
    originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw Error("Evaluation must stay offline");
  };
  try {
    const first = await evaluateCorpus(input, productionRecommendationRanking),
      second = await evaluateCorpus(input, productionRecommendationRanking);
    assert.deepEqual(first, second);
    assert.equal(JSON.stringify(input), snapshot);
    assert.equal(first.contractViolations, 0);
    assert.equal(compareEvaluation(first, baseline).ok, true);
    assert.equal(
      first.sourceSummary.find((row) => row.source === "redtube").scope,
      "exclusion-only",
    );
    assert.equal(first.sourceSummary.find((row) => row.source === "redtube").meanNdcgAtK, null);
    assert(first.sourceSummary.find((row) => row.source === "youtube").unmeasuredNdcgCases > 0);
    assert(first.quality.unmeasured > 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test("baseline comparison refuses missing/incompatible baselines, changed judgments and altered ranking orders", async () => {
  const current = await evaluateCorpus(corpus, productionRecommendationRanking);
  assert.equal(compareEvaluation(current, null).ok, false);
  assert.equal(compareEvaluation(current, { ...baseline, version: 99 }).ok, false);
  assert.equal(compareEvaluation(current, { ...baseline, cases: [] }).ok, false);
  const changed = structuredClone(current);
  changed.corpus.seed++;
  assert.match(compareEvaluation(changed, baseline).reasons.join(" "), /Corpus, clock or seed/);
  const order = structuredClone(current);
  order.cases[0].top.reverse();
  assert.equal(compareEvaluation(order, baseline).ok, false);
});
test("CLI parsing rejects ambiguous modes and baseline replacement requires an explicit flag", async () => {
  assert.equal(parseEvaluationArgs(["--check"]).check, true);
  assert.throws(() => parseEvaluationArgs(["--record-baseline", "--check"]));
  assert.throws(() => parseEvaluationArgs(["--replace-baseline"]));
  assert.throws(() => parseEvaluationArgs(["--output"]));
  assert.throws(() => parseEvaluationArgs(["--mystery"]));
  const output = resolve("screenshots/recommendation-evaluation-test-" + process.pid + ".json"),
    copy = resolve("screenshots/recommendation-evaluation-test-" + process.pid + "-baseline.json");
  try {
    await assert.rejects(
      runEvaluation({ ...parseEvaluationArgs([]), output: parseEvaluationArgs([]).corpus }),
      /cannot overwrite/,
    );
    await assert.rejects(
      runEvaluation({
        ...parseEvaluationArgs([]),
        output: copy,
        baseline: copy,
        recordBaseline: true,
      }),
      /cannot overwrite/,
    );
    await writeFile(copy, JSON.stringify(baseline));
    await assert.rejects(
      runEvaluation({ ...parseEvaluationArgs([]), baseline: copy, output, recordBaseline: true }),
      /Baseline already exists/,
    );
    assert.deepEqual(JSON.parse(await readFile(copy, "utf8")), baseline);
    const checked = await runEvaluation({ ...parseEvaluationArgs([]), output, check: true });
    assert.equal(checked.regression.ok, true);
    assert.equal(checked.qualityGate.ok, false);
    const absent = await runEvaluation({
      ...parseEvaluationArgs([]),
      output,
      baseline: copy + ".missing",
      check: true,
    });
    assert.equal(absent.regression.ok, false);
    assert.match(absent.regression.reasons[0], /missing or unreadable/);
  } finally {
    await Promise.all([rm(output, { force: true }), rm(copy, { force: true })]);
  }
});
test("CLI exits nonzero for the intentionally strict quality gate and a missing baseline rather than hiding unknowns", async () => {
  const output = resolve("screenshots/recommendation-evaluation-cli-test-" + process.pid + ".json");
  try {
    assert.throws(
      () =>
        execFileSync(
          process.execPath,
          ["scripts/recommendation-evaluation.mjs", "--quality-gate", "--output", output],
          { stdio: "pipe" },
        ),
      (error) => error.status === 1,
    );
    assert.throws(
      () =>
        execFileSync(
          process.execPath,
          [
            "scripts/recommendation-evaluation.mjs",
            "--check",
            "--baseline",
            "benchmarks/recommendations/missing-baseline.json",
            "--output",
            output,
          ],
          { stdio: "pipe" },
        ),
      (error) => error.status === 1,
    );
  } finally {
    await rm(output, { force: true });
  }
});
