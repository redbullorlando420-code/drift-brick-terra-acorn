import { createHash } from "node:crypto";
export const EVALUATION_VERSION = 1;
const SOURCES = ["local", "youtube", "twitch", "redtube"],
  RANKERS = ["youtube", "twitch", "guide", "guide-query"];
const fraction = (n) => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 1;
const unique = (values) => new Set(values).size === values.length;
const round = (n) => (n === null ? null : Math.round(n * 1e6) / 1e6);
export function validateCorpus(corpus) {
  const fail = (message) => {
    throw Error("Recommendation corpus: " + message);
  };
  if (corpus?.format !== "realhub-recommendation-corpus" || corpus.version !== 1)
    fail("unsupported format/version");
  if (
    !Number.isSafeInteger(corpus.now) ||
    corpus.now <= 0 ||
    !Number.isSafeInteger(corpus.seed) ||
    !Array.isArray(corpus.items) ||
    !corpus.items.length ||
    corpus.items.length > 5000 ||
    !Array.isArray(corpus.cases) ||
    !corpus.cases.length ||
    corpus.cases.length > 128
  )
    fail("invalid bounds or fixed clock/seed");
  const items = new Map();
  for (const row of corpus.items) {
    if (
      !row ||
      typeof row.id !== "string" ||
      !/^[-\w]{1,100}$/.test(row.id) ||
      items.has(row.id) ||
      !SOURCES.includes(row.source) ||
      typeof row.creator !== "string" ||
      !row.creator.trim() ||
      row.creator.length > 100 ||
      typeof row.title !== "string" ||
      row.title.length > 300 ||
      !Array.isArray(row.tags) ||
      row.tags.length > 80 ||
      row.tags.some((t) => typeof t !== "string" || t.length > 120) ||
      !Array.isArray(row.topics) ||
      row.topics.some((t) => typeof t !== "string" || t.length > 120) ||
      !(
        row.publishedDaysAgo === null ||
        (Number.isFinite(row.publishedDaysAgo) &&
          row.publishedDaysAgo >= 0 &&
          row.publishedDaysAgo <= 36500)
      ) ||
      (row.addedDaysAgo !== undefined &&
        (!Number.isFinite(row.addedDaysAgo) || row.addedDaysAgo < 0))
    )
      fail("invalid/duplicate item " + row?.id);
    items.set(row.id, row);
  }
  for (const row of items.values()) {
    const seen = new Set([row.id]);
    let current = row;
    while (current.canonicalId) {
      if (
        !items.has(current.canonicalId) ||
        items.get(current.canonicalId).source !== row.source ||
        seen.has(current.canonicalId)
      )
        fail("invalid/cyclic canonical identity " + row.id);
      seen.add(current.canonicalId);
      current = items.get(current.canonicalId);
    }
  }
  const ids = new Set();
  for (const entry of corpus.cases) {
    if (
      !entry ||
      typeof entry.id !== "string" ||
      ids.has(entry.id) ||
      !RANKERS.includes(entry.ranker) ||
      typeof entry.intent !== "string" ||
      entry.intent.length < 20 ||
      !Number.isInteger(entry.k) ||
      entry.k < 1 ||
      entry.k > 50 ||
      !Array.isArray(entry.candidateIds) ||
      !unique(entry.candidateIds) ||
      entry.candidateIds.some((id) => !items.has(id)) ||
      !Array.isArray(entry.eligibleIds) ||
      !unique(entry.eligibleIds) ||
      entry.eligibleIds.some((id) => !entry.candidateIds.includes(id))
    )
      fail("invalid case " + entry?.id);
    ids.add(entry.id);
    for (const key of ["signalIds", "negativeIds", "operationalOnlyIds", "previousShelf"])
      if (
        entry[key] !== undefined &&
        (!Array.isArray(entry[key]) ||
          !unique(entry[key]) ||
          entry[key].some((id) => !items.has(id)))
      )
        fail("invalid " + key + " in " + entry.id);
    if (
      entry.ranker === "guide-query" &&
      (typeof entry.prompt !== "string" || !entry.prompt || entry.prompt.length > 500)
    )
      fail("query missing for " + entry.id);
    if (!entry.judgments || typeof entry.judgments !== "object" || Array.isArray(entry.judgments))
      fail("judgments missing for " + entry.id);
    for (const [id, judgment] of Object.entries(entry.judgments))
      if (
        !entry.candidateIds.includes(id) ||
        !Number.isInteger(judgment?.relevance) ||
        judgment.relevance < 0 ||
        judgment.relevance > 3 ||
        typeof judgment.reason !== "string" ||
        judgment.reason.length < 12
      )
        fail("invalid judgment " + entry.id + "/" + id);
    const input = new Set([...entry.candidateIds, ...(entry.signalIds ?? [])]),
      feedback = entry.feedback ?? {};
    for (const key of ["favorites", "likes", "history", "hidden", "unavailable"])
      if (
        feedback[key] !== undefined &&
        (!Array.isArray(feedback[key]) || feedback[key].some((id) => !input.has(id)))
      )
        fail("invalid feedback " + key + " in " + entry.id);
    for (const key of ["ratings", "watchScores", "viewCounts"])
      for (const [id, value] of Object.entries(feedback[key] ?? {}))
        if (
          !input.has(id) ||
          !Number.isFinite(value) ||
          value < 0 ||
          (key === "ratings" && value > 5)
        )
          fail("invalid " + key + " in " + entry.id);
    for (const [key, value] of Object.entries(entry.policy ?? {}))
      if (
        ![
          "minNdcg",
          "maxCreatorShare",
          "maxOperationalShare",
          "maxNegativeShare",
          "maxCanonicalRepeatShare",
          "minFreshShare",
          "maxExposureShare",
          "minFill",
        ].includes(key) ||
        !fraction(value)
      )
        fail("invalid quality policy " + entry.id + "/" + key);
  }
  return corpus;
}
export function corpusHash(corpus) {
  return createHash("sha256").update(JSON.stringify(corpus)).digest("hex");
}
export function canonicalKey(items, id) {
  let row = items.get(id);
  if (!row) return;
  while (row.canonicalId) row = items.get(row.canonicalId);
  return row.source + ":" + row.id;
}
const dcg = (grades) =>
  grades.reduce((sum, grade, index) => sum + (2 ** grade - 1) / Math.log2(index + 2), 0);
