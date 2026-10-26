# Reviewed topic aliases — 25 October 2026

Revision 41 completes **next-054 — Topic alias review workflow**. The default plan is **218/306 complete**: sixteen next-level milestones verified, 84 next-level briefs planned, and four older external verification milestones still open. The one-time migration promotes only next-054 for older plans, preserving unrelated manual/custom states and later reopens.

Baseline: built-in topic aliases could connect known synonyms, but saved misspellings remained disconnected and there was no evidence-based review, provenance or Undo. Topic Explorer also prepared its full topic interpretation again after each refresh.

## Delivered behavior

- Topics includes **Review topic spelling and aliases**, with bounded suggested spelling candidates and exact saved-label inspection. Evidence shows public title counts, source types and up to three title examples. Hidden, unavailable, sample, orphan local and private/adult titles are excluded. Operational provider, creator and format labels cannot be remapped.
- Suggestions never apply themselves. The owner reviews a canonical target before approval; short or tied labels additionally require a target and an explicit acknowledgement. Existing built-in topics/aliases cannot be reassigned, and targets cannot chain or cycle through another reviewed alias.
- A separate version-1 ledger retains at most 128 reviewed aliases, timestamps, approval method and supporting counts/sources. The UI mounts eight candidate/saved rows at a time. A full ledger requires explicit Undo before adding another decision; it does not silently evict approvals.
- Tags, manual locks, provider metadata, media identities, ratings and private content remain unchanged. Undo removes only the local interpretation and restores separate topic counts. Review samples do not enter the ledger or public Watch Together descriptors/session files.
- Existing localStorage and the coalesced activity database persist the ledger. Newest whole-ledger timestamps prevent stale mirrors resurrecting Undo. Reads do not write; explicit actions save once. Failure in both mirrors keeps session behavior available and shows an explicit retry. ZIP and companion-folder packs include marks/topic-aliases.json; legacy packs leave decisions intact and unsupported versions show a readable warning.
- Approved saved labels join Topic Explorer, public global search, YouTube/Twitch recommendation inputs and Guide topic answers across reload. Worker resets carry a bounded alias snapshot; search changes query expansions without rebuilding base document postings. Private/adult search requests retain raw interpretation. Existing preview ranking weights are not changed by this milestone.
- Topic Explorer caches typed ordinal postings. Approval/Undo stages and swaps only the affected old/new target postings; unrelated topic arrays are reused. Catalog/visibility edits still rebuild safely. Cooperative checkpoints preserve cancellation, and active consumers recover when an earlier mount cancelled shared preparation. Concurrent consumers share one staged patch. A regression covers the startup race discovered during browser testing.
- No provider request, model call, added polling or automatic merge is involved.

## Verification for revision 41

- Final npm run build and npm run typecheck passed.
- Broad regression: **1,477 tests passed, 0 failures** — 869 script tests with two workers plus 608 native TypeScript tests. Final affected-path run: **41 passed, 0 failures**, including the added shared-patch concurrency regression after the final safeguard. An earlier run exposed an outdated revision-40 test expectation; it was corrected and the full script suite rerun.
- npm run check:recommendations passed: the reviewed 62-title/16-scenario baseline remains unchanged with no approved aliases. Other recommendation-quality gaps remain open.
- Pure tests cover validation, limits, candidate evidence, ambiguity, exact manual/locked-tag preservation, approval/reload/Undo, unaffected evidence/posting identity, private/raw search, the actual search worker with one document batch, YouTube worker resets, public YouTube/Twitch/Guide scoring, interrupted patch recovery, stale mirror ordering, backup compatibility, quota failure and room/session exclusion.
- Development and production interactive checks pass on desktop (1440x1000) and mobile (390x844): review/approval, required short-label acknowledgement, Undo, current topic counts, real worker-backed global search for both spellings, durable reload, real ZIP export/import with exact provenance, simultaneous quota failures/retry and eight-row pagination. A mobile pagination overflow found during verification was fixed.
- Home smoke passes on both outputs and viewports; production matches the development baseline. Console/page errors, horizontal overflow, auth and brand warnings are absent. Desktop/mobile Home and alias screenshots were visually inspected.
- Mission browser checks verify revision 41, sixteen verified next-level completions, preserved custom/manual states, start/block/resume, filters, clipboard denial fallback, complete Markdown/CSV export and reload.
- A separate synthetic 80,000-title check measured a 342 ms initial build and 86 ms affected-topic patch over 710 cooperative checkpoints. Science reached 40,000 connected titles; gaming retained the exact same posting object and the index retained one base build. Timings describe this machine/run, not a real-user endurance result.

## Evidence and entry points

- New logic: src/lib/videos/topic-taxonomy.ts, topic-aliases.ts, topic-alias-candidates.ts and topic-postings.ts; src/lib/topic-alias-store.ts.
- UI: src/components/library/topic-alias-review.tsx and topic-links.tsx. Existing Topics layout, components and styling are retained.
- Integration: topics.ts, topic-catalog.ts, ranking-core.ts, guide-picks.ts, search-index.ts, search-token-query.ts, search.worker.ts, search-worker-index.ts, persist.ts, library-pack.ts and store.ts; YouTube ranking protocol/selector/hook; media-feedback.ts, library-app.tsx, search-ranking.ts and pre-video.tsx.
- Tests: scripts/topic-aliases.test.mjs, topic-alias-store.test.mjs and topic-alias-browser-check.mjs. Mission revision/defaults/migration tests and NEXT_LEVEL_MILESTONES.md updated additively.
- Browser artifacts: screenshots/topic-alias-{dev,built}.json and desktop/mobile approval/control PNGs; topic-alias-home-{dev,built}.json and PNGs; topic-alias-plan-{dev,built}.json.
- Scale artifact: screenshots/topic-alias-scale.json, reproducible via .grok/topic-alias-scale.mjs.
- Logs: .grok/topic-alias-{build,typecheck,tests,native,regression-final,baseline,scale}.log; topic-alias-browser.log and topic-alias-browser-built.log; topic-alias-{smoke,plan}-{dev,built}.log.

Limits: isolated synthetic public catalogs and controlled provider responses verify application behavior; no real user library was changed. Mobile is a Chrome viewport, not a physical-device endurance run. The four older physical-device/relay/provider-soak milestones remain open.

---

# Visible recommendation exposure — 25 October 2026

Revision 40 completes **next-053 — Recommendation exposure ledger**. The default plan is **217/306 complete**: fifteen next-level milestones verified, 85 next-level briefs planned, and four older external verification milestones still open. The revision-39 migration promotes only next-053 and preserves unrelated manual/custom statuses and later reopens.

Baseline: ranking knew opens, ratings and favorites but did not know which unopened recommendations were actually shown. Repeated shelves could therefore continue promoting the same unseen items. Artwork visibility alone was insufficient evidence: cards may be prefetched, clipped, quickly skipped, covered by the player or shown in a background tab.

## Delivered behavior

- Exposure is limited to explicitly marked public recommendation surfaces: More from your rated YouTube, Recommended Twitch VODs, Guide personal picks and public preview suggestion cards. Ordinary catalog/search/history/live/favorite lists, private/adult pages and offscreen prefetched rows are not counted.
- One pooled observer requires at least 50% of the card to intersect the viewport, including ancestor clipping. A shared event-driven dwell manager requires two continuous seconds while the document is visible and focused. Blur, visibility changes, player/preview context changes, intersection loss and unmount discard incomplete dwell. Completion also verifies the card is connected and contains the topmost element at its visible center; covered controls cannot count merely because their rectangles intersect.
- No observer or dwell callback changes React card state. A visible mounted row can contribute once; canonical media identity and a 30-minute cooldown deduplicate remounts and repeated shelves. The dwell/observer pools cap registrations at 1,024 and release nodes, listeners and timers after their final consumer leaves. There is no interval or hidden-page poller.
- A separate version-1 ledger contains only canonical media keys, bounded counts and timestamps. Pending observations cap at 256 and saved rows cap at 2,048; disposable oldest exposure rows rotate out. Counts cap at eight. This is separate from opens, watch time, likes, ratings, explicit rejection reasons and hidden/unavailable flags.
- Updates coalesce into one five-second batch scheduled through the existing background-work budget, using the existing activity database, coalesced writer and a bounded localStorage mirror. Opening, reset, import, page hiding and page exit use the same save path. Reads do not write. Both-mirror failures leave evidence usable for the session and expose an explicit retry. Newer state invalidates older pending save-status completions.
- The novelty reduction is three points per counted exposure, capped at 18 points, halved every seven days and expired after 30 days. It never removes a title. Opening a title clears its canonical exposure. Saves, likes, creator favorites and four/five-star ratings bypass it. Explicit rejection semantics and visibility rules remain independent.
- Production YouTube worker ranking, Twitch VOD scoring, Guide personal/query ranking and public preview ranking apply this reduction. Empty ledgers skip candidate penalty work. Private/adult preview scoring explicitly ignores the public penalty. Worker packing now preserves provider video identity, needed for both canonical exposure and the prior title-scoped rejection choice.
- Passive impressions do not trigger ranking events or reshuffle the currently painted shelf. The next mix, a ranking refresh or a new preparation uses current evidence. YouTube mix invalidation rebuilds scores only if exposure inputs changed; otherwise it retains the existing scored-evidence reuse. Guide New recommendations captures the current ledger. The explicit Apply recent exposure action refreshes affected ranking inputs.
- Fresh recommendations / recent exposure controls explain measurement, decay, protection and scope; show a bounded count; allow Apply, Reset and failed-save retry. They appear in the Guide, public preview recommendation choices, and YouTube/Twitch ranking explanations. Reset clears only disposable exposure, preserving ratings, saves, history and explicit rejection choices.
- The actual library-pack ZIP and companion-folder pack include marks/recommendation-exposure.json. Import validates the version/container, restores that ledger (including an explicit empty reset) and advances its save stamp. Older packs leave current exposure unchanged. Whole-ledger timestamps prevent an old mirror from resurrecting an open/reset state. Public Watch Together descriptors/session files omit exposure data.

## Verification for revision 40

- Final npm run build and npm run typecheck passed.
- Complete regression command passed: **1,461 tests, 0 failures** — 854 script tests with two workers plus 607 native TypeScript tests. Final focused run: **43 passed, 0 failures**.
- npm run check:recommendations passed against the reviewed baseline with no measured exposure input.
- Development and production feature, mission migration and Home smoke checks passed on desktop/mobile. Production matched the development smoke baseline; console errors, horizontal overflow and brand/auth warnings were absent.

