# Recommendation evaluation, corpus v1

This is an offline, synthetic baseline for next-051. It evaluates the production YouTube personalized shelf, Twitch VOD score/order, Guide personal picks and Guide topic-query selector. It does not call the optional remote AI service, fetch providers, read browser storage, or alter user feedback. Production ranking weights and selectors are unchanged.

The 62 hand-authored media rows and 16 scenarios cover creator/topic affinity, publication freshness versus ingestion time, explicit one-star rejection, operational facets, canonical aliases, previous shelf exposure, visibility exclusions, cold start, a single creator and incomplete judgments. Names and identities are synthetic. No real account, channel, library path or watch URL is in the corpus. The fixed UTC clock and seed make runs reproducible.

## Commands

- npm run benchmark:recommendations writes the current report to screenshots/recommendation-evaluation-current.json and prints quality findings.
- npm run check:recommendations checks current outputs and metrics against baseline.v1.json. Changed rankings, incompatible/missing baselines or output contract violations fail.
- npm run benchmark:recommendations -- --quality-gate requires every applicable declared quality check to be measured and passing. **The initial baseline intentionally fails this gate.** This is not a green recommendation-quality release.
- node --test scripts/recommendation-evaluation.test.mjs verifies independent calculations, unknown handling, five adversarial detectors, deterministic real selectors, immutable/offline inputs, CLI exit codes and baseline preservation.

The report contains integrityGate, regression and qualityGate separately. A zero exit from the normal reporting command means the run completed with valid outputs and detectors; it does not claim quality targets passed. The --check command detects any output drift, including an improvement requiring review. Exact public-source case coverage and unknown denominators are reported. No timing or user-satisfaction score is claimed.

## Frozen judgments and metrics

Each case has an independent intent, candidate IDs, eligible IDs, graded judgments with a written reason, input feedback and declared thresholds. Grades mean 0 irrelevant, 1 exploratory, 2 relevant, 3 strong match. Missing judgments remain missing. Do not generate grades from the current ranker or tune thresholds simply to make it pass.

- NDCG@k uses gain 2^grade - 1 and discount log2(position + 2). The ideal order contains unique eligible canonical identities. Repeated canonical results cannot gain relevance twice. Missing pool/returned judgments make NDCG unmeasured; no eligible/relevant ideal is not a perfect score.
- Precision@k is the fraction of judged returned slots with grade at least 2. Unjudged slots are counted separately. A separate fill check prevents empty output from gaming precision.
- Creator concentration is the largest returned share by source + creator. Its limit is inapplicable with fewer than two relevant creators; it is not unfairness evidence for a single-creator library.
- Canonical repeat rate detects aliases/duplicate slots. Previous-exposure rate measures overlap with a declared prior synthetic shelf, separately from viewing history. This harness creates no production exposure ledger.
- Freshness uses known publication age, with a 30-day fresh window. Unknown dates are counted separately and excluded from that denominator. An import date never supplies publication evidence.
- Negative and operational-only shares have explicit case labels. Source summaries are case-weighted diagnostics, not independent human samples. Per-source NDCG evaluates within-source order; provider coverage is reported separately.

Five corruption sentinels inject operational-first, creator-only, repeated-shelf, canonical-duplicate and explicit-negative output orders. Each must trigger its intended detector, rather than merely failing another check. They never change production code or accepted outputs.

## Initial findings

The reviewed baseline has **81 passing checks, 7 failing checks, 1 unmeasured check and 10 inapplicable checks**. These are synthetic assertions, not a satisfaction percentage.

All five corruption sentinels are detected; no unexpected or excluded candidate reaches the measured production outputs.

- Guide personal picks can promote mechanical source/format/creator facets above genuine racing content. This scenario also concentrates on one creator and scores poorly for relevance.
- Twitch VOD personalization can place one prolific liked creator in every measured slot despite relevant alternatives.
- Twitch's import-age freshness signal can favor old or undated newly imported broadcasts over a genuinely recent publication.
- YouTube can repeat the entire prior synthetic shelf; its current ranker has no exposure ledger.
- One title is intentionally unjudged to prove that missing evidence stays unmeasured. Empty eligible libraries are inapplicable, not successful relevance judgments.

Relevant follow-up contracts include next-052/053 for reversible negative/exposure evidence, next-055/056 for grounded recommendation evidence and next-059 for diversity reporting. The benchmark itself completes next-051; these quality gaps remain open. Photo/adult ranking, live ordering, retrieval and remote AI wording are outside this baseline. The synthetic adult-source row checks ordinary-Guide exclusion only.

## Baseline review

The corpus hash, version, clock and seed must match. A corpus/judgment/threshold change requires explicit review; a metric definition change also needs its version reviewed. Compare current JSON with baseline.v1.json, inspect changed IDs, metrics, unknown counts and source breakdown, and run detector tests before accepting a new artifact.

The first baseline is created with node scripts/recommendation-evaluation.mjs --record-baseline. An existing baseline is never overwritten by that command alone. After review, replacement also requires --replace-baseline. Current output cannot target the corpus or baseline, including case-only path aliases on Windows. Artifact writes are limited to screenshots/ and benchmarks/recommendations/. A custom --corpus must retain the version-1 guard scenarios or the self-check refuses the run.