function relevanceMetrics(entry, items, top, pool) {
  const uniquePool = new Map();
  for (const id of pool) {
    const grade = entry.judgments[id]?.relevance,
      key = canonicalKey(items, id);
    if (grade !== undefined) uniquePool.set(key, Math.max(uniquePool.get(key) ?? 0, grade));
  }
  const unjudgedPool = pool.filter((id) => entry.judgments[id] === undefined),
    unjudgedTop = top.filter((id) => entry.judgments[id] === undefined),
    judgedTop = top.filter((id) => entry.judgments[id] !== undefined),
    seen = new Set();
  const poolKeys = new Set(pool.map((id) => canonicalKey(items, id)));
  const grades = top.map((id) => {
    const key = canonicalKey(items, id);
    if (seen.has(key) || !poolKeys.has(key)) return 0;
    seen.add(key);
    return entry.judgments[id]?.relevance ?? 0;
  });
  const ideal = [...uniquePool.values()].sort((a, b) => b - a).slice(0, entry.k),
    idcg = dcg(ideal);
  return {
    ndcgAtK:
      unjudgedPool.length || unjudgedTop.length || top.some((id) => !items.has(id)) || !idcg
        ? null
        : round(dcg(grades) / idcg),
    relevantReturned: judgedTop.filter((id) => entry.judgments[id].relevance >= 2).length,
    precisionAtK: judgedTop.length
      ? round(
          judgedTop.filter((id) => entry.judgments[id].relevance >= 2).length / judgedTop.length,
        )
      : null,
    judgedReturned: judgedTop.length,
    unjudgedReturned: unjudgedTop.length,
    missingJudgmentIds: unjudgedPool,
    idealRelevant: ideal.filter((grade) => grade >= 2).length,
  };
}
export function evaluateRanking(corpus, entry, rankedIds) {
  if (
    !Array.isArray(rankedIds) ||
    rankedIds.length > 5000 ||
    rankedIds.some((id) => typeof id !== "string")
  )
    throw Error("Invalid ranking output for " + entry.id);
  const items = new Map(corpus.items.map((row) => [row.id, row])),
    top = rankedIds.slice(0, entry.k),
    eligible = new Set(entry.eligibleIds),
    violations = [];
  for (const id of top) {
    if (!items.has(id) || !entry.candidateIds.includes(id))
      violations.push({ kind: "unexpected-result", id });
    else if (!eligible.has(id)) violations.push({ kind: "excluded-result", id });
  }
  const keys = top.map((id) => canonicalKey(items, id) ?? "unknown:" + id),
    canonicalDuplicates = keys.length - new Set(keys).size;
  const creators = new Map(),
    providers = new Map();
  for (const id of top) {
    const item = items.get(id);
    if (!item) continue;
    const creator = item.source + ":" + item.creator;
    creators.set(creator, (creators.get(creator) ?? 0) + 1);
    providers.set(item.source, (providers.get(item.source) ?? 0) + 1);
  }
  const previous = new Set((entry.previousShelf ?? []).map((id) => canonicalKey(items, id))),
    negative = new Set((entry.negativeIds ?? []).map((id) => canonicalKey(items, id))),
    operational = new Set(entry.operationalOnlyIds ?? []);
  const relevantCreators = new Set(
    entry.eligibleIds
      .filter((id) => (entry.judgments[id]?.relevance ?? 0) >= 2)
      .map((id) => items.get(id).source + ":" + items.get(id).creator),
  );
  const known = top.filter((id) => items.has(id) && items.get(id).publishedDaysAgo !== null),
    fresh = known.filter((id) => items.get(id).publishedDaysAgo <= 30),
    target = Math.min(
      entry.k,
      new Set(entry.eligibleIds.map((id) => canonicalKey(items, id))).size,
    );
  const metrics = {
    ...relevanceMetrics(entry, items, top, entry.eligibleIds),
    returned: top.length,
    requested: entry.k,
    fillableSlots: target,
    fillRate: target
      ? round(
          new Set(top.filter((id) => eligible.has(id)).map((id) => canonicalKey(items, id))).size /
            target,
        )
      : null,
    maxCreatorShare: top.length ? round(Math.max(0, ...creators.values()) / top.length) : null,
    distinctCreators: creators.size,
    availableRelevantCreators: relevantCreators.size,
    canonicalRepeatShare: top.length ? round(canonicalDuplicates / top.length) : null,
    previousExposureShare:
      entry.previousShelf?.length && top.length
        ? round(keys.filter((key) => previous.has(key)).length / top.length)
        : null,
    negativeShare: top.length
      ? round(top.filter((id) => negative.has(canonicalKey(items, id))).length / top.length)
      : null,
    operationalOnlyShare: top.length
      ? round(top.filter((id) => operational.has(id)).length / top.length)
      : null,
    knownPublicationReturned: known.length,
    unknownPublicationReturned: top.filter(
      (id) => items.has(id) && items.get(id).publishedDaysAgo === null,
    ).length,
    freshShareOfKnown: known.length ? round(fresh.length / known.length) : null,
    meanKnownPublicationAgeDays: known.length
      ? round(known.reduce((sum, id) => sum + items.get(id).publishedDaysAgo, 0) / known.length)
      : null,
    providerShare: Object.fromEntries(
      [...providers]
        .sort()
        .map(([source, count]) => [source, round(count / Math.max(top.length, 1))]),
    ),
  };
  const checks = [],
    policy = { minFill: 1, ...entry.policy };
  const check = (metric, value, limit, direction, reason) => {
    reason = reason ?? (target === 0 ? "No eligible candidates exist." : undefined);
    checks.push({
      metric,
      value,
      limit,
      status: reason
        ? "not-applicable"
        : value === null
          ? "unmeasured"
          : (direction === "min" ? value + 1e-6 >= limit : value - 1e-6 <= limit)
            ? "pass"
            : "fail",
      ...(reason ? { reason } : {}),
    });
  };
  check(
    "fillRate",
    metrics.fillRate,
    policy.minFill,
    "min",
    target === 0 ? "No eligible candidates exist." : undefined,
  );
  for (const [key, metric, direction] of [
    ["minNdcg", "ndcgAtK", "min"],
    ["maxCreatorShare", "maxCreatorShare", "max"],
    ["maxOperationalShare", "operationalOnlyShare", "max"],
    ["maxNegativeShare", "negativeShare", "max"],
    ["maxCanonicalRepeatShare", "canonicalRepeatShare", "max"],
    ["minFreshShare", "freshShareOfKnown", "min"],
    ["maxExposureShare", "previousExposureShare", "max"],
  ])
    if (policy[key] !== undefined)
      check(
        metric,
        metrics[metric],
        policy[key],
        direction,
        key === "maxCreatorShare" && relevantCreators.size < 2
          ? "Fewer than two relevant creators are available."
          : undefined,
      );
  if (metrics.missingJudgmentIds.length)
    checks.push({
      metric: "judgmentCoverage",
      value: null,
      limit: 1,
      status: "unmeasured",
      reason: "Missing judgments: " + metrics.missingJudgmentIds.join(", "),
    });
  const perSource = SOURCES.map((source) => {
    const candidates = entry.candidateIds.filter((id) => items.get(id).source === source),
      pool = entry.eligibleIds.filter((id) => items.get(id).source === source),
      output = top.filter((id) => items.get(id)?.source === source),
      dated = output.filter((id) => items.get(id).publishedDaysAgo !== null);
    return {
      source,
      candidates: candidates.length,
      eligible: pool.length,
      returned: output.length,
      ...relevanceMetrics(entry, items, output, pool),
      knownPublicationReturned: dated.length,
      unknownPublicationReturned: output.length - dated.length,
      freshShareOfKnown: dated.length
        ? round(dated.filter((id) => items.get(id).publishedDaysAgo <= 30).length / dated.length)
        : null,
    };
  });
  return {
    id: entry.id,
    ranker: entry.ranker,
    intent: entry.intent,
    top,
    metrics,
    perSource,
    checks,
    violations,
  };
}
export async function evaluateCorpus(corpus, rank) {
  validateCorpus(corpus);
  const cases = [];
  for (const entry of corpus.cases)
    cases.push(evaluateRanking(corpus, entry, await rank(corpus, entry)));
  const sourceSummary = SOURCES.map((source) => {
    const rows = cases
        .map((entry) => entry.perSource.find((row) => row.source === source))
        .filter((row) => row.candidates > 0 || row.returned > 0),
      measured = rows.filter((row) => row.ndcgAtK !== null),
      judged = rows.reduce((sum, row) => sum + row.judgedReturned, 0),
      relevant = rows.reduce((sum, row) => sum + row.relevantReturned, 0);
    return {
      source,
      scope: source === "redtube" ? "exclusion-only" : "synthetic-case-weighted",
      cases: rows.length,
      eligibleSlots: rows.reduce((sum, row) => sum + row.eligible, 0),
      returnedSlots: rows.reduce((sum, row) => sum + row.returned, 0),
      judgedReturned: judged,
      unjudgedReturned: rows.reduce((sum, row) => sum + row.unjudgedReturned, 0),
      precisionAtK: judged ? round(relevant / judged) : null,
      meanNdcgAtK: measured.length
        ? round(measured.reduce((sum, row) => sum + row.ndcgAtK, 0) / measured.length)
        : null,
      measuredNdcgCases: measured.length,
      unmeasuredNdcgCases: rows.filter((row) => row.eligible > 0 && row.ndcgAtK === null).length,
    };
  });
  const counts = { pass: 0, fail: 0, unmeasured: 0, "not-applicable": 0 };
  for (const row of cases) for (const check of row.checks) counts[check.status]++;
  return {
    format: "realhub-recommendation-evaluation",
    version: EVALUATION_VERSION,
    corpus: {
      version: corpus.version,
      sha256: corpusHash(corpus),
      items: corpus.items.length,
      cases: corpus.cases.length,
      fixedNow: corpus.now,
      seed: corpus.seed,
    },
    scope:
      "Synthetic relevance judgments and regression signals, not user satisfaction, provider throughput or a real-library audit.",
    method: {
      relevance:
        "NDCG uses graded gains 2^grade-1 and unique canonical eligible candidates; incomplete judgments produce null.",
      precision:
        "Grade >= 2 among judged returned slots; fill is measured separately. Missing judgments are never negative votes.",
      freshness:
        "Publication age only, <=30 days; unknown dates are excluded from the denominator and counted separately.",
      diversity:
        "Maximum share by source+creator; the limit is inapplicable with fewer than two relevant creators.",
      exposure:
        "Previous synthetic shelf overlap is distinct from viewing history; no production exposure ledger is created.",
    },
    quality: counts,
    sourceSummary,
    contractViolations: cases.reduce((sum, row) => sum + row.violations.length, 0),
    cases,
  };
}
export function compareEvaluation(current, baseline) {
  const reasons = [];
  if (
    !baseline ||
    baseline.format !== current.format ||
    baseline.version !== current.version ||
    !Array.isArray(baseline.cases) ||
    baseline.cases.length !== current.cases.length ||
    !unique(baseline.cases.map((row) => row.id))
  )
    reasons.push("Missing or incompatible evaluation format/version.");
  if (JSON.stringify(baseline?.corpus) !== JSON.stringify(current.corpus))
    reasons.push("Corpus, clock or seed changed; an explicit reviewed baseline is required.");
  if (reasons.length) return { ok: false, reasons };
  if (current.contractViolations) reasons.push("Unexpected or excluded candidates appeared.");
  if (
    JSON.stringify(current.method) !== JSON.stringify(baseline.method) ||
    JSON.stringify(current.sourceSummary) !== JSON.stringify(baseline.sourceSummary) ||
    JSON.stringify(current.quality) !== JSON.stringify(baseline.quality)
  )
    reasons.push("Metric definitions or aggregate summaries changed; review/version the baseline.");
  const prior = new Map(baseline.cases.map((row) => [row.id, row]));
  for (const row of current.cases) {
    const before = prior.get(row.id);
    if (!before) {
      reasons.push("Missing baseline case " + row.id);
      continue;
    }
    if (
      JSON.stringify({
        top: row.top,
        metrics: row.metrics,
        perSource: row.perSource,
        checks: row.checks,
        violations: row.violations,
      }) !==
      JSON.stringify({
        top: before.top,
        metrics: before.metrics,
        perSource: before.perSource,
        checks: before.checks,
        violations: before.violations,
      })
    )
      reasons.push(
        "Ranking or metrics changed in " +
          row.id +
          "; inspect the report before accepting a new baseline.",
      );
  }
  return { ok: !reasons.length, reasons };
}