- Pure tests cover malformed/future imports, TTL, cooldown, count bounds, exact seven-day half life, canonical aliases, positive-preference protection, opening/reset and mirror ordering. A 10,000-plus-observation simulated browse stays at 2,048 entries and retains no full-library graph.
- Actual production selector tests cover YouTube ordering and worker reset, Twitch score differences, Guide personal/query ordering, preview taste independence, private/adult protection and public room/session exclusion. The previous 62-title/16-scenario baseline remains unchanged without measured exposures; its other quality gaps remain open.
- Fake-clock dwell tests prove offscreen, immediately skipped, unfocused, occluded and wrong-context cards cannot count, and every interruption restarts the two-second requirement. Observer tests prove half-visible thresholds, pooling, cleanup and stale-generation rejection. Store tests prove coalesced writes, bounded pending work, no passive ranking event, canonical opens, stale-mirror reset protection, read-only snapshots, backup compatibility and failed-save retry.
- Development and production interactive checks run isolated desktop (1440x800) and mobile (390x844) Chrome. They switch to a real background browser tab, verify zero background/short-dwell impressions, compare stored identities with genuinely visible cards, verify no passive reorder, open a card, reset while retaining personal feedback, export/import the actual ZIP, reload real mirrors, inject simultaneous quota failures and retry. Both viewports verify clean consoles and no horizontal overflow.
- Home smoke checks cover development and production with baseline comparison; new controls and Home desktop/mobile screenshots were visually inspected. Mission browser checks exercise revision migration, custom/manual preservation, start/block/resume, filters, clipboard fallback, full Markdown/CSV exports and reload.

## Evidence and entry points

- New logic: src/lib/videos/recommendation-exposure.ts, src/lib/recommendation-exposure-dwell.ts, src/lib/recommendation-exposure-store.ts. The existing src/lib/card-visibility.ts now owns the additional pooled meaningful-visibility observer.
- New components: src/components/library/use-recommendation-exposure.ts, recommendation-button.tsx and recommendation-exposure-control.tsx. Integrated with video-card.tsx, browse.tsx, library-app.tsx, ai-guide.tsx, pre-video.tsx, recommendation-choices.tsx and ranking-panel.tsx.
- Ranking/storage paths: src/components/library/use-youtube-ranking.ts, use-twitch-vod-ranking.ts, use-preview-ranking.ts; src/lib/remote/youtube-recommendations.ts and youtube-ranking-protocol.ts; src/lib/videos/twitch-recommendations.ts, guide-picks.ts, preview-ranking.ts, store.ts, persist.ts and library-pack.ts.
- Tests: scripts/recommendation-exposure.test.mjs and recommendation-exposure-store.test.mjs; scripts/recommendation-exposure-browser-check.mjs. Mission revision/defaults/tests and NEXT_LEVEL_MILESTONES.md updated additively.
- Artifacts: screenshots/exposure-dev-ui.json and exposure-built-ui.json plus desktop/mobile control screenshots; exposure-dev.json and exposure-built.json plus Home screenshots; exposure-dev-plan.json and exposure-built-plan.json. Existing offline baseline artifact remains screenshots/recommendation-evaluation-current.json.
- Logs: .grok/recommendation-exposure-{tests,regression,build,typecheck,baseline,dev-ui,built-ui,dev-plan,built-plan,dev-smoke,built-smoke}.log.

Limits: evidence uses synthetic catalog rows and controlled provider-player responses in isolated browser storage. Real tab backgrounding is verified in desktop Chrome with a mobile viewport, not a physical-phone endurance run. No external provider, model service, paid action or real-user preference reset is needed. The four older physical-device/relay/provider-soak milestones remain open.

---
# Scoped recommendation choices — 25 October 2026

Revision 39 completes **next-052 — Explicit recommendation rejection reasons**. The default plan is **216/306 complete**: fourteen next-level milestones verified, 86 next-level briefs planned, and four older external verification milestones still open. The one-time migration promotes only next-052 for revision-38 plans and preserves unrelated manual/custom states and later reopens.

Baseline: title stars could indirectly influence shared creator/topic affinity, but there was no separate opt-in title, creator or topic rejection record, no review/Undo workflow, and no backup payload for those decisions. The new controls keep rejection evidence separate from ratings, hidden/unavailable flags, catalog rows and room data.

## Delivered behavior

- Public/local title previews now include **Not interested? Tune recommendations**. Choose less of this title, less from its provider-scoped creator (or local folder), or less of one evidenced canonical topic. Each choice is independently reversible, and Review saved choices can undo any saved entry.
- Title keys use provider media identity, so alternate saved rows for the same remote item match without penalizing sibling titles. Creator keys include provider identity; topic keys use existing content evidence and aliases, not operational tags or creator-name guesses. Title-only choices do not train broader affinity.
- YouTube personalized worker ranking, Twitch VOD recommendations, Guide personal/query ranking, and preview suggestions apply bounded score penalties: title 40, creator 24, topic 16, combined maximum 64. These are soft score reductions; they do not delete, hide, mark unavailable, alter ratings, or promise permanent exclusion. Sorting by date/viewers and manually saved libraries retain their existing behavior.
- Saved titles and favorited creators bypass these new penalties. Canonically hearted topics bypass their own topic penalty. Positive preferences and rejection choices remain stored independently, so removing a favorite restores the applicable penalty. Existing one-star behavior remains separate.
- No-choice ranking takes a fast path without new per-candidate penalty/protection work. Ledger indexes compile once per ranking preparation. No polling, provider request, model call or automatic budget increase was introduced.
- At most **512 choices** are retained; adding a 513th reports the limit without evicting another personal choice. The review mounts **eight rows per page**. Import normalization validates version, fields, bounded scan, identities and topics. Unsupported/malformed ledger containers are ignored rather than clearing current choices.
- Feedback export version 5 adds an optional version-1 rejection ledger using the existing feedback localStorage/IndexedDB mirrors and coalesced save. Whole-ledger timestamps include removals, so an older mirror cannot resurrect an undone choice. Startup hydration and cache-protection reads use the newest ledger. Old packs without the field keep current choices; a valid imported ledger explicitly restores its choices, including an empty state.
- Library pack ratings JSON now includes rejection choices, creator favorites and watch-time evidence in addition to its existing ratings/notes/creator likes. Pack restore recovers the saved rejection ranking inputs exactly. Rejection ledger save timestamps advance on restore to retain that restore across mirrors; timestamps are not ranking weights.
- Both mirrors failing shows a session-only storage warning with **Retry saving feedback**. Retry saves current inputs; an older asynchronous completion cannot overwrite a newer pending status. Save-status notifications use a dedicated channel and do not trigger aggregate ranking events or per-card rating subscriptions.
- The UI is available on public/local previews; private/adult preview presentation is unchanged. Watch Together media descriptors and public session exports use their existing allowlists and cannot include this feedback ledger.

## Verification for revision 39

- Final npm run build and npm run typecheck passed.
- Complete script regression stage: **837 passed, 0 failures** (two workers). Its first native stage exposed a missing explicit .ts worker import; that was fixed, and the entire native stage reran: **606 passed, 0 failures**. Final focused checks, including an additional malformed-import guard and the private-preview boundary: **37 passed, 0 failures**.
- Recommendation baseline check passed. Final production UI, plan migration and baseline smoke checks passed on desktop/mobile with no console errors, overflow or baseline divergence.

- Focused production-path tests cover canonical title aliases, sibling/creator/provider isolation, canonical topic evidence, explicit favorite/topic-heart protection, bounded imports/capacity, deterministic Undo, YouTube worker reset, Twitch score subtraction, Guide ordering/visibility, preview scores without tag-training changes, backup round-trip, failed-save retry, malformed/future imports, dedicated notification channels and room/session privacy.
- The previous 62-title/16-scenario recommendation baseline still matches with no explicit rejection choices. Its existing quality gaps remain open; next-052 does not claim to fix creator diversity, repeated exposure, operational-tag relevance or publication freshness globally.
- Development and production desktop/mobile interactive checks exercise separate scoped choices, real mirror reloads, favorite explanation, simulated simultaneous quota failures and retry, actual library-pack ZIP download/restore, exact saved evidence and rating/watch-time retention, and eight-row review pagination. Console errors and horizontal overflow are checked on both viewports.
- Home smoke passes on development and production; production is compared with the development baseline. Desktop/mobile Home and new-controls screenshots were visually inspected. Mission UI checks on both builds exercise revision migration, manual/custom status preservation, filtering, start/block/resume, copied briefs, clipboard fallback, Markdown/CSV download and reload.

## Evidence and changed entry points

- Production entry points: src/components/library/recommendation-choices.tsx, pre-video.tsx, use-preview-ranking.ts, use-youtube-ranking.ts, use-twitch-vod-ranking.ts, ai-guide.tsx; src/lib/videos/recommendation-rejections.ts, preview-ranking.ts, twitch-recommendations.ts, guide-picks.ts, persist.ts, library-pack.ts; src/lib/remote/youtube-recommendations.ts and youtube-ranking-protocol.ts; src/lib/media-feedback.ts.
- Migration and roadmap: src/lib/mission-plan.ts, mission-plan.test.ts, scripts/mission-next-level.test.mjs, scripts/mission100-browser-check.mjs, scripts/milestone-completion-browser-check.mjs and NEXT_LEVEL_MILESTONES.md.
- Focused tests: scripts/recommendation-rejections.test.mjs, scripts/ranking-feedback.test.mjs, scripts/rating-subscriptions.test.mjs. Interactive script: scripts/recommendation-rejections-browser-check.mjs.
- Browser artifacts: screenshots/rejections-dev-ui.json and rejections-built-ui.json (desktop/mobile feature screenshots alongside each); rejections-dev-plan.json and rejections-built-plan.json; rejections-dev.json and rejections-built.json. Offline baseline artifact: screenshots/recommendation-evaluation-current.json.
- Logs: .grok/recommendation-rejections-{tests,regression,build,typecheck,baseline,dev-ui,built-ui,dev-plan,built-plan,dev-smoke,built-smoke}.log.

Limits: browser checks use isolated synthetic catalog/storage and a local provider-player fixture. No external provider changes or paid/model calls are needed for this milestone. No real-user preference migration was forced, no library reset was performed, and no physical-device/provider-soak result is claimed. The four earlier external verification milestones remain open.

---
# Recommendation evaluation foundation — 25 October 2026

Revision 38 completes **next-051 — Recommendation evaluation dataset**. The default plan is **215/306 complete**: thirteen next-level milestones are verified, 87 next-level briefs remain planned, and four older external verification milestones remain open. Revision-37 plans promote only next-051; unrelated manual/custom choices and later reopens remain preserved.

Baseline: existing unit tests covered individual ranking behaviors, but there was no common graded corpus, frozen quality artifact, per-source evaluation or proof that operational-tag/creator-concentration regressions would be detected. This milestone creates that foundation. It does not change production ranking weights, feedback semantics or saved user preferences, and it does not claim to fix the quality gaps it measures.