/** Corrupt output orders prove each detector independently; they do not alter
 * production weights or silently become the accepted baseline. */
export function evaluateSentinels(corpus) {
  const tests = [
    [
      "operational-tags",
      "guide-operational-facets",
      "operationalOnlyShare",
      (entry) => [
        ...entry.operationalOnlyIds,
        ...entry.eligibleIds.filter((id) => !entry.operationalOnlyIds.includes(id)),
      ],
    ],
    [
      "creator-monopoly",
      "youtube-creator-diversity",
      "maxCreatorShare",
      (entry) =>
        entry.eligibleIds.filter(
          (id) => corpus.items.find((row) => row.id === id).creator === "apex",
        ),
    ],
    [
      "repeat-exposure",
      "youtube-repeat-exposure",
      "previousExposureShare",
      (entry) => [...entry.previousShelf, ...entry.eligibleIds],
    ],
    [
      "canonical-duplicates",
      "guide-query-canonical",
      "canonicalRepeatShare",
      (entry) => [entry.eligibleIds[0], entry.eligibleIds[0], entry.eligibleIds[0]],
    ],
    [
      "explicit-negative",
      "youtube-topic-negative",
      "negativeShare",
      (entry) => [...entry.negativeIds, ...entry.eligibleIds],
    ],
  ];
  return tests.map(([id, caseId, metric, corrupt]) => {
    const entry = corpus.cases.find((row) => row.id === caseId);
    if (!entry) throw Error("Missing sentinel case " + caseId);
    const result = evaluateRanking(corpus, entry, corrupt(entry));
    return {
      id,
      caseId,
      metric,
      detected: result.checks.some((check) => check.metric === metric && check.status === "fail"),
    };
  });
}