The new offline runner invokes the actual YouTube personalized ranker, Twitch recommendation scorer plus VOD ordering, Guide personal selector and Guide topic query. Its version-1 corpus contains 62 synthetic media rows and 16 scenarios with written intents, explicit eligible identities, independent graded judgments and feedback. A fixed UTC clock and seed make ranking outputs reproducible. Creator/topic affinity, publication age versus ingestion age, one-star rejection, operational labels, canonical aliases, prior shelf exposure, privacy/visibility exclusions, cold start, single-creator availability and missing judgments are represented. No real account, creator, file path or user library is loaded.

Metrics include graded canonical-aware NDCG, judged-slot precision with a separate fill check, creator/provider distributions, canonical repeat rate, prior synthetic shelf overlap, explicit-negative/operational-only shares and known-publication freshness. Unknown dates and judgments stay unknown, and empty eligible libraries are inapplicable rather than perfect relevance. A single available relevant creator is not falsely accused of avoidable concentration. Reports include case-level and per-source breakdowns and state that these are synthetic assertions, not user satisfaction or provider throughput.

Five adversarial output variants must trip their intended operational-tag, creator-monopoly, repeat-exposure, canonical-duplicate and explicit-negative detector. These variants do not alter real weights or become the accepted output. The baseline records production outputs first, so it cannot hide current weaknesses by deriving judgments from those outputs.

The initial reviewed baseline has **81 passing checks, seven failing quality checks across four scenarios, one deliberately unmeasured judgment check and ten inapplicable checks**. All five adversarial detectors work, and production outputs have no unexpected/excluded-result contract violations. Findings remain explicit: Guide personal picks can favor mechanical tags; Twitch VODs can concentrate on one prolific liked creator and favor ingestion recency over publication freshness; YouTube can repeat a prior shelf without exposure evidence. Future recommendation milestones own those fixes.

Two npm commands are available: benchmark:recommendations writes the current report; check:recommendations compares it with the reviewed baseline. Integrity, baseline drift and strict quality results are separate. The normal baseline comparison passes when the known output/metrics are unchanged; the optional --quality-gate intentionally exits nonzero for this initial baseline. Missing/incompatible baselines, changed judgments/clock/seed, altered outputs or metric definitions require review. Baseline recording cannot overwrite an existing artifact without --replace-baseline, and path preflights prevent current output from overwriting either the corpus or baseline, including Windows case aliases. Current artifacts are limited to the workspace benchmark/screenshots locations.

The runner performs no network calls, browser storage reads/writes, real-feedback mutations or optional model requests. It is not loaded by page startup, so there is no additional production polling, ranking pass or retained catalog graph. README instructions describe metric denominators, current findings, command exit meanings and explicit baseline review.

## Verification for revision 38

- Final production build, type checks and affected tracked-source whitespace checks passed.
- Complete regression suite: **1,428 passed, 0 failures** — 823 script tests with two workers plus all 605 TypeScript tests from the package command. Existing large-library, provider, and room regressions remain included.
- Ten evaluation tests cover corpus validation/reference bounds, an independently calculated two-title NDCG value, incomplete judgments, publication/ingestion separation, canonical aliases, exposure versus rejection, single-creator/empty handling, five independent adversarial mutations, deterministic real selectors, frozen input preservation, no fetch, strict baseline comparison, overwrite preflights and actual CLI nonzero exits for strict quality and missing baselines.
- npm run check:recommendations passed against the frozen baseline. The strict quality gate was separately verified to fail as intended; this is a measured foundation, not a passing recommendation-quality release. The checked artifact records current source-file hashes alongside corpus/version/clock/seed evidence.
- Desktop/mobile development and production Mission plan acceptance passed migration with thirteen verified next-level defaults, manual/custom status preservation, workstream/search/priority filters, copy and clipboard fallback, Markdown/CSV exports and reload. No console errors or horizontal overflow occurred; screenshots inspected.
- Desktop/mobile development and production Home smoke passed with no console, branding or auth warnings and a non-diverging baseline. Production app ranking behavior is unchanged; the offline selector tests exercise ranking directly rather than substituting mock scores.

Validation: npm run build; npm run typecheck; node --test scripts/recommendation-evaluation.test.mjs; full package tests with script concurrency two; npm run check:recommendations; actual CLI quality/missing-baseline exit checks; scripts/mission100-browser-check.mjs on development/production; scripts/browser-smoke.mjs on development/production.

Evidence: benchmarks/recommendations/corpus.v1.json, baseline.v1.json and README.md; screenshots/recommendation-evaluation-current.json; screenshots/recommendation-evaluation-{dev,built}-plan.json; screenshots/recommendation-evaluation-{dev,built}.json, with desktop/mobile PNGs. Browser profiles were isolated and the real user's saved library/statuses were not seeded or reset. Photo/adult recommendation quality, remote AI wording, live ordering, real-user satisfaction and provider retrieval performance are outside this synthetic baseline. Existing real-provider/physical-device/relay milestones remain open. The development app remains available after stopping the temporary production QA server.

Changed entry points: scripts/lib/recommendation-evaluation.mjs, scripts/lib/recommendation-rankers.mjs, scripts/recommendation-evaluation.mjs, its tests, benchmarks/recommendations/, npm script entries and versioned mission defaults/tests/export.

---
# YouTube embed failure triage milestone — 25 October 2026

Revision 37 completes **next-028 — YouTube embed failure triage**. The default plan is **214/306 complete**: twelve next-level milestones are verified, 88 next-level briefs remain planned, and four older external verification milestones remain open. Revision-36 plans promote only next-028; unrelated manual/custom choices and later reopens remain preserved.

Baseline: trusted iframe errors and a generic device-local reload/watch link already existed, but the room lacked structured cause/action guidance, bounded per-title error evidence and an export. An errored iframe could still receive corrective seeks from later canonical reconciliation; incidental readiness/clock messages could make a failed player look recovered. Existing queue, chat, manual Ready choices, per-device startup and independent host permission enforcement remain intact.

Watch Room → Player recovery now distinguishes invalid link, browser/HTML5 playback, unavailable/private video, creator-disabled embedding, player identification/setup, unknown reported errors and device autoplay blocks. Mapping uses the observed numeric error code from the current trusted iframe, following [YouTube’s official player events documentation](https://developers.google.com/youtube/iframe_api_reference#onError), checked 25 October 2026. Code 101/150 guidance explains the official watch-page path; code 153 guidance identifies referrer/player identity as a possible setup cause. No access/age bypass, cookie extraction, media download or restricted-content probe is implemented.

A bounded existing handshake that never receives readiness now reports setup uncertainty without inventing a provider error or claiming that the video was removed/restricted. Late readiness can recover a timed-out handshake without an automatic reload. Official watch links are rebuilt from the public video identity and open separately; the UI explains that external playback is not synchronized. Device-only reload records a new player load, preserves the room/queue/access settings and exposes a fresh loading state. Confirmed playback clears the active failure; an incidental Ready or stale playing clock sample cannot erase a provider error.

Confirmed failures suppress automatic iframe seek/play reconciliation until an explicit local retry or a fresh observed play event. Failed-frame clock/ended samples cannot change the room timeline or skip its queue. The host’s canonical room state and other viewers continue normally. The guard does not broaden guest queue, playback or seek access, and a recovery action never publishes a video selection or permission change.

Diagnostics retain at most 12 public YouTube video identities with six recent transitions each during this browser’s room visit. Repeated error codes and playing clock messages retain the same evidence array and original observation time. Per-title load counts are bounded; invalid identities, phases, clocks and error payloads are ignored. Room/title/player generations prevent late replaced-player observations from contaminating another title. The history clears on browser reload or room replacement; Clear earlier title diagnostics retains only the current title. No new persistence ledger is introduced.

An explicit version-1 JSON download whitelists canonical public identity/watch URL, compact phases/codes, observation times and bounded load counts. It excludes room codes/invitations, peer names, local paths/fingerprints, private catalog fields, account/cookie data, provider payloads and playback positions. The collapsed diagnostic body mounts only when opened. Stable recovery callbacks and transition deduplication prevent clock ticks from rebuilding the panel or adding evidence. No provider polling, automatic reload, automatic file download or extra fetch is added; timeout guidance reuses the existing finite handshake budget.

## Verification for revision 37

- Final production build, type checks and affected tracked-source whitespace checks passed.
- Complete regression suite: **1,417 passed, 0 failures** — 813 script tests with two workers plus all 604 TypeScript tests from the package command, including existing large-library regressions. An initial stale completed-count assertion was updated; the final complete run passed.
- Eight new diagnostic cases cover documented code classes, unknown codes, autoplay versus setup uncertainty, absent invented timeout codes, 10,000 duplicate errors without identity/timestamp growth, sticky errors, retry/play recovery, 12-title/six-event bounds, invalid inputs, public-only export and late-clock preservation. The mission migration case verifies only next-028 promotion and preserved manual/custom/later states.
- Final development and production acceptance passed with isolated desktop host and 390px touch-phone guest Chrome clients using actual signaling and WebRTC. Controlled current-origin provider events covered all code categories, parent-source spoof rejection, 100 repeated errors, delayed playing clock samples and repeated host resyncs without new iframe loads or seek/play loops. Chat, acknowledged queue addition and opening the canonical official watch page continued while one guest’s embed failed. Local reload, autoplay recovery, exhausted handshake, late readiness, diagnostic downloads, title changes, earlier-history clearing and browser reload all passed. The paused clock remained within sub-second initial transport-settling tolerance; host permissions and confirmed queue remained intact. No console errors or horizontal overflow occurred; screenshots inspected.
- Existing production readiness acceptance passed manual Ready versus blocked autoplay, no duplicate readiness traffic, explicit host wait/pause, independent locked playback/seek enforcement, stale title report rejection, Twitch ready/blocked/playing states, honest unsupported clips, real sample MP4 decoding on an empty phone library over RTC and departure cleanup.
- Production milestone migration/filter/copy-fallback/Markdown/CSV/reload checks passed with twelve verified next-level defaults and preserved manual/custom work. Desktop/mobile development and final production Home smoke passed with no console, branding or auth warnings and a non-diverging baseline.

Validation: npm run build; npm run typecheck; node --test scripts/room-youtube-diagnostics.test.mjs scripts/room-player-readiness.test.mjs; full package test commands with script concurrency two; scripts/watch-room-embed-triage-check.mjs on development/production; scripts/watch-room-readiness-check.mjs on production; scripts/mission100-browser-check.mjs on production; desktop/mobile browser-smoke checks.

Evidence: screenshots/embed-triage-{dev,built}-ui.json, screenshots/embed-triage-existing-readiness.json, screenshots/embed-triage-plan.json and screenshots/embed-triage-{dev,built}.json, with desktop/mobile PNGs. Isolated browser profiles were used; the real user’s library and saved room preferences were not seeded or reset. Provider frames and the official watch page were controlled fixtures; room transport and the separate existing local-video decode case were real. Physical-device policies, real-provider restrictions/soak and cross-network relay remain external verification requirements and are not marked complete. The development app remains available after the temporary production QA server is stopped.

Changed entry points: src/lib/multiplayer/room-youtube-diagnostics.ts, src/components/library/use-youtube-embed-diagnostics.ts, youtube-embed-recovery.tsx, watch-room-section.tsx, diagnostic/browser tests and versioned mission defaults/tests/export.

---
# Watch Room observed readiness milestone — 25 October 2026

Revision 36 completes **next-044 — Per-guest playback readiness**. The default plan is **213/306 complete**: eleven next-level milestones are verified, 89 next-level briefs remain planned, and four older external verification milestones remain open. Revision-35 plans promote only next-044; unrelated manual/custom states and later reopens remain preserved.

Baseline: the room exposed a host-confirmed manual Ready flag and queue vote, but did not tell the host whether a guest’s actual player was loading, blocked, buffering or playing. A guest could be manually Ready while still unable to start playback. The existing manual vote, queue permissions, player recovery and host control paths are retained.

Watch Room → Ready & votes now shows a manual readiness choice alongside a separate device-observed player status and a count of devices reporting playback. YouTube iframe readiness, play/pause, buffering, ended, embed errors and autoplay-block events feed the status; Twitch uses interactive ready, actual playing, pause, playback-block and failure signals. Native library/matching-file players and incoming RTC streams report native readiness/playback/buffering/error events. Waiting for an approved local stream/file is distinct from a loading player. Twitch clips and unsupported embed setups explicitly report unavailable observation instead of pretending to be ready.

The host sees status-specific help and an explicit Pause room to wait action. Observations never toggle manual Ready, move the queue, seek, start guests, or authorize a playback request. A blocked manually Ready guest remains visibly blocked until an actual playback observation, while routine ready/buffering messages cannot silently clear the tap requirement. Shared play/pause and seek controls retain their independent host-enforced permissions.

Readiness reports contain only a bounded enum status, capability and numeric host selection revision: no video identity, local path/fingerprint, position, diagnostic error text, credential or device details. Host transport identity owns each report; stale/future selections, malformed reports and unknown senders are rejected. Selecting another title clears player observations without discarding manual choices or valid queue votes. Local player generations ignore events from replaced sources/players. Departing peers lose their ephemeral observations and votes. Older manual-only clients remain readable and show unreported player status.

Apart from initial/reconnect handshakes, only effective status/capability/selection changes report, coalesced at 250 ms; host publication is also coalesced. The state retains at most 65 participants and no observation history. The UI mounts 16 statuses initially with explicit Show more. Clock ticks do not publish readiness, and the feature introduces no new polling, storage ledger, provider requests or background video players.

## Verification for revision 36

- Final production build, type checks and affected tracked-source whitespace checks passed.
- Complete regression suite: **1,408 passed, 0 failures** — 805 script tests with two workers plus all 603 TypeScript tests from the package command. Existing large-library and provider/store regressions remain included.
- Eight focused readiness cases verify wire whitelisting, invalid inputs, sticky autoplay/error handling, manual/vote independence, monotonic title revisions, stale/future/outsider rejection, 10,000 duplicate reports without revision growth, roster/queue pruning, 65-person bounds, legacy-client parsing and identity ownership. Existing room/film/clip unit cases also pass.
- Final development and production browser acceptance passed with isolated desktop host and 390px touch-phone guest Chrome clients using actual room signaling and WebRTC. Controlled YouTube/Twitch signals cover manual Ready plus blocked autoplay, host-only wait/pause, locked playback/seek permissions, buffering/playing/paused/error states, device reload, selection changes, delayed old reports, unsupported clips, duplicate event storms and clock-only quietness. Real sample MP4 frames decoded on an empty guest library over RTC and moved from waiting to actual playing. The queue and playback permission checks stayed intact. Readiness packets contained no title, file identity, clock or extra private field. No console errors or horizontal overflow occurred; screenshots inspected.
- The existing production guest-control acceptance passed manual Ready acknowledgements, one latest queue vote, explicit host prioritization, locked queue access, independently enforced play/pause/seek, quiet timing heartbeats, guest reload and departure cleanup.
- Production mission migration, filtering, copied-brief fallback, Markdown/CSV export and reload checks passed with eleven verified next-level defaults, preserving manual/custom statuses. Desktop/mobile development and final production Home smoke passed with no console, branding or auth warnings and a non-diverging baseline.

Validation: npm run build; npm run typecheck; node --test scripts/room-player-readiness.test.mjs scripts/watch-film-clips-upgrade.test.mjs; full package test commands with script concurrency two; scripts/watch-room-readiness-check.mjs on development/production; scripts/watch-room-guest-controls-check.mjs on production; scripts/mission100-browser-check.mjs on production; desktop/mobile browser-smoke checks.

Evidence: screenshots/player-readiness-{dev,built}-ui.json, screenshots/player-readiness-existing-controls.json, screenshots/player-readiness-plan.json and screenshots/player-readiness-{dev,built}.json, with desktop/mobile PNGs. Isolated browser profiles were used; the real user’s library and stored room preferences were not seeded or reset. Public provider events were controlled fixtures; local media playback and room transport were real. Physical iOS/Android policies, real-provider embed verification/soak and cross-network relay remain separate requirements and are not marked complete. The development app remains available after the temporary production QA server is stopped.

Changed entry points: src/lib/multiplayer/room-player-readiness.ts, room-participation.ts, src/components/library/use-room-player-readiness.ts, room-participation-panel.tsx, watch-room-section.tsx, room-stream-player.tsx, readiness/browser tests and versioned mission defaults/tests/export.

---
# Watch Room session handoff milestone — 25 October 2026

Revision 35 completes **next-047 — Session playlist handoff file**. The default plan is **212/306 complete**: ten next-level milestones are verified, 90 next-level briefs remain planned, and four older external verification milestones remain open. Revision-34 plans promote only next-047; unrelated manual/custom states and later reopens remain preserved.

Baseline: Watch Room could copy upcoming links and save personal named lists, but could not transfer a versioned public session with played/current/upcoming context, a file-validation preview, or one host-approved undoable file import. Existing named lists, queue permissions and sharing paths remain intact.

Watch Room → Queue → Session handoff file now downloads a version-1 JSON file containing canonical public YouTube/Twitch identities, titles and known runtimes. It includes up to 12 recent played requests observed during the current room visit, the current title, and up to 48 upcoming titles. This is visit context, not a completed-watch ledger. Local paths, local/unmatched file identities, invitations, participants, tracking parameters, private catalog IDs, descriptions, artwork and playback settings are excluded through a strict export whitelist. Live titles do not claim a duration. The file contains no room credential or peer state.

Import validates UTF-8 size (256 KB), format/version, provider identity, HTTPS routes, item counts and titles before showing a preview. Unsupported providers and invalid rows are skipped and counted; corrupt structures reject the file without changing the room. Canonical duplicates, the current stage, existing queue entries and capacity are checked again using the latest room refs when the host applies the file. Local/unmatched queued entries still occupy capacity. Only eligible upcoming entries append, through the existing queue batch path, as one undoable operation. Current/played file entries are context only; importing never stages the old current title, changes play/pause or seeks, or restores automatic-next settings. Re-import does not duplicate queued videos.

Guests can inspect and export files but cannot apply them. The panel explicitly distinguishes local link validation from unverified provider availability/embed permission; no new provider request or availability claim is added. File reads ignore stale completions, repeated selections work, and cancel clears only the preview. The collapsed panel defers its body/export projection, import rows render in bounded groups, played context is bounded in memory, and no new storage ledger, polling or peer packet type is introduced. Existing public queue persistence and host acknowledgements remain in use.

## Verification for revision 35

- Final production build, type checks and affected tracked-source whitespace checks passed.
- Complete regression suite: **1,399 passed, 0 failures** — 797 script tests with two workers plus all 602 TypeScript tests from the package command. Existing large-library tests remain included. Final edge assertions for malformed current arrays and full local/unmatched queues also passed in the focused 12-test session/list run.
- Eight new session cases cover strict public export/redaction, canonical YouTube/Twitch routes, live/runtime rules, stage bounds, invalid versions/structures and UTF-8 caps, unsupported entries, canonical duplicate planning, capacity including local/unmatched slots, unavailable identities, immutability and re-import. The four existing named-list unit cases also passed.
- Development and production acceptance passed with isolated desktop host, 390px guest and 390px independent host profiles using actual room signaling and WebRTC. Checks exercised downloaded played/current/upcoming JSON, guest preview/export restrictions, concurrent guest queue changes, exactly one host queue publication per import, Undo, re-import, queue capacity, malformed/oversized files, cancel and reload. Playback title, paused clock and automatic-next preference stayed unchanged. No whole file, rejected entry or extra private field was broadcast. Screenshots inspected; no console errors or horizontal overflow occurred.
- Existing production saved-list browser acceptance passed, including persistence, quota failure preservation, acknowledged guest proposals, retry/deduplication, host approval and Undo.
- Development/production milestone migration, filters, copy fallback, Markdown/CSV exports and reload checks passed with ten verified next-level defaults, preserving unrelated manual choices and custom work. Desktop/mobile Home smoke passed with clean console, no brand/auth warnings and a non-diverging production baseline.

Validation: npm run build; npm run typecheck; node --test scripts/room-session-file.test.mjs scripts/room-playlists.test.mjs; full package test commands with script concurrency two; scripts/watch-room-session-file-check.mjs on development/production; scripts/watch-room-playlists-check.mjs on production; scripts/mission100-browser-check.mjs on development/production; desktop/mobile browser-smoke checks.

Evidence: screenshots/session-file-{dev,built}-ui.json, screenshots/session-file-{plan,built-plan}.json, screenshots/session-file-existing-lists.json and screenshots/session-file-{dev,built}.json, with desktop/mobile PNGs. Isolated browser profiles were used; the real user's library was not seeded or reset. Public player surfaces were controlled fixtures. Real-provider availability/soak, physical devices and cross-network relay remain separate verification requirements and are not marked complete. The development app remains available after stopping the temporary production QA server.

Changed entry points: src/lib/multiplayer/room-session-file.ts, src/components/library/room-session-file-panel.tsx, room-queue-panel.tsx, watch-room-section.tsx, session/room browser and unit tests, and versioned mission defaults/tests/export.

---
# YouTube publication precision milestone — 25 October 2026

Revision 34 completes **next-027 — YouTube publication uncertainty**. The default plan is **211/306 complete**: nine next-level milestones are verified, 91 next-level briefs remain planned, and four older external verification milestones remain open. Revision-33 plans promote only next-027; unrelated manual/custom states and later reopens remain preserved.

Baseline: relative listing labels were discarded; the date repair action accepted weak date strings without a supplied canonical video identity; timestamp versus calendar-day precision was lost; an HTML fallback could accept a recommended watch link as identity evidence; equal/undated catalog rows could reorder when IndexedDB returned a different key order. Existing exact-date provenance and explicit on-demand checks were retained and extended.

Publication evidence now distinguishes exact timestamps, calendar days, saved relative labels and unknown dates. Relative labels are bounded to 120 characters with their provider observation clock and never converted into guessed epochs. Listing live/upcoming fields cannot supply a publication date. Stronger source or precision evidence survives shallow, relative, unknown, scheduled and day-only responses. Legacy trusted sources remain compatible, and user-authored tags/categories/locks, favorites and history remain intact.

Selected-video details explain precision and source and provide an explicit JSON date-evidence export. Calendar dates and timestamps display consistently in UTC; day-only evidence never claims a time within that day. Full and incremental publication ordering use numeric UTC publication values followed by locale-independent video-ID ties, including the relative/unknown tail. A sparse legacy-day override preserves correct UTC day order without projecting the entire normal catalog into a second key map. Provider response order, later clocks, device time zones and cache key order no longer decide equal-value ordering.

Date repairs require the matching selected canonical video, strict calendar/instant validation and an ended/non-upcoming video. Calendar overflow, invalid hours, relative strings, mismatched IDs, blocked player responses and mere recommendation links are rejected. HTML-only fallback requires the matching official HTTPS canonical watch page. No-op or weaker date repairs skip catalog writes; selected date saves re-evaluate after asynchronous disk work. Existing serial, user-triggered one-to-five-video checks and provider budgets remain unchanged. No background polling, bulk rewrite, download or new external connection was added.

## Verification for revision 34

- Final production build, type checks and affected-source whitespace checks passed.
- Complete regression suite: **1,390 passed, 0 failures** — 789 script tests with two workers plus all 601 TypeScript tests from the package test command. Existing large-library cases remain included. Date-order expectations in existing full/incremental/store tests now explicitly assert the new deterministic identity tie contract.
- Eight new precision cases cover bounded relative evidence, live/upcoming exclusions, malformed dates, stronger evidence retention, matching canonical repair, official canonical fallback, blocked/recommended-page rejection, compact/disk/JSON persistence, sparse refreshes, reversed cache-order ties and opposite time zones. Actual RSS/archive tests also verify that relative label evidence reaches the adapter output.
- The new real-store case verifies matching-ID enforcement, durable day-to-instant upgrades, weaker/no-op write avoidance, metadata-tag repair retaining precise dates, preserved manual tag/category locks, favorites/history and upcoming repair refusal.
- Development and final production acceptance passed on isolated desktop America/Los_Angeles and 390px mobile Asia/Tokyo Chrome profiles. Actual UI/store/IndexedDB and controlled matching watch payloads exercised relative/unknown displays, no automatic date request, failure preservation, explicit retry, day-only repair, exact-RSS retention, JSON exports and reloads. No console errors or horizontal overflow occurred; final screenshots inspected.
- Production milestone migration/copy/export/filter/reload checks passed with nine verified next-level defaults and preserved custom/manual work. Development/production Home smoke passed with a non-diverging baseline.
- The 100,000-YouTube/20,000-Twitch CPU fixture passed under the same deterministic tie contract: median cold selection 35.4 ms versus 62.7 ms for the equivalent full-sort baseline; an unrelated Twitch update reused the exact YouTube selection in about 7.0 ms. These are local CPU fixture results, not provider throughput measurements.

Validation: npm run build; npm run typecheck; node --test scripts/youtube-publication-precision.test.mjs scripts/youtube-metadata.test.mjs scripts/local-tools.test.mjs; targeted real-store publication/order tests; full package regression commands with script concurrency two; scripts/youtube-publication-precision-browser-check.mjs on development/production; scripts/mission100-browser-check.mjs on production; desktop/mobile browser-smoke checks; scripts/youtube-refresh-speed-benchmark.mjs.

Evidence: screenshots/publication-{dev,built}-ui.json, screenshots/publication-plan.json, screenshots/publication-{dev,built}.json and screenshots/youtube-refresh-speed-benchmark.json, with desktop/mobile PNGs. Controlled provider payloads and isolated profiles were used; the real user’s library was not seeded or reset. Real-provider soak and physical-device milestones remain open. The development app remains available after stopping the temporary production QA server.

Changed entry points: src/lib/videos/youtube-metadata.ts, youtube-catalog-selection.ts, youtube-shelf.ts, remote-merge.ts, types.ts, store.ts, src/lib/remote/api.ts, youtube-publication.ts, src/components/library/youtube-publication-evidence.tsx, youtube-publication-control.tsx, video-card.tsx, publication/store/order/browser tests, benchmark and versioned mission defaults/tests/export.

---
# Twitch creator pull policy milestone — 25 October 2026

Revision 33 completes **next-033 — Twitch creator pull policies**. The default plan is **210/306 complete**: eight next-level milestones are verified, 92 next-level briefs remain planned, and four older external verification milestones remain open. Revision-32 plans promote only next-033; unrelated manual/custom statuses and later reopens remain preserved.

Baseline: every routine Twitch creator pull requested the same VOD/clip mix, and automatic selection had no per-creator inclusion or priority controls. Twitch → Manage creators → choose a creator now provides independent automatic VOD/clip inclusion, High/Normal/Low priority, and Restore default pull policy. Missing or invalid legacy settings retain both content lanes at Normal priority without eager migration writes. A compact version-1 policy is validated through the existing follow reload and library-pack boundaries.

Only automatic content selection applies these choices. A creator with both content lanes disabled consumes no content request or attempt/failure timestamp; live checks remain independent. Disabling clips retains VOD pulls/history, and disabling VODs uses a profile/live query followed by clips without walking the VOD shelves. Explicit selected-creator, focused archive and clip actions retain their requested behavior. Coverage labels distinguish clip/VOD/all-content exclusions from failed or not-yet-checked creators. Saved videos and personal signals are not deleted by a policy change.

Automatic priority uses bounded weighted lanes: four High, two Normal and one Low slot per seven eligible dispatches when all tiers have work, oldest first within each tier. Empty lanes lend their slots. A 600-creator fixture demonstrates that every enabled creator rotates, including Low priority, under the unchanged batch limits. The scheduler adds no polling, increases no provider page/concurrency budget, and performs no catalog scan for policy edits. Effective no-op edits preserve the follow array and skip writes. User-owned policy survives late provider copies, clip/live/archive merges and resolved re-imports; reload and backup import preserve valid choices.

## Verification for revision 33

- Final production build and type checks passed. Affected tracked-source whitespace checks passed.
- Complete regression suite: **1,380 passed, 0 failures** — 780 script tests with two workers plus all 600 TypeScript tests from the package test command, including the existing large-library regressions. A direct-TypeScript import-resolution failure found in the initial run was fixed with explicit module extensions; the final complete run passed.
- Eight policy cases cover legacy defaults, strict compact normalization, lane-specific skips, bounded weighted fairness across 600 creators, retry exclusion, late-response protection, actual provider request fields, live independence, explicit manual behavior, library-pack import and failure/retry/recovery. The new real-store case verifies effective edits only write once, automatic dispatch omits disabled creators, manual/live requests remain available, late responses retain current policy, and saved history/favorites/catalog rows survive.
- Development and final production browser acceptance passed in isolated desktop and 390px mobile Chrome profiles. The actual UI/store/follow storage and controlled Twitch adapter exercised legacy defaults, clip/VOD controls, priority, explicit skip labels, reload persistence, manual creator refresh despite automatic exclusions, and default recovery. Policy edits triggered no provider reads. No console errors or horizontal overflow occurred; screenshots inspected.
- Production milestone migration/copy/export/filter/reload checks passed with eight verified next-level defaults and preserved custom/manual states. Development/production Home smoke passed with a non-diverging baseline.

Validation commands: npm run build; npm run typecheck; node --test scripts/twitch-pull-policy.test.mjs; node --test --test-name-pattern=Twitch.automatic.policies scripts/pull-entry-limits.test.mjs; the full package test commands with script test concurrency limited to two; scripts/twitch-pull-policy-browser-check.mjs on development and production; scripts/mission100-browser-check.mjs on production; scripts/browser-smoke.mjs on both outputs.

Evidence: screenshots/twitch-policy-{dev,built}-ui.json, screenshots/twitch-policy-plan.json and screenshots/twitch-policy-{dev,built}.json, with desktop/mobile PNGs. Browser profiles and provider payloads were isolated; the real user’s library was not seeded or reset. Real-provider scale/soak and physical-device verification remain open. No new external integration is claimed connected.

Changed entry points: src/lib/videos/twitch-pull-policy.ts, twitch-refresh-selection.ts, types.ts, follow-checkpoints.ts, follow-identity.ts, twitch-clip-freshness.ts, store.ts, src/lib/remote/api.ts, src/components/library/twitch-pull-policy.tsx, follow-manager.tsx, the policy/store/browser tests and versioned mission defaults/tests/export.

---
# Twitch content type milestone — 25 October 2026

Revision 32 completes **next-039 — Twitch content type precision**. The default plan is **209/306 complete**: seven next-level milestones are verified, 93 next-level briefs remain planned, and four older external verification milestones remain open. Revision-31 plans promote only next-039; unrelated manual/custom states and later reopens remain preserved.

Twitch archive pages now retain the queried ARCHIVE, HIGHLIGHT or UPLOAD shelf alongside the canonical video ID and original observation time. Clip reads retain CLIPS evidence. Classification validates that compact evidence against the saved identity; short broadcasts and long clips are no longer guessed from duration or titles. Explicit legacy clip markers remain supported, including older clips with VOD-style IDs. Uncertain legacy videos display Unknown video subtype, and offline channel placeholders remain channel bookmarks.

Matching subtype evidence survives sparse responses and durable catalog reloads. Older observations cannot replace newer matching evidence; a new exact subtype observation can update an unknown item without losing favorites, history, likes or manual tags. Admission and comparison use the existing catalog paths, with no bulk reclassification, extra provider requests or storage migration.

The Full Twitch catalog adds past broadcast, highlight, upload, clip, live and unknown filters composed with existing saved/topic selection. Archive search supports the same exact types. Cards and previews show the type; previews explain the source shelf and observation time. An explicit cooperative CSV report exports the selected rows with canonical identity, type, source, observation time and watch link, with spreadsheet formula escaping. Opening/filtering adds no polling or storage writes; provider page and concurrency limits are unchanged.

## Verification for revision 32

- Final production build and type checks passed.
- Complete regression suite: **1,370 passed, 0 failures** — 771 script tests with two workers plus all 599 TypeScript tests from the package test command. The existing large-library regressions remain included. Three legacy clip compatibility failures found during verification were corrected in runtime identity handling, without weakening their existing tests.
- Seven new adapter/merge/report cases cover the three archive shelves, explicit clip evidence, short broadcasts, long clips, malformed and mismatched evidence, immutable provider edges, bounded page walks, sparse/newer observation rules, filter composition, archive search, ranking and CSV output. A real-store case verifies proof upgrades and persistence while preserving personal signals.
- Development and final production browser acceptance passed on isolated desktop and 390px mobile Chrome profiles. Actual creator action, provider adapter, UI, store and IndexedDB exercised shelf classification, all type filters, favorites intersection, preview evidence, selected-row CSV download, archive search and reload persistence. No extra provider reads during inspection, console errors or horizontal overflow occurred; screenshots inspected.
- Production milestone migration/copy/export/filter/reload checks passed with seven verified defaults and preserved custom/manual states. Desktop/mobile Home smoke passed with a non-diverging production baseline.

Evidence: screenshots/twitch-types-{dev,built}-ui.json, screenshots/twitch-types-plan.json and screenshots/twitch-types-{dev,built}.json. Controlled public Twitch payloads and isolated browser storage were used; the real user’s library was not seeded or reset. Real-provider scale/soak and physical-device playback remain open, and no external integration is newly claimed connected.

Changed entry points: src/lib/videos/twitch-content.ts, types.ts, twitch-clips.ts, remote-merge.ts, twitch-saved-catalog.ts, twitch-archive-search.ts, src/lib/remote/twitch-archive-walk.ts, api.ts, src/components/library/twitch-content-controls.tsx, use-twitch-saved-catalog.ts, twitch-archive-search.tsx, library-app.tsx, video-card.tsx, pre-video.tsx, and the versioned mission defaults/tests/export.

---
# Twitch clip freshness milestone — 24 October 2026

Revision 31 completes **next-032 — Clip observation freshness audit**. The default plan is **208/306 complete**: six next-level milestones are verified, 94 next-level briefs remain planned, and four older external verification milestones remain open. Revision-30 plans promote only next-032; unrelated manual/custom states and later reopens remain preserved.

**Twitch → Inspect clip coverage** now shows separate recent/older last-attempt and last-successful-check clocks. Attempts record the local action start. Successful clocks and clip metadata retain the original bounded provider read time, including warm deliveries; partial errors do not claim a successful full check. Legacy missing clocks remain explicitly unrecorded. Existing reload/backup checkpoint fields preserve both clocks without a second telemetry ledger.

The new **Check fresh recent clips** action skips only the exact creator/mode/count/cursor cache entry through the existing clip workflow. Other creator, count, older, VOD and live cache entries remain warm. It respects the existing retry wait and page limits. A fresh read waits for an older request on that key, concurrent fresh callers share work, ordinary callers join the pending fresh read, and the final cache contains the fresh result. Zero-clip requests cannot be counted as clip checks. No background polling or automatic cache invalidation was added.

All catalog admission paths now keep a fresher Twitch clip when a cached or held older observation arrives, preserving title, views, publication date, duration, poster and card identity. Unknown legacy observations cannot replace known newer evidence; a genuinely newer provider count can still change naturally. Follow commits preserve newer clip failures, independent retry deadlines, successful clocks and safe older positions. Unrelated copied live/archive responses retain current clip health while keeping their own response counts. Identical/stale-only focused clip responses skip the remote catalog write.

## Verification for revision 31

- Final production build, type checks and affected tracked-source whitespace checks passed.
- Complete regression suite: **1,361 passed, 0 failures** — 763 script tests with two workers plus all 598 TypeScript tests from the package test command. This includes the existing 80k/215k-library cases.
- Seven new audit cases cover warm attempt/success clocks, cached/held result health, separate retry scopes, copied follow state, all five catalog admission paths, actual API cache-key isolation, input validation, pending-read ordering, fresh caller coalescing and final warm-cache contents.
- Two actual-store cases verify cached retries leave successful clocks unchanged, unchanged clip arrays avoid catalog writes, a fresh action cannot bypass a retry, accepted fresh metrics reach disk, and a held older result preserves newer metrics/health plus saved personal signals.
- Development and production desktop/mobile browser acceptance passed in isolated Chrome profiles. Actual UI, clip API, store and durable follows were exercised with controlled public Twitch payloads: inspection performs no provider read/follow write; fresh actions contact the selected creator; ordinary retries reuse the cache; separate clocks, retry waits and evidence survive reload. No console errors or horizontal overflow occurred; screenshots inspected.
- Production 25-creator batch/Stop regression passed on both viewports, preserving partial results, rotation and older cursor continuation. Production milestone migration/copy/export/filter/reload checks passed with six verified next-level defaults and preserved custom/manual work. Home smoke checks passed with a non-diverging production baseline.

Evidence: screenshots/clip-freshness-{dev,built}-ui.json, screenshots/clip-freshness-batch-regression.json, screenshots/clip-freshness-plan.json and screenshots/clip-freshness-{dev,built}.json. Browser profiles and provider payloads were isolated; the real user’s library was not seeded or reset. No real-provider scale/soak or physical-device playback is claimed complete. The local development app remains running after the temporary production QA server was stopped.

Changed entry points: src/lib/videos/twitch-clip-freshness.ts, remote-merge.ts, store.ts, src/lib/remote/api.ts, provider-metadata-cache.ts, src/components/library/twitch-clips-control.tsx, twitch-clip-coverage-panel.tsx, and the versioned mission defaults/tests/export.

---

# Twitch clip coverage milestone — 24 October 2026

Revision 30 completes **next-031 — Clip coverage evidence panel**. The default plan is **207/306 complete**: five next-level milestones are verified, 95 next-level briefs remain planned, and four older external verification milestones remain open. Revision-29 plans promote only next-031; earlier/later manual reopens, unrelated statuses and custom entries are preserved.

In **Twitch → Keep clips fresh → Inspect clip coverage**, each saved creator snapshot shows the requested unique target, accepted clips, raw listings, overlapping duplicates and page attempts. Up to four public shelves show their allocation, results, failure and stop reason. Sparse/exhausted shelves, a filled quota, page-budget stops, partial errors and provider waits are distinct. A one-page allowance with unvisited shelves cannot falsely claim exhaustion. Older snapshots retain unknown targets/reasons instead of guessing. Public highlight rankings are not presented as an exhaustive Twitch archive.

Fresh provider results and warm deliveries are labeled separately. A cache hit preserves the original provider observation and successful clip clock; its response delivery time is separate. Normalization whitelists the compact snapshot, bounds errors to 240 characters, accepts legacy data and rejects malformed/oversized shelf collections. Reload and backup paths retain the new optional evidence.

Focused recent/older actions check only the displayed creator through the existing workflow and count selector. They respect independent retry deadlines, retain safe older continuations, disable completed older shelves, and request no VOD/live metadata. Snapshot content mounts only when expanded. Inspection uses existing follows without catalog scans, storage writes, or provider requests. One deadline timeout updates retry availability while the panel is mounted; no interval polling or growing history is added. Existing provider page/concurrency budgets are unchanged.

## Verification for revision 30

- Production build and type checks passed. Whitespace checks passed on affected tracked sources.
- Complete regression suite: **1,351 passed, 0 failures** — 754 script tests with two workers plus all 597 TypeScript tests from the package test command. New cases cover sparse/duplicate-heavy shelves, quotas versus budgets, partial errors versus holds, unvisited shelves, legacy/bounded normalization, scoped retries, and the actual API warm cache clock contract.
- Development and production acceptance passed on isolated Chrome desktop and 390px mobile profiles. Actual UI, clip adapter, store and durable follow storage exercised zero-read/zero-write inspection, accurate reasons, selected-creator recovery, cursor continuation, independent retries, cache labeling, original observation clocks and reload persistence. No horizontal overflow or console errors occurred; screenshots inspected.
- Existing 25-creator batch/Stop browser regression passed on both viewports: stopping saves the active creator, later batches rotate fairly, partial failures retain clips and older discovery keeps its own position.
- Production milestone browser checks passed for five verified defaults, revision migration, preserved custom/manual states, filters, copy fallback, Markdown/CSV export and reloads. Desktop/mobile Home smoke passed with a non-diverging production baseline.

Evidence: screenshots/clip-coverage-{dev,built}-ui.json, screenshots/clip-coverage-batch-regression.json, screenshots/clip-coverage-plan.json and screenshots/clip-coverage-{dev,built}.json. UI screenshots include production snapshot tops and mobile action controls. Browser tests used isolated storage and controlled public provider responses; they did not seed or reset the real user’s library. Real-provider scale/soak, physical-device playback and unrelated external integrations are not claimed complete.

Changed entry points: src/lib/remote/twitch-clips.ts, src/lib/remote/api.ts, src/lib/videos/types.ts, twitch-clip-coverage.ts, follow-checkpoints.ts, src/components/library/twitch-clips-control.tsx, twitch-clip-coverage-panel.tsx and the versioned mission defaults/tests/export.

---

# YouTube live coverage milestone — 24 October 2026

Revision 29 completes **next-023 — YouTube live coverage progress model**. Default progress is **206/306 complete**. The remaining 96 next-level briefs and four older external verification milestones remain open. Only next-023 is newly promoted for revision-28 plans; earlier or later manual reopens and custom entries are preserved.

Coverage now groups canonical creators once, separates latest failed attempts from recent successful freshness, and derives ready/retry/never-verified states from existing observation and attempt clocks. Historical success remains visible on failed rows without inflating current success coverage. Legacy timestamp-less retry waits remain conservative; a superseded individual failure cannot hold a newer successful observation. Duplicate queue actions retain the same first identity as the store deduper.

The expandable creator queue provides search, ready/waiting/not-due/never-verified filters, last success/attempt and next eligibility, pagination at 20 rows, and single-creator checks. Opening, searching and paging do not start provider requests. Waiting creators cannot bypass retry deadlines. The queue uses existing follow data; it adds no background scan, polling or storage writes. Progress-only changes no longer recalculate coverage when the follow ledger is unchanged.

A sweep keeps at most 33 aggregate throughput samples over a rolling recent window, with each requested creator counted once. Estimates require at least eight successful creator results, two successful result batches, one second of observations and a sufficient success ratio. The ready-queue range excludes retry waits. It disappears when two result updates make no successful progress, the last success is over 30 seconds old, the sweep stops, or a provider cooldown begins. Telemetry is volatile and never copied into follows, preferences or a second catalog. Provider concurrency and request pacing are unchanged.

## Verification for revision 29

- Final production build and type checks passed.
- Complete regression suite: **1,343 passed, 0 failures** (747 script tests with two workers plus all 596 TypeScript tests from the package test command). The focused coverage/migration tests were also rerun after final identity alignment.
- A mixed 2,000-creator fixture, including duplicate aliases and excluded sources, verified exact distinct freshness, due, unavailable, retry and never-verified counts. Bounded throughput fixtures cover warming, active range, stalls, stopped sweeps, low success ratios and provider waits. The real store test confirms only accepted observations count, the catalog retains its identity, no catalog write occurs for empty live checks, and telemetry is absent from saved follows.
- Development and final production acceptance passed in isolated Chrome desktop and 390px mobile profiles. The real API/store/persistence paths exercised queue paging/search/filtering without requests, one-creator checks, disabled retry controls, reload persistence, held-response throughput, stalled estimate removal using the existing visible-page timer, and a real adapter 429 response replacing the estimate with a wait. Console errors and horizontal overflow were absent; screenshots inspected.
- Production milestone browser checks passed for revision migration, four verified next-level defaults, preserved unrelated/custom/manual states, filtering, copying, Markdown/CSV export and reloads. Development/production Home smoke checks passed with a non-diverging baseline.

Evidence: `screenshots/live-coverage-{dev,built}-ui.json`, `screenshots/live-coverage-{dev,built}.json`, and `screenshots/live-coverage-plan.json`. Browser cases use controlled provider responses and isolated storage, with an adjusted clock for stall detection. They do not measure real-provider throughput, a long provider soak, or physical-device playback. The actual user's saved library was not seeded or reset.

Changed entry points: `src/lib/videos/youtube-live-health.ts`, `youtube-live-throughput.ts`, `youtube-quick-live.ts`, `live-refresh-selection.ts`, `store.ts`, `src/lib/remote/api.ts`, `src/components/library/live-check-status.tsx`, `youtube-live-coverage-panel.tsx`, and the versioned mission defaults/tests/export.

---

# YouTube negative-evidence milestone — 24 October 2026

Revision 28 completes **next-024 — YouTube ambiguous negative live evidence**. Default progress is now **205/306 complete**. The remaining 97 next-level briefs and four older external verification milestones stay open. Only this new completion is promoted for revision-27 plans; previous and later manual reopens, custom entries, and unrelated statuses are preserved.

The live adapter now records the observation source, time, state, and completeness. Readable Home shelves and Streams pages with unread continuations cannot establish an ending. HTML recovery applies the same rules. Positive observations remain usable, while missing broadcasts stay provisional. Consent, malformed, wrong-owner, login and transport failures preserve the prior success clock and cannot start the offline hold.

An incomplete listing may check at most two missing known broadcasts directly, in the existing live transport lane. Only playable metadata for the exact video and creator with an explicit not-live/end signal supplies negative evidence. Older saved cards join the bounded identity ledger; an exact proof cannot end another saved broadcast it omitted. Source aliases are covered, and a 64-ID overflow disables supplemental negative checks. A complete Streams listing can still establish absence. No archive pagination or extra polling was added.

The existing ten-minute hold begins only with complete relevant evidence. Unknown checks cannot expire it; fresh positive observations clear it immediately. The interface explains provisional status, evidence source/time and retry deadlines, with a focused single-creator recheck. Metadata survives reload through the existing persistence path.

## Verification for revision 28

- Final build and type checks passed.
- Final full regression suite: **1,336 passed, 0 failures** (741 script tests with two workers + all 595 TypeScript tests from the package test command). The existing catalog-cancellation assertion was sensitive to concurrent build/browser load; its isolated rerun and this complete reduced-concurrency run passed.
- Focused tests cover Home/Streams/HTML boundaries, consent/malformed replies, exact known-broadcast checks, request ceilings, identity mismatches, offline hold/recovery, durable normalization, overflow, and the real store's legacy/source-alias recovery path.
- Development and final production desktop/mobile acceptance passed with controlled public-response fixtures and an accelerated clock: provisional explanations, disabled retry before deadline, focused rechecks, reload persistence, complete absence through the hold, intervening unknown replies and immediate positive recovery. Console errors and horizontal overflow were absent; screenshots inspected.
- Production milestone migration/export browser checks passed: three verified next-level completions, unrelated/custom/manual status preservation, filtering, copy fallback, Markdown/CSV and reloads. Home smoke checks passed on desktop and mobile with a non-diverging production baseline.
- A read-only public canary returned **23 live YouTube broadcasts** with a partial Streams catalog labeled incomplete; no complete negative check was claimed. This is one snapshot, not a long provider soak or physical-device test.

Evidence: `screenshots/negative-evidence-{dev,built}-ui.json`, `screenshots/negative-evidence-{dev,built}.json`, `screenshots/negative-evidence-plan.json`, and `screenshots/negative-evidence-public.json`. Boundary notes and commands: `fixtures/provider-contracts/README.md`. Browser QA used isolated profiles and did not seed or reset the real user's saved library.

---

# Provider milestone completion — 24 October 2026

Revision 27 completes **next-022 — YouTube response contract fixtures** and **next-038 — Twitch live batch fault isolation**. The verified default plan is now **204/306 complete**. The remaining 98 next-level briefs stay planned; the four older external verification milestones remain open. Existing custom entries, older manual states, and later manual reopens are preserved.

| Completed milestone | Delivered behavior |
| --- | --- |
| next-022 | Explicit feed/catalog/live response boundaries distinguish genuine empty results from malformed or changed responses. RSS owner/identity checks, supported classic and modern renderers, continuation validation, and 23 redacted synthetic fixtures protect saved observations and archive positions. Invalid service/sign-in messages cannot establish an empty catalog. Valid empty recent RSS avoids unnecessary HTML/Shorts fallback requests. |
| next-038 | Twitch validates each creator independently, preserving healthy aliases when another fails. Optional title/game/artwork errors remain visible warnings while stream state and viewers stay usable. Identity/stream/viewer failures retain the previous successful clock and saved state. Two concurrent requests return up to 12 creators each and publish in completion order, so a slow first chunk cannot delay healthy later results. Full follow-list rotation and bounded storage checkpoints remain. |

## Verification for revision 27

- Final build and TypeScript checks passed.
- Full regression result: **1,326 passed, 0 failures** (732 script tests + 594 TypeScript tests). The focused provider contract suite also passed all eight checks, including the actual 100-target API with six malformed creators and 94 healthy results.
- The held-first-response regression publishes later Twitch viewer counts before the first chunk resolves. A 2,000-follow / 80,000-record test retains the existing catalog identity and bounds live requests to 12 creators.
- Development and final production browser checks passed on desktop and 390px mobile: actual adapter/store failure isolation, optional warnings, valid empty feed behavior, prior live state preservation, and reload persistence. Consoles were clean and pages had no horizontal overflow. Home smoke screenshots were inspected on both builds; production matched the development baseline.
- Production mission-plan browser checks verified revision migration from saved planned entries, exactly two newly completed defaults, preserved custom/manual statuses, filters, copy fallback, full Markdown/CSV export, and reload persistence. These used isolated profiles; the real user's library and browser-local states were not seeded or rewritten by QA.
- Read-only public metadata probes succeeded: 15 YouTube recent uploads, 23 YouTube live observations with viewer metadata, and two valid Twitch offline observations. These are snapshots, not a large-follow/provider soak or native playback certification.

Evidence: `screenshots/provider-milestones-{dev,built}-ui.json`, `screenshots/provider-milestones-{dev,built}.json`, `screenshots/provider-milestones-plan.json`, and `screenshots/provider-milestones-public.json`. Contract fixtures and runner guidance are in `fixtures/provider-contracts/README.md`.

---

# Milestone completion — 22 October 2026

The default plan now has **202 of 206 milestones complete** (previously 198).
Revision 25 promotes only the four verified entries below. Custom ideas,
older manual reopens and later status choices are preserved. The real app’s
Mission plan page was opened, reloaded and checked: 202/206 remained saved.

| Completed milestone | Delivered behavior |
| --- | --- |
| youtube-upgrade-06 — Creator ambiguity review | Review contradictory exact links and aliases/names shared by distinct channel IDs. Explicit keep-separate choice persists, reopens after changed identity evidence, and retains saved media. Legacy exact IDs in source keys remain distinct. Ambiguous pending aliases survive automatic resolution. |
| youtube-upgrade-17 — Offline cache audit | On-demand channel/card coverage, actual local artwork bytes, poster-reference count, oldest saved observations/artwork, catalog save time and recovery links. Small cancellable reads; no provider requests or success-state writes. Browser HTTP/Companion caches are explicitly unmeasured. |
| youtube-upgrade-18 — Mobile rail gesture | Native horizontal touch swipes, visible keyboard focus and explicit 44px Save/Like/Together controls for public touch cards; invisible hover controls no longer intercept touch swipes. |
| twitch-upgrade-19 — Twitch device regression | Chrome and Edge desktop/touch-phone matrix for live-card Watch Room handoff, VOD seeking, blocked playback, reload, clip restrictions and official parent/URL parameters. Provider fixtures are distinguished from native playback. |

## Verification

- npm run build and npm run typecheck passed.
- npm test: **1,269 passed**, 0 failures (676 script tests + 593 TypeScript tests).
- Development and production desktop/mobile render checks passed with clean
  consoles and no horizontal page overflow. Screenshots inspected.
- Development and production milestone acceptance checks passed in Chrome
  and Edge, desktop and native touch-phone viewports: audit storage failure
  and retry, no provider reads from the audit, identity choice across reload,
  filtering, swipes, 44px actions, visible focus, migration and CSV contents.
- Development and production Twitch matrices passed in all four configurations.
- Host-library browser check passed with two real WebRTC clients and an empty
  guest library: host search/page, permission revocation, queue priority/removal,
  catalog title playback, reconnect and no host path/follow disclosure.
- Production Edge host/phone check passed all seven synchronization scenarios:
  delayed readiness, device-local autoplay unlock, 90s clock skew, drift recovery,
  buffering, shared pause/resume, live reload/independent clocks, VOD return and
  Twitch startup. Provider players are deterministic fixtures.
- An earlier development Edge run was interrupted by the 19:41:28 source hot
  reload; its host returned Home. The stable production rerun passed. It is not
  used as a successful test result.

Evidence:

- screenshots/milestones-confirmed-app.png
- screenshots/milestone-completion-dev.json
- screenshots/milestone-completion-built.json
- screenshots/twitch-device-matrix-dev.json
- screenshots/twitch-device-matrix-built.json
- screenshots/milestones-host-catalog.json
- screenshots/milestones-watch-phone-edge-built.json
- screenshots/milestones-smoke-dev.json
- screenshots/milestones-smoke-built.json
- .grok/milestones-tests.log, milestones-typecheck.log, milestones-build.log

Repeatable browser gates:

    node scripts/milestone-completion-browser-check.mjs <app-url> screenshots/milestone-check.json
    node scripts/twitch-device-matrix-check.mjs <app-url> screenshots/twitch-matrix.json
    node scripts/watch-room-phone-check.mjs <app-url> screenshots/phone-check.json msedge
    node scripts/watch-room-host-catalog-check.mjs <app-url> screenshots/host-catalog.json

## Still open — requirements retained

| Milestone | Evidence still needed |
| --- | --- |
| watch — Watch room reliability | Physical-device drift and recovery under actual phone media/network policy. Host-library guest playback is now verified in the isolated browser matrix. |
| sprint-19 — Watch room device matrix | Real home-network iOS/Android devices. Chrome and Edge isolated desktop/phone browser checks pass; viewport/touch automation cannot establish physical-device behavior. |
| watch-room-cross-device — Watch Room cross-device relay | A configured real TURN service plus two devices on separate networks, with relay-only selected-candidate proof. |
| recent-provider-soak — Real-provider archive soak | Sustained large real YouTube/Twitch follow lists, fair rotations/retries, catalog growth, memory and live latency under existing automatic budgets. Synthetic throughput tests and short public reads do not establish this. |

No automatic pull budgets were increased. Existing saved libraries and media
feedback were preserved. QA uses isolated browser profiles. The app stays up;
the separate production QA server is stopped after verification, and the
pre-existing tracked build-output tree is restored byte-for-byte.


## YouTube and Twitch recent-pull upgrade — 24 October 2026

Delivered:
- Durable per-creator recent-upload attempts, successful observations, retries and
  feed watermarks. Recent rotation no longer depends on archive/live timestamps.
- Recent checks preserve deep archive cursors, diagnostics and failures. Late
  live responses preserve newer recent health and archive positions.
- Two bounded client requests, at most two creators each, publish completed
  batches without waiting for a stalled first batch. Independent RSS body slots
  keep recent feeds moving beside archive transfers; shared request pacing,
  global cooldown revisions, body limits and cancellation remain enforced.
- Empty recent results preserve existing video/tag/provenance references and
  write only follow checkpoints. Transient failures receive a short bounded
  creator retry; unavailable sources and advertised provider deadlines wait longer.
- Both provider desks expose recent checks, saved older-video continuation,
  individual creator selection, health counts and failures. Mobile creator
  selection uses the full panel width. Existing clip and older-VOD tools remain.

Verification:
- npm run build and npm run typecheck passed on final source.
- Full npm test: 1,294 passed, 0 failures (701 script + 593 TypeScript).
- Final recent/store checks: six passed, including two subsequently added cases
  for a late live response and an unfollow during a pending recent response.
- Controlled 2,000-creator rotation survives JSON reloads; a held first batch
  does not prevent later batches publishing; request concurrency stays at two.
  An empty recent check preserves an 80,000-entry catalog and metadata identities
  without catalog disk writes. Held archive-body test proves RSS can finish
  independently while at most two feed bodies overlap.
- Real public read-only probes: YouTube returned 15 uploads. Twitch initially
  returned a service error; a later ordinary retry returned 17 videos/clips.
  Both retained archive checkpoints. No user's saved follows were modified.
- Isolated Chrome desktop/mobile development and final production checks passed:
  both provider tabs, two rounds covering all 16 fixture creators, selected
  archive continuation, saved state after reload, clean consoles and no overflow.
  Smoke checks render both viewports with no production baseline divergence.
- Existing production Twitch/movie browser regression also passed.

Evidence:
- screenshots/provider-pulls-dev-ui.json
- screenshots/provider-pulls-built-ui.json
- screenshots/provider-pulls-dev.json
- screenshots/provider-pulls-built.json
- screenshots/provider-pulls-twitch-regression.json
- screenshots/provider-pulls-public-probe.json
- .grok/provider-pulls-tests.log
- .grok/provider-pulls-store-recent.log
- .grok/provider-pulls-build.log
- .grok/provider-pulls-typecheck.log

Limits: controlled concurrency/rotation tests do not establish real-world speed
for thousands of creators. Provider availability, public API changes, rate limits
and archive-depth soak testing remain external constraints. No unfinished
physical-device or multi-provider soak milestone was marked complete.


## Twitch clip pulling upgrade — 24 October 2026

Delivered:
- Clip discovery uses a bounded, testable window walker. It skips repeated
  identities, advances duplicate-heavy pages, detects cursor cycles, and refills
  unused weekly/monthly quotas from healthy earlier continuations.
- At most eight clip-page requests per creator across all windows; API page
  sizes remain at most 100. Provider rate/integrity holds stop further windows.
  Other window failures retain accepted clips and allow healthy windows to run.
- All-time discovery saves the last complete continuation after a partial
  failure. Incomplete pages retain valid clips without advancing past the
  malformed page or declaring false exhaustion.
- Clip metadata includes game/category and validated view counts, while unknown
  creation dates remain unknown. Recent clip cache freshness is 45 seconds;
  archive cache behavior remains separate.
- Recent and older clip retries/attempt clocks are independent and persist
  through reload/backup normalization. Attempts rotate fairly even after errors.
- Explicit creator batches: 8, 25, 50 or 100, one creator at a time, with 25–500
  requested clips per creator, progress, Stop after this creator, and per-creator
  page/duplicate/failure results. Switching away or global cancellation stops
  later creators. Each completed creator is saved before continuing.
- Empty clip checks update only follow state, preserving video/tag/provenance
  references without catalog writes. Existing VOD/live observations and saved
  older clip positions remain intact during recent updates.

Verification:
- Final build and typecheck passed. The initial restricted build encountered a
  Windows native-dependency directory permission error; the permitted build passed.
- Full npm test: 1,309 passed, zero failures (716 script + 593 TypeScript tests).
- Final focused clip suite: 24 passed, including the subsequently added unused
  quota backfill case. Store checks cover 80,000-entry empty clip updates,
  partial-result persistence and independent retry lanes.
- Deterministic 100-creator batches cover all 600 creators through JSON reloads.
- Isolated desktop/mobile Chrome acceptance passed on development and production:
  stop after a held first creator, 25-creator rotation, partial failures with
  continued healthy creators, requested clip budget, duplicate/page results,
  older cursor old → next → last, independent retry, reload persistence,
  preserved live/VOD state, clean console and no horizontal overflow.
- Desktop/mobile development and production smoke checks passed with no baseline
  divergence. Both sets of screenshots were visually inspected.
- Read-only public provider probe: notyoda returned 12 clips (11 with a game);
  Twitch returned 25 (21 with a game), skipping five repeated listings.
  Both completed without errors and made no VOD/live requests or private
  library changes.

Evidence:
- screenshots/clip-upgrade-dev-ui.json
- screenshots/clip-upgrade-built-ui.json
- screenshots/clip-upgrade-dev.json
- screenshots/clip-upgrade-built.json
- screenshots/clip-upgrade-public-probe.json
- .grok/clip-upgrade-tests.log
- .grok/clip-upgrade-focused.log
- .grok/clip-upgrade-store.log
- .grok/clip-upgrade-build.log
- .grok/clip-upgrade-typecheck.log

Limitations: public Twitch clip windows rank highlights rather than guaranteeing
an exhaustive chronological feed. Requested counts are ceilings; unavailable
clips, provider errors, sparse shelves and rate limits can reduce the result.
A 600-creator real-network soak remains unverified. No such milestone was
marked complete from deterministic fixtures.


## 100 model-executable milestones — 24 October 2026

The default mission baseline now contains **306 milestones: 202 complete and
104 still active**, comprising the prior four open items plus 100 new planned
items. Existing manual reopens, completion decisions and custom ideas are kept;
actual user totals can differ from this default baseline. Revision 26 adds the
briefs without promoting any new work to complete.

The 100 additions cover ten workstreams with ten items each: data durability,
performance at scale, YouTube reliability, Twitch depth/coverage, Watch Together
collaboration, recommendations/topics, film/anime/private media, desktop/local
workflows, AI studio/creator tools, and trust/accessibility/release quality.
Each has a stable ID, outcome, priority, verified code entry points, three
implementation steps, two acceptance checks and explicit prerequisites where
needed. External device/service/native checks are labeled. The shared execution
contract requires validating the gap first and reusing work already delivered,
preserving user data and privacy, bounded work, relevant validation and an
evidence-based handoff before completion.

Mission plan adds search, workstream/priority/status filters and 20-card paging.
Each item has a copyable model brief; clipboard denial leaves selectable text.
The Markdown download includes all 100 full briefs with current saved statuses
and dependency context. CSV adds IDs, entry points, dependencies, implementation,
acceptance and external requirements. NEXT_LEVEL_MILESTONES.md is generated
reproducibly from src/lib/mission-next-level.ts by
scripts/export-next-level-milestones.mjs.

Verification:
- npm run build and npm run typecheck passed.
- 38 relevant automated checks passed: 13 plan/creator/audit script cases and
  25 prior mission migration cases. New checks prove exact count, ten tracks,
  unique IDs/titles, valid code references, acyclic prerequisites, substantive
  briefs, status/custom-idea preservation, idempotent revision-26 migration,
  current contract refresh, clipboard/export content and document reproducibility.
- Isolated desktop/mobile development and production Chrome acceptance passed:
  307-row migration fixture with custom/manual decisions, exactly 100 new planned
  rows, 20 mounted active cards, paging, workstream/priority/search filters,
  implementation expansion, copy success/denial, full Markdown/CSV downloads,
  start/block/resume and reload without duplicate additions.
- Existing production milestone/creator/offline-audit regression passed in Chrome
  and Edge on desktop and touch-phone layouts, retaining prior manual choices.
- Development and production desktop/mobile smoke checks hydrated with clean
  consoles, no horizontal overflow and no production baseline divergence.
  Screenshots were visually inspected.
- No real user library/status fixture was overwritten and no future milestone
  implementation is claimed complete.

Evidence:
- screenshots/mission100-dev-ui.json
- screenshots/mission100-built-ui.json
- screenshots/mission100-existing-regression.json
- screenshots/mission100-dev.json
- screenshots/mission100-built.json
- .grok/mission100-tests.log
- .grok/mission100-migration.log
- .grok/mission100-build.log
- .grok/mission100-typecheck.log
